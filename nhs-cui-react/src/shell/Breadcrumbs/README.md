# Breadcrumbs

Where the page sits in a hierarchy, with the current page last; a single "Back to" link in narrow containers.

## When to use

- Administration, settings and reports, where pages nest more than one level deep.
- On the patient record only where the product chooses to: the banner and tabs orient people there [suggested]; a product may use a trail from the record section down.
- Not as the selection trail of a prescription: that uses SelectionTrail (MSP-1060).

## What you provide

- `items`: `{ id, label, href?, onSelect? }[]` from the top down; the last item is the current page.
- `label` (default "Breadcrumb"), `backLabel` (default "Back to").

```tsx
<Breadcrumbs items={[{ id: 'admin', label: 'Administration', href: '/admin' }, { id: 'roles', label: 'Roles', href: '/admin/roles' }, { id: 'r1', label: 'Clinician' }]} />
```

## Guidance implemented

- The current page is text with `aria-current="page"`, never a link [suggested, WAI-ARIA breadcrumb pattern].
- Chevron separators, not black triangles (ADR-0041).
- [suggested] Under 420 px of container width the trail becomes one "Back to <parent>" link; with no linkable parent the trail stays and wraps.

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English. Te reo Māori labels keep their macrons and can carry `lang="mi"` where the control offers it.

## Do and don't

- Do use the page titles as labels so the trail matches the headings.
- Don't put the breadcrumb trail in place of the page title.

## Accessibility

- `nav` landmark with an ordered list; separators are decorative icons.
- Links are underlined, so they do not rely on colour.
