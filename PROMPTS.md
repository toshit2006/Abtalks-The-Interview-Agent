# The Interview Agent - AI Usage Log

**Project Name:** The Interview Agent  
**Problem Statement:** Problem Statement 1 - The Interview Agent  
**Hackathon:** ABTalks Vibe Code Hackathon  
**Tooling Used:** Lovable, Cursor / Codex

---

## Phase 1: Lovable Frontend

### Layout Shell

Lovable was used to scaffold the initial application shell for a polished interview dashboard. The frontend direction focused on a modern, dark, enterprise AI interface with a candidate sidebar, main interview workspace, and responsive navigation between core views.

### Chat UI

The live interview experience was prompted as a conversational interface with distinct AI interviewer and candidate messages, topic tags, typing states, textarea controls, and submit locking while the interview engine processes candidate responses.

### Session Status Bar

The session status bar was generated to make interview progress visible during the assessment. It tracks question count, covered curriculum days, elapsed session time, and interview completion controls so the evaluator can see whether the required coverage is being met.

### Post-Interview Report

Lovable also helped create the first version of the feedback dashboard with score cards, strengths, gaps, curriculum coverage, and export-ready report structure for the final candidate evaluation.

---

## Phase 2: Cursor / Codex Refactor

### Schema Integration

Cursor / Codex was used to align the generated frontend with the official hackathon context files:

- `src/data/curriculum.json`
- `src/data/candidates.json`
- `src/data/technical-spec.md`

The app imports candidate profiles and curriculum modules directly from these local files through `src/lib/curriculum.ts`, so the interview flow is grounded in the provided cohort data rather than static UI placeholders.

### Type Definitions

The data contracts were centralized in `src/types/interview.ts`, which re-exports the implementation types from `src/lib/interview-types.ts`. These definitions cover:

- Candidate profiles and mission history
- Curriculum modules and curriculum days
- Chat messages and interview state
- Planned interview questions and question results
- `POST /api/interview` request and response payloads
- Final structured feedback fields

### Frontend Data Wiring

The UI was refactored to consume the typed local data layer. Candidate details, completed modules, attempted/skipped topics, curriculum day coverage, and final report content are rendered from the same schema used by the backend interview engine.

---

## Phase 3: Backend & API Routes

### Serverless API Implementation

The backend endpoint is implemented at `src/routes/api/interview.ts` as:

```http
POST /api/interview
```

A mirrored public route exists at `src/routes/api/public/interview.ts` for deployed environments that expose API routes under a public path.

### Multi-Turn Conversation Logic

Session state is maintained in `src/lib/interview-session.server.ts` using the provided `sessionId`. The first request initializes a candidate-specific interview plan and returns an opening prompt with `done: false`. Later requests process candidate answers, score the previous response, advance the question pointer, and return the next adaptive follow-up.

### Constraint Enforcement

The core interview engine in `src/lib/interview-engine.ts` enforces the hackathon assessment constraints:

- At least 8 questions
- At least 4 distinct curriculum days
- Questions selected from the candidate's own mission history
- Higher priority for skipped missions and missions with more attempts

### Structured JSON Feedback

When the interview satisfies the completion constraints, the API returns:

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": [],
    "gaps": [],
    "next": []
  }
}
```

Additional scores and per-question results are included to support the frontend report while preserving the required `summary`, `strengths`, `gaps`, and `next` feedback contract.
