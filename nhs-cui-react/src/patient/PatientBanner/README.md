# PatientBanner

Desktop patient banner that identifies the patient whose record is open, with a collapsible second zone for address, contact details and allergy status.

## When to use

- At the top of every screen that shows one patient's record, full width, below the title bar and global navigation (PAB-0009, PAB-0012).
- Not on screens that show information about more than one patient, such as patient lists or ward views (PAB-0015).
- On hand-held devices use `MicroPatientBanner` instead.

## What you provide

- `name` (family, given, title), `dateOfBirth`, `gender` (current gender), `nhsNumber`. Missing items show "Not Known".
- `preferredName` (given name only), `dateOfDeath` (switches to the deceased state).
- `address` (with `type`, default "Usual address"; `noFixedAddress: true` shows "No fixed address"), `contacts` (home, work, mobile, email). From an `AddressInput` value use `{ type, ...addressInputToValue(value, region) }`.
- `allergies` `{ status, items }`; when omitted the banner shows "Allergies unavailable".
- `showClinicalInformation={false}` for users who must not see clinical information.
- `section3` and `section4` for local content such as risks.
- `onOpenRecord(item)` to make Zone 1 values and "View all ..." links open the record.

```tsx
<PatientBanner
  name={{ familyName: 'Chandrasekhar', givenName: 'Subramanyan', title: 'Mr' }}
  preferredName="Rama"
  dateOfBirth="1945-07-14"
  gender="Male"
  nhsNumber="9990000018"
  address={{ type: 'Usual address', lines: ['340 Gloucester Road', 'Walton'], town: 'Tewkesbury', postcode: 'GL20 4RT' }}
  contacts={{ home: '020 8123 4567', mobile: '07700 900555', email: 'rama@example.com' }}
  allergies={{ status: 'known', items: [{ name: 'Latex', lastUpdated: '1961-11-14' }] }}
  onOpenRecord={(item) => navigate(item)}
/>
```

## Guidance implemented

- PAB-0001, PAB-0073, PAB-0074 [M/R]: Zone 1 always; Zone 2 shown by default (`showZone2`).
- PAB-0004, PAB-0075, PAB-0006 [M]: Zone 2 collapsed by default; one toggle expands and collapses all five sections together.
- PAB-0005, PAB-0032 [M]: five Zone 2 sections; section 5 is reserved for allergies, sections 3 and 4 are free (`section3`, `section4`).
- PAB-0007 [M]: tooltip "Click to expand for more detail" over collapsed Zone 2.
- PAB-0008 [M]: `showClinicalInformation={false}` removes the allergy section.
- PAB-0009..0014 [M/R]: horizontal, full width, sticky at the top of its scroll container (`sticky`), dark banner background plus a thick border.
- PAB-0016, PAB-0022, PAB-0076 [M]: name, Born, Gender, NHS No. in that display and tab order, all in Zone 1.
- PAB-0017, PAB-0023 [M]: living patients show the age in Zone 1.
- PAB-0018, PAB-0024, PAB-0057..0060, PAB-0063 [M]: deceased patients show "Died" and "Age at Death" directly below "Born", labels left-aligned, no parentheses, no living age.
- PAB-0019 [M]: unknown items show "Not Known" after the label; "?" and "-" are never shown, even if supplied.
- PAB-0020, PAB-0037, PAB-0054, PAB-0061, PAB-0062 [R/M]: preferred name (given-name portion) below the name, labelled "Preferred name"; without it the name block is vertically centred.
- PAB-0021 [R]: no photograph prop.
- PAB-0025, PAB-0028, PAB-0040, PAB-0041 [M/R]: collapsed titles "Address ..." and "Phone and email ..." on one line, cut with an ellipsis; a cut title carries its full text as a tooltip.
- PAB-0026, PAB-0027 [M]: expanded address in full with postcode, preceded by its type label.
- PAB-0029, PAB-0030 [M]: Home, Work, Mobile, Email in that order with those labels.
- PAB-0033..0039, PAB-0042, PAB-0043 [M/R]: labels "Born", "Gender", "NHS No.", "Preferred name", "Died", "Age at Death", no colons.
- PAB-0034 [M]: "Born 14-Jul-1945 (81y)", dates dd-Mmm-yyyy, age in two units (Tables 7-8).
- PAB-0044..0046 [M]: labels in small muted label style; values semibold and larger.
- PAB-0047 [R]: every Zone 1 label has a keyboard-accessible definition tooltip (texts in `PATIENT_BANNER_DEFINITIONS`, overridable with `definitions`).
- PAB-0048, PAB-0066 [R/M]: `onOpenRecord` makes values buttons with the tooltip "Click here to open this section of the record." and adds "View all addresses", "View all contact details" and "View all allergies" (not for "Allergies unavailable").
- PAB-0049..0053 [M]: name as "CHANDRASEKHAR, Subramanyan (Mr)" via `PatientNameDisplay`, never truncated.
- PAB-0055, PAB-0056 [M]: deceased Zone 1 changes colour (light instead of dark) and adds a diagonal hatch; a dashed outline is drawn in forced-colours mode.
- PAB-0064..0072 [M]: the four exact allergy titles; "Known allergies" in an emphasised badge with a filled "A" icon; "No known allergies" in data style with an outlined icon; "Allergies not recorded" in label style with a dashed icon; "Allergies unavailable" in label style with a struck-through icon. Expanded: each allergy with its last-updated date.

