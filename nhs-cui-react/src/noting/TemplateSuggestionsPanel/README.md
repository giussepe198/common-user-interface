# TemplateSuggestionsPanel

Experimental. A right-hand panel of templates suggested by terms in the note, clearly marked as optional.

## When to use
- When encoded terms (Theme 5) or phrases in free text (Theme 6) have related templates, for example DVT suggesting Wells' score.

## What you provide
- `triggers` (term, source, templates), `onOpenTemplate(template, trigger)`.
- Optional `selectedTriggerId`/`onSelectedTriggerChange`, `freeTextTriggering`/`onFreeTextTriggeringChange`, `title`.

```tsx
<TemplateSuggestionsPanel triggers={triggers} onOpenTemplate={open}
  freeTextTriggering={tagging} onFreeTextTriggeringChange={setTagging} />
```

## Guidance implemented
- Theme 5: suggestions in a right-hand, non-modal panel, not in the page header or footer and not in-line; not reliant on hover; a drop-down chooses which term's suggestions to show and builds up as terms are matched; options persist until another term is chosen; a vertical text list linked to the trigger term; handles "no templates found"; suggestions marked as optional and not decision support.
- Theme 6: an option to switch off free-text triggering; free-text triggers marked "(in text)" [suggested].
- Additional templates marked "opens separately" (Theme 3).
- In-text tags with floating drop-downs are provided by `TemplateTriggerText`, which reports its matches for this panel.
- Not built: the icon beside an encoded matched term in the main noting area (Theme 5).

## Do and don't
- Do keep the panel visible while noting.
- Don't present suggestions as required steps.

## Accessibility
- A labelled complementary region; the trigger chooser is a labelled select; the optional message is text with an icon.
