# IhiDisplay

Read-only display of an Australian Individual Healthcare Identifier in 4-4-4-4 groups, with its HI Service status shown in words.

## When to use

- In banners, headers and summaries wherever an IHI is shown (G10 1.1). The patient banner uses it through `PatientIdentifierDisplay`.

## What you provide

- `value`, optional `label` ("IHI" in banners), `numberStatus` (Active, Deceased, Retired, Expired, Resolved), `recordStatus` (Verified, Unverified, Provisional), `flagInvalid`, `onOpenRecord`.

```tsx
<IhiDisplay label="IHI" value="8003601234567894" recordStatus="Unverified" />
```

## Guidance implemented

- G10 1.1 [M]: 16 digits; shown "8003 6012 3456 7894" ([UNCERTAIN] grouping, configurable with `groups`).
- AU-ID-01 [M]: a number status other than Active or a record status other than Verified is shown as text, e.g. "(Unverified)", never by colour alone.
- G10 1.6 [M]: never an unlabelled number in a banner (pass `label`).
- PAB-0019 [M]: missing value shows "Not Known".
- [suggested] A value that fails the prefix or Luhn check is shown exactly as supplied with "not a valid IHI", never partially grouped.

## Do and don't

- Do pass both statuses from the HI Service so qualifiers are accurate.
- Don't hide an unverified status to save space.

## Accessibility

- Status and warnings are text; the warning icon is decorative.
- The number stays on one line and can be selected for copying.

## Regional behaviour

- AU only. GB shows the NHS Number (`NhsNumberDisplay`); NZ shows the NHI (`NhiDisplay`).
- Source: https://hl7.org.au/fhir/2018Mar/CodeSystem-ihi-status.html
