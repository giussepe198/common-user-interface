# IconButton

An icon command or display-only status icon with a function-based label, following the Icons and Symbology guidance.

## When to use

Toolbar and inline commands where a recognised icon helps quick recognition (Search, Refresh, Add), and status icons in lists (sealed record, repeat medication). For text commands use Button (core). For alerts use AlertSymbol.

## What you provide

- `icon` (core icon name), `label` (what it does, two or three words, sentence case).
- `showLabel` (default true), `labelPosition` (`"beside"` or `"below"`), `size` (16, 24, 32, 48).
- `variant` (`"global"`, `"toolbar"`, `"functional"`, `"component"`, `"inline-active"`, `"inline-status"`, `"information"`), `pressed`, `meaning` (`"error"`, `"caution"`, `"ok"`, `"advisory"`), `importance` (`"normal"`, `"high"`), `shortcut`, plus normal button props.

```tsx
<IconButton icon="search" label="Search" shortcut="Ctrl+F" onClick={openSearch} />
<IconButton icon="lock" label="Sealed record" variant="inline-status" />
```

## Guidance implemented

Icons and Symbology is initial guidance with confidence levels (H, M, L) rather than mandatory status; (M) below means medium confidence.

- 2.1.5 (M) every icon has explanatory text: the label is visible by default and is always the accessible name; it names the function ("Save", not "Disk", alertsymbdes 8).
- 2.2 labels (M): brief (a console warning above three words), plain sans serif, no bold, italic, underline or colour emphasis, sentence case, consistent position (beside or below).
- 2.2 colour (M): red no-go, yellow caution, green acceptable, blue advisory only, and only as a secondary cue to the label.
- 2.3 conveying importance (L): "high" importance uses a larger icon, heavier border and more space, and never blue or green.
- 2.3 (M) icons must not be the only way to a function: `shortcut` is shown in the tooltip and as `aria-keyshortcuts`.
- Table 4 sizes: 16 lists, 24 menus and toolbars, 32 and 48 larger surfaces.
- Table 6 categories and states: buttons are Enabled, Active (`pressed`) or Disabled; information and inline status icons are display only and not focusable.

## Do and don't

- Do keep `showLabel` on for abstract or safety-critical icons.
- Don't use colour as the only difference between two icons.
- Don't use a generic system icon to stand for clinical information (iconssymb 2.3).

## Accessibility

Real `<button>` elements with visible focus; icon-only buttons use the label as `aria-label` and tooltip; toggle state through `aria-pressed`; status icons are `role="img"` with the label as the name.
