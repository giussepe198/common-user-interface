# MeasureForm

An outcome measure as an item-rating grid, from an instrument definition passed in: one row per item, one column per response option, a read-only total with its band, and items not answered listed before saving.

## When to use

- Recording a clinician, consumer or carer rated measure (HoNOS, HoNOSCA, K10 and the like) from the host's instrument definitions.

## What you provide

- `instrument` (`MhMeasureInstrument`: `items`, `options` with `excludeFromTotal` for ratings such as "not known", `maxMissingItems`, `bands` and `bandSource`), `value` / `defaultValue` / `onChange`, `onSubmit`, `allowIncompleteSubmit`, `context` (rating period), `showMissing`, `submitLabel`, `totalLabel`, `headingLevel`, `disabled`.

```tsx
<MeasureForm instrument={host.instruments.honos} context="Rating period: the last 2 weeks"
  value={answers} onChange={setAnswers} onSubmit={(a, score) => save(a)} />
```

Instrument wording is licensed content held in the host's configuration; it is never built into the control. Previews and tests use placeholders such as "Item 1".

- `totalPending` [suggested]: when the host's engine scores the answers on save (for example the host's rules on the server, which may prorate), these words show in place of a total and the form never blocks saving on its own count; items not answered are still listed.

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Items, options and scoring come from the definition; one grid for any instrument (HoNOS shape 0 to 4 plus 9 not known; K10 shape 1 to 5) [suggested].
- The total counts only what the definition counts; "not known" is excluded; the total is partial within the host's missing threshold and not valid above it, with the reason in words; saving is blocked while not valid unless the host allows an incomplete collection [suggested].
- The band is shown as the host's non-directive words with its source; no diagnosis or risk decision [suggested].
- CNA-1490, CNA-1500 [M]: the total is read-only bold text through `noting/CalculatedValue`; CNA-1640 [M]: a partial total is always labelled; CNA-1520, CNA-1660: the details dialog lists each item's value.
- CNA-1160 to CNA-1240 [M]/[R]: items not answered are shaded with an icon and screen reader text, and listed with links in `noting/MissedRequiredFieldsPanel` once the user tries to save.
- Keyboard [suggested]: each item is a radio group (Left and Right along the row), Up and Down move to the same column in the next or previous item, Tab moves between items.
- Below 600px each item stacks with its options as labelled chips of at least 44px; the header row is hidden and every option keeps its words [suggested].

## Do and don't

- Do take the definition from the host version in force at the collection date.
- Don't show the total as a judgement; show the band words and source.

## Accessibility

- Each row is a `radiogroup` named by the item, `aria-required`, and `aria-invalid` when flagged; every radio has its option label (and description) as its name, visible on narrow screens; progress is a polite live region; a blocked save raises a `shell/Message` alert. The rating grid keeps native radios in a grid of its own (forms/RadioGroup is one field per group and cannot share columns across items); each cell is the whole labelled target (`data-touch-target`, 44px on coarse pointers).

## Regional behaviour

- None in the control; instruments and protocols differ by jurisdiction and come from the host.
