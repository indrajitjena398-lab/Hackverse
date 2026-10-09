/**
 * PlacementDispatchStore.ts
 * 
 * 3-Tier Enterprise Placement & Institutional Skill-Gap Engine:
 * 1. Company Level: Evaluates and dispatches matched candidate cohort to the Institution.
 * 2. Institution Level: Reviews match, identifies individual student skill gaps, and issues official notices.
 * 3. Student Level: Student receives official institutional notice detailing the specific role & missing stack requirements.
 */

import { 
  CompanyRoleDispatch, 
  InstitutionalStudentNotice, 
  CompanyDispatchedStudent 
} from '../types/placementDispatch';
import { eventBus } from './EventBus';
import { createServerSupabaseClient } from '../supabase/server';

const STORAGE_DISPATCHES_KEY = 'aura_company_dispatches';
const STORAGE_NOTICES_KEY = 'aura_institutional_notices';

export const INITIAL_COMPANY_DISPATCHES: CompanyRoleDispatch[] = [
  {
    id: 'disp-google-sde-01',
    companyName: 'Google',
    roleTitle: 'Software Development Engineer II (Distributed Systems)',
    packageCtc: '44.5 LPA',
    institutionName: 'Parala Maharaja Engineering College (PMEC)',
    requiredSkills: ['C++', 'Distributed Consensus (Raft)', 'Low-Latency I/O', 'System Design', 'PostgreSQL'],
    matchedStudents: [
      {
        studentId: 'stud-pmec-01',
        studentName: 'Soumya Ranjan Mohapatra',
        studentEmail: 'soumya.r@alumni.pmec.ac.in',
        cgpa: '9.12',
        department: 'Computer Science & Engineering',
        matchScore: 94,
        acquiredSkills: ['C++', 'Distributed Consensus (Raft)', 'Low-Latency I/O', 'PostgreSQL'],
        missingSkills: [],
        status: 'NOTIFIED_STUDENT'
      },
      {
        studentId: 'stud-pmec-02',
        studentName: 'Indrajit Jena',
        studentEmail: 'indrajitjena308@gmail.com',
        cgpa: '8.85',
        department: 'Electrical / CSE',
        matchScore: 84,
        acquiredSkills: ['C', 'C++', 'System Design', 'PostgreSQL', 'FastAPI'],
        missingSkills: ['Distributed Consensus (Raft/Paxos)', 'Low-Latency Linux I/O Group Commit'],
        status: 'PENDING_INSTITUTION_REVIEW'
      },
      {
        studentId: 'stud-pmec-03',
        studentName: 'Priyanka Priyadarshini Nayak',
        studentEmail: 'priyanka.nayak@alumni.pmec.ac.in',
        cgpa: '9.04',
        department: 'Computer Science & Engineering',
        matchScore: 86,
        acquiredSkills: ['C++', 'System Design', 'PostgreSQL', 'Cloud Infrastructure'],
        missingSkills: ['Distributed Consensus (Raft)'],
        status: 'NOTIFIED_STUDENT'
      }
    ],
    dispatchedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: 'Google Cloud Distributed Systems team shortlisted PMEC candidates for the upcoming campus technical screening.',
    status: 'ACTIVE'
  },
  {
    id: 'disp-qualcomm-embedded-02',
    companyName: 'Qualcomm',
    roleTitle: 'Embedded Firmware & RTOS Systems Engineer',
    packageCtc: '26.0 LPA',
    institutionName: 'Parala Maharaja Engineering College (PMEC)',
    requiredSkills: ['C', 'C++', 'FreeRTOS / RTOS', 'ARM Cortex-M', 'Device Drivers', 'CAN-Bus / SPI / I2C'],
    matchedStudents: [
      {
        studentId: 'stud-pmec-02',
        studentName: 'Indrajit Jena',
        studentEmail: 'indrajitjena308@gmail.com',
        cgpa: '8.85',
        department: 'Electrical / CSE',
        matchScore: 82,
        acquiredSkills: ['C', 'C++', 'ESP32', 'ARM Cortex-M', 'SPI / I2C'],
        missingSkills: ['FreeRTOS Priority Inversion', 'Embedded Linux Device Drivers'],
        status: 'PENDING_INSTITUTION_REVIEW'
      },
      {
        studentId: 'stud-pmec-04',
        studentName: 'Subhasmita Sahoo',
        studentEmail: 'subhasmita.s@alumni.pmec.ac.in',
        cgpa: '8.76',
        department: 'Electronics & Telecommunication',
        matchScore: 92,
        acquiredSkills: ['C', 'FreeRTOS', 'ARM Cortex-M', 'Device Drivers', 'SPI / I2C'],
        missingSkills: [],
        status: 'NOTIFIED_STUDENT'
      }
    ],
    dispatchedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    notes: 'Qualcomm Wireless R&D division requesting campus talent pool for Automotive & IoT modems.',
    status: 'ACTIVE'
  }
];

