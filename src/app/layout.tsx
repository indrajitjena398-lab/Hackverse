import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/firebase/AuthContext';
import { AppShell } from '@/components/common/AppShell';

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
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
