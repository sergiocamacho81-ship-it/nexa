# Continuo Organization Admin Guide

This guide is for people managing a **Continuo organization** itself — its name and its
members — from the in-app **Settings** page. It is not about deploying or operating
the Continuo platform; for that, see
[PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md) (technical, English only).

## Roles

Every person in an organization holds exactly one role **in that organization**
(someone in two organizations can hold a different role in each):

| Role | Can do |
|---|---|
| **Member** | Everything in the [User Guide](../user-guide/en.md): contacts, companies, deals, activities, tasks, email, automations, segments, campaigns. Can view Trash but not restore from it. Cannot open Settings. |
| **Admin** | Everything a Member can, plus: rename the organization, configure its SMTP account, add/remove members, change members' roles, restore items from Trash. |
| **Owner** | Everything an Admin can, plus: delete the organization itself. The only other difference from Admin is the "at least one Owner" protection described below. |

## Renaming the organization

Settings → the name field at the top → change it → **Save**. Takes effect
immediately everywhere the organization name is shown.

## Outbound email (SMTP)

Settings → **Outbound email (SMTP)**. Every organization configures its own SMTP
account — there's no shared platform mailbox, so **Email and Campaigns won't send
until this is set**: host, port, username, password, and the "from" address, plus
whether to use TLS. Whoever manages your organization's mailbox (IT, the mail
provider's admin panel) can give you these — the same settings you'd put into any
email client.

Leave the password field blank when saving other changes to keep the existing one;
type a new one only when you're actually changing it.

## Adding a member

Settings → **Add member** → enter their email and pick a role (defaults to
**Member**) → **Add**.

**The person must already have a Continuo account.** There is currently no email
invitation — if they haven't signed up yet, ask them to create an account first (see
the User Guide's "Signing in" section), then add them by that email. If you try to add
someone who has no account yet, you'll get an error saying so.

## Changing a member's role

Settings → find the member's row → use the role dropdown next to their name → pick the
new role. Takes effect immediately — no confirmation step, no save button.

## Removing a member

Settings → find the member's row → **Remove**. This removes their access to this
organization only; it does not delete their Continuo account or affect any other
organization they belong to. It's not instantly permanent — see
[Trash](#trash-recovering-deleted-things) below — and re-adding them by the same email
(Settings → Add member) restores their exact previous role instead of starting fresh.

## The "at least one Owner" rule

An organization can never end up with zero Owners: you cannot demote the last Owner to
Admin/Member, and you cannot remove the last Owner. If you need to hand over
ownership, first promote someone else to Owner, then change your own role or remove
yourself.

## Trash (recovering deleted things)

Every delete in Continuo — a contact, company, deal, activity, task, segment, automation,
campaign, or member — goes to **Trash** (in the nav) first, not straight to
permanent deletion. It stays there for **30 days**; an OWNER or ADMIN can restore it
from that page with one click. A Member can see what's in the Trash but not restore
anything. After 30 days, an item that's still there is deleted for good the next time
anyone opens the Trash page for that organization (there's no scheduled cleanup —
just a check whenever the page is viewed).

## Deleting the organization

Settings → **Danger zone** → **Delete organization** (OWNER only, with a
confirmation prompt). This moves the whole organization to a trash-like state: it
disappears from everyone's organization list immediately, but **you** (the Owner who
deleted it) can restore it from the organization list at `/app` within 30 days. After
that, it's gone for good along with everything in it.

## Things Settings does *not* cover

- **Billing / plan limits** — none exist yet; every organization has full, unlimited
  access to every module.
