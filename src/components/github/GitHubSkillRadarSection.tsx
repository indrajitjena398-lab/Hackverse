'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GitBranch, 
  Github, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  Loader2, 
  Search, 
  Code2, 
  Layers, 
  Check, 
  AlertCircle,
  FolderGit2,
  Lock,
  Cpu,
  BarChart3,
  Award
} from 'lucide-react';
import { GitHubVerificationReport, VerifiedSkill, GitHubRepository } from '@/lib/types/github';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { useAuth } from '@/lib/firebase/AuthContext';
import { rbacStore } from '@/lib/security/rbacStore';

interface GitHubSkillRadarSectionProps {
  onSyncSuccess?: () => void;
  onRequireAuth?: () => void;
}

function extractGithubUsername(urlOrHandle: string): string {
  if (!urlOrHandle) return '';
  const trimmed = urlOrHandle.trim();
  if (trimmed === 'https://github.com' || trimmed === 'https://github.com/' || trimmed === 'http://github.com' || trimmed === 'http://github.com/') {
    return '';
  }
  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-]+)/i);
  if (match && match[1]) return match[1];
  const cleaned = trimmed.replace(/^https?:\/\//i, '').replace(/^@/, '').replace(/\/.*$/, '').trim();
  if (cleaned.toLowerCase() === 'github.com') return '';
  return cleaned;
}

