# TerminologySearch

A single-concept terminology search: a text field with progressive matching and a results list that shows common matches first, the number of results, a busy indicator, a clear no-matches message and a details flyout. You supply the search function.

## When to use
- Coding a single clinical concept (diagnosis, procedure, finding) from a SNOMED CT or similar terminology.
- Inside `NoteEntryList` for lists of coded entries.

## What you provide
- `search(query, { signal })` returning a promise of results (`id`, `term`, optional `fsn`, `preferredTerm`, `isSynonym`, `isCommon`, `score`, `frequency`, `parents`, `isUnexpandedAbbreviation`). Abort work when `signal` fires.
- `label` (instructional), optional `placeholder`, `helpText`, `onSelectionChange`, `onKeepText`, `ordering`, `labelMode`.
- `required` and `missed` (with `useRequiredFieldTracking`), as `FormField`: asterisk after the label, `aria-required`, yellow shading, warning icon and the screen-reader text "Required field not completed.". `aria-describedby` ids are merged with the help text.
- `id` (or `inputId`) is the id of the search box itself. To use a `FormField` label, wrap it and leave out `label`:

```tsx
<FormField id="f-dx" label="Working diagnosis" required missed={t.isMissed('f-dx')}>
  <TerminologySearch search={search} selected={dx} onSelectionChange={setDx} />
</FormField>
```

```tsx
<TerminologySearch
  label="Search for a condition"
  placeholder="Type a term"
  helpText='Type part of each word, for example "ast exe"'
  search={(q, { signal }) => api.find(q, { signal })}
  onSelectionChange={(result) => setDiagnosis(result)}
/>
```

## Guidance implemented
Clinical noting (CNA) and 2007 Terminology Matching:
- CNA-0010/0020 [M/R] single search entry field; CNA-0030 [M] visible cursor; CNA-0050/0060 progressive matching, results shown as matched (debounced 200 ms, Matching 2.2.2).
- CNA-0070/0080 [R] no search button; a non-clickable search icon instead. Enter still runs a search immediately (SCT-009/059).
- CNA-0090..0110 [R] after 1 second the icon is replaced by an animation and "Searching" appears in the results area; SCT-034/035 a Cancel control stops a long search.
- CNA-0130 [M] instructional label; CNA-0140/0250..0280 in-field prompt grey italic, no examples, kept on focus; CNA-0150..0170 [R] help text below in low prominence, with an example.
- CNA-0190 [R] left aligned; CNA-0200 [R] and SCT-010 [M] 32 'M' characters wide, holds 255 characters.
- CNA-0210..0240 [R] common matches above all matches, labelled "Common matches" and "All matches".
- CNA-0300 [R] selected term in bold; CNA-0310 [M] never truncated (field shows the full description).
- CNA-0340 [M] and SCT-054 [M] "No matches found" in the results area, never an empty or stale list; CNA-0350 [M] "Keep text as entered" control (`onKeepText`); CNA-0360/0370 [R] the message suggests a more general term and says keeping text is not recommended; CNA-0380 [R] shown where results would be.
- Matching 2.3.1: requests are numbered and stale responses are ignored (`createRequestSequencer`), and the previous request is aborted.
- Matching 2.3.2 / SCT-044 [M]: concept identifiers are never displayed; semantic tags such as "(disorder)" are not shown in the list; results are not numbered.
- Matching 2.3.4 / SCT-046: unexpanded abbreviations are shown as "SLE - Systemic lupus erythematosus" (FSN without its tag), abbreviation in bold capitals.
- SCT-011 [R] at least 2 characters; SCT-012..015 handled by the engine and by `matchesDescription` for local data (multi-token, order-independent prefix, case-insensitive); SCT-016 [M] numbers are searched as text, never as codes.
- SCT-024 [R] no auto-completion; SCT-036 vertical scroll only; SCT-037/038 10 rows visible by default (`visibleRows`); SCT-043 [M] rows separated by lines with a strong highlight on the active row; SCT-047 matched word starts highlighted; SCT-048 exact matches first; SCT-050 [M] ordering never random or by ID (`ordering`); SCT-053 [M] number of results shown.
- SCT-045 [R] and Matching 2.3.1: full name, synonym status and parents in the flyout (`ConceptFlyout`).
- SCT-059 [M] keyboard: Down/Up move through results without tabbing, Enter selects, Esc closes. SCT-060 [M] the field shows exactly the selected description. SCT-061 encoded text styled differently (bold). SCT-062 [M] Down reopens the previous results without retyping.

