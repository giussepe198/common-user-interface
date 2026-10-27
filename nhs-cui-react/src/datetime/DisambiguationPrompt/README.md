# DisambiguationPrompt

An inline message that explains why an entry is unclear and offers at most two readings plus an option to enter something different.

## When to use

Used by DateInput (day and month either way round, two-digit years, incomplete dates) and DurationInput ("m" as months or minutes). Use it in any control where typed input can be read more than one way.

## What you provide

- `message` (what was entered and why it is unclear), `suggestions` (`{ label, value }`, at most two shown), `onSelect`, `onReenter`.
- `question` (default "Did you mean:"), `reenterLabel` (default "different date"), `autoFocus`.

```tsx
<DisambiguationPrompt
  message='You entered "05/04/2009". The day and month could be either way round.'
  suggestions={[{ label: '05-Apr-2009', value: a }, { label: '04-May-2009', value: b }]}
  onSelect={commit}
  onReenter={refocus}
/>
```

## Guidance implemented

- D+Tc-0005, D+Tc-0038 [M] a facility to disambiguate entries.
- D+Tc-0039 [M] the message says what was entered and what to do next.
- D+Tc-0040 [R] at most two suggestions plus a re-enter option; choosing a suggestion enters it.
- D+Tc-0037 [R] duration variant: "Did you mean: 6 months or 6 minutes?".
- Wording from the Quick Implementation Guide: "Did you mean: 05-Apr-2009 or 04-May-2009 or different date?".
- Dates inside messages never break across lines at their hyphens [suggested].

## Do and don't

- Do write messages that quote what the user typed.
- Don't offer three or more suggestions (extra ones are not shown).
- Don't use a generic message such as "Invalid input".

## Accessibility

`role="alertdialog"` labelled by the message, focus moves to the first suggestion when a choice is needed, Esc chooses re-enter.
