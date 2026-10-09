import { CanonicalCandidateState } from '../types/candidate';
import { JobPosting } from '../types/jobs';
import { MockInterviewSession } from '../types/interview';
import { ProvenanceMetadata } from '../types/provenance';

export type CandidateGapType = 
  | 'no_evidence'              // Required skill exists in job/target but candidate has zero recorded evidence
  | 'weak_proficiency'         // Candidate has foundational/in_progress or low confidence (<70%)
  | 'insufficient_experience'  // Job asks for e.g. 5 yrs, candidate has 2-3 yrs, or seniority discrepancy
  | 'weak_interview_signal'    // Mock interview or technical screen scored low in this area
  | 'preference_mismatch'      // Remote, location, or compensation mismatch with target
  | 'unmet_requirement';       // Degree, clearance, or hard requirement not yet verified

export interface PrioritizedCandidateGap {
  id: string;
  title: string;
  gapType: CandidateGapType;
  gapTypeLabel: string;
  severity: 'critical' | 'moderate' | 'minor';
  priorityRank: number; // 1 (highest priority) to N
  importanceScore: number; // 0 to 100
  skillId?: string;
  targetContext: string;
  reasoning: string;
  currentEvidence: string[];
  remediationAction: string;
  provenance: ProvenanceMetadata;
}

