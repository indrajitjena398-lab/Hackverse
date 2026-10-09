import { 
  PolicyRule, 
  ProposedMutation, 
  PolicyEvaluationResult, 
  PolicyDecision, 
  HitlTask 
} from '../types/policy';
import { eventBus } from './EventBus';

export const DEFAULT_POLICY_RULES: PolicyRule[] = [
  {
    id: 'POL-001',
    name: 'Confidence Threshold Guardrail',
    description: 'Requires human review if AI confidence score is below 0.80 for skill or profile changes.',
    condition: 'AI confidence < 0.80',
    impactLevel: 'MEDIUM',
    actionOnTrigger: 'REQUIRES_HITL',
    enabled: true,
  },
  {
    id: 'POL-002',
    name: 'Zero Unilateral Resume Edit Guardrail',
    description: 'Strict prohibition against automated overwrite of candidate resume text without candidate approval.',
    condition: 'targetEntity === "resume_bullet"',
    impactLevel: 'CRITICAL',
    actionOnTrigger: 'REQUIRES_HITL',
    enabled: true,
  },
  {
    id: 'POL-003',
    name: 'High-Impact Model Inferred Mutation Barrier',
    description: 'Prohibits automatic mutations when source is MODEL_INFERRED and impact is HIGH or CRITICAL.',
    condition: 'source === "MODEL_INFERRED" && impactLevel >= HIGH',
    impactLevel: 'HIGH',
    actionOnTrigger: 'BLOCKED_BY_GUARDRAIL',
    enabled: true,
  },
  {
    id: 'POL-004',
    name: 'EWEIS Urgent Placement Anomaly Escalation',
    description: 'Automatically creates advisor intervention task if student risk exceeds 70 with less than 90 days remaining.',
    condition: 'studentRisk > 70 && daysRemaining <= 90',
    impactLevel: 'HIGH',
    actionOnTrigger: 'APPROVED',
    enabled: true,
  },
];

export class PolicyEngineService {
  private rules: PolicyRule[] = [...DEFAULT_POLICY_RULES];
  private hitlTasks: HitlTask[] = [
    {
      id: 'hitl-001',
      title: 'Resume Bullet Optimization Approval',
      description: 'AI proposed adding quantified metrics for Redis distributed caching.',
      entityType: 'resume_bullet',
      entityId: 'exp-str-b2',
      proposedData: {
        suggestedBullet: 'Engineered distributed caching layer in Redis with cache-aside pattern, reducing P99 latency by 42% across 12M daily requests.',
        targetedSkill: 'caching_redis',
      },
      currentData: {
        originalBullet: 'Worked on caching using Redis for backend service requests.',
      },
      agentName: 'Resume Optimization Agent',
      confidenceScore: 0.94,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      auditHash: '0xhitl_88291a0c',
    },
    {
      id: 'hitl-002',
      title: 'Skill Level Promotion Verification',
      description: 'Candidate completed mock interview for System Design (CAP Theorem). Proposed upgrade from Level 2 to Level 3.',
      entityType: 'skill_level',
      entityId: 'system_design',
      proposedData: { newLevel: 3, newConfidence: 0.76 },
      currentData: { currentLevel: 2, currentConfidence: 0.58 },
      agentName: 'Interview Intelligence Agent',
      confidenceScore: 0.79, // Less than 0.80 -> triggers POL-001
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      auditHash: '0xhitl_99341b12',
    },
  ];

  public getRules(): PolicyRule[] {
    return [...this.rules];
  }

  public getPendingHitlTasks(): HitlTask[] {
    return this.hitlTasks.filter(t => t.status === 'PENDING');
  }

  public getAllHitlTasks(): HitlTask[] {
    return [...this.hitlTasks];
  }

  public toggleRule(ruleId: string): void {
    const r = this.rules.find(x => x.id === ruleId);
    if (r) r.enabled = !r.enabled;
  }

