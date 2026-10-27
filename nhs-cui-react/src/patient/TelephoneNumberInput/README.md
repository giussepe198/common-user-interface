# TelephoneNumberInput

A free-text telephone number box that accepts any formatting and tidies recognised numbers when the field is left, with optional separate extension box and country code selector.

## When to use

- Recording home, work, mobile or other numbers. One instance per number, with its own label.
- Use `assisted` when the user says the number is outside the UK.

## What you provide

- `label` (required), `value`/`onChange` or `defaultValue`, `onCommit(formatted, recognised)`.
- `extensionMode="separate"` with `extension`/`onExtensionChange` for a separate extension box.
- `assisted` with `country`/`onCountryChange` for the country code selector.

```tsx
<TelephoneNumberInput label="Home" value={home} onChange={setHome} onCommit={(f) => save(f)} />
<TelephoneNumberInput label="Work" extensionMode="separate" placeholder="e.g. 020 1234 5678" />
```

## Guidance implemented

- TID-0011, TID-0012 [M]: one free-text box that accepts formatted and unformatted entry; no separate area code box.
- TID-0013, TID-0014 [M]: when the field is left, a recognised number is replaced with the formatted value, spaces in the right places.
- TID-0015 [M]: an unrecognised value is left exactly as typed.
- TID-0016..0019 [M]: UK country codes are removed; other country codes are kept with "+".
- TID-0026, TID-0027 [R/M]: optional separate extension box, free text, labelled "Extension" above it.
- TID-0020 [M]: the selector starts at "+44 (UK)".
- TID-0021, TID-0022, TID-0025 [M/R]: list rows read "Country name +code (XX)", United Kingdom first and again in alphabetical order, "UK" not "GB".
- TID-0023, TID-0024 [R]: native drop-down with type-ahead by country name; the closed state shows only "+44 (UK)".
- Sizing: default width fits "020 1234 5678 x1234", minimum fits "01234 567890"; no maximum length.
- Default prompt "e.g. 01234 567890"; extension prompt "e.g. 1234".

Where the source documents are silent (the stricter option is used):

- Separators and international grouping follow `TelephoneNumberDisplay` (see its README).
- With the selector set to a non-UK country, a leading 0 typed in the number is dropped, because the optional trunk digit is omitted when the country code is shown.

[suggested] additions:

- `label` is required so every box has a visible label.
- The selector is a native `select` drawn as "+44 (UK)", so it keeps standard keyboard and screen reader behaviour; the guide prefers an editable combo box.

## Do and don't

- Do let users type numbers however they like.
- Don't add a separate area code box.
- Don't show UK numbers with "+44".

## Accessibility

- Visible labels above each box; the country selector has its own label "Country Code".
- Errors set `aria-invalid` and use `role="alert"`.
- `type="tel"` gives a phone keypad on touch devices.

## Regional behaviour

- GB: unchanged; no validation message.
- AU: accepts spaces, brackets, hyphens, "+61", "0061" or "0" (AU-PH-01); reformats recognised numbers on leaving the field; shows a warning when the number is not a valid Australian or international number (AU-PH-02). Placeholder "e.g. 0491 570 159".
- NZ: same behaviour with NZ formats and "+64"; placeholder "e.g. 021 123 4567".
- `onCommit(formatted, recognised, e164)` gives the E.164 value for storage ("+61491570159"; HISO 10046 stores no punctuation). `validate={false}` turns the AU/NZ warning off.
- In assisted mode the home country (UK, Australia or New Zealand) is the default and appears at the top of the list (TID-0022 applied per region).
