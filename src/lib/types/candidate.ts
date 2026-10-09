import { ProvenanceMetadata } from './provenance';

export interface CandidateSkillEvidence {
  sourceType: 'resume' | 'github' | 'interview' | 'assessment' | 'certification' | 'advisor';
  referenceId: string;
  summary: string;
  confidence: number;
  extractedAt: string;
}

export interface CanonicalCandidateSkill {
  id: string;
  name: string;
  category: string;
  level: number; // 1 (Novice) to 5 (Staff/Principal)
  levelLabel: 'locked' | 'prerequisite_needed' | 'in_progress' | 'proficient' | 'mastered';
  confidence: number; // 0.00 to 1.00 (e.g. 0.91)
  evidence: string[]; // e.g. ["resume", "github", "interview"]
  evidenceItems: CandidateSkillEvidence[];
  provenance: ProvenanceMetadata;
  lastUpdated: string;
}

export interface CandidateExperienceItem {
  id: string;
  company: string;
  role: string;
  period: {
    start: string;
    end: string | 'Present';
  };
  location?: string;
  bullets: {
    id: string;
    text: string;
    skills: string[];
    metrics: string[];
    evidence_strength: number; // 0.00 to 1.00
    isHitlApproved: boolean;
  }[];
  provenance: ProvenanceMetadata;
}

export interface CandidateProjectItem {
  id: string;
  title: string;
  description: string;
  repoUrl?: string;
  liveUrl?: string;
  technologies: string[];
  metrics: string[];
  evidence_strength: number;
}

export interface CandidateEducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
  gpa?: string;
}

export interface CandidateCertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  verificationStatus: 'verified' | 'unverified';
}

export interface CandidatePreferences {
  targetLocations: string[];
  remotePreference: 'remote_only' | 'hybrid' | 'onsite' | 'flexible';
  minimumCompensation: number;
  targetCurrency: string;
  targetSeniority: 'Entry' | 'Mid' | 'Senior' | 'Staff' | 'Lead';
  targetIndustries: string[];
}

export interface DimensionalReadiness {
  overall: number;        // 0.00 to 1.00
  technical: number;      // 0.00 to 1.00
  system_design: number;  // 0.00 to 1.00
  coding: number;         // 0.00 to 1.00
  communication: number;  // 0.00 to 1.00
  behavioral: number;     // 0.00 to 1.00
  resume: number;         // 0.00 to 1.00
  interview: number;      // 0.00 to 1.00
  job_fit: number;        // 0.00 to 1.00
  roleWeights: Record<string, number>; // Dynamic role weights e.g. { system_design: 0.25, distributed_systems: 0.20, ... }
  targetRoleProfile: string;
  provenance: ProvenanceMetadata;
}

export interface LearningHistoryItem {
  id: string;
  skillId: string;
  skillName: string;
  type: 'course' | 'practice_lab' | 'system_design_challenge' | 'mock_interview';
  title: string;
  completedAt: string;
  timeSpentHours: number;
  readinessGainPercent: number;
  verifiedScore: number;
}

export interface CanonicalCandidateState {
  candidate_id: string;
  name: string;
  email: string;
  target_roles: string[];
  active_target_role: string;
  skills: Record<string, CanonicalCandidateSkill>;
  experience: CandidateExperienceItem[];
  projects: CandidateProjectItem[];
  education: CandidateEducationItem[];
  certifications: CandidateCertificationItem[];
  preferences: CandidatePreferences;
  applications: any[]; // Reference to tracker ApplicationCards
  interview_history: any[]; // Reference to mock interview sessions
  learning_history: LearningHistoryItem[];
  readiness: DimensionalReadiness;
  tenant_id: string;
  last_mutated_at: string;
  version: number;
}
