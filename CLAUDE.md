@AGENTS.md

# Continuo — Project Status

> **Status: PARKED as of 2026-09-10, at Version 0.5.**
> Development is paused. This file is the entry point for resuming work — read
> it (and the docs it links to) before touching anything.

Live at https://nexa-sigma-woad.vercel.app. Code at
https://github.com/sergiocamacho81-ship-it/nexa (branch `master`). Full docs in
[docs/](docs/) — [docs/BUSINESS.md](docs/BUSINESS.md) (what/why),
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (how it's built),
[docs/PLATFORM_ADMIN.md](docs/PLATFORM_ADMIN.md) (how to operate the
deployment). This file is the short version — those three are the long version.

## What Version 0.5 means

Every planned module is built, wired end-to-end, RLS-isolated per organization,
and localized into 5 languages (pt/en/fr/de/it). It's short of "1.0" because
1.0 implies ready for real paying customers, and the gaps in that direction
(below) are still open. What exists today is a fully working single-deployment
multi-tenant CRM that anyone who signs up can use for real.

## What's been built

**Phases 1–11 (original build)**: Auth (Supabase, email+password) → Contacts →
Companies → Deals (6-stage pipeline) → Activities → Tasks → Email (SMTP,
per-org) → Automation engine (trigger/action rules + run log) → Campaigns
(segment-targeted bulk email) → Dashboard → Settings (org name, members,
roles). Every table RLS-isolated by `organization_id` via `is_org_member()`.

**Since then, in order**:
- **Segments** module (saved, live-resolved contact filters) — used by
  Campaigns for recipient targeting.
- **Full i18n** — next-intl, cookie-based (no URL routing), all 5 languages,
  every string/date/currency in the app.
- **Password reset flow** (`/forgot-password`, `/reset-password`).
- **Full documentation set** — business, architecture, platform-admin docs,
  plus a user guide and org-admin guide in all 5 languages, published as two
  standalone web pages (Claude Artifacts) with a language switcher:
  - User Manual: https://claude.ai/code/artifact/7a73ec8e-3b3a-43a9-8a3d-d617ceddc252
  - Admin Guide: https://claude.ai/code/artifact/5754420a-5d12-4e1c-919c-83038b1df9fc
- **Contact editing + CSV bulk import**, a 2-step contact creation wizard,
  preferred language / city / Swiss canton fields on Contact, geographic
  (canton/city) filters in Segments, Company editing, active-nav highlighting.
- **Per-organization SMTP** — outbound email config moved from platform-wide
  env vars into `Organization.smtp*`, set per org in Settings. No
  platform-wide fallback: an org must configure its own before Email/Campaigns
  can send.
- **Soft delete + Trash** — every delete across every module (Contacts,
  Companies, Deals, Activities, Tasks, Segments, Automations, Campaigns,
  Members) is recoverable for 30 days at `/app/[orgSlug]/trash`
  (OWNER/ADMIN restore). Organizations themselves are now deletable
  (OWNER-only) and restorable from `/app` within the same window.

All of the above: `tsc --noEmit`, `eslint`, and `next build` clean; DB-level
sanity-checked directly against the live Supabase project (no automated test
suite exists — see below).

## What's explicitly NOT done (the gap to "1.0")

From [docs/BUSINESS.md](docs/BUSINESS.md) §6, still true:

- No billing/plan model — every org has full, unlimited access, for free.
- No self-serve guardrails — any signed-up user can create unlimited orgs
  instantly.
- No public marketing/landing page (`/` redirects straight into the product).
- No written terms of service / privacy policy.
- No bulk-mail provider integration — each org brings its own personal-mailbox
  SMTP; nothing helps a customer without one get set up.

Plus, narrower engineering gaps:

- **Edit forms exist only for Contacts and Companies.** Deals, Activities, and
  Tasks still only support create/delete, not edit — the user asked for
  "update de contactos, companies etc." and only Contacts/Companies got built
  before the project was parked.
- **No automated test suite.** Every change in this project was verified via
  `tsc`/`eslint`/`next build` plus manual DB-level scripts and (when a valid
  session was available) browser testing — never a real test suite.
- **Trash purge is lazy, not scheduled.** Deleted rows past 30 days are only
  actually removed when someone opens the Trash page for that org (no cron
  infra configured). See [docs/PLATFORM_ADMIN.md](docs/PLATFORM_ADMIN.md) §8.
- **Dev and prod share one Supabase project/database.** There is no separate
  staging environment — `npx prisma migrate dev` run locally applies directly
  to production data. See [docs/PLATFORM_ADMIN.md](docs/PLATFORM_ADMIN.md) §5.
- **Soft-deleting a parent doesn't hide it from relations.** A trashed
  Company's name still shows on Contacts that reference it until it's
  restored or purged. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §3a.

## Exact next steps, when resuming

In roughly the order they'd naturally come up:

1. **Re-read this file, then `docs/ARCHITECTURE.md` in full** — a lot of
   non-obvious decisions live there (the soft-delete pattern, the per-org SMTP
   design, the dev/prod database sharing, the `getOrgForCurrentUser`
   auth-gate pattern). Don't guess at any of this from the code alone.
2. **Confirm the live deployment still works** before changing anything:
   check https://nexa-sigma-woad.vercel.app loads, sign in, and skim
   `vercel env ls production` against `.env.example` to make sure nothing
   expired (Supabase keys, SMTP-per-org is DB-stored so unaffected).
3. **Finish the edit-forms gap**: build `updateDeal`/`updateActivity`/
   `updateTask` Server Actions + inline edit UI, following the exact pattern
   already used for `updateContact`/`updateCompany`
   (`app/actions/contacts.ts`, `app/app/[orgSlug]/contacts/contact-row.tsx`)
   — row-level edit toggle, same i18n approach (new `edit`/`save`/`cancel`
   keys per namespace, all 5 languages, key-parity-checked).
4. **Decide the commercial path** (see BUSINESS.md §6) before building
   further — billing model, self-serve guardrails, and a real landing page
   are a product decision, not an engineering one; get alignment on this
   before writing code for it.
5. **If real external customers are getting close**, split a separate
   Supabase project for dev/staging before anything else — see
   PLATFORM_ADMIN.md §5 for exactly what that entails.
6. **If data retention becomes a real requirement** (not just a nice-to-have),
   replace the lazy Trash purge with a scheduled Vercel Cron job — the purge
   logic already exists in `app/actions/trash.ts`, it just needs a
   Route Handler + cron trigger instead of running only on page view.

## Rules that still apply if you pick this back up

These were established across the whole build and should keep holding:

- Every business table needs `organization_id` + RLS via `is_org_member()`.
  RLS SQL is hand-written under `prisma/rls_policies_faseN.sql` and **never**
  applied automatically by any tool — always applied manually via the
  Supabase SQL editor, by a human, after review.
- Every Server Action that lists/reads data takes `orgSlug`, not a raw
  `organizationId`, and re-verifies membership itself
  (`getOrgForCurrentUser`) — a client-supplied id can never be trusted, since
  any exported function in a `"use server"` file is reachable directly.
- New deletable entities should get `deletedAt` + wire into
  `app/actions/trash.ts`'s `TRASH_TYPES`, not a hard `prisma.X.delete()`.
- Every user-facing string ships in all 5 languages from day one — add keys
  to all of `messages/{pt,en,fr,de,it}.json` together, and check key parity
  (a one-line Node script, used throughout this project) before calling a
  feature done.
- Never run `npx prisma migrate dev` or apply RLS SQL without flagging to the
  user first that it's a live-production-database change (see the "one
  environment" risk in PLATFORM_ADMIN.md §5) — this has been treated as
  consequential throughout the project, not routine.
