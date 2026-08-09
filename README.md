# 🤖 The Interview Agent — AB Talks AI Engineering Cohort

> **Official Live Production Deployment:** 🚀 [https://abtalks-the-interview-agent.vercel.app/](https://abtalks-the-interview-agent.vercel.app/)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://abtalks-the-interview-agent.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack](https://img.shields.io/badge/TanStack-Start-FF4154?style=for-the-badge&logo=react&logoColor=white)](https://tanstack.com/)
[![Groq](https://img.shields.io/badge/Groq_LLM-Llama_3.3_70B-F05032?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Cloud_Vector_RAG-DC2626?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech/)

---

## 🌟 Executive Overview

**The Interview Agent** is an enterprise-grade, full-stack AI evaluation platform built for the **AB Talks AI Engineering Cohort Hackathon**. It automates candidate technical assessments across a 31-day curriculum syllabus (8 modules), combining real-time LLM grading, vector RAG memory retrieval, AST syntax validation, and live prompt steering capabilities.

---

## 🚀 Live Demo & Key Links

- **Production App:** [abtalks-the-interview-agent.vercel.app](https://abtalks-the-interview-agent.vercel.app/)
- **Prompt Engineering Journal:** [PROMPTS.md](./PROMPTS.md) *(Complete 13-phase vibe-coding log and iteration records)*
- **GitHub Repository:** [github.com/toshit2006/Abtalks-The-Interview-Agent](https://github.com/toshit2006/Abtalks-The-Interview-Agent)

---

## 🏛️ Platform Architecture & 4-Stage Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AB TALKS INTERVIEW AGENT                         │
└─────────────────────────────────────────────────────────────────────────┘
        │                     │                     │                     │
        ▼                     ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   STAGE 1    │      │   STAGE 2    │      │   STAGE 3    │      │   STAGE 4    │
│ Curriculum   │ ───► │   Live AI    │ ───► │    Talent    │ ───► │  Live Steer  │
│    Matrix    │      │  Interview   │      │  Analytics   │      │   Sandbox    │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
  31 Curriculum        Groq Llama-70B         Recharts Cohort        Real-time AST
  Modules Tracking      Speech & Sandbox      Analytics & Heatmap   3-Judge Consensus
```

### 1. **Stage 1: Curriculum Matrix**
- Tracks 31-day curriculum mastery across 8 modules.
- Displays candidate completion, attempted topics, skipped missions, and score breakdowns.

### 2. **Stage 2: Live AI Technical Interviewer**
- **Adaptive Interview Engine:** Groq Llama-3.3-70B adaptive multi-turn questioning.
- **Voice & Speech Engine:** Real-time microphone speech recognition with a 16-bar dynamic spectrum visualizer and Web Speech API audio playback.
- **Interactive AI Code Sandbox:** Integrated code editor supporting Python 3.11, TypeScript 5.8, and SQL with real-time AST complexity analysis.

### 3. **Stage 3: Talent Analytics Portal & Candidate Inspection**
- **Cohort Benchmarks:** Recharts Score Distribution Bar Chart, Module Mastery Bar Chart, and Cohort Hiring Breakdown Donut Chart (`PieChart`).
- **31-Day GitHub-style Heatmap:** Interactive candidate inspection modal with 31-day activity squares and hover tooltips.
- **Data Export:** Instant CSV roster download for hiring managers.

### 4. **Stage 4: Live Steer Challenge Simulator**
- **AST Parser & Validator:** Stack-based bracket syntax checking (`{`, `(`, `[` vs `}`, `)`, `]`) and structural keyword export assertions.
- **Dynamic 3-Judge Consensus Panel:** Computes dynamic Judge A (AST Quality), Judge B (Architecture), and Lead Judge consensus scores in real-time.

---

## 🛠️ Technology Stack

- **Framework:** TanStack Start / Vite / Nitro Full-Stack React Framework
- **LLM Engine:** Groq API (`llama-3.3-70b-versatile`)
- **Vector Database (RAG):** Qdrant Cloud (64-dim float Cosine vector search)
- **Database & Auth:** Neon Serverless PostgreSQL & JWT session authentication
- **Styling & UI:** Vanilla CSS, Tailwind CSS 4, Radix UI / Shadcn primitives, Lucide Icons
- **Visualizations:** Recharts (Bar Charts, Donut Pie Charts, Cartesian Grids)

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js `v18+` or `Bun` installed

### 2. Clone & Install
```bash
git clone https://github.com/toshit2006/Abtalks-The-Interview-Agent.git
cd Abtalks-The-Interview-Agent
npm install
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env`:
```env
# Groq LLM API Key (Optional — fallback deterministic engine used if omitted)
GROQ_API_KEY="gsk_..."

# Qdrant Cloud Vector Database (Optional — RAG fallback used if omitted)
QDRANT_URL="https://your-qdrant-cluster.cloud.qdrant.io:6333"
QDRANT_API_KEY="your-qdrant-api-key"

# Neon PostgreSQL Database (Optional — mock auth session fallback used if omitted)
DATABASE_URL="postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License & Credits

Built for the **AB Talks AI Engineering Cohort Hackathon**. All rights reserved.

