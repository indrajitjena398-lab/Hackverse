-- ==============================================================================
-- AURA AUTONOMOUS CAREER INTELLIGENCE PLATFORM
-- Multi-Tenant 4-Tier Role-Based Access Control (RBAC) & Domain Isolation Engine
-- PostgreSQL + Supabase Row-Level Security (RLS) Schema
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',
    'STUDENT',
    'INSTITUTE_ADMIN',
    'COMPANY_RECRUITER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE org_status AS ENUM (
    'active',
    'pending',
    'suspended',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. INSTITUTIONS TABLE
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'PMEC_BERHAMPUR', 'STANFORD'
  name VARCHAR(255) NOT NULL,       -- e.g. 'Parala Maharaja Engineering College'
  primary_domain VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'pmec.ac.in'
  location VARCHAR(255) NOT NULL,   -- e.g. 'Berhampur, Odisha'
  contact_email VARCHAR(255) NOT NULL,
  status org_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOMAIN MAPPINGS TABLE
-- Maps academic email domains to verified institutional tenants
CREATE TABLE IF NOT EXISTS domain_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'pmec.ac.in'
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMPANIES TABLE
-- Enterprise talent partners verified by Super Admin
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(100),
  industry VARCHAR(100) NOT NULL,
  status org_status DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USERS TABLE
-- Central identity registry with dynamic role assignment and tenant binding
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'STUDENT' NOT NULL,
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  onboarded_at TIMESTAMPTZ,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  is_role_manually_elevated BOOLEAN DEFAULT FALSE,
  elevated_by UUID,
  elevated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CANDIDATE PROFILES TABLE
-- Canonical candidate intelligence state
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  target_role VARCHAR(150) DEFAULT 'Software Engineer',
  overall_readiness_score INT DEFAULT 65,
  initial_skill_score INT DEFAULT 65,
  ats_resume_score INT DEFAULT 70,
  academic_history JSONB DEFAULT '{}'::jsonb, -- 10th, 12th, Degree details
  verified_skills JSONB DEFAULT '[]'::jsonb,
  career_history JSONB DEFAULT '[]'::jsonb,
  portfolio_links JSONB DEFAULT '{}'::jsonb, -- github, linkedin, portfolio
  resume_payload JSONB DEFAULT '{}'::jsonb,
  dimensional_readiness JSONB DEFAULT '{}'::jsonb,
  is_anonymized_in_talent_pool BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROLE ELEVATION AUDIT LOGS
-- Immutable cryptographic audit trail of all administrative privilege changes
CREATE TABLE IF NOT EXISTS role_elevation_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  actor_email VARCHAR(255) NOT NULL,
  target_user_id UUID REFERENCES users(id),
  target_user_email VARCHAR(255) NOT NULL,
  previous_role user_role NOT NULL,
  new_role user_role NOT NULL,
  reason TEXT,
  audit_hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MOCK INTERVIEW RESULTS TABLE
-- Telemetry, STAR adherence, and multi-dimensional performance for adaptive CAT sessions
CREATE TABLE IF NOT EXISTS mock_interview_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_target VARCHAR(150) NOT NULL,
  technical_score INT NOT NULL,
  communication_score INT NOT NULL,
  problem_solving_score INT NOT NULL,
  overall_score INT NOT NULL,
  star_adherence_percent INT DEFAULT 85,
  feedback_summary TEXT,
  telemetry_summary JSONB DEFAULT '{}'::jsonb,
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CANDIDATE ROADMAPS & SKILL GAP TRACKING
-- Stores active career trajectory, completed checklists, verified portfolio repositories, and dynamic readiness scores
CREATE TABLE IF NOT EXISTS candidate_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_email VARCHAR(255) NOT NULL,
  target_role_id VARCHAR(100) NOT NULL,
  target_role_title VARCHAR(200) NOT NULL,
  current_readiness_score INT DEFAULT 65,
  completed_checklists JSONB DEFAULT '[]'::jsonb, -- array of completed milestone IDs
  submitted_projects JSONB DEFAULT '[]'::jsonb,   -- array of { projectId, githubUrl, submittedAt }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_candidate_roadmaps_email_role UNIQUE (candidate_email, target_role_id)
);

