# SecondCheckField

Second checker for high-risk medicines (P4): scan a badge or enter a staff ID, then show who checked and when.

## When to use

- Any administration that local policy says needs an independent second check.

## What you provide

- `value` / `defaultValue` / `onChange`: `SecondCheckValue` `{ id, name, role?, method: 'scanned' | 'entered', at }` or null.
- `onScanRequest()` (camera, NFC or scanner; resolve the checker or null) and/or `resolveChecker(text)` for typed IDs. Either may be async.
- `currentUserId` (refused as checker), `now`, `required`, `showValidation`, `label`, `scanLabel`, `enterLabel`, `disabled`.

```tsx
<SecondCheckField onScanRequest={scanBadge} resolveChecker={lookupStaff} currentUserId={me.id} required onChange={setCheck} />
```

Utility: `describeSecondCheck` ("RN Kiran Patel, badge scanned 14:09").

## Guidance implemented

- Phase 4 mobile rules [M]: second check as an explicit confirmation pattern for high-risk commits; 56 px controls.
- The signed-in user cannot be their own second checker [suggested].
- The record shows who, how and when (time today, date and time otherwise, D+Ta and D+Tb formats).

## Do and don't

- Do authenticate the second checker in your scan or lookup service as local policy requires; this control only records the result.
- Don't keep the second check if the dose or patient changes; clear `value`.

## Accessibility

- A labelled section; the typed entry is a labelled input with a submit button (Enter works).
- Problems and progress are announced politely; focus moves to "Change" after a check and back to the entry after Change.
