# Swiss QR-bill — SIX Specification Requirements

**Document produced:** 2026-09-11
**Produced for:** CONTINUO compliance engine — engineering reference for the
QR-bill payment-part generator and validator built into CONTINUO's Swiss
invoicing module.
**Status:** Engineering documentation, not legal advice. See governance
rules in [switzerland.md](./switzerland.md).

## Governing primary source

This document is built on the official implementation guidelines published
by **SIX Interbank Clearing Ltd (SIC Ltd)**, a subsidiary of SIX Group:

- **"Swiss Implementation Guidelines for the QR-bill"** (technical and
  functional specification for the payment part with Swiss QR Code and
  receipt), **Version 2.3, valid from 21 November 2025** (published
  20 November 2023). This is the version **currently in force** as of the
  verification date below, and is the version this document primarily
  documents.
  PDF: https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Version 2.4, valid from 14 November 2026** (published 24 February 2026)
  has already been published by SIX and is referenced throughout this
  document wherever it changes a requirement CONTINUO must plan for. It is
  **not yet in force**. Per its own change-control text: *"This document
  ... replaces Version 2.3 of 21 November 2025. Version 2.3 remains valid
  until November 2027."* — i.e. there is a transition window in which both
  versions are legitimate.
  PDF: https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.4-en.pdf
- **"Swiss QR-bill — Technical information about the QR-IID and QR-IBAN"**,
  Version 1.1, with effect from 29 February 2020 (referred to below as the
  "QR-IID/QR-IBAN doc").
  PDF: https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/qr-iid-iban-en.pdf
- Landing page for all current downloads: https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/qr-bill.html
- IBAN format overview: https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/iban.html

**Verification date for every requirement below is 2026-09-11**, verified
live against the PDFs at the URLs above (fetched and converted to text with
`pdftotext -layout`, not summarized secondhand) unless a requirement entry
explicitly says otherwise. Where I could not obtain 100% certainty that no
newer version/erratum exists beyond v2.4, this is flagged explicitly in
that requirement's Notes.

**Before any production implementation ships:** CONTINUO's QR-bill generator
and validator must be checked against SIX's own validation tooling (the
QR-IBAN online checker and any SIX-provided test suite / reference
implementation referenced from the Download Centre at
six-group.com/en/products-services/banking-services/payment-standardization.html)
and, per switzerland.md's governance rule, reviewed by a qualified advisor
before it touches real customer payments. This document is not a
substitute for that review.

---

## 1. Governing version and effective dates

### 1.1 Current spec version

- **Requirement:** QR-bills issued today must conform to "Swiss
  Implementation Guidelines for the QR-bill" **Version 2.3**.
- **Source:** SIX Interbank Clearing Ltd, "Swiss Implementation Guidelines
  for the QR-bill", cover page and "Change control" section.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** Version 2.3, valid from 21 November
  2025 (published 20 November 2023). "This document ... Version 2.3 from
  21 November 2025, entirely replaces the previous Version 2.2 from 22
  February 2021 and the previous Version 2.1 from 30 September 2019."
- **Verification date:** 2026-09-11 — verified by reading the cover page and
  Change control section of the live PDF. High confidence this is the
  currently governing document (today's date, 2026-09-11, falls after its
  21 Nov 2025 effective date and before v2.4's 14 Nov 2026 effective date).
- **Implementation:** The `QrBill` data model must carry an explicit spec
  version identifier (the "Version" QR element, fixed `"0200"` for the 2.x
  master version family — see §2) so historical bills remain reproducible
  even after CONTINUO upgrades to target v2.4. Do not hardcode field lengths,
  currency rules, or reference-pairing rules as if they never change; keep
  them in a versioned rule table keyed by spec version.
- **Notes:** SIX's release cadence (documented in the v2.3 "General notes"
  section) is: change requests collected until June each year, public
  consultation Nov–Dec, guidelines published the following February,
  introduced in November at the earliest. This means a new version can
  realistically land roughly every 12 months; CONTINUO's rule table should be
  designed for that cadence rather than as a one-off.

### 1.2 Next spec version (not yet in force)

- **Requirement:** From 14 November 2026, "Version 2.4" becomes the current
  spec. CONTINUO should plan the CHF/EUR reference-pairing change (§4.5) ahead
  of that date.
- **Source:** SIX Interbank Clearing Ltd, "Swiss Implementation Guidelines
  for the QR-bill", Version 2.4 cover page and "Change control" section.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.4-en.pdf
- **Effective date / spec version:** Version 2.4, valid from 14 November
  2026 (published 24 February 2026).
- **Verification date:** 2026-09-11 — verified by reading the cover page,
  revision history, and body text of the live v2.4 PDF directly (not a
  secondary summary).
- **Implementation:** Do not implement v2.4 rules as the default today —
  v2.3 is what real Swiss banks will validate against until v2.4's
  effective date. Implement v2.4 support behind the same version table
  described in §1.1, and gate its activation on the bill's issue date
  being on/after 2026-11-14 (with a manual override, since SIX explicitly
  keeps v2.3 valid in parallel until November 2027).
- **Notes:** I could not find any SIX publication superseding v2.4 as of
  the verification date, but given SIX's release cadence a v2.5 public
  consultation could already be underway (typically Nov–Dec) without a
  published guideline yet. Re-check six-group.com's QR-bill download page
  before this document's assumptions age out.

### 1.3 Historical milestones — full replacement of red/orange payment slips

- **Requirement:** Document, for compliance narrative purposes, when the
  QR-bill went live and when it became the *only* valid payment-slip format
  in Switzerland (i.e. when the old red "ES" / orange "BESR" payment slips
  stopped being accepted).
- **Source:** SIX Group QR-bill product page; SIX "Swiss QR-bill —
  Technical information about the QR-IID and QR-IBAN" v1.1, §2.9.
- **Source URL:** https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/qr-bill.html ;
  https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/qr-iid-iban-en.pdf
