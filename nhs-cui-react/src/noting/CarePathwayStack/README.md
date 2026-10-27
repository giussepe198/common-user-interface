# CarePathwayStack

Experimental. All the care pathways a patient is on, stacked, each with its status and window-style size controls.

## When to use
- A patient summary showing several pathways at once (Care Pathways conceptual model, 2007).

## What you provide
- `pathways`, optional `sizes`/`defaultSizes`/`onSizesChange` ('collapsed', 'medium', 'expanded'), `defaultSize`, `title`.

```tsx
<CarePathwayStack pathways={[hip, copd, diabetes]} />
```

## Guidance implemented
- Shows how many pathways the patient is on; pathways stacked vertically with a title bar each; minimise, compact ("mediumise") and maximise controls on the right; a collapsed pathway still shows the current stage.
- Abnormal or paused pathways stand out by contrast, an icon and text, with the reason ("Paused: Hospitalisation") visible even when collapsed.
- Pathways can be shrunk but not hidden.
- National guidance shown when maximised.

## Do and don't
- Do give a reason for every paused or abnormal status.

## Accessibility
- Each pathway has a heading; size controls are buttons with `aria-pressed` and names including the pathway title; status uses icon and text, not colour alone.
