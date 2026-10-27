# EthnicityInput

The New Zealand standard ethnicity question (HISO 10001:2017) with multiple selection, a visible "Other" entry with an optional classification lookup, and the two "nothing entered" responses.

## When to use

- Registration forms in NZ mode. Ethnicity is self-identified: ask the person, never guess.

## What you provide

- `value`/`onChange` or `defaultValue`: `{ entries: [{ code, label }], otherText }` in the order recorded.
- `classification(query)`: lookup in the Stats NZ classification for "Other" (level 4 codes); the control makes no network calls.
- `version` ("written" or "verbal"), `otherLabel`, `purpose`, `error`.

```tsx
<EthnicityInput value={eth} onChange={setEth} classification={(q) => lookupEthnicity(q)} />
```

## Guidance implemented

- HISO 10001 [M]: question "Which ethnic group do you belong to?", instruction "Mark the space or spaces that apply to you.", options exactly and in order, vertical layout, nothing added.
- [M] Multiple selection with a control per option; the order recorded is kept.
- [M] "Other" has a visible entry area accepting one or more groups; the lookup offers coded suggestions but never restricts what is typed.
- [M] If nothing is entered, the person is prompted and offered "I don't know my ethnicity" (94444) and "I do not want to state my ethnicity" (95555).
- [M] No principal or main ethnicity is asked for or recorded.
- [M] Up to six level 4 codes are stored; more than six shows a notice that the Stats NZ reduction process applies (never random). `ethnicityNeedsReduction` reports it; the control never drops responses.
- Verbal version: the last item reads "Another ethnic group".
- [UNCERTAIN, configurable] The "Other" line wording (HISO extract vs Census form; default "Other such as Dutch, Japanese, Tokelauan. Please state:") and the level 4 codes of the tick-box options (`NZ_ETHNICITY_QUESTION`): confirm in Ariā.
- Not built: the Stats NZ reduction process itself (HISO 10001 Appendix A).

## Do and don't

- Do explain why the question is asked (`purpose`).
- Don't correct, limit or pre-fill responses.

## Accessibility

- `fieldset`/`legend`; the "Other" box is a combobox when a lookup is supplied (arrow keys, Enter, Esc); added groups have "Remove" buttons with accessible names; status messages use `role="status"`.

## Regional behaviour

- NZ only. AU uses `IndigenousStatusInput`. Source: https://tewhatuora.govt.nz/assets/Our-health-system/Digital-health/Health-information-standards/HISO-10001-2017-Ethnicity-Data-Protocols.pdf
