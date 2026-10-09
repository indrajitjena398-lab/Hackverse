'use client';

import React, { useState } from 'react';
import { 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Sparkles, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { RecommendedProject } from '@/lib/engine/SkillGapAnalyzer';

interface ProjectRecommendationCardProps {
  project: RecommendedProject;
  candidateEmail: string;
  isVerified?: boolean;
  submittedGithubUrl?: string;
  onVerifyProject: (projectId: string, githubUrl: string) => Promise<void> | void;
}

export function ProjectRecommendationCard({
  project,
  candidateEmail,
  isVerified = false,
  submittedGithubUrl = '',
  onVerifyProject,
}: ProjectRecommendationCardProps) {
  const [repoUrl, setRepoUrl] = useState(submittedGithubUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [inputError, setInputError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setInputError('Please enter a valid GitHub repository URL.');
      return;
    }

    if (!trimmed.toLowerCase().includes('github.com')) {
      setInputError('Repository URL must be a valid GitHub link (e.g. https://github.com/org/repo).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onVerifyProject(project.id, trimmed);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    } catch (err: any) {
      setInputError(err?.message || 'Verification failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyBadge = (difficulty: RecommendedProject['difficulty']) => {
    switch (difficulty) {
      case 'Production Grade':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Advanced':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div 
      className={`bg-white border rounded-2xl transition-all duration-200 shadow-xs hover:shadow-md ${
        isVerified ? 'border-emerald-300 ring-1 ring-emerald-400/20' : 'border-slate-200'
      }`}
    >
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(project.difficulty)}`}>
                {project.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400" />
                {project.estimatedHours}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {project.scoreBoost}
              </span>
              {isVerified && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Portfolio Proof
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {project.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="self-start lg:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                Hide Details <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                View Architecture <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Industry Context */}
        <p className="mt-3 text-sm text-slate-600 leading-relaxed bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 text-slate-700">
          <strong className="text-slate-900 font-semibold">Industry Context: </strong>
          {project.industryContext}
        </p>

        {/* Missing Skills Solved Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1.5 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-indigo-500" /> Gaps Closed:
          </span>
          {project.missingSkillsSolved.map((skill) => (
            <span
              key={skill}
              className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable Architectural Specs & Features */}
      {isExpanded && (
        <div className="p-6 bg-slate-50/40 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Architecture Requirements */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-600" />
              Core Architecture Requirements
            </h4>
            <ul className="space-y-2">
              {project.architectureRequirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600 text-xs leading-relaxed">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Features */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-emerald-600" />
              Deliverables & Verification Criteria
            </h4>
            <ul className="space-y-2">
              {project.keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600 text-xs leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Project Submission & Proof Linking Form */}
      <div className="p-6 bg-white rounded-b-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Github className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="https://github.com/your-username/repo-name"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all font-mono placeholder:font-sans placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
                isVerified
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              } disabled:opacity-60 disabled:cursor-not-allowed shrink-0`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying Proof...
                </>
              ) : isVerified ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  Update Linked Repo
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Verify Repo & Boost Score ({project.scoreBoost})
                </>
              )}
            </button>
          </div>

          {inputError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{inputError}</span>
            </div>
          )}

          {successToast && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Portfolio proof verified! {project.scoreBoost} applied to candidate profile readiness.
              </span>
            </div>
          )}

          {isVerified && submittedGithubUrl && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Active Proof: <code className="text-slate-700 font-mono">{submittedGithubUrl}</code>
              </span>
              <a
                href={submittedGithubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Inspect Repo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
