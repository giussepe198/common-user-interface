# StatTile

One count or rate with its label as a heading, an optional trend and status in words, and a line of context.

## When to use

Use it for headline numbers on a dashboard or team view: referrals waiting, median wait, overdue reviews. Put several in a grid. Use a `LineChart` or `BarChart` (with its table) for the numbers behind a trend.

## What you provide

```tsx
<StatTile
  label="Median wait"
  value={12}
  unit="days"
  trend={{ direction: 'down', text: 'Down 3 since September' }}
  note="Open referrals, North team"
  asAt="2026-10-28T09:00"
  onOpen={() => showList()}
/>
```

`value={null}` with `suppressedText` ("Fewer than 5") for a number that must not be shown. `status` takes a status chip in words. `level` sets the heading level.

## Guidance implemented

- Numbers in tabular figures, label in label style, the time counted in the CUI date format [suggested].
- The trend is always words with an arrow; colour stays neutral because whether a rise is good is the reader's judgement (no automated clinical judgement) [suggested].
- A suppressed value is words, never zero [suggested].

## Regional behaviour

None.

## Do and don't

- Do give the period or scope in `note` or `asAt`.
- Do write the trend so it reads alone ("Up 3 since last week").
- Don't colour the number red or green for better or worse.
- Don't use a tile for a value a clinician must act on; use an alert.

## Accessibility

A `section` labelled by its heading. With `onOpen` the label is a real button ("<label>: open the list") whose hit area covers the tile; it grows to touch size on a coarse pointer. The trend arrow is decorative beside its words.
