# GraphicToolbar

The toolbar of the annotated graphic canvas: select, ready-made symbols, pen and shading, comment, format, undo, redo, delete and remove all.

## When to use
- With `AnnotatedGraphicCanvas` (which renders it in edit mode), or on its own if you build a custom canvas.

## What you provide
- `tool`/`onToolChange`, `symbols`, `canUndo`/`onUndo`, `canRedo`/`onRedo`, `canRemoveAll`/`onRemoveAll`.
- Optional `onDeleteSelected`/`canDeleteSelected`, `emphasis`/`onToggleEmphasis`, `onRemoveModule`, `label`.

```tsx
<GraphicToolbar tool={tool} onToolChange={setTool} symbols={symbols} canUndo={past.length > 0} onUndo={undo}
  canRedo={future.length > 0} onRedo={redo} canRemoveAll={findings.length > 0} onRemoveAll={confirmClear} />
```

## Guidance implemented
- NwG-0067 [M] undo and redo, at least one level.
- NwG-0103 [M] delete one item; NwG-0069 [M] remove all (the canvas asks Cancel/Continue first, NwG-0070 [M]).
- NwG-0075 [R/M] related tools grouped and labelled (Select, Symbols, Draw, Text, Format, Edit).
- NwG-0076 [M/R] every tool has a visible text label and a tooltip.
- NwG-0051 [R] bold and underline for the text-box in focus.
- NwG-0018 [M/R] "Remove diagram" where the context allows removing the module.
- Group names, tool names and icons are [suggested].

## Do and don't
- Do keep the set of symbols small and specific to the graphic.
- Don't hide labels to save space; wrap onto a second row instead.

## Accessibility
- `role="toolbar"` with one tab stop; Left, Right, Home and End move between tools; tool buttons use `aria-pressed`.
