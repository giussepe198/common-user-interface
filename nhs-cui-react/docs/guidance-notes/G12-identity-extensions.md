# Identity extensions (AU and NZ): research notes

Purpose: primary-source findings for the patient-area items that G10 and G11 left open: Medicare card "valid to", My Health Record access states, NZ name/address/contact protection flags, dormant and live NHIs, NZ partial dates of birth, HISO 10001 ethnicity output rules, ABS 2020 and Stats NZ variations of sex characteristics and sexual orientation questions, and the interviewer version of the AU Indigenous status question.

Research date: 27-Oct-2026. Markers as in G10/G11: **[VERIFIED]** read from the cited primary source; **[SECONDARY]** a derivative source restating it; **[UNCERTAIN]** not confirmed, implemented as configurable data; **[suggested]** a library design choice the sources do not cover.

---

## 1. Medicare card "valid to"

- The card prints the expiry at the bottom right as `VALID TO 06/20XX` (month and four-digit year). "The old version will continue to be valid until the expiry date on the bottom right corner of the card." [VERIFIED] Services Australia, Medicare card talking points: https://www.servicesaustralia.gov.au/sites/default/files/2026-01/talking-points-medicare-card-is-changing.docx
- Services Australia staff "can re-issue a replacement card if the card has an expiry date of less than 6 months"; reciprocal health care (RHCA) cards have a separate "due to expire in less than one month" process. [VERIFIED] Operational blueprint: https://operational.servicesaustralia.gov.au/public/Pages/your-health/011-44150000-03.html
- Older cards printed `MM/YY` [UNCERTAIN, G10 1.3]. Accept both on entry; store and show `MM/YYYY`.
- No source says whether "valid to 06/2027" includes the whole of June. Library reads it as valid to the last day of that month [suggested].
- No source sets an "expiring soon" window. Library default: warn when the card expires within 1 month (the RHCA reminder period), configurable [suggested].
- Rule: expired and expiring states are shown as text with an icon, never by colour alone (AU-ID-01 pattern).

## 2. My Health Record access states

Sources:
- ADHA, Restrict access to your record: https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/manage-your-record/privacy-and-access/restrict-access-to-your-record [VERIFIED]
- ADHA, Restrict access to documents in your record: https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/manage-your-record/privacy-and-access/restrict-access-to-documents-in-your-record [VERIFIED]
- ADHA, My Health Record suspension: https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/manage-your-record/privacy-and-access/my-health-record-suspension [VERIFIED]
- ADHA, Cancelling a record: https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/profile-and-settings/cancelling-a-record [VERIFIED]
- ADHA developer guide, gain access (B2B gateway): https://developer.digitalhealth.gov.au/node/7260 and https://implementer.digitalhealth.gov.au/resources/my-health-record-b2b-gateway-gain-access-to-a-my-health-record [VERIFIED as published sample guidance]
- OAIC, Emergency access function: https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/health-service-providers/my-health-record/my-health-record-emergency-access-function [VERIFIED]
- OAIC, Using the My Health Record system: https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/health-service-providers/my-health-record/using-the-my-health-record-system [VERIFIED]
- OAIC, Access controls: https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/health-service-providers/my-health-record/my-health-record-access-controls [VERIFIED]
- ADHA, Best Practice emergency access fact sheet: https://digitalhealth.gov.au/sites/default/files/documents/best-practice-fact-sheet-emergency-access.pdf [VERIFIED]

Findings:
- **Record Access Code (RAC)**: "a 4-8 character code"; applies to the healthcare organisation, not the individual provider; organisations that accessed the record before the code was set keep access; organisations that have not accessed it for three years need the code again. "Healthcare providers can still upload documents to your record when a record access code is set." [VERIFIED ADHA]
- **Limited Document Access Code (LDAC)**: controls access to documents the person set to "Restricted Access"; "a 4 to 8 character code"; "cannot be the same as your Record Access Code"; "lasts for three years". Providers using the RAC see documents "set to general access". Shared health summaries, personal health summaries and some advance care plans cannot be restricted. [VERIFIED ADHA]
- B2B: `doesPCEHRExist` returns `PCEHRExists` and `accessCodeRequired` (the developer guide tests for `"WithCode"`); `gainPCEHRAccess` takes `accessType` `AccessCode` (with the code) or `EmergencyAccess`. Error texts: PCEHR_ERROR_5101 "PCEHR not found", 5102 "PCEHR is found but access code is required", 5103 "PCEHR is found but access code is invalid", 5104 "You are not authorised to access this Record". The RAC and LDAC are called PACC and PACCX in the test cases. [VERIFIED developer guide] The other `accessCodeRequired` values (`AccessGranted`, `WithoutCode`) are from the interface specification and were not on a fetched page [UNCERTAIN].
- Conformance requirements quoted in the developer guide [VERIFIED]:
  - PCEHR_CIS_019048: "The clinical information system shall provide the CIS User with an option to enter provider access consent codes".
  - PCEHR_CIS_017941: "The Clinical Information System shall have a process to handle errors received from the PCEHR B2B Gateway Service."
  - PCEHR_CIS_019116: "... it shall display the conditions of emergency access at time intervals appropriate to the clinical settings".
  - The guide states that the access page "must still have the 2 options for the user to enter an Access Code" and to gain emergency access.
