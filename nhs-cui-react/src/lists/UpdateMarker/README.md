# UpdateMarker

The update symbol for lists: a small corner triangle at the top right of a cell or entry, with a highlight background, that the user selects to unmark.

## When to use

Mark content that has changed since the user last looked: an updated cell, sublist entry or newly added patient row (PAL-0880..0950). `PatientList` and `SubList` use it; use it directly in other lists and tables.

## What you provide

```tsx
// Wrapping content: highlight background plus the triangle.
<UpdateMarker label="Working diagnosis" onUnmark={() => unmark('u3')}>Community-acquired pneumonia</UpdateMarker>

// Symbol only, inside a cell you style yourself (the cell must be position: relative).
<td className="my-cell my-cell--updated">{value}<UpdateMarker label="NEWS2 score" onUnmark={...} /></td>

// Removed content (PAL-0910).
<UpdateMarker label="Result" removed onUnmark={...} />
```

## Guidance implemented

- PAL-0880 [M] update symbol (corner triangle) plus a visual difference (highlight background); the symbol sits in the corner padding and never covers content.
- PAL-0900 [M] use at entry level inside sublists (see `SubList`).
- PAL-0910 [R] `removed` shows "Item removed" in place of the content.
- PAL-0930 [R] selecting the triangle unmarks that update.
- PAL-0940/0950 [R] for added or removed patients put the marker in the patient identification cell and highlight the whole row (PatientList does this).
- PAL-0970 [R] marks are per user: keep them in the current user's state.

## Do and don't

- Do give a `label` that names what changed; it is read with the button.
- Don't use the marker for task status, responsibility or acceptance.
- Don't let the marker overlap text: keep the right padding (the wrapper adds it).

## Accessibility

- A real `button` named "Updated Working diagnosis. Unmark", with a tooltip "Select to unmark".
- In the Tab order by default; set `focusable={false}` inside a grid that has its own arrow-key navigation and offers unmarking another way.
- The highlight is not the only cue: the triangle shape and the button name carry the meaning. The focus ring shows the whole marker square `[suggested]`.
