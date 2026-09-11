# Swiss Invoice Content Requirements — Compliance Reference

**Produced for:** the CONTINUO compliance engine (invoice data model and PDF
template logic for Swiss invoicing), CONTINUO being the invoicing module built
into the Continuo CRM.

**Status:** engineering documentation, not legal advice. This document was
compiled by an AI research process reading primary Swiss government sources
live on **2026-09-11**. It gives the engineering team an accurate, sourced
starting point for modeling what must appear on a Swiss invoice — it is
**not** a substitute for review by a qualified Swiss tax advisor
(Steuerberater / Treuhänder / avocat fiscaliste) before any of this logic is
relied upon for real invoices sent to real customers. Every entry below
carries its own verification date and must be re-checked before being
treated as current, especially given that Swiss VAT law has changed on a
rolling basis (1 January 2024 rate increase, 1 January 2025 MWSTG revision).

> Note on naming: the sibling documents in this directory (`swiss-vat.md`,
> `switzerland.md`) refer to the product as "CONTINUO." This document was
> commissioned under the name "CONTINUO" for the same codebase
> (`Vingelis/Products/Continuo/nexa`). That naming discrepancy was not resolved
> in this research pass — flag it to whoever owns this doc set so the
> product name is made consistent across the directory.

All primary citations below are to:
- **ESTV/AFC/FTA** — the Swiss Federal Tax Administration, estv.admin.ch,
  specifically **MWST-Info 16 "Buchführung und Rechnungsstellung"**
  (accessed live via the ESTV web-publication portal, gate.estv.admin.ch)
- **Fedlex** — the official federal legislation portal, fedlex.admin.ch:
  - VAT Act (Mehrwertsteuergesetz, **MWSTG, SR 641.20**), consolidated text
    "Stand am 31. März 2025" (cross-checked against the "Stand am 1. Januar
    2024" text — Art. 26/27/28 are word-for-word identical between the two,
    confirming the text used here is stable across that window)
  - VAT Ordinance (Mehrwertsteuerverordnung, **MWSTV, SR 641.201**),
    consolidated text "Stand am 1. Januar 2025"
  - Code of Obligations (Obligationenrecht, **OR, SR 220**), Thirty-Second
    Title (Kaufmännische Buchführung, Rechnungslegung), "Stand am 1. Januar
    2023"
  - Ordinance on the keeping and retention of business records
    (Geschäftsbücherverordnung, **GeBüV, SR 221.431**) — classification page
    only; full text not fetched verbatim in this session (see §6.2)

---

## 1. Minimum mandatory invoice content for VAT input-tax deduction (Art. 26 MWSTG)

### 1.0 What counts as an "invoice" at all

| Field | Value |
|---|---|
| Requirement | A "Rechnung" (invoice) for MWST purposes is **any document** by which the consideration for a supply is billed to a third party, regardless of what that document is called in business dealings. The statute's own examples (via ESTV guidance) include receipts, cash-register slips, contracts, and credit notes issued by either the supplier or the recipient — but explicitly **not** credit-card charge slips ("Belastungsanzeigen für Kreditkartenzahlungen"). |
| Source | Fedlex — MWSTG SR 641.20, Art. 3 Bst. k (legal definition); ESTV — MWST-Info 16, Ziff. 2.1 "Rechnung (Begriff)" (practice elaboration) |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 3 Bst. k); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/tableOfContent.xhtml?publicationId=1002536 (MWST-Info 16, Ziff. 2.1) |
| Effective date | Core MWSTG definition in force since 1 Jan 2010; unchanged in the versions checked |
| Verification date | 2026-09-11 — Art. 3 Bst. k text read directly from the Fedlex PDF; MWST-Info 16 Ziff. 2.1 read live from gate.estv.admin.ch |
| Implementation | `Invoice` is the right entity name, but the compliance engine's validation logic that decides "does this document need to satisfy Art. 26?" must trigger on **any** billing document type CONTINUO might generate for a supply — including credit notes (§4) and any future "quick receipt"/POS-style document — not only on documents literally named "Invoice" in the UI. A `documentKind` distinction (`INVOICE` / `CREDIT_NOTE` / `SIMPLIFIED_RECEIPT`) sharing the same Art. 26 validation core is the correct model. |
| Notes / unresolved questions | None outstanding on the definition itself. |

### 1.1 Supplier name and place

| Field | Value |
|---|---|
| Requirement | The invoice must state the supplier's **name and place/location as it appears in business dealings** ("wie er oder sie im Geschäftsverkehr auftritt") — a registered trade name/"Enseigne" (ESTV's own example: "Restaurant Rössli") is acceptable, it need not be the strict legal entity name. |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 2 Bst. a; ESTV MWST-Info 16, Ziff. 2.2 (a) and Ziff. 2.3 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 (Ziff. 2.2, live-read, "Publiziert am: 05.01.2024") |
| Effective date | Current Art. 26 Abs. 2 chapeau wording in force since 1 Jan 2018 (Ziff. II 1 des BG vom 16. Juni 2017); lit. a itself unchanged in substance since 2010 |
| Verification date | 2026-09-11 — confirmed both against the Fedlex statute text and live against the ESTV web publication (matched verbatim, including the sample-invoice image) |
| Implementation | Mandatory field, e.g. `Invoice.supplierName` + `Invoice.supplierAddress`, populated as a **snapshot copied at invoice-issue time** from the issuing `Organization`, not a live join — so that a later change to the organization's registered name/address does not retroactively alter a historical invoice's legal content. This is not just good practice; it follows from the general documentary-evidence principle in Art. 957a OR (§6). |
| Notes / unresolved questions | The current CONTINUO/Continuo Prisma schema's `Organization` model (`prisma/schema.prisma`) has **no address field at all** — only `name`, `slug`, SMTP settings, and billing fields. This is a concrete data-model gap; see §7. |

### 1.2 Supplier UID / VAT registration number

