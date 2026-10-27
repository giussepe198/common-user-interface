# Worked examples

Screens composed only from the library's public exports (`@clinical-cui/react`), to show how the controls fit together. They are documentation, not part of the published package.

- `shell/ExampleShell.tsx`: docs-only frame with region (UK, Australia, New Zealand) and theme switches. `?region=AU&theme=dark&chrome=0` sets the initial state.
- `data/patients.ts`: the shared fictional cast (test identifiers only) and a fixed "now".
- `desktop-*.tsx`, `mobile-*.tsx`: one example per file, each exporting `meta` and a default component.

Build and view:

```bash
npm run build              # library bundle first
npm run examples           # docs/site/*.html, design/showcase/*
npm run screens            # docs/screens/*.png (fails on console errors)
open docs/site/index.html
```

Rules for adding an example: import components only from `@clinical-cui/react`; layout glue (grid, spacing, headings) uses inline styles with the tokens; keep state realistic (recording a dose updates the chart); every region listed in `meta.regions` must render cleanly in light and dark; fictional data only.
