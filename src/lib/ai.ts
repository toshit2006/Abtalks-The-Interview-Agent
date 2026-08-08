/**
 * Server-only Claude integration for the Interview Agent.
 *
 * This is what makes the agent an *interviewer* rather than a script:
 * every answer is graded by an LLM against the candidate's own cohort
 * signals, and every transition is phrased by the LLM so it can react to
 * what the candidate actually said (ask a real follow-up, push back on a
 * vague answer, acknowledge a strong one) instead of swapping words into a
 * fixed template.
 *
 * If ANTHROPIC_API_KEY isn't set (or a call fails), every export here
 * resolves to `null` and the caller falls back to the deterministic
 * heuristics in interview-engine.ts — so the app still runs end-to-end
 * without a key, it's just less adaptive.
 */
import type { CandidateProfile, InterviewQuestion, QuestionResult } from "@/types/interview";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env["ANTHROPIC_MODEL"] ?? "claude-sonnet-5";

export function aiEnabled(): boolean {
  return Boolean(process.env["ANTHROPIC_API_KEY"]);
}

type ChatTurn = { question: string; answer: string };

async function callClaude(system: string, user: string, maxTokens = 500): Promise<string | null> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return null;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) {
      console.error(`Claude API error ${res.status}: ${await res.text()}`);
      return null;
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((b) => b.type === "text")?.text;
    return text?.trim() || null;
  } catch (err) {
    console.error("Claude API call failed:", err);
    return null;
  }
}

function jsonFromReply(reply: string): unknown {
  const fenced = reply.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1]! : reply;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Grades one answer against the question's objective. Returns null on any failure. */
export async function scoreAnswerWithAI(
  question: InterviewQuestion,
  answer: string,
  candidate: CandidateProfile,
): Promise<Pick<QuestionResult, "status" | "score" | "feedback"> | null> {
  if (!answer.trim()) return null;

  const system = [
    "You are a senior technical interviewer grading ONE answer from a live interview.",
    "Grade for genuine technical understanding, not length or keyword-stuffing.",
    "Respond with ONLY a JSON object, no prose, matching exactly:",
    '{"score": <integer 0-100>, "status": "completed" | "attempted", "feedback": "<one or two sentences, direct, specific to this answer>"}',
    'Use "completed" for score >= 70, "attempted" for below.',
  ].join("\n");

  const user = [
    `Candidate: ${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs experience.`,
    `Curriculum day: ${question.dayTitle} (${question.module}), difficulty ${question.difficulty}.`,
    `Learning objective being probed: ${question.objective}`,
    `Question asked: ${question.prompt}`,
    `Candidate's answer: ${answer}`,
  ].join("\n");

  const reply = await callClaude(system, user, 300);
  if (!reply) return null;
  const parsed = jsonFromReply(reply) as {
    score?: number;
    status?: string;
    feedback?: string;
  } | null;
  if (!parsed || typeof parsed.score !== "number" || typeof parsed.feedback !== "string")
    return null;

  const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  return {
    score,
    status: score >= 70 ? "completed" : "attempted",
    feedback: parsed.feedback,
  };
}

/**
 * Writes the interviewer's next line: reacts to the candidate's last answer
 * (real follow-up remark, one sentence max) then transitions into the next
 * planned question. Returns null on failure so the caller can fall back to
 * the template phrasing.
 */
export async function writeTransitionWithAI(opts: {
  candidate: CandidateProfile;
  history: ChatTurn[];
  lastResult: Pick<QuestionResult, "score" | "feedback" | "dayTitle"> | null;
  nextQuestion: InterviewQuestion;
}): Promise<string | null> {
  const { candidate, history, lastResult, nextQuestion } = opts;

  const system = [
    "You are a warm but rigorous senior technical interviewer conducting a live, spoken-style interview.",
    "Write ONLY the interviewer's next message — no labels, no markdown, no meta-commentary.",
    "If the candidate's last answer was thin, vague, or dodged specifics, open with a short, pointed follow-up remark about THAT answer (one sentence) before moving on.",
    "If it was strong, briefly acknowledge the specific thing they got right (one sentence) before moving on.",
    "Then ask the next question in your own words — keep the same technical intent as the provided question, but phrase it naturally and conversationally, referencing the candidate's day/topic.",
    "Keep the whole message under 60 words. No greetings.",
  ].join("\n");

  const transcript = history
    .slice(-4)
    .map((t) => `Q: ${t.question}\nA: ${t.answer}`)
    .join("\n\n");

  const user = [
    `Candidate: ${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs.`,
    lastResult
      ? `Last answer scored ${lastResult.score}/100 on "${lastResult.dayTitle}". Grader's note: ${lastResult.feedback}`
      : "This is the first question of the interview.",
    transcript ? `Recent transcript:\n${transcript}` : "",
    `Next planned question (Day ${nextQuestion.day} · ${nextQuestion.dayTitle}, ${nextQuestion.difficulty}): ${nextQuestion.prompt}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return callClaude(system, user, 220);
}

/** Writes the opening line of the interview, introducing the first question. */
export async function writeOpeningWithAI(
  candidate: CandidateProfile,
  firstQuestion: InterviewQuestion,
): Promise<string | null> {
  const system = [
    "You are a senior technical interviewer opening a live interview.",
    "Write ONLY the interviewer's opening message — no labels, no markdown.",
    "Briefly (one sentence) welcome the candidate by first name and set expectations for a conversational technical interview grounded in their own cohort work.",
    "Then ask the first question in your own words, keeping the same technical intent as the provided question.",
    "Under 55 words total.",
  ].join("\n");

  const user = [
    `Candidate: ${candidate.member.name}, ${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs.`,
    `First question (Day ${firstQuestion.day} · ${firstQuestion.dayTitle}): ${firstQuestion.prompt}`,
  ].join("\n");

  return callClaude(system, user, 180);
}

/** Writes the free-text summary paragraph for the final report. */
export async function writeFinalSummaryWithAI(
  candidate: CandidateProfile,
  results: QuestionResult[],
  scores: { overall: number; conceptualDepth: number; communication: number },
): Promise<string | null> {
  const system = [
    "You are a senior technical interviewer writing the summary paragraph of a structured feedback report.",
    "Write ONLY the summary paragraph, 2-4 sentences, no markdown, no headers.",
    "Be specific and evidence-based — reference actual topics from the results, not generic praise.",
  ].join("\n");

  const breakdown = results
    .map((r) => `- Day ${r.day} (${r.dayTitle}), ${r.status}, ${r.score}/100: ${r.feedback}`)
    .join("\n");

  const user = [
    `Candidate: ${candidate.member.name}, ${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs.`,
    `Overall ${scores.overall}/100, conceptual depth ${scores.conceptualDepth}/100, communication ${scores.communication}/100.`,
    `Per-question results:\n${breakdown}`,
  ].join("\n\n");

  return callClaude(system, user, 260);
}
