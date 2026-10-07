import { ProvenanceMetadata } from './provenance';

export type FitCategory = 'safe_fit' | 'stretch' | 'reach';

export interface MatchScoreFactor {
  factorName: string;
  impactPercentage: number; // e.g. +20 or -10
  type: 'boost' | 'penalty';
  explanation: string;
  relatedSkillId?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  isRemote: boolean;
  employmentType: 'Full-time' | 'Internship' | 'Contract';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  requiredSkillIds: string[];
  preferredSkillIds: string[];
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  descriptionSnippet: string;
  postingSource: 'Direct ATS' | 'Greenhouse' | 'Lever' | 'Aggregated Feed';
  postedAt: string;
  provenance: ProvenanceMetadata;
}

export interface JobMatchResult {
  jobId: string;
  job: JobPosting;
  overallMatchScore: number; // 0-100
  fitCategory: FitCategory;
  skillGapPercentage: number;
  factors: MatchScoreFactor[];
  missingPrerequisiteSkills: string[];
  actionableRecommendation: string;
}