| Field | Value |
|---|---|
| Requirement | The invoice must state (i) that the supplier is registered in the register of taxable persons, and (ii) the **number under which it is registered** — i.e., the UID suffixed with "MWST"/"TVA"/"IVA" (e.g. `CHE-123.456.789 MWST`), per the ESTV sample invoice in MWST-Info 16. |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 2 Bst. a; ESTV MWST-Info 16, Ziff. 2.2 (d) and sample invoice |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26 Abs. 2 Bst. a, footnote: "Fassung gemäss Anhang Ziff. 2 des BG vom 18. Juni 2010 über die Unternehmens-Identifikationsnummer, in Kraft seit 1. Jan. 2011"); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 |
| Effective date | UID-based wording in force since 1 January 2011 |
| Verification date | 2026-09-11 |
| Implementation | Mandatory **only when the supplier is a registered taxable person**; must be omitted (and is legally forbidden, per Art. 27 Abs. 1, §4.1) if the issuing organization is not VAT-registered. This is covered in detail in `swiss-vat.md` §5.2 (the sibling doc already documents the UID format and mandatory-disclosure rule) — CONTINUO's `Organization` model needs a `vatNumber`/`uid` field and a `vatStatus` gate, neither of which currently exists in the schema (see §7). |
| Notes / unresolved questions | Cross-reference `swiss-vat.md` §5 before implementing — do not duplicate/diverge the UID format validation logic between this doc's recommendations and that doc's. |

### 1.3 Recipient name and place

| Field | Value |
|---|---|
| Requirement | The invoice must state the recipient's **name and place/location as it appears in business dealings**, same standard as the supplier (§1.1). ESTV guidance distinguishes: for invoices to (a) **taxable/registered recipients** and (b) **recipients domiciled/seated abroad with a claim to VAT refund** (Vergütungsverfahren), this is treated as a should-have item under the "in der Regel" (as a rule) standard of Art. 26 Abs. 2. For **simplified receipts ≤ CHF 400** the recipient's name/address may be omitted entirely (§1.9). |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 2 Bst. b; ESTV MWST-Info 16, Ziff. 2.2 (b) |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 |
| Effective date | In force since 1 Jan 2018 (current Abs. 2 chapeau wording); lit. b substance since 2010 |
| Verification date | 2026-09-11 |
| Implementation | Mandatory field (`Invoice.recipientName` + `Invoice.recipientAddress`), again snapshotted at issue time rather than a live join to `Company`/`Contact`. CONTINUO's current `Company` model has **no address fields at all** (only `name`, `domain`); `Contact` was not inspected in this pass but should be checked for the same gap. This means CONTINUO currently has no way to legally populate a compliant recipient address on an invoice — a hard blocker, not a cosmetic gap (see §7). |
| Notes / unresolved questions | Confirm whether CONTINUO's `Contact` model has any address fields — not verified in this research pass; verify before scoping the schema migration. |

### 1.4 Date or period of supply, distinct from invoice date

| Field | Value |
|---|---|
| Requirement | The invoice must state the **date or period during which the supply was rendered**, but **only insofar as this does not coincide with the invoice date** ("Datum oder Zeitraum der Leistungserbringung, soweit diese nicht mit dem Rechnungsdatum übereinstimmen"). In other words: Swiss law does **not** always require a separate service-date field — if the supply date and the invoice date are the same day, stating the invoice date alone satisfies this requirement. A distinct service date/period becomes legally **mandatory** the moment the two diverge (which is the common case for anything invoiced after delivery, for periodic/subscription services, or for work spanning multiple days). |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 2 Bst. c; ESTV MWST-Info 16, Ziff. 2.2 (e) and sample invoice (shows "Ich lieferte Ihnen am 19. März 2024" as a distinct supply date next to "Olten, 26. März 2024" as the invoice date) |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 |
| Effective date | In force since 1 Jan 2018 (current wording); substance since 2010 |
| Verification date | 2026-09-11 — confirmed against both the statute text and the ESTV sample invoice, live |
| Implementation | The current CONTINUO `Invoice` Prisma model has only `issueDate` (`DateTime @default(now())`) and **no `serviceDate`/`servicePeriodStart`/`servicePeriodEnd` field at all**. This is a real gap, not a nice-to-have: the engine should (1) add an optional `serviceDate` (single date) and/or `servicePeriodStart`/`servicePeriodEnd` (date range) to `Invoice` (and arguably to `InvoiceLineItem`, since different line items can represent supplies rendered on different dates), and (2) make the PDF template conditionally render the service date/period **only when it differs from the issue date** — while the compliance validator should treat "service date differs from issue date AND is not recorded" as a hard content-completeness warning, since this is one of the few Art. 26 items that is genuinely date-of-supply-driven rather than always-required verbatim. |
| Notes / unresolved questions | Note this also matters for VAT **rate-change transition rules** (see `swiss-vat.md` §1.1 note on date-of-supply vs. invoice date): if CONTINUO lets an invoice's issue date and service date diverge across a rate-change boundary, the applicable rate must be selected by service date, not issue date — this is an additional reason the field cannot be left implicit. |

### 1.5 Nature, object and scope of the supply

| Field | Value |
|---|---|
| Requirement | The invoice must describe the **nature, object, and scope** ("Art, Gegenstand und Umfang") of the supply clearly enough that supplier, recipient, and the nature of the supply are each unambiguously identifiable. |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 2 Bst. d; ESTV MWST-Info 16, Ziff. 2.2 (c) and Ziff. 2.3 ("Leistungserbringer, Leistungsempfänger und die Art der Leistung müssen eindeutig identifizierbar sein") |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 |
| Effective date | In force since 1 Jan 2018 (current wording); substance since 2010 |
| Verification date | 2026-09-11 |
| Implementation | Maps directly to `InvoiceLineItem.description`, already present in the schema (`description String`, required, non-nullable) — this field is already correctly mandatory. No gap here. |
| Notes / unresolved questions | ESTV guidance adds that where genuinely independent supplies (Art. 19 Abs. 1 MWSTG) are taxed at **different rates**, they must always be itemized separately, never bundled into one line at a blended or single rate (Ziff. 2.3) — relevant to line-item granularity rules, not just the description text; see §1.8. |

### 1.6 Consideration (amount) for the supply

