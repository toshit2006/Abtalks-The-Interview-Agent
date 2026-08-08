# 🛠️ Human Vibe Coding & AI Prompt Engineering Log — The Interview Agent

> **Developer Note:** This log documents the real, iterative "vibe coding" journey during the ABTalks AI Cohort Hackathon. It maps every developer prompt, architectural decision, debugging cycle, and system instruction directly to git commit milestones.

---

## 🚀 Chronological Vibe Coding Trajectory

### 🎯 Milestone 1: Setting up the Core Infrastructure & Synthetic Cohort Datasets
- **Commits:** [`b44fbe4`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/b44fbe4) · [`e3f723a`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/e3f723a)
- **Developer Focus:** "I need to get the whole 31-day curriculum into structured JSON and mock out 5 realistic candidate profiles with their exact cohort mission stats."

#### 💬 Developer Prompt to AI
> *"Hey, take the ABTalks 31-day AI cohort syllabus (RAG, Vector DBs, MCP, Groq, Docker, Observability) and convert it into a clean `curriculum.json` file grouped by Modules 1 to 8. Then build candidate profile data (`candidates.json`) with completed vs skipped missions, commit streaks, and first-try pass rates."*

#### 💡 Architectural Code Created
- [`src/data/curriculum.json`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/data/curriculum.json) — 31 structured curriculum days with objectives & tools.
- [`src/data/candidates.json`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/data/candidates.json) — Sarah Johnson, Alex Turner, Emily Chen, David Miller, Tyler Brooks.
- [`src/lib/interview-engine.ts`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/lib/interview-engine.ts) — Implemented `buildQuestionPlan` to strictly enforce $\ge 8$ questions spanning $\ge 4$ curriculum days based on candidate weaknesses.

---

### 🧠 Milestone 2: Building the Dynamic Interview State Engine & LLM Evaluator
- **Commits:** [`6864e99`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/6864e99) · [`600ec1b`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/600ec1b)
- **Developer Focus:** "The LLM grader must grade technical depth, trade-offs, and failure modes — not response length. If a candidate dodges the question, flag it!"

#### 💬 Developer Prompt for LLM Answer Evaluation Schema (`src/lib/ai.ts` -> `scoreAnswerWithAI`)
> *"Craft a system prompt for Groq Llama-3.3-70B that acts as a rigorous FAANG-level interviewer. It must grade candidate spoken answers against learning objectives and return strict JSON with numerical depth scores (0-100), pass/attempt status, and a one-sentence critique highlighting trade-offs or missing details."*

#### 📝 System Prompt Injected in Production Engine
```
You are a senior technical interviewer grading a candidate's spoken answer during a live technical interview.
Grade the answer strictly against the target curriculum learning objective.
Evaluate technical depth, specific trade-offs, precision, and accuracy — NOT response length or fluff.
Output ONLY valid JSON matching this schema:
{
  "score": <number 0-100>,
  "status": "<'completed' if score >= 70, else 'attempted'>",
  "feedback": "<one crisp sentence explaining why this score was awarded and what was good or missing>"
}
```

#### 🛠️ Real-World Debugging & Vibe Refinement: Fixing Unattended Interviews
> *"Wait, when I test ending the interview early without answering any questions, the old code generated a fake 92/100 score! Fix this so that if 0 live questions were answered, it returns zero scores (`0/100`), an 'Unassessed Session' status banner, and prompts the user to launch a live session."*
- **Fix Implemented:** Updated `buildFinalEvaluation` in `interview-engine.ts` and `PostInterviewReport.tsx` to handle 0-answer sessions cleanly without hallucinating false feedback.

---

### ⚡ Milestone 3: Spoken-Style Follow-Ups & Vector Memory Retrieval (RAG)
- **Commits:** [`e9c7554`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/e9c7554) · [`cb1d5f4`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/cb1d5f4)
- **Developer Focus:** "I want the interview to feel like a real conversation, not a quiz. If the candidate gave a weak answer on Day 12, the interviewer should call it out before asking the next question!"

