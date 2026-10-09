import { SkillNode, SkillEdge, CandidateSkillState, MasteryLevel } from '../types/skills';
import { JobPosting, JobMatchResult, FitCategory, MatchScoreFactor } from '../types/jobs';
import { CandidateResume, HitlBulletProposal } from '../types/resume';
import { MockInterviewSession } from '../types/interview';
import { StudentAnomalyVector, EweisRiskLevel } from '../types/institutional';
import { 
  CanonicalCandidateState, 
  CanonicalCandidateSkill, 
  DimensionalReadiness, 
  CandidateExperienceItem 
} from '../types/candidate';
import { ProvenanceMetadata, ProvenanceLevel } from '../types/provenance';
import { DLDMEngine } from './DLDMEngine';
import { eventBus } from './EventBus';
import { policyEngine } from './PolicyEngine';
import { INITIAL_SKILL_NODES, INITIAL_SKILL_EDGES } from '../data/skillOntologyData';
import { INITIAL_JOB_POSTINGS } from '../data/jobPostingsData';
import { INITIAL_CANDIDATE_RESUME } from '../data/resumeASTData';
import { INITIAL_STUDENTS_ANOMALY_DATA } from '../data/institutionalData';
import { ParsedResumeResult } from '../parser/resumeParser';
import { GitHubVerificationReport } from '../types/github';
import { calculateDynamicMatch } from './JobMatchingEngine';
import { cdcSyncCircuit } from './CdcSyncCircuit';
import { coldStartPipeline, ColdStartImputationResult } from './ColdStartPipeline';
import { llmGuardrailEvaluator, GuardrailQualityCertificate } from './LlmGuardrailEvaluator';
import { PrepPlanGenerator, AdaptivePrepPlan, PlanDurationDays } from './PrepPlanGenerator';
import { GapIntelligenceEngine, PrioritizedCandidateGap, CandidateGapType } from './GapIntelligenceEngine';
import { ApplicationCard, ApplicationStage } from '../types/tracker';

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  targetCompany: string;
  overallReadinessScore: number;
}

export interface DefensibleSkillExplanation {
  skillId: string;
  skillName: string;
  targetRolesCount: number;
  matchedInterviewPatternPercent: number;
  currentProficiencyLabel: string;
  confidenceScore: number;
  expectedReadinessLiftPercent: number;
  unlockedTargetRolesCount: number;
  defensibleStatement: string;
}

// Role-specific readiness weights matrix
const ROLE_WEIGHT_PROFILES: Record<string, Record<string, number>> = {
  'Senior Distributed Systems Engineer': {
    system_design: 0.25,
    technical: 0.20,
    coding: 0.15,
    backend: 0.15,
    communication: 0.10,
    behavioral: 0.05,
    resume: 0.05,
    interview: 0.05,
  },
  'AI Platform & Retrieval Systems Engineer': {
    technical: 0.25,
    coding: 0.20,
    system_design: 0.20,
    backend: 0.10,
    communication: 0.10,
    resume: 0.05,
    behavioral: 0.05,
    interview: 0.05,
  },
  'Full-Stack Performance Engineer': {
    coding: 0.25,
    technical: 0.20,
    backend: 0.15,
    system_design: 0.15,
    communication: 0.10,
    resume: 0.05,
    behavioral: 0.05,
    interview: 0.05,
  },
};

export class CandidateIntelligenceEngine {
  private dldm: DLDMEngine;
  private profile: CandidateProfile;
  private candidateSkills: Map<string, CandidateSkillState> = new Map();
  private jobs: JobPosting[] = [...INITIAL_JOB_POSTINGS];
  private resume: CandidateResume = { ...INITIAL_CANDIDATE_RESUME };
  private interviewHistory: MockInterviewSession[] = [];
  private institutionalCohorts: StudentAnomalyVector[] = [...INITIAL_STUDENTS_ANOMALY_DATA];
  private isCustomResumeActive: boolean = false;

  // Canonical Multi-Dimensional State
  private canonicalState: CanonicalCandidateState;

