# MedicationActionSummaryDialog

Lists the selected medications in full before an action on more than one of them is completed, so selections scrolled out of view are not forgotten.

## When to use

- Before suspending, discontinuing, verifying or otherwise acting on two or more medications from a MedicationsList. MedicationsList opens it automatically when `contextActions` and `onAction` are used.
- Not needed for a single medication.

## What you provide

```tsx
<MedicationActionSummaryDialog
  actionLabel="Discontinue"
  confirmVariant="danger"
  medications={selectedRecords}
  onConfirm={() => discontinue(selectedRecords)}
  onCancel={close}
/>
```

`title`, `confirmLabel`, `description`, `inline` (no backdrop, for side panels) and `region` are optional.

## Guidance implemented

- MEDv-203 [M]: action on more than one medication shows a summary of the selected medications before completing.
- MEDi-012, MEDi-025 [M]: each medication shown as a full MedicationLine with its status, never truncated; the list scrolls instead.
- MEDv-042 [M]: status bold, with suspended date.
- [suggested] Title and confirm button state the action and the count ("Discontinue 3 medications"). Focus starts on Cancel, never on the confirming action (as MSP-2300 for Authorise). Danger style for destructive actions.

## Do and don't

- Do pass the same records the action will apply to.
- Don't add a "don't ask again" option: the summary is mandatory.

## Accessibility

- `role="dialog"`, `aria-modal`, labelled by the heading and described by the count text; Tab stays inside; Esc and the backdrop cancel; focus returns to where it was.
- The list is focusable so it can be scrolled by keyboard.

## Regional behaviour

- Medication lines follow the region (AU ACSQHC rules, NZ HQSC rules, GB unchanged). Wording is the same in all regions.
