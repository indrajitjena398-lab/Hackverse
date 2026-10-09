/**
 * Neural Job-Candidate Matching Engine: Core Types & Interfaces
 * 
 * Maps directly to the PyTorch Bi-Encoder + Deep Feature Fusion Head architecture:
 * x = [u, v, |u - v|, u * v, cos(u, v), s_skill, s_exp, s_role, p_missing]
 * Layers: 1541 -> 256 -> 64 -> 1 with Platt Logistic Calibration.
 */

export type NeuralFitClass = 'SAFE FIT' | 'STRETCH FIT' | 'REACH FIT' | 'POOR FIT';

export type NeuralOperatingMode = 'NEURAL_FIRST' | 'HYBRID_ENSEMBLE' | 'DETERMINISTIC_LEDGER';

export interface NeuralCandidatePayload {
  candidate_id: string;
  name?: string;
  summary?: string;
  skills: string[];
  experience?: {
    role: string;
    years: number;
    description?: string;
  }[];
  education?: { degree: string; field: string; gpa?: string }[];
  projects?: { name: string; description: string }[];
  job_titles?: string[];
  years_of_experience: number;
  target_roles: string[];
  embedding?: number[];
}

export interface NeuralJobPayload {
  job_id: string;
  title: string;
  company: string;
  summary?: string;
  responsibilities?: string[];
  required_skills: string[];
  preferred_skills?: string[];
  experience_required: number;
  industry?: string;
  embedding?: number[];
}

export interface NeuralMatchRequest {
  candidate: NeuralCandidatePayload;
  job: NeuralJobPayload;
}

export interface NeuralFeatureBreakdown {
  cosineSimilarity: number;
  skillScore: number;
  experienceScore: number;
  roleSimilarity: number;
  missingSkillsPenalty: number;
  strongAlignment: string[];
  partialAlignment: string[];
  skillGaps: string[];
  experienceAssessment: string;
  narrative: string;
}

export interface NeuralMatchResponse {
  candidate_id: string;
  job_id: string;
  match_score: number; // 0.0 - 100.0
  fit_class: NeuralFitClass;
  confidence: number; // 0.00 - 1.00
  calibrated_probability: number;
  raw_probability: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_alignment: string;
  experience_score: number;
  role_alignment: string;
  role_score: number;
  explanation: string;
  disclaimer: string;
  breakdown: NeuralFeatureBreakdown;
  source: 'FASTAPI_MICROSERVICE' | 'EMBEDDED_NEURAL_ENGINE';
  latencyMs: number;
  evaluatedAt: string;
}

export interface NeuralEngineConfig {
  mode: NeuralOperatingMode;
  microserviceUrl: string;
  safeThreshold: number; // default 75.0
  stretchThreshold: number; // default 50.0
  reachThreshold: number; // default 30.0
  embeddingDimension: number; // 384
  interactionDimension: number; // 1541
  calibrationMethod: 'platt' | 'isotonic';
  modelWeightsPath: string; // models/final/neural_matching_head.pt
  enableTelemetryLogging: boolean;
}

export interface NeuralEngineStatus {
  isServiceOnline: boolean;
  activeMode: NeuralOperatingMode;
  microserviceUrl: string;
  serviceVersion: string;
  modelName: string;
  checkpointStatus: 'LOADED' | 'INITIALIZED_WEIGHTS' | 'STANDALONE_EMULATED';
  embeddingModel: string;
  embeddingDimension: number;
  weightsSizeBytes: number;
  totalIndexedJobs: number;
  totalIndexedCandidates: number;
  lastPingMs: number;
  calibrationMetrics: {
    brierScore: number;
    ece: number; // Expected Calibration Error
    mae: number;
  };
}

export interface NeuralInteractionFeedback {
  id: string;
  candidate_id: string;
  job_id: string;
  interaction_type: 'viewed' | 'saved' | 'applied' | 'interview' | 'offer' | 'rejection';
  rating?: number;
  notes?: string;
  timestamp: string;
  calibratedScore: number;
  fitClass: NeuralFitClass;
}
