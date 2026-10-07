import { SkillNode, SkillEdge, CandidateSkillState, MasteryLevel } from '../types/skills';
import { JobPosting, JobMatchResult, FitCategory, MatchScoreFactor } from '../types/jobs';
import { CandidateResume, HitlBulletProposal } from '../types/resume';
import { MockInterviewSession } from '../types/interview';
import { StudentAnomalyVector, EweisRiskLevel } from '../types/institutional';
import { DLDMEngine } from './DLDMEngine';
import { eventBus } from './EventBus';
import { INITIAL_SKILL_NODES, INITIAL_SKILL_EDGES } from '../data/skillOntologyData';
import { INITIAL_JOB_POSTINGS } from '../data/jobPostingsData';
import { INITIAL_CANDIDATE_RESUME } from '../data/resumeASTData';
import { INITIAL_STUDENTS_ANOMALY_DATA } from '../data/institutionalData';
import { ParsedResumeResult } from '../parser/resumeParser';

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  targetCompany: string;
  overallReadinessScore: number;
}

export class CandidateIntelligenceEngine {
  private dldm: DLDMEngine;
  private profile: CandidateProfile;
  private candidateSkills: Map<string, CandidateSkillState> = new Map();
  private jobs: JobPosting[] = [...INITIAL_JOB_POSTINGS];
  private resume: CandidateResume = { ...INITIAL_CANDIDATE_RESUME };
  private interviewHistory: MockInterviewSession[] = [];
  private institutionalCohorts: StudentAnomalyVector[] = [...INITIAL_STUDENTS_ANOMALY_DATA];
  private isCustomResumeActive: boolean = false;

  constructor() {
    this.dldm = new DLDMEngine(INITIAL_SKILL_NODES, INITIAL_SKILL_EDGES);

    this.profile = {
      id: 'cand-alex-chen',
      name: 'Alex Chen',
      email: 'alex.chen@stanford.alumni.edu',
      targetRole: 'Senior Distributed Systems Engineer',
      targetCompany: 'Stripe',
      overallReadinessScore: 78,
    };

    // Initialize candidate default skill masteries
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
      { skillId: 'system_design', level: 'prerequisite_needed', confidence: 45 },
      { skillId: 'distributed_consensus', level: 'locked', confidence: 20 },
      { skillId: 'vector_databases', level: 'in_progress', confidence: 50 },
      { skillId: 'rag_architectures', level: 'locked', confidence: 15 },
      { skillId: 'agentic_ai', level: 'locked', confidence: 10 },
      { skillId: 'kubernetes', level: 'locked', confidence: 30 },
      { skillId: 'message_queues', level: 'in_progress', confidence: 58 },
    ];

    initialMasteries.forEach(m => {
      this.candidateSkills.set(m.skillId, {
        skillId: m.skillId,
        masteryLevel: m.level,
        confidenceScore: m.confidence,
        lastUpdated: new Date().toISOString(),
        verifiedThroughMockInterview: false,
      });
    });

    this.recalculateAll();
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

  /**
   * Recalculates candidate readiness score based on skill graph
   */
  public recalculateReadiness(): number {
    let totalScore = 0;
    let count = 0;

    this.candidateSkills.forEach(skill => {
      totalScore += skill.confidenceScore;
      count++;
    });

    const calculatedScore = count > 0 ? Math.round(totalScore / count) : 70;
    this.profile.overallReadinessScore = calculatedScore;
    return calculatedScore;
  }

