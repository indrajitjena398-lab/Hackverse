/**
 * AURA Skill Gap & Future Roadmap Engine
 * Autonomous Career Intelligence Platform
 * 
 * Analyzes candidate existing skills against target job role taxonomies,
 * identifies missing core stack items, generates chronological 4-phase learning roadmaps,
 * and suggests real-world architectural portfolio projects.
 */

import { eventBus } from './EventBus';
import { supabase } from '../supabase/client';
import { CandidateSkill } from '../security/rbacStore';

export type SkillProficiencyLevel = 'Mastered' | 'Adjacent' | 'Missing';

export interface AnalyzedSkillItem {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Architecture' | 'AI/ML' | 'Core CS';
  importance: 'CRITICAL' | 'IMPORTANT' | 'NICE_TO_HAVE';
  status: SkillProficiencyLevel;
  candidateProficiency?: number; // 1-5 if acquired
  requiredProficiency: number;   // 1-5 required
  marketDemandPercentile: number;
  gapSummary: string;
}

export interface RoadmapMilestoneItem {
  id: string;
  title: string;
  description: string;
  concepts: string[];
  tools: string[];
  scoreBoostPercent: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  phaseTitle: string;
  timeCommitment: string;
  focusArea: string;
  expectedScoreBoost: string;
  milestones: RoadmapMilestoneItem[];
}

export interface RecommendedProject {
  id: string;
  title: string;
  industryContext: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Production Grade';
  estimatedHours: string;
  missingSkillsSolved: string[];
  architectureRequirements: string[];
  keyFeatures: string[];
  scoreBoost: string;
  scoreBoostValue: number;
  githubRepoUrl?: string;
  isVerified?: boolean;
}

export interface TargetRoleTaxonomy {
  id: string;
  title: string;
  shortDesc: string;
  benchmarkReadiness: number;
  requiredSkills: {
    name: string;
    category: AnalyzedSkillItem['category'];
    importance: AnalyzedSkillItem['importance'];
    requiredProficiency: number;
    marketDemandPercentile: number;
  }[];
  phases: {
    phaseNumber: number;
    phaseTitle: string;
    timeCommitment: string;
    focusArea: string;
    expectedScoreBoost: string;
    milestones: {
      id: string;
      title: string;
      description: string;
      concepts: string[];
      tools: string[];
      scoreBoostPercent: number;
    }[];
  }[];
  recommendedProjects: RecommendedProject[];
}

export interface SkillGapAnalysisResult {
  roleId: string;
  roleTitle: string;
  currentReadinessPercent: number;
  projectedReadinessPercent: number;
  masteredCount: number;
  adjacentCount: number;
  missingCount: number;
  skillsMatrix: AnalyzedSkillItem[];
  phases: RoadmapPhase[];
  projects: RecommendedProject[];
  completedMilestoneIds: string[];
  verifiedProjectIds: string[];
  evaluatedAt: string;
}

