import { useEffect, useState } from "react";
import { Check, CircleStop, Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useInterview } from "@/lib/use-interview";

function format(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function SessionStatusBar({ onEnd }: { onEnd?: () => void }) {
  const { results, requiredQuestions, startedAt, done, endInterview } = useInterview();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const tick = () => setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const assessed = results.filter((r) => r.status !== "skipped");

  return (
    <section
      aria-label="Session status"
      className="panel flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4"
    >
      <span className="inline-flex items-center gap-2 rounded-md bg-surface-raised px-3 py-1.5 text-sm font-medium text-primary glow-emerald">
        <ListChecks className="size-4" aria-hidden />
        Question {Math.min(results.length + (done ? 0 : 1), requiredQuestions)} of{" "}
        {requiredQuestions}+
      </span>

      <ul
        className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
        aria-label="Topics assessed"
      >
        {assessed.map((r) => (
          <li
            key={r.questionId}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-foreground/85"
          >
            {r.dayTitle}
            <Check className="size-3 text-primary" aria-hidden />
          </li>
        ))}
        {!assessed.length && (
          <li className="text-xs text-muted-foreground">No topics assessed yet</li>
        )}
      </ul>

      <span
        className="inline-flex items-center gap-2 rounded-md bg-surface px-3 py-1.5 font-mono text-sm tabular-nums"
        role="timer"
        aria-label={`Elapsed session time ${format(seconds)}`}
      >
        <Clock className="size-4 text-muted-foreground" aria-hidden />
        {format(seconds)}
      </span>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="gap-2" disabled={done}>
            <CircleStop className="size-4" aria-hidden />
            {done ? "Interview ended" : "End interview"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this interview?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve answered {results.length} of {requiredQuestions} required questions.
              Submitting now closes the session and generates your structured feedback report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await endInterview();
                onEnd?.();
              }}
            >
              Submit &amp; generate report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
