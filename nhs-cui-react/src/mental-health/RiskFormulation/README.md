# RiskFormulation

A risk formulation in words: static, dynamic and protective factors as lists, a plain-language summary and the plan, in read and edit modes.

## When to use

- The risk screen and the risk review form.

## What you provide

- `value` / `defaultValue` / `onChange` (`RiskFormulationValue`), `mode` (`read` or `edit`), `onEdit`, `onSave`, `onCancel`, `recordedBy`, `recordedAt`, `reviewDue`, `labels` (the service's form wording, including `judgements` and `reviewNotSet`), `now`, `timeZone`.
- `factorGroups`: the factor lists the form records, in order (default all three); a form with only protective factors passes `['protectiveFactors']` so no list it never asks for reads "None recorded" [suggested].
- `judgements`: the clinician's judgement per area of risk in words (`area`, `judgement`, `rationale`), shown first in read mode [suggested]. Words only, never a score or computed level.
- `children`: more content after the plan in read mode, such as an instrument's scores marked "For information, not a decision".

```tsx
<RiskFormulation mode={editing ? 'edit' : 'read'} value={f} onChange={setF} onEdit={() => setEditing(true)} onSave={save} reviewDue={f.reviewDue} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Risk and protective factors, narrative formulation and the plan; no score that determines care. The control has no field for a score or level [suggested].
- Static and dynamic factor split and default labels are [suggested]; the service's form definition may rename them.
- Review date shown; "Review overdue" in words once passed [suggested].
- Empty is "No risk formulation recorded" [suggested].
- Plain language: the summary hint asks for words the person would understand [suggested wording].
- Controlled and uncontrolled through `useControllableState` (CONVENTIONS) [suggested].
- Fields are stacked one per line, so no side-by-side fields need `FormRow` [suggested].
- Save needs a summary; blank factors are removed on save [suggested].

## Do and don't

- Do record who and when; the control shows it.
- Don't add a numeric rating to the plan or summary.

## Accessibility

- Each factor group is a `fieldset` with a legend; each factor has a visible label ("Dynamic factor 2"); remove buttons are named after the factor; adding focuses the new field; the summary error is linked and announced.

## Regional behaviour

- None.
