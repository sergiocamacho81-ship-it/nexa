# Cross-Border VAT / Place-of-Supply — CONTINUO Compliance Reference

**Document produced:** 2026-09-11
**Verified live against primary sources on:** 2026-09-11

## Purpose and scope

This is engineering documentation for CONTINUO's cross-border tax logic — the
`PlaceOfSupplyEngine` that decides, for a given invoice line, whether a
supply is taxed in Switzerland, and the `TaxDecision` output that downstream
invoicing/reporting code consumes. It follows the sourcing rules set out in
[`switzerland.md`](./switzerland.md): every requirement below traces to a
primary Swiss source (ESTV/AFC/FTA guidance, the Fedlex text of the VAT Act
— MWSTG, SR 641.20 — or BAZG/OFDF customs guidance), never to a blog or
SaaS vendor's summary.

**This document is not a substitute for review by a qualified Swiss tax
advisor**, and that review is especially non-optional here: cross-border
supply chains routinely hit edge cases (chain transactions, mixed
goods+installation contracts, platform/marketplace deemed-supplier rules,
services partly performed in Switzerland and partly abroad) that a
general-purpose engine cannot safely resolve from statute text alone. Before
any cross-border `TaxDecision` path ships to real customers, a Swiss tax
advisor must review the specific scenarios CONTINUO supports.

The software's job, as scoped for this engine, is narrower than "get
cross-border VAT right everywhere": it is to (1) correctly classify the
**Swiss-side** tax treatment of a supply (domestic-taxable, export
zero-rated, outside the scope of Swiss VAT, or subject to Swiss acquisition
tax/Bezugsteuer), and (2) **flag, not silently resolve**, any indication
that a **foreign** jurisdiction's tax rules might also apply. See §6.

---

## 1. Place of supply for services — Art. 8 MWSTG

### 1.1 Default rule: the recipient principle (Art. 8 Abs. 1)

- **Requirement:** Unless one of the Art. 8 Abs. 2 exceptions applies, a
  service is deemed supplied where the **recipient** has the seat of its
  economic activity or a permanent establishment for which the service is
  rendered — or, absent such a seat/establishment, the recipient's domicile
  or habitual abode. This is the "Empfängerortsprinzip" and it is the
  default for the large majority of B2B services (consulting, IT,
  licensing, financial services, telecom, freight forwarding, etc.).
- **Source:** Fedlex — MWSTG Art. 8 Abs. 1 (consolidated text, "Stand am 31.
  März 2025").
- **Source URL:** https://www.fedlex.admin.ch/eli/cc/2009/615/de (SR
  641.20, Art. 8) — cross-checked against ESTV's MWST web-publication on
  place-of-supply for services (recipient-location principle, §2.1):
  https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?componentId=1057875&publicationId=1016479
- **Effective date:** Art. 8 Abs. 1's core wording has been in force since
  the MWSTG's 1 Jan 2010 entry into force; the ESTV web-publication cited
  above was last republished 14 Jan 2025 reflecting the 1 Jan 2025 Art. 8
  Abs. 2 amendments (see 1.2).
- **Verification date:** 2026-09-11 — verified live against the Fedlex
  consolidated text and the ESTV gate.estv.admin.ch web-publication.
- **Implementation:** For any service line item, `PlaceOfSupplyEngine`
  must first determine whether an Art. 8 Abs. 2 exception (§1.2) applies;
  if none does, it falls through to Art. 8 Abs. 1 and needs, as inputs:
  `customerType` (business seat/establishment vs. private individual —
  see §4), `customerCountry` (seat/establishment country for a business
  recipient, or domicile/habitual-abode country for a private recipient),
  and `serviceCategory` (to test against the Abs. 2 exception list first).
  Output: `placeOfSupplyCountry = customerCountry`. If
  `customerCountry != "CH"`, the resulting `TaxDecision` is
  `OUTSIDE_SCOPE_FOREIGN_SUPPLY`, not a Swiss zero rate (see §5).
- **Notes / unresolved questions:** The recipient principle needs a
  reliable `customerCountry` value — CONTINUO must decide what evidence is
  sufficient to set it (billing address, registered business address,
  foreign VAT/tax ID, IP/payment-method signals for consumers) and that
  evidentiary standard itself should be reviewed by counsel; it is not
  specified by Art. 8 itself.

