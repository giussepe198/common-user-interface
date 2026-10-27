# HpiNumberDisplay

Read-only display of a health provider identifier: Australian HPI-I and HPI-O, and New Zealand HPI identifiers (CPN, organisation, facility, practitioner role).

## When to use

- Showing the identifier of a clinician or organisation, for example on a referral, prescription header or user profile.

## What you provide

- `value`; `type` ("hpi-i", "hpi-o", "cpn", "organisation", "facility", "practitioner-role"), or let it be inferred from the prefix (AU) or format (NZ); `label` (default per type; "" for none); `flagInvalid`.

```tsx
<HpiNumberDisplay region="AU" value="8003611234567893" />
<HpiNumberDisplay region="NZ" type="facility" value="FZZ999-C" />
```

## Guidance implemented

- G10 1.2 [SECONDARY]: HPI-I prefix 800361, HPI-O prefix 800362, 16 digits, Luhn; shown 4-4-4-4 ([UNCERTAIN] grouping).
- G11 1.5 [M]: NZ formats CPN NNXXXX, organisation GXXNNN-C, facility FXXNNN-C, practitioner role RXXNNNNNN-C; the hyphen before the check character is shown.
- G11 1.5 [UNCERTAIN]: the NZ check character algorithm is not published, so only the format is checked.
- Labels "HPI-I", "HPI-O", "HPI CPN" and so on [suggested].

## Do and don't

- Do show the registration body and number alongside where clinicians expect it ([UNCERTAIN] no NZ rule found).

## Accessibility

- Text-only flags; the value stays on one line.

## Regional behaviour

- AU: HPI-I and HPI-O. NZ: HPI identifiers. GB: not applicable.
- Sources: https://hl7.org.au/fhir/StructureDefinition-au-hpii.html ; https://www.tewhatuora.govt.nz/health-services-and-programmes/health-identity/health-provider-index/hpi-overview
