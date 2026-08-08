# ABTalks Vibe Code Hackathon - AI Usage Log

**Project Name:** The Interview Agent  
**Problem Statement:** Problem Statement 1 (The Interview Agent)  
**Build Timeline:** August 7 - August 9  
**Primary AI Tools Used:** Lovable, Cursor / Codex

---

## 1. Development Overview & Vibe-Coding Process

This repository was developed using an iterative, prompt-driven AI workflow ("vibe coding") divided into two primary stages:

1. **Frontend Layout & UI Prototyping (Lovable):** Scaffolded the core layout, chat components, progress header, and evaluation dashboard.
2. **Schema Integration, Refactoring & API Engineering (Cursor / Codex):** Fed the official hackathon context files (`curriculum.json`, `candidate_profiles.json`, and `tech_spec.md`) to generate strict TypeScript interfaces, refactor frontend components with live data, and build the required serverless API endpoints.

---

## 2. Phase 1: Frontend UI & Layout Prototype (Lovable)

### Prompt 1.1 - System Layout & Design System Setup

> **Role:** Senior Frontend Engineer & UI/UX Specialist  
> **Prompt:**  
> "Create the main application layout and design system for 'The Interview Agent' hackathon app using Next.js App Router, Tailwind CSS, Lucide React Icons, and Radix UI / Shadcn.  
> - **Theme:** Enterprise AI Dark Mode (slate-900 background, subtle glowing emerald/violet accents, high contrast text).  
> - **Components:**  
>   1. Sidebar / Candidate Profile Drawer displaying candidate details and live progress.  
>   2. Main Workspace container supporting tabs for 'Live Interview', 'Curriculum Matrix', and 'Post-Interview Report'."

### Prompt 1.2 - Conversational Chat Interface & Indicators

> **Role:** AI Chat UI Developer  
> **Prompt:**  
> "Build a real-time conversational chat interface for an AI Interviewer with distinct styling for Agent vs. Candidate messages:  
> - **Agent Messages:** Distinct avatar with a pulsing active ring, Markdown rendering support, and Topic Tag badges (e.g., `[Day 14: RAG Evaluation]`).  
> - **Candidate Input:** High-performance textarea with submit shortcut (`Cmd/Ctrl + Enter`), character counter, and auto-expand behavior.  
> - **States:** Streaming text effects, typing indicator animation (pulsing dots), and submit button locking during processing."

### Prompt 1.3 - Interview Progress Header Component

> **Role:** UI Engineer  
> **Prompt:**  
> "Create a header status panel for the live interview workspace featuring:  
> - Dynamic Question Counter Badge (e.g., Question X of 8+).  
> - Curriculum Topic Distribution Badges (showing assessed topics like Vector DBs, Prompting, RAG).  
> - Live Session Elapsed Timer (`00:12:45`).  
> - End Interview Button with trigger confirmation modal."

### Prompt 1.4 - Post-Interview Feedback & Metrics Dashboard

> **Role:** Data Visualization & UI Specialist  
> **Prompt:**  
> "Build the 'Interview Completion & Feedback Report' view containing:  
> 1. Score Summary Cards (Technical Competency, Conceptual Depth, Communication out of 100).  
> 2. Strengths and Improvement Areas cards with visual accent badges.  
> 3. Curriculum Topic Breakdown table highlighting assessed modules.  
> 4. Export report options."

---

## 3. Phase 2: Spec Alignment, Refactoring & Schema Sync (Cursor / Codex)

### Prompt 2.1 - Context Ingestion & Type Definitions Sync

> **Role:** Lead Full-Stack Engineer  
> **Prompt:**  
> "I have provided the 3 core reference files:  
> - Curriculum JSON  
> - Candidate Profiles JSON  
> - Technical Specification  
>
> Review the existing codebase and perform a refactor pass:  
> 1. Inspect the attached spec files and create strict TypeScript interfaces in `types/interview.ts` for CandidateProfile, CurriculumDay, ChatMessage, InterviewState, and Request/Response API contracts.  
> 2. Refactor all existing frontend components to consume these real TypeScript interfaces.  
> 3. Replace all dummy text/mock placeholders with dynamic rendering from `curriculum.json` and `candidate_profiles.json`."

### Prompt 2.2 - Interview State Management & Logic Rules

> **Role:** Full-Stack Developer  
> **Prompt:**  
> "Refactor the core application logic to satisfy all hackathon rules:  
> - Track interview progress so at least 8 questions covering at least 4 distinct curriculum days are assessed.  
> - Update topic tags and question counter dynamically upon message submission.  
> - Automatically switch to the structured feedback report view when the 8-question / 4-day threshold is satisfied."

---

## 4. Phase 3: Backend API Endpoints & LLM Integration (Cursor / Codex)

### Prompt 3.1 - API Endpoint Route Implementation

> **Role:** Backend AI Engineer  
> **Prompt:**  
> "Implement the backend API endpoints according to the attached Technical Specification:  
> 1. Create HTTP route `POST /api/interview/chat` using Next.js App Router / Vercel AI SDK.  
> 2. Accept candidate profile ID, previous chat history, and current step.  
> 3. Invoke LLM to adaptively generate follow-up questions tailored to candidate answers while enforcing curriculum coverage rules.  
> 4. Create `POST /api/interview/evaluate` to produce final structured JSON feedback matching the required API contract."