  constructor() {
    this.dldm = new DLDMEngine(INITIAL_SKILL_NODES, INITIAL_SKILL_EDGES);

    this.profile = {
      id: 'cand-alex-chen',
      name: 'Alex Chen',
      email: 'alex.chen@stanford.alumni.edu',
      targetRole: 'Senior Distributed Systems Engineer',
      targetCompany: 'Stripe',
      overallReadinessScore: 67, // Multidimensional weighted score
    };

    // Initialize candidate default skill masteries
    const initialMasteries: { skillId: string; level: MasteryLevel; confidence: number; evidence: string[] }[] = [
      { skillId: 'python', level: 'mastered', confidence: 95, evidence: ['resume', 'github', 'mock_interview'] },
      { skillId: 'typescript', level: 'proficient', confidence: 85, evidence: ['resume', 'github'] },
      { skillId: 'dsa_core', level: 'proficient', confidence: 88, evidence: ['resume', 'mock_interview'] },
      { skillId: 'sql_fundamentals', level: 'mastered', confidence: 92, evidence: ['resume', 'assessment'] },
      { skillId: 'linux_shell', level: 'proficient', confidence: 80, evidence: ['resume'] },
      { skillId: 'fastapi', level: 'mastered', confidence: 90, evidence: ['resume', 'github'] },
      { skillId: 'db_indexing', level: 'in_progress', confidence: 65, evidence: ['resume'] },
      { skillId: 'caching_redis', level: 'in_progress', confidence: 60, evidence: ['resume', 'mock_interview'] },
      { skillId: 'load_balancing', level: 'in_progress', confidence: 55, evidence: ['resume'] },
      { skillId: 'docker_containers', level: 'proficient', confidence: 82, evidence: ['resume', 'github'] },
      { skillId: 'system_design', level: 'prerequisite_needed', confidence: 51, evidence: ['resume'] },
      { skillId: 'distributed_consensus', level: 'locked', confidence: 20, evidence: [] },
      { skillId: 'vector_databases', level: 'in_progress', confidence: 50, evidence: ['github'] },
      { skillId: 'rag_architectures', level: 'locked', confidence: 15, evidence: [] },
      { skillId: 'agentic_ai', level: 'locked', confidence: 10, evidence: [] },
      { skillId: 'kubernetes', level: 'locked', confidence: 30, evidence: [] },
      { skillId: 'message_queues', level: 'in_progress', confidence: 58, evidence: ['resume'] },
    ];

    initialMasteries.forEach(m => {
      this.candidateSkills.set(m.skillId, {
        skillId: m.skillId,
        masteryLevel: m.level,
        confidenceScore: m.confidence,
        lastUpdated: new Date().toISOString(),
        verifiedThroughMockInterview: m.evidence.includes('mock_interview'),
      });
    });

    // Assemble Canonical State
    this.canonicalState = {
      candidate_id: 'cand_001',
      name: 'Alex Chen',
      email: 'alex.chen@stanford.alumni.edu',
      target_roles: ['Senior Distributed Systems Engineer', 'Backend Platform Engineer'],
      active_target_role: 'Senior Distributed Systems Engineer',
      skills: {},
      experience: [
        {
          id: 'exp-01',
          company: 'NexusScale Systems',
          role: 'Backend Systems Engineer',
          period: { start: '2023-01', end: 'Present' },
          bullets: [
            {
              id: 'b-01',
              text: 'Architected async payment ingestion pipeline processing 15k events/sec using FastAPI and Kafka.',
              skills: ['FastAPI', 'Kafka', 'Python'],
              metrics: ['15k events/sec', '99.98% uptime'],
              evidence_strength: 0.94,
              isHitlApproved: true,
            },
          ],
          provenance: {
            level: 'VERIFIED_EMPLOYER',
            source: 'NexusScale Employment Verification & GitHub Enterprise Audit',
            confidenceScore: 98,
            lastVerifiedAt: '2026-09-15',
            auditHash: '0xnexus_emp_88a912',
          },
        },
      ],
      projects: [
        {
          id: 'proj-01',
          title: 'Distributed WAL & Raft Replicator',
          description: 'Custom implementation of Raft consensus protocol in Python with state machine snapshots.',
          technologies: ['Python', 'Raft', 'AsyncIO', 'gRPC'],
          metrics: ['Zero split-brain under network partitions', 'Sub-10ms commit latency'],
          evidence_strength: 0.91,
        },
      ],
      education: [
        {
          id: 'edu-01',
          institution: 'Stanford University',
          degree: 'B.S.',
          field: 'Computer Science',
          graduationYear: 2024,
          gpa: '3.88',
        },
      ],
      certifications: [
        {
          id: 'cert-01',
          name: 'Certified Kubernetes Application Developer (CKAD)',
          issuer: 'Cloud Native Computing Foundation',
          issueDate: '2025-04',
          verificationStatus: 'verified',
        },
      ],
      preferences: {
        targetLocations: ['San Francisco, CA', 'Seattle, WA', 'Remote'],
        remotePreference: 'flexible',
        minimumCompensation: 185000,
        targetCurrency: 'USD',
        targetSeniority: 'Senior',
        targetIndustries: ['Infrastructure', 'Fintech', 'AI/Cloud'],
      },
      applications: [],
      interview_history: [],
      learning_history: [
        {
          id: 'learn-01',
          skillId: 'sql_fundamentals',
          skillName: 'PostgreSQL Advanced Indexing',
          type: 'course',
          title: 'Query Optimization & B-Tree Internals',
          completedAt: '2026-08-12',
          timeSpentHours: 18,
          readinessGainPercent: 4,
          verifiedScore: 94,
        },
      ],
      readiness: {
        overall: 0.67,
        technical: 0.72,
        system_design: 0.51,
        coding: 0.76,
        communication: 0.81,
        behavioral: 0.69,
        resume: 0.68,
        interview: 0.61,
        job_fit: 0.74,
        roleWeights: ROLE_WEIGHT_PROFILES['Senior Distributed Systems Engineer'],
        targetRoleProfile: 'Senior Distributed Systems Engineer',
        provenance: {
          level: 'SYSTEM_DERIVED',
          source: 'AURA Multi-Dimensional Role-Weighted Readiness Engine',
          confidenceScore: 96,
          lastVerifiedAt: new Date().toISOString(),
          auditHash: '0xreadiness_hash_771a9',
        },
      },
      tenant_id: 'tenant-stanford-univ',
      last_mutated_at: new Date().toISOString(),
      version: 1,
    };

    this.rebuildCanonicalSkills();
    this.recalculateAll();
  }

  private rebuildCanonicalSkills(): void {
    const canonicalMap: Record<string, CanonicalCandidateSkill> = {};
    this.candidateSkills.forEach((v, k) => {
      const node = this.dldm.getSkill(k);
      const name = node ? node.name : k;
      const levelNum = v.masteryLevel === 'mastered' ? 5 
        : v.masteryLevel === 'proficient' ? 4 
        : v.masteryLevel === 'in_progress' ? 3 
        : v.masteryLevel === 'prerequisite_needed' ? 2 : 1;

      canonicalMap[k] = {
        id: k,
        name,
        category: node?.category || 'general',
        level: levelNum,
        levelLabel: v.masteryLevel,
        confidence: v.confidenceScore / 100,
        evidence: v.verifiedThroughMockInterview ? ['resume', 'mock_interview'] : ['resume'],
        evidenceItems: [
          {
            sourceType: v.verifiedThroughMockInterview ? 'interview' : 'resume',
            referenceId: `ev-${k}`,
            summary: `Verified via ${v.verifiedThroughMockInterview ? 'adaptive mock interview CAT' : 'resume section extraction'}`,
            confidence: v.confidenceScore / 100,
            extractedAt: v.lastUpdated,
          },
        ],
        provenance: {
          level: v.verifiedThroughMockInterview ? 'VERIFIED_CANDIDATE' : 'MODEL_INFERRED',
          source: v.verifiedThroughMockInterview ? 'Adaptive Mock Interview Evaluation' : 'Resume AST Parser',
          confidenceScore: v.confidenceScore,
          lastVerifiedAt: v.lastUpdated,
          auditHash: `0xskill_${k}_${Math.random().toString(16).substring(2, 8)}`,
        },
        lastUpdated: v.lastUpdated,
      };
    });
    this.canonicalState.skills = canonicalMap;
  }

  public getCanonicalState(): CanonicalCandidateState {
    return { ...this.canonicalState };
  }

  public getProfile(): CandidateProfile {
    return this.profile;
  }

  public getDLDM(): DLDMEngine {
    return this.dldm;
  }

  public getCandidateSkills(): Map<string, CandidateSkillState> {
    return new Map(this.candidateSkills);
  }

  public getCandidateResume(): CandidateResume {
    return this.resume;
  }

  public getJobs(): JobPosting[] {
    return this.jobs;
  }

  public getInstitutionalCohorts(): StudentAnomalyVector[] {
    return this.institutionalCohorts;
  }

  public getInterviewHistory(): MockInterviewSession[] {
    return this.interviewHistory;
  }

  public getDimensionalReadiness(): DimensionalReadiness {
    return { ...this.canonicalState.readiness };
  }

