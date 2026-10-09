-- ============================================================================
-- HACKVERSE MASTER DATABASE SCHEMA & MIGRATION (100% IDEMPOTENT)
-- Project: qlktviehgkpvifkueyaj
--
-- Fixes:
-- 1. ERROR: 42P01: relation "advisor_cohorts" does not exist (Fixed by dependency-ordered table creation)
-- 2. ERROR: 42703: column "is_anonymized" does not exist (Fixed by ALTER TABLE ... ADD COLUMN IF NOT EXISTS)
-- 3. Policy already exists errors (Fixed by DROP POLICY IF EXISTS)
--
-- Instructions:
-- Copy ALL lines in this script, paste into Supabase SQL Editor, and click "Run".
-- ============================================================================

-- 0. Enable Core Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. BASE TABLES (Created First Before Any Foreign Keys or Policies)
-- ============================================================================

-- 1.1 Advisor Cohorts (MUST BE CREATED FIRST FOR RLS POLICIES)
CREATE TABLE IF NOT EXISTS advisor_cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID NOT NULL,
    tenant_id TEXT NOT NULL DEFAULT 'pmec_berhampur',
    cohort_id TEXT NOT NULL DEFAULT 'cohort_2026',
    department TEXT DEFAULT 'Computer Science & Engineering',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(advisor_id, cohort_id, tenant_id)
);

ALTER TABLE advisor_cohorts ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'pmec_berhampur';
ALTER TABLE advisor_cohorts ADD COLUMN IF NOT EXISTS cohort_id TEXT DEFAULT 'cohort_2026';
ALTER TABLE advisor_cohorts ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Computer Science & Engineering';

-- 1.2 Candidate Profiles
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tenant_id TEXT NOT NULL DEFAULT 'pmec_berhampur',
    cohort_id TEXT NOT NULL DEFAULT 'cohort_2026',
    anonymized_id TEXT UNIQUE NOT NULL DEFAULT ('anon_' || substr(md5(random()::text), 1, 12)),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    headline TEXT,
    target_role TEXT DEFAULT 'Senior Distributed Systems Engineer',
    target_seniority TEXT DEFAULT 'Senior',
    readiness_score NUMERIC(5,2) DEFAULT 65.00,
    skills TEXT[] DEFAULT '{}',
    embedding FLOAT8[] DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'pmec_berhampur';
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS cohort_id TEXT DEFAULT 'cohort_2026';
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS anonymized_id TEXT DEFAULT ('anon_' || substr(md5(random()::text), 1, 12));
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT 'Senior Distributed Systems Engineer';
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS target_seniority TEXT DEFAULT 'Senior';
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS readiness_score NUMERIC(5,2) DEFAULT 65.00;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS embedding FLOAT8[] DEFAULT NULL;

-- 1.3 Resumes
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    candidate_name TEXT,
    email TEXT,
    headline TEXT,
    summary TEXT,
    skills TEXT[],
    ats_score INTEGER DEFAULT 0,
    parsability_score INTEGER DEFAULT 0,
    keyword_match_score INTEGER DEFAULT 0,
    parsed_ast JSONB,
    raw_text TEXT,
    bullet_proposals JSONB DEFAULT '[]'::jsonb,
    unilateral_edits_prevented BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resumes ADD COLUMN IF NOT EXISTS parsability_score INTEGER DEFAULT 0;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS keyword_match_score INTEGER DEFAULT 0;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS parsed_ast JSONB;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS raw_text TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS bullet_proposals JSONB DEFAULT '[]'::jsonb;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS unilateral_edits_prevented BOOLEAN DEFAULT TRUE;

-- 1.4 Applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    job_id TEXT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'wishlist' CHECK (stage IN ('wishlist', 'applied', 'in_review', 'interviewing', 'offer', 'rejected')),
    applied_date DATE DEFAULT CURRENT_DATE,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    salary_text TEXT,
    notes TEXT,
    provenance JSONB DEFAULT '{"level": "manual", "source": "User Submission", "confidenceScore": 100}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Job Postings
