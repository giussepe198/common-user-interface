# TelephoneNumberDisplay

Shows a telephone number in the standard UK or international format, with an optional label and extension.

## When to use

- Read-only display of home, work, mobile or other contact numbers, including inside the patient banner.

## What you provide

- `value` (any format), optional `extension`, `label`, `asLink`.

```tsx
<TelephoneNumberDisplay label="Work" value="02079460472" extension="1234" />  // Work 020 7946 0472 x1234
<TelephoneNumberDisplay label="Next of Kin" value="+1 212 555 2368" />
```

The same rules are available as `formatTelephoneNumber`.

## Guidance implemented

- TID-0001, TID-0016, TID-0018 [M]: UK numbers never show "+44" or "0044"; "+44 118 123 4567" shows "0118 123 4567".
- TID-0002..0004, TID-0017, TID-0019 [M]: other countries show "+" and the country code with no leading zeros, then a space.
- TID-0005, TID-0006 [M]: area codes never in brackets, followed by a space.
- TID-0007, TID-0008 [R/M]: extensions as " x1234" ("ext", "extn", "extension" and similar are recognised).
- TID-0009 [M]: UK local numbers over 6 digits have a space before the last four.
- TID-0010 [R]: Appendix A rules, including the eleven six-digit area codes.
- TID-0015 [M]: anything that cannot be identified is shown exactly as received.
- PAB-0019: no number shows "Not Known".
- [suggested] `asLink` renders a `tel:` link.

Where the source documents disagree or are silent (the stricter option is used):

- "Valid separator characters" are not defined. Space, hyphen, full stop, brackets and forward slash are treated as separators; any other character means the number is shown as received.
- International numbers are reformatted only when the country code is a known ITU code; otherwise they are shown as received. Remaining digits are grouped in fours from the right, with no group over 6 digits.
- UK numbers are reformatted only when they have 10 or 11 digits starting with 0.

## Do and don't

- Do store numbers with their country code if not UK.
- Don't add brackets around area codes.

## Accessibility

- Text only; the "+" makes international numbers clear when read aloud.
- The font's contextual alternates are turned off so "x" before an extension is not drawn as a multiplication sign.

## Regional behaviour

- GB: unchanged (TID rules, Appendix A).
- AU (Australian Government Style Manual): home numbers in national format whether stored as "+61..." or "0...": "02 5550 4321", "0491 570 159", "1300 975 707", "13 00 00"; no brackets. Numbers from other countries keep "+CC", e.g. "+64 21 123 4567". `asLink` uses the international form, "tel:+61491570156" (13, 1300 and 1800 numbers use national digits).
- NZ: "03 312 3456", "021 123 4567", "0800 611 116"; other countries keep "+CC". Mobile lengths vary by block ([UNCERTAIN]).
- The number never wraps (CSS `nowrap`, Style Manual).
- Sources: https://www.stylemanual.gov.au/style-rules-and-conventions/numbers-and-measurements/telephone-numbers ; G11 section 6.
