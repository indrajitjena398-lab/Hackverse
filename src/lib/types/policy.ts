import { ProvenanceMetadata } from './provenance';

export type PolicyImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PolicyDecision = 'APPROVED' | 'REQUIRES_HITL' | 'BLOCKED_BY_GUARDRAIL' | 'REJECTED';

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  impactLevel: PolicyImpactLevel;
  actionOnTrigger: PolicyDecision;
  enabled: boolean;
}

export interface ProposedMutation {
  id: string;
  targetEntity: 'candidate_profile' | 'skill_level' | 'resume_bullet' | 'application_status' | 'eweis_risk' | 'system_config';
  targetEntityId: string;
  sourceModule: string;
  sourceProvenance: ProvenanceMetadata;
  proposedChanges: Record<string, any>;
  impactLevel: PolicyImpactLevel;
  requiresHumanReview: boolean;
  proposedByAgent?: string;
  timestamp: string;
}

export interface PolicyEvaluationResult {
  mutationId: string;
  decision: PolicyDecision;
  triggeredRules: PolicyRule[];
  reasoning: string;
  requiresHitlTask: boolean;
  hitlTaskId?: string;
  evaluatedAt: string;
  enforcedBy: string;
}

export interface HitlTask {
  id: string;
  title: string;
  description: string;
  entityType: string;
  entityId: string;
  proposedData: any;
  currentData: any;
  agentName: string;
  confidenceScore: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  auditHash: string;
}