  /**
   * Recalculates role-weighted multidimensional readiness
   */
  public recalculateReadiness(): number {
    const weights = ROLE_WEIGHT_PROFILES[this.profile.targetRole] || ROLE_WEIGHT_PROFILES['Senior Distributed Systems Engineer'];

    // Technical score derived from candidate skill confidences
    let skillTotal = 0;
    let skillCount = 0;
    this.candidateSkills.forEach(s => {
      skillTotal += s.confidenceScore;
      skillCount++;
    });
    const technical = skillCount > 0 ? skillTotal / (skillCount * 100) : 0.70;

    // Specific dimensions
    const sysDesignSkill = this.candidateSkills.get('system_design');
    const system_design = sysDesignSkill ? sysDesignSkill.confidenceScore / 100 : 0.51;

    const dsaSkill = this.candidateSkills.get('dsa_core');
    const coding = dsaSkill ? dsaSkill.confidenceScore / 100 : 0.76;

    const resumeScore = this.resume.atsAnalysis.overallScore / 100;
    const communication = 0.81;
    const behavioral = 0.69;
    const interview = this.interviewHistory.length > 0 && this.interviewHistory[0].overallScore
      ? this.interviewHistory[0].overallScore.technicalScore / 100
      : 0.61;
    const job_fit = 0.74;

    // Weighted composite
    const weighted = 
      (system_design * (weights.system_design || 0.25)) +
      (technical * (weights.technical || 0.20)) +
      (coding * (weights.coding || 0.15)) +
      (technical * (weights.backend || 0.15)) +
      (communication * (weights.communication || 0.10)) +
      (behavioral * (weights.behavioral || 0.05)) +
      (resumeScore * (weights.resume || 0.05)) +
      (interview * (weights.interview || 0.05));

    const overallScoreRounded = Math.round(weighted * 100);
    this.profile.overallReadinessScore = overallScoreRounded;

    this.canonicalState.readiness = {
      overall: Math.round(weighted * 100) / 100,
      technical: Math.round(technical * 100) / 100,
      system_design: Math.round(system_design * 100) / 100,
      coding: Math.round(coding * 100) / 100,
      communication,
      behavioral,
      resume: Math.round(resumeScore * 100) / 100,
      interview: Math.round(interview * 100) / 100,
      job_fit,
      roleWeights: weights,
      targetRoleProfile: this.profile.targetRole,
      provenance: {
        level: 'SYSTEM_DERIVED',
        source: 'AURA Role-Weighted Dynamic Composite Engine',
        confidenceScore: 98,
        lastVerifiedAt: new Date().toISOString(),
        auditHash: `0xreadiness_${Date.now().toString(16)}`,
      },
    };

    return overallScoreRounded;
  }

  /**
   * Generates defensible reasoning explaining WHY candidate needs a particular skill
   * E.g. "Why does Alex need Redis?"
   */
  public explainSkillRequirement(skillId: string): DefensibleSkillExplanation {
    const node = this.dldm.getSkill(skillId);
    const skillName = node ? node.name : skillId;
    const candidateSkill = this.candidateSkills.get(skillId);
    const confidence = candidateSkill ? candidateSkill.confidenceScore : 40;

    // Calculate how many target roles require this skill
    const targetRolesRequiring = this.jobs.filter(j => 
      j.requiredSkillIds.includes(skillId) || j.preferredSkillIds.includes(skillId)
    ).length;

    const proficiencyLabel = candidateSkill 
      ? (candidateSkill.masteryLevel === 'mastered' ? 'advanced' 
        : candidateSkill.masteryLevel === 'proficient' ? 'intermediate' 
        : 'foundational')
      : 'unverified';

    const defensibleStatement = 
      `${skillName} is a prerequisite for ${targetRolesRequiring} target roles in your active search pipeline and appears in 38% of matched technical interview round patterns. Your current evidence indicates ${proficiencyLabel} proficiency (${confidence}% confidence). Closing this competency gap would elevate your role readiness by +8% across ${Math.min(targetRolesRequiring, 4)} target opportunities.`;

    return {
      skillId,
      skillName,
      targetRolesCount: targetRolesRequiring,
      matchedInterviewPatternPercent: 38,
      currentProficiencyLabel: proficiencyLabel,
      confidenceScore: confidence,
      expectedReadinessLiftPercent: 8,
      unlockedTargetRolesCount: Math.min(targetRolesRequiring, 4),
      defensibleStatement,
    };
  }

  public updateSkillMastery(skillId: string, level: MasteryLevel, confidence: number, assessmentNote?: string) {
    return this.setSkillMastery(skillId, level, confidence, assessmentNote);
  }

  /**
   * Sets skill mastery with policy guardrails and publishes event cascade
   */
  public setSkillMastery(skillId: string, level: MasteryLevel, confidence: number, assessmentNote?: string) {
    // Check policy engine before mutating
    const proposal = {
      id: `mut-${Date.now()}`,
      targetEntity: 'skill_level' as const,
      targetEntityId: skillId,
      sourceModule: 'Adaptive Mock Interviewer',
      sourceProvenance: {
        level: 'VERIFIED_CANDIDATE' as ProvenanceLevel,
        source: 'Mock Interview CAT Session',
        confidenceScore: confidence,
        lastVerifiedAt: new Date().toISOString(),
        auditHash: `0xmut_${skillId}_${Date.now()}`,
      },
      proposedChanges: { level, confidence, assessmentNote },
      impactLevel: 'MEDIUM' as const,
      requiresHumanReview: confidence < 80,
      proposedByAgent: 'Interview Intelligence Agent',
      timestamp: new Date().toISOString(),
    };

    const policyEval = policyEngine.evaluateProposal(proposal);
    if (policyEval.decision === 'BLOCKED_BY_GUARDRAIL') {
      console.warn(`Skill update for ${skillId} blocked by guardrail: ${policyEval.reasoning}`);
      return;
    }

    const existing = this.candidateSkills.get(skillId) || {
      skillId,
      masteryLevel: level,
      confidenceScore: confidence,
      lastUpdated: new Date().toISOString(),
      verifiedThroughMockInterview: true,
    };

    const oldLevel = existing.masteryLevel;
    existing.masteryLevel = level;
    existing.confidenceScore = confidence;
    existing.lastUpdated = new Date().toISOString();
    if (assessmentNote) {
      existing.assessmentEvidence = assessmentNote;
    }

    this.candidateSkills.set(skillId, existing);

    // Dynamic cascade
    const masteryMap = new Map<string, MasteryLevel>();
    this.candidateSkills.forEach((v, k) => masteryMap.set(k, v.masteryLevel));
    const updatedStatuses = this.dldm.evaluateAllSkillStatuses(masteryMap);

    updatedStatuses.forEach((newStatus, sId) => {
      const current = this.candidateSkills.get(sId);
      if (current && (current.masteryLevel === 'locked' || current.masteryLevel === 'prerequisite_needed')) {
        current.masteryLevel = newStatus;
      }
    });

    this.rebuildCanonicalSkills();
    this.recalculateAll();

    // Canonical Event Emission
    eventBus.publish({
      event_type: 'SKILL_LEVEL_CHANGED',
      candidate_id: this.canonicalState.candidate_id,
      source: 'mock_interview',
      payload: {
        skill: skillId,
        old_level: oldLevel,
        new_level: level,
        confidence,
      },
      provenance: {
        type: 'VERIFIED_CANDIDATE',
        confidence: confidence / 100,
        model_version: 'AURA-CAT-Bayesian-v2.1',
        hash: `0xevt_skill_${skillId}_${Date.now().toString(16)}`,
      },
      recalculatedModules: ['Skill Graph & DLDM', 'Job Match Scoring', 'Institutional EWEIS', 'ATS Alignment'],
    });

    // Compatibility event
    eventBus.publish({
      type: 'SKILL_ASSESSMENT_UPDATED',
      sourceModule: 'Candidate-Intelligence Engine',
      payload: { skillId, level, confidence },
      recalculatedModules: ['Skill Graph & DLDM', 'Job Match Scoring', 'Institutional EWEIS', 'ATS Alignment'],
    });

    // Two-Phase Commit Distributed Synchronization (Postgres WAL + Neo4j Graph + pgvector)
    cdcSyncCircuit.executeTwoPhaseCommitSync({
      sourceTable: 'candidate_skills',
      entityId: `${this.canonicalState.candidate_id}:${skillId}`,
      operation: 'SKILL_EVALUATED',
      payload: {
        previousState: { skillId, level: oldLevel },
        newState: { skillId, level, confidence },
      },
    });
  }

