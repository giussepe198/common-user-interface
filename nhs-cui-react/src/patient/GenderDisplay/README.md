# GenderDisplay

Shows a patient's Current Gender or Sex as a labelled value, in full words, with definitions.

## When to use

- Read-only display of Current Gender (self-assigned) or Sex (as registered) outside the patient banner.
- The patient banners use it with `label="Gender"`.

## What you provide

- `kind` ("currentGender" or "sex"), `value`, optional `label`, `showDefinitions`, `layout`.

```tsx
<GenderDisplay value="Not Known" />            // Current Gender Not Known
<GenderDisplay kind="sex" value="Female" />    // Sex Female
```

## Guidance implemented

- CGS-0007, CGS-0016 [R]: labels "Current Gender" and "Sex".
- CGS-0002, CGS-0003, CGS-0010, CGS-0011 [M]: only the valid values are shown.
- CGS-0005, CGS-0012 [M]: never abbreviated.
- CGS-0006, CGS-0014 [M]: codes ("1", "2") and abbreviations ("M") are never shown; anything that is not a valid value shows "Not Known" instead.
- CGS-0004, CGS-0015, CGS-0017..0019 [M/R]: short definition on the label, value definition on the value, both as keyboard-accessible tooltips.
- MPB-0034 [M]: no symbols or pictograms.

Where the source documents disagree (the safer option is used):

- The banner guides require the label "Gender" (PAB-0035, MPB-0033); the gender guide recommends "Current Gender" (CGS-0007). This control defaults to "Current Gender"; the banners pass "Gender" with a definition that says it is the current gender.

## Do and don't

- Do label Current Gender and Sex distinctly when both are shown.
- Don't use Current Gender for clinical decisions such as prescribing.

## Accessibility

- Definitions open on keyboard focus as well as hover and close with Esc.

## Regional behaviour

- GB: unchanged (CGS rules, full-text values only).
- AU: `value` is a METeOR code ("1".."5", "9") or letter code (M, F, X, T, Z); shown as the ABS 2020 label, e.g. "Non-binary", never as the code (AU-SG-01, AU-SG-02). `kind="sex"` is labelled "Sex recorded at birth" (METeOR 741686). `detail` shows the person's own words for "different term".
- NZ: `value` is the HISO 10046 code F, M, O or U (or Stats NZ sex at birth 1, 2); `kind="sex"` is labelled "Sex at birth". With `teReoLabels` the te reo Māori label follows, e.g. "Female / Wahine", marked `lang="mi"`. `detail` shows gender detail for O.
- Legacy METeOR sex code N (3 = "Intersex or indeterminate") is exported as `AU_LEGACY_SEX_CODE_N` for mapping older feeds; it is not accepted directly because code 3 means "Another term" in the current set.
