# PathwayTimeline

Experimental. One care pathway as stages from left to right, showing where the patient is, what went right and what went wrong.

## When to use
- Showing a patient's progress along a care pathway. Built from a conceptual model with illustrative wireframes (Care Pathways, 2007): every rule is a conceptual design point.

## What you provide
- `pathway` (title, status, stages with bundles, optional boundaries, goal, precursor).
- Optional `focusId`/`onFocusChange`, `capacity` (default 9), `showBundles`.
- `pathway.subPathways` (each: `title`, `fromStageId`, `route` 'past', 'current' or 'unattempted', optional `boundaryLabel`, `goal`, `stages`) shows them beside the pathway. Optional `splitPercent`/`defaultSplitPercent` (58)/`onSplitChange` and `expandedSubPathways`/`defaultExpandedSubPathways`/`onExpandedSubPathwaysChange`.

```tsx
<PathwayTimeline pathway={hipReplacement} />
```

## Guidance implemented
- Left-to-right stages with start and goal markers; stages labelled A, B, C; all stages always visible without scroll bars: distant stages shrink to strips and long runs merge into composite blocks; at least the previous, current and next stages shown in detail.
- Current (blue keyline, "You are here") and focus (focus outline, moved with arrow keys or a click) are different.
- Status by symbol and colour: tick success, cross failed, warning; bundles with tick, cross, bullet for future or not attempted, bold for active; a flag for key decisions with the following action in bold capitals.
- Targets: actual and target time, missed targets in a distinct style with an icon.
- Boundaries of care as dotted separators with a label and arrow; stage groups ("Day of operation") as non-interactive markers.
- Details on hover and on focus in a line under the pathway.
- Sub-pathways and other routes: a heading per route with collapse and open chevrons controlled by the user; the route state (completed, current, not taken) by icon and text; the stage it leaves from and the boundary of care at the junction (transfer of responsibility); a collapsed sub-pathway keeps its title and current stage visible, with all its stages in the tooltip; an open one shows its own timeline. The stage a route leaves from carries a "Route:" or "Other route:" marker with an arrow.
- Resizable split between the pathway and its sub-pathways (col-resize cursor on the boundary), from 25% to 80% of the width; stages of the main pathway shrink to strips rather than scroll. Below 720px wide they stack and the split is not offered [suggested].
- Long-term cycles are a separate component, `CarePathwayCycle`.

## Do and don't
- Do keep bundle titles short.
- Don't use it as a Gantt chart: sequence matters more than time.

## Accessibility
- Stages are an ordered list; each stage is focusable with a name stating its letter, title, state and status; Left, Right, Home and End move the focus; strips and groups are buttons that open them.
- The split boundary is a focusable `separator` with its value as a percentage: Left and Right move it by 2% (Shift: 10%), Home and End go to the limits. Sub-pathway headings are buttons with `aria-expanded`.
