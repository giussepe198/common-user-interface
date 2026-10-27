# InformationWindow

Non-modal window that explains a decision support recommendation or alert: summary, details, preference-ordered actions, "Record Response" and "Dismiss".

## When to use

- Opened from a preference icon in a choice list (variant "explanation"), or to show a single alert outside the alert container (variant "alert").

## What you provide

- `summaries` (text with record links, and the catalogue `source`), `details`, `actions` (same shape as `AlertItem` actions), `onRecordResponse`, `onDismiss`.
- Size: `width` (default 420), `height` (default fits the content), `minWidth`/`minHeight` (320 x 200), `maxWidth`/`maxHeight` (1200 x 900 [suggested]), `onResize(size)`, `resizable`.

```tsx
<InformationWindow
  summaries={[{ text: <>Interaction with <a href="#meds">Furosemide</a></>, source: 'Drug Interaction Checking' }]}
  actions={[{ id: 'a', label: 'Reduce dose', preference: 5 }]}
  onRecordResponse={r => record(r)}
  onDismiss={close}
/>
```

## Guidance implemented

- 2.2: header, Summary and Details tabs with Summary selected and on the left; icon left of the summary; source in brackets; "Details…" link; Actions label with chevron, collapsed by default, hidden when there are none; actions most preferred first with a preference icon on the left and option buttons, sub-options as checkboxes ("and") or option buttons ("or"); "Record Response" then "Dismiss", always enabled; resize grip bottom right; fixed minimum size.
- 2.3: header "Explanation"; several summaries for one option share one window, actions consolidated.
- 2.4: alert variant header shows status, date and 24-hour time.
- 2.2 resizing control at the bottom right, dragged with a pointer; the fixed minimum size is kept.
- [suggested] Esc dismisses. The resize grip is also a keyboard control: arrow keys change the size in 16 px steps (Shift: 64 px), Home returns to the minimum size, and the new size is announced.

## Do and don't

- Do link words derived from patient items to the item in its original context.
- Don't split summaries for one option across windows.
- Don't make it modal.

## Accessibility

- `role="dialog"` with `aria-modal="false"`, labelled by its header; focus moves to it on open (`autoFocus`).
- Tabs follow the tabs pattern (Left and Right arrows). The preference icons carry their level as text with reasons in a tooltip shown on focus.
- The resize grip is a button named "Resize window" (role description "resize handle") with its keys in a description: Left and Right change the width, Up and Down the height, Shift for larger steps, Home for the smallest size. Each change is announced in a polite live region ("Window 436 by 300 pixels"). It sits before Record Response in the Tab order so those two stay the last controls.

## Regional behaviour

No differences between GB, AU and NZ; G10 and G11 have no decision support display rules.
