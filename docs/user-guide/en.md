# Nexa User Guide

Nexa is your team's CRM: contacts, companies, deals, activities, tasks, email, and
automation, all in one place. This guide covers everyday use. For managing the
organization itself (members, roles), see the [Admin Guide](../admin-guide/en.md).

## Signing in

Go to the app URL and sign in with your email and password. If you don't have an
account yet, use "Don't have an account yet? Sign up" — you'll get a confirmation
email to verify your address before you can sign in.

**Forgot your password?** Click "Forgot your password?" on the sign-in screen, enter
your email, and follow the link you receive. The link expires after a while — if it
stops working, just request a new one.

**Changing language:** use the language switcher in the top-right corner of the app.
Your choice is remembered on this device/browser; it doesn't change the web address.

## Choosing an organization

If you belong to more than one organization, you'll land on a list after signing in —
pick "Open" on the one you want to work in. Everything you see and do from then on is
scoped to that organization; other organizations' data is never visible to you.

## Dashboard

The first thing you see inside an organization: counts of contacts and companies, open
deal value and count, total won value, your pipeline broken down by stage, pending and
overdue tasks, campaign count, and a feed of recent activity.

## Contacts

People. Each contact has a first name (required), last name, email, phone, and
optionally a linked company. Click a contact to see their full activity, deals, and
tasks. Deleting a contact is permanent.

## Companies

Organizations you do business with. A company has a name and an optional website
domain. Linking contacts and deals to a company lets you see everything related to
that company in one place.

## Deals

A sales opportunity: a title, an optional value, and a stage. The pipeline has six
stages:

**Lead → Qualified → Proposal → Negotiation → Won / Lost**

Move a deal between stages as it progresses. The Dashboard's pipeline table and
open/won totals update automatically. A deal can optionally be linked to a contact
and/or a company.

## Activities

A log entry against a contact, company, and/or deal: a **Call**, **Email**,
**Meeting**, or **Note**, with free-text content and a date/time. Activities are the
history of everything that's happened — they don't drive any automation by themselves
(automations react to *created* contacts, *changed* deal stages, and *completed*
tasks, not to activities being logged).

## Tasks

A to-do with a title, an optional due date, and a status (**Pending** /
**Completed**). Tasks can be linked to a contact, company, and/or deal, and assigned
to a specific member of the organization. Overdue pending tasks are called out on the
Dashboard.

## Email

Send a one-off email to a contact — optionally tied to a specific deal, so it shows up
in that deal's context — through your organization's configured mail account. Every
send (successful or failed) is logged with its subject, recipient, and timestamp, so
you always have a record of what was sent and when.

> Sending requires the organization's SMTP account to be configured (an organization
> admin sets this up at the platform level — see the Admin Guide or ask whoever set up
> your Nexa instance if sending isn't working).

## Automations

"When X happens, do Y" rules that run automatically — no manual step needed once set
up.

**Triggers:** a contact is created · a deal's stage changes · a task is completed.

**Actions** (an automation can run more than one, in order): create a task · log an
activity · send an email.

Each automation has a name, is enabled or disabled independently, and keeps a run
log — every time it fires you can see whether each of its actions succeeded or failed,
and why.

## Segments

A saved, reusable filter over your contacts — e.g. "contacts at Acme Corp with an
email" or "contacts created after a given date." A segment isn't a fixed list: it's
recalculated every time it's used, so it always reflects your current contacts.
Segments exist mainly to feed Campaigns (see below), but the same filter logic is
reusable anywhere a targeted contact list is useful.

## Campaigns

A bulk email sent to a segment — or to "everyone with an email" if you don't pick a
segment. A campaign has a subject and a message body; once sent, you'll see how many
recipients succeeded and how many failed, with the specific error for any that failed.
Campaigns are one-shot: once sent, a campaign's status moves from **Draft** to
**Sending** to **Sent** and can't be re-sent as the same campaign.

## Tips

- Deleting anything (a contact, a segment, a member) is permanent — there's no undo or
  trash.
- Every list is scoped to your current organization; switching organizations (via the
  "Open" link from the organization list) changes everything you see.
- If something you expect to see is missing, check you're in the right organization
  and that your role has access to it (see the [Admin Guide](../admin-guide/en.md) for
  what each role can do).
