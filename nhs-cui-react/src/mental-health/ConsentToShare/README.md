# ConsentToShare

A matrix of who may receive which information, with the consent state in words in every cell, the reason, who gave it and the review date.

## When to use

- The sharing screen, before sending or releasing information, and in a review with the person.
- For a single state beside an action use `ConsentIndicator`.

## What you provide

- `categories` (the host's information categories), `recipients` (`name`, `kind`, `states` by category, `reason`, `grantor`, `reviewDue`, `ended`), `caption`, `labels`, `onEdit`, `renderActions`, `emptyText`, `now`, `timeZone`, `region`.
- `ended` keeps an ended decision in the matrix for the record with "Ended" and the date in words, and no review due [suggested]. `renderActions` puts the host's own commands for a row after its reason and review, for example "End" [suggested].

```tsx
<ConsentToShare categories={host.informationCategories} recipients={sharing.rows} onEdit={openConsent} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Per recipient and category, the decision in words: "May share", "Do not share", "Withdrawn", "Not asked" (defaults [suggested]; the service may rename them).
- A missing decision is "Not asked" with a warning icon and dashed border, never read as allowed [suggested].
- Consent colours with an icon; "Do not share" and "Withdrawn" add the inline-start bar; colour never alone [suggested].
- Reason and grantor shown; the review date in the library's date format with "Review overdue" in words once passed (date-only values not shifted by zone) [suggested].
- Below 800px (container width) each recipient becomes a card with every cell labelled from its category [suggested].

## Do and don't

- Do give every category the host defines, so gaps show as "Not asked".
- Don't decide a disclosure from the matrix alone; the server's sharing check decides.

## Accessibility

- A real table with a caption, column headers for categories and a row header for each recipient; every cell is text; the change button names the recipient.

## Regional behaviour

- Categories and grantor words come from the host.
