# Swiss VAT (MWST / TVA / IVA) — Compliance Reference

**Produced for:** the CONTINUO compliance/tax engine (data model and calculation
logic for Swiss invoicing).

**Status:** engineering documentation, not legal advice. This document was
compiled by an AI research process reading primary Swiss government sources
live on **2026-09-11**. It is intended to give the engineering team an
accurate, sourced starting point for modeling Swiss VAT — it is **not** a
substitute for review by a qualified Swiss tax advisor (Steuerberater /
Treuhänder / avocat fiscaliste) before any of this logic is relied upon for
real invoices. Swiss VAT law changes on a rolling basis (the MWSTG was
substantially revised effective 1 January 2025, on top of the 1 January 2024
rate increase), so every entry below carries its own verification date and
must be re-checked before being treated as current.

All primary citations below are to:
- **ESTV/AFC/FTA** — the Swiss Federal Tax Administration, estv.admin.ch
- **Fedlex** — the official federal legislation portal, fedlex.admin.ch,
  specifically the VAT Act (Mehrwertsteuergesetz, MWSTG, **SR 641.20**) in
  its consolidated version "Stand am 31. März 2025" (fetched as PDF from
  `fedlex.data.admin.ch`, the same authoritative text as the fedlex.admin.ch
  web view)

---

## 1. Current VAT rates

### 1.1 Standard rate

| Field | Value |
|---|---|
| Requirement | The standard Swiss VAT rate is **8.1%**, applying to all taxable supplies not subject to the reduced or special rate. |
| Source | Fedlex — Mehrwertsteuergesetz (MWSTG), SR 641.20, Art. 25 Abs. 1; confirmed by ESTV |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 25); https://www.estv.admin.ch/estv/de/home/mehrwertsteuer/mwst-steuersaetze.html |
| Effective date | 1 January 2024 (raised from 7.7%, per Verordnung vom 9. Dezember 2022 über die Anhebung der Mehrwertsteuersätze zur Zusatzfinanzierung der AHV, AS 2022 863, following the 25 September 2022 referendum on AHV 21 financing) |
| Verification date | 2026-09-11 — verified live against the consolidated MWSTG text (Stand 31.03.2025) and the current ESTV rates page, both of which still show 8.1% with no announced change for 2026 |
| Implementation | The standard rate must be an explicit, versioned `VatRate` record (e.g. `{code: "STANDARD", rate: 0.081, validFrom: "2024-01-01"}`), never a hard-coded literal in calculation code. The engine must select the applicable rate by the **date of supply** (see also `Art. 40`/`Art. 112–115 MWSTG` on transitional rules), not by invoice date, since the two can differ across a rate change. |
| Notes / unresolved questions | A further rate increase to roughly 8.8% / 2.8% / 4.2% has been reported by third-party Swiss tax-advisory sites as "planned for 1 January 2028" to fund AHV, but this was **not** verified against a primary ESTV or Fedlex source in this session — no Bundesrat ordinance or Fedlex amendment for a 2028 change was found. Treat as unconfirmed until a primary source is located; do not hard-code it. |

### 1.2 Reduced rate

| Field | Value |
|---|---|
| Requirement | A reduced rate of **2.6%** applies to a defined list of goods/services: foodstuffs (excluding alcoholic beverages), water piped in mains, livestock/poultry/fish, cereals, seeds and live plants, animal feed, fertilizers and pesticides, medicines, newspapers/magazines/books and similar printed matter without advertising character (and their electronic equivalents), non-commercial radio/TV broadcasting services, the cultural/sport/educational services listed in Art. 21 Abs. 2 Ziff. 14–16 MWSTG, certain agricultural services, and (since 1 Jan 2025) menstrual hygiene products. |
| Source | Fedlex — MWSTG SR 641.20, Art. 25 Abs. 2 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 25 Abs. 2); https://www.estv.admin.ch/estv/de/home/mehrwertsteuer/mwst-steuersaetze.html |
| Effective date | 1 January 2024 for the 2.6% rate itself (raised from 2.5%); the addition of "Produkte für die Monatshygiene" (menstrual hygiene products) as a new reduced-rate category (Art. 25 Abs. 2 Bst. a Ziff. 10 MWSTG) took effect **1 January 2025** as part of the broader MWSTG revision (AS 2024 438) |
| Verification date | 2026-09-11 |
| Implementation | Model the reduced rate as its own `VatRate` record, and model rate *eligibility* as a `productCategory`/`serviceCategory` lookup table keyed to the Art. 25 Abs. 2 list — not a single boolean flag on the product. The category list itself is legally exhaustive and must be reviewable/auditable against the statute text, since misclassifying a standard-rate item as reduced-rate is a common compliance error. |
| Notes / unresolved questions | Restaurant/catering ("gastgewerbliche Leistungen") sales of food are carved back **out** of the reduced rate and taxed at standard rate under Art. 25 Abs. 3 MWSTG, with specific carve-outs for takeaway/delivery and vending machines — this interacts with rate selection logic and should get its own data-model entry (place-of-consumption / delivery-mode flag), not be treated as a simple product-category lookup. |