| Field | Value |
|---|---|
| Requirement | The invoice must state the **consideration (Entgelt)** for the supply. |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 2 Bst. e; ESTV MWST-Info 16, Ziff. 2.2 (f) |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 |
| Effective date | In force since 1 Jan 2018; substance since 2010 |
| Verification date | 2026-09-11 |
| Implementation | Maps to `InvoiceLineItem.quantity` × `unitPrice`, already present and already required — no schema gap for the raw amount itself. The invoice-level **total** (sum of line items, net of/plus VAT as applicable) is presumably computed at render time rather than stored; confirm the PDF template actually displays a clear total consideration figure, since Art. 26 requires the consideration to be *stated*, not merely derivable. |
| Notes / unresolved questions | None on the legal requirement; verify PDF template rendering, not schema, covers this. |

### 1.7 Applicable VAT rate(s) and tax amount (or "VAT included" note)

| Field | Value |
|---|---|
| Requirement | The invoice must state the **applicable VAT rate and the tax amount owed on the consideration**; if the consideration is stated **inclusive of tax**, it is sufficient to state only the applicable rate (the tax amount need not be broken out separately in that case). |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 2 Bst. f; ESTV MWST-Info 16, Ziff. 2.2 (g) |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 |
| Effective date | In force since 1 Jan 2018; substance since 2010 |
| Verification date | 2026-09-11 |
| Implementation | This is the single biggest structural gap between the current CONTINUO schema and Art. 26. Today `Invoice.vatRate` is **a single nullable `Decimal` on the invoice as a whole** (defaulted from `Organization.invoiceVatRate`), and there is **no stored tax-amount field at all** and **no "amount includes tax" boolean**. The compliance-correct model needs: (1) VAT rate to be attached **per line item** (`InvoiceLineItem.vatRate`), not per invoice, because different lines can legitimately carry different rates (standard/reduced/special/exempt — see §1.8); (2) an explicit, stored `taxAmount` (not just recomputed ad hoc at render time) so historical invoices remain reproducible even if rate-calculation logic changes later; (3) an explicit `amountIncludesTax: boolean` so the template can correctly render either "rate + amount" or "rate only" per Art. 26 Abs. 2 Bst. f's alternative. |
| Notes / unresolved questions | Cross-reference `swiss-vat.md` §1 for the actual current rate values (8.1% / 2.6% / 3.8%) and §3 for the excluded/zero-rated/out-of-scope/reverse-charge distinctions that a per-line `vatRate` field alone cannot capture — a line at "0%" needs an accompanying `taxTreatment` reason code, not just a numeric rate, to be legally meaningful and auditable. |

### 1.8 Separate disclosure when multiple VAT rates apply

| Field | Value |
|---|---|
| Requirement | Where an invoice bundles genuinely independent supplies (Art. 19 Abs. 1 MWSTG) that are subject to **different VAT rates**, a rate split/allocation is required for the MWST return, and ESTV guidance states such supplies "sind deshalb immer gesondert auszuweisen" (must therefore always be shown separately) — i.e., they cannot be shown as a single blended line. |
| Source | ESTV MWST-Info 16, Ziff. 2.3 ("Weitere Ausführungen zu den Rechnungsanforderungen"), referencing Art. 19 Abs. 1 MWSTG |
| Source URL | https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 (live-read 2026-09-11; this text sits in Ziff. 2.3, not 2.2 — same publication, "Publiziert am: 08.04.2024") |
| Effective date | Publiziert am 08.04.2024 per the ESTV page; underlying Art. 19 Abs. 1 MWSTG substance unchanged since 2010 |
| Verification date | 2026-09-11 — read live, verbatim, from gate.estv.admin.ch |
| Implementation | Enforced structurally once §1.7's per-line-item `vatRate` change lands: the PDF template must group/subtotal by rate (mirroring the sample-invoice pattern already seen for the single-rate case: "8,1 % MWST … Total"), and the validator should reject an attempt to record one blended rate across line items that are legally distinct supplies at different rates. |
| Notes / unresolved questions | "Independent supplies" (Art. 19 Abs. 1) vs. a single composite supply taxed at one rate (e.g. the "gastgewerbliche Leistung" example in MWST-Info 16 Ziff. 2.5.1, Beispiel 2, where catering + service together become one standard-rated supply even though food alone would be reduced-rated) is a substantive classification judgment, not a formatting rule — this needs product-catalog-level rate/category data, not just per-line manual rate entry, to avoid merchant error. Flagged for tax-advisor input on how strictly to enforce this in the UI. |

### 1.9 Simplified invoices / cash-register receipts up to CHF 400

| Field | Value |
|---|---|
| Requirement | Receipts issued by automated cash registers ("Kassenzettel") — and, per the Ordinance, coupons from registering cash registers — for amounts **up to CHF 400 (including tax)** need **not** state the recipient's name/address. Such simplified receipts do **not**, however, entitle the holder to a VAT refund under the foreign-refund procedure (Vergütungsverfahren). |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 3 (delegates the amount to the Federal Council); Fedlex — MWSTV SR 641.201, **Art. 57** (sets the amount); ESTV MWST-Info 16, Ziff. 2.3 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26 Abs. 3); https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/828/20250101/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-828-20250101-de-pdf-a-3.pdf (Art. 57, verbatim: "Kassenzettel für Beträge bis 400 Franken müssen keine Angaben über den Leistungsempfänger oder die Leistungsempfängerin enthalten. Solche Kassenzettel berechtigen nicht zu einer Steuerrückerstattung im Vergütungsverfahren."); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 |
| Effective date | CHF 400 threshold as currently in force (consolidated MWSTV text "Stand am 1. Januar 2025"); this is the same figure ESTV cites in the MWST-Info 16 text last published 08.04.2024 — no indication of a pending change |
| Verification date | 2026-09-11 — the CHF 400 figure was confirmed **directly in the Fedlex-hosted MWSTV ordinance text itself** (Art. 57), not only via ESTV secondary guidance, which is the strongest possible sourcing for this figure |
| Implementation | If CONTINUO ever supports a POS/quick-receipt flow, model this as a `documentKind = SIMPLIFIED_RECEIPT` variant (see §1.0) with `recipientName`/`recipientAddress` made optional specifically when `totalIncludingTax <= 400.00 CHF`, and surface in the UI that such receipts cannot be used to support a foreign VAT-refund claim. For CONTINUO's current B2B/CRM-driven invoicing flow (deal → invoice), this exception is likely low priority, but the validator should not hard-require recipient address on every invoice type if a simplified-receipt flow is ever added. |
| Notes / unresolved questions | Threshold is inclusive-of-tax and it is a *pure amount* test — it does not matter whether the customer is a private individual or a business. Do not conflate this with a "private customer" flag (see §5). |