- Emergency access declaration text shown in the developer guide: "By selecting Emergency Access you are declaring that access to this My Health Record is necessary to lessen or prevent a serious threat to an individual's life, health or safety, or to public health" [VERIFIED as the guide's sample text; the guide's text ends "or to public health"; OAIC states the statutory ground as "public health or safety", so the full wording is [UNCERTAIN] and configurable].
- **Emergency access** (My Health Records Act 2012 s 64, per OAIC): only where the provider reasonably believes access is "necessary to lessen or prevent a serious threat to an individual's life, health or safety" and "it is unreasonable or impracticable to obtain the healthcare recipient's consent", or "necessary to lessen or prevent a serious threat to public health or safety". Not for viewing your own or a family member's record, demonstrations, checking whether restricted documents exist, or resetting a forgotten code. Lasts 5 days, then reverts to the access controls. Logged in the access history; the System Operator is notified automatically; the person may opt to receive an email or SMS. Providers must record the circumstances and why consent could not be obtained; organisations should keep a register. Clinical software "presents an automated confirmation message before access". [VERIFIED OAIC]
- Emergency access includes restricted documents but not documents the person removed: "Any document a patient removes from their My Health Record is not accessible in a medical emergency." [VERIFIED OAIC]
- **Do not upload**: "If a patient asks that a certain document not be uploaded, then a healthcare provider organisation must do as they ask." Some state and territory laws also bar upload without consent for some conditions (My Health Records Regulation 2012). [VERIFIED OAIC]
- **Suspended**: "you, your representatives and your healthcare providers won't be able to access" the record, except "in an emergency, a healthcare provider will be able to view the information in your record"; Medicare and prescription and dispense documents are not added. [VERIFIED ADHA] Whether providers can upload during suspension is not stated beyond this [UNCERTAIN].
- **Cancelled**: information "will be permanently deleted"; "No one, including your healthcare providers, will be able to view it"; the person can re-register for a new record. [VERIFIED ADHA]
- Not connected or unavailable (organisation not registered, gateway down): no ADHA wording found; library text [suggested].

Library rules (derived):
- MHR-01 (M): Every state is shown as text with an icon; never colour alone.
- MHR-02 (M): When an access code is required the control offers both "Enter access code" and "Emergency access" (developer guide).
- MHR-03 (M): Emergency access shows the conditions (PCEHR_CIS_019116), asks which statutory ground applies, requires the circumstances in words and an acknowledgement that the access is logged, notified and auditable (OAIC), and cannot be confirmed until all are given.
- MHR-04 (M): After emergency access, a persistent "Emergency access" indicator with the end date (5 days) is shown (AU-PV-02).
- MHR-05 (R): Show that restricted or removed documents may not be visible, so an empty section is not read as "nothing recorded" [suggested].

## 3. NZ name, address and contact protection flags (HISO 10046:2024)

Source: HISO 10046:2024 https://tewhatuora.govt.nz/assets/Publications/HISO-Standards/hiso-10046-2024-Consumer-health-identity-standard.pdf [VERIFIED]

