# Button

Command button for actions in forms, toolbars and dialogs; use one `primary` button per view for the main commit action.

## When to use

- `primary` for the single commit action in a view or dialog (for example "Authorise", "Record administration").
- `secondary` (default) for other actions such as "Cancel" or "Preview".
- `quiet` inside toolbars and inline next to data, where a bordered button would add noise.
- `danger` for destructive actions such as "Remove"; pair it with a confirmation step.

## What you provide

```tsx
<Button variant="primary" onClick={authorise} disabled={!canAuthorise}>Authorise</Button>
<Button icon="plus">Add medication</Button>
<Button iconOnly icon="search">Search</Button>
```

## Guidance implemented

- Icons and Symbols: an icon is never the only route to a function; `iconOnly` buttons keep their text as the accessible name and tooltip.
- Clinical noting CNA-2060: labels in sentence case.
- Commit buttons sit bottom right of forms (MSP-2290); the button itself does not position.

## Do and don't

- Do write labels as verbs in sentence case.
- Don't use colour alone to show a destructive action; keep the word ("Remove").
- Don't place two `primary` buttons side by side.

## Accessibility

Native `button` with `type="button"` by default, so it never submits a form by accident. Focus ring is a solid 2px `--focus` outline. Disabled buttons use `--ink-disabled` and the native `disabled` attribute.