Where the source documents disagree (the safer option is used):

- Banner label "Gender" (PAB-0035, mandatory for banners) is kept rather than "Current Gender" (CGS-0007); the definition tooltip explains that it is the current gender. `GenderDisplay` elsewhere defaults to "Current Gender".
- Age arithmetic is not specified beyond examples: ages use whole calendar months and days, rounded down, "hrs" as in the banner examples ("26hrs"), and a 29 February birthday reaches its anniversary on 1 March in non-leap years [suggested].
- Colours, patterns and icons are left to the designer: the deceased state changes brightness and adds a pattern so it differs without colour vision; allergy icons differ by shape (filled, outlined, dashed, struck through), not just colour [suggested].

[suggested] additions:

- When `allergies` is not supplied the status is "Allergies unavailable", never blank, so a missing feed is visible.
- The section has the accessible name "Patient banner: NAME" plus ", deceased" when applicable.
- An NHS Number that is not ten digits or fails Modulus 11 is shown exactly as supplied with "not a valid NHS Number".
- G12 (identity extensions):
  - AU Medicare valid to: identifiers take `medicareValidTo`; "Valid to 09/2026" and "Card expired"/"Card expires soon" in text.
  - AU My Health Record (AU-PV-01, AU-PV-02): `myHealthRecord` shows `MyHealthRecordStatus` compact below the name, with "Access options" for code entry and emergency access, and a persistent emergency access indicator with its end time.
  - NZ protection flags (HISO 10046): `nameProtected` keeps the name visible with "Name protected"; `address.protected` and `contacts.protected` mask Zone 2 ("Protected" in the collapsed title, masked body) and `onRevealProtected(item, reason)` offers a reveal with a reason [suggested].
  - NZ dormant NHI: identifiers take `nhiStatus` and `liveNhi`; `onUseLiveNhi` adds "Use live NHI".
  - Partial date of birth: `partialDateOfBirth` (or a year-only or year-month `dateOfBirth` string) shows "1975 year only (50y or 51y)" and never an invented day; age at death uses the same rule.

## Host extensions [suggested]

Generic additions for hosts that must keep more in view with the identity (contributable; nothing here is specific to one service):

- `items`: further labelled Zone 1 items (`label`, `value`, `definition`, `tone` "alert" / "warning" / "muted", `symbol`, `onSelect` with `selectLabel`, `placement` "after-born" or after the identifiers). With items the identifier grid flows and wraps between items, never inside a value; each item carries `data-banner-item`. Tones reuse the known-allergy badge and the dashed "Not recorded" outline, so they keep verified contrast on the banner colour.
- `nameExtension` (beside the name, e.g. a preferred name and pronouns), `nameContent` (a host-rendered name that still reads "FAMILY, Given"), `leading` (before the name; PAB-0021 still recommends no photograph), `actions` (end of Zone 1).
- `showGender={false}` for a host that shows sex in its own words as an item placed "after-born"; `requirePrimaryIdentifier={false}` when the host's record number, shown as an item, is its primary identifier.
- `dateOfBirthDisplay` and `dateOfDeathDisplay` for values the host formats itself; Age at Death is then shown only when it can be computed.
- `similarNameWarning` accepts a node, so the warning can link to a comparison of the patients.
- Allergy items may omit `lastUpdated`; no date is then shown.

## Do and don't

- Do render exactly one banner, only when a single patient's record is open.
- Do pass `showClinicalInformation={false}` for non-clinical roles.
- Don't put the banner beside a patient list or on multi-patient screens.
- Don't pass placeholder strings such as "?" or "N/A" for missing data; pass `null`.
- Don't restyle the deceased state to rely on colour alone.

## Accessibility

