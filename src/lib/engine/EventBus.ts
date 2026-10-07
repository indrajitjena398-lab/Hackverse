export type EngineEventType =
  | 'MOCK_INTERVIEW_COMPLETED'
  | 'SKILL_ASSESSMENT_UPDATED'
  | 'RESUME_BULLET_ACCEPTED'
  | 'ROADMAP_MILESTONE_COMPLETED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'EWEIS_INTERVENTION_DEPLOYED'
  | 'RESUME_UPLOADED_AND_PARSED'
  | 'CANDIDATE_PROFILE_RESET';

export interface EngineEvent<T = any> {
  id: string;
  type: EngineEventType;
  timestamp: string;
  sourceModule: string;
  payload: T;
  recalculatedModules: string[];
}

type EventListener<T = any> = (event: EngineEvent<T>) => void;

class EventBusService {
  private listeners: Map<EngineEventType, Set<EventListener>> = new Map();
  private history: EngineEvent[] = [];

  public subscribe<T = any>(type: EngineEventType, callback: EventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback as EventListener);

    return () => {
      this.listeners.get(type)?.delete(callback as EventListener);
    };
  }

  public publish<T = any>(event: Omit<EngineEvent<T>, 'id' | 'timestamp'>): EngineEvent<T> {
    const fullEvent: EngineEvent<T> = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    this.history.unshift(fullEvent);
    if (this.history.length > 50) {
      this.history.pop();
    }

    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(fullEvent);
        } catch (err) {
          console.error(`Error in event listener for ${event.type}:`, err);
        }
      });
    }

    return fullEvent;
  }

  public getRecentEvents(): EngineEvent[] {
    return [...this.history];
  }
}

export const eventBus = new EventBusService();