### 1.3 Special accommodation rate

| Field | Value |
|---|---|
| Requirement | A special rate of **3.8%** applies to accommodation services (lodging, including breakfast even if billed separately). |
| Source | Fedlex — MWSTG SR 641.20, Art. 25 Abs. 4 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 25 Abs. 4); https://www.estv.admin.ch/estv/de/home/mehrwertsteuer/mwst-steuersaetze.html |
| Effective date | 1 January 2024 (raised from 3.7%) |
| Verification date | 2026-09-11 |
| Implementation | Model as its own `VatRate` record scoped to an `accommodation` supply-type flag. |
| Notes / unresolved questions | **This rate is statutorily sunset.** Art. 25 Abs. 4 MWSTG states the special rate applies only until 31 December 2020, extendable to at most 31 December 2027 under the constitutional temporary-financing clause (Art. 196 Ziff. 14 Abs. 1 BV) — the current text confirms it has in fact been extended and reads "bis längstens zum 31. Dezember 2027." **The tax engine must not hard-code 3.8% as permanent** — it needs an expiry date and a mechanism to flag when Swiss legislation must be re-checked as that date approaches (or is further extended/changed by referendum, as happened with the standard-rate increase). |

### 1.4 Import VAT rates (cross-reference)

| Field | Value |
|---|---|
| Requirement | Import VAT (Einfuhrsteuer) uses the same rates: 8.1% standard, 2.6% for goods under Art. 25 Abs. 2 Bst. a/abis. |
| Source | Fedlex — MWSTG SR 641.20, Art. 55 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 55) |
| Effective date | 1 January 2024 |
| Verification date | 2026-09-11 |
| Implementation | If CONTINUO ever handles import declarations/customs-adjacent invoicing, the import-VAT rate table should reference the same underlying `VatRate` records as domestic supply, not a duplicated constant, since they are statutorily pegged together (no accommodation rate on imports; only standard and reduced apply). |
| Notes / unresolved questions | None — this is a straightforward cross-reference. |

---

## 2. VAT registration liability (who must register)

### 2.1 General rule and the CHF 100,000 threshold

| Field | Value |
|---|---|
| Requirement | A person/entity is subjectively liable for Swiss VAT ("steuerpflichtig") if it independently carries on a business ("Unternehmen betreibt" — a sustained, self-employed activity aimed at generating income from supplies, regardless of profit intent, legal form, or purpose) and either (a) supplies services/goods domestically with that business, or (b) has its seat, domicile, or a permanent establishment in Switzerland (Art. 10 Abs. 1 MWSTG). It is then **exempted** from that liability (not simply "not liable" — this is a defined exemption from an otherwise-existing liability) if, within one year, it achieves **less than CHF 100,000** of turnover, domestic and foreign combined, from supplies that are not themselves excluded from tax under Art. 21 Abs. 2 (Art. 10 Abs. 2 Bst. a MWSTG). |
| Source | Fedlex — MWSTG SR 641.20, Art. 10 Abs. 1, 1bis, 2 Bst. a |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 10) |
| Effective date | Core structure since 1 Jan 2010 (MWSTG); the CHF 100,000 domestic+foreign combined-turnover wording and Art. 10 Abs. 1bis "unternehmerische Tätigkeit" definition were introduced by the 30 Sept 2016 revision, in force 1 Jan 2018; further paragraph renumbering/insertions (Abs. 2 Bst. b–d) took effect 1 Jan 2025 |
| Verification date | 2026-09-11 |
| Implementation | **Do not model this as `if (annualRevenue > 100000) isRegistered = true`.** The correct model is: (1) a `businessActivityTest` (is this an independent, sustained, income-generating activity presented under its own name — a legal/factual determination, often manual for edge cases), gating whether the entity is a "Steuersubjekt" (taxable person) at all; (2) a `qualifyingTurnover` calculation that is turnover from taxable **and zero-rated** supplies (Art. 23) worldwide, explicitly **excluding** turnover from Art. 21-excluded supplies and non-consideration flows under Art. 18 Abs. 2 (subsidies, donations, damages, etc. — see Art. 10 Abs. 2bis: "Der Umsatz berechnet sich nach den vereinbarten Entgelten ohne die Steuer"); (3) a threshold comparison against CHF 100,000 (or the CHF 250,000 / CHF 100,000 variants below) that determines only the **exemption**, layered on top of (1). `CompanyTaxProfile.vatStatus` should be an explicit enum (e.g. `NOT_A_TAXABLE_PERSON`, `EXEMPT_BELOW_THRESHOLD`, `LIABLE_REGISTERED`, `VOLUNTARILY_REGISTERED`) set/reviewed per tax period, not derived on the fly from a revenue query. |
| Notes / unresolved questions | The turnover test is **forward-looking as well as backward-looking**: liability also begins if it is foreseeable, within 12 months of starting or expanding business activity, that the CHF 100,000 threshold will be exceeded (Art. 14 Abs. 3 MWSTG) — a pure trailing-12-months calculation is insufficient for correctly timing registration. |

