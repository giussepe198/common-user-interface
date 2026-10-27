# Clinical CUI: build conventions (for contributors)

Clinical CUI is a React 18 + TypeScript control library for clinical applications, built from the NHS Common User Interface (CUI) design guidance. Findings distilled from every CUI document are in
`docs/guidance-notes/G*.md`. Treat those as your specification: implement the rules faithfully, cite guideline IDs, and label anything not in the guidance as "[suggested]" in the README.

Repo root: this folder. Global namespace of the browser bundle: `window.ClinicalCUI`.

## Folder layout (one area per contributor)

```
src/<area>/index.ts                 your area's public exports (you own it)
src/<area>/<Comp>/<Comp>.tsx        component (PascalCase folder = export name, ASCII identifier)
src/<area>/<Comp>/<Comp>.css        styles, imported from src/<area>/index.ts (not from the tsx)
src/<area>/<Comp>/README.md         guidelines (format below)
src/<area>/<Comp>/preview.html      live preview (format below)
src/<area>/utils/<name>.ts          pure functions (no React)
src/<area>/utils/<name>.test.ts     vitest tests for every util
```

Only create or edit files inside `src/<your area>/`. Do not edit `src/core`, `src/styles`, `design/`, `scripts/`, or other areas. If you need something from core that is missing, implement it locally in your area and mention it in your report.

`src/<area>/index.ts` pattern:

```ts
import './PatientBanner/PatientBanner.css';
export { PatientBanner } from './PatientBanner/PatientBanner';
export type { PatientBannerProps } from './PatientBanner/PatientBanner';
export * from './utils/patient';
```

Export names must be unique across the whole library. Prefix utilities sensibly and avoid generic names that another area might also use (e.g. do NOT export `formatDate`, `truncate`, `formatDuration` from two areas). Area-specific helpers that are not useful publicly should not be exported.

## Code rules

- `import React from 'react';` at the top of every .tsx (classic JSX transform). Function components, `React.forwardRef` for inputs.
- TypeScript strict. No `any` in public props. Every exported component has an exported `<Comp>Props` interface with JSDoc on each prop, citing guideline IDs (e.g. `/** Shown as "Born" (PAB-0090). */`).
- No runtime dependencies besides React. No network. No `localStorage`. No `dangerouslySetInnerHTML`.
- Controlled and uncontrolled: inputs accept `value` + `onChange` and `defaultValue`. Use `useControllableState` from core.
- Shared from `../../core` (import path from `src/<area>/<Comp>/<Comp>.tsx`):
  - `cx(...)`, `useId(prefix, override?)`, `useControllableState(value, default, onChange)`
  - `<Icon name label? size?/>` names: search close check plus minus chevron-left chevron-right chevron-up chevron-down arrow-up arrow-down calendar clock filter sort group info warning error pencil trash user free-text link history pill refresh more lock bell
  - `<Button variant="primary|secondary|quiet|danger" size="sm|md" icon? iconOnly?>`
  - `<VisuallyHidden>`
  - date/time: `formatShortDate` (dd-Mmm-yyyy), `formatLongDate`, `formatLongDateParts`, `ordinalSuffix`, `formatTime` (HH:mm 24h), `formatDateTime`, `formatNullable`, `toDate`, `pad2`, `MONTH_SHORT`, `MONTH_LONG`, `DAY_SHORT`, type `DateLike` (Date or ISO string). Use these everywhere a date or time is shown; do not re-implement.
- Accessibility (mandatory everywhere): real semantic elements (`button`, `table`, `label`, `fieldset/legend`), visible labels, keyboard operable (Tab, Enter/Space, arrows for lists/grids, Esc closes popovers), `aria-*` where needed, colour never the only carrier of meaning (pair with icon or text), focus visible (base CSS already draws a 2px `--focus` ring for `:focus-visible` inside `.cui-root`), live regions for asynchronous result counts and alerts.

## Styling rules