### 1.10 Formal Art. 26 content is not an absolute statutory precondition for input-tax deduction

| Field | Value |
|---|---|
| Requirement | Since the 2018 MWSTG reform, the substantive right to deduct input tax (Art. 28 MWSTG) is **not** framed as "only with an Art. 26-perfect invoice" — Art. 28 Abs. 3 requires only that the taxable person **prove they paid the input tax**, and the Ordinance's implementing rule (Art. 59 MWSTV) states that domestic tax counts as "invoiced" whenever the supplier **recognizably demanded** VAT from the recipient — the recipient is not obliged to verify that the VAT was rightfully charged, and loses the deduction only if they **knew** the charging party was not a registered taxable person. In practice, though, a fully Art. 26-compliant invoice remains the standard, expected, and safest form of proof, and is what MWST-Info 16 and ESTV audit practice are built around. |
| Source | Fedlex — MWSTG SR 641.20, Art. 28 Abs. 1, Abs. 3; Fedlex — MWSTV SR 641.201, Art. 59 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 28); https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/828/20250101/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-828-20250101-de-pdf-a-3.pdf (Art. 59, verbatim: "Die Inlandsteuer gilt als in Rechnung gestellt, wenn der Leistungserbringer … für den Leistungsempfänger … erkennbar von diesem … die Mehrwertsteuer eingefordert hat.") |
| Effective date | Current Art. 28 wording per the 2016 revision, in force 1 Jan 2018; Art. 59 MWSTV consolidated "Stand am 1. Januar 2025" |
| Verification date | 2026-09-11 — both articles read directly from Fedlex-hosted PDFs |
| Implementation | This does **not** mean CONTINUO should relax its own outgoing-invoice validation — as the *issuer*, CONTINUO's customers still want (and their own counterparties' auditors will expect) fully Art. 26-compliant invoices, and ESTV's own MWST-Info 16 checklist and sample invoices are built around the full list. Treat §1.1–§1.9 as the **target compliance bar for invoices CONTINUO generates**, and treat this entry only as context for why CONTINUO should be lenient (not silently reject) when *importing or reconciling against* a less-than-perfect **incoming** third-party invoice/receipt. |
| Notes / unresolved questions | This nuance is exactly the kind of thing that should be explicitly confirmed with a Swiss tax advisor before it influences any validation-leniency decision in the product — it is easy to over- or under-read how far the liberalized Art. 28/Art. 59 standard actually extends in ESTV audit practice. |

---

## 2. Service date / period of supply — see §1.4

Covered in full above (§1.4): a distinct service date or period is legally
required **only when it differs from the invoice date**; when they coincide,
the invoice date alone is sufficient under Art. 26 Abs. 2 Bst. c MWSTG.

---

## 3. Invoice numbering rules

### 3.1 No explicit statutory numbering rule in the VAT Act or Ordinance

| Field | Value |
|---|---|
| Requirement | Neither Art. 26/27 MWSTG nor the corresponding MWSTV provisions (Art. 57 and surrounding) impose an explicit requirement that invoices be sequentially numbered, uniquely numbered, or issued without gaps. The mandatory-content list in Art. 26 Abs. 2 Bst. a–f (§1) does **not** include an invoice number as a listed element at all. |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 (absence of an invoice-number requirement, confirmed by reading the full, unabridged Abs. 2 list); Fedlex — MWSTV SR 641.201, Art. 57 and surrounding (same absence) |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26); https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/828/20250101/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-828-20250101-de-pdf-a-3.pdf (Art. 57) |
| Effective date | N/A — this is a negative finding (absence of a rule), confirmed against the current consolidated texts |
| Verification date | 2026-09-11 |
| Implementation | CONTINUO's current `Invoice.number` (an `Int`, unique per organization via `@@unique([organizationId, number])`, assigned from an `Organization.invoiceCounter` sequence incremented in the same transaction as invoice creation, per the schema comments) is **not** independently mandated by VAT law, but is still good practice and, as explained in §3.2, is effectively required by accounting law's documentary-traceability principle. The current implementation (a DB-enforced unique, transactionally-incremented per-org sequence) is a reasonable design for gaplessness **as long as invoice deletion/voiding never reuses or renumbers a previously-issued number** — confirm the delete/void code path preserves this (a soft-deleted or voided invoice should keep its original number, never free it for reuse). |
| Notes / unresolved questions | Confirm in code review that no code path (bulk import, void/cancel flow, manual DB fix) can create a gap-then-backfill or a duplicate/reused number — this is the property accounting-law practice actually cares about (see §3.2), even though no VAT statute names "invoice number" directly. |

### 3.2 Where the practical numbering requirement actually comes from: OR Art. 957a (documentary-evidence principle)

