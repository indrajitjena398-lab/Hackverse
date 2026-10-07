export type ProvenanceLevel = 'verified' | 'aggregated' | 'inferred';

export interface ProvenanceMetadata {
  level: ProvenanceLevel;
  source: string;
  sourceUrl?: string;
  confidenceScore?: number; // 0 to 100
  sampleSize?: number;
  lastVerifiedAt: string;
  auditHash?: string;
  verifierName?: string;
  inferenceModel?: string;
  inferenceReasoning?: string;
}

export interface ProvenancedEntity {
  provenance: ProvenanceMetadata;
}
