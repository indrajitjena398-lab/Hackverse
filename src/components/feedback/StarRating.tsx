'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value?: number;
  max?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 - Not useful / Inaccurate',
  2: '2 - Slightly useful',
  3: '3 - Moderately useful',
  4: '4 - Very useful',
  5: '5 - Extremely useful / Flawless',
};

export function StarRating({
  value = 0,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
  };

  const activeValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {Array.from({ length: max }, (_, idx) => {
          const starNum = idx + 1;
          const isFilled = starNum <= activeValue;

          return (
            <button
              key={starNum}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(starNum)}
              onMouseEnter={() => !readOnly && setHoverValue(starNum)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={`p-0.5 rounded transition transform active:scale-90 ${
                readOnly ? 'cursor-default' : 'hover:scale-110 cursor-pointer focus:outline-hidden'
              }`}
              title={`${starNum} of ${max} stars`}
              aria-label={`${starNum} stars`}
            >
              <Star
                className={`${starSizeClasses[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 stroke-amber-500'
                    : 'text-slate-300 fill-transparent stroke-slate-300 hover:text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && activeValue > 0 && (
        <span className="text-[11px] font-medium text-slate-600">
          {RATING_LABELS[activeValue] || `${activeValue} / ${max}`}
        </span>
      )}
    </div>
  );
}
