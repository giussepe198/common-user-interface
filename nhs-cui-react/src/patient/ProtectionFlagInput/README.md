# ProtectionFlagInput

A checkbox for a HISO 10046 protection flag (name, address or contact details held "in confidence"), with the stored code shown in text.

## When to use

- NZ registration and demographic editing screens, next to the name, address or contact details it applies to.
- Display of protected values is built into `PatientNameDisplay`, `AddressDisplay` and `PatientBanner`.

## What you provide

- `kind`: "name", "address" or "contact".
- `checked`/`onChange(flag, code)` or `defaultChecked`; `label`, `hint`, `showCode`, `disabled`.

```tsx
<ProtectionFlagInput kind="address" checked={addr.protected} onChange={(p) => setAddr({ ...addr, protected: p })} />
```

## Guidance implemented

- HISO 10046:2024 2.2.7 [M]: name protection flag, "1 – Protected", "0 – Not Protected", default 0.
- HISO 10046:2024 3.9 [M]: address protected flag, "1 – Yes, Protected", "0 – No, Not Protected", default 0.
- HISO 10046:2024 5.4 [M]: contact protected flag, same values as the name flag.
- Hint wording follows the standard: set it "if the person indicates they have a reason to not share" [suggested phrasing].
- The stored code is shown in text ("Address protected flag: 1 (Yes, Protected)") so the value never depends on the tick alone [suggested].
- The standard defines no UI behaviour for protected values; the masking and reveal rules used by the display components are [suggested] (G12 section 3).

## Do and don't

- Do set the flag only when the person asks.
- Don't use the flag to hide data from clinicians who need it to identify the patient; the banner keeps the name visible with an indicator.

## Accessibility

- Native checkbox with a visible label; the hint and the stored code are linked with `aria-describedby`. Space toggles.

## Regional behaviour

- NZ: HISO 10046 flags as above. GB and AU: no national equivalent in the notes; the control works if a host has its own confidentiality flag [suggested].
- Source: https://tewhatuora.govt.nz/assets/Publications/HISO-Standards/hiso-10046-2024-Consumer-health-identity-standard.pdf
