# MaoriDescentInput

The HISO 10094:2022 Māori descent question, with its exact English and te reo Māori wording and options Yes, Don't know, No.

## When to use

- Registration forms in NZ mode, before the iwi question (`IwiInput`).

## What you provide

- `value`/`onChange` or `defaultValue` ("yes", "dont-know", "no" or null), `showTeReo` (default true), `showRouting`, `routingText`, `purpose`, `error`, `name`.

```tsx
<MaoriDescentInput value={descent} onChange={setDescent} />
{descent === 'yes' ? <IwiInput ... /> : null}
```

## Guidance implemented

- HISO 10094 [M]: question exactly as published, with "He tūpuna Māori ōu?"; options in the order Yes, Don't know, No; nothing added.
- [M] No default answer; never inferred from name or ethnicity (G11 11.3).
- [M] Routing must be obvious: after "Yes" a note says to ask the iwi question next [suggested wording].
- [M] Explain why the data is collected (`purpose`).
- Codes for the answers are not given in the notes; the control uses "yes", "dont-know", "no" [suggested]; map to your system's codes.

## Do and don't

- Do confirm or update descent and iwi at least every three years.

## Accessibility

- `fieldset`/`legend` with radios; the te reo line is marked `lang="mi"`; the routing note uses `role="status"`.

## Regional behaviour

- NZ only. Source: https://www.tewhatuora.govt.nz/assets/For-the-health-sector/HISO-10094-2022-Maori-Descent-and-Iwi-Affiliation-Data-Protocols.pdf
