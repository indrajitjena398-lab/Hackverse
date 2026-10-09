'use client';

import React, { useState } from 'react';
import { 
  FeedbackFeatureType, 
  FeedbackType, 
  FeedbackRecord, 
  FeedbackSentiment 
} from '@/lib/types/feedback';
import { StarRating } from './StarRating';
import { ThumbRating } from './ThumbRating';
import { FeedbackReasonSelector } from './FeedbackReasonSelector';
import { FeedbackCommentBox } from './FeedbackCommentBox';
import { FeedbackCorrectionForm } from './FeedbackCorrectionForm';
import { FeedbackSuccess } from './FeedbackSuccess';
import { feedbackAnalysisEngine } from '@/lib/engine/FeedbackAnalysisEngine';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Sparkles, ChevronDown, ChevronUp, Send, MessageSquare } from 'lucide-react';

export interface ContextualFeedbackProps {
  featureType: FeedbackFeatureType;
  featureId?: string;
  aiOutputId?: string;
  careerGoal?: string;
  initialRating?: number;
  initialFeedbackType?: FeedbackType;
  compact?: boolean;
  className?: string;
  onSubmitted?: (record: FeedbackRecord) => void;
}

// Contextual Questions & Reasons by Feature Type (Sections 3 - 18)
const FEATURE_CONFIGS: Record<
  FeedbackFeatureType,
  {
    primaryQuestion: string;
    ratingType: 'stars' | 'thumbs' | 'choice';
    positiveReasons?: string[];
    negativeReasons: string[];
    allowCorrection?: boolean;
  }