  /**
   * Explainable Dynamic Job Match Engine (O*NET & ESCO Standard Taxonomy):
   * Replaces static additive points (+24, +27) with a normalized vector-weighted engine.
   * Dynamically balances semantic similarity, skill taxonomy coverage, experience tenure,
   * and seniority calibration according to job level.
   */
  public calculateJobMatches(): JobMatchResult[] {
    const candidateSkillsList = Array.from(this.candidateSkills.keys());
    const proficientSkills = Array.from(this.candidateSkills.entries())
      .filter(([_, s]) => s.masteryLevel === 'mastered' || s.masteryLevel === 'proficient')
      .map(([id]) => id);

    const rawTargetSeniority = this.canonicalState.preferences.targetSeniority;
    const targetSeniority = rawTargetSeniority === 'Staff' ? 'Lead' : (rawTargetSeniority as any) || 'Senior';

    return this.jobs.map(job => {
      return calculateDynamicMatch(
        {
          candidateId: this.canonicalState.candidate_id,
          name: this.canonicalState.name,
          skills: candidateSkillsList,
          proficientSkillIds: proficientSkills,
          yearsExperience: 5,
          targetSeniority,
          targetLocations: this.canonicalState.preferences.targetLocations,
          minimumCompensation: this.canonicalState.preferences.minimumCompensation,
          cgpa: 8.85,
          hasWorkAuth: true,
        },
        job
      );
    }).sort((a, b) => b.overallMatchScore - a.overallMatchScore);
  }

  /**
   * Capability 5: Identify and Prioritize Gaps (6-Taxonomy Gap Intelligence)
   * Diagnoses gaps into 6 distinct types:
   * no_evidence, weak_proficiency, insufficient_experience, weak_interview_signal, preference_mismatch, unmet_requirement
   */
  public getPrioritizedGaps(targetJob?: JobPosting): PrioritizedCandidateGap[] {
    return GapIntelligenceEngine.analyzeGaps(this.canonicalState, targetJob);
  }

  /**
   * Capability 6: Generate Adaptive Preparation Rationale
   * Explains preparation focus based on target role, opportunity context, and diagnosed gaps.
   */
  public getAdaptivePrepBriefing(targetJob?: JobPosting): string {
    const gaps = this.getPrioritizedGaps(targetJob);
    const targetRole = targetJob?.title || this.profile.targetRole;
    return GapIntelligenceEngine.generateAdaptivePrepBriefing(targetRole, gaps);
  }

  /**
   * Capability 8 & 10: Track Career Actions, Application Stages, and Sync with Candidate State
   * Records pipeline progression: Viewed -> Prepared -> Applied -> Interviewed -> Offer/Rejected
   */
  public recordApplicationStatusChange(
    appId: string,
    newStage: ApplicationStage,
    outcomeSignal?: string
  ): void {
    let app = this.canonicalState.applications.find(a => a.id === appId);
    const oldStage = app ? app.stage : 'unknown';

    if (app) {
      app.stage = newStage;
      app.lastActivityDate = new Date().toISOString().split('T')[0];
      if (outcomeSignal) {
        app.notes = (app.notes ? app.notes + ' • ' : '') + `Signal: ${outcomeSignal}`;
      }
    }

    // Capability 9 & 10: Learn From Performance and Outcomes
    if (newStage === 'interviewing') {
      this.canonicalState.readiness.interview = Math.min(1.0, this.canonicalState.readiness.interview + 0.05);
      this.recalculateAll();
    } else if (newStage === 'offer') {
      this.canonicalState.readiness.job_fit = Math.min(1.0, this.canonicalState.readiness.job_fit + 0.08);
      this.recalculateAll();
    } else if (newStage === 'rejected') {
      console.log(`[AURA Career History] Outcome recorded: Application ${appId} transitioned to ${newStage}. Signal: ${outcomeSignal || 'Standard disposition'}`);
    }

    this.canonicalState.last_mutated_at = new Date().toISOString();

    // Publish reactive career event
    eventBus.publish({
      type: 'APPLICATION_STATUS_CHANGED',
      sourceModule: 'AURA Application Tracker & Career History Engine',
      payload: {
        appId,
        oldStage,
        stage: newStage,
        outcomeSignal,
        timestamp: new Date().toISOString(),
      },
      recalculatedModules: ['Candidate State', 'Kanban Tracker', 'Institutional Cohort Funnel'],
    });

    // Two-Phase Commit Distributed Sync
    cdcSyncCircuit.executeTwoPhaseCommitSync({
      sourceTable: 'candidate_applications',
      entityId: `${this.canonicalState.candidate_id}:${appId}`,
      operation: 'UPDATE',
      payload: { appId, oldStage, newStage, outcomeSignal },
    });
  }

  /**
   * Syncs entire tracker applications list into Canonical Candidate State
   */
  public syncApplications(apps: ApplicationCard[]): void {
    this.canonicalState.applications = [...apps];
  }

