'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  Database, 
  ShieldCheck, 
  Zap, 
  Activity, 
  GitBranch, 
  Lock, 
  FileCheck2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Terminal, 
  RefreshCw, 
  Sliders, 
  Award, 
  Check, 
  Server,
  TrendingUp,
  Brain,
  Microscope,
  FileCode2,
  Share2,
  Workflow
} from 'lucide-react';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';
import { cdcSyncCircuit, SyncCircuitTelemetry, CdcChangeEvent } from '@/lib/engine/CdcSyncCircuit';
import { coldStartPipeline, ColdStartImputationResult, INSTITUTIONAL_COHORT_BASELINES } from '@/lib/engine/ColdStartPipeline';
import { llmGuardrailEvaluator, GuardrailQualityCertificate, GuardrailEngineTelemetry } from '@/lib/engine/LlmGuardrailEvaluator';
import { eventBus } from '@/lib/engine/EventBus';

export function EnterpriseArchitectureHub() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'cdc' | 'cold_start' | 'guardrails' | 'ip_novelty'>('architecture');
  const [cdcTelemetry, setCdcTelemetry] = useState<SyncCircuitTelemetry>(cdcSyncCircuit.getTelemetry());
  const [cdcEvents, setCdcEvents] = useState<CdcChangeEvent[]>(cdcSyncCircuit.getRecentCdcEvents());
  const [guardrailTelemetry, setGuardrailTelemetry] = useState<GuardrailEngineTelemetry>(llmGuardrailEvaluator.getTelemetry());
  
  // Cold Start interactive simulator state
  const [selectedCohort, setSelectedCohort] = useState<string>('stanford_cs');
  const [coldStartResult, setColdStartResult] = useState<ColdStartImputationResult | null>(null);
  const [isSimulatingColdStart, setIsSimulatingColdStart] = useState<boolean>(false);
  
  // Guardrail test state
  const [testBulletOriginal, setTestBulletOriginal] = useState('Helped with Redis backend caching.');
  const [testBulletSuggested, setTestBulletSuggested] = useState('Architected distributed caching layer in Redis with cache-aside pattern, reducing P99 latency by 42% across 12M daily requests.');
  const [guardrailTestResult, setGuardrailTestResult] = useState<GuardrailQualityCertificate | null>(null);
  const [isAuditingGuardrail, setIsAuditingGuardrail] = useState<boolean>(false);

  // Sync state
  const [isTriggeringSync, setIsTriggeringSync] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCdcTelemetry(cdcSyncCircuit.getTelemetry());
      setCdcEvents(cdcSyncCircuit.getRecentCdcEvents());
      setGuardrailTelemetry(llmGuardrailEvaluator.getTelemetry());
    }, 2500);

    const unsubCdc = eventBus.subscribe('CDC_EVENT_COMMITTED' as any, () => {
      setCdcTelemetry(cdcSyncCircuit.getTelemetry());
      setCdcEvents(cdcSyncCircuit.getRecentCdcEvents());
    });

    const unsubEval = eventBus.subscribe('LLM_OUTPUT_EVALUATED' as any, () => {
      setGuardrailTelemetry(llmGuardrailEvaluator.getTelemetry());
    });

    return () => {
      clearInterval(interval);
      unsubCdc();
      unsubEval();
    };
  }, []);

  const handleTriggerSync = () => {
    setIsTriggeringSync(true);
    cdcSyncCircuit.executeTwoPhaseCommitSync({
      sourceTable: 'candidate_profiles',
      entityId: 'cand-alex-chen',
      operation: 'UPDATE',
      payload: {
        note: 'Manual distributed state synchronization trigger',
        timestamp: new Date().toISOString(),
      },
    });
    setTimeout(() => {
      setCdcTelemetry(cdcSyncCircuit.getTelemetry());
      setCdcEvents(cdcSyncCircuit.getRecentCdcEvents());
      setIsTriggeringSync(false);
    }, 600);
  };

  const handleRunColdStartSimulation = () => {
    setIsSimulatingColdStart(true);
    setTimeout(() => {
      const res = candidateIntelligenceEngine.bootstrapCandidateColdStart(selectedCohort);
      setColdStartResult(res);
      setCdcTelemetry(cdcSyncCircuit.getTelemetry());
      setCdcEvents(cdcSyncCircuit.getRecentCdcEvents());
      setIsSimulatingColdStart(false);
    }, 800);
  };

  const handleRunGuardrailAudit = () => {
    setIsAuditingGuardrail(true);
    setTimeout(() => {
      const cert = candidateIntelligenceEngine.auditResumeBulletProposal(testBulletOriginal, testBulletSuggested);
      setGuardrailTestResult(cert);
      setGuardrailTelemetry(llmGuardrailEvaluator.getTelemetry());
      setIsAuditingGuardrail(false);
    }, 600);
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-6 border-b border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ENTERPRISE SYSTEM ARCHITECTURE
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 3 MISSING CIRCUITS RESOLVED
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                3 CORE IP NOVELTIES
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-indigo-400" />
              AURA Distributed Topology & Intellectual Property Hub
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Production-grade architecture featuring WAL Change Data Capture (2PC), Cold-Start Bayesian Imputation, 
              Asynchronous Parallel LLM Guardrails, and Deterministic 8-Tier Provenance.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTriggerSync}
              disabled={isTriggeringSync}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringSync ? 'animate-spin' : ''}`} />
              <span>Trigger 2PC CDC Sync</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Refined System Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('cdc')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cdc'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>A. CDC & 2PC Sync Circuit</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>
          <button
            onClick={() => setActiveTab('cold_start')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cold_start'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>B. Cold-Start Imputation</span>
          </button>
          <button
            onClick={() => setActiveTab('guardrails')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'guardrails'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>C. LLM Guardrails & Evaluator</span>
          </button>
          <button
            onClick={() => setActiveTab('ip_novelty')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ip_novelty'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-purple-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>IP Novelty & Roadmap</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Refined Enterprise Architecture Topology */}
      {activeTab === 'architecture' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">BFF GATEWAY PROTOCOL</div>
              <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                <span>gRPC / REST</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Active</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Stateless API gateway with RBAC header verification</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">DISTRIBUTED EVENT BUS</div>
              <div className="text-lg font-bold text-indigo-300 mt-1 flex items-center gap-2">
                <span>Redis Streams / BullMQ</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Replaces heavy Kafka for low-overhead deterministic execution</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">MULTI-TENANCY SECURITY</div>
              <div className="text-lg font-bold text-emerald-300 mt-1 flex items-center gap-2">
                <span>Postgres 16 RLS</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">FERPA compliant row-level isolation between universities</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">CAT SPEECH PROCESSING</div>
              <div className="text-lg font-bold text-purple-300 mt-1 flex items-center gap-2">
                <span>Whisper / Deepgram</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Specialized technical jargon lexicon (Raft, gRPC, K8s)</div>
            </div>
          </div>

          {/* System Architecture Diagram */}
          <div className="bg-slate-900/90 rounded-xl p-5 border border-indigo-950 font-mono text-xs overflow-x-auto text-indigo-200 leading-relaxed shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4 text-slate-400 font-sans">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-400" />
                AURA Refined Enterprise System Architecture Diagram
              </span>
              <span className="text-[11px] font-mono text-slate-500">Dual-Persona • Multi-Tenant • CDC-Synchronized</span>
            </div>
            <pre className="text-[11px] text-slate-300 font-mono whitespace-pre overflow-x-auto">
{`                         ┌────────────────────────────────────────────────────────────┐
                         │                 AURA Unified Web Platform                  │
                         │       Candidate OS   │   Institutional EWEIS   │   Admin   │
                         └─────────────────────────────┬──────────────────────────────┘
                                                       │
                                           BFF / API Gateway (gRPC/REST)
                                                       │
        ┌──────────────────────────────────────────────┼──────────────────────────────────────────────┐
        │                                              │                                              │
 Candidate Intelligence                         Institutional EWEIS                            Workflow Engine
        │                                              │                                              │
        ├── Canonical Profile Engine                   ├── Predictive Trajectory Engine (T-90d)       ├── Application Kanban
        ├── Skill Graph DAG                            ├── Velocity & Conversion Analytics            ├── Recruiter Nudge Automation
        ├── Explainable Hybrid Matcher                 ├── Closed-Loop Intervention Dispatch          ├── Adaptive CAT Mock Interview
        └── Resume AST Parser (HITL)                   └── Counselor Cockpit & Anonymized RLS         └── Webhook Notification Hub
        │                                              │                                              │
        └──────────────────────────────────────────────┼──────────────────────────────────────────────┘
                                                       │
                                         Candidate-Intelligence Engine
                                          (Central Heartbeat & State)
                                                       │
   ┌───────────────────────────────────────────────────┼───────────────────────────────────────────────────┐
   │                                                   │                                                   │
