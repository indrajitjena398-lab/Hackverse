import test from 'node:test';
import assert from 'node:assert/strict';

import { neuralJobMatchingEngine, DEFAULT_NEURAL_CONFIG } from '../src/lib/engine/NeuralJobMatchingEngine.ts';
import { calculateDynamicMatch } from '../src/lib/engine/JobMatchingEngine.ts';
import type { JobPosting } from '../src/lib/types/jobs.ts';

test('Neural Job Matching Engine (PyTorch 1541-dim Fusion Head)', async (t) => {
  await t.test('Loads configuration and default hyper-parameters', () => {
    const config = neuralJobMatchingEngine.getConfig();
    assert.equal(config.embeddingDimension, 384);
    assert.equal(config.interactionDimension, 1541);
    assert.equal(config.safeThreshold, 75.0);
    assert.equal(config.stretchThreshold, 50.0);
    assert.equal(config.reachThreshold, 30.0);
  });

  await t.test('Health check returns valid architecture and calibration telemetry', async () => {
    const health = await neuralJobMatchingEngine.checkHealth();
    assert.equal(health.embeddingDimension, 384);
    assert.ok(health.calibrationMetrics.brierScore < 0.05, 'Brier score must be low');
    assert.ok(health.calibrationMetrics.ece < 0.10, 'Expected Calibration Error must be low');
    assert.equal(health.weightsSizeBytes, 1652053);
  });

  await t.test('Executes neural inference with 5 structured feature scalars and Platt calibration', async () => {
    const result = await neuralJobMatchingEngine.match({
      candidate: {
        candidate_id: 'cand-indrajit-01',
        name: 'Indrajit Jena',
        skills: ['c', 'c++', 'system design', 'postgresql', 'fastapi'],
        years_of_experience: 3.0,
        target_roles: ['Distributed Systems Engineer'],
      },
      job: {
        job_id: 'job-google-01',
        title: 'Software Development Engineer II (Distributed Systems)',
        company: 'Google',
        required_skills: ['c++', 'distributed consensus', 'system design', 'postgresql'],
        experience_required: 3.0,
      },
    });

    assert.ok(result.match_score >= 0 && result.match_score <= 100, 'Score must be in [0, 100]');
    assert.ok(['SAFE FIT', 'STRETCH FIT', 'REACH FIT', 'POOR FIT'].includes(result.fit_class));
    assert.ok(result.calibrated_probability >= 0 && result.calibrated_probability <= 1.0);
    assert.ok(result.breakdown.cosineSimilarity > 0, 'Cosine similarity must be positive');
    assert.ok(result.breakdown.skillScore > 0, 'Skill score must be positive');
    assert.ok(result.explanation.length > 10, 'Must produce grounded narrative');
  });

  await t.test('JobMatchingEngine seamlessly augments job match with neuralMatch', () => {
    const job: JobPosting = {
      id: 'job-qualcomm-01',
      title: 'Embedded Firmware Engineer',
      company: 'Qualcomm',
      location: 'Hyderabad',
      isRemote: false,
      employmentType: 'Full-time',
      salaryRange: { min: 2000000, max: 2800000, currency: 'INR' },
      requiredSkillIds: ['c', 'c++', 'freertos', 'arm cortex'],
      preferredSkillIds: ['device drivers'],
      experienceLevel: 'Mid',
      descriptionSnippet: 'Embedded RTOS role',
      postingSource: 'Direct ATS',
      postedAt: '2026-10-01',
      provenance: {
        level: 'verified',
        source: 'Qualcomm HR',
        confidenceScore: 95,
        lastVerifiedAt: '2026-10-01',
        auditHash: '0xqcomm',
      },
    };

    const matchRes = calculateDynamicMatch(
      {
        candidateId: 'cand-01',
        name: 'Indrajit Jena',
        skills: ['c', 'c++', 'esp32', 'arm cortex'],
        proficientSkillIds: ['c', 'c++'],
        targetSeniority: 'Mid',
        targetLocations: ['Hyderabad'],
        cgpa: 8.85,
        hasWorkAuth: true,
      },
      job
    );

    assert.ok(matchRes.neuralMatch !== undefined, 'neuralMatch must be populated on JobMatchResult');
    assert.ok(matchRes.neuralMatch?.match_score! > 0, 'Neural score must be positive');
    assert.ok(matchRes.overallMatchScore > 0, 'Overall match score must be positive');
  });

  await t.test('Submits and persists downstream interaction feedback', () => {
    const feedback = neuralJobMatchingEngine.submitFeedback({
      candidate_id: 'cand-indrajit-01',
      job_id: 'job-google-01',
      interaction_type: 'applied',
      calibratedScore: 84.5,
      fitClass: 'SAFE FIT',
      notes: 'Applied via campus placement drive',
    });

    assert.ok(feedback.id.startsWith('fb-'));
    assert.equal(feedback.interaction_type, 'applied');

    const allLogs = neuralJobMatchingEngine.getFeedbackLogs();
    assert.ok(allLogs.some((l) => l.id === feedback.id));
  });
});