- **Effective date / spec version:** QR-bill went live for production use
  **30 June 2020** (the QR-IID/QR-IBAN doc states QR-IIDs "may only be used
  productively when the QR-bill is launched on June 30, 2020"; SIX's own
  product page separately states the QR-bill "has been in circulation since
  June 2020"). The QR-bill **definitively replaced** the old red/orange
  payment slips on **1 October 2022**.
- **Verification date:** 2026-09-11. The 30 June 2020 date is a direct quote
  from the primary QR-IID/QR-IBAN PDF (high confidence). The 1 October 2022
  final-replacement date came from SIX's product landing page via a
  web-search-engine summary rather than a passage I directly read in a
  downloaded PDF — **flagged as not independently re-verified against a
  primary PDF paragraph**; it matches widely reported public information
  but should be spot-checked against SIX's own FAQ page
  (six-group.com/.../downloads-faq/faq.html) before being asserted in
  customer-facing compliance copy.
- **Implementation:** Not directly enforced in code, but useful for
  onboarding/migration messaging (e.g. rejecting attempts to import legacy
  ISR/BESR reference data as if it were still a live payment channel).
- **Notes:** None beyond the flag above.

---

## 2. Swiss QR Code payload — data structure and encoding

### 2.1 Character set

- **Requirement:** The QR-bill payload (and the printed payment part) may
  only use a specific restricted subset of Unicode, UTF-8 encoded.
- **Source:** IG QR-bill v2.3, §4.1.1 "Character set".
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3 (unchanged going into v2.4 aside
  from adding Romansh-language *headings*, not payload characters, from
  1 January 2026).
- **Verification date:** 2026-09-11, verified directly against §4.1.1 text.
- **Implementation:** The permitted set is:
  - Basic Latin, U+0020–U+007E
  - Latin-1 Supplement, U+00A0–U+00FF
  - Latin Extended-A, U+0100–U+017F
  - Plus four Romanian-style comma-below letters explicitly added by name:
    Ș U+0218, ș U+0219, Ț U+021A, ț U+021B
  - Plus € (EURO SIGN), U+20AC

  The validator must reject/strip any code point outside this union before
  encoding the payload, and must reject non-UTF-8 input at the boundary.
  This is stricter than "printable Unicode" — e.g. most CJK, Cyrillic,
  Greek, emoji, and even some Latin Extended-B characters are **not**
  permitted.
- **Notes:** This is the character set for the *Swiss QR Code payload*.
  Do not conflate it with what fonts can render on the printed payment part
  (§5) — the mandated fonts are a separate, purely typographic constraint.

### 2.2 Field-class character restrictions

- **Requirement:** Within the general character set above, individual
  fields are further restricted to `numeric`, `alphanumeric`, or `decimal`
  character classes.
- **Source:** IG QR-bill v2.3, §4.1.2 "Permitted characters in the field
  definitions", Table 6.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:** Encode per-field validators as:
  - `general` → the full character set from §2.1
  - `numeric` → `0-9` only
  - `alphanumeric` → `A-Z a-z 0-9` only
  - `decimal` → `0-9` plus `.` as the sole decimal separator
- **Notes:** None.

### 2.3 Field lengths and empty-field rule

- **Requirement:** Field lengths given in the spec are maximums, and fields
  must never be padded with blanks/spaces up to that maximum.
- **Source:** IG QR-bill v2.3, §4.1.3 "Field lengths".
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:** Trim, don't pad; length checks are "at most N", not
  "exactly N", except where the spec explicitly says "fixed length" (e.g.
  `QRType`, `Version`, `Coding`, `Trailer`, address-type code).
- **Notes:** None.

### 2.4 Line separator convention

- **Requirement:** Payload elements are separated by a line break; the same
  line-break style must be used consistently throughout one payload, and
  the final element carries no trailing separator.
- **Source:** IG QR-bill v2.3, §4.1.4 "Separator element".
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:**
  - Permitted separators: `CR+LF` or `LF` alone — pick one and use it for
    the entire payload; do not mix.
  - Every data element must be present (i.e. every separator position
    exists), even if the element's content is empty — emit an empty line,
    not a skipped line.
  - **Exception:** elements with status "A" (Additional/conditional — see
    §2.5) are omitted entirely, with no separator, if unused *and* no
    later element in the payload needs to be delivered after it.
  - The separator after the very last element is omitted (no trailing
    newline).
- **Implementation detail — `AltPmtInf`/`AltPmt` (Alternative procedures)
  is the field this "A" status/omission rule applies to** in the current
  data structure (see §2.6); it is the only optional trailing block.
- **Notes:** This is a common source of interop bugs — a generator that
  always emits a trailing separator, or that omits an empty-but-required
  field's line entirely, will produce a payload that fails bank-side
  parsing even though it "looks" plausible.

### 2.5 Field status codes

- **Requirement:** Every field in the payload carries a status: Mandatory
  (M), Dependent (D), Additional/conditional (B in the printed table
  header but described as "Additional" — see Notes on a table-rendering
  quirk below), Optional (O), or Do-not-fill (X).
- **Source:** IG QR-bill v2.3, §4.2.1, Table 7 "Valid Status values for
  elements".
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:**
  - `M` Mandatory — must always be delivered filled.
  - `D` Dependent — must be filled if its parent/superordinate data group
    is used (e.g. postal code/town/country once the creditor address
    group is present, which it always is, since `CdtrInf` is itself
    Mandatory).
  - Status labelled "Additional" in the table (rendered as `A` in the
    Table 8 data-element listing, e.g. on `StrdBkgInf`/Billing information
    and on `AltPmt`/Alternative procedures) — field may be delivered but
    is not required; **when omitted, no separator/placeholder line is
    emitted at all** (distinct from `O`/`X`, which still occupy a line).
  - `O` Optional — may be delivered, may be empty, but the line is still
    present.
  - `X` Do-not-fill — must never contain content but the field separator
    must still be emitted (currently applies to the entire `UltmtCdtr`
    ["Ultimate Creditor"] group — see §2.6).
- **Notes:** The PDF's own table-column extraction is visually confusing
  (`pdftotext` renders this particular table with a shifted status-column
  layout). I cross-checked the resulting status assignments against the
  worked examples in Annex A (six full sample payloads) to confirm which
  fields are actually mandatory vs. conditionally emitted; the mapping
  above matches all six examples. Still worth a manual visual check of
  Table 7/Table 8 in the PDF before treating an edge-case field's status as
  certain.

### 2.6 Full data element list, in order

- **Requirement:** The payload is a fixed, ordered sequence of elements
  organized into data groups. Table 8 of the spec is authoritative.
- **Source:** IG QR-bill v2.3, §4.2.2 "Data elements in the QR-bill",
  Table 8.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3. (v2.4 keeps the same element set
  and order; the only elements changed are currency/reference-pairing
  *rules*, covered in §4.5, not the structure itself. v2.4 also renames the
  document's own terminology from "field" to "line" for these — a
  documentation wording change only, not a schema change.)
- **Verification date:** 2026-09-11, transcribed directly from the live PDF
  text (not paraphrased from a third party).
- **Implementation:** The ordered element list (data group in **bold**,
  status in brackets, field-definition summary after the dash):

  1. **Header** [M, mandatory group]
     - `QRType` [M] — fixed value `"SPC"` (Swiss Payments Code), 3-char
       fixed-length alphanumeric.
     - `Version` [M] — fixed value `"0200"` for the 2.x master version
       family, 4-digit fixed-length numeric. (First 2 digits = major
       version, last 2 = sub-version; SIX states only `"0200"` is
       permitted for master version 02 — sub-versions only become
       representable from master version 03 onward.)
     - `Coding` [M] — fixed value `1` (UTF-8 restricted to the Latin
       character set per §2.1), 1-digit fixed-length numeric.
  2. **CdtrInf** (Creditor information) [M, mandatory group]
     - `IBAN` [M] — 21 fixed-length alphanumeric characters, no spaces,
       **only IBANs with CH or LI country code are permitted** — this
       applies even if the creditor's postal address is outside
       Switzerland/Liechtenstein (see the worked example with an LI
       address and CH IBAN, and the example with a CH creditor and a
       German ultimate debtor — creditor address country and creditor
       account country are independent).
     - **Cdtr** (Creditor) [M, mandatory group]
       - `AdrTp` [M] — address type code, 1-digit alphanumeric, fixed
         value `"S"` (structured) — see §3.
       - `Name` [M] — max 70 chars; must match the account holder's name
         on record for the credited account. May be truncated for
         display (not for payload) if too long, onto max two printed
         lines.
       - `StrtNmOrAdrLine1` [O] — Street, max 70 chars.
       - `BldgNbOrAdrLine2` [O] — Building number, max 16 chars.
       - `PstCd` [D] — Postal code, max 16 chars, must not include a
         country prefix.
       - `TwnNm` [D] — Town, max 35 chars.
       - `Ctry` [M] — Country, ISO 3166-1 alpha-2, 2 chars.
  3. **UltmtCdtr** (Ultimate Creditor — "In favour of") [X, must not be
     filled — reserved for future use]
     - `AdrTp`, `Name`, `StrtNmOrAdrLine1`, `BldgNbOrAdrLine2`, `PstCd`,
       `TwnNm`, `Ctry` — all present structurally but **must all be
       empty**; the group's separators are still emitted.
  4. **CcyAmt** (Payment amount information) [M, mandatory group]
     - `Amt` [O] — Amount, decimal, no leading zeros, always with a
       decimal point and up to 2 decimal places, max 12 digits including
       the separator. Range 0.01–999,999,999.99. May be empty (blank
       amount field on the printed part, filled in by hand).
     - `Ccy` [M] — Currency, ISO 4217 3-letter code. Only `CHF` and `EUR`
       permitted (see §6).
  5. **UltmtDbtr** (Ultimate Debtor — "Payable by") [O, optional group]
     - `AdrTp` [D] — fixed `"S"` when the group is used.
     - `Name` [D] — max 70 chars.
     - `StrtNmOrAdrLine1` [O] — max 70 chars.
     - `BldgNbOrAdrLine2` [O] — max 16 chars.
     - `PstCd` [D] — max 16 chars, no country prefix.
     - `TwnNm` [D] — max 35 chars.
     - `Ctry` [D] — ISO 3166-1 alpha-2.
  6. **RmtInf** (Payment reference) [M, mandatory group]
     - `Tp` [M] — Reference type, max 4-char alphanumeric, one of `QRR`
       (QR reference), `SCOR` (Creditor Reference / ISO 11649), `NON`
       (no reference).
     - `Ref` [D] — the reference value itself. See §4 for the exact
       structure/checksum per type. Must be empty when `Tp = NON`.
     - **AddInf** (Additional information)
       - `Ustrd` [O] — Unstructured message, max 140 chars.
       - `Trailer` [M] — fixed value `"EPD"` (End Payment Data), 3-char
         fixed-length alphanumeric.
       - `StrdBkgInf` [status "Additional"/conditional — omit entirely,
         no line, if unused] — Billing information, max 140 chars.
         `Ustrd` + `StrdBkgInf` together must not exceed 140 characters
         combined. Not part of SIX's own standardization (third-party
         coding schemes, e.g. Swico, must be pre-registered with SIX —
         see Annex D of the spec). Must not contain personal data unless
         it is also printed on the payment part.
  7. **AltPmtInf** (Alternative procedures) [O, optional group, variable
     cardinality]
     - `AltPmt` [status "Additional"/conditional, up to **2 occurrences
       maximum**] — max 100 alphanumeric chars each. Freeform,
       provider-defined syntax (e.g. eBill), not part of SIX
       standardization itself.

  Table 8's "Data structure" column also visually nests each element
  under its data group using `+`/`++`/`+++` prefixes (e.g.
  `QRCH+CdtrInf++IBAN`) — useful directly as a dotted-path convention for
  the `QrBill` model's internal field names, since it matches SIX's own
  terminology and will make future spec-diffing easier.
