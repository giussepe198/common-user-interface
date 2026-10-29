# TopBar

Global top bar of the application frame: organisation, working context, search, then help and the account menu.

## When to use

- Inside AppShell (it renders one for you). Use it directly only for a frame AppShell does not cover.

## What you provide

- Slots: `start` (leading buttons), `brand`, `brandCompact` (the phone form of the brand, e.g. the mark alone with the name as its accessible name), `context`, `search`, `actions`, `help`, `account`.
- `as`: 'header' (banner landmark, default) or 'div'.

```tsx
<TopBar brand="Riverside Mental Health" context={<ContextSwitcher />} help={helpMenu} account={accountMenu} />
```

## Guidance implemented

- PAB-0009 [M]: the title bar and global navigation sit above the patient banner.
- [suggested] One dense 40 px line on desktop; in containers under 600 px the context and search wrap to their own line instead of being cut or hidden, and `brandCompact` takes the place of `brand`.
- Help and account are always at the end, account last, so they are found in the same place on every screen [suggested].

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English. Te reo Māori labels keep their macrons and can carry `lang="mi"` where the control offers it.

## Do and don't

- Do keep the working context visible at every width.
- Don't put patient details or alerts in the top bar: they belong in the patient banner.

## Accessibility

- A `header` landmark by default; DOM order matches visual order (start, brand, context, search, actions, help, account).
- Slot contents bring their own names (MenuButton labels, search field label).
