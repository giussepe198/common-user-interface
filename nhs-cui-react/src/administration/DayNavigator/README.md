# DayNavigator

Four day headings with previous and next day arrows, the selected day third and widest, a calendar and "Go to today".

## When to use

- Above day columns of a chart built outside `DrugAdministrationChart`, which has the same header built in.

## What you provide

- `selectedDate`/`defaultSelectedDate`/`onChange`, and `today` (defaults to now).

```tsx
<DayNavigator today={now} selectedDate={day} onChange={setDay} />
```

## Guidance implemented

- MEDa-0033 [M]: back and forward one-day arrows left and right of the date columns.
- MEDa-0034, 0035 [M]: calendar in the selected day heading with "Go to today".
- MEDa-0064, 0065 [M]: two days before, the selected day, one day after; today by default.
- MEDa-0079 [M], 0080 [M]: today's heading has an icon, "Today: " before the date and a distinct background, kept when not selected.
- MEDa-0082, 0084 [M], 0097 [M]: selected day bordered, third and widest, and it does not move.
- Dates as dd-Mmm-yyyy.

## Do and don't

- Do align your day columns to the same widths (1, 1, 2, 1 with the arrows either side).

## Accessibility

- A labelled group; arrows and the calendar are buttons with text names; today has `aria-current="date"`; the selected day says "(selected day)" to screen readers.
- Calendar: arrow keys by day and week, Page Up and Page Down by month, Enter selects, Esc closes and returns focus.

## Regional behaviour

No differences between GB, AU and NZ: all three use day-first dates. [suggested] Weeks start on Monday.
