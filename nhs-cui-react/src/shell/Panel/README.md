# Panel

The dense card: a named section with a heading, optional count, commands, a body and an optional footer, optionally collapsible.

## When to use

- To group related content on a page (alerts, contacts, recent notes).
- Inside a Panel use `variant="sunken"` for a nested group.
- `appearance="section"` gives a larger heading with no divider and roomier padding, for a form section or a summary card on a record overview; the default `bar` suits lists and tools.

## What you provide

- `title` (required), `headingLevel` (2 to 4), `subtitle`, `count`, `countLabel`, `countWhenCollapsed`, `actions`, `footer`.
- `collapsible`, `collapsed` / `defaultCollapsed` / `onCollapsedChange`, `padding` ('compact' or 'none'), `variant`, `appearance` ('bar' or 'section').

```tsx
<Panel title="Contacts" count={3} countLabel="3 contacts" collapsible actions={<Button size="sm" variant="quiet" icon="plus">Add contact</Button>}>
  <ContactList />
</Panel>
```

## Guidance implemented

- MEDv-191 [M] (by analogy with medication list groups): collapsible panels start expanded unless the consumer says otherwise.
- MEDv-089 [R] (by analogy): with `countWhenCollapsed`, the count shows only while the panel is collapsed.
- ADR-0041 [M]: the disclosure control is a chevron, never a black triangle.
- Square-ish surface with a 1 px border, no shadow and no left-border accent (CONVENTIONS) [suggested].

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English. Te reo Māori labels keep their macrons and can carry `lang="mi"` where the control offers it.

## Do and don't

- Do name every panel; the heading becomes the section's accessible name.
- Don't hide safety-relevant content (alerts, legal status) in a panel that starts collapsed.

## Accessibility

- `section` labelled by its heading; the collapse control is a button inside the heading with `aria-expanded` and `aria-controls`.
- The hidden body uses the `hidden` attribute, so it leaves the tab order.
