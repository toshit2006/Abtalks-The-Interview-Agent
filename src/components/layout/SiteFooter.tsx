import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Github, Linkedin, Sparkles, Twitter } from "lucide-react";

// TODO: replace with your real project details before submitting.
const PROJECT_NAME = "The Interview Agent";
const TEAM_NAME = "Abtalks";
const HACKATHON_NAME = "ABTalks Vibe Coding Hackathon";
const GITHUB_URL = "https://github.com/udayjain06/Abtalks-The-Interview-Agent";
const LINKEDIN_URL = "";
const TWITTER_URL = "";

const TECH_STACK = [
  "React 19",
  "TanStack Start",
  "Tailwind CSS",
  "Framer Motion",
  "Radix UI",
  "Claude API",
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

  const socials = [
    { href: GITHUB_URL, label: "GitHub", Icon: Github },
    { href: LINKEDIN_URL, label: "LinkedIn", Icon: Linkedin },
    { href: TWITTER_URL, label: "Twitter", Icon: Twitter },
  ].filter((s) => s.href);

  return (
    <footer className="relative mt-10 border-t border-border bg-sidebar">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-surface-raised text-primary glow-emerald">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <span className="font-display text-base font-bold">
                The <span className="text-gradient">Interview Agent</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              An AI-led technical interviewer that grades and questions candidates against their own
              cohort learning history — not a script.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Built by <span className="text-foreground/80">{TEAM_NAME}</span> during
            </p>
            <p className="text-xs font-medium text-primary">{HACKATHON_NAME}</p>
          </div>

          <nav aria-label="Quick navigation">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Quick navigation
            </h3>
            <ul className="mt-3 space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.tab}>
                  <button
                    type="button"
                    onClick={() => goTo(link.tab)}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Built with
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {TECH_STACK.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-foreground/80"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Project
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-primary"
                >
                  <Github className="size-4" aria-hidden />
                  View source on GitHub
                </a>
              </li>
            </ul>
            {socials.length > 0 && (
              <div className="mt-4 flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid size-8 place-items-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Icon className="size-4" aria-hidden />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-center gap-3 border-t border-border pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {PROJECT_NAME} · Built by {TEAM_NAME}. All data used is
            synthetic and for demonstration only.
          </p>
          <motion.button
            type="button"
            onClick={scrollTop}
            animate={{ opacity: showTop ? 1 : 0.5 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
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
