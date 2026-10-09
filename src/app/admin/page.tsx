'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Globe, 
  Building2, 
  UserCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  GraduationCap,
  KeyRound,
  Check,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { rbacStore, IssuedCredential } from '@/lib/security/rbacStore';
import { UserRole, DomainMapping, InstitutionEntity, CompanyEntity, RoleAuditLogEntry } from '@/lib/types/security';
import { FeedbackAnalytics } from '@/components/feedback/FeedbackAnalytics';

export default function SuperAdminConsolePage() {
  const { user, persona, signInAsSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'roles' | 'credentials' | 'domains' | 'companies' | 'audit' | 'feedback'>('credentials');

  // Role Elevation Form state
  const [targetEmail, setTargetEmail] = useState('');
  const [targetName, setTargetName] = useState('');
  const [targetRole, setTargetRole] = useState<UserRole>('INSTITUTE_ADMIN');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [elevationFeedback, setElevationFeedback] = useState<string | null>(null);

  // Dedicated Credential Generation state
  const [credEmail, setCredEmail] = useState('');
  const [credName, setCredName] = useState('');
  const [credRole, setCredRole] = useState<'INSTITUTE_ADMIN' | 'COMPANY_RECRUITER'>('INSTITUTE_ADMIN');
  const [credOrgName, setCredOrgName] = useState('Parala Maharaja Engineering College');
  const [credPassword, setCredPassword] = useState('PMEC@DEAN2026');
  const [credFeedback, setCredFeedback] = useState<string | null>(null);

  // New Domain Form state
  const [newDomain, setNewDomain] = useState('');
  const [newInstName, setNewInstName] = useState('');
  const [newInstLocation, setNewInstLocation] = useState('');
  const [newInstContact, setNewInstContact] = useState('');
  const [domainFeedback, setDomainFeedback] = useState<string | null>(null);

  // Data state
  const [domains, setDomains] = useState<DomainMapping[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionEntity[]>([]);
  const [companies, setCompanies] = useState<CompanyEntity[]>([]);
  const [elevatedUsers, setElevatedUsers] = useState<any[]>([]);
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([]);
  const [auditLogs, setAuditLogs] = useState<RoleAuditLogEntry[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const refreshData = () => {
    setDomains(rbacStore.getDomainMappings());
    setInstitutions(rbacStore.getInstitutions());
    setCompanies(rbacStore.getCompanies());
    setElevatedUsers(rbacStore.getElevatedUsers());
    setIssuedCredentials(rbacStore.getIssuedCredentials());
    setAuditLogs(rbacStore.getAuditLogs());
  };

  const [localAdminActive, setLocalAdminActive] = useState(false);

  useEffect(() => {
    refreshData();
    if (typeof window !== 'undefined') {
      const activeRole = localStorage.getItem('aura_active_role');
      if (activeRole === 'SUPER_ADMIN') {
        setLocalAdminActive(true);
      }
    }
  }, []);

  const isSuperAdmin = 
    persona.userRole === 'SUPER_ADMIN' || 
    persona.accountType === 'SUPER_ADMIN_ID' || 
    localAdminActive;

  const handleElevateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) return;

    let targetOrgName = '';
    if (targetRole === 'INSTITUTE_ADMIN') {
      const inst = institutions.find(i => i.id === selectedOrgId);
      targetOrgName = inst ? inst.name : 'College Institution';
    } else if (targetRole === 'COMPANY_RECRUITER') {
      const comp = companies.find(c => c.id === selectedOrgId);
      targetOrgName = comp ? comp.name : 'Corporate Partner';
    }

    const res = rbacStore.elevateUserRole({
      actorEmail: persona.email || 'admin@aura.io',
      targetEmail: targetEmail.trim(),
      newRole: targetRole,
      targetOrgId: selectedOrgId || undefined,
      targetOrgName,
      targetUserName: targetName.trim() || undefined,
    });

    if (res.success) {
      setElevationFeedback(`Successfully elevated ${targetEmail} to ${targetRole} (${targetOrgName})`);
      setTargetEmail('');
      setTargetName('');
      setTimeout(() => setElevationFeedback(null), 4000);
      refreshData();
    }
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !newInstName.trim()) return;

    rbacStore.addDomainMapping({
      domain: newDomain.trim(),
      institutionName: newInstName.trim(),
      location: newInstLocation.trim() || 'Global Campus',
      contactEmail: newInstContact.trim() || `dean@${newDomain.trim()}`,
    });

    setDomainFeedback(`Domain @${newDomain.trim()} mapped to "${newInstName.trim()}"`);
    setNewDomain('');
    setNewInstName('');
    setNewInstLocation('');
    setNewInstContact('');
    setTimeout(() => setDomainFeedback(null), 4000);
    refreshData();
  };

  const handleToggleDomain = (id: string) => {
    rbacStore.toggleDomainActive(id);
    refreshData();
  };

  const handleDeleteDomain = (id: string) => {
    rbacStore.deleteDomainMapping(id);
    refreshData();
  };

  const handleVerifyCompany = (companyId: string, status: 'verified' | 'rejected') => {
    rbacStore.verifyCompany(companyId, status);
    refreshData();
  };

  const handleIssueCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credEmail.trim() || !credPassword.trim()) return;

    rbacStore.issueCredential({
      email: credEmail.trim(),
      name: credName.trim() || credEmail.split('@')[0],
      role: credRole,
      organizationName: credOrgName.trim(),
      password: credPassword.trim(),
      issuedBy: persona.email || 'indrajit@aura.in',
    });

    setCredFeedback(`Successfully generated & issued ${credRole} credentials for "${credEmail.trim()}"`);
    setCredEmail('');
    setCredName('');
    setTimeout(() => setCredFeedback(null), 4000);
    refreshData();
  };

  // If not logged in as Super Admin, show authentication prompt
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Super Admin Access Required
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              The Super Admin Management Console is restricted to master platform controllers. You are currently browsing as <strong>{persona.name || 'Guest'}</strong> ({persona.userRole}).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Super Admin Capabilities:</span>
            </div>
            <ul className="text-slate-600 space-y-1 list-disc pl-4 text-[11px]">
              <li>Elevate standard user emails to Institute Admins or Recruiters</li>
              <li>Map academic email domains (@pmec.ac.in) to institutions</li>
              <li>Approve enterprise hiring partners &amp; recruiters</li>
              <li>Audit global cryptographic logs across all multi-tenant tables</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={async () => {
              await signInAsSuperAdmin();
              setLocalAdminActive(true);
              window.location.reload();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>1-Click Authenticate as Super Admin</span>
          </button>

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
              ← Return to Candidate Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Master Control Center
            </span>
            <span className="text-slate-400 text-xs">• Central Multi-Tenant RBAC &amp; Domain Authority</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Super Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Provision institutions, register academic email domains for automated tenant assignment, authorize corporate recruiters, and audit global platform events.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <div className="text-[10px] text-slate-500 font-mono">Authenticated Operator</div>
            <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
              {persona.email || 'admin@aura.io'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'credentials'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Portal Credentials ({issuedCredentials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'roles'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>User Role Elevation ({elevatedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('domains')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'domains'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Domain Registry ({domains.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'companies'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Verification ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'feedback'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Feedback Intelligence</span>
        </button>
      </div>

      {/* TAB 0: PORTAL CREDENTIAL GENERATOR & DIRECTORY */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Issue Credential Form */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Issue Dedicated Portal Credentials</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Generate authenticated credentials for Institutional Deans or Company Recruiters. These accounts log in via dedicated isolated portals.
              </p>
            </div>

            {credFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{credFeedback}</span>
              </div>
            )}

            <form onSubmit={handleIssueCredential} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Access Portal:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCredRole('INSTITUTE_ADMIN');
                      setCredOrgName('Parala Maharaja Engineering College');
                      setCredPassword('PMEC@DEAN2026');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition ${
                      credRole === 'INSTITUTE_ADMIN'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold">Institutional</div>
                      <div className="text-[10px] text-slate-500 font-normal">/institutional-login</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCredRole('COMPANY_RECRUITER');
                      setCredOrgName('Global Tech Partner');
                      setCredPassword('RECRUITER@123');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition ${
                      credRole === 'COMPANY_RECRUITER'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold">Company</div>
                      <div className="text-[10px] text-slate-500 font-normal">/company-login</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Email Address:
                </label>
                <input
                  type="email"
                  required
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  placeholder={credRole === 'INSTITUTE_ADMIN' ? 'e.g. 2401109308_ee@pmec.ac.in' : 'e.g. psibaram63@gmail.com'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Representative Name / Title:
                </label>
                <input
                  type="text"
                  required
                  value={credName}
                  onChange={(e) => setCredName(e.target.value)}
                  placeholder={credRole === 'INSTITUTE_ADMIN' ? 'e.g. Indrajit Jena (Dean)' : 'e.g. Sibaram Patro (Talent Partner)'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution / Corporate Organization:
                </label>
                <input
                  type="text"
                  required
                  value={credOrgName}
                  onChange={(e) => setCredOrgName(e.target.value)}
                  placeholder="e.g. Parala Maharaja Engineering College"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Portal Access Password:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    placeholder="Enter secure initial password"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.random().toString(36).slice(-6).toUpperCase();
                      setCredPassword(`AURA@${rand}`);
                    }}
                    className="px-3 py-2 text-[11px] font-bold rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue &amp; Authorize Portal Credentials</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Issued Credentials Directory */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    <span>Issued Portal Credentials ({issuedCredentials.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized portal accounts pre-seeded and dynamically granted by Super Admin.
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {issuedCredentials.map((cred) => (
                  <div
                    key={cred.email}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{cred.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              cred.role === 'INSTITUTE_ADMIN'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            }`}
                          >
                            {cred.role === 'INSTITUTE_ADMIN' ? '🏛️ Institute Dean' : '🏢 Company Recruiter'}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-600 mt-0.5">{cred.email}</div>
                      </div>

                      <Link
                        href={cred.role === 'INSTITUTE_ADMIN' ? '/institutional-login' : '/company-login'}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                      >
                        <span>Open Portal</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Organization</span>
                        <span className="font-medium text-slate-700 text-[11px] truncate block">
                          {cred.organizationName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Access Password</span>
                        <span className="font-mono text-slate-900 font-bold text-[11px] bg-slate-200/60 px-1.5 py-0.5 rounded inline-block">
                          {cred.password}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Issued by: {cred.issuedBy}</span>
                      <span>{new Date(cred.issuedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: USER ROLE ELEVATION DESK */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Elevate User Role */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Elevate User Privileges</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Convert standard accounts (@gmail.com or college emails) into Institute Admins or Corporate Recruiters.
              </p>
            </div>

            {elevationFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{elevationFeedback}</span>
              </div>
            )}

            <form onSubmit={handleElevateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target User Email Address:
                </label>
                <input
                  type="email"
                  required
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="e.g. placement@pmec.ac.in or recruiter@stripe.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name / Contact Title (Optional):
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Mishra (Placement Head)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Privilege Elevation Role:
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono bg-white"
                >
                  <option value="INSTITUTE_ADMIN">INSTITUTE_ADMIN (Institutional EWEIS &amp; Domain Isolation)</option>
                  <option value="COMPANY_RECRUITER">COMPANY_RECRUITER (Candidate Talent Discovery &amp; Match Ledgers)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Master Platform Controller)</option>
                  <option value="STUDENT">STUDENT (Revert to Standard Candidate)</option>
                </select>
              </div>

              {/* Organization selection based on role */}
              {targetRole === 'INSTITUTE_ADMIN' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bound Institution Domain Tenant:
                  </label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs bg-white"
                  >
                    <option value="">Select target institution...</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} (@{inst.domain})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Strict Domain RLS ensures this admin can ONLY view students belonging to this domain.
                  </p>
                </div>
              )}

              {targetRole === 'COMPANY_RECRUITER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bound Enterprise Partner:
                  </label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs bg-white"
                  >
                    <option value="">Select company partner...</option>
                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name} ({comp.industry})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Confirm Role Elevation &amp; Sign Audit Proof</span>
              </button>
            </form>
          </div>

          {/* Right Table: Elevated Users Registry */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Elevated Account Directory ({elevatedUsers.length})
              </h2>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter accounts..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-3">
              {elevatedUsers
                .filter(u => !searchFilter || u.email.toLowerCase().includes(searchFilter.toLowerCase()) || (u.name && u.name.toLowerCase().includes(searchFilter.toLowerCase())))
                .map((elev, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {elev.name || elev.email.split('@')[0]}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          elev.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : elev.role === 'INSTITUTE_ADMIN'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {elev.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {elev.email}
                      </div>
                      {(elev.institutionName || elev.companyName) && (
                        <div className="text-[11px] text-slate-600 mt-1 font-medium">
                          Tenant Scope: <strong>{elev.institutionName || elev.companyName}</strong>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400 font-mono">
                        Elevated: {elev.elevatedAt ? new Date(elev.elevatedAt).toLocaleDateString() : 'Active'}
                      </div>
                      <button
                        onClick={() => {
                          rbacStore.elevateUserRole({
                            actorEmail: persona.email || 'admin@aura.io',
                            targetEmail: elev.email,
                            newRole: 'STUDENT',
                          });
                          refreshData();
                        }}
                        className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 hover:underline mt-1"
                      >
                        Revert to Student
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOMAIN REGISTRY & AUTO-MAPPING */}
      {activeTab === 'domains' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Add New College Domain */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Register College Domain</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Any student signing up with this email suffix will automatically be mapped to this institutional tenant.
              </p>
            </div>

            {domainFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{domainFeedback}</span>
              </div>
            )}

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Domain Suffix:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">@</span>
                  <input
                    type="text"
                    required
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. nitrkl.ac.in, iitb.ac.in, pmec.ac.in"
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Institution / College Name:
                </label>
                <input
                  type="text"
                  required
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  placeholder="e.g. National Institute of Technology, Rourkela"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campus Location:
                </label>
                <input
                  type="text"
                  value={newInstLocation}
                  onChange={(e) => setNewInstLocation(e.target.value)}
                  placeholder="e.g. Rourkela, Odisha, India"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dean / Placement Contact Email:
                </label>
                <input
                  type="email"
                  value={newInstContact}
                  onChange={(e) => setNewInstContact(e.target.value)}
                  placeholder="e.g. placement@nitrkl.ac.in"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register Domain &amp; Enable Automated Mapping</span>
              </button>
            </form>
          </div>

          {/* Right Table: Registered Domains */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Registered Institutional Domains ({domains.length})
            </h2>

            <div className="space-y-3">
              {domains.map((dom) => (
                <div
                  key={dom.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        @{dom.domain}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        dom.isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {dom.isActive ? 'ACTIVE MAPPING' : 'DISABLED'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {dom.institutionName}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Tenant ID: {dom.institutionId}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleDomain(dom.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700"
                    >
                      {dom.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteDomain(dom.id)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Delete domain mapping"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPANY RECRUITER VERIFICATION DESK */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Enterprise Talent Partner Directory
              </h2>
              <p className="text-xs text-slate-500">
                Verified companies permitted to access candidate talent pools and post job opportunities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companies.map((comp) => (
              <div
                key={comp.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800">
                      {comp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      comp.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : comp.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {comp.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{comp.name}</h3>
                    <div className="text-xs text-slate-500">{comp.industry}</div>
                  </div>

                  <div className="text-[11px] text-slate-600 font-mono space-y-0.5 pt-1">
                    <div>Domain: {comp.domain || 'talentpartner.io'}</div>
                    <div>Authorized: {comp.recruiterEmails.join(', ')}</div>
                    <div>Active Roles: {comp.activeJobPostingsCount} positions</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {comp.status === 'pending' ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => handleVerifyCompany(comp.id, 'verified')}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition text-center"
                      >
                        Approve Recruiter
                      </button>
                      <button
                        onClick={() => handleVerifyCompany(comp.id, 'rejected')}
                        className="py-1.5 px-3 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Verified &amp; RLS Authorized
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CRYPTOGRAPHIC AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Privilege Mutation Audit Trail</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cryptographically hashed audit log recording every role elevation and policy override.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Immutable Ledger
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No administrative mutations recorded in this session.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.targetUserEmail}</span>
                      <span className="text-slate-400">elevated from</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {log.previousRole}
                      </span>
                      <span className="text-slate-400">➔</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {log.newRole}
                      </span>
                    </div>
                    {log.targetOrganization && (
                      <div className="text-[11px] text-slate-500">
                        Organization Scope: <strong>{log.targetOrganization}</strong>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[10px] font-mono text-slate-400 shrink-0">
                    <div>Actor: {log.elevatedByEmail}</div>
                    <div className="truncate max-w-xs">{log.auditHash}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: FEEDBACK INTELLIGENCE & ACCURACY TELEMETRY */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cohort Feedback &amp; AI Accuracy Telemetry</h3>
              <p className="text-xs text-slate-500">Real-time analysis of user ratings, feature complaints, and Bayesian preference updating</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              ACTIVE LEARNING RUNNING
            </span>
          </div>

          <FeedbackAnalytics />
        </div>
      )}
    </div>
  );
}
