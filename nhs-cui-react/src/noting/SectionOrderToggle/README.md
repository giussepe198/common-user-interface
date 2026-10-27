# SectionOrderToggle

Experimental. Switch between the order sections were added and the standard heading order.

## When to use
- Notes built from sections in any order (Noting Using Templates, Theme 9).

## What you provide
- `value`/`onChange` (or `defaultValue`), optional `standardLabel`, `addedLabel`, `legend`.
- Use `orderTemplateSections(sections, mode, standardOrder?)` to order your sections.

```tsx
<SectionOrderToggle value={mode} onChange={setMode} />
{orderTemplateSections(sections, mode).map(renderSection)}
```

## Guidance implemented
- Theme 9: sections in the order added by default; a control to reorder to the standard order and to revert; items inside sections are never reordered; the record keeps the added order (the toggle only changes the view).
- `STANDARD_SECTION_ORDER` is [suggested]: confirm it against your headings standard.

## Do and don't
- Do keep the added order in the record.

## Accessibility
- A fieldset with radio buttons; the change is announced in a polite live region.
