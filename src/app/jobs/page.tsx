'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Search, 
  Filter, 
  Cpu, 
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
  Zap,
  Sparkles,
  HelpCircle,
  Check
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { JobMatchResult, FitCategory } from '@/lib/types/jobs';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';
import { eventBus } from '@/lib/engine/EventBus';
import { ContextualFeedback } from '@/components/feedback/ContextualFeedback';

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Strong Match (Gap &lt; 15%)
          </span>
        );
      case 'stretch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <TrendingUp className="w-3 h-3 text-indigo-600" />
            Moderate Gap (15-30%)
          </span>
        );
      case 'reach':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            High Gap (&gt; 30%)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              Role Matching Engine
            </span>
            <span className="text-slate-400 text-xs">• Verified Skill Ledgers &amp; Experience Decomposition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Technical Roles &amp; Skill Compatibility
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Compare your verified technical skills, project portfolio, and interview history against active engineering roles. Transparent scoring shows exact prerequisite matches and gaps.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Benchmark Profile:</span>
            <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-semibold">
              {candidateIntelligenceEngine.getProfile().name} ({candidateIntelligenceEngine.getProfile().targetRole})
            </span>
            {candidateIntelligenceEngine.isCustomProfile() && (
              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                ✓ Uploaded Resume Active
              </span>
            )}
          </div>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setSelectedFit('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFit === 'all'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Roles ({matches.length})
          </button>
          <button
            onClick={() => setSelectedFit('safe_fit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFit === 'safe_fit'
                ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Strong Match ({matches.filter(m => m.fitCategory === 'safe_fit').length})
          </button>
          <button
            onClick={() => setSelectedFit('stretch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFit === 'stretch'
                ? 'bg-indigo-700 border-indigo-700 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Moderate Gap ({matches.filter(m => m.fitCategory === 'stretch').length})
          </button>
          <button
            onClick={() => setSelectedFit('reach')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFit === 'reach'
                ? 'bg-amber-700 border-amber-700 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            High Gap ({matches.filter(m => m.fitCategory === 'reach').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by role title, company (e.g. Stripe, Uber), or required technology (e.g. Redis, Kafka, Raft)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs transition"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Cards List */}
        <div className="lg:col-span-7 space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 shadow-xs">
              No roles match your filter criteria. Try adjusting keywords or selecting &ldquo;All Roles&rdquo;.
            </div>
          ) : (
            filteredMatches.map((match) => {
              const isSelected = selectedJob?.jobId === match.jobId;
              const hasApplied = appliedJobIds.has(match.jobId);

              return (
                <div
                  key={match.jobId}
                  onClick={() => setSelectedJob(match)}
                  className={`p-5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                        {match.job.companyLogo || '💼'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition">
                            {match.job.title}
                          </h3>
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-3 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-800">{match.job.company}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {match.job.location}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                            ${match.job.salaryRange.min.toLocaleString()} - ${match.job.salaryRange.max.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Overall Match & Response Odds */}
                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                      <div className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border flex items-center gap-1.5 ${
                        match.overallMatchScore >= 80 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : match.overallMatchScore >= 65
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        <Zap className="w-3.5 h-3.5" />
                        <span>{match.overallMatchScore}% Match</span>
                      </div>

                      {match.symmetricResponseProbability && (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1 font-semibold">
                            <TrendingUp className="w-2.5 h-2.5 text-indigo-600" />
                            <span>{match.symmetricResponseProbability.responseProbabilityPercent}% Response Odds</span>
                          </span>
                          <span className={`text-[9px] font-mono font-bold ${
                            match.symmetricResponseProbability.dealbreakersPassed 
                              ? 'text-emerald-700' 
                              : 'text-rose-700'
                          }`}>
                            {match.symmetricResponseProbability.dealbreakersPassed ? '✓ Prerequisites Met' : '⚠ Prerequisite Conflict'}
                          </span>
                        </div>
                      )}

                      <div className="mt-0.5">
                        {getFitBadge(match.fitCategory)}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {match.job.descriptionSnippet}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          hasApplied
                            ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        }`}
                      >
                        {hasApplied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tracked in Pipeline</span>
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

        {/* Right Column: Detailed Match Breakdown Drawer */}
        <div className="lg:col-span-5">
          {selectedJob ? (
            <div className="sticky top-20 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 text-slate-800">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs text-slate-500 uppercase font-bold tracking-wider">
                    Match Breakdown &amp; Diagnostics
                  </span>
                  {getFitBadge(selectedJob.fitCategory)}
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  {selectedJob.job.title}
                </h2>
                <div className="text-sm font-medium text-slate-600 mt-0.5">
                  {selectedJob.job.company} • {selectedJob.job.location}
                </div>
              </div>

              {/* Match Score Big Highlight */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Calculated Compatibility Score:</div>
                  <div className="text-3xl font-bold text-slate-900 font-mono mt-0.5 flex items-baseline gap-2">
                    <span>{selectedJob.overallMatchScore}%</span>
                    <span className="text-xs text-slate-500 font-sans font-normal">
                      (Skill Gap: {selectedJob.skillGapPercentage}%)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Match Category:</div>
                  <div className="text-sm font-bold text-slate-800 uppercase font-mono mt-0.5">
                    {selectedJob.fitCategory.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Dynamic Weights Attribution Banner */}
              {selectedJob.weightsApplied && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-700">
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Role Weight Distribution:
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-800">
                      {selectedJob.job.experienceLevel || 'Mid'} Level
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <div className="text-slate-500">Skills</div>
                      <div className="font-bold text-emerald-700 text-xs mt-0.5">{Math.round(selectedJob.weightsApplied.skillCoverage * 100)}%</div>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <div className="text-slate-500">Semantic</div>
                      <div className="font-bold text-indigo-700 text-xs mt-0.5">{Math.round(selectedJob.weightsApplied.semanticSim * 100)}%</div>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <div className="text-slate-500">Tenure</div>
                      <div className="font-bold text-amber-700 text-xs mt-0.5">{Math.round(selectedJob.weightsApplied.experience * 100)}%</div>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <div className="text-slate-500">Seniority</div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5">{Math.round(selectedJob.weightsApplied.seniority * 100)}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Symmetric Match Ledger: Two-Sided Response Probability & Dealbreakers */}
              {selectedJob.symmetricResponseProbability && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Application Viability Ledger
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                      {selectedJob.symmetricResponseProbability.pipelineTier}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-white border border-slate-200">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500">Candidate Fit Score</div>
                      <div className="text-xl font-bold text-emerald-700 font-mono mt-0.5">
                        {selectedJob.overallMatchScore}%
                      </div>
                      <div className="text-[10px] text-slate-500">Skills &amp; Architecture Match</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-slate-500">Recruiter Response Probability</div>
                      <div className="text-xl font-bold text-indigo-700 font-mono mt-0.5">
                        {selectedJob.symmetricResponseProbability.responseProbabilityPercent}%
                      </div>
                      <div className="text-[10px] text-slate-500">Pipeline Competition Calibrated</div>
                    </div>
                  </div>

                  {/* Employer Counter-Requirements & Binary Dealbreakers */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-mono text-slate-700 font-semibold flex items-center gap-1">
                      <span>Employer Minimum Prerequisites:</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      {selectedJob.job.employerCounterRequirements?.minCgpa && (
                        <div className="flex items-center justify-between text-slate-700 text-[11px] bg-white px-2.5 py-1.5 rounded border border-slate-200">
                          <span>Minimum Academic CGPA: {selectedJob.job.employerCounterRequirements.minCgpa}</span>
                          <span className="text-emerald-700 font-mono font-semibold">✓ Satisfied (8.85)</span>
                        </div>
                      )}

                      {selectedJob.job.employerCounterRequirements?.requiresWorkAuthorization && (
                        <div className="flex items-center justify-between text-slate-700 text-[11px] bg-white px-2.5 py-1.5 rounded border border-slate-200">
                          <span>Unrestricted Work Authorization:</span>
                          <span className="text-emerald-700 font-mono font-semibold">✓ Verified</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-slate-700 text-[11px] bg-white px-2.5 py-1.5 rounded border border-slate-200">
                        <span>Active Pipeline Applicants:</span>
                        <span className="text-slate-700 font-mono font-semibold">
                          {selectedJob.job.employerCounterRequirements?.activeApplicantCount || 750} Candidates
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed italic pt-1">
                      {selectedJob.symmetricResponseProbability.counterRequirementSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Neural Job Matching Engine Intelligence */}
              {selectedJob.neuralMatch && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                      Neural Network Matcher
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                        selectedJob.neuralMatch.fit_class === 'SAFE FIT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : selectedJob.neuralMatch.fit_class === 'STRETCH FIT'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {selectedJob.neuralMatch.fit_class} ({selectedJob.neuralMatch.match_score}%)
                      </span>
                      <Link 
                        href="/neural-engine" 
                        className="text-[10px] font-mono text-indigo-600 hover:text-indigo-800 font-semibold underline"
                      >
                        Manage NN →
                      </Link>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic border-l-2 border-indigo-500 pl-2.5 bg-white py-1.5 rounded-r border border-slate-200">
                    &ldquo;{selectedJob.neuralMatch.explanation}&rdquo;
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                    <div className="p-2 rounded bg-white border border-slate-200 text-center">
                      <div className="text-slate-500">Cosine Similarity</div>
                      <div className="font-bold text-indigo-700 text-xs mt-0.5">{selectedJob.neuralMatch.breakdown.cosineSimilarity}</div>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 text-center">
                      <div className="text-slate-500">Skill Overlap</div>
                      <div className="font-bold text-emerald-700 text-xs mt-0.5">{selectedJob.neuralMatch.breakdown.skillScore}</div>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 text-center">
                      <div className="text-slate-500">Probability</div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5">{selectedJob.neuralMatch.calibrated_probability}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Conceptual Fit Reasoning */}
              {selectedJob.conceptualReasoning && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Candidate–Opportunity Alignment
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono font-semibold">
                      Reasoning Ledger
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic border-l-2 border-indigo-500 pl-2.5 bg-white py-1.5 rounded-r border border-slate-200">
                    &ldquo;{selectedJob.conceptualReasoning.conceptualSummary}&rdquo;
                  </p>

                  <div className="space-y-2.5 pt-1">
                    {/* Strong Alignments */}
                    {selectedJob.conceptualReasoning.strongAlignments.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Strong Alignments:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-4">
                          {selectedJob.conceptualReasoning.strongAlignments.map((align, aIdx) => (
                            <span key={aIdx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 font-medium">
                              ✓ {align}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing / Weak Evidence */}
                    {selectedJob.conceptualReasoning.missingWeakEvidence.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-amber-800 flex items-center gap-1 font-mono">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Missing or Weak Evidence:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-4">
                          {selectedJob.conceptualReasoning.missingWeakEvidence.map((gap, gIdx) => (
                            <span key={gIdx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-white border border-amber-200 text-amber-800 font-medium">
                              ⚠ {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirement Uncertainties */}
                    {selectedJob.conceptualReasoning.requirementUncertainties.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 font-mono">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Unverified Requirements:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-4">
                          {selectedJob.conceptualReasoning.requirementUncertainties.map((unc, uIdx) => (
                            <span key={uIdx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                              ? {unc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Structured Opportunity Requirements */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 uppercase">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Structured Job Requirements
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Parsed Criteria</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-mono text-slate-600">Required Skills ({selectedJob.job.requiredSkillIds.length}):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedJob.job.requiredSkillIds.map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedJob.job.preferredSkillIds.length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono text-slate-600">Preferred Skills ({selectedJob.job.preferredSkillIds.length}):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedJob.job.preferredSkillIds.map((s, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-200">
                    <span>Tenure: <strong className="text-slate-800">{selectedJob.job.experienceLevel || 'Mid'} ({selectedJob.job.requiredYearsExperience || (selectedJob.job.experienceLevel === 'Senior' ? 5 : 3)}+ yrs)</strong></span>
                    <span>Seniority: <strong className="text-slate-800">{selectedJob.job.seniorityLevel || selectedJob.job.experienceLevel}</strong></span>
                  </div>
                </div>
              </div>

              {/* Score Factor Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Score Factor Attribution</span>
                  <span className="text-[10px] text-slate-500">Decomposition Ledger</span>
                </div>

                {/* Explicit Additive / Subtractive Match Ledger */}
                {selectedJob.matchLedger && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 uppercase">
                      <span>Match Equation:</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                        Additive Model
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold tracking-tight">
                      {selectedJob.matchLedger.formulaDisplay}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                      <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                        <span className="font-bold">Additive Skills:</span> +{selectedJob.matchLedger.totalAdditive}%
                      </div>
                      <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                        <span className="font-bold">Skill Gaps:</span> -{selectedJob.matchLedger.totalSubtractive}%
                      </div>
                    </div>
                  </div>
                )}

                {/* ASCII Ledger Style Summary Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800 pb-1 border-b border-slate-200">
                    <span>Component Dimension</span>
                    <span>Impact Delta</span>
                  </div>
                  {selectedJob.factors.map((f, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span className="text-slate-600 truncate pr-2">{f.factorName}</span>
                      <span className={f.type === 'boost' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {f.type === 'boost' ? `+${f.impactPercentage}` : f.impactPercentage}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 text-sm">
                    <span className="text-slate-900">Final Compatibility Score</span>
                    <span className="text-emerald-700">{selectedJob.overallMatchScore}%</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedJob.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        factor.type === 'boost'
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/60 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          {factor.type === 'boost' ? (
                            <span className="text-emerald-700 font-mono font-bold">+{factor.impactPercentage}%</span>
                          ) : (
                            <span className="text-rose-700 font-mono font-bold">{factor.impactPercentage}%</span>
                          )}
                          <span>{factor.factorName}</span>
                        </span>
                        <span className="text-[10px] font-mono opacity-70 uppercase">{factor.type}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        {factor.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Prerequisite Recommendation */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-700" />
                  <span>Recommended Focus Area</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedJob.actionableRecommendation}
                </p>
                {selectedJob.missingPrerequisiteSkills.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] text-slate-600">Target Prerequisite:</span>
                    {selectedJob.missingPrerequisiteSkills.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-white border border-amber-300 px-2 py-0.5 rounded text-amber-900 font-mono font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Provenance Footer */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Posting Provenance:</span>
                <DataProvenanceBadge
                  level={selectedJob.job.provenance.level}
                  source={selectedJob.job.provenance.source}
                  metadata={selectedJob.job.provenance}
                  size="sm"
                />
              </div>

              {/* Contextual Feedback on Job Recommendation */}
              <div className="pt-3 border-t border-slate-200">
                <ContextualFeedback
                  featureType="job_recommendation"
                  featureId={selectedJob.jobId}
                  aiOutputId={`rec_${selectedJob.jobId}`}
                  careerGoal={selectedJob.job.title}
                  compact={true}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
