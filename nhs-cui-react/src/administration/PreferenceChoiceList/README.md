# PreferenceChoiceList

Single-choice list where options carry decision support preference ratings, with an explanation window per rated option.

## When to use

- Choosing between drugs, doses or other options where decision support rates them, for example a list of antihypertensives.

## What you provide

- `label`, `options` (`id`, `label`, optional `preference` with `level`, `reasons` and `explanation` content for `InformationWindow`), `value`/`defaultValue`/`onChange`, `onRecordResponse(optionId, response)`.

```tsx
<PreferenceChoiceList
  label="Antihypertensive"
  options={[{ id: 'aten', label: 'Atenolol 25 mg tablets', preference: { level: 1, reasons: ['Asthma recorded'], explanation: { summaries } } }]}
  onChange={setChoice}
/>
```

## Guidance implemented

- 2.3: preference icon to the left of each rated option; tooltip of reasons (bulleted when several); clicking the icon opens an "Explanation" information window beside the top right of the list; clicking outside or Dismiss closes it; Record Response records and closes; all reasons for one option in the same window.
- 2.3: the user can still choose any option; ratings never block a choice.
- [suggested] Esc closes the window and returns focus to the icon; on narrow screens the window drops below the list.

## Do and don't

- Do keep the option order your clinical rules require; the list does not sort by preference.
- Don't hide low-preference options.

## Accessibility

- A fieldset with a legend and native radio buttons (arrow keys move between options).
- Each preference icon is a separate button with the option name in its accessible name and `aria-expanded`.

## Regional behaviour

No differences between GB, AU and NZ.
