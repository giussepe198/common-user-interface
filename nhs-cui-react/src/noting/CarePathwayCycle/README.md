# CarePathwayCycle

Experimental. A long-term condition pathway drawn as a cycle: phases as concentric rings, the stages of one cycle around its ring, with controls for earlier cycles and other phases.

## When to use
- Long-term or cyclical care (for example Parkinson's disease with Maintenance, Complex and Palliative phases) where a linear `PathwayTimeline` with start and goal would mislead. Built from the Care Pathways conceptual model (2007): every rule is a conceptual design point, not baselined guidance.

## What you provide
- `title`, `phases` (outermost ring first), each with `state` ('active', 'visited', 'unvisited'), optional `periodicity` ("every 6 months") and `cycles` (earliest first) of `stages` (`kind` 'care', 'review' or 'milestone'; `state` 'completed', 'current', 'future' or 'failed'; optional `team`, `when`).
- Optional controlled or uncontrolled `phaseId`, `cycleIndex`, `focusStageId`, `collapsed` (with `default...` and `on...Change`), `status`/`statusReason`, `event`, `size` (default 260).

```tsx
<CarePathwayCycle title="Parkinson's disease" phases={phases}
  focusStageId={focus} onFocusStageChange={setFocus}
  status="paused" statusReason="Hospitalisation"
  event={{ label: 'Hospital admission 02-Mar-2026', onOpen: openAdmission }} />
```

## Guidance implemented
- Long-term cycles (Care pathways conceptual model): phases as concentric circles with active, visited and not-yet-visited states (solid accent, solid grey, dashed); the same vocabulary as linear pathways but no start or goal symbols; circle = care stage, diamond = decision or reassessment; a repeats arrow with the periodicity ("Repeats every 6 months") stands for "no projected end".
- Spinner controls move to previous cycles of the same phase (showing their completed and failed stages) and to other phases; future stages of the current cycle show as not attempted (dashed outline).
- "You are here" marks the current stage; the focus ("cycle focus is here") is separate and moves with the arrow keys or a click. Share `focusStageId` with a `PathwayTimeline` to link the two foci.
- Status by shape, symbol and text as well as colour: tick for completed, cross for failed, and each stage's state written in the list.
- Collapsible (Hide diagram / Show diagram) to a mini diagram with a one-line summary.
- A paused pathway shows "Paused: <reason>" and an optional event marker (for example a hospital admission) that links to the record.
- [suggested] Square for milestones (the model names milestones but gives no symbol); the stage list beside the diagram is the accessible and keyboard route; the diagram is decorative.

## Do and don't
- Do give the periodicity for phases that repeat.
- Don't use it for pathways with a defined end; use `PathwayTimeline`.

## Accessibility
- The diagram is hidden from assistive technology; the ordered stage list beside it gives each stage's number, title, kind, state, date and team.
- The list uses a roving focus: Up and Down (and Home, End) move the focus; the current stage has `aria-current="step"`.
- The spinners are labelled buttons ("Previous cycle", "Next phase"); changes are announced in a polite live region.

## Regional behaviour
- None. Text is supplied by the host.
