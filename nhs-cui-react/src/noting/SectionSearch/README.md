# SectionSearch

Experimental. Insert sections into a note in any order, found by heading, synonym or abbreviation.

## When to use
- Building an admission note incrementally (Noting Using Templates, Theme 2). Design points from a consultation, not numbered guidance.

## What you provide
- `sections` (title, path of headings above it, synonyms, abbreviations, additional), `onInsert(section, info)`.
- Optional `openIds` (sections already in the note), `defaultOpen`, `shortcut` (default Ctrl+Shift+H [suggested]; `null` to turn off), `label`, `minChars`.

```tsx
<SectionSearch sections={sections} openIds={open} onInsert={(s, info) => insert(s, info)} />
```

## Guidance implemented
- Theme 2: opened from a button or a key combination; results below the field ordered by word similarity, with synonyms; closes on choosing, clicking away or Escape; labels are breadcrumbs ("Observations and findings > Vital signs").
- Theme 3: core and additional sections in one list without bias; additional ones marked "opens separately".
- Theme 4: abbreviations ("PMH") placed first.
- Theme 8: never two instances of a section: choosing an open section reports `moved: true` so you move its data and remove the old instance; choosing a super-section reports open sub-sections in `absorbedIds`; a status message explains what happened.

## Do and don't
- Do open the search by default when the noting area is blank (`defaultOpen`).
- Don't insert sections inside sections unless the data structure allows it.

## Accessibility
- The button shows and announces its shortcut (`aria-keyshortcuts`); the field is a combobox with arrow-key navigation; outcomes are announced in a status region.
