# Worklist

Task-first nursing worklist (concept B1): cross-patient tasks sorted with overdue first, filter chips with counts and a card per task.

## When to use

- As the home screen for nurses on a phone.

## What you provide

- `tasks` (`WorklistTask[]`), `now`, `filter` / `defaultFilter` (default 'dueNow') / `onFilterChange`, `onStart`, `title`, `context` (e.g. "Ward 5B"), `headingLevel`, `tolerance`, `detectSimilarNames`, `similarNameLabel`, `region`, `dateFormat`.

```tsx
<Worklist tasks={tasks} context="Ward 5B" onStart={startTask} />
```

Utilities: `sortWorklistTasks`, `worklistTaskState`, `worklistFilterCounts`, `filterWorklistTasks`, `worklistResultText`, `mobileFindSimilarNames`.

## Guidance implemented

- Sort [suggested]: overdue first (longest overdue at the top), then by due time; ties by priority, high-risk first, then name. Completed tasks are hidden.
- Due windows [suggested]: Due from 30 minutes before, Overdue 30 minutes after; Overdue never changes back by itself (MEDa-0281 applied to tasks). Pass the drug chart tolerance for medication tasks if wanted.
- Filters: "Due now" (due or overdue), "Overdue", "Next hour" (due within 60 minutes, including overdue) [suggested]; counts on the chips; pressing the chosen chip again shows all open tasks.
- Similar names are found across the list by default (same family name ignoring case and macrons, and given names equal, one a prefix of the other, or one letter apart) [suggested], and merged with host-supplied `similarNames` (AU-PI-04).
- Result count announced in a status line.

## Regional behaviour

- Names, identifiers, medication lines and the similar-name test (macron-insensitive, G11 2.3) follow the region.

## Do and don't

- Do refresh `now` every minute so states move on.
- Don't drop the identity strip to fit more tasks.

## Accessibility

- Section labelled by the title; chips are toggle buttons with `aria-pressed`; result count in `role="status"`; tasks are a list of articles.