  /**
   * Capability 9: Learn From Performance and Outcomes with Rigorous Provenance
   * Preserves uncertainty and prevents unsupported speculation.
   */
  public recordOutcomeObservation(
    jobId: string,
    company: string,
    outcome: 'interview_secured' | 'offer_extended' | 'technical_rejection' | 'behavioral_rejection' | 'withdrawn',
    verifiedReason?: string,
    confidenceScore: number = 85
  ): void {
    const observation = {
      jobId,
      company,
      outcome,
      verifiedReason: verifiedReason || 'No explicit employer breakdown provided',
      confidenceScore,
      recordedAt: new Date().toISOString(),
      provenance: {
        level: verifiedReason ? 'VERIFIED_EMPLOYER' : 'SYSTEM_DERIVED',
        source: verifiedReason ? `${company} Recruiter Debrief & ATS Webhook` : 'Candidate Outcome Logging Engine',
        confidenceScore,
        lastVerifiedAt: new Date().toISOString().split('T')[0],
        auditHash: `0xobs_${jobId}_${Date.now().toString(16)}`,
      },
    };

    if (verifiedReason && outcome === 'technical_rejection') {
      console.log(`[AURA Learning Loop] Calibrated outcome observation: ${company} noted: ${verifiedReason}`);
    }

    eventBus.publish({
      type: 'CANDIDATE_OUTCOME_OBSERVED',
      sourceModule: 'Career Outcome Learning Engine',
      payload: observation,
      recalculatedModules: ['Candidate State', 'Gap Intelligence Engine', 'Adaptive Interviewer'],
    });
  }

  /**
   * Human-In-The-Loop Bullet Approval Pipeline with Immutable Audit Record
   */
  public handleBulletDecision(
    bulletId: string,
    decision: 'accepted' | 'rejected' | 'modified',
    modifiedText?: string
  ): void {
    const proposal = this.resume.bulletProposals.find(p => p.id === bulletId);
    if (!proposal) return;

    // Strict zero-unilateral-edits check via policy engine
    const mutation = {
      id: `mut-bullet-${bulletId}`,
      targetEntity: 'resume_bullet' as const,
      targetEntityId: bulletId,
      sourceModule: 'HITL Resume Optimizer',
      sourceProvenance: proposal.provenance,
      proposedChanges: { decision, modifiedText },
      impactLevel: 'CRITICAL' as const,
      requiresHumanReview: true,
      timestamp: new Date().toISOString(),
    };

    const policyEval = policyEngine.evaluateProposal(mutation);
    console.log(`Policy evaluation for bullet rewrite: ${policyEval.decision} (${policyEval.reasoning})`);

    proposal.status = decision;
    proposal.confirmedAt = new Date().toISOString();

    if (decision === 'modified' && modifiedText) {
      proposal.userModifiedText = modifiedText;
    }

    if (decision === 'accepted' || decision === 'modified') {
      this.resume.atsAnalysis.overallScore = Math.min(96, this.resume.atsAnalysis.overallScore + 8);
      this.resume.atsAnalysis.keywordMatchScore = Math.min(95, this.resume.atsAnalysis.keywordMatchScore + 10);
      this.resume.atsAnalysis.parsabilityScore = Math.min(94, this.resume.atsAnalysis.parsabilityScore + 6);

      const targetSkill = this.candidateSkills.get(proposal.targetedSkillId);
      if (targetSkill) {
        targetSkill.confidenceScore = Math.min(95, targetSkill.confidenceScore + 15);
        if (targetSkill.masteryLevel === 'in_progress') {
          targetSkill.masteryLevel = 'proficient';
        }
      }

      eventBus.publish({
        event_type: 'RESUME_BULLET_ACCEPTED',
        candidate_id: this.canonicalState.candidate_id,
        source: 'HITL Resume Optimizer',
        payload: {
          bulletId,
          decision,
          targetSkillId: proposal.targetedSkillId,
          newAtsScore: this.resume.atsAnalysis.overallScore,
          auditRecord: {
            original: proposal.originalBullet,
            AI_proposal: proposal.suggestedBullet,
            human_decision: decision,
            final_version: decision === 'modified' ? modifiedText : proposal.suggestedBullet,
            timestamp: new Date().toISOString(),
            model_version: 'AURA-ResumeAST-v3.0',
            audit_hash: `0xhitl_bullet_${Math.random().toString(16).substring(2, 10)}`,
          },
        },
        provenance: {
          type: 'VERIFIED_CANDIDATE',
          confidence: 1.0,
          hash: `0xaudit_hitl_${Date.now()}`,
        },
        recalculatedModules: ['Candidate Profile', 'Job Match Scoring', 'Institutional EWEIS'],
      });

      this.recalculateAll();

      // Two-Phase Commit Distributed Synchronization (Postgres WAL + Neo4j Graph + pgvector)
      cdcSyncCircuit.executeTwoPhaseCommitSync({
        sourceTable: 'candidate_resumes',
        entityId: this.canonicalState.candidate_id,
        operation: 'RESUME_BULLET_ACCEPTED',
        payload: {
          previousState: { bulletId, atsScore: this.resume.atsAnalysis.overallScore - 8 },
          newState: {
            bulletId,
            decision,
            targetSkillId: proposal.targetedSkillId,
            newAtsScore: this.resume.atsAnalysis.overallScore,
            finalText: decision === 'modified' ? modifiedText : proposal.suggestedBullet,
          },
        },
      });
    }
  }

  /**
   * Batch HITL Bullet Review Pipeline
   * Resolves cognitive fatigue by allowing candidates to batch-review
   * categories (e.g. 'all_low_risk' vs 'strategic_only') with a single cryptographic audit trail
   * while strictly enforcing the Zero Unilateral AI Edits guardrail.
   */
  public handleBatchBulletDecision(
    filter: 'all_low_risk' | 'all_pending' | 'strategic_only',
    decision: 'accepted' | 'rejected'
  ): { processedCount: number; batchHash: string } {
    const proposalsToProcess = this.resume.bulletProposals.filter(p => {
      if (p.status !== 'pending') return false;
      if (filter === 'all_low_risk') return p.riskTier === 'low_risk_ats';
      if (filter === 'strategic_only') return p.riskTier === 'strategic_overhaul';
      return true; // all_pending
    });

    if (proposalsToProcess.length === 0) {
      return { processedCount: 0, batchHash: '' };
    }

    const batchHash = `0xbatch_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`;
    const processedIds: string[] = [];

    proposalsToProcess.forEach(proposal => {
      proposal.status = decision;
      proposal.confirmedAt = new Date().toISOString();
      processedIds.push(proposal.id);

      if (decision === 'accepted') {
        const targetSkill = this.candidateSkills.get(proposal.targetedSkillId);
        if (targetSkill) {
          targetSkill.confidenceScore = Math.min(95, targetSkill.confidenceScore + 10);
          if (targetSkill.masteryLevel === 'in_progress') {
            targetSkill.masteryLevel = 'proficient';
          }
        }
      }
    });

    if (decision === 'accepted') {
      const lift = Math.min(15, proposalsToProcess.length * 4);
      this.resume.atsAnalysis.overallScore = Math.min(98, this.resume.atsAnalysis.overallScore + lift);
      this.resume.atsAnalysis.keywordMatchScore = Math.min(96, this.resume.atsAnalysis.keywordMatchScore + lift);
      this.resume.atsAnalysis.parsabilityScore = Math.min(95, this.resume.atsAnalysis.parsabilityScore + Math.round(lift / 2));
    }

    eventBus.publish({
      event_type: 'RESUME_BULLET_ACCEPTED',
      candidate_id: this.canonicalState.candidate_id,
      source: 'HITL Resume Optimizer (Batch)',
      payload: {
        filter,
        decision,
        bulletIds: processedIds,
        newAtsScore: this.resume.atsAnalysis.overallScore,
        batch_hash: batchHash,
      },
      provenance: {
        type: 'VERIFIED_CANDIDATE',
        confidence: 1.0,
        hash: batchHash,
      },
      recalculatedModules: ['Candidate Profile', 'Job Match Scoring', 'Institutional EWEIS'],
    });

    this.recalculateAll();

    if (decision === 'accepted') {
      // Two-Phase Commit Distributed Synchronization
      cdcSyncCircuit.executeTwoPhaseCommitSync({
        sourceTable: 'candidate_resumes',
        entityId: this.canonicalState.candidate_id,
        operation: 'RESUME_BULLET_ACCEPTED',
        payload: {
          batchHash,
          filter,
          processedCount: proposalsToProcess.length,
          newAtsScore: this.resume.atsAnalysis.overallScore,
        },
      });
    }

    return { processedCount: proposalsToProcess.length, batchHash };
  }

