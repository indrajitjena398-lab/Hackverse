export interface ModelEvaluationRun {
  id: string;
  modelName: string;
  taskType: 'resume_ast_extraction' | 'job_semantic_scoring' | 'interview_cat_posterior' | 'eweis_risk_prediction' | 'agent_policy_verification';
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
  groundTruthAgreementRate: number; // 0.00 to 1.00
  hallucinationRate: number;        // 0.00 to 1.00 (e.g. 0.02)
  citationAccuracy: number;         // 0.00 to 1.00 (e.g. 0.98)
  humanRatingScore: number;         // 1 to 5
  timestamp: string;
  status: 'passed' | 'warning' | 'failed';
}

export interface PlatformEvaluationDashboard {
  resumeExtractionAccuracy: number;      // e.g. 96.4%
  jobMatchingPrecision: number;           // e.g. 91.2%
  interviewEvaluationAgreement: number;  // e.g. 88.7%
  skillInferenceAccuracy: number;        // e.g. 94.1%
  eweisPrecision: number;                // e.g. 92.5%
  eweisRecall: number;                   // e.g. 89.0%
  recommendationAcceptanceRate: number;  // e.g. 78.4%
  averageInferenceLatencyMs: number;     // e.g. 385ms
  dailyComputeCostUsd: number;           // e.g. $14.20
  recentEvaluationRuns: ModelEvaluationRun[];
}
