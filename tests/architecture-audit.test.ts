import test from 'node:test';
import assert from 'node:assert/strict';

// Test that core architectural modules load and conform to canonical contracts
import { SENIORITY_WEIGHT_TAXONOMY, type JobPosting } from '../src/lib/types/jobs.ts';
import { calculateDynamicMatch, type CandidateProfileForMatching } from '../src/lib/engine/JobMatchingEngine.ts';
import { GapIntelligenceEngine } from '../src/lib/engine/GapIntelligenceEngine.ts';
import type { CanonicalCandidateState } from '../src/lib/types/candidate.ts';

test('Phase 0 Architecture Audit: Fit & Gap Engine Canonical Integration', async (t) => {
  await t.test('SENIORITY_WEIGHT_TAXONOMY defines valid relative weights', () => {
    assert.equal(typeof SENIORITY_WEIGHT_TAXONOMY.Entry, 'object');
    assert.equal(SENIORITY_WEIGHT_TAXONOMY.Entry.skillCoverage, 0.50);
    assert.equal(SENIORITY_WEIGHT_TAXONOMY.Mid.skillCoverage, 0.40);
  });

  await t.test('JobMatchingEngine calculates explainable match ledger and symmetric response', () => {
    const candidate: CandidateProfileForMatching = {
      candidateId: 'cand-test-01',
      name: 'Test Student',
      skills: ['c++', 'system_design', 'postgresql'],
      proficientSkillIds: ['c++', 'system_design'],
      targetSeniority: 'Mid',
      targetLocations: ['Bangalore', 'Remote'],
      cgpa: 8.5,
      hasWorkAuth: true
    };

    const job: JobPosting = {
      id: 'job-test-01',
      title: 'Systems Software Engineer',
      company: 'TestCorp',
      location: 'Bangalore',
      isRemote: true,
      employmentType: 'Full-time',
      salaryRange: { min: 2000000, max: 3000000, currency: 'INR' },
      requiredSkillIds: ['c++', 'system_design', 'raft_consensus'],
      preferredSkillIds: ['postgresql'],
      experienceLevel: 'Mid',
      descriptionSnippet: 'Systems engineer role',
      postingSource: 'Direct ATS',
      postedAt: '2026-10-01',
      employerCounterRequirements: {
        minCgpa: 8.0,
        pipelineVolume: 'MEDIUM'
      },
      provenance: {
        level: 'verified',
        source: 'Recruiter ATS Direct Posting',
        confidenceScore: 98,
        lastVerifiedAt: '2026-10-01',
        auditHash: '0xtest123'
      }
    };

    const matchResult = calculateDynamicMatch(candidate, job);
    assert.ok(matchResult.overallMatchScore > 0, 'Match score must be positive');
    assert.ok(matchResult.missingPrerequisiteSkills.includes('raft_consensus'), 'Identifies missing prerequisite');
    assert.ok(matchResult.symmetricResponseProbability?.dealbreakersPassed, 'Dealbreakers passed');
  });

  await t.test('GapIntelligenceEngine categorizes unmet requirements and skill gaps', () => {
    const state: CanonicalCandidateState = {
      candidate_id: 'cand-test-01',
      name: 'Test Student',
      email: 'student@pmec.ac.in',
      target_roles: ['Systems Software Engineer'],
      active_target_role: 'Systems Software Engineer',
      skills: {
        system_design: {
          id: 'system_design',
          name: 'System Design',
          category: 'Architecture',
          level: 3,
          levelLabel: 'proficient',
          confidence: 0.85,
          evidence: ['github'],
          evidenceItems: [],
          provenance: {
            level: 'verified',
            source: 'GitHub',
            confidenceScore: 90,
            lastVerifiedAt: '2026-10-01',
            auditHash: '0xhash'
          },
          lastUpdated: '2026-10-01'
        }
      },
      experience: [],
      projects: [],
      education: [{
        id: 'edu-01',
        institution: 'Parala Maharaja Engineering College (PMEC)',
        degree: 'B.Tech',
        field: 'Computer Science',
        graduationYear: 2026,
        gpa: '8.5'
      }],
      certifications: [],
      preferences: {
        targetLocations: ['Bangalore'],
        remotePreference: 'flexible',
        minimumCompensation: 2000000,
        targetCurrency: 'INR',
        targetSeniority: 'Mid',
        targetIndustries: ['Technology']
      },
      applications: [],
      interview_history: [],
      learning_history: [],
      readiness: {
        overall: 0.75,
        technical: 0.80,
        system_design: 0.85,
        coding: 0.70,
        communication: 0.70,
        behavioral: 0.75,
        resume: 0.80,
        interview: 0.70,
        job_fit: 0.75,
        roleWeights: {},
        targetRoleProfile: 'Systems Software Engineer',
        provenance: {
          level: 'SYSTEM_DERIVED',
          source: 'Test',
          confidenceScore: 90,
          lastVerifiedAt: '2026-10-01',
          auditHash: '0xhash'
        }
      },
      tenant_id: 'pmec',
      last_mutated_at: '2026-10-01',
      version: 1
    };

    const gaps = GapIntelligenceEngine.analyzeGaps(state);
    assert.ok(Array.isArray(gaps), 'Gaps must be an array');
    assert.ok(gaps.length > 0, 'Should detect gaps for missing required skills');
  });
});