  /**
   * Evaluates and updates skill state dynamically
   */
  public setSkillMastery(skillId: string, level: MasteryLevel, confidence: number, assessmentNote?: string) {
    const existing = this.candidateSkills.get(skillId) || {
      skillId,
      masteryLevel: level,
      confidenceScore: confidence,
      lastUpdated: new Date().toISOString(),
      verifiedThroughMockInterview: true,
    };

    existing.masteryLevel = level;
    existing.confidenceScore = confidence;
    existing.lastUpdated = new Date().toISOString();
    if (assessmentNote) {
      existing.assessmentEvidence = assessmentNote;
    }

    this.candidateSkills.set(skillId, existing);

    // Dynamic cascade: Evaluate unlockable statuses for all skills in DLDM
    const masteryMap = new Map<string, MasteryLevel>();
    this.candidateSkills.forEach((v, k) => masteryMap.set(k, v.masteryLevel));
    const updatedStatuses = this.dldm.evaluateAllSkillStatuses(masteryMap);

    updatedStatuses.forEach((newStatus, sId) => {
      const current = this.candidateSkills.get(sId);
      if (current && (current.masteryLevel === 'locked' || current.masteryLevel === 'prerequisite_needed')) {
        current.masteryLevel = newStatus;
      }
    });

    this.recalculateAll();

    eventBus.publish({
      type: 'SKILL_ASSESSMENT_UPDATED',
      sourceModule: 'Candidate-Intelligence Engine',
      payload: { skillId, level, confidence },
      recalculatedModules: ['Skill Graph & DLDM', 'Job Match Scoring', 'Institutional EWEIS', 'ATS Alignment'],
    });
  }

  /**
   * Explainable Match Scoring with additive boosts and penalties
   */
  public calculateJobMatches(): JobMatchResult[] {
    return this.jobs.map(job => {
      const factors: MatchScoreFactor[] = [];
      let baseScore = 50;

      // Evaluate required skills
      let requiredMatches = 0;
      const missingPrereqs: string[] = [];

      job.requiredSkillIds.forEach(reqId => {
        const candidateSkill = this.candidateSkills.get(reqId);
        const skillNode = this.dldm.getSkill(reqId);
        const skillName = skillNode ? skillNode.name : reqId;

        if (candidateSkill && (candidateSkill.masteryLevel === 'mastered' || candidateSkill.masteryLevel === 'proficient')) {
          requiredMatches++;
          const boostVal = Math.round(candidateSkill.confidenceScore * 0.12);
          baseScore += boostVal;
          factors.push({
            factorName: `Mastered ${skillName}`,
            impactPercentage: boostVal,
            type: 'boost',
            explanation: `Candidate verified proficiency (${candidateSkill.confidenceScore}%) meets critical prerequisite.`,
            relatedSkillId: reqId,
          });
        } else {
          missingPrereqs.push(skillName);
          const penaltyVal = 12;
          baseScore -= penaltyVal;
          factors.push({
            factorName: `Missing/In-Progress ${skillName}`,
            impactPercentage: -penaltyVal,
            type: 'penalty',
            explanation: `Required core technical competency not fully mastered yet.`,
            relatedSkillId: reqId,
          });
        }
      });

      // Preferred skills bonus
      job.preferredSkillIds.forEach(prefId => {
        const candidateSkill = this.candidateSkills.get(prefId);
        const skillNode = this.dldm.getSkill(prefId);
        const skillName = skillNode ? skillNode.name : prefId;

        if (candidateSkill && (candidateSkill.masteryLevel === 'mastered' || candidateSkill.masteryLevel === 'proficient')) {
          const boostVal = 8;
          baseScore += boostVal;
          factors.push({
            factorName: `Bonus Skill: ${skillName}`,
            impactPercentage: boostVal,
            type: 'boost',
            explanation: `Preferred qualification bonus matches team technology stack.`,
            relatedSkillId: prefId,
          });
        }
      });

      // Clamp overall match score between 15% and 98%
      const overallMatchScore = Math.max(15, Math.min(98, Math.round(baseScore)));
      const skillGapPercentage = 100 - overallMatchScore;

      // Fit-vs-Stretch Categorization per specification:
      // Safe Fit (Gap < 10%), Stretch (Gap 10-30%), Reach (Gap > 30%)
      let fitCategory: FitCategory = 'reach';
      if (skillGapPercentage < 15) {
        fitCategory = 'safe_fit';
      } else if (skillGapPercentage <= 30) {
        fitCategory = 'stretch';
      } else {
        fitCategory = 'reach';
      }

      const actionableRecommendation = fitCategory === 'safe_fit'
        ? 'High probability profile match. Prioritize fast-track application and tailored cover note.'
        : fitCategory === 'stretch'
        ? `Feasible target. Close gap in [${missingPrereqs.slice(0, 2).join(', ')}] via targeted dynamic roadmap.`
        : `Long-term ambition. Foundational prerequisites missing. Complete sequential learning pathway first.`;

      return {
        jobId: job.id,
        job,
        overallMatchScore,
        fitCategory,
        skillGapPercentage,
        factors,
        missingPrerequisiteSkills: missingPrereqs,
        actionableRecommendation,
      };
    }).sort((a, b) => b.overallMatchScore - a.overallMatchScore);
  }

