# EncodableTextEditor

A plain-text noting area that highlights phrases your terminology parser can code, groups them in expression marquees, and shows confirmed phrases as locked, bold and grey.

## When to use

Text-parser style clinical noting where the user types prose and confirms suggested SNOMED CT codes. Use it beside SuggestedMatchList (noting), which shows the matches with their check boxes. The editor does no matching: your parser supplies the phrases.

## What you provide

- `label`, `value` / `defaultValue` / `onChange(text, edit)`.
- `matches`: `{ id, start, end, status: 'encodable' | 'elaboration' | 'confirmed', label?, expressionId? }` with offsets into the text.
- `focusedExpressionId`, `onFocusExpression`, `onConfirm`, `onUnconfirm`, `onBoundaryChange`.
- `instructions`, `hideInstructions`, `rows`, `disabled`, `readOnly`.

```tsx
<EncodableTextEditor
  label="History of presenting complaint"
  value={text}
  matches={matches}
  onChange={(t, edit) => { setText(t); setMatches(m => adjustMatchesForEdit(m, edit)); reparse(t); }}
  focusedExpressionId={focus}
  onFocusExpression={setFocus}
  onConfirm={confirm}
  onUnconfirm={unconfirm}
/>
```

`adjustMatchesForEdit` shifts your matches after each edit and drops unconfirmed ones the edit touched, so highlights stay aligned until your parser re-runs.

## Guidance implemented

Terminology Display Standards for Coded Information v2.0 (displaystandards). Its points carry Must, Should or Could with a confidence level.

- 2.1.1 Must show which phrases are potentially encodable; Should use a light blue highlight (not underline, not green or red, not dark), with gaps between separate concepts; black normal text on white, left aligned, line spacing 1.5; no user formatting (plain text only).
- D2.x distinguish standalone encodable text from elaboration-only words such as "mild": elaboration is marked with a lower band of the same blue [suggested style].
- 2.1.5 Must group encodable text with its elaboration (dotted faint marquee per expression) and distinguish the selected group (bold outline with yellow handles); marquees never overlap and only one is selected.
- 2.1.5 drag the yellow handles of the expression in focus with the mouse to include or exclude text; the tooltip reads "Drag the handles to include or exclude text in the expression" (G8 EncodableTextEditor). Handles snap to whole words, stay inside the expression's sentence (a full stop between digits is not a boundary), keep at least one word and never cross a confirmed phrase [suggested limits]. The start handle moves the first phrase of the expression, the end handle the last. `onBoundaryChange` is called as the handle passes each word, so the marquee follows the pointer; the host re-parses as usual.
- 2.1.5 keyboard equivalents for dragging boundaries: Alt+Shift+Right or Left moves the end by a word, with Ctrl the start [suggested keys].
- 2.2 confirmation by double-click or keyboard (Alt+Enter [suggested key]); confirmed phrases bold on grey, and greyed as inactive: edits inside them are refused until unconfirmed (Alt+Backspace [suggested key]).
- 2.2 replacing typed text with the matched label is the host's job (update `value` and the match offsets on confirm).
- B2.6 nothing is coded without confirmation: the editor only reports; the host stores codes for confirmed matches only.
- [suggested] Bold is drawn with a text shadow so the text keeps its width and the caret stays aligned.

## Do and don't

- Do show SuggestedMatchList at the same time as the editor and keep `focusedExpressionId` in step with it.
- Don't show concept identifiers in the text.
- Don't store unconfirmed matches as codes.

## Accessibility

The editable element is a real `<textarea>` with a visible label. The highlight layer is decorative (`aria-hidden`); instead, a description gives the count of codable and confirmed phrases, and a polite live region announces the phrase at the cursor ("\"fever\" can be coded as Fever. Not yet confirmed.") and why an edit was refused. All actions have keyboard equivalents: the draggable handles are a pointer convenience and are not in the Tab order, because Alt+Shift+Right or Left (with Ctrl for the start) moves the same boundaries. When a drag ends, focus returns to the text and the new phrase is announced ("Selection is now ...").