### 2.2 Non-profit, volunteer-run sport/cultural associations and charitable institutions — raised threshold

| Field | Value |
|---|---|
| Requirement | A non-profit, **volunteer-run** ("ehrenamtlich geführt") sport or cultural association, or a "gemeinnützige Organisation" (charitable/non-profit organization as defined by reference to Art. 56 Bst. g DBG, the direct federal tax law), is exempt from VAT liability if its qualifying annual turnover (same definition as above) is **less than CHF 250,000** rather than CHF 100,000. |
| Source | Fedlex — MWSTG SR 641.20, Art. 10 Abs. 2 Bst. c |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 10 Abs. 2 Bst. c); corroborated by secondary commentary (BDO, Moore Zürich) describing the increase from CHF 150,000 to CHF 250,000 effective 1 January 2023 |
| Effective date | The CHF 250,000 figure (up from a prior CHF 150,000) took effect **1 January 2023**, predating the most recent MWSTG revision; the current Art. 10 Abs. 2 Bst. c wording was itself re-cast (Fassung gemäss Ziff. I des BG vom 16. Juni 2023) effective 1 January 2025 |
| Verification date | 2026-09-11 — the CHF 250,000 figure and the exact statutory wording were confirmed directly against the Fedlex-hosted consolidated MWSTG PDF (Stand 31.03.2025); the "raised from CHF 150,000 in 2023" history is corroborated only by secondary/advisory sources (BDO, Moore Zürich), not independently re-verified against an ESTV or Fedlex historical-version diff in this session |
| Implementation | This is a distinct `organizationType` flag on the tax profile (`NONPROFIT_VOLUNTEER_SPORT_CULTURE` / `CHARITABLE_ORG`) that swaps the threshold constant used in the exemption test in §2.1 — it must not be modeled as a generic "small business discount," since eligibility depends on legal status (non-profit + volunteer-run, or meeting the Art. 56 Bst. g DBG charitable-status test), not just turnover level. |
| Notes / unresolved questions | "Volunteer-run" (ehrenamtlich geführt) is not further defined in the Act itself in the text retrieved; ESTV practice publications (MWST-Info series) likely give operational criteria (e.g., board members not compensated beyond expenses) that were not retrieved in this session and should be pulled from the relevant MWST-Info before this is implemented as a hard business rule. |

### 2.3 Public-law entities (Gemeinwesen) — separate CHF 100,000 test on non-public-body turnover

| Field | Value |
|---|---:|
| Requirement | A public body's tax subject (an autonomous department of the Confederation, canton, or commune, or another public-law institution) is exempt from liability as long as it has **less than CHF 100,000** per year of turnover from taxable supplies **to non-public bodies** specifically (turnover to other public bodies does not count toward this threshold). |
| Source | Fedlex — MWSTG SR 641.20, Art. 12 Abs. 3 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 12) |
| Effective date | 1 January 2018 revision wording, in force since |
| Verification date | 2026-09-11 |
| Implementation | Relevant only if CONTINUO has government/municipal customers as VAT-registered suppliers; otherwise document for completeness and skip modeling until needed. |
| Notes / unresolved questions | None significant for a standard SMB invoicing product; flagged mainly so the exemption logic isn't accidentally generalized from the Art. 10 test to public bodies, since the qualifying-turnover definition differs (counterparty-restricted, not activity-restricted). |

### 2.4 Voluntary registration below the threshold (Option / Verzicht auf die Befreiung)

| Field | Value |
|---|---|
| Requirement | Any business that would otherwise be exempt under Art. 10 Abs. 2 or Art. 12 Abs. 3 has the **right** (not obligation) to waive that exemption and register voluntarily ("Verzicht auf die Befreiung von der Steuerpflicht"). The waiver must be maintained for at least one full tax period (calendar year, or elected fiscal year) once made, and can only take effect from the start of a current tax period at the earliest. |
| Source | Fedlex — MWSTG SR 641.20, Art. 11 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 11) |
| Effective date | Core provision since 1 Jan 2010; minor formal changes since |
| Verification date | 2026-09-11 |
| Implementation | Needs its own `vatStatus = VOLUNTARILY_REGISTERED` state, with a `lockedUntil` date (end of the current mandatory-retention tax period) to prevent the UI/API from allowing a premature un-registration. Also note the *inverse* mechanic in Art. 14 Abs. 5: if a registered taxpayer's turnover **drops** below the threshold and is expected to stay below it, they must actively de-register (Abmeldung); if they fail to de-register, **non-de-registration is deemed a voluntary waiver under Art. 11** and binds them for another period. This "silence = opt-in" rule is easy to miss and has real deadline implications (de-registration is possible only as of the end of the tax period in which the threshold was undershot, and must be filed — see Art. 66 Abs. 2/3 for the 30/60-day administrative deadlines). |
| Notes / unresolved questions | None outstanding; text is unambiguous. |

