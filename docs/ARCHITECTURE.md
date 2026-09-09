# Nexa — Technical Architecture

Audience: engineers working on or evaluating this codebase. For what the product does
and who it's for, see [BUSINESS.md](./BUSINESS.md). For running/operating the live
deployment, see [PLATFORM_ADMIN.md](./PLATFORM_ADMIN.md).

## 1. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Server Actions) |
| Language | TypeScript |
| UI | React 19, plain CSS (design tokens + utility classes, no component library) |
| Auth | Supabase Auth (email + password) |
| Database | Postgres, hosted on Supabase |
| ORM | Prisma 7, via `@prisma/adapter-pg` (driver adapter, not Prisma's own connection pool) |
| i18n | next-intl 4, cookie-based locale (no URL routing) |
| Email | Nodemailer, SMTP configured per organization (`Organization.smtp*`) |
| Hosting | Vercel |

Everything runs as a single Next.js app — there is no separate backend service.
Server Actions (`"use server"` functions) are the entire API surface; there are no
REST/GraphQL routes for the CRM's own data.

## 2. Multi-tenancy model

Every business table has an `organization_id` column (see `prisma/schema.prisma`).
Isolation is enforced at **two** independent layers:

1. **Application layer** — every Server Action that reads or lists data takes an
   `orgSlug`, not a raw `organizationId`, and internally re-resolves and re-verifies
   the caller's membership via `getOrgForCurrentUser(orgSlug)` before querying. This
   was a deliberate fix: any exported function in a `"use server"` file is reachable
   via a direct POST regardless of whether a client component imports it, so trusting
   a client-supplied `organizationId` would let one organization's authenticated user
   query another organization's data by ID.
2. **Database layer** — Postgres Row-Level Security. Every table has RLS enabled with
   policies built on a single `security definer` function:

   ```sql
   create or replace function public.is_org_member(org_id uuid)
   returns boolean
   language sql security definer stable
   as $$
     select exists (
       select 1 from public.memberships m
       where m.organization_id = org_id and m.user_id = auth.uid()
     );
   $$;
   ```

   Policies on each table are `using (public.is_org_member(organization_id))` (plus
   role checks — `OWNER`/`ADMIN` only — on membership-management policies). This means
   even a query that bypassed the application layer entirely (a bug, a future
   route, direct Postgres access with the anon/authenticated role) still cannot cross
   tenant boundaries.

   **Important caveat:** the app's own runtime queries go through Prisma using the
   Supabase **service-role** connection (`DATABASE_URL`), which bypasses RLS by
   design (it's how the app is allowed to serve data for the currently-authenticated
   user's organization in the first place). RLS is the defense against anything that
   *doesn't* go through the app layer's own membership checks — not a second check
   the app itself relies on. Both layers matter; neither is redundant.

   RLS policies are **not** applied by Prisma Migrate. They live as plain SQL files
   under `prisma/rls_policies_faseN.sql`, one per build phase, applied manually via
   the Supabase SQL editor. `prisma/rls_policies_fase1_addendum.sql` documents one
   deliberate deviation: the `memberships.user_id → auth.users.id` foreign key was
   dropped after it broke Prisma's shadow-database drift detection (see § 7).

3. A person can hold a different `MembershipRole` (`OWNER` / `ADMIN` / `MEMBER`) in
   each organization they belong to — roles are per-membership, not per-account.

## 3. Data model

See `prisma/schema.prisma` for the authoritative source. Summary:

```
Organization ──< Membership >── auth.users (Supabase, no FK — see § 7)
Organization ──< Contact ──< Deal, Activity, Task, EmailMessage, CampaignRecipient
Organization ──< Company ──< Contact, Deal, Activity, Task
Organization ──< Deal ──< Activity, Task, EmailMessage           (stage: enum DealStage)
Organization ──< Activity                                        (type: enum ActivityType)
Organization ──< Task                                            (status: enum TaskStatus)
Organization ──< EmailMessage                                    (status: enum EmailStatus)
Organization ──< Automation ──< AutomationAction, AutomationRun
Organization ──< Segment ──< Campaign ──< CampaignRecipient ── Contact
```

All primary keys are UUIDs. Every FK to `Organization` is indexed. The cascade
FKs (`onDelete: Cascade`) are a DB-level safety net; the app itself never hard-deletes
an `Organization` — see § 3a.

**Automations** are deliberately schema-light: `triggerType` and `actionType` are
plain strings, and an action's parameters live in a `Json` config blob
(`AutomationAction.actionConfig`). Adding a new trigger or action type is a code-only
change (`lib/automation/types.ts` + a handler in `lib/automation/engine.ts`) — no
migration required. Current triggers: `contact.created`, `deal.stage_changed`,
`task.completed`. Current actions: `create_task`, `create_activity`, `send_email`.

**Segments** are similarly schema-light: `Segment.filters` is a small structured JSON
object (`{ companyId?, hasEmail?, createdAfter?, createdBefore?, canton?, city? }`, see
`lib/segments/filters.ts`), not a stored snapshot — a segment's contacts are
recomputed live every time it's read (e.g. when a Campaign picks its recipients).

## 3a. Soft delete & the Trash

`Contact`, `Company`, `Deal`, `Activity`, `Task`, `Segment`, `Automation`,
`Campaign`, `Membership`, and `Organization` all carry a nullable `deletedAt`. Every
"Remove"/"Delete" action in the app sets it instead of issuing a hard `DELETE`; every
list query filters `deletedAt: null`. `app/actions/trash.ts` is the one place that
reads the other side of that filter (`deletedAt: { not: null }`) and exposes
`restoreTrashItem` (OWNER/ADMIN only, per-entity `updateMany` back to `deletedAt:
null`) at `/app/[orgSlug]/trash`.

- **Retention is 30 days**, enforced by a *lazy sweep*: `listTrash()` hard-deletes
  anything past the window before it reads the list, rather than a scheduled job —
  there's no cron infrastructure in this deployment (see
  [PLATFORM_ADMIN.md](./PLATFORM_ADMIN.md)). A trash entry older than 30 days that
  nobody happens to view stays in the DB (harmlessly) a little longer than the stated
  window; it never resurrects.
- **`Membership`'s restore path reuses the same row.** `(userId, organizationId)` is a
  DB-level unique constraint that soft-delete doesn't relax (Prisma has no partial
  unique index here), so re-adding a removed member (`addMember` in
  `app/actions/settings.ts`) looks for an existing soft-deleted row for that pair and
  restores it (clearing `deletedAt`, updating `role`) instead of inserting a new one.
  `restoreTrashItem` for `type: "member"` does the same restore, from the other
  direction.
