# MenuButton

A button that opens a menu of commands (ARIA menu button).

## When to use

- Secondary commands that do not fit as buttons: the account menu, the help menu, row or panel actions.
- Not for choosing a value in a form (use a select control) or for navigation lists (use SideNav).

## What you provide

- `label` (visible words, or the name with `iconOnly`), `items`: commands `{ id, label, icon?, description?, shortcut?, href?, disabled?, danger?, checked?, onSelect? }` and separators `{ id, separator: true }`.
- `icon`, `iconOnly`, `variant`, `size`, `align` ('start' or 'end'), `onAction(id)`, `pressed`, `disabled`.

```tsx
<MenuButton label="Ana Silva" align="end" items={[{ id: 'profile', label: 'Your profile', href: '/account' }, { id: 'sep', separator: true }, { id: 'out', label: 'Sign out', onSelect: signOut }]} />
```

## Guidance implemented

- FSG-0004 [R]: the same commands are offered in the same order wherever the menu appears (the items are fixed by the consumer, never reordered by use).
- Disabled commands stay visible and are skipped by the arrow keys [suggested].
- Shortcut hints are display only, right aligned in muted text (MSP-0680 style).
- Chevron on the button, never a black triangle (ADR-0041).

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do start each label with a verb and say what is lost on a danger item ("Remove from caseload").
- Don't hide the only route to a safety-relevant action in a menu.

## Accessibility

- Button with `aria-haspopup="menu"` and `aria-expanded`; menu `role="menu"` labelled by the button; items `menuitem` or `menuitemcheckbox`.
- Enter, Space or Down opens on the first item, Up on the last; arrows, Home, End and type-ahead move; Enter or Space chooses; Esc closes and returns focus; Tab closes.
- A click outside closes the menu; 44 px items on coarse pointers.
