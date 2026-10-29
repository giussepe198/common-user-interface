# Switch

An on or off setting that takes effect at once, with the state in words beside the track.

## When to use
- Settings and view options that apply immediately (show inactive teams, notifications on).
- Not for clinical data or choices saved with a form: use Checkbox (CNA-1960).

## What you provide
- `checked` and `onChange(checked)` or `defaultChecked`. Inside a `FormField` the field label names it; standalone give `label`. Optional `onText` and `offText` (default "On" and "Off").

```tsx
<FormField label="Show inactive teams"><Switch onChange={setShowInactive} /></FormField>
```

## Guidance implemented
- CNA-1950 [M] the off state is the unambiguous opposite of on: thumb position, fill and the words "On" or "Off".
- [suggested] `role="switch"` button; immediate effect only.
- [suggested] Motion respects `prefers-reduced-motion`.

## Regional behaviour
None.

## Do and don't
- Do use a label that names the setting, not the action.
- Don't put a switch in a form that has a save button.

## Accessibility
- A `button` with `role="switch"` and `aria-checked`; Space and Enter toggle. The state words are hidden from screen readers (the role already says on or off) but shown on screen so colour is never the only cue.
- 44px target on coarse pointers.
