import { ProvenanceMetadata } from './provenance';

export type EweisRiskLevel = 'critical_risk' | 'moderate_risk' | 'placement_ready';

export interface StudentAnomalyVector {
  studentId: string;
  name: string;
  email: string;
  major: string;
  gradYear: number;
  placementSeasonDaysRemaining: number; // e.g. 90
  placementProbability: number;        // 0-100%
  riskLevel: EweisRiskLevel;
  metrics: {
    atsResumeScore: number;
    mockInterviewStarAdherence: number;
    dldmSkillGraphDepth: number;
    weeklyApplicationRate: number;
  };
  anomalyFactors: string[];
  recommendedIntervention: string;
  provenance: ProvenanceMetadata;
}

export interface ActionableInterventionPlan {
  id: string;
  title: string;
  targetDepartment: string;
  targetedStudentCount: number;
  targetedSkillGap: string;
  riskTrigger: string;
  daysBeforeSeason: number;
  actionProtocol: string;
  suggestedBootcampModules: string[];
  status: 'draft' | 'deployed' | 'in_progress' | 'completed';
  projectedSuccessLiftPercent: number; // e.g. +28%
  provenance: ProvenanceMetadata;
}

export interface DepartmentSkillHealth {
  department: string;
  studentCount: number;
  averageReadinessScore: number;
  placementRateProjected: number;
  atRiskCount: number;
  skillsDistribution: {
    skillName: string;
    masteredPercent: number;
    inProgressPercent: number;
    gapPercent: number;
  }[];
}

export interface InstitutionalPlacementFunnel {
  totalEnrolled: number;
  profileCompleted: number;
  atsCompliant: number;
  mockInterviewReady: number;
  placedOrOffered: number;
}
