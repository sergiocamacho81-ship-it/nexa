# Nexa — Platform Administration Guide

Audience: whoever operates the Nexa deployment itself (hosting, database, email
delivery, secrets) — not the same thing as an in-app **organization admin** (see
[admin-guide/](./admin-guide/) for that). This document assumes familiarity with
[ARCHITECTURE.md](./ARCHITECTURE.md).

## 1. Where things live

| Component | Provider | Notes |
|---|---|---|
| App hosting | Vercel | Project `sergiocamacho81-9074s-projects/nexa`, production URL `https://nexa-sigma-woad.vercel.app` |
| Source control | GitHub | `https://github.com/sergiocamacho81-ship-it/nexa`, branch `master` deploys to production |
| Database + Auth | Supabase | Postgres + Supabase Auth (email/password) |
| Outbound email | Infomaniak SMTP | Single mailbox (`contact@vingelis.ch`), used for both transactional email and campaigns |

There is currently one environment: **production**. There is no separate
staging/preview Supabase project — local development points at the same Supabase
project as production (see § 5 for the implications of that).

## 2. Environment variables

All required at build and/or runtime. Names and where to find each value are in
`.env.example` at the repo root; do not commit real values anywhere.

| Variable | Where it's used | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth (client + server) | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth (client + server) | Supabase → Settings → API |
| `SUPABASE_SECRET_KEY` | Auth Admin API (`lib/supabase/admin.ts`) | Supabase → Settings → API (service role key) |
| `SUPABASE_JWKS_URL` | (reserved) | Supabase → Settings → API |
| `DATABASE_URL` | Prisma runtime queries | Supabase → Settings → Database → Connection string → **Transaction pooler**, port 6543, `?pgbouncer=true` |
| `DIRECT_URL` | Prisma Migrate only | Supabase → Settings → Database → Connection string → **Direct connection**, port 5432 |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Email + Campaigns modules | Your SMTP provider's settings page |

In Vercel, these are set under **Project → Settings → Environment Variables**, scoped
to **Production**. `NEXT_PUBLIC_*` variables are visible to the browser by design
(they're the anon key, meant to be public); everything else is stored as a Vercel
**Secret** (hidden, write-only after creation).

To change a value: `vercel env rm <NAME> production` then
`vercel env add <NAME> production` (paste the new value when prompted), then trigger a
new deployment — existing deployments don't pick up env var changes retroactively.

## 3. Deploying

Production deploys from the `master` branch. There is no CI pipeline configured —
deploys are manual, via the Vercel CLI:

```bash
npx vercel --prod
```

This runs `npm install` then `npm run build` (`prisma generate && next build`) on
Vercel's infrastructure and promotes the result to production on success. There is no
separate migration step in the deploy — Prisma Migrate is run by hand, locally,
against `DIRECT_URL` (see § 4), independently of app deploys.

**Before deploying:** run locally first — `npx tsc --noEmit`, `npx eslint .`,
`npm run build` — all three should be clean. The app has no automated test suite;
these three checks plus a manual smoke test in a browser are the whole safety net.

## 4. Database schema changes

Two separate mechanisms, deliberately not automated together:

1. **Prisma Migrate** (`npx prisma migrate dev`) — schema changes to `Organization`,
   `Contact`, etc. Creates a migration file under `prisma/migrations/` and applies it
   via `DIRECT_URL`.
2. **RLS policies** — hand-written SQL under `prisma/rls_policies_faseN.sql`,
   applied manually via the Supabase SQL editor (Supabase dashboard → SQL Editor).
   **Prisma Migrate does not know about these and will not apply them.** Any new
   table needs a new RLS policy file, applied by hand, before it's safe to expose to
   real multi-tenant traffic — until then, that table has no RLS at all.

There is no automated tool in this repo that applies RLS SQL — this is intentional,
so a policy change always gets human eyes before it touches the live database.

## 5. The "one environment" risk

Local development and production currently share the same Supabase project — the
`DATABASE_URL`/`DIRECT_URL` in a developer's `.env.local` point at the same database
`vercel --prod` serves. Concretely, this means:

- Running `npx prisma migrate dev` locally applies schema changes **directly to
  production data**. There is no separate dev database to experiment against.
- Test data created while developing (extra contacts, orgs, etc.) is visible in
  production until manually cleaned up.
- Supabase's password-recovery email link, and the CRM's own campaign/transactional
  email, go through the same real SMTP account regardless of whether you're testing
  locally or hitting production.

If/when this product takes on real external customers, splitting a separate
Supabase project (and `.env` set) for development/staging becomes a priority — see
[BUSINESS.md](./BUSINESS.md) § 6 for the broader list of what's needed before that.

## 6. Auth configuration (Supabase dashboard)

**Authentication → URL Configuration → Redirect URLs** must include the production
origin, or password-reset/magic-link redirects silently fall back to the configured
Site URL instead of the app's actual `redirectTo`:

```
https://nexa-sigma-woad.vercel.app/**
```

(Local dev typically also has `http://localhost:3200/**` or whatever port `next dev`
uses, already present from initial setup.)

## 7. Troubleshooting

- **Build fails on Vercel with a Prisma-related error, but passes locally.** Check
  that `node_modules/.prisma`/`node_modules/@prisma/client` aren't being restored from
  a stale build cache incompatible with the current schema — Vercel's "Restored build
  cache from previous deployment" is usually fine, but a `vercel --prod --force` skips
  the cache if you suspect this.
- **A page 404s for an organization that clearly exists.** This has been observed as a
  transient Supabase Auth session-refresh race — several rapid concurrent requests can
  race the same short-lived refresh token, and the loser sees no user for that one
  request. It self-resolves on the next clean request; if it doesn't, check
  `supabase.auth.getUser()` isn't erroring in server logs (`vercel logs`).
- **A new table's data doesn't show up for anyone in any org.** Almost certainly RLS —
  either the table has RLS enabled with no policies (blocks everything, including the
  owner), or the corresponding `rls_policies_faseN.sql` was never applied. Check
  `pg_class.relrowsecurity` and `pg_policies` for the table in the Supabase SQL editor.
- **Password reset link goes to the wrong place or errors out.** See § 6 — the
  production origin is very likely missing from Supabase's Redirect URLs allowlist.
