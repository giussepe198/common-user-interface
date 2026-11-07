# Fieldset

A named section of a form (a native fieldset whose legend is a subheading) that holds rows and grids of fields.

## When to use
- To group related rows under a name, such as "Contact details" or "Next of kin".
- Not for a group of check boxes or radios: `CheckboxGroup` and `RadioGroup` label their own group so they can line up in a row.

## What you provide
- `legend`, optional `description`, `hideLegend` when a visible heading already names the section, `disabled` to disable every control inside.

```tsx
<Fieldset legend="Contact details" description="How the service reaches the person.">
  <FormGrid columns={2}>...</FormGrid>
</Fieldset>
```

## Guidance implemented
- CNA-0430 [R] hierarchical belonging: the fields of a section sit together under one name.
- CNA-2060 [R] the legend in sentence case (the consumer supplies it).
- [suggested] Consecutive fieldsets are separated by a rule and space; the legend uses the subheading type token.

## Regional behaviour
None.

## Do and don't
- Do keep legends short and specific.
- Don't nest fieldsets more than one level, and don't put a Fieldset inside a FormRow or FormGrid.

## Accessibility
- Native `fieldset` and `legend`: the section name is announced when focus enters it. The description is linked with `aria-describedby`.
- `hideLegend` hides the legend visually only.
