# Hackverse - AURA Career Intelligence OS

An AI-driven Autonomous Career Operating System & Institutional Intelligence Platform architected around a reactive Candidate-Intelligence Engine combining Graph DB ontologies, dense vector semantic matching, deterministic provenance trust protocols, and an institutional 90-day predictive early warning system (EWEIS).

## ✨ Features

- **Module 1: AI-Powered Job Discovery**: Dense vector semantic matching with explainable additive/subtractive decomposition (+/- score factors) and Safe Fit / Stretch / Reach categorization.
- **Module 2: Company Intelligence & RAG Mining**: Synthesized recurring interview round blueprints, question frequency distributions, and culture metrics protected by explicit provenance signatures.
- **Module 3 & 4: Adaptive Mock Interviewer**: Conversational AI interviewer with Computerized Adaptive Testing (CAT) paradigm and multi-signal STAR analysis.
- **Module 5: Resume & ATS Simulator**: Human-in-the-loop (HITL) bullet rewrites with strict zero-unilateral-AI-edits guardrail, AST section extraction, and formatting risk diagnostics.
- **Module 6: Skill Graph & DLDM**: Graph-based skill ontology modeling (DAG) computing topological prerequisite chains and sequential learning pathways.
- **Module 7: Application Kanban Tracker**: Pipeline tracker with status age monitors and automated AI follow-up email drafts.
- **Module 8: Institutional EWEIS**: 90-day predictive early warning employability system for universities flagging at-risk cohorts before campus placements.
- **Dynamic PDF Resume Ingestion**: Upload your own PDF resume to calibrate the candidate profile, skills, ATS diagnostics, and match scores across all modules in real time.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested on Node v20+)
- npm or yarn

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🏛️ Refined Enterprise System Architecture & Critical Reliability Circuits

For complete technical specifications, mathematical definitions, and database schemas, see [ENTERPRISE_ARCHITECTURE_SPEC.md](file:///c:/Users/Indrajit%20Jena/Downloads/Hackverse-main/Hackverse-main/ENTERPRISE_ARCHITECTURE_SPEC.md).

### 3 Resolved Critical Blindspots:
1. **Data Flow Invalidation & Synchronization Circuit (CDC + 2PC)**:
   - Synchronizes **PostgreSQL 16** (ACID state), **Neo4j** (Cypher DAG), and **pgvector/Qdrant** (dense embeddings) using Debezium-style WAL LSN tracking and Distributed Two-Phase Commit (`CdcSyncCircuit.ts`).
2. **Cold-Start & Sparsity Ingestion Pipeline**:
   - Evaluates candidate Sparsity Index ($0.0 \rightarrow 1.0$), mitigates sparsity from 0.85 to 0.18, and seeds empirical Bayesian cohort priors ($\mu_{\text{cohort}}, \sigma^2$) to eliminate false-positive early warning placement crises (`ColdStartPipeline.ts`).
3. **Asynchronous Parallel LLM Evaluator & Guardrails**:
   - Operates in parallel with the Policy Engine to inspect semantic output quality, detect hallucinated metrics, and audit STAR causal logic in mock interviews with cryptographic certificates (`LlmGuardrailEvaluator.ts`).

### 3 Intellectual Property (IP) Novelty Highlights:
1. **Deterministic 8-Tier Provenance Ledger**: Replaces black-box AI with cryptographic SHA-256 fingerprints across 8 discrete trust tiers (`VERIFIED_EMPLOYER` through `SYSTEM_DERIVED`).
2. **Predictive 90-Day Early Warning Employability System (EWEIS)**: Evaluates anomaly vector trajectories ($\Delta_{\text{trajectory}} = \int_{T-180}^{T-90} (\theta_{\text{actual}} - \theta_{\text{benchmark}}) \, dt$) with 1-click counselor interventions.
3. **Zero-Unilateral-Edit Human-in-the-Loop (HITL) Guardrail**: AST diffing with candidate approval and anti-fatigue batching (`low_risk_ats` vs `strategic_overhaul`).

## 🛠️ Tech Stack & Enhancements

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & Glassmorphism design tokens
- **Event Bus & Messaging**: Redis Streams / BullMQ Pipeline
- **Databases & Vector Storage**: PostgreSQL 16 (RLS multi-tenancy), Neo4j (Cypher DAG), pgvector / Qdrant
- **Speech Processing**: Whisper & Deepgram with domain technical speech lexicon (`TechnicalSpeechLexicon.ts`)
- **Engine**: TypeScript, Reactive EventBus, Directed Layered Dependency Model (DLDM)
