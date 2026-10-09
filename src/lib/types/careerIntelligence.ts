/**
 * Cross-Module Coherence Engine & Career Intelligence Profile (CIP) Types
 * Specifications: Sections 1-25 of Cross-Module Coherence Master Architecture
 */

export type SkillProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type EvidenceSourceType = 
  | 'resume' 
  | 'skill_assessment' 
  | 'interview' 
  | 'project' 
  | 'meeting' 
  | 'learning' 
  | 'feedback' 
  | 'github' 
  | 'manual_user';

export interface EvidenceRecord {
  source: EvidenceSourceType;
  detail: string;
  weight: number;
  confidence: number;
  timestamp: string;
  externalRefId?: string;
}

export interface SkillInsight {
  skill: string;
  normalizedName: string;
  category: 'Languages' | 'Frameworks' | 'Databases' | 'Systems & OS' | 'Cloud & DevOps' | 'Core CS' | 'Hardware & Embedded' | 'Soft Skills';
  proficiency: SkillProficiencyLevel;
  numericScore: number; // 0 to 100
  confidence: number;   // 0.0 to 1.0
  sources: EvidenceSourceType[];
  evidenceList: EvidenceRecord[];
  isVerified: boolean;
  last_updated: string;
}

export interface SkillGapInsight {
  skill: string;
  targetRole: string;
  currentProficiency: SkillProficiencyLevel | 'Missing';
  requiredProficiency: SkillProficiencyLevel;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  source: EvidenceSourceType;
  remedyAction: string;
  suggestedLearningTopic: string;
  detectedAt: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  cgpaOrGrade?: string;
  graduationYear: number;
  verified: boolean;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  extractedSkills: string[];
}

export interface ProjectEntry {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  verifiedByCodeAnalysis: boolean;
  confidence: number;
}

export interface ResumeInsights {
  resumeId: string;
  overallScore: number;
  atsParsedAt: string;
  detectedBulletCount: number;
  xyzQuantifiedScore: number;
  topStrengths: string[];
  structuralRisks: string[];
  extractedSkillsSummary: string[];
}

export interface InterviewPerformanceSummary {
  totalInterviews: number;
  averageScore: number;
  technicalDepthScore: number;
  starAdherenceScore: number;
  communicationScore: number;
  pacingWpm: number;
  fillerWordDensityPercent: number;
  recentTopicsTested: string[];
  strengths: string[];
  weaknesses: string[];
  lastInterviewDate?: string;
}

export interface MeetingInsightItem {
  meetingId: string;
  meetingTitle: string;
  timestamp: string;
  skillMentioned?: string;
  careerAdvice?: string;
  actionItemExtracted?: string;
  mentorOrInterviewer?: string;
  confidence: number;
}

export interface ApplicationHistoryItem {
  jobId: string;
  companyName: string;
  roleTitle: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Assessment' | 'Offer' | 'Rejected' | 'Withdrawn';
  matchScoreAtApply: number;
  appliedDate: string;
  outcomeReason?: string;
  identifiedGaps?: string[];
}

export interface RecommendedLearningItem {
  id: string;
  title: string;
  targetSkill: string;
  provider: string;
  durationHours: number;
  difficulty: SkillProficiencyLevel;
  isEnrolled: boolean;
  isCompleted: boolean;
  priorityScore: number;
}

export interface CareerRoadmapStage {
  stageNumber: number;
  title: string;
  skills: string[];
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NEXT_UP' | 'LOCKED';
  completionPercent: number;
}

/**
 * Single Source of Truth: Central Career Intelligence Profile (CIP)
 */
export interface CareerIntelligenceProfile {
  userId: string;
  name: string;
  email: string;
  headline?: string;
  avatarUrl?: string;

  // Personal Information & Academics
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certifications: string[];

  // Skill Intelligence & Profiling
  technicalSkills: Record<string, SkillInsight>;
  softSkills: Record<string, SkillInsight>;
  skillGaps: SkillGapInsight[];

