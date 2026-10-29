# LeaveTracker

Leave for a ward: who is absent without leave, overdue, due back, on leave, authorised or returned, with times, escalation and filters.

## When to use

- The ward leave view, the bed board side panel and handover.

## What you provide

- `episodes` (`LeaveEpisode[]`), `title`, `context`, `filter` / `defaultFilter` / `onFilterChange`, `stateLabels`, `dueBackWithinMinutes`, `overdueAction`, `absentAction`, the actions (`onStart`, `onRecordReturn`, `onRecordAbsent`, `onExtend`), `now`, `timeZone`, `region`, `headingLevel`.

```tsx
<LeaveTracker context="Ward 3" episodes={leave} absentAction={host.labels.awolNotifications}
  onRecordReturn={recordReturn} onRecordAbsent={recordAwol} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Absent without leave and overdue first; overdue said in words with what to do [suggested].
- Counts of people away, absent, overdue and due back in a polite summary [suggested].
- Filters with counts; the default "Away now" shows absent, overdue, due back and on leave [suggested]. A filter that hides absent or overdue people says how many are hidden, so nothing urgent is silently out of view [suggested].
- Each row is a compact `LeaveCard` (times absolute then relative in the jurisdiction zone) [suggested].
- Filters wrap and fill the width below 480px; 44px targets on coarse pointers [suggested].

- [suggested] An episode's `dueState`, when the host gives it, decides its state, filter count and order, so the tracker never disagrees with the system of record.

## Do and don't

- Do give the tracker every leave record of the period, including returned ones, so the counts are right.
- Don't use the colour of the filter as the only cue; the words carry it.

## Accessibility

- A labelled section; filters are pressed buttons with counts; the summary is a polite live region; rows are list items.

## Regional behaviour

- As `LeaveCard`.
