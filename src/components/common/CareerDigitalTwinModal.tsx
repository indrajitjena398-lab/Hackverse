'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Calendar, 
  Target, 
  Briefcase,
  X
} from 'lucide-react';
import { careerDigitalTwinEngine } from '@/lib/engine/CareerDigitalTwinEngine';
import { DigitalTwinProjection, SkillImpactSimulationResult } from '@/lib/types/digitalTwin';

interface CareerDigitalTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CareerDigitalTwinModal({ isOpen, onClose }: CareerDigitalTwinModalProps) {
  const [learningHours, setLearningHours] = useState<number>(20);
  const [mockInterviews, setMockInterviews] = useState<number>(3);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['caching_redis', 'distributed_consensus']);
  const [simulationResult, setSimulationResult] = useState<DigitalTwinProjection | null>(null);

  const skillRankings: SkillImpactSimulationResult[] = careerDigitalTwinEngine.getSkillImpactRankings();
  const dailyPriorities = careerDigitalTwinEngine.getDailyPriorities();

  if (!isOpen) return null;

  const handleRunSimulation = () => {
    const res = careerDigitalTwinEngine.runSimulation({
      hoursDedicatedToDistributedSystems: learningHours,
      mockInterviewsToComplete: mockInterviews,
      skillsToAcquire: selectedSkills,
    });
    setSimulationResult(res);
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 text-slate-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-white font-mono font-bold text-xs shadow-2xs">
              AU
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Career Scenarios &amp; Trajectory Simulator
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Project Readiness Lift &amp; Role Eligibility by Effort
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulation Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          {/* Slider 1: Learning Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Distributed Systems Study:</span>
              <span className="font-mono text-indigo-700 font-bold">{learningHours} Hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={learningHours}
              onChange={(e) => setLearningHours(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="text-[10px] text-slate-500 font-mono flex justify-between">
              <span>0h</span>
              <span>30h</span>
              <span>60h</span>
            </div>
          </div>

          {/* Slider 2: Mock Interviews */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Adaptive Mock Interviews:</span>
              <span className="font-mono text-indigo-700 font-bold">{mockInterviews} Sessions</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={mockInterviews}
              onChange={(e) => setMockInterviews(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="text-[10px] text-slate-500 font-mono flex justify-between">
              <span>0</span>
              <span>4</span>
              <span>8</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRunSimulation}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Simulate Scenario Lift</span>
            </button>
          </div>
        </div>

        {/* What-If Simulation Results */}
        {simulationResult && (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                Simulated 4-Week Career Projection
              </span>
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
                Estimated Timeline: {simulationResult.timelineWeeksToTarget} Weeks
              </span>
            </div>

            {/* Score Comparisons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500">Composite Readiness:</div>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-xl text-slate-400 line-through">{simulationResult.currentReadiness}%</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                  <span className="text-3xl font-bold text-slate-900">{simulationResult.projectedReadiness}%</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-mono font-semibold">
                  +{(simulationResult.projectedReadiness - simulationResult.currentReadiness)}% Target Lift
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500">Eligible Role Matches:</div>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-xl text-slate-400 line-through">{simulationResult.currentRoleMatchesCount}</span>
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <span className="text-3xl font-bold text-slate-900">{simulationResult.projectedRoleMatchesCount}</span>
                </div>
                <div className="text-[10px] text-indigo-700 font-mono font-semibold">
                  +{simulationResult.projectedRoleMatchesCount - simulationResult.currentRoleMatchesCount} Unlocked Roles
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500">System Design Readiness:</div>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-xl text-slate-400 line-through">{simulationResult.currentSystemDesignScore}%</span>
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <span className="text-3xl font-bold text-slate-900">{simulationResult.projectedSystemDesignScore}%</span>
                </div>
                <div className="text-[10px] text-indigo-700 font-mono font-semibold">
                  +{(simulationResult.projectedSystemDesignScore - simulationResult.currentSystemDesignScore)}% Mastery Elevation
                </div>
              </div>
            </div>

            {/* Unlocked Competencies */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-600">Projected Competency Milestones:</div>
              <div className="flex flex-wrap gap-2">
                {simulationResult.simulatedSkillsUnlocked.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 shadow-2xs">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skill Impact Rankings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Skill Impact Rankings: Highest Return on Effort</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Ranked by Role Coverage Gain</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skillRankings.map((skill) => {
              const isSelected = selectedSkills.includes(skill.skillId);
              return (
                <div
                  key={skill.skillId}
                  onClick={() => toggleSkill(skill.skillId)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-400 shadow-2xs ring-1 ring-indigo-300'
                      : 'bg-white border border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-mono text-slate-700">
                        #{skill.priorityRank}
                      </span>
                      <span>{skill.skillName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-3">
                      <span>Effort: <strong className="text-slate-700">{skill.estimatedEffortHours}h</strong></span>
                      <span>Roles Unlocked: <strong className="text-indigo-700 font-semibold">+{skill.targetJobsUnlockedCount}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-emerald-700">
                      +{skill.roleCoverageGainPercent}%
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono">Role Coverage</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Priorities */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Recommended Focus Today</span>
          </h3>

          <div className="space-y-2">
            {dailyPriorities.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-mono text-[10px] font-bold">
                      {item.priorityRank}
                    </span>
                    <strong className="text-slate-900 text-xs">{item.title}</strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      +{item.expectedReadinessGainPercent}% Readiness
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed pl-7">
                    {item.description}
                  </p>
                </div>

                <a
                  href={item.actionHref}
                  onClick={onClose}
                  className="shrink-0 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition"
                >
                  Start Practice
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
