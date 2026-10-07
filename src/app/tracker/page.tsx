'use client';

import React, { useState, useEffect } from 'react';
import { 
  Kanban, 
  Clock, 
  Mail, 
  Calendar, 
  Sparkles, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { ApplicationCard, ApplicationStage, GeneratedFollowUpDraft, ParsedEmailInterviewInvite } from '@/lib/types/tracker';
import { DataProvenanceBadge } from '@/components/common/DataProvenanceBadge';
import { eventBus } from '@/lib/engine/EventBus';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';

const STAGES: { id: ApplicationStage; label: string; color: string }[] = [
  { id: 'wishlist', label: 'Wishlist', color: 'border-slate-700 bg-slate-900/40 text-slate-300' },
  { id: 'applied', label: 'Applied', color: 'border-blue-900/70 bg-blue-950/20 text-blue-300' },
  { id: 'in_review', label: 'In Review', color: 'border-indigo-900/70 bg-indigo-950/20 text-indigo-300' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-amber-900/70 bg-amber-950/20 text-amber-300' },
  { id: 'offer', label: 'Offer Received', color: 'border-emerald-900/70 bg-emerald-950/20 text-emerald-300' },
  { id: 'rejected', label: 'Archived / Rejected', color: 'border-rose-900/70 bg-rose-950/20 text-rose-400' },
];

const INITIAL_APPLICATIONS: ApplicationCard[] = [
  {
    id: 'app-01',
    jobId: 'job-str-01',
    company: 'Stripe',
    role: 'Senior Distributed Systems Engineer',
    stage: 'interviewing',
    appliedDate: '2026-09-12',
    lastActivityDate: '2026-09-22',
    daysSinceLastActivity: 8,
    salaryText: '$195k - $255k',
    needsFollowUpWarning: true,
    upcomingInterviewDate: '2026-10-04 at 10:00 AM PST',
    notes: 'Completed Round 2 Integration screen with flying colors. Awaiting Round 3 Distributed System Design schedule.',
    provenance: {
      level: 'verified',
      source: 'Stripe Greenhouse Production Webhook',
      confidenceScore: 99,
      lastVerifiedAt: '2026-09-22',
      auditHash: '0x1928374aa1',
    },
  },
  {
    id: 'app-02',
    jobId: 'job-databricks-02',
    company: 'Databricks',
    role: 'AI Platform & Retrieval Systems Engineer',
    stage: 'in_review',
    appliedDate: '2026-09-19',
    lastActivityDate: '2026-09-19',
    daysSinceLastActivity: 11,
    salaryText: '$180k - $240k',
    needsFollowUpWarning: true,
    notes: 'Application forwarded by Stanford Alumni referral.',
    provenance: {
      level: 'verified',
      source: 'Databricks Lever Applicant Tracking API',
      confidenceScore: 98,
      lastVerifiedAt: '2026-09-19',
      auditHash: '0x2938475bb2',
    },
  },
  {
    id: 'app-03',
    jobId: 'job-uber-03',
    company: 'Uber',
    role: 'Backend Platform Engineer',
    stage: 'applied',
    appliedDate: '2026-09-26',
    lastActivityDate: '2026-09-26',
    daysSinceLastActivity: 4,
    salaryText: '$175k - $230k',
    needsFollowUpWarning: false,
    provenance: {
      level: 'verified',
      source: 'Uber Careers Verified Portal',
      confidenceScore: 97,
      lastVerifiedAt: '2026-09-26',
      auditHash: '0x3948576cc3',
    },
  },
  {
    id: 'app-04',
    jobId: 'job-figma-04',
    company: 'Figma',
    role: 'Full-Stack Performance Engineer',
    stage: 'wishlist',
    appliedDate: '2026-09-28',
    lastActivityDate: '2026-09-28',
    daysSinceLastActivity: 2,
    salaryText: '$165k - $220k',
    needsFollowUpWarning: false,
    provenance: {
      level: 'aggregated',
      source: 'Candidate Saved Job Target',
      confidenceScore: 95,
      lastVerifiedAt: '2026-09-28',
    },
  },
];

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<ApplicationCard[]>(INITIAL_APPLICATIONS);
  const [selectedAppForFollowUp, setSelectedAppForFollowUp] = useState<ApplicationCard | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedFollowUpDraft | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Email parser state
  const profile = candidateIntelligenceEngine.getProfile();
  const [emailSnippet, setEmailSnippet] = useState(
    `From: recruiting@stripe.com\nSubject: Next Steps - Distributed Systems Round 3 Architecture\nHi ${profile.name.split(' ')[0] || profile.name}, thanks for your patience! We would love to invite you to Round 3: Distributed System Architecture with Staff Engineer Elena Vance. The interview is scheduled for Friday, Oct 4 at 10:00 AM PST. Zoom link: https://stripe.zoom.us/j/992834710`
  );
  const [parsedInvite, setParsedInvite] = useState<ParsedEmailInterviewInvite | null>(null);

  useEffect(() => {
    const unsubUpload = eventBus.subscribe('RESUME_UPLOADED_AND_PARSED', () => {
      const p = candidateIntelligenceEngine.getProfile();
      setEmailSnippet(
        `From: recruiting@stripe.com\nSubject: Next Steps - Distributed Systems Round 3 Architecture\nHi ${p.name.split(' ')[0] || p.name}, thanks for your patience! We would love to invite you to Round 3: Distributed System Architecture with Staff Engineer Elena Vance. The interview is scheduled for Friday, Oct 4 at 10:00 AM PST. Zoom link: https://stripe.zoom.us/j/992834710`
      );
    });

    const unsubscribe = eventBus.subscribe('APPLICATION_STATUS_CHANGED', (evt) => {
      const { jobId, company, role, stage } = evt.payload;
      setApplications(prev => {
        const existing = prev.find(a => a.jobId === jobId);
        if (existing) {
          return prev.map(a => a.jobId === jobId ? { ...a, stage } : a);
        } else {
          const newCard: ApplicationCard = {
            id: `app-${Date.now()}`,
            jobId,
            company,
            role,
            stage: stage || 'applied',
            appliedDate: new Date().toISOString().split('T')[0],
            lastActivityDate: new Date().toISOString().split('T')[0],
            daysSinceLastActivity: 0,
            needsFollowUpWarning: false,
            provenance: {
              level: 'verified',
              source: 'Candidate OS Job Sync Pipeline',
              confidenceScore: 98,
              lastVerifiedAt: new Date().toISOString().split('T')[0],
            },
          };
          return [...prev, newCard];
        }
      });
    });

    return () => {
      unsubUpload();
      unsubscribe();
    };
  }, []);

  const moveStage = (appId: string, newStage: ApplicationStage) => {
    setApplications(prev => prev.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          stage: newStage,
          lastActivityDate: new Date().toISOString().split('T')[0],
          daysSinceLastActivity: 0,
          needsFollowUpWarning: false,
        };
      }
      return a;
    }));
  };

  const handleGenerateFollowUp = (app: ApplicationCard) => {
    setSelectedAppForFollowUp(app);
    setCopiedDraft(false);

    const currentProfile = candidateIntelligenceEngine.getProfile();

    // AI Follow-up Draft Logic
    const draft: GeneratedFollowUpDraft = {
      recipient: `Talent Partner at ${app.company}`,
      subject: `Follow-up regarding ${app.role} interview status - ${currentProfile.name}`,
      body: `Hi ${app.company} Recruiting Team,\n\nI hope you're having a productive week! I am following up on my application for the ${app.role} position. I completed the previous round on ${app.lastActivityDate} and really enjoyed discussing high-throughput scalable architectures.\n\nI remain very excited about the mission at ${app.company}. Please let me know if there are any additional materials or updates regarding the timeline for the next stage.\n\nBest regards,\n${currentProfile.name}\n${currentProfile.email}`,
      tone: 'professional_polite',
      suggestedAction: `Send follow-up email (Status has been idle for ${app.daysSinceLastActivity} days).`,
      daysStale: app.daysSinceLastActivity,
    };

    setGeneratedDraft(draft);
  };

  const handleParseEmail = () => {
    // Parser simulation
    setParsedInvite({
      rawEmailSnippet: emailSnippet,
      parsedCompany: 'Stripe',
      parsedRole: 'Senior Distributed Systems Engineer',
      parsedInterviewDate: 'Friday, Oct 4, 2026',
      parsedInterviewTime: '10:00 AM PST',
      parsedInterviewerNames: ['Elena Vance (Staff Systems Engineer)'],
      parsedMeetingLink: 'https://stripe.zoom.us/j/992834710',
      confidenceScore: 98,
    });
  };

  const handleConfirmCalendarInvite = () => {
    if (!parsedInvite) return;
    setApplications(prev => prev.map(a => {
      if (a.company.toLowerCase().includes('stripe')) {
        return {
          ...a,
          stage: 'interviewing',
          upcomingInterviewDate: `${parsedInvite.parsedInterviewDate} at ${parsedInvite.parsedInterviewTime}`,
          notes: `Round 3 scheduled with ${parsedInvite.parsedInterviewerNames.join(', ')}. Zoom: ${parsedInvite.parsedMeetingLink}`,
        };
      }
      return a;
    }));
    setParsedInvite(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel-elevated border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              Module 7 Specification
            </span>
            <span className="text-slate-500 text-xs">• Kanban Board &amp; Automated Career Workflow Automation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Unified Application Tracker &amp; Follow-Up Automation
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Monitor pipeline velocity across stages. Automatically alerts when applications exceed inactivity thresholds (&gt;7 days) and drafts personalized recruiter follow-ups.
          </p>
        </div>

        {/* Status Count Metric */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-mono">Active Applications:</span>
            <span className="text-lg font-bold text-white font-mono">{applications.length} Tracked</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              {applications.filter(a => a.needsFollowUpWarning).length} Needs Follow-up
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAGES.map((stage) => {
          const stageApps = applications.filter(a => a.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col min-h-[500px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-bold font-mono uppercase text-slate-200">
                  {stage.label}
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono flex items-center justify-center font-bold">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards in this stage */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2.5 shadow-md relative group hover:border-indigo-500/60 transition"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{app.role}</h4>
                        <div className="text-[11px] font-semibold text-indigo-300 mt-0.5">{app.company}</div>
                      </div>
                    </div>

                    {app.salaryText && (
                      <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        <span>{app.salaryText}</span>
                      </div>
                    )}

                    {/* Status Age Warning Badge */}
                    {app.needsFollowUpWarning && (
                      <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/60 text-[10px] text-amber-300 flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Idle for {app.daysSinceLastActivity} days • Follow-up due</span>
                      </div>
                    )}

                    {app.upcomingInterviewDate && (
                      <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-[10px] text-indigo-200 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{app.upcomingInterviewDate}</span>
                      </div>
                    )}

                    {/* Move Stage Selector & Action Buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleGenerateFollowUp(app)}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        title="Generate Contextual AI Follow-up Email"
                      >
                        <Mail className="w-3 h-3" />
                        <span>AI Draft</span>
                      </button>

                      <select
                        value={app.stage}
                        onChange={(e) => moveStage(app.id, e.target.value as ApplicationStage)}
                        className="text-[10px] bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Automation Section: AI Email Follow-up Generator & Email Parser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Follow-Up Draft Modal / Panel */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Follow-Up Email Generator</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Stage Age Threshold Triggered</span>
          </div>

          {generatedDraft ? (
            <div className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">To: <strong className="text-white">{generatedDraft.recipient}</strong></span>
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono">
                  {generatedDraft.tone.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs">
                <span className="text-slate-400 font-mono">Subject: </span>
                <span className="text-white font-semibold">{generatedDraft.subject}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-mono">
                {generatedDraft.body}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-amber-400 font-mono">
                  {generatedDraft.suggestedAction}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDraft.body);
                    setCopiedDraft(true);
                    setTimeout(() => setCopiedDraft(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDraft ? 'Copied to Clipboard!' : 'Copy Email Draft'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
              Click &quot;AI Draft&quot; on any application card above to generate a polite, contextual recruiter follow-up.
            </div>
          )}
        </div>

        {/* Right Column: Email / Calendar Invitation Parser Simulator */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Email &amp; Calendar Invitation Parser</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">NLP AST Ingestion</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-mono">
              Paste Interview Confirmation Email:
            </label>
            <textarea
              value={emailSnippet}
              onChange={(e) => setEmailSnippet(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleParseEmail}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Parse &amp; Extract Calendar Event</span>
            </button>
          </div>

          {parsedInvite && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-mono font-bold text-emerald-300">
                <span>Extracted Event Details:</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-200">
                  {parsedInvite.confidenceScore}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Company: <strong>{parsedInvite.parsedCompany}</strong></div>
                <div>Role: <strong>{parsedInvite.parsedRole}</strong></div>
                <div>Date: <strong>{parsedInvite.parsedInterviewDate}</strong></div>
                <div>Time: <strong>{parsedInvite.parsedInterviewTime}</strong></div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleConfirmCalendarInvite}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Confirm &amp; Sync to Tracker
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
