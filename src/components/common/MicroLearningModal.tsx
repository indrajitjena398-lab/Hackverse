'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Video, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Zap,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { eventBus } from '@/lib/engine/EventBus';
import { candidateIntelligenceEngine } from '@/lib/engine/CandidateIntelligenceEngine';

interface MicroLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  category?: string;
  onSkillAcquired?: (skillId: string) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

const SKILL_CURATED_RESOURCES: Record<string, {
  docsUrl: string;
  docsTitle: string;
  videoUrl: string;
  videoTitle: string;
  githubUrl: string;
  githubTitle: string;
  estimatedMinutes: number;
  questions: QuizQuestion[];
}> = {
  caching_redis: {
    docsUrl: 'https://redis.io/docs/latest/develop/use/patterns/',
    docsTitle: 'Redis Official Architecture & Cache-Aside Documentation',
    videoUrl: 'https://www.youtube.com/watch?v=G1rOthIU-uo',
    videoTitle: 'System Design: Distributed Caching Architecture & Redis in Production',
    githubUrl: 'https://github.com/redis/redis',
    githubTitle: 'Redis GitHub Source & Lua Scripting Reference',
    estimatedMinutes: 15,
    questions: [
      {
        question: 'Under the Cache-Aside pattern, what happens when an application requests a missing key (Cache Miss)?',
        options: [
          'The cache automatically queries the database without application logic',
          'The application reads from the DB, writes the result to cache, then returns the data',
          'The application drops the connection and returns an HTTP 504 Gateway Timeout',
          'The cache invalidates all surrounding keys to prevent stale reads'
        ],
        correctAnswerIndex: 1,
        explanation: 'In Cache-Aside, the application code checks the cache first; on a miss, it queries the primary DB, populates the cache with a TTL, and returns the payload.'
      },
      {
        question: 'Which strategy best mitigates the "Cache Stampede / Thundering Herd" problem when a hot key expires?',
        options: [
          'Set the TTL to zero so all keys are permanently persistent',
          'Use probabilistic early expiration (XFetch) or distributed mutex locking',
          'Restart the Redis primary replica instance',
          'Switch immediately from Redis to SQLite'
        ],
        correctAnswerIndex: 1,
        explanation: 'Probabilistic early expiration (XFetch algorithm) or a distributed lock ensures only a single background worker recomputes the hot cache item while other threads serve slightly stale data.'
      },
      {
        question: 'Why are Lua scripts preferred over multi-step client commands for atomic Redis operations?',
        options: [
          'Lua scripts compile into WebAssembly on the client',
          'Redis executes Lua scripts atomically on the single thread, preventing race conditions',
          'Lua scripts bypass disk serialization entirely',
          'Lua scripts compress key-value payloads using Gzip'
        ],
        correctAnswerIndex: 1,
        explanation: 'Redis executes Lua scripts atomically from start to finish on its event loop, guaranteeing no other command can interleave or cause concurrency race conditions.'
      }
    ]
  },
  system_design: {
    docsUrl: 'https://github.com/donnemartin/system-design-primer',
    docsTitle: 'System Design Primer: Distributed Architecture Handbook',
    videoUrl: 'https://www.youtube.com/watch?v=i53Gi_K3o7I',
    videoTitle: 'MIT 6.824: Distributed Systems Lecture 1 - Introduction & RPC',
    githubUrl: 'https://github.com/karanpratapsingh/system-design',
    githubTitle: 'Scalable Software Architecture Patterns & Case Studies',
    estimatedMinutes: 15,
    questions: [
      {
        question: 'According to the CAP Theorem, when a network partition (P) occurs, what trade-off must a distributed system make?',
        options: [
          'Choose between Speed and Disk Storage',
          'Choose between Consistency (C) and Availability (A)',
          'Choose between Encryption and Low Latency',
          'Abandon all transactions permanently'
        ],
        correctAnswerIndex: 1,
        explanation: 'During an inevitable network partition, a distributed system must choose whether to sacrifice Availability (reject writes to preserve linearizability) or Consistency (allow concurrent writes across partitions).'
      },
      {
        question: 'What is the primary architectural benefit of Consistent Hashing over simple modulus (hash(key) % N)?',
        options: [
          'Eliminates the need for any hash functions',
          'Minimizes key remapping when adding or removing database cluster nodes',
          'Guarantees zero memory allocation on the server',
          'Forces all queries into a single database server'
        ],
        correctAnswerIndex: 1,
        explanation: 'Consistent Hashing with virtual nodes ensures that when a server is added or removed, only K/N keys are migrated rather than triggering a catastrophic full cluster rehash.'
      },
      {
        question: 'Which technique is ideal for handling high write spikes without overwhelming downstream relational databases?',
        options: [
          'Asynchronous Message Queuing with Dead-Letter Queues (e.g. Kafka or RabbitMQ)',
          'Synchronous HTTP POST calls with infinite retry loops',
          'Increasing database thread pool size to 50,000 threads',
          'Disabling database WAL journaling'
        ],
        correctAnswerIndex: 0,
        explanation: 'Message queues act as shock absorbers (load leveling), buffering sudden ingress write spikes and allowing database workers to consume records at a sustainable rate.'
      }
    ]
  },
  default: {
    docsUrl: 'https://developer.mozilla.org/en-US/',
    docsTitle: 'MDN Web Docs & Software Architecture Specifications',
    videoUrl: 'https://www.youtube.com/results?search_query=software+architecture+engineering',
    videoTitle: 'Production Engineering Case Studies & Architecture Drills',
    githubUrl: 'https://github.com/topics/software-architecture',
    githubTitle: 'Curated Open Source Engineering Patterns',
    estimatedMinutes: 15,
    questions: [
      {
        question: 'What is the primary indicator of high code maintainability in modern microservices?',
        options: [
          'Maximum line count per function',
          'High cohesion within modules and loose coupling between services',
          'Avoiding automated testing suites',
          'Direct shared database access between all microservices'
        ],
        correctAnswerIndex: 1,
        explanation: 'Loose coupling and high cohesion ensure individual microservices can be deployed, scaled, and refactored independently without cascading blast radius.'
      },
      {
        question: 'How do production systems achieve idempotent API mutations (e.g. payment processing)?',
        options: [
          'By generating unique Idempotency-Keys cached with transaction status',
          'By assuming network requests never drop or duplicate',
          'By disabling HTTP POST methods',
          'By running database transactions without primary keys'
        ],
        correctAnswerIndex: 0,
        explanation: 'Clients generate a unique UUID Idempotency-Key; the backend checks if this key has already executed, returning the cached response to prevent duplicate billing.'
      },
      {
        question: 'What is the purpose of a Circuit Breaker pattern in distributed microservices?',
        options: [
          'To permanently shut down the cloud datacenter',
          'To fail fast when a downstream dependency degrades, preventing cascading latency exhaustion',
          'To bypass authentication checks during peak traffic',
          'To delete slow records from the database'
        ],
        correctAnswerIndex: 1,
        explanation: 'Circuit breakers monitor failure rates; when a threshold is breached, calls fail fast immediately instead of blocking threads and bringing down the entire upstream cluster.'
      }
    ]
  }
};

