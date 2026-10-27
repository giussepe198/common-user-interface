# TemplateBrowseTree

Experimental. A right-hand panel showing the form's structure for browsing, with "Open full form".

## When to use
- Alongside template and section search (Noting Using Templates, Theme 7).

## What you provide
- `sections` (tree), `onOpenSection(section, path)`.
- Optional `onOpenFullForm`, `addressedIds`, `open`/`defaultOpen`/`onOpenChange`, `title`.

```tsx
<TemplateBrowseTree sections={form.sections} onOpenSection={open} onOpenFullForm={openAll} />
```

## Guidance implemented
- Theme 7: browse tree in addition to search; open by default; top-level sections only until expanded; can be hidden and shown again; sections open by clicking; the full form opens in one action.
- Ticks for sections already addressed [suggested: listed as future work].

## Do and don't
- Do keep it beside the note, not over it.

## Accessibility
- A labelled complementary region; expand buttons use `aria-expanded`; ticks have hidden text ", addressed".
