'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './client';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signInAsSuperAdmin,
  signInAsInstitutionLead,
  signInAsCompanyPartner,
  signInAsDemo,
  logOut,
  resetPassword,
  getPersonaByEmail,
  PredefinedPersona,
} from './auth';
import { eventBus } from '../engine/EventBus';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  persona: PredefinedPersona;
  signInWithGoogle: () => Promise<User>;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<User>;
  signInAsSuperAdmin: () => Promise<User>;
  signInAsInstitutionLead: (email?: string) => Promise<User>;
  signInAsCompanyPartner: (email?: string) => Promise<User>;
  signInAsDemo: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshPersona: () => void;
}

const defaultPersona: PredefinedPersona = {
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

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  persona: defaultPersona,
  signInWithGoogle: async () => { throw new Error('AuthContext not initialized'); },
  signInWithEmail: async () => { throw new Error('AuthContext not initialized'); },
  signUpWithEmail: async () => { throw new Error('AuthContext not initialized'); },
  signInAsSuperAdmin: async () => { throw new Error('AuthContext not initialized'); },
  signInAsInstitutionLead: async () => { throw new Error('AuthContext not initialized'); },
  signInAsCompanyPartner: async () => { throw new Error('AuthContext not initialized'); },
  signInAsDemo: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => {},
  resetPassword: async () => {},
  refreshPersona: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [persona, setPersona] = useState<PredefinedPersona>(defaultPersona);

  const resolvePersona = (currentUser: User | null) => {
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('aura_active_email') : null;
    const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('aura_active_role') as any) : null;

    const isElevatedSession = storedRole && (storedRole === 'SUPER_ADMIN' || storedRole === 'INSTITUTE_ADMIN' || storedRole === 'COMPANY_RECRUITER');

    let effectiveEmail = isElevatedSession
      ? (storedEmail || currentUser?.email || 'indrajit@aura.in')
      : (currentUser?.email || storedEmail || '');

    if (!effectiveEmail && !currentUser && !isElevatedSession) {
      setPersona(defaultPersona);
      return;
    }

    const resolved = getPersonaByEmail(effectiveEmail);

    // Enforce elevated portal role if active in session
    if (isElevatedSession) {
      resolved.userRole = storedRole;
      if (storedRole === 'SUPER_ADMIN') {
        resolved.role = 'admin';
        resolved.accountType = 'SUPER_ADMIN_ID';
        resolved.badge = 'SUPER_ADMIN_MASTER';
        resolved.description = 'Platform Super Administrator • Master Portal Access';
      } else if (storedRole === 'INSTITUTE_ADMIN') {
        resolved.role = 'admin';
        resolved.accountType = 'INSTITUTION_ID';
        resolved.badge = 'VERIFIED_INSTITUTION_LEAD';
        resolved.description = `Institutional Authority for ${resolved.organization || 'PMEC'} • EWEIS & FERPA Isolation`;
      } else if (storedRole === 'COMPANY_RECRUITER') {
        resolved.role = 'advisor';
        resolved.accountType = 'COMPANY_ID';
        resolved.badge = 'VERIFIED_EMPLOYER_PARTNER';
        resolved.description = 'Corporate Recruiter • Talent Discovery & Job Postings';
      }
    }

    if (currentUser?.displayName && !isElevatedSession) {
      resolved.name = currentUser.displayName;
    }
    setPersona(resolved);
  };

  const refreshPersona = () => {
    resolvePersona(user);
  };

  useEffect(() => {
    let settled = false;
    const loadingTimeout = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    }, 400);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      settled = true;
      window.clearTimeout(loadingTimeout);
      setUser(currentUser);
      resolvePersona(currentUser);
      setLoading(false);
    }, (error) => {
      settled = true;
      window.clearTimeout(loadingTimeout);
      console.error('Firebase auth initialization failed.', error);
      setLoading(false);
    });

    // Listen to real-time role mutations from Super Admin portal
    const unsubRoleEvent = eventBus.subscribe('AUTH_ROLE_MUTATED' as any, () => {
      resolvePersona(user);
    });

    return () => {
      settled = true;
      window.clearTimeout(loadingTimeout);
      unsubscribe();
      unsubRoleEvent();
    };
  }, []);

  const handleSuperAdminSignIn = async (): Promise<User> => {
    const usr = await signInAsSuperAdmin();
    setUser(usr);
    resolvePersona(usr);
    return usr;
  };

  const handleInstitutionSignIn = async (email?: string): Promise<User> => {
    const usr = await signInAsInstitutionLead(email);
    setUser(usr);
    resolvePersona(usr);
    return usr;
  };

  const handleCompanySignIn = async (email?: string): Promise<User> => {
    const usr = await signInAsCompanyPartner(email);
    setUser(usr);
    resolvePersona(usr);
    return usr;
  };

  const handleDemoSignIn = async (): Promise<User> => {
    const usr = await signInAsDemo();
    setUser(usr);
    resolvePersona(usr);
    return usr;
  };

  const handleLogout = async () => {
    await logOut();
    setUser(null);
    setPersona(defaultPersona);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        persona,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsSuperAdmin: handleSuperAdminSignIn,
        signInAsInstitutionLead: handleInstitutionSignIn,
        signInAsCompanyPartner: handleCompanySignIn,
        signInAsDemo: handleDemoSignIn,
        logout: handleLogout,
        resetPassword,
        refreshPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
