# VitalSignsChart

An observation and response chart (track and trigger): each parameter's bands as coloured rows, every observation written in its band, a score per parameter and a total per observation set, with the zone and required response in words.

## When to use

Adult ward observations where an early warning score is in use: NZEWS (New Zealand), ADDS or a state chart (Australia), NEWS2 (Great Britain). Use `EarlyWarningScoreSummary` alone where only the current score is needed, and `ObservationGraph` with `zones` for a single parameter over a long period.

## What you provide

```tsx
<ClinicalLocaleProvider region="NZ">
  <VitalSignsChart
    observations={[
      { time: '2026-10-27T02:00', values: { respiratoryRate: 27, oxygenSaturation: 92, supplementalOxygen: { value: 'oxygen', display: '4 L/min' },
        heartRate: 122, systolicBloodPressure: 96, temperature: 38.9, consciousness: 'V' } },
    ]}
    modifications={[{ id: 'm1', parameterId: 'heartRate', from: 90, to: 110, score: 0, label: 'HR 90–109', reason: 'AF, rate controlled',
      authorisedBy: 'Dr H Te Huia, 027 555 0101', startedAt: '2026-10-25T09:00', durationHours: 72, signed: true }]}
  />
</ClinicalLocaleProvider>
```

- `observations`: sets of values keyed by parameter id. Categorical values use the option codes (`'air'`/`'oxygen'`, `'A'`/`'V'`/`'P'`/`'U'`); a boolean picks the second option for true. `{ value, display }` keeps the recorded text ("37.0", "4 L/min"). `notes` holds additional observations (AU new confusion, concern).
- `definition`: any `EwsChartDefinition`. Default by region: GB `EWS_NEWS2`, AU `EWS_ADDS_PLACEHOLDER`, NZ `EWS_NZEWS`. Use `configureEwsChart` for local scores, response wording or "777"/"MET" instead of "RRT"; `news2ChartDefinition({ spo2Scale: 2 })` for NEWS2 SpO2 scale 2.
- `layout`: `'bands'` (default, like the paper chart) or `'compact'` (one row per parameter).
- The engine is pure: `scoreEarlyWarning(definition, set, modifications)` returns the parameter scores, total, completeness, the most severe triggered response and the reasons.

## Guidance implemented

- G11 12.2 [M] NZEWS bands and scores as printed on the HQSC chart; blue zone values are unscored and trigger by zone.
- G11 12.3 [M] escalation by total (1–5 yellow, 6–7 orange, 8–9 red, 10+ blue) or by any vital sign in the red or blue zone; the most severe trigger wins (one red parameter with total 5 is red; four red parameters, total 12, is blue).
- G11 12.3 [M] "ESCALATE CARE FOR ANY PATIENT YOU, THEY OR THEIR FAMILY ARE WORRIED ABOUT, REGARDLESS OF VITAL SIGNS OR EWS" and "If there is no timely response ..." always shown with the NZEWS chart.
- G11 12.4 [M] modifications shown beside their parameter with accepted values, modified score, reason, authoriser and expiry; unsigned, undated or expired modifications are shown struck through and never change the score.
- G11 12.5 [M] published zone colours (light theme), 60% tint in the graphing area and full colour in the side columns; colour is never the only cue (score number and zone name in words).
- G11 7.1 "Date" and "Time (24 hour)" headings on the NZEWS chart.
- AU-OB-01 [M] bands, scores, colours, zones and responses are data; ADDS ships as structure with placeholder scores, flagged on screen once, above the chart (the embedded summary does not repeat it).
- AU-OB-02 [M] the seven minimum observations plus "New confusion or change in behaviour" and "Staff, patient or family concern" rows.
- AU-OB-03 [M] graphical trend with bands; extreme "write value" bands hold the actual value, never clipped.
- AU-OB-04 [M] zone and score carried by text as well as colour (patterned fills are not used) `[suggested]`.
- AU-OB-05 [M] patient-specific modified thresholds with approver, reason and review date or duration.
- AU-OB-06 [M] required response shown next to the triggered value (summary above the chart).
- Consensus Statement 1.8..1.11: structured tool, graphical trends, thresholds and responses at each threshold.
- GTAB-188 [R] newest observations scrolled into view on the right.
- `[suggested]` an incomplete set shows its total as a minimum ("8+", "Incomplete") and the response is taken from what is recorded.

