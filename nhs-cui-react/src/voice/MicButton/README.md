# MicButton

Large round microphone button (72 px) that starts and stops dictation, pressed while listening, with listening, processing, error and unavailable states announced.

## When to use

- The centre action of a dictation screen (C1), between "Type instead" and "Review". Use `size={56}` for a secondary "Dictate more" (C3).

## What you provide

- `status`: `idle`, `listening`, `processing`, `error` or `unavailable` (usually from `useSpeechDictation`).
- `onPress` (usually `dictation.toggle`), `size` 72 or 56, `startLabel`, `stopLabel`, `caption`, `errorMessage`, `unavailableMessage`, `showStatusText`, `hideDescription`.

```tsx
<MicButton status={dictation.status} onPress={dictation.toggle} errorMessage={dictation.error?.message} />
```

## Guidance implemented

- Phase 4 mobile rules [M]: touch target well above 48 x 48 px; no long-press or swipe needed; works without an engine (disabled, with the reason).
- Colour is never the only cue [M]: listening shows a stop square, the "STOP" caption and `aria-pressed`; unavailable shows a struck-through microphone and a dashed outline.
- `prefers-reduced-motion` turns off the listening pulse [M].
- Layout from the approved concept C1 (accent fill, ring while listening) [suggested].

## Regional behaviour

- None of its own: the same in GB, AU and NZ. The recognition language is set by the engine (see SpeechEngine).

## Do and don't

- Do keep "Type instead" next to it so the screen works by touch.
- Don't commit anything when listening stops.

## Accessibility

- Native `button` with `aria-pressed`; Enter and Space work. Its name says the action: "Start listening", "Stop listening", "Try listening again".
- State changes are announced through a polite status region ("Listening", "Processing what was heard").
- Error and unavailable text describes the button (`aria-describedby`); `hideDescription` keeps it for screen readers when the screen already shows it.
