# SmartLookup

Pick one of many: the Combobox with the smart search, recent choices and a second line that tells look-alikes apart.

## When to use

- A field that picks one of many: a person, a practitioner, a team or service unit, an agency, a code from a code set, a medicine from a formulary.
- Keep a Select for a short fixed list (eight or fewer), and a RadioGroup for two to five choices shown at once.

## What you provide

```tsx
<FormField label="Key clinician">
  <SmartLookup options={clinicians} matchKind="name" recentOptions={recent} onChange={o => setClinician(o?.value ?? null)} />
</FormField>
<SmartLookup loadOptions={(q, { signal }) => searchPeople(q, signal)} matchKind="name" />
```

- `options` (static, ranked by the engine) or `loadOptions` (asynchronous, debounced, superseded requests aborted, the server's order kept).
- `matchKind`: 'name' for people (close spellings and similar sounds), 'text' for other names, 'code' for code sets (a code in the option value matches exactly or by its start).
- `recentOptions`: the user's recent choices, offered from the empty box. The library never stores them: the host does, and never stores identifiers of people in the browser.
- Each option's `description` is its second line; `warning` shows with the warning symbol (a look-alike name); `matchNote` and `matchRanges` are filled in by the engine.

## Guidance implemented

- Combobox rules (CNA-0090 busy delay, CNA-0340 no matches, ARIA 1.2 list autocomplete) are unchanged.
- [suggested] Ranking: as typed, within words, close spellings, similar sounds; each close match says why.
- [suggested] Look-alikes: a second line on every option, and the similar-name warning the host computes (PAL-0560; HAZ in the host).

## Do and don't

- Do give every option of a person its date of birth and record number on the second line.
- Don't put a person's identifiers in recent choices kept in browser storage.

## Accessibility

As Combobox: focus stays in the box, the active option is announced through aria-activedescendant, the count is announced politely, and "Recent" is a group heading. Warnings carry a symbol and words.
