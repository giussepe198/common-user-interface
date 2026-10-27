# HistoricalSnapshotBanner

Marks a past point-in-time view of a list or record with the word "Historical", a distinct colour scheme and the date and time it shows.

## When to use

Whenever a list or record is shown as it was at an earlier time (PAL-0990), such as yesterday's handover list. Show it at the top of the historical view, which replaces the current view.

## What you provide

```tsx
<HistoricalSnapshotBanner asAt="2026-10-26T07:30" subject="Ward 3 patient list" onReturnToCurrent={() => setAsAt(null)} />
<h2><HistoricalSnapshotBanner variant="tag" /> Patient list for: Ward 3</h2>
```

## Guidance implemented

- PAL-0990/1000 [R] a historical view in a format similar to the current one: the banner sits above it and changes nothing else.
- PAL-1010 [R] the date and time are emphasised (bold, larger, warning colour), formatted dd-Mmm-yyyy HH:mm.
- PAL-1020 [M] clearly different: the word "Historical" and the warning colour scheme, not colour alone.
- PAL-1030 [M] `onReturnToCurrent` lets the host swap back; never show the historical and current views together.
- `[suggested]` "Unknown" when no time is given; "Return to current list" wording; the history icon.
- `variant="tag"` gives just the "Historical" word for headings (PatientList uses it).

## Do and don't

- Do replace the current view with the historical one.
- Don't place a historical list beside, below or over the current list.
- Don't rely on the tinted background alone; keep the word "Historical".

## Accessibility

- The banner is a `note`; the time is in `strong`. The return control is a real button.
- The warning colours meet contrast on `--warning-surface` in both themes.
