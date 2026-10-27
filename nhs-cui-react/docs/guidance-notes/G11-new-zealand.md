# New Zealand localisation (Aotearoa New Zealand health standards)

Purpose: specify what a React clinical UI control library derived from the UK NHS Common User Interface (CUI) guidance must change, add or constrain so that it is appropriate for use in New Zealand health care. Each item gives formats, algorithms, value sets, labels and the primary source URL.

Conventions used in this note:
- **[VERIFIED]**: confirmed against the cited primary source during research (October 2026). Algorithms marked verified were also executed against every published worked example.
- **[UNCERTAIN]**: not confirmed from a primary source, inferred, or the primary source is silent or ambiguous. Treat as a default that a product owner must confirm.
- **[DISCREPANCY]**: primary sources disagree; the note says which one to follow.
- **[NHS DELTA]**: where NZ behaviour differs from the UK CUI behaviour implemented elsewhere in this library (see G1, G2, G5, G6, G8, G9).
- "Health NZ" = Health New Zealand | Te Whatu Ora (successor to the Ministry of Health's operational functions and the 20 DHBs, July 2022). "HQSC" = Health Quality & Safety Commission | Te Tāhū Hauora. "HISO" = Health Information Standards Organisation (standards now published by Health NZ).
- Many HISO standards moved from health.govt.nz to tewhatuora.govt.nz; older URLs may redirect.

Key primary sources (fetched for this note):

| Ref | Source | URL |
|---|---|---|
| S1 | HISO 10046:2024 Consumer Health Identity Standard (published July 2024) | https://tewhatuora.govt.nz/assets/Publications/HISO-Standards/hiso-10046-2024-Consumer-health-identity-standard.pdf |
| S2 | Health NZ, Upcoming changes to NHI numbers | https://www.tewhatuora.govt.nz/health-services-and-programmes/health-identity/national-health-index/upcoming-changes-nhi |
| S3 | Health NZ, NHI new format compliance | https://tewhatuora.govt.nz/health-services-and-programmes/health-identity/national-health-index/nhi-new-format-compliance |
| S4 | Health NZ, HPI overview | https://www.tewhatuora.govt.nz/health-services-and-programmes/health-identity/health-provider-index/hpi-overview |
| S5 | Health NZ, Identity standards list | https://www.tewhatuora.govt.nz/our-health-system/digital-health/data-and-digital-standards/approved-standards/identity-standards |
| S6 | HISO 10001:2017 Ethnicity Data Protocols | https://tewhatuora.govt.nz/assets/Our-health-system/Digital-health/Health-information-standards/HISO-10001-2017-Ethnicity-Data-Protocols.pdf |
| S7 | HISO 10094:2022 Māori Descent and Iwi Affiliation Data Protocols | https://www.tewhatuora.govt.nz/assets/For-the-health-sector/HISO-10094-2022-Maori-Descent-and-Iwi-Affiliation-Data-Protocols.pdf |
| S8 | Stats NZ (2021) Data standard for gender, sex, and variations of sex characteristics | https://www.stats.govt.nz/assets/Methods/Data-standards-for-sex-gender-and-variations-on-sex-characteristics/downloads/Data-standard-for-gender-sex-and-variations-of-sex-characteristics.pdf |
| S9 | HQSC National Medication Chart user guide, 3rd edition, January 2021 | https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf |
| S10 | HQSC Aotearoa New Zealand Tall Man lettering list (October 2023) | https://hqsc.govt.nz/resources/resource-library/aotearoa-new-zealand-tall-man-lettering-list (XLSX: https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/Aotearoa_New_Zealand_Tall_Man_lettering_list_Oct_2023.xlsx) |
| S11 | HQSC Tall Man lettering report, December 2013 (methodology) | https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/Tall-Man-report-Dec-2013.PDF |
| S12 | HQSC Alert 4: Error-prone abbreviations, symbols and dose designations NOT TO USE | https://hqsc.govt.nz/resources/resource-library/alert-4-error-prone-abbreviations-symbols-and-dose-designations-not-to-use |
| S13 | HQSC NZEWS Vital Sign Chart (interactive PDF, Nov 2018) | https://www.hqsc.govt.nz/assets/Our-work/Improved-service-delivery/Patient-deterioration/Publications-resources/Interactive-NVSC-final-Nov-2018-1-v2.pdf |
| S14 | HQSC NZEWS Vital Sign Chart User Guide, July 2017 | https://www.hqsc.govt.nz/assets/Our-work/Improved-service-delivery/Patient-deterioration/Publications-resources/Vital_sign_chart_user_guide_July_2017_.pdf |
| S15 | NZ Post addressing standards (business) | https://nzpost.co.nz/business/shipping-in-nz/addressing-standards |
| S16 | NZ Post how to address mail (personal) | https://www.nzpost.co.nz/personal/sending-in-nz/how-to-address-mail |
| S17 | Health NZ, NZMT on the NZ Health Terminology Service | https://www.tewhatuora.govt.nz/health-services-and-programmes/digital-health/terminology-service/nzmt |
| S18 | HL7 NZ, NZ Formulary/NZULM FHIR IG glossary | https://build.fhir.org/ig/HL7NZ/nzf/glossary.html |
| S19 | Health NZ, About the NZ Edition of SNOMED CT | https://www.tewhatuora.govt.nz/our-health-system/digital-health/snomed-ct-national-release-centre/new-zealand-edition-of-snomed-ct |
| S20 | Health NZ, Allergy and adverse reaction data standard (HISO 10066:2025, in development) | https://tewhatuora.govt.nz/health-services-and-programmes/digital-health/data-and-digital-standards/standards-in-development/allergy-and-adverse-reaction-data-standard |
| S21 | Health NZ, Setting up and using NZePS | https://www.tewhatuora.govt.nz/health-services-and-programmes/eprescriptions/setting-up-and-using-nzeps |
| S22 | NZ Government Web Accessibility Standard 1.2 | https://digital.govt.nz/standards-and-guidance/nz-government-web-standards/web-accessibility-standard-1-2/about-the-web-accessibility-standard |
| S23 | DIA, Daylight saving media release | https://dia.govt.nz/press.nsf/d77da9b523f12931cc256ac5000d19b6/edd6f9e847da76fbcc2585ed00820798!OpenDocument |
| S24 | Telephone numbers in New Zealand (secondary; cites NAD Aotearoa Number Register nad.org.nz) | https://en.wikipedia.org/wiki/Telephone_numbers_in_New_Zealand |

---

## 1. National Health Index (NHI) and Health Provider Index (HPI)

### 1.1 NHI formats [VERIFIED S1, S2]

Both formats are 7 characters, upper case, and remain valid indefinitely. Systems must support both and must be able to tell them apart (S2).

| Format | Pattern | Positions | Example | Issued |
|---|---|---|---|---|
| Legacy | `AAANNNC` | 1-3 letters (A-Z excluding I and O); 4-6 digits; 7 numeric check digit | `ZAC5361` | Until 30 June 2026 |
| New | `AAANNAX` (S2) / `AAANNAC` (S1) | 1-3 letters (excluding I and O); 4-5 digits; 6 letter (excluding I and O); 7 alphabetic check character | `ZBN77VL` | From 1 July 2026 |

- **[DISCREPANCY]** S1 writes the new format as `AAANNAC`, S2 as `AAANNAX`. Both mean the same thing (last character is an alphabetic check character). Use `AAANNAX` in UI help text only if needed; the library should not expose either pattern string to end users.
- Format discrimination rule (S1): if the 7th character is a digit, it is legacy format; if it is a letter, it is new format.
- Numbers are never reused (S1).
- **Test range**: NHIs beginning with `Z` are reserved exclusively for testing (S1, S2). Example NHIs in the library's documentation, Storybook stories and tests must use the Z range (for example `ZAC5361`, `ZBN77VL`). Health NZ also publishes NHI test data including a "NHI records Mod23" XLSX (S2).
- New-format numbers are issued in order of first letter starting at `A`, with the remaining characters randomised (S2). Published real-format examples (S2): `ACA31FM`, `ASE37QK`, `ARE62RS`, `BGJ06AS`, `BGA44DT`, `BWT41BY`. All validate with the algorithm below.
- S1 also maintains a list of letter sequences that must not be issued (offensive combinations). The list is not needed for validation. [UNCERTAIN: list contents not extracted.]

Regular expressions (case-sensitive after normalisation to upper case):

```
LEGACY  = /^[A-HJ-NP-Z]{3}[0-9]{3}[0-9]$/
NEW     = /^[A-HJ-NP-Z]{3}[0-9]{2}[A-HJ-NP-Z][A-HJ-NP-Y]$/
EITHER  = LEGACY | NEW
```

Note the new-format check character range is A to Y (Z cannot be produced by the mod 23 algorithm) [VERIFIED by S1 table: check character is the letter at index 1..23].

### 1.2 NHI check algorithms [VERIFIED S1, S2; executed against all published examples]

Letter values (I and O omitted):

| A | B | C | D | E | F | G | H | J | K | L | M | N | P | Q | R | S | T | U | V | W | X | Y | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 |

Digits 0-9 take their face value.

Common steps (both formats):
1. Convert characters 1-6 to values using the table.
2. Multiply by weights 7, 6, 5, 4, 3, 2 respectively.
3. Sum the six products = `S`.

Legacy (numeric check digit, modulus 11):
4. `r = S mod 11`. If `r = 0` the NHI is invalid (no valid check digit exists).
5. `c = 11 - r`. If `c = 10`, the check digit is `0`.
6. Valid if character 7 equals `c`.
- Worked example (S1): `ZAC536` gives 24x7 + 1x6 + 3x5 + 5x4 + 3x3 + 6x2 = 168 + 6 + 15 + 20 + 9 + 12 = 230; 230 mod 11 = 10; 11 - 10 = 1; NHI `ZAC5361`.

New (alphabetic check character, modulus 23):
4. `r = S mod 23`.
5. `i = 23 - r` (range 1..23).
6. Check character = the letter whose value in the table above is `i` (A=1 ... Y=23).
- Worked example (S1): `ZBN77V` gives 168 + 12 + 65 + 28 + 21 + 40 = 334; 334 mod 23 = 12; 23 - 12 = 11; letter 11 = `L`; NHI `ZBN77VL`.
- S2 describes the change as moving "from mod 24 to mod 23" while keeping the weights 7..2; systems that validate check digits must use mod 23.

Reference implementation (TypeScript):

```ts
const NHI_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 24 letters, no I or O
const val = (ch: string) => (/[0-9]/.test(ch) ? Number(ch) : NHI_ALPHA.indexOf(ch) + 1);

export type NhiFormat = 'legacy' | 'new';
export function nhiFormat(nhi: string): NhiFormat | null {
  if (/^[A-HJ-NP-Z]{3}[0-9]{4}$/.test(nhi)) return 'legacy';
  if (/^[A-HJ-NP-Z]{3}[0-9]{2}[A-HJ-NP-Z]{2}$/.test(nhi)) return 'new';
  return null;
}
export function isValidNhi(input: string): boolean {
  const nhi = input.replace(/\s+/g, '').toUpperCase();
  const fmt = nhiFormat(nhi);
  if (!fmt) return false;
  const sum = [7, 6, 5, 4, 3, 2].reduce((s, w, i) => s + val(nhi[i]) * w, 0);
  if (fmt === 'legacy') {
    const r = sum % 11;
    if (r === 0) return false;
    return String((11 - r) % 10) === nhi[6];
  }
  return NHI_ALPHA[23 - (sum % 23) - 1] === nhi[6];
}
```

### 1.3 NHI display and entry rules

- Store and display upper case (S1: "Letters are upper case"). [VERIFIED]
- Display as 7 contiguous characters with no spaces or separators. [UNCERTAIN: no Health NZ source states a display grouping; every official example and the HQSC charts (label field "NHI#:", NMC example `AAA1234`) show the NHI unbroken. No NZ equivalent of the NHS "3 3 4" grouping exists.] **[NHS DELTA]**: the library's NHS Number component groups digits 3-3-4; the NHI component must not group.
- Label: "NHI" or "NHI number". HQSC charts use "NHI#:" (S13) and "NHI number" (S9). Recommended UI label: **NHI** in the patient banner, **NHI number** in forms. [UNCERTAIN: no mandated label; derived from S9, S13.]
- Entry: accept lower case and leading/trailing spaces, normalise to upper case on blur; reject I and O with a specific message (users commonly type 0/1 for O/I).
- S2 gives no display, case or spacing rules for data entry beyond validation; compliance testing is through the NHI Format Change Compliance Form (S2, S3).
- Suggested validation messages (library-authored, not from a source) [UNCERTAIN]:
  - Empty when required: "Enter an NHI number"
  - Wrong length/characters: "NHI number must be 7 characters: 3 letters, then either 4 numbers, or 2 numbers and 2 letters"
  - Contains I or O: "NHI numbers do not use the letters I or O"
  - Check digit failure: "Check the NHI number. It is not a valid NHI"
  - Z prefix in production configuration: warning "This is a test NHI number"
- The patient banner should be able to show that an NHI is a dormant or superseded NHI linked to a live one (the NHI system links duplicates to a master). [UNCERTAIN: linkage display not specified in S1.]

### 1.4 HISO 10046 consumer identity data set (summary relevant to UI) [VERIFIED S1]

| Data element | Max | Obligation | Format / values |
|---|---|---|---|
| NHI number | 7 | Mandatory | See 1.1 |
| Date of birth | 8 | Mandatory | `YYYY[MM[DD]]`; year mandatory; month if known; day only if month known; valid date; not in the future |
| Date of birth source | | | BRCT, BREG, HL7, MIGR, NPRF, NZCI, NZCT, NZET, NZPV, NZTV, NZRT, OTHR, PPRT (NPRF = proof not sighted) |
| Place of birth | 100 | Optional | Free text UTF-8 |
| Country of birth | 4 | Optional | AS/NZS 2632.1 (ISO 3166) country code; null if unknown |
| Gender | 1 | Mandatory | F, M, O, U (see section 3) |
| Gender detail | 150 | Required if gender = O | Person's own words |
| Ethnicity | 5 | Mandatory, 1 to 6 | Level 4 code, HISO 10001 (section 4) |
| Ethnicity detail | 600 | Mandatory when "Other" selected | Person's own words |
| Mother's birth name | 255 | Optional | Free text |
| Residency status | 1 | Mandatory | Y permanent resident, N not a permanent resident, U unknown |
| Citizenship status | 1 | Optional | Y NZ citizen, N not, U unknown |
| Date of death | 8 | | `YYYY[MM[DD]]`; source codes DREG, MCCOD, HL7, MIGR, OSEA, OSEAOFF, CORONER |
| Language | 3 | Optional, multiple | ISO 639 codes from Health NZ language value set, including NZ Sign Language |
| Occupation | 6 | Optional | ANZSCO v1.3.0 |
| Digital account confidence level | | | 0, 1, 2, 2N, 3, 3N (3N required to view health information) |

Partial dates: **[NHS DELTA]** the date-of-birth control must accept year-only and year+month values and display them without inventing a day. Suggested display: `1975`, `Mar-1975`, `14-Mar-1975` (G2 format) or `03/1975`, `14/03/1975` in DD/MM/YYYY contexts. [UNCERTAIN: S1 specifies storage, not display.]

### 1.5 Health Provider Index identifiers [VERIFIED formats S4; check algorithm UNCERTAIN]

| Index | Identifier | Format (S4) | Illustrative pattern |
|---|---|---|---|
| Practitioner | Common Person Number (CPN) | `NNXXXX` (N numeric, X alphabetic) | `99ZZZZ` |
| Organisation | HPI Organisation ID | `GXXNNN-C` (G constant, X alphanumeric, N numeric, C check character) | `GZZ999-C` |
| Facility | HPI Facility ID | `FXXNNN-C` (F constant) | `FZZ999-C` |
| Practitioner role | PractitionerRole ID | `RXXNNNNNN-C` (R constant) | `RZZ999999-C` |

- The hyphen before the check character is part of the published format; display it. [VERIFIED S4]
- Check character algorithm: **not published** on S4. [UNCERTAIN] Validate format only; do not implement a check unless Health NZ supplies the algorithm (HISO 10005/10006 revisions are underway and drafts are available from standards@tewhatuora.govt.nz, S5).
- CPN regex (format only): `/^[0-9]{2}[A-Z]{4}$/` [UNCERTAIN: whether a CPN carries a check character is not stated on S4].
- Org/Facility regex: `/^[GF][A-Z0-9]{2}[0-9]{3}-[A-Z0-9]$/` [UNCERTAIN: alphabet of C not stated].
- Practitioner role (added 2023) links a CPN to a facility and/or organisation (S4).
- Standards: HISO 10005:2008 HPI Data Set; HISO 10006:2008 HPI Code Set (both under revision) (S5).
- Clinician display in NZ commonly also shows the registration body and number (for example Medical Council of NZ registration number); the CPN is the NZ-wide identifier. [UNCERTAIN: no UI rule found.]

---

## 2. Names (HISO 10046) [VERIFIED S1 unless marked]

### 2.1 Name data elements

| Element | Max length | Obligation | Notes |
|---|---|---|---|
| Title (prefix) | 10 | Optional | Controlled, extensible list including Māori and Pasifika titles |
| Given name | 50 | Mandatory when a family name is supplied | First given name only |
| Other given name(s) | 100 | Optional, only after a given name | Second and subsequent names or initials, space separated |
| Family name | 100 | Mandatory | **If only one name is known, record it here** |
| Name suffix | 5 | Optional | Honours, qualifications, generational, for example MNZM, ONZM, DSM, OBE, JNR, SNR |
| Preferred name indicator | 1 | Mandatory | 1 = preferred, 0 = not; only one preferred name at a time |
| Name protection flag | 1 | Mandatory | 1 = protected (held in confidence), 0 = not; default 0 |
| Name information source | 5 | Optional | Code, see 2.2 |
| Date name effective from / to | 8 each | Optional | `YYYYMMDD`; from date on or after date of birth |

- A person can hold multiple names (current, previous, legal, preferred). At least one name is required.
- **Single name (mononym)**: stored in family name; given name empty. **[NHS DELTA]** UK CUI puts the family name in capitals followed by given name; for a mononym the banner must show just the single name without a trailing comma or empty given-name placeholder.
- **Name protection**: when the protection flag is 1, the UI must suppress the protected name in lists and outputs that are not authorised (for example, show the preferred unprotected name or a "Name protected" indicator). [UNCERTAIN: S1 defines the flag, not the UI behaviour.]

### 2.2 Name information source codes

BRCT Birth certificate; BREG Birth register; CSC Community Services Card; NPRF Proof not sighted (information provided by the person or whānau); NZCI NZ Certificate of Identity; NZCT NZ Citizenship certificate; NZCU NZ Civil Union certificate; NZDL NZ Driver licence; NZET NZ Emergency Travel Document; NZMC NZ Marriage certificate; NZNC NZ Name Change certificate or deed poll; NZPV NZ Permanent Resident Visa; NZTV NZ Resident Visa (time-bound); NZRT NZ Refugee Travel Document; OTHR Other official document; PPRT Passport.

### 2.3 Character set, macrons and case

- Names must be stored in **UTF-8** so that macrons and other diacritics are preserved. S1 gives the example that **Kāhu and Kahu are different names**. [VERIFIED]
- Family names keep **sentence case** as supplied (S1). [VERIFIED] **[NHS DELTA / DISCREPANCY]** UK CUI (G1) displays the family name in UPPER CASE in the patient banner. Upper-casing is safe for macrons in Unicode (`ā` to `Ā`) but loses information for names such as "McDonald", "de Vries", "Te Huia", "Ngāwai" and may be culturally inappropriate. Recommendation: make family-name capitalisation a locale setting; default for `en-NZ` is **as recorded** (no transform), with the family name visually distinguished by weight or order instead. If upper case is retained for safety, use `toLocaleUpperCase('mi-NZ')` / `'en-NZ'` and never strip diacritics. [UNCERTAIN: no NZ source mandates banner case.]
- Required characters for Māori: long vowels **ā ē ī ō ū** and **Ā Ē Ī Ō Ū** (U+0101, U+0113, U+012B, U+014D, U+016B; U+0100, U+0112, U+012A, U+014C, U+016A). Use precomposed (NFC) forms; normalise input to NFC (`str.normalize('NFC')`) so that `a` + U+0304 combining macron is stored as `ā`.
- Other characters commonly needed: apostrophe and ʻokina/fakauʻa in Pacific names (Samoan ʻ U+02BB, Tongan), hyphen, space, and Latin diacritics (é, ü, ñ). Do not reject these in name inputs. [UNCERTAIN: S1 does not publish an allowed-character list in the fetched content.]
- Search: name search must match with and without macrons (so "Maori" finds "Māori") while preserving the macron in display and storage. HISO 10094 explicitly requires as-you-type lists that ignore macrons for iwi (S7); apply the same rule to names. Use `normalize('NFD').replace(/\p{M}/gu, '')` for comparison keys only.
- Font: the chosen UI font must include glyphs for all macron vowels; test rendering at every weight.

### 2.4 Name display order and preferred name

- S1 does not specify a single display order. NZ health systems commonly display "Family name, Given name(s)" in lists and banners (as the NHS CUI does) and HQSC paper charts label fields "Family Name:" then "Given Name:" (S13) or "patient name (family/given name)" (S9). Recommendation: banner `Family, Given (Preferred)`; letters and patient-facing text `Given Family`. [UNCERTAIN]
- Labels: use "Family name" and "Given name(s)" (HQSC chart wording) rather than "Surname" and "First name". **[NHS DELTA]**
- Preferred name: S1 allows exactly one preferred name record. Show it in the banner in addition to the legal/current name when they differ. [UNCERTAIN on exact presentation]

### 2.5 Name not known

- S1 (fetched content) does not define a "name not known" convention or placeholder names. [UNCERTAIN] Local practice in NZ hospitals uses temporary NHIs for unidentified patients with placeholder names (for example "Unknown" plus a sequence), defined by local policy. The library should provide an `unidentified` state for the banner that clearly shows the record is for an unidentified patient rather than rendering a placeholder as if it were a real name.

---

## 3. Sex and gender

### 3.1 HISO 10046 / NHI gender value set [VERIFIED S1]

| Code | Label (English / te reo Māori) |
|---|---|
| F | Female / Wahine |
| M | Male / Tāne |
| O | Another gender / He ira kē anō |
| U | Unspecified or unknown |

- Gender is self-identified and follows the Stats NZ standard. **Sex is not currently recorded in the NHI** (S1).
- Gender detail (free text, 150 characters) is required when code = O and must record the person's exact words (S1).
- **[NHS DELTA]** UK CUI banner shows "Gender" with Male/Female/Not known/Not specified. NZ uses the four codes above; the banner label is "Gender". HQSC paper charts also use "Gender:" (S13). The NMC user guide still lists "gender (male/female/indeterminate)" (S9) **[DISCREPANCY]**: follow S1 (2024) for electronic systems.
- Note: S1 and S8 spell the te reo Māori label "Wahine" (singular, short a) and "Tāne" (macron). Use exactly these.

### 3.2 Stats NZ 2021 data standard [VERIFIED S8]

Principle: "gender by default". Collect gender; collect sex at birth only when there is a purpose, and only together with gender (two-step method). Explain why the question is asked and the privacy rules.

Gender (classification GENDER v1.0.0, valid from 22 April 2021):
- Mandatory question requirements: include the word "gender"; cater for all genders (male, female, another gender); preferably partial write-in.
- Example question:
  ```
  What is your gender?
  [ ] Male
  [ ] Female
  [ ] Another gender (please specify): ..........
  ```
- Classification (flat): `1 Male / Tāne`, `2 Female / Wahine`, `3 Another gender / He ira kē anō`.
- Coding examples: "trans man", "cis man" coded to Male; "trans woman", "cis woman" to Female; "agender", "no gender" to Another gender; multiple gender identities may each be coded.
- Residual categories (with te reo labels): Don't know / Aua hoki; Refused to answer / Kāhore e whakahoki; Response unidentifiable / Kāhore e mohio; Response outside scope / Kei waho i te Kaupapa; Not stated / Kaore e ki. Numeric residual codes are not printed for gender in S8. [UNCERTAIN: Stats NZ convention elsewhere is 94 Don't know, 95 Refused, 97 Unidentifiable, 98 Outside scope, 99 Not stated; confirm in Ariā.]
- Output may use "man/woman/non-binary" with explanatory notes for analysis.