export class GapIntelligenceEngine {
  /**
   * Comprehensive gap diagnosis across 6 distinct taxonomy categories:
   * 1. No evidence of a required skill
   * 2. Weak skill / low proficiency
   * 3. Insufficient experience tenure
   * 4. Weak interview performance signal
   * 5. Preference / location mismatch
   * 6. Unmet mandatory requirement
   */
  public static analyzeGaps(
    state: CanonicalCandidateState,
    targetJob?: JobPosting
  ): PrioritizedCandidateGap[] {
    const gaps: PrioritizedCandidateGap[] = [];
    const targetRole = targetJob?.title || state.active_target_role || 'Senior Distributed Systems Engineer';
    const targetCompany = targetJob?.company || 'Enterprise Tier 1';

    // 1. Skill-based gaps: 'no_evidence' and 'weak_proficiency'
    const requiredSkillIds = targetJob?.requiredSkillIds || [
      'system_design',
      'caching_redis',
      'kubernetes',
      'message_queues',
      'db_indexing',
    ];

    requiredSkillIds.forEach((skillId) => {
      const candidateSkill = state.skills[skillId];

      if (!candidateSkill || candidateSkill.levelLabel === 'locked') {
        // Gap 1: No evidence
        gaps.push({
          id: `gap-no-ev-${skillId}`,
          title: `No Recorded Evidence: ${this.formatSkillTitle(skillId)}`,
          gapType: 'no_evidence',
          gapTypeLabel: 'No Evidence of Required Skill',
          severity: 'critical',
          priorityRank: 0,
          importanceScore: 92,
          skillId,
          targetContext: `${targetCompany} • ${targetRole}`,
          reasoning: `Target role mandates competency in ${this.formatSkillTitle(skillId)}, but neither your verified resume AST, GitHub repositories, nor assessments contain verifiable signal.`,
          currentEvidence: candidateSkill ? candidateSkill.evidence : [],
          remediationAction: `Build and document an end-to-end project or complete a targeted technical lab demonstrating ${this.formatSkillTitle(skillId)}.`,
          provenance: {
            level: 'SYSTEM_DERIVED',
            source: 'AURA 6-Taxonomy Gap Intelligence Engine',
            confidenceScore: 95,
            lastVerifiedAt: new Date().toISOString().split('T')[0],
            auditHash: `0xgap_noev_${skillId}`,
          },
        });
      } else if (
        candidateSkill.levelLabel === 'in_progress' ||
        candidateSkill.levelLabel === 'prerequisite_needed' ||
        candidateSkill.confidence < 0.70
      ) {
        // Gap 2: Weak proficiency
        gaps.push({
          id: `gap-weak-${skillId}`,
          title: `Sub-Benchmark Proficiency: ${this.formatSkillTitle(skillId)}`,
          gapType: 'weak_proficiency',
          gapTypeLabel: 'Weak Proficiency / In-Progress',
          severity: 'moderate',
          priorityRank: 0,
          importanceScore: 78,
          skillId,
          targetContext: `${targetCompany} • ${targetRole}`,
          reasoning: `You have foundational familiarity with ${this.formatSkillTitle(skillId)} (${Math.round(candidateSkill.confidence * 100)}% confidence), but Senior-level roles demand deep architectural trade-off mastery.`,
          currentEvidence: candidateSkill.evidence,
          remediationAction: `Complete an advanced scenario challenge to elevate status from '${candidateSkill.levelLabel}' to 'proficient'.`,
          provenance: {
            level: 'SYSTEM_DERIVED',
            source: 'AURA 6-Taxonomy Gap Intelligence Engine',
            confidenceScore: 92,
            lastVerifiedAt: new Date().toISOString().split('T')[0],
            auditHash: `0xgap_weak_${skillId}`,
          },
        });
      }
    });

    // 2. Experience tenure gap: 'insufficient_experience'
    const requiredYears = targetJob?.requiredYearsExperience || 5;
    const candidateYears = this.calculateExperienceYears(state);

    if (candidateYears < requiredYears) {
      gaps.push({
        id: 'gap-exp-tenure',
        title: `Experience Tenure: ${candidateYears} yrs vs ${requiredYears}+ yrs Expected`,
        gapType: 'insufficient_experience',
        gapTypeLabel: 'Insufficient Experience Tenure',
        severity: candidateYears <= requiredYears - 3 ? 'critical' : 'moderate',
        priorityRank: 0,
        importanceScore: candidateYears <= requiredYears - 3 ? 86 : 74,
        targetContext: `${targetCompany} • ${targetRole}`,
        reasoning: `Job description specifies ${requiredYears}+ years of full-time professional experience. Your verified timeline demonstrates ~${candidateYears} years.`,
        currentEvidence: [`Verified career timeline: ${candidateYears} years across documented positions`],
        remediationAction: `Highlight production scope, high-throughput metrics (e.g. 15k events/sec), and technical leadership in resume bullets to offset raw year count.`,
        provenance: {
          level: 'SYSTEM_DERIVED',
          source: 'AURA 6-Taxonomy Gap Intelligence Engine',
          confidenceScore: 94,
          lastVerifiedAt: new Date().toISOString().split('T')[0],
          auditHash: '0xgap_exp_tenure',
        },
      });
    }

    // 3. Interview Performance signal gap: 'weak_interview_signal'
    if (state.interview_history && state.interview_history.length > 0) {
      state.interview_history.forEach((session: MockInterviewSession, idx: number) => {
        if (session.overallScore && session.overallScore.technicalScore < 70) {
          const testedSkills = session.targetSkillIds || ['General Architecture'];
          gaps.push({
            id: `gap-int-signal-${idx}`,
            title: `Sub-Threshold Interview Signal: ${testedSkills.map(s => this.formatSkillTitle(s)).join(', ')}`,
            gapType: 'weak_interview_signal',
            gapTypeLabel: 'Weak Interview Performance Signal',
            severity: 'critical',
            priorityRank: 0,
            importanceScore: 89,
            targetContext: `Mock Interview • ${session.roleTarget}`,
            reasoning: `In your recent CAT interview on ${testedSkills.join(', ')}, technical correctness evaluated at ${session.overallScore.technicalScore}% (target threshold: >= 75%).`,
            currentEvidence: session.overallScore.criticalGapsDiscovered || ['Needs deeper justification of distributed edge-case failures'],
            remediationAction: `Schedule a targeted follow-up adaptive interview drill focusing explicitly on trade-offs under high concurrency.`,
            provenance: session.provenance || {
              level: 'VERIFIED_CANDIDATE',
              source: 'CAT Adaptive Interview Evaluator',
              confidenceScore: 96,
              lastVerifiedAt: new Date().toISOString().split('T')[0],
              auditHash: '0xgap_mock_eval',
            },
          });
        }
      });
    } else {
      // If no interview history exists, prompt an uncalibrated signal warning
      gaps.push({
        id: 'gap-int-none',
        title: 'Unverified Technical Interview Signal',
        gapType: 'weak_interview_signal',
        gapTypeLabel: 'Weak Interview Performance Signal',
        severity: 'moderate',
        priorityRank: 0,
        importanceScore: 70,
        targetContext: targetRole,
        reasoning: 'Zero simulated or verified interview rounds logged in candidate history. The system cannot verify live algorithmic defense under time pressure.',
        currentEvidence: ['Zero mock sessions in candidate ledger'],
        remediationAction: 'Run at least one CAT Adaptive Mock Interview round to establish an empirical Bayesian ability parameter (θ).',
        provenance: {
          level: 'SYSTEM_DERIVED',
          source: 'AURA Gap Engine',
          confidenceScore: 90,
          lastVerifiedAt: new Date().toISOString().split('T')[0],
          auditHash: '0xgap_no_interview',
        },
      });
    }

    // 4. Preference mismatch: 'preference_mismatch'
    if (targetJob && state.preferences) {
      const jobLocation = targetJob.location.toLowerCase();
      const preferredLocations = state.preferences.targetLocations.map(l => l.toLowerCase());
      const isRemoteJob = jobLocation.includes('remote');
      const prefersRemote = state.preferences.remotePreference === 'remote_only';

      if (prefersRemote && !isRemoteJob) {
        gaps.push({
          id: 'gap-pref-remote',
          title: 'Workplace Arrangement Discrepancy (Onsite vs Remote Preference)',
          gapType: 'preference_mismatch',
          gapTypeLabel: 'Preference Mismatch',
          severity: 'minor',
          priorityRank: 0,
          importanceScore: 58,
          targetContext: `${targetJob.company} (${targetJob.location})`,
          reasoning: `You specified a preference for remote roles, whereas this position is onsite / hybrid in ${targetJob.location}.`,
          currentEvidence: [`Candidate preference: ${state.preferences.remotePreference}`, `Job location: ${targetJob.location}`],
          remediationAction: `Confirm relocation or hybrid commuting viability before progressing to interview rounds.`,
          provenance: {
            level: 'USER_ASSERTED',
            source: 'Candidate Preference Ledger',
            confidenceScore: 98,
            lastVerifiedAt: new Date().toISOString().split('T')[0],
            auditHash: '0xgap_pref_mismatch',
          },
        });
      }
    }

    // 5. Unmet requirement: 'unmet_requirement'
    // Check cloud deployment / production verification
    const hasCloudDeploymentEvidence = Object.values(state.skills).some(
      s => (s.id === 'docker_containers' || s.id === 'kubernetes') && s.levelLabel === 'mastered'
    );
    if (!hasCloudDeploymentEvidence) {
      gaps.push({
        id: 'gap-unmet-cloud-dep',
        title: 'Unverified Cloud / Container Orchestration Deployment',
        gapType: 'unmet_requirement',
        gapTypeLabel: 'Unmet Mandatory Requirement',
        severity: 'moderate',
        priorityRank: 0,
        importanceScore: 81,
        targetContext: targetRole,
        reasoning: `Role expects hands-on production deployment experience (Kubernetes, Helm, Cloud CI/CD). Your current verified credentials do not yet include a production deployment verification audit.`,
        currentEvidence: ['Docker containerization proficient; Kubernetes unverified'],
        remediationAction: `Deploy a sample containerized service on a managed cluster or verify CKAD credential in candidate portal.`,
        provenance: {
          level: 'SYSTEM_DERIVED',
          source: 'AURA 6-Taxonomy Gap Intelligence Engine',
          confidenceScore: 91,
          lastVerifiedAt: new Date().toISOString().split('T')[0],
          auditHash: '0xgap_unmet_cloud',
        },
      });
    }

    // Sort by importanceScore descending and assign rank
    gaps.sort((a, b) => b.importanceScore - a.importanceScore);
    gaps.forEach((g, idx) => {
      g.priorityRank = idx + 1;
    });

    return gaps;
  }

