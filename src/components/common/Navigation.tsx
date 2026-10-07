'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Building2, 
  Mic, 
  FileText, 
  GitFork, 
  Kanban, 
  GraduationCap, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const isInstitutional = pathname.startsWith('/institutional');

  const navLinks = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/jobs', label: '1. Job Discovery', icon: Compass },
    { href: '/companies', label: '2. Company Intel', icon: Building2 },
    { href: '/mock-interview', label: '3 & 4. Mock Interview', icon: Mic },
    { href: '/resume', label: '5. Resume & ATS', icon: FileText },
    { href: '/skill-graph', label: '6. Skill Graph & DLDM', icon: GitFork },
    { href: '/tracker', label: '7. Application Kanban', icon: Kanban },
    { href: '/institutional', label: '8. Institutional EWEIS', icon: GraduationCap, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              AURA // CAREER INTELLIGENCE
            </span>
            <span className="text-[10px] font-mono text-indigo-400 font-medium">
              Autonomous Career OS & EWEIS Platform
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-semibold'
                    : link.highlight
                    ? 'text-amber-300 hover:bg-amber-950/40 border border-amber-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* View Mode Toggle Pill */}
        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className={`px-3 py-1.5 rounded-l-lg text-xs font-semibold border transition ${
              !isInstitutional
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Candidate OS
          </Link>
          <Link
            href="/institutional"
            className={`px-3 py-1.5 rounded-r-lg text-xs font-semibold border transition -ml-2 ${
              isInstitutional
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Institutional EWEIS
          </Link>
        </div>
      </div>

      {/* Mobile Horizontal Subnav */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800/60 text-xs bg-slate-900/50">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md shrink-0 whitespace-nowrap ${
                isActive ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