Sex at birth (classification SEX v2.0.0, valid from 22 April 2021):
- Question must include "sex at birth". Example:
  ```
  What was your sex at birth?
  (for example, what was recorded on your birth certificate)
  [ ] Male
  [ ] Female
  ```
- Classification: `1 Male / Tāne`, `2 Female / Wahine`. Where a third option is needed (for example perinatal admin data), the suggested classification is `1 Male`, `2 Female`, `3 Another term`. Do not conflate "indeterminate" with "intersex".

Variations of sex characteristics (VSC v1.0.0):
- Separate question; must include "variations of sex characteristics", "intersex" or "intersex variation". Example:
  ```
  Were you born with a variation of sex characteristics (otherwise known as an intersex variation)?
  [ ] Yes  [ ] No  [ ] Don't know  [ ] Prefer not to say
  ```
- Input codes: 1 Yes, 2 No, 4 Don't know, 5 Refused to answer, 7 Response unidentifiable, 8 Response outside scope, 9 Not stated.
- Do not add "intersex" as a third sex category.

Transgender status (CISTRANS v1.0.0): question must include "transgender" or "trans"; options at minimum Yes, No, Don't know, Prefer not to say. Classification 11 Cisgender man, 12 Cisgender woman, 21 Transgender man, 22 Transgender woman, 23 Transgender person of another gender, 31 Unidentifiable.

