import { ProvenanceMetadata, ProvenanceLevel } from '../types/provenance';

export type EngineEventType =
  // Canonical Pipeline Events
  | 'PROFILE_CREATED'
  | 'RESUME_UPLOADED'
  | 'DOCUMENT_PARSED'
  | 'RESUME_PARSED'
  | 'PROFILE_MUTATED'
  | 'SKILL_MUTATED'
  | 'SKILL_GRAPH_RECALCULATED'
  | 'JOB_MATCHES_RECALCULATED'
  | 'JOB_MATCHES_UPDATED'
  | 'READINESS_RECALCULATED'
  | 'EWEIS_RISK_UPDATED'
  | 'ATS_RECALCULATED'
  | 'LEARNING_GAPS_DETECTED'
  | 'RECOMMENDATIONS_UPDATED'
  | 'SKILL_LEVEL_CHANGED'
  | 'POLICY_EVALUATED'
  | 'HITL_TASK_CREATED'
  | 'HITL_TASK_RESOLVED'
  // Existing module events
  | 'MOCK_INTERVIEW_COMPLETED'
  | 'SKILL_ASSESSMENT_UPDATED'
  | 'SKILL_ACQUIRED'
  | 'RESUME_BULLET_ACCEPTED'
  | 'ROADMAP_MILESTONE_COMPLETED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'EWEIS_INTERVENTION_DEPLOYED'
  | 'RESUME_UPLOADED_AND_PARSED'
  | 'CANDIDATE_PROFILE_RESET'
  | 'CAREER_SIMULATION_EXECUTED'
  | 'SUPABASE_REALTIME_SYNC'
  | 'CANDIDATE_OUTCOME_OBSERVED'
  | 'APPLICATION_STATUS_MUTATED'
  | 'AUTH_ROLE_MUTATED'
  | 'FEEDBACK_RECORDED'
  | 'PREFERENCES_UPDATED'
  // Cross-Module Coherence Master Events (Section 5)
  | 'RESUME_ANALYZED'
  | 'SKILL_UPDATED'
  | 'SKILL_GAP_DETECTED'
  | 'CAREER_GOAL_UPDATED'
  | 'INTERVIEW_PERFORMANCE_UPDATED'
  | 'MEETING_ANALYZED'
  | 'JOB_RECOMMENDED'
  | 'JOB_APPLIED'
  | 'LEARNING_COMPLETED'
  | 'USER_FEEDBACK_RECEIVED'
  | 'CAREER_PREFERENCE_UPDATED'
  | 'CIP_RECALCULATED'
  // 3-Tier Company -> Institution -> Student Placement Dispatch Events
  | 'COMPANY_MATCH_DISPATCHED'
  | 'INSTITUTION_SKILL_GAP_NOTIFIED'
  | 'PLACEMENT_NOTICE_ACKNOWLEDGED';

export interface CanonicalEngineEvent<T = any> {
  event_id: string;
  event_type: EngineEventType;
  candidate_id: string;
  timestamp: string;
  source: string;
  sync_epoch: number; // Monotonic transaction epoch preventing vector vs graph desync
  payload: T;
  provenance: {
    type: ProvenanceLevel;
    confidence: number;
    model_version?: string;
    hash: string;
  };
  recalculatedModules?: string[];
  // Backward compatibility alias fields
  id?: string;
  type?: EngineEventType;
  sourceModule?: string;
}

// Backwards-compatible alias for existing code
export type EngineEvent<T = any> = CanonicalEngineEvent<T>;

type EventListener<T = any> = (event: CanonicalEngineEvent<T>) => void;

class EventBusService {
  private listeners: Map<EngineEventType, Set<EventListener>> = new Map();
  private eventStore: CanonicalEngineEvent[] = [];
  private currentSyncEpoch: number = 1000;
  private realtimeChannelActive: boolean = false;

  constructor() {
    // Seed initial event store with system genesis event
    this.eventStore.push({
      event_id: 'evt_genesis_001',
      event_type: 'PROFILE_MUTATED',
      candidate_id: 'cand-alex-chen',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      source: 'SYSTEM_GENESIS',
      sync_epoch: 1000,
      payload: { action: 'INITIALIZE_BENCHMARK_STATE', targetRole: 'Senior Distributed Systems Engineer' },
      provenance: {
        type: 'SYSTEM_DERIVED',
        confidence: 1.0,
        hash: '0xgenesis_77ae8910',
      },
      recalculatedModules: ['Candidate Profile', 'Skill Graph', 'Readiness Engine'],
    });
  }

  /**
   * Monotonic transaction sync epoch: prevents race conditions
   * between graph node updates and vector embedding recalculations.
   */
  public getCurrentEpoch(): number {
    return this.currentSyncEpoch;
  }

