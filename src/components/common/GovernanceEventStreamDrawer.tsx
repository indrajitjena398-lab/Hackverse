'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Database, 
  Cpu, 
  Hash, 
  Clock, 
  FileCheck, 
  Code2, 
  Zap, 
  Sparkles,
  BarChart3,
  X
} from 'lucide-react';
import { eventBus, CanonicalEngineEvent } from '@/lib/engine/EventBus';
import { policyEngine } from '@/lib/engine/PolicyEngine';
import { aiEvaluationCenter } from '@/lib/engine/AiEvaluationCenter';
import { HitlTask, PolicyRule } from '@/lib/types/policy';
import { PlatformEvaluationDashboard } from '@/lib/types/evaluation';
import { DataProvenanceBadge } from './DataProvenanceBadge';

interface GovernanceEventStreamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GovernanceEventStreamDrawer({ isOpen, onClose }: GovernanceEventStreamDrawerProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'policy' | 'evaluation' | 'architecture'>('events');
  const [events, setEvents] = useState<CanonicalEngineEvent[]>([]);
  const [hitlTasks, setHitlTasks] = useState<HitlTask[]>([]);
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [evalDashboard, setEvalDashboard] = useState<PlatformEvaluationDashboard | null>(null);

  const refreshData = () => {
    setEvents(eventBus.getRecentEvents());
    setHitlTasks(policyEngine.getAllHitlTasks());
    setRules(policyEngine.getRules());
    setEvalDashboard(aiEvaluationCenter.getDashboard());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const unsubPolicy = eventBus.subscribe('POLICY_EVALUATED', () => refreshData());
      const unsubHitl = eventBus.subscribe('HITL_TASK_CREATED', () => refreshData());
      const unsubResolved = eventBus.subscribe('HITL_TASK_RESOLVED', () => refreshData());
      const unsubSkill = eventBus.subscribe('SKILL_LEVEL_CHANGED', () => refreshData());
      const unsubUpload = eventBus.subscribe('RESUME_UPLOADED', () => refreshData());

      return () => {
        unsubPolicy();
        unsubHitl();
        unsubResolved();
        unsubSkill();
        unsubUpload();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResolveHitl = (taskId: string, decision: 'APPROVED' | 'REJECTED') => {
    policyEngine.resolveHitlTask(taskId, decision);
    refreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AURA Governance &amp; Event Store</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700">
                  LIVE ENGINE
                </span>
              </h2>
              <div className="text-xs font-mono text-slate-400">
                Event-Driven Architecture • Policy Engine • AI Evaluation • Polyglot DB
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-5 pt-3 border-b border-slate-800 gap-1 bg-slate-900/30 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'events'
                ? 'border-indigo-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Event Store ({events.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'policy'
                ? 'border-indigo-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Policy Guardrails ({rules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluation')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'evaluation'
                ? 'border-indigo-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Evaluation Center</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Polyglot Schemas</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: EVENT STORE */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <strong className="text-white">Immutable Event Store Pipeline:</strong> Mutations trigger reactive topological cascades across modules.
                </div>
                <span className="font-mono text-[11px] text-indigo-400">Total: {events.length}</span>
              </div>

              <div className="space-y-3">
                {events.map((evt, idx) => (
                  <div
                    key={evt.event_id || idx}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300">
                          {evt.event_type}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{evt.event_id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span suppressHydrationWarning>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-3">
                      <span>Source: <strong className="text-slate-200 font-mono">{evt.source}</strong></span>
                      <span>Candidate: <strong className="text-indigo-300 font-mono">{evt.candidate_id}</strong></span>
                    </div>

                    {/* Payload Viewer */}
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                      <pre>{JSON.stringify(evt.payload, null, 2)}</pre>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono">Provenance Hash:</span>
                        <span className="font-mono text-indigo-300">{evt.provenance.hash}</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-semibold">
                        {(evt.provenance.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: POLICY ENGINE & GUARDRAILS */}
          {activeTab === 'policy' && (
            <div className="space-y-6">
              {/* Human-in-the-Loop Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Pending Human-In-The-Loop (HITL) Tasks</span>
                  </h3>
                  <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    {hitlTasks.filter(t => t.status === 'PENDING').length} Pending
                  </span>
                </div>

                {hitlTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border space-y-3 ${
                      task.status === 'PENDING'
                        ? 'bg-amber-950/20 border-amber-800/60'
                        : task.status === 'APPROVED'
                        ? 'bg-emerald-950/20 border-emerald-800/60'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span>{task.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {task.entityType}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        task.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                      <div className="text-slate-500 mb-1">Proposed Mutation Data:</div>
                      <pre>{JSON.stringify(task.proposedData, null, 2)}</pre>
                    </div>

                    {task.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleResolveHitl(task.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold transition"
                        >
                          Reject Mutation
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveHitl(task.id, 'APPROVED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                        >
                          Approve Mutation (Sign Off)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Guardrail Rules */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Configured Autonomous Policy Rules</span>
                </h3>

                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-mono">{rule.id}: {rule.name}</strong>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            rule.impactLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          }`}>
                            {rule.impactLevel}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{rule.description}</p>
                        <div className="font-mono text-[10px] text-indigo-300">Trigger: {rule.condition} &rarr; {rule.actionOnTrigger}</div>
                      </div>
                      <span className="text-emerald-400 font-mono text-[10px] font-bold">ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI EVALUATION CENTER */}
          {activeTab === 'evaluation' && evalDashboard && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Resume Extraction Accuracy</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    {evalDashboard.resumeExtractionAccuracy}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Job Matching Precision</div>
                  <div className="text-2xl font-black text-sky-400 font-mono mt-1">
                    {evalDashboard.jobMatchingPrecision}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Interview Evaluation Agreement</div>
                  <div className="text-2xl font-black text-purple-400 font-mono mt-1">
                    {evalDashboard.interviewEvaluationAgreement}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">EWEIS Precision / Recall</div>
                  <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                    {evalDashboard.eweisPrecision}% / {evalDashboard.eweisRecall}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Avg Inference Latency</div>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {evalDashboard.averageInferenceLatencyMs}ms
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Daily Compute Cost</div>
                  <div className="text-2xl font-black text-teal-400 font-mono mt-1">
                    ${evalDashboard.dailyComputeCostUsd}
                  </div>
                </div>
              </div>

              {/* Evaluation Runs */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Recent Model Benchmark Telemetry</span>
                </h3>

                <div className="space-y-2">
                  {evalDashboard.recentEvaluationRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white font-mono flex items-center gap-2">
                          <span>{run.modelName}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">({run.taskType})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {run.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                        <div>Latency: <strong className="text-slate-200">{run.latencyMs}ms</strong></div>
                        <div>Cost: <strong className="text-slate-200">${run.costUsd}</strong></div>
                        <div>Hallucination: <strong className="text-emerald-400">{(run.hallucinationRate * 100).toFixed(0)}%</strong></div>
                        <div>Citation: <strong className="text-sky-400">{(run.citationAccuracy * 100).toFixed(0)}%</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POLYGLOT PERSISTENCE ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-indigo-400 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>1. Relational Schema (PostgreSQL 16)</span>
                </div>
                <pre className="text-[11px] text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto leading-relaxed">
{`CREATE TABLE candidates (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  target_roles JSONB NOT NULL,
  dimensional_readiness JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_provenance_records (
  hash VARCHAR(66) PRIMARY KEY,
  entity_type VARCHAR(64) NOT NULL,
  source_type VARCHAR(64) NOT NULL,
  confidence NUMERIC(4,3) NOT NULL,
  verifier VARCHAR(255),
  evidence_chain JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>2. Graph DB Ontology (Neo4j Cypher)</span>
                </div>
                <pre className="text-[11px] text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto leading-relaxed">
{`// Create Domain Node & Prerequisite Edges
CREATE (ds:Skill {id: 'distributed_systems', name: 'Distributed Systems'})
CREATE (c:Skill {id: 'caching_redis', name: 'Redis Caching'})
CREATE (sd:Skill {id: 'system_design', name: 'System Design'})

MATCH (c:Skill {id: 'caching_redis'}), (sd:Skill {id: 'system_design'})
CREATE (c)-[:PREREQUISITE_FOR]->(sd)
CREATE (c)-[:FREQUENTLY_INTERVIEWED_WITH]->(sd);`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-sky-400 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>3. Vector Database Index (pgvector / Qdrant)</span>
                </div>
                <pre className="text-[11px] text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto leading-relaxed">
{`// Hybrid Dense Vector Embedding Index (1536 dim)
CREATE INDEX ON job_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