UI implications:
- Gender control: radio group F/M/O/U with conditional free-text "Please specify" when O is chosen (max 150 chars).
- Clinical decision support that needs physiological sex (reference ranges, eGFR, screening) must not infer it from gender; where needed, use a separate "Sex at birth" or clinically relevant attribute with an explanation of purpose. [Derived from S8 principles.]

---

## 4. Ethnicity and iwi

### 4.1 HISO 10001:2017 Ethnicity Data Protocols [VERIFIED S6]

Classification: Stats NZ Ethnicity New Zealand Standard Classification 2005 v2.1.0 (S5).

Standard question (must be reproduced exactly, options in this order, vertical layout preferred, no added categories):

```
Which ethnic group do you belong to?
Mark the space or spaces that apply to you.

[ ] New Zealand European
[ ] Māori
[ ] Samoan
[ ] Cook Islands Māori
[ ] Tongan
[ ] Niuean
[ ] Chinese
[ ] Indian
[ ] Other such as Dutch, Japanese, Tokelauan. Please state: ________
```
[UNCERTAIN on exact punctuation of the "Other" line: the extracted text reads "Other (please state, e.g., Dutch, Japanese, Tokelauan)". The 2013/2018 Census form wording is "Other such as DUTCH, JAPANESE, TOKELAUAN. Please state:". Check S6 Figure 1 and copy it exactly.]

- Verbal version: same list read aloud; final item "Another ethnic group"; ask about each item in turn.
- Paper/graphic version preserves the original layout (83 mm x 78 mm) where practical.

Electronic collection rules (S6):
- Multiple selection must be allowed, with a selection control for each option.
- "Other" must have a visible entry area, accept one or more groups; a lookup list may be offered but must not restrict entry.
- If nothing is entered, prompt the respondent and offer "I don't know my ethnicity" and "I do not want to state my ethnicity". Do not leave blank.
- Collectors must not guess ethnicity from appearance, name or nationality; must not limit the number of responses; must not correct a response; must not ask for a "main" or "principal" ethnicity.

Recording rules:
- Record at **level 4** (5-digit codes).
- Systems must record **up to six** ethnicities. More than six: use the Stats NZ reduction process (S6 Appendix A); never random reduction.
- **No principal ethnicity is recorded.** Prioritisation is an output method only.
- "New Zealander" and similar responses: level 4 code **61118**. An iwi response codes to Māori. Fijian Indian must be coded **43112**.

Level 1 codes: 1 European; 2 Māori; 3 Pacific Peoples; 4 Asian; 5 Middle Eastern/Latin American/African (MELAA); 6 Other Ethnicity; 9 Residual Categories.

Level 2 codes: 10 European nfd; 11 New Zealand European; 12 Other European; 21 Māori; 30 Pacific Peoples nfd; 31 Samoan; 32 Cook Islands Māori; 33 Tongan; 34 Niuean; 35 Tokelauan; 36 Fijian; 37 Other Pacific Peoples; 40 Asian nfd; 41 Southeast Asian; 42 Chinese; 43 Indian; 44 Other Asian; 51 Middle Eastern; 52 Latin American; 53 African; 61 Other Ethnicity; residuals 94, 95, 97, 99. [UNCERTAIN: whether 98 appears at level 2.]

Residual codes:

| Meaning | Level 4 | Level 2 | Level 1 |
|---|---|---|---|
| Don't know | 94444 | 94 | 9 |
| Refused to answer | 95555 | 95 | 9 |
| Repeated value | 96666 | n/a | 9 |
| Response unidentifiable | 97777 | 97 | 9 |
| Response outside scope | 98888 | (98) | 9 |
| Not stated | 99999 | 99 | 9 |

Level 4 codes for the tick-box options [UNCERTAIN: from Stats NZ classification, not re-verified in this research; confirm in Ariā before use]: New Zealand European 11111; Māori 21111; Samoan 31111; Cook Islands Māori 32100; Tongan 33111; Niuean 34111; Chinese 42100; Indian 43100.

