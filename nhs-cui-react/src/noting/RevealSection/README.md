# RevealSection

A shaded section of optional fields that stays hidden until the user reveals it with a labelled check box, or until an answer elsewhere triggers it; it cannot be hidden while it contains data.

## When to use
- Optional detail that most patients will not need (for example "Further details: CVS examination").
- Detail that becomes relevant after an answer such as "CVS normal on examination: No".

## What you provide
- `label` that says what the fields capture, the fields as `children`.
- `hasData` (or `values` to check with `canHideSection`), optional `trigger`, `prompt`, `open`/`onOpenChange`, `level`.

```tsx
<RevealSection label="Further details: CVS examination" trigger={cvsNormal === 'no'} values={[heartSounds, jvp]}>
  <FormField label="Heart sounds"><input value={heartSounds} onChange={...} /></FormField>
</RevealSection>
```

## Guidance implemented
- CNA-0830 [M] limits visible fields; CNA-0850 [M] hidden fields stay reachable; CNA-0840 [R] visible reveal control.
- CNA-0860/0940 [R] control distinct from data entry controls; CNA-0870/0950 [R] shading around the control.
- CNA-0880 [R] data-triggered reveal via `trigger`; both the control and the trigger work.
- CNA-0890 [M] the labelled control shows that hidden fields exist; CNA-0900/0980 [R] every control labelled; CNA-0920/1000 [R] `prompt` sits next to the control; CNA-1010 [R] label summarises the fields.
- CNA-0930 [R] the same check box hides the fields.
- CNA-0960 [R] cannot hide fields that contain data; CNA-0970 [R] the control is disabled with an explanation; the section does not close when the trigger changes if it holds data.
- CNA-1020/1030 [R] common shading between control and revealed fields; CNA-1040 [R] light shading (`--surface-reveal`); CNA-1050 [R] same font size, nesting shown by indentation (`level`, nested sections use a second shade).
- CNA-1920 [M] reveals are announced.
- The "Contains entered data, so it cannot be hidden." text is [suggested].

## Do and don't
- Do write labels like "Further details: CVS examination", never just "Open" or "More".
- Don't put required fields inside a hidden section (CNA-1250).

## Accessibility
- Native check box with a visible label, `aria-controls` pointing at the content, and a polite announcement on reveal and hide.
- Hidden content uses the `hidden` attribute so it is removed from the tab order and the accessibility tree; it stays mounted so values are kept.
