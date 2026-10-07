'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Compass, 
  Building2, 
  Mic, 
  FileText, 
  GitFork, 
  Kanban, 
  GraduationCap, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Cpu,
  Activity,
  Users,
  ChevronRight,
  UploadCloud,
  FileUp,
  FileCheck,
  RotateCcw,
  Check,
  Loader2,
  Paperclip,
  AlertCircle
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { eventBus } from '@/lib/engine/EventBus';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';

const SAMPLE_RESUMES = [
  {
    id: 'sample-ai',
    title: '🤖 AI Platform & Vector Search Engineer',
    subtitle: 'Sarah Connor • Python, Vector DBs, RAG, Agentic AI, FastAPI',
    text: `Sarah Connor
San Francisco, CA | sarah.connor@frontier.dev | github.com/sconnor-ai
AI Platform & Retrieval Systems Engineer

WORK EXPERIENCE
Senior AI Engineer - ScaleVector AI (2024 - Present)
- Engineered enterprise RAG architectures and hybrid vector search pipelines with Pinecone and Milvus across 40M document chunks.
- Built low-latency agentic AI orchestration workflows with tool-calling capabilities using FastAPI, reducing query latency by 52%.
- Deployed microservices on Kubernetes with Docker containerization, maintaining 99.95% uptime for production LLM inference.

PROJECTS
Autonomous Agent Framework (2025)
- Created a multi-agent framework in Python utilizing vector databases and semantic memory caching with Redis.
- Implemented real-time streaming API endpoints handling 4,500 req/sec.

EDUCATION
M.S. in Computer Science - Carnegie Mellon University (2024)
Skills: Python, Vector Databases, RAG Architectures, Agentic AI, FastAPI, Docker, Kubernetes, Redis, SQL.`,
  },
  {
    id: 'sample-dist',
    title: '🚀 Senior Distributed Systems Engineer',
    subtitle: 'Marcus Vance • Python, System Design, Raft Consensus, Redis',
    text: `Marcus Vance
Seattle, WA | marcus.vance@systems.io | linkedin.com/in/mvance-eng
Senior Distributed Systems Engineer

WORK EXPERIENCE
Staff Systems Engineer - CloudScale Infrastructure (2023 - Present)
- Architected Raft-based distributed consensus protocol and write-ahead log (WAL) replication across multi-region clusters handling 250,000 writes/sec.
- Optimized PostgreSQL database indexing and query execution plans across 50M records, reducing CPU utilization from 85% to 22%.
- Implemented distributed caching with Redis and load balancing using Envoy reverse proxy to maintain sub-5ms P99 latency.

PROJECTS
High-Throughput Distributed Event Broker (2025)
- Designed an event streaming broker in Python with asynchronous socket multiplexing and message queues (Kafka).
- Benchmarked partition fault-tolerance during simulated network partitions with zero data loss.

EDUCATION
B.S. in Computer Engineering - University of Washington (2023)
Skills: Python, System Design, Distributed Consensus, Relational Indexing, Caching (Redis), Load Balancing, Message Queues, Docker.`,
  },
  {
    id: 'sample-fullstack',
    title: '🎨 Full-Stack Performance Engineer',
    subtitle: 'Elena Rostova • TypeScript, React, Next.js, FastAPI, Docker',
    text: `Elena Rostova
New York, NY | elena.rostova@designops.tech | github.com/erostova
Full-Stack Performance Engineer

WORK EXPERIENCE
Full-Stack Software Engineer - CanvasFlow Interactive (2024 - Present)
- Developed high-performance interactive collaborative canvas pipelines in TypeScript, Next.js, and WebAssembly bindings.
- Built asynchronous backend APIs using FastAPI and relational schema models in PostgreSQL with optimized indexes.
- Containerized frontend and backend services using Docker, reducing continuous deployment pipeline duration by 45%.

PROJECTS
Real-Time Collaborative Whiteboard (2025)
- Implemented real-time multiplayer state synchronization using WebSockets and Redis Pub/Sub caching.
- Optimized client-side DOM rendering performance from 32 FPS to a steady 60 FPS under 1,000 simultaneous canvas objects.

EDUCATION
B.S. in Software Engineering - MIT (2024)
Skills: TypeScript, Next.js, React, FastAPI, Python, SQL, Docker, Redis, Linux, Data Structures.`,
  },
];

