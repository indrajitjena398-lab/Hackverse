import { NextRequest, NextResponse } from 'next/server';
import { normalizeTechnicalSpeech } from '@/lib/engine/TechnicalSpeechLexicon';

interface CandidateTurnPayload {
  action: 'start_session' | 'evaluate_and_next';
  topic: string;
  customTopicDescription?: string;
  totalQuestions: number;
  currentQuestionNumber: number;
  candidateName?: string;
  targetRole?: string;
  experienceLevel?: string;
  adaptiveContext?: string;
  currentQuestion?: string;
  candidateAnswer?: string;
  currentDifficulty?: number; // 1 to 4
  currentTheta?: number; // Bayesian theta [-3.0, +3.0]
  history?: Array<{
    question: string;
    answer: string;
    score: number;
    difficulty: number;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const payload: CandidateTurnPayload = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    const {
      action,
      topic,
      customTopicDescription,
      totalQuestions = 5,
      currentQuestionNumber = 1,
      candidateName = 'Alex Chen',
      targetRole = 'Senior Distributed Systems Engineer',
      experienceLevel = 'Senior',
      adaptiveContext,
      currentQuestion,
      candidateAnswer,
      currentDifficulty = 2,
      currentTheta = 0.0,
      history = [],
    } = payload;

    const effectiveTopic = customTopicDescription?.trim() || topic;

    // -------------------------------------------------------------
    // ACTION 1: START SESSION - Generate Initial Question 1
    // -------------------------------------------------------------
    if (action === 'start_session') {
      const systemPrompt = `You are an expert technical interviewer conducting a Computerized Adaptive Testing (CAT) interview for a ${experienceLevel} ${targetRole} position.
The candidate's name is ${candidateName}.
The targeted competency topic is: "${effectiveTopic}".
The candidate has configured a session of ${totalQuestions} questions.
${adaptiveContext ? `Contextual Candidate Gap Focus: "${adaptiveContext}"\nTailor questions around this diagnosed weakness and practical engineering trade-offs.` : ''}

Task: Generate Question 1 (foundational to intermediate level, Level 2 difficulty).
Requirements:
1. Warm, professional greeting addressing ${candidateName}.
2. Pose a concrete, real-world engineering problem or architectural challenge on "${effectiveTopic}".
3. Encourage the candidate to structure their answer with the STAR methodology (Situation, Task, Action, Result) and cite quantified technical metrics (latency, throughput, concurrency, failure modes).
4. Return pure JSON matching this schema:
{
  "questionText": "The interview question string",
  "difficultyLevel": 2,
  "testedCompetency": "${effectiveTopic}",
  "keyConceptsExpected": ["concept 1", "concept 2", "concept 3"]
}`;

      let aiQuestion = `Welcome ${candidateName}. Let's begin our ${totalQuestions}-question adaptive interview on "${effectiveTopic}". Can you walk me through an architecture you've designed or worked on in this domain, explaining the core trade-offs, how you handled peak concurrency, and how data consistency was maintained under failure?`;
      let concepts = ['System Architecture', 'Concurrency', 'Fault Tolerance'];

      if (apiKey) {
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://hackverse.dev',
              'X-Title': 'AURA Adaptive Mock Interviewer',
            },
            body: JSON.stringify({
              model: process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Generate Question 1 of ${totalQuestions} on "${effectiveTopic}".` },
              ],
              temperature: 0.7,
              response_format: { type: 'json_object' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              if (parsed.questionText) {
                aiQuestion = parsed.questionText;
              }
              if (parsed.keyConceptsExpected) {
                concepts = parsed.keyConceptsExpected;
              }
            }
          }
        } catch (apiErr) {
          console.warn('[Adaptive Turn] OpenRouter start_session error, using fallback:', apiErr);
        }
      }

      return NextResponse.json({
        success: true,
        questionNumber: 1,
        totalQuestions,
        questionText: aiQuestion,
        difficultyLevel: 2,
        bayesianTheta: 0.0,
        testedCompetency: effectiveTopic,
        expectedConcepts: concepts,
      });
    }

    // -------------------------------------------------------------
    // ACTION 2: EVALUATE ANSWER & GENERATE NEXT QUESTION
    // -------------------------------------------------------------
    if (action === 'evaluate_and_next') {
      if (!candidateAnswer) {
        return NextResponse.json({ error: 'Candidate answer is required' }, { status: 400 });
      }

      // Step 2.1: Speech AST Normalization
      const speechNorm = normalizeTechnicalSpeech(candidateAnswer);
      const cleanedAnswer = speechNorm.normalizedText;

      const systemPrompt = `You are an elite Staff Engineer and Computerized Adaptive Testing (CAT) interviewer evaluating an answer for a ${experienceLevel} ${targetRole}.
Topic: "${effectiveTopic}"
Question ${currentQuestionNumber} of ${totalQuestions}:
"${currentQuestion}"

Candidate's Answer:
"${cleanedAnswer}"

Current Bayesian Latent Ability parameter: θ = ${currentTheta.toFixed(2)} (scale [-3.0, +3.0]).
Current difficulty level: Level ${currentDifficulty} (1=Foundational, 2=Core, 3=Advanced Architect, 4=Staff/Principal).

Evaluate the answer rigorously:
1. STAR Adherence (0-100 each for Situation, Task, Action, Result).
2. Technical Correctness (50-100 score). Check for concrete architecture depth, failure handling, and quantitative metrics (P99, throughput, replication).
3. If this was Question ${currentQuestionNumber} < ${totalQuestions}, generate Question ${currentQuestionNumber + 1}.
   - If the candidate answered strongly (correctness >= 80), raise difficulty or dive into edge cases / distributed failures.
   - If the candidate struggled (correctness < 65), provide scaffolding or ask a clarifying foundational question.
   - Otherwise maintain the level and explore adjacent operational trade-offs.
4. If this was the final question (${currentQuestionNumber} === ${totalQuestions}), set isFinalQuestion = true and nextQuestion = "".

Return ONLY valid JSON with this exact structure:
{
  "starScores": {
    "situation": 85,
    "task": 80,
    "action": 90,
    "result": 85
  },
  "technicalCorrectness": 88,
  "critique": "Crisp feedback citing strengths and specific areas to quantify metrics or improve architecture.",
  "recommendedAction": "increased_depth" | "maintained_level" | "provided_scaffolding",
  "nextDifficulty": 2,
  "nextTheta": 0.35,
  "isFinalQuestion": false,
  "nextQuestion": "The next adaptive technical question string..."
}`;

      let evalResult = {
        starScores: { situation: 82, task: 78, action: 88, result: 80 },
        technicalCorrectness: 84,
        critique: `Solid technical response with good domain coverage. Continue grounding your answers with explicit P99 latency impact and failover metrics.`,
        recommendedAction: 'maintained_level' as 'increased_depth' | 'maintained_level' | 'provided_scaffolding',
        nextDifficulty: currentDifficulty,
        nextTheta: currentTheta,
        isFinalQuestion: currentQuestionNumber >= totalQuestions,
        nextQuestion: '',
      };

      if (apiKey) {
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://hackverse.dev',
              'X-Title': 'AURA Adaptive Mock Interviewer',
            },
            body: JSON.stringify({
              model: process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Evaluate answer and provide next step.` },
              ],
              temperature: 0.6,
              response_format: { type: 'json_object' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              if (parsed.starScores) evalResult.starScores = parsed.starScores;
              if (typeof parsed.technicalCorrectness === 'number') {
                evalResult.technicalCorrectness = parsed.technicalCorrectness;
              }
              if (parsed.critique) evalResult.critique = parsed.critique;
              if (parsed.recommendedAction) evalResult.recommendedAction = parsed.recommendedAction;
              if (typeof parsed.nextDifficulty === 'number') {
                evalResult.nextDifficulty = Math.max(1, Math.min(4, parsed.nextDifficulty));
              }
              if (typeof parsed.nextTheta === 'number') {
                evalResult.nextTheta = Math.max(-3.0, Math.min(3.0, parsed.nextTheta));
              }
              if (typeof parsed.isFinalQuestion === 'boolean') {
                evalResult.isFinalQuestion = parsed.isFinalQuestion || currentQuestionNumber >= totalQuestions;
              }
              if (parsed.nextQuestion) evalResult.nextQuestion = parsed.nextQuestion;
            }
          }
        } catch (apiErr) {
          console.warn('[Adaptive Turn] OpenRouter evaluation error, using algorithmic fallback:', apiErr);
        }
      }

      // Algorithmic Bayesian fallback bounds clamp
      if (evalResult.nextTheta === currentTheta) {
        const itemDifficultyB = (currentDifficulty - 2.5) * 1.1;
        const probSuccess = 1 / (1 + Math.exp(-1.35 * (currentTheta - itemDifficultyB)));
        const rawDelta = 0.35 * (evalResult.technicalCorrectness / 100 - probSuccess);
        const clampedDelta = Math.max(-0.6, Math.min(0.6, rawDelta));
        evalResult.nextTheta = Math.max(-3.0, Math.min(3.0, currentTheta + clampedDelta));

        if (evalResult.nextTheta >= 1.6) evalResult.nextDifficulty = 4;
        else if (evalResult.nextTheta >= 0.5) evalResult.nextDifficulty = 3;
        else if (evalResult.nextTheta >= -0.8) evalResult.nextDifficulty = 2;
        else evalResult.nextDifficulty = 1;
      }

      if (currentQuestionNumber >= totalQuestions) {
        evalResult.isFinalQuestion = true;
        evalResult.nextQuestion = '';
      } else if (!evalResult.nextQuestion) {
        evalResult.nextQuestion = `Follow-up on ${effectiveTopic} (Question ${currentQuestionNumber + 1} of ${totalQuestions}, Level ${evalResult.nextDifficulty}): When scaling this system under 10x write load across multiple data centers, what specific replication strategy and partition tolerance trade-offs would you implement?`;
      }

      return NextResponse.json({
        success: true,
        evaluatedQuestionNumber: currentQuestionNumber,
        totalQuestions,
        normalizedAnswer: cleanedAnswer,
        speechASTCorrections: speechNorm.correctedTerms,
        starEvaluation: evalResult.starScores,
        technicalCorrectness: evalResult.technicalCorrectness,
        critique: evalResult.critique,
        catAdaptiveAction: evalResult.recommendedAction,
        bayesianTheta: evalResult.nextTheta,
        nextDifficulty: evalResult.nextDifficulty,
        isSessionCompleted: evalResult.isFinalQuestion,
        nextQuestion: evalResult.nextQuestion,
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/mock-interview/adaptive-turn:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
