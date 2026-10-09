'use client';

import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, User } from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { eventBus, EngineEvent } from '@/lib/engine/EventBus';
import { useAuth } from '@/lib/firebase/AuthContext';

export function EngineStatusBar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(candidateIntelligenceEngine.getProfile());
  const [readiness, setReadiness] = useState<number>(78);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setProfile(candidateIntelligenceEngine.getProfile());
    setReadiness(candidateIntelligenceEngine.getProfile().overallReadinessScore);

    const unsubscribeInterview = eventBus.subscribe('MOCK_INTERVIEW_COMPLETED', (evt) => triggerPulse(evt));
    const unsubscribeSkill = eventBus.subscribe('SKILL_ASSESSMENT_UPDATED', (evt) => triggerPulse(evt));
    const unsubscribeSkillAcquired = eventBus.subscribe('SKILL_ACQUIRED', (evt) => triggerPulse(evt));
    const unsubscribeResume = eventBus.subscribe('RESUME_BULLET_ACCEPTED', (evt) => triggerPulse(evt));
    const unsubscribeEweis = eventBus.subscribe('EWEIS_INTERVENTION_DEPLOYED', (evt) => triggerPulse(evt));
    const unsubscribeUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', (evt) => triggerPulse(evt));
    const unsubscribeReset = eventBus.subscribe('CANDIDATE_PROFILE_RESET', (evt) => triggerPulse(evt));

    return () => {
      unsubscribeInterview();
      unsubscribeSkill();
      unsubscribeSkillAcquired();
      unsubscribeResume();
      unsubscribeEweis();
      unsubscribeUpload();
      unsubscribeReset();
    };
  }, []);

  const triggerPulse = (evt: EngineEvent) => {
    setProfile(candidateIntelligenceEngine.getProfile());
    setReadiness(candidateIntelligenceEngine.getProfile().overallReadinessScore);
    setPulse(true);
    setTimeout(() => setPulse(false), 2000);
  };

  return (
    <div className={`w-full border-b border-slate-200/80 bg-white py-2 transition-colors duration-200 ${
      pulse ? 'bg-slate-50' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 text-xs overflow-x-auto">
        {/* Left: Active Profile Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex items-center gap-1.5 font-medium text-slate-800 text-[11px]">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.displayName || profile.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="text-slate-300">•</span>
            <span className="hidden md:inline text-slate-600 truncate max-w-[180px]">{profile.targetRole}</span>
            <span className="text-slate-300">•</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
              readiness >= 75 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              readiness >= 50 ? 'bg-amber-50 text-amber-800 border-amber-200' :
              'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {readiness}% Role Match Readiness
            </span>
          </div>
        </div>

        {/* Right: Security & Data Trust Protocol */}
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-mono">
            <Activity className="w-3 h-3 text-slate-400" />
            <span>Profile Synced</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 font-mono text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>FERPA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
