# ClinicalTermList

Selection list of coded clinical terms (for example SNOMED CT preferred terms) that shows terms in full by default and handles truncation safely when it has to be used.

## When to use

Choosing one term from a list of matches or favourites where some terms are long. For a single piece of long text use TruncatedText. For SNOMED CT suggestions beside a noting area use SuggestedMatchList (noting).

## What you provide

- `label` (visible), `items` (`{ id, term }`, full terms only), `value` / `defaultValue` / `onChange` (selected id).
- `onActivate(item)`: called on Enter or double-click once the full term has been shown.
- `truncation` (`"none"` default, or `"end"`), `showFullTextToggle`, `resizable`, `requireFullTextAcknowledgement`, `maxHeight`, `measure` (text width function), `emptyText`.

```tsx
<ClinicalTermList label="Problems" items={terms} value={id} onChange={setId} onActivate={addProblem} />
```

## Guidance implemented

The Truncation of Clinical Terms document is a consultation: its items are emerging recommendations with no IDs or mandatory status.

- T1 avoid truncation: terms wrap in full with a vertical scroll bar by default; no horizontal scroll bar; numbers stay with their units when wrapping ("100 milligrams"); no hyphenation.
- T1, T7 the list can be resized wider (drag the corner) so long terms fit.
- T2 truncation only at the end of a single line, between whole words, decided by measured width rather than a character count (T4).
- T3 never cuts inside a word, number or unit ("1-24 hours" stays whole).
- T5 an ellipsis directly after the text, plus a separate truncation symbol on each shortened item; the ellipsis is not a control.
- T6 when shortened terms would look identical, the whole list is shown in full and a notice says so.
- T7 "Show all terms in full" control; inline expansion of one item (right arrow or the symbol); a shortened term is shown in full before `onActivate` runs (first Enter expands, second Enter acts).
- [suggested] Right and left arrow keys expand and collapse the active item.

## Do and don't

- Do leave `truncation` at `"none"` unless space is genuinely short and long terms are the exception.
- Do pass full terms; never pre-truncate them.
- Don't add a horizontal scroll bar to a list of truncated terms.

## Accessibility

`role="listbox"` with `aria-activedescendant`; Up, Down, Home and End move and select, Enter activates, Space selects. Each option's accessible name is always the full term (shortened items add "(shortened on screen)"). The identical-terms notice is a `role="status"` region; the "full term shown" message is announced politely. The truncation symbol is decorative; keyboard users use the right arrow key.
