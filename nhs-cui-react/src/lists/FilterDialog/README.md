# FilterDialog

A dialog for building filter criteria (attribute, operator, value) that say which rows to keep in a table or patient list.

## When to use

Opened from the Filter command of a `DataToolbar`, a header context menu, or its keyboard command. Use `FilterNotification` (or `PatientList`'s `filter` prop) to show the result.

## What you provide

```tsx
<FilterDialog
  tableName="ward patient list"
  rowNoun="patients"
  attributes={[{ id: 'age', label: 'Age', dataType: 'integer', unit: 'years' }, { id: 'admitted', label: 'Admitted', dataType: 'date' }]}
  initial={filter}
  onPreview={setFilter}
  onOk={f => { setFilter(f); close(); }}
  onCancel={original => { setFilter(original); close(); }}
/>
```

Values are kept as entered text (numbers as decimal text, dates as `YYYY-MM-DD`, date-times as `YYYY-MM-DDTHH:mm`) so the state can be saved between sessions (PAL-0790). Apply it with `evaluateFilter`.

## Guidance implemented

- FSG-0005 [M] user-specified filters; a filter says what to keep.
- FSG-0008 [R] title includes the table name; FSG-0009/0010 [R] "Filter to show rows of patients where:" above the first criterion only.
- FSG-0016 [R] attribute, operator and value on one line in that order; FSG-0006/0007 operator and value never split.
- FSG-0011 [M], FSG-0030/0031 [R] attribute menu lists the displayed attributes in table order.
- FSG-0032 [R] only operators valid for the data type (`permittedFilterOperators`); real numbers never get "equal to".
- FSG-0035 [M] value control matches the type (number, list, and the CUI `DateInput` for dates, `DateInput` plus `TimeInput` for date-times, so dates show as dd-Mmm-yyyy rather than the browser's locale format); FSG-0036 [M] "between" shows two value controls straight after the operator, inclusive of both.
- FSG-0039..0050 [R] operator labels exactly as specified; FSG-0043 [R] optional "<", "=", ">" symbols (`showOperatorSymbols`; "≤" and "≥" are `[suggested]`).
- FSG-0017 [R] buttons Preview, OK, Cancel; initially only Cancel is enabled. FSG-0018..0020 [R] Preview applies without closing; OK applies and closes; Cancel restores the data as it was when the dialog opened (you receive the original filter).
- FSG-0021 [R] prepopulated with the current filter.
- FSG-0022..0025 [R] "Add" sits below the last criterion, left aligned, and inserts a new line.
- FSG-0026 [M] AND / OR radio buttons shown only once there are two criteria; FSG-0027 [M] OR is listed first and is the default; FSG-0028/0029 [R] labels "Any of which are true" / "All must be true" (or "Match Any" / "Match All" with `combineWording="short"`).
- FSG-0052 [R] no NOT; FSG-0053 [R] one logical operator for all criteria; FSG-0055 [R] the same attribute can appear on several lines.
- FSG-0057..0063 a "Remove" button on each line (clears a single line, deletes one of several) and "Remove all filters".
- FSG-0015/0079 [M] never larger than the screen (scrolls inside); FSG-0074 [R] translucent backdrop.

## Do and don't

- Do pass only the attributes that are displayed in the table.
- Don't offer "equal to" for continuous values or a NOT option.
- Don't call removing filters "Reset", "Empty", "Undo" or "Default".

## Accessibility

- Every control has an accessible name ("Criterion 2 operator"). The criteria are an ordered list labelled by the lead text.
- Esc cancels; focus is kept inside the modal dialog and returns to the opener on close. After Add or Remove, focus moves to the affected line.
- The AND / OR choice is a `fieldset` with a legend.

## Narrow screens [suggested]

The dialog body is a size container. Below 560px each criterion stacks (attribute, operator, value) at full width; below 480px of screen the dialog keeps an 8px gutter.
