'use client';

import React from 'react';
import Link from 'next/link';
import { Github, ArrowLeft, GitBranch, ShieldCheck, Sparkles } from 'lucide-react';
import { GitHubSkillRadarSection } from '@/components/github/GitHubSkillRadarSection';

export default function GitHubSkillsPage() {
  return (
    <div className="space-y-8 py-2">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Code Repository Audit</span>
        </div>
      </div>

      {/* Main Radar Section */}
      <GitHubSkillRadarSection />
    </div>
  );
}
