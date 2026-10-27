# MobileSummary

Patient summary screen for phones (concept A1): patient header, early warning card, medicines due, high-priority alerts and the patient record tab bar.

## When to use

- The first tab of the patient record on a phone (patient-first review, direction A).

## What you provide

- `patient`, `earlyWarning` (`{ result? | observation?, definition?, modifications?, nextDueAt?, onRecord?, recordLabel? }`), `medicinesDue` (`{ id, line, state, at }[]`), `onOpenMedicine`, `onAllMedicines`, `alerts` (`{ id, title?, message, actionLabel?, onAction? }[]`).
- `tabs` (default `MOBILE_RECORD_TABS`), `currentTab`, `onTabSelect`, `headerProps`, `children`, `now`, `region`.

```tsx
<MobileSummary patient={p} earlyWarning={{ observation: latest, nextDueAt, onRecord }} medicinesDue={due} alerts={alerts} onTabSelect={go} />
```

## Guidance implemented

- Composed from MobilePatientHeader (sticky), MobileTabBar and the shared marks; the early warning card uses `scoreEarlyWarning`, `ewsZone` and the regional default chart (AU-OB-01).
- AU-OB-04 [M]: zone in words as well as colour; score shown as "N or more" when incomplete, with the missing parameters listed.
- The words beside the total are the chart's triggered response label from the lists scoring result (`mobileEwsHeadline`): NEWS2 "Medium (score 5–6)", NZEWS "Orange zone: EWS 6–7", Between the Flags "Yellow Zone: Clinical Review". The colour zone name is added where the chart names zones by colour and the label does not already say it; parameter-level names such as the NEWS2 "Score 2" are never used for the total.
- Placeholder charts say "Placeholder scores: not for clinical use"; mandatory chart text is shown (G11 12.3).
- Medicines due by shape and word with the time; rows are 56 px buttons.
- Alerts in a danger card with icon, heading and words.

## Regional behaviour

- GB NEWS2, AU ADDS (placeholder scores, verify locally), NZ NZEWS with its mandatory escalation text; header, identifiers and medication lines follow the region.

## Do and don't

- Do pass the latest observation set and the next due time.
- Don't present a placeholder chart score as clinical.

## Accessibility

- Cards are sections labelled by headings; the score has an accessible name ("EWS 7"); the tab bar is a `nav` with `aria-current`.