| Field | Value |
|---|---|
| Requirement | Businesses subject to the Code of Obligations' accounting duty (Art. 957 OR — sole proprietorships/partnerships with ≥ CHF 500,000 annual turnover, and all legal entities) must keep books according to the "Grundsätze ordnungsmässiger Buchführung" (principles of proper bookkeeping), which explicitly include: (1) complete, truthful, systematic recording of transactions; (2) **documentary evidence for each individual booking** ("der Belegnachweis für die einzelnen Buchungsvorgänge"); (3) clarity; (4) appropriateness to the business's nature and size; and (5) **auditability/traceability** ("die Nachprüfbarkeit"). Neither Art. 957 nor Art. 957a names "invoice numbering" as such, but a gapless, unique, sequential invoice number is the conventional and practically indispensable way of satisfying the documentary-evidence and traceability principles for sales invoices specifically, and is what ESTV auditors check for in practice. |
| Source | Fedlex — OR SR 220, Art. 957 Abs. 1–3, Art. 957a Abs. 1–5 |
| Source URL | https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/27/317_321_377/20230101/de/pdf-a/fedlex-data-admin-ch-eli-cc-27-317_321_377-20230101-de-pdf-a.pdf (Art. 957, Art. 957a — verbatim: "1. die vollständige, wahrheitsgetreue und systematische Erfassung der Geschäftsvorfälle und Sachverhalte; 2. der Belegnachweis für die einzelnen Buchungsvorgänge; 3. die Klarheit; 4. die Zweckmässigkeit mit Blick auf die Art und Grösse des Unternehmens; 5. die Nachprüfbarkeit.") |
| Effective date | Current Thirty-Second Title (Kaufmännische Buchführung, Rechnungslegung) in force since 1 Jan 2013 (2011 accounting-law reform, Ziff. I 2 des BG vom 23. Dez. 2011); consolidated text checked was "Stand am 1. Januar 2023" |
| Verification date | 2026-09-11 — Art. 957/957a text read directly from the Fedlex-hosted OR PDF |
| Implementation | No direct schema requirement follows from OR Art. 957a beyond what §3.1 already covers (uniqueness + no reuse/gaps). Where this principle *does* bite operationally: CONTINUO's retention and audit-trail design (not just the invoice-number field) must support producing, on demand, a complete run of an organization's invoices in number order with no unexplained gaps — which is more of an export/reporting capability than a schema field. |
| Notes / unresolved questions | Whether OR Art. 957/957a applies to a given CONTINUO customer organization at all depends on its legal form and turnover (the CHF 500,000 threshold for sole proprietorships/partnerships) — smaller sole proprietorships below that threshold are only required to keep a simplified income/expense record (Art. 957 Abs. 2 OR) but the Art. 957a principles still apply "sinngemäss" (by analogy, Art. 957 Abs. 3). This is a business-classification question CONTINUO does not currently model at all (no legal-form or turnover-threshold field was found on `Organization`) and is out of scope for the invoice document itself, but worth flagging for the broader compliance engine. |

### 3.3 ESTV audit practice on gapless numbering — not independently verified against a primary source in this pass

| Field | Value |
|---|---|
| Requirement | Secondary/advisory commentary consistently states that ESTV auditors specifically check for gapless, sequential invoice numbering as part of verifying completeness of declared turnover, and that an unexplained gap in the sequence is a red flag during a control. This was **not** independently located as an explicit, quotable statement in MWST-Info 16 itself in this research pass (the publication's numbering-specific guidance, if any, may live in Ziff. 1.5 "Prüfspur" (audit trail) or the checklist in Ziff. 3.1, neither of which was read verbatim in this session). |
| Source | Not confirmed against a primary ESTV/Fedlex source in this session; only inferred from the general Art. 957a "Nachprüfbarkeit"/"Belegnachweis" principles (§3.2) plus the well-established professional consensus among Swiss Treuhänder/accounting-software vendors |
| Source URL | Not applicable — flagged as unverified |
| Effective date | Unknown |
| Verification date | 2026-09-11 — **explicitly flagged as unverified; do not treat as settled** |
| Implementation | No new implementation beyond §3.1/§3.2 pending confirmation. |
| Notes / unresolved questions | **Follow-up needed:** fetch MWST-Info 16 Ziff. 1.5 "Prüfspur" and Ziff. 3.1 "MWST-Checkliste am Ende des Geschäftsjahres" verbatim (both were seen only in the table of contents / a passing checklist-item reference in this session, e.g. "Wurde eine Umsatzabstimmung vorgenommen? Artikel 128 Absatz 2 MWSTV…") to see whether ESTV states a numbering expectation explicitly, rather than relying on the accounting-law inference in §3.2. |

---

## 4. Invoice corrections and credit notes

### 4.1 Incorrect or unauthorized tax disclosure — the general rule

| Field | Value |
|---|---|
| Requirement | A person **not** registered in the VAT register, or one applying the notification procedure (Art. 38 MWSTG), may **not** reference tax on an invoice at all. Anyone who **does** state tax on an invoice without being entitled to, or who states **too high** a tax amount, owes the stated tax regardless ("ausgewiesene Steuer gleich geschuldete Steuer") — **unless** either (a) the invoice is corrected per the mechanism in §4.2, or (b) the issuer credibly shows the Confederation suffered no tax loss (in particular, that the recipient never claimed input-tax deduction, or that any claimed deduction was repaid). The same legal consequence applies to credit notes, unless the credit-note recipient objects in writing to an unjustified or excessive tax amount shown on it. |
| Source | Fedlex — MWSTG SR 641.20, Art. 27 Abs. 1–3; ESTV MWST-Info 16, Ziff. 2.5.1 (elaboration) |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 27, verbatim Abs. 1–3 read directly) |
| Effective date | Current wording per Ziff. I des BG vom 30. Sept. 2016, in force since 1 Jan 2018 — confirmed identical between the "Stand 1.1.2024" and "Stand 31.3.2025" consolidated texts |
| Verification date | 2026-09-11 |
| Implementation | This governs what happens if CONTINUO (or its customers) issue an invoice with a wrong VAT rate/amount, or issue tax on an invoice from an unregistered supplier profile. The compliance engine should treat "tax shown but supplier not VAT-registered" as a hard validation error at issue time (preventative), and treat "tax amount later found wrong" as a correction workflow (§4.2), not a silent edit of the original document. |
| Notes / unresolved questions | None on the legal rule itself. |

### 4.2 What makes a correction legally valid