### 1.2 Exceptions to the recipient principle (Art. 8 Abs. 2)

Art. 8 Abs. 2 lists services whose place of supply is determined by a rule
other than the recipient's seat/domicile. The exact enumerated categories,
verbatim from the current consolidated text:

| Let. | Category (as named in the law) | Place-of-supply rule |
|---|---|---|
| a | Services typically supplied directly to a physically present natural person (even if exceptionally supplied remotely) — the law names, non-exhaustively: medical treatments, therapies, nursing care, personal grooming/body-care, marriage/family/life counselling, social welfare and social-assistance services, and childcare/youth care | Place where the **service provider** has its seat/establishment (or, absent one, its domicile or the place it operates from) |
| b | Travel services resold by travel agencies, and related travel-agency services | Place where the **travel agency operator** has its seat/establishment (or domicile/place of operation) |
| c | Services in the field of culture, arts, sport, science, education, entertainment, or similar, supplied directly to persons physically present on site — including the organizer's own services and related services | Place where the activity is **actually carried out** |
| d | Restaurant/catering services (gastgewerbliche Leistungen) | Place where the service is **actually performed** |
| e | Passenger transport services | Place where the transport actually occurs, measured by distance covered (Federal Council may deem short domestic legs of cross-border transport as foreign, and vice versa) |
| f | Services connected with real estate (immovable property) — the law names, non-exhaustively: brokerage, management, appraisal/valuation, services tied to acquiring/establishing rights in rem, architecture/engineering/site-supervision services, surveillance of land/buildings, and accommodation/lodging services | Place where the **real estate is located** |
| g | Services in the field of international development cooperation and humanitarian aid | Place **for which** the service is intended |

- **Requirement:** the table above is the closed set of statutory
  exceptions; anything not on this list (and not a good) defaults to the
  Art. 8 Abs. 1 recipient principle.
- **Source:** Fedlex — MWSTG Art. 8 Abs. 2 let. a–g.
- **Source URL:** https://www.fedlex.admin.ch/eli/cc/2009/615/de (SR
  641.20, Art. 8 Abs. 2).
- **Effective date:** let. b and c were last revised effective 1 Jan 2025
  (Änderung vom 16. Juni 2023, AS 2024 438); let. a, d–g reflect earlier
  consolidations (most recently the 1 Jan 2018 revision, AS 2017 3575). The
  version verified is "Stand am 31. März 2025."
- **Verification date:** 2026-09-11 — verified live against the Fedlex
  consolidated text (full paragraph text captured, including footnote
  amendment references, on 2026-09-11).
- **Implementation:** `PlaceOfSupplyEngine` needs a `serviceCategory`
  enum/classification that maps each sellable service type in CONTINUO's
  catalog to one of: `{NONE (falls to Art.8 Abs.1), PHYSICAL_PRESENCE_PERSONAL_CARE,
  TRAVEL_AGENCY_RESALE, CULTURE_ARTS_SPORT_EVENT, RESTAURANT_CATERING,
  PASSENGER_TRANSPORT, REAL_ESTATE_RELATED, DEV_COOPERATION_HUMANITARIAN}`.
  For the location-keyed exceptions (c, d, e, f), the engine needs the
  **event/property/performance location** as an input distinct from
  customer location — e.g. `eventCountry`, `propertyCountry`,
  `serviceProviderCountry` (for a, b). This is a materially different
  input set than the default rule and must not silently fall back to
  customer country.
- **Notes / unresolved questions:** Categories (a) and (c) both hinge on
  "physical presence" of the recipient/attendee — CONTINUO needs to decide how
  a remote/hybrid event or a telehealth-style service maps onto these
  categories; the statute explicitly contemplates that (a)-type services
  can "exceptionally" be supplied remotely and still keep the
  provider-location rule, but this is a fact-specific test that should be
  confirmed with a tax advisor for any hybrid/remote product CONTINUO's
  customers might invoice for.

---

## 2. Place of supply for goods — Art. 7 MWSTG

