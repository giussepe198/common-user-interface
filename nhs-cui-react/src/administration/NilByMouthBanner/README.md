# NilByMouthBanner

Notification that the patient is Nil by Mouth, shown across the top of the drug administration view.

## When to use

- Below the column headings and above the medication lines while the patient is Nil by Mouth.
- Set `active={false}` (or omit it from the tree) when not Nil by Mouth; it then takes no space.

## What you provide

- Optional `since`, `until`, `reason` and `actions`.

```tsx
<NilByMouthBanner since={nbmStart} reason="For theatre this afternoon" />
```

## Guidance implemented

- MEDa-0163 [M]: notification across the top, below the headings, space reclaimed when not Nil by Mouth.
- MEDa-0164 [M]: informational only; it never disables recording for oral drugs (the recording form shows the reminder instead).
- Warning symbol drawn per CUI alert symbol guidance (#ffcc33 fill, black border and pictogram).

## Do and don't

- Do pair it with `nilByMouth` on the recording form so oral drugs show the reminder.
- Don't use it to block or hide oral drugs.
- [suggested] `until` and `actions` are additions.

## Accessibility

- `role="status"` so the change is announced; text "Nil by mouth" accompanies the symbol.

## Regional behaviour

No differences between GB, AU and NZ: the decision support and Nil by Mouth guidance has no AU or NZ counterpart in G10 or G11. Dates and times use the shared formats.
