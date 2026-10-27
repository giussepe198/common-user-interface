# EarlyWarningScoreSummary

The current early warning score: total, zone named in words, the required response and why it was triggered, with any text the chart requires.

## When to use

Beside a patient banner, at the top of an observation chart (`VitalSignsChart` shows one by default), or in a handover view, wherever staff need the score and the action now.

## What you provide

```tsx
<EarlyWarningScoreSummary
  region="NZ"
  observation={{ time: '2026-10-27T02:00', values: { respiratoryRate: 26, oxygenSaturation: 90, supplementalOxygen: 'air',
    heartRate: 96, systolicBloodPressure: 124, temperature: 37.6, consciousness: 'A' } }}
  modifications={modifications}
/>
```

Pass `observation` (scored with `scoreEarlyWarning`) or an already scored `result`. `definition` overrides the region's default chart (see `VitalSignsChart`).

## Guidance implemented

- AU-OB-06 [M] the required response is shown next to the triggered value; NEWS2 adds the minimum observation frequency.
- G11 12.3 [M] the most severe trigger wins, by total or by any parameter's zone; the NZEWS escalate-if-worried banner and "no timely response" line are always shown, also when nothing is recorded.
- G11 12.4, AU-OB-05 [M] applied modifications listed with reason, authoriser and expiry; ignored ones listed with the reason (not signed, expired, no duration).
- WCAG 1.4.1 colour is never the only cue: the zone chip holds the threshold name and the zone name is read by screen readers.
- `[suggested]` missing parameters: "Incomplete: Temperature not recorded. The score may be higher." and the total shown as "6 or more".
- `[suggested]` placeholder charts (ADDS) carry "Placeholder scores: not for clinical use". Hosts that already show the same notice beside the summary pass `showPlaceholderNotice={false}` so it is not repeated.

## Regional behaviour

- GB: NEWS2 total, responses Low, Low–medium (3 in one parameter), Medium, High with RCP wording and frequencies.
- AU: ADDS score with the ACSQHC response actions and emergency-call criteria; scores are placeholders until configured.
- AU, NSW: pass `definition={EWS_NSW_BTF}` for Between the Flags. Zone-based charts (`scoring: 'zones'`) show the zone ("Red Zone") in place of a total, the Clinical Review or Rapid Response actions from the SAGO chart, and "Verify the zone boundaries against the chart in use locally" (`localVerificationRequired`). See G10 section 16 for sources.
- NZ: NZEWS "EWS" with the HQSC zone descriptors ("Likely to deteriorate rapidly") and the rapid response call for the blue zone; yellow to red actions are local wording to configure.

See `VitalSignsChart` for sources and items needing clinical verification.

## Do and don't

- Do keep the summary visible whenever observations are being recorded.
- Don't show a score from a different chart definition than the one used to record.

## Accessibility

- A labelled section with a heading; `live` makes changes to the total and response polite live announcements.
- A visually hidden list gives every parameter's value, score and zone.
