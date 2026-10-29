# TemplateSearch

Experimental. Search for a clinical data-entry template by title, synonym, abbreviation or section heading.

## When to use
- Finding and opening a whole template (form) during clerking. Built from a design consultation (Noting Using Templates, 2009), not numbered guidance: every rule below is a design point.

## What you provide
- `templates` (title, synonyms, abbreviations, contexts, generic, suggested, additional, metadata, sections), `onSelect`.
- Optional `context` and `filterEnabled`/`onFilterEnabledChange`, `maxResults` (default 10 [suggested]), `match` (your own matcher), `minChars` (with `0` the box opens listing every template to browse, suggested first, filtered by context; `browseTemplates` is the same list).

```tsx
<TemplateSearch templates={templates} context="Cardiology" onSelect={openTemplate} />
```

## Guidance implemented
- Theme 1: progressive matching on phrase similarity with stem ("fuzzy") matching; search by section heading as well as title, title first; results filtered by context but generic templates kept; the filter is shown in its control and can be switched off; results ordered by similarity with a maximum and "Show more"; field above a vertical list; labels never truncated, wrapping with a hanging indent; metadata in a fly-out on hover and keyboard focus, in a consistent order, with matched words highlighted; suggested templates marked; synonyms matched; a "no matches" message with ways forward; the section structure can be expanded but only whole templates are chosen; section matches listed last.
- Theme 3: additional templates (scores, calculators) marked with an icon and "Opens separately".
- Theme 4: abbreviation matches first.

## Do and don't
- Do keep generic templates (general admission) available when filtering.
- Don't let users pick an individual section here: use `SectionSearch`.

## Accessibility
- Labelled field with a polite count; each title is a button described by its metadata; expand buttons use `aria-expanded`.
