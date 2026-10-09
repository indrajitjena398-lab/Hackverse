'use client';

import React from 'react';
import { 
  FeedbackFeatureType, 
  ActionItemCorrection, 
  SkillGapCorrection, 
  CareerRecommendationCorrection, 
  JobOutcomeCorrection, 
  InterviewAnalysisCategoryRating 
} from '@/lib/types/feedback';
import { StarRating } from './StarRating';

interface FeedbackCorrectionFormProps {
  featureType: FeedbackFeatureType;
  correctionData: any;
  onChange: (data: any) => void;
}

export function FeedbackCorrectionForm({
  featureType,
  correctionData,
  onChange,
}: FeedbackCorrectionFormProps) {
  // 1. Skill Gap Correction
  if (featureType === 'skill_gap') {
    const skillData: SkillGapCorrection = correctionData?.skillGapCorrection || {
      actualSkillLevel: 'Intermediate',
      skillName: '',
    };

    return (
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
        <label className="block font-semibold text-slate-700">
          What is your actual proficiency level?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                onChange({
                  ...correctionData,
                  skillGapCorrection: { ...skillData, actualSkillLevel: level },
                })
              }
              className={`py-1.5 px-2 rounded-lg font-medium text-center border transition ${
                skillData.actualSkillLevel === level
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Action Item Correction
  if (featureType === 'action_item') {
    const itemData: ActionItemCorrection = correctionData?.actionItemCorrection || {};

    return (
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
        <div className="font-semibold text-slate-800">Correct Action Item Extraction:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Task Description</label>
            <input
              type="text"
              value={itemData.task || ''}
              onChange={(e) =>
                onChange({
                  ...correctionData,
                  actionItemCorrection: { ...itemData, task: e.target.value },
                })
              }
              placeholder="e.g. Complete PCB schematic review"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Assigned Owner</label>
            <input
              type="text"
              value={itemData.owner || ''}
              onChange={(e) =>
                onChange({
                  ...correctionData,
                  actionItemCorrection: { ...itemData, owner: e.target.value },
                })
              }
              placeholder="e.g. Lead Engineer"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Target Deadline</label>
            <input
              type="text"
              value={itemData.deadline || ''}
              onChange={(e) =>
                onChange({
                  ...correctionData,
                  actionItemCorrection: { ...itemData, deadline: e.target.value },
                })
              }
              placeholder="e.g. Friday 5:00 PM"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Priority</label>
            <select
              value={itemData.priority || 'Medium'}
              onChange={(e) =>
                onChange({
                  ...correctionData,
                  actionItemCorrection: { ...itemData, priority: e.target.value as any },
                })
              }
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  // 3. Career Recommendation Correction
  if (featureType === 'career_recommendation') {
    const careerData: CareerRecommendationCorrection = correctionData?.careerCorrection || {};

    return (
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <label className="block font-semibold text-slate-700">
          What career path or specialization are you actually interested in?
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[
            'Embedded Systems Engineer',
            'Full-Stack Developer',
            'Distributed Systems SDE',
            'Robotics & Automation Engineer',
            'AI / ML Systems Engineer',
            'DevOps & Cloud Architect',
          ].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() =>
                onChange({
                  ...correctionData,
                  careerCorrection: { ...careerData, actualCareerInterest: role },
                })
              }
              className={`px-2 py-0.5 rounded text-[11px] border transition ${
                careerData.actualCareerInterest === role
                  ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={careerData.actualCareerInterest || ''}
          onChange={(e) =>
            onChange({
              ...correctionData,
              careerCorrection: { ...careerData, actualCareerInterest: e.target.value },
            })
          }
          placeholder="Or type custom career goal (e.g. Quantum Computing Software)"
          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
        />
      </div>
    );
  }

  // 4. Job Application Outcome
  if (featureType === 'job_application') {
    const jobOutcome: JobOutcomeCorrection = correctionData?.jobOutcomeCorrection || {
      applicationStatus: 'Interview received',
      matchedExpectations: 'Yes',
    };

    return (
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
        <label className="block font-semibold text-slate-700">Current Application Status</label>
        <select
          value={jobOutcome.applicationStatus}
          onChange={(e) =>
            onChange({
              ...correctionData,
              jobOutcomeCorrection: { ...jobOutcome, applicationStatus: e.target.value as any },
            })
          }
          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
        >
          <option value="Applied">Applied</option>
          <option value="Interview received">Interview received</option>
          <option value="Assessment received">Assessment received</option>
          <option value="Selected">Selected</option>
          <option value="Offer received">Offer received</option>
          <option value="Waiting for response">Waiting for response</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Did this opportunity match your expectations?
          </label>
          <div className="flex gap-2">
            {(['Yes', 'Partially', 'No'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  onChange({
                    ...correctionData,
                    jobOutcomeCorrection: { ...jobOutcome, matchedExpectations: opt },
                  })
                }
                className={`flex-1 py-1 px-2 rounded border text-xs font-medium transition ${
                  jobOutcome.matchedExpectations === opt
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Interview Analysis Categories
  if (featureType === 'interview_analysis') {
    const ratings: InterviewAnalysisCategoryRating = correctionData?.interviewCategoryRatings || {
      technicalKnowledge: 4,
      communication: 4,
      confidence: 4,
      problemSolving: 4,
    };

    const updateCategory = (cat: keyof InterviewAnalysisCategoryRating, val: number) => {
      onChange({
        ...correctionData,
        interviewCategoryRatings: { ...ratings, [cat]: val },
      });
    };

    return (
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <span className="block font-semibold text-slate-700 mb-1">
          Detailed Performance Breakdown Rating (1-5):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Technical Depth:</span>
            <StarRating
              size="sm"
              value={ratings.technicalKnowledge || 4}
              onChange={(val) => updateCategory('technicalKnowledge', val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Communication &amp; Tone:</span>
            <StarRating
              size="sm"
              value={ratings.communication || 4}
              onChange={(val) => updateCategory('communication', val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Confidence &amp; Delivery:</span>
            <StarRating
              size="sm"
              value={ratings.confidence || 4}
              onChange={(val) => updateCategory('confidence', val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Problem Solving / Logic:</span>
            <StarRating
              size="sm"
              value={ratings.problemSolving || 4}
              onChange={(val) => updateCategory('problemSolving', val)}
            />
          </div>
        </div>
      </div>
    );
  }

  // 6. Roadmap Priority Skill
  if (featureType === 'career_roadmap') {
    return (
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
        <label className="block font-semibold text-slate-700">
          Which core skill do you want to prioritize first in this roadmap?
        </label>
        <input
          type="text"
          value={correctionData?.roadmapPrioritySkill || ''}
          onChange={(e) =>
            onChange({
              ...correctionData,
              roadmapPrioritySkill: e.target.value,
            })
          }
          placeholder="e.g. Distributed Consensus (Raft), RTOS, Next.js"
          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
        />
      </div>
    );
  }

  return null;
}
