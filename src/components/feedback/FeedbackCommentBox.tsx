'use client';

import React from 'react';

interface FeedbackCommentBoxProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  maxLength?: number;
}

export function FeedbackCommentBox({
  label = 'Tell us more (Optional)',
  placeholder = 'Add any context, technical observations, or suggestions...',
  value,
  onChange,
  rows = 2,
  maxLength = 500,
}: FeedbackCommentBoxProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-[10px] text-slate-400 font-mono">
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition resize-none"
      />
    </div>
  );
}
