# NhsNumberDisplay

Shows an NHS Number as "999 999 9999" on a single line, with an optional label.

## When to use

- Anywhere an NHS Number is displayed: banners, lists, letters on screen, search results.

## What you provide

- `value` (digits, with or without spaces), optional `label` ("NHS No." in banners), `definition`, `onOpenRecord`.

```tsx
<NhsNumberDisplay value="9990000018" />              // 999 000 0018
<NhsNumberDisplay label="NHS No." value={null} />   // NHS No. Not Known
```

## Guidance implemented

- NUM-0001 [M]: in full, on one line, never wrapped or truncated (`white-space: nowrap`).
- NUM-0002 [M]: three groups of 3, 3 and 4 digits separated by single spaces.
- NUM-0003 [R]: plain selectable text, so copy and paste works.
- PAB-0019 [M]: a missing number shows "Not Known", never "?".
- PAB-0036, MPB-0035 [M]: pass `label="NHS No."` in banners.
- [suggested] A value that is not exactly ten digits, or that fails the Modulus 11 check, is shown exactly as supplied with a warning icon and "not a valid NHS Number". It is never partly grouped, which could make it look valid. Turn off with `flagInvalid={false}`.

## Do and don't

- Do store and pass the full ten digits.
- Don't format with hyphens, slashes or full stops.
- Don't put the number where it can wrap onto two lines.

## Accessibility

- Grouping helps screen readers read the number as three short groups rather than one large number.
- The validity warning is text, not colour alone.

## Regional behaviour

- GB only. In AU use `IhiDisplay`, `MedicareNumberDisplay` or `PatientIdentifierDisplay`; in NZ use `NhiDisplay`. The banners choose automatically (G10 1.6, G11 12.6).
