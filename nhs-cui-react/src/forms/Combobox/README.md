# Combobox

A text box with a popup list of options, filtered as the user types or loaded asynchronously (ARIA 1.2 combobox).

## When to use
- One choice from a long list (teams, clinicians, places), or a list that comes from a service.
- For SNOMED CT terms use TerminologySearch; for several choices use MultiSelect; for a short fixed list use Select or RadioGroup.

## What you provide
- Put it in a `FormField`. Either `options` (filtered locally) or `loadOptions(query, { signal })` (async). `value` (`FormOption | null`) and `onChange(option)` or `defaultValue`. Optional `minChars` (default 0 static, 2 async), `debounceMs` (200), `busyDelayMs` (1000), `noMatchesText`, `visibleRows`, `showToggle`, `name`.

```tsx
<FormField label="Team" required>
  <Combobox loadOptions={(q, { signal }) => api.teams(q, signal)} />
</FormField>
```

- [suggested] `filterOptions` replaces the matching of static options (SmartLookup passes the smart search);
  `recentOptions` are offered from the empty box under `recentLabel`; an option's `matchRanges`, `matchNote` and
  `warning` show the matched part, why a close match matched, and a look-alike warning with its symbol.

## Guidance implemented
- Matching 2.2.2 [R] progressive matching after a short pause (`debounceMs`); Matching 2.3.1 responses that arrive out of order are ignored and superseded requests aborted (same rule as TerminologySearch).
- CNA-0090 [R] the busy indicator shows only after a delay.
- CNA-0340 [R] a clear "No matches found" message.
- CNA-0550 [R] no drop-down button on an async search field (users clicked it instead of typing); static lists show a toggle button by default.
- [suggested] Matching ignores case and macrons (SCT-019 pattern, NZ); matches are highlighted in bold, never by colour alone.
- [suggested] Typing clears the chosen option; text that was not chosen is cleared when focus leaves (an exact label match is chosen), so the field never shows a value that was not selected.

## Regional behaviour
Macron-insensitive matching in every region; labels are displayed exactly as supplied (te reo Māori macrons are kept).

## Do and don't
- Do pass `signal` to your fetch so superseded requests stop.
- Don't use it for free text; values must come from the list.

## Accessibility
- `role="combobox"` with `aria-expanded`, `aria-controls`, `aria-autocomplete="list"` and `aria-activedescendant`; focus stays in the text box.
- Keys: Down and Up move (disabled options are skipped), Alt+Down opens without moving, Enter chooses, Escape closes and then clears, Tab leaves without choosing.
- The number of options and the chosen option are announced in a polite live region.