- **Notes:** `pdftotext -layout` badly mangles this particular table's
  column alignment (fields and their "Field definition" text visually
  drift out of row-sync across page breaks). I reconstructed the mapping
  above by cross-referencing every field against all six worked examples
  in Annex A, which check out consistently, but this table is worth a
  direct visual read of the PDF (pages 33–38 of v2.3) before treating any
  single max-length number here as gospel, especially for `Street` and
  `BldgNbOrAdrLine2` — the v2.4 PDF's text extraction showed a possible
  discrepancy in the building-number max length (16 vs. 35) that I could
  not resolve with confidence from the extracted text alone; v2.3's
  reading (16 chars for building number) is the one used above since it
  extracted cleanly and no v2.4 revision-history entry claims a
  field-length change.

### 2.7 QR Code symbol parameters

- **Requirement:** The Swiss QR Code must be generated with a specific
  error-correction level, version/module count ceiling, minimum module
  size, and fixed print dimensions.
- **Source:** IG QR-bill v2.3, Chapter 6 "Parameters for generating the
  Swiss QR Codes".
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:**
  - Error correction level: **M** (~15% redundancy). Mandatory, not
    configurable.
  - Max encodable payload: **997 characters** including all element
    separators. At level M with binary coding this tops out at **QR Code
    version 25 (117×117 modules)** per ISO 18004 — the generator must
    reject/flag payloads that would exceed this.
  - Always generate at the **smallest QR version the data actually
    needs**, then scale — never force version 25.
  - Minimum printed module size: **0.4 mm**.
  - Fixed print size: **46 × 46 mm**, regardless of which QR version was
    actually generated (i.e. always scale the vector output to exactly
    this size — do not let a smaller-data bill print smaller).
  - Quiet zone: **≥ 4 modules** per ISO 18004 (≈ ≥1.6 mm), but the SIX
    design guideline widens this to **5 mm** around the QR section on the
    printed payment part (see §5).
  - A black-and-white Swiss-cross recognition logo, 7 × 7 mm, is overlaid
    in the center — SIX provides the reference artwork file via the
    Download Centre; do not regenerate this logo from scratch.