> = {
  meeting_transcript: {
    primaryQuestion: 'How useful was this transcript?',
    ratingType: 'stars',
    positiveReasons: [
      'Accurate transcription',
      'Important points captured',
      'Speaker identification',
      'Technical terms correctly recognized',
      'Action items identified',
      'Saved time',
    ],
    negativeReasons: [
      'Incorrect words',
      'Incorrect speaker identification',
      'Missing information',
      'Incorrect technical terminology',
      'Too long / poor organization',
    ],
  },
  meeting_summary: {
    primaryQuestion: 'How accurate was this meeting summary?',
    ratingType: 'stars',
    positiveReasons: [
      'Very accurate',
      'Captured key decisions',
      'Action items clear',
      'Saved time',
    ],
    negativeReasons: [
      'Missing important discussion',
      'Missing deadline / owner',
      'Repeated small talk',
      'Excessive irrelevant detail',
    ],
  },
  action_item: {
    primaryQuestion: 'Did we correctly extract this action item?',
    ratingType: 'thumbs',
    negativeReasons: [
      'Incorrect task description',
      'Wrong person assigned',
      'Incorrect deadline',
      'Wrong priority',
    ],
    allowCorrection: true,
  },
  career_recommendation: {
    primaryQuestion: 'How relevant is this career recommendation?',
    ratingType: 'stars',
    positiveReasons: [
      'Matches my interests',
      'Matches my skills',
      'Matches my education',
      'Good employment & salary potential',
    ],
    negativeReasons: [
      'I do not want this career',
      'Does not match my skills',
      'Too generic',
      'Unrealistic requirement',
    ],
    allowCorrection: true,
  },
  skill_gap: {
    primaryQuestion: 'Is this skill assessment accurate?',
    ratingType: 'thumbs',
    positiveReasons: [
      'Accurate level estimation',
      'Identified critical missing stack',
    ],
    negativeReasons: [
      'AI underestimated my skill',
      'AI overestimated my skill',
      'Skill is irrelevant to my goal',
      'Another core skill is missing',
    ],
    allowCorrection: true,
  },
  resume_analysis: {
    primaryQuestion: 'How useful was this resume analysis?',
    ratingType: 'stars',
    positiveReasons: [
      'Missing skills detected',
      'ATS keyword suggestions',
      'Formatting suggestions',
      'Project impact quantification',
    ],
    negativeReasons: [
      'Too generic',
      'Wrong engineering domain',
      'Misunderstood technical experience',
      'Unrealistic ATS suggestions',
    ],
  },
  job_recommendation: {
    primaryQuestion: 'How relevant is this job opportunity to you?',
    ratingType: 'stars',
    positiveReasons: [
      'Matches my technical stack',
      'Preferred location',
      'Good role trajectory',
    ],
    negativeReasons: [
      'Skills do not match',
      'Experience requirement unsuitable',
      'Location / work type unsuitable',
      'Company not preferred',
      'Career goal does not match',
    ],
  },
  job_application: {
    primaryQuestion: 'Update outcome: Did this opportunity match expectations?',
    ratingType: 'thumbs',
    negativeReasons: [
      'Role differed from description',
      'Salary differed from listing',
      'Interview process too slow',
    ],
    allowCorrection: true,
  },
  interview_analysis: {
    primaryQuestion: 'How useful was the AI interview analysis?',
    ratingType: 'stars',
    positiveReasons: [
      'Specific actionable feedback',
      'Accurate technical analysis',
      'Helpful communication critique',
    ],
    negativeReasons: [
      'Feedback was too generic',
      'Incorrect technical evaluation',
      'Need more concrete questions',
    ],
    allowCorrection: true,
  },
  interview_question: {
    primaryQuestion: 'How relevant was this interview question?',
    ratingType: 'stars',
    positiveReasons: [
      'Great industry relevance',
      'Appropriate difficulty',
      'Tested real trade-offs',
    ],
    negativeReasons: [
      'Too easy',
      'Too difficult / out of scope',
      'Irrelevant to target role',
    ],
  },
  career_roadmap: {
    primaryQuestion: 'How useful is this career progression roadmap?',
    ratingType: 'stars',
    positiveReasons: [
      'Logical step-by-step sequence',
      'Relevant portfolio projects',
      'Realistic timeline',
    ],
    negativeReasons: [
      'Wrong learning sequence',
      'Missing core prerequisite',
      'Timeline too aggressive',
    ],
    allowCorrection: true,
  },
  learning_recommendation: {
    primaryQuestion: 'Is this learning recommendation useful?',
    ratingType: 'thumbs',
    positiveReasons: [
      'High-quality resource',
      'Right complexity level',
    ],
    negativeReasons: [
      'Not relevant to career',
      'Too basic',
      'Too advanced',
      'Already know this',
      'Better resource available elsewhere',
    ],
  },
  notification: {
    primaryQuestion: 'Are these career & placement alerts useful?',
    ratingType: 'stars',
    positiveReasons: ['Timely and relevant opportunities'],
    negativeReasons: [
      'Too many alerts',
      'Not relevant to my target domain',
      'Duplicate notifications',
    ],
  },
  ai_assistant: {
    primaryQuestion: 'Was this response helpful?',
    ratingType: 'thumbs',
    negativeReasons: [
      'Incorrect technical information',
      'Did not answer question',
      'Too generic / not personalized',
      'Need more practical detail',
    ],
  },
  platform: {
    primaryQuestion: 'How useful is the AURA Career Intelligence Platform?',
    ratingType: 'stars',
    positiveReasons: [
      'Helped me land placements',
      'Accurate ATS scoring',
      'Realistic mock interviews',
    ],
    negativeReasons: [
      'Needs better mobile responsiveness',
      'Needs more company test cases',
    ],
  },
  video_interview: {
    primaryQuestion: 'Was this placement interview debrief useful for your prep?',
    ratingType: 'stars',
    positiveReasons: [
      'Clear explanation of why candidate got placed',
      'Accurate technical speech transcript',
      'Practical answers & code trade-offs',
      'High motivation & realistic standards',
    ],
    negativeReasons: [
      'Need more questions covered',
      'Transcript missing edge cases',
      'Role differed from my interest',
    ],
  },
};

