# AlertIndicator

Button showing whether there are unprompted decision support alerts for the patient and whether they have been viewed; it opens the alert container.

## When to use

- In the application or patient header, next to where the alert container opens.

## What you provide

- Either `state`, or `alerts` and `viewedIds` to derive it; `onClick`, `expanded`, optional `count` and `label`.

```tsx
<AlertIndicator alerts={alerts} viewedIds={viewed} expanded={open} onClick={() => setOpen(!open)} />
```

## Guidance implemented

- 2.4: five states: no active alerts; Priority not viewed; Priority all viewed; High Priority (with any Priority) not viewed; High Priority viewed.
- 2.4: clicking opens the alert container; new-alert pop-ups use `DecisionSupportChangeToast` near it.
- Exactly two alert levels, "Priority" and "High Priority" (1.3).
- [suggested] Symbols: bell (none), warning triangle (Priority), red circle (High Priority); a "New" badge for unviewed; the count beside the label.

## Do and don't

- Do mark alerts viewed when they are expanded (`AlertContainer` `onAlertExpanded`).
- Don't add more levels.

## Accessibility

- A button whose accessible name gives the label, count and state in words, for example "Alerts (3): High Priority alerts, not yet viewed"; `aria-expanded` reflects the container.
- Each state differs by symbol shape and text, not only colour.

## Regional behaviour

No differences between GB, AU and NZ.
