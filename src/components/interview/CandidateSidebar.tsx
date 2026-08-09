import { useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, CircleSlash, Clock, Radio, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { curriculum, initials, moduleForDay } from "@/lib/curriculum";
import { useInterview } from "@/lib/use-interview";
import type { TopicStatus } from "@/types/interview";

const statusMeta = {
  completed: { icon: CheckCircle2, className: "text-primary", label: "Completed" },
  attempted: { icon: TrendingUp, className: "text-warning", label: "Attempted" },
  skipped: { icon: CircleSlash, className: "text-destructive", label: "Skipped" },
  pending: { icon: CircleDashed, className: "text-muted-foreground", label: "Pending" },
} as const;

function elapsed(from: number, currentTime: number) {
  if (!from || from <= 0) return "00:00";
  const total = Math.max(0, Math.floor((currentTime - from) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function CandidateSidebar() {
  const { candidate, sessionId, results, requiredQuestions, startedAt } = useInterview();
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const answered = results.length;
  const pct = Math.min(100, Math.round((answered / requiredQuestions) * 100));

  const missionStatus = new Map<number, TopicStatus>();
  for (const m of candidate.missions) {
    missionStatus.set(m.day, m.skipped ? "skipped" : m.passed ? "completed" : "pending");
  }
  for (const r of results) missionStatus.set(r.day, r.status);

  const scoreByDay = new Map(results.map((r) => [r.day, r.score]));

  // Module coverage from the candidate's own mission history.
  const modules = curriculum.modules.map((mod) => {
    const first = mod.days[0] ?? 0;
    const last = mod.days[mod.days.length - 1] ?? first;
    const total = last - first + 1;
    const done = candidate.missions.filter(
      (m) => m.day >= first && m.day <= last && m.passed,
    ).length;
    return { name: mod.title, total, done };
  });

  const attemptedCount = candidate.missions.filter((m) => m.passed).length;
  const skippedCount = candidate.missions.filter((m) => m.skipped).length;

  return (
    <aside
      aria-label="Candidate profile"
      className="flex h-full w-full flex-col gap-5 overflow-y-auto border-r border-indigo-500/20 bg-sidebar/95 p-5 backdrop-blur-xl scrollbar-thin scrollbar-thumb-indigo-900/60 scrollbar-track-transparent"
    >
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 font-display text-base font-bold text-white shadow-lg shadow-indigo-500/30 glow-multicolor">
          {initials(candidate.member.name)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{candidate.member.name}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {candidate.member.jobRole} · {candidate.member.yearsExperience} yrs
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2 py-0.5 text-primary">
          <Radio className="size-3 animate-pulse" aria-hidden />
          LIVE
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5">
          <Clock className="size-3" aria-hidden />
          {elapsed(startedAt, nowTime)}
        </span>
        <span className="rounded-md bg-surface px-2 py-0.5 truncate max-w-[120px]">
          {sessionId}
        </span>
      </div>

      <p className="rounded-md bg-surface px-3 py-2 text-xs text-muted-foreground leading-relaxed">
        {candidate.member.education} · {candidate.signals.commitDays} commit days ·{" "}
        {candidate.signals.missionsCompleted} missions
      </p>

      <section aria-labelledby="progress-heading" className="panel p-3.5">
        <div className="flex items-baseline justify-between">
          <h3
            id="progress-heading"
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Interview progress
          </h3>
          <span className="font-mono text-xs text-primary font-bold">
            {answered}/{requiredQuestions}
          </span>
        </div>
        <Progress
          value={pct}
          className="mt-2 h-1.5 bg-surface-raised"
          aria-label={`${pct}% of required questions complete`}
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {Math.max(0, requiredQuestions - answered)} questions remaining
        </p>
      </section>

      <section aria-labelledby="modules-heading" className="space-y-2">
        <h3
          id="modules-heading"
          className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Curriculum modules
        </h3>
        <ul className="space-y-1.5 pr-1">
          {modules.map((m) => (
            <li key={m.name} className="panel px-2.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-xs font-medium">{m.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {m.done}/{m.total}
                </span>
              </div>
              <Progress value={(m.done / m.total) * 100} className="mt-1.5 h-1 bg-surface-raised" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="topics-heading" className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3
            id="topics-heading"
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Missions
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            {attemptedCount} passed · {skippedCount} skipped
          </span>
        </div>
        <ul className="space-y-1 pr-1">
          {candidate.missions.map((m) => {
            const status = missionStatus.get(m.day) ?? "pending";
            const meta = statusMeta[status];
            const Icon = meta.icon;
            const score = scoreByDay.get(m.day);
            return (
              <li
                key={m.day}
                className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-surface text-xs"
              >
                <Icon className={`size-3.5 shrink-0 ${meta.className}`} aria-hidden />
                <span className="min-w-0 flex-1 truncate text-foreground/90">
                  <span className="font-mono text-[10px] text-muted-foreground">D{m.day}</span>{" "}
                  {m.title}
                </span>
                <span className="sr-only">
                  {meta.label} · {moduleForDay(m.day)}
                </span>
                {typeof score === "number" && (
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {score}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
