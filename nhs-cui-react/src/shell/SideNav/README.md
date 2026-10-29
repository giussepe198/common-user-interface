# SideNav

Side navigation: headed groups of destinations with icons and counts, the current one marked, collapsible to an icon rail.

## When to use

- As AppShell's `navigation` (the shell places it inline, as a rail or in a drawer), or on its own in a settings area.

## What you provide

- `groups`: `{ id, label?, lang?, items: SideNavItem[] }[]`; items `{ id, label, href?, icon?, count?, countLabel?, lang?, disabled? }`.
- `current` (item id), `onSelect(id, event)`, `label` (default "Main"), `collapsed`, `header`, `headerCollapsed`, `footer`.

```tsx
<SideNav current="tasks" groups={[{ id: 'work', label: 'Work', items: [
  { id: 'caseload', label: 'Caseload', href: '/caseload', icon: 'user' },
  { id: 'tasks', label: 'Tasks', href: '/tasks', icon: 'check', count: 4, countLabel: '4 open' },
] }]} />
```

## Guidance implemented

- The current destination is shown by `aria-current="page"`, bold text, an inline-start bar and the selected fill together, never colour alone [suggested].
- Counts carry words for screen readers ("4 open") and cap at "99+" visually [suggested].
- Collapsed rail: icons only, labels stay the accessible names and show as a tooltip on hover and focus; items without an icon show their initials so no item is blank [suggested].
- Show only destinations the person may use; the control never invents disabled teasers.

## Regional behaviour

- Labels come from the consumer. Te reo Māori labels keep their macrons and take `lang="mi"` on the item or group.

## Do and don't

- Do keep the group order fixed so people build a habit.
- Don't use the side navigation for actions; it is for places.
- Don't rely on the rail tooltip for anything that is not also the label.

## Accessibility

- `nav` landmark named by `label`; each group is a list labelled by its heading (`h2`, visually hidden in the rail).
- Items are links (with `href`) or buttons; focus ring visible; 44 px targets on coarse pointers.
