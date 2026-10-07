'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Layers, 
  HelpCircle, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Users, 
  Flame, 
  Clock, 
  Star,
  Target
} from 'lucide-react';
import { COMPANY_INTELLIGENCE_DATA, CompanyIntelligenceProfile } from '@/lib/data/companyIntelligenceData';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';

export default function CompanyIntelligencePage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('stripe');

  const profile: CompanyIntelligenceProfile = COMPANY_INTELLIGENCE_DATA[selectedCompanyId] || COMPANY_INTELLIGENCE_DATA.stripe;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel-elevated border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
              Module 2 Specification
            </span>
            <span className="text-slate-500 text-xs">• RAG Synthesis of Unstructured Reviews &amp; Interview Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Company Intelligence &amp; Interview Mining
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Synthesized public interview debriefs, recurring round blueprints, question frequency distributions, and culture metrics protected by strict provenance trust tags.
          </p>
        </div>

        {/* Company Selector Buttons */}
        <div className="flex items-center gap-2">
          {Object.values(COMPANY_INTELLIGENCE_DATA).map((comp) => (
            <button
              key={comp.companyId}
              onClick={() => setSelectedCompanyId(comp.companyId)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                selectedCompanyId === comp.companyId
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{comp.logo}</span>
              <span>{comp.companyName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Company Overview Header Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            {profile.logo}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white">{profile.companyName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {profile.tagline}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Difficulty: <strong className="text-white">{profile.overallInterviewDifficulty} / 5.0</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-emerald-400" />
                Positive Experience: <strong className="text-white">{profile.positiveExperiencePercent}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Pre-configure Mock Interview */}
        <Link
          href={`/mock-interview?company=${profile.companyId}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
        >
          <Target className="w-4 h-4" />
          <span>Launch Targeted Mock Interview</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {/* Grid: Recurring Rounds vs Question Mining */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recurring Round Formats */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Interview Round Blueprints</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {profile.interviewRounds.length} Sequenced Rounds
            </span>
          </div>

          <div className="space-y-3">
            {profile.interviewRounds.map((round) => (
              <div
                key={round.roundNumber}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      R{round.roundNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white">{round.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {round.typicalDurationMinutes}m
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      Pass: {round.passRatePercentage}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  {round.focusArea}
                </p>

                <div className="pt-2 pl-8 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">Mining Origin:</span>
                  <DataProvenanceBadge
                    level={round.provenance.level}
                    source={round.provenance.source}
                    metadata={round.provenance}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recurring Questions & Culture */}
        <div className="lg:col-span-6 space-y-6">
          {/* Top Mined Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>High-Frequency Mined Questions</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">RAG Aggregated</span>
            </div>

            <div className="space-y-3">
              {profile.minedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 font-mono border border-indigo-800/50 uppercase text-[10px]">
                      {q.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-amber-400 font-bold">★ {q.difficultyRating}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{q.frequencyReported} candidates reported</span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white leading-relaxed">
                    &quot;{q.questionText}&quot;
                  </p>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1 font-mono">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Recommended STAR Answer Angle:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {q.recommendedSTARHook}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">Verification:</span>
                    <DataProvenanceBadge
                      level={q.provenance.level}
                      source={q.provenance.source}
                      metadata={q.provenance}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Culture Insights Card */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Cultural Dimensions &amp; Rubrics
              </h3>
              <DataProvenanceBadge
                level={profile.cultureInsights.provenance.level}
                source={profile.cultureInsights.provenance.source}
                metadata={profile.cultureInsights.provenance}
                size="sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Work-Life</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {profile.cultureInsights.workLifeBalance} / 5
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Compensation</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  {profile.cultureInsights.compensationCompetitiveness} / 5
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Autonomy</div>
                <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
                  {profile.cultureInsights.engineeringAutonomy} / 5
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {profile.cultureInsights.summaryReport}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
