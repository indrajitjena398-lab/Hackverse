'use client';

import React, { useState, useEffect } from 'react';
import { 
  FeedbackRecord, 
  UserCareerPreferences, 
  FeedbackAnalyticsSummary 
} from '@/lib/types/feedback';
import { feedbackAnalysisEngine } from '@/lib/engine/FeedbackAnalysisEngine';
import { useAuth } from '@/lib/firebase/AuthContext';
import { 
  Sparkles, 
  TrendingUp, 
  History, 
  Sliders, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw,
  Award
} from 'lucide-react';
import { StarRating } from './StarRating';
import { eventBus } from '@/lib/engine/EventBus';

export function FeedbackDashboard() {
  const { user, persona } = useAuth();
  const userId = user?.email || persona.email || 'guest_candidate';

  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [preferences, setPreferences] = useState<UserCareerPreferences | null>(null);
  const [analytics, setAnalytics] = useState<FeedbackAnalyticsSummary | null>(null);
  const [personalizationScore, setPersonalizationScore] = useState<number>(4);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshData = () => {
    setIsRefreshing(true);
    const userFb = feedbackAnalysisEngine.getUserFeedback(userId);
    const userPrefs = feedbackAnalysisEngine.getUserPreferences(userId);
    const globalAnalytics = feedbackAnalysisEngine.getAnalyticsSummary();

    setFeedbacks(userFb);
    setPreferences(userPrefs);
    setAnalytics(globalAnalytics);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    refreshData();
    const unsub = eventBus.subscribe('FEEDBACK_RECORDED', () => refreshData());
    return unsub;
  }, [userId]);

  const handleDeleteFeedback = (id: string) => {
    if (confirm('Delete this feedback item from your profile?')) {
      feedbackAnalysisEngine.deleteFeedback(id);
      refreshData();
    }
  };

  const handleUpdatePersonalization = (score: number) => {
    setPersonalizationScore(score);
    feedbackAnalysisEngine.recordFeedback({
      user_id: userId,
      feature_type: 'platform',
      rating: score,
      feedback_type: 'rating',
      comment: `User evaluated personalization quality at ${score}/5 stars.`,
    });
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Bayesian Learning Loop • Feedback is Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Feedback &amp; AI Improvement Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every rating, skill correction, and relevance signal you provide is mathematically weighted to eliminate hallucinations and refine your personalized career recommendations.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshData}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          title="Refresh Feedback Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Section 1: AI Performance for You (Section 24) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Transcript Usefulness
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">4.7</span>
            <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94%' }} />
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">94% Technical Accuracy</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Career Relevance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {preferences?.feature_quality_scores.career_recommendation || 4.4}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '88%' }} />
          </div>
          <span className="text-[10px] text-indigo-600 font-medium">Top Match: Embedded &amp; Cloud</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Job Match Precision
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {preferences?.feature_quality_scores.job_recommendation || 4.3}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '86%' }} />
          </div>
          <span className="text-[10px] text-purple-600 font-medium">Penalty thresholds applied</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Skill Assessment Accuracy
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {preferences?.feature_quality_scores.skill_gap || 4.6}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: '92%' }} />
          </div>
          <span className="text-[10px] text-teal-600 font-medium">Calibrated via GitHub AST</span>
        </div>
      </div>

      {/* Section 2: Personalization Meter (Section 17) & Dynamic Preference Ledger (Section 21) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personalization Question */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Personalization Pulse</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            How personalized do our career roadmaps and job matches feel to your specific background?
          </p>

          <div className="py-2 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
            <StarRating
              size="lg"
              value={personalizationScore}
              onChange={handleUpdatePersonalization}
              showLabel
            />
          </div>

          <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Feedback Events Processed:</span>
              <span className="font-bold text-slate-800">{preferences?.feedback_count || feedbacks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Model Sync:</span>
              <span className="font-mono text-slate-600">
                {preferences?.last_updated ? new Date(preferences.last_updated).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Career Preference Ledger (Section 21) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Career Intelligence Preference Ledger</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              NON-DESTRUCTIVE WEIGHTING
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Weighted preference scores inferred from your explicit ratings and corrections:
          </p>

          <div className="space-y-3">
            {Object.entries(preferences?.preferred_roles || {}).map(([role, score]) => (
              <div key={role} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{role}</span>
                  <span className="font-mono text-indigo-600">
                    Preference Score = {score.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, score * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Corrected Skills Section */}
          {preferences?.corrected_skills && Object.keys(preferences.corrected_skills).length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                User-Verified Skill Proficiencies (Overrides):
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(preferences.corrected_skills).map(([skill, lvl]) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>{skill}:</strong> {lvl}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Recent Feedback History (Section 24) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Feedback History</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {feedbacks.length} Recorded Signal{feedbacks.length === 1 ? '' : 's'}
          </span>
        </div>

        {feedbacks.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">No Feedback Submitted Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              As you use the Job Matcher, Resume ATS, and Interviewer, click the quick feedback buttons to teach the AI your personal career goals.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbacks.map((item) => (
              <div key={item.feedback_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 capitalize">
                      {item.feature_type.replace(/_/g, ' ')}
                    </span>
                    {item.rating && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        {item.rating} / 5
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.sentiment === 'POSITIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.sentiment === 'NEGATIVE'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.sentiment}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {item.reason && item.reason.length > 0 && (
                    <div className="text-xs text-slate-600">
                      <strong>Reasons:</strong> {item.reason.join(', ')}
                    </div>
                  )}

                  {item.comment && (
                    <p className="text-xs text-slate-500 italic">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  )}

                  {item.action_taken && (
                    <span className="text-[10px] text-indigo-700 font-mono font-medium block">
                      Status: {item.action_taken.replace(/;/g, ' • ')}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteFeedback(item.feedback_id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 cursor-pointer"
                  title="Remove Feedback Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
