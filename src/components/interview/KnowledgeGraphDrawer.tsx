import { useState } from "react";
import {
  Network,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { curriculum } from "@/lib/curriculum";
import type { CandidateProfile, QuestionResult } from "@/types/interview";

interface Props {
  candidate: CandidateProfile;
  results: QuestionResult[];
}

export function KnowledgeGraphDrawer({ candidate, results }: Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(7);

  const getDayStatus = (dayNum: number) => {
    const res = results.find((r) => r.day === dayNum);
    if (res) {
      return res.status === "completed" ? "mastered" : "attempted";
    }
    const mission = candidate.missions.find((m) => m.day === dayNum);
    if (mission) {
      if (mission.skipped) return "skipped";
      if (mission.passed) return "mastered";
      return "attempted";
    }
    return "unassessed";
  };

  const selectedDayData = curriculum.days.find((d) => d.day === selectedDay);
  const selectedStatus = selectedDay ? getDayStatus(selectedDay) : null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-[11px] sm:text-xs border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 shadow-sm px-2 sm:px-3 cursor-pointer"
        >
          <Network className="size-3.5 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline">Interactive </span>Knowledge Map
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[520px] max-w-[92vw] bg-slate-950/95 border-border p-6 overflow-y-auto backdrop-blur-2xl"
      >
        <SheetHeader className="space-y-2 text-left border-b border-border/80 pb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 font-mono text-[10px] text-cyan-300 border border-cyan-500/40">
              COHORT KNOWLEDGE GRAPH
            </Badge>
            <Badge className="bg-purple-500/20 font-mono text-[10px] text-purple-300 border border-purple-500/40">
              31-DAY NEURAL MAP
            </Badge>
          </div>
          <SheetTitle className="font-display text-lg font-bold text-foreground">
            Candidate Skill &amp; Concept Network
          </SheetTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Interactive node-link visualization mapping {candidate.member.name}&apos;s mastery
            across all 31 curriculum days and 8 modules.
          </p>
        </SheetHeader>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 py-4 border-b border-border/60 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="size-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />{" "}
            Mastered
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="size-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />{" "}
            Attempted
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="size-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />{" "}
            Skipped
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="size-2.5 rounded-full bg-slate-600" /> Pending
          </span>
        </div>

        {/* Interactive Neural Node Grid */}
        <div className="py-5 space-y-5">
          <div className="grid grid-cols-6 gap-2.5 p-4 rounded-2xl border border-indigo-500/30 bg-surface/50 backdrop-blur-xl">
            {curriculum.days.map((d) => {
              const status = getDayStatus(d.day);
              const isSelected = selectedDay === d.day;
              return (
                <button
                  key={d.day}
                  onClick={() => setSelectedDay(d.day)}
                  title={`Day ${d.day}: ${d.title}`}
                  className={`relative grid size-11 place-items-center rounded-xl font-mono text-xs font-bold transition-all ${
                    isSelected
                      ? "ring-2 ring-cyan-400 scale-110 z-10 shadow-lg shadow-cyan-500/30"
                      : "hover:scale-105"
                  } ${
                    status === "mastered"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                      : status === "attempted"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                        : status === "skipped"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                          : "bg-surface-raised/60 text-slate-400 border border-border/60"
                  }`}
                >
                  Day {d.day}
                </button>
              );
            })}
          </div>

          {/* Selected Node Details Card */}
          {selectedDayData && (
            <div className="panel p-5 space-y-3 border-indigo-500/40 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950">
              <div className="flex items-center justify-between">
                <Badge className="font-mono text-[10px] bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
                  DAY {selectedDayData.day} · {selectedDayData.type}
                </Badge>

                <span
                  className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    selectedStatus === "mastered"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : selectedStatus === "attempted"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : selectedStatus === "skipped"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-slate-700/40 text-slate-300"
                  }`}
                >
                  {selectedStatus}
                </span>
              </div>

              <h4 className="font-display text-base font-bold text-foreground">
                {selectedDayData.title}
              </h4>

              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Learning Objectives:
                </span>
                <ul className="space-y-1.5 text-xs text-foreground/90">
                  {selectedDayData.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                <span className="text-slate-400 font-semibold">Tools:</span>
                {selectedDayData.tools.map((t) => (
                  <span key={t} className="rounded bg-surface px-1.5 py-0.5 text-indigo-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
