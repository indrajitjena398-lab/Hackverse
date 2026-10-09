export interface DigitalTwinSimulationParams {
  hoursDedicatedToDistributedSystems: number;
  mockInterviewsToComplete: number;
  skillsToAcquire: string[];
  targetRoleOverride?: string;
  applicationsTargetPerMonth?: number;
}

export interface SkillImpactSimulationResult {
  skillId: string;
  skillName: string;
  roleCoverageGainPercent: number; // e.g. +17%
  readinessGainPercent: number;    // e.g. +11%
  targetJobsUnlockedCount: number;
  estimatedEffortHours: number;
  priorityRank: number;
}

export interface DigitalTwinProjection {
  currentReadiness: number;
  projectedReadiness: number;
  currentRoleMatchesCount: number;
  projectedRoleMatchesCount: number;
  currentSystemDesignScore: number;
  projectedSystemDesignScore: number;
  projectedReadinessBreakdown: {
    technical: number;
    system_design: number;
    coding: number;
    communication: number;
    behavioral: number;
  };
  simulatedSkillsUnlocked: string[];
  timelineWeeksToTarget: number;
}

export interface CareerRecommendationPriority {
  id: string;
  priorityRank: number;
  title: string;
  description: string;
  category: 'learning' | 'interview' | 'application' | 'follow_up';
  expectedReadinessGainPercent: number;
  expectedMatchProbabilityPercent?: number;
  relatedSkillOrCompany: string;
  urgencyLevel: 'immediate' | 'high' | 'medium';
  actionHref: string;
}
