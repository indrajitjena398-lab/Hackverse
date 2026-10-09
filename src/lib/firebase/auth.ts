import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './client';
import { rbacStore } from '../security/rbacStore';
import { UserRole } from '../types/security';

const clearActivePortalSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aura_active_email');
    localStorage.removeItem('aura_active_role');
    localStorage.removeItem('aura_active_tenant');
  }
  if (typeof document !== 'undefined') {
    document.cookie = 'aura_active_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'aura_active_email=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'aura_active_tenant=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'aura_has_completed_onboarding=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'aura_onboarded=; path=/; max-age=0; SameSite=Lax';
  }
};

export interface PredefinedPersona {
  email: string;
  name: string;
  role: 'admin' | 'advisor' | 'student';
  userRole: UserRole; // 'SUPER_ADMIN' | 'STUDENT' | 'INSTITUTE_ADMIN' | 'COMPANY_RECRUITER'
  tenant: string;
  accountType: 'SUPER_ADMIN_ID' | 'INSTITUTION_ID' | 'COMPANY_ID' | 'CANDIDATE_ID';
  organization: string;
  badge: string;
  description: string;
  hasCompletedOnboarding: boolean;
}

/**
 * Dynamic Persona Resolution:
 * Instead of static hardcoding, resolves role and tenant dynamically
 * using the centralized rbacStore (Domain Registry + Role Elevations).
 */
export const getPersonaByEmail = (email?: string | null): PredefinedPersona => {
  if (!email) {
    return {
      email: '',
      name: 'Guest Visitor',
      role: 'student',
      userRole: 'STUDENT',
      tenant: 'Standard Academic Candidate',
      accountType: 'CANDIDATE_ID',
      organization: 'Candidate Workspace',
      badge: 'GUEST_USER',
      description: 'Unauthenticated Guest User',
      hasCompletedOnboarding: false,
    };
  }

  const profile = rbacStore.resolveUserProfile(email);

  let uiRole: 'admin' | 'advisor' | 'student' = 'student';
  let accountType: 'SUPER_ADMIN_ID' | 'INSTITUTION_ID' | 'COMPANY_ID' | 'CANDIDATE_ID' = 'CANDIDATE_ID';
  let description = 'Standard Candidate User • Job Discovery & Adaptive Mock Interviewer';

  if (profile.role === 'SUPER_ADMIN') {
    uiRole = 'admin';
    accountType = 'SUPER_ADMIN_ID';
    description = 'Platform Super Administrator • Full Access to Admin Console, Domain Registry & Role Elevation';
  } else if (profile.role === 'INSTITUTE_ADMIN') {
    uiRole = 'admin';
    accountType = 'INSTITUTION_ID';
    description = `Institutional Authority for ${profile.institutionName || 'College'} • EWEIS & FERPA Isolation`;
  } else if (profile.role === 'COMPANY_RECRUITER') {
    uiRole = 'advisor';
    accountType = 'COMPANY_ID';
    description = `Corporate Recruiter for ${profile.companyName || 'Enterprise'} • Talent Discovery & Job Postings`;
  } else if (profile.institutionName) {
    description = `Verified Student at ${profile.institutionName} (${profile.emailDomain})`;
  }

  return {
    email: profile.email,
    name: profile.name,
    role: uiRole,
    userRole: profile.role,
    tenant: profile.institutionName || profile.companyName || (profile.emailDomain ? `${profile.emailDomain} Student` : 'Standard Academic Candidate'),
    accountType,
    organization: profile.institutionName || profile.companyName || 'Candidate Workspace',
    badge: profile.badge,
    description,
    hasCompletedOnboarding: profile.hasCompletedOnboarding ?? false,
  };
};

export const signInWithGoogle = async (): Promise<User> => {
  clearActivePortalSession();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  clearActivePortalSession();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<User> => {
  clearActivePortalSession();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
};

export const signInAsSuperAdmin = async (): Promise<User> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aura_active_email', 'indrajit@aura.in');
    localStorage.setItem('aura_active_role', 'SUPER_ADMIN');
    localStorage.setItem('aura_active_tenant', 'AURA Central Platform Command');
  }
  if (typeof document !== 'undefined') {
    document.cookie = 'aura_active_role=SUPER_ADMIN; path=/; max-age=86400; SameSite=Lax';
    document.cookie = 'aura_active_email=indrajit@aura.in; path=/; max-age=86400; SameSite=Lax';
    document.cookie = 'aura_has_completed_onboarding=true; path=/; max-age=86400; SameSite=Lax';
  }
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: 'Indrajit Jena (Super Admin)' });
      return auth.currentUser;
    }
    const result = await signInAnonymously(auth);
    await updateProfile(result.user, { displayName: 'Indrajit Jena (Super Admin)' });
    return result.user;
  } catch (e) {
    console.warn('Anonymous firebase sign-in bypassed, local super admin session active:', e);
    return {
      uid: 'super-admin-indrajit',
      email: 'indrajit@aura.in',
      displayName: 'Indrajit Jena (Super Admin)',
    } as any;
  }
};

