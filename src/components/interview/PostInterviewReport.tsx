import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, Download, FileJson, Printer, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInterview } from "@/lib/use-interview";
import { CandidateRadarChart } from "@/components/interview/RadarChart";

const fade = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: Math.min(i, 10) * 0.07, ease: [0.22, 1, 0.36, 1] as const },
});

export function PostInterviewReport() {
  const { candidate, sessionId, feedback, results, requiredQuestions, done, startSession } =
    useInterview();

  if (!feedback) {
    return (
      <div className="panel p-6 space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs">
            EVALUATION PENDING
          </Badge>
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">
          Live Interview Assessment In Progress
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          The completion &amp; feedback report unlocks once technical questions across the
          curriculum are assessed. {results.length}/{requiredQuestions} answered so far
          {done ? "." : " — keep going or end the interview to generate the report."}
        </p>
      </div>
    );
  }

  // Handle case when candidate did NOT attend/answer any live questions
  if (feedback.results.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-6">
        <div className="panel p-8 text-center space-y-6 border-amber-500/40 glow-multicolor">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md">
            <AlertTriangle className="size-8" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs">
              NO LIVE QUESTIONS ATTENDED
            </Badge>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Interview Session Ended Early
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {candidate.member.name} ended the interview session without submitting any live
              technical answers. Launch a live session and answer technical questions to generate
              real-time evaluation scores and radar analysis.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-raised/60 border border-border/60 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Questions Answered
              </span>
              <span className="text-rose-400 font-bold text-lg">0 / {requiredQuestions}</span>
            </div>
            <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-border/60 py-2 sm:py-0">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Curriculum Coverage
              </span>
              <span className="text-rose-400 font-bold text-lg">0 Days</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Cohort Missions
              </span>
              <span className="text-cyan-400 font-bold text-lg">
                {candidate.signals.missionsCompleted} / 31
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={() => void startSession()}
              className="gap-2.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110"
            >
              <Play className="size-4 fill-white" /> Launch Live Interview &amp; Answer Questions
            </Button>
          </div>
        </div>
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
    <div className="space-y-6">
      <motion.header {...fade(0)} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Interview complete · {distinctDays} curriculum days assessed
          </p>
          <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl text-foreground">
            Completion &amp; <span className="text-gradient">Feedback Report</span>
          </h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white">
              <Download className="size-4" aria-hidden />
              Export report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-950 border-border text-xs">
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

      <section aria-label="Score summary" className="grid gap-4 sm:grid-cols-3">
        {summaryScores.map((s, i) => (
          <motion.article
            key={s.label}
            {...fade(i + 1)}
            className={`panel p-5 ${i === 0 ? "glow-multicolor border-indigo-500/40" : "border-border/80"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">
              {s.label}
            </p>
            <p className="mt-2 font-display text-4xl font-extrabold text-gradient">
              {s.value}
              <span className="ml-1 font-sans text-sm font-medium text-muted-foreground">/100</span>
            </p>
            <Progress value={s.value} className="mt-3 h-1.5 bg-surface-raised" />
            <p className="mt-2 text-xs text-muted-foreground">{s.hint}</p>
          </motion.article>
        ))}
      </section>

      <motion.section {...fade(3.5)} className="panel p-5 border-purple-500/30">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">
          Skill Radar Analysis
        </h3>
        <CandidateRadarChart feedback={feedback} />
      </motion.section>

      <motion.div
        {...fade(4)}
        className="panel glow-violet p-5 text-sm leading-relaxed text-muted-foreground border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 to-purple-950/30"
      >
        <span className="font-semibold text-foreground">Summary — </span>
        {feedback.summary}
      </motion.div>

      <section aria-label="Strengths and improvement areas" className="grid gap-4 lg:grid-cols-2">
        <motion.article {...fade(5)} className="panel border-emerald-500/30 p-5">
          <h3 className="text-sm font-semibold text-emerald-400 font-display">Strengths</h3>
          <ul className="mt-3 space-y-2">
            {feedback.strengths.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-foreground/90"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </motion.article>

        <motion.article {...fade(6)} className="panel border-rose-500/30 p-5">
          <h3 className="text-sm font-semibold text-rose-400 font-display">
            Areas for Improvement
          </h3>
          <ul className="mt-3 space-y-2">
            {feedback.gaps.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs text-foreground/90"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-400" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </motion.article>
      </section>

      <motion.section
        {...fade(7)}
        aria-label="Recommended next steps"
        className="panel border-indigo-500/30 p-5"
      >
        <h3 className="text-sm font-semibold text-cyan-300 font-display">Recommended Next Steps</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {feedback.next.map((s) => (
            <li
              key={s}
              className="flex items-start gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 px-3 py-2 text-xs text-foreground/90"
            >
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-cyan-400" aria-hidden />
              {s}
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Topic breakdown list */}
      <section aria-label="Curriculum topic breakdown" className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">
          Topic breakdown by curriculum day
        </h3>
        <ul className="space-y-2">
          {feedback.results.map((d, i) => (
            <motion.li
              key={d.questionId}
              {...fade(8 + i)}
              className="panel p-4 border-indigo-500/30"
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Day {d.day} · {d.module}
                  </p>
                  <h4 className="mt-0.5 text-sm font-semibold text-foreground">{d.dayTitle}</h4>
                  <p className="mt-2 text-xs text-foreground/80">{d.question}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="text-foreground/70 font-semibold">Answer: </span>
                    {d.answer}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="text-foreground/70 font-semibold">Feedback: </span>
                    {d.feedback}
                  </p>
                </div>
                <span
                  className={`justify-self-start rounded-lg px-2.5 py-1 font-mono text-xs font-bold sm:justify-self-end ${
                    d.score === 0
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : d.score >= 80
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {d.score === 0 ? "Skipped" : `${d.score}/100`}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
