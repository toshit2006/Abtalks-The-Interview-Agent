// Types generated from curriculum.json, candidates.json and technical-spec.md

export type MemberStatus = "COMPLETED" | "IN_PROGRESS" | "DROPPED";

export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: MemberStatus;
}

export interface Mission {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface CandidateProfile {
  member: CandidateMember;
  missions: Mission[];
  signals: CandidateSignals;
}

export type CurriculumDayType =
  "SETUP" | "LEARN" | "BUILD" | "AI_CORE" | "OPTIMIZE" | "SHIP_IT" | "CAPSTONE";

export interface CurriculumDay {
  day: number;
  title: string;
  type: CurriculumDayType;
  tools: string[];
  objectives: string[];
}

export interface CurriculumModule {
  n: number;
  title: string;
  /** [firstDay, lastDay] */
  days: number[];
}

export interface Curriculum {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export type ChatRole = "agent" | "candidate";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  at: string; // HH:MM
}

export type TopicStatus = "completed" | "attempted" | "skipped" | "pending";

/** One planned interview question, always bound to a curriculum day. */
export interface InterviewQuestion {
  id: string;
  day: number;
  dayTitle: string;
  module: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
  objective: string;
}

export interface QuestionResult {
  questionId: string;
  day: number;
  dayTitle: string;
  module: string;
  question: string;
  answer: string;
  status: Exclude<TopicStatus, "pending">;
  score: number;
  feedback: string;
}

/** Final structured feedback, matching the technical specification. */
export interface FinalEvaluation {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  scores: {
    overall: number;
    conceptualDepth: number;
    communication: number;
  };
  results: QuestionResult[];
}

export interface InterviewState {
  sessionId: string;
  candidate: CandidateProfile;
  questions: InterviewQuestion[];
  currentIndex: number;
  messages: ChatMessage[];
  results: QuestionResult[];
  done: boolean;
  feedback: FinalEvaluation | null;
  startedAt: number;
}

/** POST /api/interview request/response contract. */
export interface InterviewRequest {
  sessionId: string;
  candidate?: CandidateProfile;
  message?: string;
  skip?: boolean;
  /** Optional early-completion action used by the interactive UI. */
  complete?: boolean;
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: FinalEvaluation;
  progress?: {
    asked: number;
    required: number;
    distinctDays: number;
    requiredDays: number;
    results: QuestionResult[];
    currentQuestion: InterviewQuestion | null;
  };
}
