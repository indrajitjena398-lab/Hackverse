'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Navigation } from './Navigation';
import { EngineStatusBar } from './EngineStatusBar';
import { AuraChatFloatingWidget } from './AuraChatFloatingWidget';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, persona } = useAuth();
  const isElevatedRole = persona.userRole !== 'STUDENT';



  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col antialiased">
      <Navigation />
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0 bg-transparent">
        {!isElevatedRole && <EngineStatusBar />}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="w-full border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
            <div>
              AURA Career Intelligence Platform • PMEC &amp; Partner Institutions
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Verified Role Criteria</span>
              <span>•</span>
              <span>FERPA Compliant</span>
              <span>•</span>
              <span>Audited Skill Diagnostics</span>
            </div>
          </div>
        </footer>
      </div>
      {!isElevatedRole && <AuraChatFloatingWidget />}
    </div>
  );
}
