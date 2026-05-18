# ICAI Publications Portal (Next.js)

Next.js app for the ICAI Publications demo. Parent repo: `../` (covers, content, Supabase SQL).

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Run SQL in `../supabase/sql/` first (see `../supabase/README.md`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production build |

## Email (demo)

- `EMAIL_PROVIDER=console` — OTP in terminal
- `EMAIL_PROVIDER=power_automate` — `POWER_AUTOMATE_OTP_WEBHOOK_URL` (Outlook demo)

Production: add a provider in `src/lib/email/` (ICAI kit, Graph, SMTP, etc.).
