# IndigenousStatusInput

The Australian standard Indigenous status question as a checkbox group, so that a person of both Aboriginal and Torres Strait Islander origin can mark both "Yes" boxes.

## When to use

- Registration and admission forms in Australian mode (METeOR 602543). Ask every person; never guess.

## What you provide

- `value`/`onChange(code)` or `defaultValue` (METeOR code "1", "2", "3", "4", "9" or null), `purpose`, `showBothInstruction`, `showDerivedCode`, `allowNotStated`, `error`.
- Interviewer version: `variant="interviewer"`, `includeBoth`, `personName`, `showInterviewerNote`.

```tsx
<IndigenousStatusInput value={status} onChange={setStatus} purpose="Asked of everyone, to plan culturally safe care." />
```

## Guidance implemented

- METeOR 602543 [M]: question "Are you of Aboriginal or Torres Strait Islander origin?" with boxes in this order: No; Yes, Aboriginal; Yes, Torres Strait Islander.
- AU-IS-01 [M]: checkbox group, not radios; both "Yes" boxes give code 3; the derived code is shown read-only ("Recorded as: ... (code 3)").
- AU-IS-02 [M]: no default selection.
- "No" and the "Yes" boxes exclude each other [suggested].
- METeOR collection guidance: a separate "Not answered" choice records code 9 when the person declined or could not be asked; it is kept apart from the standard boxes so the question stays exact [suggested].
- The instruction "For persons of both Aboriginal and Torres Strait Islander origin, mark both 'Yes' boxes." is [UNCERTAIN] wording (ABS standard); hide it with `showBothInstruction={false}` or replace the constant.
- METeOR 602543 interviewer version (G12 section 8) [M]: `variant="interviewer"` asks Q1 "Are you of Aboriginal or Torres Strait Islander origin?" (Yes; No, no more questions), then Q2 "Are you of Aboriginal origin, Torres Strait Islander origin, or both?" (Aboriginal; Torres Strait Islander; Both Aboriginal and Torres Strait Islander). Codes 1, 2, 3, 4 as the standard. `includeBoth={false}` drops "Both" (agency practice, METeOR). `personName` gives the third-party wording "Is (name) ...". A note reminds the interviewer to ask as written and not to read out the Q2 categories (METeOR: "not required to prompt") [suggested wording].
- The verified METeOR self-completed instruction is "If you are of both Aboriginal and Torres Strait Islander origin, answer using both 'Yes' options." It is available as `AU_INDIGENOUS_STATUS_QUESTION.bothInstructionMeteor`; the default instruction is unchanged to keep existing behaviour.

## Do and don't

- Do ask every person, regardless of appearance or name.
- Don't pre-fill from other records or infer from a name.

## Accessibility

- `fieldset` and `legend`; each box has a label; the derived result is an `output` with `aria-live="polite"`.

## Regional behaviour

- AU only. NZ uses `EthnicityInput`, `MaoriDescentInput` and `IwiInput`. Source: https://meteor.aihw.gov.au/content/602543
- Interviewer version: METeOR 602543 (G12 section 8).