  /**
   * Evaluates a proposed mutation against all active policy rules
   */
  public evaluateProposal(mutation: ProposedMutation): PolicyEvaluationResult {
    const triggeredRules: PolicyRule[] = [];
    let decision: PolicyDecision = 'APPROVED';
    let reasoning = 'All governance guardrails passed. Mutation authorized.';

    for (const rule of this.rules.filter(r => r.enabled)) {
      // Check Rule 2: Zero Unilateral Resume Edits
      if (rule.id === 'POL-002' && mutation.targetEntity === 'resume_bullet') {
        triggeredRules.push(rule);
        decision = 'REQUIRES_HITL';
        reasoning = 'Rule POL-002: Resume bullets cannot be modified without human-in-the-loop candidate sign-off.';
        break;
      }

      // Check Rule 1: Confidence < 0.80
      const confidence = mutation.sourceProvenance.confidenceScore ?? 1.0;
      const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;
      if (rule.id === 'POL-001' && normalizedConfidence < 0.80) {
        triggeredRules.push(rule);
        decision = 'REQUIRES_HITL';
        reasoning = `Rule POL-001: AI confidence (${(normalizedConfidence * 100).toFixed(0)}%) is below mandatory 80% autonomous threshold.`;
        break;
      }

      // Check Rule 3: High impact + MODEL_INFERRED
      if (
        rule.id === 'POL-003' &&
        (mutation.sourceProvenance.level === 'MODEL_INFERRED' || mutation.sourceProvenance.level === 'inferred') &&
        (mutation.impactLevel === 'HIGH' || mutation.impactLevel === 'CRITICAL')
      ) {
        triggeredRules.push(rule);
        decision = 'BLOCKED_BY_GUARDRAIL';
        reasoning = 'Rule POL-003: Model inferred claims cannot trigger high/critical mutations automatically.';
        break;
      }
    }

    let hitlTaskId: string | undefined = undefined;
    if (decision === 'REQUIRES_HITL') {
      hitlTaskId = `hitl-${Date.now()}`;
      this.hitlTasks.unshift({
        id: hitlTaskId,
        title: `Authorize Mutation: ${mutation.targetEntity.replace('_', ' ')}`,
        description: reasoning,
        entityType: mutation.targetEntity,
        entityId: mutation.targetEntityId,
        proposedData: mutation.proposedChanges,
        currentData: {},
        agentName: mutation.proposedByAgent || mutation.sourceModule,
        confidenceScore: mutation.sourceProvenance.confidenceScore ?? 85,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        auditHash: `0xhitl_${Math.random().toString(16).substring(2, 10)}`,
      });

      eventBus.publish({
        event_type: 'HITL_TASK_CREATED',
        sourceModule: 'Policy & Guardrails Engine',
        payload: { hitlTaskId, mutationId: mutation.id, decision },
        recalculatedModules: ['Policy Engine', 'Candidate Intelligence Engine'],
      });
    }

    const result: PolicyEvaluationResult = {
      mutationId: mutation.id,
      decision,
      triggeredRules,
      reasoning,
      requiresHitlTask: decision === 'REQUIRES_HITL',
      hitlTaskId,
      evaluatedAt: new Date().toISOString(),
      enforcedBy: 'AURA Policy Engine v2.0 (Deterministic)',
    };

    eventBus.publish({
      event_type: 'POLICY_EVALUATED',
      sourceModule: 'Policy & Guardrails Engine',
      payload: result,
      recalculatedModules: ['Policy Audit Trail'],
    });

    return result;
  }

  public resolveHitlTask(taskId: string, decision: 'APPROVED' | 'REJECTED' | 'MODIFIED', resolvedBy: string = 'Alex Chen'): HitlTask | null {
    const task = this.hitlTasks.find(t => t.id === taskId);
    if (!task) return null;

    task.status = decision;
    task.resolvedAt = new Date().toISOString();
    task.resolvedBy = resolvedBy;

    eventBus.publish({
      event_type: 'HITL_TASK_RESOLVED',
      sourceModule: 'HITL Workflow Service',
      payload: { taskId, decision, resolvedBy },
      recalculatedModules: ['Candidate Profile', 'Resume AST', 'Skill Graph', 'Readiness Engine'],
    });

    return task;
  }
}

export const policyEngine = new PolicyEngineService();
