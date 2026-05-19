# Supabase setup — ICAI Publication Portal

Uses **PostgreSQL tables only**. Do not enable Supabase Auth for application login.

## 1. Create project

Create a project at [supabase.com](https://supabase.com) and note:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Server key (pick one):
  - **`SUPABASE_SERVICE_ROLE_KEY`** (recommended) — used only in Next.js API routes
  - **`SUPABASE_SERVER_KEY`** — optional; with **RLS disabled** you may set this to the anon key for demos only

### RLS and keys (important)

| Dashboard state | Anon key from browser | Service role on server |
|-----------------|----------------------|-------------------------|
| RLS **on**, no policies (our `001_schema.sql`) | Blocked | Works |
| RLS **off** (UNRESTRICTED) | Full access if exposed | Works |

This portal never calls Supabase from the browser, so the anon key is not required in the app today. **Do not remove a server secret entirely** — APIs still need a key to reach Postgres.

For production, **re-enable RLS** on all `icai_*` tables and keep using the service role only on the server.

## 2. Run SQL scripts (in order)

In **SQL Editor**, run from this folder:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `sql/001_schema.sql` | Tables, indexes, RLS |
| 2 | `sql/002_seed.sql` | Demo users |
| 3 | `sql/003_publications_seed.sql` | Demo publications |
| 4 | `sql/005_storage_photomedia.sql` | `photomedia` bucket for publication covers |
| 5 | `sql/006_publication_sow_fields.sql` | SOW fields (type, keywords, article, PDF URL, access) |
| 6 | `sql/007_admin_cms.sql` | Admin settings & master data (committees, topics) |

## 3. Environment

Copy `../portal/.env.example` to `../portal/.env.local`.

## 4. Demo passwords

Stored as bcrypt hashes in `002_seed.sql`:

| Role | Email | Password |
|------|--------|----------|
| Administrator | `admin@icai.org` | `Admin@ICAI2026` |
| ICAI Member | `member@icai.org` | `Member@ICAI2026` |

Re-run `002_seed.sql` if users already exist without passwords.

## Tables (reference)

| Table | Purpose |
|-------|---------|
| `icai_users` | Custom users; `ssp_subject_id` for future SSP SSO |
| `icai_publications` | Catalogue and reader HTML |
| `icai_otp_logs` | OTP audit (expiry, attempts, verified) |
| `icai_sessions` | HttpOnly cookie sessions |
| `icai_publication_access_logs` | Read audit trail |
