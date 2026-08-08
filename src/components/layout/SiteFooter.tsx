import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";

const PROJECT_NAME = "The Interview Agent";
const TEAM_NAME = "AB Talks AI Cohort";
const HACKATHON_NAME = "ABTalks Vibe Coding Hackathon";

const TECH_STACK = [
  "React 19",
  "TanStack Start",
  "Tailwind CSS",
  "Framer Motion",
  "Groq API",
  "Qdrant Vector DB",
  "Neon Postgres",
];

type Tab = "live" | "matrix" | "report";

const QUICK_LINKS: { label: string; tab: Tab }[] = [
  { label: "Live Interview", tab: "live" },
  { label: "Curriculum Matrix", tab: "matrix" },
  { label: "Post-Interview Report", tab: "report" },
];

export function SiteFooter({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (tab: Tab) => {
    onNavigate?.(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative z-20 mt-14 border-t border-indigo-500/20 bg-slate-950/95 backdrop-blur-xl clear-both">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 glow-violet">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <span className="font-display text-base font-bold text-foreground">
                AB Talks | <span className="text-gradient">The Interview Agent</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Official AI-led technical evaluation platform for candidate cohort mastery, RAG vector
              memory assessment, and post-interview analytics.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground pt-1">
              Built by <span className="text-foreground/90 font-semibold">{TEAM_NAME}</span> during
            </p>
            <p className="text-xs font-semibold text-cyan-400">{HACKATHON_NAME}</p>
          </div>

          <nav aria-label="Quick navigation">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">
              Quick Navigation
            </h3>
            <ul className="mt-3 space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.tab}>
                  <button
                    type="button"
                    onClick={() => goTo(link.tab)}
                    className="text-xs text-foreground/80 transition-colors hover:text-cyan-400 font-medium"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">
              Enterprise Tech Stack
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {TECH_STACK.map((tech) => (
                <li
                  key={tech}
                  className="rounded-lg border border-indigo-500/30 bg-surface/60 px-2.5 py-1 font-mono text-[11px] text-indigo-300"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-center gap-3 border-t border-border/60 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground font-sans">
            © {new Date().getFullYear()} {PROJECT_NAME} · Official AB Talks AI Platform.
          </p>
          <motion.button
            type="button"
            onClick={scrollTop}
            animate={{ opacity: showTop ? 1 : 0.6 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-surface/60 px-3.5 py-1.5 text-xs text-foreground/80 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
            aria-label="Back to top"
          >
            <ArrowUp className="size-3.5" aria-hidden />
            Back to top
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
