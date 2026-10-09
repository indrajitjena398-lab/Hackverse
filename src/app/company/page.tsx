'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  Filter, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Lock, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Users,
  Briefcase,
  Star,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';
import { CompanyRoleDispatchSection } from '@/components/placements/CompanyRoleDispatchSection';

interface TalentCandidate {
  id: string;
  codeName: string;
  institutionName: string;
  degree: string;
  graduationYear: number;
  targetRole: string;
  readinessScore: number;
  atsIndex: number;
  verifiedSkills: { name: string; score: number; evidenceCount: number }[];
  projectHighlight: string;
  provenanceHash: string;
  isUnlocked: boolean;
}

const INITIAL_TALENT_POOL: TalentCandidate[] = [
  {
    id: 'cand-anon-01',
    codeName: 'Candidate #8821',
    institutionName: 'Stanford University (CS)',
    degree: 'B.S. Computer Science',
    graduationYear: 2024,
    targetRole: 'Senior Distributed Systems Engineer',
    readinessScore: 89,
    atsIndex: 94,
    verifiedSkills: [
      { name: 'Distributed Consensus (Raft)', score: 94, evidenceCount: 3 },
      { name: 'FastAPI / AsyncIO', score: 92, evidenceCount: 4 },
      { name: 'PostgreSQL Advanced Indexing', score: 90, evidenceCount: 2 },
      { name: 'Kafka Event Pipelines', score: 88, evidenceCount: 3 },
    ],
    projectHighlight: 'Implemented zero-split-brain Raft replicator with sub-10ms commit latency under partition stress tests.',
    provenanceHash: '0xprov_cand_8821a',
    isUnlocked: false,
  },
  {
    id: 'cand-anon-02',
    codeName: 'Candidate #9104',
    institutionName: 'Parala Maharaja Engineering College (PMEC)',
    degree: 'B.Tech Electrical & Computer Engineering',
    graduationYear: 2025,
    targetRole: 'Backend Systems & Cloud Engineer',
    readinessScore: 86,
    atsIndex: 91,
    verifiedSkills: [
      { name: 'Python / Microservices', score: 95, evidenceCount: 5 },
      { name: 'Redis Caching & PubSub', score: 89, evidenceCount: 3 },
      { name: 'Docker & Kubernetes (CKAD)', score: 87, evidenceCount: 2 },
      { name: 'SQL Query Optimization', score: 92, evidenceCount: 4 },
    ],
    projectHighlight: 'Architected async payment ingestion pipeline handling 15,000 events/sec with 99.98% benchmarked uptime.',
    provenanceHash: '0xprov_cand_9104b',
    isUnlocked: false,
  },
  {
    id: 'cand-anon-03',
    codeName: 'Candidate #7432',
    institutionName: 'Carnegie Mellon University',
    degree: 'M.S. Machine Learning Systems',
    graduationYear: 2024,
    targetRole: 'AI Platform & Retrieval Systems Engineer',
    readinessScore: 92,
    atsIndex: 96,
    verifiedSkills: [
      { name: 'Vector DBs (Milvus/Pinecone)', score: 96, evidenceCount: 4 },
      { name: 'RAG Architectures', score: 95, evidenceCount: 3 },
      { name: 'Agentic AI Workflows', score: 91, evidenceCount: 2 },
      { name: 'PyTorch Model Serving', score: 89, evidenceCount: 3 },
    ],
    projectHighlight: 'Scaled semantic hybrid search over 40M vector chunks reducing query latency by 52%.',
    provenanceHash: '0xprov_cand_7432c',
    isUnlocked: false,
  },
  {
    id: 'cand-anon-04',
    codeName: 'Candidate #6519',
    institutionName: 'Parala Maharaja Engineering College (PMEC)',
    degree: 'B.Tech Computer Science',
    graduationYear: 2025,
    targetRole: 'Full-Stack Performance Engineer',
    readinessScore: 83,
    atsIndex: 88,
    verifiedSkills: [
      { name: 'TypeScript & Next.js', score: 91, evidenceCount: 4 },
      { name: 'Relational DB Modeling', score: 87, evidenceCount: 3 },
      { name: 'REST & GraphQL APIs', score: 89, evidenceCount: 3 },
      { name: 'WebSockets Multiplayer State', score: 84, evidenceCount: 2 },
    ],
    projectHighlight: 'Built real-time collaborative interactive canvas running at 60 FPS under 1,000 simultaneous active objects.',
    provenanceHash: '0xprov_cand_6519d',
    isUnlocked: false,
  },
];

