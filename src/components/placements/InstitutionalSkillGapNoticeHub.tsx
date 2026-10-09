'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Clock, 
  Users, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  Check, 
  MessageSquare, 
  FileText,
  MailCheck,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  CompanyRoleDispatch, 
  InstitutionalStudentNotice, 
  CompanyDispatchedStudent 
} from '@/lib/types/placementDispatch';
import { placementDispatchStore } from '@/lib/engine/PlacementDispatchStore';
import { eventBus } from '@/lib/engine/EventBus';

export function InstitutionalSkillGapNoticeHub() {
  const [dispatches, setDispatches] = useState<CompanyRoleDispatch[]>([]);
  const [selectedDispatchId, setSelectedDispatchId] = useState<string>('');
  const [activeNotices, setActiveNotices] = useState<InstitutionalStudentNotice[]>([]);
  
  // Notice Composer Modal / Drawer state
  const [composingStudent, setComposingStudent] = useState<{
    dispatch: CompanyRoleDispatch;
    student: CompanyDispatchedStudent;
  } | null>(null);
  const [advisoryText, setAdvisoryText] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<'URGENT' | 'HIGH' | 'RECOMMENDED'>('URGENT');
  const [isSending, setIsSending] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const reloadData = () => {
    const dList = placementDispatchStore.getAllDispatches();
    const nList = placementDispatchStore.getAllNotices();
    setDispatches(dList);
    setActiveNotices(nList);
    if (dList.length > 0 && !selectedDispatchId) {
      setSelectedDispatchId(dList[0].id);
    }
  };

  useEffect(() => {
    reloadData();

    const unsubDispatched = eventBus.subscribe('COMPANY_MATCH_DISPATCHED', () => reloadData());
    const unsubNotified = eventBus.subscribe('INSTITUTION_SKILL_GAP_NOTIFIED', () => reloadData());
    const unsubAck = eventBus.subscribe('PLACEMENT_NOTICE_ACKNOWLEDGED', () => reloadData());

    return () => {
      unsubDispatched();
      unsubNotified();
      unsubAck();
    };
  }, []);

  const selectedDispatch = dispatches.find(d => d.id === selectedDispatchId) || dispatches[0];

  const handleOpenNoticeComposer = (dispatch: CompanyRoleDispatch, student: CompanyDispatchedStudent) => {
    const defaultText = `PMEC Placement Cell has officially evaluated your profile for ${dispatch.companyName} (${dispatch.roleTitle}, CTC: ${dispatch.packageCtc}). Your match fit is currently ${student.matchScore}%. While your core foundation is strong, ${dispatch.companyName} strictly requires mastery of: ${student.missingSkills.join(', ')}. Bridge these identified skill gaps using the Skill Roadmap immediately before the technical interview screening.`;
    setAdvisoryText(defaultText);
    setPriorityLevel('URGENT');
    setComposingStudent({ dispatch, student });
  };

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composingStudent) return;

    setIsSending(true);
    const { dispatch, student } = composingStudent;

    // Send via store
    const createdNotice = placementDispatchStore.sendNoticeToStudent(
      dispatch.id,
      student.studentEmail,
      student.studentName,
      advisoryText,
      priorityLevel
    );

    // Call REST API
    try {
      await fetch('/api/placements/institution-notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatchId: dispatch.id,
          studentEmail: student.studentEmail,
          studentName: student.studentName,
          institutionalAdvisory: advisoryText,
          priorityLevel: priorityLevel
        })
      });
    } catch (err) {
      console.warn('Backend notice sync bypassed:', err);
    }

    setIsSending(false);
    setComposingStudent(null);
    reloadData();

    setSuccessToast(`Official Skill Gap Notice dispatched to ${student.studentName} (${student.studentEmail})! Notice will appear dynamically on student page.`);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs flex items-center gap-2 font-medium shadow-sm">
          <MailCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
              Career Advisory &amp; Skill Diagnostics
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              Verified Stream
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Company Match Review &amp; Candidate Diagnostic Notices
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-3xl">
            Review engineering candidate rosters dispatched by hiring partners. Audit missing competencies against position requirements and issue targeted advisories directly to candidates.
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] font-mono text-slate-500 font-semibold uppercase">Notices Issued</div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {activeNotices.length} <span className="text-xs font-normal text-slate-500">records</span>
          </div>
        </div>
      </div>

      {/* Inbound Company Dispatches Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-600 uppercase">
            Active Employer Rosters ({dispatches.length}):
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            PMEC Institutional Scope
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dispatches.map((d) => {
            const isSelected = selectedDispatch && selectedDispatch.id === d.id;
            const notifiedCount = d.matchedStudents.filter(s => s.status === 'NOTIFIED_STUDENT').length;

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDispatchId(d.id)}
                className={`p-4 rounded-xl text-left border transition cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm flex items-center gap-1.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-300' : 'text-indigo-600'}`} />
                    {d.companyName}
                  </span>
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                    isSelected 
                      ? 'bg-slate-800 text-emerald-300 border-slate-700' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {d.packageCtc}
                  </span>
                </div>

                <div className={`text-xs font-medium line-clamp-1 ${isSelected ? 'text-slate-200' : 'text-slate-700'}`}>
                  {d.roleTitle}
                </div>

                <div className={`flex items-center justify-between text-[11px] font-mono pt-1 border-t ${
                  isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                }`}>
                  <span>{d.matchedStudents.length} Candidates</span>
                  <span className={isSelected ? 'text-indigo-300 font-semibold' : 'text-indigo-700 font-semibold'}>
                    {notifiedCount} Notified
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Matched Students & Skill-Gap Breakdown for Selected Dispatch */}
      {selectedDispatch && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  {selectedDispatch.companyName}: {selectedDispatch.roleTitle}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                  CTC {selectedDispatch.packageCtc}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Received: {new Date(selectedDispatch.dispatchedAt).toLocaleString()} • Recruiter: {selectedDispatch.notes}
              </p>
            </div>
          </div>

          {/* Student Cards in this Dispatch */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-700 uppercase">
              Student Candidates &amp; Skill Gap Diagnostic:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDispatch.matchedStudents.map((cand) => {
                const isIndrajit = cand.studentEmail === 'indrajitjena308@gmail.com';
                const isAlreadyNotified = cand.status === 'NOTIFIED_STUDENT';

                return (
                  <div
                    key={cand.studentId}
                    className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition space-y-3.5 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>{cand.studentName}</span>
                            {isIndrajit && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                                ACTIVE CANDIDATE
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {cand.studentEmail} • {cand.department} (CGPA {cand.cgpa})
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {cand.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Acquired Skills */}
                      <div className="text-xs space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                          Verified Skill Fit:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cand.acquiredSkills.map((sk, idx) => (
                            <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* CRITICAL: Missing Skill Gaps */}
                      <div className="text-xs space-y-1.5 p-3 rounded-lg bg-rose-50/70 border border-rose-200">
                        <span className="text-[10px] font-mono font-black text-rose-800 uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Identified Skill Gaps for {selectedDispatch.companyName}:</span>
                        </span>
                        {cand.missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {cand.missingSkills.map((gap, idx) => (
                              <span
                                key={idx}
                                className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-rose-800 border border-rose-300 shadow-2xs"
                              >
                                ✗ {gap}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-emerald-700 font-medium">
                            No critical skill gaps flagged! Candidate meets 100% of core stack requirements.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dispatch Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] font-mono">
                        {isAlreadyNotified ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Notice Issued to Candidate
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending Placement Review
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenNoticeComposer(selectedDispatch, cand)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isAlreadyNotified
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <Send className="w-3 h-3 text-indigo-400" />
                        <span>{isAlreadyNotified ? 'Update Advisory' : 'Issue Skill Advisory'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notice Composer Modal */}
      {composingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 font-bold">
                  <GraduationCap className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Issue Diagnostic Advisory
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Candidate: <strong>{composingStudent.student.studentName}</strong> ({composingStudent.student.studentEmail})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setComposingStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Role:</span>
                <span className="font-semibold text-slate-900">{composingStudent.dispatch.companyName} • {composingStudent.dispatch.roleTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Compensation:</span>
                <span className="font-semibold text-emerald-700">{composingStudent.dispatch.packageCtc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Benchmark Match:</span>
                <span className="font-semibold text-indigo-700">{composingStudent.student.matchScore}%</span>
              </div>
              <div className="pt-1 border-t border-slate-200">
                <span className="text-rose-700 font-semibold">Identified Skill Gaps: </span>
                <span className="text-slate-800 font-medium">{composingStudent.student.missingSkills.join(', ') || 'None'}</span>
              </div>
            </div>

            <form onSubmit={handleSendNotice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 font-mono uppercase">
                  Advisory Urgency:
                </label>
                <div className="flex gap-2">
                  {(['URGENT', 'HIGH', 'RECOMMENDED'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriorityLevel(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                        priorityLevel === p
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 font-mono uppercase">
                  Placement Advisory Message (Visible in Candidate Workspace):
                </label>
                <textarea
                  value={advisoryText}
                  onChange={(e) => setAdvisoryText(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:border-indigo-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setComposingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs font-mono cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isSending ? 'Sending Notice...' : 'Issue Advisory to Candidate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History of Sent Institutional Notices */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center gap-1.5">
          <MailCheck className="w-3.5 h-3.5 text-indigo-700" />
          <span>Active Placement Cell Notices Issued to Students ({activeNotices.length})</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-mono text-slate-500 text-[11px]">
              <tr>
                <th className="px-4 py-2.5 text-left font-bold">Student</th>
                <th className="px-4 py-2.5 text-left font-bold">Target Role &amp; Company</th>
                <th className="px-4 py-2.5 text-left font-bold">Flagged Skill Gaps</th>
                <th className="px-4 py-2.5 text-left font-bold">Date Sent</th>
                <th className="px-4 py-2.5 text-left font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {activeNotices.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div>{n.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{n.studentEmail}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">
                    <span className="font-bold text-indigo-700">{n.companyName}</span> • {n.roleTitle}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {n.missingSkills.map((gap, gIdx) => (
                        <span key={gIdx} className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                    {new Date(n.sentAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      n.status === 'ACKNOWLEDGED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {n.status === 'ACKNOWLEDGED' ? '✓ Acknowledged by Student' : 'Sent to Student'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
