# RepeatableFieldGroup

Experimental. Repeated sets of measurement fields (for example vital signs), each labelled with its time, with "Add another".

## When to use
- Data types that can be recorded more than once in a template (Noting Using Templates, Theme 8).

## What you provide
- `label`, `instances` (id and `recordedAt`), `renderInstance(instance, index)`, `onAdd`.
- Optional `addLabel`, `layout` ('row' or 'column'), `now`, `maxInstances`.

```tsx
<RepeatableFieldGroup label="Vital signs" instances={sets} onAdd={addSet}
  renderInstance={(s) => <VitalsFields set={s} />} />
```

## Guidance implemented
- Theme 8: duplicates displayed adjacent; a prominent "Add another" next to the most recent set; each set labelled with its time of entry or measurement, never "first" or "second".
- Time only for today, date and time otherwise (24-hour clock, dd-Mmm-yyyy) [suggested].
- `maxInstances` [suggested].

## Do and don't
- Do create new sets with the current time.
- Don't use it for data that must be unique in a note.

## Accessibility
- Each set is a fieldset whose legend includes the group name and time.
