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
  ChevronRight,
  UploadCloud,
  RotateCcw,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  LogIn,
  UserCheck
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { eventBus } from '@/lib/engine/EventBus';
import { useAuth } from '@/lib/firebase/AuthContext';
import { AuthModal } from '@/components/common/AuthModal';
import { CareerDigitalTwinModal } from '@/components/common/CareerDigitalTwinModal';
import { GovernanceEventStreamDrawer } from '@/components/common/GovernanceEventStreamDrawer';
import { GitHubSkillRadarSection } from '@/components/github/GitHubSkillRadarSection';
import { InstitutionalStudentNoticeCard } from '@/components/placements/InstitutionalStudentNoticeCard';

const SAMPLE_RESUMES = [
  {
    id: 'sample-ai',
    title: 'AI Platform & Vector Search Engineer',
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
    title: 'Senior Distributed Systems Engineer',
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
    title: 'Full-Stack Performance Engineer',
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
  const { user, persona, loading: authLoading } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState(candidateIntelligenceEngine.getProfile());
  const [isCustomProfile, setIsCustomProfile] = useState(candidateIntelligenceEngine.isCustomProfile());
  const [readiness, setReadiness] = useState<number>(78);
  const [atsScore, setAtsScore] = useState<number>(68);
  const [activeJobsCount, setActiveJobsCount] = useState<number>(6);
  const [atRiskStudentsCount, setAtRiskStudentsCount] = useState<number>(2);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDigitalTwinOpen, setIsDigitalTwinOpen] = useState(false);
  const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);

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
    // Strict authentication guard: unauthenticated users cannot upload or mutate candidate data
    if (!user) {
      setIsAuthModalOpen(true);
      setUploadError('Authentication required: Please sign in or use 1-Click Demo Login to upload resumes and calibrate your profile.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessMessage(null);

    try {
      setUploadProgressStage('Reading resume contents...');
      await new Promise(r => setTimeout(r, 300));

      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (directText) {
        formData.append('text', directText);
      }

      setUploadProgressStage('Extracting structural sections & skills...');
      await new Promise(r => setTimeout(r, 300));

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to parse resume');
      }

      setUploadProgressStage('Recalibrating job matches & career readiness...');
      await new Promise(r => setTimeout(r, 300));

      candidateIntelligenceEngine.ingestCandidateFromResume(json.data);

      setUploadSuccessMessage(
        `Profile calibrated to ${json.data.profile.name}. All job matches and readiness scores are updated.`
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
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      handleProcessResume(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessResume(file);
    }
  };

  const handleSampleClick = (sample: typeof SAMPLE_RESUMES[0]) => {
    if (!user) {
      setIsAuthModalOpen(true);
      setUploadError('Authentication required: Sign in to test and calibrate candidate profiles.');
      return;
    }
    handleProcessResume(undefined, sample.text, sample.title);
  };

  const handleResetProfile = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    candidateIntelligenceEngine.resetToDefaultProfile();
    setUploadSuccessMessage('Reset to benchmark candidate profile (Alex Chen).');
    setTimeout(() => setUploadSuccessMessage(null), 3000);
    refreshState();
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const platformCapabilities = [
    {
      id: 'job-matching',
      title: 'Role Compatibility Engine',
      category: 'Role Matching',
      description: 'Direct comparison comparing your verified skills and code contributions against company requirements with line-by-line gap analysis.',
      metric: `${activeJobsCount} Active Roles`,
      metricBadge: 'Verified Criteria',
      href: '/jobs',
      icon: Compass,
    },
    {
      id: 'mock-interview',
      title: 'Adaptive Mock Interviews',
      category: 'Technical Practice',
      description: 'Adaptive technical questioning that dynamically scales difficulty based on your answers with real-time systems architecture scoring.',
      metric: 'Adaptive Questions',
      metricBadge: 'Systems Rubric',
      href: '/mock-interview',
      icon: Mic,
    },
    {
      id: 'company-intel',
      title: 'Interview Standards & Rounds',
      category: 'Company Intelligence',
      description: 'Documented interview stages, real transcripts from placed candidates, and verified reasons why candidates received offers.',
      metric: 'Company Archives',
      metricBadge: 'Past Interviews',
      href: '/companies',
      icon: Building2,
    },
    {
      id: 'skill-graph',
      title: 'Prerequisite Skill Pathways',
      category: 'Learning Progression',
      description: 'Structured dependency roadmap outlining prerequisite technologies required before applying to senior engineering roles.',
      metric: 'Prerequisite Chains',
      metricBadge: 'Sequential Paths',
      href: '/skill-graph',
      icon: GitFork,
    },
    {
      id: 'resume-ats',
      title: 'Resume Review & Formatting',
      category: 'Document Review',
      description: 'Structural resume parsing flagging missing technical competencies, keyword gaps, and formatting risks.',
      metric: `${atsScore}/100 Review Score`,
      metricBadge: 'Structural Check',
      href: '/resume',
      icon: FileText,
    },
    {
      id: 'institutional-eweis',
      title: 'Institutional Placement Alerts',
      category: 'Placement Cell',
      description: 'Departmental analytics tracking cohort skill distribution, placement readiness, and corporate role dispatches.',
      metric: `${atRiskStudentsCount} Active Alerts`,
      metricBadge: 'Placement Cell',
      href: '/institutional',
      icon: GraduationCap,
    },
    {
      id: 'app-tracker',
      title: 'Application Pipeline',
      category: 'Tracking',
      description: 'Structured kanban tracker monitoring role applications, interview stages, and recruiter communications.',
      metric: 'Active Pipeline',
      metricBadge: 'Live Tracker',
      href: '/tracker',
      icon: Kanban,
    },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* 0. Guest / Authentication Required Notice Banner */}
      {!user && !authLoading && (
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span>Guest Preview — Sign in to save calibrations and assessment results</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  READ ONLY
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                You can browse verified company criteria, interview recordings, and department reports. To upload your resume and benchmark your scores, sign in to your account.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in to account</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Executive Hero Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Technical Placement &amp; Career Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Benchmark your technical experience against verified engineering roles.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Analyze your GitHub code contributions, resume, and systems architecture skills directly against live hiring benchmarks. Identify concrete skill gaps before interviewing.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Link
              href="/jobs"
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm shadow-xs flex items-center gap-2 transition"
            >
              <span>View open roles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/mock-interview"
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm flex items-center gap-2 transition shadow-xs"
            >
              <Mic className="w-4 h-4 text-slate-500" />
              <span>Practice technical interviews</span>
            </Link>

            <Link
              href="/institutional"
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm flex items-center gap-2 transition shadow-xs"
            >
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <span>Placement reports</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsDigitalTwinOpen(true)}
              className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              <span>Career scenarios</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGovernanceOpen(true)}
              className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Audit log</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official College Placement Cell & Inbound Company Skill Gap Notices */}
      <InstitutionalStudentNoticeCard 
        studentEmail={user?.email || persona.email || 'indrajitjena308@gmail.com'} 
      />

      {/* How Evaluation Works */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Candidate Evaluation Flow</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              How Your Readiness &amp; Compatibility Scores Are Computed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your profile adapts as you verify project code, practice mock interviews, and complete prerequisite labs.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0 self-start sm:self-auto font-medium">
            Active Workflow
          </span>
        </div>

        {/* 6-Stage Loop Visualizer */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 font-mono text-xs">
          {[
            { step: '1. Profile Baseline', desc: 'Verified skills & codebase projects', color: 'border-slate-200 bg-slate-50/70 text-slate-900' },
            { step: '2. Role Match', desc: 'Evaluation against job criteria', color: 'border-slate-200 bg-slate-50/70 text-slate-900' },
            { step: '3. Skill Gaps', desc: 'Identifies missing prerequisites', color: 'border-slate-200 bg-slate-50/70 text-slate-900' },
            { step: '4. Practice Session', desc: 'Adaptive mock technical interviews', color: 'border-slate-200 bg-slate-50/70 text-slate-900' },
            { step: '5. Rubric Review', desc: 'Actionable feedback & scoring', color: 'border-slate-200 bg-slate-50/70 text-slate-900' },
            { step: '6. Readiness Update', desc: 'Recalculated match confidence', color: 'border-slate-200 bg-slate-50/70 text-slate-900' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${item.color} space-y-1 relative`}>
              <div className="font-bold flex items-center justify-between text-[11px]">
                <span>{item.step}</span>
                {idx < 5 && <span className="hidden lg:inline text-slate-400 font-sans">→</span>}
              </div>
              <p className="text-[10px] font-sans text-slate-600 leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Readiness Index</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getScoreBadgeClass(readiness)}`}>
              {readiness >= 75 ? 'Safe Fit' : readiness >= 50 ? 'Stretch' : 'Reach'}
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {readiness}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Role prerequisite mastery</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Resume Audit</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getScoreBadgeClass(atsScore)}`}>
              {atsScore >= 75 ? 'Strong' : atsScore >= 50 ? 'Moderate' : 'Needs Review'}
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {atsScore}<span className="text-lg font-normal text-slate-400">/100</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Section and keyword coverage</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Eligible Roles</span>
            <span className="text-xs font-semibold text-slate-600">Verified</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {activeJobsCount} <span className="text-base font-normal text-slate-500">Openings</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Detailed skill ledger</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Placement Status</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Campus Cohort
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {atRiskStudentsCount} <span className="text-base font-normal text-slate-500">Alerts</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Institutional placement notices</div>
        </div>
      </div>

      {/* 3. Resume Ingestion & Dynamic Calibration Studio */}
      <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Profile Calibration
              </span>
              <span className="text-xs text-slate-500">Automated Skill Ingestion</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Upload Resume to Evaluate Role Readiness
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
              Extract technical skills, compute match percentages across active company openings, and identify missing prerequisites.
            </p>
          </div>

          {isCustomProfile && user && (
            <button
              type="button"
              onClick={handleResetProfile}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Reset back to standard benchmark candidate"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset to Standard Profile</span>
            </button>
          )}
        </div>

        {/* Active Candidate Status Ribbon */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center text-base font-bold shrink-0">
              {(user && persona.name ? persona.name : candidateProfile.name).split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  {user && persona.name ? persona.name : candidateProfile.name}
                </span>
                {user ? (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                    persona.accountType === 'INSTITUTION_ID'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : persona.accountType === 'COMPANY_ID'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <Check className="w-3 h-3" />
                    {persona.badge}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-700" />
                    Preview Mode (Sign In to Upload)
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Org / Role: <strong className="text-slate-800">{user && persona.organization ? persona.organization : candidateProfile.targetRole}</strong></span>
                <span className="text-slate-300">•</span>
                <span>{user ? (persona.email || user.email) : candidateProfile.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
            <div>
              <div className="text-[11px] text-slate-500">Readiness Score</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {readiness}%
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            <div>
              <div className="text-[11px] text-slate-500">ATS Rating</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {atsScore}/100
              </div>
            </div>
          </div>
        </div>

        {/* Upload Dropzone - Protected by Authentication */}
        {user ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2.5 ${
              isDragOver
                ? 'border-slate-600 bg-slate-50'
                : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
              ) : (
                <UploadCloud className="w-6 h-6 text-slate-700" />
              )}
            </div>

            <div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">
                {isUploading ? 'Parsing Resume & Calibrating Profile...' : 'Drop your resume here, or click to browse'}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports PDF, DOCX, or plain text (Max 10MB)
              </p>
            </div>

            {isUploading && (
              <div className="max-w-xs mx-auto space-y-1.5 pt-2">
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                  <div className="bg-slate-900 h-1 rounded-full animate-pulse w-full" />
                </div>
                <div className="text-xs text-slate-600">
                  {uploadProgressStage}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Locked Dropzone State for Unauthenticated Visitors */
          <div
            onClick={() => setIsAuthModalOpen(true)}
            className="p-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 transition-all cursor-pointer text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-600 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6 text-slate-700" />
            </div>

            <div>
              <div className="text-base font-bold text-slate-900">
                Sign In Required to Upload Resumes
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                Guest accounts cannot upload files or mutate candidate profile data. Sign in or use the 1-Click Demo Login to upload your resume (.PDF, .DOCX, .TXT) and unlock real-time calibration.
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsAuthModalOpen(true); }}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition inline-flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Unlock Uploads</span>
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {uploadError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccessMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{uploadSuccessMessage}</span>
          </div>
        )}

        {/* Quick-Test with Pre-Built Resumes */}
        <div className="pt-1 space-y-2.5">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Or test with reference engineering profiles:</span>
            <span className="text-[11px] text-slate-400 normal-case font-normal">
              {user ? 'Instant calibration' : 'Sign In Required'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_RESUMES.map(sample => (
              <button
                key={sample.id}
                type="button"
                disabled={isUploading}
                onClick={() => handleSampleClick(sample)}
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 hover:border-slate-300 transition text-left group space-y-1 relative"
              >
                {!user && (
                  <div className="absolute top-3 right-3 text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="text-xs font-bold text-slate-900 group-hover:text-slate-700 transition truncate pr-5">
                  {sample.title}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {sample.subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Core Platform Capabilities Suite */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Platform Modules &amp; Diagnostics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Technical skill evaluation, interview preparation, and placement coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.id}
                href={cap.href}
                className="p-5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {cap.metricBadge}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{cap.category}</div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-slate-700 transition mt-0.5">
                      {cap.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {cap.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{cap.metric}</span>
                  <div className="flex items-center gap-1 font-medium text-slate-500 group-hover:text-slate-900 transition">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. GitHub Verified Code Radar */}
      <GitHubSkillRadarSection 
        onSyncSuccess={refreshState} 
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Modals & Drawers */}
      <CareerDigitalTwinModal
        isOpen={isDigitalTwinOpen}
        onClose={() => setIsDigitalTwinOpen(false)}
      />

      <GovernanceEventStreamDrawer
        isOpen={isGovernanceOpen}
        onClose={() => setIsGovernanceOpen(false)}
      />
    </div>
  );
}
