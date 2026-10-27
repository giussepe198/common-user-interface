# AddressInput

Structured address entry: a UK form (Line 1-3, Town/City, County, Postcode) with optional postcode lookup and address finder supplied by your application, and a non-UK form.

## When to use

- Recording a patient's or contact's address.
- Supply `onFindPostcode` or `onFindAddress` only if your organisation has a postcode lookup service (ADR-0014, ADR-0033).

## What you provide

- `value`/`onChange` or `defaultValue` (`{ line1, line2, line3, line4, town, county, postcode, country }`).
- `onFindPostcode(address)` and `onFindAddress({ buildingNumber, buildingName, postcode })`: functions that return (or resolve to) a list of `{ label?, address }` results. The control makes no network calls itself.
- `allowNonUk`, `countries`, `placeholders`, `tooltips`, `legend`.

```tsx
<AddressInput
  value={address}
  onChange={setAddress}
  onFindPostcode={(a) => myLookupService.findPostcode(a)}
  onFindAddress={(q) => myLookupService.findAddresses(q)}
  placeholders={{ town: 'e.g. Ipswich', county: 'e.g. Northshire' }}
/>
```

## Guidance implemented

- ADR-0011, ADR-0012 [R/M]: UK boxes in the order Line 1, Line 2, Line 3, Town/City, County, Postcode with those labels.
- ADR-0013, ADR-0014 [R]: "Find Postcode" after the postcode box, only when a lookup is supplied, enabled once a street line and Town/City are entered.
- ADR-0015, ADR-0034 [M]: postcode boxes 8 characters.
- ADR-0016 [R]: County box 18 characters.
- ADR-0017..0019, ADR-0035..0037, ADR-0052..0054 [R]: single-line boxes stacked and left-aligned, labels immediately to the left and right-aligned to each other; boxes are different widths.
- ADR-0020, ADR-0038, ADR-0055 [R]: standard text inputs accept keyboard, paste and handwriting input.
- ADR-0021 [R]: UK boxes accept only A-Z, a-z, 0-9, space and . / , : ' -. Other characters are removed and a note says why.
- ADR-0031..0033 [R/M]: address finder with "House/Building Number" (6 characters), "House/Building Name", "Postcode" and "Find Address" after the postcode, enabled once a postcode is entered.
- ADR-0050, ADR-0051 [R/M]: non-UK form: Country first, Line 1-4, Town/City, Postal Code.
- ADR-0056..0059 [R/M]: Country is an editable combo box (type or pick) listing ISO 3166-1 names alphabetically.
- ADR-0007: postcodes are upper-cased and spaced when the box is left [suggested timing]. Partial postcodes are allowed.

Where the source documents disagree (the safer option is used):

- The QIG draws "Town / City" and "House / Building Number" with spaces; the full guide's "Town/City" and "House/Building Number" are used.
- The QIG shows "Find Postcode" on the non-UK form; the full guide does not, so it is not shown there.

[suggested] additions:

- The checkbox "Address outside the UK" switches between the UK and non-UK forms. Switching clears the fields the other form does not show (County, or Line 4 and Country), so no hidden data is saved.
- Lookup results appear as a list of buttons (arrow keys move, Esc closes) with a status message ("2 addresses found", "No addresses found"). If the lookup fails, a message asks the user to type the address.
- Country names are plain ASCII ISO 3166-1 short names ("Aland Islands", "Cote d'Ivoire").

## Do and don't

- Do let users type the address by hand even when a lookup is available.
- Don't require a house number: names such as "The Old Mill House" are valid.
- Don't put Postcode before County, or use one free-text box for the whole address.

## Accessibility

- `fieldset` with `legend`; each box has a visible `<label for>`.
- Lookup status uses `role="status"`; lookup failures use `role="alert"`.
- Focus moves to the first result after a search, and to Line 1 after a result is chosen.

## Regional behaviour

- GB: unchanged.
- AU: "Unit, flat or level", "Street address", "Address line 2", "Suburb or town", "State or territory" (select: ACT, NSW, NT, QLD, SA, TAS, VIC, WA) and a 4-digit "Postcode" kept as a string. "2/14 Smith Street" is split into unit "Unit 2" and street on leaving the field (AU-AD-01; "Unit" assumed [suggested]). A postcode and state mismatch shows a warning, never a block (AU-AD-02); the ranges are [UNCERTAIN] data in `AU_POSTCODE_RANGES` and `AU_POSTCODE_STATE_EXCEPTIONS`.
- NZ: "Building name", "Street address", "Suburb or RD" (normalised to "RD 2"), "Town or city" and a 4-digit "Postcode" (HISO 10046, NZ Post). Macrons are accepted everywhere.
- AU and NZ: "No fixed address" (AU-AD-03) and an "Address outside Australia/New Zealand" form. `onSearchAddress(query)` connects your G-NAF or NZ Post look-up; the chosen result's `addressId` (G-NAF PID or delivery point ID) is kept, and every field stays editable for free-text override (G10 6.4, G11 5.3).
- The UK character filter (ADR-0021) applies only to GB addresses.
- `addressInputToValue(value, region)` converts the input value to the `AddressValue` that `AddressDisplay`, `PatientBanner` (`address`), `MicroPatientBanner` and `formatAddress` take, for GB, AU and NZ. "No fixed address" is carried through; `addressId` is not part of the display value.

```tsx
<PatientBanner address={{ type: 'Usual address', ...addressInputToValue(addr, region) }} ... />
```
- Not built: NZ address type (M/R), protected, permanent and primary flags (HISO 10046); AU structured flat and level types (AS 4590, [UNCERTAIN]).
