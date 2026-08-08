# AI Usage Log — The Interview Agent

## Executive Summary

This document provides a comprehensive log of AI models, system prompts, vector retrieval mechanisms, and orchestration strategies utilized in building and operating **The Interview Agent**.

---

## 1. AI Infrastructure & Models

| Component            | Technology / Model                               | Purpose                                                                                                     | Fallback Mechanism                                                     |
| :------------------- | :----------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **Primary LLM**      | Groq API (`llama-3.3-70b-versatile`)             | Real-time answer grading, adaptive follow-up phrasing, dynamic opening lines, and report summary synthesis. | Deterministic heuristic scoring engine (`src/lib/interview-engine.ts`) |
| **Vector DB (RAG)**  | Qdrant Vector Cloud (`Cosine` similarity)        | Context storage & semantic retrieval of curriculum objectives and prior candidate answers across turns.     | Memory-local transcript & candidate profile matching                   |
| **Embedding Engine** | Local Normalized Float32 N-gram Vectorizer (64D) | High-speed, zero-dependency text embedding generation for Qdrant payload indexing.                          | Standard text matching                                                 |

---

## 2. Agent Prompts & System Instructions

### 2.1 Answer Grading System Prompt (`src/lib/ai.ts` -> `scoreAnswerWithAI`)

- **Role:** Senior technical interviewer grading individual responses against curriculum learning objectives.
- **Criteria:** Assesses technical depth, specific trade-offs, precision, and accuracy rather than response length.
- **Output:** JSON schema `{"score": 0-100, "status": "completed" | "attempted", "feedback": "..."}`.

### 2.2 Adaptive Transition System Prompt (`src/lib/ai.ts` -> `writeTransitionWithAI`)

- **Role:** Warm yet rigorous senior technical interviewer leading a live, spoken-style interview.
- **Context Injection:** Ingests previous answer score, grader feedback, relevant Qdrant vector retrieval context, and past 4-turn transcript.
- **Behavior:** If the candidate's last answer was vague or incomplete, generates a targeted follow-up remark addressing that specific gap before transitioning to the next curriculum topic.

### 2.3 Opening Generator (`src/lib/ai.ts` -> `writeOpeningWithAI`)

- **Role:** Senior technical interviewer opening the session.
- **Behavior:** Personalizes the greeting using the candidate's profile, role, and cohort mission data, framing expectations for an 8-question adaptive interview.

### 2.4 Final Report Summary Synthesis (`src/lib/ai.ts` -> `writeFinalSummaryWithAI`)

- **Role:** Executive interviewer writing the qualitative summary for the candidate's post-interview feedback report.
- **Behavior:** Synthesizes overall performance, conceptual depth, communication scores, and per-question findings into an evidence-based narrative paragraph.

---

## 3. Development Activity & Prompt Log

- **Phase 1: Architecture & Data Pipeline (Days 1–5)**
  - Prompts used for structuring `curriculum.json` and `candidates.json` synthetic datasets.
  - Implemented core interview state machine ensuring $\ge 8$ questions spanning $\ge 4$ distinct curriculum days.

- **Phase 2: RAG & Vector Memory Integration (Days 6–15)**
  - Integrated Qdrant REST client for vector collection initialization (`interview_curriculum` and `candidate_answers`).
  - Configured semantic similarity retrieval to connect previous candidate answers with upcoming questions.

- **Phase 3: Real-Time Engine & API Endpoint (Days 16–25)**
  - Built spec-compliant HTTP endpoints (`POST /api/interview` and `POST /api/public/interview`).
  - Wired Groq LLM inference pipeline with automatic fallback to heuristic engine if API key is absent or rate-limited.

- **Phase 4: Dashboard UI & Final Polish (Days 26–31)**
  - Designed modern dark-mode console with candidate profile drawer, live transcript feed, depth hints, typing indicators, curriculum matrix, and post-interview report with JSON/PDF export.

---

## 4. Verification & Testing

- Automated test script `src/lib/test-interview.ts` validates multi-turn flow, required question counts, distinct day coverage, context retention, and report generation. All automated tests pass cleanly.
