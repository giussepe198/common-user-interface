# MultiSelect

Several choices from a list: chosen options show as chips inside the box and a text box filters a multi-select popup list.

## When to use
- Choosing several items from a long list (languages spoken, teams involved).
- For ten or fewer options that fit on screen use CheckboxGroup (CNA-1980).

## What you provide
- Put it in a `FormField`. `options` or `loadOptions`, `value` (`FormOption[]`) and `onChange(options)` or `defaultValue`, optional `placeholder`, `name` (one hidden input per value).

```tsx
<FormField label="Languages spoken"><MultiSelect options={languages} /></FormField>
```

## Guidance implemented
- CNA-1970 [M] the choices are independent; CNA-1950 [M] an option is plainly chosen (tick and `aria-selected`) or not.
- CNA-1890 [M] logical order kept; matches with the typed text first.
- Matching 2.3.1 and CNA-0340 as Combobox (async order, no-matches message).
- [suggested] Enter or a click toggles an option and the list stays open; Backspace in the empty text box removes the last chip; chips have remove buttons; each change is announced ("English added. 2 selected").
- [suggested] The box is exactly the control height on one line and grows downwards as chips wrap, so its top stays level with the controls beside it.

## Regional behaviour
Macron-insensitive matching; labels keep their macrons and `lang`.

## Do and don't
- Do keep chip labels short.
- Don't use it when a missed option is a safety issue and the full list fits as check boxes.

## Accessibility
- `role="combobox"` controlling a `listbox` with `aria-multiselectable="true"`; options carry `aria-selected`.
- The current selection is a linked description ("2 selected: English, Te reo Māori"). Chip remove buttons are for pointers; keyboard users toggle options in the list or use Backspace.
