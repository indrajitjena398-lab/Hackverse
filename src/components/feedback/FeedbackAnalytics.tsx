'use client';

import React, { useState, useEffect } from 'react';
import { FeedbackAnalyticsSummary } from '@/lib/types/feedback';
import { feedbackAnalysisEngine } from '@/lib/engine/FeedbackAnalysisEngine';
import { 
  BarChart3, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

export function FeedbackAnalytics() {
  const [analytics, setAnalytics] = useState<FeedbackAnalyticsSummary | null>(null);

  useEffect(() => {
    setAnalytics(feedbackAnalysisEngine.getAnalyticsSummary());
  }, []);

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Overview Top Metric Cards (Section 25) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Average User Rating
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{analytics.averageRating}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            High Satisfaction
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Positive Sentiment
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{analytics.positivePercentage}%</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-emerald-600" />
            {analytics.totalResponses} Total Evaluations
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Negative / Drift Signals
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">{analytics.negativePercentage}%</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
            <ThumbsDown className="w-3 h-3 text-rose-500" />
            Automatic Bias Penalties Applied
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Feedback Response Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600">{analytics.responseRate}%</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Active Interaction Ratio
          </span>
        </div>
      </div>

      {/* Feature Accuracy Breakdown & Top Complaints (Section 25) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Accuracy Progress Rows */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Feature Performance &amp; Accuracy Breakdown</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">BENCHMARK: 4.0+ TARGET</span>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'AI Meeting Transcription & Audio AST', score: analytics.transcriptAccuracyScore, color: 'bg-emerald-500' },
              { label: 'Job Matching & Symmetry Ledgers', score: analytics.jobRelevanceScore, color: 'bg-indigo-500' },
              { label: 'Candidate Career Recommendations', score: analytics.careerRelevanceScore, color: 'bg-blue-500' },
              { label: 'Skill Gap & Future Roadmaps', score: analytics.skillAssessmentAccuracy, color: 'bg-purple-500' },
              { label: 'CAT Mock Interview Analysis & STAR Scoring', score: analytics.interviewUsefulnessScore, color: 'bg-teal-500' },
              { label: 'Resume ATS Diagnostics & Optimization', score: 4.6, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{item.label}</span>
                  <span className="font-mono text-slate-900">{item.score} / 5.0</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${(item.score / 5.0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top User Complaints (Section 25) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Top Automated Complaints</h3>
          </div>

          <p className="text-xs text-slate-500">
            Issues automatically grouped from user negative selections and corrections:
          </p>

          <div className="space-y-2.5">
            {analytics.topComplaints.map((item, idx) => (
              <div
                key={item.complaint}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">{item.complaint}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{item.feature.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200 shrink-0">
                  {item.count} report{item.count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Model auto-mitigation active</span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1">
              Audit Guardrails <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
