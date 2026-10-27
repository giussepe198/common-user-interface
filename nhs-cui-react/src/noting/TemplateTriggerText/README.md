# TemplateTriggerText

Experimental. Free text of a note with muted tags over phrases that have related templates; each tag opens a small drop-down of optional templates.

## When to use
- Free-text noting where measurement or assessment phrases (for example "blood pressure", "smoking") have templates, without asking the user to encode the text first (Noting Using Templates, Theme 6).
- Beside `TemplateSuggestionsPanel`, which shows the same suggestions in the right-hand panel.

## What you provide
- `text`, `triggers` (`id`, `term`, optional `phrases`, `templates`), `onOpenTemplate(template, trigger, match)`.
- Optional `enabled`/`defaultEnabled`/`onEnabledChange`, `showToggle` (default true), `onMatchedTriggersChange(triggers)` to feed the panel, `label`.

```tsx
<TemplateTriggerText text={note} triggers={measurementTriggers} onOpenTemplate={open}
  enabled={tagging} onEnabledChange={setTagging} showToggle={false}
  onMatchedTriggersChange={setTextTriggers} />
<TemplateSuggestionsPanel triggers={[...encodedTriggers, ...textTriggers]} onOpenTemplate={open}
  freeTextTriggering={tagging} onFreeTextTriggeringChange={setTagging} />
```

`findTemplateTriggerPhrases(text, triggers)` is exported for hosts that tag text elsewhere.

## Guidance implemented
- Theme 6: terms matched in free text without encoding; templates offered via tags overlaid on the text with a floating drop-down on focus, and in the right-hand panel (through `onMatchedTriggersChange`).
- Theme 6: a tag demarcates the WHOLE matched phrase ("blood pressure", not "pressure"); tags are not underlines; tagging is visually muted (pale fill and thin border); an option switches free-text triggering off; the control looks different from section search.
- Theme 6: fuzzy matching on word endings ("smokes" matches "smoking"); whole words only, case and accent insensitive; the longest phrase wins and tags never overlap [suggested].
- Theme 5 (shared with the panel): suggestions are marked optional; templates that open separately carry an icon (Theme 3).
- Not built: replacing the text with template values after entry (Theme 6 allows either; the host decides and updates `text`). The component shows text; it is not an editor [suggested: show it under or beside the noting field].

## Do and don't
- Do match against a context-determined subset (for example measurement concepts) so tags stay few.
- Don't present the templates as required.

## Accessibility
- Each tag is a button named with its phrase and the number of templates, with `aria-expanded`. Focus or click opens the drop-down; Down arrow moves into it, Up and Down move between templates, Escape closes it and returns focus to the tag; moving focus away closes it.
- The drop-down is a labelled group ("Templates for Blood pressure"); a hidden description gives the number of tagged phrases and the keys.
- The on/off option is a labelled check box.

## Regional behaviour
- None. Matching ignores macrons and other diacritics, so "Māori health assessment" and "Maori health assessment" match; display keeps them as typed.