-- ==============================================================================
-- AUTOMATIC DOMAIN MAPPING TRIGGER
-- When a user signs up with 'user@pmec.ac.in', automatically bind them to PMEC.
-- ==============================================================================
CREATE OR REPLACE FUNCTION fn_auto_map_user_institution()
RETURNS TRIGGER AS $$
DECLARE
  extracted_domain VARCHAR(100);
  matched_inst_id UUID;
BEGIN
  -- Extract domain from email (everything after '@')
  extracted_domain := split_part(NEW.email, '@', 2);

  -- Look up in domain_mappings
  SELECT institution_id INTO matched_inst_id
  FROM domain_mappings
  WHERE domain = extracted_domain AND is_active = TRUE
  LIMIT 1;

  IF matched_inst_id IS NOT NULL THEN
    NEW.institution_id := matched_inst_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_map_user_institution ON users;
CREATE TRIGGER trg_auto_map_user_institution
BEFORE INSERT OR UPDATE OF email ON users
FOR EACH ROW
EXECUTE FUNCTION fn_auto_map_user_institution();

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Enforces absolute domain isolation and privilege boundaries
-- ==============================================================================

-- Enable RLS on all primary tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_elevation_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interview_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_roadmaps ENABLE ROW LEVEL SECURITY;

-- Helper function to retrieve current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function to retrieve current user's institution ID
CREATE OR REPLACE FUNCTION get_current_user_institution_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT institution_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- RLS POLICIES FOR: candidate_profiles
-- ------------------------------------------------------------------------------

-- 1. SUPER_ADMIN: Absolute bypass access across all candidates globally
CREATE POLICY rls_candidate_profiles_super_admin
ON candidate_profiles
FOR ALL
TO authenticated
USING (get_current_user_role() = 'SUPER_ADMIN')
WITH CHECK (get_current_user_role() = 'SUPER_ADMIN');

-- 2. STUDENT: Can only SELECT and UPDATE their own personal profile
CREATE POLICY rls_candidate_profiles_student_self
ON candidate_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. INSTITUTE_ADMIN: Strictly isolated to students within their own college domain
-- PMEC Institute Admin can NEVER query students from other colleges!
CREATE POLICY rls_candidate_profiles_institute_domain_isolation
ON candidate_profiles
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'INSTITUTE_ADMIN'
  AND institution_id = get_current_user_institution_id()
);

-- 4. COMPANY_RECRUITER: Read-only access to candidate talent pool
CREATE POLICY rls_candidate_profiles_company_talent_pool
ON candidate_profiles
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'COMPANY_RECRUITER'
);

-- ------------------------------------------------------------------------------
-- RLS POLICIES FOR: mock_interview_results
-- ------------------------------------------------------------------------------

-- Students can view and record their own CAT mock interview results
CREATE POLICY rls_mock_interview_results_student_self
ON mock_interview_results
FOR ALL
TO authenticated
USING (candidate_email = auth.email() OR user_id = auth.uid())
WITH CHECK (candidate_email = auth.email() OR user_id = auth.uid());

-- Super Admin has full auditing access to all mock interview sessions
CREATE POLICY rls_mock_interview_results_super_admin
ON mock_interview_results
FOR ALL
TO authenticated
USING (get_current_user_role() = 'SUPER_ADMIN')
WITH CHECK (get_current_user_role() = 'SUPER_ADMIN');

-- College Administrators can view mock interview results for students in their institution
CREATE POLICY rls_mock_interview_results_institute
ON mock_interview_results
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'INSTITUTE_ADMIN'
  AND candidate_email IN (
    SELECT email FROM candidate_profiles WHERE institution_id = get_current_user_institution_id()
  )
);

