export type ProvenanceLevel =
  | 'VERIFIED_EMPLOYER'
  | 'VERIFIED_CANDIDATE'
  | 'VERIFIED_INSTITUTION'
  | 'PUBLIC_SOURCE'
  | 'COMMUNITY_AGGREGATED'
  | 'MODEL_INFERRED'
  | 'USER_ASSERTED'
  | 'SYSTEM_DERIVED'
  // Backward compatibility aliases
  | 'verified'
  | 'aggregated'
  | 'inferred'
  | 'community_aggregated';

export interface ProvenanceMetadata {
  level: ProvenanceLevel;
  source: string;
  sourceUrl?: string;
  sourceId?: string;
  confidenceScore?: number; // 0 to 100 or 0.0 to 1.0 normalized
  sampleSize?: number;
  lastVerifiedAt: string;
  auditHash?: string; // SHA-256 or cryptographic audit fingerprint
  verifierName?: string;
  inferenceModel?: string;
  promptVersion?: string;
  inferenceReasoning?: string;
  humanOverride?: boolean;
  reviewedBy?: string;
  evidenceChain?: string[];
}

export interface ProvenancedEntity {
  provenance: ProvenanceMetadata;
}

export interface ProvenanceClaim {
  id: string;
  entityType: 'skill' | 'readiness' | 'job_match' | 'interview_assessment' | 'resume_bullet' | 'eweis_risk' | 'recommendation';
  claimTitle: string;
  claimValue: string | number;
  subjectId: string;
  provenance: ProvenanceMetadata;
  createdAt: string;
}
