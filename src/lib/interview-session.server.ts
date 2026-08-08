import { getCandidate } from "@/lib/curriculum";
import { getDb } from "@/lib/db";
import {
  scoreAnswerWithAI,
  writeFinalSummaryWithAI,
  writeOpeningWithAI,
  writeTransitionWithAI,
} from "@/lib/ai";
import {
  ensureCollection,
  generateTextEmbedding,
  qdrantEnabled,
  searchSimilarContext,
  upsertPoints,
} from "@/lib/qdrant";
import {
  REQUIRED_DISTINCT_DAYS,
  REQUIRED_QUESTIONS,
  buildFinalEvaluation,
  buildQuestionPlan,
  distinctDays,
  scoreAnswer,
} from "@/lib/interview-engine";
import type {
  CandidateProfile,
  InterviewQuestion,
  InterviewRequest,
  InterviewResponse,
  QuestionResult,
} from "@/types/interview";

type Session = {
  candidate: CandidateProfile;
  questions: InterviewQuestion[];
  index: number;
  results: QuestionResult[];
  /** Q/A transcript kept for LLM context; not part of the public API contract. */
  transcript: { question: string; answer: string }[];
};

const sessions = new Map<string, Session>();

function isComplete(s: Session) {
  return (
    s.results.length >= REQUIRED_QUESTIONS && distinctDays(s.results) >= REQUIRED_DISTINCT_DAYS
  );
}

function progress(s: Session): NonNullable<InterviewResponse["progress"]> {
  return {
    asked: s.results.length,
    required: REQUIRED_QUESTIONS,
    distinctDays: distinctDays(s.results),
    requiredDays: REQUIRED_DISTINCT_DAYS,
    results: s.results,
    currentQuestion: s.questions[s.index] ?? null,
  };
}

/** Pre-seeds Qdrant vector database with candidate curriculum & mission objectives for RAG. */
async function initQdrantSession(sessionId: string, candidate: CandidateProfile) {
  if (!qdrantEnabled()) return;
  const ok = await ensureCollection("interview_curriculum");
  if (!ok) return;

  const points = candidate.missions.map((m) => {
    const text = `Day ${m.day} mission objective: ${m.title ?? ""}. Skipped: ${m.skipped}, attempts: ${m.attempts ?? 1}`;
    return {
      id: `${sessionId}-day-${m.day}`,
      vector: generateTextEmbedding(text),
      payload: {
        sessionId,
        day: m.day,
        topic: m.title ?? "",
        skipped: m.skipped,
      },
    };
  });

  await upsertPoints("interview_curriculum", points);
  await ensureCollection("candidate_answers");
}

/** AI-graded when a key is configured and the call succeeds; deterministic heuristic otherwise. */
async function grade(
  question: InterviewQuestion,
  answer: string,
  candidate: CandidateProfile,
  sessionId: string,
): Promise<QuestionResult> {
  if (!answer.trim()) return scoreAnswer(question, answer);

  let ragContext: string | undefined;
  if (qdrantEnabled()) {
    const matches = await searchSimilarContext("interview_curriculum", answer, 2);
    if (matches.length) {
      ragContext = matches
        .map(
          (m) =>
            `- Objective (score ${Math.round(m.score * 100)}%): ${String(m.payload["topic"] ?? "")}`,
        )
        .join("\n");
    }

    // Index current answer into Qdrant candidate_answers vector store
    await upsertPoints("candidate_answers", [
      {
        id: `${sessionId}-q-${question.id}-${Date.now()}`,
        vector: generateTextEmbedding(`${question.prompt} ${answer}`),
        payload: {
          sessionId,
          questionId: question.id,
          day: question.day,
          question: question.prompt,
          answer,
        },
      },
    ]);
  }

  const ai = await scoreAnswerWithAI(question, answer, candidate, ragContext);
  if (ai) {
    return {
      questionId: question.id,
      day: question.day,
      dayTitle: question.dayTitle,
      module: question.module,
      question: question.prompt,
      answer,
      ...ai,
    };
  }
  return scoreAnswer(question, answer);
}

