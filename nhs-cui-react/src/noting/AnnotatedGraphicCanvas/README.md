# AnnotatedGraphicCanvas

A canvas for annotating a simple body diagram with symbols, free-hand drawing, shading and text-boxes, in edit or view mode.

## When to use
- Recording the location of findings on a diagram within clinical notes (Noting with Graphics), for example wounds, bruises or rashes.
- Not for photographs, X-rays or 3D models (out of scope).

## What you provide
- `graphic` (title, size and images: line-art `paths` or an image `src`, each with an orientation label).
- `findings`/`onFindingsChange` (or `defaultFindings`), `mode` ('edit' or 'view').
- Optional `symbols` (default: exact location X, circle, triangle), `sideWidth`, `undoDepth`, `textPlaceholder`, `onRemoveModule`, `createId`.

```tsx
<AnnotatedGraphicCanvas graphic={adultBody} findings={findings} onFindingsChange={setFindings} />
```

## Guidance implemented
- Module: NwG-0112 [M] canvas and toolbar when editing; NwG-0113/0114 [M] canvas only and no editing in view mode; NwG-0116 [M] annotations shown at the same place and size; NwG-0012 [M] graphic first, then symbols, then text.
- Graphics: NwG-0001/0002 [M] line art drawn in grey with no fill (images are forced to greyscale); NwG-0088 [M] title; NwG-0008 [M] orientation labels; NwG-0009/0089 [M] no grids; NwG-0010 [M] the graphic cannot be deleted; NwG-0011 [M] annotation positions are stored relative to the graphic.
- Canvas: NwG-0090 [M] graphic centred; NwG-0005 [M] room for text on both sides and NwG-0007 [R] none above or below; NwG-0099 [M] never blank; NwG-0091/0083 [M] sized to the graphic and grows downwards for annotations; NwG-0100 [M] nothing outside the canvas; NwG-0101/0102 [M] no scrolling inside; NwG-0108 [M] a "More of the diagram is below" look-ahead bar while part of the canvas is in view and its bottom edge is off screen; it floats at the bottom of the viewport and takes no space below the drawing, and is not shown when the whole canvas is visible.
- Symbols: NwG-0028/0034 [M] pen and shading tools; NwG-0092 [M] an exact-location X; NwG-0031 [M] a single click places a symbol; NwG-0035/0036 [M] free-hand anywhere on the canvas, ready-made symbols only on the graphic; NwG-0040/0041 [M] symbols move with their text-box and arrow; NwG-0093/0094 [M] delete removes symbol, arrow and text together; NwG-0038/0039 [M] stroke-only symbols stay distinguishable when overlapping; NwG-0105/0106 [M] ready-made symbols (dark, thick), hand-drawn marks (accent colour) and arrows (dotted grey) look different; NwG-0064..0066 [M] semi-transparent bounding box while placing or dragging, gone when dropped.
- Text: NwG-0042 [M] all text in text-boxes; NwG-0055 [M] general comment boxes; NwG-0043/0045 [M] a text-box and arrow added automatically on the nearest side; NwG-0046 [M] never on top of other items; NwG-0086 [M] distinct arrow style; NwG-0053 [R] new boxes look different (dashed) until edited; NwG-0047 [M] the new box gets focus; NwG-0109/0097/0050 [M] never truncated, no length limit, grows as you type; NwG-0048/0115 [R] italic "Enter text here..." placeholder; NwG-0051 [R] bold and underline; NwG-0052/0095 [M] deleting a box deletes its arrow and symbol; NwG-0098 [M] boxes are never pre-filled with symbol details; NwG-0110 [M] boxes always shown.
- Toolbar: see `GraphicToolbar` (undo and redo, remove all with Cancel/Continue, grouped labelled tools, cursor per tool).
- Keyboard [suggested, the guidance does not cover it]: with a symbol or comment tool, arrow keys move a pointer on the canvas and Enter places; with Select, N and P select findings, arrow keys move them, Delete removes them.
- Keyboard pen [suggested, NwG-0028/0034 from the keyboard]: with the Pen or Shade area tool, Enter or Space on the drawing area puts the pen down at the keyboard pointer (the pointer fills in); arrow keys draw in 4 px steps (Shift: 16 px), Home, End, Page Up and Page Down draw diagonally, Backspace removes the last step, Enter or Space finishes the line (with its text-box, as for a pointer drawing), Escape cancels. Leaving the drawing area finishes the line; changing tool discards it.

## Do and don't
- Do supply a small set of symbols relevant to the graphic, sized to it (NwG-0032/0033/0111).
- Do load the age- and sex-appropriate graphic (NwG-0004/0087) with `GraphicPicker`.
- Don't code findings from the drawing: SNOMED CT coding of findings is out of scope.

## Accessibility
- The drawing area is an `application` with a description listing every annotation and the keyboard model; every text-box has a name such as "Text for Exact location (X)".
- Each text-box has a delete button with a descriptive name; changes are announced in a polite live region.
- Putting the pen down announces the drawing keys; finishing announces the new drawing, and Escape announces "Drawing cancelled."