### 2.5 Registration mechanics and deadlines

| Field | Value |
|---|---|
| Requirement | A person who becomes liable under Art. 10 must register with the ESTV in writing within **30 days** of the start of liability. On de-registration (end of business activity), written de-registration is due within 30 days of ceasing activity, and no later than completion of any liquidation. A person liable solely because of acquisition tax (Bezugsteuer, see §3.5) has 60 days after the end of the relevant calendar year to register and declare. |
| Source | Fedlex — MWSTG SR 641.20, Art. 66 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 66) |
| Effective date | Core deadlines unchanged since 2010; minor wording changes 2011 (UID number reference) |
| Verification date | 2026-09-11 |
| Implementation | Model registration/de-registration as dated events with SLA/deadline tracking (`registrationDueBy = liabilityStartDate + 30 days`), since missing this deadline itself can trigger a procedural-violation penalty under Art. 98 Bst. a MWSTG independent of any underpayment. |
| Notes / unresolved questions | None. |

---

## 3. Distinct legal concepts that must not be conflated

Swiss VAT law uses six legally distinct statuses for "no VAT charged" or
"reduced VAT charged" situations. A tax engine that collapses these into a
single `vatApplicable: boolean` or `vatRate: 0%` field will produce
incorrect invoices, incorrect input-tax-deduction behavior, and incorrect
disclosure text. Each is documented separately below.

### 3.1 Not VAT-liable / not registered ("nicht steuerpflichtig" / "nicht im Register eingetragen")

| Field | Value |
|---|---|
| Requirement | A supplier who does not meet the Art. 10 liability test at all, or who meets it but is exempted under Art. 10 Abs. 2, is simply **not a taxable person** for MWST purposes. Such a person may **not** show VAT on invoices at all — Art. 27 Abs. 1 MWSTG expressly prohibits a non-registered person from referencing tax on an invoice ("Wer nicht im Register der steuerpflichtigen Personen eingetragen ist … darf in Rechnungen nicht auf die Steuer hinweisen"). This is a status of the **supplier**, not a property of any given transaction. |
| Source | Fedlex — MWSTG SR 641.20, Art. 10, Art. 27 Abs. 1 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf |
| Effective date | Core rule since 2010 |
| Verification date | 2026-09-11 |
| Implementation | `CompanyTaxProfile.vatStatus = NOT_LIABLE` must gate the invoice template to omit any VAT line/UID-MWST suffix entirely, and must be a hard validation error (not a warning) if a VAT rate/amount is ever attached to an invoice from such a supplier. |
| Notes / unresolved questions | None. |

### 3.2 Excluded / exempt-without-credit supplies ("von der Steuer ausgenommene Leistungen") — Art. 21 MWSTG

| Field | Value |
|---|---|
| Requirement | Certain categories of supply are excluded from VAT ("ausgenommen") even when made by a fully registered taxable person: hospital/medical treatment and specified healthcare professions (Art. 21 Abs. 2 Ziff. 2–8), education/training (Ziff. 11), child/youth welfare (Ziff. 9–10), culture (Ziff. 14, 14bis, 16), sport (Ziff. 15), insurance and most financial/banking/securities/fund transactions (Ziff. 18–19), transfer/letting of real property with specific carve-backs (Ziff. 20–21), and about two dozen other narrowly defined categories. If not "optioned" into taxation under Art. 22 (§3.6), such a supply is legally **not taxable at all** ("ist nicht steuerbar" — Art. 21 Abs. 1), meaning no output tax is charged **and** input tax on costs used to produce it is **not deductible** (Art. 29 Abs. 1: "Kein Anspruch auf Vorsteuerabzug besteht bei Leistungen … die von der Steuer ausgenommen sind"). This is the crucial distinguishing feature versus zero-rating (§3.3): exclusion blocks input-tax recovery; zero-rating does not. |
| Source | Fedlex — MWSTG SR 641.20, Art. 21 (full 31-item list), Art. 29 Abs. 1 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 21, Art. 29) |
| Effective date | Core list since 2010; multiple items re-worded/added/removed by the 2016 revision (1 Jan 2018) and the 2023 revision (1 Jan 2025) — e.g. Ziff. 3bis (coordinated care), Ziff. 12 (staff secondment by non-profits), Ziff. 19 Bst. g (BVG investment foundations), and Ziff. 31 (resold travel-agency services) were added/reworded effective 1 Jan 2025 |
| Verification date | 2026-09-11 — full Art. 21 text read directly from the Fedlex-hosted consolidated PDF |
| Implementation | Model as a `TaxTreatment` value distinct from any rate, e.g. `EXCLUDED_ART21` carrying a `category` (healthcare/education/finance/culture/sport/real-estate/other) referencing the specific Ziffer, because different sub-categories interact differently with the Option mechanism (§3.6) — e.g. Ziff. 18/19/23 (insurance, most financial transactions, and gambling) are **excluded from the option to tax even voluntarily** (Art. 22 Abs. 2 Bst. a), while most others (including most real-estate lettings except pure residential use) can be optioned. Line items with this treatment must **not** deduct input VAT unless a valid Art. 22 option is on file for that specific revenue stream. |
| Notes / unresolved questions | The full Art. 21 Abs. 2 list runs to 31 numbered items with sub-letters — treat the list in the statute as authoritative and do not paraphrase/shorten it in code comments or config without a citation back to the specific Ziffer, since sub-item scoping (e.g. what counts as "koordinierte Versorgung" in the new Ziff. 3bis) is legally precise. |