  /**
   * Generates tailored Adaptive Preparation guidance derived from identified gaps and role context.
   * Matches prompt: "Because this role expects [X] and your current evidence is limited there, expect questions around [X]..."
   */
  public static generateAdaptivePrepBriefing(
    targetRole: string,
    gaps: PrioritizedCandidateGap[]
  ): string {
    const topGap = gaps.find(g => g.gapType === 'no_evidence' || g.gapType === 'unmet_requirement') || gaps[0];
    if (!topGap) {
      return `Target role ${targetRole} shows strong comprehensive alignment. Focus on polishing high-concurrency architecture defenses and STAR leadership narratives.`;
    }

    const gapName = topGap.title.replace(/^.*:\s*/, '');
    return `Because this role expects ${gapName} and your current evidence is limited or in-progress there, expect targeted technical screen questions around ${gapName}, failure domains, infrastructure resiliency, and practical production trade-offs.`;
  }

  private static formatSkillTitle(skillId: string): string {
    return skillId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private static calculateExperienceYears(state: CanonicalCandidateState): number {
    if (!state.experience || state.experience.length === 0) return 3;
    let totalYears = 0;
    state.experience.forEach(exp => {
      const startYear = parseInt(exp.period.start.split('-')[0]) || 2023;
      const endYear = exp.period.end === 'Present' ? 2026 : (parseInt(exp.period.end.split('-')[0]) || 2024);
      totalYears += Math.max(1, endYear - startYear);
    });
    return Math.max(totalYears, 3);
  }
}