- **Requirement:**
  - **Art. 7 Abs. 1 let. a** — where no dispatch/transport occurs, the
    place of supply is **where the goods are located** at the moment the
    power to dispose of them economically is transferred, the good is
    handed over, or it is made available for use.
  - **Art. 7 Abs. 1 let. b** — where the goods **are dispatched or
    transported** to the buyer (or to a third party on the buyer's
    instruction), the place of supply is **where that transport/dispatch
    begins**.
  - **Art. 7 Abs. 2** — for electricity via power lines, gas via the
    natural-gas grid, and district heat, the place of supply is instead
    the recipient's seat/establishment (or, absent one, the place of
    actual use/consumption) — i.e. these follow a recipient-style rule,
    not the goods-location rule.
  - **Art. 7 Abs. 3** — a supply of goods **from abroad into Switzerland**
    is deemed to take place **in Switzerland** (overriding the default
    origin rule) if the foreign supplier either (a) holds an ESTV
    authorization to import in its own name (Unterstellungserklärung) and
    does not waive it at the time of import, or (b) makes low-value
    consignment supplies (goods exempt from import tax under Art. 53 Abs.
    1 let. a due to the negligible tax amount) and generates at least CHF
    100,000/year in turnover from such supplies into Switzerland — this is
    Switzerland's distance-selling/low-value-goods rule, conceptually
    parallel to EU import-OSS thresholds.
- **Source:** Fedlex — MWSTG Art. 7 Abs. 1–3.
- **Source URL:** https://www.fedlex.admin.ch/eli/cc/2009/615/de (SR
  641.20, Art. 7).
- **Effective date:** Abs. 2 in force since 1 Jan 2018 (AS 2017 3575);
  Abs. 3 let. a in force since 1 Jan 2018, let. b since 1 Jan 2019 (AS
  2017 3575). Consolidated version verified: "Stand am 31. März 2025."
- **Verification date:** 2026-09-11 — verified live against the Fedlex
  consolidated text.
- **Implementation:** For goods lines, `PlaceOfSupplyEngine` needs
  `dispatchOriginCountry` (where transport begins, or where the good
  physically sits if not shipped), not customer country, as the primary
  signal — this is the opposite input shape from the services default
  rule and a common source of bugs if the engine is built services-first
  and goods are bolted on assuming the recipient principle applies. It
  also needs a `lowValueConsignmentSeller` / `Unterstellungserklärung`
  flag path for Art. 7 Abs. 3, which is specifically about **inbound**
  goods from abroad into Switzerland — relevant if CONTINUO is ever used by a
  foreign seller invoicing Swiss customers, not just by Swiss sellers
  invoicing abroad.
- **Notes / unresolved questions:** Confirm with a tax advisor whether any
  of CONTINUO's customers sell electricity/gas/heat (Art. 7 Abs. 2) — if not,
  this branch can be deprioritized but should stay flagged as
  out-of-scope rather than silently mis-defaulted to the goods-location
  rule.

---

## 3. Export of goods — Art. 23 MWSTG zero-rating and proof of export

### 3.1 What qualifies as an exempt export

- **Requirement:** Art. 23 Abs. 1 states that a supply exempted under this
  article carries **no domestic tax liability**. Abs. 2 lists the exempt
  categories; the one most relevant to a general invoicing product is
  Ziff. 1: **the supply of goods (other than making them available for
  use/rental) that are transported or dispatched directly abroad.** Other
  listed exemptions cover: use/rental of goods predominantly used abroad
  by the recipient (Ziff. 2); goods that were under customs supervision
  in transit/bonded-warehouse/temporary-admission/inward-processing
  procedures (Ziff. 3, 3bis); moving goods abroad unconnected to a supply
  (Ziff. 4); import- and export-related transport and ancillary services
  up to the destination (Ziff. 5, 6); certain cross-border logistics
  services (Ziff. 7); aircraft supplied to commercial international
  carriers and related supplies (Ziff. 8); intermediary/agent services for
  supplies that are themselves exempt or effected abroad (Ziff. 9); travel
  agency/event-organizer services bought in from abroad (Ziff. 10);
  airport duty-free supplies to departing/arriving travelers (Ziff. 11);
  investment gold (Ziff. 12); and platform-facilitated goods supplies
  where the platform is the deemed supplier under Art. 20a and is
  registered (Ziff. 13).
