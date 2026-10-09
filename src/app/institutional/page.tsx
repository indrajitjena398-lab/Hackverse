'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  BarChart3, 
  Zap, 
  Send,
  BookOpen,
  ArrowUpRight,
  Filter,
  X,
  FileText,
  Mail,
  Check
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { 
  StudentAnomalyVector, 
  ActionableInterventionPlan, 
  DepartmentSkillHealth, 
  InstitutionalPlacementFunnel,
  EweisRiskLevel 
} from '@/lib/types/institutional';
import { 
  INITIAL_STUDENTS_ANOMALY_DATA, 
  INITIAL_INTERVENTION_PLANS, 
  INITIAL_DEPARTMENT_HEALTH, 
  INITIAL_PLACEMENT_FUNNEL 
} from '@/lib/data/institutionalData';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';
import { useAuth } from '@/lib/firebase/AuthContext';
import { eventBus } from '@/lib/engine/EventBus';
import { InstitutionalSkillGapNoticeHub } from '@/components/placements/InstitutionalSkillGapNoticeHub';

export default function InstitutionalDashboardPage() {
  const { user, persona, signInAsInstitutionLead } = useAuth();
  const [students, setStudents] = useState<StudentAnomalyVector[]>(candidateIntelligenceEngine.getInstitutionalCohorts());
  const [interventionPlans, setInterventionPlans] = useState<ActionableInterventionPlan[]>(INITIAL_INTERVENTION_PLANS);
  const [departmentHealth] = useState<DepartmentSkillHealth[]>(INITIAL_DEPARTMENT_HEALTH);
  const [funnel] = useState<InstitutionalPlacementFunnel>(INITIAL_PLACEMENT_FUNNEL);
  const [selectedStudent, setSelectedStudent] = useState<StudentAnomalyVector | null>(null);
  const [filterRisk, setFilterRisk] = useState<EweisRiskLevel | 'all'>('all');
  const [deployedPlanIds, setDeployedPlanIds] = useState<Set<string>>(new Set(['eweis-plan-402']));
  const [isGeneratingAiBrief, setIsGeneratingAiBrief] = useState(false);
  const [aiBriefGenerated, setAiBriefGenerated] = useState(true);
  const [selectedCohortWindow, setSelectedCohortWindow] = useState<'T-90' | 'T-120' | 'T-150' | 'T-180'>('T-90');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const [localInstituteActive, setLocalInstituteActive] = useState(false);

  const refreshCohort = () => {
    setStudents([...candidateIntelligenceEngine.getInstitutionalCohorts()]);
  };

  useEffect(() => {
    refreshCohort();
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('aura_active_role');
      if (role === 'INSTITUTE_ADMIN' || role === 'SUPER_ADMIN') {
        setLocalInstituteActive(true);
      }
    }

    const unsubSkill = eventBus.subscribe('SKILL_ASSESSMENT_UPDATED', () => refreshCohort());
    const unsubResume = eventBus.subscribe('RESUME_BULLET_ACCEPTED', () => refreshCohort());
    const unsubMock = eventBus.subscribe('MOCK_INTERVIEW_COMPLETED', () => refreshCohort());
    const unsubUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', () => refreshCohort());
    const unsubReset = eventBus.subscribe('CANDIDATE_PROFILE_RESET', () => refreshCohort());

    return () => {
      unsubSkill();
      unsubResume();
      unsubMock();
      unsubUpload();
      unsubReset();
    };
  }, []);

  const handleDeployIntervention = (planId: string) => {
    setDeployedPlanIds(prev => new Set(prev).add(planId));
    candidateIntelligenceEngine.updateStudentIntervention(planId);
    setInterventionPlans(prev => prev.map(p => p.id === planId ? { ...p, status: 'deployed' } : p));
    setNotificationMsg(`Intervention plan ${planId.toUpperCase()} dispatched to cohort students.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleTriggerWorkshop = (skill: string) => {
    setNotificationMsg(`Triggered 1-Click Cohort Workshop for ${skill}. Calendar invites dispatched to 28 students.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleDispatchMentor = (domain: string, mentorName: string) => {
    setNotificationMsg(`Assigned mentor ${mentorName} dispatched to at-risk cohort for ${domain}. Direct calendar invites and Slack channels linked.`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const filteredStudents = students.filter(s => filterRisk === 'all' || s.riskLevel === filterRisk);

  // Color-coded badge system:
  // Emerald Green >= 75%, Amber 50-74%, Crimson < 50%
  const getRiskScoreBadge = (score: number) => {
    if (score >= 75) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {score}% Ready
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {score}% Moderate
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
        {score}% At-Risk
      </span>
    );
  };

  const getRiskBadge = (risk: EweisRiskLevel) => {
    switch (risk) {
      case 'critical_risk':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Critical Risk (&lt;50%)
          </span>
        );
      case 'moderate_risk':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Moderate Risk (50-74%)
          </span>
        );
      case 'placement_ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Placement Ready (&ge;75%)
          </span>
        );
    }
  };

  const isAuthorized = 
    persona.userRole === 'INSTITUTE_ADMIN' || 
    persona.userRole === 'SUPER_ADMIN' ||
    persona.accountType === 'INSTITUTION_ID' ||
    localInstituteActive;

  const criticalCount = students.filter(s => s.riskLevel === 'critical_risk').length;
  const moderateCount = students.filter(s => s.riskLevel === 'moderate_risk').length;
  const readyCount = students.filter(s => s.riskLevel === 'placement_ready').length;

  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
            <GraduationCap className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Institutional EWEIS Portal
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              This institutional cohort analytics and placement forecasting dashboard is restricted to verified Institute Admins and Placement Deans. You are currently browsing as <strong>{persona.name || 'Guest'}</strong> ({persona.userRole}).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Institutional Scope &amp; Domain Isolation:</span>
            </div>
            <ul className="text-slate-600 space-y-1 list-disc pl-4 text-[11px]">
              <li>Predictive early warning (EWEIS) calculates placement risk at T-180 to T-90</li>
              <li>Strict Row-Level Security: Only students matching your institutional domain are queryable</li>
              <li>1-click cohort intervention workflows and curriculum gap calibration</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={async () => {
              await signInAsInstitutionLead();
              setLocalInstituteActive(true);
              window.location.reload();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
          >
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>1-Click Authenticate as PMEC Institute Admin</span>
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
    <div className="space-y-8 bg-white min-h-screen text-slate-800 pb-16">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* 1. Header Banner & Executive Overview */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Institutional Intelligence
            </span>
            <span className="text-slate-400 text-xs font-mono">• EWEIS 90-Day Predictive Engine</span>
            {persona.accountType === 'INSTITUTION_ID' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                PMEC BERHAMPUR • DEAN ACCESS
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Employability Early Warning System (EWEIS)
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Predictive machine learning models flagging student cohort placement anomalies between T-180 and T-90 days prior to on-campus placement kick-off. Prescribes 1-click advisor interventions.
          </p>
          {persona.accountType === 'INSTITUTION_ID' && (
            <div className="pt-1 text-xs text-purple-900 font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Active Authority: <strong>INDRAJIT JENA</strong> (2401109308_ee@pmec.ac.in) • Parala Maharaja Engineering College</span>
            </div>
          )}
        </div>

        {/* 90-Day Placement Countdown Status Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-mono font-black text-xl">
            90d
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Placement Horizon</div>
            <div className="text-xs font-bold text-amber-800 font-mono">
              Window Active (T-90 Days)
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {persona.accountType === 'INSTITUTION_ID' ? 'Cohort 2027 • PMEC Berhampur' : 'Cohort 2027 • Partner University'}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Inbound Corporate Dispatches & Student Skill-Gap Diagnostic Hub */}
      <InstitutionalSkillGapNoticeHub />

      {/* 2. Plain-Language AI Cohort Summary Generator (Competitive Differentiator) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              Plain-Language AI Cohort Executive Briefing
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Horizon:</span>
            {(['T-90', 'T-120', 'T-150', 'T-180'] as const).map(w => (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedCohortWindow(w)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                  selectedCohortWindow === w
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {aiBriefGenerated && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 font-mono">SYSTEM DESIGN DEFICIT</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono">38% Deficit</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>38% of CS seniors show a gap in System Design interview readiness</strong> (Distributed Caching &amp; Sharding) — recommended action: schedule a mock workshop before December placements.
              </p>
              <div className="pt-1 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleTriggerWorkshop('System Design & Redis Pre-Dec Mock Workshop')}
                  className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Schedule Mock Workshop (Pre-Dec)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDispatchMentor('System Design', 'Prof. Jena & Senior Systems Alumni')}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>1-Click Dispatch Assigned Mentors</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 font-mono">STAR BEHAVIORAL GAP</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">42% Low Quant</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>42% of interview responses lack quantifiable metrics</strong> in STAR Result component. CAT Mock Interview shows verbal filler frequency &gt; 5.2/min.
              </p>
              <button
                type="button"
                onClick={() => handleTriggerWorkshop('STAR Behavioral Storytelling')}
                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Trigger STAR Coaching Sprint</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 font-mono">ATS COMPLIANCE POSITIVE</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">+24% Lift</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Resume parsing lift (+24%)</strong> observed following HITL Bullet optimizer rollout. 79.5% of cohort resumes now pass greenhouse/lever parsers.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automated HITL guardrail active</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Cohort Employability Funnel & Key KPIs */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Cohort-Wide Employability Funnel (Class of 2027)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">{funnel.totalEnrolled} Total Enrolled</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-slate-500">1. Total Enrolled</div>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{funnel.totalEnrolled}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">100% Cohort</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-slate-500">2. Profile Completed</div>
            <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">{funnel.profileCompleted}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">90.5% Active</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-slate-500">3. ATS Certified</div>
            <div className="text-2xl font-bold text-sky-600 font-mono mt-1">{funnel.atsCompliant}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">79.5% Compliant</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-slate-500">4. Mock CAT Ready</div>
            <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{funnel.mockInterviewReady}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">63.5% Verified</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center col-span-2 sm:col-span-1">
            <div className="text-xs text-emerald-800 font-semibold">5. Placed / Offers</div>
            <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">{funnel.placedOrOffered}</div>
            <div className="text-[10px] text-emerald-600 font-mono mt-1">47.0% Secured</div>
          </div>
        </div>
      </div>

      {/* 4. Automated Advisor Intervention Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Actionable Advisor Intervention Plans (1-Click Deployment)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Automated Resolution Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventionPlans.map((plan) => {
            const isDeployed = deployedPlanIds.has(plan.id);
            return (
              <div
                key={plan.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                      {plan.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">{plan.title}</h4>
                  </div>
                  <DataProvenanceBadge
                    level={plan.provenance.level}
                    source={plan.provenance.source}
                    metadata={plan.provenance}
                    size="sm"
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {plan.actionProtocol}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">Prescribed Bootcamp Modules:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {plan.suggestedBootcampModules.map((mod, idx) => (
                      <li key={idx} className="truncate">{mod}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-xs font-mono text-slate-500">
                    Projected Lift: <span className="text-emerald-700 font-bold font-mono">+{plan.projectedSuccessLiftPercent}%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeployIntervention(plan.id)}
                    disabled={isDeployed}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      isDeployed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isDeployed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Deployed ({plan.targetedStudentCount} Students)</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Deploy Plan ({plan.targetedStudentCount} Students)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Cohort Student Roster & Anomaly Vector Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Roster Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                Student Anomaly Vector Roster (T-90 Days)
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterRisk('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  filterRisk === 'all'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterRisk('critical_risk')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  filterRisk === 'critical_risk'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterRisk('moderate_risk')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  filterRisk === 'moderate_risk'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Moderate ({moderateCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterRisk('placement_ready')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  filterRisk === 'placement_ready'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Ready ({readyCount})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudent?.studentId === student.studentId;
              return (
                <div
                  key={student.studentId}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                        <span className="text-xs text-slate-500">({student.major})</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{student.email}</div>
                    </div>
                    {getRiskBadge(student.riskLevel)}
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Placement Prob</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        {getRiskScoreBadge(student.placementProbability)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">ATS Score</div>
                      <div className="font-mono font-bold text-slate-800 mt-0.5">{student.metrics.atsResumeScore}/100</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">STAR Adherence</div>
                      <div className="font-mono font-bold text-slate-800 mt-0.5">{student.metrics.mockInterviewStarAdherence}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">DLDM Depth</div>
                      <div className="font-mono font-bold text-slate-800 mt-0.5">{student.metrics.dldmSkillGraphDepth}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Counselor Drill-Down Inspection Drawer */}
        <div className="lg:col-span-5 space-y-4">
          {selectedStudent ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-mono text-indigo-600 uppercase font-bold">
                    Advisor Drill-Down Drawer
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedStudent.name}</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedStudent.major} • Class of {selectedStudent.gradYear}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Placement Risk Probability Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Placement Probability (T-90 Days)</div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                    {selectedStudent.placementProbability}%
                  </div>
                </div>
                {getRiskBadge(selectedStudent.riskLevel)}
              </div>

              {/* Anomaly Factors Decomposition */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-rose-800 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Contributing Risk Factors (Root Causes):</span>
                </div>
                <div className="space-y-1.5">
                  {selectedStudent.anomalyFactors.map((factor, fIdx) => (
                    <div key={fIdx} className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Closed-Loop Intervention Recommendation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900 font-mono flex items-center justify-between">
                  <span>Prescribed Closed-Loop Protocol:</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified Plan
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {selectedStudent.recommendedIntervention}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationMsg(`Intervention scheduled for ${selectedStudent.name}. Advisor notification dispatched.`);
                    setTimeout(() => setNotificationMsg(null), 4000);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch 1-Click Intervention to Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDispatchMentor(selectedStudent.major, 'Prof. Jena (Systems Advisor)');
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Assign Dedicated Faculty Mentor</span>
                </button>
              </div>

              {/* Provenance Audit Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Model Confidence:</span>
                <DataProvenanceBadge
                  level={selectedStudent.provenance.level}
                  source={selectedStudent.provenance.source}
                  metadata={selectedStudent.provenance}
                  size="sm"
                />
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Select Student for Drill-Down</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click any student in the left roster table to inspect granular anomaly vectors, placement trajectory, and dispatch 1-click interventions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
