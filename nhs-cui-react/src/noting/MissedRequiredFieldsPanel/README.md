# MissedRequiredFieldsPanel

A non-modal side panel that lists every required field the user has moved past without completing, grouped by form section, with links to each field. Use it with the `useRequiredFieldTracking` hook.

## When to use
- Long clinical forms with required fields, where validation should not wait for Submit and must not block the user.

## What you provide
- The hook: a list of fields (`id`, `label`, `section`, `required`, `empty`, optional `order`). Spread `formProps` on the form and pass `isMissed(id)` to each field's `missed` prop.
- The panel: `items` (from the hook), optional `title`, `intro`, `onNavigate`.

```tsx
const t = useRequiredFieldTracking([
  { id: 'rr', label: 'Respiration rate', section: 'Observations', empty: !rr },
]);
<form {...t.formProps}>
  <FormField id="rr" label="Respiration rate" required missed={t.isMissed('rr')}><input /></FormField>
</form>
<MissedRequiredFieldsPanel items={t.missedItems} />
<Button onClick={() => { if (t.markAllMissed().length === 0) save(); }}>Save</Button>
```

- On Save, `markAllMissed()` marks every empty required field as missed (including ones the user has not reached) and returns them in tab order, so you do not compute the list yourself. `reset()` clears it.

## Guidance implemented
- 'Missed' = required, empty and focus has moved to a later field in the tab order. The hook remembers the furthest field reached; a field stops being missed once filled (`computeMissedRequired`).
- CNA-1140 [R] reactive indication; CNA-1150 [R] communicated as soon as focus moves past.
- CNA-1190 [R] non-modal message; CNA-1200 [R] never obstructs filling a field; CNA-1210 [R] lists all missed fields grouped by section heading.
- CNA-1220 [R] stays in view (sticky side panel); CNA-1230 [R] links scroll to and focus the field; CNA-1240 [R] heading expresses importance ("Required fields").
- Never forces completion before moving on; does not defer all validation to Submit.
- [suggested] `markAllMissed()` for Save: the same missed state and panel, applied to all remaining empty required fields at once.
- CNA-1250 [R] do not hide required fields under tabs or collapsed sections: a layout rule for you to follow.

## Do and don't
- Do place the panel to the right of the form so it never covers fields.
- Don't make it a modal or a blocking alert.

## Accessibility
- `aside` labelled by its heading; links are buttons that move focus to the field (or the first control inside a fieldset).
- A polite live region announces the number of missed fields when it changes.
- Fields also carry their own screen-reader text "Required field not completed" (CNA-1180) via `FormField`.
