# MyHealthRecordStatus

The Australian My Health Record access state for the open patient, with access code entry and emergency access ("break glass"), as a panel or a one-line banner item.

## When to use

- AU screens that show or link to My Health Record content, and in `PatientBanner` through its `myHealthRecord` prop.
- Not in GB or NZ: there is no equivalent national record.

## What you provide

- `state` from your B2B gateway calls: `not-checked`, `no-record`, `available`, `access-code-required`, `restricted-documents`, `emergency-access`, `suspended`, `cancelled`, `not-authorised`, `not-connected`, `unavailable`.
- Callbacks (the control makes no network calls): `onSubmitAccessCode(code, 'record' | 'document')`, `onEmergencyAccess({ ground, reason, acknowledged })`, `onCheck`, `onOpen`.
- `accessCodeError` (for example after B2B error 5103), `emergencyAccessFrom` / `emergencyAccessUntil`, `emergencyReason`, `doNotUpload`, `checkedAt`, `busy`, `texts` (override any wording), `variant`.

```tsx
<MyHealthRecordStatus
  state={mhr.state}
  onSubmitAccessCode={(code, kind) => gateway.gainAccess({ code, kind })}
  onEmergencyAccess={(r) => gateway.emergencyAccess(r)}
  accessCodeError={mhr.error}
/>
```

## Guidance implemented

Sources and quotes: `docs/guidance-notes/G12-identity-extensions.md` section 2.

- MHR-01 [M]: every state is text plus an icon; colour only supports it.
- PCEHR_CIS_019048 [M]: an option to enter the access code. Record access code for `access-code-required`; limited document access code for `restricted-documents`. Both are 4 to 8 characters (ADHA) and are checked for length and spaces before your callback runs.
- MHR-02 [M] (ADHA developer guide): wherever the record or documents are locked, both "enter access code" and "Emergency access" are offered. Suspended records offer emergency access only (ADHA: providers cannot access "except in an emergency").
- PCEHR_CIS_019116 and MHR-03 [M]: emergency access shows the declaration text from the ADHA developer guide, the conditions (OAIC s 64 guidance: the two statutory grounds, what it must not be used for, 5 days, removed documents not included), a required choice of ground, a required free-text reason ("Circumstances, and why consent could not be obtained"), and a required acknowledgement that the access is logged, notified and audited. "Confirm emergency access" stays disabled until all three are given.
- AU-PV-02 and MHR-04 [M]: the `emergency-access` state is a persistent outlined indicator with its end time (5 days after `emergencyAccessFrom`) and the recorded reason.
- OAIC [M]: `doNotUpload` shows "Do not upload: the person asked that this not be uploaded to My Health Record" ("must do as they ask").
- `cancelled`: "permanently deleted" (ADHA). `no-record`: B2B 5101. `not-authorised`: B2B 5104.
- MHR-05 [suggested]: when the record can be viewed, a note that restricted or removed documents may not be visible, so absence is not read as "nothing recorded".
- Status headings ("Access code required", "Some documents restricted") and the `not-connected` and `unavailable` wording are [suggested]; ADHA publishes none.
- The declaration ends "or to public health" as in the ADHA developer guide; OAIC words the ground "public health or safety". [UNCERTAIN]: replace `MY_HEALTH_RECORD_EMERGENCY_TEXT.declaration` if ADHA confirms other wording.

## Do and don't

- Do log the emergency request (ground, reason, user, time) in your audit trail and keep the register OAIC describes.
- Do show the `emergency-access` state wherever content from that access is displayed.
- Don't use emergency access because a code was forgotten, to check whether restricted documents exist, or for demonstrations.
- Don't treat "no record" or "not connected" as "no history".

## Accessibility

- The full variant is a `section` labelled by its heading; the status text is in an `aria-live="polite"` heading.
- Code entry is a `form` with a visible label, hint and `role="alert"` error. Enter submits.
- Emergency access is a labelled group that receives focus when opened; Esc cancels and returns focus to the "Emergency access" button. The disabled confirm button is described by text explaining what is missing.
- Compact variant: "Access options" is a disclosure button with `aria-expanded` and `aria-controls`.

## Regional behaviour

- AU only. GB and NZ have no My Health Record; do not render it there.
- Sources: ADHA restrict access pages, suspension and cancellation pages, ADHA developer guide (PCEHR_CIS_019048, 017941, 019116), OAIC emergency access and using the system guidance (URLs in G12 section 2).
