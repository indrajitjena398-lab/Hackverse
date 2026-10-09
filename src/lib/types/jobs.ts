import { ProvenanceMetadata } from './provenance';

export type FitCategory = 'safe_fit' | 'stretch' | 'reach';
export type TaxonomySeniorityLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';

export interface MatchScoreFactor {
  factorName: string;
  impactPercentage: number; // e.g. +20 or -10
  type: 'boost' | 'penalty';
  explanation: string;
  relatedSkillId?: string;
}

export interface JobWeights {
  semanticSim: number;
  skillCoverage: number;
  experience: number;
  seniority: number;
}

export const SENIORITY_WEIGHT_TAXONOMY: Record<TaxonomySeniorityLevel, JobWeights> = {
  Entry: {
    skillCoverage: 0.50,
    semanticSim: 0.30,
    experience: 0.10,
    seniority: 0.10,
  },
  Mid: {
    skillCoverage: 0.40,
    semanticSim: 0.35,
    experience: 0.15,
    seniority: 0.10,
  },
  Senior: {
    skillCoverage: 0.30,
    semanticSim: 0.40,
    experience: 0.20,
    seniority: 0.10,
  },
  Lead: {
    skillCoverage: 0.25,
    semanticSim: 0.45,
    experience: 0.20,
    seniority: 0.10,
  },
};

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
  experienceLevel: TaxonomySeniorityLevel;
  requiredYearsExperience?: number;
  seniorityLevel?: string;
  descriptionSnippet: string;
  postingSource: 'Direct ATS' | 'Greenhouse' | 'Lever' | 'Aggregated Feed';
  postedAt: string;
  embedding?: number[];
  employerCounterRequirements?: EmployerCounterRequirements;
  provenance: ProvenanceMetadata;
}

export interface EmployerCounterRequirements {
  minCgpa?: number;
  maxApplicationAttemptsPerYear?: number;
  requiresWorkAuthorization?: boolean;
  physicalPresenceRequired?: boolean;
  pipelineVolume: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_VOLUME';
  activeApplicantCount?: number;
}

export interface SymmetricResponseProbability {
  responseProbabilityPercent: number;
  pipelineTier: 'High Selectivity (Top 5%)' | 'Moderate Competition' | 'Fast-Track Pipeline';
  dealbreakersPassed: boolean;
  violatedDealbreakers: string[];
  counterRequirementSummary: string;
}

export interface MatchLedgerItem {
  name: string;
  points: number;
  type: 'base' | 'additive' | 'subtractive';
  explanation: string;
  skillId?: string;
}

export interface MatchLedger {
  baseScore: number;
  additiveSkills: MatchLedgerItem[];
  subtractiveGaps: MatchLedgerItem[];
  totalAdditive: number;
  totalSubtractive: number;
  netMatchScore: number;
  formulaDisplay: string;
}

export interface ConceptualFitReasoning {
  strongAlignments: string[];
  missingWeakEvidence: string[];
  requirementUncertainties: string[];
  conceptualSummary: string;
}

export interface JobMatchResult {
  jobId: string;
  job: JobPosting;
  overallMatchScore: number; // 0-100
  fitCategory: FitCategory;
  skillGapPercentage: number;
  factors: MatchScoreFactor[];
  weightsApplied: JobWeights;
  scoreBreakdown: {
    semanticSim: number;
    skillCoverage: number;
    experience: number;
    seniority: number;
    penalties: number;
  };
  missingPrerequisiteSkills: string[];
  actionableRecommendation: string;
  matchLedger?: MatchLedger;
  conceptualReasoning?: ConceptualFitReasoning;
  symmetricResponseProbability?: SymmetricResponseProbability;
  neuralMatch?: import('./neuralMatcher').NeuralMatchResponse;
}
