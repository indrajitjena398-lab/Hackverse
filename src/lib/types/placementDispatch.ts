/**
 * Types for 3-Tier Placement Dispatch & Institutional Skill-Gap Diagnostic Flow:
 * Company Dispatches Matched Students -> Institution Reviews & Diagnoses Gaps -> Student Receives Official Notice & Action Plan
 */

export interface CompanyDispatchedStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  cgpa: string;
  department: string;
  matchScore: number;
  acquiredSkills: string[];
  missingSkills: string[];
  status: 'PENDING_INSTITUTION_REVIEW' | 'NOTIFIED_STUDENT' | 'INTERVIEW_SCHEDULED';
}

export interface CompanyRoleDispatch {
  id: string;
  companyName: string;
  companyLogo?: string;
  roleTitle: string;
  packageCtc: string;
  institutionName: string;
  requiredSkills: string[];
  matchedStudents: CompanyDispatchedStudent[];
  dispatchedAt: string;
  notes?: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface InstitutionalStudentNotice {
  id: string;
  dispatchId: string;
  studentEmail: string;
  studentName: string;
  companyName: string;
  roleTitle: string;
  packageCtc: string;
  matchScore: number;
  acquiredSkills: string[];
  missingSkills: string[];
  institutionalAdvisory: string;
  recommendedRoadmapAction: string;
  targetRoleId?: string;
  priorityLevel: 'URGENT' | 'HIGH' | 'RECOMMENDED';
  status: 'UNREAD' | 'ACKNOWLEDGED' | 'RESOLVING_GAPS';
  sentByOfficerName: string;
  sentAt: string;
}
