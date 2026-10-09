/**
 * Multi-Tenant Role-Based Access Control (RBAC) & Domain Isolation Types
 * Autonomous Career Intelligence Platform (AURA)
 */

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'STUDENT'
  | 'INSTITUTE_ADMIN'
  | 'COMPANY_RECRUITER';

export interface DomainMapping {
  id: string;
  domain: string; // e.g. "pmec.ac.in", "stanford.edu"
  institutionId: string;
  institutionName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionEntity {
  id: string;
  name: string;
  domain: string;
  location: string;
  stateOrCountry: string;
  contactEmail: string;
  adminEmails: string[];
  enrolledStudentsCount: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

export interface CompanyEntity {
  id: string;
  name: string;
  domain?: string;
  industry: string;
  recruiterEmails: string[];
  status: 'verified' | 'pending' | 'rejected';
  verifiedAt?: string;
  websiteUrl?: string;
  activeJobPostingsCount: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailDomain: string;
  institutionId?: string;
  institutionName?: string;
  companyId?: string;
  companyName?: string;
  avatarUrl?: string;
  badge: string;
  isCustomRoleOverride: boolean; // true if Super Admin manually elevated from default STUDENT
  hasCompletedOnboarding?: boolean; // Onboarding completion status
  createdAt: string;
  lastLoginAt: string;
}

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  tenantType: 'super_platform' | 'university' | 'college' | 'enterprise_partner';
  emailDomain?: string;
  dataIsolationMode: 'strict_domain_rls' | 'global_talent_pool' | 'bypass_all';
  complianceCertifications: string[]; // e.g. ["FERPA", "SOC2 Type II", "GDPR"]
}

export interface SecurityPermissions {
  canAccessAdminConsole: boolean;
  canElevateUserRoles: boolean;
  canManageDomainRegistry: boolean;
  canApproveCompanies: boolean;
  canViewInstitutionalDashboard: boolean;
  canAccessAllInstitutions: boolean; // Only SUPER_ADMIN
  canViewOwnInstitutionStudentsOnly: boolean; // INSTITUTE_ADMIN
  canViewCandidateTalentPool: boolean; // COMPANY_RECRUITER & SUPER_ADMIN
  canPostJobRequirements: boolean;
  canDeployInterventions: boolean;
  canAuditAiModels: boolean;
  canExportFERPAData: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, SecurityPermissions> = {
  SUPER_ADMIN: {
    canAccessAdminConsole: true,
    canElevateUserRoles: true,
    canManageDomainRegistry: true,
    canApproveCompanies: true,
    canViewInstitutionalDashboard: true,
    canAccessAllInstitutions: true,
    canViewOwnInstitutionStudentsOnly: false,
    canViewCandidateTalentPool: true,
    canPostJobRequirements: true,
    canDeployInterventions: true,
    canAuditAiModels: true,
    canExportFERPAData: true,
  },
  INSTITUTE_ADMIN: {
    canAccessAdminConsole: false,
    canElevateUserRoles: false,
    canManageDomainRegistry: false,
    canApproveCompanies: false,
    canViewInstitutionalDashboard: true,
    canAccessAllInstitutions: false,
    canViewOwnInstitutionStudentsOnly: true,
    canViewCandidateTalentPool: false,
    canPostJobRequirements: false,
    canDeployInterventions: true,
    canAuditAiModels: false,
    canExportFERPAData: true,
  },
  COMPANY_RECRUITER: {
    canAccessAdminConsole: false,
    canElevateUserRoles: false,
    canManageDomainRegistry: false,
    canApproveCompanies: false,
    canViewInstitutionalDashboard: false,
    canAccessAllInstitutions: false,
    canViewOwnInstitutionStudentsOnly: false,
    canViewCandidateTalentPool: true,
    canPostJobRequirements: true,
    canDeployInterventions: false,
    canAuditAiModels: false,
    canExportFERPAData: false,
  },
  STUDENT: {
    canAccessAdminConsole: false,
    canElevateUserRoles: false,
    canManageDomainRegistry: false,
    canApproveCompanies: false,
    canViewInstitutionalDashboard: false,
    canAccessAllInstitutions: false,
    canViewOwnInstitutionStudentsOnly: false,
    canViewCandidateTalentPool: false,
    canPostJobRequirements: false,
    canDeployInterventions: false,
    canAuditAiModels: false,
    canExportFERPAData: false,
  },
};

export interface RoleAuditLogEntry {
  id: string;
  targetUserEmail: string;
  previousRole: UserRole;
  newRole: UserRole;
  elevatedByEmail: string;
  targetOrganization?: string;
  timestamp: string;
  auditHash: string;
}