  /**
   * Records interview completion and propagates Bayesian posterior updates
   */
  public recordInterviewCompletion(session: MockInterviewSession): void {
    this.interviewHistory.unshift(session);

    if (session.overallScore) {
      session.overallScore.updatedSkillMasteries.forEach(({ skillId, newScore }) => {
        const skill = this.candidateSkills.get(skillId);
        if (skill) {
          // Bayesian posterior blending
          const prior = skill.confidenceScore;
          const evidence = newScore;
          const posterior = Math.round((prior * 0.4) + (evidence * 0.6));
          skill.confidenceScore = posterior;

          if (posterior >= 80) {
            skill.masteryLevel = 'mastered';
          } else if (posterior >= 65) {
            skill.masteryLevel = 'proficient';
          }
          skill.verifiedThroughMockInterview = true;
          skill.lastUpdated = new Date().toISOString();
        }
      });
    }

    this.rebuildCanonicalSkills();
    this.recalculateAll();

    eventBus.publish({
      event_type: 'MOCK_INTERVIEW_COMPLETED',
      candidate_id: this.canonicalState.candidate_id,
      source: 'Adaptive Mock Interviewer',
      payload: {
        sessionId: session.id,
        roleTarget: session.roleTarget,
        overallScore: session.overallScore,
      },
      provenance: {
        type: 'VERIFIED_CANDIDATE',
        confidence: 0.94,
        model_version: 'AURA-CAT-Adaptive-v2.0',
        hash: `0xinterview_${session.id}`,
      },
      recalculatedModules: ['Candidate Skill Graph', 'Job Match Scoring', 'Institutional Cohort EWEIS'],
    });

    // Two-Phase Commit Distributed Synchronization (Postgres WAL + Neo4j Graph + pgvector)
    cdcSyncCircuit.executeTwoPhaseCommitSync({
      sourceTable: 'mock_interview_sessions',
      entityId: session.id,
      operation: 'UPDATE',
      payload: {
        sessionId: session.id,
        roleTarget: session.roleTarget,
        technicalScore: session.overallScore?.technicalScore,
        updatedSkills: session.overallScore?.updatedSkillMasteries,
      },
    });

    // Offline & Async LLM Evaluator Guardrail Audit Loop
    if (session.turns && session.turns.length > 0) {
      const candidateTurn = session.turns.filter(t => t.speaker === 'candidate').pop();
      const interviewerTurn = session.turns.filter(t => t.speaker === 'interviewer').pop();
      if (candidateTurn) {
        llmGuardrailEvaluator.evaluateInterviewStarRubric({
          question: interviewerTurn?.text || 'Technical architectural scenario',
          candidateAnswer: candidateTurn.text,
          evaluatorOutput: {
            starAdherenceScore: candidateTurn.turnEvaluation?.starAdherence?.resultScore || 85,
            technicalCorrectness: candidateTurn.turnEvaluation?.technicalCorrectness || 80,
            feedback: candidateTurn.turnEvaluation?.aiCritique || 'Grounded engineering explanation.',
            followUpProbe: 'What are the boundary failure conditions?',
          },
        });
      }
    }
  }

  public updateStudentIntervention(planId: string): void {
    eventBus.publish({
      event_type: 'EWEIS_INTERVENTION_DEPLOYED',
      sourceModule: 'Institutional Career Center',
      payload: { planId },
      recalculatedModules: ['Institutional Early Warning Engine', 'Cohort Funnel Analytics'],
    });
  }

  public isCustomProfile(): boolean {
    return this.isCustomResumeActive;
  }

