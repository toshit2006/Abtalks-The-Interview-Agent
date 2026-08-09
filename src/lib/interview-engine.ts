import { curriculum, getDay } from "@/lib/curriculum";
import type {
  CandidateProfile,
  CurriculumDay,
  FinalEvaluation,
  InterviewQuestion,
  QuestionResult,
} from "@/types/interview";

export const REQUIRED_QUESTIONS = 8;
export const REQUIRED_DISTINCT_DAYS = 4;

export function buildQuestionPlan(candidate: CandidateProfile): InterviewQuestion[] {
  // Determine candidate's target days (prioritizing skipped & failed missions)
  const targetDays = candidate.missions.filter((m) => m.skipped || !m.passed).map((m) => m.day);

  // Fill up to 10 days from cohort curriculum
  const allDays = curriculum.days.map((d) => d.day);
  const selectedDays = Array.from(new Set([...targetDays, ...allDays])).slice(0, 10);

  const plan: InterviewQuestion[] = [];
  let idCounter = 1;

  for (const dayNum of selectedDays) {
    const detail: CurriculumDay | undefined = getDay(dayNum);
    if (!detail) continue;

    const moduleObj = curriculum.modules.find((m) => m.days.includes(detail.day));
    const moduleName = `Module ${moduleObj?.n ?? 1}`;
    
    // Main Objective Formatting
    const rawObj0 = (detail.objectives[0] ?? "Master the underlying engineering principles.").trim();
    const cleanObj0 = rawObj0.endsWith(".") ? rawObj0.slice(0, -1) : rawObj0;
    const toolsText = detail.tools && detail.tools.length > 0
      ? ` using ${detail.tools.slice(0, 2).join(" and ")}`
      : "";

    // Build main authentic conceptual question
    plan.push({
      id: `q${idCounter++}`,
      day: detail.day,
      dayTitle: detail.title,
      module: moduleName,
      prompt: `Regarding Day ${detail.day} (${detail.title}): How would you approach ${cleanObj0.toLowerCase()}${toolsText} in a production AI system?`,
      objective: rawObj0,
      difficulty: dayNum > 20 ? "Hard" : dayNum > 10 ? "Medium" : "Easy",
    });

    // Build follow-up deep-dive question
    if (detail.objectives[1]) {
      const rawObj1 = detail.objectives[1].trim();
      const cleanObj1 = rawObj1.endsWith(".") ? rawObj1.slice(0, -1) : rawObj1;

      plan.push({
        id: `q${idCounter++}`,
        day: detail.day,
        dayTitle: detail.title,
        module: moduleName,
        prompt: `Deep-dive on Day ${detail.day} (${detail.title}): When implementing ${cleanObj1.toLowerCase()}, what key engineering trade-offs, edge cases, or failure modes must be handled?`,
        objective: rawObj1,
        difficulty: "Hard",
      });
    }
  }

  return plan;
}

export function distinctDays(results: QuestionResult[]): number {
  return new Set(results.map((r) => r.day)).size;
}

const DEPTH_WORDS = [
  "trade-off",
  "tradeoff",
  "latency",
  "throughput",
  "architecture",
  "vector",
  "embedding",
  "chunk",
  "rerank",
  "index",
  "postgres",
  "sql",
  "qdrant",
  "groq",
  "cache",
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

  // Handle case when 0 live questions were answered before ending interview
  if (scored.length === 0) {
    return {
      summary: `${candidate.member.name} (${candidate.member.jobRole}) ended the interview session before submitting any live answers. No evaluation data collected.`,
      strengths: [
        `Candidate record: ${candidate.signals.missionsCompleted}/31 cohort missions completed.`,
      ],
      gaps: ["Session ended without submitting answers to any live interview questions."],
      next: ["Launch a live interview session and answer the technical questions."],
      scores: { overall: 0, conceptualDepth: 0, communication: 0 },
      results: [],
    };
  }

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

  return {
    summary: `${candidate.member.name} (${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs) was assessed on ${scored.length} questions across ${distinctDays(scored)} curriculum days and scored ${overall}/100 overall. Cohort signals: ${candidate.signals.commitDays} commit days, ${candidate.signals.missionsCompleted} missions completed.`,
    strengths: strengths.length ? strengths : [`Completed ${scored.length} evaluation questions.`],
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
