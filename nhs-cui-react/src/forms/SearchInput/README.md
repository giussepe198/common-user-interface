# SearchInput

A search text box with a search icon and a clear button inside one box.

## When to use
- Filtering a list or table on the same screen, or running a search on Enter.
- For SNOMED CT use TerminologySearch; to choose one value from a list use Combobox.

## What you provide
- A FormField label, or `aria-label` when a visible heading already says what is searched. `value` and `onChange(value)` or `defaultValue`, `onSearch(value)` (Enter), `onClear()`, `clearLabel`, `widthChars`.

```tsx
<SearchInput aria-label="Search teams" onChange={setFilter} />
```

## Guidance implemented
- [suggested] The clear button appears only when there is text, sits inside the box and is named "Clear search"; Escape also clears.
- [suggested] The browser's own clear control is hidden so there is one, consistent clear button.
- CNA-2130..2160 [R] an in-field prompt stays on focus, goes when typing and carries no examples (consumer text).

## Regional behaviour
None.

## Do and don't
- Do announce result counts in the list or table the search filters.
- Don't hide the label when nothing else on screen says what is searched.

## Accessibility
- `input type="search"` (role searchbox) with a visible or `aria-label` name. The icon is decorative; the clear button is a real button.
- 44px high on coarse pointers.
