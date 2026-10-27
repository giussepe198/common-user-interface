# SuggestedMatchList

The "suggested matches" column for a free-text noting area: each suggested encoding sits in its own box with a confirmation check box, its attributes indented below and any unencoded text shown on separate lines with a free-text icon.

## When to use
- Text-parser noting, where the system suggests codes for what the clinician typed and nothing is coded until confirmed.

## What you provide
- `suggestions`: `label`, optional `sourceText`, `modifier`, `attributes`, `freeText`, `confirmed`, `sameSpellingAlternatives`, `alternativesViewed`, `unresolvedMandatory`, `warnings`.
- Callbacks `onConfirmChange`, `onAttributeConfirmChange`, `onOpenAlternatives`, and `focusedId` / `onFocusSuggestion` to keep the text area and list in step.

```tsx
<SuggestedMatchList suggestions={matches} focusedId={current}
  onConfirmChange={(id, on) => confirm(id, on)} onAttributeConfirmChange={confirmAttr} onOpenAlternatives={openList} />
```

## Guidance implemented
- Matching 2.2.1: label "Tick to confirm that this is what you mean:", greyed until there is at least one suggestion; pale blue area.
- Matching 2.3.2: each suggestion bounded, pale blue, yellow on hover or focus; a check box per confirmation.
- B2.6 [M] / 2.3.3 [M] nothing is coded without confirmation; each match can be confirmed or not.
- Matching 2.3.2/2.3.3: confirmation disabled while an alternative with the same spelling exists and has not been viewed, with the reason shown.
- Elaboration 2.2.3 [M]: confirmation disabled while a mandatory qualifier is unresolved, with "You must select ... to be able to encode '...'"; a confirmed mandatory qualifier is ticked and cannot be cleared on its own.
- Post-coordination 2.1.4 [M]: attributes cannot be confirmed until the base concept is; attribute names appear only after confirmation.
- Post-coordination 2.1.2: 'No' and '?' in bold before the base; alternatives are not offered for negated concepts.
- Elaboration 2.1.2: unencoded text chunks indented below the match, each with a free-text icon.
- Matching 2.3.2 [M]: concept identifiers hidden (`showConceptIds` only for coder or test views).
- Confirmed labels in bold (Elaboration 2.2.3). The empty-state text is [suggested].

## Do and don't
- Do update `alternativesViewed` once the user has opened the alternatives list.
- Don't auto-confirm suggestions.

## Accessibility
- Native check boxes with labels; disabled boxes are described by the visible reason.
- Free-text lines carry hidden text "Free text, not coded"; the alternatives buttons have names such as "Show alternatives for Fracture of radius".
- Warnings use an icon and text, not colour alone.

## Regional behaviour
- When a suggestion carries `descriptions`, the label is the preferred term of the region's language reference set: UK English (GB), Australian English (AU, G10 11), NZ English (NZ, G11 10). Otherwise `label` is shown as given.
- `showEdition` [suggested] adds "Codes from: <edition>" under the list.
- Macrons in labels and source text are shown as supplied.
