import { getDay, moduleForDay } from "@/lib/curriculum";
import type {
  CandidateProfile,
  FinalEvaluation,
  InterviewQuestion,
  Mission,
  QuestionResult,
} from "@/types/interview";

export const REQUIRED_QUESTIONS = 8;
export const REQUIRED_DISTINCT_DAYS = 4;

function difficultyFor(m: Mission): "Easy" | "Medium" | "Hard" {
  if (m.skipped) return "Hard";
  const attempts = m.attempts ?? 1;
  if (attempts >= 4) return "Hard";
  if (attempts >= 2) return "Medium";
  return "Easy";
}

/** Missions the interview should probe hardest first: skipped, then most attempts. */
function priority(m: Mission): number {
  if (m.skipped) return 100;
  return (m.attempts ?? 1) * 10;
}

function phrase(objective: string, dayTitle: string, index: number): string {
  const o = objective.replace(/^[A-Z]/, (c) => c.toLowerCase());
  const templates = [
    `In your ${dayTitle} mission you had to ${o}. Walk me through how you actually did it.`,
    `How would you ${o}? Be specific about the trade-offs you weighed.`,
    `You marked ${dayTitle} as covered — explain how you would ${o} in production.`,
    `What breaks first when you ${o} at scale, and how do you detect it?`,
  ];
  return templates[index % templates.length]!;
}

/**
 * Builds an interview plan of at least REQUIRED_QUESTIONS questions spanning at
 * least REQUIRED_DISTINCT_DAYS distinct curriculum days from the candidate's own
 * mission history.
 */
export function buildQuestionPlan(candidate: CandidateProfile): InterviewQuestion[] {
  const missions = [...candidate.missions]
    .filter((m) => getDay(m.day))
    .sort((a, b) => priority(b) - priority(a) || a.day - b.day);

  const questions: InterviewQuestion[] = [];
  let round = 0;

  while (questions.length < REQUIRED_QUESTIONS && round < 4) {
    for (const m of missions) {
      if (questions.length >= REQUIRED_QUESTIONS && round > 0) break;
      const day = getDay(m.day)!;
      const objective = day.objectives[round % day.objectives.length] ?? day.title;
      questions.push({
        id: `q-${m.day}-${round}`,
        day: m.day,
        dayTitle: day.title,
        module: moduleForDay(m.day),
        difficulty: difficultyFor(m),
        prompt: phrase(objective, day.title, round),
        objective,
      });
      if (round === 0 && questions.length >= REQUIRED_QUESTIONS) break;
    }
    round += 1;
  }

  return questions.slice(
    0,
    Math.max(REQUIRED_QUESTIONS, questions.length ? REQUIRED_QUESTIONS : 0),
  );
}

export function distinctDays(results: QuestionResult[]): number {
  return new Set(results.map((r) => r.day)).size;
}

const DEPTH_WORDS = [
  "because",
  "trade-off",
  "tradeoff",
  "latency",
  "throughput",
  "index",
  "embedding",
  "retrieval",
  "chunk",
  "evaluate",
  "metric",
  "benchmark",
  "cache",
  "scale",
  "fallback",
  "monitor",
  "prompt",
  "context",
  "agent",
  "token",
  "cost",
  "recall",
  "precision",
];

/** Deterministic heuristic scoring — no model call required for the demo flow. */
export function scoreAnswer(question: InterviewQuestion, answer: string): QuestionResult {
  const text = answer.trim();
  const base: Omit<QuestionResult, "status" | "score" | "feedback"> = {
    questionId: question.id,
    day: question.day,
    dayTitle: question.dayTitle,
    module: question.module,
    question: question.prompt,
    answer: text,
  };

  if (!text) {
    return {
      ...base,
      answer: "Skipped.",
      status: "skipped",
      score: 0,
      feedback: "No signal collected — recommend a targeted follow-up on this day.",
    };
  }

  const words = text.split(/\s+/).length;
  const lower = text.toLowerCase();
  const depth = DEPTH_WORDS.filter((w) => lower.includes(w)).length;

  let score = Math.min(60, 20 + words * 1.2) + Math.min(35, depth * 7);
  if (question.difficulty === "Hard") score -= 5;
  score = Math.max(12, Math.min(97, Math.round(score)));

  const status = score >= 70 ? "completed" : "attempted";
  const feedback =
    score >= 85
      ? "Clear, well-structured answer with concrete reasoning about trade-offs."
      : score >= 70
        ? "Solid coverage of the core idea; add measurement or failure-mode detail to go deeper."
        : words < 15
          ? "Answer stayed too short to demonstrate depth — expand on the how and the why."
          : "Directionally right, but the reasoning stayed surface level and skipped trade-offs.";

  return { ...base, status, score, feedback };
}

export function buildFinalEvaluation(
  candidate: CandidateProfile,
  results: QuestionResult[],
): FinalEvaluation {
  const scored = results.length ? results : [];
  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const overall = avg(scored.map((r) => r.score));
  const answered = scored.filter((r) => r.status !== "skipped");
  const conceptualDepth = avg(answered.map((r) => Math.round(r.score * 0.94)));
  const communication = avg(
    answered.map((r) => Math.min(98, 45 + Math.min(50, r.answer.split(/\s+/).length))),
  );

  const strong = [...scored].filter((r) => r.score >= 70).sort((a, b) => b.score - a.score);
  const weak = [...scored].filter((r) => r.score < 70).sort((a, b) => a.score - b.score);

  const strengths = strong.slice(0, 4).map((r) => `${r.dayTitle} — ${r.feedback}`);
  const gaps = weak.slice(0, 4).map((r) => `${r.dayTitle} — ${r.feedback}`);

  const firstTryRate = candidate.signals.missionsCompleted
    ? Math.round((candidate.signals.missionsFirstTry / candidate.signals.missionsCompleted) * 100)
    : 0;

  return {
    summary: `${candidate.member.name} (${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs) was assessed on ${scored.length} questions across ${distinctDays(scored)} curriculum days and scored ${overall}/100 overall. Cohort signals: ${candidate.signals.commitDays} commit days, ${candidate.signals.missionsCompleted} missions completed, ${firstTryRate}% cleared first try.`,
    strengths: strengths.length ? strengths : ["Engaged with every question asked."],
    gaps: gaps.length ? gaps : ["No material gaps surfaced in this round."],
    next: [
      weak[0]
        ? `Re-run Day ${weak[0].day} (${weak[0].dayTitle}) with a hands-on exercise.`
        : "Advance to a system-design deep dive.",
      "Practise stating trade-offs explicitly before committing to a design.",
      "Add a measurement plan (metric + baseline) to every technical answer.",
      candidate.missions.some((m) => m.skipped)
        ? "Close out the missions skipped during the cohort."
        : "Prepare a capstone walkthrough for the hiring panel.",
    ],
    scores: { overall, conceptualDepth, communication },
    results: scored,
  };
}
