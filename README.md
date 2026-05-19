# ICAI Publications Portal

Full-stack demonstration portal for ICAI publications: **Next.js**, **custom auth** (not Supabase Auth), and **Supabase PostgreSQL**.

Open this folder in VS Code via `icai-publications.code-workspace`.

## Repository layout

| Path | Description |
|------|-------------|
| `portal/` | Next.js app (UI, API routes, admin CMS) |
| `supabase/sql/` | Database schema and seed scripts |
| `covers/` | Publication cover images (`/covers/*` in the app) |
| `content/` | Full-text HTML source files per slug |
| `publications.json` | Demo catalogue metadata manifest |

## Quick start

### 1. Supabase (SQL Editor, in order)

1. `supabase/sql/001_schema.sql` — tables, indexes, RLS
2. `supabase/sql/002_seed.sql` — demo users (admin, member)
3. `supabase/sql/003_publications_seed.sql` — demo publications
4. `supabase/sql/005_storage_photomedia.sql` — cover image bucket (optional)
5. `supabase/sql/006_publication_sow_fields.sql` — **required** for admin dashboard & upload form
6. `supabase/sql/007_admin_cms.sql` — settings & master data (optional)

See `supabase/README.md` for details.

### 2. Portal

From this folder (`ICAI Publications`):

```bash
npm run install:portal
cp portal/.env.example portal/.env.local
# Set NEXT_PUBLIC_SUPABASE_URL, keys, SESSION_SECRET, etc.
npm run dev
```

Or from `portal/` directly: `npm install` then `npm run dev`.

Open http://localhost:3000

### Demo sign-in

| Role | Credentials |
|------|-------------|
| Admin | `admin@icai.org` / `Admin@ICAI2026` |
| Member | `member@icai.org` / `Member@ICAI2026` |
| Non-member | Any email → OTP (`EMAIL_PROVIDER=console` logs code in terminal) |

## Covers in the app

`portal/public/covers` is a junction to `covers/` at this repo root. If covers 404 after clone, recreate (Windows):

```cmd
mklink /J portal\public\covers covers
```

## Legacy Vite POC

The older frontend-only CA Journal demo remains in `../ca-journal-poc/` (no backend).
