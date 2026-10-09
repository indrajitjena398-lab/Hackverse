/**
 * Feedback & Continuous Learning System Types
 * Production Data Model for Context-Aware AI Feedback Engine
 */

export type FeedbackFeatureType =
  | 'meeting_transcript'
  | 'meeting_summary'
  | 'action_item'
  | 'career_recommendation'
  | 'skill_gap'
  | 'resume_analysis'
  | 'job_recommendation'
  | 'job_application'
  | 'interview_analysis'
  | 'interview_question'
  | 'career_roadmap'
  | 'learning_recommendation'
  | 'notification'
  | 'ai_assistant'
  | 'platform'
  | 'video_interview';

export type FeedbackType =
  | 'rating'
  | 'thumbs_up'
  | 'thumbs_down'
  | 'correction'
  | 'preference_update'
  | 'general';

export type FeedbackSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface ActionItemCorrection {
  task?: string;
  owner?: string;
  deadline?: string;
  priority?: 'High' | 'Medium' | 'Low';
  status?: string;
}

export interface SkillGapCorrection {
  actualSkillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  skillName: string;
  discrepancyReason?: string;
}

export interface CareerRecommendationCorrection {
  actualCareerInterest?: string;
  preferredRoles?: string[];
  dislikedRoles?: string[];
  reasonMismatch?: string;
}

export interface JobOutcomeCorrection {
  applicationStatus:
    | 'Applied'
    | 'Interview received'
    | 'Assessment received'
    | 'Rejected'
    | 'Selected'
    | 'Offer received'
    | 'Waiting for response'
    | 'Withdrawn';
  matchedExpectations: 'Yes' | 'Partially' | 'No';
  notes?: string;
}

export interface InterviewAnalysisCategoryRating {
  technicalKnowledge?: number;
  communication?: number;
  confidence?: number;
  answerStructure?: number;
  problemSolving?: number;
  fillerWords?: number;
  behavioralResponses?: number;
  overallPerformance?: number;
}

export interface FeedbackRecord {
  feedback_id: string;
  user_id: string;
  feature_type: FeedbackFeatureType;
  feature_id?: string;
  ai_output_id?: string;
  rating?: number; // 1-5 or 0-10
  feedback_type: FeedbackType;
  reason?: string[];
  comment?: string;
  sentiment: FeedbackSentiment;
  correction_data?: {
    actionItemCorrection?: ActionItemCorrection;
    skillGapCorrection?: SkillGapCorrection;
    careerCorrection?: CareerRecommendationCorrection;
    jobOutcomeCorrection?: JobOutcomeCorrection;
    interviewCategoryRatings?: InterviewAnalysisCategoryRating;
    questionDifficulty?: 'Too easy' | 'Appropriate' | 'Too difficult';
    questionType?: string;
    roadmapPrioritySkill?: string;
    roadmapChanges?: string[];
    customFieldCorrection?: Record<string, any>;
  };
  career_goal?: string;
  timestamp: string;
  ai_confidence_score?: number;
  action_taken?: string;
}

export interface UserCareerPreferences {
  user_id: string;
  preferred_roles: Record<string, number>; // role -> score (0.0 to 1.0)
  disliked_roles: Record<string, number>;
  corrected_skills: Record<string, 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>;
  preferred_industries: string[];
  preferred_locations: string[];
  salary_expectations?: string;
  feedback_count: number;
  feature_quality_scores: Record<FeedbackFeatureType, number>;
  notification_preferences?: {
    frequency: 'Immediately' | 'Daily' | 'Weekly' | 'Disable';
    channels: string[];
  };
  last_feedback_at?: string;
  last_updated: string;
}

export interface FeedbackAnalyticsSummary {
  averageRating: number;
  positivePercentage: number;
  negativePercentage: number;
  totalResponses: number;
  responseRate: number;
  transcriptAccuracyScore: number;
  careerRelevanceScore: number;
  jobRelevanceScore: number;
  skillAssessmentAccuracy: number;
  interviewUsefulnessScore: number;
  featureBreakdown: Record<
    FeedbackFeatureType,
    {
      count: number;
      avgRating: number;
      positiveCount: number;
      negativeCount: number;
    }
  >;
  topComplaints: Array<{
    complaint: string;
    count: number;
    feature: FeedbackFeatureType;
  }>;
  recentFeedbacks: FeedbackRecord[];
}