- A `section` landmark named after the patient.
- Zone 1 tab order: name, Born, Gender, NHS No., then Died and Age at Death (PAB-0076). Definition tooltips open on focus and hover and close with Esc.
- The Zone 2 toggle is a button with `aria-expanded` and `aria-controls`; clicking anywhere on the collapsed title row also toggles it for mouse users.
- Allergy icons are decorative (`aria-hidden`); the status text carries the meaning.
- "Born" and "Died" are used instead of "DoB"/"DoD", which screen readers mispronounce.

## Regional behaviour

Set the region with `ClinicalLocaleProvider` or the `region` prop. GB behaviour is unchanged.

| | GB | AU | NZ |
|---|---|---|---|
| Identifiers in Zone 1 | NHS No. (PAB-0036) | IHI, then URN; Medicare with IRN and DVA as secondary (G10 1.6, AU-PI-01) | NHI (G11 12.6) |
| Family name | UPPER CASE | UPPER CASE (AU-PI-02) | as recorded, shown bolder (G11 2.3, [UNCERTAIN], `familyNameCase` to change) |
| Title | shown | hidden by default (AU-PI-02, `showTitle`) | shown [suggested] |
| Single name | "SMITH, Not Known" | name alone (AU-NM-01) | name alone (HISO 10046) |
| Gender | CUI values | ABS 2020 labels from METeOR codes | HISO 10046 F, M, O, U; te reo labels with `teReoLabels` |
| Allergies | PAB-0064 wording | "Allergies Nil known", "Allergies Unknown", "Allergies Not recorded" (AU-AL-01); not recorded and unknown look like warnings | "No known allergies or adverse reactions", "Allergies Unknown", "Allergies Not recorded" ([UNCERTAIN] wording) |

- Pass identifiers as `identifiers={[{ type: 'ihi', value, ihiRecordStatus }, { type: 'mrn', value }, { type: 'medicare', value, irn }]}`. The primary identifier is always shown, as "Not Known" if absent. `identifierTypes` changes the order or set.
- AU-ID-01: IHI status shown in words, e.g. "(Unverified)". AU-ID-03: Medicare always with "IRN n".
- NZ: Z-range test NHIs are flagged "Test NHI" unless `flagTestIdentifiers={false}`.
- AU and NZ: when allergy items are supplied the status is shown as known whatever was passed, so a list is never hidden and an empty list is never shown as "no known" (G11 9.2). `recordedBy` and `recordedAt` show who recorded the status and when (HQSC: sign even for "No"; AU-AL-01). Items can carry `reaction` and `newThisAdmission` (HQSC NMC).
- `allergyLabels` overrides wording, e.g. AU `{ 'none-known': 'No known allergies' }` for the EMM wording (AU-AL-01 C).
- `dateFormat="dd/mm/yyyy"` matches AU wristbands and labels (AU-PI-03, C); default stays dd-Mmm-yyyy.
- `similarNameWarning` shows a same or similar name warning with an icon (AU-PI-04; EMM business requirements 3.3).
- `unidentified` adds an "Unidentified patient" qualifier so a placeholder name is never read as a real name (AU-NM-02, G11 2.5).
- Addresses and telephone numbers in Zone 2 follow the region (see `AddressDisplay`, `TelephoneNumberDisplay`).
- [suggested] The allergy title wraps instead of being cut, so the safety wording is never truncated.
- Not built: AU red ID band indicator (AU-AL-04 C, use `section3`), My Health Record access states (AU-PV-01/02), NZ name protection flag and dormant NHI linkage ([UNCERTAIN] in the notes), sex recorded at birth in Zone 2 (pass it in `section3` with `GenderDisplay kind="sex"`).
- Sources: G10 sections 1-4 and 10; G11 sections 1-3, 9 and 12.6.
- G12 additions: AU Medicare valid to and My Health Record; NZ protection flags, dormant NHI and partial dates of birth. Sources in `docs/guidance-notes/G12-identity-extensions.md`.

## Narrow screens [suggested]

The banner is a size container (CONVENTIONS "Responsive"). Below 960px zone 1 wraps and the identifiers flow as a wrapping line; below 720px it shows the same essentials as MobilePatientHeader (name, Born, Gender, identifiers and the allergy status), the other zone 2 titles appear when expanded, wrap in full, and the expanded sections stack, allergies first. The toggle's track grows with the 44px coarse-pointer toggle, so it never pushes the banner wider than its container. Names and identifier numbers are never split or truncated; an identifier's flag may wrap below it. Nothing scrolls sideways at 320px.
