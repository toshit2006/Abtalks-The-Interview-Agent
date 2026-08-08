import { useState } from "react";
import { UserCheck, ShieldAlert, Cpu, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PersonaType = "lead" | "socratic" | "faang";
export type RigorLevel = "standard" | "advanced" | "stress";

interface Props {
  onPersonaChange?: (persona: PersonaType, rigor: RigorLevel) => void;
}

export function AiPersonaSelector({ onPersonaChange }: Props) {
  const [persona, setPersona] = useState<PersonaType>("lead");
  const [rigor, setRigor] = useState<RigorLevel>("advanced");

  const selectPersona = (p: PersonaType) => {
    setPersona(p);
    onPersonaChange?.(p, rigor);
  };

  const selectRigor = (r: RigorLevel) => {
    setRigor(r);
    onPersonaChange?.(persona, r);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/80 bg-surface/70 px-3 py-2 text-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
        <UserCheck className="size-3.5 text-emerald-400" />
        <span>Interviewer Persona:</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => selectPersona("lead")}
          className={`rounded px-2 py-0.5 text-xs transition-colors ${
            persona === "lead"
              ? "bg-emerald-500/20 font-semibold text-emerald-300 border border-emerald-500/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Silicon Valley Lead
        </button>
        <button
          onClick={() => selectPersona("socratic")}
          className={`rounded px-2 py-0.5 text-xs transition-colors ${
            persona === "socratic"
              ? "bg-violet-500/20 font-semibold text-violet-300 border border-violet-500/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Socratic Architect
        </button>
        <button
          onClick={() => selectPersona("faang")}
          className={`rounded px-2 py-0.5 text-xs transition-colors ${
            persona === "faang"
              ? "bg-amber-500/20 font-semibold text-amber-300 border border-amber-500/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          FAANG Principal
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="font-mono text-[10px] text-muted-foreground">Rigor:</span>
        <button
          onClick={() => selectRigor("standard")}
          className={`rounded px-2 py-0.5 text-[10px] uppercase font-mono ${
            rigor === "standard"
              ? "bg-surface-raised text-primary font-bold"
              : "text-muted-foreground"
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => selectRigor("advanced")}
          className={`rounded px-2 py-0.5 text-[10px] uppercase font-mono ${
            rigor === "advanced"
              ? "bg-violet-500/30 text-violet-300 font-bold"
              : "text-muted-foreground"
          }`}
        >
          Advanced
        </button>
        <button
          onClick={() => selectRigor("stress")}
          className={`rounded px-2 py-0.5 text-[10px] uppercase font-mono ${
            rigor === "stress"
              ? "bg-destructive/30 text-destructive font-bold"
              : "text-muted-foreground"
          }`}
        >
          Stress Test
        </button>
      </div>
    </div>
  );
}