export function MicroLearningModal({
  isOpen,
  onClose,
  skillId,
  skillName,
  category = 'Architecture',
  onSkillAcquired
}: MicroLearningModalProps) {
  const resource = SKILL_CURATED_RESOURCES[skillId] || SKILL_CURATED_RESOURCES.default;

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    if (submitted && isSuccess) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleEvaluateQuiz = () => {
    let allCorrect = true;
    for (let i = 0; i < resource.questions.length; i++) {
      if (selectedAnswers[i] !== resource.questions[i].correctAnswerIndex) {
        allCorrect = false;
        break;
      }
    }

    setSubmitted(true);

    if (allCorrect) {
      setIsSuccess(true);

      // 1. Update candidate intelligence engine directly
      candidateIntelligenceEngine.setSkillMastery(skillId, 'proficient', 85);

      // 2. Dispatch SKILL_ACQUIRED event via central EventBus
      eventBus.publish({
        type: 'SKILL_ACQUIRED' as any,
        event_type: 'SKILL_ACQUIRED',
        candidate_id: candidateIntelligenceEngine.getProfile().id,
        source: 'AURA 15-Min Micro-Learning Engine',
        payload: {
          skillId,
          skillName,
          category,
          newLevel: 'proficient',
          scoreEarned: 85,
          timestamp: new Date().toISOString(),
        },
        provenance: {
          level: 'verified',
          source: 'Micro-Learning Mastery Drill Certification',
          confidenceScore: 92,
          lastVerifiedAt: new Date().toISOString().split('T')[0],
          auditHash: `0xmicrolearn_${skillId}_${Date.now().toString(16)}`,
        },
      } as any);

      if (onSkillAcquired) {
        onSkillAcquired(skillId);
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setIsSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-semibold text-slate-700">
              <Sparkles className="w-3 h-3 text-indigo-700" />
              <span>Targeted Practice Sprint</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Skill Acquisition: {skillName}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Targeted skill verification: Review the curated technical documentation and pass the checkpoint questions to sync proficiency with your profile.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Curated Documentation & Video References */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
            <span>Curated Reference Materials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Docs */}
            <a
              href={resource.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-indigo-700 font-semibold flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Official Documentation
                </span>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition">
                  {resource.docsTitle}
                </p>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-2 font-mono">
                View Documentation <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </a>

            {/* Video API */}
            <a
              href={resource.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-rose-700 font-semibold flex items-center gap-1">
                  <Video className="w-3 h-3" /> Technical Lecture
                </span>
                <p className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition">
                  {resource.videoTitle}
                </p>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-2 font-mono">
                Watch Overview ({resource.estimatedMinutes}m) <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </a>

            {/* GitHub */}
            <a
              href={resource.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                  <Github className="w-3 h-3" /> Architecture Reference
                </span>
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  {resource.githubTitle}
                </p>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-2 font-mono">
                Inspect Repository <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </a>
          </div>
        </div>

        {/* Section 2: 3-Question Mini-Quiz */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-700" />
              <span>Checkpoint Knowledge Check (3 Questions)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Answer 3/3 correctly to update profile
            </span>
          </div>

          <div className="space-y-4">
            {resource.questions.map((q, qIdx) => {
              const selected = selectedAnswers[qIdx];
              const isCorrect = selected === q.correctAnswerIndex;

              return (
                <div key={qIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      Q{qIdx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = selected === oIdx;
                      let optionStyle = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';

                      if (isOptionSelected) {
                        optionStyle = 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs';
                      }

                      if (submitted) {
                        if (oIdx === q.correctAnswerIndex) {
                          optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(qIdx, oIdx)}
                          className={`text-left p-2.5 rounded-lg border text-xs transition flex items-center gap-2 cursor-pointer ${optionStyle}`}
                        >
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-mono ${isOptionSelected ? 'border-white text-white' : 'border-slate-300 text-slate-500'}`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                      isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <strong className="font-semibold">{isCorrect ? '✓ Correct: ' : '✗ Incorrect: '}</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Evaluation Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {isSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 flex-1 animate-in fade-in">
                <Award className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <strong>Proficiency Verified!</strong> {skillName} marked as <em>Proficient</em>. Skill score successfully synced to candidate profile.
                </div>
              </div>
            ) : submitted && !isSuccess ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 flex-1">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  Score was not 3/3. Review the explanations above and retry the checkpoint check.
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {submitted && !isSuccess && (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Check</span>
                </button>
              )}

              {!isSuccess ? (
                <button
                  type="button"
                  onClick={handleEvaluateQuiz}
                  disabled={Object.keys(selectedAnswers).length < resource.questions.length}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <span>Submit &amp; Verify Proficiency</span>
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Return to Skill Graph</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