| Field | Value |
|---|---|
| Requirement | A subsequent correction of a previously issued invoice — whether to add tax that was not charged, correct a rate/amount that was too low, or reflect a later change in consideration — must be made, **within what is permissible under commercial law**, by means of an **additional document that (a) requires receipt by the recipient, (b) is actually delivered/sent to that recipient, and (c) explicitly references the original invoice and either revokes it or supplements/corrects it**. The correction document does not need to be a wholesale replacement invoice — it can be a supplement — but it must be traceable back to the original. The same mechanism applies where the *recipient* had originally issued a credit note that now needs correcting. |
| Source | Fedlex — MWSTG SR 641.20, Art. 27 Abs. 4 ("Die nachträgliche Korrektur einer Rechnung kann innerhalb des handelsrechtlich Zulässigen durch ein empfangsbedürftiges Dokument erfolgen, das auf die ursprüngliche Rechnung verweist und diese widerruft."); ESTV MWST-Info 16, Ziff. 2.5.1 ("Nachträgliche Rechnungskorrekturen") which extends this to three named scenarios (see §4.4) and to correcting a previously issued credit note |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 27 Abs. 4); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/tableOfContent.xhtml?publicationId=1002536 (Ziff. 2.5.1 — navigated to via the live TOC; verbatim text cross-checked against a mirrored copy of the same ESTV publication) |
| Effective date | Art. 27 Abs. 4 wording in force since 1 Jan 2018; MWST-Info 16 Ziff. 2.5.1 "Stand dieser Ziffer ab 05.01.2024" |
| Verification date | 2026-09-11 |
| Implementation | This is the core requirement for CONTINUO's correction/credit-note feature, whenever it's built: (1) a correction is **never** an in-place edit of a sent/finalized invoice's stored fields — it must be a new, separate document row; (2) that new document must carry a foreign key back to the original invoice it corrects (`Invoice.correctsInvoiceId` or a dedicated `InvoiceCorrection` join), not just a free-text reference in a notes field, so the link is queryable and auditable; (3) "revokes or supplements" implies two distinct correction modes worth modeling explicitly — a full **revocation + replacement** vs. a **delta/supplement** correction — since ESTV's own examples (§4.4) use both patterns; (4) the correction must be recorded as sent/delivered to the recipient (a `deliveredAt`/`sentAt` timestamp), since "empfangsbedürftig" (requiring receipt) is a stated element of validity, not just a formality. |
| Notes / unresolved questions | The current CONTINUO schema has **no correction/credit-note concept at all** — `InvoiceStatus` is only `DRAFT`/`SENT`/`PAID`, and there is no `InvoiceCorrection`/`CreditNote` model or self-referencing FK on `Invoice`. This is a full feature gap, not a tweak (see §7). |

### 4.3 Credit notes are themselves "invoices" for this purpose

| Field | Value |
|---|---|
| Requirement | A credit note ("Gutschrift") issued by either the supplier or the recipient falls within the MWST definition of "Rechnung" (§1.0) and is therefore itself subject to Art. 26/27. Where a credit note is issued by the **recipient** in place of a supplier-issued invoice (a "self-billing"-style arrangement), the credit-note issuer must still name the credit-note **recipient** (i.e. the actual supplier) with all necessary details, and it is recommended (not strictly stated as mandatory in the text read) that the supplier's VAT number also be shown. |
| Source | ESTV MWST-Info 16, Ziff. 2.1 (credit notes as invoices) and Ziff. 2.3 ("Wird anstelle einer Rechnung durch den Leistungserbringer eine Gutschrift durch den Leistungsempfänger ausgestellt, ist der Gutschriftsempfänger (Leistungserbringer) mit allen nötigen Angaben zu nennen. Das Aufführen der MWST-Nr. steuerpflichtiger Leistungserbringer ist zu empfehlen.") |
| Source URL | https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 (live-read, 2026-09-11, "Publiziert am: 08.04.2024") |
| Effective date | Publiziert am 08.04.2024 |
| Verification date | 2026-09-11 — read live, verbatim |
| Implementation | If CONTINUO ever supports recipient-issued credit notes/self-billing (as opposed to only supplier-issued invoices), the same `documentKind` extension from §1.0 applies, and the Art. 26 content checklist runs with supplier/recipient roles swapped relative to a normal invoice. Given CONTINUO's current CRM-driven, supplier-issues-invoice-to-customer model, this is likely low priority — flagged for completeness, not urgency. |
| Notes / unresolved questions | "Recommended, not stated as strictly mandatory" for the supplier's VAT number on a recipient-issued credit note is a fine distinction worth confirming with a tax advisor if this flow is ever built. |

### 4.4 The three named correction scenarios in ESTV practice guidance

