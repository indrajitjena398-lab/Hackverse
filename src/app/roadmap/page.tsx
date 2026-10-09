'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Clock, 
  Layers, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight, 
  Filter, 
  Target, 
  Award, 
  BookOpen, 
  Zap, 
  Terminal, 
  FileText,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { rbacStore, CandidateSkill } from '@/lib/security/rbacStore';
import { 
  skillGapAnalyzer, 
  ROLE_TAXONOMIES, 
  SkillGapAnalysisResult,
  AnalyzedSkillItem,
  RoadmapPhase,
  RoadmapMilestoneItem
} from '@/lib/engine/SkillGapAnalyzer';
import { ProjectRecommendationCard } from '@/components/roadmap/ProjectRecommendationCard';
import { eventBus } from '@/lib/engine/EventBus';
import { ContextualFeedback } from '@/components/feedback/ContextualFeedback';

export default function SkillRoadmapPage() {
  const { user, persona } = useAuth();
  
  // Resolve active candidate email
  const activeEmail = useMemo(() => {
    return user?.email || persona?.email || (typeof window !== 'undefined' ? localStorage.getItem('aura_active_email') : '') || 'candidate@pmec.ac.in';
  }, [user, persona?.email]);

  // Target role selection state
  const [selectedRoleId, setSelectedRoleId] = useState<string>('full-stack-engineer');
  
  // Skill Gap filter state: 'all' | 'Mastered' | 'Adjacent' | 'Missing'
  const [skillFilter, setSkillFilter] = useState<'all' | 'Mastered' | 'Adjacent' | 'Missing'>('all');

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Active roadmap analysis result
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);

  // Status feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial load & profile synchronization
  const reloadAnalysis = () => {
    if (!activeEmail) return;
    const profile = rbacStore.getCandidateProfile(activeEmail);
    const candidateSkills: CandidateSkill[] = profile.skills || [];
    const result = skillGapAnalyzer.analyzeForCandidate(activeEmail, candidateSkills, selectedRoleId);
    setAnalysis(result);
  };

  useEffect(() => {
    reloadAnalysis();
  }, [activeEmail, selectedRoleId]);

  // Subscribe to central engine updates
  useEffect(() => {
    const unsub = eventBus.subscribe('SKILL_ACQUIRED', () => {
      reloadAnalysis();
    });
    return unsub;
  }, [activeEmail, selectedRoleId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle milestone checklist toggle
  const handleToggleMilestone = (milestoneId: string, currentCompleted: boolean) => {
    if (!analysis) return;

    const stored = skillGapAnalyzer.getStoredRoadmapState(activeEmail, selectedRoleId);
    let updatedMilestoneIds: string[];

    if (currentCompleted) {
      updatedMilestoneIds = stored.completedMilestoneIds.filter(id => id !== milestoneId);
    } else {
      updatedMilestoneIds = [...stored.completedMilestoneIds, milestoneId];
    }

    stored.completedMilestoneIds = updatedMilestoneIds;

    // Recalculate score gain
    const profile = rbacStore.getCandidateProfile(activeEmail);
    const recalculated = skillGapAnalyzer.analyze(
      profile.skills || [], 
      selectedRoleId, 
      stored.completedMilestoneIds, 
      stored.submittedProjects.map(p => p.projectId)
    );
    
    // Save to persistence
    skillGapAnalyzer.saveRoadmapState(activeEmail, selectedRoleId, stored, recalculated.currentReadinessPercent);
    
    // Immediate local state update
    reloadAnalysis();
    
    showToast(
      !currentCompleted 
        ? 'Milestone completed! +Score boost applied to profile readiness.' 
        : 'Milestone unchecked.'
    );
  };

  // Handle project verification
  const handleVerifyProject = async (projectId: string, githubUrl: string) => {
    if (!analysis) return;

    const stored = skillGapAnalyzer.getStoredRoadmapState(activeEmail, selectedRoleId);
    const existingIndex = stored.submittedProjects.findIndex(p => p.projectId === projectId);

    const submission = {
      projectId,
      githubUrl,
      submittedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      stored.submittedProjects[existingIndex] = submission;
    } else {
      stored.submittedProjects.push(submission);
    }

    const profile = rbacStore.getCandidateProfile(activeEmail);
    const recalculated = skillGapAnalyzer.analyze(
      profile.skills || [], 
      selectedRoleId, 
      stored.completedMilestoneIds, 
      stored.submittedProjects.map(p => p.projectId)
    );

    skillGapAnalyzer.saveRoadmapState(activeEmail, selectedRoleId, stored, recalculated.currentReadinessPercent);
    reloadAnalysis();
    showToast('GitHub project verified! Portfolio score boost successfully added.');
  };

  // Filter skills based on status and category
  const filteredSkills = useMemo(() => {
    if (!analysis) return [];
    return analysis.skillsMatrix.filter(skill => {
      const matchesStatus = skillFilter === 'all' || skill.status === skillFilter;
      const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
      return matchesStatus && matchesCategory;
    });
  }, [analysis, skillFilter, categoryFilter]);

  // Overall milestone completion stats
  const milestoneStats = useMemo(() => {
    if (!analysis) return { total: 0, completed: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    analysis.phases.forEach(p => {
      p.milestones.forEach(m => {
        total++;
        if (m.isCompleted) completed++;
      });
    });
    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing candidate skills against industry taxonomies...</span>
        </div>
      </div>
    );
  }

  const selectedTaxonomy = ROLE_TAXONOMIES.find(t => t.id === selectedRoleId) || ROLE_TAXONOMIES[0];

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-16 space-y-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          TOP BANNER: TARGET ROLE SELECTOR & READINESS SCORECARD
         ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Role Selection & Subtitle */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
              <span>Skill Diagnostics &amp; Targeted Progression</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Skill Gap Analysis &amp; Technical Roadmap
              </h1>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Benchmark your verified skills against industry role taxonomies, surface missing competencies, and track milestone projects.
              </p>
            </div>

            {/* Target Role Selector Dropdown */}
            <div className="pt-2">
              <label htmlFor="target-role-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Role Benchmark
              </label>
              <div className="relative max-w-md">
                <select
                  id="target-role-select"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-300 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                  {ROLE_TAXONOMIES.map((tax) => (
                    <option key={tax.id} value={tax.id}>
                      {tax.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 font-medium">
                {selectedTaxonomy.shortDesc}
              </p>
            </div>
          </div>

          {/* Right: Dual-State Readiness Metric Scorecard */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:w-96 shrink-0 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Role Readiness Score
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Calculation
              </span>
            </div>

            {/* Score Comparison Display */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {analysis.currentReadinessPercent}%
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  Current Profile Match
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600 tracking-tight flex items-center justify-end gap-1">
                  <span>{analysis.projectedReadinessPercent}%</span>
                  <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    +{analysis.projectedReadinessPercent - analysis.currentReadinessPercent}%
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  Projected Potential
                </div>
              </div>
            </div>

            {/* Dual Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
                {/* Projected potential bar (background) */}
                <div
                  className="h-full bg-emerald-200 rounded-full absolute top-0 left-0 transition-all duration-500"
                  style={{ width: `${analysis.projectedReadinessPercent}%` }}
                />
                {/* Current readiness bar (foreground) */}
                <div
                  className="h-full bg-indigo-600 rounded-full relative z-10 transition-all duration-500 shadow-sm"
                  style={{ width: `${analysis.currentReadinessPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>0%</span>
                <span>Benchmark: {selectedTaxonomy.benchmarkReadiness}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Quick Status Count Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white border border-emerald-200 p-2 rounded-xl">
                <div className="text-sm font-bold text-emerald-700">{analysis.masteredCount}</div>
                <div className="text-[10px] font-semibold text-emerald-600 uppercase">Mastered</div>
              </div>
              <div className="bg-white border border-amber-200 p-2 rounded-xl">
                <div className="text-sm font-bold text-amber-700">{analysis.adjacentCount}</div>
                <div className="text-[10px] font-semibold text-amber-600 uppercase">Adjacent</div>
              </div>
              <div className="bg-white border border-rose-200 p-2 rounded-xl">
                <div className="text-sm font-bold text-rose-700">{analysis.missingCount}</div>
                <div className="text-[10px] font-semibold text-rose-600 uppercase">Missing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Module Mock Interview Insights Callout */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <strong className="text-slate-800">Cross-Module Integration:</strong>
            <span>
              Analyzing verified skills from database profile &amp; CAT mock interview weak points.
            </span>
          </div>
          <Link
            href="/mock-interview"
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0"
          >
            Take CAT Adaptive Interview to Re-verify <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: SKILL GAP MATRIX (Acquired vs. Missing Stack)
         ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-indigo-600" />
              Section 1: Skill Gap Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Comparative analysis of your database credentials versus the {selectedTaxonomy.title} requirements taxonomy.
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSkillFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                skillFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Skills ({analysis.skillsMatrix.length})
            </button>
            <button
              type="button"
              onClick={() => setSkillFilter('Mastered')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                skillFilter === 'Mastered'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Mastered ({analysis.masteredCount})
            </button>
            <button
              type="button"
              onClick={() => setSkillFilter('Adjacent')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                skillFilter === 'Adjacent'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Adjacent ({analysis.adjacentCount})
            </button>
            <button
              type="button"
              onClick={() => setSkillFilter('Missing')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                skillFilter === 'Missing'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Missing Stack ({analysis.missingCount})
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const isMastered = skill.status === 'Mastered';
            const isAdjacent = skill.status === 'Adjacent';
            const isMissing = skill.status === 'Missing';

            let cardBorder = 'border-slate-200 hover:border-slate-300';
            let pillBadge = 'bg-slate-100 text-slate-700 border-slate-200';

            if (isMastered) {
              cardBorder = 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300';
              pillBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            } else if (isAdjacent) {
              cardBorder = 'border-amber-200 bg-amber-50/20 hover:border-amber-300';
              pillBadge = 'bg-amber-50 text-amber-700 border-amber-200';
            } else if (isMissing) {
              cardBorder = 'border-rose-200 bg-rose-50/20 hover:border-rose-300';
              pillBadge = 'bg-rose-50 text-rose-700 border-rose-200';
            }

            return (
              <div
                key={skill.name}
                className={`bg-white border rounded-2xl p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${cardBorder}`}
              >
                <div className="space-y-3">
                  {/* Card Top: Name & Status Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {skill.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {skill.name}
                      </h3>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${pillBadge} shrink-0`}>
                      {skill.status === 'Mastered' && '🟢 Mastered'}
                      {skill.status === 'Adjacent' && '🟡 Adjacent'}
                      {skill.status === 'Missing' && '🔴 Missing Stack'}
                    </span>
                  </div>

                  {/* Proficiency Rating Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Proficiency</span>
                      <span>
                        {skill.candidateProficiency ? `${skill.candidateProficiency}/5 verified` : '0/5 (Unverified)'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isMastered ? 'bg-emerald-500' : isAdjacent ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                        style={{ width: `${((skill.candidateProficiency || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Gap Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    {skill.gapSummary}
                  </p>
                </div>

                {/* Card Footer: Importance & Market Demand */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold px-2 py-0.5 rounded-md ${
                    skill.importance === 'CRITICAL' 
                      ? 'bg-rose-50 text-rose-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {skill.importance}
                  </span>

                  <span className="text-slate-600 font-medium">
                    Demand: <strong className="text-slate-900">Top {skill.marketDemandPercentile}%</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: INTERACTIVE MILESTONE-BASED ROADMAP (Chronological Phases)
         ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Target className="w-6 h-6 text-indigo-600" />
              Section 2: Interactive Milestone-Based Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              8-week structured curriculum. Tick off completed milestones to update your verified readiness score in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-700">
              {milestoneStats.completed} / {milestoneStats.total} Milestones Completed ({milestoneStats.percent}%)
            </span>
          </div>
        </div>

        {/* 4-Phase Chronological Timeline Cards */}
        <div className="space-y-6">
          {analysis.phases.map((phase) => {
            const phaseCompletedCount = phase.milestones.filter(m => m.isCompleted).length;
            const phaseTotalCount = phase.milestones.length;
            const isPhaseDone = phaseTotalCount > 0 && phaseCompletedCount === phaseTotalCount;

            return (
              <div
                key={phase.phaseNumber}
                className={`bg-white border rounded-2xl transition-all shadow-xs overflow-hidden ${
                  isPhaseDone ? 'border-emerald-300 ring-1 ring-emerald-400/20' : 'border-slate-200'
                }`}
              >
                {/* Phase Header */}
                <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Phase {phase.phaseNumber}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {phase.timeCommitment}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        {phase.expectedScoreBoost} Boost
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {phase.phaseTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Focus: {phase.focusArea}
                    </p>
                  </div>

                  {/* Phase Completion Indicator */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-700">
                      {phaseCompletedCount} of {phaseTotalCount} Completed
                    </div>
                    <div className="w-32 h-2 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${(phaseCompletedCount / phaseTotalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Milestone Checklist Items */}
                <div className="divide-y divide-slate-100">
                  {phase.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      onClick={() => handleToggleMilestone(milestone.id, milestone.isCompleted)}
                      className={`p-5 sm:p-6 transition-colors flex items-start gap-4 cursor-pointer hover:bg-slate-50/80 ${
                        milestone.isCompleted ? 'bg-emerald-50/15' : 'bg-white'
                      }`}
                    >
                      {/* Checkbox Button */}
                      <button
                        type="button"
                        aria-label={`Toggle milestone ${milestone.title}`}
                        className="mt-0.5 shrink-0 focus:outline-none"
                      >
                        {milestone.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                        )}
                      </button>

                      {/* Milestone Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <h4 className={`text-sm font-bold ${
                            milestone.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}>
                            {milestone.title}
                          </h4>

                          <span className="self-start sm:self-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                            +{milestone.scoreBoostPercent}% Readiness
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed ${
                          milestone.isCompleted ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {milestone.description}
                        </p>

                        {/* Concepts & Tools Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-semibold text-slate-600 mr-1">Concepts:</span>
                          {milestone.concepts.map((concept) => (
                            <span
                              key={concept}
                              className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                            >
                              {concept}
                            </span>
                          ))}
                          <span className="text-[10px] font-semibold text-slate-600 ml-2 mr-1">Tools:</span>
                          {milestone.tools.map((tool) => (
                            <span
                              key={tool}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: RECOMMENDED PORTFOLIO PROJECTS ("What You Should Build")
         ========================================================================= */}
      <section className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700 mb-2">
            <Terminal className="w-3.5 h-3.5 text-purple-600" />
            <span>Targeted Stack Evidence Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-indigo-600" />
            Section 3: What You Should Build (Portfolio Proofs)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Real-world projects designed specifically to bridge your identified stack gaps. Link your GitHub repository proof to verify architectural mastery and apply permanent boosts to your central Skill Score.
          </p>
        </div>

        {/* Project Recommendation Cards */}
        <div className="space-y-6">
          {analysis.projects.map((project) => {
            const stored = skillGapAnalyzer.getStoredRoadmapState(activeEmail, selectedRoleId);
            const submission = stored.submittedProjects.find(p => p.projectId === project.id);
            const isVerified = !!submission || project.isVerified;

            return (
              <ProjectRecommendationCard
                key={project.id}
                project={project}
                candidateEmail={activeEmail}
                isVerified={isVerified}
                submittedGithubUrl={submission?.githubUrl || ''}
                onVerifyProject={handleVerifyProject}
              />
            );
          })}
        </div>
      </section>

      {/* Contextual Feedback on Career Roadmap & Skill Gap Analysis (Sections 7 & 13) */}
      <section className="pt-6 border-t border-slate-200">
        <ContextualFeedback
          featureType="career_roadmap"
          featureId={selectedRoleId}
          aiOutputId={`roadmap_${selectedRoleId}`}
          careerGoal={ROLE_TAXONOMIES.find(r => r.id === selectedRoleId)?.title || 'Software Engineer'}
          compact={false}
        />
      </section>
    </div>
  );
}
