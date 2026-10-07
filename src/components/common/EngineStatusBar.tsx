'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Zap, RefreshCw, Layers, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { eventBus, EngineEvent } from '@/lib/engine/EventBus';

export function EngineStatusBar() {
  const [profile, setProfile] = useState(candidateIntelligenceEngine.getProfile());
  const [readiness, setReadiness] = useState<number>(78);
  const [recentEvents, setRecentEvents] = useState<EngineEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<EngineEvent | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Initial sync
    setProfile(candidateIntelligenceEngine.getProfile());
    setReadiness(candidateIntelligenceEngine.getProfile().overallReadinessScore);
    setRecentEvents(eventBus.getRecentEvents().slice(0, 4));

    // Subscribe to EventBus
    const unsubscribeInterview = eventBus.subscribe('MOCK_INTERVIEW_COMPLETED', (evt) => {
      triggerPulse(evt);
    });

    const unsubscribeSkill = eventBus.subscribe('SKILL_ASSESSMENT_UPDATED', (evt) => {
      triggerPulse(evt);
    });

    const unsubscribeResume = eventBus.subscribe('RESUME_BULLET_ACCEPTED', (evt) => {
      triggerPulse(evt);
    });

    const unsubscribeEweis = eventBus.subscribe('EWEIS_INTERVENTION_DEPLOYED', (evt) => {
      triggerPulse(evt);
    });

    const unsubscribeUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', (evt) => {
      triggerPulse(evt);
    });

    const unsubscribeReset = eventBus.subscribe('CANDIDATE_PROFILE_RESET', (evt) => {
      triggerPulse(evt);
    });

    return () => {
      unsubscribeInterview();
      unsubscribeSkill();
      unsubscribeResume();
      unsubscribeEweis();
      unsubscribeUpload();
      unsubscribeReset();
    };
  }, []);

  const triggerPulse = (evt: EngineEvent) => {
    setLastEvent(evt);
    setRecentEvents(eventBus.getRecentEvents().slice(0, 4));
    setProfile(candidateIntelligenceEngine.getProfile());
    setReadiness(candidateIntelligenceEngine.getProfile().overallReadinessScore);
    setPulse(true);
    setTimeout(() => setPulse(false), 2000);
  };

  const handleSimulateInterview = () => {
    setIsSimulating(true);
    // Simulate candidate passing an intensive mock interview on Distributed Caching & Redis
    candidateIntelligenceEngine.setSkillMastery(
      'caching_redis',
      'mastered',
      92,
      'Validated via Adaptive Mock Interview (STAR adherence: 88%, CAT difficulty Level 3).'
    );
    setTimeout(() => setIsSimulating(false), 800);
  };

  const handleSimulateResumeAccept = () => {
    setIsSimulating(true);
    // Simulate candidate accepting the HITL bullet optimization
    candidateIntelligenceEngine.handleBulletDecision('hitl-01', 'accepted');
    setTimeout(() => setIsSimulating(false), 800);
  };

  return (
    <div className={`w-full border-b border-indigo-900/40 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 transition-colors duration-300 ${
      pulse ? 'bg-indigo-950/40 border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.25)]' : ''
    }`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Engine Identifier & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 font-mono font-bold tracking-wider text-indigo-400 uppercase">
              <Cpu className="w-3.5 h-3.5" />
              <span>Candidate-Intelligence Engine</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <span className="text-slate-600">|</span>
            <span>Profile: <strong className="text-slate-200">{profile.name}</strong></span>
            {candidateIntelligenceEngine.isCustomProfile() && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                CUSTOM_RESUME
              </span>
            )}
            <span className="text-slate-600">•</span>
            <span>Target: <strong className="text-slate-200">{profile.targetRole}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              Readiness: 
              <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                {readiness}%
              </span>
            </span>
          </div>
        </div>

        {/* Live Propagation Banner */}
        <div className="flex items-center gap-2 flex-1 justify-center max-w-md">
          {lastEvent ? (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-full animate-in fade-in slide-in-from-top-1 truncate">
              <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="font-semibold">{lastEvent.type}</span>
              <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
              <span className="opacity-90 truncate">Re-computed: {lastEvent.recalculatedModules.join(', ')}</span>
            </div>
          ) : (
            <div className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
              <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>Engine listening for cross-module mutations...</span>
            </div>
          )}
        </div>

        {/* Real-time State Mutation Simulator Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden lg:inline">Quick State Mutator:</span>
          <button
            type="button"
            onClick={handleSimulateInterview}
            disabled={isSimulating}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium transition shadow-sm"
            title="Simulate candidate mastering Distributed Caching & Redis in Mock Interview"
          >
            <Zap className="w-3 h-3" />
            <span>Master Redis (Mock)</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateResumeAccept}
            disabled={isSimulating}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white font-medium transition shadow-sm"
            title="Simulate candidate approving HITL Bullet Rewrite"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Accept HITL Bullet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
