# ClinicalStatement

**Experimental.** Displays one recorded clinical statement as readable text, with context and negation first, coded and free text merged, and a flag when nothing in it is coded.

## When to use
- Showing previously recorded history items (past medical history, family history, allergies) at the point of care.
- The rules come from a 2009 design consultation (emerging themes, not mandatory guidance), so expect changes.

## What you provide
- `statement`: `pattern` (PMH, PSH, FH, MH, AAR, HCC, CM, SR or your own), `segments` (coded and free text in order), optional `findingContext`, `subject`, `observationTime` (a partial date), `sessionTime`, `author`, `location`.
- Optional `inMixedList`, `highlightCoded`, `showProvenance`, `onAddEncoding`, `onEdit`.

```tsx
<ClinicalStatement inMixedList statement={{ id: '1', pattern: 'FH',
  segments: [{ type: 'coded', text: 'Myocardial infarction' }, { type: 'free', text: 'father died aged 55' }] }} />
```

## Guidance implemented
- Unified text: coded terms and additional free text merged into one phrase without repeated words (`renderStatementText`).
- Negation before the term ("No asthma", "No history of asthma"); raw descriptions such as "Known absent" mapped to friendly labels.
- Family history first ("Family history of MI"); dropped under a family history heading. Allergy before the agent ("Allergy to penicillin").
- Default context values (subject = patient, known present, current) are never shown; never shows concept identifiers or the phrase "SNOMED CT".
- Coded and free text differ by size and colour, not bold or italics; an optional highlight for checking encoding.
- Unbound statements shown in full with "No terms available" and an optional "Add terms" action.
- Date at the left, observation time preferred, at the precision captured, with "(approximate)" where estimated (`formatStatementDate`).
- Editing needs an explicit action ("Edit" button).
- Context prefixes for patterns other than family history ("History of", "Current medication:") are [suggested]; the 2px size difference (rather than about 4 points) is [suggested] to keep free text readable.

## Do and don't
- Do show the pattern context at the start of each statement in mixed lists (`inMixedList`).
- Don't hide free text: it can hold critical detail (for example the age at which a parent died).
- Don't use icons just to mark free text.

## Accessibility
- Free text in coded statements carries hidden "(free text)" text so the distinction is not visual only.
- The unbound flag is text, with a dashed border and colour as extra cues.