  // Career Goals & Interests
  targetRoles: string[];
  primaryTargetRole: string;
  targetIndustries: string[];
  preferredLocations: string[];
  salaryExpectations?: string;
  workPreferences: {
    workMode: 'Remote' | 'Hybrid' | 'On-site' | 'Any';
    willingToRelocate: boolean;
    companyTypes: string[];
  };
  learningPreferences: {
    weeklyHours: number;
    preferredFormat: 'Video' | 'Hands-on Labs' | 'Documentation' | 'Interactive';
  };
  careerGoals: {
    timelineMonths: number;
    prioritySkillToMaster: string;
    dreamCompanies: string[];
  };

  // Module Intelligence Aggregations
  resumeInsights: ResumeInsights;
  interviewPerformance: InterviewPerformanceSummary;
  jobPreferences: {
    roleAffinities: Record<string, number>; // score 0.0 to 1.0
    dislikedRoles: string[];
    locationAffinities: Record<string, number>;
  };
  applicationHistory: ApplicationHistoryItem[];
  meetingInsights: MeetingInsightItem[];
  userFeedbackSummary: {
    totalGiven: number;
    positiveCount: number;
    negativeCount: number;
    averageSatisfaction: number;
    lastFeedbackDate?: string;
  };
  learningRoadmap: {
    currentStage: number;
    stages: CareerRoadmapStage[];
    recommendedCourses: RecommendedLearningItem[];
  };

  // Macro AI Scores
  careerReadinessScore: number; // 0 to 100
  aiConfidenceScores: {
    skillsOverall: number;
    jobFitOverall: number;
    interviewReadiness: number;
    readinessDefensibility: number;
  };

  // Metadata
  version: number;
  lastUpdated: string;
  auditTrailLength: number;
}

/**
 * Cross-Module Coherence Event System Types
 */
export type CoherenceEventType =
  | 'RESUME_ANALYZED'
  | 'SKILL_UPDATED'
  | 'SKILL_GAP_DETECTED'
  | 'CAREER_GOAL_UPDATED'
  | 'INTERVIEW_COMPLETED'
  | 'INTERVIEW_PERFORMANCE_UPDATED'
  | 'MEETING_ANALYZED'
  | 'JOB_RECOMMENDED'
  | 'JOB_APPLIED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'LEARNING_COMPLETED'
  | 'USER_FEEDBACK_RECEIVED'
  | 'CAREER_PREFERENCE_UPDATED'
  | 'CIP_RECALCULATED';

export interface CoherenceEvent<T = any> {
  eventId: string;
  userId: string;
  module: 
    | 'resume_analyzer'
    | 'skill_assessment'
    | 'skill_gap_analyzer'
    | 'career_goal_engine'
    | 'job_matching'
    | 'learning_recommendation'
    | 'career_roadmap'
    | 'interview_intelligence'
    | 'meeting_intelligence'
    | 'ai_assistant'
    | 'feedback_engine'
    | 'application_tracker'
    | 'system_coordinator';
  eventType: CoherenceEventType;
  payload: T;
  evidence?: {
    source: EvidenceSourceType;
    detail: string;
    confidence: number;
  };
  confidence: number;
  timestamp: string;
  parentEventId?: string;
  processedBy?: string[];
}

export interface ProfileAuditEntry {
  id: string;
  userId: string;
  field: string;
  oldValue: any;
  newValue: any;
  source: EvidenceSourceType | string;
  confidence: number;
  timestamp: string;
  reason: string;
  eventId?: string;
}

/**
 * Filtered slice for requesting module (Shared Context API)
 */
export interface SharedModuleContext {
  userId: string;
  primaryTargetRole: string;
  targetRoles: string[];
  skills: Record<string, { proficiency: SkillProficiencyLevel; numericScore: number; confidence: number }>;
  skillGaps: string[];
  careerReadinessScore: number;
  interviewReadiness: number;
  preferences: {
    workMode: string;
    preferredLocations: string[];
    roleAffinities: Record<string, number>;
  };
  recentFeedbackSentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

/**
 * Module Dependency Graph Representation
 */
export interface ModuleDependencyNode {
  id: string;
  label: string;
  category: 'INPUT' | 'INTELLIGENCE' | 'OUTPUT' | 'LEARNING';
  status: 'IDLE' | 'ACTIVE' | 'PROCESSING' | 'UPDATED';
  lastEventAt?: string;
}

export interface ModuleDependencyLink {
  source: string;
  target: string;
  relationship: string;
  activePulse?: boolean;
}