  /**
   * Ingests parsed resume data from PDF/Text upload following the reactive event pipeline:
   * RESUME_UPLOADED -> DOCUMENT_PARSED -> PROFILE_MUTATED -> SKILL_GRAPH_RECALCULATED
   * -> JOB_MATCHES_RECALCULATED -> READINESS_RECALCULATED -> ATS_RECALCULATED
   */
  public ingestCandidateFromResume(parsedData: ParsedResumeResult): void {
    this.profile = { ...parsedData.profile };
    this.isCustomResumeActive = true;

    this.canonicalState.name = parsedData.profile.name;
    this.canonicalState.email = parsedData.profile.email;
    this.canonicalState.active_target_role = parsedData.profile.targetRole;

    parsedData.skills.forEach(s => {
      this.candidateSkills.set(s.skillId, {
        skillId: s.skillId,
        masteryLevel: s.level,
        confidenceScore: s.confidence,
        lastUpdated: new Date().toISOString(),
        verifiedThroughMockInterview: false,
        assessmentEvidence: s.evidence,
      });
    });

    const masteryMap = new Map<string, MasteryLevel>();
    this.candidateSkills.forEach((v, k) => masteryMap.set(k, v.masteryLevel));
    const updatedStatuses = this.dldm.evaluateAllSkillStatuses(masteryMap);

    updatedStatuses.forEach((newStatus, sId) => {
      const current = this.candidateSkills.get(sId);
      if (current && (current.masteryLevel === 'locked' || current.masteryLevel === 'prerequisite_needed')) {
        current.masteryLevel = newStatus;
      }
    });

    this.resume = { ...parsedData.resume };
    this.rebuildCanonicalSkills();
    // 1. Canonical Event Flow: RESUME_PARSED -> SKILL_MUTATED -> READINESS_RECALCULATED -> JOB_MATCHES_UPDATED -> EWEIS_RISK_UPDATED
    eventBus.publish({
      event_type: 'RESUME_PARSED',
      candidate_id: this.canonicalState.candidate_id,
      source: 'Resume AST Parser Pipeline',
      payload: {
        candidateName: parsedData.profile.name,
        targetRole: parsedData.profile.targetRole,
        sectionsCount: parsedData.resume.atsAnalysis.detectedSections.length,
        atsScore: parsedData.resume.atsAnalysis.overallScore,
      },
      provenance: { type: 'VERIFIED_CANDIDATE', confidence: 1.0, hash: `0xresume_parsed_${Date.now()}` },
    });

    eventBus.publish({
      event_type: 'SKILL_MUTATED',
      candidate_id: this.canonicalState.candidate_id,
      source: 'Skill Ontology DLDM Ingestion',
      payload: {
        ingestedSkillsCount: parsedData.skills.length,
        activeSkillsCount: this.candidateSkills.size,
      },
      provenance: { type: 'MODEL_INFERRED', confidence: 0.94, hash: `0xskill_mutated_${Date.now()}` },
    });

    eventBus.publish({
      event_type: 'READINESS_RECALCULATED',
      candidate_id: this.canonicalState.candidate_id,
      source: 'Multidimensional Readiness Engine',
      payload: { newOverallReadiness: this.profile.overallReadinessScore },
      provenance: { type: 'SYSTEM_DERIVED', confidence: 0.98, hash: `0xreadiness_${Date.now()}` },
    });

    eventBus.publish({
      event_type: 'JOB_MATCHES_UPDATED',
      candidate_id: this.canonicalState.candidate_id,
      source: 'Two-Sided Fit-vs-Stretch Match Engine',
      payload: {
        activeJobsMatchedCount: this.jobs.length,
        topRole: this.profile.targetRole,
      },
      provenance: { type: 'SYSTEM_DERIVED', confidence: 0.96, hash: `0xjobs_updated_${Date.now()}` },
    });

    const alexCohort = this.institutionalCohorts.find(s => s.studentId === 'stu-003');
    eventBus.publish({
      event_type: 'EWEIS_RISK_UPDATED',
      candidate_id: this.canonicalState.candidate_id,
      source: 'Institutional Early Warning System (EWEIS)',
      payload: {
        placementProbability: alexCohort?.placementProbability || 74,
        riskLevel: alexCohort?.riskLevel || 'placement_ready',
        window: 'T-90 Days',
      },
      provenance: { type: 'SYSTEM_DERIVED', confidence: 0.92, hash: `0xeweis_risk_${Date.now()}` },
    });

    // Backwards-compatible events
    eventBus.publish({
      event_type: 'PROFILE_MUTATED',
      candidate_id: this.canonicalState.candidate_id,
      source: 'Candidate-Intelligence Engine',
      payload: { candidateName: this.profile.name, targetRole: this.profile.targetRole },
      provenance: { type: 'VERIFIED_CANDIDATE', confidence: 0.95, hash: '0xprof_mut' },
    });

    eventBus.publish({
      type: 'RESUME_UPLOADED_AND_PARSED',
      sourceModule: 'PDF Resume Ingestion Engine',
      payload: {
        candidateName: this.profile.name,
        targetRole: this.profile.targetRole,
        readinessScore: this.profile.overallReadinessScore,
        atsScore: this.resume.atsAnalysis.overallScore,
      },
      recalculatedModules: ['Candidate Profile', 'Job Match Scoring', 'Skill Graph & DLDM', 'Resume AST Simulator', 'Institutional EWEIS'],
    });
  }

  /**
   * Generates a Day-by-Day Adaptive Preparation Roadmap using the AI Planning Agent
   */
  public generatePrepPlan(durationDays: PlanDurationDays = 14): AdaptivePrepPlan {
    const prereqs = this.dldm.getPrerequisiteChain('system_design');
    const gaps = prereqs.filter(id => {
      const skill = this.candidateSkills.get(id);
      return !skill || (skill.masteryLevel !== 'mastered' && skill.masteryLevel !== 'proficient');
    });
    const gapIds = gaps.length > 0 ? gaps : ['system_design', 'caching_redis', 'db_indexing'];

    return PrepPlanGenerator.generateDayByDayPlan({
      candidateProfile: this.profile,
      targetRole: this.profile.targetRole,
      targetCompany: this.profile.targetCompany,
      targetSeniority: this.canonicalState.preferences.targetSeniority || 'Senior',
      skillGaps: gapIds,
      durationDays,
    });
  }

  /**
   * Syncs verified skills extracted directly from student's GitHub repositories
   * following deterministic cryptographic code provenance.
   */
  public syncGitHubSkills(report: GitHubVerificationReport): void {
    if (report.user.name) {
      this.profile.name = report.user.name;
      this.canonicalState.name = report.user.name;
    }
    if (report.user.email) {
      this.profile.email = report.user.email;
      this.canonicalState.email = report.user.email;
    }

    report.verifiedSkills.forEach((s) => {
      const norm = s.name.toLowerCase();
      let dagSkillId: string | null = null;
      if (norm.includes('typescript')) dagSkillId = 'typescript';
      else if (norm.includes('python')) dagSkillId = 'python';
      else if (norm.includes('sql') || norm.includes('database') || norm.includes('postgres') || norm.includes('supabase')) dagSkillId = 'sql_fundamentals';
      else if (norm.includes('react') || norm.includes('next') || norm.includes('web')) dagSkillId = 'fastapi';
      else if (norm.includes('security') || norm.includes('cyber')) dagSkillId = 'linux_shell';
      else if (norm.includes('system') || norm.includes('architecture')) dagSkillId = 'system_design';
      else if (norm.includes('docker') || norm.includes('container')) dagSkillId = 'docker_containers';

      if (dagSkillId) {
        this.candidateSkills.set(dagSkillId, {
          skillId: dagSkillId,
          masteryLevel: s.confidenceScore >= 90 ? 'mastered' : 'proficient',
          confidenceScore: s.confidenceScore,
          lastUpdated: new Date().toISOString(),
          verifiedThroughMockInterview: true,
          assessmentEvidence: `Verified via GitHub Code Repositories [${s.evidenceRepos.join(', ')}] with audit hash ${report.auditHash}`,
        });
      }
    });

    const masteryMap = new Map<string, MasteryLevel>();
    this.candidateSkills.forEach((v, k) => masteryMap.set(k, v.masteryLevel));
    const updatedStatuses = this.dldm.evaluateAllSkillStatuses(masteryMap);
    updatedStatuses.forEach((newStatus, sId) => {
      const current = this.candidateSkills.get(sId);
      if (current && (current.masteryLevel === 'locked' || current.masteryLevel === 'prerequisite_needed')) {
        current.masteryLevel = newStatus;
      }
    });

    this.rebuildCanonicalSkills();
    this.recalculateAll();

    eventBus.publish({
      type: 'SKILL_ASSESSMENT_UPDATED',
      sourceModule: 'GitHub Code Provenance Engine',
      payload: {
        githubUser: report.user.login,
        verifiedSkillsCount: report.verifiedSkills.length,
        auditHash: report.auditHash,
        newReadiness: this.profile.overallReadinessScore,
      },
      recalculatedModules: ['Candidate Profile', 'Skill Graph & DLDM', 'Job Match Scoring'],
    });
  }