CREATE TABLE IF NOT EXISTS job_postings (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    workplace_type TEXT DEFAULT 'Remote',
    salary_range TEXT,
    salary_min NUMERIC,
    salary_max NUMERIC,
    department TEXT,
    experience_level TEXT DEFAULT 'Senior' CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead')),
    skills_required TEXT[],
    preferred_skills TEXT[],
    description TEXT,
    match_score INTEGER DEFAULT 0,
    fit_category TEXT DEFAULT 'safe_fit' CHECK (fit_category IN ('safe_fit', 'stretch', 'reach')),
    score_breakdown JSONB,
    embedding FLOAT8[] DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Job Matches
CREATE TABLE IF NOT EXISTS job_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id TEXT REFERENCES job_postings(id) ON DELETE CASCADE,
    overall_match_score NUMERIC(5,2) NOT NULL,
    fit_category TEXT NOT NULL,
    weights_applied JSONB NOT NULL,
    breakdown JSONB NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 Mock Interviews (With is_anonymized guaranteed)
CREATE TABLE IF NOT EXISTS mock_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tenant_id TEXT NOT NULL DEFAULT 'pmec_berhampur',
    cohort_id TEXT NOT NULL DEFAULT 'cohort_2026',
    tokenized_candidate_id TEXT NOT NULL DEFAULT 'anon_cand',
    role TEXT NOT NULL DEFAULT 'Software Engineer',
    difficulty TEXT DEFAULT 'Adaptive CAT',
    bayesian_theta NUMERIC(4,2) DEFAULT 0.00,
    status TEXT DEFAULT 'in_progress',
    is_anonymized BOOLEAN DEFAULT TRUE,
    transcript_redacted BOOLEAN DEFAULT TRUE,
    star_scores JSONB,
    session_transcript JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'pmec_berhampur';
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS cohort_id TEXT DEFAULT 'cohort_2026';
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS tokenized_candidate_id TEXT DEFAULT ('anon_' || substr(md5(random()::text), 1, 10));
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Software Engineer';
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Adaptive CAT';
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS bayesian_theta NUMERIC(4,2) DEFAULT 0.00;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS is_anonymized BOOLEAN DEFAULT TRUE;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS transcript_redacted BOOLEAN DEFAULT TRUE;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS star_scores JSONB;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS session_transcript JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 1.8 Skill Nodes
CREATE TABLE IF NOT EXISTS skill_nodes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT DEFAULT 'intermediate',
    prerequisites TEXT[] DEFAULT '{}',
    mastery_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'learning'
);

-- 1.9 Provenance Audit Ledger
CREATE TABLE IF NOT EXISTS provenance_audit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    action TEXT NOT NULL,
    provenance_tier TEXT NOT NULL CHECK (provenance_tier IN (
        'USER_ENTERED',
        'VERIFIED_CREDENTIAL',
        'MODEL_INFERRED',
        'SYSTEM_DERIVED',
        'THIRD_PARTY_AUDITED'
    )),
    actor_id TEXT NOT NULL,
    previous_state_hash TEXT,
    new_state_hash TEXT NOT NULL,
    signature TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.10 Candidate Roadmaps
CREATE TABLE IF NOT EXISTS candidate_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_email TEXT NOT NULL,
    target_role_id TEXT NOT NULL,
    target_role_title TEXT NOT NULL,
    current_readiness_score NUMERIC(5,2) DEFAULT 65.00,
    completed_checklists JSONB DEFAULT '[]'::jsonb,
    submitted_projects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_email, target_role_id)
);

