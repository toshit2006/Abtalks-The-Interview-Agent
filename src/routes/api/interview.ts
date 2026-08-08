import { createFileRoute } from "@tanstack/react-router";
import { handleInterviewTurn } from "@/lib/interview-session.server";
import type { InterviewRequest } from "@/types/interview";

export async function handleInterviewRoute(request: Request) {
  let body: InterviewRequest;
  try {
    body = (await request.json()) as InterviewRequest;
  } catch {
    return Response.json({ reply: "Invalid JSON body.", done: false }, { status: 400 });
  }
  if (!body?.sessionId) {
    return Response.json({ reply: "sessionId is required.", done: false }, { status: 400 });
  }
  try {
    return Response.json(await handleInterviewTurn(body));
  } catch (err) {
    console.error("handleInterviewTurn failed:", err);
    return Response.json(
      { reply: "Could not process that request.", done: false },
      { status: 400 },
    );
  }
}

// Spec endpoint: POST /api/interview (no auth). Mirrored at /api/public/interview
export const Route = createFileRoute("/api/interview")({
  server: {
    handlers: {
      POST: ({ request }) => handleInterviewRoute(request),
    },
  },
});