- **`Organization` deletion is Owner-only** (`deleteOrganization` in
  `app/actions/organizations.ts`) and doesn't cascade a soft-delete to its children —
  a restored org's contacts/deals/etc. are simply whatever wasn't independently
  trashed. Because a soft-deleted org is invisible to `getOrgForCurrentUser` (see
  § 2, which now also excludes a soft-deleted `Membership` — a removed member loses
  access immediately, not just from listings), there is no in-org route left to
  restore it from; `listMyDeletedOrganizations`
  bypasses that filter (scoped to orgs the current user owned) so `/app` can offer
  Restore directly on the organization list.
- **Known gap:** soft-deleting a parent (e.g. a Company) does not hide it from
  relations that still point at it (a Contact's `company` include keeps showing the
  trashed company's name until it's restored or purged). Not treated as a bug — just
  not built yet.

## 4. Auth

Supabase Auth (email + password) issues a session; `@supabase/ssr` bridges that
session into Next.js via cookies, read/written from three places:

- `lib/supabase/client.ts` — browser client (client components).
- `lib/supabase/server.ts` — server client (Server Components / Server Actions), reads
  cookies via `next/headers`; write attempts from a Server Component are a no-op by
  design (cookies are read-only there) and rely on `proxy.ts` to refresh the session
  on the next request.
- `proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`) — refreshes the session on
  every request and redirects unauthenticated users away from `/app/**`.
- `lib/supabase/admin.ts` — service-role client, used only for the Auth Admin API
  (looking up users by email when adding a member — Supabase Auth has no public
  "search by email" for the anon/authenticated role).

**Password reset** follows Supabase's standard client-detected-recovery-session
pattern rather than a server-side code exchange: `resetPasswordForEmail` sends a link
to `/reset-password`; Supabase's own redirect appends the recovery session to the
URL fragment (never sent to the server); the browser client auto-detects it and fires
a `PASSWORD_RECOVERY` auth event, which the reset-password form listens for before
showing the new-password field. See `app/actions/auth.ts` and
`app/reset-password/reset-password-form.tsx`.

## 5. Internationalization

`next-intl`, configured **without** URL-based locale routing (no `/en/...` prefix).

- `lib/i18n/config.ts` — the 5 supported locales, default (`pt`), cookie name
  (`NEXT_LOCALE`).
- `i18n/request.ts` — `getRequestConfig` resolves the locale from the `NEXT_LOCALE`
  cookie, falling back to the `Accept-Language` header, then the default.
- `messages/{locale}.json` — one flat-ish namespaced message catalog per locale
  (~260 keys), kept in exact key-parity across all 5 files.
