# LegalStatusBadge

A person's legal status as a square badge with the host's words, an icon and the inline-start bar in the legal colour.

## When to use

- In the banner's legal section, in person rows, as the heading of a `LegalOrderCard`, and anywhere a legal status is shown.

## What you provide

- `state` (`current`, `unconfirmed`, `ended`, `none`, `historic`), `label` (the host's words, required), `warning` (the host's unconfirmed words), `detail`, `historicLabel`, `onOpen`, `size`.

```tsx
<LegalStatusBadge state="current" label={host.labels['order.inpatient']} detail="Ends 14-Nov-2026 17:00 AEDT" />
<LegalStatusBadge state="none" label={host.labels['legal.none']} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Legal status uses the `legal` hue, the scale glyph, a square chip and the inline-start bar; "No order recorded" is neutral with no bar [suggested].
- The word is the status; square corners are kept for legal status only; never "voluntary" unless that is recorded [suggested].
- An order received as information that passed its end shows `unconfirmed` (warning hue, warning icon, bar, the host's words), never as current and never as ended [suggested].
- Every legal word is a prop from the host; the control hard-codes no Act, order or time limit [suggested].
- The legal hue is a mental health extension token (`--legal`, `--legal-surface`); CUI alert colours are used for the unconfirmed (yellow) and ended (red) states [suggested].
- A hidden state word ("Legal status:", "Legal status not confirmed:") prefixes the label for screen readers [suggested].
- Core has no scale icon, so an area-internal glyph is drawn on the core grid [suggested].

## Do and don't

- Do show one badge per current order, most restrictive first by the host's precedence.
- Don't shorten the host's label below its short form; the badge wraps instead.

## Accessibility

- Text carries the state; icons are decorative. As a button (with `onOpen`) it is keyboard operable with a 44px target on coarse pointers. Forced colours keep the border.

## Regional behaviour

- None in the control: Victorian, other AU and NZ words come from the host. Previews show illustrative, fictional wording.
