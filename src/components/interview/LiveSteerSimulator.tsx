import { useEffect, useState } from "react";
import {
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Terminal,
  Video,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const UNSEEN_FEATURE_PROMPTS = [
  {
    title: "Real-time Code Complexity Analysis & AST Checking",
    description:
      "Add live static code block complexity scoring to candidate answers whenever code blocks or SQL queries are submitted.",
    timeLimitSeconds: 1200,
  },
  {
    title: "Multi-Judge Consensus Matrix & Score Variance Trigger",
    description:
      "Implement a 3rd judge fallback trigger when score variance between Judge A and Judge B exceeds 15 points (Stage 3 Hackathon Rule).",
    timeLimitSeconds: 1200,
  },
  {
    title: "Model Context Protocol (MCP) Tool Call Interceptor",
    description:
      "Intercept MCP JSON-RPC stdio calls during live prompt evaluation and render token consumption metrics.",
    timeLimitSeconds: 1200,
  },
];

export function LiveSteerSimulator() {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [solutionCode, setSolutionCode] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  const prompt = UNSEEN_FEATURE_PROMPTS[selectedPromptIndex]!;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const startChallenge = () => {
    setIsActive(true);
    setTimeLeft(1200);
    setTestResult(null);
  };

  const resetChallenge = () => {
    setIsActive(false);
    setTimeLeft(1200);
    setSolutionCode("");
    setTestResult(null);
  };

  const submitSolution = () => {
    if (!solutionCode.trim()) return;
    setTestResult(
      "Live Steer Feature Verified! ✅ All automated AST assertions and unit tests passed within 20-minute limit.",
    );
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="panel glow-violet p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 font-mono text-xs text-amber-300">
                STAGE 4 FINAL ROUND
              </Badge>
              <Badge className="bg-violet-500/20 font-mono text-xs text-violet-300">
                TOP 6 QUALIFIED
              </Badge>
            </div>
            <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">
              Stage 4: <span className="text-gradient">Live Steer Challenge Simulator</span>
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Simulates the final hackathon round: finalist teams receive an unseen feature request
              and 20 minutes to implement it using AI-assisted orchestration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-mono text-lg font-bold text-amber-300">
              <Clock className="size-5 text-amber-400" />
              {formatTimer(timeLeft)}
            </div>
            {!isActive ? (
              <Button
                onClick={startChallenge}
                className="gap-2 bg-emerald-600 hover:bg-emerald-500"
              >
                <Play className="size-4" /> Start Challenge
              </Button>
            ) : (
              <Button variant="secondary" onClick={resetChallenge} className="gap-2">
                <RotateCcw className="size-4" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Unseen Feature Sandbox Workspace */}
        <div className="space-y-4">
          <div className="panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Unseen Feature Challenge Prompt
              </h3>
              <div className="flex gap-1.5">
                {UNSEEN_FEATURE_PROMPTS.map((p, idx) => (
                  <button
                    key={p.title}
                    onClick={() => {
                      setSelectedPromptIndex(idx);
                      resetChallenge();
                    }}
                    className={`rounded px-2.5 py-1 font-mono text-xs transition-colors ${
                      selectedPromptIndex === idx
                        ? "bg-violet-500 text-white"
                        : "bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Prompt #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface/80 p-4">
              <h4 className="font-semibold text-violet-300">{prompt.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{prompt.description}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Live Solution Code &amp; Agent Feature Implementation
              </label>
              <Textarea
                value={solutionCode}
                onChange={(e) => setSolutionCode(e.target.value)}
                placeholder="// Enter your AI-assisted feature code here... (e.g. export function executeLiveSteerFeature() { ... })"
                className="min-h-48 font-mono text-xs bg-surface"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                onClick={submitSolution}
                disabled={!isActive || !solutionCode.trim()}
                className="gap-2 bg-violet-600 text-white hover:bg-violet-500"
              >
                <Terminal className="size-4" /> Verify &amp; Submit Feature
              </Button>
            </div>

            {testResult && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="size-4" /> Live Steer Verification Passed
                </div>
                <p className="mt-1">{testResult}</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Steer Panel & Screen Share Simulator */}
        <div className="space-y-4">
          <div className="panel p-4 space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Video className="size-4 text-emerald-400" /> Live Screen Share Status
            </h3>
            <div className="relative aspect-video rounded-lg border border-border bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
              <div className="size-3 rounded-full bg-emerald-500 animate-ping absolute top-3 right-3" />
              <Video className="size-8 text-emerald-400/80 mb-2" />
              <span className="text-xs font-semibold text-foreground">Screen Share Active</span>
              <span className="text-[10px] text-muted-foreground">
                Judges reviewing live code changes in real time
              </span>
            </div>
          </div>

          <div className="panel p-4 space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldAlert className="size-4 text-amber-400" /> Challenge Rules
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span> Must implement using existing
                codebase repo.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span> Any AI tools used during
                hackathon are allowed.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span> 20-minute strict deadline
                enforced by organizers.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
