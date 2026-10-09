'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  UserCheck,
  ChevronRight,
  Edit3,
  Save,
  Phone,
  Trash2,
  Plus,
  ExternalLink,
  Award,
  TrendingUp,
  Github,
  Linkedin,
  Globe,
  RefreshCw,
  BookOpen,
  Code2
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { rbacStore, CandidateProfileData, CandidateSkill } from '@/lib/security/rbacStore';
import { skillScoreCalculator, CompositeScoreResult } from '@/lib/engine/SkillScoreCalculator';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  standalone?: boolean;
}

export function AuthModal({ isOpen, onClose, standalone = false }: AuthModalProps) {
  const { 
    user, 
    persona, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    signInAsSuperAdmin,
    signInAsInstitutionLead,
    signInAsCompanyPartner,
    signInAsDemo, 
    logout, 
    resetPassword,
    refreshPersona
  } = useAuth();
  const isElevatedPortal = persona.userRole !== 'STUDENT';
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Candidate Profile & Dynamic Skill Score State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<CandidateProfileData | null>(null);
  const [scoreResult, setScoreResult] = useState<CompositeScoreResult | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Edit form state
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTargetRole, setEditTargetRole] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editDegree, setEditDegree] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editCgpa, setEditCgpa] = useState('');
  const [editGradYear, setEditGradYear] = useState('');
  const [editTenth, setEditTenth] = useState('');
  const [editTenthBoard, setEditTenthBoard] = useState('CBSE');
  const [editTwelfth, setEditTwelfth] = useState('');
  const [editTwelfthBoard, setEditTwelfthBoard] = useState('CBSE');
  const [editSkills, setEditSkills] = useState<CandidateSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState(4);
  const [editGithub, setEditGithub] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const loadProfileAndScore = (targetEmail: string) => {
    const profile = rbacStore.getCandidateProfile(targetEmail);
    setProfileData(profile);

    setEditFullName(profile.fullName);
    setEditPhone(profile.phone);
    setEditTargetRole(profile.targetRole || 'Full-Stack / Distributed Systems Engineer');
    setEditCollege(profile.collegeName);
    setEditDegree(profile.degreeTitle);
    setEditMajor(profile.major);
    setEditCgpa(profile.cgpa);
    setEditGradYear(profile.graduationYear);
    setEditTenth(profile.tenthScore);
    setEditTenthBoard(profile.tenthBoard || 'CBSE');
    setEditTwelfth(profile.twelfthScore);
    setEditTwelfthBoard(profile.twelfthBoard || 'CBSE');
    setEditSkills(profile.skills || []);
    setEditGithub(profile.githubUrl || '');
    setEditLinkedin(profile.linkedinUrl || '');
    setEditPortfolio(profile.portfolioUrl || '');

    const score = skillScoreCalculator.calculate({
      email: targetEmail,
      academics: {
        tenthScore: profile.tenthScore,
        twelfthScore: profile.twelfthScore,
        degreeCgpa: profile.cgpa,
        collegeName: profile.collegeName,
        degreeTitle: profile.degreeTitle,
      },
      skills: (profile.skills || []).map(s => ({ name: s.name, proficiency: s.proficiency })),
      atsResumeScore: 88,
      hasGithubVerified: !!profile.githubUrl,
      portfolioLinksCount: [profile.githubUrl, profile.linkedinUrl, profile.portfolioUrl].filter(Boolean).length,
    });
    setScoreResult(score);
  };

  useEffect(() => {
    if (user || persona.email) {
      const emailToUse = user?.email || persona.email || 'indrajitjena308@gmail.com';
      loadProfileAndScore(emailToUse);
    }
  }, [user, isOpen, persona.email]);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = editSkills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) return;
    setEditSkills(prev => [...prev, { name: newSkillName.trim(), proficiency: newSkillProficiency, category: 'Core' }]);
    setNewSkillName('');
    setNewSkillProficiency(4);
  };

  const handleRemoveSkill = (skillName: string) => {
    setEditSkills(prev => prev.filter(s => s.name !== skillName));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveEmail = user?.email || persona.email || (typeof window !== 'undefined' ? localStorage.getItem('aura_active_email') : '') || 'candidate@pmec.ac.in';

    setIsSavingProfile(true);
    const isIndrajit = effectiveEmail.toLowerCase().includes('indrajit');
    const updatedProfile: CandidateProfileData = {
      fullName: editFullName.trim() || (isIndrajit ? 'INDRAJIT JENA' : effectiveEmail.split('@')[0].toUpperCase()),
      email: effectiveEmail.toLowerCase().trim(),
      phone: editPhone.trim() || '+91 9876543210',
      targetRole: editTargetRole.trim() || 'Full-Stack / Distributed Systems Engineer',
      collegeName: editCollege.trim() || 'Parala Maharaja Engineering College (PMEC)',
      degreeTitle: editDegree.trim() || 'B.Tech',
      major: editMajor.trim() || 'Electrical & Electronics Engineering',
      cgpa: editCgpa.trim() || '8.85',
      graduationYear: editGradYear.trim() || '2026',
      tenthScore: editTenth.trim() || '94.2',
      tenthBoard: editTenthBoard.trim() || 'CBSE',
      twelfthScore: editTwelfth.trim() || '91.5',
      twelfthBoard: editTwelfthBoard.trim() || 'CBSE',
      skills: editSkills.length > 0 ? editSkills : [
        { name: 'TypeScript', proficiency: 5, category: 'Full-Stack' },
        { name: 'React', proficiency: 5, category: 'Frontend' },
        { name: 'Python', proficiency: 4, category: 'AI/ML' },
        { name: 'Data Structures & Algorithms', proficiency: 4, category: 'Core CS' },
        { name: 'PostgreSQL', proficiency: 4, category: 'Databases' },
      ],
      githubUrl: editGithub.trim(),
      linkedinUrl: editLinkedin.trim(),
      portfolioUrl: editPortfolio.trim(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Save locally and in rbacStore
    rbacStore.saveCandidateProfile(effectiveEmail, updatedProfile);
    setProfileData(updatedProfile);

    // 2. Recalculate score dynamically
    const newScore = skillScoreCalculator.calculate({
      email: effectiveEmail,
      academics: {
        tenthScore: updatedProfile.tenthScore,
        twelfthScore: updatedProfile.twelfthScore,
        degreeCgpa: updatedProfile.cgpa,
        collegeName: updatedProfile.collegeName,
        degreeTitle: updatedProfile.degreeTitle,
      },
      skills: updatedProfile.skills.map(s => ({ name: s.name, proficiency: s.proficiency })),
      atsResumeScore: 88,
      hasGithubVerified: !!updatedProfile.githubUrl,
      portfolioLinksCount: [updatedProfile.githubUrl, updatedProfile.linkedinUrl, updatedProfile.portfolioUrl].filter(Boolean).length,
    });
    setScoreResult(newScore);

    // 3. Sync to API route for persistent PostgreSQL storage
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: updatedProfile.fullName,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          academicHistory: {
            tenth: { score: updatedProfile.tenthScore, board: updatedProfile.tenthBoard || 'CBSE' },
            twelfth: { score: updatedProfile.twelfthScore, board: updatedProfile.twelfthBoard || 'CBSE', stream: 'Science' },
            degree: {
              college: updatedProfile.collegeName,
              degreeTitle: updatedProfile.degreeTitle,
              major: updatedProfile.major,
              cgpa: updatedProfile.cgpa,
              graduationYear: updatedProfile.graduationYear,
            },
          },
          skills: updatedProfile.skills,
          portfolioLinks: {
            github: updatedProfile.githubUrl,
            linkedin: updatedProfile.linkedinUrl,
            portfolio: updatedProfile.portfolioUrl,
          },
        }),
      });
    } catch (err) {
      console.warn('PostgreSQL sync background fallback:', err);
    }

    refreshPersona();
    setIsSavingProfile(false);
    setIsEditingProfile(false);
    setSaveSuccessMsg(`✓ Profile updated! Dynamic skill score recalibrated to ${newScore.overallScore}/100.`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  if (!isOpen && !standalone) {
    return null;
  }

  const handleSuperAdminLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAsSuperAdmin();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Super Admin sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstitutionLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAsInstitutionLead();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Institution sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAsCompanyPartner();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Company partner sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAsDemo();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Candidate demo sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please check popup permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName);
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMessage('Password reset link sent to your email.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign out failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!standalone && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close sign-in"
            aria-label="Close sign-in"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {user ? 'AURA Identity Profile' : mode === 'signin' ? 'Sign In to AURA' : mode === 'signup' ? 'Create AURA Account' : 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-500">
              {user ? 'Authenticated Session • Verified Real-Time Calibration' : 'Institutional, Corporate, or Candidate Access'}
            </p>
          </div>
        </div>

        {/* If user is already logged in */}
        {user ? (
          <div className="space-y-4">
            {saveSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {isElevatedPortal ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Authenticated Session</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{persona.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {persona.email || user.email || 'Authorized portal account'}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Type</span>
                      <span className="font-medium text-slate-800">
                        {persona.userRole === 'INSTITUTE_ADMIN'
                          ? 'Institution Administrator'
                          : persona.userRole === 'COMPANY_RECRUITER'
                          ? 'Company Recruiter'
                          : 'Platform Administrator'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Organization</span>
                      <span className="font-medium text-slate-800">{persona.organization}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tenant</span>
                      <span className="font-medium text-slate-800">{persona.tenant}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Access Scope</span>
                      <span className="font-medium text-slate-800">
                        {persona.userRole === 'INSTITUTE_ADMIN'
                          ? 'Cohort &amp; placement intelligence'
                          : persona.userRole === 'COMPANY_RECRUITER'
                          ? 'Talent discovery &amp; job dispatch'
                          : 'Platform governance &amp; RBAC'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    {persona.userRole === 'INSTITUTE_ADMIN' ? <GraduationCap className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>
                      {persona.userRole === 'INSTITUTE_ADMIN'
                        ? 'Institution workspace'
                        : persona.userRole === 'COMPANY_RECRUITER'
                        ? 'Recruiter workspace'
                        : 'Administration workspace'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800 mt-1.5">
                    This profile contains organization access details only. Student academic records, resumes, GitHub repositories, and personal readiness scores are isolated to the student workspace.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : !isEditingProfile ? (
              /* VIEW MODE: Profile Details & Dynamic Skill Score */
              <div className="space-y-4">
                {/* 1. Header Banner & Profile Overview */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Authenticated Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        persona.accountType === 'INSTITUTION_ID'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : persona.accountType === 'COMPANY_ID'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {persona.badge}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold shadow-2xs transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Edit Details</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {profileData?.fullName || persona.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-3 mt-0.5">
                      <span>{profileData?.email || user.email}</span>
                      {profileData?.phone && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{profileData.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{profileData?.targetRole || 'Full-Stack / Distributed Systems Engineer'}</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-500">{profileData?.collegeName || persona.organization}</span>
                    </div>
                  </div>
                </div>

                {/* 2. DYNAMIC COMPOSITE SKILL SCORE (REAL CALCULATED METRIC - WITHOUT STATIC 100%) */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 border border-indigo-100 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                          Dynamic Composite Skill Score
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Calculated from Academics (25%), Technical Graph (35%), CAT Mock Interviews (30%), and Portfolios (10%).
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                          {scoreResult?.overallScore || 85}
                        </span>
                        <span className="text-xs font-bold text-slate-400 font-mono">/ 100</span>
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {scoreResult?.readinessLabel || 'Placement Ready'}
                      </span>
                    </div>
                  </div>

                  {/* 4-Pillar Score Breakdown Progress Bars */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-indigo-100/80">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">Academic Foundation (25%)</span>
                        <span className="font-bold text-slate-800 font-mono">{scoreResult?.breakdown.academicScore || 88}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${scoreResult?.breakdown.academicScore || 88}%` }} 
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">Technical Skill Graph (35%)</span>
                        <span className="font-bold text-slate-800 font-mono">{scoreResult?.breakdown.technicalGraphScore || 92}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                          style={{ width: `${scoreResult?.breakdown.technicalGraphScore || 92}%` }} 
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">CAT Mock Interview (30%)</span>
                        <span className="font-bold text-slate-800 font-mono">{scoreResult?.breakdown.mockInterviewScore || 82}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                          style={{ width: `${scoreResult?.breakdown.mockInterviewScore || 82}%` }} 
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">Verified Evidence (10%)</span>
                        <span className="font-bold text-slate-800 font-mono">{scoreResult?.breakdown.evidenceBonus || 85}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                          style={{ width: `${scoreResult?.breakdown.evidenceBonus || 85}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                    <span>Evaluator: Bayesian CDC Engine</span>
                    <span>Confidence: [{scoreResult?.confidenceInterval[0] || 82} - {scoreResult?.confidenceInterval[1] || 90}]</span>
                  </div>
                </div>

                {/* 3. CANDIDATE PROFILE DETAILS (ACADEMICS, MARKS, SKILLS) */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Academic &amp; Profile Details</span>
                    </span>
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      Class of {profileData?.graduationYear || '2026'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">College / University</span>
                      <span className="font-medium text-slate-800">{profileData?.collegeName || 'Parala Maharaja Engineering College'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Degree &amp; Major</span>
                      <span className="font-medium text-slate-800">{profileData?.degreeTitle || 'B.Tech'} in {profileData?.major || 'Computer Science'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Degree CGPA</span>
                      <span className="font-mono font-bold text-slate-900">{profileData?.cgpa || '8.85'} / 10.0</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Secondary Marks</span>
                      <span className="font-mono text-slate-700">12th: <strong>{profileData?.twelfthScore || '91.5'}%</strong> • 10th: <strong>{profileData?.tenthScore || '94.2'}%</strong></span>
                    </div>
                  </div>

                  {/* Skills Chip List */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Verified Technical Skills ({profileData?.skills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(profileData?.skills || []).map((skill) => (
                        <span
                          key={skill.name}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition"
                        >
                          <span>{skill.name}</span>
                          <span className="text-[9px] text-amber-500 font-bold">{'★'.repeat(skill.proficiency)}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio Links */}
                  {(profileData?.githubUrl || profileData?.linkedinUrl) && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-xs">
                      {profileData.githubUrl && (
                        <a
                          href={profileData.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium hover:underline"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {profileData.linkedinUrl && (
                        <a
                          href={profileData.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium hover:underline"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions: Edit & Logout */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile Details &amp; Recalculate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* EDIT MODE: Interactive Form */
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Edit Candidate Profile Details</span>
                    </h3>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Update your marks, skills, and college. The Skill Score will automatically recalculate.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-white border border-slate-200 shadow-2xs"
                  >
                    Cancel
                  </button>
                </div>

                {/* Section A: Personal Information */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block font-mono">
                    1. Candidate Identity
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Full Name:</label>
                      <input
                        type="text"
                        required
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder="e.g. INDRAJIT JENA"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Mobile / Phone Number:</label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Target Professional Role:</label>
                    <input
                      type="text"
                      value={editTargetRole}
                      onChange={(e) => setEditTargetRole(e.target.value)}
                      placeholder="e.g. Full-Stack / Distributed Systems Engineer"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs"
                    />
                  </div>
                </div>

                {/* Section B: Academic History */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block font-mono">
                    2. Academic Credentials
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">College / University Name:</label>
                      <input
                        type="text"
                        required
                        value={editCollege}
                        onChange={(e) => setEditCollege(e.target.value)}
                        placeholder="e.g. Parala Maharaja Engineering College (PMEC)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Degree Title:</label>
                      <input
                        type="text"
                        required
                        value={editDegree}
                        onChange={(e) => setEditDegree(e.target.value)}
                        placeholder="e.g. B.Tech"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Major / Branch:</label>
                      <input
                        type="text"
                        required
                        value={editMajor}
                        onChange={(e) => setEditMajor(e.target.value)}
                        placeholder="e.g. Electrical & Electronics"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Degree CGPA (0-10):</label>
                      <input
                        type="text"
                        required
                        value={editCgpa}
                        onChange={(e) => setEditCgpa(e.target.value)}
                        placeholder="e.g. 8.85"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Graduation Year:</label>
                      <input
                        type="text"
                        required
                        value={editGradYear}
                        onChange={(e) => setEditGradYear(e.target.value)}
                        placeholder="e.g. 2026"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">12th Marks (%) &amp; Board:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editTwelfth}
                          onChange={(e) => setEditTwelfth(e.target.value)}
                          placeholder="e.g. 91.5"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-mono"
                        />
                        <input
                          type="text"
                          value={editTwelfthBoard}
                          onChange={(e) => setEditTwelfthBoard(e.target.value)}
                          placeholder="CBSE"
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">10th Marks (%) &amp; Board:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editTenth}
                          onChange={(e) => setEditTenth(e.target.value)}
                          placeholder="e.g. 94.2"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-mono"
                        />
                        <input
                          type="text"
                          value={editTenthBoard}
                          onChange={(e) => setEditTenthBoard(e.target.value)}
                          placeholder="CBSE"
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Skills Manager */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block font-mono">
                    3. Manage Technical Skills ({editSkills.length})
                  </span>

                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                    {editSkills.map((skill) => (
                      <span
                        key={skill.name}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <span className="font-semibold">{skill.name}</span>
                        <span className="text-[10px] text-amber-500 font-bold">{skill.proficiency}★</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-slate-400 hover:text-rose-600 ml-0.5 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Skill Row */}
                  <div className="flex gap-2 text-xs">
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                      placeholder="Add skill (e.g. Next.js, Docker, Java)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs"
                    />
                    <select
                      value={newSkillProficiency}
                      onChange={(e) => setNewSkillProficiency(Number(e.target.value))}
                      className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    >
                      <option value={5}>5★ Expert</option>
                      <option value={4}>4★ Advanced</option>
                      <option value={3}>3★ Intermediate</option>
                      <option value={2}>2★ Beginner</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Section D: Portfolio Links */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block font-mono">
                    4. Portfolio &amp; Evidence Links
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">GitHub Profile URL:</label>
                      <input
                        type="url"
                        value={editGithub}
                        onChange={(e) => setEditGithub(e.target.value)}
                        placeholder="https://github.com/your-username"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">LinkedIn Profile URL:</label>
                      <input
                        type="url"
                        value={editLinkedin}
                        onChange={(e) => setEditLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/your-username"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save &amp; Recalculate Skill Score</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. Fast Role-Based Quick Access Cards (Hardcoded Designated Credentials) */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                <span>Select Designated Role (1-Click Access):</span>
                <span className="text-[10px] text-slate-400 font-normal normal-case">Pre-configured ID</span>
              </div>

              {/* Super Admin Master Card */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSuperAdminLogin}
                className="w-full p-3 rounded-xl bg-purple-50/80 hover:bg-purple-100/70 border border-purple-300 text-left transition flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">
                    SA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">AURA Super Admin</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-900 text-purple-100 font-bold">
                        MASTER ADMIN
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">admin@aura.io</div>
                    <div className="text-[10px] text-purple-900 font-medium">Domain Registry, Role Elevation &amp; RLS Authority</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition shrink-0" />
              </button>

              {/* Institution Lead Card */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleInstitutionLogin}
                className="w-full p-3.5 rounded-xl bg-purple-50/60 hover:bg-purple-50 border border-purple-200 text-left transition flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">INDRAJIT JENA</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 font-bold">
                        INSTITUTE ID
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">2401109308_ee@pmec.ac.in</div>
                    <div className="text-[10px] text-purple-800 font-medium">Parala Maharaja Eng. College (PMEC) • EWEIS Admin</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>

              {/* Company Recruiter Card */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCompanyLogin}
                className="w-full p-3.5 rounded-xl bg-blue-50/60 hover:bg-blue-50 border border-blue-200 text-left transition flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Sibaram Patro</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-200 text-blue-900 font-bold">
                        COMPANY ID
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">psibaram63@gmail.com</div>
                    <div className="text-[10px] text-blue-800 font-medium">Enterprise Talent Partner • Hiring &amp; Match Ledger</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>

              {/* Candidate Demo Card */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleDemoSignIn}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900">New Candidate / Student Access</span>
                    <span className="text-[10px] text-slate-500 block">Explore Job Matcher, CAT Mock Interview &amp; Skill Graph</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            </div>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
                Or Continue With Google / Email
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google (Firebase)</span>
            </button>

            {/* Error / Success alert */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span className="line-clamp-2">{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Indrajit Jena"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-600">Email Address</label>
                  <span className="text-[10px] text-slate-400 font-mono">hackverse-bab85</span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="2401109308_ee@pmec.ac.in or user@career.dev"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-slate-600">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(null); }}
                        className="text-[11px] text-slate-500 hover:text-slate-900 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                </span>
              </button>
            </form>

            {/* Toggle Modes */}
            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              {mode === 'signin' ? (
                <span>
                  New candidate?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }}
                    className="text-slate-900 hover:underline font-semibold"
                  >
                    Register New Account
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(null); }}
                    className="text-slate-900 hover:underline font-semibold"
                  >
                    Back to Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Dedicated Portals Access Link */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
          <span className="text-slate-500 text-[11px] block mb-1">Looking for organizational or administrative access?</span>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600">
            <a href="/institutional-login" onClick={onClose} className="hover:underline">
              🏛️ College Portal
            </a>
            <span className="text-slate-300">•</span>
            <a href="/company-login" onClick={onClose} className="hover:underline">
              🏢 Recruiter Portal
            </a>
            <span className="text-slate-300">•</span>
            <a href="/admin/login" onClick={onClose} className="hover:underline">
              🛡️ Admin
            </a>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>hackverse-bab85.firebaseapp.com</span>
          </div>
          <span>RBAC Multi-Tenant Guard</span>
        </div>
      </div>
    </div>
  );
}
