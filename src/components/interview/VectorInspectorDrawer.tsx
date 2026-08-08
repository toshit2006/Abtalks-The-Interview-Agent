import { useState } from "react";
import { Database, Search, Sparkles, Layers, Cpu, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { generateTextEmbedding } from "@/lib/qdrant";
import type { InterviewQuestion, QuestionResult } from "@/types/interview";

interface Props {
  currentQuestion: InterviewQuestion | null;
  results: QuestionResult[];
}

export function VectorInspectorDrawer({ currentQuestion, results }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const sampleVector = generateTextEmbedding(
    searchQuery || currentQuestion?.prompt || "Retrieval Augmented Generation with Vector Database",
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-violet-500/30 bg-violet-500/10 text-xs text-violet-300 hover:border-violet-500/60 hover:bg-violet-500/20"
        >
          <Layers className="size-3.5 text-violet-400" />
          RAG Vector Inspector
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[480px] max-w-[92vw] overflow-y-auto border-border bg-sidebar/95 p-6 backdrop-blur-xl"
      >
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-violet-500/20 font-mono text-[10px] text-violet-300">
              QDRANT VECTOR ENGINE
            </Badge>
            <Badge className="bg-emerald-500/20 font-mono text-[10px] text-emerald-300">
              COSINE DISTANCE
            </Badge>
          </div>
          <SheetTitle className="text-lg font-bold text-foreground">
            RAG Memory &amp; Vector Context
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Inspect real-time vector embeddings (64-dimensional float space) and semantic retrieval
            payloads indexed during the interview.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-5">
          {/* Embedding Simulator */}
          <section className="panel space-y-3 p-4">
            <h4 className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-violet-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="size-4" /> Embedding Generator
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                64-Dim Float Vector
              </span>
            </h4>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Test query embedding vector generation..."
                className="w-full rounded-md border border-border bg-surface pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
              />
            </div>
            <div className="grid grid-cols-8 gap-1 rounded-md bg-surface p-2.5">
              {sampleVector.slice(0, 32).map((val, idx) => {
                const opacity = Math.max(0.2, Math.abs(val) * 3);
                return (
                  <div
                    key={idx}
                    title={`Dim ${idx}: ${val}`}
                    style={{ opacity }}
                    className="h-3.5 rounded-sm bg-violet-500 transition-opacity"
                  />
                );
              })}
            </div>
          </section>

          {/* Current Active Turn Vector Context */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Question RAG Payload
            </h4>
            {currentQuestion ? (
              <div className="panel space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-violet-400">
                    Topic: Day {currentQuestion.day}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {currentQuestion.module}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-foreground/90">
                  {currentQuestion.objective}
                </p>
                <div className="rounded bg-surface p-2 font-mono text-[11px] text-muted-foreground">
                  Payload ID: <span className="text-foreground">ia-q-{currentQuestion.id}</span>
                  <br />
                  Target Objective Vector indexed into Qdrant collection `interview_curriculum`
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No active question payload.</p>
            )}
          </section>

          {/* Past Evaluated Vector Payload History */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Indexed Candidate Answer Payloads
              </h4>
              <span className="font-mono text-[11px] text-emerald-400">
                {results.length} vectors stored
              </span>
            </div>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={r.questionId} className="panel p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-emerald-400">
                      Day {r.day} · {r.dayTitle}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      Score: {r.score}/100
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{r.answer}</p>
                  <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <CheckCircle2 className="size-3 text-emerald-400" />
                    Indexed into `candidate_answers` vector memory
                  </div>
                </div>
              ))}
              {!results.length && (
                <p className="p-3 text-xs text-muted-foreground">
                  Candidate answer vectors will appear here as the interview progresses.
                </p>
              )}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
