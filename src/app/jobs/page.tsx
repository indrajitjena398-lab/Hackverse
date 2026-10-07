'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Filter, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  ExternalLink, 
  DollarSign, 
  MapPin, 
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { JobMatchResult, FitCategory } from '@/lib/types/jobs';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';
import { eventBus } from '@/lib/engine/EventBus';

export default function JobDiscoveryPage() {
  const [matches, setMatches] = useState<JobMatchResult[]>([]);
  const [selectedFit, setSelectedFit] = useState<FitCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobMatchResult | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  const refreshMatches = () => {
    const results = candidateIntelligenceEngine.calculateJobMatches();
    setMatches(results);
    if (!selectedJob && results.length > 0) {
      setSelectedJob(results[0]);
    } else if (selectedJob) {
      const updated = results.find(r => r.jobId === selectedJob.jobId);
      if (updated) setSelectedJob(updated);
    }
  };

  useEffect(() => {
    refreshMatches();

    const unsubscribeSkill = eventBus.subscribe('SKILL_ASSESSMENT_UPDATED', () => refreshMatches());
    const unsubscribeResume = eventBus.subscribe('RESUME_BULLET_ACCEPTED', () => refreshMatches());
    const unsubscribeMock = eventBus.subscribe('MOCK_INTERVIEW_COMPLETED', () => refreshMatches());
    const unsubscribeUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', () => refreshMatches());
    const unsubscribeReset = eventBus.subscribe('CANDIDATE_PROFILE_RESET', () => refreshMatches());

    return () => {
      unsubscribeSkill();
      unsubscribeResume();
      unsubscribeMock();
      unsubscribeUpload();
      unsubscribeReset();
    };
  }, []);

  const filteredMatches = matches.filter(match => {
    const matchesFit = selectedFit === 'all' || match.fitCategory === selectedFit;
    const matchesSearch = 
      match.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.job.descriptionSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFit && matchesSearch;
  });

  const handleApply = (jobId: string, company: string, title: string) => {
    setAppliedJobIds(prev => new Set(prev).add(jobId));
    eventBus.publish({
      type: 'APPLICATION_STATUS_CHANGED',
      sourceModule: 'Module 1: Job Discovery',
      payload: { jobId, company, role: title, stage: 'applied' },
      recalculatedModules: ['Application Kanban Tracker', 'Institutional Placement Trajectory'],
    });
  };

  const getFitBadge = (category: FitCategory) => {
    switch (category) {
      case 'safe_fit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Safe Fit (Gap &lt; 15%)
          </span>
        );
      case 'stretch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
            <TrendingUp className="w-3 h-3 text-indigo-400" />
            Stretch (Gap 15-30%)
          </span>
        );
      case 'reach':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/40">
            <AlertCircle className="w-3 h-3 text-purple-400" />
            Reach (Gap &gt; 30%)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel-elevated border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
              Module 1 Specification
            </span>
            <span className="text-slate-500 text-xs">• Dense Vector Embeddings &amp; Explainable Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI-Powered Job Discovery &amp; Semantic Matching
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Semantic match scoring powered by multi-source scrapers and explainable additive/subtractive decomposition. Categorizes listings dynamically into Safe Fit, Stretch, and Reach.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Semantic Matching Target:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-bold">
              {candidateIntelligenceEngine.getProfile().name} ({candidateIntelligenceEngine.getProfile().targetRole})
            </span>
            {candidateIntelligenceEngine.isCustomProfile() && (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[11px] font-bold">
                ✓ Uploaded Resume Active
              </span>
            )}
          </div>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSelectedFit('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFit === 'all'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All ({matches.length})
          </button>
          <button
            onClick={() => setSelectedFit('safe_fit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFit === 'safe_fit'
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Safe Fit ({matches.filter(m => m.fitCategory === 'safe_fit').length})
          </button>
          <button
            onClick={() => setSelectedFit('stretch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFit === 'stretch'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Stretch ({matches.filter(m => m.fitCategory === 'stretch').length})
          </button>
          <button
            onClick={() => setSelectedFit('reach')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFit === 'reach'
                ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Reach ({matches.filter(m => m.fitCategory === 'reach').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by role, company name, or technology requirement (e.g. Stripe, Python, Vector, Distributed)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Cards List */}
        <div className="lg:col-span-7 space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400">
              No jobs matching criteria. Try resetting your search filters.
            </div>
          ) : (
            filteredMatches.map((match) => {
              const isSelected = selectedJob?.jobId === match.jobId;
              const hasApplied = appliedJobIds.has(match.jobId);

              return (
                <div
                  key={match.jobId}
                  onClick={() => setSelectedJob(match)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {match.job.companyLogo || '💼'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white hover:text-indigo-300 transition">
                            {match.job.title}
                          </h3>
                        </div>
                        <div className="text-sm text-slate-400 flex items-center gap-3 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-200">{match.job.company}</span>
                          <span className="flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {match.job.location}
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <DollarSign className="w-3 h-3 text-emerald-400" />
                            ${match.job.salaryRange.min.toLocaleString()} - ${match.job.salaryRange.max.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Overall Match Circle Gauge */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className={`px-2.5 py-1 rounded-lg font-mono font-extrabold text-sm border flex items-center gap-1.5 ${
                        match.overallMatchScore >= 80 
                          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                          : match.overallMatchScore >= 65
                          ? 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300'
                          : 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                      }`}>
                        <Zap className="w-3.5 h-3.5" />
                        <span>{match.overallMatchScore}% Match</span>
                      </div>
                      <div className="mt-1">
                        {getFitBadge(match.fitCategory)}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {match.job.descriptionSnippet}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <DataProvenanceBadge
                      level={match.job.provenance.level}
                      source={match.job.provenance.source}
                      metadata={match.job.provenance}
                      size="sm"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(match.jobId, match.job.company, match.job.title);
                        }}
                        disabled={hasApplied}
                        className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                          hasApplied
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                        }`}
                      >
                        {hasApplied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tracked in Kanban</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Track Application</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Explainable Match Breakdown Drawer */}
        <div className="lg:col-span-5">
          {selectedJob ? (
            <div className="sticky top-20 p-6 rounded-2xl glass-panel-elevated border border-slate-700/80 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs text-indigo-400 uppercase font-semibold">
                    Explainable AI Decomposition
                  </span>
                  {getFitBadge(selectedJob.fitCategory)}
                </div>

                <h2 className="text-xl font-bold text-white">
                  {selectedJob.job.title}
                </h2>
                <div className="text-sm font-medium text-slate-300 mt-0.5">
                  {selectedJob.job.company} • {selectedJob.job.location}
                </div>
              </div>

              {/* Match Score Big Highlight */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Calculated Semantic Fit:</div>
                  <div className="text-3xl font-extrabold text-white font-mono mt-0.5 flex items-baseline gap-2">
                    <span>{selectedJob.overallMatchScore}%</span>
                    <span className="text-xs text-slate-500 font-sans font-normal">
                      (Skill Gap: {selectedJob.skillGapPercentage}%)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Category:</div>
                  <div className="text-sm font-bold text-indigo-300 uppercase font-mono mt-0.5">
                    {selectedJob.fitCategory.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Explainable Factor Breakdown (+/- items) */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Score Factor Attribution</span>
                  <span className="text-[10px] text-indigo-400">Dense Vector Cosine + DAG Weight</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedJob.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        factor.type === 'boost'
                          ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200'
                          : 'bg-rose-950/30 border-rose-900/50 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          {factor.type === 'boost' ? (
                            <span className="text-emerald-400 font-mono font-bold">+{factor.impactPercentage}%</span>
                          ) : (
                            <span className="text-rose-400 font-mono font-bold">{factor.impactPercentage}%</span>
                          )}
                          <span>{factor.factorName}</span>
                        </span>
                        <span className="text-[10px] font-mono opacity-70 uppercase">{factor.type}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {factor.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Prerequisite Recommendation */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-2">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>DLDM Dynamic Recommendation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedJob.actionableRecommendation}
                </p>
                {selectedJob.missingPrerequisiteSkills.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] text-slate-400">Target Prerequisite:</span>
                    {selectedJob.missingPrerequisiteSkills.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Provenance Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Posting Provenance:</span>
                <DataProvenanceBadge
                  level={selectedJob.job.provenance.level}
                  source={selectedJob.job.provenance.source}
                  metadata={selectedJob.job.provenance}
                  size="sm"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