- **Requirement (direct export test):** Art. 23 Abs. 3 defines "direct
  export" (the Ziff. 1 test) as the goods leaving Switzerland for abroad
  **without having been put into use in Switzerland**, or being placed
  into an open customs warehouse/bonded warehouse; in chain transactions
  the direct-export characterization extends to all suppliers in the
  chain; the goods may be worked on or processed by agents of the
  non-taxable buyer before export without losing the exemption.
- **Source:** Fedlex — MWSTG Art. 23 Abs. 1–3 (Abs. 4 and 5 also reviewed:
  Abs. 4 lets the Federal Council exempt cross-border air/rail/bus
  transport; Abs. 5 delegates travel-retail export proof rules to the
  EFD).
- **Source URL:** https://www.fedlex.admin.ch/eli/cc/2009/615/de (SR
  641.20, Art. 23).
- **Effective date:** Ziff. 12 (gold) and Ziff. 13 (platform economy) were
  inserted effective 1 Jan 2025 (AS 2024 438); Ziff. 3bis in force since 1
  Jan 2018; other paragraphs largely stable since 2010 with the 1 Jan 2018
  refresh (AS 2017 3575). Consolidated version verified: "Stand am 31.
  März 2025."
- **Verification date:** 2026-09-11 — verified live against the Fedlex
  consolidated text.
- **Implementation:** `TaxDecision` for a goods line whose
  `dispatchOriginCountry == "CH"` and `destinationCountry != "CH"` should
  resolve to `EXPORT_ZERO_RATED` only once (a) the direct-export test is
  met (no intermediate use in Switzerland) and (b) proof of export exists
  or is expected to be obtainable (see 3.2) — otherwise it must fall back
  to domestic taxation per Art. 23 Abs. 3's implicit condition and the
  BAZG guidance in 3.2. Note this exemption is an **"echte Befreiung"**
  (zero-rating with input-tax deduction preserved), which is legally
  distinct from the "unechte" exclusions from tax under Art. 21 (not
  covered in this document) — CONTINUO's rate/exemption-code model must not
  conflate the two, since input-VAT recovery treatment differs.
- **Notes / unresolved questions:** Ziff. 9 and 10 (intermediary and
  travel-agency/event-organizer exemptions) are services, not goods,
  despite sitting inside the goods-export article — flag this for the
  engine's classification layer so it doesn't assume "Art. 23" implies
  "goods only."

### 3.2 Proof of export required to keep the zero rate

- **Requirement:** A Swiss exporter must be able to document the export to
  retain the Art. 23 exemption. Standard accepted proof is the
  **electronic export customs assessment decision (e-dec Export /
  Ausfuhrveranlagungsverfügung) with digital signature**, generated and
  archived by BAZG during the export declaration process. If this (or
  equivalent evidence — e.g. the customs-stamped tobacco declaration form
  11.44 for that specific goods category, or a customs-confirmed
  travel-retail export document for traveler exports) cannot be produced,
  **the supply must instead be taxed domestically at the standard Swiss
  VAT rate** — the zero rating is not automatic just because the goods
  physically left the country.
- **Source:** BAZG (Federal Office for Customs and Border Security) —
  "Mehrwertsteuer: Steuerbefreite Lieferung wegen Ausfuhr."
- **Source URL:** https://www.bazg.admin.ch/de/mehrwertsteuer-steuerbefreite-lieferung-bei-ausfuhr
- **Effective date:** Not stated as a discrete date on the page; reflects
  current BAZG e-dec Export procedure.
- **Verification date:** 2026-09-11 — verified live.
- **Implementation:** `EXPORT_ZERO_RATED` should be treated by CONTINUO as a
  **provisional/conditional** classification until export-proof evidence
  is attached to the invoice/shipment record — e.g. an
  `exportProofStatus` field (`PENDING`, `DOCUMENTED`, `MISSING`) distinct
  from the tax-rate decision itself, so the system can flag invoices that
  claimed the zero rate but never got a matching export document, which
  is an audit and re-assessment risk for the customer.
