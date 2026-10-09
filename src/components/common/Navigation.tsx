'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Compass, 
  Building2, 
  Mic, 
  FileText, 
  GitFork, 
  Kanban, 
  GraduationCap, 
  Sparkles,
  LayoutDashboard,
  Search,
  Activity,
  LogIn,
  Github,
  Bot,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Milestone,
  Video,
  MessageSquare,
  Database,
  Cpu
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { eventBus } from '@/lib/engine/EventBus';
import { AuraCommandCenterModal } from './AuraCommandCenterModal';
import { GovernanceEventStreamDrawer } from './GovernanceEventStreamDrawer';
import { CareerDigitalTwinModal } from './CareerDigitalTwinModal';
import { AuthModal } from './AuthModal';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);
  const [isDigitalTwinOpen, setIsDigitalTwinOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, persona } = useAuth();
  const [eventCount, setEventCount] = useState(1);

  useEffect(() => {
    const unsub = eventBus.subscribe('PROFILE_MUTATED', () => {
      setEventCount(eventBus.getRecentEvents().length);
    });
    setEventCount(eventBus.getRecentEvents().length);
    return unsub;
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isOnboarded = persona.userRole !== 'STUDENT' || persona.hasCompletedOnboarding;
  const isSuperAdmin = persona.userRole === 'SUPER_ADMIN';
  const isInstituteAdmin = persona.userRole === 'INSTITUTE_ADMIN';
  const isCompanyRecruiter = persona.userRole === 'COMPANY_RECRUITER';
  const isStudent = !isSuperAdmin && !isInstituteAdmin && !isCompanyRecruiter;
  const elevatedPortal = isSuperAdmin
    ? '/admin'
    : isInstituteAdmin
    ? '/institutional'
    : isCompanyRecruiter
    ? '/company'
    : null;

  // Global keyboard shortcuts: Ctrl+K (Command Center), Ctrl+D (Digital Twin), Ctrl+G (Governance), Escape (Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea (unless Ctrl/Cmd is held)
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandCenterOpen(prev => !prev);
        return;
      }

      if ((e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDigitalTwinOpen(prev => !prev);
        return;
      }

      if ((e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsGovernanceOpen(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsCommandCenterOpen(false);
        setIsDigitalTwinOpen(false);
        setIsGovernanceOpen(false);
        setIsAuthModalOpen(false);
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to cross-module modal open triggers via EventBus
  useEffect(() => {
    const unsubModal = eventBus.subscribe('TRIGGER_MODAL' as any, (event: any) => {
      const modal = event.payload?.modal;
      if (modal === 'command_center') setIsCommandCenterOpen(true);
      if (modal === 'digital_twin') setIsDigitalTwinOpen(true);
      if (modal === 'governance') setIsGovernanceOpen(true);
      if (modal === 'auth') setIsAuthModalOpen(true);
    });
    return unsubModal;
  }, []);

  const studentLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, requiresOnboarding: false },
    ...(!isOnboarded ? [{
      href: '/onboarding',
      label: 'Profile Setup',
      icon: Sparkles,
      requiresOnboarding: false,
      isGateBadge: true
    }] : []),
    { href: '/coherence', label: 'Career Profile', icon: Database, requiresOnboarding: true },
    { href: '/roadmap', label: 'Learning Roadmap', icon: Milestone, requiresOnboarding: true },
    { href: '/interviews', label: 'Interview Transcripts', icon: Video, requiresOnboarding: true },
    { href: '/jobs', label: 'Job Matching', icon: Compass, requiresOnboarding: true },
    { href: '/mock-interview', label: 'Mock Interviews', icon: Mic, requiresOnboarding: true },
    { href: '/resume', label: 'Resume Review', icon: FileText, requiresOnboarding: true },
    { href: '/skill-graph', label: 'Skill Graph', icon: GitFork, requiresOnboarding: true },
    { href: '/tracker', label: 'Applications', icon: Kanban, requiresOnboarding: true },
  ];

  const navLinks = isSuperAdmin
    ? [{ href: '/admin', label: 'Admin Console', icon: ShieldCheck, requiresOnboarding: false }]
    : isInstituteAdmin
    ? [{ href: '/institutional', label: 'Placement Portal', icon: GraduationCap, requiresOnboarding: false }]
    : isCompanyRecruiter
    ? [{ href: '/company', label: 'Recruiter Portal', icon: Building2, requiresOnboarding: false }]
    : studentLinks;

  // Helper to get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.displayName) {
      const parts = user.displayName.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getFirstName = () => {
    if (!user) return '';
    if (user.displayName) {
      return user.displayName.trim().split(' ')[0];
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Left-Side Vertical Navigation Sidebar (Fixed & Sticky) */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 z-50 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header: Custom Engineered Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-mono font-bold text-xs tracking-tight shadow-xs group-hover:bg-slate-800 transition shrink-0">
              AU
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-900">
                  AURA
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Technical Career Platform
              </span>
            </div>
          </Link>

          {/* Close Mobile Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Navigation Items */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Navigation
            </div>
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const isLocked = false;
                const targetHref = link.href;

                return (
                  <Link
                    key={link.href}
                    href={targetHref}
                    title={isLocked ? 'Complete Onboarding to unlock this module' : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : (link as any).isGateBadge
                        ? 'text-slate-900 bg-amber-50/80 border border-amber-200 font-bold'
                        : isLocked
                        ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${
                        isActive 
                          ? 'text-white' 
                          : (link as any).isGateBadge
                          ? 'text-amber-700'
                          : isLocked
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`} />
                      <span className={`truncate ${isLocked ? 'text-slate-400' : ''}`}>{link.label}</span>
                    </div>

                    {isLocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Locked</span>
                      </span>
                    ) : (link as any).isGateBadge ? (
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-600 text-white">
                        SETUP
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Tools & Analysis */}
          {isStudent && <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Tools &amp; Diagnostics
            </div>
            <div className="space-y-1">
              {/* GitHub Skills Radar */}
              <Link
                href="/github-skills"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  pathname === '/github-skills'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
                title="Verify Technical Skills from Git Repositories"
              >
                <Github className={`w-4 h-4 shrink-0 ${pathname === '/github-skills' ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">GitHub Code Analysis</span>
              </Link>

              {/* AI Copilot */}
              <Link
                href="/copilot"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  pathname === '/copilot'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
                title="Context-Aware Technical Career Assistant"
              >
                <Bot className={`w-4 h-4 shrink-0 ${pathname === '/copilot' ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">Career Assistant</span>
              </Link>

              {/* Feedback Loop */}
              <Link
                href="/feedback"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  pathname === '/feedback'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
                title="Model Calibration Feedback History"
              >
                <MessageSquare className={`w-4 h-4 shrink-0 ${pathname === '/feedback' ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">Feedback History</span>
              </Link>

              {/* Neural Matching Engine (NN Model) */}
              <Link
                href="/neural-engine"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  pathname === '/neural-engine'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
                title="Neural Feature Fusion Model Diagnostics"
              >
                <Cpu className={`w-4 h-4 shrink-0 ${pathname === '/neural-engine' ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">Neural Model Engine</span>
              </Link>

              {/* Search Diagnostics */}
              <button
                type="button"
                onClick={() => setIsCommandCenterOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition text-left"
                title="Natural Language Query & Reasoning"
              >
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">Search Diagnostics</span>
              </button>

              {/* Career Scenarios Trigger */}
              <button
                type="button"
                onClick={() => setIsDigitalTwinOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition text-left"
                title="Simulate Role Transitions and Salary Scenarios"
              >
                <Sparkles className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">Career Scenarios</span>
              </button>

              {/* Audit Log Drawer Toggle */}
              <button
                type="button"
                onClick={() => setIsGovernanceOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition text-left"
                title="System Event Stream and State Mutators"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Audit Log</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-mono font-medium">
                  {eventCount}
                </span>
              </button>
            </div>
          </div>}
        </div>

        {/* Sidebar Footer: System Status & Dedicated Portals */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between p-2 rounded-xl text-xs bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-slate-800 truncate">
                  {isSuperAdmin ? 'Admin OS' : isInstituteAdmin ? 'Institution OS' : isCompanyRecruiter ? 'Recruiter OS' : 'Student OS'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  {isSuperAdmin ? 'Platform Governance' : isInstituteAdmin ? 'Cohort Intelligence' : isCompanyRecruiter ? 'Talent Operations' : 'Deterministic Calibration'}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              ONLINE
            </span>
          </div>

          {/* Portals Access Footer */}
          <div className="pt-1 border-t border-slate-200/60">
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1 mb-1">
              Dedicated Portals
            </div>
            <div className="flex items-center justify-between px-1 text-[11px] font-medium text-slate-500">
              <Link href="/institutional-login" className="hover:text-indigo-600 transition">
                🏛️ College
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/company-login" className="hover:text-indigo-600 transition">
                🏢 Recruiter
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/admin/login" className="hover:text-indigo-600 transition">
                🛡️ Admin
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Header Bar (Positioned at the Top of the Page, Login Button at Top-Right) */}
      <header className="sticky top-0 z-30 w-full lg:pl-64 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left Area: Mobile Menu Toggle & Student Context */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active portal indicator */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 tracking-tight hidden sm:inline">
                {isSuperAdmin ? 'Admin Governance Console' : isInstituteAdmin ? 'Institutional Placement Portal' : isCompanyRecruiter ? 'Recruiter Talent Portal' : 'Engineering Career Platform'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                v2.0
              </span>
            </div>
          </div>

          {/* Right Area: Login Button Neatly in Top-Right Corner */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick search button in top bar on larger screens */}
            {isStudent && (
              <>
                <button
                  type="button"
                  onClick={() => setIsCommandCenterOpen(true)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium transition"
                  title="Global Natural Language Reasoning"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Search (Ctrl+K)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDigitalTwinOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition"
                  title="Career Digital Twin Simulator (Ctrl+D)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Digital Twin</span>
                </button>
              </>
            )}

            {/* The Login Button (Retained at the top-right of page) */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition shrink-0 ${
                user
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white shadow-xs font-semibold'
              }`}
            >
              {user ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                    {persona.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left leading-none max-w-[120px]">
                    <span className="truncate text-slate-900 font-semibold text-[11px]">
                      {persona.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono truncate">
                      {persona.accountType === 'INSTITUTION_ID' ? '🏛️ Institute' : persona.accountType === 'COMPANY_ID' ? '🏢 Company' : '🎓 Student'}
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <AuraCommandCenterModal
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
      />

      <GovernanceEventStreamDrawer
        isOpen={isGovernanceOpen}
        onClose={() => setIsGovernanceOpen(false)}
      />

      <CareerDigitalTwinModal
        isOpen={isDigitalTwinOpen}
        onClose={() => setIsDigitalTwinOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