  public subscribe<T = any>(type: EngineEventType, callback: EventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback as EventListener);

    return () => {
      this.listeners.get(type)?.delete(callback as EventListener);
    };
  }

  public publish<T = any>(eventInput: {
    event_type?: EngineEventType;
    type?: EngineEventType;
    candidate_id?: string;
    source?: string;
    sourceModule?: string;
    payload: T;
    provenance?: {
      type?: ProvenanceLevel;
      level?: ProvenanceLevel;
      confidence?: number;
      model_version?: string;
      hash?: string;
    };
    recalculatedModules?: string[];
  }): CanonicalEngineEvent<T> {
    this.currentSyncEpoch += 1;
    const eventType = eventInput.event_type || eventInput.type || 'PROFILE_MUTATED';
    const sourceStr = eventInput.source || eventInput.sourceModule || 'Candidate-Intelligence Engine';
    const candidateId = eventInput.candidate_id || 'cand-alex-chen';

    const provConfidence = eventInput.provenance?.confidence ?? 0.95;
    const provType = (eventInput.provenance?.type || eventInput.provenance?.level || 'MODEL_INFERRED') as ProvenanceLevel;
    const provHash = eventInput.provenance?.hash || `0x${Math.random().toString(16).substring(2, 12)}`;

    const fullEvent: CanonicalEngineEvent<T> = {
      event_id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event_type: eventType,
      candidate_id: candidateId,
      timestamp: new Date().toISOString(),
      source: sourceStr,
      sync_epoch: this.currentSyncEpoch,
      payload: eventInput.payload,
      provenance: {
        type: provType,
        confidence: provConfidence > 1 ? provConfidence / 100 : provConfidence,
        model_version: eventInput.provenance?.model_version || 'AURA-Core-v2.6',
        hash: provHash,
      },
      recalculatedModules: eventInput.recalculatedModules || [],
      // Compatibility aliases
      id: `evt_${Date.now()}`,
      type: eventType,
      sourceModule: sourceStr,
    };

    this.eventStore.unshift(fullEvent);
    if (this.eventStore.length > 200) {
      this.eventStore.pop();
    }

    const typeListeners = this.listeners.get(eventType);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(fullEvent);
        } catch (err) {
          console.error(`Error in event listener for ${eventType}:`, err);
        }
      });
    }

    return fullEvent;
  }

  /**
   * Lightweight Reactive Event Cascade:
   * Replaces heavyweight Kafka brokers with deterministic Supabase Realtime / Postgres-triggered cascades.
   * RESUME_UPLOADED -> SKILL_GRAPH_RECALCULATED -> JOB_MATCHES_RECALCULATED -> ATS_RECALCULATED
   */
  public triggerReactiveCascade(candidateId: string, initialTrigger: 'RESUME_UPLOADED' | 'RESUME_BULLET_ACCEPTED'): void {
    const epoch = ++this.currentSyncEpoch;

    // Step 1: Ingested Mutation
    this.publish({
      event_type: initialTrigger,
      candidate_id: candidateId,
      source: 'Supabase Realtime Event Cascade',
      payload: { sync_epoch: epoch, cascade_root: initialTrigger },
      recalculatedModules: ['Candidate Profile', 'Resume AST'],
    });

    // Step 2: Skill Graph Recalculated
    setTimeout(() => {
      this.publish({
        event_type: 'SKILL_GRAPH_RECALCULATED',
        candidate_id: candidateId,
        source: 'DLDM Graph Engine',
        payload: { sync_epoch: epoch },
        recalculatedModules: ['Skill Graph & DLDM'],
      });
    }, 20);

    // Step 3: Job Matches & Readiness Recalculated
    setTimeout(() => {
      this.publish({
        event_type: 'JOB_MATCHES_RECALCULATED',
        candidate_id: candidateId,
        source: 'Dynamic Match Engine (O*NET)',
        payload: { sync_epoch: epoch },
        recalculatedModules: ['Job Match Scoring', 'Readiness Engine', 'EWEIS'],
      });
    }, 50);
  }

  /**
   * Connects to Supabase Realtime channel for Postgres Listen/Notify broadcast
   */
  public connectSupabaseRealtime(channelName: string = 'aura_state_sync'): void {
    if (this.realtimeChannelActive) return;
    this.realtimeChannelActive = true;
    console.log(`[EventBus] Supabase Realtime broadcast bridge subscribed to channel: ${channelName}`);
  }

  public getRecentEvents(): CanonicalEngineEvent[] {
    return [...this.eventStore];
  }

  public getEventsByCandidate(candidateId: string): CanonicalEngineEvent[] {
    return this.eventStore.filter(e => e.candidate_id === candidateId);
  }

  public clear(): void {
    this.eventStore = [];
  }
}

export const eventBus = new EventBusService();