- **Notes / unresolved questions:** CONTINUO does not currently integrate with
  BAZG's e-dec/Passar export-declaration systems (per repository search —
  no export-declaration integration exists yet), so in practice
  `exportProofStatus` will likely start as a manual attestation field.
  This should be flagged to the customer/advisor as a compliance gap, not
  silently assumed to be handled.

---

## 4. B2B vs. B2C treatment for cross-border services

- **Requirement:** Swiss law's default services rule (Art. 8 Abs. 1) uses
  a **single test** — the recipient's location — for both business and
  private customers, but the location marker it reads differs by customer
  type: for a business recipient it is the seat of economic activity or
  the relevant permanent establishment; for a private individual it is
  domicile or habitual abode. So `customerType` (business vs. private) is
  not a separate branch of the core rule, but it **is** a required input,
  because it determines which field on the customer record the engine
  must trust (registered business address vs. personal domicile), and
  because several of the Art. 8 Abs. 2 exceptions are implicitly
  B2C-shaped (let. a: services "typically supplied directly to a
  physically present natural person") even though the statute does not
  gate them on legal form of the customer. Separately, on the **reverse
  charge** side (§5), Art. 45 Abs. 1 let. a explicitly **excludes**
  telecom and electronic services supplied to **non-taxable** (i.e.
  typically private/B2C) recipients from the Bezugsteuer mechanism — for
  that category, a foreign digital-service provider is expected to
  register and charge Swiss VAT directly once it crosses the CHF 100,000
  global-turnover registration threshold (Art. 10), rather than the Swiss
  private customer self-assessing. That is a genuine B2B/B2C fork the
  engine must implement.
- **Source:** Fedlex — MWSTG Art. 8 Abs. 1–2, Art. 45 Abs. 1 let. a, Art.
  10 (registration threshold, referenced but not itself detailed in this
  document — see `swiss-vat.md` when written).
- **Source URL:** https://www.fedlex.admin.ch/eli/cc/2009/615/de (SR
  641.20, Art. 8, Art. 45, Art. 10).
- **Effective date:** Art. 45 Abs. 1 let. a in its current form dates to
  the 1 Jan 2018 revision (AS 2017 3575). Consolidated version verified:
  "Stand am 31. März 2025."
- **Verification date:** 2026-09-11 — verified live against the Fedlex
  consolidated text.
- **Implementation:** `customerType` must be a required, non-defaulted
  input to `PlaceOfSupplyEngine` — `BUSINESS` vs. `PRIVATE_INDIVIDUAL` (a
  business without a foreign VAT/UID number reasonably evidenced should
  probably not be auto-classified as `BUSINESS` by the engine; that
  determination itself deserves advisor input). It feeds: (a) which
  location field is authoritative for Art. 8 Abs. 1, (b) eligibility for
  the Abs. 2 let. a exception, and (c) whether a cross-border digital
  service resolves to `REVERSE_CHARGE_BEZUGSTEUER` (B2B, Swiss recipient
  self-assesses) or `FOREIGN_SUPPLIER_REGISTRATION_EXPECTED` (B2C digital
  services, foreign supplier should be the one charging Swiss VAT — not
  actionable by CONTINUO's engine beyond flagging it, since CONTINUO cannot
  verify a third-party foreign supplier's own registration status).
- **Notes / unresolved questions:** How CONTINUO verifies `customerType` in
  practice (VAT/UID number validation, self-declaration, CRM company
  record vs. contact record) is a product decision, not a legal one, but
  it needs a documented default and that default should be conservative
  (treat unverified as needing review) rather than optimizing for
  fewer flags.

---

## 5. Reverse charge (Bezugsteuer) and "outside scope" vs. "0% VAT"

### 5.1 When a Swiss recipient must self-assess (Bezugsteuer, Art. 45 ff.)

- **Requirement:** Under Art. 45 Abs. 1, Swiss acquisition tax
  (Bezugsteuer) is owed on, among other things (let. a): **services whose
  place of supply under Art. 8 Abs. 1 is Switzerland, supplied by a
  business seated abroad that is not entered in the register of taxable
  persons** — with a carve-out for telecom/electronic services to
  non-taxable recipients (see §4). Art. 45 Abs. 2 makes the **recipient**
  liable for this tax if the recipient is (let. a) already VAT-registered
  under Art. 10, or (let. b) acquires more than **CHF 10,000** of such
  services in a calendar year even if not otherwise VAT-registered. Art.
  45a excludes from Bezugsteuer any service that would itself be exempt
  (Art. 21) or zero-rated (Art. 23) if supplied domestically. Art. 46
  applies the ordinary Art. 24/25 rate and valuation rules; Art. 47 sets
  the tax period (aligned to the recipient's normal VAT period if already
  registered, else the calendar year); Art. 48 fixes when the Bezugsteuer
  liability arises (generally on payment of the consideration, or receipt
  of invoice for agreed-consideration accounting); Art. 49 applies the
  ordinary joint-liability/succession/substitution rules by reference to
  Art. 15–17.
- **Source:** Fedlex — MWSTG Art. 45–49, and ESTV "Steuerpflicht:
  Bezugsteuer bei der Mehrwertsteuer."
- **Source URL:** https://www.fedlex.admin.ch/eli/cc/2009/615/de (SR
  641.20, Art. 45–49); https://www.estv.admin.ch/estv/de/home/mehrwertsteuer/mwst-steuerpflicht/mwst-bezugsteuer.html