### 3.3 Zero-rated / exported supplies ("von der Steuer befreite Leistungen") — Art. 23 MWSTG

| Field | Value |
|---|---|
| Requirement | A defined list of supplies — principally direct exports of goods (Art. 23 Abs. 2 Ziff. 1), goods/services connected to certain customs procedures, international air transport of aircraft/fuel to qualifying airlines, cross-border transport/logistics services, and (since 1 Jan 2025) certain investment gold and marketplace-facilitated goods supplies — are "von der Steuer befreit": **no Swiss VAT is charged on this specific supply ("keine Inlandsteuer geschuldet" — Art. 23 Abs. 1), but unlike Art. 21 exclusion, the supplier's related input VAT remains fully deductible** (this follows from Art. 29 Abs. 1 a contrario — only Art. 21-excluded supplies block input deduction, and Art. 23 uses different, non-overlapping language). This is genuine "zero-rating" in the VAT-systems sense, not mere exemption. |
| Source | Fedlex — MWSTG SR 641.20, Art. 23 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 23) |
| Effective date | Core list since 2010; Ziff. 3bis, 12 (gold), and 13 (electronic-platform-enabled sales) added by the 2023 revision effective 1 Jan 2025 |
| Verification date | 2026-09-11 |
| Implementation | Model as `TaxTreatment = ZERO_RATED_ART23` with `category` (export/customs-procedure/international-transport/gold/platform-enabled), explicitly distinct from `EXCLUDED_ART21` in the data model, precisely because the former preserves input-tax deduction and the latter does not — collapsing these into one "0%" bucket will silently corrupt input-VAT recovery calculations. Direct export requires proof (Art. 23 Abs. 3) of the goods leaving Switzerland without prior use domestically — the engine should support attaching/tracking export evidence per invoice line for audit purposes. |
| Notes / unresolved questions | None outstanding beyond the general note that this list, like Art. 21's, is exhaustive and item-specific. |

### 3.4 Outside the scope of Swiss VAT ("nicht im Geltungsbereich" — place-of-supply driven)

