# PatientIdentifierInput

Picks the right identifier entry control for the region and identifier type: NHS Number, IHI, URN/MRN, Medicare with IRN, DVA file number or NHI.

## When to use

- Forms that serve more than one jurisdiction, or where the identifier type is chosen at run time.

## What you provide

- `region` (or `ClinicalLocaleProvider`), `type` (default: the region's primary identifier: GB `nhs`, AU `ihi`, NZ `nhi`), `value`/`onChange(shown, normalised)`, `required`, `error`, `onValidityChange`.
- Medicare: `irn`, `defaultIrn`, `onIrnChange`, `irnLabel`, `irnRequired`, and the card's "Valid to" box: `validTo`, `defaultValidTo`, `onValidToChange(text, normalised)`, `showValidTo`, `validToRequired`, `expiringWithinMonths`, `now`.
- NHI: `flagTestNumbers`, `lookupNhi(nhi)` (host's NHI service, sync or async) and `onUseLiveNhi(liveNhi, dormantNhi)`.
- MRN: `mrnPattern`, `mrnPatternMessage`.
- Every prop of the underlying control that matters for a form is passed through, so you do not need to use `MedicareNumberInput` or `NhiInput` directly.

```tsx
<PatientIdentifierInput type="medicare" region="AU" value={num} onChange={(_, d) => setNum(d)}
  irn={irn} onIrnChange={setIrn} validTo={validTo} onValidToChange={(_, n) => setValidTo(n)} />
<PatientIdentifierInput region="NZ" required lookupNhi={nhiService.check} onUseLiveNhi={(live) => setNhi(live)} />
```

```tsx
<PatientIdentifierInput type="mrn" region="AU" mrnPattern={/^\d{7}$/} onChange={(_, v) => setUrn(v)} />
```

## Guidance implemented

- G10 1.6 [AU OVERRIDE]: AU primary identifier IHI, then URN; Medicare + IRN and DVA secondary.
- AU-ID-04 [C]: the local record number label (default "URN") and format are organisation-configurable; no format is assumed.
- G11 12.6 [NHS DELTA]: NZ replaces the NHS Number with the NHI.
- Each control applies its own rules; see `NhsNumberInput`, `IhiInput`, `MedicareNumberInput`, `DvaNumberInput` and `NhiInput`.
- [suggested] MRN label "MRN" in GB and NZ.
- [suggested] With `required`, every identifier type shows "(required)" after its label, including the NHS Number.
- G12 1: Medicare "Valid to" month and year with expiry warning. G12 4: dormant NHI reported with its live NHI.

## Do and don't

- Do set `mrnPattern` to your organisation's format.
- Don't use bed or room numbers as identifiers (AU-ID-05).

## Accessibility

- As for each underlying control: visible labels, linked hints and errors.

## Regional behaviour

- GB: NHS Number. AU: IHI (default), URN, Medicare + IRN, DVA. NZ: NHI. The `type` prop can request any control regardless of region.