- **Effective date:** Art. 45 Abs. 1 let. e (emission rights/certificates)
  inserted effective 1 Jan 2025 (AS 2024 438); most of Art. 45–49's
  current structure dates to the 1 Jan 2018 revision (AS 2017 3575).
  Consolidated version verified: "Stand am 31. März 2025."
- **Verification date:** 2026-09-11 — verified live against both the
  Fedlex consolidated text and the ESTV Bezugsteuer guidance page.
- **Implementation:** When `PlaceOfSupplyEngine` resolves a service's
  place of supply to Switzerland (Art. 8 Abs. 1, recipient-principle) but
  the **supplier** is foreign and not on the Swiss taxable-persons
  register, `TaxDecision` should route to `REVERSE_CHARGE_BEZUGSTEUER`
  rather than either "no VAT" or a Swiss-seller output rate — this case is
  about a **purchase** CONTINUO's customer is making (an input, not an
  invoice CONTINUO's customer issues), so this logic sits on the
  accounts-payable / expense side of the product, not just on outbound
  invoicing. It needs: `supplierCountry`, `supplierIsSwissRegistered`
  (boolean/lookup), `recipientIsSwissVatRegistered`, and a running
  `annualForeignServiceAcquisitions` total to test the CHF 10,000
  threshold for otherwise-unregistered recipients.
- **Notes / unresolved questions:** Confirm whether CONTINUO's product scope
  even includes purchase-side/AP invoicing (Bezugsteuer is fundamentally
  about what a Swiss buyer owes, not what a Swiss seller charges) — if
  CONTINUO is sales-invoicing-only today, this section should still ship as
  documentation so the gap is deliberate, not accidental.

### 5.2 Why "foreign customer ⇒ 0% Swiss VAT" is wrong, and what the correct Swiss-side treatment is

- **Requirement:** When Art. 7 or Art. 8 places the supply **abroad**, the
  supply is not "taxed at 0% in Switzerland" — it is **outside the scope
  of the Swiss Inlandsteuer entirely** (Art. 1 Abs. 2 let. a MWSTG limits
  domestic tax to supplies rendered *in Switzerland* against payment; a
  supply whose place of supply is abroad never falls inside that base in
  the first place). This is legally distinct from Art. 23 zero-rating
  (§3), which is a **statutory exemption of an otherwise-domestic supply**
  that preserves the seller's Swiss input-tax deduction right. The two
  produce the same "no Swiss VAT charged" line on an invoice but rest on
  different legal bases, different documentation duties (Art. 23 needs
  export proof; "outside scope" needs correct place-of-supply
  determination, not export proof), and — critically for this
  document — neither one says anything about whether **another
  country's** VAT/GST now applies. A Swiss seller does **not** generally
  need to register for VAT in a B2B customer's country merely because the
  place of supply is there: most jurisdictions' own B2B reverse-charge
  rules (mirroring Switzerland's own Bezugsteuer mechanism) shift the
  compliance burden to the foreign business customer, not the Swiss
  seller. That non-obligation is a feature of the **foreign** jurisdiction's
  law, though — Swiss ESTV sources do not, and cannot, confirm it for
  every country, which is exactly why §6 exists.
- **Source:** Fedlex — MWSTG Art. 1 Abs. 2 let. a (Inlandsteuer scope),
  Art. 8 (place of supply), Art. 23 (zero-rating), read together; cf.
  `switzerland.md`'s existing "Forbidden shortcuts" rule against treating
  "VAT 0%" as one concept.
- **Source URL:** https://www.fedlex.admin.ch/eli/cc/2009/615/de (SR
  641.20, Art. 1, Art. 8, Art. 23).