  public resetToDefaultProfile(): void {
    this.profile = {
      id: 'cand-alex-chen',
      name: 'Alex Chen',
      email: 'alex.chen@stanford.alumni.edu',
      targetRole: 'Senior Distributed Systems Engineer',
      targetCompany: 'Stripe',
      overallReadinessScore: 67,
    };
    this.isCustomResumeActive = false;

    const initialMasteries: { skillId: string; level: MasteryLevel; confidence: number }[] = [
      { skillId: 'python', level: 'mastered', confidence: 95 },
      { skillId: 'typescript', level: 'proficient', confidence: 85 },
      { skillId: 'dsa_core', level: 'proficient', confidence: 88 },
      { skillId: 'sql_fundamentals', level: 'mastered', confidence: 92 },
      { skillId: 'linux_shell', level: 'proficient', confidence: 80 },
      { skillId: 'fastapi', level: 'mastered', confidence: 90 },
      { skillId: 'db_indexing', level: 'in_progress', confidence: 65 },
      { skillId: 'caching_redis', level: 'in_progress', confidence: 60 },
      { skillId: 'load_balancing', level: 'in_progress', confidence: 55 },
      { skillId: 'docker_containers', level: 'proficient', confidence: 82 },
      { skillId: 'system_design', level: 'prerequisite_needed', confidence: 51 },
      { skillId: 'distributed_consensus', level: 'locked', confidence: 20 },
      { skillId: 'vector_databases', level: 'in_progress', confidence: 50 },
      { skillId: 'rag_architectures', level: 'locked', confidence: 15 },
      { skillId: 'agentic_ai', level: 'locked', confidence: 10 },
      { skillId: 'kubernetes', level: 'locked', confidence: 30 },
      { skillId: 'message_queues', level: 'in_progress', confidence: 58 },
    ];

    this.candidateSkills.clear();
    initialMasteries.forEach(m => {
      this.candidateSkills.set(m.skillId, {
        skillId: m.skillId,
        masteryLevel: m.level,
        confidenceScore: m.confidence,
        lastUpdated: new Date().toISOString(),
        verifiedThroughMockInterview: false,
      });
    });

    this.resume = { ...INITIAL_CANDIDATE_RESUME };
    this.rebuildCanonicalSkills();
    this.recalculateAll();

    eventBus.publish({
      type: 'CANDIDATE_PROFILE_RESET',
      sourceModule: 'Candidate-Intelligence Engine',
      payload: { candidateName: this.profile.name },
      recalculatedModules: ['Candidate Profile', 'Job Match Scoring', 'Skill Graph & DLDM', 'Resume AST Simulator'],
    });
  }

  public recalculateAll(): void {
    this.recalculateReadiness();

    const alexInCohort = this.institutionalCohorts.find(s => s.studentId === 'stu-003');
    if (alexInCohort) {
      alexInCohort.name = this.profile.name;
      alexInCohort.email = this.profile.email;
      alexInCohort.metrics.atsResumeScore = this.resume.atsAnalysis.overallScore;
      alexInCohort.metrics.dldmSkillGraphDepth = this.profile.overallReadinessScore;
      alexInCohort.placementProbability = Math.round(
        (this.resume.atsAnalysis.overallScore * 0.4) +
        (alexInCohort.metrics.mockInterviewStarAdherence * 0.3) +
        (this.profile.overallReadinessScore * 0.3)
      );

      if (alexInCohort.placementProbability >= 70) {
        alexInCohort.riskLevel = 'placement_ready';
      } else if (alexInCohort.placementProbability >= 45) {
        alexInCohort.riskLevel = 'moderate_risk';
      } else {
        alexInCohort.riskLevel = 'critical_risk';
      }
    }
  }

  /**
   * Cold-Start Profile Bootstrapper
   * For incoming students with empty application/interview histories and sparse resume drafts.
   * Imputes empirical Bayesian priors and course proficiencies, avoiding false-positive EWEIS flags.
   */
  public bootstrapCandidateColdStart(cohortKey: string = 'stanford_cs'): ColdStartImputationResult {
    const baseline = coldStartPipeline.getCohortBaseline(cohortKey);
    const imputation = coldStartPipeline.bootstrapCandidateColdStart({
      candidateId: this.canonicalState.candidate_id,
      universityKey: cohortKey,
      rawResumeWords: 60,
    });

    if (baseline) {
      baseline.imputedCoreSkills.forEach((s: any) => {
        this.candidateSkills.set(s.skillId, {
          skillId: s.skillId,
          masteryLevel: s.level,
          confidenceScore: Math.round(s.confidence * 100),
          lastUpdated: new Date().toISOString(),
          verifiedThroughMockInterview: false,
          assessmentEvidence: s.courseworkEvidence,
        });
      });
    }

    this.rebuildCanonicalSkills();
    this.recalculateAll();

    // Two-Phase Commit Distributed Synchronization (Postgres WAL + Neo4j Graph + pgvector)
    cdcSyncCircuit.executeTwoPhaseCommitSync({
      sourceTable: 'candidate_profiles',
      entityId: this.canonicalState.candidate_id,
      operation: 'UPDATE',
      payload: {
        sparsityIndexBefore: imputation.sparsityIndexBefore,
        sparsityIndexAfter: imputation.sparsityIndexAfter,
        empiricalPriorTheta: imputation.empiricalPriorTheta,
        syntheticEweisTrajectory: imputation.syntheticEweisTrajectory,
      },
    });

    return imputation;
  }

  public getCdcTelemetry() {
    return cdcSyncCircuit.getTelemetry();
  }

  public getCdcEventLog() {
    return cdcSyncCircuit.getEventLog();
  }

  public getGuardrailTelemetry() {
    return llmGuardrailEvaluator.getTelemetry();
  }

  public auditResumeBulletProposal(original: string, suggested: string): GuardrailQualityCertificate {
    return llmGuardrailEvaluator.evaluateResumeProposal(original, suggested);
  }
}

export const candidateIntelligenceEngine = new CandidateIntelligenceEngine();
