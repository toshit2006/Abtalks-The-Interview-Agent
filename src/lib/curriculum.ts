import curriculumJson from "@/data/curriculum.json";
import candidatesJson from "@/data/candidates.json";
import type { CandidateProfile, Curriculum, CurriculumDay } from "@/types/interview";

export const curriculum = curriculumJson as Curriculum;
export const candidates = (candidatesJson as { candidates: CandidateProfile[] }).candidates;

export const dayMap = new Map<number, CurriculumDay>(curriculum.days.map((d) => [d.day, d]));

export function getDay(day: number): CurriculumDay | undefined {
  return dayMap.get(day);
}

export function moduleForDay(day: number): string {
  const m = curriculum.modules.find((mod) => {
    const first = mod.days[0] ?? 0;
    const last = mod.days[mod.days.length - 1] ?? first;
    return day >= first && day <= last;
  });
  return m ? m.title : "General";
}

export function getCandidate(id?: string): CandidateProfile {
  if (id) {
    const found = candidates.find((c) => c.member.id === id);
    if (found) return found;
  }
  return candidates[0]!;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
