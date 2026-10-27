# StatementList

**Experimental.** A list of clinical statements grouped under full pattern headings (one session) or in date order across sessions, with sticky headings and an option to highlight coded terms.

## When to use
- Admission clerking summaries (`grouping="pattern"`) and patient review across sessions (`grouping="chronological"`).

## What you provide
- `statements` (see `ClinicalStatement`), `grouping`, optional `session` (author, time, location shown once), `patternOrder`, `headings`, `banding`, `onAddEncoding`, `onEdit`.

```tsx
<StatementList statements={items} session={{ author: 'Dr B Sample', sessionTime: started, location: 'Acute medical unit' }} />
<StatementList statements={items} grouping="chronological" />
```

## Guidance implemented
- Headings group statements of the same pattern and carry the context, so it is not repeated per statement; full headings ("Past medical history"), never generic labels such as "Past".
- Headings stay in view while scrolling (sticky) so a statement cannot be read out of context.
- Author and session time shown once at the top in single-session views, and on a subsidiary line per statement in multi-session views.
- Mixed-pattern (chronological) lists show the context at the start of each statement.
- Dates in the left column; no more than two columns; banding in multi-line designs.
- Optional user control to highlight coded terms (useful for validation).
- Pattern order defaults to PMH, PSH, FH, MH, AAR, HCC, CM, SR [suggested].

## Do and don't
- Do keep each statement's date at the precision it was captured.
- Don't add extra columns for author or location; use the provenance line.

## Accessibility
- Each group is a `section` labelled by its heading; statements are list items.
- The highlight option is a labelled check box; highlighting adds a background, it does not replace the text cues.
