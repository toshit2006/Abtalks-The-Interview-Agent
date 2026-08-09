import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getCandidate } from "@/lib/curriculum";
import {
  REQUIRED_DISTINCT_DAYS,
  REQUIRED_QUESTIONS,
  buildQuestionPlan,
  distinctDays,
} from "@/lib/interview-engine";
import type {
  CandidateProfile,
  ChatMessage,
  FinalEvaluation,
  InterviewQuestion,
  InterviewResponse,
  InterviewState,
  QuestionResult,
} from "@/types/interview";

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

let seq = 0;
const msg = (role: ChatMessage["role"], text: string): ChatMessage => ({
  id: `m${++seq}`,
  role,
  text,
  at: now(),
});

type Ctx = InterviewState & {
  requiredQuestions: number;
  requiredDays: number;
  distinctDaysCovered: number;
  currentQuestion: InterviewQuestion | null;
  pending: boolean;
  startSession: () => Promise<void>;
  submitAnswer: (text: string) => Promise<void>;
  skipQuestion: () => Promise<void>;
  endInterview: () => Promise<void>;
};

const InterviewContext = createContext<Ctx | null>(null);

export function InterviewProvider({
  candidateId,
  children,
}: {
  candidateId?: string;
  children: ReactNode;
}) {
  const candidate = useMemo<CandidateProfile>(() => getCandidate(candidateId), [candidateId]);
  const sessionId = useRef(`IA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`).current;

  // Timer only starts when user explicitly launches the interview
  const [startedAtTime, setStartedAtTime] = useState<number>(0);
  const startedAt = useRef<number>(0);

  const questions = useMemo<InterviewQuestion[]>(() => buildQuestionPlan(candidate), [candidate]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(questions[0] ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [feedback, setFeedback] = useState<FinalEvaluation | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      setCurrentQuestion(questions[0] ?? null);
    }
  }, [questions, currentQuestion]);

  const post = async (payload: Record<string, unknown>): Promise<InterviewResponse> => {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, ...payload }),
    });
    return (await res.json()) as InterviewResponse;
  };

  const apply = (data: InterviewResponse) => {
    setMessages((m) => [...m, msg("agent", data.reply)]);
    if (data.progress) {
      setResults(data.progress.results);
      setCurrentQuestion(data.progress.currentQuestion);
      setCurrentIndex(data.progress.asked);
    }
    if (data.done) {
      setDone(true);
      setCurrentQuestion(null);
      if (data.feedback) {
        setFeedback(data.feedback);
        setResults(data.feedback.results);
      }
    }
  };

  const startSession = async () => {
    if (started.current) return;
    started.current = true;
    const t = Date.now();
    startedAt.current = t;
    setStartedAtTime(t);

    setPending(true);
    try {
      apply(await post({ candidate }));
    } finally {
      setPending(false);
    }
  };

  const turn = async (payload: Record<string, unknown>, echo?: string) => {
    if (pending || done) return;
    if (!started.current) {
      await startSession();
    }
    if (echo !== undefined) setMessages((m) => [...m, msg("candidate", echo)]);
    setPending(true);
    try {
      apply(await post(payload));
    } finally {
      setPending(false);
    }
  };

  const value: Ctx = {
    sessionId,
    candidate,
    questions,
    currentIndex,
    messages,
    results,
    done,
    feedback,
    startedAt: startedAtTime,
    requiredQuestions: REQUIRED_QUESTIONS,
    requiredDays: REQUIRED_DISTINCT_DAYS,
    distinctDaysCovered: distinctDays(results),
    currentQuestion,
    pending,
    startSession,
    submitAnswer: (text) => turn({ message: text }, text),
    skipQuestion: () => turn({ skip: true }, "Skip this topic."),
    endInterview: async () => {
      if (done) return;
      setPending(true);
      try {
        apply(await post({ complete: true }));
      } finally {
        setPending(false);
      }
    },
  };

  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>;
}

export function useInterview(): Ctx {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterview must be used inside <InterviewProvider>");
  return ctx;
}
