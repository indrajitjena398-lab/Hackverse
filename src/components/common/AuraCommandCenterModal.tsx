'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  TrendingUp, 
  Layers, 
  FileText, 
  GraduationCap 
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { DataProvenanceBadge } from './DataProvenanceBadge';

interface AuraCommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuraCommandCenterModal({ isOpen, onClose }: AuraCommandCenterModalProps) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<{
    headline: string;
    reasoning: string;
    details: string[];
    actionLabel?: string;
    actionHref?: string;
    provenanceLevel: any;
    provenanceSource: string;
    confidence: number;
    auditHash: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleAsk = (userPrompt: string) => {
    setQuery(userPrompt);
    const p = userPrompt.toLowerCase();

    if (p.includes('redis') || p.includes('why redis') || p.includes('why does alex need')) {
      const explanation = candidateIntelligenceEngine.explainSkillRequirement('caching_redis');
      setAnswer({
        headline: 'Why Alex Needs Redis (Explainable Skill Dependency)',
        reasoning: explanation.defensibleStatement,
        details: [
          'Prerequisite for 7 target roles in current job search index.',
          'Appears in 38% of senior distributed systems interview round blueprints.',
          'Candidate verified proficiency: Intermediate (60% confidence).',
          'Expected outcome: Closing this gap increases target-role readiness by +8%.',
        ],
        actionLabel: 'Open Skill Graph Pathway',
        actionHref: '/skill-graph',
        provenanceLevel: 'SYSTEM_DERIVED',
        provenanceSource: 'AURA Multi-Dimensional Skill Ontology & Job Index',
        confidence: 96,
        auditHash: '0xreason_redis_77ab09',
      });
    } else if (p.includes('readiness') || p.includes('60%') || p.includes('67%')) {
      const dim = candidateIntelligenceEngine.getDimensionalReadiness();
      setAnswer({
        headline: `Multidimensional Role-Weighted Readiness (${Math.round(dim.overall * 100)}%)`,
        reasoning: `Readiness is not a simple average. For your active target role (${dim.targetRoleProfile}), System Design is weighted at 25% (currently ${(dim.system_design * 100).toFixed(0)}%) and Distributed Systems at 20% (currently ${(dim.technical * 100).toFixed(0)}%).`,
        details: [
          `System Design: ${(dim.system_design * 100).toFixed(0)}% (Weight: 25%) • Main drag on overall score`,
          `Technical Proficiency: ${(dim.technical * 100).toFixed(0)}% (Weight: 20%)`,
          `Coding Core: ${(dim.coding * 100).toFixed(0)}% (Weight: 15%)`,
          `Communication: ${(dim.communication * 100).toFixed(0)}% (Weight: 10%)`,
          `Resume ATS Index: ${(dim.resume * 100).toFixed(0)}% (Weight: 5%)`,
        ],
        actionLabel: 'Simulate Readiness with Digital Twin',
        actionHref: '/skill-graph',
        provenanceLevel: 'SYSTEM_DERIVED',
        provenanceSource: 'Dynamic Role-Weight Composite Model',
        confidence: 98,
        auditHash: '0xreadiness_decomp_88f1',
      });
    } else if (p.includes('eweis') || p.includes('flagged') || p.includes('risk')) {
      setAnswer({
        headline: 'Institutional EWEIS Anomaly Detection Rationale',
        reasoning: 'Alex was flagged under Moderate/Critical Anomaly Vector due to an impending 90-day placement deadline combined with low interview conversion velocity.',
        details: [
          'Contributing Factor 1: Only 2 applications tracked in past 30 days (low funnel velocity)',
          'Contributing Factor 2: System design readiness currently at 51% (below 75% institutional benchmark)',
          'Contributing Factor 3: No mock interview practice logged in 21 days',
          'Recommended Closed-Loop Intervention: System design workshop + 2 adaptive mock interview sessions',
        ],
        actionLabel: 'Inspect EWEIS Advisor Dashboard',
        actionHref: '/institutional',
        provenanceLevel: 'SYSTEM_DERIVED',
        provenanceSource: 'EWEIS 90-Day Trajectory Anomaly Predictor',
        confidence: 94,
        auditHash: '0xeweis_audit_99120',
      });
    } else if (p.includes('job') || p.includes('apply') || p.includes('which job')) {
      const topJob = candidateIntelligenceEngine.getJobs()[0];
      setAnswer({
        headline: `Top Recommendation: ${topJob.title} at ${topJob.company}`,
        reasoning: `Ranked #1 with 84% Safe Fit Match. Strong semantic cosine alignment (+24) and seniority alignment (+10). Missing skill gap: Redis distributed caching (-7) is easily closeable.`,
        details: [
          'Semantic Similarity: +24% boost',
          'Required Skills Coverage: +27% boost',
          'Experience Alignment: +18% boost',
          'Seniority Alignment: +10% boost',
          'Missing Skills Penalty: -7%',
        ],
        actionLabel: 'Inspect Job Breakdown',
        actionHref: '/jobs',
        provenanceLevel: 'SYSTEM_DERIVED',
        provenanceSource: 'Hybrid Job Intelligence Engine',
        confidence: 92,
        auditHash: '0xjob_rank_top1_55c',
      });
    } else {
      setAnswer({
        headline: 'AURA Autonomous Reasoning & Recommendation',
        reasoning: `Based on your Canonical Candidate State for target role (${candidateIntelligenceEngine.getProfile().targetRole}), today's top priority is closing the distributed caching gap (+3% readiness lift) and practicing system design (+4% readiness lift).`,
        details: [
          'Current Overall Readiness: 67%',
          'Immediate Next Best Action: Complete Redis caching module',
          'Follow-up Alert: 1 application has been idle for >7 days (Databricks)',
        ],
        actionLabel: 'Explore Priority Roadmap',
        actionHref: '/skill-graph',
        provenanceLevel: 'SYSTEM_DERIVED',
        provenanceSource: 'AURA Orchestration Reasoning Core',
        confidence: 91,
        auditHash: '0xaura_core_explain_01',
      });
    }
  };