- **Effective date:** Art. 1 Abs. 2 let. b (Bezugsteuer clause) last
  amended effective 1 Jan 2025 (AS 2024 438); Art. 1's basic structure
  dates to 2010.
- **Verification date:** 2026-09-11 — verified live against the Fedlex
  consolidated text.
- **Implementation:** `TaxDecision` needs distinct output values —
  `OUTSIDE_SCOPE_FOREIGN_SUPPLY` (Art. 8/7 places supply abroad; no Swiss
  VAT ever applied; no export-proof requirement) vs. `EXPORT_ZERO_RATED`
  (Art. 23; domestic supply of goods statutorily exempted; export-proof
  required) vs. `REVERSE_CHARGE_BEZUGSTEUER` (§5.1) — and the invoice
  rendering layer must not collapse all three into a single "0%" line
  without the underlying legal-basis code, since the customer's own
  bookkeeping and any ESTV audit will need to see which one applied.
  Whichever of the first two outcomes fires for a **B2B foreign
  customer**, the engine should also evaluate whether a
  `FOREIGN_TAX_REVIEW_REQUIRED` flag (§6) should attach — the Swiss
  classification and the foreign-exposure flag are independent outputs,
  not alternatives.
- **Notes / unresolved questions:** None outstanding on the Swiss-law
  side; this section exists specifically to prevent the "foreign customer
  = 0% VAT, done" shortcut that `switzerland.md` already forbids at the
  document-set level.

---

## 6. Foreign VAT/GST exposure — out of scope for ESTV sources, flag only

**This subsection is explicitly non-authoritative.** Everything above is
grounded in Swiss federal sources (ESTV, Fedlex, BAZG) as required by this
document set's sourcing rules. Foreign VAT/GST registration thresholds —
EU distance-selling and the One-Stop-Shop (OSS/IOSS) regime, UK VAT
registration for non-established sellers, and equivalent rules in any
other country a Swiss business might sell into — are **not** Swiss ESTV
subject matter, are not sourced from estv.admin.ch/fedlex.admin.ch/bazg.admin.ch,
and were deliberately **not researched in depth** for this document,
consistent with the task's authoritative-source restriction. Anything
stated below is background awareness only, not a sourced requirement, and
must never be hard-coded into `TaxDecision` logic as if it were verified
Swiss guidance.

- **What a Swiss seller should be aware of (unverified, for awareness
  only):** Selling goods to EU consumers can trigger EU distance-selling
  VAT obligations once a low, EU-wide combined threshold is crossed,
  historically mitigated by registering for the EU's One-Stop-Shop (OSS)
  or Import-One-Stop-Shop (IOSS) scheme rather than registering in every
  member state individually. Selling to UK customers (goods or certain
  digital services) can trigger UK VAT registration obligations for a
  non-established seller, in some cases from the first sale with no
  threshold at all for overseas sellers of goods already in the UK, and
  under separate rules for low-value goods imported into the UK. Digital
  /electronic services sold to consumers in many countries can trigger
  registration in that country from the first sale, independent of any
  general goods threshold. None of these figures, thresholds, or
  mechanisms should be treated as current or authoritative by this
  codebase — they change frequently and are controlled entirely by
  non-Swiss authorities.