| Field | Value |
|---|---|
| Requirement | Some transactions never become an "object" of Swiss Inlandsteuer at all because the place-of-supply rules put the place of supply **outside Switzerland**, independent of Art. 21/23. Art. 18 Abs. 1 MWSTG taxes only supplies made "im Inland" (domestically); Art. 7 (place of supply of goods) and Art. 8 (place of supply of services, generally the recipient's place of business under Art. 8 Abs. 1, with numerous special-case carve-outs in Art. 8 Abs. 2 for e.g. culture/sport/education events, hospitality, real-estate-related services, and passenger transport) determine whether Switzerland is even the taxing jurisdiction. If the place of supply lands outside Switzerland, the supply is conceptually **outside the scope** of the MWSTG — there is nothing to exempt or zero-rate because Swiss VAT was never in play. |
| Source | Fedlex — MWSTG SR 641.20, Art. 7, Art. 8, Art. 18 Abs. 1 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 7, 8, 18) |
| Effective date | Core structure since 2010; Art. 8 Abs. 2 Bst. b/c re-worded effective 1 Jan 2025 (2023 revision) |
| Verification date | 2026-09-11 |
| Implementation | This must be modeled as a **place-of-supply determination step that runs before any tax-treatment lookup**, not as another entry in the same enum as Art. 21/23 — logically, "outside scope" means the Swiss VAT engine has no jurisdiction over the line item at all, whereas Art. 21/23 presuppose Swiss jurisdiction and then apply a specific relief. Model `PlaceOfSupply` as its own resolved value (`DOMESTIC` / `FOREIGN`) computed from recipient type, recipient location, and supply-type-specific override rules (Art. 8 Abs. 2), and only evaluate `TaxTreatment` (Art. 21/22/23/standard rate) when `PlaceOfSupply == DOMESTIC`. |
| Notes / unresolved questions | The B2B default rule (recipient's place of business, Art. 8 Abs. 1) versus the numerous B2C/event/property/hospitality special cases in Art. 8 Abs. 2 is a common source of bugs; each special case needs its own citation-backed rule rather than a single "is the customer Swiss?" check. |

### 3.5 Reverse charge / acquisition tax ("Bezugsteuer") — Art. 45–49 MWSTG

| Field | Value |
|---|---|
| Requirement | When a **Swiss-based recipient** receives certain supplies from a **foreign supplier not registered in the Swiss VAT register**, and the place of supply is deemed domestic under Art. 8 Abs. 1, the *recipient* — not the foreign supplier — must self-assess and remit Swiss VAT under the Bezugsteuer (acquisition tax) mechanism (Art. 45 Abs. 1 Bst. a). This covers most B2B cross-border services (with a carve-out for telecom/electronic services to non-taxable recipients, which instead may trigger foreign-supplier registration), transfers of unregistered-foreign-seller Swiss real estate, cross-border electricity/gas/heat supply, and emission-rights transfers. The recipient is liable for Bezugsteuer either if it is already Art. 10-liable for other reasons, **or** if it receives more than CHF 10,000 of such supplies in a calendar year (Art. 45 Abs. 2) — this is a *separate* threshold from the Art. 10 registration threshold and can make an otherwise-unregistered small business liable to self-assess and pay Bezugsteuer without becoming a full VAT-registered "Inlandsteuer" taxpayer. |
| Source | Fedlex — MWSTG SR 641.20, Art. 45, Art. 45a, Art. 48 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 45–48) |
| Effective date | Core mechanism since 2010; Art. 45 Abs. 1 Bst. e (emission rights) added 1 Jan 2025 |
| Verification date | 2026-09-11 |
| Implementation | This is fundamentally an **AP-side** (purchasing) tax obligation, distinct from every other concept in this section, which are all AR-side (sales) concepts. If CONTINUO ever processes vendor bills from foreign suppliers, `CompanyTaxProfile` needs a separate `bezugsteuerStatus`/running-total tracker against the CHF 10,000/year threshold, independent of the main `vatStatus` field, because a company can be `NOT_LIABLE` for Art. 10 purposes and still owe Bezugsteuer. Supplies excluded under Art. 21 or zero-rated under Art. 23 are explicitly **not** subject to Bezugsteuer (Art. 45a). |
| Notes / unresolved questions | This entry is written from the perspective of a Swiss recipient owing Bezugsteuer on foreign purchases. If CONTINUO's product surface is purely sales-side (issuing invoices, not processing bills), this may be lower priority to implement now but should still be represented in the data model so it isn't silently conflated with `EXCLUDED_ART21`/`ZERO_RATED_ART23`/`OUT_OF_SCOPE` in reporting. |

### 3.6 Option to tax ("Option") — Art. 22 MWSTG

| Field | Value |
|---|---|
| Requirement | A registered taxable person may elect to voluntarily charge VAT on an otherwise Art. 21-excluded supply — either by openly stating the tax on the invoice or by declaring it in the periodic return (Art. 22 Abs. 1) — in order to preserve input-tax deduction rights on costs related to that supply. The option is **excluded by law** for insurance/reinsurance and most financial-sector supplies (Art. 21 Abs. 2 Ziff. 18–19) and for exempt gambling turnover (Ziff. 23), and is excluded for real-estate transfer/letting (Ziff. 20–21) specifically where the recipient uses the property **exclusively for residential purposes** (Art. 22 Abs. 2 Bst. b). |
| Source | Fedlex — MWSTG SR 641.20, Art. 22 |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 22) |
| Effective date | Core mechanism since 2010; current wording per the 2016 revision, in force 1 Jan 2018 |
| Verification date | 2026-09-11 |
| Implementation | Model as a per-revenue-stream (not per-company) boolean/flag layered on top of an `EXCLUDED_ART21` treatment: `optedForTaxation: boolean`, gated by an eligibility check against the Art. 22 Abs. 2 exclusion list, and — when true — switching the effective treatment from "no output tax / no input credit" to "standard output tax / input credit allowed" for that specific stream. This must never be a global per-company switch, since a company can have some excluded revenue streams optioned and others not. |
| Notes / unresolved questions | None outstanding; the exclusion list is short and explicit in the statute. |

### 3.7 Summary table (for quick reference in code review, not a substitute for the entries above)

| Concept | German/French term | Legal basis | Output VAT charged? | Input VAT on related costs deductible? |
|---|---|---|---|---|
| Not liable / not registered | nicht steuerpflichtig | Art. 10 | No (may not even show VAT — Art. 27) | N/A (not a registered person) |
| Excluded | von der Steuer ausgenommen | Art. 21 | No | **No** (unless Option, Art. 22) |
| Zero-rated / export | von der Steuer befreit | Art. 23 | No (0% explicitly) | **Yes** |
| Outside scope | ausserhalb des Geltungsbereichs | Art. 7/8/18 (place of supply) | No — not a Swiss-taxable event at all | N/A — Swiss VAT never attaches |
| Reverse charge / acquisition tax | Bezugsteuer | Art. 45–49 | Recipient self-assesses, not supplier | Yes, recipient can deduct as its own input tax (Art. 28 Abs. 1 Bst. b) |
| Option | Option (Art. 22) | Art. 22 | Yes, voluntarily | Yes, once opted |

