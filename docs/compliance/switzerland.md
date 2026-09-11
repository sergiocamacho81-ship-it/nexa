# Switzerland Compliance — Index

**Document set initiated:** 2026-09-11

## Purpose

This directory exists because CONTINUO implements Swiss invoicing, VAT/MWST
handling, and QR-bill generation. Every legal or tax assumption baked into
that code — a rate, a rounding rule, a field format, a registration
threshold — must trace back to a documented, sourced requirement in this
directory. Nothing here is allowed to be guessed, inferred from generic SaaS
invoicing conventions, or carried over from another country's rules without
a Swiss-specific citation. If a behavior in the code isn't backed by an
entry in one of these docs, it's a bug, not a shortcut.

## Authoritative sources

This entire compliance doc set is built only on primary Swiss (and
Swiss-relevant cross-border) sources:

| Source | Base URL | Covers |
|---|---|---|
| ESTV / AFC / FTA (Federal Tax Administration) | https://www.estv.admin.ch | VAT/MWST rates, registration, procedure, official guidance and practice notices |
| Fedlex — VAT Act (MWSTG, SR 641.20) and VAT Ordinance (MWSTV, SR 641.201) | https://www.fedlex.admin.ch | Binding statutory and ordinance text underlying all VAT rules |
| SIX Group / SIX Interbank Clearing | https://www.six-group.com, https://www.six-interbank-clearing.com | QR-bill standard, Swiss QR Code specification, payment part layout |
| BAZG / OFDF (Federal Office for Customs and Border Security) | https://www.bazg.admin.ch | Customs, export declarations, and cross-border goods movement |
| Central Business Names Index / UID Register | https://www.zefix.ch, https://www.uid.admin.ch | Business identification (UID) numbers, company registration lookups |

Secondary sources (tax advisory firm summaries, blog posts, forum answers)
may be used to orient research, but every requirement recorded in these
docs must resolve to one of the primary sources above before it is
considered sourced.

## Forbidden shortcuts

The following assumptions must never be made anywhere in this project,
in code or in these docs, no matter how convenient:

- Never infer VAT registration status purely from turnover. Registration
  depends on specific thresholds, exemptions, and elections that must be
  looked up, not assumed from revenue alone.
- Never treat "VAT 0%" as a single concept. A zero rate on an invoice can
  mean exempt, zero-rated, outside the scope of Swiss VAT, or subject to
  reverse charge — these have different legal bases and different
  invoice/disclosure requirements, and must be distinguished explicitly.
- Never assume a foreign customer automatically means no Swiss VAT applies.
  Place-of-supply rules, not customer location alone, determine VAT
  treatment.
- Never assume all EU customers, or all foreign customers generally, get
  identical treatment. Treatment varies by country, customer type
  (business vs. consumer), and the nature of the supply.

## Table of contents

| Document | Covers |
|---|---|
| [switzerland.md](./switzerland.md) | This file — purpose, sources, forbidden shortcuts, and governance for the Swiss compliance doc set |
| [swiss-vat.md](./swiss-vat.md) | Swiss VAT/MWST rules: rates, registration thresholds, exemptions vs. zero-rating vs. out-of-scope, reverse charge |
| [swiss-invoices.md](./swiss-invoices.md) | Mandatory Swiss invoice content and formatting requirements |
| [swiss-qr-bill.md](./swiss-qr-bill.md) | SIX QR-bill specification: payment part layout, Swiss QR Code data structure, validation rules |
| [cross-border.md](./cross-border.md) | Cross-border invoicing and VAT treatment: EU vs. non-EU customers, exports, place-of-supply, customs touchpoints |

## Governance

- Every requirement entry in the sibling documents must record:
  **Requirement**, **Source**, **Source URL**, **Effective date**,
  **Verification date**, **Implementation** (where/how it's enforced in
  CONTINUO), and **Notes**.
- This doc set is not a substitute for review by a qualified Swiss tax
  advisor. Code that implements Swiss VAT, invoicing, or QR-bill behavior
  must not ship to real customers without that review.
- When Swiss tax rules or the SIX QR-bill specification change, the
  affected document must be updated and its **Verification date** bumped
  to reflect the check.
- Historical invoices must keep referencing the configuration version that
  was in effect when they were issued. A rule change must never be applied
  retroactively to reinterpret an already-issued invoice — past invoices
  are pinned to the rules that produced them.