async function finalize(sessionId: string, session: Session): Promise<InterviewResponse> {
  const evaluation = buildFinalEvaluation(session.candidate, session.results);
  const aiSummary = await writeFinalSummaryWithAI(
    session.candidate,
    session.results,
    evaluation.scores,
  );
  if (aiSummary) evaluation.summary = aiSummary;

  // Persist interview session result into PostgreSQL history if DB connection is active
  try {
    const sql = getDb();
    if (sql) {
      const historyId = `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await sql`
        INSERT INTO interview_history (id, session_id, candidate_name, job_role, overall_score, results_json, feedback_json)
        VALUES (
          ${historyId},
          ${sessionId},
          ${session.candidate.member.name},
          ${session.candidate.member.jobRole},
          ${evaluation.scores.overall},
          ${JSON.stringify(evaluation.results)},
          ${JSON.stringify(evaluation)}
        )
      `;
    }
  } catch (err) {
    console.error("PostgreSQL interview history persist failed:", err);
  }

  sessions.delete(sessionId);
  return { reply: "Interview completed.", done: true, feedback: evaluation };
}

function isValidCandidate(candidate: unknown): candidate is CandidateProfile {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    Array.isArray((candidate as CandidateProfile).missions) &&
    typeof (candidate as CandidateProfile).member === "object" &&
    (candidate as CandidateProfile).member !== null
  );
}

export async function handleInterviewTurn(body: InterviewRequest): Promise<InterviewResponse> {
  const sessionId = body.sessionId;
  if (!sessionId) return { reply: "Missing sessionId.", done: false };

  let session = sessions.get(sessionId);

  if (!session) {
    if (body.candidate !== undefined && !isValidCandidate(body.candidate)) {
      return {
        reply: "Invalid candidate payload: expected a candidate object with a missions array.",
        done: false,
      };
    }
    const candidate = body.candidate ?? getCandidate();
    session = {
      candidate,
      questions: buildQuestionPlan(candidate),
      index: 0,
      results: [],
      transcript: [],
    };
    sessions.set(sessionId, session);

    // Initialize Qdrant session vectors asynchronously
    initQdrantSession(sessionId, candidate).catch((err) =>
      console.error("Qdrant session init failed:", err),
    );

    const first = session.questions[0];

    let reply = `Welcome ${candidate.member.name}. Let's begin your interview — ${REQUIRED_QUESTIONS} questions across your cohort curriculum.\n\n${first?.prompt ?? ""}`;
    if (first) {
      const aiOpening = await writeOpeningWithAI(candidate, first);
      if (aiOpening) reply = aiOpening;
    }
    return { reply, done: false, progress: progress(session) };
  }

  if (body.complete) {
    return finalize(sessionId, session);
  }

  const current = session.questions[session.index];
  let lastResult: QuestionResult | undefined;
  if (current) {
    const answer = body.skip ? "" : (body.message ?? "");
    lastResult = await grade(current, answer, session.candidate, sessionId);
    session.results.push(lastResult);
    session.transcript.push({ question: current.prompt, answer: lastResult.answer });
    session.index += 1;
  }

  if (isComplete(session) || session.index >= session.questions.length) {
    return finalize(sessionId, session);
  }

  const next = session.questions[session.index]!;
  let reply = `Thanks. Next — Day ${next.day} · ${next.dayTitle}.\n\n${next.prompt}`;
  if (lastResult && lastResult.score < 70) {
    reply = `Follow-up prompted by your last answer: ${next.prompt}`;
  }

  let transitionRagContext: string | undefined;
  if (qdrantEnabled()) {
    const candidateAnswerMatches = await searchSimilarContext("candidate_answers", next.prompt, 2);
    if (candidateAnswerMatches.length) {
      transitionRagContext = candidateAnswerMatches
        .map(
          (m) =>
            `- Related past answer on Day ${String(m.payload["day"] ?? "")}: ${String(m.payload["answer"] ?? "")}`,
        )
        .join("\n");
    }
  }

  const aiReply = await writeTransitionWithAI({
    candidate: session.candidate,
    history: session.transcript,
    lastResult: lastResult
      ? { score: lastResult.score, feedback: lastResult.feedback, dayTitle: lastResult.dayTitle }
      : null,
    nextQuestion: next,
    ragContext: transitionRagContext,
  });
  if (aiReply) reply = aiReply;

  return { reply, done: false, progress: progress(session) };
}
