import { getCandidate } from "@/lib/curriculum";
import {
  scoreAnswerWithAI,
  writeFinalSummaryWithAI,
  writeOpeningWithAI,
  writeTransitionWithAI,
} from "@/lib/ai";
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

/** AI-graded when a key is configured and the call succeeds; deterministic heuristic otherwise. */
async function grade(
  question: InterviewQuestion,
  answer: string,
  candidate: CandidateProfile,
): Promise<QuestionResult> {
  if (!answer.trim()) return scoreAnswer(question, answer);
  const ai = await scoreAnswerWithAI(question, answer, candidate);
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
  sessions.delete(sessionId);
  return { reply: "Interview completed.", done: true, feedback: evaluation };
}

export async function handleInterviewTurn(body: InterviewRequest): Promise<InterviewResponse> {
  const sessionId = body.sessionId;
  if (!sessionId) return { reply: "Missing sessionId.", done: false };

  let session = sessions.get(sessionId);

  if (!session) {
    const candidate = body.candidate ?? getCandidate();
    session = {
      candidate,
      questions: buildQuestionPlan(candidate),
      index: 0,
      results: [],
      transcript: [],
    };
    sessions.set(sessionId, session);
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
    lastResult = await grade(current, answer, session.candidate);
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

  const aiReply = await writeTransitionWithAI({
    candidate: session.candidate,
    history: session.transcript,
    lastResult: lastResult
      ? { score: lastResult.score, feedback: lastResult.feedback, dayTitle: lastResult.dayTitle }
      : null,
    nextQuestion: next,
  });
  if (aiReply) reply = aiReply;

  return { reply, done: false, progress: progress(session) };
}
