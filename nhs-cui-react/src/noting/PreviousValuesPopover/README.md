# PreviousValuesPopover

A small floating panel above a numeric field that shows the most recent previous values, with dates, while the field has focus.

## When to use
- Numeric entry fields where recent values help (blood pressure, weight, temperature). Not for non-numeric data (the guidance has not tested it).

## What you provide
- The input as the only child; `values` (`value`, `recordedAt`); `unit`; `maxCount` agreed with your clinical authority; optional `decimals`, `placement`, `onOpenHistory`.

```tsx
<PreviousValuesPopover unit="mmHg" maxCount={3} values={history}>
  <input inputMode="numeric" />
</PreviousValuesPopover>
```

## Guidance implemented
- CNA-1260 [R] shown when the field gains focus; CNA-1270 [R] nothing shown when there are no values; CNA-1280 [R] stays while typing; CNA-1290 [R] floating over the form while focus is in the field.
- CNA-1300 [R] limited to an agreed number (default 3, as in the illustrations).
- CNA-1310 [R] vertical stack; CNA-1320 [R] immediately above the field; CNA-1330 [R] left-aligned with the field's digits; CNA-1370 [R] values at the far left.
- CNA-1340 [R] values in bold; CNA-1350 [R] consistent decimal places (`decimals`); CNA-1360 [R] consistent order; CNA-1390 [R] ascending value when above the field; CNA-1400 [R] `placement="beside"` when there is no room above (most recent first).
- CNA-1410 [R] titled "Previous values"; CNA-1420/1430 [R] pale, low-saturation background different from the field.
- CNA-1440 [M] date for every value; CNA-1450 [M] time (24-hour) when two shown values share a day; CNA-1460/1470 [R] unit once, next to the title.
- Access to a graphical or historical view through `onOpenHistory` [suggested from the research conclusion].

## Do and don't
- Do let the clinical authority set `maxCount` and keep it the same across the application.
- Don't use it for free text or coded answers.

## Accessibility
- The panel never takes focus by itself; the input's `aria-describedby` points at it, so screen readers hear the previous values with dates when the field is focused.
- Dates use the shared CUI formats (dd-Mmm-yyyy, HH:mm).