- **Notes:** None — this section was clean, unambiguous primary text.

---

## 3. Structured addresses (mandatory)

- **Requirement:** Creditor and, when present, Ultimate Debtor addresses
  must be delivered as **structured** addresses only (`AdrTp = "S"`) —
  street, building number, postal code, town, and country as discrete
  fields. There is no "combined"/free-text address option in the current
  or upcoming spec.
- **Source:** IG QR-bill v2.3 §4.2.2 (Table 8, `AdrTp` field definition:
  *"The address type is specified using a code. The following code is
  defined: 'S' — structured address"* — no other code is defined) and
  §4.3.1 "Use of address information" (*"The address of the parties
  involved ... can only be delivered in a structured way"*); confirmed
  unchanged and reinforced in IG QR-bill v2.4 §4.3.1 (identical wording)
  and v2.4's Table 8, where `PstCd`/`TwnNm` are annotated `D*` with a
  footnote: *"Due to the obligation to provide a structured address, the
  element must always be supplied."*
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf ;
  https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.4-en.pdf
- **Effective date / spec version:** Structured-address-only has been the
  **only valid option for the entire life of production QR-bill traffic**.
  The revision history of both v2.3 and v2.4 attributes *"Removal of the
  option for combined address fields in chapter 4.2.2"* to the "2.1" block
  of the revision-history table, whose associated date is **30 September
  2019** — i.e. before QR-bill's own production go-live on 30 June 2020
  (§1.3). In other words, the combined/free-text address option that
  existed only in the original v2.0 draft (15 November 2018) was removed
  from the guidelines before the QR-bill ever went live, so **no
  production QR-bill has ever legitimately used a non-structured
  address.**
- **Verification date:** 2026-09-11. **Flagged as a reconstruction, not a
  verbatim date I could cleanly read**: the revision-history table in both
  PDFs renders with garbled row/date alignment under `pdftotext -layout`
  (multiple version numbers and change-bullets appear to share overlapping
  table rows). I'm confident in the *substance* (structured-only, and that
  it predates go-live) because both the "removal of combined address"
  bullet and the "30.09.2019" date consistently appear in the same
  document block across both the v2.3 and v2.4 PDFs, and because the
  Change Control section of v2.3 independently confirms "30 September
  2019" as v2.1's publication date. But I could not 100% rule out that the
  address-field change actually shipped in a different point release than
  the date I've attributed it to. Recommend a manual look at page 2–3
  (Table 1, Revision history) of either PDF before citing this date
  externally.
- **Implementation:**
  - The `QrBill` model must not offer a "single address line" or
    "combined address" input mode for the creditor or ultimate debtor —
    only discrete street / building-number / postal-code / town / country
    fields.
  - `PstCd`, `TwnNm`, `Ctry` are effectively always required once the
    address group is present (creditor group is always present; ultimate
    debtor group is optional but if used, same rule applies).
  - `Street`/`BldgNbOrAdrLine2` remain formally Optional per the field
    table, but a P.O.-box-only or building-name-only address without a
    street is realistically rare for a creditor — validate for
    completeness, not just for the bare minimum the schema technically
    allows, because incomplete addresses can cause counter-payment
    rejection (see the v2.3 footnote on the building-number tolerance
    below).
  - Do **not** silently split a free-text address string the user pastes
    in from CRM contact data into street/building-number without giving
    the user a chance to review the split — SIX explicitly warns (v2.3
    footnote 2) that putting the building number into the street-line
    field is tolerated for payload validation but risky for
    counter-payment processing, since "this data must be fully available
    and recognisable to the system when the cash is deposited at the
    counter, otherwise processing of the QR-bill may be rejected."
  - c/o addresses and P.O. Box notes are explicitly **not** part of the
    structured payer/payee address for the payment part — they belong on
    the invoice document itself (e.g. invoice header), not in the
    `QrBill` address fields.
- **Notes:** This is one of the most consequential rules for the data
  model: CONTINUO's CRM contact/company address fields must map cleanly to
  street + building number + postal code + town + country before a QR-bill
  can be generated — if CRM stores addresses as free text, the QR-bill
  generator needs either a structured-address requirement on the
  originating contact record, or a mandatory address-parsing/confirmation
  step before bill generation.

---

## 4. Reference number types

### 4.1 QR reference (paired only with QR-IBAN)

- **Requirement:** A 26-digit reference plus 1 Modulo-10-recursive check
  digit (27 digits total), numeric only, never all zeros, usable **only**
  in combination with a QR-IBAN account.
- **Source:** IG QR-bill v2.3 §2.12.1 and §4.3.2; Table 8 `Ref` field
  definition.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3. (v2.4 restricts this further —
  see §4.5.)
- **Verification date:** 2026-09-11.
- **Implementation:**
  - Reference type code in the payload: `QRR`.
  - Structure: exactly 27 numeric characters. First 26 are the reference
    body (invoice-issuer-assigned, must not be all zeros); the 27th is a
    Modulo 10 recursive check digit (algorithm below).
  - Display formatting on the printed payment part/receipt: grouped in
    blocks of 5, starting with a leading 2-character group, then 5 groups
    of 5 (`XX XXXXX XXXXX XXXXX XXXXX XXXXX`).
  - Validation must reject: wrong length, non-numeric characters, an
    all-zero 26-digit body, and an incorrect check digit.
  - Pairing rule (also enforced at the account level, §7): `QRR` must only
    be used when the creditor account (`CdtrInf/IBAN`) is a QR-IBAN; using
    `QRR` with a normal IBAN is invalid, and vice versa.
- **Notes:** See §4.4 for the Modulo 10 recursive algorithm and §4.5 for
  the upcoming v2.4 currency restriction.

### 4.2 Creditor Reference / SCOR (ISO 11649, paired with a normal IBAN)

- **Requirement:** 5–25 alphanumeric characters, starting with `RF`
  followed by 2 check digits, remainder is the reference body; check digit
  computed with Modulo 97-10. Usable only with a normal (non-QR) IBAN.
- **Source:** IG QR-bill v2.3 §2.12.2 and §4.3.2.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3. (Remains valid for both CHF and
  EUR under v2.4 — see §4.5.)
- **Verification date:** 2026-09-11.
- **Implementation:**
  - Reference type code in the payload: `SCOR`.
  - Structure: `RF` + 2 check digits + up to 21 further alphanumeric
    characters (total field length 5–25 chars). This is the general ISO
    11649 Creditor Reference, itself built on the generic **ISO 7064 MOD
    97-10** checksum (the same checksum family used for IBAN itself, per
    ISO 13616 — see §7.2): to validate, move the leading 4 characters
    (`RF` + 2 check digits) to the end of the string, convert any letters
    to numbers (A=10 … Z=35), and confirm the resulting numeral mod 97
    equals 1.
  - Display formatting on the printed payment part/receipt: grouped in
    blocks of 4 characters.
  - Banks do not distinguish upper/lower case when processing (per the
    spec's own comment) — normalize to uppercase before validating/storing.
  - Pairing rule: `SCOR` must only be used when the creditor account is a
    normal (non-QR) IBAN.
- **Notes:** ISO 11649 itself is a paid ISO standard; SIX's spec references
  it by name and gives the check-digit method (mod 97-10) and structural
  rule (`RF` + 2 digits + body) but does not reproduce the full ISO text —
  neither does this document, consistent with the project's copyright
  rules. The mod-97-10 procedure above is the standard, publicly
  documented ISO/IEC 7064 method and is not SIX-proprietary.

### 4.3 No reference / unstructured only

- **Requirement:** `NON` reference type — the `Ref` field must not be
  filled at all — used only with a normal IBAN; payment purpose, if any,
  travels only in the `Ustrd` (Unstructured message) field.
- **Source:** IG QR-bill v2.3, Table 8 (`Tp`/`Ref` field definitions) and
  §7.1 "Checking the field contents".
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:** When `Tp = NON`, reject any payload where `Ref` is
  non-empty. `NON` is only valid with a normal IBAN, same as `SCOR`.
- **Notes:** None.

### 4.4 Modulo 10 recursive check digit (for the QR reference)

- **Requirement:** The QR reference's 27th digit is computed with the
  "Modulo 10 recursive" carry-propagation algorithm defined in Annex B of
  the spec.
- **Source:** IG QR-bill v2.3, Annex B "Check digit generation by Modulo 10
  recursive" (Figure 21 carry table, Figure 22 worked example).
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3, unchanged in v2.4 (still
  Annex B, same algorithm — v2.4 only renamed some field labels).
- **Verification date:** 2026-09-11 — **important caveat**: the actual
  carry table (Figure 21) is rendered as an *image* in the PDF and did not
  extract as text via `pdftotext`. The table below is the standard,
  widely-published "Modulo 10, recursive" carry table used across the
  Swiss payment ecosystem (also used for the legacy ISR/ESR reference
  number), reconstructed from general knowledge of this well-known
  algorithm — **not OCR'd directly from Figure 21**. I numerically
  verified it against the spec's own worked example (Annex B, Figure 22:
  input digits `21 00000 00003 13947 14300 0901` → published check digit
  `7`) by hand-computing the full 26-step carry sequence, and it produces
  the exact check digit `7` published in the spec. This gives high
  confidence the table is correct, but since it wasn't machine-extracted
  from the primary image, a visual diff against page 61 of the PDF before
  shipping is still recommended.
- **Implementation:**
  1. Start with `carry = 0`.
  2. For each of the 26 digits of the reference body, left to right, look
     up `next_carry = TABLE[carry][digit]` using the table below (rows =
     current carry 0–9, columns = digit 0–9):

     ```
     carry\digit  0  1  2  3  4  5  6  7  8  9
     0            0  9  4  6  8  2  7  1  3  5
     1            9  4  6  8  2  7  1  3  5  0
     2            4  6  8  2  7  1  3  5  0  9
     3            6  8  2  7  1  3  5  0  9  4
     4            8  2  7  1  3  5  0  9  4  6
     5            2  7  1  3  5  0  9  4  6  8
     6            7  1  3  5  0  9  4  6  8  2
     7            1  3  5  0  9  4  6  8  2  7
     8            3  5  0  9  4  6  8  2  7  1
     9            5  0  9  4  6  8  2  7  1  3
     ```

  3. After processing all 26 digits, the check digit is
     `(10 - final_carry) mod 10`.
  4. Append the check digit as the 27th (final) digit.
- **Notes:** See the verification-date caveat above — treat this as
  verified-by-reconstruction, not verified-by-direct-extraction, and
  cross-check visually before relying on it in a shipped validator that
  handles real payment references.

### 4.5 Reference/account/currency pairing rules — including the upcoming v2.4 change

- **Requirement:** The reference type must match the creditor account
  type, and — starting with v2.4 — the reference type also constrains
  which *currency* the bill may be issued in.
- **Source:** IG QR-bill v2.3 §7.1 "Checking the field contents"
  (*"permitted combinations of account with reference type (IBAN only with
  'SCOR' ... or 'NON' ...; QR-IBAN with 'QRR' ...) must be used"*); IG
  QR-bill v2.4 §1 "Change control" (*"Version 2.4 does not result in any
  technical adjustments for invoicing in Swiss francs (CHF). For invoicing
  in euros (EUR), only the combination IBAN/SCOR reference and IBAN/
  unstructured message is possible."*), §2.10 (*QR-IBAN "can only be used
  for invoicing and payments in CHF"*), §2.12.1 (QR reference *"can only be
  used for invoicing in CHF"*), §2.12.2 (Creditor Reference *"can only be
  used with an IBAN and for invoicing in CHF and EUR"*), and §4.3.2.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf ;
  https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.4-en.pdf
- **Effective date / spec version:** v2.3 rule (account-type pairing only,
  no currency restriction on the pairing itself) is in force now. v2.4's
  added currency restriction takes effect 14 November 2026.
- **Verification date:** 2026-09-11, both quotes read directly from the
  live v2.3 and v2.4 PDF text.
- **Implementation:** Build the validator as a small combination table,
  versioned per §1.1:

  | Spec version | Creditor account | Reference type | Currency allowed |
  |---|---|---|---|
  | v2.3 (now) | QR-IBAN | `QRR` | CHF or EUR |
  | v2.3 (now) | Normal IBAN (CH/LI) | `SCOR` | CHF or EUR |
  | v2.3 (now) | Normal IBAN (CH/LI) | `NON` | CHF or EUR |
  | v2.3 (now) | QR-IBAN | `SCOR` or `NON` | **invalid** (always) |
  | v2.3 (now) | Normal IBAN | `QRR` | **invalid** (always) |
  | v2.4 (from 2026-11-14) | QR-IBAN | `QRR` | **CHF only** |
  | v2.4 (from 2026-11-14) | Normal IBAN (CH/LI) | `SCOR` | CHF or EUR |
  | v2.4 (from 2026-11-14) | Normal IBAN (CH/LI) | `NON` | CHF or EUR |

  In other words: **from v2.4, an EUR-denominated QR-bill can never use a
  QR-IBAN or a QR reference** — EUR bills must use a normal IBAN with
  either `SCOR` or `NON`. This is a materially breaking change for any
  Swiss issuer currently billing EUR customers via QR-IBAN/QRR and must be
  called out to CONTINUO users during the v2.4 migration, not just silently
  enforced.
- **Notes:** v2.4 also documents that EUR settlement is changing
  infrastructurally: *"For invoicing in euros (EUR), settlement will take
  place after the discontinuation of euroSIC in accordance with the bank's
  offer, for example as a SEPA Credit Transfer."* (v2.4 §1.1). This is
  background context (bank-side clearing mechanics), not something CONTINUO's
  `QrBill` payload needs to encode directly, but it explains *why* the EUR
  restriction exists and is worth keeping in mind if CONTINUO ever needs to
  advise users on EUR invoicing more broadly.

---

## 5. Layout requirements — payment part and receipt

### 5.1 Physical dimensions

- **Requirement:** Fixed physical dimensions for the payment part and
  receipt, and their combined size.
- **Source:** IG QR-bill v2.3 §2.2 and §3.3.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:**
  - Receipt: **62 × 105 mm**, positioned to the **left** of the payment
    part (always, regardless of paper vs. PDF, integrated vs. enclosure).
  - Payment part: DIN-A6 landscape, **148 × 105 mm**.
  - Combined: **210 × 105 mm** (= DIN Long, i.e. the width of A4 by a
    third of its height) — this combined strip must sit at the **bottom
    edge** of the page/document, or there must be a perforation exactly
    where that edge would be.
  - Within the payment part, 5 mm minimum unprinted margins separate the
    Title / QR code / Amount / Information / Further-information sections
    (darker-shaded gaps in the spec's schematic figure) — these margins
    must never carry printed content.
- **Notes:** None.

### 5.2 Required sections and their content, in order

- **Requirement:** The payment part has five sections (Title, Swiss QR
  Code, Amount, Information, Further information); the receipt has four
  (Title, Information, Amount, Acceptance point). Only the specified
  headings/content may appear; no advertising, no reverse-side printing.
- **Source:** IG QR-bill v2.3 §3.5 and §3.6.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:**
  - Title sections: literal text **"Payment part"** and **"Receipt"**
    (translated per correspondence language — German/French/Italian/
    English, with Romansh headings added from 1 January 2026 per v2.4),
    11 pt bold.
  - Information-section headings (mandatory wording, must not be
    reworded, listed in Annex D's multilingual glossary): "Account /
    Payable to", "Reference", "Additional information" (payment part
    only — **must not be printed on the receipt**), "Payable by" /
    "Payable by (name/address)".
  - Amount section: currency code (`CHF`/`EUR`) to the left of the amount
    — see §6.
  - Acceptance point (receipt only): text "Acceptance point", right-aligned.
  - Further information section (payment part only): up to 2 Alternative
    procedure lines, 7 pt, name of the procedure in bold.
  - **The receipt never carries the "Additional information" field**, and
    is otherwise a same-content-different-density restatement of the
    creditor/reference/debtor data.
  - If a QR-bill has no amount and/or no debtor pre-filled, the printed
    part must instead show a hand-writable blank box with a 0.75 pt black
    border:
    - Blank amount box: **40 × 15 mm** on the payment part, **30 × 10 mm**
      on the receipt.
    - Blank "Payable by" box: **≥ 65 × 25 mm** on the payment part,
      **≥ 52 × 20 mm** on the receipt.
- **Notes:** None.

### 5.3 Fonts and paper

- **Requirement:** Restricted font family list, size rules, weight rules,
  and paper stock requirements.
- **Source:** IG QR-bill v2.3 §3.3 and §3.4.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:**
  - Fonts: only **Arial, Frutiger, Helvetica, or Liberation Sans**, in
    black, no italics, no underline.
  - Payment part: heading font 6–10 pt (recommended 8 pt, bold), values
    2 pt larger than their heading (recommended 10 pt). Title "Payment
    part" is the sole exception at 11 pt bold.
  - Receipt: headings 6 pt bold, values 8 pt. Title "Receipt" at 11 pt bold.
  - Alternative procedures line: 7 pt, procedure name in bold.
  - Ultimate Creditor field: not used today (§2.6, status X) but if ever
    activated, 7 pt with bold designation — do not build this into CONTINUO's
    current generator; it's explicitly future/reserved.
  - Paper (physical output only): white, perforated, 80–100 g/m², FSC/TCF/
    recycled stock permitted, **not** coated or reflective.
- **Notes:** For a PDF-only digital delivery path this section mostly
  constrains the rendering engine's font embedding and paper-stock
  guidance is moot — but the font-family and size rules still apply to the
  rendered PDF per §5.4 below.

### 5.4 Perforation / separation and PDF-specific rules

- **Requirement:** A perforation (paper) or explicit visual separation cue
  (PDF) must mark where the payment part and receipt are meant to be
  physically separated, in every delivery mode.
- **Source:** IG QR-bill v2.3 §3.1 and §3.7 "Notes about the QR-bill in
  PDF format".
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:**
  - Paper, integrated into the invoice: perforation required both between
    the invoice body and the payment-part/receipt strip, and between the
    receipt and the payment part.
  - Paper, separate enclosure: perforation still required between receipt
    and payment part.
  - PDF: the A6 boundary and the receipt/payment-part boundary must be
    marked with lines, each bearing either a scissors symbol or the
    instruction "Separate before paying in" printed above the line
    (outside the payment part). A PDF QR-bill is explicitly **only**
    suitable for e-banking/mobile-banking payment, **not** for
    counter/paper-based payment as-is — the debtor is expected to print
    and physically separate it first if they intend to pay at a post
    office counter or mail a paper order.
- **Notes:** CONTINUO's PDF export must never omit the scissors/"separate
  before paying in" marker on the assumption that "it's just a PDF" — the
  spec treats this as mandatory regardless of delivery channel once a
  print/physical-payment path is possible.

### 5.5 Online-only display (no physical printing)

- **Requirement:** When the QR-bill payment part is shown purely inside an
  online checkout/portal flow (not downloaded as a printable document), a
  reduced but still-defined set of rules applies.
- **Source:** IG QR-bill v2.3 §3.8 "Layout rules for the online use of the
  QR-bill".
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** Chapter 3.8 itself, and the related
  change to §4.3.3's Billing-information print rule, took effect early —
  **1 January 2024** — ahead of the rest of v2.3 (21 November 2025), per
  the spec's own "General notes": *"As early as 1 January 2024, the new
  chapter 3.8 ... and changes to chapter 4.3.3 regarding the printing of
  information from the 'Billing information' field will come into force.
  These changes, which come into effect early, do not involve any
  technical adjustments."*
- **Verification date:** 2026-09-11.
- **Implementation:**
  - The receipt may be omitted from an online display; only the payment
    part (§3.5 data) is required.
  - The customer must always additionally be offered the full QR-bill
    (with receipt) for counter/order-based payment — an online-only
    partial view can't be the sole artifact ever produced for a given
    invoice.
  - If device resolution can't show the full payment part, all the
    information that would be visible on it must still be surfaced some
    other way (e.g. responsive layout, not truncation).
  - The payer must be explicitly told that an online-only payment part
    (no receipt) is only valid for online/mobile banking or software/ERP
    payment channels — not for counter payment.
  - If a user prints an online-only payment part themselves and it
    doesn't meet the §5.1 dimensions, it can be rejected by the bank or
    incur extra processing cost — this is on the payer, but CONTINUO's UI
    copy should set that expectation.
- **Implementation — Billing-information print rule (also 1 Jan 2024):**
  the "Billing information" field does **not** need to be printed on the
  payment part in general, **except** it becomes mandatory to print
  whenever the field contains personal data under applicable data
  protection law — the generator needs a way to flag a given
  Billing-information payload as containing personal data and force
  print-inclusion in that case.
- **Notes:** None.

---

## 6. Currencies and amount format

- **Requirement:** Only CHF and EUR are supported; amount range and format
  are fixed.
- **Source:** IG QR-bill v2.3 §3.5.3/§3.6.3 (Amount sections) and Table 8
  (`Ccy`/`Amt` field definitions).
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3. Confirmed **unchanged** in v2.4
  (v2.4's own change-control text: *"Version 2.4 does not result in any
  technical adjustments for invoicing in Swiss francs (CHF)"* — and no
  revision-history entry in either version adds or removes a supported
  currency; only the reference-pairing rules for EUR change, §4.5).
- **Verification date:** 2026-09-11, confirmed in both the v2.3 and v2.4
  PDFs directly.
- **Implementation:**
  - Currency: exactly `CHF` or `EUR` (ISO 4217), nothing else — validator
    should hard-reject any other code, not just warn.
  - Amount range: **0.01 to 999,999,999.99** inclusive, when an amount is
    specified. Amount may be omitted entirely (open amount, payer fills
    in) — see the blank-box layout rule in §5.2.
  - Payload encoding of the amount: decimal, **no leading zeros**, always
    with a decimal point and exactly two decimal places, max 12 digits
    total including the decimal point/separator. `.` is the only valid
    decimal separator in the payload.
  - Printed/display formatting: currency code first, then amount with a
    **space** as the thousands separator and `.` as the decimal separator
    — e.g. `CHF 1 590.00`, `EUR 1 590.00`. This printed-format
    space-as-thousands-separator is distinct from the payload encoding
    rule above (no thousands separator at all in the payload — just the
    plain decimal number).
- **Notes:** None — this section is unusually unambiguous and
  well-verified across two independent documents.

---

## 7. IBAN and QR-IBAN validation

### 7.1 Structural rules — creditor account must be CH/LI

- **Requirement:** The creditor account in a QR-bill must always be a
  Swiss (CH) or Liechtenstein (LI) IBAN — regardless of the creditor's
  postal address country.
- **Source:** IG QR-bill v2.3, Table 8, `IBAN` field definition (*"Fixed
  length: 21 alphanumeric characters, no spaces allowed, only IBANs with
  CH or LI country code permitted"*).
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
- **Effective date / spec version:** v2.3.
- **Verification date:** 2026-09-11.
- **Implementation:** Validate the `IBAN` field's country-code prefix
  (first 2 characters) is exactly `CH` or `LI`, independent of and in
  addition to any address-country validation elsewhere in the model —
  these are two separate checks in the data model, not one.
- **Notes:** Confirmed by Annex A example 5 in v2.3, which pairs an LI
  postal address on the creditor with a CH IBAN — proving address-country
  and account-country really are independent fields with no coupling
  requirement.

### 7.2 IBAN length, structure, and checksum (CH/LI)

- **Requirement:** CH/LI IBANs are 21 characters: 2-letter country code +
  2 check digits + 5-digit IID + 12-character account number; the check
  digits use the standard ISO 13616 / ISO 7064 MOD 97-10 algorithm.
- **Source:** SIX Group, "IBAN Checker for Switzerland" page; SIX
  "Technical information about the QR-IID and QR-IBAN" v1.1, §1.3.3 and
  Illustration 2.
- **Source URL:** https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/iban.html ;
  https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/qr-iid-iban-en.pdf
- **Effective date / spec version:** Current (ISO 13616, unversioned by
  SIX beyond referencing the ISO standard).
- **Verification date:** 2026-09-11. The 21-char length and 4-part
  structure came from a WebFetch-rendered summary of the SIX IBAN-checker
  page rather than text I personally extracted from a downloaded PDF —
  **flagged as slightly lower-confidence sourcing than the rest of this
  document**, though it is fully consistent with the QR-IID/QR-IBAN PDF
  (which I did read directly) confirming the 21-character CH/LI IBAN via
  its own worked examples throughout the QR-bill spec's Annex A (all six
  examples use 21-character `CH...` IBANs).
- **Implementation:**
  - Total length: **21 characters**, fixed, for both `CH` and `LI` IBANs.
  - Structure: `CC` (2 letters) + `KK` (2 check digits) + `IID` (5 digits,
    zero-padded if the underlying IID is only 3 or 4 digits) + account
    number (12 alphanumeric characters).
  - Checksum: standard **ISO 7064 MOD 97-10** (the same algorithm as
    every other country's IBAN check digit, per ISO 13616): rearrange to
    move the first 4 characters to the end, map letters to numbers
    (A=10…Z=35), and the resulting big integer mod 97 must equal 1.
  - This is the same generic algorithm described for the Creditor
    Reference in §4.2 — implement it once and share it between IBAN
    validation and SCOR reference validation.
- **Notes:** None beyond the sourcing flag above.

### 7.3 QR-IBAN vs. normal IBAN — the QR-IID range

- **Requirement:** A QR-IBAN is structurally identical to a normal IBAN
  (same 21-char CH/LI format) but is distinguished by its IID (character
  positions 5–9, 1-indexed) falling in the reserved range **30000–31999**.
- **Source:** IG QR-bill v2.3 §2.7–§2.10; SIX "Technical information about
  the QR-IID and QR-IBAN" v1.1, §1.3.1–§1.3.4 and §3.1–§3.3.
- **Source URL:** https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf ;
  https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/qr-iid-iban-en.pdf
- **Effective date / spec version:** v2.3 / QR-IID doc v1.1 (with effect
  from 29 February 2020). Unchanged in v2.4 aside from the new
  CHF-only-usage restriction covered in §4.5.
- **Verification date:** 2026-09-11, both quotes read directly from live
  PDFs. **The QR-IID document itself (v1.1) has not been updated since 29
  February 2020**, six and a half years before this verification date —
  I could not find, and did not have time to exhaustively search for, a
  newer edition; the SIX QR-bill spec (v2.3/v2.4) itself still cites it as
  "[5]" without a version bump, which is some evidence it's still current,
  but this should be spot-checked against the Download Centre before
  being treated as unquestionably up to date.
- **Implementation:**
  - Extract characters 5–9 (1-indexed) of the 21-char IBAN as the IID.
  - If `30000 <= IID <= 31999` → it's a **QR-IBAN**. Otherwise it's a
    normal IBAN.
  - A QR-IBAN can **only** be used as a *credit* (incoming-payment)
    account — never as a debit/source account. There is no such thing as
    "paying from" a QR-IBAN.
  - Every biller using QR-IBAN must also hold a normal IBAN — a QR-IBAN
    is never the *only* account a creditor has; CONTINUO's creditor/company
    bank-account settings should treat "primary settlement IBAN" and
    "QR-IBAN for QR-referenced billing" as two distinct, both-potentially-
    present fields, not a single toggle.
  - Each QR-IID is assigned to exactly one legally independent financial
    institution, one per SIC/euroSIC settlement account — this is a
    banking-side administrative fact, not something CONTINUO validates
    directly, but it explains why QR-IID lookups should ultimately trace
    back to SIX's published Bank Master rather than a static local list
    that will drift out of date.
  - Cross-reference with §4.5: pair a QR-IBAN account only with a `QRR`
    reference, and remember the v2.4-forward CHF-only restriction on that
    combination.
- **Notes:** The QR-IID/QR-IBAN doc explicitly says SIX offers **no
  self-service tool to generate a QR-IBAN from a normal IBAN** — allocation
  is a bank-side action only. CONTINUO must never synthesize a fake QR-IBAN by
  algorithmically substituting a QR-IID into an existing IBAN; it must
  always be an actual account number the user's bank issued and confirmed.

---

## Summary of open verification gaps

Collected here for visibility — none of these block a v2.3-targeted
implementation, but each should be closed out before the corresponding
downstream claim is treated as fully authoritative:

1. §1.3 — the exact 1 October 2022 "final replacement of red/orange slips"
   date came from a search-engine summary of SIX's product page, not a
   directly-read PDF paragraph.
2. §3 — the exact point-release date (30 September 2019) at which the
   combined/free-text address option was removed is reconstructed from a
   garbled revision-history table render, not a clean single sentence.
3. §4.4 — the Modulo 10 recursive carry table (Figure 21) is an image in
   the PDF; the table used here is a reconstruction, numerically verified
   against the spec's own worked example, not an OCR of the original
   figure.
4. §2.6 — the exact max character length of the `BldgNbOrAdrLine2`
   (Building number) field showed a possible v2.3-vs-v2.4 discrepancy (16
   vs. 35) in the raw text extraction that I could not resolve with
   confidence; v2.3's cleanly-extracted value (16) is used, flagged for a
   manual visual check.
5. §7.2 — the 21-character CH/LI IBAN structural breakdown (country code /
   check digits / IID / account number) is sourced from a fetched summary
   of SIX's IBAN-checker web page rather than a PDF I personally converted
   to text, though it is corroborated by every worked IBAN example
   elsewhere in this document.

None of these gaps concern a load-bearing business rule that this document
got backwards — they are all about the precision of a secondary detail
(an exact historical date, a table I couldn't OCR, one field's max
length). Still, per switzerland.md's governance rule, this document's
Verification date must be bumped and these gaps re-checked the next time
someone touches QR-bill code, not just left open indefinitely.
