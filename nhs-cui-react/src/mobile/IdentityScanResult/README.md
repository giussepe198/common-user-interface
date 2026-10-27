# IdentityScanResult

Wristband scan result strip (concept B2): confirms a match quietly and makes a mismatch an alert that says what differs and whose band it is.

## When to use

- Under the patient header on administration and specimen screens, after a wristband scan.

## What you provide

- `status`: 'match' | 'mismatch' | 'insufficient' | 'unreadable' | 'notScanned' (usually from `mobileIdentityMatch(patient, scanned).result`).
- `scannedAt`, `matched`, `differences`, `scannedPatient`, `onScan`, `onSwitchToScanned`, `subject` (default "Wristband"), `region`, `now`.

```tsx
const m = mobileIdentityMatch(patient, scanned, region);
<IdentityScanResult status={m.result} matched={m.matched} differences={m.differences} scannedAt={at} onScan={scan} />
```

## Guidance implemented

- Phase 4 rules [M]: switching patient must be unmistakable; a mismatch shows the other patient's full identity, not just "error".
- `mobileIdentityMatch` [suggested rule]: every identifier type on both must match, and name and date of birth when the band carries them; a match needs at least one identifier.
- Times in 24-hour HH:mm (D+Tb).
- Colour is never the only cue: icon, words and a heavier border for a mismatch.

## Regional behaviour

- Identifier labels follow the region (NHS No., IHI / URN, NHI) via the patient area; AU URN label is organisation-configurable (AU-ID-04).
- Name casing in the scanned identity follows the region (AU-PI-02, G11 2.3).

## Do and don't

- Do block recording while the status is not 'match' (DoseAdministrationFlow does this).
- Don't offer "Continue anyway" on a mismatch.

## Accessibility

- A match is `role="status"` (polite); a mismatch is `role="alert"`.
- Buttons are at least 48 px high.
