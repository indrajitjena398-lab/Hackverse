/**
 * Real Placement Video Interview Archive & Speech Debrief Types
 * Production Data Model for Verified Institutional / Company Video Interviews
 */

export interface InterviewTranscriptSegment {
  speaker: string;
  role: 'Interviewer' | 'Candidate';
  time: string;
  timestampSeconds: number;
  text: string;
  competencyTagged?: string;
  highlight?: boolean;
}

export interface PlacementAnswerHighlight {
  question: string;
  timestamp: string;
  takeaway: string;
  whyItStoodOut: string;
}

export interface PlacementSuccessFactors {
  whyTheyGotPlaced: string;
  keyCompetencies: string[];
  breakdownScores: {
    technicalProwess: number;
    systemDesign: number;
    communication: number;
    culturalFit: number;
  };
  answerHighlights: PlacementAnswerHighlight[];
  alumniAdvice: string;
}

export interface PlacementVideoInterview {
  id: string;
  candidateName: string;
  candidateEmail?: string;
  candidateAvatar?: string;
  institutionName: string;
  department?: string;
  cgpa?: string;
  companyName: string;
  companyLogo?: string;
  roleTitle: string;
  packageCtc: string;
  placementYear: number;
  videoUrl?: string;
  isUserRecorded?: boolean;
  thumbnailUrl?: string;
  durationSeconds: number;
  transcript: InterviewTranscriptSegment[];
  placementSuccessFactors: PlacementSuccessFactors;
  interviewerNotes: string;
  viewsCount: number;
  helpfulCount: number;
  createdAt: string;
}
