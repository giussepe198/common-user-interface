# PatientNameDisplay

Shows a patient's name in the standard "FAMILY, Given (Title)" format wherever a name is displayed.

## When to use

- Any read-only display of a patient's name: banners, lists, headings, letters on screen.

## What you provide

- `familyName`, `givenName`, optional `title`, `showTitle`, `emphasis` (20/26 semibold), `as`.

```tsx
<PatientNameDisplay familyName="Chandrasekhar" givenName="Subramanyan" title="Mr" emphasis />
// CHANDRASEKHAR, Subramanyan (Mr)
```

The same rules are available as a string through `formatPatientName`.

## Guidance implemented

- NID-0001, PAB-0053 [M]: family name in upper case.
- NID-0002, PAB-0051 [M]: comma after the family name.
- NID-0003, NID-0008, PAB-0052 [M]: one pair of parentheses around the title.
- NID-0004, PAB-0049 [M]: order Family, Given, Title; no labels (PAB-0050).
- NID-0005, MPB-0054 [M]: never truncated.
- NID-0006 [M]: single space between given name and title.
- NID-0007, NID-0010 [M]: title in title case with no trailing full stop ("Mr", not "MR.").
- NID-0009 [M]: titles up to 35 characters.
- NID-0012 [M]: multi-part names keep their hyphen or single space ("LIDMAN-SUN-DEWAR", "Anne-Jorun", "Nis Bank").
- NID-0013 [R]: lines break only between whole components, never inside one or at a hyphen.
- MPB-0051 [M]: `showTitle={false}` drops the parentheses too.
- [suggested] Given names and titles typed entirely in one case are capitalised; mixed-case parts ("McDonald", "DeShawn") are kept as stored.
- [suggested] A missing family or given name shows "Not Known" so the format stays unambiguous.
- HISO 10046:2024 2.2.7 [M]: `nameProtected` (name protection flag = 1). Default "indicator": the name stays visible to identify the patient, with "Name protected" (lock icon and text) [suggested]. `protectedDisplay="masked"` hides it; with `onRevealProtected` a "Show name" button asks for a reason (required) and calls back for the host to record it; return false to keep it hidden [suggested]. Esc cancels.

## Do and don't

- Do give the container enough width for 40-character PDS names.
- Don't apply CSS `text-overflow: ellipsis` to a name.
- Don't show middle names or suffixes here.

## Accessibility

- Plain text: screen readers read the elements in order and users can spell them out letter by letter.

## Regional behaviour

- GB: unchanged (NID rules).
- AU: family name in upper case and title hidden by default, as on the ACSQHC identification band (AU-PI-02); a single-name patient is shown as the name alone with no comma or placeholder (AU-NM-01); `unidentified` adds "Unidentified patient" (AU-NM-02).
- NZ: family and given names as recorded (HISO 10046 sentence case, G11 2.3) with the family name distinguished by weight and order; [UNCERTAIN] no NZ source mandates banner case, so `familyNameCase="upper"` restores upper case. Single names shown alone (G11 2.1).
- All regions: input is normalised to NFC so a combining macron becomes the precomposed letter; macrons are never stripped and upper-casing keeps them ("NGĀWAI").
- NZ name protection flag: HISO 10046 2.2.7 (G12 section 3). The standard defines the flag, not the display.
