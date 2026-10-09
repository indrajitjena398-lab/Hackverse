'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  Key, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Building,
  Sparkles,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { rbacStore } from '@/lib/security/rbacStore';
import { useAuth } from '@/lib/firebase/AuthContext';

function InstitutionalLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/institutional';
  const { refreshPersona } = useAuth();

  const [email, setEmail] = useState('2401109308_ee@pmec.ac.in');
  const [password, setPassword] = useState('PMEC@DEAN2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = rbacStore.verifyCredential(email, password, 'INSTITUTE_ADMIN');

      if (!result.success) {
        setError(result.error || 'Invalid Institutional Administrator credentials');
        setIsLoading(false);
        return;
      }

      // Sync cookies for Next.js middleware and route guards
      document.cookie = 'aura_active_role=INSTITUTE_ADMIN; path=/; max-age=86400; SameSite=Lax';
      document.cookie = `aura_active_email=${email.toLowerCase().trim()}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = 'aura_has_completed_onboarding=true; path=/; max-age=86400; SameSite=Lax';

      localStorage.setItem('aura_active_email', email.toLowerCase().trim());
      localStorage.setItem('aura_active_role', 'INSTITUTE_ADMIN');

      refreshPersona();

      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const fillPmecCredentials = () => {
    setEmail('2401109308_ee@pmec.ac.in');
    setPassword('PMEC@DEAN2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Candidate Platform</span>
        </Link>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-sm mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          College &amp; University Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Institutional Career Offices • FERPA-Isolated 90-Day Early Warning Engine (EWEIS)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-2xl shadow-xs space-y-6">
          {/* Seed credentials card */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-indigo-900 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Verified College Dean Credentials
              </span>
              <button
                type="button"
                onClick={fillPmecCredentials}
                className="text-[10px] font-mono font-bold text-indigo-700 hover:underline"
              >
                Auto-Fill PMEC
              </button>
            </div>
            <div className="font-mono text-[11px] text-indigo-800 space-y-0.5">
              <div>Institution: <span className="font-semibold">Parala Maharaja Engineering College</span></div>
              <div>Email: <span className="font-semibold">2401109308_ee@pmec.ac.in</span></div>
              <div>Password: <span className="font-semibold">PMEC@DEAN2026</span></div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Institutional Email ID (@college.edu / @pmec.ac.in)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dean@pmec.ac.in"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-xs text-slate-900 font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Issued Administrator Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-xs text-slate-900 font-medium transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Institutional Authority...</span>
                </>
              ) : (
                <>
                  <Building className="w-3.5 h-3.5" />
                  <span>Sign In as College Administrator</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Alternate Portals */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <Link href="/company-login" className="hover:text-indigo-600 transition font-medium">
              🏢 Recruiter Portal
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/admin/login" className="hover:text-indigo-600 transition font-medium">
              🛡️ Master Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstitutionalLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>}>
      <InstitutionalLoginContent />
    </React.Suspense>
  );
}