- Class names: `cui-<component-kebab>` block, `cui-<component>__<part>`, `cui-<component>--<modifier>`.
- Colours ONLY via tokens: `var(--surface)`, `--surface-sunken`, `--surface-muted`, `--surface-reveal`, `--ink`, `--ink-muted`, `--ink-subtle` (prompts, on surface/surface-sunken only), `--ink-disabled`, `--border` (decorative), `--border-strong` (control borders), `--accent`, `--accent-hover`, `--on-accent`, `--accent-surface` (selected), `--focus`, `--hover` (pale yellow hover for clickable rows/entries), `--banner`, `--on-banner`, `--on-banner-muted`, `--banner-divider`, `--banner-alert` (badge fill inside banner, text in `--banner`), `--danger`, `--danger-surface`, `--on-danger`, `--warning` (text), `--warning-fill` (#ffcc33 symbol fill; with black #000000 border), `--warning-surface`, `--success`, `--success-surface`, `--info`, `--info-surface`, `--encodable` (pale blue SNOMED highlight), `--confirmed` (grey confirmed term), `--mandatory-symbol`, `--series-1..4`, `--normal-range`. The only literal colour allowed is `#000000` for the warning-triangle border and pictogram (per alert symbol guidance) and `#ffffff` for the mandatory-symbol pictogram.
- Text pairs that are safe in both themes: `--ink` and `--ink-muted` on any surface token, `--accent`/`--danger`/`--warning`/`--success` on `--surface` and on their own `-surface`, `--on-banner`/`--on-banner-muted` on `--banner`.
- Spacing `var(--space-1|2|3|4|6|8)` = 4/8/12/16/24/32px. Radius `var(--radius-sm|md|lg)` = 2/4/8px. Shadows `var(--shadow-popover)`, `var(--shadow-dialog)`.
- Fonts: `var(--font-sans)`; `var(--font-mono)` only for code. Sizes: 20/26 600 patient name, 18/24 600 heading, 15/20 600 subheading, 14/20 body, 12/16 labels and prompts (prompts italic `--ink-subtle`). Use `font-variant-numeric: tabular-nums` for numbers in columns.
- No gradients, no emoji, no left-border-accent cards, no blue-purple. Square-ish, dense, calm, professional; clinical data first.
- Must work in light and dark themes (tokens switch automatically under `[data-theme="dark"]`).

## README.md format (per component)

UK English, sentence case, no em dashes (use commas, colons, or parentheses), no hype.

```
# <Comp>

<One-sentence summary: what it is and when to use it.>

## When to use
## What you provide            (props/children/data the consumer supplies, with a short TSX example)
## Guidance implemented        (bullets: guideline ID, the rule in a few words; mark [M] mandatory / [R] recommended)
## Do and don't
## Accessibility
```

Add `[suggested]` to anything you added that the guidance does not specify.

## preview.html format (per component)

Line 1 is the marker, then a root element and ONE script. No JSX (no Babel): use `React.createElement`. `React`, `ReactDOM`, the tokens CSS, the bundle CSS and `window.ClinicalCUI` are preloaded by the host. Use fictional data only (e.g. NHS numbers in the 999 test range such as 999 000 0018 - check it passes Modulus 11 if you validate). Show 2-4 meaningful states (e.g. default, error, empty/unknown). Keep it under 256 KB.

```html
<!-- @dsCard group="Patient identification" height=160 subtitle="Patient banner with allergy status" -->
<div id="root" class="cui-root"></div>
<script>
const h = React.createElement;
const { PatientBanner } = window.ClinicalCUI;
ReactDOM.createRoot(document.getElementById('root')).render(
  h(PatientBanner, { /* props */ })
);
</script>
```

`height` = approximate rendered height in px (40-4000). Use `width=1200` in the marker for wide components (banners, lists, charts).

## Build and verify (run these before you finish)

```
cd <repo root>
AREA=<area> node scripts/build.mjs                                   # bundles core + your area to dist-<area>/
npx tsc -p . --outDir /tmp/types-<area> 2>&1 | grep "src/<area>"     # no type errors in your area (ignore other areas, they are in progress)
npx vitest run src/<area>                                             # all your tests pass
AREA=<area> node scripts/check-previews.mjs src/<area>                # renders each preview in light and dark, fails on console errors or empty output
```

Then LOOK at the screenshots in `dist-<area>/shots/*.png` with the Read tool (both themes) and fix anything that looks broken, cramped, misaligned or illegible. Iterate until clean.

## Report back

Reply with: components built (name + one line), utilities exported, test count, any guidance you could not implement, any [suggested] decisions worth the owner's attention. Keep it short.

## Phase 2 additions: Australia, New Zealand, component tests

### Regions

The library serves three jurisdictions. Specifications: `docs/guidance-notes/G10-australia.md` (AU) and `docs/guidance-notes/G11-new-zealand.md` (NZ), on top of the NHS CUI notes G1-G9. Where AU or NZ rules differ from NHS CUI (marked [AU OVERRIDE] / [NHS DELTA] in the notes), the regional rule wins for that region; GB behaviour stays exactly as it is.

- Core provides `ClinicalLocaleProvider`, `useClinicalLocale(regionOverride?)`, type `ClinicalRegion = 'GB' | 'AU' | 'NZ'`, `DEFAULT_TIME_ZONES`. Default region is GB.
- Every component whose behaviour, labels, value sets or formats differ by region takes an optional `region?: ClinicalRegion` prop and otherwise reads the provider: `const { region, timeZone, teReoLabels } = useClinicalLocale(props.region);`.
- Pure utilities take region as an explicit argument (no context in utils), defaulting to `'GB'`.
- Put region data (value sets, code lists, lettering lists, abbreviation lists, bands) in `src/<area>/utils/regions/<topic>.ts` as exported constants keyed by region, with the source URL in a comment above each.
- Never silently guess: an item the notes mark [UNCERTAIN] is implemented as configurable data with the uncertain default documented in the README.
- Previews: add AU and NZ states to the preview of any region-aware component (wrap with `h(ClinicalLocaleProvider, { region: 'AU' }, ...)`), labelled.
- READMEs: add a `## Regional behaviour` section (GB / AU / NZ differences, with source references).
- Te reo Māori: preserve macrons everywhere (never strip them in display or storage); comparisons may be macron-insensitive where the notes say so.

### Cross-area imports

You may import another area's public API from its index, e.g. `import { DateInput } from '../../datetime';` (never deep paths into another area). Do not edit other areas' files.

### Component tests

Every component gets `src/<area>/<Comp>/<Comp>.test.tsx` using vitest + `@testing-library/react` (jsdom is set automatically for `.test.tsx`). Cover at least: renders with typical props; the key safety behaviour (formatting, validation message, disabled commit, unknown value wording); keyboard operation for interactive controls; each region where behaviour differs. Example: `src/core/Button/Button.test.tsx`. Components must not import CSS themselves (CSS is imported from the area index), so tests import the component file directly.

Run: `npx vitest run src/<area>`.

## Phase 4: mobile controls (touch and dictation)

Mobile controls live in three areas: `src/touch` (touch input primitives), `src/mobile` (screens and patterns: patient header, worklist, medicines, administration, drug agenda) and `src/voice` (dictation capture and confirmation). The approved concepts are in `docs/mobile-concepts/*.dc.html` (open them as HTML source: they show exact layout, wording and states). Chosen direction: the task-first worklist (B) is the nursing home screen, the patient-first record (A) is for review, and voice capture (C) is a mode inside both. The shared patterns (P1 to P4) are used everywhere.

Mobile rules (in addition to everything above):

- Reuse, never fork: identity, dates, medication lines, codes, early warning scoring and abbreviation checks come from the existing areas' public exports (`../../patient`, `../../datetime`, `../../medications`, `../../administration`, `../../lists`, `../../noting`). If a desktop component renders well at 320 to 430 px, compose it; otherwise build the mobile control on the same utilities.
- Touch targets at least 48 x 48 px; primary commit actions at least 56 px high and placed at the bottom (thumb zone), with `padding-bottom: max(16px, env(safe-area-inset-bottom))`. Base text 16 px (inputs never below 16 px, so iOS does not zoom).
- No hover-only information: anything a desktop tooltip shows is reachable by tap or shown inline. Long-press is never the only route.
- Never use swipe to commit, delete or change clinical data. Gestures may only navigate or reveal.
- High-risk commits use explicit confirmation patterns from `src/touch` (typed read-back, hold-to-confirm with an accessible alternative, second check). Normal commits are a single clear button with an undo window where safe.
- The patient header is always visible on patient-context screens and never truncates the name or identifier (wrap instead). Switching patient must be unmistakable.
- Dictation never auto-commits. Every dictated value is read back as structured data, missing or ambiguous values block saving with a specific question, and implausible values (unit or order-of-magnitude mismatch) need an explicit choice. The speech engine is supplied by the consumer through an adapter interface (a Web Speech API adapter may be provided as an optional default); controls must work fully by touch when no engine is available.
- Layout fluid from 320 to 430 px wide and usable in landscape; respect `prefers-reduced-motion`; dark theme via tokens.
- Previews: `<!-- @dsCard group="Mobile ..." height=... width=390 -->` and render inside a 390 px wide container; show light and key states. Groups: "Mobile touch inputs", "Mobile screens", "Mobile voice".
- Component tests cover touch-sized targets where practical (e.g. class or style assertions), keyboard operation, screen reader names, and the safety behaviours (blocked save, read-back, confirmation).

## Phase 5: worked examples

See `examples/README.md`. Examples live in `examples/` (one `.tsx` per screen or flow), import only from `@clinical-cui/react` (resolved to the bundle global at build time and to `src/index.ts` for type checking via `examples/tsconfig.json`), and use `examples/data/patients.ts` for the cast. Build with `node scripts/build-examples.mjs <name>` (needs a current `dist/bundle.js`), check with `node scripts/screens.mjs <name> --all-regions` and look at the PNGs in `docs/screens/`. Type check with `npx tsc -p examples/tsconfig.json`. Do not edit `src/`: if a component is missing a prop an example needs, report it.