-- ------------------------------------------------------------------------------
-- RLS POLICIES FOR: candidate_roadmaps
-- ------------------------------------------------------------------------------
-- Student can only select and update their own roadmaps; Super Admin has full auditing access
CREATE POLICY rls_candidate_roadmaps_student_self
ON candidate_roadmaps
FOR ALL
TO authenticated
USING (
  candidate_email = (SELECT email FROM users WHERE id = auth.uid())
  OR get_current_user_role() = 'SUPER_ADMIN'
)
WITH CHECK (
  candidate_email = (SELECT email FROM users WHERE id = auth.uid())
  OR get_current_user_role() = 'SUPER_ADMIN'
);

-- College Administrators can view roadmaps for students within their institutional domain
CREATE POLICY rls_candidate_roadmaps_institute_read
ON candidate_roadmaps
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'INSTITUTE_ADMIN'
  AND candidate_email IN (
    SELECT email FROM candidate_profiles WHERE institution_id = get_current_user_institution_id()
  )
);

-- ------------------------------------------------------------------------------
-- RLS POLICIES FOR: users, domain_mappings, institutions
-- ------------------------------------------------------------------------------

-- Users table policies: users can read and update their own profile; Super Admin has full access
CREATE POLICY rls_users_read ON users FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY rls_users_update_self ON users FOR UPDATE TO authenticated 
  USING (id = auth.uid() OR get_current_user_role() = 'SUPER_ADMIN') 
  WITH CHECK (id = auth.uid() OR get_current_user_role() = 'SUPER_ADMIN');
CREATE POLICY rls_users_insert_self ON users FOR INSERT TO authenticated 
  WITH CHECK (id = auth.uid() OR get_current_user_role() = 'SUPER_ADMIN');

-- Domain mappings & Institutions: readable by all, writable only by SUPER_ADMIN
CREATE POLICY rls_domain_mappings_read ON domain_mappings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY rls_domain_mappings_write ON domain_mappings FOR ALL TO authenticated 
  USING (get_current_user_role() = 'SUPER_ADMIN') 
  WITH CHECK (get_current_user_role() = 'SUPER_ADMIN');

CREATE POLICY rls_institutions_read ON institutions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY rls_institutions_write ON institutions FOR ALL TO authenticated 
  USING (get_current_user_role() = 'SUPER_ADMIN') 
  WITH CHECK (get_current_user_role() = 'SUPER_ADMIN');

CREATE POLICY rls_companies_read ON companies FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY rls_companies_write ON companies FOR ALL TO authenticated 
  USING (get_current_user_role() = 'SUPER_ADMIN') 
  WITH CHECK (get_current_user_role() = 'SUPER_ADMIN');

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================
INSERT INTO institutions (code, name, primary_domain, location, contact_email, status)
VALUES 
  ('PMEC_BERHAMPUR', 'Parala Maharaja Engineering College', 'pmec.ac.in', 'Berhampur, Odisha, India', 'dean@pmec.ac.in', 'active'),
  ('STANFORD_CS', 'Stanford University (CS Department)', 'stanford.edu', 'Stanford, CA, USA', 'career@stanford.edu', 'active'),
  ('CMU_CS', 'Carnegie Mellon University', 'cmu.edu', 'Pittsburgh, PA, USA', 'careers@cmu.edu', 'active')
ON CONFLICT (primary_domain) DO NOTHING;

INSERT INTO domain_mappings (domain, institution_id)
SELECT 'pmec.ac.in', id FROM institutions WHERE primary_domain = 'pmec.ac.in'
ON CONFLICT (domain) DO NOTHING;

INSERT INTO domain_mappings (domain, institution_id)
SELECT 'stanford.edu', id FROM institutions WHERE primary_domain = 'stanford.edu'
ON CONFLICT (domain) DO NOTHING;

INSERT INTO domain_mappings (domain, institution_id)
SELECT 'cmu.edu', id FROM institutions WHERE primary_domain = 'cmu.edu'
ON CONFLICT (domain) DO NOTHING;

INSERT INTO companies (name, domain, industry, status)
VALUES
  ('Stripe', 'stripe.com', 'Financial Infrastructure', 'active'),
  ('Databricks', 'databricks.com', 'Data & AI Systems', 'active'),
  ('Enterprise TechTalent Partner', 'talentpartner.io', 'Corporate Recruitment', 'active')
ON CONFLICT DO NOTHING;
