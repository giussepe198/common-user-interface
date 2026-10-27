# Australian localisation (AU profile)

Purpose: the Australian standards, national guidance and conventions that an NHS CUI-derived React control library must follow (or be configurable to follow) to be appropriate for use in Australian healthcare. This note is the AU counterpart to G1 to G9; where an Australian rule conflicts with NHS CUI guidance it is flagged **[AU OVERRIDE]**.

Research date: 27-Oct-2026. Sources are primary Australian sources unless marked otherwise. Confidence markers:
- **[VERIFIED]**: read directly from the cited primary source during research.
- **[SECONDARY]**: taken from a secondary or derivative source (e.g. HL7 AU FHIR IG, state health service document, vendor validation docs) that restates the primary rule.
- **[UNCERTAIN]**: from domain knowledge or a source that could not be fully read; must be checked against the primary source before the control is released.

Normative keywords: "M" = must, "R" = recommended (should), "C" = configurable (the library must expose a setting because jurisdictions or organisations differ).

Cross-cutting rules:
- AU-X-01 (M): Every locale-dependent behaviour in this note is driven by a `locale="en-AU"` profile, not hard-coded, so the same controls can run in NHS (en-GB) mode.
- AU-X-02 (M): Spelling in UI strings follows Australian English (e.g. "colour", "organisation", "paediatric", "haemoglobin"). Medicine names follow AMT/Australian Approved Names (e.g. "paracetamol", "adrenaline", "furosemide (frusemide)" where a dual name is current).
- AU-X-03 (M): All validators described below are advisory on display and blocking on data entry only where the rule is a check digit or fixed structure. Never silently "correct" an identifier.

---

## 1. Patient and provider identifiers

### 1.1 Individual Healthcare Identifier (IHI)

Legislation: Healthcare Identifiers Act 2010 (Cth). Operator: Services Australia (HI Service).

| Property | Rule | Status |
|---|---|---|
| Length | Exactly 16 numeric digits | [VERIFIED] HL7 AU Base inv-ihi-value-0 |
| Prefix | First 6 digits `800360` (issuer identification number assigned under ISO/IEC 7812) | [VERIFIED] inv-ihi-value-1 |
| Check digit | Digit 16 is a Luhn (mod 10) check digit computed over all 16 digits; sum mod 10 = 0 | [VERIFIED] inv-ihi-value-2 |
| Regex | `^800360[0-9]{10}$` plus Luhn | derived |
| FHIR system | `http://ns.electronichealth.net.au/id/hi/ihi/1.0` | [VERIFIED] |
| Display grouping | Four groups of four: `8003 6012 3456 7894` | [UNCERTAIN] common practice in AU clinical software and on Medicare/myGov displays; no primary display rule was found. Library default; C. |
| Example (valid Luhn, synthetic) | `8003601234567894` | computed |

Source: https://hl7.org.au/fhir/5.0.0/StructureDefinition-au-ihi.html

IHI status values (HI Service), must be displayable as a qualifier next to the number:
- IHI number status: `Active`, `Deceased`, `Retired`, `Expired`, `Resolved` [SECONDARY] https://hl7.org.au/fhir/2018Mar/CodeSystem-ihi-status.html
- IHI record status: `Verified`, `Unverified`, `Provisional` [SECONDARY] (same IG, CodeSystem ihi-record-status).
- AU-ID-01 (M): An IHI whose number status is not `Active` or whose record status is not `Verified` must be visually qualified (text label, not colour alone), e.g. `8003 6012 3456 7894 (Unverified)`.
- AU-ID-02 (R): ACSQHC NSQHS Action 6.05 guidance: "Where the My Health Record system is in use, include the national unique IHI as a patient identifier." [VERIFIED] https://www.safetyandquality.gov.au/node/3739

Luhn algorithm (reference implementation for IHI, HPI-I, HPI-O):
```
function luhnValid(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits.charCodeAt(digits.length - 1 - i) - 48;
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}
```

### 1.2 HPI-I and HPI-O (provider identifiers)

| Identifier | Prefix | Length | Check | FHIR system | Example (synthetic, Luhn-valid) |
|---|---|---|---|---|---|
| HPI-I (individual practitioner) | `800361` | 16 | Luhn | `http://ns.electronichealth.net.au/id/hi/hpii/1.0` | `8003611234567893` |
| HPI-O (organisation) | `800362` | 16 | Luhn | `http://ns.electronichealth.net.au/id/hi/hpio/1.0` | `8003621234567892` |

