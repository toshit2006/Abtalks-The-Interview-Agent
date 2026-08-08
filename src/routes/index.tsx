import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CandidateSidebar } from "@/components/interview/CandidateSidebar";
import { SessionStatusBar } from "@/components/interview/SessionStatusBar";
import { LiveInterview } from "@/components/interview/LiveInterview";
import { CurriculumMatrix } from "@/components/interview/CurriculumMatrix";
import { PostInterviewReport } from "@/components/interview/PostInterviewReport";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { candidates } from "@/lib/curriculum";
import { InterviewProvider } from "@/lib/use-interview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Interview Agent — Live Technical Interview Console" },
      {
        name: "description",
        content:
          "Run AI-led technical interviews with live progress tracking, curriculum coverage, and an automated post-interview report.",
      },
      { property: "og:title", content: "The Interview Agent — Live Interview Console" },
      {
        property: "og:description",
        content:
          "Live interview, curriculum matrix, and post-interview scoring in one dark-mode workspace.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [tab, setTab] = useState("live");
  const [candidateId, setCandidateId] = useState(candidates[0]?.member.id ?? "");
  return (
    <InterviewProvider key={candidateId} candidateId={candidateId}>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <div className="hidden lg:sticky lg:top-0 lg:block lg:h-screen">
            <CandidateSidebar />
          </div>

          <main className="min-w-0 px-4 py-5 sm:px-8 sm:py-8">
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Session console
                </p>
                <h1 className="truncate font-display text-xl font-bold sm:text-2xl">
                  The <span className="text-gradient">Interview Agent</span>
                </h1>
              </div>

              <label className="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground sm:flex">
                <span className="whitespace-nowrap">Candidate</span>
                <select
                  value={candidateId}
                  onChange={(event) => {
                    setCandidateId(event.target.value);
                    setTab("live");
                  }}
                  className="max-w-52 rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                  aria-label="Select candidate profile"
                >
                  {candidates.map((candidate) => (
                    <option key={candidate.member.id} value={candidate.member.id}>
                      {candidate.member.name} — {candidate.member.jobRole}
                    </option>
                  ))}
                </select>
              </label>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open candidate profile"
                  >
                    <Menu className="size-4" aria-hidden />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] max-w-[85vw] bg-sidebar p-0">
                  <SheetTitle className="sr-only">Candidate profile</SheetTitle>
                  <CandidateSidebar />
                </SheetContent>
              </Sheet>
            </header>

            <div className="mt-6">
              <SessionStatusBar onEnd={() => setTab("report")} />
            </div>

            <Tabs value={tab} onValueChange={setTab} className="mt-5">
              <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg bg-surface p-1 sm:w-auto">
                <TabsTrigger
                  value="live"
                  className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-surface-raised data-[state=active]:text-primary"
                >
                  Live Interview
                </TabsTrigger>
                <TabsTrigger
                  value="matrix"
                  className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-surface-raised data-[state=active]:text-primary"
                >
                  Curriculum Matrix
                </TabsTrigger>
                <TabsTrigger
                  value="report"
                  className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-surface-raised data-[state=active]:text-primary"
                >
                  Post-Interview Report
                </TabsTrigger>
              </TabsList>

              <div className="mt-5">
                <TabsContent
                  value="live"
                  className="duration-300 animate-in fade-in-0 slide-in-from-bottom-2"
                >
                  <LiveInterview />
                </TabsContent>
                <TabsContent
                  value="matrix"
                  className="duration-300 animate-in fade-in-0 slide-in-from-bottom-2"
                >
                  <CurriculumMatrix />
                </TabsContent>
                <TabsContent
                  value="report"
                  className="duration-300 animate-in fade-in-0 slide-in-from-bottom-2"
                >
                  <PostInterviewReport />
                </TabsContent>
              </div>
            </Tabs>
          </main>
        </div>

        <SiteFooter onNavigate={setTab} />
      </div>
    </InterviewProvider>
  );
}
