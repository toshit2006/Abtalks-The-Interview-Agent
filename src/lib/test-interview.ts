import { handleInterviewTurn } from "@/lib/interview-session.server";
import candidateData from "@/data/candidates.json";
import type { CandidateProfile } from "@/types/interview";

async function runTest() {
  console.log("Starting Interview Agent test...");
  const candidate = candidateData.candidates[0] as unknown as CandidateProfile;
  if (!candidate) throw new Error("Candidate profile required");

  const sessionId = "test-session-" + Date.now();

  // 1. Initialize interview
  const initRes = await handleInterviewTurn({
    sessionId,
    candidate,
  });

  console.log("Initial response:", initRes.reply);
  if (initRes.done !== false) throw new Error("Interview should not be done after start");
  if (!initRes.reply) throw new Error("Reply must be non-empty string");

  // 2. Conduct 8 turns
  let lastRes = initRes;
  const mockAnswers = [
    "I built a vector index using Qdrant with cosine similarity. We tuned chunk size to 512 tokens and implemented metadata filtering to improve retrieval accuracy by 25%.",
    "For prompt engineering, we structured system prompts with clear constraints, few-shot examples, and JSON schema validation to guarantee reliable output formatting.",
    "We implemented multi-agent orchestration using LangChain with specialized agents for planning, tools, and evaluation, handling state transitions gracefully.",
    "Model Context Protocol (MCP) was integrated by implementing custom tools with JSON RPC over stdio for local tool execution.",
    "For streaming responses, we used Server-Sent Events (SSE) connected to Groq's fast inference endpoint for low-latency feedback.",
    "For RAG evaluation, we measured context precision and recall using Ragas framework and added semantic caching.",
    "We containerized our backend using Docker and deployed to Kubernetes with horizontal pod autoscaling based on CPU and request queues.",
    "For capstone demo, we integrated tracing with OpenTelemetry and added Prometheus metrics for token usage and latency.",
  ];

  for (let i = 0; i < 8; i++) {
    const answer =
      mockAnswers[i] || "I used standard practices with proper monitoring and fallback mechanisms.";
    console.log(`\nTurn ${i + 1} - Sending answer: "${answer.slice(0, 50)}..."`);
    lastRes = await handleInterviewTurn({
      sessionId,
      message: answer,
    });
    console.log(`Turn ${i + 1} Reply: "${lastRes.reply.slice(0, 70)}..." | Done: ${lastRes.done}`);
  }

  // 3. Verify final completion response
  if (!lastRes.done) throw new Error("Interview must be completed after 8 turns");
  if (!lastRes.feedback) throw new Error("Final response must include feedback");
  if (typeof lastRes.feedback.summary !== "string")
    throw new Error("Feedback must include summary string");
  if (!Array.isArray(lastRes.feedback.strengths) || lastRes.feedback.strengths.length === 0)
    throw new Error("Feedback must include strengths array");
  if (!Array.isArray(lastRes.feedback.gaps)) throw new Error("Feedback must include gaps array");
  if (!Array.isArray(lastRes.feedback.next) || lastRes.feedback.next.length === 0)
    throw new Error("Feedback must include next steps array");

  console.log("\n=== FINAL FEEDBACK REPORT ===");
  console.log("Summary:", lastRes.feedback.summary);
  console.log("Strengths:", lastRes.feedback.strengths);
  console.log("Gaps:", lastRes.feedback.gaps);
  console.log("Next Steps:", lastRes.feedback.next);
  console.log("\nALL TESTS PASSED SUCCESSFULLY! ✅");
}

runTest().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