- **Source:** None — deliberately not sourced to a Swiss authority; flagged
  here only so engineers do not assume ESTV silence means "no foreign
  obligation exists."
- **Source URL:** Not applicable.
- **Effective date:** Not applicable.
- **Verification date:** Not applicable — not verified; do not treat as
  current.
- **Implementation:** `PlaceOfSupplyEngine`/`TaxDecision` must never emit
  a confident foreign-jurisdiction tax classification (no "EU_OSS_APPLIES,"
  no "UK_VAT_REQUIRED," etc.). Instead, whenever the Swiss-side
  classification is `OUTSIDE_SCOPE_FOREIGN_SUPPLY` or
  `EXPORT_ZERO_RATED` **and** the customer's country is non-Switzerland,
  the engine should attach a `FOREIGN_TAX_REVIEW_REQUIRED` flag to the
  invoice/customer record, carrying at minimum: destination country,
  supply type (goods/services), customer type (B2B/B2C), and a running
  total of the seller's supplies into that country (many foreign
  thresholds are cumulative-turnover-based) so a human or advisor
  integration can evaluate exposure. The flag is a signal for human/advisor
  follow-up, not an input to further automated tax logic.
- **Notes / unresolved questions:** If CONTINUO later wants to give customers
  more than a bare flag here (e.g. an actual EU OSS/UK-threshold
  estimator), that is a **separate, dedicated research and sourcing
  effort** against the relevant foreign authorities (EU Commission/VAT
  Committee sources, HMRC, etc.), scoped and reviewed independently of
  this Swiss-sourced document set — it should not be bolted onto
  `PlaceOfSupplyEngine` under the assumption that Swiss-side correctness
  implies foreign-side correctness.

---

## Summary: suggested `TaxDecision` outcomes for cross-border lines

For engineering reference only (not itself a sourced requirement — derived
from §§1–6 above):

| Outcome | Fires when | Swiss VAT charged? | Extra obligations |
|---|---|---|---|
| `DOMESTIC_STANDARD` / `DOMESTIC_REDUCED` | Place of supply (Art. 7/8) is Switzerland, ordinary domestic sale | Yes | Normal invoicing rules (see `swiss-vat.md`) |
| `EXPORT_ZERO_RATED` | Goods, direct export per Art. 23 Abs. 2 Ziff. 1 & Abs. 3 | No (0%, exemption) | Export proof required (§3.2); input VAT still deductible |
| `OUTSIDE_SCOPE_FOREIGN_SUPPLY` | Art. 7/8 places supply abroad | No — not "0%," simply out of scope | No export-proof duty; consider `FOREIGN_TAX_REVIEW_REQUIRED` |
| `REVERSE_CHARGE_BEZUGSTEUER` | Swiss recipient buys a service from an unregistered foreign supplier, Art. 8 Abs. 1 places it in Switzerland | Recipient self-assesses (not the seller) | CHF 10,000/yr threshold logic for unregistered recipients (§5.1) |
| `FOREIGN_TAX_REVIEW_REQUIRED` | Flag, not a standalone outcome — attaches to `EXPORT_ZERO_RATED` or `OUTSIDE_SCOPE_FOREIGN_SUPPLY` for non-CH customers | N/A | Human/advisor review of foreign obligations (§6) |

---

## Open items for advisor review

1. Confirm CONTINUO's intended evidentiary standard for `customerCountry` and
   `customerType` inputs (§1.1, §4) — not specified by statute.
2. Confirm whether hybrid/remote events or remote personal-care-style
   services should map to the Art. 8 Abs. 2 let. a/c exceptions or fall
   back to the Art. 8 Abs. 1 default (§1.2).
3. Confirm whether CONTINUO's product scope includes purchase-side (AP)
   invoicing, which is where Bezugsteuer logic (§5.1) actually lives.
4. Confirm export-proof workflow (§3.2) — CONTINUO has no BAZG e-dec/Passar
   integration today; decide whether `exportProofStatus` starts as a
   manual attestation and what that implies for audit risk.
5. Decide whether/when to commission a separate, foreign-authority-sourced
   research effort for the `FOREIGN_TAX_REVIEW_REQUIRED` flag's downstream
   handling (§6) — out of scope for this document by design.