-- 1.11 Feedback Engine
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    feature_type TEXT NOT NULL,
    feature_id TEXT,
    ai_output_id TEXT,
    rating INTEGER CHECK (rating >= 0 AND rating <= 10),
    feedback_type TEXT NOT NULL DEFAULT 'rating',
    reason TEXT[] DEFAULT '{}',
    comment TEXT,
    sentiment TEXT NOT NULL DEFAULT 'NEUTRAL' CHECK (sentiment IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
    correction_data JSONB DEFAULT '{}'::jsonb,
    career_goal TEXT,
    ai_confidence_score NUMERIC(4,3) DEFAULT 1.0,
    action_taken TEXT DEFAULT 'RECORDED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.12 User Career Preferences
CREATE TABLE IF NOT EXISTS user_career_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    preferred_roles JSONB DEFAULT '{}'::jsonb,
    disliked_roles JSONB DEFAULT '{}'::jsonb,
    corrected_skills JSONB DEFAULT '{}'::jsonb,
    preferred_industries TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    salary_expectations TEXT,
    feedback_count INTEGER DEFAULT 0,
    feature_quality_scores JSONB DEFAULT '{}'::jsonb,
    last_feedback_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.13 Placement Video Interview Archive
CREATE TABLE IF NOT EXISTS placement_video_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_name TEXT NOT NULL,
    candidate_email TEXT,
    institution_name TEXT NOT NULL,
    department TEXT DEFAULT 'Computer Science & Engineering',
    cgpa TEXT,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    package_ctc TEXT NOT NULL,
    placement_year INTEGER DEFAULT 2026,
    video_url TEXT,
    is_user_recorded BOOLEAN DEFAULT FALSE,
    thumbnail_url TEXT,
    duration_seconds INTEGER DEFAULT 900,
    transcript JSONB DEFAULT '[]'::jsonb,
    placement_success_factors JSONB DEFAULT '{}'::jsonb,
    interviewer_notes TEXT,
    views_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.14 Career Intelligence Profiles (CIP)
CREATE TABLE IF NOT EXISTS career_intelligence_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    primary_target_role TEXT DEFAULT 'Software Engineer',
    target_roles TEXT[] DEFAULT ARRAY['Software Engineer'],
    career_readiness_score NUMERIC(5, 2) DEFAULT 75.0,
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.15 Career Coherence Events
CREATE TABLE IF NOT EXISTS career_coherence_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    module TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence JSONB,
    confidence NUMERIC(4, 3) DEFAULT 1.0,
    parent_event_id TEXT,
    processed_by TEXT[] DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 1.16 Career Intelligence Audit Log
CREATE TABLE IF NOT EXISTS career_intelligence_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    field TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    source TEXT NOT NULL,
    confidence NUMERIC(4, 3) DEFAULT 1.0,
    reason TEXT NOT NULL,
    event_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 1.17 Company Role Dispatches
CREATE TABLE IF NOT EXISTS company_role_dispatches (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    package_ctc TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    required_skills JSONB DEFAULT '[]'::jsonb,
    matched_students JSONB DEFAULT '[]'::jsonb,
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.18 Institutional Student Notices
CREATE TABLE IF NOT EXISTS institutional_student_notices (
    id TEXT PRIMARY KEY,
    dispatch_id TEXT REFERENCES company_role_dispatches(id) ON DELETE CASCADE,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    package_ctc TEXT NOT NULL,
    match_score NUMERIC(5, 2) NOT NULL,
    acquired_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    institutional_advisory TEXT NOT NULL,
    recommended_roadmap_action TEXT,
    target_role_id TEXT,
    priority_level TEXT DEFAULT 'URGENT',
    status TEXT DEFAULT 'UNREAD',
    sent_by_officer_name TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE advisor_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE provenance_audit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_video_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_intelligence_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_role_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_student_notices ENABLE ROW LEVEL SECURITY;

-- 2.1 Advisor Cohorts Policies
DROP POLICY IF EXISTS advisor_own_cohorts ON advisor_cohorts;
CREATE POLICY advisor_own_cohorts ON advisor_cohorts
    FOR ALL USING (auth.uid() = advisor_id) WITH CHECK (auth.uid() = advisor_id);

-- 2.2 Candidate Profiles Policies
DROP POLICY IF EXISTS student_own_profile ON candidate_profiles;
CREATE POLICY student_own_profile ON candidate_profiles
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS advisor_cohort_access ON candidate_profiles;
CREATE POLICY advisor_cohort_access ON candidate_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM advisor_cohorts
            WHERE advisor_cohorts.advisor_id = auth.uid()
            AND advisor_cohorts.tenant_id = candidate_profiles.tenant_id
            AND advisor_cohorts.cohort_id = candidate_profiles.cohort_id
        )
    );

-- 2.3 Resumes Policies
DROP POLICY IF EXISTS student_own_resumes ON resumes;
CREATE POLICY student_own_resumes ON resumes
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2.4 Applications Policies
DROP POLICY IF EXISTS student_own_applications ON applications;
CREATE POLICY student_own_applications ON applications
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2.5 Mock Interviews Policies
DROP POLICY IF EXISTS student_own_interviews ON mock_interviews;
CREATE POLICY student_own_interviews ON mock_interviews
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS advisor_anonymized_interview_access ON mock_interviews;
CREATE POLICY advisor_anonymized_interview_access ON mock_interviews
    FOR SELECT USING (
        COALESCE(is_anonymized, TRUE) = TRUE
        AND EXISTS (
            SELECT 1 FROM advisor_cohorts
            WHERE advisor_cohorts.advisor_id = auth.uid()
            AND advisor_cohorts.tenant_id = mock_interviews.tenant_id
            AND advisor_cohorts.cohort_id = mock_interviews.cohort_id
        )
    );

-- 2.6 Public & Catalog Tables
DROP POLICY IF EXISTS public_read_jobs ON job_postings;
CREATE POLICY public_read_jobs ON job_postings FOR SELECT USING (true);

DROP POLICY IF EXISTS public_read_skills ON skill_nodes;
CREATE POLICY public_read_skills ON skill_nodes FOR SELECT USING (true);

DROP POLICY IF EXISTS public_read_placement_archive ON placement_video_interviews;
CREATE POLICY public_read_placement_archive ON placement_video_interviews FOR SELECT USING (true);

DROP POLICY IF EXISTS student_insert_interviews ON placement_video_interviews;
CREATE POLICY student_insert_interviews ON placement_video_interviews FOR INSERT WITH CHECK (true);

-- 2.7 Ledger & Feedback
DROP POLICY IF EXISTS ledger_read_policy ON provenance_audit_ledger;
CREATE POLICY ledger_read_policy ON provenance_audit_ledger FOR SELECT USING (true);

DROP POLICY IF EXISTS ledger_insert_policy ON provenance_audit_ledger;
CREATE POLICY ledger_insert_policy ON provenance_audit_ledger FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS feedback_insert_policy ON feedback;
CREATE POLICY feedback_insert_policy ON feedback FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS feedback_read_policy ON feedback;
CREATE POLICY feedback_read_policy ON feedback FOR SELECT USING (true);

-- 2.8 Roadmaps & Dispatches
DROP POLICY IF EXISTS student_own_roadmaps ON candidate_roadmaps;
CREATE POLICY student_own_roadmaps ON candidate_roadmaps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS dispatches_all_access ON company_role_dispatches;
CREATE POLICY dispatches_all_access ON company_role_dispatches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS notices_all_access ON institutional_student_notices;
CREATE POLICY notices_all_access ON institutional_student_notices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS cip_all_access ON career_intelligence_profiles;
CREATE POLICY cip_all_access ON career_intelligence_profiles FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 3. INDEXES FOR HIGH-THROUGHPUT QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cip_user_id ON career_intelligence_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_coherence_events_user_id ON career_coherence_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON career_intelligence_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_inst ON company_role_dispatches(institution_name);
CREATE INDEX IF NOT EXISTS idx_notices_student_email ON institutional_student_notices(student_email);
CREATE INDEX IF NOT EXISTS idx_notices_status ON institutional_student_notices(status);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_feature_type ON feedback(feature_type);

-- Seed verified placement interview if archive is empty
INSERT INTO placement_video_interviews (
    candidate_name,
    candidate_email,
    institution_name,
    department,
    cgpa,
    company_name,
    role_title,
    package_ctc,
    placement_year,
    placement_success_factors,
    helpful_count
) VALUES (
    'Soumya Ranjan Mohapatra',
    'soumya.mohapatra@pmec.ac.in',
    'Parala Maharaja Engineering College (PMEC)',
    'Computer Science & Engineering',
    '9.12',
    'Google',
    'Software Development Engineer II (Distributed Systems)',
    '44.5 LPA',
    2026,
    '{"reason": "Demonstrated deterministic mathematical understanding of distributed consensus, quantified P99 latencies without hesitation, and articulated trade-offs between linearizability and availability.", "competencies": ["Distributed Consensus (Raft/Paxos)", "Low-Latency Concurrent Systems", "Failure Injection & Linearizability"]}'::jsonb,
    388
) ON CONFLICT DO NOTHING;
