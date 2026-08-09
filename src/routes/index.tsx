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
  Radio,
  Grid,
  FileText,
  BarChart3,
  Sparkles,
  User,
  ChevronRight,
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleStartInterview = () => {
    setTab("live");
  };

  const showSidebar = tab === "live" || tab === "matrix" || tab === "report";

  const navItems = [
    { id: "welcome", label: "Overview & Setup", icon: LayoutDashboard },
    { id: "live", label: "Live Interview", icon: Radio },
    { id: "matrix", label: "Curriculum Matrix", icon: Grid },
    { id: "report", label: "Post-Interview Report", icon: FileText },
    { id: "analytics", label: "Talent Analytics", icon: BarChart3, color: "text-violet-400" },
    { id: "steer", label: "Stage 4 Steer", icon: Cpu, color: "text-amber-400" },
  ] as const;

  return (
    <InterviewProvider key={candidateId} candidateId={candidateId}>
      <div className="relative min-h-screen text-foreground overflow-x-hidden pt-14">
        {/* Animated Dynamic Neural Light Orbs & Particles */}
        <LiveBackgroundCanvas />
        {/* AB Talks Official Top Navbar */}
        <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-indigo-500/20 bg-slate-950/95 backdrop-blur-xl print:hidden">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Navigation Drawer Trigger (< md screens) */}
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-foreground hover:bg-surface cursor-pointer size-9"
                    aria-label="Open Navigation Menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="top"
                  className="bg-slate-950/98 border-b border-indigo-500/30 p-5 text-foreground"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-8 place-items-center rounded-lg bg-indigo-600 font-display font-extrabold text-xs text-white">
                        AB
                      </div>
                      <span className="font-display text-sm font-bold text-foreground">
                        AB Talks <span className="text-xs text-indigo-400 font-normal">Navigation</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2 font-medium text-sm">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = tab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setTab(item.id as any);
                            setMobileNavOpen(false);
                          }}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                            isActive
                              ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20"
                              : "bg-surface/80 text-muted-foreground hover:text-foreground hover:bg-surface"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className={`size-4 ${item.color ?? ""}`} />
                            {item.label}
                          </span>
                          <ChevronRight className="size-4 opacity-60" />
                        </button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>

              <button
                onClick={() => setTab("welcome")}
                className="flex items-center gap-2 text-left transition-opacity hover:opacity-90"
              >
                <div className="grid size-8 sm:size-9 place-items-center rounded-xl bg-indigo-600 text-white font-display font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-500/20">
                  AB
                </div>
                <div>
                  <h1 className="font-display text-xs sm:text-base font-bold text-foreground leading-none flex items-center gap-1 sm:gap-2">
                    AB Talks{" "}
                    <span className="text-[10px] sm:text-xs font-normal text-indigo-400 hidden xs:inline">
                      | AI Cohort
                    </span>
                  </h1>
                  <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                    The Interview Agent
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop Navbar Navigation Links (>= md screens) */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 font-medium text-xs">
              {navItems.map((item) => {
                const isActive = tab === item.id;
                let activeClass = "bg-indigo-600 text-white font-semibold shadow-sm";
                if (item.id === "analytics") {
                  activeClass = "bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/40";
                } else if (item.id === "steer") {
                  activeClass = "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40";
                }

                let inactiveClass = "text-muted-foreground hover:text-foreground hover:bg-surface";
                if (item.id === "analytics") inactiveClass = "text-violet-400 hover:text-violet-300 hover:bg-surface";
                if (item.id === "steer") inactiveClass = "text-amber-400 hover:text-amber-300 hover:bg-surface";

                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as any)}
                    className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
                      isActive ? activeClass : inactiveClass
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <AuthModal />

              {showSidebar && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden gap-1.5 h-8 font-mono text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20 cursor-pointer"
                      aria-label="Open Candidate Profile"
                    >
                      <User className="size-3.5" /> <span className="hidden sm:inline">Profile</span>
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
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-surface hover:text-primary active:scale-95"
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
