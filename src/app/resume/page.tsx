'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Save, 
  Upload,
  Zap,
  TrendingUp,
  Info,
  Eye,
  Check,
  CheckCheck,
  X,
  Sliders,
  Cpu
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { CandidateResume, HitlBulletProposal, ATSComplianceIssue } from '@/lib/types/resume';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';
import { eventBus } from '@/lib/engine/EventBus';
import { ContextualFeedback } from '@/components/feedback/ContextualFeedback';

export default function ResumeOptimizationPage() {
  const [resume, setResume] = useState<CandidateResume>(candidateIntelligenceEngine.getCandidateResume());
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
  const [modifiedText, setModifiedText] = useState('');
  const [activeTab, setActiveTab] = useState<'hitl' | 'reverse_ats' | 'ats_report' | 'raw_ast'>('hitl');
  const [selectedAtsEngine, setSelectedAtsEngine] = useState<'workday' | 'lever' | 'greenhouse'>('workday');
  const [isApprovalDrawerOpen, setIsApprovalDrawerOpen] = useState(false);
  const [riskFilter, setRiskFilter] = useState<'all' | 'low_risk_ats' | 'strategic_overhaul'>('all');
  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  const refreshState = () => {
    setResume({ ...candidateIntelligenceEngine.getCandidateResume() });
  };

  useEffect(() => {
    refreshState();
    const unsubscribeResume = eventBus.subscribe('RESUME_BULLET_ACCEPTED', () => refreshState());
    const unsubscribeUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', () => refreshState());
    const unsubscribeReset = eventBus.subscribe('CANDIDATE_PROFILE_RESET', () => refreshState());

    return () => {
      unsubscribeResume();
      unsubscribeUpload();
      unsubscribeReset();
    };
  }, []);

  const handleDecision = (bulletId: string, decision: 'accepted' | 'rejected' | 'modified') => {
    if (decision === 'modified') {
      candidateIntelligenceEngine.handleBulletDecision(bulletId, 'modified', modifiedText);
      setEditingBulletId(null);
      setModifiedText('');
    } else {
      candidateIntelligenceEngine.handleBulletDecision(bulletId, decision);
    }
    refreshState();
  };

  const handleBatchDecision = (filter: 'all_low_risk' | 'all_pending' | 'strategic_only', decision: 'accepted' | 'rejected') => {
    const result = candidateIntelligenceEngine.handleBatchBulletDecision(filter, decision);
    setBatchMessage(`Batch ${decision} processed for ${result.processedCount} items (Audit Ledger Hash: ${result.batchHash})`);
    setTimeout(() => setBatchMessage(null), 6000);
    refreshState();
  };

  const startEdit = (proposal: HitlBulletProposal) => {
    setEditingBulletId(proposal.id);
    setModifiedText(proposal.suggestedBullet);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              Resume Verification
            </span>
            <span className="text-slate-500 text-xs">• Applicant Tracking System Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Resume Experience Review &amp; ATS Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Audit experience bullet points against enterprise applicant tracking parsers (Workday, Lever, Greenhouse) and confirm quantitative impact refinements before profile sync.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Active Resume Source:</span>
            <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-semibold truncate max-w-md">
              {resume.title}
            </span>
            {candidateIntelligenceEngine.isCustomProfile() && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                ✓ Uploaded File Ingested
              </span>
            )}
          </div>
        </div>

        {/* ATS Score Dial Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-mono font-medium">Calculated ATS Score</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {resume.atsAnalysis.overallScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="text-right border-l border-slate-200 pl-4 space-y-1 text-xs">
            <div className="text-slate-600">Parsability: <strong className="text-slate-900 font-mono">{resume.atsAnalysis.parsabilityScore}%</strong></div>
            <div className="text-slate-600">Keyword Match: <strong className="text-slate-900 font-mono">{resume.atsAnalysis.keywordMatchScore}%</strong></div>
          </div>
        </div>
      </div>

      {/* Strict Guardrail Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-700">
          <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0" />
          <span>
            <strong className="text-slate-900">Zero Unilateral Changes:</strong> Experience bullet points will never be updated without your explicit review and sign-off.
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
          CANDIDATE_CONSENT_ENFORCED
        </span>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('hitl')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'hitl'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Bullet Review ({resume.bulletProposals.filter(p => p.status === 'pending').length} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('reverse_ats')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'reverse_ats'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Side-by-Side ATS Parser</span>
          </button>

          <button
            onClick={() => setActiveTab('ats_report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'ats_report'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Parser Diagnostics ({resume.atsAnalysis.complianceIssues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('raw_ast')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'raw_ast'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>AST Schema</span>
          </button>
        </div>

        <button
          onClick={() => setIsApprovalDrawerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition shadow-xs cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-600" />
          <span>Approval Queue ({resume.bulletProposals.filter(p => p.status === 'pending').length})</span>
        </button>
      </div>

      {/* Tab 1: HITL Bullet Review Pipeline */}
      {activeTab === 'hitl' && (
        <div className="space-y-4">
          {/* Batch Review Action Controls */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Batch Review Operations
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  AUDITED
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Categorize proposals by risk level to review routine ATS optimizations en-masse while retaining deep oversight for strategic claims.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBatchDecision('all_low_risk', 'accepted')}
                disabled={resume.bulletProposals.filter(p => p.status === 'pending' && p.riskTier === 'low_risk_ats').length === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Accept All Low-Risk ATS Fixes ({resume.bulletProposals.filter(p => p.status === 'pending' && p.riskTier === 'low_risk_ats').length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRiskFilter('strategic_overhaul')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Strategic Overhauls ({resume.bulletProposals.filter(p => p.status === 'pending' && p.riskTier === 'strategic_overhaul').length})
                </span>
              </button>
            </div>
          </div>

          {/* Batch Status Message */}
          {batchMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{batchMessage}</span>
            </div>
          )}

          {/* Risk Level Filter Tabs */}
          <div className="flex items-center gap-2 pt-1 pb-1 flex-wrap">
            <span className="text-xs text-slate-500 font-mono font-medium">Filter Category:</span>
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                riskFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Proposals ({resume.bulletProposals.length})
            </button>
            <button
              onClick={() => setRiskFilter('low_risk_ats')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                riskFilter === 'low_risk_ats'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Low-Risk ATS ({resume.bulletProposals.filter(p => p.riskTier === 'low_risk_ats').length})
            </button>
            <button
              onClick={() => setRiskFilter('strategic_overhaul')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                riskFilter === 'strategic_overhaul'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Strategic Overhauls ({resume.bulletProposals.filter(p => p.riskTier === 'strategic_overhaul').length})
            </button>
          </div>

          {resume.bulletProposals
            .filter(p => riskFilter === 'all' || p.riskTier === riskFilter)
            .map((proposal) => {
            const isEditing = editingBulletId === proposal.id;
            const isPending = proposal.status === 'pending';
            const isAccepted = proposal.status === 'accepted';
            const isModified = proposal.status === 'modified';
            const isRejected = proposal.status === 'rejected';

            return (
              <div
                key={proposal.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-white border-slate-200 shadow-xs'
                    : isAccepted || isModified
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {/* Proposal Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{proposal.experienceId}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-indigo-700 font-mono font-medium">
                      Target: {proposal.targetedSkillName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      proposal.riskTier === 'low_risk_ats'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    }`}>
                      {proposal.riskTier === 'low_risk_ats' ? 'LOW-RISK ATS FIX' : 'STRATEGIC OVERHAUL'}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                      isPending
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : isAccepted || isModified
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {proposal.status.toUpperCase()}
                    </span>

                    <DataProvenanceBadge
                      level={proposal.provenance.level}
                      source={proposal.provenance.source}
                      metadata={proposal.provenance}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Diff Comparison: Original vs Suggested */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  {/* Original Bullet */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
                      Current Draft (Unoptimized)
                    </span>
                    <p className="text-xs text-slate-500 line-through decoration-rose-400/80 leading-relaxed">
                      {proposal.originalBullet}
                    </p>
                  </div>

                  {/* AI Suggested Bullet */}
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-indigo-900 uppercase font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Proposed Refinement (Quantified Impact)
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={modifiedText}
                          onChange={(e) => setModifiedText(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 rounded-lg bg-white border border-indigo-300 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingBulletId(null)}
                            className="px-3 py-1 rounded text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecision(proposal.id, 'modified')}
                            className="px-3 py-1 rounded text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                          >
                            Save &amp; Accept
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-900 font-medium leading-relaxed">
                        {proposal.userModifiedText || proposal.suggestedBullet}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantitative Impact Rationale */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500">Metric Added:</span>{' '}
                    <strong className="text-emerald-800 font-mono">{proposal.quantifiedImpactAdded}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Action Verb:</span>{' '}
                    <strong className="text-indigo-800">{proposal.actionVerbEnhanced}</strong>
                  </div>
                </div>

                {/* Immutable Provenance Audit Ledger */}
                {(isAccepted || isModified) && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-emerald-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Audit Record</span>
                      </span>
                      <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        COMMITTED_TO_PROFILE
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 text-[10px]">
                      <div>Decision: <strong className="text-slate-900 uppercase">{proposal.status}</strong></div>
                      <div>Parser Engine: <strong className="text-slate-900">AURA-ResumeAST-v3.0</strong></div>
                      <div>Audit Fingerprint: <strong className="text-slate-800">{proposal.provenance.auditHash || '0xhitl_77921a'}</strong></div>
                      <div>Committed At: <strong className="text-slate-600">{proposal.confirmedAt || '2026-09-28'}</strong></div>
                    </div>
                  </div>
                )}

                {/* Candidate Approval Action Toolbar */}
                {isPending && !isEditing && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(proposal.id, 'rejected')}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(proposal)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Modify</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecision(proposal.id, 'accepted')}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Accept &amp; Save</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: ATS Diagnostics */}
      {activeTab === 'ats_report' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-medium">Parsability Index</div>
              <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
                {resume.atsAnalysis.parsabilityScore} / 100
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Linear header &amp; font compliance</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-medium">JD Keyword Density</div>
              <div className="text-3xl font-extrabold font-mono text-emerald-700 mt-1">
                {resume.atsAnalysis.keywordMatchScore} / 100
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Distributed systems terminology alignment</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-medium">Format Warnings</div>
              <div className="text-3xl font-extrabold font-mono text-amber-700 mt-1">
                {resume.atsAnalysis.complianceIssues.filter(i => i.severity === 'critical').length} Critical
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Table layout and header flags</p>
            </div>
          </div>

          <div className="space-y-3">
            {resume.atsAnalysis.complianceIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      issue.severity === 'critical'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : issue.severity === 'warning'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-sky-50 text-sky-800 border border-sky-200'
                    }`}>
                      {issue.severity}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{issue.title}</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{issue.category}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {issue.description}
                </p>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div><strong>ATS Scanner Impact:</strong> {issue.impactOnParsers}</div>
                  <div className="text-indigo-800"><strong>Recommended Fix:</strong> {issue.fixRecommendation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Reverse ATS Parser Simulator */}
      {activeTab === 'reverse_ats' && (
        <div className="space-y-6">
          {/* Engine Selector Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                  Reverse ATS Simulator
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  DUAL-PLANE COMPARISON
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Compare raw machine-extracted plain-text parsing vs. human recruiter typography &amp; layout.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-mono text-slate-500 pl-2">ATS Engine:</span>
              {(['workday', 'lever', 'greenhouse'] as const).map(engine => (
                <button
                  key={engine}
                  type="button"
                  onClick={() => setSelectedAtsEngine(engine)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase transition cursor-pointer ${
                    selectedAtsEngine === engine
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {engine}
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-Side Dual-Plane Rendering Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Pane: Machine Parsing View */}
            <div className="lg:col-span-6 rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4 font-mono text-slate-300 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>{selectedAtsEngine.toUpperCase()} AST Raw Buffer</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  98.4% Parsability
                </span>
              </div>

              {/* Parsed JSON Token Extraction Diagnostics */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 text-slate-300">
                <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                  Extracted Header Metadata
                </div>
                <div className="text-slate-400 text-xs space-y-0.5">
                  <div>&gt; CANDIDATE: <span className="text-white font-bold">{candidateIntelligenceEngine.getProfile().name}</span></div>
                  <div>&gt; EMAIL: <span className="text-indigo-400">{candidateIntelligenceEngine.getProfile().email}</span></div>
                  <div>&gt; TARGET_TITLE: <span className="text-white">{candidateIntelligenceEngine.getProfile().targetRole}</span></div>
                  <div>&gt; PARSER_FORMAT: <span className="text-emerald-400">Single-Column Plain-Text Stream</span></div>
                </div>
              </div>

              {/* Detected Entities / Keyword Vectors */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Extracted Skill Entities &amp; Confidence:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Python', score: 99 },
                    { name: 'Redis Caching', score: 96 },
                    { name: 'Distributed Systems', score: 94 },
                    { name: 'PostgreSQL', score: 91 },
                    { name: 'Kubernetes', score: 88 },
                    { name: 'Docker', score: 87 },
                    { name: 'Kafka', score: 84 },
                    { name: 'System Design', score: 92 },
                  ].map(kw => (
                    <span
                      key={kw.name}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200"
                    >
                      {kw.name} <strong className="text-emerald-400">({kw.score}%)</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Raw Machine Plaintext Feed */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Stripped Plaintext Stream:
                </div>
                <pre className="p-3.5 rounded-xl bg-black border border-slate-800 text-[11px] text-emerald-400/90 leading-relaxed overflow-x-auto max-h-72 whitespace-pre-wrap font-mono">
{`--- ATS RAW STREAM [ENGINE: ${selectedAtsEngine.toUpperCase()}] ---
CANDIDATE: ${candidateIntelligenceEngine.getProfile().name}
EXPERIENCE_BLOCK: Senior Distributed Systems Architect
BULLET_01: Architected and scaled distributed caching layer using Redis Cluster and Cache-Aside pattern, reducing P99 latency by 42% across 50,000 req/sec.
BULLET_02: Implemented event-driven message bus via Kafka partition rebalancing, preventing consumer lag spikes during peak flash sales.
EDUCATION: Parala Maharaja Engineering College (PMEC) - B.Tech CSE (CGPA: 8.85)
CORE_SKILLS: Python, PostgreSQL, Redis, Kubernetes, Distributed Systems, gRPC
PARSER_VALIDATION: UTF-8 Compliant | 0 Unrecognized Glyphs | 0 Hidden Column Traps`}
                </pre>
              </div>
            </div>

            {/* Right Pane: Human Recruiter Visual Render */}
            <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-6 space-y-5 text-slate-800 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase font-mono">
                  <Eye className="w-4 h-4 text-indigo-700" />
                  <span>Human Recruiter Visual Render</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                  Recruiter Impression: HIGH IMPACT
                </span>
              </div>

              {/* Clean Human Resume Layout */}
              <div className="space-y-4 text-left">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {candidateIntelligenceEngine.getProfile().name}
                  </h2>
                  <div className="text-xs text-indigo-700 font-medium mt-0.5">
                    {candidateIntelligenceEngine.getProfile().targetRole} • {candidateIntelligenceEngine.getProfile().email}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Systems engineer specializing in high-throughput distributed microservices, low-latency relational data stores, and event-driven architectures.
                  </p>
                </div>

                {/* Experience Section */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                    Work Experience
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>Distributed Systems Engineer • Apex Cloud Labs</span>
                      <span className="text-slate-500 font-mono text-[11px]">2024 - Present</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed text-[11px]">
                      <li>
                        Architected and scaled distributed caching layer using <strong className="text-slate-900">Redis Cluster</strong> and Cache-Aside pattern, reducing P99 latency by <strong>42%</strong> across 50,000 req/sec.
                      </li>
                      <li>
                        Designed event-driven streaming pipeline utilizing <strong className="text-slate-900">Kafka</strong> and PostgreSQL WAL replication, ensuring zero-loss message processing.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Skills Visual Badges */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                    Core Technical Competencies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Python', 'PostgreSQL', 'Redis Cluster', 'Kubernetes', 'Distributed Systems', 'gRPC', 'Kafka', 'Docker'].map(skillName => (
                      <span
                        key={skillName}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium"
                      >
                        {skillName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <div className="font-semibold text-slate-900">Parala Maharaja Engineering College (PMEC)</div>
                  <div className="text-slate-500 text-[11px]">B.Tech in Computer Science &amp; Engineering • CGPA: 8.85 / 10</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AST Schema */}
      {activeTab === 'raw_ast' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Abstract Syntax Tree (AST) Section Mapping
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Parsed from Linear Buffer
            </span>
          </div>

          <div className="space-y-3">
            {resume.atsAnalysis.detectedSections.map((sec) => (
              <div key={sec.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 font-mono">{sec.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold">
                    Standard ATS Header
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-mono bg-white p-2.5 rounded border border-slate-200 overflow-x-auto">
                  {sec.parsedItems.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* One-Click Candidate Approval Drawer */}
      {isApprovalDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full bg-white border-l border-slate-200 p-6 flex flex-col space-y-4 shadow-2xl overflow-y-auto text-slate-900">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    Candidate Approval Queue
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    CONSENT_GATEWAY
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Pending Bullet Enhancements</h2>
                <p className="text-xs text-slate-500">
                  Explicit candidate confirmation required before changes commit to your profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsApprovalDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action: Approve All Low-Risk Fixes */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-700">
                <strong className="text-slate-900">Batch Sign-Off:</strong> Approve verified formatting and keyword fixes.
              </div>
              <button
                type="button"
                onClick={() => {
                  handleBatchDecision('all_low_risk', 'accepted');
                }}
                disabled={resume.bulletProposals.filter(p => p.status === 'pending' && p.riskTier === 'low_risk_ats').length === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Approve All Low-Risk</span>
              </button>
            </div>

            {/* Staged Proposals List */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {resume.bulletProposals
                .filter(p => p.status === 'pending')
                .map(proposal => (
                  <div
                    key={proposal.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-900 font-bold">{proposal.experienceId}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        proposal.riskTier === 'low_risk_ats'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}>
                        {proposal.riskTier === 'low_risk_ats' ? 'Low-Risk ATS' : 'Strategic Overhaul'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Proposed Refinement:</div>
                      <div className="text-slate-900 font-medium leading-relaxed">{proposal.suggestedBullet}</div>
                    </div>

                    {/* 1-Click Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDecision(proposal.id, 'rejected')}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-800 text-xs font-semibold cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleDecision(proposal.id, 'accepted');
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sign-Off &amp; Commit</span>
                      </button>
                    </div>
                  </div>
                ))}

              {resume.bulletProposals.filter(p => p.status === 'pending').length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <div>All proposals have been reviewed and committed to your canonical profile!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contextual Feedback on Resume ATS Analysis */}
      <div className="pt-4 border-t border-slate-200">
        <ContextualFeedback
          featureType="resume_analysis"
          featureId={resume.id || 'current_resume'}
          aiOutputId={`resume_ats_${resume.atsAnalysis.overallScore}`}
          careerGoal={candidateIntelligenceEngine.getProfile().targetRole}
          compact={true}
        />
      </div>
    </div>
  );
}
