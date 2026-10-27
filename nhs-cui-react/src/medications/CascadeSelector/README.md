# CascadeSelector

Cascading lists shown after a drug is selected (the cascading route list), letting the prescriber choose route, then form or strength, before template prescriptions.

## When to use

- In the Search and Prescribe flow between DrugSearch and TemplatePrescriptionList or the prescription form.
- Not before a drug is selected (MSP-0850).

## What you provide

A tree of up to three levels; each option may carry its `next` level, so later lists only offer values relevant to the earlier choice.

```tsx
<CascadeSelector
  root={{
    id: 'route', label: 'Route',
    options: [
      { id: 'oral', label: 'oral', drug: { genericName: 'diltiazem' }, kind: 'generic', next: formLevel },
      { id: 'mr', label: 'oral – modified-release', drug: { genericName: 'diltiazem', brandName: 'Dilzem SR' }, kind: 'brand' },
    ],
  }}
  onComplete={(path, options) => showTemplates(path)}
  onOther={levelId => openFullForm()}
/>
```

`cascadeLevelsForPath(root, path)` returns the visible levels for a path (useful for SelectionTrail).

## Guidance implemented

- MSP-0850 [M], MSP-0860 [M]: up to three lists; each appears when the previous one has a selection.
- MSP-0870 [M]: lists are as wide as their longest entry; no truncation.
- MSP-0890 [M]: options come from the selected option's `next`, so they are relevant to it.
- MSP-0910 [M], MSP-0920 [R]: lists sit side by side and wrap, never overlap; selections stay visible and highlighted.
- MSP-0940 to MSP-0960 [M]: "other..." last, below a line, no shortcut; `otherLabel` can rename it ("specialist routes...") or remove it (null).
- MSP-0970 [R]: modified-release options are ordinary items ("oral – modified-release").
- MSP-0980 to MSP-1020 [M/R]: items can include the drug name ("atenolol – oral"); brand items form a second part below generic items.
- MSP-1040 [M]: `onComplete` fires when the last list has a selection.

## Do and don't

- Do keep "oral" and "oral – modified-release" separate so templates never mix them.
- Don't put template prescriptions in these lists.

## Accessibility

- Each list is a `listbox` named by its visible heading; Up and Down move, Enter or Space select and move to the next list, Right and Left move between lists, Esc returns to the previous list.

## Regional behaviour

- Drug names in items: GB brand in capitals; AU brand in Title Case italic with mixed-case lettering (on-screen 6.1.3, 6.1.4); NZ Title Case with HQSC Tall Man lettering. `tallManLettering` overrides.
