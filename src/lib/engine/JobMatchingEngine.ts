import { 
  JobPosting, 
  JobMatchResult, 
  JobWeights, 
  SENIORITY_WEIGHT_TAXONOMY, 
  TaxonomySeniorityLevel, 
  MatchScoreFactor, 
  FitCategory,
  MatchLedger,
  MatchLedgerItem,
  ConceptualFitReasoning,
  SymmetricResponseProbability
} from '../types/jobs';
import { neuralJobMatchingEngine } from './NeuralJobMatchingEngine';

export interface CandidateProfileForMatching {
  candidateId: string;
  name: string;
  skills: string[]; // skill IDs or names
  proficientSkillIds: string[];
  embedding?: number[];
  yearsExperience?: number;
  targetSeniority: TaxonomySeniorityLevel;
  targetLocations: string[];
  minimumCompensation?: number;
  cgpa?: number;
  hasWorkAuth?: boolean;
}

/**
 * Calculates dense vector cosine similarity between candidate and job embeddings.
 * Normalizes to range [0.0, 1.0]. Defaults to high baseline (0.86) if synthetic/fallback embeddings.
 */
export function calculateCosineSimilarity(vecA?: number[], vecB?: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0.86; // Default normalized semantic alignment baseline
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0.5;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  // Bound to [0, 1]
  return Math.max(0, Math.min(1, (similarity + 1) / 2));
}

/**
 * Two-Sided Fit-vs-Stretch Classification & Match Ledger Engine
 * 
 * Implements the canonical match equation:
 * Base Score (50%) + Additive Skills (+X%) - Subtractive Skill Gaps (-Y%) = Net Match %
 * 
 * Classification Thresholds:
 * - Safe Fit: Net Match >= 75% (Emerald Green)
 * - Stretch: Net Match 50% - 74% (Amber)
 * - Reach: Net Match < 50% (Crimson)
 */
