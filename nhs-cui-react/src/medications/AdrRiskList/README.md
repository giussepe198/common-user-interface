# AdrRiskList

Shows a patient's adverse drug reaction risks: each causative agent with its past reactions, supporting events on demand, and the exact wording for "none found" and "not yet checked".

## When to use

- Anywhere a clinician needs a patient's ADR risks, for example beside the medications list or in a prescribing view.
- `variant="narrative"` for letters and summaries.
- Not for decision support alerts or the abbreviated status in the patient banner.

## What you provide

```tsx
<AdrRiskList
  status={{
    kind: 'risks',
    risks: [
      { id: 'r1', agent: { text: 'penicillin', encoded: true },
        pastReactions: [['urticaria', 'nausea'], ['anaphylaxis']],
        events: [{ id: 'e1', description: 'Risk identified', date: { year: 2019, month: 3 },
          source: { who: 'Patient', encounter: 'Admissions Triage' },
          author: { name: 'Sam Okafor', role: 'Nurse', location: 'Riverside General Hospital' } }] },
      { id: 'r2', agent: { text: 'sticking plaster adhesive', encoded: false, triggersDecisionSupport: false }, pastReactions: null },
    ],
  }}
/>

<AdrRiskList status={{ kind: 'noKnownRisks', recordedAt: '2026-10-26T09:15', author: { name: 'Dr Tom Hale', role: 'F2' } }} />
<AdrRiskList status={{ kind: 'unknown' }} />
```

## Guidance implemented

- ADR-0001 to ADR-0004, ADR-0007 [M/R]: Level 1 risk phrases; selecting a risk opens its Level 2 events in place; "Back to risk list" and the same toggle return to Level 1.
- ADR-0005, ADR-0006, ADR-0016, ADR-0043 [M/R]: two columns only, agent on the far left, past reactions to its right; no dates, form, route, dose, category, severity or certainty at Level 1.
- ADR-0008, ADR-0009 [M/R]: sorted alphabetically by agent, case-insensitive.
- ADR-0010 to ADR-0015 [M/R]: agent shown as recorded; one risk per agent (duplicates log a console warning); encoded and free-text agents both supported.
- ADR-0017 to ADR-0023 [M/R]: reactions as short keywords; same-event reactions joined with " + " (or " AND "), different events separated by commas; "Not known" when unknown (wording [suggested]).
- ADR-0024 to ADR-0029 [M/R]: headings "Drug / substance" and "Past reactions"; title "Adverse drug reaction risks".
- ADR-0030, ADR-0042, ADR-0044 to ADR-0050 [M/R]: each event has a date (partial dates "2008", "May-2008"), optional time, source and encounter, recording clinician, role and location.
- ADR-0033 [M]: agent column 46 characters wide, wraps only at spaces.
- ADR-0034, ADR-0035, ADR-0039, ADR-0040 [R/M]: tables with faint banding, hover highlight and a selected-row highlight.
- ADR-0036 to ADR-0038 [M/R]: encoded agents bold and lower case, free text normal weight and lower case.
- ADR-0041 [M]: chevrons for disclosure, never black triangles.
- ADR-0051 to ADR-0054 [M/R]: exactly "No known adverse drug reaction risks" with date, time, author, role and location; exactly "Risk status unknown" when nobody has checked; never blank or "None". An empty risk list is treated as unknown [suggested].
- ADR-0055 to ADR-0057 [M/R]: "Will not trigger decision support alerts" (wording [suggested]) with an icon, in the row next to the agent.
- ADR-0058 to ADR-0062 [R/M]: narrative variant with the lead-in "Adverse drug reaction risks:" and one risk per line, including agent and past reactions.

## Do and don't

- Do record the agent as entered; the component lower-cases display only.
- Don't add severity or "allergy/intolerance" labels to the Level 1 row; put them in Level 2 event descriptions.
- Don't show "No known drug allergies" or "No recorded adverse drug reactions"; those phrasings were misread in research.

## Accessibility

- Real tables with column headers; the title labels the table; each Level 2 table has a hidden caption.
- Disclosure buttons use `aria-expanded` and `aria-controls`.
- Free-text agents are announced as "(free text)", because weight alone is not perceivable.
- The no-decision-support flag is visible text, not only an icon.

## Regional behaviour

- **GB:** "No known adverse drug reaction risks" and "Risk status unknown" (ADR-0051, ADR-0054). Title "Adverse drug reaction risks".
- **AU:** NIMC allergies box wording: "Nil known", "Unknown", and "Not recorded" when nothing has been entered. Title "Allergies and adverse drug reactions (ADR)". Source: ACSQHC NIMC user guide (G10).
- **NZ:** HQSC National Medication Chart: "No known allergies or adverse reactions", "Unknown", and "Not recorded". Title "Allergies & Adverse Reactions". Source: HQSC NMC user guide 2021 (G11). The exact NZ label text is marked uncertain in the notes; pass `title` to override.
- In every region an empty list is shown as not recorded (a warning), never as "no known".
- Set the region with `ClinicalLocaleProvider` or the `region` prop. For recording, use `AdrSummaryList` and `AdrRecordingDialog` from the administration area, which share this wording.
