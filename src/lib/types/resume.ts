import { ProvenanceMetadata } from './provenance';

export type HitlStatus = 'pending' | 'accepted' | 'rejected' | 'modified';
export type HitlRiskTier = 'low_risk_ats' | 'strategic_overhaul';

export interface ResumeASTSection {
  id: string;
  name: string;
  isStandardHeader: boolean;
  rawText: string;
  parsedItems: string[];
}

export interface ATSComplianceIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'tables_or_columns' | 'fonts' | 'section_headers' | 'graphics' | 'keyword_density';
  title: string;
  description: string;
  impactOnParsers: string;
  fixRecommendation: string;
}

export interface ATSAnalysisResult {
  overallScore: number; // 0-100
  parsabilityScore: number;
  keywordMatchScore: number;
  formatComplianceScore: number;
  detectedSections: ResumeASTSection[];
  complianceIssues: ATSComplianceIssue[];
  provenance: ProvenanceMetadata;
}

export interface HitlBulletProposal {
  id: string;
  experienceId: string;
  originalBullet: string;
  suggestedBullet: string;
  quantifiedImpactAdded: string;
  actionVerbEnhanced: string;
  targetedSkillId: string;
  targetedSkillName: string;
  alignmentReasoning: string;
  status: HitlStatus;
  riskTier: HitlRiskTier;
  userModifiedText?: string;
  confirmedAt?: string;
  provenance: ProvenanceMetadata;
}

export interface CandidateResume {
  id: string;
  title: string;
  lastParsedAt: string;
  rawText: string;
  atsAnalysis: ATSAnalysisResult;
  bulletProposals: HitlBulletProposal[];
  unilateralEditGuardrailEnforced: boolean; // Must be true!
}
