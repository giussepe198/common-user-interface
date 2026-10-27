# PreferenceIcon

Five-level bar icon showing how strongly an option or action is preferred, with the reasons in a tooltip.

## When to use

- To the left of options in a choice list (`PreferenceChoiceList`) and of actions in alerts and information windows.

## What you provide

- `level` 1 to 5, `reasons`, and `onClick` when it opens an explanation (with `optionLabel` and `expanded`).

```tsx
<PreferenceIcon level={4} reasons={['Potential drug-drug interaction with Furosemide']} />
```

## Guidance implemented

- 2.3: placed left of the option; unique icon per rating; five levels (summary deck); hover shows a brief reason, several reasons as a bulleted list; clicking opens the information window.
- 2.2: example tooltip "High Preference Option".
- [suggested] Level wording "Lowest" to "Highest preference option".

## Do and don't

- Do give a reason for every rating.
- Don't rely on the bar fill alone in your own layouts; keep the text alternative.

## Accessibility

- Static: `role="img"`, focusable, named by its level, described by the reasons; the tooltip shows on hover and keyboard focus.
- Clickable: a button named "<level> for <option>. Show explanation" with `aria-haspopup="dialog"` and `aria-expanded`.

## Regional behaviour

No differences between GB, AU and NZ.
