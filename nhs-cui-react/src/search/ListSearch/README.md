# ListSearch

The search box of a list: words in any order, close spellings, similar-sounding names, identifiers and dates, with fields chosen as scopes, the result count in words and help when nothing matches. DataTable and PatientList draw it for you.

## When to use

- Any list of eight rows or more: DataTable and PatientList show it by default (`search="auto"`), so a list gets it without code.
- Use `ListSearch` with `useListSearch` directly only for a list drawn some other way.
- Not for finding a person in the whole organisation: use the host's person search, which is audited and governed.

## What you provide

```tsx
<DataTable caption="Referrals" rowNoun="referrals" columns={columns} rows={rows} getRowKey={r => r.id}
  // a hidden column the search still reads, and how it compares
  // columns: { id: 'reference', title: 'Reference', searchable: true, searchKind: 'identifier' }
  searchFields={[{ key: 'otherNames', label: 'Other names', kind: 'name', get: r => r.aliases }]}
  searchQuery={q} onSearchQueryChange={setQ} />
```

- Columns: shown columns are searched unless `searchable: false`; hidden columns only with `searchable: true`. `searchKind` sets how values compare ('name' adds sounds-alike, 'identifier' exact or by its start, 'date' as dates); `searchValue` gives text for a cell whose value is an object.
- `searchQuery` and `onSearchQueryChange` let the host keep the text, for example in the address. Never put a search for people in an address or in browser storage: a PatientList keeps it in component state.

## Guidance implemented

- [suggested] Words match at their start in any order ("smi jo" finds "SMITH, John"); case, accents and macrons are ignored ("maori" finds "Māori", NZ 2.3 and 11.1 macron-insensitive search).
- [suggested] Close spellings are allowed by word length (one edit from 4 letters, two from 7); names also match by sound, with the same phonetic rule as the similar-name warning (PAL-0560). Identifiers never match by a close spelling.
- [suggested] Dates are read in the CUI form ("12-Mar-1980", G-date display), ISO and day first ("12/3/80"); "born:1980" limits to the date of birth.
- [suggested] Matches as typed come first, close matches last, each close match says why ("Sounds like", "Close spelling of") under the row's key cell, and matched words are marked with weight, never colour alone.
- [suggested] The count is in words and announced politely ("3 of 40 referrals match"); with no matches, the closest queries that find something are offered with their counts, and "Show all <rows>".
- FSG: the search runs before the filter, so the filter notification counts what the search found (FSG-0065..0068).

## Do and don't

- Do give each list a `rowNoun` so the words read naturally.
- Do declare hidden identifiers and other names as searchable so people find what they know.
- Don't use it for server-paged lists without saying so: with `processing="server"` it searches only the rows given and shows only when `search` is true.

## Accessibility

A search landmark named "Search <list>", a labelled search box with its clear button, a "Search in" menu button, scope chips that are buttons named "Remove <field>: <value>", a polite live region for the count, and suggestions as buttons that say what they search for.