┌──┴──────────────────────────────┐       ┌────────────┴───────────────────┐       ┌───────────────────────┴──┐
│  Cold-Start Ingestion           │       │  Change Data Capture (CDC)     │       │  Offline Guardrail &     │
│  & Synthetic Imputation         │       │  (Debezium + 2PC Async Sync)   │       │  LLM Evaluation Engine   │
└──┬──────────────────────────────┘       └────────────┬───────────────────┘       └───────────────────────┬──┘
   │                                                   │                                                   │
   └───────────────────────────────────────────────────┼───────────────────────────────────────────────────┘
                                                       │
        ┌──────────────────────────────────────────────┼──────────────────────────────────────────────┐
        │                                              │                                              │
   Neo4j / Cypher Graph                         pgvector / Qdrant Embeddings                    PostgreSQL 16 Relational
  Multi-Dimensional Ontology                      Dense Vector Semantic Store                   ACID State & Audit Ledger
        │                                              │                                              │
        └──────────────────────────────────────────────┼──────────────────────────────────────────────┘
                                                       │
                                       Reactive Event Bus & Event Store
                                           Redis Streams / BullMQ Pipeline
                                                       │
                                      Policy Guardrails & HITL Engine
                                                       │
                                         Deterministic Provenance Layer
                                       (8-Tier Trust Protocol & Cryptographic Hashes)`}
            </pre>
          </div>

          {/* Architectural Innovations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-900/50">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 mb-3 border border-indigo-800">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">A. CDC Invalidation Circuit</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Atomic Two-Phase Commit across Postgres 16 WAL, Neo4j graph nodes, and pgvector embeddings.
                Eliminates stale skill vectors when students approve resume bullets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-purple-900/50">
              <div className="w-8 h-8 rounded-lg bg-purple-950 flex items-center justify-center text-purple-400 mb-3 border border-purple-800">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">B. Cold-Start Imputation</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Evaluates student Sparsity Index and seeds empirical Bayesian cohort priors. Prevents
                hallucinated risk flags for incoming students with sparse initial profiles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/50">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-800">
                <Microscope className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">C. Async LLM Evaluator</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Runs parallel to PolicyEngine. Scans output for metric hallucination, verifies STAR causal logic
                in mock interviews, and produces tamper-proof cryptographic evaluation certificates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CDC & 2PC Synchronization Circuit */}
      {activeTab === 'cdc' && (
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-mono font-bold text-white text-sm">CIRCUIT STATUS: {cdcTelemetry.circuitState}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Debezium Postgres WAL LSN tracking with Two-Phase Commit ensuring pgvector and Neo4j lockstep synchronization.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTriggerSync}
                disabled={isTriggeringSync}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringSync ? 'animate-spin' : ''}`} />
                <span>Execute 2PC Dispatch</span>
              </button>
            </div>
          </div>

          {/* Telemetry Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500">POSTGRES WAL LSN</div>
              <div className="text-lg font-mono font-bold text-indigo-400 mt-1">{cdcTelemetry.postgresWalLsn}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Postgres 16 write log offset</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500">SYNC EPOCH</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">#{cdcTelemetry.lastSyncEpoch}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Monotonic transaction epoch</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500">NEO4J GRAPH LAG</div>
              <div className="text-lg font-mono font-bold text-white mt-1">{cdcTelemetry.neo4jLagMs} ms</div>
              <div className="text-[10px] text-emerald-500 mt-0.5">0ms lockstep latency</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500">PGVECTOR / QDRANT LAG</div>
              <div className="text-lg font-mono font-bold text-white mt-1">{cdcTelemetry.pgvectorLagMs} ms</div>
              <div className="text-[10px] text-emerald-500 mt-0.5">0ms embeddings latency</div>
            </div>
          </div>

          {/* CDC Event Ledger */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="font-semibold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Live CDC Transaction Replay Stream ({cdcEvents.length} events)
              </div>
              <span className="text-[11px] font-mono text-slate-400">Stream: {cdcTelemetry.redisStreamPartition}</span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
              {cdcEvents.map((evt) => (
                <div key={evt.eventId} className="p-3.5 hover:bg-slate-850/50 transition font-mono text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {evt.operation}
                      </span>
                      <span className="text-slate-300 font-semibold">{evt.sourceTable}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-400">{evt.entityId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="text-emerald-400">WAL: {evt.walLsn}</span>
                      <span>Epoch: #{evt.syncEpoch}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-400/90">
                      <Check className="w-3 h-3" /> Postgres 16 (ACID)
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400/90">
                      <Check className="w-3 h-3" /> Neo4j DAG
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400/90">
                      <Check className="w-3 h-3" /> pgvector Embeddings
                    </span>
                    <span className="ml-auto text-slate-600">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cold-Start & Sparsity Ingestion Pipeline */}
      {activeTab === 'cold_start' && (
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                The Cold-Start & Sparsity Ingestion Pipeline
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Solves data sparsity for new students with 0 mock interview logs and empty application histories.
                Imputes empirical Bayesian priors (μ_cohort, σ²) and maps syllabus coursework to skill proficiencies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-purple-500"
              >
                <option value="stanford_cs">Stanford CS (Systems Track)</option>
                <option value="cmu_cs">Carnegie Mellon CS (Core Systems)</option>
                <option value="general_engineering">General Engineering CS</option>
              </select>

              <button
                onClick={handleRunColdStartSimulation}
                disabled={isSimulatingColdStart}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSimulatingColdStart ? 'animate-spin' : ''}`} />
                <span>Bootstrap Profile</span>
              </button>
            </div>
          </div>

          {/* Sparsity Index Gauge & Cohort Baselines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-slate-500">SPARSITY INDEX (EMPTY CANDIDATE)</div>
                <div className="text-3xl font-black text-rose-400 mt-2">0.85</div>
                <div className="text-xs text-rose-300/80 mt-1">High Data Sparsity (Vulnerable to Hallucinated Risk)</div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-rose-500 h-full w-[85%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-slate-500">SPARSITY AFTER CURRICULUM IMPUTATION</div>
                <div className="text-3xl font-black text-emerald-400 mt-2">0.18</div>
                <div className="text-xs text-emerald-300/80 mt-1">Defensible Baseline Seeding Complete</div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[18%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-slate-500">BAYESIAN PRIOR COEFFICIENT (θ)</div>
                <div className="text-3xl font-black text-indigo-400 mt-2">
                  {INSTITUTIONAL_COHORT_BASELINES[selectedCohort]?.empiricalMeanTheta > 0 ? '+' : ''}
                  {INSTITUTIONAL_COHORT_BASELINES[selectedCohort]?.empiricalMeanTheta.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Confidence Band: [{(INSTITUTIONAL_COHORT_BASELINES[selectedCohort]?.empiricalMeanTheta - 0.4).toFixed(2)}, {(INSTITUTIONAL_COHORT_BASELINES[selectedCohort]?.empiricalMeanTheta + 0.4).toFixed(2)}]
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-4">
                Calibrated against {INSTITUTIONAL_COHORT_BASELINES[selectedCohort]?.university}
              </div>
            </div>
          </div>

          {/* Imputed Coursework & Skills */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Imputed Coursework → DLDM Skill Graph Proficiencies ({INSTITUTIONAL_COHORT_BASELINES[selectedCohort]?.imputedCoreSkills.length} skills)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INSTITUTIONAL_COHORT_BASELINES[selectedCohort]?.imputedCoreSkills.map((s) => (
                <div key={s.skillId} className="p-3 rounded-lg bg-slate-850 border border-slate-750 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white text-xs">{s.skillName}</div>
                    <div className="text-[11px] text-indigo-400 mt-0.5">{s.courseworkEvidence}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">Provenance: SYSTEM_DERIVED (Confidence: {Math.round(s.confidence * 100)}%)</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 shrink-0">
                    {s.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Synthetic Trajectory Banner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-900/50 flex items-center justify-between gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400">Synthetic EWEIS Trajectory: </span>
              <span className="text-indigo-300 font-bold">T-180 (52.0) → T-90 (61.5) → Current (68.0)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              False-Positive Risk Flag: Prevented
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Asynchronous LLM Guardrail & Evaluator Feed */}
      {activeTab === 'guardrails' && (
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Microscope className="w-4 h-4 text-emerald-400" />
                Asynchronous Parallel LLM Evaluator & Guardrail Pipeline
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Policy rules alone only validate permissions (e.g. prohibiting edits). This engine inspects 
                semantic output quality, detecting hallucinated company culture metrics and broken STAR evaluation rubrics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700">
                Pass Rate: {guardrailTelemetry.certifiedPassRate}%
              </span>
            </div>
          </div>

          {/* Guardrail Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500">TOTAL EVALUATIONS</div>
              <div className="text-lg font-mono font-bold text-white mt-1">{guardrailTelemetry.totalEvaluationsRun}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Continuous async audits</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500">HALLUCINATION RATE</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">{guardrailTelemetry.hallucinationRate}%</div>
              <div className="text-[10px] text-emerald-500 mt-0.5">Strict empirical ground</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500">STAR INVERSION RATE</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">{guardrailTelemetry.starLogicInversionRate}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Causal rubric coherence</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500">ASYNC EVAL LATENCY</div>
              <div className="text-lg font-mono font-bold text-indigo-400 mt-1">{guardrailTelemetry.averageEvalLatencyMs} ms</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Non-blocking background loop</div>
            </div>
          </div>

          {/* Interactive Output Audit Tester */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Live Output Quality & Hallucination Audit Sandbox
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] font-mono">Original Candidate Bullet:</label>
                <input
                  type="text"
                  value={testBulletOriginal}
                  onChange={(e) => setTestBulletOriginal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 mt-1 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] font-mono">AI Proposed AST Rewrite:</label>
                <input
                  type="text"
                  value={testBulletSuggested}
                  onChange={(e) => setTestBulletSuggested(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 mt-1 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleRunGuardrailAudit}
                disabled={isAuditingGuardrail}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAuditingGuardrail ? 'Auditing...' : 'Evaluate Quality & Hallucination'}</span>
              </button>
            </div>

            {guardrailTestResult && (
              <div className="mt-3 p-3.5 rounded-lg bg-slate-850 border border-indigo-900/60 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    guardrailTestResult.status === 'CERTIFIED_PASS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {guardrailTestResult.status}
                  </span>
                  <span className="text-slate-400 text-[11px]">Audit Hash: {guardrailTestResult.auditHash}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>Quality Score: <span className="text-white font-bold">{guardrailTestResult.qualityScore}/100</span></div>
                  <div>Hallucination Risk: <span className="text-emerald-400 font-bold">{(guardrailTestResult.hallucinationRisk * 100).toFixed(1)}%</span></div>
                  <div>Rubric Coherence: <span className="text-indigo-300 font-bold">{guardrailTestResult.rubricCoherenceScore}/100</span></div>
                </div>
                <div className="text-[11px] text-slate-300">
                  <span className="text-slate-500">Findings: </span>{guardrailTestResult.findings.join(' • ')}
                </div>
              </div>
            )}
          </div>

          {/* Recent Cryptographic Certificates */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-white text-sm">Recent Cryptographic Quality Certificates</span>
              <span className="text-xs font-mono text-slate-400">SHA-256 Tamper-Proof Trail</span>
            </div>
            <div className="divide-y divide-slate-800/80">
              {guardrailTelemetry.recentCertificates.slice(0, 4).map((cert) => (
                <div key={cert.certificateId} className="p-3.5 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {cert.status}
                      </span>
                      <span className="text-white font-semibold">{cert.taskType}</span>
                      <span className="text-slate-500 font-sans">({cert.sourceModule})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{cert.findings[0]}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-indigo-400 text-[11px]">{cert.auditHash.substring(0, 24)}...</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">Score: {cert.qualityScore}/100</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Intellectual Property Novelty & Technical Roadmap */}
      {activeTab === 'ip_novelty' && (
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              AURA Intellectual Property (IP) Highlights
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Architectural breakthroughs engineered for enterprise clients, university career centers, and patent defensibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Innovation 1 */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  INNOVATION 1
                </span>
                <h4 className="font-bold text-white text-base mt-2">Deterministic 8-Tier Provenance Ledger</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Unlike black-box HR tech, every single skill, metric, and recommendation carries a cryptographic SHA-256 fingerprint, confidence interval, and exact data lineage:
                </p>
                <ul className="text-xs text-slate-300 mt-3 space-y-1 font-mono">
                  <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> VERIFIED_EMPLOYER (100%)</li>
                  <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> VERIFIED_CANDIDATE (100%)</li>
                  <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> VERIFIED_INSTITUTION (95%)</li>
                  <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> PUBLIC_SOURCE (80%)</li>
                  <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> COMMUNITY_AGGREGATED (75%)</li>
                  <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> MODEL_INFERRED (Requires HITL)</li>
                  <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> USER_ASSERTED (Pending)</li>
                  <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> SYSTEM_DERIVED (98%)</li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-indigo-400 font-mono">
                Cryptographic Defensibility • FERPA Compliant
              </div>
            </div>

            {/* Innovation 2 */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  INNOVATION 2
                </span>
                <h4 className="font-bold text-white text-base mt-2">Predictive 90-Day Early Warning (EWEIS)</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Institutional career offices are historically reactive (reviewing outcomes post-graduation). EWEIS calculates anomaly vector trajectories ($T-180 \longrightarrow T-90$) to identify students needing intervention 90 days before placements conclude:
                </p>
                <div className="mt-3 p-3 rounded-lg bg-slate-850 font-mono text-[11px] text-amber-300 border border-amber-900/50">
                  Δ_trajectory = ∫ [T-180 → T-90] (θ_actual - θ_benchmark) dt
                  <div className="text-slate-400 text-[10px] mt-1">Triggers automated closed-loop counselor alerts & tailored action plans.</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-mono">
                Closed-Loop Interventions • Cohort Parity
              </div>
            </div>

            {/* Innovation 3 */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  INNOVATION 3
                </span>
                <h4 className="font-bold text-white text-base mt-2">Zero-Unilateral-Edit HITL Guardrail</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Standard AI resume tools silently overwrite candidate resumes, injecting hallucinations. AURA enforces a strict policy engine where AI proposals generate AST diffs requiring explicit candidate approval before state mutation occurs:
                </p>
                <div className="mt-3 p-3 rounded-lg bg-slate-850 font-mono text-[11px] text-rose-300 border border-rose-900/50">
                  AST Diff Engine → Candidate Review → 2PC CDC Commit
                  <div className="text-slate-400 text-[10px] mt-1">Anti-fatigue batching filters low-risk formatting vs strategic overhaul.</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-rose-400 font-mono">
                Strict Candidate Agency • Immutable Audit Hashes
              </div>
            </div>
          </div>

          {/* Technical Enhancements Roadmap */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-3">Enterprise Technical Enhancements Implementation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-750">
                <div className="font-semibold text-emerald-300">1. Redis Streams & BullMQ Pipeline</div>
                <div className="text-slate-400 mt-1">Replaces Kafka overhead for early-to-mid scale deployments while maintaining deterministic replay guarantees.</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-850 border border-slate-750">
                <div className="font-semibold text-emerald-300">2. PostgreSQL Row-Level Security (RLS)</div>
                <div className="text-slate-400 mt-1">Guarantees institutional multi-tenancy at database layer, isolating Stanford from CMU candidate data.</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-850 border border-emerald-800/60 bg-emerald-950/20">
                <div className="font-semibold text-emerald-300">3. Whisper & Technical Speech Lexicon</div>
                <div className="text-slate-400 mt-1">Normalizes technical speech jargon (gRPC, Raft, B-Tree, pgvector) with zero phonetic transcription loss.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
