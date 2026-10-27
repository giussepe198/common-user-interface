# HeaderCellFilter

Operator and value controls shown in a column header to filter by that column alone, with "Custom…" to open the full filter dialog.

## When to use

From a header context menu's "Filter" item. `PatientList` shows it when `headerFilter` is set. Use `FilterDialog` for several criteria or AND/OR.

## What you provide

```tsx
<HeaderCellFilter
  attribute={{ id: 'news', label: 'NEWS2 score', dataType: 'integer' }}
  initial={currentCriterionForThisColumn}
  onApply={criterion => setFilter({ combine: 'or', criteria: [criterion] })}
  onRemove={removeThisColumnsFilter}
  onCustom={openFilterDialog}
  onCancel={close}
/>
```

## Guidance implemented

- FSG-0012 [R] a single criterion on one attribute, directly from the header cell.
- FSG-0033/0034 [R] the header menu's "Filter" shows operator and value controls inline.
- FSG-0037/0038 [R] the operator list ends with "Custom…", which opens the full dialog.
- FSG-0032 only operators valid for the data type (no "equal to" for real numbers); FSG-0036 "between" shows two value controls; FSG-0043 optional symbols.
- FSG-0035 [M] value control per type: dates use the CUI `DateInput` (dd-Mmm-yyyy), date-times `DateInput` plus `TimeInput`.
- FSG-0021 prepopulated with the column's current criterion.
- `[suggested]` applying replaces any other active filter, and a note says so, so a header filter never silently combines with dialog criteria.

## Do and don't

- Do place it under its header cell; it positions itself below the cell.
- Don't use it for more than one attribute at a time.

## Accessibility

- A labelled dialog; focus starts on the operator list; Escape cancels; Enter in the form applies; Apply is disabled until the criterion is complete.
