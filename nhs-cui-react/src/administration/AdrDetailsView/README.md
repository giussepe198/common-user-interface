# AdrDetailsView

Details of one adverse drug reaction entry, with Edit, Remove from list (confirmed) and the edit history.

## When to use

- When an entry in `AdrSummaryList` is opened. Edit opens `AdrRecordingDialog` in edit mode.

## What you provide

- `entry`, `onBack`, and optionally `onEdit`, `onRemove(reason)` and `history`.

```tsx
<AdrDetailsView entry={entry} history={history} onEdit={edit} onRemove={reason => remove(entry.id, reason)} onBack={back} />
```

## Guidance implemented

- RAD-0680 [M], 0680.1, 0680.2 [R]: "Remove from list" in the details view.
- RAD-0700 [R]: its explanation is a tooltip and an accessible description (states that a reason can be given and notes are kept).
- RAD-0750, 0750.1 [R], 0750.2, 0750.3 [M]: confirmation names the drug and the list, says notes remain and warnings stop; two buttons worded to match. RAD-0720 [R]: reason encouraged.
- RAD-0830.1, 0830.3 [R]: "Edit" in the details view.
- RAD-0890 [R]: edit history with dates, shown on request.
- A removed entry says when, by whom and why, and cannot be edited.

## Do and don't

- Do keep the clinical notes when an entry is removed; only the summary changes.
- Don't allow the causative agent to be edited; remove and add again.

## Accessibility

- Details are a description list; Esc goes back; Cancel in the confirmation returns focus to "Remove from list".
- The history toggle is a button with `aria-expanded`.

## Regional behaviour

- GB: CUI field labels.
- AU: "Medicine (or other)", "Reaction", plus Type and "Date of reaction" (AU-AL-03, G10 10).
- NZ: "Agent (medicine or substance)", "Reaction", plus "New this admission" (G11 9.2).
