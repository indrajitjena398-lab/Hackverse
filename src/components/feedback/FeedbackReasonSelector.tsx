'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface FeedbackReasonSelectorProps {
  label?: string;
  options: string[];
  selectedReasons: string[];
  onChange: (selected: string[]) => void;
  variant?: 'positive' | 'negative' | 'neutral';
}

export function FeedbackReasonSelector({
  label,
  options,
  selectedReasons,
  onChange,
  variant = 'neutral',
}: FeedbackReasonSelectorProps) {
  const toggleReason = (option: string) => {
    if (selectedReasons.includes(option)) {
      onChange(selectedReasons.filter(r => r !== option));
    } else {
      onChange([...selectedReasons, option]);
    }
  };

  const getChipColors = (isSelected: boolean) => {
    if (!isSelected) {
      return 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50';
    }

    if (variant === 'positive') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-xs';
    }
    if (variant === 'negative') {
      return 'bg-rose-50 text-rose-800 border-rose-300 font-semibold shadow-xs';
    }
    return 'bg-indigo-50 text-indigo-800 border-indigo-300 font-semibold shadow-xs';
  };

  return (
    <div className="space-y-2">
      {label && (
        <span className="block text-xs font-semibold text-slate-700">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = selectedReasons.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleReason(option)}
              className={`px-2.5 py-1 rounded-lg text-xs border transition flex items-center gap-1.5 cursor-pointer ${getChipColors(
                isSelected
              )}`}
            >
              {isSelected && <Check className="w-3 h-3 shrink-0" />}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
