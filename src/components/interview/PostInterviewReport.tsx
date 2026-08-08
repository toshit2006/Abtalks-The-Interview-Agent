import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, Download, FileJson, Printer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInterview } from "@/lib/use-interview";

const fade = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: Math.min(i, 10) * 0.07, ease: [0.22, 1, 0.36, 1] as const },
});

export function PostInterviewReport() {
  const { candidate, sessionId, feedback, results, requiredQuestions, done } = useInterview();

  if (!feedback) {
    return (
      <div className="panel p-6 text-sm text-muted-foreground">
        The completion &amp; feedback report unlocks once {requiredQuestions} questions across at
        least 4 curriculum days are assessed. {results.length}/{requiredQuestions} answered so far
        {done ? "." : " — keep going or end the interview to generate it."}
      </div>
    );
  }

  const distinctDays = new Set(feedback.results.map((r) => r.day)).size;
  const summaryScores = [
    {
      label: "Overall Technical Competency",
      value: feedback.scores.overall,
      hint: `Across all ${feedback.results.length} assessed questions`,
    },
    {
      label: "Conceptual Depth",
      value: feedback.scores.conceptualDepth,
      hint: "Reasoning beyond surface answers",
    },
    {
      label: "Communication",
      value: feedback.scores.communication,
      hint: "Clarity, structure, and pacing",
    },
  ];

  const exportJson = () => {
    const payload = {
      sessionId,
      candidate,
      generatedAt: new Date().toISOString(),
      feedback,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <motion.header {...fade(0)} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Interview complete · {distinctDays} curriculum days assessed
          </p>
          <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">
            Completion &amp; <span className="text-gradient">Feedback Report</span>
          </h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Download className="size-4" aria-hidden />
              Export report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={exportJson} className="gap-2">
              <FileJson className="size-4" aria-hidden />
              Download JSON
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => window.print()} className="gap-2">
              <Printer className="size-4" aria-hidden />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.header>

      <section aria-label="Score summary" className="grid gap-3 sm:grid-cols-3">
        {summaryScores.map((s, i) => (
          <motion.article
            key={s.label}
            {...fade(i + 1)}
            className={`panel p-5 ${i === 0 ? "glow-emerald" : ""}`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-2 font-display text-4xl font-bold text-gradient">
              {s.value}
              <span className="ml-1 font-sans text-sm font-medium text-muted-foreground">/100</span>
            </p>
            <Progress value={s.value} className="mt-3 h-1.5 bg-surface-raised" />
            <p className="mt-2 text-xs text-muted-foreground">{s.hint}</p>
          </motion.article>
        ))}
      </section>

      <motion.div
        {...fade(4)}
        className="panel glow-violet p-5 text-sm leading-relaxed text-muted-foreground"
      >
        <span className="font-semibold text-foreground">Summary — </span>
        {feedback.summary}
      </motion.div>

      <section aria-label="Strengths and improvement areas" className="grid gap-3 lg:grid-cols-2">
        <motion.article {...fade(5)} className="panel border-primary/30 p-5">
          <h3 className="text-sm font-semibold text-primary">Strengths</h3>
          <ul className="mt-3 space-y-2">
            {feedback.strengths.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-foreground/90"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </motion.article>

        <motion.article {...fade(6)} className="panel border-destructive/30 p-5">
          <h3 className="text-sm font-semibold text-destructive">Gaps</h3>
          <ul className="mt-3 space-y-2">
            {feedback.gaps.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-foreground/90"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </motion.article>
      </section>

      <motion.section
        {...fade(7)}
        aria-label="Recommended next steps"
        className="panel border-accent/30 p-5"
      >
        <h3 className="text-sm font-semibold text-accent">Next steps</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {feedback.next.map((s) => (
            <li
              key={s}
              className="flex items-start gap-2 rounded-md bg-accent/10 px-3 py-2 text-sm text-foreground/90"
            >
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              {s}
            </li>
          ))}
        </ul>
      </motion.section>

      <section aria-label="Curriculum topic breakdown" className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Topic breakdown by curriculum day
        </h3>
        <ul className="space-y-2">
          {feedback.results.map((d, i) => (
            <motion.li key={d.questionId} {...fade(8 + i)} className="panel p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Day {d.day} · {d.module}
                  </p>
                  <h4 className="mt-0.5 text-sm font-semibold">{d.dayTitle}</h4>
                  <p className="mt-2 text-sm text-foreground/80">{d.question}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="text-foreground/70">Answer: </span>
                    {d.answer}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="text-foreground/70">Feedback: </span>
                    {d.feedback}
                  </p>
                </div>
                <span
                  className={`justify-self-start rounded-md px-2.5 py-1 font-mono text-sm sm:justify-self-end ${
                    d.score === 0
                      ? "bg-destructive/15 text-destructive"
                      : d.score >= 80
                        ? "bg-primary/15 text-primary"
                        : "bg-warning/15 text-warning"
                  }`}
                >
                  {d.score === 0 ? "No signal" : `${d.score}/100`}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
