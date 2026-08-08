import { useEffect, useRef, useState } from "react";
import { Send, SkipForward, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useInterview } from "@/lib/use-interview";

export function LiveInterview() {
  const {
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
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  const send = async () => {
    const text = draft.trim();
    if (!text || pending || done) return;
    setDraft("");
    await submitAnswer(text);
  };

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const depthHint =
    wordCount === 0
      ? ""
      : wordCount < 15
        ? "Keep going — walk through the how and why, not just the what."
        : wordCount < 40
          ? "Good start. Mention a trade-off or failure mode to go deeper."
          : "Strong depth — this reads like a real interview answer.";

  return (
    <div className="space-y-5">
      <div className="panel glow-emerald p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {done
              ? "Interview complete"
              : `Question ${Math.min(results.length + 1, requiredQuestions)} of ${requiredQuestions} · ${
                  currentQuestion
                    ? `Day ${currentQuestion.day} · ${currentQuestion.module}`
                    : "Loading"
                }`}
          </p>
          {!done && currentQuestion && (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                currentQuestion.difficulty === "Hard"
                  ? "bg-destructive/15 text-destructive"
                  : currentQuestion.difficulty === "Medium"
                    ? "bg-warning/15 text-warning"
                    : "bg-primary/15 text-primary"
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          )}
        </div>
        <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
          {done
            ? "All required questions assessed — open the Post-Interview Report."
            : (currentQuestion?.prompt ?? "Preparing your first question…")}
        </h2>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          Coverage: {distinctDaysCovered}/{requiredDays} distinct curriculum days
        </p>

        {!done && (
          <div className="mt-5 space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send();
              }}
              placeholder="Type your answer… (⌘/Ctrl + Enter to submit)"
              className="min-h-24 bg-surface"
              aria-label="Your answer"
              disabled={pending}
            />
            <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
              <span className={wordCount ? "opacity-100" : "opacity-0"} aria-live="polite">
                {depthHint}
              </span>
              <span className="shrink-0 font-mono tabular-nums">{wordCount} words</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                className="gap-2"
                onClick={() => void send()}
                disabled={pending || !draft.trim()}
              >
                <Send className="size-4" aria-hidden />
                {pending ? "Submitting…" : "Submit answer"}
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => void skipQuestion()}
                disabled={pending}
              >
                <SkipForward className="size-4" aria-hidden />
                Skip topic
              </Button>
            </div>
          </div>
        )}
      </div>

      <section aria-label="Live transcript" className="panel divide-y divide-border">
        <div ref={feedRef} className="max-h-[420px] divide-y divide-border overflow-y-auto">
          {messages.map((line) => (
            <article key={line.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-semibold ${
                  line.role === "agent" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
                }`}
                aria-hidden
              >
                {line.role === "agent" ? "AI" : "YOU"}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {line.role === "agent" ? "Interview Agent" : "Candidate"} · {line.at}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {line.text}
                </p>
              </div>
            </article>
          ))}
          {!messages.length && (
            <p className="p-4 text-sm text-muted-foreground">Connecting to the interview agent…</p>
          )}
          {pending && messages.length > 0 && (
            <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-[11px] font-semibold text-accent"
                aria-hidden
              >
                AI
              </span>
              <div className="flex min-w-0 items-center">
                <span
                  className="flex items-center gap-1"
                  role="status"
                  aria-label="Interviewer is typing"
                >
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </span>
              </div>
            </article>
          )}
        </div>
      </section>

      {results.length > 0 && !done && (
        <div className="panel glow-violet flex items-start gap-3 p-4">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Latest signal — {results[results.length - 1]!.dayTitle}:{" "}
            {results[results.length - 1]!.feedback}
          </p>
        </div>
      )}
    </div>
  );
}
