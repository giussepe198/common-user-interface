# PageHeader

Dense page header: the page title, one line of subtitle, a meta line and the page commands.

## When to use

- At the top of every page's main content, once.

## What you provide

- `title` (h1 by default, `headingLevel` 1 or 2), `subtitle`, `meta`, `breadcrumbs`, `actions`.
- `status`: the save state of what the page edits, in words, shown just before the commands ("Unsaved changes", "Saved at 14:32").

```tsx
<PageHeader title="Caseload" subtitle="Acute team" meta={<span>42 people</span>} actions={<Button variant="primary">Add person</Button>} />
```

## Guidance implemented

- [suggested] Compact by default; the heading uses the heading type token (18/24) rather than a display size, and there is no decorative space.
- Commands sit at the end of the title line and move under the title in containers under 520 px; they wrap, never clip [suggested].
- One primary command per view (core Button guidance).
- [suggested] An editing page says its save state in words beside its Save and Discard commands, so the state and the way to act on it are read together; the state is a polite live region.

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English. Te reo Māori labels keep their macrons and can carry `lang="mi"` where the control offers it.

## Do and don't

- Do keep the subtitle to one line of facts.
- Don't repeat the patient's identity here when a patient banner is shown.

## Accessibility

- A `header` element with the page's only `h1`; the meta line is plain text in reading order.
- `status` is `role="status"` (polite): a change such as "Saved at 14:32" is announced without moving focus.
