# Interview Assistant Dashboard

> _Role:_ Senior Frontend Engineer & UI/UX Specialist.

> _Task:_ Create the main application layout and design system for "The Interview Agent" hackathon app.

> _Tech Stack:_ TanStack Start, Tailwind CSS, Lucide React Icons, Radix UI / Shadcn.

> _UI Style:_ Modern Dark Mode, Enterprise AI aesthetic (slate-900 background, subtle glowing emerald/violet borders, high contrast text, sharp typography).

> _Deliverable:_

> Create a sleek dashboard layout with two primary zones:

> 1. _Sidebar / Candidate Profile Drawer:_ Displays candidate name, completed modules, attempted vs skipped topics, and an live interview progress bar (0/8 required questions).

> 2. _Main Workspace:_ A responsive container that switches smoothly between three tabs: "Live Interview", "Curriculum Matrix", and "Post-Interview Report".

> Make sure it's clean, accessible, and responsive. Use CSS variables for theme colors.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e2b83d4d-95dc-4d4f-a718-8cd33b695232).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## AI-powered interviewing (optional)

Copy `.env.example` to `.env` and set `GROQ_API_KEY` to have the agent
use Groq API for:

- grading each answer against the curriculum objective it's tied to,
- writing the next question/follow-up in reaction to what the candidate
  actually said (real adaptive interviewing, not templated phrasing), and
- writing the final report's summary paragraph.

Additionally, set `QDRANT_URL` for vector similarity RAG memory retrieval across curriculum topics and candidate answers.

Without a key, the app still works fully offline: `src/lib/interview-engine.ts`
provides a deterministic heuristic scorer and templated question phrasing so
the whole flow (8+ questions, 4+ curriculum days, structured feedback) runs
without any external calls. See `src/lib/ai.ts` for the integration and its
fallback contract.