export default function HomeOverviewPage() {
  const [candidateProfile, setCandidateProfile] = useState(candidateIntelligenceEngine.getProfile());
  const [isCustomProfile, setIsCustomProfile] = useState(candidateIntelligenceEngine.isCustomProfile());
  const [readiness, setReadiness] = useState<number>(78);
  const [atsScore, setAtsScore] = useState<number>(68);
  const [activeJobsCount, setActiveJobsCount] = useState<number>(6);
  const [atRiskStudentsCount, setAtRiskStudentsCount] = useState<number>(2);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressStage, setUploadProgressStage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshState = () => {
    setCandidateProfile({ ...candidateIntelligenceEngine.getProfile() });
    setIsCustomProfile(candidateIntelligenceEngine.isCustomProfile());
    setReadiness(candidateIntelligenceEngine.getProfile().overallReadinessScore);
    setAtsScore(candidateIntelligenceEngine.getCandidateResume().atsAnalysis.overallScore);
    setActiveJobsCount(candidateIntelligenceEngine.getJobs().length);
    setAtRiskStudentsCount(
      candidateIntelligenceEngine.getInstitutionalCohorts().filter(s => s.riskLevel === 'critical_risk').length
    );
  };

  useEffect(() => {
    refreshState();
    const unsubInterview = eventBus.subscribe('MOCK_INTERVIEW_COMPLETED', () => refreshState());
    const unsubSkill = eventBus.subscribe('SKILL_ASSESSMENT_UPDATED', () => refreshState());
    const unsubResume = eventBus.subscribe('RESUME_BULLET_ACCEPTED', () => refreshState());
    const unsubEweis = eventBus.subscribe('EWEIS_INTERVENTION_DEPLOYED', () => refreshState());
    const unsubUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', () => refreshState());
    const unsubReset = eventBus.subscribe('CANDIDATE_PROFILE_RESET', () => refreshState());

    return () => {
      unsubInterview();
      unsubSkill();
      unsubResume();
      unsubEweis();
      unsubUpload();
      unsubReset();
    };
  }, []);

  const handleProcessResume = async (file?: File, directText?: string, filename?: string) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessMessage(null);

    try {
      setUploadProgressStage('Decompressing stream & reading resume contents...');
      await new Promise(r => setTimeout(r, 400));

      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (directText) {
        formData.append('text', directText);
      }

      setUploadProgressStage('Compiling Resume AST schema & extracting sections...');
      await new Promise(r => setTimeout(r, 400));

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to parse resume');
      }

      setUploadProgressStage('Mapping technical proficiencies to Directed Acyclic Graph (DLDM)...');
      await new Promise(r => setTimeout(r, 400));

      setUploadProgressStage('Recalibrating Semantic Fit match matrix & institutional metrics...');
      await new Promise(r => setTimeout(r, 300));

      // Ingest into Candidate Intelligence Engine
      candidateIntelligenceEngine.ingestCandidateFromResume(json.data);

      setUploadSuccessMessage(
        `Resume successfully calibrated! Active profile updated to ${json.data.profile.name}. All platform modules are now customized to your resume.`
      );
      refreshState();
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'Error occurred while processing resume.');
    } finally {
      setIsUploading(false);
      setUploadProgressStage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessResume(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessResume(file);
    }
  };

  const handleResetProfile = () => {
    candidateIntelligenceEngine.resetToDefaultProfile();
    setUploadSuccessMessage('Reset back to default demo benchmark profile (Alex Chen).');
    setTimeout(() => setUploadSuccessMessage(null), 3500);
    refreshState();
  };

  const modules = [
    {
      id: 'mod-1',
      title: 'Module 1: AI-Powered Job Discovery',
      subtitle: 'Dense Vector & Explainable Matching',
      description: 'Multi-source scraper pipeline with explainable additive/subtractive score factor breakdowns (+/-%) and Safe Fit vs Stretch vs Reach categorization.',
      href: '/jobs',
      icon: Compass,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Vector Embeddings',
    },
    {
      id: 'mod-2',
      title: 'Module 2: Company Intel & Mining',
      subtitle: 'RAG Synthesis & Recurring Rounds',
      description: 'NLP-extracted recurring interview rounds, question frequency distributions, and culture metrics protected by explicit provenance signatures.',
      href: '/companies',
      icon: Building2,
      color: 'from-sky-600 to-cyan-600',
      badge: 'RAG Telemetry',
    },
    {
      id: 'mod-3',
      title: 'Module 3 & 4: Adaptive Mock Interviewer',
      subtitle: 'CAT Paradigm & Multi-Signal STAR',
      description: 'Conversational voice + text AI interviewer with Computerized Adaptive Testing (CAT). Analyzes STAR structure, technical correctness, pacing, and filler words.',
      href: '/mock-interview',
      icon: Mic,
      color: 'from-purple-600 to-pink-600',
      badge: 'CAT Voice Engine',
    },
    {
      id: 'mod-5',
      title: 'Module 5: Resume & ATS Simulator',
      subtitle: 'AST Parsing & HITL Bullet Rewrites',
      description: 'Parses resumes to AST, flags unparseable tables and formatting risks. Human-in-the-loop rewrite pipeline guarantees zero unilateral AI edits.',
      href: '/resume',
      icon: FileText,
      color: 'from-amber-600 to-orange-600',
      badge: 'Zero Unilateral Edits',
    },
    {
      id: 'mod-6',
      title: 'Module 6: Skill Graph & DLDM',
      subtitle: 'Ontology DAG & Dynamic Dependency Matrix',
      description: 'Directed Acyclic Graph representing skills. Calculates topological prerequisite chains and provides sequential learning roadmaps.',
      href: '/skill-graph',
      icon: GitFork,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Novelty Feature 1',
    },
    {
      id: 'mod-7',
      title: 'Module 7: Application Kanban',
      subtitle: 'Pipeline Tracker & Follow-Up Automation',
      description: 'Kanban tracking board with status age monitors (>7 days) and automated AI recruiter follow-up email drafts and interview email parsers.',
      href: '/tracker',
      icon: Kanban,
      color: 'from-indigo-600 to-purple-600',
      badge: 'Workflow Automation',
    },
    {
      id: 'mod-8',
      title: 'Module 8: Institutional EWEIS',
      subtitle: '90-Day Early Warning Predictive System',
      description: 'Predictive analytics model for university career centers flagging at-risk students 90 days before campus placements with 1-click advisor interventions.',
      href: '/institutional',
      icon: GraduationCap,
      color: 'from-rose-600 to-red-600',
      badge: 'Novelty Feature 3',
      span: true,
    },
  ];

  return (
    <div className="space-y-10 py-2">
      {/* Hero Section */}
      <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl glass-panel-elevated border border-indigo-900/50 space-y-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Centralized Candidate-Intelligence Engine • Dual Persona Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            The Autonomous Career Operating System &amp; Institutional Intelligence Platform
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Architected around a reactive Candidate-Intelligence Engine combining <strong>Graph DB ontologies</strong>, <strong>dense vector semantic matching</strong>, <strong>deterministic provenance trust protocols</strong>, and an institutional <strong>90-day predictive early warning system (EWEIS)</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/jobs"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <span>Explore Candidate Career OS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/institutional"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm flex items-center gap-2 transition"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Launch Institutional EWEIS Dashboard</span>
            </Link>
          </div>
        </div>

        {/* ---------------- RESUME UPLOAD & DYNAMIC INGESTION CENTER ---------------- */}
        <div className="relative z-10 p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-indigo-500/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Dynamic Profile Ingestion
                </span>
                <span className="text-xs text-slate-400 font-mono">Upload PDF to Personalize Entire OS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Upload Your Resume to Calibrate Candidate OS
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Upload your real PDF resume. The engine parses your skills, builds your dynamic DAG, recalculates Semantic Job Matches, and tailors the ATS Simulator to you in real-time until you refresh.
              </p>
            </div>

            {isCustomProfile && (
              <button
                type="button"
                onClick={handleResetProfile}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
                title="Reset back to standard benchmark candidate"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset to Benchmark (Alex Chen)</span>
              </button>
            )}
          </div>

          {/* Active Candidate Status Badge & Overview */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xl font-bold font-mono">
                {candidateProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-white">{candidateProfile.name}</span>
                  {isCustomProfile ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      ACTIVE_UPLOADED_PROFILE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      BENCHMARK_DEMO_PROFILE
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Target: <strong className="text-indigo-300">{candidateProfile.targetRole}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>{candidateProfile.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-[11px] text-slate-400 font-mono">Active Readiness</div>
                <div className="text-xl font-black font-mono text-indigo-300 mt-0.5">
                  {readiness}%
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right">
                <div className="text-[11px] text-slate-400 font-mono">ATS Resume Score</div>
                <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                  {atsScore}/100
                </div>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
              isDragOver
                ? 'border-indigo-400 bg-indigo-950/40 shadow-lg shadow-indigo-500/20'
                : 'border-slate-700/80 bg-slate-900/50 hover:border-indigo-500/60 hover:bg-slate-900/90'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="text-sm font-bold text-white">
                {isUploading ? 'Calibrating Candidate-Intelligence Engine...' : 'Drag and drop your PDF resume here, or click to browse'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supports <strong className="text-slate-200">.PDF</strong>, <strong className="text-slate-200">.TXT</strong>, or <strong className="text-slate-200">.DOCX</strong> (Max 10MB)
              </p>
            </div>

            {isUploading && (
              <div className="max-w-md mx-auto space-y-2 pt-2">
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full animate-pulse w-full" />
                </div>
                <div className="text-xs font-mono text-indigo-300 animate-pulse">
                  {uploadProgressStage}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="leading-relaxed">{uploadSuccessMessage}</span>
            </div>
          )}

          {/* Quick-Test with Pre-Built Resumes */}
          <div className="pt-2 space-y-2.5">
            <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Or 1-Click Test With Sample Industry Resumes:</span>
              <span className="text-[11px] text-slate-500 font-sans normal-case">Instant parsing &amp; recalculation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_RESUMES.map(sample => (
                <button
                  key={sample.id}
                  type="button"
                  disabled={isUploading}
                  onClick={() => handleProcessResume(undefined, sample.text, sample.title)}
                  className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/60 transition text-left group space-y-1 shadow-sm"
                >
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                    {sample.title}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    {sample.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Synchronized KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 relative z-10">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">DLDM Readiness Score</div>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1 flex items-center gap-2">
              <span>{readiness}%</span>
              <span className="text-[10px] text-emerald-400 font-sans font-semibold">
                {isCustomProfile ? 'Custom' : 'Active'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">ATS Resume Index</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {atsScore} / 100
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Semantic Matched Jobs</div>
            <div className="text-2xl font-black text-sky-400 font-mono mt-1">
              {activeJobsCount} Roles
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">EWEIS At-Risk (T-90d)</div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {atRiskStudentsCount} Students
            </div>
          </div>
        </div>
      </div>

      {/* 3 High-Impact Architectural Differentiators Banner */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
            Core Novelty Highlights
          </span>
          <h2 className="text-2xl font-extrabold text-white">
            Three Novel Architectural Differentiators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-emerald-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-white">Graph-Based Skill-Graph &amp; DLDM</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Skills modeled as a Directed Acyclic Graph (DAG). Computes shortest topological prerequisite chains (Databases &rarr; Caching &rarr; Load Balancing &rarr; System Design) and sequential learning roadmaps.
            </p>
            <div className="pt-2">
              <Link href="/skill-graph" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>View DLDM Visualizer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-sky-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-700 text-sky-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-white">Data Trust Provenance Protocol</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every data point carries an explicit metadata signature: <code>[VERIFIED_EMPLOYER]</code>, <code>[COMMUNITY_AGGREGATED]</code>, or <code>[AI_INFERRED]</code> with click-to-expand origin sources and audit hashes.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <DataProvenanceBadge level="verified" source="Official ATS API" size="sm" />
              <DataProvenanceBadge level="inferred" source="LLM Synthesizer" confidence={94} size="sm" />
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-rose-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700 text-rose-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-white">Institutional EWEIS (T-90 Days)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Predictive anomaly detection on cohort vector trajectories flags at-risk students 90 days before placement season, generating actionable intervention plans for career advisors.
            </p>
            <div className="pt-2">
              <Link href="/institutional" className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1">
                <span>Inspect EWEIS Alerts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Comprehensive Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              Full Module Directory
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">
              Comprehensive Platform Specifications
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                href={mod.href}
                className={`p-6 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 transition-all flex flex-col justify-between group ${
                  mod.span ? 'md:col-span-2 lg:col-span-3 border-amber-900/40 bg-amber-950/10' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                      {mod.title}
                    </h3>
                    <div className="text-xs font-mono text-indigo-400 mt-0.5">{mod.subtitle}</div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
