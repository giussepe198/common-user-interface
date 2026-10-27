# IconToolbar

A toolbar of icon commands grouped by user task, with selection-dependent commands and arrow-key movement.

## When to use

Command bars above patient lists, records and charts. For the Filter, Sort and Group by trio use DataToolbar (lists).

## What you provide

- `label` (accessible name of the toolbar).
- `groups`: `{ id, label, items }` in a stable order; each item `{ id, icon, label, onClick, disabled, pressed, requiresSelection, shortcut, meaning, importance }`.
- `hasSelection` (default true), `labels` (`"beside"`, `"below"`, `"hidden"`), `size` (16 or 24).

```tsx
<IconToolbar
  label="Patient list tools"
  hasSelection={!!selectedPatient}
  groups={[
    { id: 'find', label: 'Find', items: [{ id: 'search', icon: 'search', label: 'Search', shortcut: 'Ctrl+F', onClick: search }] },
    { id: 'record', label: 'Patient record', items: [
      { id: 'add', icon: 'plus', label: 'Add patient', onClick: add },
      { id: 'edit', icon: 'pencil', label: 'Edit patient', requiresSelection: true, onClick: edit },
    ] },
  ]}
/>
```

## Guidance implemented

- 2.2 icon groups (M): grouped by user task, related icons together, space and a divider between groups, a common background per group, consistent style within a group, stable arrangement for spatial memory; the same command may appear in more than one group.
- 2.4 icon grammar: nouns and verbs combine as "Add patient", "Edit patient", "Delete patient"; with no record selected Edit and Delete are unavailable (`requiresSelection` with `hasSelection={false}`).
- 2.3 (M) icons are never the only route: labels are visible by default and shortcuts appear in tooltips; hosts must also offer the commands elsewhere (menu or keyboard).
- Table 6 toolbar buttons: Enabled or Disabled; toggles show Active through `pressed`.
- [suggested] Unavailable commands stay focusable with `aria-disabled` so keyboard and screen reader users can find them.

## Do and don't

- Do keep group order the same across screens.
- Don't group by system module; group by what the user is doing.
- Don't hide labels for abstract or safety-critical commands.

## Accessibility

`role="toolbar"` with one Tab stop; Left and Right arrows move between commands (wrapping), Home and End jump to the ends. Groups are `role="group"` with their task name; dividers are `role="separator"`. Unavailable commands are announced as dimmed and do nothing when pressed.
