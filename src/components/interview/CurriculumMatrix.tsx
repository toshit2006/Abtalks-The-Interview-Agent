import { curriculum, getDay } from "@/lib/curriculum";
import { useInterview } from "@/lib/use-interview";
import type { TopicStatus } from "@/types/interview";

const statusStyles: Record<TopicStatus, string> = {
  completed: "bg-primary/15 text-primary",
  attempted: "bg-warning/15 text-warning",
  skipped: "bg-destructive/15 text-destructive",
  pending: "bg-muted text-muted-foreground",
};

export function CurriculumMatrix() {
  const { candidate, results } = useInterview();

  const missionByDay = new Map(candidate.missions.map((m) => [m.day, m]));
  const resultByDay = new Map(results.map((r) => [r.day, r]));

  return (
    <div className="space-y-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {curriculum.cohort}
      </p>
      {curriculum.modules.map((mod) => {
        const first = mod.days[0] ?? 0;
        const last = mod.days[mod.days.length - 1] ?? first;
        const days = curriculum.days.filter((d) => d.day >= first && d.day <= last);
        return (
          <section key={mod.n} aria-labelledby={`m-${mod.n}`} className="space-y-3">
            <h3
              id={`m-${mod.n}`}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Module {mod.n} · {mod.title}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {days.map((d) => {
                const mission = missionByDay.get(d.day);
                const result = resultByDay.get(d.day);
                const status: TopicStatus = result
                  ? result.status
                  : mission?.skipped
                    ? "skipped"
                    : mission?.passed
                      ? "completed"
                      : "pending";
                const detail = getDay(d.day);
                return (
                  <article
                    key={d.day}
                    className="panel p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="min-w-0 text-sm font-semibold leading-snug">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          Day {d.day}
                        </span>
                        <br />
                        {d.title}
                      </h4>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {detail?.objectives[0]}
                    </p>
                    <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                      <span>
                        {d.type} · {mission ? `${mission.attempts ?? 0} attempts` : "not taken"}
                      </span>
                      <span>{result ? `${result.score} / 100` : "—"}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
