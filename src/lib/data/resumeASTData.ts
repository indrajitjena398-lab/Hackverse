import { CandidateResume } from '../types/resume';

export const INITIAL_CANDIDATE_RESUME: CandidateResume = {
  id: 'res-cand-001',
  title: 'Alex Chen - Distributed Systems & Backend Resume (v3.2)',
  lastParsedAt: '2026-09-28T14:30:00Z',
  unilateralEditGuardrailEnforced: true,
  rawText: `Alex Chen
San Francisco, CA | alex.chen@stanford.alumni.edu | github.com/alexchen-dev | linkedin.com/in/alexchen-eng

WORK EXPERIENCE
Software Engineer Intern - Apex Cloud Infrastructure (June 2025 - Sept 2025)
- Built backend API endpoints in Python for cloud telemetry metrics.
- Worked on database queries and reports to monitor server health.
- Helped team deploy container apps using Docker and internal runners.

PROJECTS
High-Throughput Distributed Key-Value Store (Jan 2026 - Present)
- Developed an in-memory key-value cache in Python with basic TCP socket listener.
- Added replication features across multiple instances on localhost.

EDUCATION
B.S. in Computer Science, Stanford University (Class of 2026)
GPA: 3.84 / 4.0. Coursework: Distributed Systems, Operating Systems, Database Systems.
`,
  atsAnalysis: {
    overallScore: 68,
    parsabilityScore: 72,
    keywordMatchScore: 61,
    formatComplianceScore: 70,
    detectedSections: [
      {
        id: 'sec-contact',
        name: 'Contact Information',
        isStandardHeader: true,
        rawText: 'Alex Chen | San Francisco, CA | alex.chen@stanford.alumni.edu',
        parsedItems: ['Name: Alex Chen', 'Email: alex.chen@stanford.alumni.edu', 'Location: San Francisco, CA'],
      },
      {
        id: 'sec-exp',
        name: 'Work Experience',
        isStandardHeader: true,
        rawText: 'Software Engineer Intern - Apex Cloud Infrastructure...',
        parsedItems: ['Apex Cloud Infrastructure (Intern)', '3 bullet points extracted'],
      },
      {
        id: 'sec-proj',
        name: 'Projects',
        isStandardHeader: true,
        rawText: 'High-Throughput Distributed Key-Value Store...',
        parsedItems: ['Distributed Key-Value Store', '2 bullet points extracted'],
      },
      {
        id: 'sec-edu',
        name: 'Education',
        isStandardHeader: true,
        rawText: 'B.S. in Computer Science, Stanford University',
        parsedItems: ['Stanford University', 'B.S. CS 2026'],
      },
    ],
    complianceIssues: [
      {
        id: 'ats-iss-1',
        severity: 'critical',
        category: 'tables_or_columns',
        title: 'Two-Column Layout Artifact Detected',
        description: 'AST parser detected side-by-side table cells in the Contact & Skills block. Parsers like Greenhouse and Taleo may merge column text horizontally, corrupting contact details.',
        impactOnParsers: 'High risk of unparseable email address and truncated phone number in enterprise ATS systems.',
        fixRecommendation: 'Convert contact header to a linear, single-column text block separated by pipes or bullet symbols.',
      },
      {
        id: 'ats-iss-2',
        severity: 'warning',
        category: 'keyword_density',
        title: 'Low Quantified Business Metric Density',
        description: 'Only 1 of 5 extracted bullet points contains quantifiable numeric metrics (%, $, latency, throughput, scale).',
        impactOnParsers: 'ATS semantic scoring algorithms heavily penalize passive responsibility descriptions lacking quantified impact.',
        fixRecommendation: 'Apply the XYZ Formula: "Accomplished [X], as measured by [Y], by doing [Z]".',
      },
      {
        id: 'ats-iss-3',
        severity: 'info',
        category: 'section_headers',
        title: 'Standard Header Compliance',
        description: 'All 4 detected section titles correspond to ISO-standard ATS taxonomies (Work Experience, Projects, Education, Contact).',
        impactOnParsers: 'Sections will correctly map into candidate management database fields.',
        fixRecommendation: 'Maintain standard headers; avoid stylized naming like "Technical Journey".',
      },
    ],
    provenance: {
      level: 'inferred',
      source: 'Candidate Intelligence AST Engine (v4.2 ATS Parser)',
      confidenceScore: 94,
      inferenceModel: 'AST-Llama-Parser-Enterprise',
      inferenceReasoning: 'Grammar tree compiled from raw resume text against Greenhouse, Workday, and Lever parser schemas.',
      lastVerifiedAt: '2026-09-28',
      auditHash: '0x39a1b2c3d4',
    },
  },
  bulletProposals: [
    {
      id: 'hitl-01',
      experienceId: 'Apex Cloud Infrastructure',
      originalBullet: 'Built backend API endpoints in Python for cloud telemetry metrics.',
      suggestedBullet: 'Architected asynchronous telemetry ingestion endpoints in Python using FastAPI and Redis caching, slashing P99 API response latency by 43% under peak load of 14,000 req/sec.',
      quantifiedImpactAdded: 'Slashing P99 API response latency by 43% under 14k req/sec',
      actionVerbEnhanced: 'Architected & Scaled (replacing passive "Built")',
      targetedSkillId: 'caching_redis',
      targetedSkillName: 'Distributed Caching (Redis)',
      alignmentReasoning: 'Aligns directly with Stripe and Uber backend platform requirements for low-latency throughput.',
      status: 'pending',
      provenance: {
        level: 'inferred',
        source: 'HITL Bullet Optimization Engine',
        confidenceScore: 92,
        inferenceModel: 'Claude-3.5-Sonnet Impact Synthesizer',
        inferenceReasoning: 'Optimized against target JD requirements for Distributed Systems Engineer role at Stripe.',
        lastVerifiedAt: '2026-09-28',
        auditHash: '0xaa77889901',
      },
    },
    {
      id: 'hitl-02',
      experienceId: 'Apex Cloud Infrastructure',
      originalBullet: 'Worked on database queries and reports to monitor server health.',
      suggestedBullet: 'Engineered composite B-tree indexes and optimized PostgreSQL analytical window queries across 22M telemetry records, reducing database CPU utilization from 82% to 31%.',
      quantifiedImpactAdded: 'Reduced CPU from 82% to 31% across 22M records',
      actionVerbEnhanced: 'Engineered & Optimized (replacing "Worked on")',
      targetedSkillId: 'db_indexing',
      targetedSkillName: 'Relational Indexing & Query Optimization',
      alignmentReasoning: 'Directly demonstrates database scalability and profiling expertise required for Tier 2/3 engineering roles.',
      status: 'pending',
      provenance: {
        level: 'inferred',
        source: 'HITL Bullet Optimization Engine',
        confidenceScore: 90,
        inferenceModel: 'Claude-3.5-Sonnet Impact Synthesizer',
        lastVerifiedAt: '2026-09-28',
        auditHash: '0xbb88990012',
      },
    },
    {
      id: 'hitl-03',
      experienceId: 'Projects - Key-Value Store',
      originalBullet: 'Added replication features across multiple instances on localhost.',
      suggestedBullet: 'Implemented Raft-based distributed leader election and write-ahead log (WAL) replication, ensuring zero data loss during simulated single-node network partition tests.',
      quantifiedImpactAdded: 'Zero data loss during network partition chaos testing',
      actionVerbEnhanced: 'Implemented & Benchmarked',
      targetedSkillId: 'system_design',
      targetedSkillName: 'System Design & Distributed Architecture',
      alignmentReasoning: 'Proves practical mastery of distributed consensus and fault-tolerant system design fundamentals.',
      status: 'pending',
      provenance: {
        level: 'inferred',
        source: 'HITL Bullet Optimization Engine',
        confidenceScore: 93,
        inferenceModel: 'Claude-3.5-Sonnet Impact Synthesizer',
        lastVerifiedAt: '2026-09-28',
        auditHash: '0xcc99001123',
      },
    },
  ],
};