export const signInAsInstitutionLead = async (email: string = '2401109308_ee@pmec.ac.in'): Promise<User> => {
  const profile = rbacStore.resolveUserProfile(email);
  if (typeof window !== 'undefined') {
    localStorage.setItem('aura_active_email', email);
    localStorage.setItem('aura_active_role', 'INSTITUTE_ADMIN');
    localStorage.setItem('aura_active_tenant', profile.institutionName || 'Parala Maharaja Engineering College (PMEC)');
  }
  if (typeof document !== 'undefined') {
    document.cookie = 'aura_active_role=INSTITUTE_ADMIN; path=/; max-age=86400; SameSite=Lax';
    document.cookie = `aura_active_email=${email}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = 'aura_has_completed_onboarding=true; path=/; max-age=86400; SameSite=Lax';
  }
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: profile.name || 'PMEC Placement Dean' });
      return auth.currentUser;
    }
    const result = await signInAnonymously(auth);
    await updateProfile(result.user, { displayName: profile.name || 'PMEC Placement Dean' });
    return result.user;
  } catch (e) {
    console.warn('Anonymous firebase sign-in bypassed, local institute session active:', e);
    return {
      uid: 'institute-admin-dean',
      email,
      displayName: profile.name || 'PMEC Placement Dean',
    } as any;
  }
};

export const signInAsCompanyPartner = async (email: string = 'psibaram63@gmail.com'): Promise<User> => {
  const profile = rbacStore.resolveUserProfile(email);
  if (typeof window !== 'undefined') {
    localStorage.setItem('aura_active_email', email);
    localStorage.setItem('aura_active_role', 'COMPANY_RECRUITER');
    localStorage.setItem('aura_active_tenant', profile.companyName || 'Enterprise Partner');
  }
  if (typeof document !== 'undefined') {
    document.cookie = 'aura_active_role=COMPANY_RECRUITER; path=/; max-age=86400; SameSite=Lax';
    document.cookie = `aura_active_email=${email}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = 'aura_has_completed_onboarding=true; path=/; max-age=86400; SameSite=Lax';
  }
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: profile.name || 'Sibaram Patro' });
      return auth.currentUser;
    }
    const result = await signInAnonymously(auth);
    await updateProfile(result.user, { displayName: profile.name || 'Sibaram Patro' });
    return result.user;
  } catch (e) {
    console.warn('Anonymous firebase sign-in bypassed, local recruiter session active:', e);
    return {
      uid: 'company-recruiter-partner',
      email,
      displayName: profile.name || 'Sibaram Patro',
    } as any;
  }
};

export const signInAsDemo = async (): Promise<User> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aura_active_email', 'alex.chen@stanford.edu');
    localStorage.setItem('aura_active_role', 'STUDENT');
    localStorage.setItem('aura_active_tenant', 'Stanford University (CS Department)');
  }
  if (typeof document !== 'undefined') {
    document.cookie = 'aura_active_role=STUDENT; path=/; max-age=86400; SameSite=Lax';
    document.cookie = 'aura_active_email=alex.chen@stanford.edu; path=/; max-age=86400; SameSite=Lax';
    document.cookie = 'aura_has_completed_onboarding=true; path=/; max-age=86400; SameSite=Lax';
  }
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: 'Alex Chen (Student)' });
      return auth.currentUser;
    }
    const result = await signInAnonymously(auth);
    await updateProfile(result.user, { displayName: 'Alex Chen (Student)' });
    return result.user;
  } catch (e) {
    return {
      uid: 'demo-student',
      email: 'alex.chen@stanford.edu',
      displayName: 'Alex Chen (Student)',
    } as any;
  }
};

export const logOut = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aura_active_email');
    localStorage.removeItem('aura_active_role');
    localStorage.removeItem('aura_active_tenant');
  }
  if (typeof document !== 'undefined') {
    document.cookie = 'aura_active_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'aura_active_email=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'aura_active_tenant=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'aura_has_completed_onboarding=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'aura_onboarded=; path=/; max-age=0; SameSite=Lax';
  }
  try {
    await signOut(auth);
  } catch {}
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};
