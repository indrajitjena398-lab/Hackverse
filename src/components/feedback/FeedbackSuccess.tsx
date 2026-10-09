'use client';

import React from 'react';
import { CheckCircle2, Sparkles, RotateCcw } from 'lucide-react';

interface FeedbackSuccessProps {
  message?: string;
  actionTaken?: string;
  onEdit?: () => void;
  inline?: boolean;
}

export function FeedbackSuccess({
  message = 'Thanks! Your feedback will help personalize your career recommendations.',
  actionTaken,
  onEdit,
  inline = false,
}: FeedbackSuccessProps) {
  const getContextualActionMessage = () => {
    if (!actionTaken) return message;
    if (actionTaken.includes('CALIBRATED_SKILL')) {
      return 'Profile updated based on your feedback. Bayesian priors recalibrated.';
    }
    if (actionTaken.includes('BOOSTED_ROLE') || actionTaken.includes('DECAYED_ROLE') || actionTaken.includes('ADOPTED_EXPLICIT_CAREER')) {
      return "Got it. We'll use this preference to improve future recommendations.";
    }
    if (actionTaken.includes('PRIORITIZED_ROADMAP')) {
      return 'Roadmap sequence updated to prioritize your selected skill.';
    }
    return message;
  };

  if (inline) {
    return (
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate font-medium">{getContextualActionMessage()}</span>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-slate-800 space-y-2.5 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900">Feedback Analyzed &amp; Applied</h4>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              INTELLIGENCE SYNCED
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {getContextualActionMessage()}
          </p>
        </div>
      </div>

      {onEdit && (
        <div className="pt-2 border-t border-emerald-200/60 flex justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Update Response</span>
          </button>
        </div>
      )}
    </div>
  );
}
