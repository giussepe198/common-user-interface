# EmptyState

What a list, panel or page shows when there is nothing to show: what is empty, why, and the next step.

## When to use

- A list with no rows, a search with no results, a panel with nothing recorded.
- Not while loading: use Skeleton.

## What you provide

- `title` (what is empty, in words), `children` (why, what to do), `action` (usually one Button), `icon` (default 'inbox', null for none), `layout` ('block' or 'inline'), `headingLevel`.

```tsx
<EmptyState title="No contacts match" action={<Button onClick={clear}>Clear filters</Button>}>Filters hide 12 contacts.</EmptyState>
```

## Guidance implemented

- An empty clinical list says so in words ("No alerts recorded"), so absence of data is never confused with data not loaded or hidden by a filter [suggested; compare FilterNotification in the lists area].
- Inline layout fits inside a dense list or panel row.

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do distinguish "none recorded" from "none match the filters".
- Don't use "No data" or a bare dash.

## Accessibility

- Text first; the icon is decorative. A heading only when you ask for one, so the outline is not cluttered.