Status: prefixes and Luhn [SECONDARY] (HL7 AU Base au-hpii / au-hpio profiles, https://hl7.org.au/fhir/StructureDefinition-au-hpii.html); system URIs [UNCERTAIN] (pattern-consistent with the IHI URI; confirm in the IG). Display grouping 4-4-4-4 as IHI [UNCERTAIN].

Related provider identifiers the library should also support (display and validation):
- **Medicare provider number** [SECONDARY] (https://air.claiming.com.au/docs/validation-and-checks/): 8 characters = 6-digit stem + 1 practice location character (PLC) + 1 check character. PLC values: `0`-`9` = 0-9; `A`-`Y` excluding `I`, `O`, `S` = 10-31 in alphabetical order. Check: (d1x3 + d2x5 + d3x8 + d4x4 + d5x2 + d6x1 + PLVx6) mod 11, remainder mapped `0=Y 1=X 2=W 3=T 4=L 5=K 6=J 7=H 8=F 9=B 10=A`. Display without spaces, e.g. `2426621B`.
- **Ahpra registration number** [UNCERTAIN]: 3-letter profession prefix + 10 digits, e.g. `MED0001234567` (MED medical, NMW nursing and midwifery, PHA pharmacy, etc.). Display as issued, no spaces.

### 1.3 Medicare card number

| Property | Rule | Status |
|---|---|---|
| Structure | 10 digits on the card: digits 1-8 identifier, digit 9 check digit, digit 10 card issue number | [SECONDARY] air.claiming.com.au |
| First digit | 2 to 6 | [UNCERTAIN] widely used in validators; not confirmed from Services Australia text |
| Check digit | (d1x1 + d2x3 + d3x7 + d4x9 + d5x1 + d6x3 + d7x7 + d8x9) mod 10 = d9 | [SECONDARY] |
| Issue number | Digit 10, must not be 0 | [SECONDARY] |
| Individual Reference Number (IRN) | Single digit 1-9 printed to the left of each person's name on the card; identifies the individual on a family card. Not part of the 10-digit number, store separately | [UNCERTAIN] (Services Australia practice; HL7 AU Base models it as a separate 11th character in the "Medicare card number with IRN" form) |
| Valid to | Printed on card as `MM/YYYY` (older cards `MM/YY`) | [UNCERTAIN] |
| Display | As printed on the card: `2123 45670 1` (4-5-1 grouping), IRN shown separately: `IRN 1` | [UNCERTAIN] card print layout |
| FHIR system | `http://ns.electronichealth.net.au/id/medicare-number` | [SECONDARY] https://implementer.digitalhealth.gov.au/namespaces/id/medicare-number/index.html |
| Example (synthetic, check-valid) | `2123456701`, IRN `1` | computed |

- AU-ID-03 (M): Medicare number is a family-level identifier; it is NOT an approved stand-alone patient identifier (RACGP 6th ed CG2: Medicare cards "may share numbers across family members" and have no photo [VERIFIED] https://www.racgp.org.au/running-a-practice/practice-standards/standards-6th-edition/the-standards-for-general-practices-6th-edition/clinical-governance-standard/cg2-patient-identification). The banner must always pair it with the IRN.
- Card colours [UNCERTAIN]: green (eligible residents), blue (interim), yellow (reciprocal health care agreement). Do not encode eligibility by colour alone.

### 1.4 DVA file number (Department of Veterans' Affairs)

[SECONDARY] https://air.claiming.com.au/docs/validation-and-checks/ and https://hl7.org.au/fhir/StructureDefinition-au-dvanumber.html
- Length 3 to 9 characters (FHIR max length 9).
- Character 1: state code letter, one of `N` (NSW and ACT), `V` (Vic), `Q` (Qld), `S` (SA and NT), `W` (WA), `T` (Tas).
- Then a war code of 1 to 3 characters (alphabetic, or blank for some file types; e.g. `X`, `BUR`, `SS`) followed by the numeric file number; war code + digits together max 7 characters.
- Optional trailing alphabetic dependant segment (A, B, C ... in order of card issue).
- Example from HL7 AU: `NBUR9080`.
- Display: upper case, no spaces, exactly as on the Veteran Card. Card type (Gold, White, Orange) is a separate attribute (FHIR `Identifier.type` bound to DVA Entitlement value set); show it as text.
- FHIR system: `http://ns.electronichealth.net.au/id/dva`.
- Regex (permissive): `^[NVQSWT][A-Z ]{0,3}[0-9]{1,6}[A-Z]?$` [UNCERTAIN] (war code letters vs spaces padding varies; treat as advisory).

### 1.5 Hospital MRN / UR number

- Australian public hospitals call the local identifier "UR number" (Unit Record), "URN", "MRN" or "Hospital number" depending on state. The NIMC identification box labels it **URN** [VERIFIED] (NIMC GP e-version, https://safetyandquality.gov.au/sites/default/files/2019-11/national_inpatient_medication_chart_nimc_-_general_practitioner_e-version_0.pdf).
- There is no national format: length, alphanumeric content and check digits are local [UNCERTAIN, by absence]. Many LHD/state systems use 6 to 10 digits; some are prefixed with a facility code.
- AU-ID-04 (C): MRN label (`URN` / `UR number` / `MRN`), format mask and validator are organisation-configurable. Default label: `URN`.
- AU-ID-05 (M): Do not use bed or room number as an identifier: ACSQHC: "Do not use identifiers such as room or bed number, because these frequently change and are not unique to patients." [VERIFIED] https://www.safetyandquality.gov.au/node/3739

### 1.6 Mapping to NHS CUI identifier controls

- [AU OVERRIDE] The NHS Number (10 digits, 3-3-4, mod 11) control is replaced in AU mode by a configurable "primary identifier" slot: default order IHI (if held), then URN; Medicare + IRN and DVA shown as secondary identifiers.
- The NHS CUI banner label "NHS No." becomes the identifier's own label (`IHI`, `URN`, `Medicare`, `DVA`); never show an unlabelled number.

---

## 2. Patient identification (ACSQHC)

### 2.1 Approved identifiers

NSQHS Standards (2nd ed), Communicating for Safety Standard, Action 6.05 [VERIFIED] https://www.safetyandquality.gov.au/node/3739:
- The organisation "Defines approved identifiers for patients according to best-practice guidelines" and "Requires at least three approved identifiers on registration and admission", and also when care, medication, therapy and other services are provided and when handover, transfer or discharge documentation is generated.
- Approved identifiers listed: patient name (family and given names), date of birth, gender, address (including postcode), healthcare record number, Individual Healthcare Identifier (IHI).
- "At least three approved patient identifiers are required each time identification occurs."

The three identifiers specified for the standard identification band are **name, date of birth and medical record number** [VERIFIED] (Specifications for a standard patient identification band, 6.5, https://www.safetyandquality.gov.au/sites/default/files/migrated/Specs-PatID-Band.pdf).

General practice (RACGP 6th ed, CG2) accepts: name (family + given = one identifier), date of birth, address, Medicare or DVA number, individual phone number [VERIFIED].

- AU-PI-01 (M): The patient banner must always show at least three approved identifiers: full name, date of birth, and one record identifier (URN or IHI). Sex/gender is shown but should not be counted as one of the three unless the organisation config says so (C).

### 2.2 Standard patient identification band specification [VERIFIED, Specs-PatID-Band.pdf; publication date not printed on the PDF, originally 2008]

- Name format (6.7): "Family name should appear first using UPPER case letters", followed by given names in title case; family and given names "clearly differentiated". Example: `SMITH, John Paul`.
- Long, multiple and hyphenated names must fit (6.8).
- DOB (6.6): "Date of birth should be recorded in the short format as DD/MM/YYYY", example `07/06/2005`.
- Field order: not prescribed; "The same layout, order of information and information style should be used" across the organisation (6.2).
- Typography (6.9, 6.10): common sans serif (Arial, Helvetica); minimum 12 to 14 point (2 to 2.3 mm cap height); no italics or ornate fonts; black text on white background.
- Colour (1.1 to 1.5): single white band; no coloured alert bands, except a **red** band (replacing the white one, not added) for a known allergy or other known risk; text on the red band's insert is still black on white; the band must not state the meaning of the alert.
- New technology (7.1): barcode, RFID or digital photo may be added provided all other requirements are met.

AU-PI-02 (M): On-screen patient name display defaults to `FAMILY, Given Middle` with family name in upper case, matching the band. This is consistent with NHS CUI (`SMITH, John (Mr)`), so no override except title placement: the AU band has no title; the AU banner should show title only if configured (C).

AU-PI-03 (R) [AU OVERRIDE, conditional]: DOB on the band is `DD/MM/YYYY`. NHS CUI and the ACSQHC on-screen medicines guideline use `DD-Mon-YYYY`. Library default for screens: `07-Jun-2005` (unambiguous); provide `C` option `DD/MM/YYYY` to match local wristband/label print so staff can compare like with like. Age shown alongside (e.g. `07-Jun-2005 (21y)`).

### 2.3 On-screen identification in electronic systems

From ACSQHC *Electronic Medication Management Systems: Business requirements* (July 2019) [VERIFIED] https://www.safetyandquality.gov.au/sites/default/files/2019-08/emm-business-requirements-july_2019_acc_0.pdf:
- 3.3: "Display prominently and consistently patient identification information on all screens".
- 3.3: "Alert users to patients with identical names".
- 2.4: "Prominently displaying the name and role of the person currently logged in"; 7: "Clearly display the name and designation of the person logged onto the EMM system".
- 7: patient details and medicine name, form, strength and status "are prominently displayed throughout the medication administration process".

EMM Guide to safe implementation (3rd ed, endorsed by AHMAC 8 Dec 2017) 7.5: support unique patient identification, wristband scanning, and incorporate the IHI [VERIFIED via functional requirements doc] https://www.safetyandquality.gov.au/sites/default/files/2019-08/sq19-030_emms_functional_requirements_acc_01n_5_aug_2019.pdf

- AU-PI-04 (M): Banner provides a "same/similar name" warning slot (text + icon) driven by host data.
- AU-PI-05 (M): Application frame shows logged-in user name and role/designation on every screen.

---

## 3. Names

### 3.1 METeOR person name data elements

Source: METeOR 613331 *Person–family name* [VERIFIED] https://meteor.aihw.gov.au/content/613331
- Single name: "Some people do not have a family name and a given name, but have only a single name by which they are known." Record the single name in the **family name** field; leave given name blank.
- Unknown name: record `unknown` with name usage type **Other name**; do NOT create a fictitious name such as "Doe" ("this is an actual family name"). When the real name becomes known, record it as the preferred name; do not overwrite the `unknown` entry.
- Hyphenated names: "entered with a hyphen without spaces".
- Apostrophes: "No space should be left before or after the apostrophe" (O'Brien, D'Agostino).
- Case: record "in the format preferred by the person" (no forced upper case in storage; upper casing is a display transform only).
- Newborns: mother's family name normally used unless she instructs otherwise; "Unnamed babies should be recorded with a name usage value of Newborn name."
- Pseudonyms (e.g. HIV testing): record the pseudonym as an Other name and the legal name separately.
- Agencies may record a preferred name for staff use while keeping formal given and family names.
- Do not reorder names to fit a Western pattern: record the name the person gives.

Name usage type value domain (METeOR *Person name–name usage*) [UNCERTAIN on exact codes]: Preferred name (registered name), Other name (alias), Professional name, Newborn name, (and in some versions) Report name. Confirm codes against METeOR before implementing a coded picker.

Field lengths: METeOR current family and given name elements are `text X[X(39)]` (40 characters) [UNCERTAIN, from element naming convention]; older NSW mirrors use X[X(49)].

### 3.2 Aboriginal and Torres Strait Islander naming considerations [UNCERTAIN: general guidance from state health cultural safety guidelines; no single national display rule found]

- Names of deceased people may be culturally restricted in some communities ("sorry business"); some people change or avoid names after a death. The UI must support recording a changed name without losing history and must allow an organisation to suppress display of a deceased person's name and image (C).
- Some people have skin names, kinship names or names in language in addition to an English name. Use the Other name / Preferred name mechanism; do not force a single "first/last" model.
- Spellings of a person's name may vary between documents; identity matching UI must show all recorded names (alias list) rather than only the preferred one.
- Do not infer Indigenous status from name (see section 5).

### 3.3 Display rules for the library

- AU-NM-01 (M): Single-name patients display as `FAMILYNAME` alone, with no trailing comma and no placeholder such as "FNU" or "Unknown" in the given name position.
- AU-NM-02 (M): Unknown-identity patients display the recorded Other name exactly (e.g. `UNKNOWN, Male 3` per local protocol), with a visual "Unidentified patient" qualifier.
- AU-NM-03 (M): Preferred name is shown as a separate labelled field (`Preferred name: Kate`), never by replacing the legal/registered name in the banner. Matches NHS CUI.
- AU-NM-04 (R): Allow names up to at least 40 characters per component without truncation in the banner (ACSQHC band spec 6.8 requires space for long, multiple, hyphenated names); wrap rather than truncate.

### 3.4 Pronouns

- No Australian national standard for pronouns was found [VERIFIED by absence in ABS 2020 Standard and METeOR gender element]. HL7 AU Base supports the HL7 international `individual-pronouns` extension [UNCERTAIN on AU Base version].
- AU-NM-05 (C): Optional pronouns field, free text with suggested values (`she/her`, `he/him`, `they/them`, `prefers not to say`), shown in banner Zone 2 only.

---

## 4. Sex and gender

### 4.1 ABS Standard for Sex, Gender, Variations of Sex Characteristics and Sexual Orientation Variables, 2020

Released 14 Jan 2021; amended 29/06/2021, 21/09/2023, 16/11/2023. Replaces the 2016 Standard for Sex and Gender Variables. [VERIFIED] https://abs.gov.au/statistics/standards/standard-sex-gender-variations-sex-characteristics-and-sexual-orientation-variables/latest-release

**Sex recorded at birth**
- Question: "What was [your/Person's name/their] sex recorded at birth?"
- Responses: `1` (M) Male; `2` (F) Female; `3` (X) Another term (please specify); supplementary `9` Not stated or inadequately described.
- The alternative question "What is [your/...] sex?" was removed on 21/09/2023.

**Gender**
- Question: "How [do/does] [you/Person's name/they] describe [your/their] gender?"
- Required note: "Gender refers to current gender, which may be different to sex recorded at birth"
- Responses: `1` (M) Man or male; `2` (F) Woman or female; `3` (X) Non-binary; `4` (T) [I/They] use a different term (please specify); `5` (Z) Prefer not to answer; supplementary `9` Not stated or inadequately described.
- Write-ins that are variants of the first three labels are coded to those labels.

**Variations of sex characteristics**
- Question: "Were you born with a variation of sex characteristics (sometimes called 'intersex' or 'DSD')?"
- Responses: `1` (Y) Yes; `2` (N) No; `3` (U) Don't know; `4` (Z) Prefer not to answer; supplementary `9` Not stated, `0` Not applicable.

**Sexual orientation**
- Question: "How do you describe your sexual orientation?"
- Responses: `1` (S) Straight (heterosexual); `2` (G) Gay or lesbian; `3` (B) Bisexual; `4` (T) I use a different term (please specify); `5` (U) Don't know; `6` (Z) Prefer not to answer; supplementary `9`, `0`. Recommended for ages 15+.

**Rules**
- If both are asked, ask sex first, and note that gender is asked separately; ask both on the same page where practical. One response only per question.
- Do not ask respondents about other people's sex characteristics or sexual orientation.

### 4.2 METeOR equivalents [VERIFIED]

- *Person–sex, code X* (METeOR 741686) https://meteor.aihw.gov.au/content/741686: labels "Male", "Female", "Another term (please specify)"; codes 1 Male, 2 Female, 3 Another term, 9 Not stated/inadequately described. Code 9 does not include "Another term". Definition: "Sex recorded at birth refers to what was determined by sex characteristics observed at birth or in infancy."
- *Person–gender, code X* (METeOR 741842) https://meteor.aihw.gov.au/content/741842: 1 man/boy/male, 2 woman/girl/female, 3 non-binary, 4 different term, 5 prefers not to respond, 9 not stated/inadequately described (administrative non-response only, not a form option). Alternative codes M, F, X, T, Z map to 1 to 5. Replaces an earlier three-value version. Guidance: "refrain from making assumptions about a person's sex and/or gender identity" based on name, voice or appearance.
- Legacy: *Person–sex, code N* (METeOR 635126): 1 Male, 2 Female, 3 Intersex or indeterminate, 9 Not stated/inadequately described [SECONDARY]. Still present in older feeds; map for display.

### 4.3 Health system practice

- Medicare/Services Australia and the HI Service record a single "sex" field with values M, F, X (indeterminate/intersex/unspecified) and the NIMC identification box still prints `Sex (M / F)` [VERIFIED for NIMC; UNCERTAIN for HI Service values].
- Australian Government Guidelines on the Recognition of Sex and Gender (2013, updated 2015) allow M, F, X where X = "Indeterminate/Intersex/Unspecified" [UNCERTAIN, not fetched].
- AU-SG-01 (M): Banner shows **gender** by default with label "Gender"; "Sex recorded at birth" (and, where clinically relevant, "Sex for clinical use" if the host supplies it) is available in Zone 2 with explicit labels. Never show an unlabelled "M"/"F".
- AU-SG-02 (M): Coded value lists use the exact ABS labels above, in the order given, including "Prefer not to answer" for gender.
- AU-SG-03 (R): Where clinical decision support uses sex (e.g. eGFR, reference ranges), show which field it used.

---

## 5. Indigenous status

METeOR *Person–Indigenous status, code N* (METeOR 602543) [VERIFIED] https://meteor.aihw.gov.au/content/602543

| Code | Meaning |
|---|---|
| 1 | Aboriginal but not Torres Strait Islander origin |
| 2 | Torres Strait Islander but not Aboriginal origin |
| 3 | Both Aboriginal and Torres Strait Islander origin |
| 4 | Neither Aboriginal nor Torres Strait Islander origin |
| 9 | Not stated/inadequately described |

Standard question:
- Self-completed form: "Are you of Aboriginal or Torres Strait Islander origin?" with tick boxes, in this order: **No**; **Yes, Aboriginal**; **Yes, Torres Strait Islander**. Instruction (ABS standard, [UNCERTAIN] on exact wording): "For persons of both Aboriginal and Torres Strait Islander origin, mark both 'Yes' boxes." Multi-select of the two "Yes" options = code 3.
- Interviewer: Q1 "Are you of Aboriginal or Torres Strait Islander origin?" (Yes/No); Q2 "Are you of Aboriginal origin, Torres Strait Islander origin, or both?"

Collection guidance:
- Ask directly; ask every person "regardless of data collectors' perceptions based on appearance or other factors". Never guess.
- Proxy only by someone who knows the person well.
- Leave unanswered only if the person declined, or could not communicate and no one who knows them was available.

Library rules:
- AU-IS-01 (M): The input control is a checkbox group (not a radio group) with the three options in the order above, so "both" can be recorded; derived code shown read-only.
- AU-IS-02 (M): No default selection.
- AU-IS-03 (R): Display label in the banner is the full meaning text (e.g. "Aboriginal and Torres Strait Islander"), never the numeric code. Displaying it in the banner is C (many organisations show it in Zone 2 only).

---

## 6. Addresses

### 6.1 Australia Post format [VERIFIED except where marked]

Sources: Australia Post *Correct addressing* https://auspost.com.au/content/dam/auspost_corp/media/documents/correct-addressing.pdf ; UPU Australia sheet (supplied by Australia Post) https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/ausEn.pdf

Line order (3 to 4 lines, left aligned, no blank lines):
1. Recipient name (business name first if both).
2. Street number and name, or PO Box / Locked Bag.
3. LOCALITY STATE POSTCODE.

- Last line: locality, state and postcode in **UPPER CASE** (`BUNBURY WA 6230`). UPU sheet: "Print the last two lines in uppercase" (machine addressing); Australia Post consumer guide shows street line in mixed case (`54 Stockton Rd`).
- Separate state from locality and postcode from state by one, preferably two, spaces (UPU sheet). On screen use a single space (library default) [design decision].
- No punctuation (no commas or full stops).
- Max 40 characters per line (UPU sheet).
- Traditional Place name (optional): after recipient name, above the street line, e.g. `Wiradjuri Country`.
- Floor/level and unit identifiers go before the street number on the same line, e.g. `LEVEL 6 51 JACOBSON ST`; if that line is full, put them on a separate line above.

State and territory abbreviations: `ACT`, `NSW`, `NT`, `QLD`, `SA`, `TAS`, `VIC`, `WA` [VERIFIED]. External territories use ISO 3166-1 alpha-3 country-style codes in international mail: CCK (Cocos (Keeling) Islands), CXR (Christmas Island), HMD, NFK (Norfolk Island), XAA (Australian Antarctic Territory) [VERIFIED UPU sheet]. Domestically, Norfolk Island addresses use `NORFOLK ISLAND NSW 2899` [UNCERTAIN].

Postal delivery types (examples from UPU sheet): `PO BOX 37`, `LOCKED BAG 801`, `RMB 26`, `GPO BOX 123`. Also in use: `PRIVATE BAG`, `CARE PO` (Care of Post Office), `RSD` (Roadside Delivery), `CMB` (Community Mail Bag), `CMA` (Community Mail Agent), `MS` (Mail Service) [UNCERTAIN, from Australia Post Address Presentation Standard / AS 4590 not fetched].

### 6.2 Unit / flat notation [UNCERTAIN]

- Australia Post's preferred (barcoded) presentation is `UNIT 2 14 SMITH ST`; the slash form `2/14 Smith St` is very common in data entry and is accepted for delivery. AS 4590.1 and AS/NZS 4819 (G-NAF) model flat type (`UNIT`, `FLAT`, `APARTMENT`, `SHOP`, `SUITE` ...), flat number, level type and level number as separate fields.
- AU-AD-01 (M): Store unit/level as structured fields; display default `Unit 2, 14 Smith Street` in prose contexts, `UNIT 2 14 SMITH ST` in label/print contexts (C). Accept `2/14` on entry and parse.

### 6.3 Postcodes [UNCERTAIN: compiled from Australia Post postcode data, not fetched in this session]

Four digits, leading zero significant (store as string, e.g. `0800`).

| State | Ranges |
|---|---|
| NSW | 1000-1999 (PO boxes/LVR), 2000-2599, 2619-2899, 2921-2999 |
| ACT | 0200-0299, 2600-2618, 2900-2920 |
| VIC | 3000-3999, 8000-8999 (PO boxes/LVR) |
| QLD | 4000-4999, 9000-9999 (PO boxes/LVR) |
| SA | 5000-5799, 5800-5999 (PO boxes/LVR) |
| WA | 6000-6797, 6800-6999 (PO boxes/LVR) |
| TAS | 7000-7799, 7800-7999 (PO boxes/LVR) |
| NT | 0800-0899, 0900-0999 (PO boxes/LVR) |

Known exceptions: Jervis Bay Territory 2540 (shares NSW range); Norfolk Island 2899; Lord Howe Island 2898; some NSW border localities use VIC/QLD-adjacent codes and vice versa (e.g. Albury NSW 2640 vs Wodonga VIC 3690 is fine, but 3644 Barooga is NSW, 4383/4385 include NSW localities) [UNCERTAIN]. Therefore:
- AU-AD-02 (M): Postcode/state mismatch is a **warning**, never a hard block. Australia Post: "Check that the locality matches the postcode."

### 6.4 G-NAF

- Geocoded National Address File, maintained by Geoscape Australia, released quarterly under an open EULA via data.gov.au; each address has a persistent identifier `GNAF PID` (e.g. `GANSW704...`) [UNCERTAIN on PID format]. Address lookup controls should store the G-NAF PID alongside the structured address and allow free-text override (homeless, remote communities, overseas, PO Boxes are not in G-NAF as delivery addresses).
- AU-AD-03 (M): Address lookup must allow "No fixed address" (METeOR/AIHW uses "No fixed address" as a recognised value [UNCERTAIN]) and overseas addresses.

---

## 7. Telephone numbers

Source: Australian Government Style Manual, *Telephone numbers* [VERIFIED] https://www.stylemanual.gov.au/style-rules-and-conventions/numbers-and-measurements/telephone-numbers. Numbering structure from the Telecommunications Numbering Plan 2025 (ACMA) [UNCERTAIN, not fetched].

| Type | Structure | Display (national) | Display (international) |
|---|---|---|---|
| Geographic landline | `0` + area digit (2, 3, 7, 8) + 8 digits | `02 5550 4321` (2-4-4) | `+61 2 5550 4321` |
| Mobile | `04` + 8 digits (`05` reserved/limited use) | `0491 570 159` (4-3-3) | `+61 491 570 159` (3-3-3 after +61) |
| Local rate (10 digit) | `1300` + 6 digits | `1300 975 707` (4-3-3) | not diallable from overseas |
| Freephone | `1800` + 6 digits | `1800 160 401` (4-3-3) | not diallable from overseas |
| Local rate (6 digit) | `13` + 4 digits | `13 00 00` (2-2-2) | n/a |
| Emergency | `000` (also `112` from mobiles, `106` text relay) [UNCERTAIN on 106 status] | `000` | n/a |

Area code coverage [UNCERTAIN, ACMA]: `02` NSW and ACT; `03` VIC and TAS; `07` QLD; `08` SA, WA, NT (and Broken Hill NSW).

Style Manual rules:
- Chunk digits; use a non-breaking space (U+00A0) between chunks on screen so the number never wraps.
- Write foreign numbers in international format.
- Click-to-call: `tel:` with spaces removed and international prefix, e.g. `<a href="tel:+61491570156">+61&nbsp;491&nbsp;570&nbsp;156</a>`.
- Show digits, not phone words (`13 83 87`, not `13 VETS`).
- No guidance on brackets; the Style Manual examples do not use `(02)` [VERIFIED by absence]. Library default: no brackets.

Library rules:
- AU-PH-01 (M): Store E.164 (`+61255504321`); display per table; accept input with spaces, brackets, hyphens, leading `+61` or `0061` or `0`.
- AU-PH-02 (M): Validation: national significant number 9 digits after `+61` for geographic and mobile; 1300/1800 are 10 digits; 13 numbers 6 digits.

---

## 8. Dates, times and time zones

### 8.1 Date format

Australian sources disagree by context:
- ACSQHC *National guidelines for on-screen display of clinical medicines information* (Jan 2016): examples use **`DD-Mon-YYYY`**, e.g. `11-Mar-2014`; times as `10:00 am` in examples while referring to the 24-hour clock in Appendix 10.2 [VERIFIED for examples; Appendix 10.2 text not retrieved]. https://www.safetyandquality.gov.au/sites/default/files/migrated/National-guidelines-for-onscreen-display-of-clinical-medicines-information.pdf
- ACSQHC patient band: `DD/MM/YYYY` [VERIFIED].
- ACSQHC EMM business requirements example: "Medication orders last changed 30 SEPTEMBER 2016, 3 HOURS AGO" [VERIFIED].
- National standard for labelling dispensed medicines (July 2021): label examples `12/10/2020` (dispensed), `Expiry: 09/2023`, `Throw away on 24 Nov 2021` [VERIFIED]; out of scope for electronic displays.
- Australian Government Style Manual: prose dates as `1 January 2026` (day month year, no comma, no ordinal) [VERIFIED in phase 3: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time].

Rules:
- AU-DT-01 (M): Never use US `MM/DD/YYYY`. Day precedes month in every format.
- AU-DT-02 (M): Default clinical display is `DD-Mon-YYYY` (`07-Jun-2005`), which matches NHS CUI and the ACSQHC on-screen guideline. No [AU OVERRIDE] needed.
- AU-DT-03 (C): `DD/MM/YYYY` selectable for wristband/label-matched contexts (DOB).
- AU-DT-04 (M): Month abbreviations in English: Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec. (ACSQHC day abbreviations: `Mon, Tue, Wed, Thur, Fri, Sat, Sun` per 2024 terminology recommendations; note `Thur` not `Thu` [VERIFIED].)

### 8.2 Time format

- ACSQHC *Recommendations for safe use of medicines terminology* (Nov 2024) [VERIFIED]: use the 24-hour clock with a colon (`14:00`); optionally add am/pm for clarity (`11:30 am`).
- **Avoid scheduling doses at midnight**, since `00:00` may be misread; schedule at another time (e.g. 23:30) [VERIFIED].
- NIMC: 24-hour times without colon on paper (`0800`, `2000`); pre-printed 6-hourly includes `2400` [VERIFIED].
- AU-DT-05 (M): Display `HH:mm` 24-hour with colon. Never display `24:00`; never display `2400`.
- AU-DT-06 (R): Scheduling controls warn when a dose time of `00:00` is chosen.

### 8.3 Time zones

| Zone | UTC offset | DST | Jurisdictions | IANA |
|---|---|---|---|---|
| AEST / AEDT | +10:00 / +11:00 | Yes | NSW (except Broken Hill and Lord Howe), ACT, VIC, TAS | Australia/Sydney, Australia/Melbourne, Australia/Hobart |
| AEST | +10:00 | **No** | QLD | Australia/Brisbane (Australia/Lindeman for Whitsundays) |
| ACST / ACDT | +09:30 / +10:30 | Yes | SA; Broken Hill and Yancowinna County NSW | Australia/Adelaide, Australia/Broken_Hill |
| ACST | +09:30 | **No** | NT | Australia/Darwin |
| AWST | +08:00 | **No** | WA | Australia/Perth |
| ACWST (unofficial) | +08:45 | No | Eucla area WA/SA border | Australia/Eucla |
| LHST / LHDT | +10:30 / +11:00 (30-minute DST shift) | Yes | Lord Howe Island NSW | Australia/Lord_Howe |
| NFT / NFDT | +11:00 / +12:00 | Yes (since 2019) | Norfolk Island | Pacific/Norfolk |
| CXT | +07:00 | No | Christmas Island | Indian/Christmas |
| CCT | +06:30 | No | Cocos (Keeling) Islands | Indian/Cocos |

Status: offsets and DST participation [UNCERTAIN, domain knowledge consistent with IANA tzdb]; DST rule [VERIFIED below].

DST rule (Business Victoria, https://business.vic.gov.au/business-information/daylight-saving) [VERIFIED for VIC; same rule in NSW, ACT, SA, TAS since 2008]:
- Begins 02:00 standard time on the **first Sunday in October** (clocks forward one hour to 03:00).
- Ends 03:00 daylight time (02:00 standard time) on the **first Sunday in April** (clocks back to 02:00).
- 2026-27: starts Sunday 4 October 2026, ends Sunday 4 April 2027.
- Lord Howe Island: shift is 30 minutes, at 02:00 local on the same Sundays [UNCERTAIN].

Library rules:
- AU-DT-07 (M): Store instants in UTC; render in the facility's IANA zone, never a fixed offset, because a single health service (e.g. one spanning NSW and Broken Hill, or a telehealth service across QLD and NSW) can span zones.
- AU-DT-08 (M): When a displayed time is in a different zone from the viewer's facility, or falls in the ambiguous repeated hour (02:00 to 02:59 on the first Sunday of April), show the zone abbreviation (`02:30 AEDT` / `02:30 AEST`).
- AU-DT-09 (M): Medication charts and observation charts must render the skipped hour (02:00 to 02:59 on the first Sunday of October) as absent, and the repeated hour twice, labelled with the abbreviation. Duration calculations (e.g. "4 hourly", infusion running time) use elapsed UTC time.

---

## 9. Medicines

### 9.1 ACSQHC *Recommendations for safe use of medicines terminology* (November 2024)

Replaces *Recommendations for terminology, abbreviations and symbols used in medicines documentation* (2016). ISBN 978-1-922880-96-3. [VERIFIED] https://www.safetyandquality.gov.au/sites/default/files/2024-12/recommendations-for-safe-use-of-medicines-terminology.pdf . Not exhaustive: absence of a term does not mean it is safe.

**Digital systems (key for this library)**
- Medicines information should be fully written out on digital displays, without abbreviations.
- Abbreviations only where space is limited (small screens, smart pumps), expanded on hover where possible.
- Shorthand keystrokes / "sig codes" acceptable for entry only if unambiguous and displayed in full on screen.
- `+` may separate active ingredients on screen.
- "tablet" and "capsule" are written in full in digital displays, labels and speech.
- Use mixed-case lettering for LASA names per the National Mixed-Case Lettering List (section 9.3).

**Error-prone terms: do not use** (term: use instead)

Frequencies, instructions, routes:
`2º`, `2h`, `2 hrly`: every 2 hours · `4/24`, `6/24`, `8/24`: every 4 hours etc. · `ac`, `pc`: before food / after food · `cc`: mL · `D`: daily · `D/C`: write discharge or discontinue · `E`, `e`: eye or ear · `gm`: g · `gutte`, `gtt`: drops · `HS`, `hs`: write in full (half-strength or bedtime) · `IN`: intranasal · `INH`, `inh`: inhale/inhalation · `IO`: intraosseous · `IP`: intraperitoneal · `IR`: only within a brand name · `IVI`: IV · `LE`, `RE`: left/right ear or eye · `M`: morning · `mcg`, `ug`, `µg`: microgram · `midi`: midday · `N`, `ON`: night · `NIA`, `NIM`: write in full · `OAT`, `OST`, `OSTP`: opioid agonist therapy (in full) · `OD`, `od`, `O.D.`: once a day / daily · `OJ`: orange juice · `OS`, `OD` (eye): left eye / right eye · `Q1H`, `Q4H`, `Q6H`, `Q8H`: hourly, every 4 hours etc. · `QD`, `qd`: daily · `QDS`, `qds`: four times a day · `Qhs`: at night / at bedtime · `QOD`, `qod`: every second day · `SC`, `sc`, `SCI`: subcutaneous / subcut · `SL`: sublingual · `SS`: single strength · `SSRI`/`SSI` (sliding scale insulin): sliding scale insulin in full · `tid`: tds · `TIW`, `tiw`: three times a week · `TOP`, `top`: topical · `TPT`: transpyloric tube · `U`, `u`: units · `IU`: units (exception: bleomycin).

Medicine and chemical names:
`5-FU` fluorouracil · `6-MP` mercaptopurine · `ADF` Augmentin Duo Forte · `APAP` paracetamol · `ASA` acetylsalicylic acid · `AZA` azathioprine · `AZT` zidovudine · `CBD`/`CBN`/`THC` cannabidiol/cannabinol/tetrahydrocannabinol · `DEX` dexamethasone, dexmedetomidine or dexamfetamine · `EPO` epoetin · `G-CSF` filgrastim / pegfilgrastim etc. · `G5W`, `D5W` glucose 5% · `GTN` glyceryl trinitrate · `HCl` hydrochloric acid · `HCT`, `HCTZ` hydrocortisone or hydrochlorothiazide · `ISMN` isosorbide mononitrate · `KCl` potassium chloride · `LMWH` low molecular weight heparin · `MgSO4` magnesium sulfate · `MS`, `MSO4` morphine (sulfate) · `MTX` methotrexate · `NaCl`, `saline`, `NS` sodium chloride 0.9% · `½ NS` sodium chloride 0.45% · `NaHCO3` sodium bicarbonate · `NOAC`, `DOAC` active ingredient name · `OXY` oxycodone or oxytocin · `rt-PA` reteplase · `T3`, `T4` named thyroid hormone · `TAC` tacrolimus · `TPA`, `r-TPA`, `t-PA` alteplase/tenecteplase by name · `TNK` tenecteplase · `ZnSO4` zinc sulfate. Protocol acronyms (e.g. CHOP) not to be used. Modified-release descriptors (SR, CR) may be kept (e.g. `tramadol SR`).

Symbols: `<` `>` (write less than / greater than) · `@` (at) · `&` (and) · `Ø` (zero or in full) · `º` (in full) · `#` (do not use) · `/` (per; allowed in concentrations and rates) · `x1` (once) · `½`, `1/2` (half) · `+` (and; allowed as digital separator) · `X3d` (for 3 days) · `[ ]`, `( )` (do not use around doses). [Note: the 2016 on-screen guideline allows `+` and `&` as separators and `/` in strengths and rates.]

**Accepted terms** (asterisk = acceptable only in handwritten/written orders):
- Frequency: morning, mane*; midday; night, nocte*; bedtime; once a day / daily / every day (with time); bd*/BD*; tds*/TDS*; qid*/QID*; hourly; every 2 hours; every 4 hrs / 4 hourly / 4 hrly; 6 and 8 hourly likewise; every 12 hours; once/twice/three times a week (with named days); every 2 days; every 2 weeks; Mon Tue Wed Thur Fri Sat Sun; before food, after food, with food; prn*/PRN* (when required); stat* (immediately); once; for 1 day, for 3 days.
- Routes: buccal; right/left/each/both ear or eye; epidural; inhale/inhalation; intraarticular; intradermal; IM; intranasal; intraosseous; intraperitoneal; intrathecal (`IntraTHECAL`*); IV (`IntraVENOUS`*); irrigation; NG; NJ; NEB/nebulised (nebulised preferred on screen); PO; PR; PV; PEJ, PEG, PICC; subcutaneous, subcut; subling, under the tongue; topical.
- Units: cm, mm, g, hour, minute, kg, L, metre, microgram (also `MICROg`, `microg`), microlitre, micromol, millimolar, mEq, mg, mg/L, mL, mmol, mmol/L, nanogram (`ng` not accepted), ppm, %, sq cm, sq m (cm² and m² only if the superscript renders clearly), unit(s), units/kg, mg/min, mL/hr, units/hr.
- Dose forms: capsule (cap*, CAP*), cream, ear drops, ear ointment, eye drops, eye ointment, injection (inj, INJ), metered dose inhaler / inhaler / MDI, mixture, nebule (NEB), ointment, PCA, pess, powder, solution, supp, suspension, tablet (tab*, TAB*).

**Dose expression rules**
- Space between number and unit (`25 mg`, `32 units`); no space before `%` (`5%`).
- Leading zero: `0.5` not `.5`.
- No trailing zero: `5` not `5.0` (lab results out of scope).
- No full stop after `mg` or `mL`.
- `microgram`, `nanogram`, `units` in full; `mL` not `cc`.
- Thousands separator comma at or above 1,000 (`10,000 units`); never `k`, `K`, `m`, `M` as multipliers. (Note: AMT uses a space every third digit for values of 10,000 or more, `10 000`; for display follow ACSQHC, comma.)
- Fractions in words (`half`), not `1/2`, `½` or `0.5` in dosing instructions.
- No Roman numerals.
- Frequency explicit ("three times a week").
- PRN orders include the maximum dose in 24 hours.

### 9.2 ACSQHC *National guidelines for on-screen display of clinical medicines information* (January 2016) [VERIFIED]

https://www.safetyandquality.gov.au/sites/default/files/migrated/National-guidelines-for-onscreen-display-of-clinical-medicines-information.pdf ; resource page https://www.safetyandquality.gov.au/resources/national-guidelines-screen-display-medicines-information . Explicitly out of scope: allergy warnings and alerts, patient identification.

**6.1 Medicine names**
- 6.1.1 Full medicine names, no abbreviations (not `Cpl`, `ISMN`, `GTN`); short forms allowed for entry only if expanded on screen.
- 6.1.2 Salts: show the base name without the salt (e.g. amoxicillin) unless the salt changes therapeutic effect (e.g. atropine sulfate) or defines strength (e.g. `warfarin sodium 5 mg`). Never abbreviate salts (`Na`, `HCl`, `Br`, `K`).
- 6.1.3 Active ingredient and brand:
  - Display the active ingredient (except products with 4 or more active ingredients).
  - Display both active ingredient and brand for: medicines with bioavailability issues (warfarin – Coumadin/Marevan), high-risk medicines (insulin, amphotericin, chemotherapy), and 2 or 3 ingredient combinations.
  - Brand only for 4 or more ingredients, with ingredients available on hover, one per line.
  - **Format**: active ingredient **lower case and bold**; brand **Title Case and italic**, preceded by an **en dash** (U+2013). Examples: `**morphine sulfate** – *MS Contin*`, `**warfarin sodium 5 mg** – *Marevan*`.
- 6.1.3.2 Selection lists: active ingredient products first, then brand products, in distinct font styles.
- 6.1.4 Tall Man (now mixed-case) lettering: apply the national list; it overrides the font rules of 6.1.3 (mixed case + bold for ingredient, mixed case + italic for brand, e.g. `amLODIPine`, *norVASC*). Beware sans serif `l`/`I` confusion. AMT descriptions do not include Tall Man; the system must apply it. Apply in selection lists too.

**6.2 Text, abbreviations, symbols**
- 6.2.1 No abbreviations for route (`oral`), site (`left ear`), frequency (`at night`), form (`eye drops`). Exceptions: modified-release terms (incl. in brand names); units per Appendix 10.1; days of week may be 3 letters with initial capital.
- 6.2.2 Words not symbols: "greater than", "less than", "at". Allowed: `%`, decimal point, `+` and `&` as separators, `/` in strengths, rates and brand combinations.

**6.3 Numbers and units**
- 6.3.1 Consistent order of elements (16), with labels and separators:

| # | Element | Status |
|---|---|---|
| 1 | Active ingredient | Mandatory |
| 2 | Strength | Mandatory for pack-based prescribing; optional for dose-based |
| 3 | Brand name | Optional (see 6.1.3) |
| 4 | Form | Optional |
| 5 | Route | Mandatory unless described by Site |
| 6 | Site | Optional |
| 7 | Label `DOSE` / `RATE` / `VOLUME` | Optional |
| 8 | Dose (or rate/volume) | Mandatory except where not expressible (creams) |
| 9 | Administration duration | Optional |
| 10 | Frequency | Mandatory |
| 11 | Frequency qualifier | Optional |
| 12 | Indication | Optional; mandatory for PRN |
| 13 | Additional instructions | Optional |
| 14 | Duration of treatment (full course) | Optional |
| 15 | Label `SUPPLY` | Mandatory for pack-based prescribing |
| 16 | Supply | Mandatory for pack-based prescribing |

  Separators: en dash between discrete elements, but never before a number (could read as negative); `+` between ingredients; `&` between multi-component pack components; no separator between ingredient name and strength; optional between frequency, qualifier and indication. Labels in capitals. Non-breaking space between label and number and between number and unit.
  Oral liquids: dose in weight with volume in brackets, e.g. `10 mg (2 mL)`.
- 6.3.2 Approved units with exact case per Appendix 10.1: `units` in full, `mL`, `MICROg` (not `µg`); never `U` or `l`. (Appendix 10.1 full text not retrieved [UNCERTAIN]; use the 2024 accepted units list in 9.1.)
- 6.3.3 Separate labels from numbers so letters do not run into digits: `propRANOLol – DOSE 60 mg`, not `propRANOLol60 mg`.
- 6.3.4 Space between number and unit (`32 units`, `1 L/hour`).
- 6.3.5 No trailing zeros (`5 mg`).
- 6.3.6 Leading zero (`0.6`); prefer whole numbers (`500 mg` not `0.5 g`) unless the smaller unit is uncommon (keep `0.6 mL`, not `600 microlitres`); `HALF a tablet` not `0.5 tablets`. Exceptions: micrograms above 1000 allowed for product ranges spanning microgram/mg (`fentanyl 1600 microgram`); paediatric micrograms (`50 MICROg` not `0.05 mg`).
- 6.3.7 Comma thousands separator (`10,000 units`).
- 6.3.8 `million` in full; never `mega`, `m`, `M`; fractions of a million written numerically (`7,350,000`).

**6.4 General display**
- 6.4.1 Minimise wrapping. Keep together on one line: ingredient + strength; route + site; dose label + dose + unit; supply label + supply. No hyphenation. Break medicine names only between words, trailing delimiters stay with the preceding element.
- 6.4.2 **No truncation** of any part of a prescription; wrap instead, even if fewer orders fit on screen. **[AU OVERRIDE]** of any NHS CUI pattern that truncates medication lines with an ellipsis.
- 6.4.3 Selection lists: vertical scrolling only, look-ahead scroll indicators top and bottom, all details of one order visible on one screen.

Example line (library default rendering, en-AU):
`**amLODIPine** 5 mg tablet – oral – DOSE 5 mg – once a day – in the morning`
`**insulin aspart** – *NovoRapid* 100 units/mL injection – subcutaneous – DOSE 6 units – three times a day – with meals`

### 9.3 National Mixed-Case Lettering List (April 2024; formerly National Tall Man Lettering List)

[VERIFIED] https://safetyandquality.gov.au/sites/default/files/2024-04/national_mixed-case_lettering_list.pdf ; https://www.safetyandquality.gov.au/resources/national-mixed-case-lettering-list . Licence CC BY-NC-ND 4.0 (list may be embedded verbatim; do not modify the forms).

Apply in: EMM prescribing, dispensing and administration; inpatient dispensing labels; pharmacy shelving and ward storage; smart pump drug libraries; automated storage and distribution. Use selectively (overuse reduces effect); list is not exhaustive; combine with other controls.

Case-exact forms below were transcribed via text extraction of the 2024 list; the casing of every entry must be re-checked against the PDF before shipping [UNCERTAIN only as to transcription].

Table 1, general list (each line = one LASA group):
- actoNEL, actoS
- aKAMin, aCLin
- alDOMET, alDACTONE, alODORM
- amARYl, amOXil
- amiODAROne, amLODIPine
- amLODIPine, amiTRIPTYLine
- amiTRIPTYLine, amiNOPHYLLine
- aPomine, aVomine
- arATAC, arOPAX, arABLOC
- ARIPiprazole, RABEprazole
- aTRopt, aZopt
- azATHIOPRINE, aziTHROMYCIN, ERYthromycin
- bisOPROLOl, bisACODYl
- buMETANide, buDESONide
- caRAFate, caLTRate
- CARBAMazepine, OXCARBazepine, carbiMAZOLe
- caRVEDILOl, caPTOPRil
- celAPRAM, celEBREX
- ciprAMIL, ciprOXIN
- cLARITHROMYcin, ciPROFLOXAcin
- cLOMIPRAMine, cLOMIFEne, cHLORPROMAZine
- coUMADIN, coVERSYL
- ciclosPORIN, cyclosERINE
- cycLONEX, cycLIZINE
- DEPO-medrol, SOLU-medrol
- DEPO-medrol, depo-PROVERA
- solu-CORTEF, SOLU-medrol
- dePTRAn, deRALin
- dexAMETHASOne, dexMEDETOMIDine
- dilaUDID, dilaNTIN
- diPRIVan, diTROPan
- diPYRIDAMOLe, diSOPYRAMIDe
- doSULepin (doTHiepin), doXepin
- flucLOXACILLIN, flucONAZOLe, flucYTOSINe
- humALOG, humULIN
- hydreA, hydreNE
- hydrALAZINe, hydrOCHLOROTHIAZIDe
- isopto HOMATROpine, isopto CARpine
- iSOtretinoin, tretinoin
- januMET, januVIA
- ketALAR, ketOROLAC
- laMICTAl, laRGACTil, laMISil
- lamiVUDine, lamOTRIGine
- lanTUs, lanVis
- linCOMYCIN, linEZOLID
- loSEC, loVAN
- mercaptAMine (cysteamine), mercaptOPURine
- methADONe, methYLPHENIDATe
- MOXifloxacin, NORfloxacin
- moBILis, moVALis
- morphine, HYDROmorphone
- NEOral, INDEral
- nexAVAR, nexiUM
- niMODIPine, niFEDIPine, niZATIDine
- norVASC, norMISON
- novoMIX, novoRAPID
- oxyCONTIN, MS Contin, oxyNORM
- paXTINE, paRIET
- pEXSIG, pRISTIQ
- primaXIN, primaCOR, primaCIN
- proGRAF, proZAC
- proMETHazine, proCHLORPERazine
- propRANOLol, propOFol
- QUETIAPine, SERTRALine
- rifaMPICin, rifaXIMin
- riSPERIDONe, rOPINIROLe
- siTagliptin, sAXagliptin, sUMATRIPTAn
- Sirolimus, TACrolimus
- sulfaSALazine, sulfaDiazine
- toPAMAX, toFRANIL
- tEGRETOl, tRENTAl
- tRAMadol, tEMOdal, tORadol, tAPENTadol
- trimETHOPRIM, alimemazine (trimEPRAZINE)
- valAciclovir, valGANciclovir
- xalaTAN, xalaCOM
- zinVit, zinNAt
- zoCOR, zoTON
- zoLOFT, zoCOR

Table 2, cancer therapy:
- ALKeran, LEUKeran, MYLeran
- avaSTIN, avaXIM
- ciSplatin, cARBOplatin
- daCTINomycin, daPTomycin
- DAUNOrubicin, DOXOrubicin, iDArubicin
- iFOSFamide, CYCLOPHOSPHamide
- PACLitaxel, DOCEtaxel, CABAZitaxel
- vinBLASTine, vinCRISTine, vinORELBine

Table 3, classes:
- Cephalosporins: cefaLEXin, cefALOTIN, cefaZOLin, cefEPIME, cefOTAXIME, cefOXITIN, ceftAROLine, cefTAZIDIME, cefTRIAXONE
- Benzodiazepines: cloBAZam, CLONazepam, DIAzepam, LORazepam, OXazepam
- SSRI/SNRI: DULoxetine, fluoxetine, fluVOXAMine, PARoxetine
- Sulfonylureas: gliBENCLAMide, gliCLAZide, gliMEPIRide, gliPIZide

Table 4, `-mab`:
- beNRALizumab, beVACizumab, beZLOTOXumab
- eCULizumab, eFALizumab, eMICizumab
- oBINUTUZumab, oFATUMumab
- oCRELizumab, oMALizumab
- pANITUMumab, pERTUZumab
- raMUCIRumab, raNIBIZumab

Table 5, `-nib` / `-gib`:
- aFATinib, aXITinib
- bARICITinib, biNIMEtinib
- cABOZANtinib, cOBIMEtinib
- daBRAFEnib, daSATinib
- laPAtinib, leNVAtinib
- pAZOPanib, pONATinib
- soNIDEGib, soRAFENib, sUNITinib
- tOFACitinib, tRAMEtinib

Library rules:
- AU-MD-01 (M): Ship the list as data (`mixedCaseLettering.au.json`, keyed by lower-case name, value = exact form), versioned with the source edition date; never compute capitalisation.
- AU-MD-02 (M): Mixed-case transformation is applied to display text only; search/matching is case-insensitive on the plain name.
- AU-MD-03 (M): Screen readers: the mixed-case form must not be read letter by letter. Render as `<span aria-label="amlodipine">amLODIPine</span>` or equivalent [design decision].
- AU-MD-04 (C): Organisations can add local LASA pairs (the list says it is not exhaustive).

### 9.4 Australian Medicines Terminology (AMT) naming

Source: AMT v3 Model Editorial Rules v3.0 (2021) [VERIFIED for excerpts] https://www.healthterminologies.gov.au/library/DH_3535_2021_AMTv3_EditorialRules_v3.0.pdf

| Concept class | Content | Preferred term pattern / example |
|---|---|---|
| MP Medicinal Product | ingredient(s) only | `paracetamol + codeine` (ingredients joined by ` + `, order follows innovator) |
| MPUU Medicinal Product Unit of Use | ingredient, strength, form | `diclofenac sodium 50 mg enteric tablet` |
| MPP Medicinal Product Pack | MPUU + pack quantity after comma | `paracetamol 500 mg tablet, 25` |
| TP Trade Product | brand (with sponsor in brackets for generics) | `Amoxil`; `Morphine Sulfate (Hospira)` |
| TPUU Trade Product Unit of Use | brand + ingredient strength + form | FSN `Amoxil (amoxicillin 500 mg) capsule (trade product unit of use)` |
| TPP Trade Product Pack | TPUU + pack | FSN `Panamax (paracetamol 500 mg) tablet, 50 tablets (trade product pack)` |
| CTPP Containered Trade Product Pack | TPP + container | e.g. `..., 50 tablets, blister pack` [UNCERTAIN on exact PT pattern] |

Conventions: substance names lower case, brand names as registered (title case); `microgram` spelt out and not pluralised (`estradiol 100 microgram/24 hours patch`); plural units for values > 1 (tablets, capsules); denominator of 1 omitted (`500 mg/mL`); `mL`; pack notation `5 x 2 mL vials`; salts retained where the basis of strength is the salt or where clinically significant (e.g. `perindopril arginine` vs `perindopril erbumine`).

- AU-MD-05 (M): The medication line control renders from structured fields (ingredient, strength, form, route, dose ...) in the ACSQHC 16-element order; it may use the AMT MPUU preferred term as the ingredient-strength-form segment but must then apply mixed-case lettering and the bold/italic rules, which AMT does not carry.
- AU-MD-06 (R): Large numbers: AMT `10 000` vs ACSQHC display `10,000`. On screen, follow ACSQHC (comma).

### 9.5 PBS active ingredient prescribing (AIP)

[VERIFIED] https://www.nps.org.au/active-ingredient-prescribing ; [SECONDARY] PBS prescriber FAQ https://www.pbs.gov.au/general/active-ingredient-prescribing/Attachment-D-PBS-FAQs-Prescriber.docx
- Mandatory for PBS and RPBS prescriptions from 1 February 2021 (non-compliant new prescriptions not dispensable as PBS from 1 August 2021).
- Every medicine must include the active ingredient name(s).
- Exempt: handwritten prescriptions; paper medication charts in residential aged care; medicines with 4 or more active ingredients; items on the List of Excluded Medicinal Items (LEMI).
- Brand may be added after the active ingredient where clinically necessary; the List of Medicines for Brand Consideration (LMBC) prompts prescribers to consider including the brand [UNCERTAIN on exact display rule]; "brand substitution not permitted" remains a separate tick/flag [UNCERTAIN].
- AU-MD-07 (M): The prescribing/search control always shows the active ingredient first; brand is optional and shown as `– *Brand*` per 9.2.

### 9.6 National Inpatient Medication Chart (NIMC) conventions for an electronic administration chart

Sources: NIMC User Guide (Feb 2016) https://www.safetyandquality.gov.au/sites/default/files/migrated/NIMC-User-Guide.pdf ; NIMC GP e-version https://safetyandquality.gov.au/sites/default/files/2019-11/national_inpatient_medication_chart_nimc_-_general_practitioner_e-version_0.pdf ; WA Health *Take time to sign* https://www.health.wa.gov.au/~/media/Files/Corporate/general-documents/safety/PDF/Medication-safety-resources/Take-time-to-sign.pdf [all VERIFIED]

**"Reason for not administering" codes** (on paper, codes are circled so they are not mistaken for initials):

| Code | Meaning (chart legend wording) |
|---|---|
| A | Absent |
| F | Fasting |
| R | Refused – notify prescriber |
| V | Vomiting |
| L | On leave |
| N | Not available – obtain supply or contact prescriber |
| W | Withheld – enter reason in clinical record |
| S | Self administered |
| P (circled) | Parent/carer administered (paediatric NIMC only) |

- `C` is not on the national adult chart legend [VERIFIED by absence in the GP e-version legend]; some state variants and EMM products use C (e.g. "Contraindicated" or "Cancelled") [UNCERTAIN]. Do not ship `C` by default.
- AU-MD-08 (M): Electronic administration chart shows the code letter **and** its full meaning (code alone fails the 2024 "no abbreviations on digital displays" rule). The letter may be shown in the cell with the meaning in the cell's accessible name and tooltip, and in full in the detail view.
- AU-MD-09 (M): Selecting W requires a reason; R and N prompt to notify prescriber.

**Recommended administration times** (pre-printed, guideline only):

| Frequency | Times |
|---|---|
| Morning (mane) | 08:00 |
| Night (nocte) | 18:00 or 20:00 |
| Twice a day (BD) | 08:00, 20:00 |
| Three times a day (TDS) | 08:00, 14:00, 20:00 |
| Four times a day (QID) | 06:00, 12:00, 18:00, 22:00 |
| 6 hourly | 06:00, 12:00, 18:00, 24:00 (chart prints 2400; the 2024 recommendations say avoid midnight; render as 00:00 of next day with date, or configure 23:30) |
| 8 hourly | 06:00, 14:00, 22:00 |

Warfarin standard time 16:00. VTE mechanical prophylaxis AM/PM checks.

**Route abbreviations** commonly used on NIMC (2009 guidelines): PO, NG, subling, IV, IM, subcut, PR, PV, eye drop, eye ointment, topical, MA (metered aerosol), Neb. Avoid: E/e, SC, SL, S/L. On screen, expand per 9.1.

**Other NIMC features to replicate electronically**
- Identification box: URN, Family name, Given names, Address, Date of birth, Sex, Weight (kg), Height (cm); "Not a valid prescription unless identifiers present".
- Allergies/ADR box: see section 10.
- PRN orders require dose, hourly frequency (PRN alone is insufficient), route, maximum dose in 24 hours, indication.
- Warfarin section printed in red; records INR, dose, prescriber and administering initials plus second-person check. Variable dose section: dose, prescriber initials, "Time to be given" and "Time given" rows. VTE section: "risk assessed", "prophylaxis not required", "contraindicated" ticks.
- Prescribers must not annotate electronically generated orders (EMM functional requirements 10.2.1).

### 9.7 EMM business requirements relevant to UI (ACSQHC, July 2019) [VERIFIED]

https://www.safetyandquality.gov.au/sites/default/files/2019-08/emm-business-requirements-july_2019_acc_0.pdf
- 4.2: medicine name, form and strength clearly displayed on every screen where medicines are ordered, changed, reviewed or administered; show current medicines and status when prescribing; display first administration date (and time if possible); constrain entry to valid forms, routes, frequencies, strengths and doses.
- 4.3: display date of last change to any order (example `Medication orders last changed 30 SEPTEMBER 2016, 3 HOURS AGO`).
- 5: alerts fire per medicine immediately; prescriber overrides visible at administration (high-risk prominent); severity/prominence configurable by credential; unified alert view; alerts linked to further information.
- 7, 7.2: filter out patients whose medicines are up to date; show patients with no administration due; highlight time-critical medicines; alert overdue doses; "previous medication administration" window showing missed doses; show suspended/ceased orders (not administrable); show orders awaiting ID/micro approval.
- Box 4.2 example: `Thyroxin 50 MICROg on Monday, Wednesday and Friday`.
- EMM guide 7.2: printed charts on downtime should follow the national standard medication chart safety features.

### 9.8 National standard for labelling dispensed medicines (July 2021) [VERIFIED; printed labels only, electronic displays excluded]

Useful for patient-facing or discharge print views: active ingredient first then brand on separate lines; `+` with spaces between 2 to 3 ingredients; strength directly after ingredient; `micrograms` in full; numerals for quantities (`Take 1 tablet`); ranges with "to" (`1 to 2`), not a hyphen; fractions in words; sentence case; sans serif; minimum 4 mm text height; PRN with indication and maximum dose.

---

## 10. Allergies and adverse drug reactions

- NIMC box title "Allergies and adverse drug reactions (ADR)"; tick **"Nil known"** if the patient is not aware of any previous ADRs or allergies; tick **"Unknown"** if no information is available; columns "Medicine (or other)", "Reaction / type / date", "Initials"; up to four entries, then refer to health record; sign, print name, date [VERIFIED NIMC User Guide and GP e-version].
- EMM business requirements 3.4 [VERIFIED]: prompt to ask and record allergies if none recorded, continuing until allergies are recorded or the "no known allergies" value is selected; "recording 'no known allergies' is not the same as not recording any allergies"; allergies/ADRs visible on all screens from which medicines are prescribed (and administered); displayed between encounters.
- Terminology: EMM business requirements cite "SNOMED CT-AU for allergies and the Australian Medicines Terminology" [VERIFIED]. HL7 AU Core AllergyIntolerance [VERIFIED] https://hl7.org.au/fhir/core/2.0.0-ballot/StructureDefinition-au-core-allergyintolerance.html :
  - `code`: *Indicator of Hypersensitivity or Intolerance to Substance* `https://healthterminologies.gov.au/fhir/ValueSet/indicator-hypersensitivity-intolerance-to-substance-2` (extensible); candidate *Adverse Reaction Substances and Negated Findings* `.../adverse-reaction-substances-and-negated-findings-1`.
  - `reaction.manifestation`: *Clinical Finding* `.../clinical-finding-1` (preferred).
  - No known allergy: SNOMED CT `716186003 |No known allergy|`; also e.g. `1003774007 |No known Hevea brasiliensis latex allergy|`.
- ACSQHC guidance on adverse reaction wording beyond the NIMC/EMM items above was not found as a stand-alone national allergy display standard [VERIFIED by absence; the on-screen medicines guideline explicitly excludes allergy display].

Library rules:
- AU-AL-01 (M): Allergy status has three distinct states with these exact labels: `Nil known` (positively recorded, with who/when), `Unknown` (positively recorded that no information is available), and `Not recorded` (no entry). `Not recorded` must look like a warning, not like `Nil known`. [AU OVERRIDE] of NHS CUI wording "No known allergies" (NHS) to "Nil known" (NIMC); C to use "No known allergies" (EMM requirement wording).
- AU-AL-02 (M): Allergy summary is persistent on all prescribing and administration screens.
- AU-AL-03 (R): Each entry shows substance (AMT/SNOMED preferred term with mixed-case lettering where applicable), reaction, type (allergy/intolerance), date, and verification.
- AU-AL-04 (C): Red identification band status (ACSQHC band spec allows a red band for known allergy or risk) may be shown as a text indicator "Red ID band" in Zone 2.

---

## 11. Terminology (SNOMED CT-AU, AMT, NCTS)

- National Clinical Terminology Service (NCTS), operated by the Australian Digital Health Agency: https://www.healthterminologies.gov.au . Publishes SNOMED CT-AU (the Australian extension, includes AMT) monthly, plus FHIR value sets at `https://healthterminologies.gov.au/fhir/ValueSet/...` and the national terminology server (Ontoserver, `https://tx.ontoserver.csiro.au/fhir` for public read) [SECONDARY].
- AMT is distributed within SNOMED CT-AU (the "Australian Clinical Terminology" release) [UNCERTAIN on current product naming].
- Australian English language reference set ID `32570271000036106`; SNOMED CT-AU module `32506021000036107`; AMT module `900062011000036108` [UNCERTAIN, domain knowledge; verify in NCTS release notes].
- Display guidance: use the **preferred term in the Australian English language reference set**, not the FSN; never show the semantic tag (e.g. "(disorder)") to clinicians [UNCERTAIN as a written national rule, consistent with SNOMED International and NHS CUI G8].
- AU-TM-01 (M): Terminology controls are parameterised by edition URI (`http://snomed.info/sct/32506021000036107`) and language reference set; default to AU.
- AU-TM-02 (M): Medicines search binds to AMT (MPUU/TPUU/CTPP) for selection, displays per 9.2.

---

## 12. Accessibility, privacy and observation charts

### 12.1 Accessibility

- Digital Service Standard v2.0 (DTA), Criterion 3 "Leave no one behind": comply with the "latest version of the Web Content Accessibility Guidelines (WCAG)", the Disability Discrimination Act 1992, the Australian Government Style Manual, provide a feedback mechanism, and follow the Digital Inclusion Standard [VERIFIED] https://www.digital.gov.au/policy/digital-experience/digital-service-standard/criterion-3 . The DSS PDF does not state a conformance level [VERIFIED by absence].
- Applies from 1 July 2024 to new public-facing and new staff-facing informational/transactional services of non-corporate Commonwealth entities; from 1 July 2025 to existing public-facing services; not to state/territory/local government services; existing staff-facing services recommended only [VERIFIED] https://digital.gov.au/sites/default/files/documents/2024-10/Digital%20Service%20Standard.pdf
- State health services are not bound by the DSS but most state policies require WCAG 2.x AA [UNCERTAIN]. DDA 1992 applies to all.
- AU-AC-01 (M): Library target is **WCAG 2.2 Level AA** (the latest W3C Recommendation as at Oct 2026; AA is the de facto Australian government level) [design decision based on above].

### 12.2 Privacy and My Health Record

- My Health Record access controls [VERIFIED] https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/manage-your-record/privacy-and-access/restrict-access-to-your-record :
  - **Record Access Code (RAC)**: 4 to 8 characters; organisation-level; new organisations cannot view the record without it (but can still upload); organisations not accessing for 3 years need it again.
  - Restricted documents: consumer can restrict individual documents; providers using the RAC see "general access" documents.
  - **Emergency access ("break glass")**: available in a medical emergency even with a RAC, gives access including restricted documents; logged in the access history.
  - Limited Document Access Code (LDAC) also exists for restricted documents [UNCERTAIN: not on the page fetched].
- Privacy Act 1988 (Australian Privacy Principles) and My Health Records Act 2012 govern use [UNCERTAIN detail].
- AU-PV-01 (M): The library provides a "record access restricted" banner state with text, e.g. `My Health Record: access code required`, and an "Emergency access" action that requires a reason and shows an explicit warning that the access is logged.
- AU-PV-02 (M): When content was obtained via emergency access, display a persistent "Emergency access" indicator on that content.
- AU-PV-03 (R): Do not display ID document images; RACGP CG2: copies "must not be stored in the patient health record" [VERIFIED].
- AU-PV-04 (C): Suppression of name/photo for deceased persons where culturally requested (section 3.2).

### 12.3 Recognising and responding to deterioration

National Consensus Statement: Essential elements for recognising and responding to acute physiological deterioration, 3rd edition, November 2021 (ACSQHC) [VERIFIED] https://www.safetyandquality.gov.au/sites/default/files/2021-12/essential_elements_for_recognising_and_responding_to_acute_physiological_deterioration.pdf . (A September 2026 PDF of the same edition exists at https://www.safetyandquality.gov.au/sites/default/files/2026-09/National-Consensus-Statement-Essential-elements-for-recognising-and-responding-to-acute-physiological-deterioration-third-edition.pdf but could not be fetched [UNCERTAIN whether content changed].)

- 1.7 Minimum observations: respiratory rate, oxygen saturation, heart rate, blood pressure, temperature, level of consciousness, new-onset confusion or behaviour change.
- 1.3 to 1.6: monitoring plan per patient; most patients at least every 6 hours; thresholds may be modified (e.g. COPD oxygen targets) with defined approval.
- 1.8 to 1.11: structured tool (paper or electronic), designed and tested using human factors principles, including **graphical display of trends over time**, thresholds that trigger escalation (single parameter or combinations/aggregate scores), space for the patient's normal range, and the response required at each threshold. Variants for maternity, paediatrics, sepsis, stroke.
- Element 3: escalation protocol with tiers, graded response, absolute values and rate of change, who/when, back-up; clinician "worried" criterion; patient/family escalation.
- Element 9: technology must not come between clinician and patient; consider alarm fatigue; backup when systems fail.

**Adult Deterioration Detection System (ADDS), ACSQHC 2011/2012** [VERIFIED bands, UNCERTAIN scores/colours]
Source: https://www.safetyandquality.gov.au/sites/default/files/migrated/ADDS-chart-without-blood-pressure-table-2012.pdf (marked "DRAFT - NOT FOR USE"); development report https://www.safetyandquality.gov.au/sites/default/files/migrated/35981-ChartDevelopment.pdf

Graph row bands (top to bottom):
- Respiratory rate: ≥35 (write value), 30-34, 25-29, 20-24, 15-19, 10-14, 5-9, ≤4 (write value)
- SpO2 %: 98-100, 95-97, 93-94, 90-92, 87-89, 85-86, ≤84 (write value)
- O2 flow L/min: ≥13, 10-12, 7-9, 4-6, ≤3
- Systolic BP mmHg: ≥200 (write value), then 10 mmHg rows 190s down to 40s
- Heart rate: ≥140 (write value), 10-beat rows 130s down to 40s, ≤30 (write value)
- Temperature °C: ≥39.1 (write value), 38.5-39.0, 38.0-38.4, 37.5-37.9, 37.0-37.4, 36.5-36.9, 36.0-36.4, 35.5-35.9, ≤35.4 (write value)
- Consciousness (AVPU): Alert, Voice, Pain, Unresponsive
- Systolic BP scoring version 1 compares with the patient's usual systolic (table); version 2 assumes usual 120 mmHg.

Total ADDS score actions:
- 1-3: inform nurse in charge; increase observation frequency.
- 4-5: senior nurse and/or junior medical officer review within 30 minutes; increase frequency.
- 6-7: registrar-level (senior medical officer) review within 30 minutes.
- ≥8: emergency call.
- Emergency call regardless of score: any observation in a **purple** area; airway threat; respiratory or cardiac arrest; new SpO2 < 90%; sudden fall in consciousness; seizure; serious concern.

Colour design: each row coloured by score, colour density increasing with abnormality (designed to remain distinguishable for red-green colour-blind users), redundant non-colour cues, pastel colours, no more than five colours, purple for emergency. The commonly reproduced mapping is score 1 = yellow, 2 = orange, 3 = red, emergency = purple [UNCERTAIN: names not in extractable text]. Per-band scores were in images that could not be extracted, and the development report says cut-offs "should be regarded as placeholders and subject to clinical review" [VERIFIED]. **Do not hard-code ADDS scores.**

**State systems** (each jurisdiction uses its own chart; values vary):
- NSW Between the Flags (CEC): two zones, **Yellow Zone** (Clinical Review, discretionary, review within 30 minutes) and **Red Zone** (Rapid Response, mandatory) [VERIFIED]. Adult calling criteria as reproduced in a 2025 SESLHD orientation deck (secondary; column boundaries ambiguous in extraction) [SECONDARY, UNCERTAIN boundaries]:

| Observation | Yellow Zone | Red Zone |
|---|---|---|
| Respiratory rate | 6-10 or 25-30 | ≤5 or ≥30 (sic; likely >30) |
| SpO2 | 91-95% | ≤90% |
| Oxygen | new requirement | increasing requirement |
| Systolic BP | 90-100 or 180-200 | ≤90 or ≥200 |
| Heart rate | 40-50 or 120-140 | ≤40 or ≥140 |
| Consciousness | responds to voice; new confusion | responds to pain only; unresponsive |
| Temperature | ≤35.5 or ≥38.5 | (local) |
| BGL | ≤4 or ≥20 mmol/L | with reduced consciousness |
| Urine output | < 100 mL in 4 h | < 200 mL in 8 h (local) |

  Source: https://www.seslhd.health.nsw.gov.au/sites/default/files/groups/Prince_of_Wales_Hospital/Medical%20education/Medical%20Officer%20Orientation%20Uploads/RegistrarOrientationBetweentheFlags2025.pdf ; CEC charts https://www.cec.health.nsw.gov.au/keep-patients-safe/between-the-flags/observation-charts
- Queensland Q-ADDS: seven parameters (RR, SpO2, O2 requirement, BP, HR, temperature, level of consciousness), non-linear per-parameter scores summed, colour zones with pre-set escalation up to MET call, single-parameter MET triggers [VERIFIED description; bands not available] https://www.health.qld.gov.au/__data/assets/pdf_file/0045/887949/dohdl1819094.pdf
- Victoria, SA, WA, Tas: use ADDS-derived or local charts [UNCERTAIN].

Library rules for the observation chart control:
- AU-OB-01 (M): Bands, scores, colours, zone names and actions are data (a "chart definition" object), not code. Ship example definitions for ADDS (structure only, scores marked placeholder), NSW BTF and NHS NEWS2 (from G9), each clearly labelled with source and "verify locally".
- AU-OB-02 (M): Show the seven minimum observations and a free-text "new confusion / behaviour change" and "staff/family concern" entry.
- AU-OB-03 (M): Graphical trend display with bands; values outside the chart's extreme bands are written as numbers ("write value") rather than clipped.
- AU-OB-04 (M): Zone/score must be conveyed by text and pattern as well as colour (WCAG 1.4.1; ADDS redundant-cue principle). Colour palette must remain distinguishable under deuteranopia/protanopia.
- AU-OB-05 (M): Support patient-specific modified thresholds with approver, reason and review date displayed (Consensus Statement 1.5, Element 3).
- AU-OB-06 (M): Display the required response text at each threshold next to the triggered value.

---

## 13. Summary of [AU OVERRIDE] items versus NHS CUI

1. Identifiers: NHS Number replaced by IHI/URN primary slot, Medicare+IRN and DVA secondary (1.6).
2. Allergy wording: "Nil known" / "Unknown" / "Not recorded" (10).
3. Medication lines: never truncated; mixed-case lettering from the AU list; active ingredient bold lower case, brand italic Title Case after an en dash; labels DOSE/SUPPLY in capitals; comma thousands separators; `MICROg`/`microgram`; no abbreviations on screen (9.1, 9.2).
4. DOB option `DD/MM/YYYY` to match wristband (2.2); otherwise `DD-Mon-YYYY` as NHS.
5. Time zones: multiple zones and DST transitions within one service (8.3).
6. Sex/gender value sets per ABS 2020 and METeOR (4).
7. Indigenous status mandatory question pattern (5).
8. Address and phone formats (6, 7).
9. Observation chart bands configurable per jurisdiction (12.3).

## 14. Source index

- ACSQHC NSQHS Action 6.05: https://www.safetyandquality.gov.au/node/3739
- ACSQHC Specifications for a standard patient identification band: https://www.safetyandquality.gov.au/sites/default/files/migrated/Specs-PatID-Band.pdf
- ACSQHC National guidelines for on-screen display of clinical medicines information (2016): https://www.safetyandquality.gov.au/sites/default/files/migrated/National-guidelines-for-onscreen-display-of-clinical-medicines-information.pdf
- ACSQHC Recommendations for safe use of medicines terminology (Nov 2024): https://www.safetyandquality.gov.au/sites/default/files/2024-12/recommendations-for-safe-use-of-medicines-terminology.pdf
- ACSQHC National Mixed-Case Lettering List (Apr 2024): https://safetyandquality.gov.au/sites/default/files/2024-04/national_mixed-case_lettering_list.pdf
- ACSQHC NIMC User Guide (2016): https://www.safetyandquality.gov.au/sites/default/files/migrated/NIMC-User-Guide.pdf
- ACSQHC NIMC GP e-version: https://safetyandquality.gov.au/sites/default/files/2019-11/national_inpatient_medication_chart_nimc_-_general_practitioner_e-version_0.pdf
- ACSQHC Guidelines for NIMC (2009): https://www.safetyandquality.gov.au/sites/default/files/migrated/24380-GuidelinesForNIMC2009.pdf
- WA Health Take time to sign: https://www.health.wa.gov.au/~/media/Files/Corporate/general-documents/safety/PDF/Medication-safety-resources/Take-time-to-sign.pdf
- ACSQHC EMM business requirements (2019): https://www.safetyandquality.gov.au/sites/default/files/2019-08/emm-business-requirements-july_2019_acc_0.pdf
- ACSQHC EMM functional requirements (2019): https://www.safetyandquality.gov.au/sites/default/files/2019-08/sq19-030_emms_functional_requirements_acc_01n_5_aug_2019.pdf
- ACSQHC EMM guide to safe implementation (3rd ed): https://www.safetyandquality.gov.au/resources/electronic-medication-management-systems-guide-safe-implementation-third-edition
- ACSQHC National standard for labelling dispensed medicines (2021): https://www.safetyandquality.gov.au/sites/default/files/2021-08/labelling2-publish-web-072aug21.pdf
- ACSQHC National Consensus Statement (3rd ed 2021): https://www.safetyandquality.gov.au/sites/default/files/2021-12/essential_elements_for_recognising_and_responding_to_acute_physiological_deterioration.pdf
- ACSQHC ADDS chart (2012): https://www.safetyandquality.gov.au/sites/default/files/migrated/ADDS-chart-without-blood-pressure-table-2012.pdf
- ABS Standard for Sex, Gender, VSC and SO (2020): https://abs.gov.au/statistics/standards/standard-sex-gender-variations-sex-characteristics-and-sexual-orientation-variables/latest-release
- METeOR 602543 Indigenous status: https://meteor.aihw.gov.au/content/602543
- METeOR 741686 Sex code X: https://meteor.aihw.gov.au/content/741686
- METeOR 741842 Gender code X: https://meteor.aihw.gov.au/content/741842
- METeOR 613331 Family name: https://meteor.aihw.gov.au/content/613331
- HL7 AU Base IHI: https://hl7.org.au/fhir/5.0.0/StructureDefinition-au-ihi.html ; HPI-I: https://hl7.org.au/fhir/StructureDefinition-au-hpii.html ; DVA: https://hl7.org.au/fhir/StructureDefinition-au-dvanumber.html ; IHI status: https://hl7.org.au/fhir/2018Mar/CodeSystem-ihi-status.html
- HL7 AU Core AllergyIntolerance: https://hl7.org.au/fhir/core/2.0.0-ballot/StructureDefinition-au-core-allergyintolerance.html
- Medicare/DVA/provider validation (secondary): https://air.claiming.com.au/docs/validation-and-checks/
- AMT v3 Editorial Rules: https://www.healthterminologies.gov.au/library/DH_3535_2021_AMTv3_EditorialRules_v3.0.pdf
- NPS MedicineWise active ingredient prescribing: https://www.nps.org.au/active-ingredient-prescribing
- Australia Post Correct addressing: https://auspost.com.au/content/dam/auspost_corp/media/documents/correct-addressing.pdf
- UPU Australia addressing: https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/ausEn.pdf
- Style Manual telephone numbers: https://www.stylemanual.gov.au/style-rules-and-conventions/numbers-and-measurements/telephone-numbers
- Business Victoria daylight saving: https://business.vic.gov.au/business-information/daylight-saving
- DTA Digital Service Standard Criterion 3: https://www.digital.gov.au/policy/digital-experience/digital-service-standard/criterion-3
- ADHA My Health Record restrict access: https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/manage-your-record/privacy-and-access/restrict-access-to-your-record
- RACGP Standards 6th ed CG2: https://www.racgp.org.au/running-a-practice/practice-standards/standards-6th-edition/the-standards-for-general-practices-6th-edition/clinical-governance-standard/cg2-patient-identification
- NSW BTF (secondary): https://www.seslhd.health.nsw.gov.au/sites/default/files/groups/Prince_of_Wales_Hospital/Medical%20education/Medical%20Officer%20Orientation%20Uploads/RegistrarOrientationBetweentheFlags2025.pdf
- Q-ADDS validation report: https://www.health.qld.gov.au/__data/assets/pdf_file/0045/887949/dohdl1819094.pdf

## 15. Open items to verify before release

1. Exact casing of every mixed-case entry against the 2024 PDF (text extraction used).
2. ACSQHC on-screen guideline Appendix 10.1 (units) and 10.2 (time) full text.
3. ADDS per-band scores and colours (images not extractable); NSW BTF exact boundaries from the current CEC SAGO chart.
4. METeOR name usage code values and name field lengths.
5. Medicare first-digit range, IRN storage, and card print grouping from Services Australia developer documentation.
6. HPI-I/HPI-O FHIR system URIs; IHI display grouping.
7. Postcode ranges (Australia Post postcode file) and unit address presentation (Australia Post Address Presentation Standard / AS 4590.1).
8. SNOMED CT-AU module and language reference set IDs from current NCTS release notes.
9. Whether the September 2026 Consensus Statement PDF changes any element.

## 16. NSW Between the Flags: SAGO calling criteria (research, 27-Oct-2026)

Purpose: data for the `EWS_NSW_BTF` preset (src/lists/utils/regions/earlyWarning.ts). Status: **verify locally before clinical use**.

### Sources checked

| Source | Type | What it gives |
|---|---|---|
| CEC, NSW Health Standard Adult General Observation chart, form SMR110010: https://cec.health.nsw.gov.au/__data/assets/pdf_file/0012/258699/NSW-Health-Standard-Adult-General-Observation-Chart.PDF | Primary (chart) | Zone names and actions, additional Yellow and Red Zone criteria, ACVPU, alterations to calling criteria (ACC) rules, chart row scales. **Zone boundaries are drawn as colour bands and are not in the PDF text layer.** No version date in the text (pages 2-3 carry "NH606512 061125"). |
| NSW Health PD2025_014 Recognition and management of patients who are deteriorating (April 2025, replaces PD2020_018): https://www1.health.nsw.gov.au/pds/ActivePDSDocuments/PD2025_014.pdf | Primary (policy) | Standard charts have colour-coded calling criteria; Yellow Zone = early warning signs of deterioration; Red Zone = late warning signs and criteria for which a Rapid Response call is required. No numeric criteria. |
| SESLHD (Prince of Wales) Between the Flags registrar orientation, February 2025: https://www.seslhd.health.nsw.gov.au/sites/default/files/groups/Prince_of_Wales_Hospital/Medical%20education/Medical%20Officer%20Orientation%20Uploads/RegistrarOrientationBetweentheFlags2025.pdf | Secondary | Adult calling criteria table with numbers (text extraction partly garbled). |
| SESLHD Between the Flags orientation, February 2023/2024: https://seslhd.health.nsw.gov.au/sites/default/files/POWMedEd/2024%20MEU%20secure/Between%20the%20Flags%20Orientation%20SZSA5Feb24.pdf | Secondary | Same table; agrees with the 2025 deck. |
| SESLHD local operating procedure, adult PACE criteria (approved June 2018): https://www.seslhd.health.nsw.gov.au/sites/default/files/documents/adultacuteforescalation19.pdf | Secondary (local) | Red Zone only: RR ≤ 5 or ≥ 30; SpO2 ≤ 90%; SBP ≤ 90 or ≥ 200; HR ≤ 40 or ≥ 140; decrease in level of consciousness. |
| SESLHDPR 697 Management of the deteriorating adult inpatient (Nov 2023): https://www.seslhd.health.nsw.gov.au/sites/default/files/documents/SESLHDPR%20697%20-%20Management%20of%20the%20Deteriorating%20ADULT%20inpatient%20%28excluding%20maternity%29_0.pdf | Secondary (local) | Adults over 16 use the SAGO chart; criteria tables are images (not extractable). |
| CEC observation charts page: https://www.cec.health.nsw.gov.au/keep-patients-safe/between-the-flags/observation-charts | Primary (index) | Could not be fetched (site error). |

### Zones and actions (SAGO chart text) [VERIFIED, wording paraphrased]

- Three zones: within the flags (white), **Yellow Zone: Clinical Review**, **Red Zone: Rapid Response**. Zone-based; there is no aggregate score.
- Yellow Zone actions: initiate appropriate clinical care; repeat and increase observation frequency as the patient's condition indicates; consult promptly with the Nurse in Charge about calling a Clinical Review. (Older BTF material and G10 12.3 give review within 30 minutes; not in the SAGO text layer [UNCERTAIN].)
- Red Zone actions: call for a Rapid Response as per local CERS; initiate appropriate clinical care; "Inform the NURSE IN CHARGE that you have called for a RAPID RESPONSE"; repeat and increase observation frequency; document an A-G assessment, reason for escalation, treatment and outcome; inform the Attending Medical Officer as soon as practicable.
- Additional Yellow Zone criteria: increasing oxygen requirement; poor peripheral circulation; excess or increasing blood loss; decrease in level of consciousness or new confusion; urine output < 100 mL over 4 hours (or < 0.5 mL/kg/h via IDC); polyuria > 200 mL/h for 2 hours without diuretics; greater than expected drain loss; new, increasing or uncontrolled pain (including chest pain); BGL < 4 or > 20 mmol/L without decreased consciousness; ketonaemia > 1.5 mmol/L or ketonuria 2+ or more; concern from patient, family or staff.
- Additional Red Zone criteria: deterioration not reversed within 1 hour of Clinical Review; increasing oxygen requirement to keep SpO2 > 90%; ABG PaO2 < 60, PaCO2 > 60, pH < 7.2 or BE < -5; VBG PvCO2 > 65 or pH < 7.2; responds only to pain (P); sudden fall of 2 or more GCS points; new or prolonged seizure; urine output < 200 mL over 8 hours; BGL < 4 or > 20 mmol/L with decreased consciousness; serious concern from patient, family or staff; cardiac or respiratory arrest; airway obstruction or stridor; unresponsive.
- Alterations to calling criteria: signed by a Medical Officer and confirmed by the Attending Medical Officer; rationale documented; acute alterations up to 12 hours, chronic for the episode of care.
- Chart row scales: RR 5-35; SpO2 85-100%; SBP 50-230 ("SBP is trigger"); HR 40-160; temperature 34-41 °C; ACVPU.

### Numeric boundaries (secondary sources) [SECONDARY; boundaries UNCERTAIN where marked]

| Observation | Yellow Zone | Red Zone | Library choice |
|---|---|---|---|
| Respiratory rate | 6-10 or 25-30 | ≤ 5 or ≥ 30 | Yellow 6-10, 25-29; Red ≤ 5, ≥ 30 (30 in both sources: Red) |
| SpO2 | 91-95% | ≤ 90% | as given |
| Oxygen | new requirement (≤ 4 L/min) | increasing requirement (≥ 5 L/min) | chart wording used instead of flow: "increasing" Yellow, "increasing to keep SpO2 > 90%" Red |
| Systolic BP | 90-100 or 180-200 | ≤ 90 or ≥ 200 | Yellow 91-100, 180-199; Red ≤ 90, ≥ 200 |
| Heart rate | 40-50 or 120-140 | ≤ 40 or ≥ 140 | Yellow 41-50, 120-139; Red ≤ 40, ≥ 140 |
| Temperature | ≤ 35.5 or ≥ 38.5 | not given | Yellow only [UNCERTAIN: zone assignment unclear in extraction] |
| Consciousness | responds to voice; new confusion or behaviour change | responds to pain; unresponsive; stroke symptoms | C and V Yellow; P and U Red |

Where a boundary appears in both columns the library places it in the Red Zone (the safer reading). Verify every boundary against the SAGO chart print in use and any local CERS variation; NSW also has separate maternity, paediatric and emergency department charts that this preset does not cover.
