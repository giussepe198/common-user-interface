# ConsentIndicator

Consent to share at the point of decision: sharing allowed, restricted, withdrawn or not recorded, in words with an icon and the consent colour.

## When to use

- Beside every share, send, letter or release action, in the banner's safety section and in person rows where sharing matters.

## What you provide

- `state`, `text` (the main restriction in words), `labels` (host words), `onOpen`, `size`.

```tsx
<ConsentIndicator state="restricted" text="Do not share with father" onOpen={openPreferences} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Consent and sharing restriction use the `consent` hue, the handshake glyph and a chip with bar; sharing as preferred has no bar; not recorded is a warning with a dashed border [suggested].
- The restriction is shown at the decision point in words [suggested].
- Consent uses the `consent` hue, an extension token that a theme never sets [suggested].
- Withdrawn is a separate state with its own words and the bar [suggested].
- Default words are [suggested]; service and the host may replace them.

## Do and don't

- Do repeat the applying restriction in the confirmation of a share.
- Don't read "not recorded" as permission.

## Accessibility

- Words carry the state; the icon is decorative; as a button it is keyboard operable with a 44px coarse-pointer target.

## Regional behaviour

- None in the control; NZ and AU information sharing words come from the host.
