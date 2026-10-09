import { ModelEvaluationRun, PlatformEvaluationDashboard } from '../types/evaluation';

export class AiEvaluationCenterService {
  private recentRuns: ModelEvaluationRun[] = [
    {
      id: 'eval-run-901',
      modelName: 'Gemini-1.5-Pro / GPT-4o Hybrid',
      taskType: 'resume_ast_extraction',
      promptVersion: 'v2.4.1-ast-strict',
      inputTokens: 1420,
      outputTokens: 680,
      latencyMs: 340,
      costUsd: 0.0038,
      groundTruthAgreementRate: 0.96,
      hallucinationRate: 0.01,
      citationAccuracy: 0.99,
      humanRatingScore: 4.8,
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      status: 'passed',
    },
    {
      id: 'eval-run-902',
      modelName: 'AURA-Embedding-Dense-v2',
      taskType: 'job_semantic_scoring',
      promptVersion: 'v3.1.0-cosine-dag',
      inputTokens: 950,
      outputTokens: 180,
      latencyMs: 185,
      costUsd: 0.0009,
      groundTruthAgreementRate: 0.93,
      hallucinationRate: 0.0,
      citationAccuracy: 1.0,
      humanRatingScore: 4.6,
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      status: 'passed',
    },
    {
      id: 'eval-run-903',
      modelName: 'Claude-3.5-Sonnet Adaptive CAT',
      taskType: 'interview_cat_posterior',
      promptVersion: 'v1.9.0-bayesian-info-gain',
      inputTokens: 2100,
      outputTokens: 840,
      latencyMs: 520,
      costUsd: 0.0072,
      groundTruthAgreementRate: 0.91,
      hallucinationRate: 0.02,
      citationAccuracy: 0.97,
      humanRatingScore: 4.7,
      timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
      status: 'passed',
    },
    {
      id: 'eval-run-904',
      modelName: 'EWEIS-XGBoost-Ensemble-v4',
      taskType: 'eweis_risk_prediction',
      promptVersion: 'v4.0.0-institutional-trajectory',
      inputTokens: 420,
      outputTokens: 85,
      latencyMs: 92,
      costUsd: 0.0003,
      groundTruthAgreementRate: 0.92,
      hallucinationRate: 0.0,
      citationAccuracy: 0.99,
      humanRatingScore: 4.9,
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: 'passed',
    },
  ];

  public getDashboard(): PlatformEvaluationDashboard {
    return {
      resumeExtractionAccuracy: 96.4,
      jobMatchingPrecision: 91.2,
      interviewEvaluationAgreement: 88.7,
      skillInferenceAccuracy: 94.1,
      eweisPrecision: 92.5,
      eweisRecall: 89.0,
      recommendationAcceptanceRate: 78.4,
      averageInferenceLatencyMs: 284,
      dailyComputeCostUsd: 12.45,
      recentEvaluationRuns: [...this.recentRuns],
    };
  }
}

export const aiEvaluationCenter = new AiEvaluationCenterService();
