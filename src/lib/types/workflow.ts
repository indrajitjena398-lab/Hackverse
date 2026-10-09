/**
 * Candidate Intelligence Workflow Engine — Domain Types & State Machine Models
 * Architectural Specification for Closed-Loop Candidate Intelligence
 * 
 * Implements Phase 2: Domain and Workflow Design
 */

import { ProvenanceMetadata } from './provenance';

// -----------------------------------------------------------------------------
// 1. WORKFLOW STAGES & STATE MACHINE
// -----------------------------------------------------------------------------

export type WorkflowStageId = 
  | 'CANDIDATE_STATE'
  | 'DISCOVER_OPPORTUNITIES'
  | 'EVALUATE_FIT'
  | 'IDENTIFY_GAPS'
  | 'PREPARE_SPECIFICALLY'
  | 'APPLY_AND_INTERVIEW'
  | 'OBSERVE_PERFORMANCE'
  | 'LEARN_FROM_OUTCOME'
  | 'UPDATE_CANDIDATE_STATE'
  | 'NEXT_DECISION';

export type StageExecutionStatus = 
  | 'available'       // Prerequisites met; ready to be engaged
  | 'in_progress'     // Currently active in user workflow
  | 'completed'       // Successfully executed with verifiable output
  | 'blocked'         // Blocked due to missing information or unfulfilled requirement
  | 'skipped'         // Intentionally bypassed by candidate
  | 'invalidated';    // Previously completed but rendered stale by newer observations

export interface StageStatusRecord {
  stageId: WorkflowStageId;
  status: StageExecutionStatus;
  statusReason?: string;
  blockedDetails?: {
    missingInputs: string[];
    suggestedRemediation: string;
  };
  startedAt?: string;
  completedAt?: string;
  lastEvaluatedAt: string;
  isTerminalForPath: boolean;
}

// -----------------------------------------------------------------------------
// 2. CANDIDATE STATE DOMAIN MODEL
// -----------------------------------------------------------------------------

export type EvidenceVerificationLevel = 
  | 'UNVERIFIED_SELF_REPORT'
  | 'PORTFOLIO_CODE_VERIFIED'
  | 'MOCK_INTERVIEW_VERIFIED'
  | 'STANDARDIZED_ASSESSMENT'
  | 'INSTITUTIONAL_ACADEMIC'
  | 'EMPLOYER_VERIFIED';

export interface CandidateCapability {
  id: string;
  name: string;
  category: 'technical' | 'domain' | 'practical' | 'communication' | 'system_design';
  selfReportedLevel: number;        // 1 (Novice) to 5 (Staff/Principal)
  demonstratedProficiency?: number; // Verified through tests/mock interviews
  confidenceScore: number;          // 0.00 to 1.00 (evidence quality weighted)
  verificationLevel: EvidenceVerificationLevel;
  lastDemonstratedAt?: string;
  evidenceReferenceIds: string[];
}

export interface CandidateEvidenceItem {
  id: string;
  title: string;
  type: 'project' | 'internship' | 'work_experience' | 'certification' | 'assessment' | 'technical_demo';
  summary: string;
  technologies: string[];
  metrics: string[];
  sourceReferenceUrl?: string;
  verificationLevel: EvidenceVerificationLevel;
  recordedAt: string;
  provenance: ProvenanceMetadata;
}

export interface CandidateGoals {
  targetRoles: string[];
  primaryTargetRole: string;
  preferredIndustries: string[];
  careerObjectives: string;
  geographicPreferences: string[];
  remotePreference: 'remote_only' | 'hybrid' | 'onsite' | 'flexible';
  minimumCompensation?: number;
  learningPriorities: string[];
}

export interface CandidatePerformanceRecord {
  id: string;
  opportunityId?: string;
  activityType: 'mock_interview' | 'technical_screen' | 'system_design_challenge' | 'live_interview';
  evaluatedAt: string;
  strengthsObserved: string[];
  weaknessesObserved: string[];
  technicalCorrectnessScore?: number; // 0 to 100
  communicationClarityScore?: number;  // 0 to 100
  rawNotesOrTranscriptSnippet?: string;
}

