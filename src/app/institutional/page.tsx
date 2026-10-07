'use client';

import React, { useState, useEffect } from 'react';
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
  Send, 
  Layers, 
  BarChart3, 
  Zap,
  ArrowUpRight,
  Filter
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
import { eventBus } from '@/lib/engine/EventBus';

export default function InstitutionalDashboardPage() {
  const [students, setStudents] = useState<StudentAnomalyVector[]>(candidateIntelligenceEngine.getInstitutionalCohorts());
  const [interventionPlans, setInterventionPlans] = useState<ActionableInterventionPlan[]>(INITIAL_INTERVENTION_PLANS);
  const [departmentHealth, setDepartmentHealth] = useState<DepartmentSkillHealth[]>(INITIAL_DEPARTMENT_HEALTH);
  const [funnel, setFunnel] = useState<InstitutionalPlacementFunnel>(INITIAL_PLACEMENT_FUNNEL);
  const [selectedStudent, setSelectedStudent] = useState<StudentAnomalyVector | null>(students[0]);
  const [filterRisk, setFilterRisk] = useState<EweisRiskLevel | 'all'>('all');
  const [deployedPlanIds, setDeployedPlanIds] = useState<Set<string>>(new Set(['eweis-plan-402']));

  const refreshCohort = () => {
    setStudents([...candidateIntelligenceEngine.getInstitutionalCohorts()]);
  };

  useEffect(() => {
    refreshCohort();

    const unsubscribe = eventBus.subscribe('SKILL_ASSESSMENT_UPDATED', () => refreshCohort());
    const unsubscribeResume = eventBus.subscribe('RESUME_BULLET_ACCEPTED', () => refreshCohort());
    const unsubscribeMock = eventBus.subscribe('MOCK_INTERVIEW_COMPLETED', () => refreshCohort());
    const unsubscribeUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', () => refreshCohort());
    const unsubscribeReset = eventBus.subscribe('CANDIDATE_PROFILE_RESET', () => refreshCohort());

    return () => {
      unsubscribe();
      unsubscribeResume();
      unsubscribeMock();
      unsubscribeUpload();
      unsubscribeReset();
    };
  }, []);

  const handleDeployIntervention = (planId: string) => {
    setDeployedPlanIds(prev => new Set(prev).add(planId));
    candidateIntelligenceEngine.updateStudentIntervention(planId);
    setInterventionPlans(prev => prev.map(p => p.id === planId ? { ...p, status: 'deployed' } : p));
  };

  const filteredStudents = students.filter(s => filterRisk === 'all' || s.riskLevel === filterRisk);

  const getRiskBadge = (risk: EweisRiskLevel) => {
    switch (risk) {
      case 'critical_risk':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700/80 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Critical At-Risk (&lt;45%)
          </span>
        );
      case 'moderate_risk':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/80 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Moderate Risk (45-70%)
          </span>
        );
      case 'placement_ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Placement Ready (&gt;70%)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel-elevated border border-amber-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              Novelty Feature 3 &amp; Module 8 Specification
            </span>
            <span className="text-slate-500 text-xs">• Institutional Early Warning &amp; Early Intervention System (EWEIS)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Career Center Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Predictive analytics model that isolates at-risk student cohorts 90 days before campus placement season. Automatically prescribes actionable intervention plans with 1-click advisor execution.
          </p>
        </div>

        {/* 90-Day Placement Countdown Timer Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/90 border border-amber-900/60 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-600 text-amber-400 flex items-center justify-center font-mono font-black text-lg">
            90d
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400">Campus Placement Season</div>
            <div className="text-xs font-bold text-amber-300 uppercase font-mono">
              EWEIS Window Active (T-90 Days)
            </div>
          </div>
        </div>
      </div>

      {/* Cohort-Wide Employability Funnel Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Cohort-Wide Employability Funnel (Class of 2026)</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">400 Total Enrolled</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">1. Total Enrolled</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">{funnel.totalEnrolled}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">100% Cohort</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">2. Profile Completed</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{funnel.profileCompleted}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">90.5% Conversion</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">3. ATS Certified</div>
            <div className="text-2xl font-bold text-sky-400 font-mono mt-1">{funnel.atsCompliant}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">79.5% Conversion</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">4. Mock Interview Ready</div>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{funnel.mockInterviewReady}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">63.5% Conversion</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center col-span-2 sm:col-span-1">
            <div className="text-xs text-emerald-300">5. Placed / Offers</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{funnel.placedOrOffered}</div>
            <div className="text-[10px] text-emerald-500 font-mono mt-1">47.0% Placed</div>
          </div>
        </div>
      </div>

      {/* Actionable Intervention Plans Banner */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Automated Intervention Plans (Early Warning Resolution)</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">1-Click Advisor Deployment</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventionPlans.map((plan) => {
            const isDeployed = deployedPlanIds.has(plan.id);
            return (
              <div
                key={plan.id}
                className="p-5 rounded-2xl glass-panel border border-amber-900/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                      {plan.id}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{plan.title}</h4>
                  </div>
                  <DataProvenanceBadge
                    level={plan.provenance.level}
                    source={plan.provenance.source}
                    metadata={plan.provenance}
                    size="sm"
                  />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {plan.riskTrigger}
                </p>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="text-indigo-300 font-semibold">Action Protocol:</div>
                  <div className="text-slate-400">{plan.actionProtocol}</div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs font-mono text-emerald-400 font-bold">
                    Projected Lift: +{plan.projectedSuccessLiftPercent}% First-Round Pass
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeployIntervention(plan.id)}
                    disabled={isDeployed}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isDeployed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                    }`}
                  >
                    {isDeployed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Deployed to {plan.targetedStudentCount} Students</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Deploy Intervention ({plan.targetedStudentCount} Students)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Counselor View: At-Risk Student Anomaly Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Roster Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Predictive Student Anomaly Vectors (T-90 Days)</span>
            </h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterRisk('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                  filterRisk === 'all' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRisk('critical_risk')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                  filterRisk === 'critical_risk' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Critical At-Risk
              </button>
              <button
                onClick={() => setFilterRisk('moderate_risk')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                  filterRisk === 'moderate_risk' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Moderate
              </button>
              <button
                onClick={() => setFilterRisk('placement_ready')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                  filterRisk === 'placement_ready' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Ready
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
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{student.name}</h4>
                        <span className="text-xs text-slate-400">({student.major})</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{student.email}</div>
                    </div>
                    {getRiskBadge(student.riskLevel)}
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">Placement Prob</div>
                      <div className="font-mono font-bold text-white mt-0.5">{student.placementProbability}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">ATS Score</div>
                      <div className="font-mono font-bold text-indigo-300 mt-0.5">{student.metrics.atsResumeScore}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">STAR Adherence</div>
                      <div className="font-mono font-bold text-amber-300 mt-0.5">{student.metrics.mockInterviewStarAdherence}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">DLDM Depth</div>
                      <div className="font-mono font-bold text-emerald-300 mt-0.5">{student.metrics.dldmSkillGraphDepth}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Counselor Deep Dive on Selected Student */}
        <div className="lg:col-span-5 space-y-4">
          {selectedStudent ? (
            <div className="p-6 rounded-2xl glass-panel-elevated border border-slate-700 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400 uppercase font-bold">
                    Granular Counselor Inspection View
                  </span>
                  {getRiskBadge(selectedStudent.riskLevel)}
                </div>
                <h3 className="text-xl font-black text-white mt-1">{selectedStudent.name}</h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedStudent.major} • Class of {selectedStudent.gradYear}
                </div>
              </div>

              {/* Anomaly Vector Factors */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-rose-300 uppercase">
                  Detected Anomaly Vectors &amp; Bottlenecks:
                </div>
                <div className="space-y-1.5">
                  {selectedStudent.anomalyFactors.map((factor, fIdx) => (
                    <div key={fIdx} className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Prescribed Actionable Intervention:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedStudent.recommendedIntervention}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Prediction Model:</span>
                <DataProvenanceBadge
                  level={selectedStudent.provenance.level}
                  source={selectedStudent.provenance.source}
                  metadata={selectedStudent.provenance}
                  size="sm"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Departmental Skill Distribution Heatmap */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Departmental Competency Distribution Heatmaps</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Real-Time DLDM Aggregations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departmentHealth.map((dept, dIdx) => (
            <div key={dIdx} className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">{dept.department}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>{dept.studentCount} Students</span>
                  <span className="text-emerald-400 font-mono font-bold">Avg Readiness: {dept.averageReadinessScore}%</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {dept.skillsDistribution.map((skill, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300">{skill.skillName}</span>
                      <span className="font-mono text-slate-400">
                        <span className="text-emerald-400">{skill.masteredPercent}%</span> / <span className="text-rose-400">{skill.gapPercent}% gap</span>
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${skill.masteredPercent}%` }} title={`Mastered: ${skill.masteredPercent}%`} />
                      <div className="bg-amber-500 h-full" style={{ width: `${skill.inProgressPercent}%` }} title={`In Progress: ${skill.inProgressPercent}%`} />
                      <div className="bg-rose-500 h-full" style={{ width: `${skill.gapPercent}%` }} title={`Gap: ${skill.gapPercent}%`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
