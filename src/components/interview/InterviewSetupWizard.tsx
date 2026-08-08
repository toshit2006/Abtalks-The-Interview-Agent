import { useState } from "react";
import { Play, Sparkles, BookOpen, CheckCircle2, Search, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { candidates, curriculum } from "@/lib/curriculum";
import type { PersonaType, RigorLevel } from "@/components/interview/AiPersonaSelector";
import { useInterview } from "@/lib/use-interview";

interface Props {
  selectedCandidateId: string;
  onSelectCandidate: (id: string) => void;
  onStartInterview: (persona: PersonaType, rigor: RigorLevel, selectedModules: number[]) => void;
  onNavigateTab: (tab: string) => void;
}

const moduleColors: Record<number, { border: string; bg: string; text: string }> = {
  1: { border: "border-cyan-500/40", bg: "bg-cyan-500/10", text: "text-cyan-300" },
  2: { border: "border-amber-500/40", bg: "bg-amber-500/10", text: "text-amber-300" },
  3: { border: "border-violet-500/40", bg: "bg-violet-500/10", text: "text-violet-300" },
  4: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-300" },
  5: { border: "border-rose-500/40", bg: "bg-rose-500/10", text: "text-rose-300" },
  6: { border: "border-indigo-500/40", bg: "bg-indigo-500/10", text: "text-indigo-300" },
  7: { border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-300" },
  8: { border: "border-pink-500/40", bg: "bg-pink-500/10", text: "text-pink-300" },
};

export function InterviewSetupWizard({
  selectedCandidateId,
  onSelectCandidate,
  onStartInterview,
  onNavigateTab,
}: Props) {
  const { startSession } = useInterview();
  const [candidateSearch, setCandidateSearch] = useState("");
  const [persona, setPersona] = useState<PersonaType>("lead");
  const [rigor, setRigor] = useState<RigorLevel>("advanced");
  const [selectedModules, setSelectedModules] = useState<number[]>(
    curriculum.modules.map((m) => m.n),
  );

  const selectedCandidate =
    candidates.find((c) => c.member.id === selectedCandidateId) || candidates[0]!;

  const handleLaunch = async () => {
    await startSession();
    onStartInterview(persona, rigor, selectedModules);
  };

  const toggleModule = (n: number) => {
    if (selectedModules.includes(n)) {
      if (selectedModules.length > 1) {
        setSelectedModules(selectedModules.filter((id) => id !== n));
      }
    } else {
      setSelectedModules([...selectedModules, n]);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!candidateSearch.trim()) return true;
    const q = candidateSearch.toLowerCase();
    return c.member.name.toLowerCase().includes(q) || c.member.jobRole.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      {/* AB Talks Multi-Color Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/80 via-purple-950/80 to-slate-950 p-8 shadow-2xl glow-multicolor">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-cyan-500/20 font-mono text-xs text-cyan-300 border border-cyan-500/40 shadow-sm">
              AB TALKS | AI ENGINEERING COHORT
            </Badge>
            <Badge className="bg-pink-500/20 font-mono text-xs text-pink-300 border border-pink-500/40 shadow-sm">
              THE INTERVIEW AGENT
            </Badge>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Conduct Realistic <span className="text-gradient">AI Technical Interviews</span>
          </h1>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Evaluate learner mastery across Retrieval-Augmented Generation (RAG), Vector Databases,
            Prompt Engineering, Agentic AI, Model Context Protocol, and Production AI Systems.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => void handleLaunch()}
              className="gap-2.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 font-semibold text-white hover:brightness-110 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
            >
              <Play className="size-4 fill-white" /> Launch Live AI Interview
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigateTab("analytics")}
              className="gap-2 text-sm border-violet-500/30 bg-surface/40 hover:bg-surface hover:border-violet-500/60"
            >
              <Sparkles className="size-4 text-violet-400" /> Talent Analytics
            </Button>

            <Button
              size="lg"
              variant="ghost"
              onClick={() => onNavigateTab("matrix")}
              className="gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="size-4" /> Curriculum Matrix
            </Button>
          </div>
        </div>
      </div>

      {/* Setup Wizard Steps */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Step 1: Candidate Selection with Compact Search & Scrollbar */}
        <div className="panel space-y-3 p-5 border-cyan-500/30 flex flex-col">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-cyan-500/20 font-mono text-xs font-bold text-cyan-400">
                1
              </span>
              <h3 className="text-sm font-semibold text-foreground">Candidate Profile</h3>
            </div>
            <span className="font-mono text-[10px] text-cyan-400 font-bold">
              {candidates.length} Cohort Members
            </span>
          </div>

          {/* Candidate Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Search candidate name or role…"
              className="pl-8 h-8 text-xs bg-surface/80 border-cyan-500/30 focus:border-cyan-500/60"
            />
          </div>

          {/* Compact Scrollable Candidate List */}
          <div className="max-h-80 overflow-y-auto pr-1 space-y-2 flex-1">
            {filteredCandidates.map((c) => {
              const isSelected = c.member.id === selectedCandidate.member.id;
              return (
                <button
                  key={c.member.id}
                  onClick={() => onSelectCandidate(c.member.id)}
                  className={`w-full text-left rounded-xl p-3 transition-all ${
                    isSelected
                      ? "border border-cyan-500/60 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 shadow-md shadow-cyan-500/10"
                      : "border border-border/60 bg-surface/40 hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {c.member.name}
                    </span>
                    {isSelected && <CheckCircle2 className="size-4 shrink-0 text-cyan-400" />}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    {c.member.jobRole} · {c.member.yearsExperience} yrs exp
                  </p>
                </button>
              );
            })}

            {filteredCandidates.length === 0 && (
              <p className="text-center py-6 font-mono text-xs text-muted-foreground">
                No matching candidate found.
              </p>
            )}
          </div>
        </div>

        {/* Step 2: Color-Coded Curriculum Modules with Scrollbar */}
        <div className="panel space-y-3 p-5 border-purple-500/30 flex flex-col">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-purple-500/20 font-mono text-xs font-bold text-purple-400">
                2
              </span>
              <h3 className="text-sm font-semibold text-foreground">Curriculum Focus</h3>
            </div>
            <span className="font-mono text-[10px] text-purple-400 font-bold">
              {selectedModules.length}/8 Active
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto pr-1 space-y-2 flex-1">
            {curriculum.modules.map((m) => {
              const isChecked = selectedModules.includes(m.n);
              const color = moduleColors[m.n] || moduleColors[1]!;
              return (
                <button
                  key={m.n}
                  onClick={() => toggleModule(m.n)}
                  className={`w-full text-left rounded-xl p-2.5 text-xs transition-all ${
                    isChecked
                      ? `border ${color.border} ${color.bg} ${color.text}`
                      : "border border-border/60 bg-surface/30 text-muted-foreground opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="truncate">
                      Mod {m.n} · {m.title}
                    </span>
                    {isChecked && <CheckCircle2 className="size-3.5 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Interviewer Persona & Rigor */}
        <div className="panel space-y-3 p-5 border-amber-500/30 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="grid size-6 place-items-center rounded-full bg-amber-500/20 font-mono text-xs font-bold text-amber-400">
                3
              </span>
              <h3 className="text-sm font-semibold text-foreground">Interviewer Persona</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-mono text-[11px]">
                  Interviewer Style:
                </label>
                <div className="space-y-1.5">
                  {[
                    {
                      id: "lead",
                      name: "Silicon Valley Tech Lead",
                      desc: "Balanced, pragmatic, focuses on production trade-offs.",
                      border: "border-cyan-500/40 text-cyan-300",
                    },
                    {
                      id: "socratic",
                      name: "Socratic Architect",
                      desc: "Deep conceptual probing, asks 'why' behind design decisions.",
                      border: "border-purple-500/40 text-purple-300",
                    },
                    {
                      id: "faang",
                      name: "FAANG Principal Evaluator",
                      desc: "Rigorous system scaling, memory optimization & latency.",
                      border: "border-rose-500/40 text-rose-300",
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id as PersonaType)}
                      className={`w-full text-left rounded-xl p-2.5 transition-all ${
                        persona === p.id
                          ? `border ${p.border} bg-surface-raised shadow-sm`
                          : "border border-border/60 bg-surface/30 text-muted-foreground hover:bg-surface"
                      }`}
                    >
                      <div className="font-semibold">{p.name}</div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-muted-foreground font-mono text-[11px]">Rigor Level:</label>
                <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                  {(["standard", "advanced", "stress"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRigor(r)}
                      className={`rounded-lg py-1.5 text-center uppercase font-bold transition-all ${
                        rigor === r
                          ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20"
                          : "bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