export interface StateChangeProvenance {
  id: string;
  fieldPath: string;
  previousValue: any;
  newValue: any;
  sourceOfChange: string;
  timestamp: string;
  reasoning: string;
  requiresCandidateApproval: boolean;
  isCandidateApproved: boolean;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface UnifiedCandidateState {
  candidateId: string;
  identity: {
    fullName: string;
    email: string;
    phone?: string;
    institution?: string;
    degree?: string;
    graduationYear?: string;
    currentStage: 'student' | 'new_grad' | 'early_career' | 'experienced';
  };
  capabilities: Record<string, CandidateCapability>;
  evidenceVault: CandidateEvidenceItem[];
  goals: CandidateGoals;
  performanceHistory: CandidatePerformanceRecord[];
  activeOpportunities: string[]; // Opportunity IDs
  auditLedger: StateChangeProvenance[];
  version: number;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// 3. OPPORTUNITY MODEL (Role Requirements vs. Company Context)
// -----------------------------------------------------------------------------

export interface OpportunitySkillRequirement {
  skillName: string;
  importance: 'MANDATORY' | 'PREFERRED' | 'NICE_TO_HAVE';
  expectedProficiency: number; // 1 to 5
  rationale?: string;
}

export interface OpportunityQualification {
  description: string;
  isMandatory: boolean;
  isVerifiedInCandidate: boolean;
  verificationSource?: string;
}

export interface CompanyAndRoleContext {
  companyName: string;
  industry: string;
  productDomain: string;
  teamMission?: string;
  interviewStages: string[];
  hiringManagerContext?: string;
  verifiedFactSource?: string;
  unknownAspects: string[]; // Explicitly listed unknown dimensions to prevent AI hallucinations
}

export interface StructuredOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  employmentType: string;
  applicationDeadline?: string;
  sourceUrl?: string;
  discoveredAt: string;
  status: 'active' | 'applied' | 'interviewing' | 'closed' | 'archived';
  
  // A. Role Requirements
  requirements: {
    skills: OpportunitySkillRequirement[];
    qualifications: OpportunityQualification[];
    minimumYearsExperience?: number;
    hardConstraints: string[]; // e.g. "Must hold valid work authorization"
  };

  // B. Company & Role Context
  context: CompanyAndRoleContext;
  extractionConfidence: number; // 0.00 to 1.00
}

// -----------------------------------------------------------------------------
// 4. CANDIDATE-TO-OPPORTUNITY FIT ANALYSIS ENGINE
// -----------------------------------------------------------------------------

export type FitAssessmentStatus = 
  | 'STRONG_MATCH'
  | 'PARTIAL_MATCH'
  | 'MISSING_CAPABILITY'
  | 'UNVERIFIED_QUALIFICATION'
  | 'DISQUALIFYING_CONSTRAINT'
  | 'UNCERTAIN_DATA';

export interface RequirementFitItem {
  requirementText: string;
  isMandatory: boolean;
  status: FitAssessmentStatus;
  candidateEvidenceFound: string[];
  explanation: string;
  confidence: number; // 0.00 to 1.00
}

export interface FitAnalysisResult {
  opportunityId: string;
  evaluatedAt: string;
  overallFitScore?: number; // 0 to 100 (only when sufficient evidence exists)
  isDefensibleScoreCalculated: boolean;
  scoringLimitations: string[];
  requirementBreakdown: RequirementFitItem[];
  strongMatchesCount: number;
  partialMatchesCount: number;
  missingCapabilitiesCount: number;
  disqualifyingConstraintsCount: number;
  uncertainItemsCount: number;
  recommendedNextAction: 'PREPARE_SPECIFICALLY' | 'APPLY_DIRECTLY' | 'HOLD_FOR_SKILL_BUILD' | 'DISMISS_OPPORTUNITY';
  actionReasoning: string;
}

// -----------------------------------------------------------------------------
// 5. GAP ANALYSIS & ACTIONABLE PRIORITIES
// -----------------------------------------------------------------------------

export type GapCategoryType = 
  | 'GENUINE_CAPABILITY_GAP'
  | 'EVIDENCE_GAP'
  | 'OUTDATED_CLAIM'
  | 'MISSING_QUALIFICATION'
  | 'PREFERENCE_MISMATCH'
  | 'UNKNOWN_REQUIREMENT';

export interface ActionableGapItem {
  id: string;
  opportunityId: string;
  requirementName: string;
  category: GapCategoryType;
  severity: 'CRITICAL' | 'IMPORTANT' | 'LOW';
  currentEvidenceSummary: string;
  suggestedAction: string;
  expectedDeliverableOrProof: string;
  estimatedEffortHours?: number;
  verificationMethod: 'PROJECT_SUBMISSION' | 'MOCK_INTERVIEW_DRILL' | 'DOCUMENT_UPLOAD' | 'SELF_ATTESTATION';
  isResolved: boolean;
  resolvedAt?: string;
}

// -----------------------------------------------------------------------------
// 6. OPPORTUNITY-SPECIFIC PREPARATION
// -----------------------------------------------------------------------------

export interface SpecificPrepTask {
  id: string;
  opportunityId: string;
  targetedGapId?: string;
  title: string;
  moduleType: 
    | 'RESUME_TAILORING'
    | 'PORTFOLIO_SELECTION'
    | 'TECHNICAL_REVISION'
    | 'BEHAVIORAL_STAR_PRACTICE'
    | 'COMPANY_RESEARCH'
    | 'CAT_MOCK_INTERVIEW';
  rationale: string;
  actionItems: string[];
  proofDeliverable: string;
  isCompleted: boolean;
  completedAt?: string;
  requiresCandidateReview: boolean;
  candidateApprovedContent?: string;
}

// -----------------------------------------------------------------------------
// 7. APPLICATION & INTERVIEW LIFECYCLE TRACKING
// -----------------------------------------------------------------------------

export type ApplicationLifecycleStage = 
  | 'NOT_APPLIED'
  | 'PREPARING'
  | 'READY_FOR_REVIEW'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEWING'
  | 'ASSESSMENT'
  | 'OFFER_RECEIVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CLOSED'
  | 'OUTCOME_UNKNOWN';

export interface ApplicationLifecycleEvent {
  id: string;
  opportunityId: string;
  eventType: 
    | 'SUBMISSION'
    | 'RECRUITER_CONTACT'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEW_COMPLETED'
    | 'ASSESSMENT_COMPLETED'
    | 'FEEDBACK_RECEIVED'
    | 'OFFER_EXTENDED'
    | 'REJECTION_RECORDED'
    | 'WITHDRAWAL';
  occurredAt: string;
  isExternallyVerified: boolean; // True if ATS webhook/email invite, false if student-recorded
  notes?: string;
}

// -----------------------------------------------------------------------------
// 8. PERFORMANCE OBSERVATION & REVIEWABLE LEARNING LOOP
// -----------------------------------------------------------------------------

export interface PerformanceObservation {
  id: string;
  opportunityId: string;
  observedAt: string;
  
