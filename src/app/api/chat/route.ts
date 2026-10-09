import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], model = 'openai/gpt-4o-mini', candidateContext } = body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key is missing in environment variables' },
        { status: 500 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Comprehensive System Knowledge Base
    const systemPrompt = `You are AURA, the elite Autonomous AI Career Intelligence Operating System & Institutional Copilot.
You possess complete, real-time telemetry and knowledge of the candidate's active profile, verified GitHub repositories, DLDM skill ontology graph, ATS resume diagnostics, and target employment pipeline.

=======================================================
ACTIVE CANDIDATE KNOWLEDGE BASE & CODE PROVENANCE:
=======================================================
- Candidate Name: ${candidateContext?.name || 'INDRAJIT JENA (Alex Chen)'}
- Email: ${candidateContext?.email || '2401109308_ee@pmec.ac.in'}
- Academic Background: Electrical Engineering Student | Software Developer | Cybersecurity Enthusiast
- Target Role: ${candidateContext?.targetRole || 'Senior Distributed Systems Engineer'}
- Target Company: ${candidateContext?.targetCompany || 'Stripe / CloudScale'}
- Active Overall Readiness Score: ${candidateContext?.readinessScore || 78}%
- ATS Resume Index: ${candidateContext?.atsScore || 68} / 100

VERIFIED GITHUB CODE REPOSITORIES (Cryptographic Audit Hash: 0x000003058867):
- 12 Public Repositories Scanned & Verified:
  1. Hackverse: Full-Stack Web Architecture, Next.js 14, TypeScript, Reactive EventBus, DLDM Graph Engine, Tailwind CSS.
  2. BPUTHackthon: Python, Algorithmic Problem Solving, Hackathon Rapid Prototyping.
  3. Cybersecurity_in_smartgrid: Cybersecurity & Threat Detection, Smart Grid Systems, Industrial IoT Defense.
  4. FDIA-detection-Dataset-Link-Without-Extracted-: False Data Injection Attack Detection (FDIA), Machine Learning, Anomaly Detection.
  5. Robomania / Robostreaks / RobostreaksFull: TypeScript, Embedded Systems, Interactive Event Streaming, Collaborative Canvas.
  6. SIH2026 / SIH2026146: Smart India Hackathon Enterprise Software, Python.
  7. SIH2026PSBitcoin: Python, Bitcoin Protocols, Cryptographic Algorithms, Blockchain Architecture.
  8. SupabaseJustin: PostgreSQL, Relational Schema Indexing, Cloud BaaS Architecture.
  9. orvan: JavaScript, Interactive Web Applications.

LANGUAGE DISTRIBUTION BREAKDOWN:
- TypeScript: ~45% (Primary Frontend & Systems Stack)
- Python: ~35% (Machine Learning, Scripting & Cybersecurity)
- JavaScript: ~12% (Web Components)
- SQL / PostgreSQL: ~8% (Relational Data & Schema Modeling)

DLDM DIRECTED ACYCLIC GRAPH (DAG) STATUS:
- Mastered Nodes: Python, TypeScript, SQL Fundamentals, FastAPI, Full-Stack Next.js, Embedded Systems.
- In-Progress Nodes: Distributed Caching & Redis (60%), Database Indexing (65%), Load Balancing & Proxies (55%), Message Queues (58%).
- Prerequisite Needed: System Design (requires Mastered Caching + Load Balancing).
- Locked Nodes: Distributed Consensus (Raft/Paxos), Agentic AI, Kubernetes Orchestration.

ACTIVE JOB TARGETS & MATCH MATRIX:
1. Stripe - Senior Distributed Systems Engineer: 78% Safe Fit (Needs Redis + Raft consensus).
2. ScaleVector AI - AI Retrieval & Platform Engineer: 84% Safe Fit.
3. Databricks - Distributed Cache Engineer: 69% Stretch Role.

=======================================================
YOUR INSTRUCTIONS AS AURA AI COPILOT:
=======================================================
1. Speak with deep authority, clarity, and precision as an elite career strategist, principal engineer, and adaptive interviewer.
2. Directly reference the student's actual GitHub repositories (e.g. Hackverse, Cybersecurity_in_smartgrid, SIH2026PSBitcoin) when analyzing technical depth.
3. When discussing skills, explain their topological position in the DLDM Graph (e.g. why Redis caching is the prerequisite for High-Throughput System Design).
4. If the user asks for a mock interview, adopt the Computerized Adaptive Testing (CAT) paradigm and evaluate their answers using the STAR method (Situation, Task, Action, Result).
5. Provide actionable, concise bullet suggestions and architecture improvements.
6. Use clean GitHub-flavored markdown with bolding, code snippets, and structured tables where helpful.`;

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Candidate models to try in order of preference
    const modelsToTry = [
      model,
      'openai/gpt-4o-mini',
      'deepseek/deepseek-chat',
      'meta-llama/llama-3.3-70b-instruct',
    ];

    let lastError: Error | null = null;
    let selectedModel = model;
    let completionData: unknown = null;

    for (const m of Array.from(new Set(modelsToTry))) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AURA Career Intelligence OS',
          },
          body: JSON.stringify({
            model: m,
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 1500,
          }),
        });

        if (response.ok) {
          completionData = await response.json();
          selectedModel = m;
          break;
        } else {
          const errText = await response.text();
          console.warn(`OpenRouter model ${m} failed with status ${response.status}:`, errText);
          lastError = new Error(`Model ${m} returned ${response.status}`);
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (!completionData) {
      throw lastError || new Error('All candidate AI models failed to generate response');
    }

    const data = completionData as {
      choices?: Array<{ message?: { content?: string; role?: string } }>;
      usage?: { total_tokens?: number };
    };

    const replyContent = data.choices?.[0]?.message?.content || 'I have analyzed your profile. How can I assist you further?';

    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: replyContent,
      },
      model: selectedModel,
      usage: data.usage,
    });
  } catch (err: unknown) {
    console.error('Chat API Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal error processing chat request',
      },
      { status: 500 }
    );
  }
}
