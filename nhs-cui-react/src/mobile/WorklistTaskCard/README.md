# WorklistTaskCard

One cross-patient task on the nursing worklist (concept B1): full identity strip, due state by shape and word, the order or task, a high-risk tag and a Start button.

## When to use

- Inside Worklist, or on its own wherever a single task for a patient is listed away from the patient's record.

## What you provide

- `task`: `WorklistTask` `{ id, kind: 'medication' | 'observations' | 'other', patient, dueAt, medication?, title?, detail?, highRisk?, completedAt?, tolerance?, priority?, actionLabel? }`.
- `now`, `tolerance`, `onStart`, `similarNames`, `similarNameLabel`, `region`, `dateFormat`, `nameElement`.

```tsx
<WorklistTaskCard task={task} now={now} onStart={openAdministration} />
```

## Guidance implemented

- Phase 4 rules [M]: every card shows name, born, primary identifier and location, because the list mixes patients.
- AU-PI-04 [M] and PAL-0540 to PAL-0570 [R]: similar-name flag with icon and words.
- MEDa-0120 [M] applied to tasks: overdue, due, next and done differ by shape (filled circle "!", square with clock, dashed square, filled tick) and word, with the time.
- Medication tasks use MedicationLine (wrapping, regional lettering).
- High-risk tag in words ("High-risk: second check", P4).
- Start is 48 px high and named "Start: paracetamol for CHEN, Wei". Below 340 px it moves to a full-width row [suggested].

## Regional behaviour

- Names, identifiers and dates follow the region (AU-PI-02, G10 1.6, G11 2.3); medication lines follow the region's on-screen rules.

## Do and don't

- Do keep the identity strip even when the list is filtered to one patient.
- Don't start a task by swiping.

## Accessibility

- `article` named "Overdue task for CHEN, Wei"; the patient name is a heading.
