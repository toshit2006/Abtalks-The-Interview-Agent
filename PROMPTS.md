# 🤖 AI Prompt Trajectory & Agent Engineering Log — The Interview Agent

## Executive Summary

This document provides a sequential, commit-mapped record of all AI system prompts, developer prompts, LLM evaluation schemas, dynamic transition instructions, and RAG vector memory retrieval context used throughout the development of **The Interview Agent**.

---

## 📅 Sequential Prompt Trajectory (Mapped to Commit History)

### Phase 1: Foundation & Data Architecture
- **Commits:** [`b44fbe4`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/b44fbe4) · [`e3f723a`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/e3f723a)
- **Objective:** Data modeling for the 31-day AI Cohort curriculum and candidate mission profiles.

#### 1.1 Dataset Structuring Prompt
> *"Structure the complete 31-day AI Cohort curriculum into a JSON dataset with day numbers (1–31), titles, module groupings (Modules 1–8), learning objectives, and enterprise AI tools used."*
- **Output:** [`src/data/curriculum.json`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/data/curriculum.json)

#### 1.2 Candidate Signal Profile Prompt
> *"Generate candidate profiles representing cohort participants (Sarah Johnson, Alex Turner, Emily Chen, David Miller, Tyler Brooks) with completed missions, commit days, years of experience, skipped topics, and first-try clearance rates."*
- **Output:** [`src/data/candidates.json`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/data/candidates.json)

#### 1.3 State Machine Requirement Directive
> *"Implement an interview planning function (`buildQuestionPlan`) that guarantees a minimum of 8 questions spanning at least 4 distinct curriculum days based on candidate weak points."*
- **Output:** [`src/lib/interview-engine.ts`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/lib/interview-engine.ts)

---

### Phase 2: Core Interview Engine & LLM Grader Schemas
- **Commits:** [`6864e99`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/6864e99) · [`600ec1b`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/600ec1b)
- **Objective:** Real-time answer evaluation, scoring heuristics, and unattended session state handling.

#### 2.1 Technical Answer Grader System Prompt
- **Target Function:** `scoreAnswerWithAI` ([`src/lib/ai.ts`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/lib/ai.ts#L21))
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

#### 2.2 Unattended Session Evaluation Safeguard Prompt
- **Target Function:** `buildFinalEvaluation` ([`src/lib/interview-engine.ts`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/lib/interview-engine.ts#L148))
> *"If an interview session ends with 0 live questions answered (`results.length === 0`), return zero scores (`overall: 0, conceptualDepth: 0, communication: 0`) and an unassessed summary instead of synthetic baseline scores."*

---

### Phase 3: Adaptive Transition & RAG Vector Memory Integration
- **Commits:** [`e9c7554`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/e9c7554) · [`cb1d5f4`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/cb1d5f4)
- **Objective:** Context-aware dynamic follow-up generation and vector retrieval via Qdrant Cloud.

#### 3.1 Spoken-Style Adaptive Transition System Prompt
- **Target Function:** `writeTransitionWithAI` ([`src/lib/ai.ts`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/lib/ai.ts#L84))
```
You are a warm but rigorous senior technical interviewer conducting a live, spoken-style interview.
Write ONLY the interviewer's next message — no labels, no markdown, no meta-commentary.
If the candidate's last answer was thin, vague, or dodged specifics, open with a short, pointed follow-up remark about THAT answer (one sentence) before moving on.
If it was strong, briefly acknowledge the specific thing they got right (one sentence) before moving on.
Then ask the next question in your own words — keep the same technical intent as the provided question, but phrase it naturally and conversationally, referencing the candidate's day/topic.
Keep the whole message under 60 words. No greetings.
```

#### 3.2 Qdrant Vector Retrieval Prompt Schema
- **Target Component:** `qdrant.ts` ([`src/lib/qdrant.ts`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/lib/qdrant.ts))
```json
{
  "collection": "interview_curriculum",
  "vector_dimensions": 64,
  "distance_metric": "Cosine",
  "payload_format": {
    "day": "number",
    "dayTitle": "string",
    "module": "string",
    "objectives": "string[]",
    "content": "string"
  },
  "search_threshold": 0.45,
  "top_k": 3
}
```

---

### Phase 4: UI/UX Aesthetic Overhaul & Layout Polish
- **Commits:** [`937eef7`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/937eef7) · [`f0c7846`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/f0c7846)
- **Objective:** Modern Claude/Vercel-inspired glassmorphism, responsive scrollbars, and telemetry drawers.

#### 4.1 Ambient Light Orbs & Particle Canvas Prompt
> *"Create a LiveBackgroundCanvas component with 3 keyframe-animated floating light orbs and an HTML5 45-particle neural network mesh canvas to elevate the application's aesthetic."*
- **Output:** [`LiveBackgroundCanvas.tsx`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/components/layout/LiveBackgroundCanvas.tsx)

#### 4.2 Curriculum Matrix Workspace Redesign Prompt
> *"Redesign the Curriculum Matrix into an executive workspace featuring search input, status filter pills, module tab selectors (Modules 1–8 with distinct color themes), mastery progress ring, and Day Deep Dive detail dialogs."*
- **Output:** [`CurriculumMatrix.tsx`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/components/interview/CurriculumMatrix.tsx)

#### 4.3 Sidebar Scroll Container Layout Prompt
> *"Constrain the candidate missions list in CandidateSidebar to a fixed-height container (`max-h-60 overflow-y-auto scrollbar-thin`) and restrict SessionStatusBar strictly to the live interview tab so it never overlaps the footer."*
- **Output:** [`CandidateSidebar.tsx`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/components/interview/CandidateSidebar.tsx) & [`src/routes/index.tsx`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/routes/index.tsx)

---

### Phase 5: Stage 4 Steer Challenge & Verification Audit
- **Commits:** [`6081ad4`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/6081ad4) · [`3b9f786`](https://github.com/toshit2006/Abtalks-The-Interview-Agent/commit/3b9f786)
- **Objective:** Final evaluation readiness, automated verification test suite, and Vercel configuration.

#### 5.1 Stage 4 Steer Challenge Simulator Prompt
> *"Build a LiveSteerSimulator component allowing 20-minute unseen feature request testing with dynamic prompt steering controls."*
- **Output:** [`LiveSteerSimulator.tsx`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/components/interview/LiveSteerSimulator.tsx)

#### 5.2 Executive Feedback Report Summary Prompt
- **Target Function:** `writeFinalSummaryWithAI` ([`src/lib/ai.ts`](file:///c:/Users/gupta/Downloads/Abtalks-The-Interview-Agent-main/Abtalks-The-Interview-Agent-main/src/lib/ai.ts#L144))
```
You are a senior technical interviewer writing the summary paragraph of a structured feedback report.
Write ONLY the summary paragraph, 2-4 sentences, no markdown, no headers.
Be specific and evidence-based — reference actual topics from the results, not generic praise.
```

---

## 🎯 Verification Log

- **Automated Integration Test:** `npx tsx src/lib/test-interview.ts` — **100% Passed**
- **Linter Check:** `npm run lint` — **0 errors**
- **TypeScript Type Safety:** `npx tsc --noEmit` — **0 errors**
- **Production Build:** `npm run build` — **0 errors**