#### 💬 Developer Prompt for Spoken-Style Adaptive Transition (`src/lib/ai.ts` -> `writeTransitionWithAI`)
```
You are a warm but rigorous senior technical interviewer conducting a live, spoken-style interview.
Write ONLY the interviewer's next message — no labels, no markdown, no meta-commentary.
If the candidate's last answer was thin, vague, or dodged specifics, open with a short, pointed follow-up remark about THAT answer (one sentence) before moving on.
If it was strong, briefly acknowledge the specific thing they got right (one sentence) before moving on.
Then ask the next question in your own words — keep the same technical intent as the provided question, but phrase it naturally and conversationally, referencing the candidate's day/topic.
Keep the whole message under 60 words. No greetings.
```

#### 🔍 Qdrant Cloud Vector RAG Indexing Strategy (`src/lib/qdrant.ts`)
> *"Set up a Qdrant vector memory pipeline with Cosine similarity retrieval over 64D normalized embeddings. Index all 31 curriculum objectives so that as the candidate answers questions, relevant past answer vectors are retrieved and fed directly into the system prompt context for instant cross-question reasoning."*

---

### 🎨 Milestone 4: UI/UX Vibe Overhaul — Glassmorphism, Floating Light Orbs & Live Canvas
- **Commits:** [`937eef7`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/937eef7) · [`f0c7846`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/f0c7846)
- **Developer Focus:** "Make the UI look hyper-futuristic like Claude/Vercel with dynamic canvas motion, custom scrollbars, and interactive drawers."

#### 💬 Developer Prompts for UI Enhancements
1. **Live Neural Particle Canvas:**
   > *"Add a canvas background component with 3 ambient keyframe-animated light orbs (cyan, indigo, violet) and an HTML5 45-particle neural network connection mesh (`LiveBackgroundCanvas.tsx`)."*
2. **Interactive Curriculum Matrix Workspace:**
   > *"Redesign the Curriculum Matrix (`CurriculumMatrix.tsx`) into a command center with search bar, status filter pills, module tab selectors (Modules 1 to 8 with distinct color themes), candidate mastery progress ring, and interactive Day Deep Dive detail dialogs."*
3. **Telemetry & Inspection Drawers:**
   > *"Build interactive slide-out drawers for Knowledge Graph visualization (`KnowledgeGraphDrawer.tsx`) and Vector Memory Inspection (`VectorInspectorDrawer.tsx`)."*
4. **Sidebar & Footer Overflow Fix:**
   > *"The candidate sidebar list is getting too long on smaller screens. Constrain the candidate missions list to `max-h-60 overflow-y-auto scrollbar-thin` and restrict the SessionStatusBar strictly to the live interview page so it never overlaps the footer."*

---

### 🛡️ Milestone 5: Production Deployment, Stage 4 Steer Simulator & Test Verification
- **Commits:** [`6081ad4`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/6081ad4) · [`3b9f786`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/3b9f786) · [`cedb571`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/cedb571)
- **Developer Focus:** "Ensure 100% test pass rate, add Stage 4 steer challenge simulator, and deploy to Vercel production."

#### 💬 Developer Directive for Final Polish
> *"Build a `LiveSteerSimulator` tab for the Stage 4 hackathon final round so we can test 20-minute unseen feature requests live. Add an automated test runner script `src/lib/test-interview.ts` to verify full 8-question turn loops, scoring, and report generation."*

#### 🧪 Empirical Test & Verification Log
```bash
$ npx tsx src/lib/test-interview.ts
Starting Interview Agent test...
Turn 1 to 8 completed cleanly.
=== FINAL FEEDBACK REPORT ===
Overall: 50/100 | Conceptual Depth: 48/100 | Communication: 52/100
ALL TESTS PASSED SUCCESSFULLY! ✅

$ npm run lint
0 errors (7 fast refresh warnings)

$ npx tsc --noEmit
0 type errors

$ npm run build
Built serverless bundle in 6.92s!
```

---

## 🏆 Summary of Human-in-the-Loop Engineering

This project was built through **intense human vibe-coding** — directing AI models, refining system prompts based on live test outputs, fixing edge cases (like 0-answer sessions), crafting custom CSS glassmorphism, and building custom canvas visualizers to deliver a top-tier hackathon submission!
