# MhPatientBanner

The mental health patient banner: the CUI `PatientBanner` (one dark band, Zone 1 and a collapsible Zone 2) with preferred name and pronouns and the mental health items, and the CUI `MobilePatientHeader` when the banner itself is narrow.

## When to use

- At the top of every screen about one person in the clinical apps (PAB-0009; PAB-0015).
- Not on screens about more than one person (PAB-0015): use `MhPersonRow` in lists.
- High alerts that must be acknowledged are not in the banner: show them in an `AlertContainer` at the top of the page content. The banner shows their count.

## What you provide

- Identity: `name` (legal name parts) or `nameContent`, `preferredName`, `pronouns`, `nameExtension`, `similarNameWarning`, `leading`, `dateOfBirth` or `bornText`, `dateOfDeath` or `deceased`, `sex` (host words), `recordNumber` (labelled `labels.recordNumber`), `identifiers` (IHI, NHI, Medicare the host marks for the header).
- Zone 1 safety items: `legalStatuses` (`MhBannerLegalStatus`: badge props plus `countdown` and `countdownTone`; most restrictive first), `onOpenLegalStatus`, `alerts` and `onShowAllAlerts`, `interpreter`, `consent`, `restricted`, `emergencyAccess` (`BreakGlassBar` props), `items` (more host items: markers, assurance), `actions`.
- Zone 2: `address`, `contacts`, `careTeam` (section 3), `safetySection` (section 4; default the sharing state with `legalDetails`), `allergies`.
- `layout` ("auto", "desktop", "phone"), `phoneBelow` (default 600), `print`, `labels` for every fixed word; legal and service words come from the host.

```tsx
<MhPatientBanner
  name={{ familyName: 'Nguyen', givenName: 'Thi Lan' }} preferredName="Lan" pronouns="she/her"
  dateOfBirth="1990-03-12" sex={host.sex.display} recordNumber="004512"
  legalStatuses={[{ state: 'current', label: host.labels.orderType, countdown: 'in 2 days', countdownTone: 'urgent' }]}
  alerts={alerts} onShowAllAlerts={openAlerts}
  allergies={{ status: 'known', items: [{ name: 'Penicillin', reaction: 'rash' }] }}
  careTeam={{ title: 'Care team Adult community', content: teamDetails }}
  actions={<Button size="sm">Safety summary</Button>}
/>
```

On a phone screen with no other way back (an offline visit host, a full-screen review), pass `onBack` and `backLabel`: the phone header gets the CUI back button before the name; the desktop banner ignores it `[suggested]`.

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- PAB-0049 to PAB-0053 [M]: legal name "FAMILY, Given (Title)", no labels, never truncated; AU hides the title (AU-PI-02), NZ keeps the family name as recorded (G11 2.3).
- PAB-0016 [M] order for identity: name, Born, then sex (sex in place of gender [suggested]), then the record number and host identifiers.
- PAB-0033, PAB-0034 [M]: "Born dd-Mmm-yyyy (age)" with the CUI age; CUI date format.
- PAB-0019 [M]: no slot is ever blank or "?": "Not Known" for a missing sex, "No record number", "No order recorded", "No alerts recorded", "Allergies not recorded".
- PAB-0004, PAB-0006 [M]: Zone 2 collapsed by default; its title row keeps address, phone and email, care team, sharing and the allergy status in view, so the banner stays about two rows high.
- PAB-0009, PAB-0011 [M]: sticky at the top of its scrolling container (`sticky`); the emergency access bar sticks with it.
- NUM-0001 [M], MPB-0054 [M]: identifiers never truncated or split; items wrap between themselves, never inside a value.
- "Known as Lan (she/her)" beside the legal name whenever a preferred name or pronouns differ; "Pronouns they/them" when only pronouns are recorded [suggested].
- Legal status is a Zone 1 item: the most restrictive order's words with the legal symbol, the host's unconfirmed words, and the countdown words only when soon, urgent or expired ("and N more" for further orders); never shown as current when unconfirmed. Alerts are a Zone 1 item: a count in words ("2 high, 3 other") with the highest severity's CUI `AlertSymbol`, a button to the full list [suggested].
- Restricted information held, a sharing restriction (consent restricted or withdrawn) and an interpreter are Zone 1 items in the band; other sharing states are in Zone 2 [suggested].
- Allergies known list the items, "No known allergies (checked date)" only when recorded so, anything else "Allergies not recorded"; an empty known list is never shown as known or none [suggested].
- Phone: below `phoneBelow` px of its own width (measured, so it works in any slot) the banner is the CUI `MobilePatientHeader` with the same items in compact form; the expand button opens the details in place below the header (address, contacts, interpreter, sharing, care team), capped at half the screen while open. Interpreter, sharing restriction and restricted marker move into the details there; legal status, alerts, allergies and host markers stay in the header [suggested].
- Print: `print` gives light colours and nothing interactive [suggested].
- Deceased: Died in words with the CUI deceased colour and pattern, never red [suggested].

## Mental health safety note

- Why the preferred name and pronouns are shown: misgendering and dead-naming are known harms in mental health care, and the preferred name is how staff speak to the person. It is always visible beside the legal name, never truncated and never hidden.
- Wrong person risk: the legal name stays the title in the CUI form; the confirmation set stays name, date of birth and record number; sex sits right after the date of birth. The "Known as" text is a separate element, so it can never be read as part of the legal name.
- High alerts are acknowledged in the alert panel on the page, not in the banner; the banner keeps their count in view on every screen.

## Regional behaviour

- GB, AU, NZ: name case, title rule and identifier formats follow the region through the CUI patient components (G10, G11). Record number label default "Record number" [suggested]; pass the host's label.
- Dates in the locale's zone (`ClinicalLocaleProvider`).

## Do and don't

- Do pass the host's words for sex, legal status and the record number label.
- Do pass every current legal status, most restrictive first.
- Don't put the preferred name in `name.givenName`; the legal name is the title.
- Don't add a chip row under the banner; add `items` to the band or a Zone 2 section.

## Accessibility

- The CUI PatientBanner section ("Patient banner: NGUYEN, Thi Lan"); labels and values from `LabelledValue`; the legal status and alert count are buttons with their whole meaning as the name when they open something.
- Every symbol has words beside it; nothing relies on colour. No motion.
