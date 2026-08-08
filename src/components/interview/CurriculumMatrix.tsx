import { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  BookOpen,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { curriculum, getDay } from "@/lib/curriculum";
import { useInterview } from "@/lib/use-interview";
import type { CurriculumDay, TopicStatus } from "@/types/interview";

const moduleTheme: Record<
  number,
  { border: string; bg: string; text: string; badge: string; glow: string }
> = {
  1: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    glow: "shadow-cyan-500/10",
  },
  2: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    glow: "shadow-amber-500/10",
  },
  3: {
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    text: "text-violet-300",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    glow: "shadow-violet-500/10",
  },
  4: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    glow: "shadow-emerald-500/10",
  },
  5: {
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    glow: "shadow-rose-500/10",
  },
  6: {
    border: "border-indigo-500/40",
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    glow: "shadow-indigo-500/10",
  },
  7: {
    border: "border-purple-500/40",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    glow: "shadow-purple-500/10",
  },
  8: {
    border: "border-pink-500/40",
    bg: "bg-pink-500/10",
    text: "text-pink-300",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    glow: "shadow-pink-500/10",
  },
};

const statusStyles: Record<
  TopicStatus,
  { label: string; style: string; icon: React.ComponentType<{ className?: string }> }
> = {
  completed: {
    label: "Mastered",
    style: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: CheckCircle2,
  },
  attempted: {
    label: "Attempted",
    style: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: Clock,
  },
  skipped: {
    label: "Skipped",
    style: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    icon: AlertTriangle,
  },
  pending: {
    label: "Pending",
    style: "bg-slate-800/60 text-slate-400 border-slate-700/60",
    icon: Info,
  },
};

