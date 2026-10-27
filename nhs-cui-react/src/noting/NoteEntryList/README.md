# NoteEntryList

A list of coded note entries (for example past medical history or a problem list) built one entry at a time from a terminology search, with additional details summarised to the right of each entry and editing and deletion before the note is saved.

## When to use
- Semi-structured clinical noting where each line is one coded concept with optional dates and free text.

## What you provide
- `search` (same function as `TerminologySearch`), `instructionText`, optional `placeholder`, `helpText`, `heading`.
- `entries`/`onEntriesChange` (or `defaultEntries`). Each entry: `id`, `text` (what was typed), optional `concept`, `dateText`, `additionalText`, `qualifiers`.
- Optional `interpretDate(text)` returning the formal confirmation (overrides the built-in parser), `suggestQualifiers(entry)`, `readOnly`.
- Dates: by default the built-in natural-language parser (`NaturalDateInput`, `parseNaturalDuration`) reads the date field and stores the standard form in `entry.dateValue`. `referenceDate` and `birthDate` feed relative phrases; `showDateMenu` adds the date menu (CNA-0630).
- Attributes (CNA-0700): `showLaterality` (true, or a function per entry, e.g. paired body structures) stores `laterality` (`left`, `right`, `both`, `neither`); `showCurrentProblem` stores `currentProblem`.
- `reorderable` adds a drag handle, Move up and Move down buttons, Alt+Up and Alt+Down, and "Sort by date".

```tsx
<NoteEntryList heading="Past medical history" search={find} entries={pmh} onEntriesChange={setPmh}
  instructionText="Add a condition or procedure. Fields for dates and details appear once a term is selected."
  helpText='Type part of each word, for example "diab 2"' interpretDate={parseDuration} />
```

## Guidance implemented
- CNA-0010 [M] type a list of phrases while matched terms are returned; CNA-0120 [R] shaded area around the search field; CNA-0130..0170 label, in-field prompt and help text below (see `TerminologySearch`).
- CNA-0040 [R] detail fields appear only after a term is selected; CNA-0180 [R] one search field at a time, except when editing an entry's term.
- CNA-0290 [R] focus moves to the first detail field after selection; CNA-0320/0330 [R] a new empty search row is always directly below the last entry.
- CNA-0300 [R] encoded terms bold; CNA-0390 [R] retained unencoded text in normal weight; CNA-0310 [M] terms wrap, never truncate.
- CNA-0400/0410/0420 detail fields shown on selection: "Duration and/or date(s)" (CNA-0510 [M], CNA-0520) then "Enter additional text" (CNA-0650/0660 [M], two lines, CNA-0670 [M]); CNA-0430 [R] indented; CNA-0440/0450 labels as in-field prompts plus accessible names; CNA-0460 [R] structured field before free text.
- CNA-0530..0620 [R] natural-language dates: suggestions below the field while typing, an exact match selected automatically, the formal confirmation (From, To, For, "(approximate)") to the right of the field and in the summary, at the precision of the input; CNA-0550 [R] no drop-down button on the field; CNA-0630 [R,L] a separate date menu (`showDateMenu`).
- Hazard mitigation: the standard form is stored in `dateValue`, the third of start, end and duration is derived when two are known, and "Sort by date" uses it.
- CNA-0700 [R] laterality (left, right, both, not applicable) and 'Current problem', placed next to the date field as the research recommends; both are summarised in bold.
- Reordering [suggested from the research conclusion]: Move up and Move down buttons beside the delete button, Alt+Up and Alt+Down on the term, and "Sort by date" (earliest first, undated last). Drag and drop by the grip handle beside the move buttons (the research names drag and drop); a line above or below the target shows where the entry will go.
- CNA-0470/0480/0490 [R] details collapse when focus leaves the entry and are summarised to the right of the term, wrapping; CNA-0640 [R] chunks separated by ';', calculated date and coded qualifiers in bold, the free text unlabelled, the confirmation shown rather than the typed text.
- CNA-0680/0690 [R] qualifier check boxes beside the additional text (`suggestQualifiers`).
- CNA-0720/0730 [M] term and details editable independently; CNA-0740/0750 [R] yellow hover on both; CNA-0760 [R] clicking the term reopens the results for the original text; CNA-0770 [R] clicking the summary reopens the details.
- CNA-0780 [M] clearing the term text and leaving the field deletes the entry.
- CNA-0790 [M] delete control; CNA-0800 [R] at the right of the line; CNA-0810 [R] deletes term and details together; CNA-0820 [R] confirmation with Continue and Cancel.
- Keyboard model: Up/Down move between entries and to the search field; each collapsed entry has two tab stops (term, summary); Enter opens.
- `readOnly` shows saved entries without edit or delete (editing after commit needs audit, out of scope).
- "Add details" for entries without details, and the default prompt "Type a term", are [suggested].

## Do and don't
- Do pass `referenceDate` in tests and previews so relative phrases are stable; pass `birthDate` so "during childhood" becomes dates.
- Do store `dateValue` with the entry (hazard mitigation: sorting by date).
- Don't use it after the note is committed; pass `readOnly` instead.

## Accessibility
- Entries are list items; the term and summary are buttons with descriptive names (for example "Details for Asthma: ... Edit details"); unencoded entries are announced as "not coded".
- The delete confirmation is an `alertdialog` and focus moves to Cancel. A polite live region announces additions, deletions and moves.
- Drag and drop is an extra for pointer users: the grip is hidden from assistive technology because the Move up and Move down buttons and Alt+Up and Alt+Down do the same from the keyboard. Starting a drag announces the entry and its position ("Dragging Gout, position 3 of 3"), and dropping announces the new position, as the buttons do.

## Regional behaviour
- Dates use `parseDateInput` from the datetime area. GB: an ambiguous numeric date such as 05/04/2008 offers both readings and the user chooses. AU and NZ: day always precedes month and month-first readings are never offered (G10 AU-DT-01; G11 section 6).
- Seasons follow the hemisphere: GB spring March to May, summer June to August; AU and NZ summer December to February, winter June to August. Seasons crossing the new year are dated from the year they start ("summer 2019" in NZ is Dec-2019 to Feb-2020) [suggested; tables in `SEASON_MONTHS` are configurable].
- The terminology search follows the region's edition (see `TerminologySearch`).
