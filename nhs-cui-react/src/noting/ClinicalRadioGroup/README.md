# ClinicalRadioGroup

A labelled group of radio buttons for single choices on clinical forms, with ordering, sentence case, prompts beside options and announcements for options that reveal more fields.

## When to use
- One choice from 2 to about 9 options where every option should be visible.
- Use it instead of a drop-down when missing an option has patient-safety implications (CNA-2030).

## What you provide
- `legend`, `options` (`value`, `label`, optional `prompt`, `reveals`, `frequency`, `pinFirst`), and `value`/`onChange` or `defaultValue`.

```tsx
<ClinicalRadioGroup
  legend="CVS normal on examination"
  options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No', prompt: 'Opens further details', reveals: true }]}
  value={cvs} onChange={setCvs}
/>
```

## Guidance implemented
- CNA-1880 [R] 2 to 7±2 options (development warning outside 2 to 9).
- CNA-1890 [M] logical order: `ordering="logical"` keeps your order (related grouped, most common first), `frequency` sorts by use, `alphabetical` otherwise; CNA-1900 [R] keep identical option sets in the same order across a form.
- CNA-2050 [R] options marked `pinFirst` ('None', 'All') always come first.
- CNA-1910 [R] vertical by default.
- CNA-1920 [M] choosing an option with `reveals` announces that further fields appeared (polite live region); CNA-0920 [R] `prompt` text sits next to the option.
- CNA-2060 [R] sentence case on the legend and labels; CNA-2080 [R] write labels positively.
- CNA-1080..1180 required asterisk, missed shading with icon and screen-reader text.
- CNA-1930 [R] first option as default: available as `defaultSelection="first"`. The default is `none` [suggested], see below.

## Do and don't
- Do use `defaultSelection="none"` (the default) for clinical findings: a pre-selected answer would record a value nobody chose. This follows Terminology Elaboration 2.3.2 (no default values) and 2.2.3 ('Please specify' until chosen). Use `first` only for settings where a default is safe.
- Do include 'Not specified' where it is a legitimate answer (for example laterality).
- Don't nest radio buttons inside other radio or check box groups (CNA-1940).

## Accessibility
- Real `fieldset` and `legend`; each radio has its own `label`. Arrow keys move between options (native behaviour).
- Option prompts are linked with `aria-describedby`; required, missed and error text is linked to the fieldset.
