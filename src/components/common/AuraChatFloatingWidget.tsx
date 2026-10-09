'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Bot, 
  X, 
  Send, 
  Loader2, 
  Maximize2, 
  RotateCcw, 
  ChevronDown, 
  Cpu, 
  Github, 
  GitFork, 
  FileText, 
  Check, 
  ShieldCheck,
  Minimize2
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { crossModuleCoherenceEngine } from '@/lib/engine/CrossModuleCoherenceEngine';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Build a project to close my distributed caching gap',
  'What specific skills do I need for Stripe?',
  'Review resume bullet points for quantitative metrics',
  'Start technical mock interview practice',
];

export function AuraChatFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **AURA**, your technical career assistant.

I can help evaluate your skill gaps, review your resume bullet points, and prepare you for technical mock interviews based on verified engineering roles.

What would you like to work on today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

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
      const profile = candidateIntelligenceEngine.getProfile();
      const resume = candidateIntelligenceEngine.getCandidateResume();
      const cip = crossModuleCoherenceEngine.getProfile(profile.email);

      const candidateContext = {
        name: profile.name,
        email: profile.email,
        targetRole: cip.primaryTargetRole || profile.targetRole,
        targetCompany: profile.targetCompany,
        readinessScore: cip.careerReadinessScore || profile.overallReadinessScore,
        atsScore: cip.resumeInsights?.overallScore || resume.atsAnalysis.overallScore,
        verifiedSkills: Object.keys(cip.technicalSkills),
        skillGaps: cip.skillGaps.map(g => g.skill),
        interviewAverage: cip.interviewPerformance.averageScore,
        roadmapStage: cip.learningRoadmap.currentStage,
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
        throw new Error(data.error || 'Failed to get response from AURA Copilot');
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
        content: `⚠️ **Error communicating with AI model:** ${err instanceof Error ? err.message : 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        content: `Session refreshed. All telemetry synced. How can I assist you with your career progression?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`w-[92vw] sm:w-[440px] ${
            isMinimized ? 'h-14' : 'h-[620px] max-h-[85vh]'
          } bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-4 transition-all duration-300`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/60 flex items-center justify-center text-white font-mono font-bold text-xs shadow-2xs">
                AU
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Career Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Profile Synced • Skill Graph Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-white border border-slate-200 text-[10px] font-mono text-slate-700 rounded px-1.5 py-0.5 outline-none shadow-2xs"
                title="Select OpenRouter Model"
              >
                <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                <option value="deepseek/deepseek-chat">DeepSeek V3</option>
                <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B</option>
              </select>

              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1 rounded-lg hover:bg-slate-200/70 hover:text-slate-800 transition"
                title="Reset Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg hover:bg-slate-200/70 hover:text-slate-800 transition"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="p-1 rounded-lg hover:bg-slate-200/70 hover:text-slate-800 transition"
                title="Close Chat"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-800 bg-white">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-slate-900 text-white shadow-xs rounded-br-none'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs w-max">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Analyzing your skills and repositories...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition shrink-0 shadow-2xs font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about your skills, roles, or resume..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-40 shadow-xs shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md border border-slate-700/60 transition"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <Bot className="w-4 h-4 text-slate-200" />
        <span>Ask AURA</span>
      </button>
    </div>
  );
}
