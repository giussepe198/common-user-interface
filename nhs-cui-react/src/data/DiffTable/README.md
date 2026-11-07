# DiffTable

Two or more versions of a record side by side, field by field, with every change marked in words and an icon.

## When to use

Use it to show what an amendment changed (before and after), the history of a field, or two records being compared for a merge. The comparison only shows; the decision (for example which value to keep in a merge) is made elsewhere, by a person.

## What you provide

```tsx
<DiffTable
  caption="What changed in the amendment of 29-Sep-2026"
  versions={[{ id: 'before', label: 'Before' }, { id: 'after', label: 'After (amended 29-Sep-2026 10:14)' }]}
  rows={[
    { id: 'time', label: 'Appointment time', values: ['10:00', '10:30'] },
    { id: 'interp', label: 'Interpreter', values: [null, 'Arabic'] },
  ]}
  changedOnly
/>
```

`changed` is worked out from string and number values; pass it for richer content. `status` replaces "Changed" or "Same" with your words ("Different: choose"). `labels` and `unknownText` change the fixed words.

## Guidance implemented

- Changed rows say "Changed" with an icon, and each changed later value is highlighted, bold and preceded by an edit icon read as "Changed:", so colour is never the only cue [suggested].
- Earlier values stay readable and are never struck out (records are amended, never deleted) [suggested].
- A missing value is written in words ("Not recorded"), never blank (PAB-0019 applied).
- A summary "2 of 3 fields changed" above the table [suggested].
- Below 520px each field becomes a card with every value labelled by its version.

## Regional behaviour

None.

## Do and don't

- Do put the date and time of each version in its label, formatted with the core formatters.
- Do use `changedOnly` for an amendment and all rows for a merge comparison.
- Don't strike out or hide the earlier value.

## Accessibility

A real table with a caption, row headers for fields and column headers for versions, described by the change summary. In the narrow layout the column headings are shown before each value through `data-label`.
