# Pagination

Previous, page numbers and Next for long administrative lists, reduced to "Page n of m" in narrow containers.

## When to use

- Audit logs, report runs and other administrative lists served page by page.
- Not for clinical lists or search results, which scroll as one list (PAL-0360, MSP-0460).

## What you provide

- `label`, `page` (from 1), `pageCount`, `onPageChange(page)`, `summary` (words such as "Events 51 to 100 of 1,240"), `labels`.

```tsx
<Pagination label="Pages of audit events" page={page} pageCount={25} onPageChange={setPage} summary="Events 51 to 100 of 1,240" />
```

## Guidance implemented

- PAL-0360 [R], MSP-0460 [M]: do not page clinical lists or search results; this control is for administrative lists only.
- First, last, current and neighbouring pages shown, gaps marked (`paginationRange`) [suggested].
- [suggested] Under 480 px of container width only Previous, "Page n of m" and Next remain.

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do say what the page shows in `summary`.
- Don't reset the page silently when a filter changes without saying so.

## Accessibility

- `nav` landmark named by `label`; the current page has `aria-current="page"` and the selected fill and weight; every page button is named "Page n of m".
- Previous and Next say so in words; 44 px on coarse pointers.
