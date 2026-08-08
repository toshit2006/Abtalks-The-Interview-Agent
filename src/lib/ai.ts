/**
 * Server-only LLM integration for the Interview Agent.
 * Uses Groq API for ultra-fast inference.
 */
import type { CandidateProfile, InterviewQuestion, QuestionResult } from "@/types/interview";
import { callGroq, groqEnabled } from "@/lib/groq";

export const aiEnabled = groqEnabled;

type ChatTurn = { question: string; answer: string };

/** LLM caller using Groq API. */
async function callLLM(system: string, user: string, maxTokens = 500): Promise<string | null> {
  if (groqEnabled()) {
    return callGroq(system, user, maxTokens);
  }
  return null;
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

/** Grades one answer against the question's objective and optional vector RAG context. */
export async function scoreAnswerWithAI(
  question: InterviewQuestion,
  answer: string,
  candidate: CandidateProfile,
  ragContext?: string,
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
    ragContext ? `Retrieved Vector RAG Context:\n${ragContext}` : "",
    `Question asked: ${question.prompt}`,
    `Candidate's answer: ${answer}`,
  ]
    .filter(Boolean)
    .join("\n");

  const reply = await callLLM(system, user, 300);
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

/** Writes the interviewer's next line with optional vector RAG context. */
export async function writeTransitionWithAI(opts: {
  candidate: CandidateProfile;
  history: ChatTurn[];
  lastResult: Pick<QuestionResult, "score" | "feedback" | "dayTitle"> | null;
  nextQuestion: InterviewQuestion;
  ragContext?: string | undefined;
}): Promise<string | null> {
  const { candidate, history, lastResult, nextQuestion, ragContext } = opts;

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
    ragContext ? `Retrieved Vector RAG Context:\n${ragContext}` : "",
    transcript ? `Recent transcript:\n${transcript}` : "",
    `Next planned question (Day ${nextQuestion.day} · ${nextQuestion.dayTitle}, ${nextQuestion.difficulty}): ${nextQuestion.prompt}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return callLLM(system, user, 220);
}

/** Writes the opening line of the interview. */
export async function writeOpeningWithAI(
  candidate: CandidateProfile,
  firstQuestion: InterviewQuestion,
  ragContext?: string | undefined,
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
    ragContext ? `Retrieved Vector Context:\n${ragContext}` : "",
    `First question (Day ${firstQuestion.day} · ${firstQuestion.dayTitle}): ${firstQuestion.prompt}`,
  ]
    .filter(Boolean)
    .join("\n");

  return callLLM(system, user, 180);
}

/** Writes the free-text summary paragraph for the final report. */
export async function writeFinalSummaryWithAI(
  candidate: CandidateProfile,
  results: QuestionResult[],
  scores: { overall: number; conceptualDepth: number; communication: number },
): Promise<string | null> {
  if (!results.length) return null;
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

  return callLLM(system, user, 260);
}
