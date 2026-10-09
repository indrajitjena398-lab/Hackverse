import { ProvenanceMetadata } from './provenance';

export type SkillCategory = 
  | 'languages' 
  | 'backend' 
  | 'distributed_systems' 
  | 'databases' 
  | 'devops_cloud' 
  | 'ai_ml' 
  | 'system_design' 
  | 'data_engineering';

export type MasteryLevel = 'locked' | 'prerequisite_needed' | 'in_progress' | 'proficient' | 'mastered';

export interface SkillNode {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  difficultyTier: 1 | 2 | 3 | 4 | 5; // 1 = Foundational, 5 = Staff/Architect
  marketDemandScore: number; // 0-100
  prerequisiteIds: string[]; // Skills required before this can be mastered
  unlocksSkillIds: string[]; // Downstream skills unlocked by mastering this
  estimatedHoursToMaster: number;
  provenance: ProvenanceMetadata;
}

export interface SkillEdge {
  fromSkillId: string;
  toSkillId: string;
  relationship: 'requires_prerequisite' | 'strengthens' | 'subdomain_of';
}

export interface CandidateSkillState {
  skillId: string;
  masteryLevel: MasteryLevel;
  confidenceScore: number; // 0 - 100
  assessmentEvidence?: string;
  lastUpdated: string;
  verifiedThroughMockInterview: boolean;
}

export interface PrerequisiteChainStep {
  stepNumber: number;
  skillId: string;
  name: string;
  status: MasteryLevel;
  isCompleted: boolean;
  estimatedHours: number;
}

export interface SkillDistanceCalculation {
  targetSkillId: string;
  targetSkillName: string;
  skillDistance: number; // 0 = ready/mastered, higher = longer prerequisite chain
  readinessPercentage: number; // 0-100%
  completedPrerequisites: number;
  totalPrerequisites: number;
  sequentialPathway: PrerequisiteChainStep[];
}