Critical thresholds
- GTAB-177 [M] `criticalThresholds` keyed by parameter id (`appliesTo: 'temperature'`) adds limits beside the chart bands: values beyond them get a heavy double border and an arrow, are read as "critical high/low", and the limits are listed above the chart. They never change the score or zone `[suggested]`.

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Default chart | NEWS2 (RCP 2017), SpO2 scale 1 | ADDS (ACSQHC 2012) with placeholder scores | NZEWS (HQSC 2017/2018) |
| Status | Published bands; verify locally | Placeholder: set scores from the local chart | Published bands; needs clinical verification |
| Mandatory text | None | Emergency call criteria regardless of score (Consensus Statement element 3) `[wording suggested]` | HQSC escalate-if-worried banner and "no timely response" line |
| Unscored zone | None | Purple (emergency call) `[UNCERTAIN colour]` | Blue (rapid response call, "RRT") |
| Extra rows | None (new confusion is part of ACVPU) | New confusion, concern | None |

Clinical verification needed (owner action):
- NZEWS: transcribed from the HQSC chart (S13) and user guide (S14). Heart rate 120s scores 2 (chart) although the user guide lists 120 as a boundary. The score-to-colour mapping is read from the chart graphics. Yellow, orange and red response actions are local (`local: true`); set them with `configureEwsChart`.
- ADDS: row bands and the 1–3 / 4–5 / 6–7 / 8+ responses are from the ACSQHC chart; every per-band score and colour is a placeholder (the development report calls cut-offs placeholders subject to clinical review). Heart rate lowest band is labelled "≤ 30s" in the source; values 30 to 39 are placed in it.
- NEWS2: bands and thresholds are the published RCP values. Response zone colours (low yellow, low–medium and medium orange, high red) are `[suggested]`.

- NSW Between the Flags (`EWS_NSW_BTF`, AU, opt in with `definition`): zone-based calling criteria from the CEC Standard Adult General Observation (SAGO) chart. No total: the totals row shows "Within the flags", "Yellow" or "Red" with "Clinical review" or "Rapid response", and each parameter row is labelled "zone". Zone actions and additional criteria come from the SAGO chart; numeric boundaries come from NSW Health orientation material because the chart draws them graphically. Shared boundaries (RR 30, SpO2 90, SBP 90 and 200, HR 40 and 140) are placed in the Red Zone. The chart shows "verify the zone boundaries against the chart in use locally" on screen. Research notes: G10 section 16.

Sources: CEC SAGO chart https://cec.health.nsw.gov.au/__data/assets/pdf_file/0012/258699/NSW-Health-Standard-Adult-General-Observation-Chart.PDF ; NSW Health PD2025_014 https://www1.health.nsw.gov.au/pds/ActivePDSDocuments/PD2025_014.pdf ; HQSC NZEWS chart https://www.hqsc.govt.nz/assets/Our-work/Improved-service-delivery/Patient-deterioration/Publications-resources/Interactive-NVSC-final-Nov-2018-1-v2.pdf ; HQSC user guide https://www.hqsc.govt.nz/assets/Our-work/Improved-service-delivery/Patient-deterioration/Publications-resources/Vital_sign_chart_user_guide_July_2017_.pdf ; ACSQHC ADDS https://www.safetyandquality.gov.au/sites/default/files/migrated/ADDS-chart-without-blood-pressure-table-2012.pdf ; ACSQHC Consensus Statement https://www.safetyandquality.gov.au/sites/default/files/2021-12/essential_elements_for_recognising_and_responding_to_acute_physiological_deterioration.pdf ; RCP NEWS2 https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/

### Zone colour tokens

Defined in `VitalSignsChart.css` on `:root` and `[data-theme="dark"]`; override them on `.cui-root` or any ancestor.

| Token | Light | Dark | Source |
|---|---|---|---|
| `--ews-zone-yellow` | #ffff99 | #4a4712 | HQSC Table 2 (255 255 153) |
| `--ews-zone-orange` | #ffe0ba | #57381a | HQSC Table 2 (255 224 186) |
| `--ews-zone-red` | #ffc0d8 | #5a2236 | HQSC Table 2 (255 192 216) |
| `--ews-zone-blue` | #d1e8ff | #1b3756 | HQSC Table 2 (209 232 255) |
| `--ews-zone-purple` | #e6d5ff | #3d2a5e | `[suggested]` (ADDS colours not published) |

`--ink` on every fill is at least 10:1 in light theme and 8:1 in dark theme.

## Do and don't

- Do verify the chart definition against the chart your organisation uses before go-live.
- Do set local response wording with `configureEwsChart` rather than editing the presets.
- Don't use these charts for pregnant women or children.
- Don't hide the mandatory text, and don't apply a modification that is unsigned or has no duration.

## Accessibility

- A table with row and column headers; the scroll region is focusable and labelled by the caption.
- Each marked value carries its unit, score and zone as text for screen readers; side columns show the score number and, for unscored zones, the response name ("RRT").
- The layout toggle is a button with `aria-pressed`.
