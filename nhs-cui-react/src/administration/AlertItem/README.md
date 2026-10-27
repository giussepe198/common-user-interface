# AlertItem

One decision support alert with its header (status, date and time), Summary and Details tabs, recommended actions with preference icons, override with reason, and Record response and Dismiss buttons.

## When to use

- Inside `AlertContainer`. Use it alone only when showing a single alert in context.

## What you provide

- `alert`: status, occurredAt, summary (link record items to their original context), source, details, actions with `preference` 1 to 5 and `reasons`.
- Optional `onRecordResponse(response)`, `onDismiss`, `expanded` or `defaultExpanded`.

```tsx
<AlertItem
  alert={{ id: 'a1', status: 'High Priority', occurredAt: at, source: 'Drug Interaction Checking',
    summary: <>Possible interaction with <a href="#meds">Furosemide</a></>,
    actions: [{ id: 'r1', label: 'Reduce dose', preference: 5, reasons: ['Interaction with Furosemide'] }] }}
  onRecordResponse={r => record(r)}
  onDismiss={dismiss}
/>
```

## Guidance implemented

- 2.4: header shows status, date and time and toggles the alert; High Priority expanded by default, Priority collapsed.
- 2.2: "Summary" tab selected by default, left of "Details"; summary with icon on the left, source in brackets below, then a "Details…" link to the same content as the Details tab.
- 2.2: "Actions" with chevron, collapsed by default and hidden entirely when there are none; actions in order of preference with a preference icon on the left, chosen with option buttons; sub-options as checkboxes ("and") or option buttons ("or").
- 2.2: "Record response" then "Dismiss", both always enabled.
- 2.2: Details area with summary, patient-specific information, rationale and references.
- 2.3: five distinct preference levels; tooltip gives the reason, or a bulleted list for several reasons; icon placed left of the option.
- Key principles: the user can override any alert. Override requires a reason [suggested].

## Do and don't

- Do hyperlink record items in the summary to their original context.
- Don't hide High Priority alerts collapsed by default.
- [suggested] Button labels use sentence case ("Record response"); the guidance shows "Record Response". Preference level wording other than "High preference option" is [suggested].

## Accessibility

- Tabs follow the ARIA tabs pattern (Left and Right arrows); actions are a labelled radio group.
- Preference icons are focusable with a text label; the reasons tooltip shows on hover and focus and is linked with `aria-describedby`.
- The override reason error is announced and linked to its field.

## Regional behaviour

No differences between GB, AU and NZ: the decision support and Nil by Mouth guidance has no AU or NZ counterpart in G10 or G11. Dates and times use the shared formats.
