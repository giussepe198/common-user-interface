# MandatoryQualifierSelect

A required qualifier for a concept, such as laterality, that must be chosen before the concept can be encoded.

## When to use
- Inside an encoding dialog (`SingleConceptEncoder`) or a suggested-match card when the concept needs laterality or a similar qualifier.

## What you provide
- `label`, `options` (only values sanctioned for the concept), `conceptName`, `value`/`onChange`.
- Optional `placeholder` (default "Please specify"), `locked` (after confirmation).

```tsx
<MandatoryQualifierSelect label="Laterality" conceptName="Fracture of radius"
  options={[{ value: 'L', label: 'Left' }, { value: 'R', label: 'Right' }]} value={lat} onChange={setLat} />
```

## Guidance implemented
- Elaboration 2.2.3: yellow background until a value is chosen, then normal; asterisk with a key ("Mandatory", use `RequiredKey` at the foot of the dialog); message "You must select from this list to be able to encode '<concept>'" on hover and focus and as visible help; the parent keeps OK disabled until set.
- Elaboration 2.3.2: no default value; the first entry is "Please specify".
- After confirmation the qualifier is locked and cannot be changed on its own (`locked`).

## Do and don't
- Do keep confirmation (OK, tick) disabled while it is unresolved.
- Don't pre-select a value, even the most common one.

## Accessibility
- Native select with a visible label, `aria-required` and `aria-invalid` while unresolved; the reason is linked with `aria-describedby`.
- The asterisk is hidden from screen readers and replaced by "(mandatory)".
