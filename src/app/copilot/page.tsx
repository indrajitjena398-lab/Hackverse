'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Bot, 
  Send, 
  Loader2, 
  RotateCcw, 
  ArrowLeft, 
  Github, 
  GitFork, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Compass, 
  CheckCircle2, 
  FolderGit2, 
  ExternalLink,
  Zap,
  BarChart3
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const CONTEXT_PROMPTS = [
  {
    title: 'Bridge Gap to Stripe',
    prompt: 'Based on my 12 GitHub repos and active readiness (78%), what exact distributed systems project should I build next to become a 95% Safe Fit for Stripe?',
  },
  {
    title: 'Explain DLDM Prerequisite',
    prompt: 'Explain the topological prerequisite chain in my DLDM Skill Graph: why must I master Caching & Redis before advancing to High-Throughput System Design?',
  },
  {
    title: 'Resume ATS Audit',
    prompt: 'My current ATS Resume Score is 68/100. Review my skills and suggest 3 high-impact HITL bullet rewrites with metrics for my resume.',
  },
  {
    title: 'STAR CAT Mock Interview',
    prompt: 'Act as a Principal Staff Engineer at Stripe. Start an adaptive CAT mock interview testing my knowledge of distributed caching, cache invalidation, and thundering herd mitigation.',
  },
];

export default function CopilotPage() {
  const [profile, setProfile] = useState(candidateIntelligenceEngine.getProfile());
  const [resume, setResume] = useState(candidateIntelligenceEngine.getCandidateResume());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to AURA AI Career Copilot 🚀

I am your autonomous career intelligence strategist, initialized with full real-time knowledge of your profile:

- **Candidate Profile**: ${candidateIntelligenceEngine.getProfile().name}
- **Target Role**: ${candidateIntelligenceEngine.getProfile().targetRole} at ${candidateIntelligenceEngine.getProfile().targetCompany}
- **Active Overall Readiness**: **${candidateIntelligenceEngine.getProfile().overallReadinessScore}%**
- **ATS Resume Index**: **${candidateIntelligenceEngine.getCandidateResume().atsAnalysis.overallScore}/100**
- **Code Provenance**: **12 Audited GitHub Repositories** (*Hackverse, Cybersecurity_in_smartgrid, SIH2026PSBitcoin, Robostreaks...*)

Select any strategy question below or type your prompt to begin!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const candidateContext = {
        name: profile.name,
        email: profile.email,
        targetRole: profile.targetRole,
        targetCompany: profile.targetCompany,
        readinessScore: profile.overallReadinessScore,
        atsScore: resume.atsAnalysis.overallScore,
      };

      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          candidateContext,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate response from AI Copilot');
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Error generating AI response:** ${err instanceof Error ? err.message : 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        content: `Session refreshed. All telemetry re-synchronized. How can I assist you with your career strategy today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Career OS Overview</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>OpenRouter Advanced AI Connected</span>
          </div>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-mono text-slate-800 rounded-lg px-2.5 py-1 outline-none shadow-2xs"
          >
            <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini</option>
            <option value="deepseek/deepseek-chat">DeepSeek V3 (Chat)</option>
            <option value="meta-llama/llama-3.3-70b-instruct">Meta Llama 3.3 70B</option>
          </select>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Real-Time Telemetry & Context Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Profile Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
                Candidate Knowledge Base
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-xs">
                {profile.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{profile.name}</h3>
                <p className="text-xs text-slate-500 font-mono truncate max-w-[200px]">{profile.email}</p>
                <div className="text-[11px] text-slate-700 font-medium mt-0.5">
                  Target: {profile.targetRole}
                </div>
              </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-mono">Readiness</span>
                <div className="text-lg font-bold font-mono text-slate-900">{profile.overallReadinessScore}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-mono">ATS Resume</span>
                <div className="text-lg font-bold font-mono text-slate-900">{resume.atsAnalysis.overallScore}/100</div>
              </div>
            </div>
          </div>

          {/* Verified GitHub Repositories Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-700 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-900" />
                <span>Audited Repositories (12)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Verified Code
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The AI Copilot has indexed your repositories to ground its advice in actual code evidence:
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {[
                { name: 'Hackverse', stack: 'TypeScript • Next.js 14 • Graph Engine' },
                { name: 'BPUTHackthon', stack: 'Python • Algorithmic Problem Solving' },
                { name: 'Cybersecurity_in_smartgrid', stack: 'Smart Grid Defense • Industrial IoT' },
                { name: 'SIH2026PSBitcoin', stack: 'Python • Cryptography • Bitcoin' },
                { name: 'Robostreaks', stack: 'TypeScript • Interactive Canvas' },
                { name: 'SupabaseJustin', stack: 'PostgreSQL • Cloud DB Architecture' },
              ].map((repo) => (
                <div
                  key={repo.name}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-900 font-semibold">{repo.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{repo.stack}</span>
                </div>
              ))}
            </div>

            <Link
              href="/github-skills"
              className="text-xs font-semibold text-slate-900 hover:text-indigo-700 flex items-center gap-1 pt-1 transition"
            >
              <span>View Full GitHub Skill Radar</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick Strategy Prompt Cards */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-mono font-semibold text-slate-700">Quick Discussion Starters</span>
            <div className="space-y-2">
              {CONTEXT_PROMPTS.map((cp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(cp.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition text-xs space-y-1 group"
                >
                  <div className="font-semibold text-slate-900 group-hover:text-indigo-900 transition">
                    {cp.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{cp.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Full-Height Chat Workspace (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-[750px] rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>AURA Autonomous AI Copilot</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </h2>
                <div className="text-xs text-slate-500 font-mono">
                  Grounding: 12 Repositories • DLDM Skill Graph • ATS AST Engine
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white shadow-xs rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs w-max shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                <span>AURA is synthesizing insights across your repositories and DLDM graph...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t border-slate-200 bg-white flex items-center gap-3 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AURA about career strategies, mock interviews, skill gaps, or resume audits..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition disabled:opacity-50 shadow-xs flex items-center gap-2 shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