export const INITIAL_INSTITUTIONAL_NOTICES: InstitutionalStudentNotice[] = [
  {
    id: 'notif-pmec-indrajit-01',
    dispatchId: 'disp-google-sde-01',
    studentEmail: 'indrajitjena308@gmail.com',
    studentName: 'Indrajit Jena',
    companyName: 'Google',
    roleTitle: 'Software Development Engineer II (Distributed Systems)',
    packageCtc: '44.5 LPA',
    matchScore: 84,
    acquiredSkills: ['C', 'C++', 'System Design', 'PostgreSQL', 'FastAPI'],
    missingSkills: ['Distributed Consensus (Raft/Paxos)', 'Low-Latency Linux I/O Group Commit'],
    institutionalAdvisory: 'PMEC Placement Cell has matched your profile for the Google Distributed Systems campus hiring drive. Your foundation in C and systems is strong (84% fit), but Google strictly requires mastery of Raft leader election and disk fsync minimization. Complete the FreeRTOS/Consensus module to reach the 92% interview threshold.',
    recommendedRoadmapAction: 'Open Skill Roadmap & complete Distributed Systems Milestones (Stage 3).',
    targetRoleId: 'full-stack-engineer',
    priorityLevel: 'URGENT',
    status: 'UNREAD',
    sentByOfficerName: 'Dr. Debabrata Roy (Head of Training & Placement, PMEC)',
    sentAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export class PlacementDispatchStore {
  private static instance: PlacementDispatchStore;
  private dispatches: CompanyRoleDispatch[] = [];
  private notices: InstitutionalStudentNotice[] = [];

  private constructor() {
    this.load();
  }

  public static getInstance(): PlacementDispatchStore {
    if (!PlacementDispatchStore.instance) {
      PlacementDispatchStore.instance = new PlacementDispatchStore();
    }
    return PlacementDispatchStore.instance;
  }

  private load() {
    this.dispatches = [...INITIAL_COMPANY_DISPATCHES];
    this.notices = [...INITIAL_INSTITUTIONAL_NOTICES];

    if (typeof window === 'undefined') return;

    try {
      const storedDispatches = localStorage.getItem(STORAGE_DISPATCHES_KEY);
      if (storedDispatches) {
        const parsed = JSON.parse(storedDispatches);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.dispatches = parsed;
        }
      }

      const storedNotices = localStorage.getItem(STORAGE_NOTICES_KEY);
      if (storedNotices) {
        const parsed = JSON.parse(storedNotices);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notices = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load placement dispatches from storage:', e);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_DISPATCHES_KEY, JSON.stringify(this.dispatches));
      localStorage.setItem(STORAGE_NOTICES_KEY, JSON.stringify(this.notices));
    } catch (e) {
      console.warn('Failed to persist placement dispatches:', e);
    }
  }

  // --- Tier 1: Company Methods ---
  public getAllDispatches(): CompanyRoleDispatch[] {
    return this.dispatches;
  }

  public createCompanyDispatch(dispatchData: Omit<CompanyRoleDispatch, 'id' | 'dispatchedAt' | 'status'>): CompanyRoleDispatch {
    const newDispatch: CompanyRoleDispatch = {
      ...dispatchData,
      id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dispatchedAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    this.dispatches.unshift(newDispatch);
    this.persist();

    eventBus.publish({
      type: 'COMPANY_MATCH_DISPATCHED',
      payload: {
        dispatchId: newDispatch.id,
        companyName: newDispatch.companyName,
        roleTitle: newDispatch.roleTitle,
        studentsCount: newDispatch.matchedStudents.length
      }
    } as any);

    return newDispatch;
  }

  public createDispatch(dispatchData: Omit<CompanyRoleDispatch, 'id' | 'dispatchedAt' | 'status'>): CompanyRoleDispatch {
    return this.createCompanyDispatch(dispatchData);
  }

  // --- Tier 2: Institutional Placement Cell Methods ---
  public getAllNotices(): InstitutionalStudentNotice[] {
    return this.notices;
  }

  public sendNoticeToStudent(
    dispatchId: string,
    studentEmail: string,
    studentName: string,
    customAdvisory?: string,
    priority: 'URGENT' | 'HIGH' | 'RECOMMENDED' = 'HIGH'
  ): InstitutionalStudentNotice | null {
    return this.sendInstitutionalNotice(dispatchId, studentEmail, studentName, customAdvisory, priority);
  }

  public sendInstitutionalNotice(
    dispatchId: string,
    studentEmail: string,
    studentName: string,
    customAdvisory?: string,
    priority: 'URGENT' | 'HIGH' | 'RECOMMENDED' = 'HIGH'
  ): InstitutionalStudentNotice | null {
    const dispatch = this.dispatches.find(d => d.id === dispatchId);
    if (!dispatch) return null;

    const matchedStudent = dispatch.matchedStudents.find(
      s => s.studentEmail.toLowerCase() === studentEmail.toLowerCase()
    );

    if (!matchedStudent) return null;

    // Mark student as notified in the company dispatch
    matchedStudent.status = 'NOTIFIED_STUDENT';

    const advisory = customAdvisory || 
      `PMEC Placement Cell has officially reviewed your match for ${dispatch.companyName} (${dispatch.roleTitle}). Your current match is ${matchedStudent.matchScore}%. Our diagnostic shows critical skill gaps in: ${matchedStudent.missingSkills.join(', ')}. Please bridge these stack gaps before the technical interview screening.`;

    const newNotice: InstitutionalStudentNotice = {
      id: `notif-pmec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dispatchId,
      studentEmail: studentEmail.toLowerCase().trim(),
      studentName: studentName || matchedStudent.studentName,
      companyName: dispatch.companyName,
      roleTitle: dispatch.roleTitle,
      packageCtc: dispatch.packageCtc,
      matchScore: matchedStudent.matchScore,
      acquiredSkills: matchedStudent.acquiredSkills,
      missingSkills: matchedStudent.missingSkills,
      institutionalAdvisory: advisory,
      recommendedRoadmapAction: `Bridge identified stack gaps: ${matchedStudent.missingSkills.join(', ')}`,
      priorityLevel: priority,
      status: 'UNREAD',
      sentByOfficerName: 'Dr. Debabrata Roy (Head of Training & Placement, PMEC)',
      sentAt: new Date().toISOString()
    };

    // Prepend notice
    this.notices.unshift(newNotice);
    this.persist();

    eventBus.publish({
      type: 'INSTITUTION_SKILL_GAP_NOTIFIED',
      payload: {
        noticeId: newNotice.id,
        studentEmail: newNotice.studentEmail,
        companyName: newNotice.companyName,
        roleTitle: newNotice.roleTitle,
        missingSkills: newNotice.missingSkills
      }
    } as any);

    return newNotice;
  }

  // --- Tier 3: Student Methods ---
  public getNoticesForStudent(studentEmail: string): InstitutionalStudentNotice[] {
    const normalized = (studentEmail || '').toLowerCase().trim();
    // Return notices matching student email or all notices for demo
    return this.notices.filter(n => 
      !normalized || 
      n.studentEmail.toLowerCase().includes(normalized) || 
      normalized.includes(n.studentEmail.toLowerCase()) ||
      n.studentEmail === 'indrajitjena308@gmail.com'
    );
  }

  public acknowledgeNotice(noticeId: string): boolean {
    const notice = this.notices.find(n => n.id === noticeId);
    if (notice) {
      notice.status = 'ACKNOWLEDGED';
      this.persist();

      eventBus.publish({
        type: 'PLACEMENT_NOTICE_ACKNOWLEDGED',
        payload: { noticeId, studentEmail: notice.studentEmail }
      } as any);
      return true;
    }
    return false;
  }
}

export const placementDispatchStore = PlacementDispatchStore.getInstance();
