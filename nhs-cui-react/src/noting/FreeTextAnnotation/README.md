# FreeTextAnnotation

Adds free text to a fixed-choice control (radio group, check box or list box) and keeps it visible beside the control.

## When to use
- Any fixed-choice item where clinicians may need to qualify the selection ("Ex-smoker: stopped 2019").
- "Other, please specify" style contingent text (`revealWhen`).

## What you provide
- The control as `children`, `value`/`onChange` (or `defaultValue`), `hasSelection` (whether the control has a value).
- Optional `mode` ('popup' default, or 'inline'), `placement` ('right' default, or 'below'), `label`, `addLabel`, `required`, `revealWhen`, `readOnly`.

```tsx
<FreeTextAnnotation value={note} onChange={setNote} hasSelection={!!status} label="Smoking details">
  <ClinicalRadioGroup legend="Smoking status" options={opts} value={status} onChange={setStatus} />
</FreeTextAnnotation>
```

## Guidance implemented
- CNA-1680 [M] a way to add free text to a fixed-choice selection; CNA-1690 [R] pop-up with a single text field, or inline (`mode="inline"`) becoming read-only text when focus leaves; CNA-1700 [R] "Clear text" inside the editor.
- CNA-1710 [R] the add control appears on focus, after selection and on hover; CNA-1720 [R] not before a selection; CNA-1730 [R] in the normal tab order; CNA-1740 [R] focus moves to it right after choosing from a list box; CNA-1750 [R] hidden again when focus and pointer leave.
- CNA-1760/1770/1780 [R] multi-line field at least two lines high, no horizontal scroll bar, vertical scroll when needed.
- CNA-1790/1800 [R] text shown to the right of the control, or below; CNA-1810 [M] never hidden while the control is in view; CNA-1820 [R] faint marquee around the control and its text.
- CNA-1830 [M] editable until submitted (`readOnly` afterwards); CNA-1840 [R] click the text to reopen; CNA-1850 [R] yellow hover.
- CNA-1860/1870 [R] required, recommended or contingent text: the field is always shown.
- Requirements: text kept when the selection changes; when the selection is cleared, the user is asked whether to delete the text too; clearing existing text asks first.
- "Add text", "Delete text" and "Keep text" labels are [suggested].

## Do and don't
- Do pass `hasSelection` so the text is not offered before a choice.
- Don't use it to replace a coded value: free text qualifies the selection.

## Accessibility
- The add control is a real button with `aria-controls`; the text is a button named "<label>: <text>. Edit text".
- The editor is a labelled dialog in pop-up mode; Escape closes it and keeps the text; confirmations are `alertdialog`s.
- A polite live region announces "Text added" and "Text deleted".
