# SpeechEngine

Adapter interface for speech recognition, with an optional Web Speech API adapter, a scripted engine for tests and previews, and the `useSpeechDictation` hook that turns engine events into React state.

## When to use

- Whenever a mobile screen takes dictation (C1 observations, C3 notes). The consumer supplies the engine; the library makes no network calls of its own.
- Use `ScriptedSpeechEngine` in tests, previews and training. Use `WebSpeechEngine` only after checking where the browser sends audio (see Do and don't).

## What you provide

- An object implementing `SpeechEngine`: `isAvailable()`, `start({ language, interimResults, continuous })`, `stop()`, optional `abort()`, and `subscribe(listener)` emitting `start`, `result` (`{ transcript, isFinal, confidence?, alternatives? }`), `error` (`{ code, message }`) and `end`.
- `WebSpeechEngine({ language?, maxAlternatives?, recognition? })`: feature-detected over `SpeechRecognition` or `webkitSpeechRecognition`.
- `ScriptedSpeechEngine(steps, { available?, delayMs?, playOnStart?, endAfterScript? })` with `next()`, `playAll()` and `reset()`.
- `useSpeechDictation(engine, { region?, language?, defaultTranscript?, onFinalResult? })` returns `{ status, transcript, interim, error, available, start, stop, toggle, reset, setTranscript }`.

```tsx
const engine = React.useMemo(() => new WebSpeechEngine({ language: speechLanguageForRegion('NZ') }), []);
const dictation = useSpeechDictation(engine);
<MicButton status={dictation.status} onPress={dictation.toggle} errorMessage={dictation.error?.message} />
```

Utilities: `speechLanguageForRegion`, `VOICE_SPEECH_LANGUAGES`, `isWebSpeechAvailable`, `getWebSpeechRecognition`, `speechEngineError`, `SPEECH_ERROR_MESSAGES`.

## Guidance implemented

- Phase 4 mobile rules [M]: the speech engine is supplied by the consumer through an adapter interface; a Web Speech API adapter is offered as an optional default; controls work fully by touch when no engine is available (`status` is `unavailable`).
- Phase 4 mobile rules [M]: dictation never auto-commits. The hook only collects text; nothing is saved until a review screen.
- Engine alternatives are passed through but never chosen automatically [suggested].
- Error messages in plain language with a way on ("Type instead") [suggested].

## Regional behaviour

- Recognition language follows the region: GB `en-GB`, AU `en-AU`, NZ `en-NZ` (BCP 47; same tags as the core locale). The adapter never changes the tag; if an engine lacks `en-NZ` it reports `language-not-supported` or falls back as the engine decides.
- Transcripts are kept exactly as recognised, so te reo Māori words keep their macrons when the engine provides them.

## Do and don't

- Do check your organisation's privacy and data residency rules before enabling `WebSpeechEngine`: some browsers send audio to the browser vendor's cloud service. For patient data in AU and NZ an on-device or approved engine behind this interface is safer.
- Do create the engine once (memoise it); the hook subscribes per engine.
- Don't treat a final result as a value: parse it and read it back (DictationReview, DictatedNoteReview).

## Accessibility

- Status changes are announced by MicButton and new text by LiveTranscript (polite live regions).
- With no engine the hook reports `unavailable`, so screens show the touch route instead of a dead microphone.
