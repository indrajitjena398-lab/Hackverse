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
  Info
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { CandidateResume, HitlBulletProposal, ATSComplianceIssue } from '@/lib/types/resume';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';
import { eventBus } from '@/lib/engine/EventBus';

export default function ResumeOptimizationPage() {
  const [resume, setResume] = useState<CandidateResume>(candidateIntelligenceEngine.getCandidateResume());
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
  const [modifiedText, setModifiedText] = useState('');
  const [activeTab, setActiveTab] = useState<'hitl' | 'ats_report' | 'raw_ast'>('hitl');

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

  const startEdit = (proposal: HitlBulletProposal) => {
    setEditingBulletId(proposal.id);
    setModifiedText(proposal.suggestedBullet);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel-elevated border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              Module 5 Specification
            </span>
            <span className="text-slate-500 text-xs">• ATS AST Simulator &amp; Human-In-The-Loop Rewrite Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Human-In-The-Loop Resume Optimization &amp; ATS Simulator
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Strict human oversight guardrail: AI suggests high-impact, quantified XYZ bullet rewrites, but requires explicit candidate confirmation (&quot;Accept&quot;, &quot;Reject&quot;, &quot;Modify&quot;) before updating the candidate store.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Active Resume Source:</span>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold truncate max-w-md">
              {resume.title}
            </span>
            {candidateIntelligenceEngine.isCustomProfile() && (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[11px] font-bold">
                ✓ Uploaded File Ingested
              </span>
            )}
          </div>
        </div>

        {/* ATS Score Dial Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-mono">Calculated ATS Score</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-3xl font-black font-mono ${
                resume.atsAnalysis.overallScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {resume.atsAnalysis.overallScore}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="text-right border-l border-slate-800 pl-4 space-y-1 text-xs">
            <div className="text-slate-400">Parsability: <strong className="text-white font-mono">{resume.atsAnalysis.parsabilityScore}%</strong></div>
            <div className="text-slate-400">Keyword Match: <strong className="text-white font-mono">{resume.atsAnalysis.keywordMatchScore}%</strong></div>
          </div>
        </div>
      </div>

      {/* Strict Guardrail Notice */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 text-xs text-indigo-300">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>
            <strong>Zero Unilateral AI Edits Protocol:</strong> Your profile and resume records will NEVER be altered without manual user confirmation. Every suggested enhancement remains quarantined until explicitly accepted.
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
          GUARDRAIL_ENFORCED
        </span>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('hitl')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'hitl'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>HITL Bullet Review ({resume.bulletProposals.filter(p => p.status === 'pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('ats_report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'ats_report'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>ATS Parseability &amp; Format Diagnostics ({resume.atsAnalysis.complianceIssues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('raw_ast')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'raw_ast'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Extracted AST Schema</span>
        </button>
      </div>

      {/* Tab 1: HITL Bullet Review Pipeline */}
      {activeTab === 'hitl' && (
        <div className="space-y-4">
          {resume.bulletProposals.map((proposal) => {
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
                    ? 'glass-panel border-indigo-900/50 shadow-md'
                    : isAccepted || isModified
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Proposal Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{proposal.experienceId}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-indigo-400 font-mono">
                      Target: {proposal.targetedSkillName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                      isPending
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                        : isAccepted || isModified
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
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
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
                      Current Draft (Unoptimized)
                    </span>
                    <p className="text-xs text-slate-300 line-through decoration-rose-500/70 leading-relaxed">
                      {proposal.originalBullet}
                    </p>
                  </div>

                  {/* AI Suggested Bullet */}
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-700/60 space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-indigo-300 uppercase font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        AI Enhanced Proposal (Quantified XYZ Impact)
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={modifiedText}
                          onChange={(e) => setModifiedText(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 rounded-lg bg-slate-900 border border-indigo-500 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingBulletId(null)}
                            className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecision(proposal.id, 'modified')}
                            className="px-3 py-1 rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                          >
                            Save &amp; Accept
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-white font-medium leading-relaxed">
                        {proposal.userModifiedText || proposal.suggestedBullet}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantitative Impact Rationale */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500">Metric Added:</span>{' '}
                    <strong className="text-emerald-300">{proposal.quantifiedImpactAdded}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Action Verb:</span>{' '}
                    <strong className="text-indigo-300">{proposal.actionVerbEnhanced}</strong>
                  </div>
                </div>

                {/* Candidate Approval Action Toolbar */}
                {isPending && !isEditing && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(proposal.id, 'rejected')}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-rose-950/40 hover:border-rose-700 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(proposal)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modify / Polish</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecision(proposal.id, 'accepted')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept &amp; Commit to Store</span>
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
            <div className="p-5 rounded-xl glass-panel border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Parsability Index</div>
              <div className="text-3xl font-black font-mono text-indigo-400 mt-1">
                {resume.atsAnalysis.parsabilityScore} / 100
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Linear header &amp; font compliance</p>
            </div>

            <div className="p-5 rounded-xl glass-panel border border-slate-800 text-center">
              <div className="text-xs text-slate-400">JD Keyword Density</div>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                {resume.atsAnalysis.keywordMatchScore} / 100
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Distributed systems terminology alignment</p>
            </div>

            <div className="p-5 rounded-xl glass-panel border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Format Violations</div>
              <div className="text-3xl font-black font-mono text-amber-400 mt-1">
                {resume.atsAnalysis.complianceIssues.filter(i => i.severity === 'critical').length} Critical
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Table layout and header flags</p>
            </div>
          </div>

          <div className="space-y-3">
            {resume.atsAnalysis.complianceIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      issue.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : issue.severity === 'warning'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-sky-950 text-sky-300 border border-sky-800'
                    }`}>
                      {issue.severity}
                    </span>
                    <h4 className="text-sm font-bold text-white">{issue.title}</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{issue.category}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {issue.description}
                </p>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                  <div><strong>ATS Scanner Impact:</strong> {issue.impactOnParsers}</div>
                  <div className="text-indigo-300"><strong>Recommended Fix:</strong> {issue.fixRecommendation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AST Schema */}
      {activeTab === 'raw_ast' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Abstract Syntax Tree (AST) Section Mapping
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Parsed from Plaintext Buffer
            </span>
          </div>

          <div className="space-y-3">
            {resume.atsAnalysis.detectedSections.map((sec) => (
              <div key={sec.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-mono">{sec.name}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] font-mono">
                    ISO Standard ATS Header
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-800/60 overflow-x-auto">
                  {sec.parsedItems.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
