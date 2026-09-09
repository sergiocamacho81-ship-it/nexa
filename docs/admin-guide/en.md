# Nexa Organization Admin Guide

This guide is for people managing a **Nexa organization** itself — its name and its
members — from the in-app **Settings** page. It is not about deploying or operating
the Nexa platform; for that, see
[PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md) (technical, English only).

## Roles

Every person in an organization holds exactly one role **in that organization**
(someone in two organizations can hold a different role in each):

| Role | Can do |
|---|---|
| **Member** | Everything in the [User Guide](../user-guide/en.md): contacts, companies, deals, activities, tasks, email, automations, segments, campaigns. Cannot open Settings. |
| **Admin** | Everything a Member can, plus: rename the organization, add/remove members, change members' roles. |
| **Owner** | Everything an Admin can. The only difference from Admin today is the "at least one Owner" protection described below. |

## Renaming the organization

Settings → the name field at the top → change it → **Save**. Takes effect
immediately everywhere the organization name is shown.

## Adding a member

Settings → **Add member** → enter their email and pick a role (defaults to
**Member**) → **Add**.

**The person must already have a Nexa account.** There is currently no email
invitation — if they haven't signed up yet, ask them to create an account first (see
the User Guide's "Signing in" section), then add them by that email. If you try to add
someone who has no account yet, you'll get an error saying so.

## Changing a member's role

Settings → find the member's row → use the role dropdown next to their name → pick the
new role. Takes effect immediately — no confirmation step, no save button.

## Removing a member

Settings → find the member's row → **Remove**. This removes their access to this
organization only; it does not delete their Nexa account or affect any other
organization they belong to. Removal is immediate and there's no undo — if you remove
someone by mistake, you'll need to add them back.

## The "at least one Owner" rule

An organization can never end up with zero Owners: you cannot demote the last Owner to
Admin/Member, and you cannot remove the last Owner. If you need to hand over
ownership, first promote someone else to Owner, then change your own role or remove
yourself.

## Things Settings does *not* cover

- **SMTP / outbound email configuration** — this is set once at the platform level for
  the whole deployment, not per organization, and isn't exposed in the UI. If email
  sending isn't working for your organization, contact whoever operates your Nexa
  deployment (see [PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md)).
- **Billing / plan limits** — none exist yet; every organization has full, unlimited
  access to every module.
- **Deleting the organization itself** — not available from the UI today.
