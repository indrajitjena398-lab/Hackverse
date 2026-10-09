/**
 * Dynamic Multi-Tenant RBAC & Domain Isolation Store
 * Centralized in-memory & LocalStorage store for user roles, domain registry, and tenant isolation
 * Eliminates static hardcoding and allows Super Admin dynamic management in real time.
 */

import { 
  UserRole, 
  DomainMapping, 
  InstitutionEntity, 
  CompanyEntity, 
  UserProfile, 
  RoleAuditLogEntry,
  SecurityPermissions,
  ROLE_PERMISSIONS
} from '../types/security';
import { eventBus } from '../engine/EventBus';
import { skillScoreCalculator } from '../engine/SkillScoreCalculator';

export interface CandidateSkill {
  name: string;
  proficiency: number; // 1 to 5
  category?: string;
}

export interface CandidateProfileData {
  fullName: string;
  email: string;
  phone: string;
  targetRole?: string;
  collegeName: string;
  degreeTitle: string;
  major: string;
  cgpa: string;
  graduationYear: string;
  tenthScore: string;
  tenthBoard?: string;
  twelfthScore: string;
  twelfthBoard?: string;
  twelfthStream?: string;
  skills: CandidateSkill[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  updatedAt?: string;
}

const STORAGE_KEYS = {
  DOMAINS: 'aura_rbac_domain_mappings',
  INSTITUTIONS: 'aura_rbac_institutions',
  COMPANIES: 'aura_rbac_companies',
  ELEVATIONS: 'aura_rbac_user_elevations',
  AUDIT_LOGS: 'aura_rbac_audit_logs',
  ACTIVE_USER_EMAIL: 'aura_active_email',
  ONBOARDING_STATUS: 'aura_rbac_onboarding_status',
  CREDENTIALS: 'aura_rbac_issued_credentials',
};

// Initial Seed Data
const INITIAL_INSTITUTIONS: InstitutionEntity[] = [
  {
    id: 'pmec-berhampur',
    name: 'Parala Maharaja Engineering College',
    domain: 'pmec.ac.in',
    location: 'Berhampur, Odisha, India',
    stateOrCountry: 'Odisha, India',
    contactEmail: 'dean.placement@pmec.ac.in',
    adminEmails: ['2401109308_ee@pmec.ac.in'],
    enrolledStudentsCount: 420,
    status: 'active',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'stanford-univ',
    name: 'Stanford University (CS Department)',
    domain: 'stanford.edu',
    location: 'Stanford, CA, USA',
    stateOrCountry: 'California, USA',
    contactEmail: 'careers@stanford.edu',
    adminEmails: ['advisor.stanford@stanford.edu'],
    enrolledStudentsCount: 850,
    status: 'active',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'cmu-cs',
    name: 'Carnegie Mellon University',
    domain: 'cmu.edu',
    location: 'Pittsburgh, PA, USA',
    stateOrCountry: 'Pennsylvania, USA',
    contactEmail: 'careercenter@cmu.edu',
    adminEmails: ['placement@cmu.edu'],
    enrolledStudentsCount: 620,
    status: 'active',
    createdAt: '2026-01-20T00:00:00Z',
  },
];

const INITIAL_DOMAINS: DomainMapping[] = [
  {
    id: 'dom-01',
    domain: 'pmec.ac.in',
    institutionId: 'pmec-berhampur',
    institutionName: 'Parala Maharaja Engineering College',
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'dom-02',
    domain: 'stanford.edu',
    institutionId: 'stanford-univ',
    institutionName: 'Stanford University (CS Department)',
    isActive: true,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'dom-03',
    domain: 'cmu.edu',
    institutionId: 'cmu-cs',
    institutionName: 'Carnegie Mellon University',
    isActive: true,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
];

const INITIAL_COMPANIES: CompanyEntity[] = [
  {
    id: 'comp-01',
    name: 'Enterprise TechTalent Partner',
    domain: 'talentpartner.io',
    industry: 'Corporate Talent Acquisition & Global HR',
    recruiterEmails: ['psibaram63@gmail.com'],
    status: 'verified',
    verifiedAt: '2026-02-01T00:00:00Z',
    activeJobPostingsCount: 14,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'comp-02',
    name: 'Stripe',
    domain: 'stripe.com',
    industry: 'Financial Infrastructure',
    recruiterEmails: ['recruiting@stripe.com'],
    status: 'verified',
    verifiedAt: '2026-02-10T00:00:00Z',
    activeJobPostingsCount: 8,
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'comp-03',
    name: 'Databricks',
    domain: 'databricks.com',
    industry: 'Data & AI Systems',
    recruiterEmails: ['careers@databricks.com'],
    status: 'verified',
    verifiedAt: '2026-02-15T00:00:00Z',
    activeJobPostingsCount: 6,
    createdAt: '2026-02-15T00:00:00Z',
  },
];

interface UserElevationRecord {
  email: string;
  name?: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  companyId?: string;
  companyName?: string;
  elevatedBy: string;
  elevatedAt: string;
}

export interface IssuedCredential {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  organizationId?: string;
  organizationName?: string;
  issuedBy: string;
  issuedAt: string;
}

const INITIAL_CREDENTIALS: Record<string, IssuedCredential> = {
  'indrajit@aura.in': {
    email: 'indrajit@aura.in',
    password: 'PMEC@123',
    role: 'SUPER_ADMIN',
    name: 'Indrajit Jena (Super Admin)',
    issuedBy: 'ROOT_SECURITY_AUTHORITY',
    issuedAt: '2026-01-01T00:00:00Z',
  },
  'admin@aura.io': {
    email: 'admin@aura.io',
    password: 'PMEC@123',
    role: 'SUPER_ADMIN',
    name: 'System Super Administrator',
    issuedBy: 'ROOT_SECURITY_AUTHORITY',
    issuedAt: '2026-01-01T00:00:00Z',
  },
  '2401109308_ee@pmec.ac.in': {
    email: '2401109308_ee@pmec.ac.in',
    password: 'PMEC@DEAN2026',
    role: 'INSTITUTE_ADMIN',
    name: 'PMEC Berhampur Placement Cell',
    organizationId: 'pmec-berhampur',
    organizationName: 'Parala Maharaja Engineering College',
    issuedBy: 'indrajit@aura.in',
    issuedAt: '2026-02-01T00:00:00Z',
  },
  'psibaram63@gmail.com': {
    email: 'psibaram63@gmail.com',
    password: 'RECRUITER@123',
    role: 'COMPANY_RECRUITER',
    name: 'Sibaram Patro (Talent Partner)',
    organizationId: 'comp-01',
    organizationName: 'Enterprise TechTalent Partner',
    issuedBy: 'indrajit@aura.in',
    issuedAt: '2026-02-01T00:00:00Z',
  },
};

const INITIAL_ELEVATIONS: Record<string, UserElevationRecord> = {
  'indrajit@aura.in': {
    email: 'indrajit@aura.in',
    name: 'Indrajit Jena (Super Admin)',
    role: 'SUPER_ADMIN',
    elevatedBy: 'ROOT_SECURITY_AUTHORITY',
    elevatedAt: '2026-01-01T00:00:00Z',
  },
  'admin@aura.io': {
    email: 'admin@aura.io',
    name: 'System Super Administrator',
    role: 'SUPER_ADMIN',
    elevatedBy: 'SYSTEM_BOOTSTRAP',
    elevatedAt: '2026-01-01T00:00:00Z',
  },
  '2401109308_ee@pmec.ac.in': {
    email: '2401109308_ee@pmec.ac.in',
    name: 'INDRAJIT JENA',
    role: 'INSTITUTE_ADMIN',
    institutionId: 'pmec-berhampur',
    institutionName: 'Parala Maharaja Engineering College',
    elevatedBy: 'admin@aura.io',
    elevatedAt: '2026-02-01T00:00:00Z',
  },
  'psibaram63@gmail.com': {
    email: 'psibaram63@gmail.com',
    name: 'Sibaram Patro',
    role: 'COMPANY_RECRUITER',
    companyId: 'comp-01',
    companyName: 'Enterprise TechTalent Partner',
    elevatedBy: 'admin@aura.io',
    elevatedAt: '2026-02-01T00:00:00Z',
  },
};

export class RbacStore {
  private domainMappings: DomainMapping[] = [];
  private institutions: InstitutionEntity[] = [];
  private companies: CompanyEntity[] = [];
  private userElevations: Record<string, UserElevationRecord> = {};
  private auditLogs: RoleAuditLogEntry[] = [];
  private onboardingStatus: Record<string, boolean> = { 'alex.chen@stanford.edu': true };
  private credentials: Record<string, IssuedCredential> = { ...INITIAL_CREDENTIALS };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      this.domainMappings = [...INITIAL_DOMAINS];
      this.institutions = [...INITIAL_INSTITUTIONS];
      this.companies = [...INITIAL_COMPANIES];
      this.userElevations = { ...INITIAL_ELEVATIONS };
      this.onboardingStatus = { 'alex.chen@stanford.edu': true };
      this.credentials = { ...INITIAL_CREDENTIALS };
      return;
    }

    try {
      const storedDomains = localStorage.getItem(STORAGE_KEYS.DOMAINS);
      this.domainMappings = storedDomains ? JSON.parse(storedDomains) : [...INITIAL_DOMAINS];

      const storedInst = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
      this.institutions = storedInst ? JSON.parse(storedInst) : [...INITIAL_INSTITUTIONS];

      const storedComp = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      this.companies = storedComp ? JSON.parse(storedComp) : [...INITIAL_COMPANIES];

      const storedElev = localStorage.getItem(STORAGE_KEYS.ELEVATIONS);
      this.userElevations = storedElev ? JSON.parse(storedElev) : { ...INITIAL_ELEVATIONS };

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedLogs ? JSON.parse(storedLogs) : [];

      const storedOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATUS);
      this.onboardingStatus = storedOnboarding ? JSON.parse(storedOnboarding) : { 'alex.chen@stanford.edu': true };

      const storedCreds = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      this.credentials = storedCreds ? JSON.parse(storedCreds) : { ...INITIAL_CREDENTIALS };
    } catch (e) {
      console.warn('Error reading RBAC storage, falling back to defaults:', e);
      this.domainMappings = [...INITIAL_DOMAINS];
      this.institutions = [...INITIAL_INSTITUTIONS];
      this.companies = [...INITIAL_COMPANIES];
      this.userElevations = { ...INITIAL_ELEVATIONS };
      this.onboardingStatus = { 'alex.chen@stanford.edu': true };
      this.credentials = { ...INITIAL_CREDENTIALS };
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.DOMAINS, JSON.stringify(this.domainMappings));
      localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(this.institutions));
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(this.companies));
      localStorage.setItem(STORAGE_KEYS.ELEVATIONS, JSON.stringify(this.userElevations));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(this.onboardingStatus));
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(this.credentials));
    } catch (e) {
      console.error('Failed to persist RBAC store:', e);
    }
  }

  /**
   * Validates credentials for dedicated portal logins (Super Admin, College Admin, Company Recruiter)
   */
  public verifyCredential(
    email: string, 
    pass: string, 
    expectedRole?: UserRole
  ): { success: boolean; profile?: UserProfile; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    
    // Check hardcoded / stored credentials
    const cred = this.credentials[cleanEmail];
    if (!cred) {
      // Hardcoded fallback for Master Admin
      if (cleanEmail === 'indrajit@aura.in' && pass === 'PMEC@123') {
        const profile = this.resolveUserProfile('indrajit@aura.in');
        return { success: true, profile };
      }
      return { success: false, error: 'Account not found or no portal credentials issued' };
    }

    if (cred.password !== pass) {
      return { success: false, error: 'Invalid password credentials' };
    }

    if (expectedRole && cred.role !== expectedRole) {
      return { 
        success: false, 
        error: `This account is registered as ${cred.role}, not authorized for ${expectedRole} portal` 
      };
    }

    const profile = this.resolveUserProfile(cleanEmail);

    // Set browser session cookies for Next.js route protection
    if (typeof document !== 'undefined') {
      document.cookie = `aura_active_role=${cred.role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `aura_active_email=${cleanEmail}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = 'aura_has_completed_onboarding=true; path=/; max-age=86400; SameSite=Lax';
      if (cred.organizationName) {
        document.cookie = `aura_active_tenant=${encodeURIComponent(cred.organizationName)}; path=/; max-age=86400; SameSite=Lax`;
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_EMAIL, cleanEmail);
      localStorage.setItem('aura_active_role', cred.role);
    }

    return { success: true, profile };
  }

  /**
   * Super Admin issues dedicated credentials for College or Company partners
   */
  public issueCredential(cred: Omit<IssuedCredential, 'issuedAt'>): { success: boolean; credential: IssuedCredential } {
    const cleanEmail = cred.email.toLowerCase().trim();
    const newCred: IssuedCredential = {
      ...cred,
      email: cleanEmail,
      issuedAt: new Date().toISOString(),
    };

    this.credentials[cleanEmail] = newCred;

    // Automatically elevate user role in elevations map
    this.userElevations[cleanEmail] = {
      email: cleanEmail,
      name: cred.name,
      role: cred.role,
      institutionId: cred.organizationId,
      institutionName: cred.organizationName,
      companyId: cred.organizationId,
      companyName: cred.organizationName,
      elevatedBy: cred.issuedBy,
      elevatedAt: new Date().toISOString(),
    };

    this.saveToStorage();

    eventBus.publish({
      type: 'AUTH_ROLE_MUTATED',
      payload: { email: cleanEmail, newRole: cred.role },
    } as any);

    return { success: true, credential: newCred };
  }

  /**
   * Retrieves all issued credentials
   */
  public getIssuedCredentials(): IssuedCredential[] {
    return Object.values(this.credentials);
  }

  /**
   * Checks whether a given user email has completed initial candidate onboarding
   */
  public isOnboardingCompleted(email?: string | null): boolean {
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    // Super admins, institute leads, and company recruiters bypass candidate onboarding
    const elevation = this.userElevations[cleanEmail];
    if (elevation && elevation.role !== 'STUDENT') return true;
    if (cleanEmail === 'alex.chen@stanford.edu') return true;
    return !!this.onboardingStatus[cleanEmail];
  }

  /**
   * Marks candidate onboarding as complete and syncs cookies for Next.js middleware
   */
  public markOnboardingCompleted(email: string, details?: any): void {
    const cleanEmail = email.toLowerCase().trim();
    this.onboardingStatus[cleanEmail] = true;
    this.saveToStorage();

    if (typeof document !== 'undefined') {
      document.cookie = 'aura_has_completed_onboarding=true; path=/; max-age=31536000; SameSite=Lax';
      document.cookie = 'aura_onboarded=true; path=/; max-age=31536000; SameSite=Lax';
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`aura_candidate_onboarding_${cleanEmail}`, JSON.stringify({
        completedAt: new Date().toISOString(),
        details: details || {},
      }));

      const rawGit = details?.portfolioLinks?.github || details?.githubUrl;
      if (rawGit && typeof rawGit === 'string' && rawGit.trim()) {
        const trimmed = rawGit.trim();
        const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-]+)/i);
        const handle = match && match[1] ? match[1] : (trimmed && !trimmed.startsWith('http') ? trimmed.replace(/^@/, '').replace(/\/.*$/, '').trim() : '');
        if (handle && handle !== 'https:' && handle !== 'http:' && handle.toLowerCase() !== 'github.com') {
          localStorage.setItem('aura_candidate_github_username', handle);
          localStorage.setItem('aura_onboarding_github_url', trimmed);
        }
      }
    }

    eventBus.publish({
      type: 'PROFILE_MUTATED',
      payload: { email: cleanEmail, hasCompletedOnboarding: true },
    } as any);
  }

  /**
   * Retrieves stored candidate profile with fallback to onboarding or pre-configured defaults
   */
  public getCandidateProfile(email: string): CandidateProfileData {
    const cleanEmail = email.toLowerCase().trim();
    if (typeof window !== 'undefined') {
      // 1. Direct candidate profile override
      const direct = localStorage.getItem(`aura_candidate_profile_${cleanEmail}`);
      if (direct) {
        try {
          return JSON.parse(direct);
        } catch {}
      }
      // 2. Parsed onboarding record
      const onboarding = localStorage.getItem(`aura_candidate_onboarding_${cleanEmail}`);
      if (onboarding) {
        try {
          const parsed = JSON.parse(onboarding);
          const d = parsed.details || {};
          return {
            fullName: d.fullName || (cleanEmail.includes('indrajit') ? 'INDRAJIT JENA' : cleanEmail.split('@')[0]),
            email: cleanEmail,
            phone: d.phone || '+91 9876543210',
            targetRole: d.targetRole || 'Full-Stack / Distributed Systems Engineer',
            collegeName: d.academicHistory?.degree?.college || 'Parala Maharaja Engineering College (PMEC)',
            degreeTitle: d.academicHistory?.degree?.degreeTitle || 'B.Tech',
            major: d.academicHistory?.degree?.major || 'Electrical & Electronics Engineering',
            cgpa: d.academicHistory?.degree?.cgpa || '8.85',
            graduationYear: d.academicHistory?.degree?.graduationYear || '2026',
            tenthScore: d.academicHistory?.tenth?.score || '94.2',
            tenthBoard: d.academicHistory?.tenth?.board || 'CBSE',
            twelfthScore: d.academicHistory?.twelfth?.score || '91.5',
            twelfthBoard: d.academicHistory?.twelfth?.board || 'CBSE',
            twelfthStream: d.academicHistory?.twelfth?.stream || 'Science (PCM)',
            skills: d.skills && d.skills.length > 0 ? d.skills : [
              { name: 'TypeScript', proficiency: 5, category: 'Full-Stack' },
              { name: 'React', proficiency: 5, category: 'Frontend' },
              { name: 'Python', proficiency: 4, category: 'AI/ML' },
              { name: 'Data Structures & Algorithms', proficiency: 4, category: 'Core CS' },
              { name: 'PostgreSQL', proficiency: 4, category: 'Databases' },
              { name: 'System Design', proficiency: 4, category: 'Architecture' },
            ],
            githubUrl: d.portfolioLinks?.github || d.githubUrl || '',
            linkedinUrl: d.portfolioLinks?.linkedin || d.linkedinUrl || '',
            portfolioUrl: d.portfolioLinks?.portfolio || d.portfolioUrl || '',
            updatedAt: parsed.completedAt || new Date().toISOString(),
          };
        } catch {}
      }
    }

    const isIndrajit = cleanEmail.includes('indrajit') || cleanEmail.includes('2401109308');
    return {
      fullName: isIndrajit ? 'INDRAJIT JENA' : cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      phone: '+91 9876543210',
      targetRole: 'Full-Stack / Distributed Systems Engineer',
      collegeName: 'Parala Maharaja Engineering College (PMEC)',
      degreeTitle: 'B.Tech',
      major: 'Electrical & Electronics Engineering',
      cgpa: '8.85',
      graduationYear: '2026',
      tenthScore: '94.2',
      tenthBoard: 'CBSE',
      twelfthScore: '91.5',
      twelfthBoard: 'CBSE',
      twelfthStream: 'Science (PCM)',
      skills: [
        { name: 'TypeScript', proficiency: 5, category: 'Full-Stack' },
        { name: 'React', proficiency: 5, category: 'Frontend' },
        { name: 'Python', proficiency: 4, category: 'AI/ML' },
        { name: 'Data Structures & Algorithms', proficiency: 4, category: 'Core CS' },
        { name: 'PostgreSQL', proficiency: 4, category: 'Databases' },
        { name: 'System Design', proficiency: 4, category: 'Architecture' },
      ],
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Persists updated candidate profile, sets onboarding completed,
   * recalibrates composite skill score and synchronizes state
   */
  public saveCandidateProfile(email: string, profile: CandidateProfileData): void {
    const cleanEmail = email.toLowerCase().trim();
    profile.updatedAt = new Date().toISOString();
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`aura_candidate_profile_${cleanEmail}`, JSON.stringify(profile));
      localStorage.setItem(`aura_candidate_name_${cleanEmail}`, profile.fullName);

      if (profile.githubUrl && profile.githubUrl.trim()) {
        const trimmed = profile.githubUrl.trim();
        const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-]+)/i);
        const handle = match && match[1] ? match[1] : (trimmed && !trimmed.startsWith('http') ? trimmed.replace(/^@/, '').replace(/\/.*$/, '').trim() : '');
        if (handle && handle !== 'https:' && handle !== 'http:' && handle.toLowerCase() !== 'github.com') {
          localStorage.setItem('aura_candidate_github_username', handle);
          localStorage.setItem('aura_onboarding_github_url', trimmed);
        }
      } else {
        localStorage.removeItem('aura_candidate_github_username');
        localStorage.removeItem('aura_onboarding_github_url');
      }
    }

    // Mark as completed onboarding
    this.onboardingStatus[cleanEmail] = true;
    this.saveToStorage();

    if (typeof document !== 'undefined') {
      document.cookie = 'aura_has_completed_onboarding=true; path=/; max-age=31536000; SameSite=Lax';
      document.cookie = 'aura_onboarded=true; path=/; max-age=31536000; SameSite=Lax';
    }

    // Recalculate dynamic skill score
    const scoreResult = skillScoreCalculator.calculate({
      email: cleanEmail,
      academics: {
        tenthScore: profile.tenthScore,
        twelfthScore: profile.twelfthScore,
        degreeCgpa: profile.cgpa,
        collegeName: profile.collegeName,
        degreeTitle: profile.degreeTitle,
      },
      skills: profile.skills.map(s => ({ name: s.name, proficiency: s.proficiency })),
      atsResumeScore: 88,
      hasGithubVerified: !!profile.githubUrl,
      portfolioLinksCount: [profile.githubUrl, profile.linkedinUrl, profile.portfolioUrl].filter(Boolean).length,
    });
    skillScoreCalculator.persistScore(cleanEmail, scoreResult);

    // Notify listeners
    eventBus.publish({
      type: 'PROFILE_MUTATED',
      payload: { email: cleanEmail, profile, scoreResult },
    } as any);
  }

  /**
   * Dynamic Domain Resolution Engine:
   * Maps any email address to its assigned role, institution tenant, and company binding.
   */
  public resolveUserProfile(email: string, displayName?: string): UserProfile {
    const cleanEmail = email.toLowerCase().trim();
    const domain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '';

    // 1. Automatic Domain Mapping lookup
    const domainMatch = this.domainMappings.find(d => d.domain === domain && d.isActive);
    const mappedInstitution = domainMatch ? this.institutions.find(i => i.id === domainMatch.institutionId) : undefined;

    // 2. Check for Super Admin elevation override
    const elevation = this.userElevations[cleanEmail];

    if (elevation) {
      let badge = 'STUDENT';
      if (elevation.role === 'SUPER_ADMIN') badge = 'SUPER_ADMIN_MASTER';
      else if (elevation.role === 'INSTITUTE_ADMIN') badge = 'VERIFIED_INSTITUTION_LEAD';
      else if (elevation.role === 'COMPANY_RECRUITER') badge = 'VERIFIED_EMPLOYER_PARTNER';

      return {
        id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: cleanEmail,
        name: elevation.name || displayName || cleanEmail.split('@')[0],
        role: elevation.role,
        emailDomain: domain,
        institutionId: elevation.institutionId || mappedInstitution?.id,
        institutionName: elevation.institutionName || mappedInstitution?.name,
        companyId: elevation.companyId,
        companyName: elevation.companyName,
        badge,
        isCustomRoleOverride: true,
        hasCompletedOnboarding: true,
        createdAt: elevation.elevatedAt,
        lastLoginAt: new Date().toISOString(),
      };
    }

    // 3. Default Lifecycle: Everyone else starts as STUDENT
    const hasProfile = typeof window !== 'undefined' && !!localStorage.getItem(`aura_candidate_profile_${cleanEmail}`);
    const isOnboarded = cleanEmail === 'alex.chen@stanford.edu' || !!this.onboardingStatus[cleanEmail] || hasProfile;

    let candidateName = displayName;
    if (!candidateName && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`aura_candidate_name_${cleanEmail}`);
      if (stored) candidateName = stored;
      else if (cleanEmail.includes('indrajit')) candidateName = 'INDRAJIT JENA';
    }
    if (!candidateName) candidateName = cleanEmail.split('@')[0];

    return {
      id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: cleanEmail,
      name: candidateName,
      role: 'STUDENT',
      emailDomain: domain,
      institutionId: mappedInstitution?.id,
      institutionName: mappedInstitution?.name,
      badge: mappedInstitution ? `COLLEGE_STUDENT (${domain})` : 'INDEPENDENT_CANDIDATE',
      isCustomRoleOverride: false,
      hasCompletedOnboarding: isOnboarded,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }

  /**
   * Super Admin Role Elevation:
   * Dynamically elevates any user to INSTITUTE_ADMIN, COMPANY_RECRUITER, or SUPER_ADMIN
   */
  public elevateUserRole(params: {
    actorEmail: string;
    targetEmail: string;
    newRole: UserRole;
    targetOrgId?: string;
    targetOrgName?: string;
    targetUserName?: string;
  }): { success: boolean; log: RoleAuditLogEntry } {
    const targetEmail = params.targetEmail.toLowerCase().trim();
    const current = this.resolveUserProfile(targetEmail);
    const previousRole = current.role;

    const record: UserElevationRecord = {
      email: targetEmail,
      name: params.targetUserName || current.name,
      role: params.newRole,
      elevatedBy: params.actorEmail,
      elevatedAt: new Date().toISOString(),
    };

    if (params.newRole === 'INSTITUTE_ADMIN') {
      const inst = this.institutions.find(i => i.id === params.targetOrgId);
      record.institutionId = inst ? inst.id : params.targetOrgId;
      record.institutionName = inst ? inst.name : params.targetOrgName;
    } else if (params.newRole === 'COMPANY_RECRUITER') {
      const comp = this.companies.find(c => c.id === params.targetOrgId);
      record.companyId = comp ? comp.id : params.targetOrgId;
      record.companyName = comp ? comp.name : params.targetOrgName;
    }

    if (params.newRole === 'STUDENT') {
      delete this.userElevations[targetEmail];
    } else {
      this.userElevations[targetEmail] = record;
    }

    const auditHash = `0xrole_${Date.now().toString(16)}_${Math.random().toString(16).substring(2, 8)}`;
    const log: RoleAuditLogEntry = {
      id: `log-${Date.now()}`,
      targetUserEmail: targetEmail,
      previousRole,
      newRole: params.newRole,
      elevatedByEmail: params.actorEmail,
      targetOrganization: record.institutionName || record.companyName,
      timestamp: new Date().toISOString(),
      auditHash,
    };

    this.auditLogs.unshift(log);
    this.saveToStorage();

    // Publish event
    eventBus.publish({
      type: 'AUTH_ROLE_MUTATED' as any,
      sourceModule: 'AURA RBAC Authority Engine',
      payload: log,
      recalculatedModules: ['AuthContext', 'Navigation', 'EWEIS Isolation', 'Talent Pool'],
    });

    return { success: true, log };
  }

  /**
   * Super Admin Domain Registry:
   * Adds a new college domain (e.g. nitrkl.ac.in -> NIT Rourkela)
   */
  public addDomainMapping(params: {
    domain: string;
    institutionName: string;
    location: string;
    contactEmail: string;
  }): DomainMapping {
    const cleanDomain = params.domain.toLowerCase().trim().replace(/^@/, '');
    const instId = `inst-${cleanDomain.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Add institution
    const institution: InstitutionEntity = {
      id: instId,
      name: params.institutionName,
      domain: cleanDomain,
      location: params.location,
      stateOrCountry: params.location,
      contactEmail: params.contactEmail,
      adminEmails: [],
      enrolledStudentsCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.institutions.push(institution);

    // Add mapping
    const mapping: DomainMapping = {
      id: `dom-${Date.now()}`,
      domain: cleanDomain,
      institutionId: instId,
      institutionName: params.institutionName,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.domainMappings.push(mapping);

    this.saveToStorage();
    return mapping;
  }

  public deleteDomainMapping(id: string): void {
    this.domainMappings = this.domainMappings.filter(d => d.id !== id);
    this.saveToStorage();
  }

  public toggleDomainActive(id: string): void {
    const target = this.domainMappings.find(d => d.id === id);
    if (target) {
      target.isActive = !target.isActive;
      this.saveToStorage();
    }
  }

  /**
   * Company Recruiter Verification Desk
   */
  public verifyCompany(companyId: string, status: 'verified' | 'rejected'): void {
    const target = this.companies.find(c => c.id === companyId);
    if (target) {
      target.status = status;
      if (status === 'verified') {
        target.verifiedAt = new Date().toISOString();
      }
      this.saveToStorage();
    }
  }

  public addCompany(params: {
    name: string;
    industry: string;
    domain?: string;
    recruiterEmail: string;
  }): CompanyEntity {
    const newComp: CompanyEntity = {
      id: `comp-${Date.now()}`,
      name: params.name,
      domain: params.domain,
      industry: params.industry,
      recruiterEmails: [params.recruiterEmail],
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      activeJobPostingsCount: 1,
      createdAt: new Date().toISOString(),
    };
    this.companies.push(newComp);
    this.saveToStorage();
    return newComp;
  }

  // Getters
  public getDomainMappings(): DomainMapping[] {
    return [...this.domainMappings];
  }

  public getInstitutions(): InstitutionEntity[] {
    return [...this.institutions];
  }

  public getCompanies(): CompanyEntity[] {
    return [...this.companies];
  }

  public getElevatedUsers(): UserElevationRecord[] {
    return Object.values(this.userElevations);
  }

  public getAuditLogs(): RoleAuditLogEntry[] {
    return [...this.auditLogs];
  }

  public getPermissionsForRole(role: UserRole): SecurityPermissions {
    return ROLE_PERMISSIONS[role];
  }
}

export const rbacStore = new RbacStore();