export function CurriculumMatrix() {
  const { candidate, results } = useInterview();
  const [search, setSearch] = useState("");
  const [selectedModNum, setSelectedModNum] = useState<number | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [inspectDay, setInspectDay] = useState<CurriculumDay | null>(null);

  const missionByDay = new Map(candidate.missions.map((m) => [m.day, m]));
  const resultByDay = new Map(results.map((r) => [r.day, r]));

  // Compute overall candidate cohort mastery stats
  const totalDays = curriculum.days.length;
  const masteredCount = curriculum.days.filter((d) => {
    const res = resultByDay.get(d.day);
    if (res && res.status === "completed") return true;
    const m = missionByDay.get(d.day);
    return m?.passed;
  }).length;

  const skippedCount = curriculum.days.filter((d) => {
    const res = resultByDay.get(d.day);
    if (res && res.status === "skipped") return true;
    const m = missionByDay.get(d.day);
    return m?.skipped;
  }).length;

  const masteryPct = Math.round((masteredCount / totalDays) * 100);

  // Filter modules and days based on search & filters
  const filteredModules = curriculum.modules.filter((mod) => {
    if (selectedModNum !== null && mod.n !== selectedModNum) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-8">
      {/* Dynamic Telemetry Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-6 shadow-2xl glow-multicolor">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-mono text-[10px]">
                {curriculum.cohort}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-mono text-[10px]">
                31-DAY COHORT MATRIX
              </Badge>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Interactive <span className="text-gradient">Curriculum Mastery Matrix</span>
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore candidate competency across all 31 curriculum days and 8 core engineering
              modules. Click any day card for learning objectives and tools breakdown.
            </p>
          </div>

          {/* Mastery Circular Stats Gauge */}
          <div className="flex items-center gap-6 p-4 rounded-2xl border border-indigo-500/30 bg-surface/60 backdrop-blur-xl">
            <div className="space-y-1 text-center font-mono">
              <span className="text-xs text-muted-foreground block">Cohort Mastery</span>
              <span className="text-3xl font-extrabold text-gradient">{masteryPct}%</span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>{masteredCount} Mastered</span>
              </div>
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="size-3.5" />
                <span>{skippedCount} Skipped</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Command Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search days, tools, objectives…"
              className="pl-9 bg-surface/80 border-indigo-500/30 text-xs focus:border-cyan-500/60"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {[
              { id: "all", label: "All Statuses" },
              { id: "mastered", label: "Mastered" },
              { id: "attempted", label: "Attempted" },
              { id: "skipped", label: "Skipped" },
              { id: "pending", label: "Pending" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedStatusFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 transition-all uppercase text-[10px] font-bold ${
                  selectedStatusFilter === f.id
                    ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Module Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <button
            onClick={() => setSelectedModNum(null)}
            className={`rounded-xl px-3.5 py-1.5 transition-all text-xs font-semibold ${
              selectedModNum === null
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                : "border border-border/80 bg-surface/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            All 8 Modules
          </button>
          {curriculum.modules.map((m) => {
            const theme = moduleTheme[m.n] || moduleTheme[1]!;
            const isSelected = selectedModNum === m.n;
            return (
              <button
                key={m.n}
                onClick={() => setSelectedModNum(m.n)}
                className={`rounded-xl px-3.5 py-1.5 transition-all text-xs font-semibold ${
                  isSelected
                    ? `border ${theme.border} ${theme.bg} ${theme.text} shadow-md ${theme.glow}`
                    : "border border-border/60 bg-surface/30 text-muted-foreground hover:text-foreground opacity-75"
                }`}
              >
                Mod {m.n} · {m.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Futuristic 3D Grid Module Sections */}
      <div className="space-y-8">
        {filteredModules.map((mod) => {
          const theme = moduleTheme[mod.n] || moduleTheme[1]!;
          const first = mod.days[0] ?? 0;
          const last = mod.days[mod.days.length - 1] ?? first;
          const daysInModule = curriculum.days.filter((d) => d.day >= first && d.day <= last);

          // Apply search & status filter to days
          const visibleDays = daysInModule.filter((d) => {
            const mission = missionByDay.get(d.day);
            const result = resultByDay.get(d.day);
            const status: TopicStatus = result
              ? result.status
              : mission?.skipped
                ? "skipped"
                : mission?.passed
                  ? "completed"
                  : "pending";

            if (selectedStatusFilter !== "all") {
              if (selectedStatusFilter === "mastered" && status !== "completed") return false;
              if (selectedStatusFilter === "attempted" && status !== "attempted") return false;
              if (selectedStatusFilter === "skipped" && status !== "skipped") return false;
              if (selectedStatusFilter === "pending" && status !== "pending") return false;
            }

            if (search.trim()) {
              const q = search.toLowerCase();
              const dayDetail = getDay(d.day);
              const matchesTitle = d.title.toLowerCase().includes(q);
              const matchesTools = dayDetail?.tools.some((t) => t.toLowerCase().includes(q));
              const matchesObj = dayDetail?.objectives.some((o) => o.toLowerCase().includes(q));
              if (!matchesTitle && !matchesTools && !matchesObj) return false;
            }

            return true;
          });

          if (!visibleDays.length) return null;

          return (
            <section key={mod.n} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                <span
                  className={`grid size-7 place-items-center rounded-lg border font-mono text-xs font-bold ${theme.border} ${theme.bg} ${theme.text}`}
                >
                  {mod.n}
                </span>
                <h3 className="font-display text-base font-bold text-foreground">
                  Module {mod.n} · <span className={theme.text}>{mod.title}</span>
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  (Days {first}–{last})
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleDays.map((d) => {
                  const mission = missionByDay.get(d.day);
                  const result = resultByDay.get(d.day);
                  const status: TopicStatus = result
                    ? result.status
                    : mission?.skipped
                      ? "skipped"
                      : mission?.passed
                        ? "completed"
                        : "pending";

                  const st = statusStyles[status];
                  const StatusIcon = st.icon;
                  const detail = getDay(d.day);

                  return (
                    <button
                      key={d.day}
                      onClick={() => setInspectDay(d)}
                      className={`group panel text-left p-5 space-y-3 transition-all hover:scale-[1.02] cursor-pointer ${theme.border} hover:${theme.glow}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">
                          Day {d.day} · {d.type}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold border uppercase tracking-wide ${st.style}`}
                        >
                          <StatusIcon className="size-3" />
                          {st.label}
                        </span>
                      </div>

                      <h4 className="font-display text-sm font-bold text-foreground group-hover:text-cyan-300 transition-colors">
                        {d.title}
                      </h4>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {detail?.objectives[0]}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {detail?.tools.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-surface-raised/80 px-2 py-0.5 font-mono text-[10px] text-indigo-300"
                          >
                            {t}
                          </span>
                        ))}
                        {(detail?.tools.length ?? 0) > 3 && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            +{(detail?.tools.length ?? 0) - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-3 font-mono text-[11px] text-muted-foreground">
                        <span>
                          {mission ? `${mission.attempts ?? 1} attempt(s)` : "Not evaluated"}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                          Details <ChevronRight className="size-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Day Deep Dive Detail Modal */}
      {inspectDay && (
        <Dialog open={!!inspectDay} onOpenChange={() => setInspectDay(null)}>
          <DialogContent className="max-w-xl bg-slate-950/95 border-indigo-500/40 p-6 backdrop-blur-2xl">
            <DialogHeader className="space-y-2 text-left border-b border-border/80 pb-4">
              <div className="flex items-center gap-2">
                <Badge className="font-mono text-[10px] bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                  DAY {inspectDay.day} · {inspectDay.type}
                </Badge>
                <Badge className="font-mono text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/40">
                  COHORT DEEP DIVE
                </Badge>
              </div>
              <DialogTitle className="font-display text-xl font-bold text-foreground">
                {inspectDay.title}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4 text-xs">
              {/* Learning Objectives */}
              <div className="space-y-2">
                <h4 className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Learning Objectives:
                </h4>
                <ul className="space-y-2 rounded-2xl border border-indigo-500/30 bg-surface/60 p-4 leading-relaxed">
                  {inspectDay.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/90">
                      <CheckCircle2 className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tools & Environment */}
              <div className="space-y-2">
                <h4 className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Tools &amp; Environment:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {inspectDay.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-3 py-1 font-mono text-xs font-semibold text-purple-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
