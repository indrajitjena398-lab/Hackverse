import { ProvenanceMetadata } from './provenance';

export type CATDifficultyLevel = 1 | 2 | 3 | 4;

export interface STAREvaluation {
  situationScore: number; // 0-100
  taskScore: number;      // 0-100
  actionScore: number;    // 0-100
  resultScore: number;    // 0-100
  feedback: string;
}

export interface SpeechSignalMetrics {
  wordsPerMinute: number;
  pacingEvaluation: 'too_slow' | 'ideal' | 'too_fast';
  fillerWordCount: number;
  fillerWordDensityPercent: number; // e.g. 1.8%
  detectedFillerWords: { word: string; count: number }[];
  clarityScore: number;
}

export interface InterviewTurn {
  id: string;
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  difficultyLevel?: CATDifficultyLevel;
  testedSkillId?: string;
  turnEvaluation?: {
    technicalCorrectness: number; // 0-100
    starAdherence: STAREvaluation;
    speechMetrics: SpeechSignalMetrics;
    aiCritique: string;
    catAdaptiveAction: 'increased_depth' | 'maintained_level' | 'provided_scaffolding';
  };
}

export interface MockInterviewSession {
  id: string;
  roleTarget: string;
  companyTarget?: string;
  targetSkillIds: string[];
  currentDifficulty: CATDifficultyLevel;
  turns: InterviewTurn[];
  status: 'configuring' | 'in_progress' | 'completed';
  overallScore?: {
    technicalScore: number;
    starAdherenceScore: number;
    communicationScore: number;
    pacingScore: number;
    strengthsIdentified: string[];
    criticalGapsDiscovered: string[];
    updatedSkillMasteries: { skillId: string; newScore: number }[];
  };
  provenance: ProvenanceMetadata;
}
