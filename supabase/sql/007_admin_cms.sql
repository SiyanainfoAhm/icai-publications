-- Admin CMS: system settings and master data

CREATE TABLE IF NOT EXISTS icai_system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS icai_master_committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS icai_master_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO icai_system_settings (key, value) VALUES
  ('otp', '{"ttl_minutes": 10, "max_attempts": 5, "length": 6}'::jsonb),
  ('session', '{"ttl_hours": 24}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO icai_master_committees (name) VALUES
  ('Board of Studies'),
  ('Auditing & Assurance Standards Board'),
  ('GST & Indirect Taxes Committee'),
  ('Ethics Committee')
ON CONFLICT (name) DO NOTHING;

INSERT INTO icai_master_topics (name) VALUES
  ('Audit & Assurance'),
  ('GST'),
  ('Professional Ethics'),
  ('Professional Updates'),
  ('Financial Reporting')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE icai_system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE icai_master_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE icai_master_topics ENABLE ROW LEVEL SECURITY;