| Field | Value |
|---|---|
| Requirement | MWST-Info 16 gives three named cases where the §4.2 correction mechanism applies: (1) subsequently passing on VAT that was **not originally invoiced** at all; (2) subsequently correcting a VAT **rate that was too low** on the original invoice; (3) a subsequent **change in consideration** (e.g., a price dispute resolved at a lower amount, illustrated by ESTV's own worked example of an agency reducing its fee by 50% after a client disputed the value delivered, requiring a corrected invoice). In each case, the correction document must reference the original invoice, and the recipient's input-tax deduction (if any) is claimed in the return period **in which the correction is made**, provided the recipient would have been entitled to deduct it at the original time of supply. |
| Source | ESTV MWST-Info 16, Ziff. 2.5.1, "Nachträgliche Rechnungskorrekturen" and worked Beispiele 1–3 |
| Source URL | https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/tableOfContent.xhtml?publicationId=1002536 (Ziff. 2.5.1; ESTV-hosted primary source, verified structurally live against the TOC; full worked-example text cross-checked against a mirrored copy of the same official publication since the live JS portal's deep-link navigation for this specific sub-section was not completed in this session) |
| Effective date | "Stand dieser Ziffer ab 05.01.2024" |
| Verification date | 2026-09-11 — **partially verified**: the section's existence, heading, and the three-scenario structure were confirmed live against the official ESTV table of contents; the full worked-example wording was read from a mirrored copy of the same ESTV publication rather than re-confirmed word-for-word live in this session (unlike Ziff. 2.2/2.3, which were both read live verbatim) |
| Implementation | Model `InvoiceCorrection.reason` as an enum covering at least these three ESTV-named categories (`UNCHARGED_VAT_ADDED`, `VAT_RATE_CORRECTED`, `CONSIDERATION_CHANGED`) plus an `OTHER` escape hatch, since the reason affects both the correction document's required content and (per the worked examples) which VAT period the correction lands in for reporting purposes. |
| Notes / unresolved questions | Recommend a follow-up live re-verification of Ziff. 2.5.1's exact wording directly on gate.estv.admin.ch (not just the mirrored copy) before this becomes a load-bearing legal citation in a shipped compliance document, given the partial-verification caveat above. |

---

## 5. B2B vs. private / non-VAT-registered customers

### 5.1 No separate content checklist by customer type — one standard, applied by category

| Field | Value |
|---|---|
| Requirement | Art. 26 MWSTG itself draws **no distinction** between invoices to VAT-registered business customers and invoices to private consumers — the mandatory-content list (§1.1–§1.7) is the same regardless of who the recipient is. ESTV's own elaboration in MWST-Info 16 Ziff. 2.2 frames the "should generally contain" checklist specifically in terms of invoices "für steuerpflichtige Leistungsempfänger sowie für Abnehmer mit Wohn- oder Geschäftssitz im Ausland (mit Anspruch auf Vergütung der MWST)" (for taxable recipients, and for customers domiciled abroad with a refund claim) — implying the full checklist is framed around cases where the recipient needs the invoice as proof for their **own** input-tax deduction or refund claim. The two carve-outs that *do* turn on transaction characteristics rather than customer type are (a) the CHF 400 simplified-receipt threshold (§1.9), which is an amount test, not a customer-type test, and (b) the general "in der Regel" (as a rule) qualifier on the whole Abs. 2 list, which gives some flexibility for low-stakes/retail-style transactions generally. |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 (no customer-type carve-out in the text); ESTV MWST-Info 16, Ziff. 2.2 (framing quoted above) |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26); https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1002536&componentId=1002626 |
| Effective date | Current wording in force since 1 Jan 2018 |
| Verification date | 2026-09-11 |
| Implementation | CONTINUO should **not** build a "private customer → simpler invoice, business customer → full invoice" toggle keyed off a generic B2B/B2C flag — the correct model applies the same Art. 26 checklist to every standard invoice, and layers the CHF 400 simplified-receipt exception (§1.9) as an **amount-driven** exception on top, independent of customer type. If CONTINUO wants a `Contact`/`Company` field to distinguish business vs. private customers for other reasons (e.g. UI defaults, marketing segmentation, or future place-of-supply logic — see `swiss-vat.md` §3.4), that field must not silently gate the Art. 26 validator. |
| Notes / unresolved questions | The foreign-domiciled-recipient wording in Ziff. 2.2 ("Abnehmer mit Wohn- oder Geschäftssitz im Ausland mit Anspruch auf Vergütung der MWST") gestures at the foreign VAT-refund procedure (Vergütungsverfahren), which is a distinct, more specialized topic (covered in the sibling `cross-border.md`, not fully researched here) — flag for that document rather than duplicating here. |

### 5.2 Recipient's own VAT/registration status is not itself a required invoice field

| Field | Value |
|---|---|
| Requirement | Nothing in Art. 26 Abs. 2 requires the **recipient's** UID or VAT-registration status to be printed on the invoice — only the **supplier's** registration/UID is a listed mandatory element (§1.2). The recipient's name and place (§1.3) is required; their tax status is not. |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 2 (full list read; recipient UID is absent from it) |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26) |
| Effective date | N/A — negative finding against the current consolidated text |
| Verification date | 2026-09-11 |
| Implementation | Do not make a recipient UID/VAT-number field mandatory on the `Invoice` validator. It can remain an **optional** field on `Company`/`Contact` (useful for other purposes — e.g. B2B reverse-charge scenarios covered in `swiss-vat.md` §3.5, or cross-border evidence in `cross-border.md`) without being enforced as invoice content. |
| Notes / unresolved questions | None. |

---

## 6. Accounting-law retention and documentary-integrity rules relevant to invoices

### 6.1 Ten-year retention of business books and vouchers

| Field | Value |
|---|---|
| Requirement | Business books, accounting vouchers (which include invoices — an invoice is a "Buchungsbeleg" per Art. 957a Abs. 3 OR), the annual report, and the audit report must be **retained for ten years**, with the retention period starting at the end of the relevant business year. |
| Source | Fedlex — OR SR 220, Art. 958f Abs. 1 |
| Source URL | https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/27/317_321_377/20230101/de/pdf-a/fedlex-data-admin-ch-eli-cc-27-317_321_377-20230101-de-pdf-a.pdf (Art. 958f, verbatim: "Die Geschäftsbücher und die Buchungsbelege sowie der Geschäftsbericht und der Revisionsbericht sind während zehn Jahren aufzubewahren. Die Aufbewahrungsfrist beginnt mit dem Ablauf des Geschäftsjahres.") |
| Effective date | Current Thirty-Second Title, in force since 1 Jan 2013 |
| Verification date | 2026-09-11 — read directly from the Fedlex-hosted OR PDF |
| Implementation | Every generated invoice (and any correction document, §4) must be retrievable, in its exact originally-issued form, for at least 10 years from the end of the business year in which it was issued. This has direct implications for CONTINUO's soft-delete design: the schema comments already note `Invoice.deletedAt` is a soft delete with organization-level restore, but confirm that (a) the retention window enforced anywhere in the app is not shorter than 10 years for invoices specifically (general CRM soft-delete/trash retention windows elsewhere in CONTINUO may be much shorter and must not apply to invoices), and (b) a hard-deleted/purged invoice is never actually erased from underlying storage before the 10-year mark, independent of the CRM-level "Trash" UX. |
| Notes / unresolved questions | Confirm CONTINUO's actual trash/purge retention window (referenced in the schema comment as "30-day retention window" for Deals) is **not** the same mechanism applied to Invoices — a 30-day purge would be a direct OR Art. 958f violation if it ever touched invoice records. This needs an explicit code check, not just a documentation note. |

### 6.2 Electronic record integrity (GeBüV) — not independently verified against primary text in this pass

| Field | Value |
|---|---|
| Requirement | Business books and vouchers may be kept on paper, electronically, or in comparable form, provided the recording method ensures agreement with the underlying transactions and the records remain readable at any time (Art. 958f Abs. 3 OR); the Federal Council is empowered to issue detailed rules on the records to be kept, their maintenance/retention, and permissible storage media (Art. 958f Abs. 4 OR) — which it has done via the GeBüV (SR 221.431). Secondary summaries describe GeBüV as requiring, for electronic records on modifiable media, technical/organizational measures ensuring integrity, timestamp of storage, and traceability of any change. |
| Source | Fedlex — OR SR 220, Art. 958f Abs. 3–4 (read verbatim, primary source); GeBüV SR 221.431 itself (classification page located, **full ordinance text not fetched verbatim in this session**) |
| Source URL | https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/27/317_321_377/20230101/de/pdf-a/fedlex-data-admin-ch-eli-cc-27-317_321_377-20230101-de-pdf-a.pdf (Art. 958f, OR — verified); https://www.fedlex.admin.ch/eli/cc/2002/216/de (GeBüV classification page — **not fetched verbatim**, located via search only) |
| Effective date | Art. 958f OR in force since 1 Jan 2013; GeBüV dated 24 April 2002, amended since (exact current consolidated version not confirmed in this session) |
| Verification date | 2026-09-11 — Art. 958f OR confirmed primary; **GeBüV's specific electronic-integrity requirements were not independently read from Fedlex in this session** and are sourced from secondary summaries only |
| Implementation | If CONTINUO stores invoice PDFs/records electronically as the system of record (near-certain, given it's a SaaS CRM), the storage design should, at minimum: (1) never allow an issued invoice's stored content to be mutated in place post-issuance (append corrections as new linked records, per §4.2, rather than editing); (2) capture a reliable creation/issuance timestamp; (3) ensure the stored representation remains renderable/readable for the full 10-year retention window (§6.1) independent of future template/rendering-code changes — e.g. by archiving a rendered PDF snapshot at issuance time, not only the underlying structured data that a future template change could re-render differently. |
| Notes / unresolved questions | **Follow-up needed:** fetch the GeBüV text directly from Fedlex (https://www.fedlex.admin.ch/eli/cc/2002/216/de) to confirm the exact integrity/immutability requirements for electronically-stored invoices before finalizing CONTINUO's archival/immutability design — this document currently relies on secondary characterization of GeBüV, not a primary-source read. |

---

## 7. CONTINUO data-model gap analysis

Current state, read directly from `prisma/schema.prisma` in this repository
(`C:\Users\User\Documents\Vingelis\Products\Continuo\nexa\prisma\schema.prisma`)
on 2026-09-11:

```
model Invoice {
  id, organizationId, dealId, number (Int), status (DRAFT/SENT/PAID),
  vatRate (Decimal? — single value per invoice), issueDate, notes,
  createdAt, updatedAt, deletedAt
}
model InvoiceLineItem {
  id, invoiceId, productId, description, quantity, unitPrice, position,
  createdAt
}
model Organization {
  ...name, slug... invoiceVatRate (Decimal?), invoiceCounter (implied)...
  — no address, no UID/VAT-number field
}
model Company {
  id, organizationId, name, domain — no address fields
}
```

| Art. 26 requirement | Current schema support | Gap |
|---|---|---|
| Supplier name/place (§1.1) | `Organization.name` only | No address field anywhere on `Organization` |
| Supplier UID/VAT number (§1.2) | None | No `uid`/`vatNumber` field on `Organization`; no `vatStatus` enum |
| Recipient name/place (§1.3) | `Company.name` (via `Deal.companyId`) | No address field on `Company` or (unverified) `Contact`; no snapshotting — invoice currently has no direct recipient fields at all |
| Service date / period distinct from issue date (§1.4) | `issueDate` only | No `serviceDate`/`servicePeriodStart`/`servicePeriodEnd` |
| Nature/object/scope of supply (§1.5) | `InvoiceLineItem.description` | Covered — no gap |
| Consideration (§1.6) | `quantity` × `unitPrice` | Covered — no gap (verify PDF template surfaces a clear total) |
| VAT rate + tax amount, or "incl. tax" note (§1.7) | `Invoice.vatRate` (single, nullable, invoice-level) | No per-line rate, no stored tax amount, no "includes tax" flag |
| Separate disclosure for multiple rates (§1.8) | N/A (single invoice-level rate) | Structurally impossible until §1.7 gap is fixed |
| Invoice numbering (§3) | `Invoice.number` (Int, unique per org, sequential) | Reasonable base — verify void/delete paths never reuse a number |
| Corrections / credit notes (§4) | None (`InvoiceStatus` = DRAFT/SENT/PAID only) | No correction/credit-note model at all |
| 10-year retention (§6.1) | Generic soft-delete (`deletedAt`) | Verify invoice retention window is not conflated with shorter CRM-wide trash windows |

This table is a starting scope for a future schema-migration ticket, not a
migration itself — this task was documentation-only and made no code
changes.

---

## Summary of items flagged for follow-up before this is relied upon in production logic

1. **§3.3** — ESTV's specific audit-practice statement on gapless invoice numbering was not confirmed verbatim against a primary source (MWST-Info 16 Ziff. 1.5 "Prüfspur" / Ziff. 3.1 checklist) — only inferred from OR Art. 957a's general principles.
2. **§4.4** — The three-scenario correction guidance and worked examples were confirmed live only at the table-of-contents/structural level on gate.estv.admin.ch; the full worked-example wording was cross-checked against a mirrored copy of the same official ESTV publication rather than read live verbatim in this session (unlike §1.1–§1.9's core content list, which was read live and verbatim).
3. **§6.2** — GeBüV's electronic-record-integrity rules were not read directly from Fedlex in this session; only OR Art. 958f (which delegates to GeBüV) was confirmed primary.
4. **§7** — This is a real, non-trivial set of schema gaps (no supplier/recipient address or UID fields, single invoice-level VAT rate instead of per-line, no correction/credit-note model, no service-date field). None of this was implemented in this pass — documentation only, per the task scope.
5. **§1.10** — The liberalized Art. 28/Art. 59 MWSTV standard for input-tax deduction (proof of demand, not a perfect Art. 26 invoice) is a nuance that should be explicitly discussed with a Swiss tax advisor before it influences any product decision about how strictly CONTINUO validates invoices it generates or imports.

This document, and every rule in it, must be reviewed by a qualified Swiss
tax advisor before CONTINUO's invoicing is relied upon for real customer
invoices.
