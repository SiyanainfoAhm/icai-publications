-- Demo users with bcrypt password hashes (cost 10).
-- Admin password: Admin@ICAI2026  |  Member password: Member@ICAI2026

INSERT INTO icai_users (email, full_name, role, password_hash, ssp_subject_id)
VALUES
  (
    'admin@icai.org',
    'Portal Administrator',
    'admin',
    '$2b$10$v4KyCV9u4boxEXfiiS7qVeEuhp4LULVJSWgtwmJ3nk8XYebHvZZXK',
    NULL
  ),
  (
    'member@icai.org',
    NULL,
    'member',
    '$2b$10$bZ/ZpqW3h0Als4UQ7TuaS.ot1wHYsQMYtznDQXEfBwcrga4OaHCGu',
    'SSP-DEMO-MEMBER-001'
  )
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  password_hash = EXCLUDED.password_hash,
  ssp_subject_id = COALESCE(icai_users.ssp_subject_id, EXCLUDED.ssp_subject_id);