- 2.2.7 Name protection flag: "This indicator denotes that the person's name information is to be held 'in confidence'". Boolean, N(1,0), "1 – Protected", "0 – Not Protected", mandatory, default 0, "set to 1 if the person indicates they have a reason to not share this name". Guide: "The flag indicates whether person name information held can be shared as part of the person name record." Organisations must ensure "appropriate controls are implemented and active to provide name protection".
- 3.9 Address protected flag: same wording for address; "1 – Yes, Protected", "0 – No, Not Protected".
- 5.4 Contact protected flag: same for contact information.
- The standard sets **no UI behaviour** (no masking rule, no reveal rule, no wording for the indicator) [VERIFIED by absence]. Library choices [suggested]: name shown with a "Name protected" indicator (the name is needed to identify the patient safely); address and contact details masked by default with "Address protected" / "Contact details protected", and an optional reveal that asks for a reason and calls back to the host for audit. Never print or export a protected value from the library itself.

## 4. Dormant and live NHIs

- HISO 10046:2024 2.1.2: "Where more than one number exists for a person, one number is declared 'live' and all other numbers are made 'dormant' and attached to the live record." NHI numbers are never reused (2.1.3). [VERIFIED S1 above]
- HL7 NZ Base example Patient: live NHI has `identifier.use = "official"`, dormant NHIs `use = "old"`, system `https://standards.digital.health.nz/ns/nhi-id`. [VERIFIED] https://packages2.fhir.org/xig/resource/fhir.org.nz.ig.base%7Ccurrent/Patient/Patient-patient-nhi.json ; value set nhi-use: https://packages2.fhir.org/xig/fhir.org.nz.ig.base|current/ValueSet/nhi-use
- No source specifies display wording. Library [suggested]: "ZAC5361 (dormant)" followed by "Live NHI: ZBN77VL" and a "Use live NHI" action; the NHI input warns "This NHI is dormant. The live NHI is ...". Lookup is the host's (no network in the library).

## 5. NZ partial dates of birth

- HISO 10046:2024 2.3.1: representational class "Full or partial date", layout `YYYY[MM[DD]]`; "The Year component of the date is mandatory." "Month is conditional and to be used if known." "Day is conditional and to be used if known and month has been recorded"; "cannot be in the future". [VERIFIED]
- 2.3.2 Date of birth information source, mandatory when a DOB is supplied: BRCT, BREG, HL7, MIGR, NPRF ("Proof Not Sighted"), NZCI, NZCT, NZET, NZPV, NZTV, NZRT, OTHR, PPRT. [VERIFIED]
- HISO 10046:2024 has **no separate "date of birth accuracy indicator"** element; accuracy is implied by which components are present [VERIFIED by absence]. Library derives accuracy `year` | `month` | `day` from the stored value.
- Display and age rules are not in the standard [UNCERTAIN]. Library [suggested]: `1975`, `Mar-1975`, `14-Mar-1975` (G2 format), plus the words "year only" or "day not known" so the date is never read as a full date; age shown as the possible range ("50 or 51y") when the missing components make it ambiguous; never invent a day.

## 6. Ethnicity output (HISO 10001:2017)

Source: https://tewhatuora.govt.nz/assets/Our-health-system/Digital-health/Health-information-standards/HISO-10001-2017-Ethnicity-Data-Protocols.pdf [VERIFIED]

- Record at level 4 (5 digits); level 3 = 3 digits, level 2 = 2, level 1 = 1. "Codes can be aggregated by removing the last digits." Routine output at level 1 where practical.
- "a 'principal ethnicity' must not be recorded"; respondents must not be asked to pick one. Prioritisation is "only appropriate on output when using the ethnicity data for analysis and reporting."
- Level 1 priority: 2 Māori, 3 Pacific Peoples, 4 Asian, 5 MELAA, 6 Other Ethnicity, 1 European, 9 Residual. Level 2 priority (Table 3) as in G11 4.1.
- **More than six responses (Appendix A, Stats NZ random method)**: remove residual-coded responses first; keep every level 1 group with a single response; among level 1 groups with several responses pick one at random, remove one response from it at random; repeat until six remain; every level 1 group represented must remain. Worked example: French, Niuean, Cambodian, Vietnamese, English, Algerian, New Zealander gives French, English, Niuean, Vietnamese, Algerian, New Zealander (with the random numbers in the example).
- **Systems that store only three (transition, Table 4)**: align each level 4 code with its level 2 code, rank by the level 2 priority order, keep the top three, store them at level 4. Health systems should not use random reduction when reducing to fewer than six. Tie-break when two codes share a level 2 code: not stated [UNCERTAIN]; library keeps recorded order.
- 96666 "Repeated value" is for duplicate responses; handling on reduction not stated [UNCERTAIN]; library drops exact duplicates before reduction.

## 7. Variations of sex characteristics and sexual orientation

