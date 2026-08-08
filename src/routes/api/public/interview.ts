import { createFileRoute } from "@tanstack/react-router";
import { handleInterviewRoute } from "../interview";

export const Route = createFileRoute("/api/public/interview")({
  server: {
    handlers: {
      POST: ({ request }) => handleInterviewRoute(request),
    },
  },
});
