# MeasureProfile

Item profile bars for one or two collection occasions of an outcome measure, with each value in words and the change per item.

## When to use

- Reviewing a measure with the person: what changed item by item between admission and review, or at a single occasion.
- For totals over many occasions use `MeasureTrend`.

## What you provide

- `instrument` (the host definition), `occasions` (one or two `MeasureOccasion`: `label` in the host's words, `date`, `answers`), `caption`, `timeZone`, `region`.

```tsx
<MeasureProfile instrument={host.instruments.honos} occasions={[admission, review]} />
```

- `scores` [suggested]: the host engine's totals, one per occasion (`total` null when not valid, `text` saying why); they replace the totals worked out here so the screen shows one total everywhere.

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Item-level results for a collaborative review; the change per item and in total as words ("down 3"), never a judgement [suggested].
- "not known" and unanswered items show in words and are "Not comparable"; a partial total is labelled [suggested].
- GTAB-003, GTAB-160 pattern [suggested]: the two occasions differ by shape (outlined, solid) and by the column heading, not by colour alone; the values are always written beside the bars.
- Dates in the library's format; date-only values are not shifted by zone [suggested].
- Below 560px each item becomes a card with its values labelled from the column headings [suggested].

## Do and don't

- Do pass the occasions oldest first.
- Don't use the bars without the values; the control always shows both.

## Accessibility

- A real table with a caption, column and row headers; bars are decorative (`aria-hidden`); the values and change are text.

## Regional behaviour

- None; instruments come from the host.
