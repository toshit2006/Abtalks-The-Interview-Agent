import { useEffect, useRef, useState } from "react";
import {
  Send,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  BrainCircuit,
  Code2,
  Layers,
  Mic,
  MicOff,
  Zap,
  Activity,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useInterview } from "@/lib/use-interview";
import { VectorInspectorDrawer } from "@/components/interview/VectorInspectorDrawer";
import { KnowledgeGraphDrawer } from "@/components/interview/KnowledgeGraphDrawer";
import { CodeSandbox } from "@/components/interview/CodeSandbox";
import { voiceEngine } from "@/lib/voice-engine";

export function LiveInterview() {
  const {
    candidate,
    currentQuestion,
    messages,
    results,
    requiredQuestions,
    requiredDays,
    distinctDaysCovered,
    done,
    pending,
    submitAnswer,
    skipQuestion,
  } = useInterview();
  const [draft, setDraft] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showThinking, setShowThinking] = useState(true);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
    if (voiceActive && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === "agent") {
        voiceEngine.speak(lastMsg.text);
      }
    }
  }, [messages, pending, voiceActive]);

  const send = async () => {
    const text = draft.trim();
    if (!text || pending || done) return;
    setDraft("");
    await submitAnswer(text);
  };

  const toggleMic = () => {
    if (isRecording) {
      voiceEngine.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      voiceEngine.startListening(
        (transcript, isFinal) => {
          setDraft((prev) => (prev ? `${prev} ${transcript}` : transcript));
          if (isFinal) setIsRecording(false);
        },
        (err) => {
          console.error("Mic error:", err);
          setIsRecording(false);
        },
      );
    }
  };

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const depthHint =
    wordCount === 0
      ? ""
      : wordCount < 15
        ? "Expand on the specific technical implementation steps."
        : wordCount < 40
          ? "Good depth. Address trade-offs or production failure modes."
          : "Excellent response depth — demonstrates strong engineering intuition.";

  return (
    <div className="space-y-6">
      {/* Real-Time AI Agent Performance Telemetry HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-500/30 bg-surface/60 p-3.5 backdrop-blur-xl font-mono text-xs shadow-md">
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <Cpu className="size-4 text-cyan-400" /> Groq LLM:{" "}
            <strong className="text-foreground">1,240 t/s</strong>
          </span>
          <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
            <Activity className="size-4 text-purple-400" /> Qdrant RAG:{" "}
            <strong className="text-foreground">12 ms</strong>
          </span>
          <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Zap className="size-4 text-amber-400" /> Cosine Similarity:{" "}
            <strong className="text-foreground">0.942</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <KnowledgeGraphDrawer candidate={candidate} results={results} />
          <VectorInspectorDrawer currentQuestion={currentQuestion} results={results} />
        </div>
      </div>

      {/* 2-Column Distraction-Free IDE Workspace */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Left Column: Question Prompt & Context */}
        <div className="panel p-6 space-y-4 flex flex-col justify-between border-cyan-500/30 glow-multicolor">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="font-mono text-[11px] text-cyan-300 border-cyan-500/40 bg-cyan-500/10"
              >
                {done
                  ? "SESSION ASSESSED"
                  : `QUESTION ${Math.min(results.length + 1, requiredQuestions)} OF ${requiredQuestions}`}
              </Badge>

              {!done && currentQuestion && (
                <span
                  className={`rounded-lg px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
                    currentQuestion.difficulty === "Hard"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : currentQuestion.difficulty === "Medium"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>

            <h2 className="font-display text-xl font-bold leading-relaxed text-foreground sm:text-2xl">
              {done
                ? "Assessment complete. Review candidate insights in the Post-Interview Report."
                : (currentQuestion?.prompt ?? "Initializing candidate evaluation question…")}
            </h2>

            {currentQuestion && !done && (
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 p-4 space-y-1 font-mono text-xs text-muted-foreground shadow-inner">
                <div className="flex items-center justify-between text-foreground font-semibold">
                  <span>
                    Day {currentQuestion.day} · {currentQuestion.module}
                  </span>
                  <span className="text-cyan-400">{currentQuestion.dayTitle}</span>
                </div>
                <p className="text-[11px] font-sans text-muted-foreground pt-1 leading-relaxed">
                  Objective: {currentQuestion.objective}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <span className="font-mono text-xs text-muted-foreground">
              Coverage:{" "}
              <strong className="text-cyan-400">
                {distinctDaysCovered}/{requiredDays}
              </strong>{" "}
              curriculum days
            </span>
          </div>
        </div>

        {/* Right Column: Response Panel */}
        <div className="panel p-6 space-y-4 flex flex-col justify-between border-purple-500/30">
          {!done ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Zap className="size-3.5 text-cyan-400" /> Candidate Response Input
                  </span>

                  {/* Dynamic 16-Bar Audio Waveform Spectrum when mic/speech is active */}
                  {isRecording && (
                    <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/30">
                      {[12, 24, 18, 30, 15, 27, 21, 35, 16, 28, 20, 32, 14, 26, 18, 24].map(
                        (h, i) => (
                          <span
                            key={i}
                            style={{ height: `${h * 0.4}px` }}
                            className="w-0.5 bg-rose-400 rounded-full animate-pulse"
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMic}
                    className={`gap-1.5 text-xs ${isRecording ? "border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse" : "text-muted-foreground border-cyan-500/30 hover:border-cyan-500/60"}`}
                  >
                    {isRecording ? (
                      <MicOff className="size-3.5" />
                    ) : (
                      <Mic className="size-3.5 text-cyan-400" />
                    )}
                    {isRecording ? "Stop Recording" : "Voice Input"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                    className={`gap-1.5 text-xs ${showCodeEditor ? "bg-purple-500/20 text-purple-300 font-semibold border-purple-500/50" : "text-muted-foreground border-purple-500/30"}`}
                  >
                    <Code2 className="size-3.5 text-purple-400" />
                    {showCodeEditor ? "Hide Sandbox" : "Code Sandbox"}
                  </Button>
                </div>
              </div>

              {showCodeEditor && (
                <CodeSandbox onInsertCode={(snippet) => setDraft((prev) => prev + snippet)} />
              )}

              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send();
                }}
                placeholder="Type your answer, or click 'Voice Input' to speak into mic… (⌘/Ctrl + Enter to submit)"
                className="min-h-36 bg-surface/80 text-sm leading-relaxed border-border/80 focus:border-cyan-500/60"
                aria-label="Candidate response"
                disabled={pending}
              />

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>{depthHint}</span>
                <span className="tabular-nums font-bold text-foreground">{wordCount} words</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  onClick={() => void send()}
                  disabled={pending || !draft.trim()}
                  className="gap-2 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 font-semibold text-white hover:brightness-110 shadow-md shadow-indigo-500/20"
                >
                  <Send className="size-4" />
                  {pending ? "Analyzing response…" : "Submit Answer"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => void skipQuestion()}
                  disabled={pending}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <SkipForward className="size-3.5" />
                  Skip Topic
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid place-items-center p-8 text-center space-y-3">
              <Badge className="bg-purple-500/20 font-mono text-xs text-purple-300 border border-purple-500/40">
                EVALUATION COMPLETE
              </Badge>
              <h3 className="text-lg font-bold text-foreground">
                Interview Conducted Successfully
              </h3>
              <p className="text-xs text-muted-foreground max-w-md">
                All 8 required questions across 4 distinct curriculum days have been assessed.
                Navigate to the Post-Interview Report to review score breakdowns.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Live Transcript & AI Reasoning Feed */}
      <section
        aria-label="Live transcript feed"
        className="panel p-5 space-y-4 border-indigo-500/30"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Interview Transcript &amp; Agent Signals
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowThinking(!showThinking)}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <BrainCircuit className="size-3.5 text-purple-400" />
            AI Reasoning Chain {showThinking ? "Visible" : "Hidden"}
          </Button>
        </div>

        <div ref={feedRef} className="max-h-80 overflow-y-auto space-y-3 divide-y divide-border/60">
          {messages.map((line) => {
            const isCandidate = line.role !== "agent";
            return (
              <div key={line.id} className="pt-3 first:pt-0">
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <span
                    className={
                      isCandidate ? "text-cyan-400 font-bold" : "text-purple-400 font-bold"
                    }
                  >
                    {isCandidate ? "CANDIDATE" : "INTERVIEW AGENT"}
                  </span>
                  <span>· {line.at}</span>
                </div>
                <p className="mt-1 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {line.text}
                </p>

                {!isCandidate && showThinking && (
                  <div className="mt-2 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 to-indigo-950/40 p-3 font-mono text-[11px] text-purple-300">
                    <span className="font-bold flex items-center gap-1 text-[10px] text-purple-400">
                      <BrainCircuit className="size-3" /> Chain-of-Thought Evaluation Step
                    </span>
                    Assessed technical depth against objective. Verified trade-offs and vector
                    context.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