export function GitHubSkillRadarSection({ onSyncSuccess, onRequireAuth }: GitHubSkillRadarSectionProps) {
  const { user, persona } = useAuth();
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<GitHubVerificationReport | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'languages' | 'frameworks' | 'domains'>('all');

  useEffect(() => {
    let resolvedUser = '';
    if (typeof window !== 'undefined') {
      const storedHandle = localStorage.getItem('aura_candidate_github_username');
      const storedUrl = localStorage.getItem('aura_onboarding_github_url');
      const email = user?.email || persona?.email || localStorage.getItem('aura_active_email') || '';
      const candidateProfile = email ? rbacStore.getCandidateProfile(email) : null;

      // Purge any stale mock test handles from previous sessions
      if (storedHandle === 'indrajitjena398-lab' || storedHandle === 'indrajitjena') {
        localStorage.removeItem('aura_candidate_github_username');
      }
      if (storedUrl?.includes('indrajitjena398-lab')) {
        localStorage.removeItem('aura_onboarding_github_url');
      }

      const activeHandle = localStorage.getItem('aura_candidate_github_username');
      const activeUrl = localStorage.getItem('aura_onboarding_github_url');

      if (activeHandle && !activeHandle.includes('indrajitjena398-lab')) {
        resolvedUser = activeHandle;
      } else if (activeUrl && !activeUrl.includes('indrajitjena398-lab')) {
        resolvedUser = extractGithubUsername(activeUrl);
      } else if (candidateProfile?.githubUrl && !candidateProfile.githubUrl.includes('indrajitjena398-lab')) {
        resolvedUser = extractGithubUsername(candidateProfile.githubUrl);
      }
    }

    if (resolvedUser) {
      setUsername(resolvedUser);
      handleScanWithUser(resolvedUser, false);
    }
  }, [user?.email, persona?.email]);

  const handleScanWithUser = async (targetUser: string, showSyncNotice = true) => {
    const cleanUser = extractGithubUsername(targetUser);
    if (!cleanUser) {
      setError('Please provide a valid GitHub username or repository link.');
      return;
    }

    setUsername(cleanUser);
    setIsLoading(true);
    setError(null);
    setSyncMessage(null);

    try {
      const res = await fetch('/api/github-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          token: token.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to scan GitHub profile');
      }

      setReport(json.data);
      setIsSynced(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('aura_candidate_github_username', cleanUser);
      }

      if (showSyncNotice) {
        setSyncMessage(`Audited ${json.data.totalReposScanned} repositories for @${cleanUser}. Found ${json.data.verifiedSkills.length} verified technical skills.`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error occurred while verifying GitHub repositories.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (showSyncNotice = true) => {
    handleScanWithUser(username, showSyncNotice);
  };

  const handleSyncWithEngine = () => {
    if (!report) return;

    if (!user) {
      if (onRequireAuth) {
        onRequireAuth();
      }
      setSyncMessage('Authentication required: Please sign in to sync verified skills to your candidate profile.');
      return;
    }

    candidateIntelligenceEngine.syncGitHubSkills(report);
    setIsSynced(true);
    setSyncMessage('Successfully synced verified skills into Candidate Intelligence Engine.');

    if (onSyncSuccess) {
      onSyncSuccess();
    }
    setTimeout(() => setSyncMessage(null), 4500);
  };

  const filteredSkills = report?.verifiedSkills.filter(skill => {
    if (activeCategory === 'languages') return skill.category === 'core_language';
    if (activeCategory === 'frameworks') return skill.category === 'framework' || skill.category === 'infrastructure';
    if (activeCategory === 'domains') return skill.category === 'domain' || skill.category === 'cybersecurity';
    return true;
  }) || [];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Github className="w-3.5 h-3.5 text-slate-900" />
            <span>Deterministic Code Provenance • Real-Time Repository Audit</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Verified Technical Skills via GitHub</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              AUDITED
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Scan public repositories to extract verified technical proficiencies, compute language distribution, and attach cryptographic proof to your profile.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {report && (
            <button
              type="button"
              onClick={handleSyncWithEngine}
              disabled={isSynced}
              className={`px-3.5 py-2 rounded-xl font-medium text-xs transition flex items-center gap-1.5 shadow-sm ${
                isSynced 
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-700' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isSynced ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Zap className="w-3.5 h-3.5" />}
              <span>{isSynced ? 'Synced to Skill Graph' : 'Sync to Skill Graph'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs transition"
            title="Configure GitHub Token"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <form onSubmit={(e) => { e.preventDefault(); handleScan(true); }} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Github className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your GitHub username or profile link (e.g. torvalds)"
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{isLoading ? 'Scanning...' : 'Scan Repositories'}</span>
          </button>
        </form>

        {showTokenInput && (
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Custom GitHub Personal Access Token (PAT)
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="github_pat_... (Leave blank to use pre-configured system token)"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-slate-400"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Pre-configured token handles standard rate-limits for student verification.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {syncMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{syncMessage}</span>
          </div>
        )}
      </div>

      {/* Empty State when no report has been generated yet */}
      {!report && !isLoading && (
        <div className="py-10 px-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
            <Github className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-sm font-semibold text-slate-800">
              {username ? `Ready to audit GitHub profile @${username}` : 'No GitHub Profile Audited Yet'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {username 
                ? 'Click "Scan Repositories" above to pull your public code repositories and compute verified technical proficiencies.'
                : 'Connect your GitHub profile by entering your username or link above and click "Scan Repositories" to verify your code repositories.'}
            </p>
          </div>
          {username && (
            <button
              type="button"
              onClick={() => handleScan(true)}
              className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition flex items-center gap-2 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Scan @{username} Now</span>
            </button>
          )}
        </div>
      )}

      {/* Main Report View */}
      {report && (
        <div className="space-y-5">
          {/* User Profile Banner & Vital Metrics */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={report.user.avatarUrl}
                alt={report.user.name || report.user.login}
                className="w-14 h-14 rounded-xl border border-slate-200 object-cover shadow-sm shrink-0"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{report.user.name || report.user.login}</h3>
                  <a
                    href={report.user.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>@{report.user.login}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    VERIFIED CANDIDATE CODE
                  </span>
                </div>

                {report.user.bio && (
                  <p className="text-xs text-slate-600 line-clamp-1 max-w-xl">
                    {report.user.bio}
                  </p>
                )}

                <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-0.5 flex-wrap">
                  {report.user.location && <span>📍 {report.user.location}</span>}
                  <span>•</span>
                  <span>📦 {report.user.publicRepos} Repositories</span>
                  <span>•</span>
                  <span>👥 {report.user.followers} Followers</span>
                </div>
              </div>
            </div>

            {/* Vital Verification Score Tiles */}
            <div className="grid grid-cols-3 gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Verification Index</div>
                <div className="text-lg font-bold text-emerald-600 mt-0.5">
                  {report.verificationIndex}%
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Verified Skills</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {report.verifiedSkills.length}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Scanned Repos</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {report.totalReposScanned}
                </div>
              </div>
            </div>
          </div>

          {/* Language Distribution Stacked Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                <span>Codebase Language Breakdown:</span>
              </span>
              <span className="text-slate-500 text-[11px] font-mono">Audit: {report.auditHash.substring(0, 12)}...</span>
            </div>

            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-200">
              {report.languages.map((l) => (
                <div
                  key={l.language}
                  style={{ width: `${Math.max(l.percentage, 4)}%`, backgroundColor: l.color }}
                  className="h-full"
                  title={`${l.language}: ${l.percentage}% (${l.repoCount} repos)`}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs pt-0.5">
              {report.languages.map((l) => (
                <div key={l.language} className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="font-medium text-slate-700">{l.language}</span>
                  <span className="text-slate-500">{l.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Skills Matrix */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Verified Skill Matrix ({filteredSkills.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Skills validated through repository source code and commit provenance.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 text-[11px]">
                {(['all', 'languages', 'frameworks', 'domains'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-md transition font-medium capitalize ${
                      activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                        {skill.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {skill.primaryLanguage}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      skill.masteryLevel === 'Mastered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : skill.masteryLevel === 'Advanced'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {skill.masteryLevel}
                    </span>
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Code Confidence</span>
                      <span className="text-emerald-700 font-semibold">{skill.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${skill.confidenceScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Repository Evidence Tags */}
                  <div className="pt-1.5 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 mb-1">Evidence Repos:</div>
                    <div className="flex flex-wrap gap-1">
                      {skill.evidenceRepos.map((repoName) => (
                        <a
                          key={repoName}
                          href={`https://github.com/${report.user.login}/${repoName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 flex items-center gap-1 transition"
                        >
                          <FolderGit2 className="w-2.5 h-2.5 text-slate-500" />
                          <span>{repoName}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
