# AbbreviationCheckedTextArea

A free text field that checks for known dangerous abbreviations and dose-format hazards, alerts the author when they leave the field, offers expansions without a default, and reports when saving must be blocked.

## When to use

Free text clinical notes, prescribing notes and handover text.

## What you provide

- `label`, `value` / `defaultValue` / `onChange`. Omit `label` when the text area is wrapped in `FormField` (noting): FormField's label then labels the text area (it passes its `id`, `aria-describedby`, `aria-invalid`, `aria-required` and an in-field `placeholder`, all of which reach the real `<textarea>`).
- `required` and `missed` (as `FormField`) when used on its own; inside `FormField`, set them on FormField instead. `aria-describedby` ids are merged with the alert summary.
- `dangerousList` (default `DANGEROUS_ABBREVIATIONS`, abbracs Appendix A, B and C), `knownAbbreviations` (non-dangerous local abbreviations and meanings), `checkDoseFormats`.
- `onValidityChange(isValid, findings)`; `showAlerts` to show the alert on a save attempt; `readOnly` for readers; `rows`, `disabled`.
- `region` (optional): chooses the default `dangerousList`, the suggestions and the extra dose rules.

```tsx
<AbbreviationCheckedTextArea
  label="Clinical note"
  value={note}
  onChange={setNote}
  onValidityChange={ok => setCanSave(ok)}
  showAlerts={triedToSave}
/>
<Button variant="primary" disabled={!canSave}>Save note</Button>

// In a form, wrap it like any other input so the label, asterisk and missed state match the other fields.
<FormField id="f-summary" label="Summary and plan" required missed={isMissed('f-summary')}>
  <AbbreviationCheckedTextArea value={note} onChange={setNote} onValidityChange={ok => setCanSave(ok)} showAlerts={triedToSave} />
</FormField>
```

## Guidance implemented

- abbracs 3.1 alert the author to known dangerous abbreviations when they move to another field (on blur) or try to store the text (`showAlerts`).
- abbracs 3.1 present expansions for selection but never a default; choosing one replaces the dangerous text, or inserts "AE (air entry)" for ambiguous acronyms.
- abbracs 3.1 prevent storage: `isValid` is false while any dangerous item remains; the host must block saving.
- abbracs Appendix A and B dose hazards: trailing zero (1.0 mg), missing leading zero (.5 mg), drug name and dose run together (Inderal40 mg), "/" between doses.
- abbracsfree background check while typing without interrupting; alerts only on leaving the field or storing.
- abbracsfree warn later readers: in `readOnly` mode a warning lists remaining unexpanded abbreviations.
- abbracs accessibility: "Go to next item" button and F8 [suggested key] select the next flagged item; dangerous and non-dangerous items differ by icon and text, not colour alone.
- CNA-1080/1110 [M] `required` shows a red asterisk after the label and sets `aria-required`.
- CNA-1160..1180 [M] `missed` shades the field yellow, adds a warning icon and the screen-reader text "Required field not completed.", as `FormField`.
- The default list is a seed: the authoritative list should be maintained centrally (abbracs 3.1).

## Do and don't

- Do block saving while `isValid` is false.
- Don't auto-correct abbreviations or pre-select an expansion.
- Don't show alerts on every keystroke.
- Don't give it a `label` inside `FormField`: the field would have two labels.

## Accessibility

Visible label (its own or FormField's, never both), a `role="alert"` summary linked to the field with `aria-describedby`, each item labelled "Dangerous abbreviation", "Dose format hazard" or "Abbreviation" in text, keyboard-operable suggestion buttons, F8 and a button to move to the next item.

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| List | abbracs Appendix A (JCAHO), B (ISMP), C (NHS ambiguous acronyms) | ACSQHC *Recommendations for safe use of medicines terminology* (Nov 2024): frequencies, routes, medicine and chemical names, symbols | HQSC National Medication Chart user guide Appendix B and Alert 4 |
| Example | `10U` gives "unit" or "units"; `µg` gives "mcg" or "micrograms" | `mcg`, `ug`, `µg` give "microgram"; `Q4H` and `4/24` give "every 4 hours"; `OD` gives "once a day" or "daily"; `KCl` gives "potassium chloride" | `mcg`, `µg` give "microgram"; `U` gives "unit"; `IU` gives "international unit"; `SC` gives "subcut" or "subcutaneous"; `mEq` gives "mmol" |
| Not flagged | | | NMC Appendix A abbreviations (BD, TDS, q4h, subcut, subling, `ng` for nasogastric); `ng` is flagged only straight after a number |
| Dose rules | trailing zero, missing leading zero, name and dose run together, "/" between doses | as GB plus Roman numerals (`ii tablets`) and k or M multipliers (`10k units` gives "10,000 units") | as GB plus Roman numerals |
| Suggestions | as listed by the source | full words, because ACSQHC asks for medicines information to be written out on digital displays; handwritten-only terms (tds, mane, nocte) are not offered | the HQSC "use instead" terms |

[suggested] AU single letters D, E, M and N are flagged only after a number or dose ("25 mg M"), so "vitamin D" is not flagged. Lists are in `utils/regions/abbreviations.ts` with source URLs; neither source list is exhaustive, so hosts should extend them locally. Sources: G10-australia.md 9.1; G11-new-zealand.md 8.1, 8.3.
