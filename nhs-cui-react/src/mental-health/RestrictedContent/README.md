# RestrictedContent

A restricted section the viewer is cleared for, masked until they give a reason; the opening is recorded before anything shows.

## When to use

- Restricted categories of a record (third-party information, family violence, sealed for named roles) the viewer may see. Content the viewer may not see is never sent to the browser.

## What you provide

- `label` (the category in words, never the content), `onReveal(reason)` returning `true` or a promise of `true` once the audit event is recorded, `requireReason`, `revealed`, `revealLabel`, `reasonLabel`, `auditNote`, `failedText`, `children`.

```tsx
<RestrictedContent label="Restricted: third-party information" onReveal={(r) => api.recordOpening(id, r)}>
  {content}
</RestrictedContent>
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- G12 3, CUI `ProtectedReveal` pattern: masked with a lock and words, "Show ..." opens a reason field "Reason for viewing (recorded)", Enter submits, Esc cancels and returns focus, an empty reason is refused [suggested in the source].
- Fail closed: the children are not rendered until `onReveal` returns `true`; an error or any other value keeps them hidden and says so [suggested].
- Restricted content uses the `restricted` hue, the lock glyph and a section edge with the inline-start bar; the hue is an extension token, never set by a theme [suggested].
- CLAUDE.md audit rule: every read of restricted content is recorded; the callback is where the host records it [suggested].
- The category label stays visible so clinically essential information is known to exist [suggested].

## Do and don't

- Do record the opening on the server before returning `true`.
- Don't pass content the viewer is not cleared for; use the projection layer.

## Accessibility

- A `section` labelled by the category; the reason field has a visible label; errors and failures use `role="alert"`.

## Regional behaviour

- None.