export function ContextualFeedback({
  featureType,
  featureId,
  aiOutputId,
  careerGoal,
  initialRating,
  initialFeedbackType,
  compact = false,
  className = '',
  onSubmitted,
}: ContextualFeedbackProps) {
  const { user, persona } = useAuth();
  const userId = user?.email || persona.email || 'guest_candidate';

  const config = FEATURE_CONFIGS[featureType] || FEATURE_CONFIGS.platform;

  // Progressive Disclosure States
  const [rating, setRating] = useState<number | undefined>(initialRating);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | undefined>(initialFeedbackType);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [correctionData, setCorrectionData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<FeedbackRecord | null>(null);

  // Progressive trigger
  const handlePrimaryRating = (newRating: number) => {
    setRating(newRating);
    setFeedbackType('rating');
    // If rating is moderate or low, auto-expand reasons
    if (newRating <= 3) {
      setIsExpanded(true);
    }
  };

  const handleThumbSelect = (type: 'thumbs_up' | 'thumbs_down') => {
    setFeedbackType(type);
    setRating(type === 'thumbs_up' ? 5 : 2);
    if (type === 'thumbs_down') {
      setIsExpanded(true);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: Partial<FeedbackRecord> = {
        user_id: userId,
        feature_type: featureType,
        feature_id: featureId,
        ai_output_id: aiOutputId,
        rating,
        feedback_type: feedbackType || 'rating',
        reason: selectedReasons,
        comment: comment.trim(),
        correction_data: Object.keys(correctionData).length > 0 ? correctionData : undefined,
        career_goal: careerGoal,
      };

      // 1. Save locally via engine for instant reactive learning
      const localResult = feedbackAnalysisEngine.recordFeedback(payload);

      // 2. Transmit to server API for PostgreSQL persistence
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localResult),
        });
      } catch (err) {
        console.warn('Backend feedback sync bypassed (stored in client engine):', err);
      }

      setSubmittedRecord(localResult);
      if (onSubmitted) {
        onSubmitted(localResult);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setSubmittedRecord(null);
    setIsExpanded(true);
  };

  if (submittedRecord) {
    return (
      <FeedbackSuccess
        actionTaken={submittedRecord.action_taken}
        onEdit={handleEdit}
        inline={compact}
      />
    );
  }

  // Determine current sentiment for adaptive reason lists
  const currentSentiment: FeedbackSentiment = feedbackType === 'thumbs_down' || (rating && rating <= 2)
    ? 'NEGATIVE'
    : 'POSITIVE';

  return (
    <div
      className={`rounded-xl border transition-all ${
        compact
          ? 'p-3 bg-slate-50/70 border-slate-200'
          : 'p-4 bg-white border-slate-200/90 shadow-2xs'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-indigo-600" />
          </div>
          <span className="text-xs font-semibold text-slate-800">
            {config.primaryQuestion}
          </span>
        </div>

        {/* Primary Rating Controls (Progressive Disclosure Step 1) */}
        <div className="flex items-center gap-3 shrink-0">
          {config.ratingType === 'thumbs' ? (
            <ThumbRating
              value={feedbackType as any}
              onChange={handleThumbSelect}
              size="sm"
            />
          ) : (
            <StarRating
              value={rating}
              onChange={handlePrimaryRating}
              size="sm"
              showLabel={false}
            />
          )}

          {/* Expand / Collapse Details Button */}
          {(rating !== undefined || feedbackType !== undefined) && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-600 p-1 transition cursor-pointer"
              title="Add detailed feedback"
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progressive Disclosure Step 2: Reasons, Corrections & Notes */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
          {/* Reason Selector Chips */}
          <FeedbackReasonSelector
            label={currentSentiment === 'NEGATIVE' ? 'What went wrong or was missing?' : 'What worked well?'}
            options={
              currentSentiment === 'NEGATIVE'
                ? config.negativeReasons
                : config.positiveReasons || config.negativeReasons
            }
            selectedReasons={selectedReasons}
            onChange={setSelectedReasons}
            variant={currentSentiment === 'NEGATIVE' ? 'negative' : 'positive'}
          />

          {/* Contextual Structured Correction Form */}
          {config.allowCorrection && (
            <FeedbackCorrectionForm
              featureType={featureType}
              correctionData={correctionData}
              onChange={setCorrectionData}
            />
          )}

          {/* Optional Text Comment */}
          <FeedbackCommentBox
            value={comment}
            onChange={setComment}
            placeholder={
              currentSentiment === 'NEGATIVE'
                ? 'Tell us what would make this recommendation accurate...'
                : 'Any specific feedback or ideas to improve?'
            }
          />

          {/* Submit Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              Feedback securely calibrates your personal AI twin
            </span>

            <button
              type="submit"
              disabled={isSubmitting || (rating === undefined && feedbackType === undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>{isSubmitting ? 'Calibrating...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Direct inline submit button if rating clicked but not expanded */}
      {!isExpanded && (rating !== undefined || feedbackType !== undefined) && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Add more details</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : 'Save Rating'}
          </button>
        </div>
      )}
    </div>
  );
}
