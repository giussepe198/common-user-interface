# SelectionTrail

The selections made so far (drug, route, form), each in its own text-box-like control, shown after the cascading lists.

## When to use

- After the last cascading list, above or beside template prescriptions or the required fields.

## What you provide

```tsx
<SelectionTrail
  items={[
    { id: 'drug', kind: 'Drug', label: <MedicationLine genericName="clarithromycin" />, text: 'clarithromycin' },
    { id: 'route', kind: 'Route', label: 'oral' },
  ]}
  onReopen={() => reopenCascade()}
/>
```

## Guidance implemented

- MSP-1060 [M]: each selection in its own control, not breadcrumb text such as "clarithromycin > oral".
- MSP-1080 [R]: activating any item calls `onReopen`; the consumer reopens all lists.
- MSP-1090, MSP-1100 [R]: the consumer hides an unused template list and restores the lists and search text exactly as they were.
- No back, forward or undo buttons; editing in place serves as undo.

## Do and don't

- Do pass `text` when `label` is not a string, for the accessible name.
- Don't show the trail before the cascade is complete.

## Accessibility

- A group of buttons named "Kind: value. Change"; Enter or Space reopens.

## Regional behaviour

- The control has no regional differences; pass a MedicationLine as `label` and the drug name follows the region.