- `app/actions/locale.ts` + `app/locale-switcher.tsx` — a Server Action sets the
  cookie and calls `revalidatePath("/", "layout")` to force a full re-render; the
  switcher is a plain `<select>`, no client-side routing involved.
- Every Server Action's error strings, every page/component's UI text, and all
  currency/date formatting (`Intl.NumberFormat`/`Intl.DateTimeFormat` with the
  resolved locale) go through this system — there is no hardcoded user-facing string
  left in the app.

One subtlety worth knowing if you touch automations: trigger-type values contain dots
(`"contact.created"`) because that's the stored DB/form value, but next-intl message
keys can't contain dots (it means nesting in the JSON). `triggerMessageKey()` in
`lib/automation/types.ts` converts dots to underscores **only at message-lookup time**
— the stored/matched trigger value passed to `runAutomationsForTrigger(...)` must stay
dotted, or automation matching silently breaks.

## 6. Automation engine

`lib/automation/engine.ts` exports `runAutomationsForTrigger(orgId, triggerType,
context)`, called from the relevant Server Action after a state change (e.g. at the
end of `createContact`). It:

1. Loads enabled automations for the org matching `triggerType`.
2. Runs each automation's actions in `order`.
3. Records one `AutomationRun` per automation invocation, with a per-action
   `resultLog` and overall `SUCCESS`/`FAILED` status — visible in the Automations
   page's run log.

Automations are fire-and-forget from the triggering action's perspective (not
queued/retried) — they run synchronously in the same request as the state change that
triggered them.

## 7. Known deviations & their reasons

- **No FK from `memberships.user_id` to `auth.users.id`.** The FK was in the original
  Phase 1 design. Adding `auth` to Prisma's tracked `schemas` (required for the FK to
  resolve) made `prisma migrate dev`'s shadow-database drift check treat the entire
  `auth` schema — Supabase's internal tables — as unmanaged drift, and offered
  `prisma migrate reset`, which would have deleted every real user account. The FK was
  dropped instead (`rls_policies_fase1_addendum.sql`); RLS is unaffected, since
  `is_org_member()` already scopes by `auth.uid()` directly.
- **Prisma pinned to `7.10.0` exactly** (both `prisma` and `@prisma/client`), not a
  caret range — a stray `npm install` once picked up a `prisma@8.0.0-rc` release
  candidate alongside a stable `@prisma/client@7.x`, which is a version mismatch you
  do not want in production.
- **`deepmerge-ts` and `mysql2` forced to patched versions via `package.json`
  `overrides`.** Both are transitive dependencies of the `prisma` CLI (via
  `@prisma/config`) with high-severity advisories; `npm audit fix --force` wants to
  downgrade `prisma` to `6.x` to "fix" this, which would break `prisma.config.ts` and
  the driver-adapter setup entirely. Neither vulnerable package is used at runtime —
  `mysql2` in particular is Prisma CLI's own multi-database tooling; this project only
  ever talks to Postgres.
- **`prisma.config.ts` loads `.env.local` explicitly.** Prisma 7 moved connection URLs
  out of `schema.prisma` and into `prisma.config.ts`; its config loader runs with
  `dotenv: false` internally, so `.env.local` isn't picked up automatically the way it
  is for `next dev`/`next build`. `prisma.config.ts` calls dotenv's `config()`
  directly before evaluating `env(...)` calls. This is a no-op on Vercel, where env
  vars are already in `process.env` and no `.env.local` file exists.
- **`package.json`'s `build` script runs `prisma generate && next build`.** Neither
  `prisma` nor `@prisma/client` ship a `postinstall` hook that generates the client
  automatically anymore (older Prisma versions did) — a plain `next build` on a fresh
  `npm install` (e.g. on Vercel) fails because the generated client doesn't exist yet.

## 8. Repo layout

```
app/
  actions/              Server Actions — the entire "API"
  app/[orgSlug]/         The authenticated product, one folder per module
  login/, forgot-password/, reset-password/    Auth pages
  locale-switcher.tsx
lib/
  automation/            Trigger/action types + the automation engine
  segments/               Segment filter shape + live query builder
  supabase/               client.ts / server.ts / admin.ts / proxy.ts
  i18n/                   Locale config
  prisma.ts               PrismaClient singleton (driver adapter wiring)
  *-types.ts / *-stages.ts   Shared enum-backed constants (no more label maps — see i18n)
messages/                 en.json / pt.json / fr.json / de.json / it.json
prisma/
  schema.prisma
  rls_policies_faseN.sql  Manually-applied RLS — never run by tooling
  migrations/
i18n/request.ts           next-intl server config
docs/                      This documentation set
```
