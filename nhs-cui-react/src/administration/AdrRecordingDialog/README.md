# AdrRecordingDialog

Dialog for adding or editing an entry in the patient's adverse drug reaction summary, including removing an entry after confirmation.

## When to use

- From "Add new drug reaction" on the adverse drug reaction summary, or from the details view of an entry ("Edit", "Remove from list").
- When notes suggest a reaction, open it in add mode with `initial` values (source is never pre-filled).

## What you provide

- `existingEntries`, `sources` (fixed list set by your clinical authority), `onFinish`, `onCancel`.
- `searchConcepts(text, field, subsetId)` for the built-in terminology fields, or `renderAgentSearch(slot)` to drop in your own causative agent search.
- For editing: `mode="edit"`, `entryId`, `initial`, and `onRemove(reason)`.

```tsx
<AdrRecordingDialog
  existingEntries={entries}
  sources={['Patient testimony', 'Clinical documentation', 'Clinician witnessed reaction']}
  searchConcepts={(text, field, subset) => terminology.search(text, field, subset)}
  onFinish={result => save(result)}
  onCancel={close}
/>
```

## Guidance implemented

- RAD-0020 [M], 0020.1, 0020.3 [R]: action-phrased title, top left ("Add new drug reaction").
- RAD-0030 [R], 0040 [M]: global buttons together top right; Finish greyed out until it can be used.
- RAD-0040.1 to 0040.7 [R]: live preview styled like a selected summary line, agent in bold.
- RAD-0060, 0060.1 [R]: purpose prompt (warns other clinicians).
- RAD-0070, 0070.2 [M], 0070.1, 0070.3, 0070.4 [R]: labelled existing entries stacked to the right.
- RAD-0080, 0610 [M], 0620 [R]: duplicate causative agent warning (exact code) and instruction to remove the existing entry first; Finish disabled.
- RAD-0090, 0100, 0120, 0130 [R]: only the causative agent is enabled and focused at first; Tab from an empty agent goes to Cancel.
- RAD-0110 [M]: warning when the agent is cleared after other data.
- RAD-0140, 0150 [M], 0150.1 [R]: Finish once an agent is entered; vertical fields in tab order agent, reactions, source, witnessed, details, then Finish.
- RAD-0160, 0170 [M], 0191 [R]: "Current filter" subset label; coded terms in bold with "Coded"; unrecognised text can be used as free text, shown in italic as "Not coded". Class concepts show "(class)".
- RAD-0190 [R]: result includes the post-coordinated expression (419511003 or 418471000 with 246075003).
- RAD-0200 to 0230, 0270, 0280, 0320 [M], 0240, 0280.1, 0310, 0340, 0350, 0360 [R]: "Type(s) of reactions experienced" with search, a line per keyword, its own elaboration field and a delete button.
- RAD-0260 [M]: warning when elaboration contains negation, reduction, family history or other-patient words.
- RAD-0380, 0410, 0410.1 to 0410.3, 0420 [R]: "Other details/ justification" with prompt, and reaction words not yet entered highlighted with a message.
- RAD-0430, 0430.4 [M], 0430.6, 0440 to 0440.2 [R]: source drop-down with prompt "Enter source of most recent information", no default; "Clinician witnessed reaction" checkbox auto-ticked by that source.
- RAD-0830 [M], 0850, 0860, 0870, 0880 [M]: edit mode keeps the causative agent read-only, Finish disabled until changed, Back becomes Cancel after a change.
- RAD-0680, 0750.2, 0750.3 [M], 0700, 0720, 0750, 0750.1 [R]: "Remove from list" with explanation; confirmation names the drug, says notes remain and warnings stop, encourages a reason, two buttons worded to match.

## Do and don't

- Do avoid the words "risk" and "propensity" in your own labels around it.
- Don't add an overall severity rating; severity belongs on a reaction ("severe rash").
- Don't pre-fill the source from the system.
- [suggested] Default reaction lexicon and danger word lists; replace them with terminology-backed lists.

## Accessibility

- Non-modal `role="dialog"` with a labelled title and description; Esc cancels.
- Terminology fields are ARIA comboboxes (Up and Down, Enter to select, Esc to close) with a live definition.
- Coded or not coded state is given as text, not only bold; highlights are paired with a message.
- The remove button explains its effect in an accessible description as well as a tooltip.

## Regional behaviour

- GB: CUI wording as above.
- AU: title "Add allergy or adverse drug reaction", fields "Medicine (or other)" and "Reaction" (NIMC box), plus Type (Allergy or Intolerance) and "Date of reaction" (AU-AL-03, G10 10). The result includes `reactionType` and `reactionDate`.
- NZ: title "Add allergy or adverse reaction", HQSC example prompt, the guidance that rash, urticaria, facial or throat swelling, or anaphylaxis is documented as an allergy, and a "New this admission" tick (G11 9.2). The result includes `newThisAdmission`.
- The removal confirmation names the regional list. Sources: NIMC User Guide, EMM business requirements 3.4, HQSC NMC user guide 2021.