## Conflicts between the 2007 and 2011 guidance, and the choices made
| Topic | 2007 | 2011 | Choice |
|---|---|---|---|
| Visible results | 9 | at least 10, at most 20 | 10 (`visibleRows`) |
| Long labels | wrap at 32, truncate after 62 with '…' | wrap fully or truncate after two lines | wrap fully by default (`labelMode="wrap"`), because truncation risks a wrong selection (SCT-040 safety note); `truncate` cuts after two lines (32 + 30 = 62 characters, which satisfies both) and keeps the full label in the tooltip and accessible name |
| Numbering | do not number | optional | not numbered |
| No matches | show nothing | state it and help | state it and help (2011 supersedes for single-concept search) |
| Word equivalence | off by default with a control | on by default | left to your search engine; this component does not rewrite queries |
| Category tag | never show | may prefix a supercategory | never shown |
| Minimum characters | not stated | 2 | 2 (`minChars`) |
| Busy indicator | not stated | indicate running search | shown after 1 second (CNA-0090) to avoid flicker |

- CNA-1080/1110 [M] required asterisk after the label; CNA-1160..1180 [R] missed required field shaded with an icon and screen-reader text (as `FormField`).

## Do and don't
- Do return Preferred terms or synonyms as `term`, never the fully specified name.
- Do filter inactive and excluded concepts in your engine (SCT-003/004).
- Don't show concept identifiers anywhere in the clinical interface.

## Accessibility
- ARIA combobox with a listbox; groups are labelled; the active option is exposed with `aria-activedescendant` and described by the flyout.
- A polite live region announces "Searching", the number of matches, "No matches found" and the selection.
- The spinner slows down under `prefers-reduced-motion`; "Searching" text is always shown with it.

## Regional behaviour
The edition, language reference set and diacritic handling follow `region` (or `ClinicalLocaleProvider`). Every request to `search` receives `{ signal, region, edition, subset, foldDiacritics }` so your engine can query the right server and value set.

| | GB | AU | NZ |
|---|---|---|---|
| Edition (`edition.label`) | UK Edition (SCT-001) | Australian edition (NCTS), SNOMED CT-AU including AMT (G10 11, AU-TM-01) | NZ Edition, April and October releases (G11 10) |
| Display term when results carry `descriptions` | preferred in the UK English clinical refset, then SCT-007 fallback en-GB, en, en-US | preferred in the Australian English language refset | preferred in the NZ English language refset; `audience="consumer"` uses the NZ consumer refsets, te reo Māori with `consumerLanguage="mi"` |
| Macrons | matching ignores diacritics (SCT-018/019) | same | matching ignores macrons ("whanau" finds "Whānau", G11 11.1); typed text is precomposed to NFC; macrons are always displayed and stored |

- Identifiers in `SNOMED_EDITIONS` marked UNCERTAIN in the notes (AU module and language refset; NZ module, edition URI and refset ids; GB edition URI and refset id) are configurable with the `edition` prop. Check them against the current release notes before production use.
- Terms in a language other than English (for example te reo Māori) are marked with `lang` (WCAG 3.1.2).
- `showEdition` [suggested] shows the edition label in the details flyout. The label never uses the phrase "SNOMED CT" (Clinical statements consultation).
- `foldDiacritics={false}` keeps diacritics distinct in highlighting, for example where "Kāhu" and "Kahu" are different names (G11 2.3).
