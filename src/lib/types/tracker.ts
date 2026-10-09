import { ProvenanceMetadata } from './provenance';

export type ApplicationStage = 
  | 'wishlist' 
  | 'applied' 
  | 'in_review' 
  | 'interviewing' 
  | 'offer' 
  | 'rejected';

export interface ApplicationCard {
  id: string;
  jobId: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  appliedDate: string;
  lastActivityDate: string;
  daysSinceLastActivity: number;
  salaryText?: string;
  notes?: string;
  needsFollowUpWarning: boolean;
  upcomingInterviewDate?: string;
  provenance: ProvenanceMetadata;
}

export interface GeneratedFollowUpDraft {
  recipient: string;
  subject: string;
  body: string;
  tone: 'professional_polite' | 'inquisitive' | 'enthusiastic';
  suggestedAction: string;
  daysStale: number;
}

export interface ParsedEmailInterviewInvite {
  rawEmailSnippet: string;
  parsedCompany: string;
  parsedRole: string;
  parsedInterviewDate: string;
  parsedInterviewTime: string;
  parsedInterviewerNames: string[];
  parsedMeetingLink: string;
  confidenceScore: number;
}
