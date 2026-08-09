import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu,
  X,
  Trophy,
  ShieldCheck,
  Cpu,
  Flame,
  LayoutDashboard,
  Play,
  Sparkles,
} from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CandidateSidebar } from "@/components/interview/CandidateSidebar";
import { SessionStatusBar } from "@/components/interview/SessionStatusBar";
import { LiveInterview } from "@/components/interview/LiveInterview";
import { CurriculumMatrix } from "@/components/interview/CurriculumMatrix";
import { PostInterviewReport } from "@/components/interview/PostInterviewReport";
import { LiveSteerSimulator } from "@/components/interview/LiveSteerSimulator";
import { InterviewSetupWizard } from "@/components/interview/InterviewSetupWizard";
import { TalentAnalyticsPortal } from "@/components/analytics/TalentAnalyticsPortal";
import { AuthModal } from "@/components/auth/AuthModal";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LiveBackgroundCanvas } from "@/components/layout/LiveBackgroundCanvas";
import { candidates } from "@/lib/curriculum";
import { InterviewProvider } from "@/lib/use-interview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AB Talks | The Interview Agent — Enterprise AI Platform" },
      {
        name: "description",
        content:
          "Official AB Talks AI Engineering Cohort interview agent. Dynamic curriculum scoring, Qdrant vector memory, Neon PostgreSQL authentication, and Stage 4 Live Steer challenge mode.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [tab, setTab] = useState<"welcome" | "live" | "matrix" | "report" | "analytics" | "steer">(
    "welcome",
  );
  const [candidateId, setCandidateId] = useState(candidates[0]?.member.id ?? "");

  const handleStartInterview = () => {
    setTab("live");
  };

  const showSidebar = tab === "live" || tab === "matrix" || tab === "report";

  return (
    <InterviewProvider key={candidateId} candidateId={candidateId}>
      <div className="relative min-h-screen text-foreground overflow-x-hidden pt-14">
        {/* Animated Dynamic Neural Light Orbs & Particles */}
        <LiveBackgroundCanvas />
        {/* AB Talks Official Top Navbar */}
        <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-indigo-500/20 bg-slate-950/95 backdrop-blur-xl print:hidden">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTab("welcome")}
                className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
              >
                <div className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white font-display font-extrabold text-sm shadow-md shadow-indigo-500/20">
                  AB
                </div>
                <div>
                  <h1 className="font-display text-base font-bold text-foreground leading-none flex items-center gap-2">
                    AB Talks{" "}
                    <span className="text-xs font-normal text-indigo-400">| AI Cohort</span>
                  </h1>
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                    The Interview Agent
                  </p>
                </div>
              </button>
            </div>

            {/* Navbar Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 font-medium text-xs">
              <button
                onClick={() => setTab("welcome")}
                className={`rounded-lg px-3.5 py-1.5 transition-colors ${
                  tab === "welcome"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                Overview &amp; Setup
              </button>

              <button
                onClick={() => setTab("live")}
                className={`rounded-lg px-3.5 py-1.5 transition-colors ${
                  tab === "live"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                Live Interview
              </button>

              <button
                onClick={() => setTab("matrix")}
                className={`rounded-lg px-3.5 py-1.5 transition-colors ${
                  tab === "matrix"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                Curriculum Matrix
              </button>

              <button
                onClick={() => setTab("report")}
                className={`rounded-lg px-3.5 py-1.5 transition-colors ${
                  tab === "report"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                Post-Interview Report
              </button>

              <button
                onClick={() => setTab("analytics")}
                className={`rounded-lg px-3.5 py-1.5 text-violet-400 transition-colors ${
                  tab === "analytics"
                    ? "bg-violet-500/20 font-semibold"
                    : "hover:text-violet-300 hover:bg-surface"
                }`}
              >
                Talent Analytics
              </button>

              <button
                onClick={() => setTab("steer")}
                className={`rounded-lg px-3.5 py-1.5 text-amber-400 transition-colors ${
                  tab === "steer"
                    ? "bg-amber-500/20 font-semibold"
                    : "hover:text-amber-300 hover:bg-surface"
                }`}
              >
                Stage 4 Steer
              </button>
            </nav>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              <AuthModal />

              {showSidebar && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="lg:hidden"
                      aria-label="Open sidebar"
                    >
                      <Menu className="size-4" aria-hidden />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    showClose={false}
                    className="flex w-[320px] max-w-[85vw] flex-col bg-sidebar p-0"
                  >
                    <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-4">
                      <SheetTitle className="text-sm font-semibold text-foreground">
                        Candidate Profile
                      </SheetTitle>
                      <SheetClose
                        aria-label="Close sidebar"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-surface hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95"
                      >
                        <X className="size-5" aria-hidden />
                      </SheetClose>
                    </div>
                    <div className="min-h-0 flex-1">
                      <CandidateSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </header>

        {/* Main Application Container */}
        <div>
          {showSidebar && (
            <div className="hidden lg:block fixed top-14 left-0 bottom-0 w-80 z-30 print:hidden">
              <CandidateSidebar />
            </div>
          )}

          <main className={`min-w-0 px-4 py-6 sm:px-8 ${showSidebar ? "lg:ml-80" : ""}`}>
            {tab === "welcome" && (
              <InterviewSetupWizard
                selectedCandidateId={candidateId}
                onSelectCandidate={setCandidateId}
                onStartInterview={handleStartInterview}
                onNavigateTab={(t) =>
                  setTab(t as "welcome" | "live" | "matrix" | "report" | "analytics" | "steer")
                }
              />
            )}

            {tab === "live" && <LiveInterview onEndSession={() => setTab("report")} />}
            {tab === "matrix" && <CurriculumMatrix />}
            {tab === "report" && <PostInterviewReport />}
            {tab === "analytics" && <TalentAnalyticsPortal />}
            {tab === "steer" && <LiveSteerSimulator />}
          </main>
        </div>

        <div className={`print:hidden ${showSidebar ? "lg:ml-80" : ""}`}>
          <SiteFooter
            onNavigate={(t) =>
              setTab(t as "welcome" | "live" | "matrix" | "report" | "analytics" | "steer")
            }
          />
        </div>
      </div>
    </InterviewProvider>
  );
}