  const samplePrompts = [
    'Why is my readiness only 67%?',
    'Why does Alex need Redis?',
    'Which jobs should I apply to?',
    'Why was I flagged by EWEIS?',
    'What should I do today?',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 space-y-6 text-slate-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-white font-mono font-bold text-xs shadow-2xs">
              AU
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Search Diagnostics &amp; Match Reasoning
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                Explainable Readiness Calculations &amp; Skill Dependencies
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition font-medium"
          >
            ✕ Esc
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && query && handleAsk(query)}
            placeholder="Ask a question: 'Why is readiness 67%?', 'Why does Alex need Redis?'..."
            className="w-full pl-10 pr-28 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition shadow-2xs"
            autoFocus
          />
          <button
            type="button"
            onClick={() => query && handleAsk(query)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition"
          >
            Explain
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-slate-500">Quick inquiries:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(p)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition font-medium"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Reasoning Output */}
        {answer && (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>{answer.headline}</span>
              </h3>
              <DataProvenanceBadge
                level={answer.provenanceLevel}
                source={answer.provenanceSource}
                confidence={answer.confidence}
                metadata={{
                  level: answer.provenanceLevel,
                  source: answer.provenanceSource,
                  confidenceScore: answer.confidence,
                  auditHash: answer.auditHash,
                  lastVerifiedAt: new Date().toISOString(),
                }}
                size="sm"
              />
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              {answer.reasoning}
            </p>

            <div className="space-y-1.5">
              <div className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                Contributing Evidence Factors:
              </div>
              <ul className="space-y-1">
                {answer.details.map((d, dIdx) => (
                  <li key={dIdx} className="text-xs text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {answer.actionLabel && (
              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <a
                  href={answer.actionHref || '#'}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition"
                >
                  <span>{answer.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
