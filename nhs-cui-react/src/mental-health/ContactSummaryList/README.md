# ContactSummaryList

A dense list of contacts, newest first, with date and time, duration, type, setting, author and the start of the note, and the count and total time.

## When to use

- The contacts screen, the episode view and the one-page clinical summary.

## What you provide

- `contacts` (`ContactSummaryItem[]`: `ContactRecord` plus `id`), `onOpen`, `caption`, `showEnteredInError`, `emptyText`, `timeZone`, `region`.

```tsx
<ContactSummaryList contacts={page.items} onOpen={(c) => router.push(`/contacts/${c.id}`)} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- The recorded fields in columns; durations as "1 h 05 min" [suggested], times with the zone.
- Entered in error leaves the default view, with a count of how many are hidden; shown on request, struck through with the reason in words [suggested].
- The author of each contact is shown [suggested].
- CUI list conventions (G3) [suggested here]: column headings, numbers in tabular figures, hover row highlight, the date as the link to open.
- The note column wraps in full, never clipped (PAL-0320); pass a short summary or the note kind, the whole note is one tap away [suggested].
- Below 600px each row becomes a card with every cell labelled from its column heading [suggested].

## Do and don't

- Do pass contacts entered in error too, so the hidden count is right.
- Don't use the list to decide reporting; the server does.

## Accessibility

- A real table with a caption that includes the totals; the open action is a button named by the date and time; entered in error is said in words.

## Regional behaviour

- Times in the region's zone by default.
