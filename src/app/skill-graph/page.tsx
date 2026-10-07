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
  Flame
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { SkillNode, SkillDistanceCalculation, MasteryLevel } from '@/lib/types/skills';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';
import { eventBus } from '@/lib/engine/EventBus';

export default function SkillGraphDldmPage() {
  const dldm = candidateIntelligenceEngine.getDLDM();
  const allSkills = dldm.getAllSkills();

  const [candidateSkills, setCandidateSkills] = useState(candidateIntelligenceEngine.getCandidateSkills());
  const [selectedSkillId, setSelectedSkillId] = useState<string>('system_design');
  const [distanceCalc, setDistanceCalc] = useState<SkillDistanceCalculation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const updateCalculations = () => {
    const updatedMap = candidateIntelligenceEngine.getCandidateSkills();
    setCandidateSkills(new Map(updatedMap));

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
    const unsubscribeUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', () => updateCalculations());
    const unsubscribeReset = eventBus.subscribe('CANDIDATE_PROFILE_RESET', () => updateCalculations());

    return () => {
      unsubscribe();
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
      'Direct user simulator toggle on DLDM Skill Graph.'
    );
    updateCalculations();
  };

  const selectedNode = dldm.getSkill(selectedSkillId);

  const getStatusBadge = (level: MasteryLevel) => {
    switch (level) {
      case 'mastered':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">Mastered (90%+)</span>;
      case 'proficient':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold">Proficient (75-89%)</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-700 font-bold">In Progress</span>;
      case 'prerequisite_needed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-700 font-bold">Prereq Needed</span>;
      case 'locked':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-500 border border-slate-800">Locked</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel-elevated border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              Novelty Feature 1
            </span>
            <span className="text-slate-500 text-xs">• Graph-Based Skill-Graph &amp; Dynamic Learning Dependency Matrix (DLDM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ontology DAG &amp; Prerequisite Sequencing
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Replaces flat keyword matching with a Directed Acyclic Graph (DAG) ontology. Computes topological prerequisite chains, skill distance metrics, and sequential pathways.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Candidate Skill Graph:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold">
              {candidateIntelligenceEngine.getProfile().name} ({candidateIntelligenceEngine.getProfile().targetRole})
            </span>
            {candidateIntelligenceEngine.isCustomProfile() && (
              <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-600 text-[11px] font-bold">
                ✓ Uploaded Resume Calibrated
              </span>
            )}
          </div>
        </div>

        {/* Quick Simulator Highlight */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-mono">DLDM Engine Status</span>
            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <Zap className="w-3.5 h-3.5" />
              Dynamic Recalibration Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Visual DAG vs Prerequisite Pathway */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Graph Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-indigo-400" />
              <span>Skill Ontology Nodes ({allSkills.length} Verified Skills)</span>
            </h3>

            {/* Category Filter */}
            <div className="flex items-center gap-1 text-xs">
              {['all', 'distributed_systems', 'databases', 'devops_cloud', 'ai_ml'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                    filterCategory === cat
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Graph Nodes Canvas / Matrix */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
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
                          ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg'
                          : isPrereqOfSelected
                          ? 'bg-slate-900/90 border-amber-600/70'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-500">Tier {skill.difficultyTier}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[10px] font-mono text-indigo-400 uppercase">{skill.category.replace('_', ' ')}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-indigo-300 transition">
                            {skill.name}
                          </h4>
                        </div>
                        {getStatusBadge(mastery)}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {skill.description}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-mono">
                          {skill.prerequisiteIds.length === 0 ? 'No prerequisites' : `${skill.prerequisiteIds.length} prereqs`}
                        </span>

                        {/* Interactive toggle simulation button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateToggle(skill.id);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition ${
                            mastery === 'mastered'
                              ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                          }`}
                          title="Click to toggle candidate mastery state and watch dynamic DAG cascade"
                        >
                          {mastery === 'mastered' ? 'Reset to In-Progress' : 'Mark as Mastered'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Prerequisite Chain & Sequential Pathway */}
        <div className="lg:col-span-5 space-y-4">
          {selectedNode && distanceCalc ? (
            <div className="p-6 rounded-2xl glass-panel-elevated border border-indigo-900/60 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400 uppercase font-bold">
                    Target Dependency Chain
                  </span>
                  <DataProvenanceBadge
                    level={selectedNode.provenance.level}
                    source={selectedNode.provenance.source}
                    metadata={selectedNode.provenance}
                    size="sm"
                  />
                </div>
                <h2 className="text-xl font-black text-white mt-1">{selectedNode.name}</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedNode.description}</p>
              </div>

              {/* Distance & Readiness Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs text-slate-400">Prerequisite Readiness:</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    {distanceCalc.readinessPercentage}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {distanceCalc.completedPrerequisites} of {distanceCalc.totalPrerequisites} Prereqs Fulfilled
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs text-slate-400">Calculated Skill Distance:</div>
                  <div className="text-2xl font-black text-indigo-300 font-mono mt-0.5">
                    {distanceCalc.skillDistance} {distanceCalc.skillDistance === 1 ? 'Step' : 'Steps'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Shortest Topological Path
                  </div>
                </div>
              </div>

              {/* Sequential Learning Pathway */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 uppercase font-semibold">
                  <span>Sequential Learning Pathway</span>
                  <span className="text-[10px] text-indigo-400">DLDM Topological Order</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {distanceCalc.sequentialPathway.map((step) => {
                    const isTarget = step.skillId === selectedSkillId;
                    return (
                      <div
                        key={step.skillId}
                        className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          step.isCompleted
                            ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-200'
                            : isTarget
                            ? 'bg-indigo-950/50 border-indigo-700/80 text-white shadow-sm'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-md font-mono text-xs flex items-center justify-center font-bold shrink-0 ${
                            step.isCompleted
                              ? 'bg-emerald-900 text-emerald-300'
                              : isTarget
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {step.stepNumber}
                          </span>

                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{step.name}</span>
                              {isTarget && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-200 uppercase font-mono">
                                  Goal
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> ~{step.estimatedHours} hrs
                              </span>
                              <span>•</span>
                              <span>{step.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Unlock / Check Button */}
                        <button
                          type="button"
                          onClick={() => handleSimulateToggle(step.skillId)}
                          className={`p-1.5 rounded-lg border transition ${
                            step.isCompleted
                              ? 'bg-emerald-900/60 border-emerald-600 text-emerald-300 hover:bg-emerald-800'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
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

              {/* Learning Resource Links */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Curated Learning Modules for {selectedNode.name}:</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span>1. Interactive Hands-on Architecture Lab</span>
                    <span className="text-[10px] font-mono text-emerald-400">Open Source</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span>2. Production Failure Chaos Drills</span>
                    <span className="text-[10px] font-mono text-indigo-400">Enterprise Rubric</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
