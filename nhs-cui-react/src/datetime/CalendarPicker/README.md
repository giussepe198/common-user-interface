# CalendarPicker

A month calendar for choosing a date, with separate month and year navigation, Today and Close buttons and full keyboard support.

## When to use

Opened from the calendar icon inside DateInput. It can also be used on its own where a visible calendar is needed.

## What you provide

- `onSelect(value)` (required), `value`, `onClose`.
- `allowMonthYear`, `allowYear` (make the header month and year selectable as partial dates), `today`, `min`, `max`, `autoFocus`, `headerInstructions`, `label`.
- `region` (optional): AU uses "Thur" in the day headings.

```tsx
<CalendarPicker value={v} onSelect={setV} onClose={close} allowMonthYear allowYear />
```

## Guidance implemented

- D+Tc-0010 [M] opened from the calendar icon (in DateInput).
- D+Tc-0011 [M] previous and next buttons for month and, separately, for year; the month name and year are buttons that enter a partial date when allowed.
- D+Tc-0012 [M] Today button enters today's date.
- D+Tc-0013 [M] Close button.
- D+Tc-0014 [M] today is marked with a border, a dot and the text "today" for screen readers (not colour alone).
- D+Tc-0015 [M] day headings Mon to Sun, week starting Monday (Quick Implementation Guide).
- D+Tc-0016 [M] header tooltip: "Select a month or year by clicking in the header or select a day by clicking on a date from the calendar below."; each header button also has its own tooltip.
- D+Tc-0017 [M] Esc closes (outside click handled by DateInput).
- D+Tc-0018 [M] the chosen value is passed to `onSelect` for the field.
- D+Tc-0019 [M] keyboard: arrows move by day and week, Page Up and Page Down by month, Shift with Page Up and Page Down by year, Home and End to the start and end of the week, Enter or Space selects [suggested key set, WAI-ARIA grid pattern].
- Six-week grid including days from adjacent months (Quick Implementation Guide).

## Do and don't

- Do keep both month and year navigation: month-only navigation is incorrect.
- Don't hide the Today and Close buttons.

## Accessibility

The day grid is a `table` with `role="grid"`, one focusable day at a time (roving tab index), each day labelled in long form ("Monday 03 September 2007"), `aria-current="date"` for today, a polite live region announcing the month and year when it changes.

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Day headings | Mon Tue Wed Thu Fri Sat Sun | Mon Tue Wed Thur Fri Sat Sun (ACSQHC 2024 accepted terms, AU-DT-04) | as GB |
| Week starts | Monday | Monday [suggested: no AU source] | Monday [suggested: no NZ source] |

Source: G10-australia.md 8.1.
