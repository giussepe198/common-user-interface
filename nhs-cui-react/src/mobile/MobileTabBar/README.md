# MobileTabBar

Bottom tab bar for the patient record on phones (concept A1): Summary, Medicines, Obs, Notes, More.

## When to use

- At the bottom of patient-record screens. For app-level navigation with a Scan action use MobileNavBar.

## What you provide

- `items`: `MobileTabItem[]` `{ id, label, icon?, href?, badge?, badgeLabel?, disabled? }` (two to five).
- `current`, `onSelect`, `label` (default "Patient record"), `sticky` (default true).

```tsx
<MobileTabBar items={MOBILE_RECORD_TABS} current="summary" onSelect={go} />
```

## Guidance implemented

- Phase 4 rules [M]: 64 px high targets, labels always visible (no icon-only tabs), safe-area padding at the bottom.
- The current tab is shown by `aria-current="page"`, weight, a top bar and colour together, never colour alone.
- Badges carry words for screen readers ("2 due") [suggested].

## Regional behaviour

- None: labels are supplied by the consumer.

## Do and don't

- Do keep the same tabs on every patient screen.
- Don't use more than five tabs.

## Accessibility

- `nav` landmark; links or buttons with visible text; keyboard focus ring.