export default function CompanyRecruiterPortalPage() {
  const { user, persona, signInAsCompanyPartner } = useAuth();
  const [candidates, setCandidates] = useState<TalentCandidate[]>(INITIAL_TALENT_POOL);
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState<number>(80);
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null);
  const [outreachSuccess, setOutreachSuccess] = useState<string | null>(null);

  const [localCompanyActive, setLocalCompanyActive] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('aura_active_role');
      if (role === 'COMPANY_RECRUITER' || role === 'SUPER_ADMIN') {
        setLocalCompanyActive(true);
      }
    }
  }, []);

  const isCompanyRecruiter = 
    persona.userRole === 'COMPANY_RECRUITER' || 
    persona.userRole === 'SUPER_ADMIN' ||
    persona.accountType === 'COMPANY_ID' ||
    localCompanyActive;

  const handleUnlockCandidate = (candidateId: string) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, isUnlocked: true } : c));
    setOutreachSuccess(`Direct encrypted communication channel opened with ${candidateId}. Recruiter invitation sent.`);
    setTimeout(() => setOutreachSuccess(null), 4000);
  };

  // If unauthorized, prompt recruiter login
  if (!isCompanyRecruiter) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 mx-auto flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Company Recruiter Portal
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              This talent discovery engine is restricted to authorized Corporate Recruiters and Talent Acquisition Partners. You are currently browsing as <strong>{persona.name || 'Guest'}</strong> ({persona.userRole}).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Recruiter Capabilities:</span>
            </div>
            <ul className="text-slate-600 space-y-1 list-disc pl-4 text-[11px]">
              <li>Filter candidates by verified skill mastery and evidence counts</li>
              <li>Inspect cryptographic proof hashes for audited technical scores</li>
              <li>Direct outreach to high-readiness students across college domains</li>
              <li>Respects student privacy: PII protected prior to mutual match</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={async () => {
              await signInAsCompanyPartner();
              setLocalCompanyActive(true);
              window.location.reload();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
          >
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>1-Click Authenticate as Company Recruiter</span>
          </button>

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
              ← Return to Candidate Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = 
      !searchQuery || 
      cand.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.verifiedSkills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesScore = cand.readinessScore >= minScore;
    return matchesSearch && matchesScore;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Enterprise Talent Engine
            </span>
            <span className="text-slate-400 text-xs">• Verified Candidate Sourcing &amp; Skill Ledgers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Company Recruiter Talent Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Source high-readiness engineering talent with cryptographically verified skills, CAT mock interview benchmarks, and anonymized project portfolios.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <div className="text-[10px] text-slate-500 font-mono">Recruiter Organization</div>
            <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
              {persona.organization}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 1: Corporate Role Match & Institution Dispatch Section */}
      <CompanyRoleDispatchSection />

      {outreachSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{outreachSuccess}</span>
        </div>
      )}

      {/* Sourcing Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by skill (Raft, Kafka, Python), role (Distributed Systems), or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <span className="text-xs font-mono text-slate-500">Min Readiness:</span>
          {[70, 80, 85, 90].map(score => (
            <button
              key={score}
              onClick={() => setMinScore(score)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                minScore === score
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {score}%+
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCandidates.map((cand) => (
          <div
            key={cand.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{cand.codeName}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      Class of {cand.graduationYear}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {cand.institutionName} • {cand.degree}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-mono">Readiness</div>
                  <div className="text-lg font-extrabold text-emerald-700 font-mono">
                    {cand.readinessScore}%
                  </div>
                </div>
              </div>

              {/* Target Role & ATS Score */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-600 font-medium">Target: <strong className="text-slate-900">{cand.targetRole}</strong></span>
                <span className="text-slate-500 font-mono">ATS Index: <strong className="text-slate-800">{cand.atsIndex}/100</strong></span>
              </div>

              {/* Verified Competencies */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                  Audited Skill Competencies:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {cand.verifiedSkills.map((sk, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-800 font-medium truncate pr-1">{sk.name}</span>
                      <span className="text-indigo-600 font-mono font-bold text-[11px] shrink-0">
                        {sk.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Highlight */}
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed space-y-1">
                <div className="font-semibold text-indigo-900 text-[11px] flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Verified Project Implementation:</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {cand.projectHighlight}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                Hash: {cand.provenanceHash}
              </span>

              {cand.isUnlocked ? (
                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Outreach Sent</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUnlockCandidate(cand.id)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Initiate Recruiter Outreach</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