  /**
   * Human-In-The-Loop Bullet Approval Pipeline (Strict No Unilateral AI Updates Guardrail)
   */
  public handleBulletDecision(
    bulletId: string,
    decision: 'accepted' | 'rejected' | 'modified',
    modifiedText?: string
  ): void {
    const proposal = this.resume.bulletProposals.find(p => p.id === bulletId);
    if (!proposal) return;

    proposal.status = decision;
    proposal.confirmedAt = new Date().toISOString();

    if (decision === 'modified' && modifiedText) {
      proposal.userModifiedText = modifiedText;
    }

    if (decision === 'accepted' || decision === 'modified') {
      // Re-calculate ATS score & keyword match positively
      this.resume.atsAnalysis.overallScore = Math.min(96, this.resume.atsAnalysis.overallScore + 8);
      this.resume.atsAnalysis.keywordMatchScore = Math.min(95, this.resume.atsAnalysis.keywordMatchScore + 10);
      this.resume.atsAnalysis.parsabilityScore = Math.min(94, this.resume.atsAnalysis.parsabilityScore + 6);

      // If bullet targets a skill, elevate candidate skill confidence
      const targetSkill = this.candidateSkills.get(proposal.targetedSkillId);
      if (targetSkill) {
        targetSkill.confidenceScore = Math.min(95, targetSkill.confidenceScore + 15);
        if (targetSkill.masteryLevel === 'in_progress') {
          targetSkill.masteryLevel = 'proficient';
        }
      }

      eventBus.publish({
        type: 'RESUME_BULLET_ACCEPTED',
        sourceModule: 'HITL Resume Optimizer',
        payload: {
          bulletId,
          decision,
          targetSkillId: proposal.targetedSkillId,
          newAtsScore: this.resume.atsAnalysis.overallScore,
        },
        recalculatedModules: ['Candidate-Intelligence Engine', 'Job Match Scoring', 'Institutional EWEIS'],
      });

      this.recalculateAll();
    }
  }

  /**
   * Completes a Mock Interview Session and propagates multi-signal evaluation back to skills and EWEIS
   */
  public recordInterviewCompletion(session: MockInterviewSession): void {
    this.interviewHistory.unshift(session);

    if (session.overallScore) {
      session.overallScore.updatedSkillMasteries.forEach(({ skillId, newScore }) => {
        const skill = this.candidateSkills.get(skillId);
        if (skill) {
          skill.confidenceScore = Math.round((skill.confidenceScore + newScore) / 2);
          if (newScore >= 80) {
            skill.masteryLevel = 'mastered';
          } else if (newScore >= 65) {
            skill.masteryLevel = 'proficient';
          }
          skill.verifiedThroughMockInterview = true;
          skill.lastUpdated = new Date().toISOString();
        }
      });
    }

    this.recalculateAll();

    eventBus.publish({
      type: 'MOCK_INTERVIEW_COMPLETED',
      sourceModule: 'Adaptive Mock Interviewer',
      payload: {
        sessionId: session.id,
        roleTarget: session.roleTarget,
        overallScore: session.overallScore,
      },
      recalculatedModules: ['Candidate Skill Graph', 'Job Match Scoring', 'Institutional Cohort EWEIS'],
    });
  }

