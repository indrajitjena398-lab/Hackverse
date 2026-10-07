import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Navigation } from '@/components/common/Navigation';
import { EngineStatusBar } from '@/components/common/EngineStatusBar';

export const metadata: Metadata = {
  title: 'Aura // AI Career Operating System & Institutional Intelligence',
  description: 'Centralized, AI-driven Career Operating System and Institutional Employability Management Platform powered by DAG Skill-Graphs, Deterministic-to-Stochastic Provenance Protocol, and 90-Day Early Warning Systems.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <Navigation />
        <EngineStatusBar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="w-full border-t border-slate-800 bg-slate-950/70 py-6 text-xs text-slate-500 text-center">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
            <div>
              AURA Career OS • Powered by Graph DLDM & Deterministic Provenance Protocol
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Verified Employer</span>
              <span>•</span>
              <span>Community Aggregated</span>
              <span>•</span>
              <span>AI Inferred (Confidence Calibrated)</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
