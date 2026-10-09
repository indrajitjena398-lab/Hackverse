'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Key, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { rbacStore } from '@/lib/security/rbacStore';
import { useAuth } from '@/lib/firebase/AuthContext';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin';
  const { refreshPersona } = useAuth();

  const [email, setEmail] = useState('indrajit@aura.in');
  const [password, setPassword] = useState('PMEC@123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = rbacStore.verifyCredential(email, password, 'SUPER_ADMIN');

      if (!result.success) {
        setError(result.error || 'Invalid Super Admin credentials');
        setIsLoading(false);
        return;
      }

      // Sync cookies for Next.js middleware
      document.cookie = 'aura_active_role=SUPER_ADMIN; path=/; max-age=86400; SameSite=Lax';
      document.cookie = `aura_active_email=${email.toLowerCase().trim()}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = 'aura_has_completed_onboarding=true; path=/; max-age=86400; SameSite=Lax';

      localStorage.setItem('aura_active_email', email.toLowerCase().trim());
      localStorage.setItem('aura_active_role', 'SUPER_ADMIN');

      refreshPersona();

      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const fillMasterCredentials = () => {
    setEmail('indrajit@aura.in');
    setPassword('PMEC@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Candidate Platform</span>
        </Link>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-lg shadow-slate-900/10 mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Master Super Admin Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Centralized Multi-Tenant Governance, Role Elevation &amp; Domain Isolation Engine
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-2xl shadow-xs space-y-6">
          {/* Pre-seeded credentials banner */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-purple-900 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Root Authority Credentials
              </span>
              <button
                type="button"
                onClick={fillMasterCredentials}
                className="text-[10px] font-mono font-bold text-purple-700 hover:underline"
              >
                Auto-Fill
              </button>
            </div>
            <div className="font-mono text-[11px] text-purple-800 space-y-0.5">
              <div>Email: <span className="font-semibold">indrajit@aura.in</span></div>
              <div>Password: <span className="font-semibold">PMEC@123</span></div>
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
                Admin Email ID
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
                  placeholder="indrajit@aura.in"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Master Security Password
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 font-medium transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Authority...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In as Super Admin</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Alternate Portals */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <Link href="/institutional-login" className="hover:text-indigo-600 transition font-medium">
              🏛️ College Portal
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/company-login" className="hover:text-indigo-600 transition font-medium">
              🏢 Recruiter Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>}>
      <AdminLoginContent />
    </React.Suspense>
  );
}
