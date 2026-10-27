# MobileNavBar

App navigation bar for phones with a prominent centre Scan action (concept B1).

## When to use

- At the bottom of app-level screens such as the worklist.

## What you provide

- `items` (two to four `MobileTabItem`s; half go left of Scan), `current`, `onSelect`, `onScan`, `scanLabel` (default "Scan"), `label` (default "Main"), `sticky`.

```tsx
<MobileNavBar items={[worklist, patients, dictate, handover]} current="worklist" onScan={startScan} />
```

## Guidance implemented

- Phase 4 rules [M]: 64 px targets, labels always shown, safe-area padding.
- Scan is a real button with text and the strongest visual weight [suggested].
- Current item marked with `aria-current="page"` and more than colour.

## Regional behaviour

- None.

## Do and don't

- Do make Scan open the scanner directly.
- Don't hide Scan behind a menu.

## Accessibility

- `nav` landmark named "Main"; all items reachable by keyboard in visual order.
