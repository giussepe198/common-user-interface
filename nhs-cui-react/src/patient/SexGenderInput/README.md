# SexGenderInput

Input for Current Gender or Sex using option buttons (preferred) or a drop-down, with the exact valid values in the mandated order.

## When to use

- Recording Current Gender (self-assigned) or Sex (as registered). Use two instances when both are needed.
- Use `variant="select"` only when space is short.

## What you provide

- `kind` ("currentGender" or "sex"), `value`/`onChange` or `defaultValue`, `variant`, `orientation`, `showDefinitions`, `error`.

```tsx
<SexGenderInput kind="currentGender" value={gender} onChange={setGender} />
<SexGenderInput kind="sex" value={sex} onChange={setSex} error={sexError} />
```

## Guidance implemented

- CGS-0001, CGS-0009 [M]: labels "Current Gender" and "Sex".
- CGS-0002, CGS-0003, CGS-0020, CGS-0021, CGS-0025 [M]: Current Gender has exactly Male, Female, Other Specific, Not Known, Not Specified, in that order.
- CGS-0010, CGS-0011, CGS-0023, CGS-0024 [M/R]: Sex has exactly Male, Female, Not Known, Indeterminate, in that order.
- CGS-0005, CGS-0006, CGS-0012, CGS-0014 [M]: full words only, never codes.
- CGS-0008 [R]: Current Gender defaults to "Not Known".
- CGS-0013, CGS-0028, CGS-0030 [M/R]: Sex starts with nothing selected; the drop-down starts blank with no prompt and the blank option disappears once a value is chosen, so it cannot return to null.
- CGS-0026, CGS-0027, CGS-0029 [M]: one control per concept; the Current Gender drop-down has no prompt.
- CGS-0022 [R]: tab and arrow-key order follow the display order (native radio group).
- CGS-0021 [M]: `orientation="horizontal"` fills top to bottom, then left to right.
- CGS-0004, CGS-0015, CGS-0017..0019 [M/R]: short definition on the label, per-value definitions as tooltips and linked descriptions, and "About ... values" opens the full definitions.

## Do and don't

- Do use the radio variant where there is room.
- Don't pre-select a Sex value.
- Don't use checkboxes or a multi-select.

## Accessibility

- Radio variant uses `fieldset` and `legend`; each option's definition is linked with `aria-describedby`.
- Drop-down variant uses a native `select` with a visible `label`.
- Errors use `role="alert"` and are linked to the group.

## Regional behaviour

- GB: unchanged (CGS rules; Current Gender defaults to "Not Known").
- AU: ABS 2020 questions as the legend: "How do you describe your gender?" with the required note "Gender refers to current gender, which may be different to sex recorded at birth", and "What was your sex recorded at birth?". Options in the ABS order with METeOR codes as values; code 9 is administrative and never offered (AU-SG-02). No default. "I use a different term (please specify)" and "Another term (please specify)" open a "Please specify" box (`detail`).
- NZ: "What is your gender?" with HISO 10046 codes in the Stats NZ order Male, Female, Another gender, then "Unspecified or unknown" [suggested order]; te reo labels with `teReoLabels`; "Another gender" opens a gender detail box of up to 150 characters. "What was your sex at birth?" with the note "(for example, what was recorded on your birth certificate)"; code 3 only with `includeAnotherTerm` (perinatal data).
- AU and NZ: `purpose` explains why the question is asked (Stats NZ: collect sex at birth only with a purpose, and with gender).
- Not built: variations of sex characteristics, sexual orientation and transgender status questions (ABS 2020, Stats NZ).
