-- ICAI Publication Portal — custom auth schema (no Supabase Auth)
-- Run in Supabase SQL Editor or via migration tooling.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles
DO $$ BEGIN
  CREATE TYPE icai_user_role AS ENUM ('admin', 'member', 'non_member');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE icai_publication_status AS ENUM ('draft', 'published', 'hidden', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Users (custom identity; SSP subject reserved for future ICAI SSO)
CREATE TABLE IF NOT EXISTS icai_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role icai_user_role NOT NULL DEFAULT 'non_member',
  is_active BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT,
  ssp_subject_id TEXT UNIQUE,
  ssp_linked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_icai_users_email ON icai_users (lower(email));
CREATE INDEX IF NOT EXISTS idx_icai_users_role ON icai_users (role);

-- Publications
CREATE TABLE IF NOT EXISTS icai_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  committee TEXT,
  topic TEXT,
  cover_image_url TEXT,
  synopsis TEXT,
  release_date DATE,
  content_html TEXT NOT NULL DEFAULT '',
  file_url TEXT,
  status icai_publication_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES icai_users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_icai_publications_status ON icai_publications (status);
CREATE INDEX IF NOT EXISTS idx_icai_publications_release ON icai_publications (release_date DESC);

-- OTP audit (backend-generated; not Supabase Auth OTP)
CREATE TABLE IF NOT EXISTS icai_otp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_icai_otp_logs_email ON icai_otp_logs (lower(email), created_at DESC);

-- Custom sessions (token stored hashed; plain token only in HttpOnly cookie)
CREATE TABLE IF NOT EXISTS icai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES icai_users (id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_icai_sessions_user ON icai_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_icai_sessions_expires ON icai_sessions (expires_at);

-- Publication access audit
CREATE TABLE IF NOT EXISTS icai_publication_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES icai_users (id) ON DELETE SET NULL,
  publication_id UUID REFERENCES icai_publications (id) ON DELETE SET NULL,
  session_id UUID REFERENCES icai_sessions (id) ON DELETE SET NULL,
  access_type TEXT NOT NULL DEFAULT 'read',
  ip_address TEXT,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_icai_access_logs_pub ON icai_publication_access_logs (publication_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_icai_access_logs_user ON icai_publication_access_logs (user_id, accessed_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION icai_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_icai_users_updated ON icai_users;
CREATE TRIGGER trg_icai_users_updated
  BEFORE UPDATE ON icai_users
  FOR EACH ROW EXECUTE FUNCTION icai_set_updated_at();

DROP TRIGGER IF EXISTS trg_icai_publications_updated ON icai_publications;
CREATE TRIGGER trg_icai_publications_updated
  BEFORE UPDATE ON icai_publications
  FOR EACH ROW EXECUTE FUNCTION icai_set_updated_at();

-- RLS: deny direct client access; API uses service role
ALTER TABLE icai_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE icai_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE icai_otp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE icai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE icai_publication_access_logs ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated — all access via Next.js API + service role key

COMMENT ON TABLE icai_otp_logs IS 'Custom OTP audit; verification handled by application API, not Supabase Auth.';
COMMENT ON TABLE icai_sessions IS 'Custom session store; session token issued as HttpOnly cookie after OTP or SSO.';
COMMENT ON COLUMN icai_users.ssp_subject_id IS 'Reserved for future ICAI SSP SSO integration.';