  /**
   * Institutional EWEIS: Updates student trajectory and anomaly scores
   */
  public updateStudentIntervention(planId: string): void {
    eventBus.publish({
      type: 'EWEIS_INTERVENTION_DEPLOYED',
      sourceModule: 'Institutional Career Center',
      payload: { planId },
      recalculatedModules: ['Institutional Early Warning Engine', 'Cohort Funnel Analytics'],
    });
  }

  public isCustomProfile(): boolean {
    return this.isCustomResumeActive;
  }

  /**
   * Ingests parsed resume data from PDF/Text upload, dynamically calibrating the entire OS
   */
  public ingestCandidateFromResume(parsedData: ParsedResumeResult): void {
    this.profile = { ...parsedData.profile };
    this.isCustomResumeActive = true;

    // Update candidate skills
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

    // Evaluate DLDM cascade on newly loaded masteries
    const masteryMap = new Map<string, MasteryLevel>();
    this.candidateSkills.forEach((v, k) => masteryMap.set(k, v.masteryLevel));
    const updatedStatuses = this.dldm.evaluateAllSkillStatuses(masteryMap);

    updatedStatuses.forEach((newStatus, sId) => {
      const current = this.candidateSkills.get(sId);
      if (current && (current.masteryLevel === 'locked' || current.masteryLevel === 'prerequisite_needed')) {
        current.masteryLevel = newStatus;
      }
    });

    // Replace resume AST
    this.resume = { ...parsedData.resume };

    this.recalculateAll();

    eventBus.publish({
      type: 'RESUME_UPLOADED_AND_PARSED',
      sourceModule: 'PDF Resume Ingestion Engine',
      payload: {
        candidateName: this.profile.name,
        targetRole: this.profile.targetRole,
        readinessScore: this.profile.overallReadinessScore,
        atsScore: this.resume.atsAnalysis.overallScore,
      },
      recalculatedModules: [
        'Candidate Profile',
        'Job Match Scoring',
        'Skill Graph & DLDM',
        'Resume AST Simulator',
        'Institutional EWEIS',
      ],
    });

    eventBus.publish({
      type: 'SKILL_ASSESSMENT_UPDATED',
      sourceModule: 'PDF Resume Ingestion Engine',
      payload: { source: 'resume_upload' },
      recalculatedModules: ['Skill Graph & DLDM', 'Job Match Scoring'],
    });
  }

  /**
   * Resets candidate profile back to default benchmark (Alex Chen)
   */
  public resetToDefaultProfile(): void {
    this.profile = {
      id: 'cand-alex-chen',
      name: 'Alex Chen',
      email: 'alex.chen@stanford.alumni.edu',
      targetRole: 'Senior Distributed Systems Engineer',
      targetCompany: 'Stripe',
      overallReadinessScore: 78,
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
      { skillId: 'system_design', level: 'prerequisite_needed', confidence: 45 },
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
    this.recalculateAll();

    eventBus.publish({
      type: 'CANDIDATE_PROFILE_RESET',
      sourceModule: 'Candidate-Intelligence Engine',
      payload: { candidateName: this.profile.name },
      recalculatedModules: ['Candidate Profile', 'Job Match Scoring', 'Skill Graph & DLDM', 'Resume AST Simulator'],
    });

    eventBus.publish({
      type: 'SKILL_ASSESSMENT_UPDATED',
      sourceModule: 'Candidate-Intelligence Engine',
      payload: { source: 'profile_reset' },
      recalculatedModules: ['Skill Graph & DLDM', 'Job Match Scoring'],
    });
  }

  public recalculateAll(): void {
    this.recalculateReadiness();

    // Sync profile in Institutional EWEIS Cohorts
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
}

// Global Singleton Instance for cross-module consistency
export const candidateIntelligenceEngine = new CandidateIntelligenceEngine();