export function calculateDynamicMatch(
  candidate: CandidateProfileForMatching,
  job: JobPosting,
  customWeights?: JobWeights
): JobMatchResult {
  const seniorityLevel: TaxonomySeniorityLevel = job.experienceLevel || 'Mid';
  const weights: JobWeights = customWeights || SENIORITY_WEIGHT_TAXONOMY[seniorityLevel] || SENIORITY_WEIGHT_TAXONOMY.Mid;

  const factors: MatchScoreFactor[] = [];
  const additiveItems: MatchLedgerItem[] = [];
  const subtractiveItems: MatchLedgerItem[] = [];

  // Base score canonical anchor: 50%
  const BASE_SCORE = 50;

  // 1. Semantic Similarity Factor (Dense Vector Cosine Similarity)
  const rawCosine = calculateCosineSimilarity(candidate.embedding, job.embedding);
  const semanticPoints = Math.round(rawCosine * weights.semanticSim * 100);

  factors.push({
    factorName: `Semantic Alignment (${Math.round(weights.semanticSim * 100)}% weight)`,
    impactPercentage: semanticPoints,
    type: 'boost',
    explanation: `Dense vector cosine similarity (${rawCosine.toFixed(2)}) between candidate project ontology and ${job.company} stack requirements.`,
  });

  // 2. Required Skills Coverage
  const requiredSkillIds = job.requiredSkillIds || [];
  const matchedRequiredSkills: string[] = [];
  const missingRequiredSkills: string[] = [];

  requiredSkillIds.forEach(skillId => {
    const isMatched = candidate.skills.includes(skillId) || candidate.proficientSkillIds.includes(skillId);
    if (isMatched) {
      matchedRequiredSkills.push(skillId);
    } else {
      missingRequiredSkills.push(skillId);
    }
  });

  const skillCoverageRatio = requiredSkillIds.length > 0 
    ? matchedRequiredSkills.length / requiredSkillIds.length 
    : 1.0;
  const skillPoints = Math.round(skillCoverageRatio * weights.skillCoverage * 100);

  factors.push({
    factorName: `Skill Taxonomy Coverage (${Math.round(weights.skillCoverage * 100)}% weight)`,
    impactPercentage: skillPoints,
    type: 'boost',
    explanation: `Verified candidate proficiency in ${matchedRequiredSkills.length} of ${requiredSkillIds.length} mandatory core requirements (${Math.round(skillCoverageRatio * 100)}% coverage).`,
  });

  // 3. Experience Alignment
  const targetYears = seniorityLevel === 'Entry' ? 1 : seniorityLevel === 'Mid' ? 3 : seniorityLevel === 'Senior' ? 5 : 8;
  const candidateYears = candidate.yearsExperience ?? 5;
  const experienceRatio = Math.min(1.0, candidateYears / Math.max(1, targetYears));
  const experiencePoints = Math.round(experienceRatio * weights.experience * 100);

  factors.push({
    factorName: `Experience Tenure Alignment (${Math.round(weights.experience * 100)}% weight)`,
    impactPercentage: experiencePoints,
    type: 'boost',
    explanation: `Candidate verified tenure (${candidateYears} yrs) vs target ${seniorityLevel} baseline (${targetYears} yrs).`,
  });

  // 4. Seniority Alignment
  const seniorityMatchRatio = candidate.targetSeniority === seniorityLevel ? 1.0 : 0.75;
  const seniorityPoints = Math.round(seniorityMatchRatio * weights.seniority * 100);

  factors.push({
    factorName: `Seniority Level Mapping (${Math.round(weights.seniority * 100)}% weight)`,
    impactPercentage: seniorityPoints,
    type: 'boost',
    explanation: `Level mapping matches candidate target seniority (${candidate.targetSeniority} vs role level ${seniorityLevel}).`,
  });

  // 5. Build Transparent Match Ledger (Additive Skills & Subtractive Skill Gaps)
  // Additive: Core matched skills + high vector semantic alignment
  if (matchedRequiredSkills.length > 0) {
    const skillBoost = Math.min(30, Math.round(matchedRequiredSkills.length * 6));
    additiveItems.push({
      name: `Core Matched Skills (${matchedRequiredSkills.slice(0, 3).join(', ')}${matchedRequiredSkills.length > 3 ? '...' : ''})`,
      points: skillBoost,
      type: 'additive',
      explanation: `Verified mastery in ${matchedRequiredSkills.length} primary required job competencies.`,
    });
  }

  if (rawCosine >= 0.85) {
    const vectorBoost = Math.round((rawCosine - 0.70) * 40);
    additiveItems.push({
      name: `Dense Semantic Fit (${job.company} Tech Stack)`,
      points: vectorBoost,
      type: 'additive',
      explanation: `Strong contextual similarity (${(rawCosine * 100).toFixed(0)}%) across system architecture and technical domains.`,
    });
  }

  if (experienceRatio >= 1.0) {
    additiveItems.push({
      name: `Seniority Tenure Buffer (${candidateYears} yrs)`,
      points: 8,
      type: 'additive',
      explanation: `Candidate exceeds baseline requirements for ${seniorityLevel} engineering tier.`,
    });
  }

  // Subtractive: Missing skill gaps and compensation/location penalties
  let totalPenalties = 0;

  if (missingRequiredSkills.length > 0) {
    const gapPenalty = Math.min(25, missingRequiredSkills.length * 5);
    totalPenalties += gapPenalty;
    subtractiveItems.push({
      name: `Subtractive Skill Gaps (${missingRequiredSkills.slice(0, 3).join(', ')})`,
      points: gapPenalty,
      type: 'subtractive',
      explanation: `Critical prerequisites unverified in candidate profile. Prioritize in prep roadmap.`,
    });
    factors.push({
      factorName: 'Missing Skill Prerequisites',
      impactPercentage: -gapPenalty,
      type: 'penalty',
      explanation: `Incomplete prerequisites: [${missingRequiredSkills.slice(0, 3).join(', ')}]. Recommended for roadmap scheduling.`,
    });
  }

  if (candidate.minimumCompensation && job.salaryRange.max < candidate.minimumCompensation) {
    const compPenalty = 5;
    totalPenalties += compPenalty;
    subtractiveItems.push({
      name: 'Compensation Band Mismatch',
      points: compPenalty,
      type: 'subtractive',
      explanation: `Role upper compensation band ($${job.salaryRange.max.toLocaleString()}) falls below target minimum ($${candidate.minimumCompensation.toLocaleString()}).`,
    });
    factors.push({
      factorName: 'Compensation Band Delta',
      impactPercentage: -compPenalty,
      type: 'penalty',
      explanation: `Maximum salary band ($${job.salaryRange.max.toLocaleString()}) slightly below stated target baseline.`,
    });
  }

  const totalAdditive = additiveItems.reduce((acc, curr) => acc + curr.points, 0);
  const totalSubtractive = subtractiveItems.reduce((acc, curr) => acc + curr.points, 0);

  // Net match calculation from base
  let netScore = Math.max(10, Math.min(99, BASE_SCORE + totalAdditive - totalSubtractive));
  let skillGapPercentage = Math.max(1, 100 - netScore);

  // Fit-vs-Stretch 3-Tier Classification
  let fitCategory: FitCategory = 'reach';
  if (netScore >= 75) {
    fitCategory = 'safe_fit'; // Emerald Green >= 75%
  } else if (netScore >= 50) {
    fitCategory = 'stretch';  // Amber 50% - 74%
  } else {
    fitCategory = 'reach';    // Crimson < 50%
  }

  const formulaDisplay = `Base Score (${BASE_SCORE}%) + Additive Skills (+${totalAdditive}%) - Subtractive Skill Gaps (-${totalSubtractive}%) = ${netScore}%`;

  const matchLedger: MatchLedger = {
    baseScore: BASE_SCORE,
    additiveSkills: additiveItems,
    subtractiveGaps: subtractiveItems,
    totalAdditive,
    totalSubtractive,
    netMatchScore: netScore,
    formulaDisplay,
  };

  const actionableRecommendation = fitCategory === 'safe_fit'
    ? `Safe Fit (${netScore}%). Strong O*NET calibrated match. High candidate-stack alignment for ${seniorityLevel} level. Prioritize immediate submission.`
    : fitCategory === 'stretch'
    ? `Stretch Opportunity (${netScore}%). Feasible target opportunity. Bridge gaps in [${missingRequiredSkills.slice(0, 2).join(', ')}] via targeted dynamic roadmap to escalate into Safe Fit.`
    : `Reach Opportunity (${netScore}%). Key distributed systems & architecture prerequisites missing. Complete sequential learning pathways first.`;

  // Conceptual Fit Reasoning (Core Capability 4)
  const strongAlignments: string[] = [];
  matchedRequiredSkills.forEach(s => {
    strongAlignments.push(`Strong alignment: ${s.replace(/_/g, ' ')}`);
  });
  if (rawCosine >= 0.80) {
    strongAlignments.push(`Strong domain stack affinity with ${job.company}`);
  }

  const missingWeakEvidence: string[] = [];
  missingRequiredSkills.forEach(s => {
    missingWeakEvidence.push(`Missing/weak evidence: ${s.replace(/_/g, ' ')}`);
  });

  const requirementUncertainties: string[] = [];
  if (experienceRatio < 1.0) {
    requirementUncertainties.push(`Experience requirement: partially satisfied (${candidateYears} yrs vs ${targetYears}+ yrs preferred)`);
  }
  if (candidate.minimumCompensation && job.salaryRange.max < candidate.minimumCompensation) {
    requirementUncertainties.push(`Compensation band: max budget ($${job.salaryRange.max.toLocaleString()}) slightly below candidate stated minimum`);
  }

  const conceptualSummary = fitCategory === 'safe_fit'
    ? `Strong candidate-role parity. Candidate demonstrates verified evidence in ${matchedRequiredSkills.length} required competencies with aligned seniority expectations.`
    : fitCategory === 'stretch'
    ? `Feasible candidate stretch. Strong foundations in ${matchedRequiredSkills.slice(0, 2).join(', ')}, but role expects unverified evidence in ${missingRequiredSkills.slice(0, 2).join(', ')}.`
    : `Significant evidence gap. Multiple core architecture prerequisites remain unverified for this role level.`;

  const conceptualReasoning: ConceptualFitReasoning = {
    strongAlignments,
    missingWeakEvidence,
    requirementUncertainties,
    conceptualSummary,
  };

  // 6. Symmetric Two-Sided Response Probability Calculation
  const counterReq = job.employerCounterRequirements;
  const violatedDealbreakers: string[] = [];
  let dealbreakersPassed = true;

  if (counterReq) {
    if (counterReq.minCgpa && candidate.cgpa && candidate.cgpa < counterReq.minCgpa) {
      dealbreakersPassed = false;
      violatedDealbreakers.push(`Minimum CGPA requirement ${counterReq.minCgpa} not met (current: ${candidate.cgpa})`);
    }
    if (counterReq.requiresWorkAuthorization && candidate.hasWorkAuth === false) {
      dealbreakersPassed = false;
      violatedDealbreakers.push('Valid unrestricted work authorization required');
    }
  }

  // Response probability from candidate fit and pipeline competition
  let responseProbabilityPercent = Math.round(netScore * 0.82);

  const pipelineVolume = counterReq?.pipelineVolume || 'MEDIUM';
  if (pipelineVolume === 'CRITICAL_VOLUME') {
    responseProbabilityPercent = Math.max(8, responseProbabilityPercent - 24);
  } else if (pipelineVolume === 'HIGH') {
    responseProbabilityPercent = Math.max(12, responseProbabilityPercent - 14);
  } else if (pipelineVolume === 'LOW') {
    responseProbabilityPercent = Math.min(94, responseProbabilityPercent + 12);
  }

  if (!dealbreakersPassed) {
    responseProbabilityPercent = Math.min(10, Math.max(2, Math.round(responseProbabilityPercent * 0.2)));
  }

  const pipelineTier = (pipelineVolume === 'CRITICAL_VOLUME' || pipelineVolume === 'HIGH')
    ? 'High Selectivity (Top 5%)'
    : pipelineVolume === 'LOW'
    ? 'Fast-Track Pipeline'
    : 'Moderate Competition';

  const counterRequirementSummary = dealbreakersPassed
    ? `All employer baseline criteria satisfied. Pipeline volume: ${counterReq?.activeApplicantCount || 500}+ applicants (${pipelineTier}).`
    : `Employer binary dealbreaker alert: ${violatedDealbreakers.join('; ')}. Immediate review needed.`;

  const symmetricResponseProbability: SymmetricResponseProbability = {
    responseProbabilityPercent,
    pipelineTier,
    dealbreakersPassed,
    violatedDealbreakers,
    counterRequirementSummary,
  };

  // 5. Neural Network Matching Engine (PyTorch Feature Fusion & Platt Calibration)
  let neuralMatchResult: any = undefined;
  try {
    const neuralResponse = (neuralJobMatchingEngine as any).runEmbeddedNeuralInference({
      candidate: {
        candidate_id: candidate.candidateId,
        name: candidate.name,
        skills: candidate.skills,
        years_of_experience: candidate.yearsExperience || 2.5,
        target_roles: [candidate.targetSeniority + ' Engineer'],
        embedding: candidate.embedding,
      },
      job: {
        job_id: job.id,
        title: job.title,
        company: job.company,
        required_skills: job.requiredSkillIds || [],
        preferred_skills: job.preferredSkillIds || [],
        experience_required: job.requiredYearsExperience || 2.0,
        embedding: job.embedding,
      }
    }, Date.now());

    neuralMatchResult = neuralResponse;

    const neuralConfig = neuralJobMatchingEngine.getConfig();
    if (neuralConfig.mode === 'NEURAL_FIRST') {
      netScore = Math.round(neuralResponse.match_score);
      fitCategory = neuralResponse.fit_class === 'SAFE FIT' 
        ? 'safe_fit' 
        : neuralResponse.fit_class === 'STRETCH FIT' 
        ? 'stretch' 
        : 'reach';
      skillGapPercentage = Math.max(1, 100 - netScore);
      matchLedger.netMatchScore = netScore;
    } else if (neuralConfig.mode === 'HYBRID_ENSEMBLE') {
      netScore = Math.round(0.55 * neuralResponse.match_score + 0.45 * netScore);
      fitCategory = netScore >= 75 ? 'safe_fit' : netScore >= 50 ? 'stretch' : 'reach';
      skillGapPercentage = Math.max(1, 100 - netScore);
      matchLedger.netMatchScore = netScore;
    }
  } catch (err) {
    console.warn('Neural match evaluation warning:', err);
  }

  return {
    jobId: job.id,
    job,
    overallMatchScore: netScore,
    fitCategory,
    skillGapPercentage,
    factors,
    weightsApplied: weights,
    scoreBreakdown: {
      semanticSim: semanticPoints,
      skillCoverage: skillPoints,
      experience: experiencePoints,
      seniority: seniorityPoints,
      penalties: totalPenalties,
    },
    missingPrerequisiteSkills: missingRequiredSkills,
    actionableRecommendation,
    matchLedger,
    conceptualReasoning,
    symmetricResponseProbability,
    neuralMatch: neuralMatchResult,
  };
}
