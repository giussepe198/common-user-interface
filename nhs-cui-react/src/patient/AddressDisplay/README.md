# AddressDisplay

Shows a postal address either one element per line or on one line separated by ", ", without element labels.

## When to use

- Read-only display of a patient's or contact's address, including inside the patient banners.

## What you provide

- `address` (`{ lines, town, county, postcode, country }`), `orientation`, optional `maxLength` or `singleLine` for truncation, `typeLabel`, `onViewAll`.

```tsx
<AddressDisplay
  address={{ lines: ['18 Orchard Cottage', "King's Road"], town: 'Ipswich', county: 'Northshire', postcode: 'ns338kr' }}
  typeLabel="Usual address"
/>
```

## Guidance implemented

- ADR-0001 [M]: horizontal elements separated by exactly ", ".
- ADR-0002, ADR-0003 [R]: vertical, left-aligned, no commas at line ends.
- ADR-0004 [R]: `maxLength` cuts with "..." and keeps the full address in a tooltip and for screen readers; `singleLine` uses a CSS ellipsis.
- ADR-0005 [R]: wrapping happens only between elements.
- ADR-0006 [R]: empty elements are left out entirely, with no ", ," sequences.
- ADR-0007 [M]: postcode in capitals with one space ("NS33 8KR").
- ADR-0008 [R]: no labels on individual elements.
- PAB-0027, MPB-0029 [M]: `typeLabel` such as "Usual address" or "Temporary address".
- PAB QIG, MPB-0030: `onViewAll` adds "View all addresses".
- PAB-0019: no address shows "Not Known" [suggested for use outside banners].
- HISO 10046:2024 3.9 [M]: `addressProtected` (address protected flag = 1). Default "masked": "Address protected" with no address text and no "View all addresses"; with `onRevealProtected` a "Show address" button asks for a reason first [suggested]. `protectedDisplay="indicator"` shows the address with the marker.

## Do and don't

- Do store each element separately.
- Don't add "Town:" or "Postcode:" labels.

## Accessibility

- Truncated addresses keep the full text available to screen readers.
- Without element labels, screen readers read the address naturally.

## Regional behaviour

- GB: unchanged (ADR rules).
- AU (Australia Post): unit before the street line ("Unit 2, 54 Stockton Rd", AU-AD-01 prose form), then "LOCALITY STATE POSTCODE" in upper case on one line ("BUNBURY WA 6230"); no punctuation on the last line. The country is shown only when it is not Australia.
- NZ (NZ Post): building name, street line, suburb or "RD n" (normalised from "R.D.2"), then "Town Postcode" on one line ("Rangiora 7472"); macrons kept. The country is shown only when it is not New Zealand.
- `noFixedAddress` (prop, or `address.noFixedAddress`) shows "No fixed address" (AU-AD-03; NZ [suggested]).
- From an `AddressInput` value, use `addressInputToValue(value, region)`.
- Sources: https://auspost.com.au/content/dam/auspost_corp/media/documents/correct-addressing.pdf ; https://nzpost.co.nz/business/shipping-in-nz/addressing-standards
- NZ address protected flag: HISO 10046 3.9 (G12 section 3). The standard defines the flag, not the display.
