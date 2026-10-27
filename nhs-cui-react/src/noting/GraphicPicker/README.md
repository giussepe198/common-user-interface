# GraphicPicker

Choose and load a diagram: a short list of common graphics first, then a separate keyword search.

## When to use
- Where the context does not load a graphic automatically (NwG-0013) and the user must choose one.

## What you provide
- `graphics`, `commonIds` (the short list), `onLoad`.
- Optional `loadedId`, `title`, `minChars`.

```tsx
<GraphicPicker graphics={library} commonIds={['body-adult', 'lungs']} onLoad={setGraphic} />
```

## Guidance implemented
- NwG-0014/0023 [M] a way to choose and load a graphic; NwG-0024 [M] primary short list of common graphics; NwG-0026 [M] secondary simple keyword search; NwG-0027 [R] the two methods visually distinct and separate.
- Age group, sex and views are shown under each title so the appropriate graphic is chosen (NwG-0004/0087, NwG-0088).
- "Loaded" marks the current graphic [suggested].

## Do and don't
- Do give each graphic `keywords` (body parts, views).
- Don't put many graphics in the common list.

## Accessibility
- Two labelled areas; the search is a `search` landmark with a labelled field and a polite count of results; each Load button names its graphic.
