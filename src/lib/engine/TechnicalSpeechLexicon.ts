/**
 * Technical Speech Lexicon & AST Normalizer
 * Compensates for browser Web Speech API & standard STT acoustic phoneme drift
 * on specialized software engineering and distributed systems terminology.
 */

export interface TermReplacement {
  pattern: RegExp;
  replacement: string;
  category: 'distributed_systems' | 'databases' | 'cloud_devops' | 'algorithms' | 'protocols';
}

export const TECHNICAL_TERM_PATTERNS: TermReplacement[] = [
  // Distributed Systems
  { pattern: /\b(cooper\s*net\s*e{1,2}s|coobernetes|k\s*8\s*s)\b/gi, replacement: 'Kubernetes', category: 'distributed_systems' },
  { pattern: /\b(cafca|caff\s*ca|kaffka)\b/gi, replacement: 'Kafka', category: 'distributed_systems' },
  { pattern: /\b(g\s*r\s*p\s*c|gee\s*rpc)\b/gi, replacement: 'gRPC', category: 'protocols' },
  { pattern: /\b(read\s*is|red\s*iss?)\b/gi, replacement: 'Redis', category: 'databases' },
  { pattern: /\b(post\s*grass(\s*cue\s*l)?|postgres\s*q\s*l)\b/gi, replacement: 'PostgreSQL', category: 'databases' },
  { pattern: /\b(raft\s*protocol|wrapped\s*consensus)\b/gi, replacement: 'Raft consensus', category: 'distributed_systems' },
  { pattern: /\b(h\s*n\s*s\s*w|hn\s*sw)\b/gi, replacement: 'HNSW', category: 'algorithms' },
  { pattern: /\b(p\s*99|p\s*9\s*9|ninety\s*ninth\s*percentile)\b/gi, replacement: 'P99', category: 'algorithms' },
  { pattern: /\b(bee\s*tree|b\s*dash\s*tree)\b/gi, replacement: 'B-Tree', category: 'databases' },
  { pattern: /\b(right\s*a\s*head\s*log|w\s*a\s*l)\b/gi, replacement: 'Write-Ahead Log (WAL)', category: 'databases' },
  { pattern: /\b(cache\s*aside|cash\s*aside)\b/gi, replacement: 'Cache-Aside', category: 'distributed_systems' },
  { pattern: /\b(thundering\s*herd|cash\s*stampede)\b/gi, replacement: 'Cache Stampede', category: 'distributed_systems' },
  { pattern: /\b(l\s*r\s*u|least\s*recently\s*used)\b/gi, replacement: 'LRU', category: 'algorithms' },
  { pattern: /\b(x\s*fetch|cross\s*fetch)\b/gi, replacement: 'XFetch probabilistic expiration', category: 'algorithms' },
  { pattern: /\b(a\s*c\s*i\s*d)\b/gi, replacement: 'ACID', category: 'databases' },
  { pattern: /\b(sharding|shard\s*ing)\b/gi, replacement: 'Sharding', category: 'databases' },
  { pattern: /\b(bull\s*m\s*q|bull\s*queue)\b/gi, replacement: 'BullMQ', category: 'distributed_systems' },
  { pattern: /\b(pg\s*vector|postgres\s*vector)\b/gi, replacement: 'pgvector', category: 'databases' },
];

export interface NormalizedSpeechResult {
  originalText: string;
  normalizedText: string;
  correctedTermsCount: number;
  correctedTerms: { from: string; to: string; category: string }[];
  detectedTechnicalTerms: string[];
}

/**
 * Normalizes acoustic drift from raw speech-to-text transcripts
 * into canonical software engineering syntax.
 */
export function normalizeTechnicalSpeech(rawTranscript: string): NormalizedSpeechResult {
  let normalized = rawTranscript;
  const correctedTerms: { from: string; to: string; category: string }[] = [];
  const detectedTechnicalTerms: string[] = [];

  for (const item of TECHNICAL_TERM_PATTERNS) {
    const matches = normalized.match(item.pattern);
    if (matches && matches.length > 0) {
      matches.forEach(m => {
        correctedTerms.push({ from: m, to: item.replacement, category: item.category });
      });
      normalized = normalized.replace(item.pattern, item.replacement);
      detectedTechnicalTerms.push(item.replacement);
    } else {
      // Check if already normalized term was spoken
      const directWordRegex = new RegExp(`\\b${item.replacement}\\b`, 'i');
      if (directWordRegex.test(normalized)) {
        detectedTechnicalTerms.push(item.replacement);
      }
    }
  }

  return {
    originalText: rawTranscript,
    normalizedText: normalized,
    correctedTermsCount: correctedTerms.length,
    correctedTerms,
    detectedTechnicalTerms: Array.from(new Set(detectedTechnicalTerms)),
  };
}