  // Categorized Information Dimensions
  observedFacts: {
    event: string;
    explicitAssessmentScores?: Record<string, number>;
    documentedFeedbackQuotes?: string[];
  };
  
  candidateReflections: {
    difficultiesFaced: string[];
    confidenceAssessment: string;
    perceivedPreparationEfficacy: 'HIGH' | 'MODERATE' | 'LOW';
    studentNotes?: string;
  };
  
  systemHypotheses: {
    hypothesisStatement: string;
    basis: string;
    confidence: number; // 0.00 to 1.00
  }[];
}

export interface ProposedStateUpdate {
  id: string;
  observationId: string;
  targetField: string;
  currentValue: any;
  proposedValue: any;
  changeType: 'CONFIDENCE_CALIBRATION' | 'EVIDENCE_LINKING' | 'GAP_PRIORITY_ADJUSTMENT' | 'SKILL_LEVEL_ELEVATION';
  rationale: string;
  evidenceConfidence: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  rejectionReason?: string;
}

// -----------------------------------------------------------------------------
// 9. WORKFLOW ORCHESTRATION CONTAINER
// -----------------------------------------------------------------------------

export interface CandidateWorkflowSession {
  sessionId: string;
  candidateEmail: string;
  activeOpportunityId?: string;
  stages: Record<WorkflowStageId, StageStatusRecord>;
  activeStageId: WorkflowStageId;
  fitAnalysis?: FitAnalysisResult;
  gaps: ActionableGapItem[];
  prepTasks: SpecificPrepTask[];
  lifecycleStage: ApplicationLifecycleStage;
  events: ApplicationLifecycleEvent[];
  observations: PerformanceObservation[];
  pendingStateUpdates: ProposedStateUpdate[];
  createdAt: string;
  updatedAt: string;
}