### 7.1 AU: ABS Standard 2020 [VERIFIED] https://abs.gov.au/statistics/standards/standard-sex-gender-variations-sex-characteristics-and-sexual-orientation-variables/latest-release

Variations of sex characteristics:
- Standard (self-enumerated): "Were you born with a variation of sex characteristics (sometimes called 'intersex' or 'DSD')?" "Please [tick/mark/select] one box:"
- Allowable alternative (interviewer): "Were you born with a variation of sex characteristics, sometimes called 'intersex' or 'DSD'?"
- Codes: 1 (Y) Yes; 2 (N) No; 3 (U) Don't know; 4 (Z) Prefer not to answer; supplementary 9 Not stated, 0 Not applicable.
- Mandatory: the words, those labels, one response; interviewers ask as written. "A survey respondent should not be asked to respond as to whether others were born with a variation." Outputs: Yes, No, Don't know, Not stated (includes Prefer not to answer).

Sexual orientation:
- "How do you describe your sexual orientation?" "Please [tick/mark/select] one box:"
- Codes: 1 (S) Straight (heterosexual); 2 (G) Gay or lesbian; 3 (B) Bisexual; 4 (T) I use a different term (please specify); 5 (U) Don't know; 6 (Z) Prefer not to answer; supplementary 9, 0.
- Alternative: "Asexual", "Pansexual", "Queer" may be added and "Gay or lesbian" split; **no codes are published** for these [UNCERTAIN], so the library does not offer them by default.
- Recommended age 15 years and over. Do not ask about other people's sexual orientation. Do not assume from name, voice or appearance.

### 7.2 NZ: Stats NZ

Variations of sex characteristics, Data standard for gender, sex, and variations of sex characteristics (2021), VSC v1.0.0 [VERIFIED] https://www.stats.govt.nz/assets/Methods/Data-standards-for-sex-gender-and-variations-on-sex-characteristics/downloads/Data-standard-for-gender-sex-and-variations-of-sex-characteristics.pdf
- Example question: "Were you born with a variation of sex characteristics (otherwise known as an intersex variation)?" Yes / No / Don't know / Prefer not to say.
- Input classification: 1 Yes, 2 No, 4 Don't know, 5 Refused to answer, 7 Response unidentifiable, 8 Response outside scope, 9 Not stated. "Prefer not to say" maps to 5 [suggested mapping; the example is not coded in the standard].
- Must include "variations of sex characteristics", "intersex" or "intersex variation"; suitable for self-completion; a definition is recommended.

Sexual identity, Statistical standard for sexual identity (Feb 2019), SCSI v1.0 [VERIFIED] https://www.stats.govt.nz/assets/News/Sexual-identity-standard.pdf
- Question (both examples): "Which of the following options best describes how you think of yourself?"
- Example 2 options: Heterosexual or straight; Gay or lesbian; Bisexual; Other, please state; Don't know; Prefer not to say.
- Classification: 01 Heterosexual, 02 Homosexual, 03 Bisexual, 09 Sexual identity not elsewhere classified; residuals 44 Don't know, 55 Refused to answer, 77 Response unidentifiable, 88 Response outside scope, 99 Not stated. Mapping of the example options to codes is [suggested].
- Age 15 and over; "should not be answered by proxy"; self-administration or showcards recommended for sensitive questions.

Library rules [suggested]: these inputs and displays render nothing unless the host enables them, are marked "Sensitive" in text, offer one response, and never pre-fill.

## 8. AU Indigenous status: interviewer-administered version

Source: METeOR 602543 https://meteor.aihw.gov.au/content/602543 [VERIFIED]

- Q1: "Are you of Aboriginal or Torres Strait Islander origin?" Yes / No (No ends the question).
- Q2: "Are you of Aboriginal origin, Torres Strait Islander origin, or both?" Aboriginal / Torres Strait Islander / Both Aboriginal and Torres Strait Islander. The interviewer "is not required to prompt the respondent with response categories"; the "Both" category may be included or excluded by agency practice.
- Third-party wording uses "Is [the person] [(name)] ..." (and "Was ..." for a deceased person).
- Self-completed instruction, verified: "If [you] [the person] [(name)] are of both Aboriginal and Torres Strait Islander origin, answer using both 'Yes' options." (The G10 wording "For persons of both ... mark both 'Yes' boxes." is not the METeOR text.)
- Ask every person "regardless of data collectors' perceptions based on appearance or other factors"; ask directly.
