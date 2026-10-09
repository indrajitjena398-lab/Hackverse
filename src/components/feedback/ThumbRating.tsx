'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ThumbRatingProps {
  value?: 'thumbs_up' | 'thumbs_down' | null;
  onChange?: (val: 'thumbs_up' | 'thumbs_down') => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function ThumbRating({
  value = null,
  onChange,
  disabled = false,
  size = 'md',
}: ThumbRatingProps) {
  const isUp = value === 'thumbs_up';
  const isDown = value === 'thumbs_down';

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange && onChange('thumbs_up')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
          isUp
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
        }`}
        title="Helpful / Accurate"
      >
        <ThumbsUp className={`${iconSizes[size]} ${isUp ? 'fill-white' : ''}`} />
        <span>Helpful</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange && onChange('thumbs_down')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
          isDown
            ? 'bg-rose-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
        }`}
        title="Not Helpful / Inaccurate"
      >
        <ThumbsDown className={`${iconSizes[size]} ${isDown ? 'fill-white' : ''}`} />
        <span>Not Helpful</span>
      </button>
    </div>
  );
}
