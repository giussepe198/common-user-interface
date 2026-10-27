# ReasonCodePicker

Reason code list (B3): large radio rows of code and meaning, a required free-text reason for configured codes, and extra checkbox prompts such as "Prescriber notified".

## When to use

- Recording why a dose was not given, or any coded reason with optional free text.

## What you provide

- `options`: `ReasonCodeOption[]` `{ code, label, legend?, hint?, showCode?, requiresReason?, notifyPrescriber?, prompts?, disabled? }`. The administration area's `adminReasonCodes(region)` fits directly.
- `value` / `defaultValue` / `onChange`: `{ code, reason, prompts }`.
- `legend`, `reasonLabel`, `reasonHint`, `alwaysShowReason`, `prescriberPromptLabel`, `requirePrescriberPrompt`, `showValidation`, `reasonMaxLength`, `disabled`.

```tsx
<ReasonCodePicker options={adminReasonCodes(region)} legend="NIMC code" value={choice} onChange={setChoice} showValidation={tried} />
```

Utilities: `reasonCodeProblems` (block the commit while non-empty), `reasonCodePrompts`, `reasonCodeCommitLabel` ("Record W: Withheld").

## Guidance implemented

- AU-MD-09 [M] and NZ NMC Figure 22: a written reason is required for the codes that need one; a "Prescriber notified" prompt for codes that require notifying the prescriber.
- Phase 4 mobile rules [M]: rows at least 52 px high, 16 px text, 22 px radio buttons.
- Codes are shown as text in a box next to the meaning, so the code is never conveyed by colour; the chosen row also shows its fuller legend.
- The prescriber prompt is optional by default [suggested]; set `requirePrescriberPrompt` where local policy requires it.

## Regional behaviour

- GB: the CUI guidance has no code set; pass codes with `showCode: false` and only the meanings are shown (G6, MEDa-0119).
- AU: NIMC codes A F R V L N W S (P on paediatric charts); W needs a reason; R and N prompt to notify the prescriber (G10 9.6, AU-MD-09).
- NZ: NMC codes such as CP D N R RV SM U W (G11, HQSC NMC user guide 2021).
- The control holds no code lists itself: the consumer passes them.

## Do and don't

- Do put the commit label from `reasonCodeCommitLabel` on the primary button.
- Don't auto-select a code.

## Accessibility

- Native radio buttons in a `fieldset` with `legend`; arrow keys move between codes. The code letters are read before the meaning ("W: Withheld").
- The reason field is `aria-required` when the code requires it; problems are linked with `aria-describedby` and shown with an icon and words.
