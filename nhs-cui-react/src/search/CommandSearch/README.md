# CommandSearch

A command-style search panel for a whole application: one box, results grouped by source (screens, actions, people, this record), keyboard first, opening below the top bar and the patient banner.

## When to use

- Global search from the top bar, opened by a button, Ctrl K (Cmd K) or "/".
- Not inside a form: use SmartLookup to pick a value.

## What you provide

```tsx
<CommandSearch
  sources={[
    { id: 'screens', label: 'Screens', search: q => screensMatching(q) },
    { id: 'people', label: 'People', minChars: 2, debounceMs: 300, hint: 'Type 2 letters or a record number', search: (q, { signal }) => findPeople(q, signal), initial: ({ signal }) => recentPeople(signal) },
  ]}
  onSelect={(item) => { close(); go(item.href); }}
  onClose={close}
  getTop={() => bottomOfTopBarAndBanner()}
/>
```

- Sources are searched as the text changes, each on its own clock; a server source sets `debounceMs` and receives an AbortSignal; `initial` gives what shows while the box is empty.
- Items: `label`, a `description` second line, and optionally `matchRanges`, `matchNote` and `warning`.
- `getTop` returns where the panel starts so it never covers the patient banner; it is read again on scroll and resize.

## Guidance implemented

- [suggested] A non-modal panel: no scrim and no focus trap; Escape, Close, a click outside or focus leaving closes it. It never covers the patient banner (banner guidance: the banner is always visible while a patient's record is open).
- [suggested] Results grouped under headings, arrow keys across groups, Page Up and Page Down between groups, Enter opens; the count is announced politely.
- [suggested] Under 600px wide it fills the screen below the top bar and the banner; options are at least 44px on a coarse pointer.
- Close matches say why; look-alike warnings carry a symbol and words (PAL-0560).

## Do and don't

- Do gate each source by what the user may do: a source the user cannot use is not given.
- Don't show clinical detail (alerts, risk, legal words) in results; identify only.

## Accessibility

A non-modal dialog named by `label`, holding an ARIA 1.2 combobox that controls a grouped listbox; group headings label their groups; the active option is announced through aria-activedescendant; a polite live region says how many results there are.
