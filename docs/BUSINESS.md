# Continuo — Business Overview

**Product:** Continuo CRM
**Owner:** Vingelis
**Status:** Live in production
**URL:** https://nexa-sigma-woad.vercel.app

## 1. What Continuo is

Continuo is a multi-tenant CRM and lightweight marketing-automation platform built for
small-to-mid-size teams (agencies, consultancies, small sales teams) that need contact
and deal management, activity tracking, task follow-up, transactional email, rule-based
automation, and segmented email campaigns — without the overhead or cost of an
enterprise CRM.

It is a single Next.js application serving any number of independent customer
organizations from one codebase and one database, with each organization's data fully
isolated at the database level (see [ARCHITECTURE.md](./ARCHITECTURE.md) for how).

## 2. Target users

- **Small sales/account-management teams** who need a pipeline (Contacts → Companies →
  Deals) without configuring a heavyweight platform.
- **Agencies and consultancies** tracking client relationships, activities, and
  follow-up tasks per client.
- **Anyone needing simple, rule-based follow-up automation** (e.g. "when a contact is
  created, create a follow-up task") without a dedicated marketing-automation tool.

## 3. Feature set

| Module | What it does |
|---|---|
| **Contacts** | People — name, email, phone, company, preferred language, city/canton. Full create/edit/delete, a 2-step creation wizard, and CSV bulk import. |
| **Companies** | Organizations the CRM's users do business with. Create/edit/delete. |
| **Deals** | Sales opportunities with a value and a 6-stage pipeline (Lead → Qualified → Proposal → Negotiation → Won / Lost). |
| **Activities** | A timeline of calls, emails, meetings, and notes against a contact, company, and/or deal. |
| **Tasks** | Assignable to-dos with a due date, linked to a contact/company/deal; overdue tasks surface on the dashboard. |
| **Email** | Send one-off transactional emails to a contact (optionally tied to a deal) via the organization's own configured SMTP account; every send is logged. |
| **Automations** | "When X happens, do Y" rules — e.g. auto-create a task when a contact is created, or send an email when a deal reaches a given stage. Every run is logged with its outcome. |
| **Segments** | Saved, live-resolved contact filters — company, email presence, creation date range, Swiss canton, city — reusable wherever a list of contacts is needed. |
| **Campaigns** | Bulk email to a segment (or "everyone with an email"); tracks per-recipient send status. |
| **Dashboard** | At-a-glance counts, pipeline value, overdue tasks, recent activity. |
| **Trash** | Every delete across every module above is recoverable for 30 days (OWNER/ADMIN restore); an OWNER can delete and restore the organization itself the same way. |
| **Settings** | Organization name, members and roles, the organization's outbound SMTP account, and organization deletion. |

## 4. Multi-tenancy & data isolation

Every organization ("tenant") is fully isolated:

- Every business record carries an `organization_id`.
- Postgres Row-Level Security (RLS) enforces that isolation at the database layer, not
  just in application code — even a bug in the app cannot leak one organization's data
  into another's queries.
- A person can belong to more than one organization, with a role per organization
  (**Owner**, **Admin**, **Member** — see the [Admin Guide](./admin-guide/) for what
  each can do).

This is the standard SaaS shape: one deployment, unlimited customer organizations, each
seeing only their own data.

## 5. Internationalization

The product UI (not just this documentation) is fully localized in **five
languages**: Portuguese, English, French, German, and Italian. Users pick a language
from a switcher in the app chrome; the choice is remembered per browser (a cookie, not
tied to the account), and dates/currency are formatted per the selected locale. There
are no separate URLs per language — the app is one set of routes for every language.

## 6. Current commercial status

The app is deployed and live but is not yet instrumented for self-serve signup,
billing, or a public marketing site — anyone who signs up today gets full access with
no plan/quota distinction. Before onboarding external paying customers, the following
would need to be decided and built:

- Pricing/plan model (seats? contacts? per-organization?) and a billing integration.
- Self-serve organization creation guardrails (currently any signed-up user can create
  an organization for free, instantly, with no limits).
- A public-facing marketing/landing page (today, `/` redirects straight into the
  product).
- Terms of service / privacy policy. (Data retention is now defined for deleted
  records — 30 days in a restorable Trash, then gone for good — but there's no
  written policy document yet, and no equivalent retention/export story for an
  organization's *active* data.)
- Outbound email deliverability at scale — each organization now brings its own SMTP
  account (no platform-wide mailbox to hit shared sending limits), but nothing yet
  helps a customer without one get set up, and there's no bulk-mail provider
  integration (e.g. Postmark/SES) for organizations that outgrow a personal mailbox.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the technical detail behind all of this,
and [PLATFORM_ADMIN.md](./PLATFORM_ADMIN.md) for how the live deployment is operated.