---

## 4. Rounding rules for VAT amounts on invoices

| Field | Value |
|---|---|
| Requirement | The MWSTG itself does not prescribe a specific rounding algorithm for VAT line amounts. Secondary practitioner/accounting-software sources consistently describe ESTV's accepted practice as: standard **commercial rounding** (kaufmännische Rundung — round-half-up to the nearest centime) is acceptable for VAT purposes just as for other business amounts, and a business may choose to round either each individual invoice line or only the final total, as long as the chosen method is applied **consistently**. Final cash-payment totals in Switzerland are separately subject to the national 5-centime cash-rounding convention (no 1- or 2-Rappen coins in circulation), which is a payments/currency convention rather than a VAT-specific rule. |
| Source | Secondary sources only in this session (accounting-software help pages — Flexbüro/Minibüro/Vertec — each describing the same ESTV "Hauptabteilung Mehrwertsteuer" position); **I was not able to locate and directly read the primary ESTV text within this session** (attempts to fetch ESTV's MWST-Info 16 "Buchführung und Rechnungsstellung," which is the publication practitioner sources cite for this rule, returned only the invoice-content-requirements section, not a rounding section, via the available fetch tooling) |
| Source URL | Not independently confirmed on estv.admin.ch or fedlex.admin.ch in this session; secondary sources consulted: https://hilfe.flexbuero.ch/article/1105/, https://hilfe.minibuero.ch/article/1105/, https://www.vertec.com/de-de/kb/rundungsdifferenzen/. The likely primary source is ESTV MWST-Info 16 (Buchführung und Rechnungsstellung), obtainable at https://www.estv.admin.ch/de/mwst-praxispublikationen |
| Effective date | Unknown/unverified — believed to be long-standing ESTV practice, not tied to the 2024/2025 rate changes |
| Verification date | 2026-09-11 — **flagged as unverified against a primary source; do not treat as settled** |
| Implementation | Pending primary-source confirmation, the safest engineering default is: (a) compute VAT per line at full (unrounded) precision internally, (b) round only the final invoice-level tax total and grand total to the nearest CHF 0.01 using round-half-up, (c) make the rounding **strategy itself configurable per legal entity** (line-level vs. total-level) so it can be changed without a data-model migration once confirmed, and (d) keep unrounded intermediate values in the audit trail so rounding-difference reconciliation is possible. Do **not** hard-code 5-centime cash rounding into VAT calculation — that is a payment-settlement concern, not a tax-calculation one, and must not alter the VAT amount recorded for reporting purposes. |
| Notes / unresolved questions | **This entire entry needs primary-source follow-up before implementation is finalized.** Specifically: (1) fetch ESTV MWST-Info 16 directly (https://www.estv.admin.ch/de/mwst-praxispublikationen or the gate.estv.admin.ch web-publication system) and locate the section corresponding to "Rundung"/"Abrechnung und Rundung"; (2) confirm whether ESTV mandates round-half-up specifically, or merely requires "a" commercial rounding convention; (3) confirm whether there is any statutory (MWSTV, SR 641.201) provision on rounding that supersedes practice guidance — the VAT Ordinance was not searched for this specific point in this session. |

---

## 5. UID — Swiss business identification number

### 5.1 What it is, issuing authority, and format

| Field | Value |
|---|---|
| Requirement | The UID (Unternehmens-Identifikationsnummer / numéro d'identification des entreprises / numero d'identificazione delle imprese) is Switzerland's single business identification number, issued and administered in the central UID register by the **Federal Statistical Office (BFS/OFS)**, not by ESTV. It is assigned automatically when a business registers (e.g. in the commercial register, or with ESTV for VAT, social insurance, or customs purposes) — there is no separate application process, and registration in the UID register is free. The base format is **CHE-123.456.789** (prefix "CHE," then a 9-digit number in three groups of three, dot-separated). |
| Source | ESTV — Unternehmens-Identifikationsnummer (UID) page; underlying legal basis is the Bundesgesetz über die Unternehmens-Identifikationsnummer (UIDG), SR 431.03, referenced directly in Art. 66 Abs. 1 MWSTG |
| Source URL | https://www.estv.admin.ch/de/unternehmens-identifikationsnummer-uid ; UID register itself at https://www.uid.admin.ch ; UIDG cross-reference from Fedlex MWSTG Art. 66 Abs. 1 (SR 431.03) |
| Effective date | UID system in force since 1 January 2011 (per the UIDG cross-reference footnote in the MWSTG text: "Bundesgesetz vom 18. Juni 2010 über die Unternehmens-Identifikationsnummer, in Kraft seit 1. Jan. 2011") |
| Verification date | 2026-09-11 |
| Implementation | `CompanyTaxProfile` should carry the bare UID (`CHE-123.456.789`) as a structurally validated field (regex: `CHE-\d{3}\.\d{3}\.\d{3}`, plus — ideally — the EAN-13-style check-digit validation the BFS uses) **separately** from the derived VAT-specific display form (§5.2), since the UID exists independently of VAT registration (every registered Swiss legal entity gets one; not every UID holder is VAT-registered). |
| Notes / unresolved questions | The check-digit algorithm for the 9-digit UID number itself was not verified in this session (BFS/UID-register technical documentation was not fetched) — if CONTINUO validates UID format beyond a regex, that algorithm needs separate primary-source confirmation from BFS/uid.admin.ch before being treated as authoritative. |

### 5.2 The MWST number (UID + VAT suffix) and mandatory invoice disclosure

| Field | Value |
|---|---|
| Requirement | For VAT purposes, the UID is suffixed with "MWST" (German), "TVA" (French), or "IVA" (Italian) — e.g. **CHE-123.456.789 MWST** — to form the taxpayer's VAT number. An English "VAT" suffix is **not** a recognized Swiss variant. A registered taxable person's invoice must, per Art. 26 Abs. 2 Bst. a MWSTG, state the supplier's name and location as used in business dealings, **the fact that it is registered in the register of taxable persons, and the number under which it is so registered** — i.e., the MWST-suffixed UID is a mandatory invoice field for any VAT-registered supplier, whenever an invoice is requested by the customer (Art. 26 Abs. 1). |
| Source | Fedlex — MWSTG SR 641.20, Art. 26 Abs. 2 Bst. a; ESTV — UID page; ESTV MWST-Info 16 (Buchführung und Rechnungsstellung), which explicitly shows the "CHE-123.456.789 MWST" format on its sample invoice |
| Source URL | https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/de/pdf-a/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-pdf-a-1.pdf (Art. 26); https://www.estv.admin.ch/de/unternehmens-identifikationsnummer-uid; ESTV MWST-Info 16 fetched via https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/displayDocs/cipherPrinterFriendly.xhtml?componentId=1002626&publicationId=1002536&language=de |
| Effective date | Art. 26 invoice-content rule in force since 2010; the specific UID-number wording of Art. 26 Abs. 2 Bst. a dates to the 18 June 2010 UIDG-alignment amendment, in force 1 Jan 2011 |
| Verification date | 2026-09-11 — Art. 26 text confirmed directly against the Fedlex-hosted MWSTG PDF; the "CHE-123.456.789 MWST" sample-invoice format was confirmed by directly fetching the ESTV MWST-Info 16 web publication (gate.estv.admin.ch), which is an ESTV-hosted primary source, not a third-party mirror |
| Implementation | Invoice templates must render the derived `{UID} {MWST|TVA|IVA}` string (language-selected to match the invoice's language, not hard-coded to German) whenever `CompanyTaxProfile.vatStatus` is a registered state, and must **omit** it entirely for non-registered suppliers (consistent with §3.1's Art. 27 prohibition on unregistered persons referencing tax). Also worth noting for validation logic: the same ESTV source indicates the recipient's input-tax-deduction right does **not** hinge on the exact formatting/punctuation of the number as printed (dots vs. no dots, "MWST" vs. "CHE123456789MWST" all caps run-together, etc.) as long as Art. 28–33 MWSTG's substantive deduction conditions are otherwise met — so invoice validation should check for a UID's *presence and correctness*, not enforce one single rigid string format on **incoming** (received) invoices, even though CONTINUO's own **outgoing** invoices should consistently use the canonical dotted format. |
| Notes / unresolved questions | Confirm whether CONTINUO needs to integrate live UID-register lookups (uid.admin.ch has a public search/API) to validate a customer's or supplier's UID at data-entry time — this was out of scope for this research pass but is a natural follow-up given the UID's centrality to invoice validity. |

---

## Summary of items flagged for follow-up before this is relied upon in production logic

1. **§1.1** — The reported "2028 rate increase to 8.8%/2.8%/4.2%" is unconfirmed against any primary ESTV/Fedlex source; do not implement.
2. **§1.3** — The 3.8% special accommodation rate has a statutory sunset (currently 31 December 2027 at the latest); needs an expiry/review mechanism, not a permanent constant.
3. **§2.2** — The operational definition of "ehrenamtlich geführt" (volunteer-run) for the CHF 250,000 non-profit threshold should be pulled from the relevant MWST-Info practice publication, not inferred.
4. **§4 (entire section)** — Rounding rules could not be confirmed against a primary ESTV or Fedlex (MWSTV) source in this session. This is the single most important open item in this document and should be resolved before rounding logic ships.
5. **§5.1** — The UID check-digit algorithm needs confirmation from BFS/uid.admin.ch if used for validation beyond basic format regex.

This document, and every rule in it, must be reviewed by a qualified Swiss
tax advisor before CONTINUO's tax engine is relied upon for real customer
invoices.
