'use client';

import React, { useState } from 'react';
import { FeedbackDashboard } from '@/components/feedback/FeedbackDashboard';
import { ContextualFeedback } from '@/components/feedback/ContextualFeedback';
import { Sparkles, MessageSquare, Sliders, ShieldCheck } from 'lucide-react';

export default function CandidateFeedbackPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overall'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-16 font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900">
                  Continuous Feedback &amp; AI Intelligence Loop
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  ACTIVE LEARNING
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Context-aware feedback engine dynamically updating your personal Career Intelligence Profile
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Feedback Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overall')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'overall'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rate Platform Experience
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' ? (
          <FeedbackDashboard />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Section 18 • Overall Platform Assessment</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  How useful is our AI Career Intelligence Platform to you?
                </h2>
                <p className="text-xs text-slate-600">
                  Your periodic feedback informs our system engineers and algorithmic prior weights.
                </p>
              </div>

              <ContextualFeedback
                featureType="platform"
                featureId="overall_platform_v2"
                compact={false}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