Prioritised output order (level 2, highest first) (S6 Table 3): 21 Māori; 35 Tokelauan; 36 Fijian; 34 Niuean; 33 Tongan; 32 Cook Islands Māori; 31 Samoan; 37 Other Pacific Peoples; 30 Pacific Peoples nfd; 41 Southeast Asian; 43 Indian; 42 Chinese; 44 Other Asian; 40 Asian nfd; 52 Latin American; 53 African; 51 Middle Eastern; 61 Other Ethnicity; 12 Other European; 10 European nfd; 11 New Zealand European; then residuals 94, 95, 97, 99.

Output methods: total response, prioritised, sole/combination; always state which is used.

Display in UI:
- Show **all** recorded ethnicities (up to six), using the person's own description for "Other". Do not label any as "main". [Derived from S6]
- S6 does not specify display order. Recommendation: show in the order recorded (respondent's order), not prioritised order, because prioritised order implies a principal ethnicity. [UNCERTAIN]
- Use correct macrons: "Māori", "Cook Islands Māori".

### 4.2 Māori descent and iwi affiliation: HISO 10094:2022 [VERIFIED S7]

Also listed: HISO 10068:2017 Iwi Statistical Standard (endorsed; iwi data not yet mandatory; where collected, follow Stats NZ standard) (S5).

Māori descent question (exact; options in order Yes, Don't know, No; nothing added):
```
Are you descended from Māori (that is, did you have a Māori birth parent,
grandparent or great-grandparent, etc)?
He tūpuna Māori ōu?
[ ] Yes   [ ] Don't know   [ ] No
```

Iwi affiliation question:
```
Do you know the name(s) of your iwi (tribe or tribes)?
Kei te mōhio koe ko wai tō iwi, ō iwi rānei?
[ ] Yes  -> name(s) of iwi and rohe/region (if known)
[ ] No   -> go to next question
See the guide notes for help.
```

- Iwi classification level 2: 4-digit codes, first two digits = rohe (for example 0101 Te Aupōuri, 0104 Ngāpuhi). Level 1: 2-digit.
- Residual codes level 2: 4444 Don't know; 5555 Refused to answer; 7777 Other / response unidentifiable; 8888 Response outside scope; 9999 Not stated. Level 1: 44, 55, 77, 88, 99.
- Record at least **six** iwi; capture all given where possible. Never ask for a "main" iwi.
- Confirm or update descent and iwi data at least every three years.
- UI rules (S7): iwi field is an as-you-type list that **ignores macrons**; free text must support macrons and allow iwi not on the list; adding multiple iwi must be obvious and not require extra clicks to add fields; any reference list carries a "for guidance only" disclaimer; routing between descent and iwi questions must be obvious; paper forms at least 12 pt, high contrast.

---

## 5. Addresses

### 5.1 HISO 10046 address data set [VERIFIED S1]

| Element | Max | Obligation | Notes |
|---|---|---|---|
| Building name | 1000 | Optional | Printed at top of address |
| Street address | 100 | Mandatory | Floor/unit/street, for example `1/23 Main Street` |
| Additional street address | 100 | Optional | Used when floor/unit is in the street line; **for rural addresses holds the RD number** |
| Suburb | 50 | Optional | Record suburb here when known |
| Town or city | 50 | Optional | |
| Postcode | 5 | Optional | NZ (4 digits) or international |
| Country code | 4 | Optional | Leave blank for NZ |
| Address protected flag | 1 | Mandatory | 1 protected, 0 not (default 0) |
| Permanent address flag | 1 | Mandatory | Residential addresses only (default 0) |
| Effective from / to | 8 | Optional | `YYYYMMDD` |
| Domicile code | 4 | Optional | Health NZ domicile code, only if address cannot be verified |
| Primary address flag | 1 | Mandatory | Exactly one primary per person |
| Address type | 1 | Mandatory | M Mailing, R Residential |

Format follows the NZ CIQ Address Profile (S1).

### 5.2 NZ Post addressing rules [VERIFIED S15, S16]

Line order (top to bottom):
1. Recipient name.
2. Unit/floor and building name (only if needed; building name on its own line directly above the street line, with any unit or floor above it).
3. Street number and name, for example `21A Main Street`, `1/23 Main Street` (unit, slash, street number).
4. Suburb (or `RD n` for rural delivery). Central-city suburbs may be omitted.
5. Town/city and postcode on the same line, for example `Auckland 1010`.

Specific rules:
- Letter suffix attaches to the number without a space: `21A`, not `21 A`.
- No corner addresses, no number ranges (`4-12 Main Street` not allowed).
- Rural delivery: `RD` plus number **where the suburb would normally appear**, no spaces or punctuation inside RD (`RD 1`, not `R.D.1` or `R D 1`); the mail town is where the RD round is based, not where the property is.
  ```
  J Smith
  123 Rural Road
  RD 2
  Rangiora 7472
  ```
  [UNCERTAIN: example composed from rules; postcode illustrative.]
- PO Box: `PO Box 23226` (no spaces in "PO", no full stops, no spaces in the number), then box lobby (omit if same as town), then town and postcode. Never combine with a street address.
- Private Bag: `Private Bag 12345`, then town and postcode; no box lobby needed.
- Acceptable abbreviations when necessary: Apt, Flat, Unit, Ste, Fl, L, Rm; otherwise spell words out.
- Postcodes: 4 digits (examples such as `0772`, so leading zero must be preserved: store as string). Regex `/^[0-9]{4}$/` for NZ.
- Field model for integrations (S15): Address Line 1 street number and name (mandatory); Address Line 2 delivery suburb (mandatory); Address Line 3 delivery town (mandatory); Building Name (unit/level/floor).

**[NHS DELTA]** UK addresses end with a separate postcode line (alphanumeric); NZ puts the 4-digit postcode after the town on the same line, and there is no county.

### 5.3 Address standards and lookup

- AS/NZS 4819 Rural and urban addressing (current edition AS/NZS 4819:2011) governs how councils assign road names and numbers; it is not a display standard for UI. [UNCERTAIN: not fetched in this research.]
- Authoritative address data: LINZ NZ Addresses dataset (LINZ Data Service) and NZ Post's Address Checker / Address Services tool and Parcel Address API (S15). The NHI uses address validation and assigns a domicile code when an address cannot be verified (S1).
- UI: provide an address-lookup combobox (type-ahead) with a manual-entry fallback that maps to the HISO 10046 fields; show the "Address protected" state.

---

## 6. Telephone numbers

Primary register: NAD Aotearoa Number Register (nad.org.nz). Facts below are from S24 (secondary, citing the register). [UNCERTAIN: not verified against nad.org.nz directly.]

| Type | National format | Digits after trunk 0 | Display grouping (recommended) | Example (fictional) |
|---|---|---|---|---|
| Landline | `0` + area code `3`, `4`, `6`, `7` or `9` + 7-digit local number (local number starts 2-9) | 8 | `0X XXX XXXX` | `03 312 3456` |
| Mobile | `02` + 7 to 9 digits; prefixes 020 (sub-blocks 0201-0209), 021, 022, 027, 028, 029 | 8 to 10 | `02X XXX XXXX` or `02X XXX XXX` (or `02X XXXX XXXX` for 8-digit subscriber) | `021 123 4567` |
| Freephone | `0800` or `0508` + usually 6 (sometimes 7) digits | 9 to 10 | `0800 XXX XXX` | `0800 611 116` (Healthline) [UNCERTAIN] |
| Premium | `0900` + 5 (some 6) | | `0900 XX XXX` | |
| Emergency | `111` (112 works on GSM mobiles, not advertised); police non-emergency `105` | | | |

Area codes: 03 South Island and Chatham Islands; 04 Wellington and Kāpiti Coast; 06 lower North Island (excluding Wellington), Taranaki, Hawke's Bay, Manawatū; 07 Waikato, Bay of Plenty; 09 Auckland and Northland.

International format: `+64` then drop the trunk `0`: `+64 3 312 3456`, `+64 21 123 4567`. E.164: `+6433123456`.

Storage: HISO 10046 contact details store the full number including prefixes with **no punctuation**, for example `+6441234567` (S1) [VERIFIED]. Contact usage codes B Business, E Emergency, P Personal; contact type codes A monitored alarms, C mobile, E email, F facsimile, M electronic mailbox, P pager, S SMS, T telephone, U URL, V videoconferencing, W web forum; plus protected flag, preferred flag, effective from (mandatory) and to (S1).

Validation (format only):
```
NZ_LANDLINE = /^0[34679][2-9][0-9]{6}$/
NZ_MOBILE   = /^02[0-9][0-9]{6,8}$/   // 020/021/022/027/028/029; length 9 to 11 incl. 0
NZ_FREE     = /^0(800|508)[0-9]{6,7}$/
```
[UNCERTAIN: mobile lengths vary by block; prefer libphonenumber metadata for NZ over hand-written rules.]

**[NHS DELTA]** UK numbers use 01/02/07 patterns and 11 digits; the telephone control needs a region-aware formatter defaulting to NZ.

---

## 7. Dates, times and time zones

### 7.1 Date and time format in clinical documents [VERIFIED S9, S13, S14]

- HQSC National Medication Chart: date prescribed in **day/month/year** format; date of birth written "DAY/MONTH/YEAR"; worked examples show `01/05/20` (S9).
- Time: **24-hour clock** throughout, written as hours and minutes, for example `0400h` (4 am) and `1700h` (5 pm), `0600h`, `1800h` (S9). The vital signs chart header reads "Time (24 hour)" (S13).
- The NZEWS chart columns are headed "Date" and "Time (24 hour)" (S13).
- No HQSC publication found mandating a three-letter month format (`14-Mar-2026`). [UNCERTAIN] **[NHS DELTA / DISCREPANCY]** The UK CUI date format used in G2 (`dd-Mmm-yyyy`, for example `14-Mar-2026`) is unambiguous and acceptable in NZ, but paper NZ charts use `DD/MM/YYYY` (and `DD/MM/YY` in examples). Recommendation for `en-NZ`: keep the CUI `dd-Mmm-yyyy` display for safety (it cannot be misread as US month-first) and accept `DD/MM/YYYY` and `D/M/YYYY` input; never accept or display `MM/DD/YYYY`. Display times as `HH:mm` (CUI) or `HHmm` (NMC handwriting style); choose one consistently. [UNCERTAIN]
- Never use 12-hour am/pm in clinical displays.

### 7.2 Time zones and daylight saving

| Zone | IANA | Standard | Daylight |
|---|---|---|---|
| New Zealand (main islands) | `Pacific/Auckland` | NZST = UTC+12:00 | NZDT = UTC+13:00 |
| Chatham Islands | `Pacific/Chatham` | CHAST = UTC+12:45 | CHADT = UTC+13:45 |

DST rule (New Zealand Daylight Time Order 2007): starts **last Sunday in September at 02:00 NZST** (clocks go forward to 03:00 NZDT); ends **first Sunday in April at 03:00 NZDT** (clocks go back to 02:00 NZST) (S23 confirms 2 am start on the last Sunday of September and the first Sunday of April end; end time from secondary source). Chatham Islands change at 02:45 local standard time and are always 45 minutes ahead of mainland NZ (S23). Upcoming transitions: 2026 starts 27 September; 2027 ends 4 April, starts 26 September. [VERIFIED rule; end time 03:00 UNCERTAIN from primary, consistent with secondary.]

UI implications:
- Store instants in UTC with offset; display in `Pacific/Auckland` by default, `Pacific/Chatham` for Chatham Islands facilities (for example Chatham Islands Health Centre).
- Medication administration and observation charts must handle the **spring-forward gap** (02:00-02:59 does not exist on the last Sunday in September) and the **autumn repeat** (02:00-02:59 occurs twice on the first Sunday in April). Show the offset or the label NZST/NZDT on any time in the repeated hour, for example `02:30 NZDT` and `02:30 NZST`. Interval-based dosing (q4h, q6h) must compute on elapsed time, not wall-clock time. [Derived; UNCERTAIN as no NZ source states display rules]
- Timeline/graph axes (G9) crossing a DST transition must space points on real elapsed time.

---

## 8. Medicines

### 8.1 HQSC National Medication Chart (NMC) conventions [VERIFIED S9]

The NMC is a legal document. Conventions that the electronic medication line, list and administration controls must reflect:

Patient identification on every page: patient name (family/given), gender, date of birth (DAY/MONTH/YEAR), NHI number; either the patient label on every label space or all four details handwritten.

Medicine name:
- Use **approved (generic) names**; brand names only for a locally agreed list where brand matters for safety or identification (S9 examples: warfarin; oxycodone or morphine where brand is required; Sinemet and Madopar to avoid listing multiple ingredients).
- Handwritten charts use BLOCK CAPITALS one letter per box (26 spaces). **This is a handwriting rule; do not render electronic medicine names in all capitals** because that defeats Tall Man lettering (8.3). [Derived; UNCERTAIN]
- Always state special release characteristics: CD controlled delivery, CR controlled release, ER extended release, HBS hydrodynamically balanced system with controlled release, LA long acting, SR sustained/slow release (S9 Figure 1 and text; MUPS also cited) [CD/CR/ER/HBS verified; full Figure 1 list partly lost in extraction].

Dose expression (S9 section 3, Figure 26):
- Use only Hindu-Arabic numerals; never Roman numerals.
- Express the dose in grams, milligrams or micrograms in **whole numbers**: `500 mg` not `0.5 g`; `125 microgram` not `0.125 mg`.
- **Never use a trailing zero** (`1 mg`, not `1.0 mg`).
- Avoid leading zeros by changing to a smaller unit; if unavoidable, **always use a leading zero** (`0.5 mL`, never `.5 mL`).
- Units in full where any doubt: `microgram`, `nanogram`, `unit`, `international unit` written in full; `mmol` (not mEq).
- Weight-based doses show the mg/kg/dose calculation (S9 section 3 item 6).
- Variable doses (for example `tramadol 50-100 mg q4-6h`): record the actual dose given.
- If doses differ by route, separate prescriptions per route.
- Stopping/changing: stop date, time and initials; any change requires stopping and re-prescribing on a new line (no editing of an existing order).
- Prescriber signature: given name or initial plus full surname; sample signature register with name, registration number and contact number.
- Oxygen is a prescribed medicine on the NMC, with target saturation range and delivery device (for example "venturi mask 24, 28%").
- PRN orders: separate section; include indication and maximum dose in 24 hours.

Commonly used abbreviations permitted (S9 Appendix A):

| Group | Abbreviation | Meaning |
|---|---|---|
| Administration | ac | before food |
| | cc | with food |
| | pc | after food |
| Frequency | BD | twice daily |
| | mane | morning |
| | midi | midday |
| | nocte | night |
| | prn | when required (as needed) |
| | q4h or Q4H | every four hours |
| | q6h or Q6H | every six hours |
| | q8h or Q8H | every eight hours |
| | q12h or Q12H | every twelve hours |
| | QID | four times a day |
| | STAT | immediately |
| | TDS | three times a day |
| Route | buc | buccal |
| | IM | intramuscular |
| | inh | inhalation |
| | IV | intravenous |
| | neb | nebuliser |
| | ng | nasogastric |
| | nj | nasojejunal |
| | po | oral |
| | pr | per rectum |
| | pv | per vagina |
| | subcut | subcutaneous |
| | subling | sublingual |
| | top | topical |
| | PEG | percutaneous endoscopic gastrostomy |

**[NHS DELTA]** The UK CUI medication line uses full words ("Oral", "Twice a day") and the dm+d. NZ accepts these abbreviations but full words remain safest; recommendation: display full text by default with the NZ abbreviation available as a compact form. Note NZ uses "TDS" (UK CUI recommends "three times a day") and "subcut", "subling".

Recommended administration times: S9 Figure 19 (image; values not extractable). [UNCERTAIN] Organisations may vary them.

### 8.2 Non-administration codes [VERIFIED S9 Figure 22]

Recorded with time and initials of the person documenting the code.

| Code | Label | Rule |
|---|---|---|
| CP | Carer/parent administered | Witnessed per local policy; dose, time and nurse/midwife initials recorded with the code |
| D | Prescriber's instructions | Dose withheld by prescriber decision (includes peri-operative omissions); reason documented in health record |
| N | Not administered: document reason in notes | Prescriber must be informed; reason and action recorded; if unavailable, obtain supply and give as soon as possible |
| R | Patient refused | Offer again within one hour; follow local policy if refused again |
| RV | Review | Used with W to prompt prescriber review on a given date |
| SM | Self-medicating | Witnessed per local policy; dose, time and initials recorded |
| U | Patient unavailable | Plan with prescriber for procedures/leave |
| W | Withheld | Clear explanation documented; may be used with RV |

"Do not use alternative abbreviations." **[NHS DELTA]** Replace the UK CUI administration outcome reasons in G6 with this code set for `en-NZ`, showing code and label together (for example `W  Withheld`).

### 8.3 DO NOT USE abbreviations [VERIFIED S9 Appendix B; S12 is the HQSC alert poster]

| Do not use | Intended | Misread as | Use instead |
|---|---|---|---|
| Abbreviated chemical names (MgSO4, HCl, KCl) | magnesium sulphate, hydrochloric acid, potassium chloride | morphine sulphate; potassium chloride; hydrochloric acid | Full chemical name; drop-down lists must contain the full name |
| Abbreviated medicine names (MTX, HCT, AZT) | | methotrexate/mitozantrone; hydrocortisone/hydrochlorothiazide; azathioprine/zidovudine/azithromycin | Full medicine name; prescribe generically |
| µg, mcg | microgram | mg | `microgram` |
| U, IU | unit, international unit | 0, 4, cc; IV, 10 | `unit`, `international unit` |
| ng | nanogram | milligram | `nanogram` |
| OD, od, O.D. | once daily | QID, BD | `daily` or the time (morning, night) |
| QD, q.d., qd, Q.D | every day (US) | QID, BD | `daily` or the time |
| SC | subcutaneous | SL | `subcut` or `subcutaneous` |
| SL, S/L | sublingual | SC | `subling` or `sublingual` |
| mEq, milliequivalent | | millimole | `mmol` / millimole |
| Missing leading zero (.5 mg) | 0.5 mg | 5 mg | `500 microgram` (or `0.5 mg`) |
| Trailing zero (1.0 mg, 100.0 g) | 1 mg, 100 g | 10 mg, 1000 g | `1 mg`, `100 g` |
| Roman numerals (ii, iv, x) | 1, 2, 3 | | Words or Hindu-Arabic numbers |

Library rule: dose/unit formatters must never emit any item in this table; unit pickers must use `microgram`, `nanogram`, `unit`, `international unit`, `mmol` spelt out; numeric formatter must strip trailing zeros and enforce a leading zero.

### 8.4 Tall Man lettering [VERIFIED S10, S11]

- HQSC Aotearoa New Zealand Tall Man lettering list, updated **October 2023**; combined with the 2013 and 2020 lists it contains **224 names** (S10).
- Methodology (S11): NZ uses mainly "CD3"/mid Tall Man rules; names marked `*` are deliberately **not** capitalised under the exception rules (December 2013).
- The capitalisation is name-specific and must be applied exactly as listed (it is not algorithmic). **[NHS DELTA]** The UK CUI does not define a national Tall Man list; the library must load the NZ list for `en-NZ`. Display Tall Man names in pick lists, medication lines and administration records; do not display the whole name in upper case.
- Some entries are brand names (for example `proZAC`, `lanTUs`, `humALOG`); some are multi-word (`hyoscine BUTYLbromide`).
- Source of truth: the XLSX in S10. The full list (exact case as published, `*` = not capitalised by exception):

```
aFATinib aLEMTUzumab ALKeran aLLOPURINol amINOPHYLLIne amIODAROne amiSULPRIDe
amITRIPTYLIne amLODIPIne aPomine arATAC arOPAX aTENOLol aTEZOLIzumab aTRopt
avaSTIN avaXIM aVomine aXITinib azATHIOPRINE azITHROMYCIN aZopt
"BENZATHINE benzylpenicillin" benzylpenicillin* beVACizumab bisACODYl bisOPROLOl
buDESONide buMETANide buPROPION buSPIRONE caLTRate caPTOPRIl caRAFate
CARBAMazepine carbIMAZOLe cARBOplatin caRVEDILOl cefaCLOR cefaLEXin cefaZOLin
cefEPIME cefOTAXIME cefOXITIN ceftAROLine cefTAZIDIME cefTRIAXONE cefUROXIME
celAPRAM celEBREX cephaLEXin cephaZOLin CETUximab cHLORPROMAZIne ciclosPORIN
ciprAMIL cIPROFLOXAcin ciprOXIN cISplatin cLARITHROMYcin clINDAmycin clobazam*
cLOMIFEne cLOMIPHEne cLOMIPRAMIne CLONazepam cloNIDine cLOZAPine cOBIMEtinib
coUMADIN coVERSYL cyclIZINE cyclOBLASTIN CYCLOPHOSPHamide cyclosERINE cyclosPORIN
daBRAFEnib daCTINomycin daPTomycin daSATinib DAUNOrubicin DEPO-medrol depo-PROVERA
DIazepam dIGOXin diPYRIDAMOLe diSOPYRAMIDe doBUTamine DOCEtaxel doPamine doTHIEpin
dOXAZOSin doXEpin DOXOrubicin DULoxetine ERYthromycin fluoxetine* fluARIx
flupENTIXOL flupENTHIXOL flupHENAZINE fluVAx fluVOXAMine "folic acid*" "foliNIc acid"
gliBENCLAMide gliCLAZide gliPIZide humALOG humULIN "hyoscine BUTYLbromide"
"hyoscine HYDRObromide" IDArubicin IFOSFamide imipramine* imUPRine INDEral
INFLIximab "isopto CARpine" "isopto HOMATROpine" ISOtretinoin januMET januVIA
ketALAR ketOROLAC laMICTAl laMISIl lamIVUDine lamOTRIGine lanTUs lanVIs laPAtinib
laRGACTIl LEUKeran LORazepam loxaLATe loxaMINe maxiDEX maxiTROL meDROXYPROGESTERone
m-eNALAPRIL "mercaptAMine (cysteamine)" mercaptOPURine m-eSLON methADONe metHOTREXATe
methYLPHENIDATe "methylprednisolone ACETate" "methylprednisolone SODIUM SUCCINate"
metOCLOPRAMIDe metoPROLOL MOXIfloxacin MYLeran nalOXone nalTREXone neO-MERCAZOLe
NEOral neUROKARe niFEDIPine niMODIPine NITRazepam NORfloxacin norMISON norVASC
novoMIX novoRAPID novoSEVEN oBINUTUZumab oMALizumab OXazepam OXCARBazepine oxyCONTIN
oxyNORM PACLItaxel PARoxetine pAZOPanib pegFILGRASTIM pegINTERFERON penicillAMINE
pERTUZumab prEDNISone primaCIN primaCOR primAQUIne primaXIN primIDOne
proCHLORPERazine procYCLIDine proGRAF proMETHazine propOFol propRANOLol proZAC
QUETIAPine quINine rifaMPICin rifaXIMin riSPERIDONe RITUximab rOPINIROLe SERTRALine
SIrolimus siTagliptin solu-CORTEF SOLU-medrol soRAFENib sulfaDIazine sulfaSALazine
sUMATRIPTAn sUNITinib TACrolimus TAMoxifen tEMOdal toFRANIL toPAMAX tRAMadol
tretinoin* trimEPRAZINE trimETHOPRIM valAciclovir valGANciclovir vinBLASTine
vinCRISTine vinORELBine yasMIN yaZ
```

[NOTE: the list above was transcribed from the October 2023 XLSX; the XLSX remains authoritative. Watch for later HQSC updates (page last modified 19 October 2026).]

### 8.5 NZ Medicines Terminology (NZMT) and NZULM [VERIFIED S17, S18]

- NZULM (New Zealand Universal List of Medicines) is the national list; NZMT is the code system identifying each medicine in the NZULM; Health NZ's NZHTS sources NZMT monthly (S17).
- Canonical code system URI: `http://nzmt.org.nz` (S17). Identifiers are SNOMED CT-format SCTIDs (up to 18 digits; S18 says "19-digit", **[DISCREPANCY]** SCTIDs are at most 18 digits; example `10006151000116107` is 17 digits). The example lookup code `10006151000116107` = amifampridine 10 mg tablet (S17), which carries namespace `1000116`. [Namespace inference UNCERTAIN]
- Concept classes (seven):

| Class | Name | Meaning (S18) | Typical display |
|---|---|---|---|
| MP | Medicinal Product | Generic medicine (active ingredient[s]) | `paracetamol` |
| MPUU | Medicinal Product Unit of Use | Generic dose form + strength | `paracetamol 500 mg tablet` |
| MPP | Medicinal Product Pack | Generic pack and contents | `paracetamol 500 mg tablet, 100 tablets` [UNCERTAIN wording] |
| TP | Trade Product | Brand | `Panadol` [illustrative] |
| TPUU | Trade Product Unit of Use | Brand dose form + strength | `Panadol 500 mg tablet` [illustrative] |
| TPP | Trade Product Pack | Brand pack and contents, no container | |
| CTPP | Containered Trade Product Pack | Brand pack including container details | `... , 100 tablets, blister pack` [illustrative] |

- Concept maps published: TP to MP, TPUU to MP, CTPP to MPUU (S17).
- Published naming examples (S18):
  - Compound: `paracetamol 500 mg + metoclopramide 5 mg tablet, 60 tablets`
  - Combination pack: `levonorgestrel 50 microgram + ethinyloestradiol 30 microgram tablet [18 tablets] (&) levonorgestrel 75 microgram + ethinyloestradiol 40 microgram tablet [15 tablets] (&) ...`
- Observed naming conventions (from examples): lower-case generic names; `+` between ingredients; strength with a space before the unit; `microgram` spelt out; dose form after strength; pack quantity after a comma; components of multi-component packs in square brackets joined by `(&)`. NZ uses British/NZ spellings such as `ethinyloestradiol`, `sulphate` historically, though International Non-proprietary Names are being adopted. [UNCERTAIN: the NZMT Editorial Rules document was not located; these are inferred.]
- Other identifiers: Pharmacode (Pharmacy Guild of NZ, integer up to 9 digits); GTIN (S18).
- **[NHS DELTA]** Replace dm+d VTM/VMP/AMP/VMPP/AMPP with NZMT MP/MPUU/MPP/TP/TPUU/TPP/CTPP. Approximate mapping: VTM to MP; VMP to MPUU; AMP to TPUU; VMPP to MPP; AMPP to TPP/CTPP. [UNCERTAIN: approximate, not an official mapping]
- How a NZ medication line should read (recommended for the G5 medication line): `[Generic name with Tall Man] [strength] [dose form] [release type]` / `[dose in whole units] [route] [frequency]` / `[indication]`, for example `amLODIPIne 5 mg tablet` / `5 mg oral (po) daily (mane)`. [UNCERTAIN: no HQSC on-screen display guideline found; see 8.7.]
- Funding: PHARMAC (Te Pātaka Whaioranga) Pharmaceutical Schedule determines funded brands, which change; HQSC recommends generic prescribing partly because the funded brand often changes (S9 Appendix B). Medsafe data sheets and the New Zealand Formulary (nzf.org.nz) are the reference for adverse effects (S9).

### 8.6 NZ ePrescription Service (NZePS) [VERIFIED S21 unless marked]

- Each prescription has an 18-character prescription identifier (SCID) with a barcode; the 18th character is a check character calculated from the first 17 using a **non-public** algorithm; the SCID includes part of the sending facility's HPI facility code (S21).
- Dispensers should always scan the barcode; manual entry is a fallback.
- Error code `BUS002` = SCID not found in the NZePS broker; dispense manually.
- Display: show the SCID as a barcode and human-readable text exactly as issued. [UNCERTAIN: grouping]
- Signature-exempt prescribing ("prescribing without a signature") is permitted via NZePS under a Director-General waiver; see Health NZ "Appendix 1 Prescribing without a signature". [UNCERTAIN: not fetched]

### 8.7 On-screen medicines display guidance

- No HQSC-published equivalent of the Australian Commission's "National guidelines for on-screen display of clinical medicines information" was found. [UNCERTAIN] HQSC's medication safety programme covers electronic medicines management, but the fetched sources contain no screen-display rules. Recommendation: combine the NHS CUI medication line rules (G5) with the NZ rules above (Tall Man, DO NOT USE list, dose expression, generic naming); the Australian guideline (https://www.safetyandquality.gov.au/publications-and-resources/resource-library/national-guidelines-screen-display-medicines-information) is a reasonable trans-Tasman reference but is not NZ policy.

---

## 9. Allergies and adverse reactions

### 9.1 Standard status

- **HISO 10066:2025 Allergy and Adverse Reaction Data Standard** is "in development" (S20). Scope: allergies, intolerances and adverse reactions to medicines, edible, chemical and biological substances; based on the NZ Patient Summary (NZPS) where the section is mandatory; aligned to SNOMED CT, FHIR and the International Patient Summary (IPS); delivered as a FHIR "micro standard". No value sets were published on S20. [VERIFIED status; content UNCERTAIN]
- The topic prompt's "HISO 10087" is not the allergy standard. [UNCERTAIN what 10087 is]
- Until HISO 10066 is published, follow FHIR R4 AllergyIntolerance value sets as profiled in the NZ IPS IG (NZIPS AllergyIntolerance profile): clinicalStatus active/inactive/resolved; verificationStatus unconfirmed/confirmed/refuted/entered-in-error; type allergy/intolerance; category food/medication/environment/biologic; criticality low/high/unable-to-assess; reaction.severity mild/moderate/severe. [UNCERTAIN: NZ constraints not verified]
- SNOMED CT NZ Edition reference sets relevant to allergy (S19): Adverse reaction manifestation; COVID-19 adverse event from immunisation; common allergen reference sets (biological, chemical, edible substances). Medicine substances should be coded from NZMT (MP) where the agent is a medicine. [Second clause UNCERTAIN]

### 9.2 HQSC NMC allergy conventions [VERIFIED S9]

- Section heading: **"Allergies & Adverse Reactions"**. No distinction between allergy and adverse reaction is required on the NMC.
- No known allergies: mark **"No"** (patient or caregiver not aware of any allergies or previous adverse reactions), then sign and date. "Always sign and date the box, even if 'No' has been marked."
- Unknown status (no records, patient unable to say, for example unconscious): write **"Unknown"** in the Reaction box, sign and date, document why in the health record, update as soon as information is available.
- Allergy with reaction: record the agent and reaction description, for example `peanuts: throat swelling two years ago`, `penicillin - diarrhoea after three days`.
- Anything that caused rash, urticaria, facial or throat swelling, or anaphylaxis is documented as an allergy. Reactions to plasters or latex may be included.
- "New this admission" tick box for a reaction caused during the current admission.
- Supplementary alerts per local policy (sticker on health record cover, allergy bracelet, entry in the electronic patient management system).
- It is appropriate to withhold a medicine with a known allergy or adverse reaction until the prescriber is contacted.

UI implications **[NHS DELTA]**:
- The allergy summary component must support three explicit states: **allergies/adverse reactions recorded**; **No known allergies/adverse reactions** (displayed text recommendation: "No known allergies or adverse reactions"); **Unknown** (not yet assessed). Each must show who recorded it and when (HQSC requires signature and date even for "No"). An empty list must never be rendered as "No known allergies". [Label text UNCERTAIN; states VERIFIED]
- Allow a "New this admission" flag.

### 9.3 Adverse reaction reporting and medical alerts

- National reporting of suspected adverse reactions to medicines and vaccines is to the **Centre for Adverse Reactions Monitoring (CARM)**, operated for Medsafe at the New Zealand Pharmacovigilance Centre, University of Otago (https://nzphvc.otago.ac.nz/reporting/). Medsafe can add a "Medical Warning" to a person's record when a serious reaction is reported, which is visible through the NHI-linked Medical Warning System. [UNCERTAIN: not fetched in this research; confirm]
- MedicAlert: MedicAlert Foundation New Zealand provides engraved bracelets/IDs; the UI may record "MedicAlert member" as a free-text alert. [UNCERTAIN]

---

## 10. Terminology

- **SNOMED CT NZ Edition** (S19): released twice a year, **April and October**; current at time of research **April 2026** (February 2026 International Edition + April 2026 NZ Extension). NZ reference set SCTIDs use the NZ extension namespace (SCTIDs ending `...1000210...`, for example `629321000210100`), consistent with NZ namespace **1000210**. [Namespace UNCERTAIN: inferred from SCTID structure]
- NZ language reference sets (S19):
  - NZ English language reference set: preferred terms, synonyms and correct NZ spellings for all concepts. **Use this refset to select display terms for `en-NZ`** (not the UK or US language refset). **[NHS DELTA]**
  - NZ English patient and consumer friendly terms (for patient portals and personal health apps).
  - **Te reo Māori patient and consumer friendly terms** for common conditions and interventions (first version October 2020, trial use).
  - CanShare context language reference set (cancer).
- Access: member licensing and distribution service; NZ Health Terminology Service FHIR API (NZHTS) (S17, S19). NZ is a SNOMED International member; use within NZ is licensed nationally. [UNCERTAIN detail]
- NZMT: section 8.5. NZULM: national list of medicines incorporating NZMT, PHARMAC funding and Medsafe approval data. [Contents UNCERTAIN]
- HISO guidance on SNOMED display: no separate HISO display standard was found. [UNCERTAIN] The SNOMED rule in G8 (display preferred term, never the FSN with semantic tag, to clinicians) applies; choose the preferred term from the NZ English language refset.

---

## 11. Te reo Māori, Te Tiriti and Māori data sovereignty

### 11.1 Macrons and text handling (all controls)

- Every text input, label, list and search control must accept, store, display and sort macron vowels (ā ē ī ō ū and capitals); see 2.3. Search must match macron and non-macron forms (S7 requires this for iwi look-ups).
- Sorting: use `Intl.Collator('en-NZ')` (or `'mi'`) so that ā sorts with a; do not sort by code point.
- Do not strip macrons in exports, print, labels, wristbands or HL7/FHIR messages; HISO 10046 requires UTF-8 (S1).
- The correct spelling is "Māori" (with macron); "Aotearoa New Zealand" is used in HQSC and HISO titles.

### 11.2 Bilingual labels

Verified te reo Māori labels from primary sources:

| English | Te reo Māori | Source |
|---|---|---|
| Male | Tāne | S1, S8 |
| Female | Wahine | S1, S8 |
| Another gender | He ira kē anō | S1, S8 |
| Don't know | Aua hoki | S8 |
| Refused to answer | Kāhore e whakahoki | S8 |
| Response unidentifiable | Kāhore e mohio | S8 |
| Response outside scope | Kei waho i te Kaupapa | S8 |
| Not stated | Kaore e ki | S8 |
| Are you descended from Māori ...? | He tūpuna Māori ōu? | S7 |
| Do you know the name(s) of your iwi? | Kei te mōhio koe ko wai tō iwi, ō iwi rānei? | S7 |
| Health New Zealand | Te Whatu Ora | S5 |
| Health Quality & Safety Commission | Te Tāhū Hauora | S10 |

Common health words (for optional bilingual headings) [UNCERTAIN: not verified against Te Aka Māori Dictionary or Te Taura Whiri; must be reviewed by a qualified te reo Māori translator before use]: hauora (health), whānau (family, extended family), rongoā (medicine, treatment, traditional Māori healing; note ambiguity), tākuta (doctor), tapuhi (nurse), hōhipera (hospital), ingoa (name), wāhitau (address), waea (phone), rā whānau (birthday/date of birth), mamae (pain), kia ora (hello), nau mai, haere mai (welcome), āwhina (help), kaumātua (elder), pēpi (baby), rangatahi (young people). Healthify's glossary (https://healthify.nz/te-reo-maori-glossary) confirms hauora, whānau, rongoā, kaumātua, pēpi, rangatahi.

Policy context: in 2024 the Government directed public service agencies to use English names first (Health NZ switched to "Health New Zealand | Te Whatu Ora", February 2024) and to communicate primarily in English. [UNCERTAIN detail; see https://www.1news.co.nz/2024/02/16/health-nz-switches-to-english-name-first/] Recommendation: the library supports optional bilingual labels via i18n (English primary, te reo secondary, or te reo-first by configuration) rather than hard-coding either, and the te reo strings for standard value sets (gender, residual categories, Māori descent and iwi questions) are taken verbatim from S1, S7 and S8.

### 11.3 Te Tiriti o Waitangi and data collection

- Ethnicity (S6), Māori descent and iwi (S7) are **self-identified**; collectors must not guess, complete, correct or require proof; never ask for a principal ethnicity or main iwi. UI must not pre-fill these from other data (for example inferring Māori ethnicity from a te reo name).
- Ethnicity, descent and iwi forms must explain why the data is collected and how it will be used and protected (S7, S8 principle of explaining purpose).
- S7 states Māori rights and interests in the collection, ownership and application of data; outputs for Tino Rangatiratanga and Active Protection purposes; co-governance of uses; statistical outputs only, no individual records shared; sharing through the IDI requires co-governance approval.
- Māori data sovereignty (Te Mana Raraunga principles, not fetched) [UNCERTAIN]: treat iwi and whakapapa data as taonga; minimise display of iwi affiliation in contexts that do not need it; role-based access to iwi data; audit access.
- Whānau: NZ clinical UIs should support whānau as contacts and support people (S1 allows "information provided by the person or whānau" as a source, NPRF). Provide "Whānau / family" relationship options in contact and next-of-kin controls. **[NHS DELTA]** UK "Next of kin" remains valid but add whānau.

---

## 12. Deterioration: NZEWS vital signs chart and patient identification

### 12.1 Scope [VERIFIED S14]

National adult vital signs chart with the New Zealand Early Warning Score (NZEWS), for acutely hospitalised, **non-pregnant adults**. Not for maternity or paediatrics (separate national/regional tools exist). Seven core parameters: respiratory rate, oxygen supplementation, oxygen saturation, heart rate, blood pressure (systolic scored), temperature, level of consciousness (AVPU).

### 12.2 Parameter bands and scores [VERIFIED S13 chart text; colour per score per S14]

Zone colours by score: **0 = white (no colour)**, **1 = yellow**, **2 = orange**, **3 = red**, **RRT = blue** (no score; any blue value triggers a rapid response call). [Score-to-colour mapping: S14 says each parameter has yellow, orange and red zones associated with scores and blue is unscored; the 1/2/3 to yellow/orange/red mapping is the standard reading of the chart. UNCERTAIN only in that the mapping is shown graphically, not in text.]

| Parameter | Blue (RRT) | 3 (red) | 2 (orange) | 1 (yellow) | 0 | 1 (yellow) | 2 (orange) | 3 (red) | Blue (RRT) |
|---|---|---|---|---|---|---|---|---|---|
| Respiratory rate (breaths/min) | ≤ 4 | 5-8 | | 9-11 | 12-20 | | 21-24 | 25-35 | ≥ 36 |
| SpO2 (%) | | ≤ 91 | 92-93 | 94-95 | ≥ 96 | | | | |
| Oxygen | | | | | Room air | | Supplement (L/min) = 2 | | |
| Heart rate (bpm) | 30s (< 40) | | 40s (40-49) | | 50s-80s (50-89) | 90s-100s (90-109) | 110s-120s (110-129) | 130s (130-139) | ≥ 140 ("Write if ≥ 140") |
| Systolic BP (mmHg) | 50s-60s (< 70) | 70s-80s (70-89) | 90s (90-99) | 100s (100-109) | 110s-210s (110-219) | | | ≥ 220 ("Write if ≥ 220") | |
| Temperature (°C) | | | ≤ 34s (< 35.0) | 35s (35.0-35.9) | 36s-37s (36.0-37.9) | 38s (38.0-38.9) | ≥ 39s (≥ 39.0) | | |
| Level of consciousness | Unresponsive | Voice, Pain | | | Alert | | | | |

Notes:
- Heart rate rows are decades (40s, 50s ...); boundary values belong to the decade row (S14: "a heart rate of 40, 50, 90, 110, 120 or 130"). [DISCREPANCY] S14 lists 120 as a zone boundary, but the S13 chart groups 110s and 120s under score 2. Follow S13 (the chart): 110-129 = 2.
- Heart rate 40s scores **2** and below 40 is **blue** (S13 layout: "40s 2", "30s RRT").
- BP boundaries per S14: 70, 90, 100, 110, 220. Score systolic only; record systolic and diastolic.
- Temperature rows are whole-degree decades ("35s" = 35.0-35.9). Temperature has no red or blue zone.
- Respiratory rate: write the actual value in the box; each row is a severity range.
- SpO2: write the numeric value.
- Oxygen: tick room air or supplement, record L/min; supplemental oxygen scores 2.
- Level of consciousness: AVPU; you must wake the patient; "Voice" and "Pain" score 3; "Unresponsive" is blue.
- EWS total = sum of 7 parameter scores (0-3 each; theoretical maximum 21).

Reference scoring function (TypeScript) [derived from S13; UNCERTAIN only where noted above]:

```ts
type Zone = 0 | 1 | 2 | 3 | 'blue';
export const rr = (v: number): Zone => v <= 4 ? 'blue' : v <= 8 ? 3 : v <= 11 ? 1 : v <= 20 ? 0 : v <= 24 ? 2 : v <= 35 ? 3 : 'blue';
export const spo2 = (v: number): Zone => v >= 96 ? 0 : v >= 94 ? 1 : v >= 92 ? 2 : 3;
export const o2 = (supplemental: boolean): Zone => supplemental ? 2 : 0;
export const hr = (v: number): Zone => v < 40 ? 'blue' : v < 50 ? 2 : v < 90 ? 0 : v < 110 ? 1 : v < 130 ? 2 : v < 140 ? 3 : 'blue';
export const sbp = (v: number): Zone => v < 70 ? 'blue' : v < 90 ? 3 : v < 100 ? 2 : v < 110 ? 1 : v < 220 ? 0 : 3;
export const temp = (v: number): Zone => v < 35 ? 2 : v < 36 ? 1 : v < 38 ? 0 : v < 39 ? 1 : 2;
export const loc = (avpu: 'A' | 'V' | 'P' | 'U'): Zone => avpu === 'A' ? 0 : avpu === 'U' ? 'blue' : 3;
```

### 12.3 Escalation pathway (mandatory structure; actions localised) [VERIFIED S13, S14]

| Trigger | Zone | Chart wording |
|---|---|---|
| EWS 1-5 | Yellow | (local actions) |
| EWS 6-7 | Orange | "Acute illness or unstable chronic disease" |
| EWS 8-9 **or any vital sign in red zone** | Red | "Likely to deteriorate rapidly" |
| EWS 10+ **or any vital sign in blue zone** | Blue | "Immediately life threatening critical illness" (rapid response call) |

- Take the action for the **most severe** trigger: a single red parameter with total 5 triggers red; four red parameters (total 12) trigger the 10+ blue response (S14).
- Rapid response calls are made even when senior clinicians are at the bedside (S14).
- Banner text (S13, must be shown): **"ESCALATE CARE FOR ANY PATIENT YOU, THEY OR THEIR FAMILY ARE WORRIED ABOUT, REGARDLESS OF VITAL SIGNS OR EWS"**. Also: "If there is no timely response to your request for review, escalate to the next coloured zone."
- "RRT" (rapid response team) may be replaced locally with "777", "MET" or similar (S14).
- Chart also carries "NOT FOR CPR" and "NOT FOR RRT" indicators (S13).

### 12.4 Modifications [VERIFIED S13, S14]

- Individual EWS trigger modifications (for example chronic disease, beta-blockers, home oxygen) are recorded per parameter with: vital sign (abbreviation), accepted values and modified EWS, date and time, duration (hours), name and contact details, reason.
- "Ignore any modification that is not signed and dated." Modifications must be reviewed regularly by the primary team, discussed with a senior clinician, and have a documented duration.
- UI: show active modifications adjacent to the affected parameter row; show expiry; expired or unsigned modifications must not alter scoring.

### 12.5 Colour specification [VERIFIED S14 Table 2]

| Zone | CMYK | RGB | Hex (derived) |
|---|---|---|---|
| Yellow | 0 0 40 0 | 255 255 153 | `#FFFF99` |
| Orange | 0 12 27 0 | 255 224 186 | `#FFE0BA` |
| Red | 0 25 0 0 | 255 192 216 | `#FFC0D8` |
| Blue | 18 9 0 0 | 209 232 255 | `#D1E8FF` |

- On the paper chart the graphing area uses these at **60% tint** (for legibility with black/blue ballpoint); 100% in side columns and the escalation pathway (S14).
- The "red" zone is a pale pink and the "blue" zone a pale blue. These are background fills, so text on them must be dark (black on these four colours exceeds 4.5:1). Colour must not be the only cue (WCAG 1.4.1): show the score number and zone name in each cell or tooltip.
- Logos: only black-and-white organisational logos may be added (S14).
- Up to two additional local parameters; in acute wards using analgesia, pain score at rest and on movement is strongly recommended (S14).

### 12.6 Patient identification guidance

- HQSC charts (S9, S13) require on every page: Family Name, Given Name, Gender, Date of Birth, NHI (label "NHI#:"), or an affixed patient label. These four plus name are the de facto NZ approved identifiers for matching. [VERIFIED for charts]
- A national NZ patient identification wristband specification from HQSC was **not found**. [UNCERTAIN] Wristband content is set by local Health NZ district policies and by Ngā paerewa Health and disability services standard NZS 8134:2021 (requires safe identification; not fetched). The Australian Commission's "Specifications for a standard patient identification band" (https://www.safetyandquality.gov.au/node/2405) is commonly referenced in the region but is not NZ policy.
- Recommended banner/wristband identifier set for `en-NZ`: Family name, Given name(s), Date of birth, NHI, Gender. **[NHS DELTA]** Replace "NHS number" with "NHI" throughout G1.

---

## 13. Accessibility [VERIFIED S22]

- **NZ Government Web Accessibility Standard 1.2**, effective **17 March 2025**, replaces 1.1 (WCAG 2.1). Each in-scope page must meet **WCAG 2.2 Level AA** (all A and AA success criteria), with limited exceptions (complex visual maps exempt from 1.1.1; live captions and audio description rules for video).
- Mandatory for Public Service departments, NZ Defence Force, NZ Police and Parliamentary Counsel Office; other public sector organisations (which includes Crown entities such as Health NZ) are encouraged but not directed to comply. [Health NZ status UNCERTAIN; S22 does not name it]
- No exemption process; non-conforming organisations must risk-assess and submit a remediation plan when requested by the Government Chief Digital Officer.
- PDF and Word content must have an accessible alternative; inactive archived pages exempt but marked.
- Library target: WCAG 2.2 AA for every component, including the six new 2.2 criteria at A/AA: 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum, 24 x 24 CSS px), 3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication (Minimum). Note: 4.1.1 Parsing was removed in 2.2.
- Language of parts (WCAG 3.1.2): mark te reo Māori text with `lang="mi"` so screen readers pronounce it correctly; page language `en-NZ`.

---

## 14. Summary of required library changes for `en-NZ` (checklist)

1. NHI component: two formats, mod 11 and mod 23 checks, upper case, no grouping, Z-range test warning; replaces NHS number in banner, search, wristband and labels.
2. HPI identifiers: CPN, Org (G...-C), Facility (F...-C), PractitionerRole (R...-C) format validation only.
3. Name: UTF-8/NFC, macron-preserving, macron-insensitive search, single-name support, family name case configurable (default as recorded), name protection flag, labels "Family name"/"Given name(s)".
4. Gender: F/M/O/U with te reo labels and "specify" free text; separate optional sex at birth and VSC questions using Stats NZ wording.
5. Ethnicity: exact HISO 10001 question, multi-select, Other write-in, up to 6 level 4 codes, no principal ethnicity, prompt with "I don't know my ethnicity" / "I do not want to state my ethnicity".
6. Māori descent and iwi: exact HISO 10094 questions, multi-iwi entry with macron-insensitive look-up.
7. Address: HISO 10046 fields, NZ Post line order, RD, PO Box, Private Bag, 4-digit postcode string, M/R types, protected flag.
8. Phone: NZ formatter, +64 storage with no punctuation.
9. Dates/times: day-first only, 24-hour, partial DOB, `Pacific/Auckland` and `Pacific/Chatham`, DST-safe charts.
10. Medicines: NZMT classes, generic names, Tall Man (HQSC 2023 list), DO NOT USE list enforced in formatters, NZ abbreviations, NMC non-administration codes.
11. Allergies: three-state summary (recorded / No known / Unknown) with recorder and date; "New this admission".
12. Terminology: SNOMED CT NZ Edition with NZ English language refset for display; te reo consumer terms where appropriate.
13. NZEWS chart: bands, colours, escalation and modifications as section 12.
14. Accessibility: WCAG 2.2 AA; `lang="mi"` on te reo text.
