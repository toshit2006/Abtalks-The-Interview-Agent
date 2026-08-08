import { createFileRoute } from "@tanstack/react-router";
import { handleInterviewTurn } from "@/lib/interview-session.server";
import type { InterviewRequest } from "@/types/interview";

export const Route = createFileRoute("/api/public/interview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: InterviewRequest;
        try {
          body = (await request.json()) as InterviewRequest;
        } catch {
          return Response.json({ reply: "Invalid JSON body.", done: false }, { status: 400 });
        }
        if (!body?.sessionId) {
          return Response.json({ reply: "sessionId is required.", done: false }, { status: 400 });
        }
        return Response.json(await handleInterviewTurn(body));
      },
    },
  },
});
