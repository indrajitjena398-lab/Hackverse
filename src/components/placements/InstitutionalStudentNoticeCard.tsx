'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  GraduationCap, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { InstitutionalStudentNotice } from '@/lib/types/placementDispatch';
import { placementDispatchStore } from '@/lib/engine/PlacementDispatchStore';
import { eventBus } from '@/lib/engine/EventBus';

interface InstitutionalStudentNoticeCardProps {
  studentEmail: string;
}

export function InstitutionalStudentNoticeCard({ studentEmail }: InstitutionalStudentNoticeCardProps) {
  const [notices, setNotices] = useState<InstitutionalStudentNotice[]>([]);
  const [acknowledgedMap, setAcknowledgedMap] = useState<Record<string, boolean>>({});

  const reloadNotices = () => {
    const list = placementDispatchStore.getNoticesForStudent(studentEmail);
    setNotices(list);
  };

  useEffect(() => {
    reloadNotices();

    const unsubNotified = eventBus.subscribe('INSTITUTION_SKILL_GAP_NOTIFIED', () => {
      reloadNotices();
    });

    const unsubDispatched = eventBus.subscribe('COMPANY_MATCH_DISPATCHED', () => {
      reloadNotices();
    });

    return () => {
      unsubNotified();
      unsubDispatched();
    };
  }, [studentEmail]);

  const handleAcknowledge = async (noticeId: string) => {
    placementDispatchStore.acknowledgeNotice(noticeId);
    setAcknowledgedMap(prev => ({ ...prev, [noticeId]: true }));
    reloadNotices();

    // Sync to backend API
    try {
      await fetch(`/api/placements/student-notices/${encodeURIComponent(studentEmail)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeId }),
      });
    } catch (e) {
      console.warn('Backend sync bypassed:', e);
    }
  };

  if (notices.length === 0) return null;

  return (
    <div className="space-y-4">
      {notices.map((notice) => {
        const isAcknowledged = notice.status === 'ACKNOWLEDGED' || acknowledgedMap[notice.id];

        return (
          <div
            key={notice.id}
            className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 border-2 border-amber-300 shadow-md relative overflow-hidden transition"
          >
            {/* Top Tag & Officer Origin */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-700" />
                  Official College Placement Cell Notice
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                  {notice.priorityLevel} ACTION REQUIRED
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(notice.sentAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Main Content: Company Match & Identified Skill Gaps */}
            <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Company & Role Match Breakdown */}
              <div className="lg:col-span-4 space-y-3">
                <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {notice.companyName}
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-700">
                      {notice.packageCtc}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {notice.roleTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-600 font-mono">Matched Score:</span>
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">
                        {notice.matchScore}% Fit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acquired Skills */}
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-700 text-[11px] uppercase font-mono">
                    ✓ Skills You Already Possess:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {notice.acquiredSkills.map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: CRITICAL MISSING SKILL GAPS & Placement Advisory */}
              <div className="lg:col-span-8 space-y-3.5 flex flex-col justify-between">
                {/* Identified Skill Gaps Alert Box */}
                <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase font-mono">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Missing Stack Gaps Required by {notice.companyName}:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {notice.missingSkills.map((gap, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 font-mono text-xs font-bold shadow-2xs flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Official College Advisory Message */}
                <div className="p-3.5 rounded-xl bg-amber-100/60 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <span className="font-bold text-amber-900 block font-mono text-[11px]">
                    Institutional Placement Advisory:
                  </span>
                  <p className="leading-relaxed">
                    &ldquo;{notice.institutionalAdvisory}&rdquo;
                  </p>
                  <div className="text-[10px] text-amber-800 font-medium pt-1">
                    — {notice.sentByOfficerName}
                  </div>
                </div>

                {/* 1-Click Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <Link
                    href={`/roadmap`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition font-mono"
                  >
                    <span>Bridge Skill Gaps on Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleAcknowledge(notice.id)}
                    disabled={isAcknowledged}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                      isAcknowledged
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-white hover:bg-amber-100 text-slate-800 border border-amber-300 shadow-2xs'
                    }`}
                  >
                    {isAcknowledged ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Notice Acknowledged</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-slate-600" />
                        <span>Acknowledge Notice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
