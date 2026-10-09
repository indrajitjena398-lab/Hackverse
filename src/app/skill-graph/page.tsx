'use client';

import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Layers, 
  CheckCircle2, 
  Lock, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Compass, 
  RotateCcw,
  BookOpen,
  FolderGit2,
  Award,
  ChevronRight,
  Flame,
  HelpCircle,
  TrendingUp,
  Cpu,
  BarChart3,
  AlertTriangle,
  Target,
  ShieldAlert,
  ListOrdered
} from 'lucide-react';
import Link from 'next/link';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { SkillNode, SkillDistanceCalculation, MasteryLevel } from '@/lib/types/skills';
import { DimensionalReadiness } from '@/lib/types/candidate';
import { PrioritizedCandidateGap } from '@/lib/engine/GapIntelligenceEngine';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';
import { CareerDigitalTwinModal } from '@/components/common/CareerDigitalTwinModal';
import { MicroLearningModal } from '@/components/common/MicroLearningModal';
import { eventBus } from '@/lib/engine/EventBus';

export default function SkillGraphDldmPage() {
  const dldm = candidateIntelligenceEngine.getDLDM();
  const allSkills = dldm.getAllSkills();

  const [candidateSkills, setCandidateSkills] = useState(candidateIntelligenceEngine.getCandidateSkills());
  const [selectedSkillId, setSelectedSkillId] = useState<string>('caching_redis');
  const [distanceCalc, setDistanceCalc] = useState<SkillDistanceCalculation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [gapFilter, setGapFilter] = useState<string>('all');
  const [isDigitalTwinOpen, setIsDigitalTwinOpen] = useState(false);
  const [microLearningSkill, setMicroLearningSkill] = useState<{ id: string; name: string } | null>(null);
  const [readinessBreakdown, setReadinessBreakdown] = useState<DimensionalReadiness>(
    candidateIntelligenceEngine.getDimensionalReadiness()
  );
  const [prioritizedGaps, setPrioritizedGaps] = useState<PrioritizedCandidateGap[]>([]);
  const [prepBriefing, setPrepBriefing] = useState<string>('');

  const updateCalculations = () => {
    const updatedMap = candidateIntelligenceEngine.getCandidateSkills();
    setCandidateSkills(new Map(updatedMap));
    setReadinessBreakdown(candidateIntelligenceEngine.getDimensionalReadiness());
    setPrioritizedGaps(candidateIntelligenceEngine.getPrioritizedGaps());
    setPrepBriefing(candidateIntelligenceEngine.getAdaptivePrepBriefing());

    const masteryMap = new Map<string, MasteryLevel>();
    updatedMap.forEach((v, k) => masteryMap.set(k, v.masteryLevel));

    try {
      const calc = dldm.calculateSkillDistance(selectedSkillId, masteryMap);
      setDistanceCalc(calc);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    updateCalculations();

    const unsubscribe = eventBus.subscribe('SKILL_ASSESSMENT_UPDATED', () => updateCalculations());
    const unsubscribeSkillLevel = eventBus.subscribe('SKILL_LEVEL_CHANGED', () => updateCalculations());
    const unsubscribeUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', () => updateCalculations());
    const unsubscribeReset = eventBus.subscribe('CANDIDATE_PROFILE_RESET', () => updateCalculations());

    return () => {
      unsubscribe();
      unsubscribeSkillLevel();
      unsubscribeUpload();
      unsubscribeReset();
    };
  }, [selectedSkillId]);

  const handleSimulateToggle = (skillId: string) => {
    const current = candidateSkills.get(skillId)?.masteryLevel;
    const newLevel: MasteryLevel = current === 'mastered' ? 'in_progress' : 'mastered';
    const newConfidence = newLevel === 'mastered' ? 95 : 60;

    candidateIntelligenceEngine.setSkillMastery(
      skillId, 
      newLevel, 
      newConfidence, 
      'Direct simulator toggle on DLDM Skill Graph.'
    );
    updateCalculations();
  };

  const selectedNode = dldm.getSkill(selectedSkillId);
  const skillExplanation = candidateIntelligenceEngine.explainSkillRequirement(selectedSkillId);

  const getStatusBadge = (level: MasteryLevel) => {
    switch (level) {
      case 'mastered':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">Mastered (90%+)</span>;
      case 'proficient':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">Proficient (75-89%)</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 font-semibold">In Progress</span>;
      case 'prerequisite_needed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-800 border border-rose-200 font-semibold">Prereq Needed</span>;
      case 'locked':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500 border border-slate-200 font-medium">Locked</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              Technical Skill Graph
            </span>
            <span className="text-slate-500 text-xs">• Prerequisite Dependency Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Skill Ontology &amp; Reasoning Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Multi-dimensional skill graph modeling technical prerequisites, verification requirements, and role dependencies. Inspect exact prerequisite paths and compute readiness gains.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Benchmark Role:</span>
            <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-semibold">
              {candidateIntelligenceEngine.getProfile().name} ({candidateIntelligenceEngine.getProfile().targetRole})
            </span>
            {candidateIntelligenceEngine.isCustomProfile() && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                ✓ Resume Profile Calibrated
              </span>
            )}
          </div>
        </div>

        {/* Digital Twin Trigger Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsDigitalTwinOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Simulate Career Scenarios</span>
          </button>
        </div>
      </div>

      {/* Multidimensional Role-Weighted Readiness Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Role-Weighted Readiness Distribution ({readinessBreakdown.targetRoleProfile})
            </h3>
          </div>
          <div className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Composite Overall: {(readinessBreakdown.overall * 100).toFixed(0)}%
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-mono font-medium">Sys Design (25%)</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              {(readinessBreakdown.system_design * 100).toFixed(0)}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-mono font-medium">Technical (20%)</div>
            <div className="text-lg font-bold text-indigo-700 font-mono mt-0.5">
              {(readinessBreakdown.technical * 100).toFixed(0)}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-mono font-medium">Coding (15%)</div>
            <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
              {(readinessBreakdown.coding * 100).toFixed(0)}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-mono font-medium">Comms (10%)</div>
            <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
              {(readinessBreakdown.communication * 100).toFixed(0)}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-mono font-medium">Behavioral (5%)</div>
            <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
              {(readinessBreakdown.behavioral * 100).toFixed(0)}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-mono font-medium">Resume ATS (5%)</div>
            <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
              {(readinessBreakdown.resume * 100).toFixed(0)}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-mono font-medium">Interview (5%)</div>
            <div className="text-lg font-bold text-indigo-700 font-mono mt-0.5">
              {(readinessBreakdown.interview * 100).toFixed(0)}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-mono font-medium">Job Fit (74%)</div>
            <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
              {(readinessBreakdown.job_fit * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Visual DAG vs Prerequisite Pathway */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Graph Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-indigo-600" />
              <span>Multi-Dimensional Ontology Nodes ({allSkills.length})</span>
            </h3>

            {/* Category Filter */}
            <div className="flex items-center gap-1 text-xs flex-wrap">
              {['all', 'distributed_systems', 'databases', 'system_design', 'devops_cloud', 'ai_ml'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Graph Nodes Canvas */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allSkills
                .filter(skill => filterCategory === 'all' || skill.category === filterCategory)
                .map((skill) => {
                  const candidateState = candidateSkills.get(skill.id);
                  const mastery = candidateState?.masteryLevel || 'locked';
                  const isSelected = selectedSkillId === skill.id;
                  const isPrereqOfSelected = distanceCalc?.sequentialPathway.some(s => s.skillId === skill.id);

                  return (
                    <div
                      key={skill.id}
                      onClick={() => setSelectedSkillId(skill.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : isPrereqOfSelected
                          ? 'bg-indigo-50/60 border-indigo-200 text-slate-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>Tier {skill.difficultyTier}</span>
                            <span className={isSelected ? 'text-slate-600' : 'text-slate-300'}>•</span>
                            <span className={`text-[10px] font-mono uppercase ${isSelected ? 'text-indigo-300' : 'text-indigo-700'}`}>{skill.category.replace('_', ' ')}</span>
                          </div>
                          <h4 className={`text-sm font-bold mt-1 transition ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-indigo-700'}`}>
                            {skill.name}
                          </h4>
                        </div>
                        {getStatusBadge(mastery)}
                      </div>

                      <p className={`text-[11px] mt-2 line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                        {skill.description}
                      </p>

                      <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] ${isSelected ? 'border-slate-800' : 'border-slate-100'}`}>
                        <span className={`font-mono ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                          {skill.prerequisiteIds.length === 0 ? 'Root Prereq' : `${skill.prerequisiteIds.length} prereqs`}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateToggle(skill.id);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition cursor-pointer ${
                            mastery === 'mastered'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                          title="Click to toggle candidate mastery state and watch dynamic DAG cascade"
                        >
                          {mastery === 'mastered' ? 'Reset Status' : 'Mark Mastered'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Defensible Reasoning & Sequential Pathway */}
        <div className="lg:col-span-5 space-y-4">
          {selectedNode && distanceCalc ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-700 uppercase font-bold">
                    Target Dependency Chain
                  </span>
                  <DataProvenanceBadge
                    level={selectedNode.provenance.level}
                    source={selectedNode.provenance.source}
                    metadata={selectedNode.provenance}
                    claimTitle={`Skill: ${selectedNode.name}`}
                    size="sm"
                  />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedNode.name}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedNode.description}</p>
              </div>

              {/* Defensible Reasoning Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Skill Requirement Context: &quot;{selectedNode.name}&quot;</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +{skillExplanation.expectedReadinessLiftPercent}% Projected Lift
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {skillExplanation.defensibleStatement}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Prereq for <strong>{skillExplanation.targetRolesCount} roles</strong></span>
                  <span>Co-occurs in <strong>{skillExplanation.matchedInterviewPatternPercent}% interviews</strong></span>
                </div>
              </div>

              {/* Distance & Readiness Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Prerequisite Readiness:</div>
                  <div className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">
                    {distanceCalc.readinessPercentage}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {distanceCalc.completedPrerequisites} of {distanceCalc.totalPrerequisites} Prereqs Met
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Topological Distance:</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
                    {distanceCalc.skillDistance} {distanceCalc.skillDistance === 1 ? 'Step' : 'Steps'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Shortest Dependency Path
                  </div>
                </div>
              </div>

              {/* Sequential Learning Pathway */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-700 uppercase font-semibold">
                  <span>Sequential Learning Pathway</span>
                  <span className="text-[10px] text-indigo-700 font-medium">Topological Ordering</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {distanceCalc.sequentialPathway.map((step) => {
                    const isTarget = step.skillId === selectedSkillId;
                    return (
                      <div
                        key={step.skillId}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          step.isCompleted
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : isTarget
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-950 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-md font-mono text-xs flex items-center justify-center font-bold shrink-0 ${
                            step.isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isTarget
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-slate-200 text-slate-700'
                          }`}>
                            {step.stepNumber}
                          </span>

                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{step.name}</span>
                              {isTarget && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 uppercase font-mono font-bold">
                                  Goal
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> ~{step.estimatedHours} hrs
                              </span>
                              <span>•</span>
                              <span>{step.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSimulateToggle(step.skillId)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            step.isCompleted
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Toggle completion for this milestone"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Prioritized Gap Intelligence & Adaptive Preparation */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                Diagnostic Analysis
              </span>
              <span className="text-slate-500 text-xs">• Skill Gap Prioritization</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Prioritized Gap Intelligence &amp; Practice Drills
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Skill gaps prioritized by hiring impact and evaluation criteria for {candidateIntelligenceEngine.getProfile().targetRole}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/mock-interview"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Launch Practice Interview</span>
            </Link>
          </div>
        </div>

        {/* Adaptive Preparation Rationale Banner */}
        {prepBriefing && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                Preparation Strategy &amp; Role Context
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {prepBriefing}
              </p>
            </div>
          </div>
        )}

        {/* Gap Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setGapFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition border cursor-pointer ${
              gapFilter === 'all'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Gaps ({prioritizedGaps.length})
          </button>
          {[
            { id: 'no_evidence', label: '1. No Evidence', color: 'rose' },
            { id: 'weak_proficiency', label: '2. Weak Proficiency', color: 'amber' },
            { id: 'insufficient_experience', label: '3. Experience Tenure', color: 'purple' },
            { id: 'weak_interview_signal', label: '4. Interview Performance', color: 'red' },
            { id: 'preference_mismatch', label: '5. Preference Mismatch', color: 'blue' },
            { id: 'unmet_requirement', label: '6. Unmet Requirement', color: 'orange' },
          ].map(cat => {
            const count = prioritizedGaps.filter(g => g.gapType === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setGapFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition border cursor-pointer ${
                  gapFilter === cat.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Prioritized Gaps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prioritizedGaps
            .filter(g => gapFilter === 'all' || g.gapType === gapFilter)
            .map((gap) => (
              <div
                key={gap.id}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3.5 transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{gap.priorityRank}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                        {gap.gapTypeLabel}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {gap.title}
                      </h4>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold shrink-0 ${
                    gap.severity === 'critical'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : gap.severity === 'moderate'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {gap.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {gap.reasoning}
                </p>

                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1 font-mono">
                    <Zap className="w-3 h-3 text-indigo-600" />
                    Recommended Remediation:
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {gap.remediationAction}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">
                    Impact Score: <strong className="text-slate-900">{gap.importanceScore}/100</strong>
                  </span>
                  <DataProvenanceBadge
                    level={gap.provenance.level}
                    source={gap.provenance.source}
                    metadata={gap.provenance}
                    size="sm"
                  />
                </div>

                {/* Interactive Micro-Learning Trigger */}
                <button
                  type="button"
                  onClick={() => setMicroLearningSkill({ 
                    id: gap.skillId || 'caching_redis', 
                    name: gap.title 
                  })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Start Practice Sprint</span>
                </button>
              </div>
            ))}
        </div>
      </div>

      <CareerDigitalTwinModal
        isOpen={isDigitalTwinOpen}
        onClose={() => setIsDigitalTwinOpen(false)}
      />

      {microLearningSkill && (
        <MicroLearningModal
          isOpen={!!microLearningSkill}
          onClose={() => setMicroLearningSkill(null)}
          skillId={microLearningSkill.id}
          skillName={microLearningSkill.name}
          onSkillAcquired={() => {
            updateCalculations();
          }}
        />
      )}
    </div>
  );
}
