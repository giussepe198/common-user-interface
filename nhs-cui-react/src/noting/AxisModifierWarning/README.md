# AxisModifierWarning

A modal warning shown when the additional text mentions someone else (for example "Mother") and the concept would otherwise be recorded about the patient.

## When to use
- On OK in an encoding dialog when the additional text contains an unconfirmed axis modifier (`SingleConceptEncoder` does this for you).

## What you provide
- `conceptLabel`, `modifierText`, `onConfirmModifier`, `onLeaveAsIs`.
- Optional `confirmLabel`, `leaveLabel`, `inline`.

```tsx
<AxisModifierWarning conceptLabel="Breast cancer" modifierText="Mother"
  onConfirmModifier={recordAsFamilyHistory} onLeaveAsIs={save} />
```

## Guidance implemented
- G8 AxisModifierWarning (Elaboration 2.2): a plain explanation of the problem and exactly two resolutions; never a Yes/No/Cancel triplet.
- Button labels "Confirm <modifier> has <concept>" and "Leave note as it is" are [suggested] in the notes.
- Heading "Check who this applies to" [suggested].

## Do and don't
- Do record the modifier as structured context (for example family history) when confirmed.
- Don't show it for every family word in long notes: only on OK for unconfirmed modifiers.

## Accessibility
- `alertdialog` with the heading as name and the explanation as description; focus moves to the first button and stays in the dialog; Escape leaves the note as it is.