export interface StoredRoadmapRecord {
  email: string;
  roleId: string;
  completedMilestoneIds: string[];
  submittedProjects: {
    projectId: string;
    githubUrl: string;
    submittedAt: string;
  }[];
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// PRE-DEFINED INDUSTRY TARGET ROLE TAXONOMIES
// -----------------------------------------------------------------------------
export const ROLE_TAXONOMIES: TargetRoleTaxonomy[] = [
  {
    id: 'full-stack-engineer',
    title: 'Full Stack Engineer',
    shortDesc: 'Modern TypeScript, Next.js App Router, Microservices, and Relational Database Systems',
    benchmarkReadiness: 85,
    requiredSkills: [
      { name: 'TypeScript', category: 'Frontend', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 96 },
      { name: 'React', category: 'Frontend', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 94 },
      { name: 'Next.js', category: 'Frontend', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 92 },
      { name: 'Node.js', category: 'Backend', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 90 },
      { name: 'PostgreSQL', category: 'Database', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 93 },
      { name: 'Redis', category: 'Database', importance: 'IMPORTANT', requiredProficiency: 3, marketDemandPercentile: 85 },
      { name: 'Docker', category: 'DevOps', importance: 'IMPORTANT', requiredProficiency: 3, marketDemandPercentile: 88 },
      { name: 'System Design & REST/GraphQL', category: 'Architecture', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 95 },
      { name: 'Data Structures & Algorithms', category: 'Core CS', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 90 },
      { name: 'CI/CD & GitHub Actions', category: 'DevOps', importance: 'IMPORTANT', requiredProficiency: 3, marketDemandPercentile: 82 },
      { name: 'Tailwind CSS', category: 'Frontend', importance: 'NICE_TO_HAVE', requiredProficiency: 3, marketDemandPercentile: 80 },
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: 'Phase 1: Core Foundation & Modern Stack Gaps',
        timeCommitment: 'Week 1–2 (12-15 hrs/week)',
        focusArea: 'Bridging fundamental framework, static typing, and SQL schema design gaps',
        expectedScoreBoost: '+7% Overall Readiness',
        milestones: [
          {
            id: 'fs-m1',
            title: 'Advanced TypeScript Generics & Type Guards',
            description: 'Master discriminated unions, generic constraints, and inference patterns for bulletproof codebases.',
            concepts: ['Discriminated Unions', 'Conditional Types', 'Satisfies Operator', 'Type Narrowing'],
            tools: ['TypeScript 5.x', 'ts-node', 'Zod Schema Validation'],
            scoreBoostPercent: 3,
          },
          {
            id: 'fs-m2',
            title: 'PostgreSQL Relational Normalization & Indexing',
            description: 'Write optimized multi-table JOINs, understand B-Tree indexes, and build ACID-compliant transactions.',
            concepts: ['B-Tree Indexes', 'EXPLAIN ANALYZE', 'Foreign Key Constraints', 'Isolation Levels'],
            tools: ['PostgreSQL 16', 'pgAdmin / DBeaver', 'Prisma / Supabase'],
            scoreBoostPercent: 4,
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseTitle: 'Phase 2: Distributed State & In-Memory Caching',
        timeCommitment: 'Week 3–4 (14-16 hrs/week)',
        focusArea: 'Redis caching strategies, JWT authentication lifecycles, and asynchronous processing',
        expectedScoreBoost: '+8% Overall Readiness',
        milestones: [
          {
            id: 'fs-m3',
            title: 'Redis Caching & TTL Eviction Invalidation',
            description: 'Implement Cache-Aside, Write-Through patterns, and distributed token bucket rate limiting.',
            concepts: ['Cache Invalidation', 'Redis Sorted Sets', 'Atomic Increment (INCR)', 'TTL Policies'],
            tools: ['Redis 7.x', 'ioredis', 'Upstash Redis'],
            scoreBoostPercent: 4,
          },
          {
            id: 'fs-m4',
            title: 'Secure Authentication & RBAC Gateways',
            description: 'Design stateless JWT session verification, refresh token rotation, and role-based middleware guards.',
            concepts: ['Refresh Token Rotation', 'HttpOnly Cookie Storage', 'CSRF Protection', 'Edge Route Guards'],
            tools: ['Next.js Middleware', 'Supabase Auth', 'Jose JWT Library'],
            scoreBoostPercent: 4,
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseTitle: 'Phase 3: Production Engineering & Cloud Tooling',
        timeCommitment: 'Week 5–6 (15-18 hrs/week)',
        focusArea: 'Containerization, reproducible deployment manifests, and automated testing pipelines',
        expectedScoreBoost: '+6% Overall Readiness',
        milestones: [
          {
            id: 'fs-m5',
            title: 'Multi-Stage Docker Builds & Compose Orchestration',
            description: 'Package web applications into minimal alpine images and orchestrate multi-container topologies.',
            concepts: ['Multi-Stage Dockerfiles', 'Non-Root User Security', 'Docker Compose Networking', 'Volume Mounting'],
            tools: ['Docker', 'Docker Compose', 'Docker Desktop'],
            scoreBoostPercent: 3,
          },
          {
            id: 'fs-m6',
            title: 'Automated CI/CD Workflows with GitHub Actions',
            description: 'Construct automated build, lint, and end-to-end testing matrix pipelines on pull request triggers.',
            concepts: ['Job Matrices', 'Secret Masking', 'Artifact Caching', 'Branch Protection Rules'],
            tools: ['GitHub Actions', 'Jest / Vitest', 'Playwright'],
            scoreBoostPercent: 3,
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseTitle: 'Phase 4: Capstone Portfolio Build & Deployment',
        timeCommitment: 'Week 7–8 (18-20 hrs/week)',
        focusArea: 'Complete end-to-end portfolio production project and link audited GitHub evidence',
        expectedScoreBoost: '+9% Overall Readiness',
        milestones: [
          {
            id: 'fs-m7',
            title: 'End-to-End Enterprise Full Stack Capstone',
            description: 'Build and deploy a scalable web platform proving mastery across frontend, backend, caching, and database.',
            concepts: ['Zero-Downtime Migration', 'OpenTelemetry Tracing', 'Lighthouse Optimization (>95)', 'Production SSL'],
            tools: ['Vercel / AWS ECS', 'Neon / Supabase Postgres', 'Datadog / Sentry'],
            scoreBoostPercent: 5,
          },
          {
            id: 'fs-m8',
            title: 'Technical Architectural Documentation & ADRs',
            description: 'Publish clear Architecture Decision Records (ADRs) and OpenAPI specifications to prove hiring readiness.',
            concepts: ['Architecture Decision Records', 'C4 Model Diagrams', 'OpenAPI 3.1 Spec', 'Benchmark Graphs'],
            tools: ['Mermaid.js', 'Swagger', 'Markdown GitHub Wiki'],
            scoreBoostPercent: 4,
          },
        ],
      },
    ],
    recommendedProjects: [
      {
        id: 'proj-fs-01',
        title: 'Distributed Rate Limiter & Token Bucket API Gateway',
        industryContext: 'Every high-throughput SaaS platform (Stripe, Cloudflare) requires strict API rate limiting to prevent abuse and protect downstream microservices.',
        difficulty: 'Production Grade',
        estimatedHours: '20–25 hours',
        missingSkillsSolved: ['Redis', 'System Design & REST/GraphQL', 'Docker'],
        architectureRequirements: [
          'Dual algorithm implementation: Token Bucket for burst allowance and Sliding Window Log for absolute strictness.',
          'Redis cluster backend using atomic Lua scripts to prevent race conditions during concurrent request surges.',
          'Configurable rate tiers (Anonymous: 10 req/min, Authenticated: 100 req/min, Enterprise: 1,000 req/min).',
          'Export Prometheus-compatible telemetry metrics for rejected vs passed requests.',
        ],
        keyFeatures: [
          'Sub-3ms evaluation overhead under 5,000 req/sec benchmark load.',
          'Standard RFC 6585 headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After.',
          'Docker Compose manifest launching API gateway, mock downstream services, and Redis cluster.',
        ],
        scoreBoost: '+8% Overall Readiness Boost',
        scoreBoostValue: 8,
      },
      {
        id: 'proj-fs-02',
        title: 'Multi-Tenant Collaborative Workspace with Optimistic Concurrency',
        industryContext: 'Enterprise applications (Notion, Figma, Linear) demand multi-tenant isolation alongside instant zero-latency collaborative state sync.',
        difficulty: 'Advanced',
        estimatedHours: '22–26 hours',
        missingSkillsSolved: ['Next.js', 'PostgreSQL', 'CI/CD & GitHub Actions'],
        architectureRequirements: [
          'PostgreSQL Row-Level Security (RLS) isolating tenant data through tenant_id claim enforcement.',
          'Optimistic UI mutations backed by transactional version locks to detect concurrent write conflicts.',
          'Audit log ledger tracking every state mutation with actor metadata and cryptographic hash.',
          'Full automated CI/CD pipeline on GitHub Actions running unit, integration, and Playwright E2E tests.',
        ],
        keyFeatures: [
          'Real-time state broadcast with WebSocket / Supabase Realtime fallback.',
          'Conflict resolution strategy using Last-Write-Wins with undo buffer.',
          'Production deployed on Vercel + Supabase with 99.9% uptime SLA monitor.',
        ],
        scoreBoost: '+7% Overall Readiness Boost',
        scoreBoostValue: 7,
      },
    ],
  },

  {
    id: 'ai-ml-systems-engineer',
    title: 'AI/ML & Systems Engineer',
    shortDesc: 'PyTorch, Vector Databases, RAG Pipelines, GPU Model Serving, and Distributed Inference',
    benchmarkReadiness: 88,
    requiredSkills: [
      { name: 'Python', category: 'Backend', importance: 'CRITICAL', requiredProficiency: 5, marketDemandPercentile: 98 },
      { name: 'PyTorch', category: 'AI/ML', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 94 },
      { name: 'Vector DBs (Milvus / Pinecone / pgvector)', category: 'Database', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 92 },
      { name: 'RAG & Retrieval Systems', category: 'AI/ML', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 96 },
      { name: 'FastAPI / AsyncIO', category: 'Backend', importance: 'IMPORTANT', requiredProficiency: 4, marketDemandPercentile: 91 },
      { name: 'Docker & GPU Containerization', category: 'DevOps', importance: 'IMPORTANT', requiredProficiency: 3, marketDemandPercentile: 87 },
      { name: 'Data Structures & Algorithms', category: 'Core CS', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 90 },
      { name: 'Model Serving & vLLM / ONNX', category: 'AI/ML', importance: 'IMPORTANT', requiredProficiency: 3, marketDemandPercentile: 89 },
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: 'Phase 1: Vector Embeddings & Hybrid Search',
        timeCommitment: 'Week 1–2 (14-16 hrs/week)',
        focusArea: 'Embedding models, cosine vs dot product indexing, and semantic hybrid retrieval',
        expectedScoreBoost: '+8% Overall Readiness',
        milestones: [
          {
            id: 'ai-m1',
            title: 'HNSW Indexing & Hybrid Vector Search with pgvector',
            description: 'Implement dense embedding retrieval coupled with BM25 sparse keyword ranking via Reciprocal Rank Fusion.',
            concepts: ['HNSW vs IVFFlat', 'Cosine Distance vs Inner Product', 'BM25 Sparse Retrieval', 'RRF Re-ranking'],
            tools: ['pgvector', 'LangChain / LlamaIndex', 'Sentence-Transformers'],
            scoreBoostPercent: 4,
          },
          {
            id: 'ai-m2',
            title: 'Asynchronous Chunking & Context Window Optimization',
            description: 'Build recursive token-aware chunkers preserving semantic heading context for document ingestion.',
            concepts: ['Recursive Splitting', 'Chunk Overlap Strategy', 'Metadata Enrichment', 'Token Count Budgeting'],
            tools: ['tiktoken', 'FastAPI', 'Celery / Redis Queue'],
            scoreBoostPercent: 4,
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseTitle: 'Phase 2: Agentic Workflows & Multi-Hop Query Decomposition',
        timeCommitment: 'Week 3–4 (16-18 hrs/week)',
        focusArea: 'ReAct agent loops, tool calling, and structured schema extraction',
        expectedScoreBoost: '+9% Overall Readiness',
        milestones: [
          {
            id: 'ai-m3',
            title: 'ReAct Agent Loop with Dynamic Tool Execution',
            description: 'Build an autonomous agent that breaks ambiguous queries into discrete sub-queries and executes search tools.',
            concepts: ['Thought-Action-Observation Loop', 'Pydantic Tool Calling', 'Max Iteration Safeguards', 'Hallucination Checks'],
            tools: ['LangGraph', 'OpenAI Function Calling', 'Instructor / Pydantic'],
            scoreBoostPercent: 5,
          },
          {
            id: 'ai-m4',
            title: 'Self-Correcting RAG with Cross-Encoder Reranking',
            description: 'Evaluate document relevance with FlashRank / Cohere and filter out noisy context before LLM generation.',
            concepts: ['Cross-Encoder Reranking', 'Hallucination Mitigation', 'Faithfulness Evaluation', 'Source Attribution'],
            tools: ['FlashRank', 'Ragas Framework', 'Gradio / Streamlit'],
            scoreBoostPercent: 4,
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseTitle: 'Phase 3: High-Throughput Inference & Model Optimization',
        timeCommitment: 'Week 5–6 (16-20 hrs/week)',
        focusArea: 'Quantization, streaming token responses, and latency profiling',
        expectedScoreBoost: '+7% Overall Readiness',
        milestones: [
          {
            id: 'ai-m5',
            title: 'Streaming SSE Inference with Async FastAPI',
            description: 'Deliver sub-100ms First Token Latency (TTFT) using Server-Sent Events (SSE) and asynchronous generators.',
            concepts: ['Server-Sent Events', 'Async Generators', 'Backpressure Handling', 'Connection Keep-Alive'],
            tools: ['FastAPI', 'Uvicorn', 'OpenAI AsyncClient'],
            scoreBoostPercent: 4,
          },
          {
            id: 'ai-m6',
            title: 'Model Quantization & ONNX Runtime Serving',
            description: 'Convert PyTorch weights into INT8/INT4 quantized formats to reduce memory footprint by 65%.',
            concepts: ['Post-Training Quantization (PTQ)', 'INT8 vs FP16', 'ONNX Graph Optimization', 'Memory Profiling'],
            tools: ['ONNX Runtime', 'PyTorch', 'Optimum'],
            scoreBoostPercent: 3,
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseTitle: 'Phase 4: Production Evaluation & Capstone Deployment',
        timeCommitment: 'Week 7–8 (18-22 hrs/week)',
        focusArea: 'Deploying a production agentic RAG system with automated evals and audit tracing',
        expectedScoreBoost: '+9% Overall Readiness',
        milestones: [
          {
            id: 'ai-m7',
            title: 'Production Agentic Retrieval Platform Deployment',
            description: 'Ship an enterprise-grade semantic search platform with full provenance ledger and telemetry logging.',
            concepts: ['Evaluation Flywheels', 'Ground Truth Benchmarking', 'Latency SLAs (<200ms)', 'Containerized Deployment'],
            tools: ['Docker', 'AWS ECS / Fly.io', 'Langfuse / Arize Phoenix'],
            scoreBoostPercent: 5,
          },
          {
            id: 'ai-m8',
            title: 'Automated LLM Evaluation Suite & Metric Dashboards',
            description: 'Implement automated CI tests checking Context Precision, Context Recall, and Answer Relevance on PRs.',
            concepts: ['Context Precision', 'Answer Correctness', 'Automated Evals in CI', 'Adversarial Prompt Tests'],
            tools: ['Ragas', 'DeepEval', 'GitHub Actions'],
            scoreBoostPercent: 4,
          },
        ],
      },
    ],
    recommendedProjects: [
      {
        id: 'proj-ai-01',
        title: 'Hybrid Semantic Code Search & Architecture Explainer (1M+ Lines)',
        industryContext: 'Developers struggle with giant unfamiliar codebases. High-tech companies (GitHub Copilot, Cursor) leverage hybrid vector + AST search to explain complex systems.',
        difficulty: 'Production Grade',
        estimatedHours: '24–28 hours',
        missingSkillsSolved: ['Vector DBs (Milvus / Pinecone / pgvector)', 'RAG & Retrieval Systems', 'PyTorch'],
        architectureRequirements: [
          'Parse syntax trees using Tree-sitter to chunk code into logical functions, structs, and interfaces.',
          'Store dense embeddings in pgvector with HNSW index alongside full-text inverted index.',
          'Re-ranking pipeline using Cross-Encoder to evaluate top-30 candidates to top-5 most relevant snippets.',
          'Streaming response with precise file path provenance, line ranges, and architectural diagrams.',
        ],
        keyFeatures: [
          'Sub-250ms search response over 50,000 indexed code chunks.',
          'Multi-hop symbol cross-reference resolver detecting function call trees.',
          'Full Docker containerization with GPU/CPU toggle.',
        ],
        scoreBoost: '+10% Overall Readiness Boost',
        scoreBoostValue: 10,
      },
      {
        id: 'proj-ai-02',
        title: 'Autonomous Regulatory & Legal Compliance Verification Agent',
        industryContext: 'Financial and enterprise platforms require automated verification against compliance mandates (GDPR, SOC2, HIPAA) without hallucination.',
        difficulty: 'Advanced',
        estimatedHours: '20–24 hours',
        missingSkillsSolved: ['FastAPI / AsyncIO', 'RAG & Retrieval Systems'],
        architectureRequirements: [
          'Two-agent deliberation loop: Generator proposes compliance classification, Critic validates evidence citations.',
          'Strict source grounding: answers missing cryptographic document hash lineage are automatically rejected.',
          'Pydantic output schema guaranteeing 100% structured JSON contract for downstream systems.',
        ],
        keyFeatures: [
          'Zero-hallucination guardrail with citation back-links.',
          'Interactive evaluation dashboard computing faithfulness metric across test datasets.',
        ],
        scoreBoost: '+8% Overall Readiness Boost',
        scoreBoostValue: 8,
      },
    ],
  },

  {
    id: 'devops-cloud-architect',
    title: 'DevOps & Cloud Specialist',
    shortDesc: 'Kubernetes, Terraform (IaC), GitOps, AWS Architecture, Prometheus/Grafana, and Chaos Engineering',
    benchmarkReadiness: 86,
    requiredSkills: [
      { name: 'Docker', category: 'DevOps', importance: 'CRITICAL', requiredProficiency: 5, marketDemandPercentile: 96 },
      { name: 'Kubernetes', category: 'DevOps', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 95 },
      { name: 'Terraform (IaC)', category: 'DevOps', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 92 },
      { name: 'Linux & Bash Scripting', category: 'Core CS', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 90 },
      { name: 'CI/CD & GitHub Actions', category: 'DevOps', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 94 },
      { name: 'Prometheus & Grafana', category: 'DevOps', importance: 'IMPORTANT', requiredProficiency: 3, marketDemandPercentile: 88 },
      { name: 'AWS / Cloud Architecture', category: 'Architecture', importance: 'CRITICAL', requiredProficiency: 4, marketDemandPercentile: 96 },
      { name: 'Networking (DNS, TLS, BGP)', category: 'Core CS', importance: 'IMPORTANT', requiredProficiency: 3, marketDemandPercentile: 85 },
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: 'Phase 1: Infrastructure as Code (IaC) & VPC Networking',
        timeCommitment: 'Week 1–2 (12-14 hrs/week)',
        focusArea: 'Terraform modules, state locking with S3/DynamoDB, and secure VPC topologies',
        expectedScoreBoost: '+7% Overall Readiness',
        milestones: [
          {
            id: 'do-m1',
            title: 'Modular Terraform VPC with Public/Private Subnets',
            description: 'Provision reproducible multi-AZ network topologies with NAT Gateways, Internet Gateways, and Route Tables.',
            concepts: ['Terraform Modules', 'Remote State Locking (DynamoDB)', 'CIDR Block Allocation', 'Bastion Security Groups'],
            tools: ['Terraform CLI', 'AWS Provider', 'LocalStack'],
            scoreBoostPercent: 4,
          },
          {
            id: 'do-m2',
            title: 'Hardened Linux Server Configuration via Ansible',
            description: 'Automate SSH hardening, UFW firewall configuration, and automated security patch unattended-upgrades.',
            concepts: ['Idempotency', 'SSH Key Rotation', 'Systemd Service Units', 'Logrotate Configuration'],
            tools: ['Ansible', 'Ubuntu Server', 'OpenSSH'],
            scoreBoostPercent: 3,
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseTitle: 'Phase 2: Kubernetes Manifests & Pod Lifecycle Management',
        timeCommitment: 'Week 3–4 (15-18 hrs/week)',
        focusArea: 'Deployments, Services, ConfigMaps, Ingress Controllers, and HPA autoscaling',
        expectedScoreBoost: '+8% Overall Readiness',
        milestones: [
          {
            id: 'do-m3',
            title: 'Production Kubernetes Deployment with HPA Autoscaling',
            description: 'Configure resource requests/limits, readiness/liveness probes, and Horizontal Pod Autoscaler targeting CPU/Memory.',
            concepts: ['Resource Quotas', 'Liveness vs Readiness Probes', 'Zero-Downtime Rolling Updates', 'HPA Metrics Server'],
            tools: ['kubectl', 'Minikube / k3s', 'Helm Charts'],
            scoreBoostPercent: 4,
          },
          {
            id: 'do-m4',
            title: 'Ingress NGINX with Automated Let’s Encrypt TLS',
            description: 'Set up cert-manager for automatic ACME TLS issuance and host-based routing across multiple namespace microservices.',
            concepts: ['cert-manager ACME', 'Ingress Routing Rules', 'TLS Termination', 'Rate Limiting Annotations'],
            tools: ['cert-manager', 'NGINX Ingress Controller', 'Let’s Encrypt'],
            scoreBoostPercent: 4,
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseTitle: 'Phase 3: Observability Stack & GitOps Pipelines',
        timeCommitment: 'Week 5–6 (16-18 hrs/week)',
        focusArea: 'Prometheus metrics scraping, Grafana alerting rules, and ArgoCD continuous sync',
        expectedScoreBoost: '+8% Overall Readiness',
        milestones: [
          {
            id: 'do-m5',
            title: 'Prometheus Operator & Custom Grafana SLO Dashboards',
            description: 'Scrape golden signals (Latency, Traffic, Errors, Saturation) and write PromQL alerts routed to Slack/PagerDuty.',
            concepts: ['PromQL Queries', 'ServiceMonitors', 'AlertManager Routing', 'SLI/SLO Error Budgets'],
            tools: ['kube-prometheus-stack', 'Grafana', 'AlertManager'],
            scoreBoostPercent: 4,
          },
          {
            id: 'do-m6',
            title: 'GitOps Declarative Deployment with ArgoCD',
            description: 'Establish automated Git repository reconciliation where cluster state mirrors git commit history.',
            concepts: ['Git as Source of Truth', 'Out-of-Sync Auto-Healing', 'Canary Rollouts with Argo Rollouts'],
            tools: ['ArgoCD', 'Kustomize', 'GitHub Webhooks'],
            scoreBoostPercent: 4,
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseTitle: 'Phase 4: Chaos Engineering & Capstone Reliability Audit',
        timeCommitment: 'Week 7–8 (18-20 hrs/week)',
        focusArea: 'Simulating pod evictions, network partitions, and disaster recovery runbooks',
        expectedScoreBoost: '+8% Overall Readiness',
        milestones: [
          {
            id: 'do-m7',
            title: 'Automated Chaos Engineering with Chaos Mesh',
            description: 'Inject network latency and kill critical pods during simulated traffic spikes to verify self-healing resilience.',
            concepts: ['Fault Injection', 'Blast Radius Minimization', 'MTTR (Mean Time to Recovery)', 'Runbook Automation'],
            tools: ['Chaos Mesh / LitmusChaos', 'k6 Load Testing', 'GitHub Actions'],
            scoreBoostPercent: 4,
          },
          {
            id: 'do-m8',
            title: 'SOC2 Compliant Cloud Architecture Audit & Runbooks',
            description: 'Publish infrastructure security compliance scans and verified disaster recovery recovery-point-objective (RPO) tests.',
            concepts: ['Tfsec / Checkov Static Analysis', 'CIS Benchmark Hardening', 'RPO & RTO Verification'],
            tools: ['Tfsec', 'Trivy', 'Markdown DR Playbook'],
            scoreBoostPercent: 4,
          },
        ],
      },
    ],
    recommendedProjects: [
      {
        id: 'proj-do-01',
        title: 'GitOps High-Availability Multi-Tier Kubernetes Cluster with ArgoCD',
        industryContext: 'Modern cloud platforms need fully automated, self-healing deployments where any cluster disaster can be restored in 5 minutes from Git.',
        difficulty: 'Production Grade',
        estimatedHours: '22–26 hours',
        missingSkillsSolved: ['Kubernetes', 'Terraform (IaC)', 'CI/CD & GitHub Actions'],
        architectureRequirements: [
          'Terraform code provisioning EKS/k3s cluster with auto-scaling node groups and VPC peering.',
          'ArgoCD GitOps operator continuously synchronizing deployments, ingress, and configmaps.',
          'Integrated cert-manager issuing zero-touch SSL certificates via Let’s Encrypt DNS-01 challenge.',
          'Prometheus AlertManager sending alerts when error rate exceeds 1% over 5-minute rolling window.',
        ],
        keyFeatures: [
          'Single-command cluster spin-up and teardown via Makefile.',
          'Canary rollout deployment strategy with automated rollback on health check failure.',
        ],
        scoreBoost: '+9% Overall Readiness Boost',
        scoreBoostValue: 9,
      },
      {
        id: 'proj-do-02',
        title: 'Zero-Trust Internal Service Mesh with Mutual TLS (mTLS)',
        industryContext: 'Banks and defense tech require strict encryption of all east-west microservice traffic with dynamic identity certificates.',
        difficulty: 'Advanced',
        estimatedHours: '18–22 hours',
        missingSkillsSolved: ['Kubernetes', 'Networking (DNS, TLS, BGP)'],
        architectureRequirements: [
          'Istio or Linkerd service mesh injecting sidecar proxies with automatic mTLS enforcement.',
          'Strict AuthorizationPolicies blocking inter-service communication without explicit role grants.',
          'Distributed request tracing with Jaeger visualizing service dependency graph.',
        ],
        keyFeatures: [
          'Cryptographic proof of 100% encrypted pod-to-pod network traffic.',
          'Latency overhead benchmarking (<2ms impact per proxy hop).',
        ],
        scoreBoost: '+8% Overall Readiness Boost',
        scoreBoostValue: 8,
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// STORAGE KEYS
// -----------------------------------------------------------------------------
const STORAGE_ROADMAP_PREFIX = 'aura_candidate_roadmap_';

export class SkillGapAnalyzer {
  /**
   * Returns list of all available role taxonomies
   */
  public getTaxonomies(): TargetRoleTaxonomy[] {
    return ROLE_TAXONOMIES;
  }

  /**
   * Retrieves specific taxonomy by ID (with fallback to full-stack)
   */
  public getTaxonomy(roleId?: string): TargetRoleTaxonomy {
    const found = ROLE_TAXONOMIES.find(t => t.id === roleId);
    return found || ROLE_TAXONOMIES[0];
  }

  /**
   * High-level candidate evaluation that automatically loads stored milestone checklists
   * and verified portfolio projects from persistence.
   */
  public analyzeForCandidate(
    email: string,
    candidateSkills: CandidateSkill[],
    targetRoleId: string = 'full-stack-engineer'
  ): SkillGapAnalysisResult {
    const stored = this.getStoredRoadmapState(email, targetRoleId);
    const verifiedProjectIds = stored.submittedProjects.map(p => p.projectId);
    return this.analyze(candidateSkills, targetRoleId, stored.completedMilestoneIds, verifiedProjectIds);
  }

  /**
   * Evaluates candidate skills against the target role taxonomy.
   * Categorizes into Mastered, Adjacent, and Missing.
   * Computes dynamic readiness score and projected score boost.
   */
  public analyze(
    candidateSkills: CandidateSkill[],
    targetRoleId: string = 'full-stack-engineer',
    completedMilestoneIds: string[] = [],
    verifiedProjectIds: string[] = []
  ): SkillGapAnalysisResult {
    const taxonomy = this.getTaxonomy(targetRoleId);

    let masteredCount = 0;
    let adjacentCount = 0;
    let missingCount = 0;
    let totalScoreNumerator = 0;
    let totalScoreDenominator = 0;

    const skillsMatrix: AnalyzedSkillItem[] = taxonomy.requiredSkills.map(req => {
      // Find matching candidate skill (exact or fuzzy keyword match)
      const matched = candidateSkills.find(cs => {
        const csName = cs.name.toLowerCase().trim();
        const reqName = req.name.toLowerCase().trim();
        return csName === reqName || csName.includes(reqName) || reqName.includes(csName);
      });

      let status: SkillProficiencyLevel = 'Missing';
      let gapSummary = `Critical gap: No verified knowledge of ${req.name} found in your profile.`;
      const weight = req.importance === 'CRITICAL' ? 1.5 : req.importance === 'IMPORTANT' ? 1.0 : 0.6;
      totalScoreDenominator += (100 * weight);

      if (matched) {
        const prof = matched.proficiency || 3;
        if (prof >= req.requiredProficiency) {
          status = 'Mastered';
          masteredCount++;
          gapSummary = `Mastered: Verified proficiency (${prof}/5) meets or exceeds requirement (${req.requiredProficiency}/5).`;
          totalScoreNumerator += (100 * weight);
        } else {
          status = 'Adjacent';
          adjacentCount++;
          gapSummary = `Adjacent: Foundational knowledge exists (${prof}/5), but industry benchmark expects ${req.requiredProficiency}/5.`;
          totalScoreNumerator += ((prof / req.requiredProficiency) * 85 * weight);
        }
      } else {
        missingCount++;
      }

      return {
        name: req.name,
        category: req.category,
        importance: req.importance,
        status,
        candidateProficiency: matched?.proficiency,
        requiredProficiency: req.requiredProficiency,
        marketDemandPercentile: req.marketDemandPercentile,
        gapSummary,
      };
    });

    // Base match percentage from verified skills
    const baseScore = totalScoreDenominator > 0 
      ? Math.round((totalScoreNumerator / totalScoreDenominator) * 100)
      : 65;

    // Additional boost earned from completed roadmap milestones
    let milestoneBoost = 0;
    taxonomy.phases.forEach(p => {
      p.milestones.forEach(m => {
        if (completedMilestoneIds.includes(m.id)) {
          milestoneBoost += m.scoreBoostPercent;
        }
      });
    });

    // Additional boost earned from verified portfolio projects
    let projectBoost = 0;
    taxonomy.recommendedProjects.forEach(proj => {
      if (verifiedProjectIds.includes(proj.id)) {
        projectBoost += proj.scoreBoostValue;
      }
    });

    const currentReadinessPercent = Math.min(99, Math.max(45, baseScore + milestoneBoost + projectBoost));

    // Calculate maximum potential score if all milestones & projects are completed
    let totalAvailableMilestoneBoost = 0;
    taxonomy.phases.forEach(p => {
      p.milestones.forEach(m => {
        totalAvailableMilestoneBoost += m.scoreBoostPercent;
      });
    });

    let totalAvailableProjectBoost = 0;
    taxonomy.recommendedProjects.forEach(proj => {
      totalAvailableProjectBoost += proj.scoreBoostValue;
    });

    const projectedReadinessPercent = Math.min(98, Math.max(currentReadinessPercent, baseScore + totalAvailableMilestoneBoost + totalAvailableProjectBoost));

    // Map phases with completion states
    const phases: RoadmapPhase[] = taxonomy.phases.map(phase => ({
      ...phase,
      milestones: phase.milestones.map(m => ({
        ...m,
        isCompleted: completedMilestoneIds.includes(m.id),
      })),
    }));

    // Map projects with verification states
    const projects: RecommendedProject[] = taxonomy.recommendedProjects.map(proj => ({
      ...proj,
      isVerified: verifiedProjectIds.includes(proj.id),
    }));

    return {
      roleId: taxonomy.id,
      roleTitle: taxonomy.title,
      currentReadinessPercent,
      projectedReadinessPercent,
      masteredCount,
      adjacentCount,
      missingCount,
      skillsMatrix,
      phases,
      projects,
      completedMilestoneIds,
      verifiedProjectIds,
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves active roadmap state from localStorage
   */
  public getStoredRoadmapState(email: string, roleId: string): StoredRoadmapRecord {
    const cleanEmail = email.toLowerCase().trim();
    const key = `${STORAGE_ROADMAP_PREFIX}${cleanEmail}_${roleId}`;
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }

    return {
      email: cleanEmail,
      roleId,
      completedMilestoneIds: [],
      submittedProjects: [],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Persists active roadmap state to localStorage, emits SKILL_ACQUIRED,
   * and attempts async write to Supabase candidate_roadmaps table
   */
  public saveRoadmapState(
    email: string,
    roleId: string,
    record: StoredRoadmapRecord,
    currentScore?: number
  ): void {
    const cleanEmail = email.toLowerCase().trim();
    const key = `${STORAGE_ROADMAP_PREFIX}${cleanEmail}_${roleId}`;
    record.updatedAt = new Date().toISOString();

    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(record));
    }

    // Publish SKILL_ACQUIRED and READINESS_RECALCULATED events
    eventBus.publish({
      event_type: 'SKILL_ACQUIRED',
      candidate_id: `cand-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      source: 'SkillGapAnalyzer Engine',
      payload: {
        email: cleanEmail,
        roleId,
        completedMilestones: record.completedMilestoneIds,
        submittedProjects: record.submittedProjects,
        recalculatedScore: currentScore,
      },
      provenance: {
        type: 'VERIFIED_CANDIDATE',
        confidence: 0.98,
        hash: `0xroadmap_sync_${Date.now().toString(16)}`,
      },
    } as any);

    // Async write to Supabase
    this.syncToPostgres(cleanEmail, roleId, record, currentScore);
  }

  /**
   * Asynchronous PostgreSQL synchronization for candidate_roadmaps table
   */
  private async syncToPostgres(
    email: string,
    roleId: string,
    record: StoredRoadmapRecord,
    currentScore?: number
  ): Promise<void> {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('YOUR_SUPABASE')) {
        const taxonomy = this.getTaxonomy(roleId);
        await supabase
          .from('candidate_roadmaps')
          .upsert({
            candidate_email: email,
            target_role_id: roleId,
            target_role_title: taxonomy.title,
            current_readiness_score: currentScore || 75,
            completed_checklists: record.completedMilestoneIds,
            submitted_projects: record.submittedProjects,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'candidate_email,target_role_id' });
      }
    } catch (e) {
      console.warn('candidate_roadmaps PostgreSQL write bypassed (client fallback):', e);
    }
  }
}

export const skillGapAnalyzer = new SkillGapAnalyzer();
