import { 
  DigitalTwinSimulationParams, 
  DigitalTwinProjection, 
  SkillImpactSimulationResult, 
  CareerRecommendationPriority 
} from '../types/digitalTwin';
import { eventBus } from './EventBus';

export class CareerDigitalTwinEngine {
  /**
   * Simulates future career state based on candidate effort parameters
   */
  public runSimulation(params: DigitalTwinSimulationParams): DigitalTwinProjection {
    const baseReadiness = 67;
    const baseSystemDesign = 51;
    const baseJobsCount = 6;

    // Calculate simulated gains
    const hoursFactor = Math.min(18, Math.round(params.hoursDedicatedToDistributedSystems * 0.45));
    const interviewFactor = Math.min(12, params.mockInterviewsToComplete * 3.5);
    const skillsFactor = Math.min(15, params.skillsToAcquire.length * 4);

    const projectedReadiness = Math.min(96, Math.round(baseReadiness + hoursFactor + interviewFactor + skillsFactor * 0.5));
    const projectedSystemDesign = Math.min(94, Math.round(baseSystemDesign + (hoursFactor * 1.1) + (interviewFactor * 0.8)));
    const projectedRoleMatches = Math.min(14, baseJobsCount + Math.floor((projectedReadiness - baseReadiness) / 4) + params.skillsToAcquire.length);

    const result: DigitalTwinProjection = {
      currentReadiness: baseReadiness,
      projectedReadiness,
      currentRoleMatchesCount: baseJobsCount,
      projectedRoleMatchesCount: projectedRoleMatches,
      currentSystemDesignScore: baseSystemDesign,
      projectedSystemDesignScore: projectedSystemDesign,
      projectedReadinessBreakdown: {
        technical: Math.min(95, 72 + Math.round(hoursFactor * 0.6)),
        system_design: projectedSystemDesign,
        coding: Math.min(92, 76 + Math.round(interviewFactor * 0.4)),
        communication: Math.min(94, 81 + Math.round(interviewFactor * 0.7)),
        behavioral: Math.min(90, 69 + Math.round(interviewFactor * 0.5)),
      },
      simulatedSkillsUnlocked: [
        'caching_redis (Level 4: Mastered)',
        'distributed_consensus (Unlocked & Proficient)',
        'system_design (Level 4: Advanced)',
        ...params.skillsToAcquire.map(s => `${s} (Targeted)`),
      ],
      timelineWeeksToTarget: Math.max(2, Math.round((25 - (hoursFactor + interviewFactor)) / 3)),
    };

    eventBus.publish({
      event_type: 'CAREER_SIMULATION_EXECUTED',
      sourceModule: 'Career Digital Twin Engine',
      payload: { params, result },
      recalculatedModules: ['Candidate Digital Twin', 'What-If Simulation'],
    });

    return result;
  }

  /**
   * Evaluates expected impact of learning individual skills to guide candidate ROI
   */
  public getSkillImpactRankings(): SkillImpactSimulationResult[] {
    return [
      {
        skillId: 'system_design',
        skillName: 'System Design & High Availability',
        roleCoverageGainPercent: 17,
        readinessGainPercent: 11,
        targetJobsUnlockedCount: 5,
        estimatedEffortHours: 40,
        priorityRank: 1,
      },
      {
        skillId: 'message_queues',
        skillName: 'Event Streaming (Apache Kafka / RabbitMQ)',
        roleCoverageGainPercent: 9,
        readinessGainPercent: 6,
        targetJobsUnlockedCount: 3,
        estimatedEffortHours: 25,
        priorityRank: 2,
      },
      {
        skillId: 'kubernetes',
        skillName: 'Kubernetes & Service Mesh Architecture',
        roleCoverageGainPercent: 8,
        readinessGainPercent: 5,
        targetJobsUnlockedCount: 3,
        estimatedEffortHours: 30,
        priorityRank: 3,
      },
      {
        skillId: 'caching_redis',
        skillName: 'Distributed Cache Invalidation (Redis)',
        roleCoverageGainPercent: 7,
        readinessGainPercent: 4,
        targetJobsUnlockedCount: 2,
        estimatedEffortHours: 15,
        priorityRank: 4,
      },
      {
        skillId: 'distributed_consensus',
        skillName: 'Distributed Consensus Protocols (Raft / Paxos)',
        roleCoverageGainPercent: 6,
        readinessGainPercent: 5,
        targetJobsUnlockedCount: 2,
        estimatedEffortHours: 35,
        priorityRank: 5,
      },
    ];
  }

  /**
   * Returns prioritized "What should I do today?" daily actions
   */
  public getDailyPriorities(): CareerRecommendationPriority[] {
    return [
      {
        id: 'rec-001',
        priorityRank: 1,
        title: 'Complete Redis Distributed Caching Module',
        description: 'Prerequisite for 7 target roles. Closing this gap lifts overall readiness by +3% and satisfies Stripe job requirement.',
        category: 'learning',
        expectedReadinessGainPercent: 3,
        relatedSkillOrCompany: 'Redis / Distributed Caching',
        urgencyLevel: 'immediate',
        actionHref: '/skill-graph',
      },
      {
        id: 'rec-002',
        priorityRank: 2,
        title: 'Practice System Design Mock Interview (CAP Theorem & Sharding)',
        description: 'Information gain analysis indicates highest posterior uncertainty in distributed consensus (confidence 0.62).',
        category: 'interview',
        expectedReadinessGainPercent: 4,
        relatedSkillOrCompany: 'System Design Interviewer',
        urgencyLevel: 'high',
        actionHref: '/mock-interview',
      },
      {
        id: 'rec-003',
        priorityRank: 3,
        title: 'Apply to Stripe (Senior Distributed Systems Engineer)',
        description: 'Match score calculated at 84% (Safe Fit). High semantic alignment (+24) and seniority match (+10).',
        category: 'application',
        expectedReadinessGainPercent: 0,
        expectedMatchProbabilityPercent: 84,
        relatedSkillOrCompany: 'Stripe',
        urgencyLevel: 'high',
        actionHref: '/jobs',
      },
      {
        id: 'rec-004',
        priorityRank: 4,
        title: 'Follow Up with Recruiter: Databricks Application',
        description: 'Application idle for 9 days. Historical response decay models indicate response likelihood falls 35% after day 10.',
        category: 'follow_up',
        expectedReadinessGainPercent: 1,
        relatedSkillOrCompany: 'Databricks',
        urgencyLevel: 'medium',
        actionHref: '/tracker',
      },
    ];
  }
}

export const careerDigitalTwinEngine = new CareerDigitalTwinEngine();
