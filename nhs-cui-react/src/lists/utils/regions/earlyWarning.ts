import type { ClinicalRegion } from '../../../core/locale';
import type { EwsChartDefinition, EwsZone } from '../earlyWarning';

/*
 * Early warning chart presets. Every preset must be verified against the chart in use locally before clinical use.
 * Colours are CSS custom properties defined in src/lists/VitalSignsChart/VitalSignsChart.css (light theme = published
 * fill where one is published; dark theme = a darker shade of the same hue so light text keeps 4.5:1 contrast).
 */

// ---------------------------------------------------------------------------------------------------------------
// New Zealand: NZEWS adult vital signs chart (HQSC).
// Source S13: https://www.hqsc.govt.nz/assets/Our-work/Improved-service-delivery/Patient-deterioration/Publications-resources/Interactive-NVSC-final-Nov-2018-1-v2.pdf
// Source S14: https://www.hqsc.govt.nz/assets/Our-work/Improved-service-delivery/Patient-deterioration/Publications-resources/Vital_sign_chart_user_guide_July_2017_.pdf
// Bands and scores per G11 12.2 (chart text); colours per S14 Table 2 (G11 12.5); escalation per G11 12.3.
// ---------------------------------------------------------------------------------------------------------------

const NZ_ZONES: EwsZone[] = [
  { id: 'none', label: 'No zone', rank: 0 },
  { id: 'yellow', label: 'Yellow zone', colourVar: '--ews-zone-yellow', rank: 1 },
  { id: 'orange', label: 'Orange zone', colourVar: '--ews-zone-orange', rank: 2 },
  { id: 'red', label: 'Red zone', colourVar: '--ews-zone-red', rank: 3 },
  { id: 'blue', label: 'Blue zone', shortLabel: 'RRT', colourVar: '--ews-zone-blue', rank: 4 },
];

/** NZEWS: exact bands and escalation thresholds from the HQSC chart. Scoring needs clinical verification locally. */
export const EWS_NZEWS: EwsChartDefinition = {
  id: 'nz-nzews',
  name: 'New Zealand Early Warning Score (NZEWS)',
  totalLabel: 'EWS',
  region: 'NZ',
  population: 'Acutely hospitalised adults who are not pregnant (not for maternity or paediatrics)',
  status: 'published',
  verification:
    'Bands transcribed from the HQSC adult vital signs chart (November 2018) and user guide (July 2017). Heart rate 120s scores 2 as on the chart (the user guide lists 120 as a boundary). Score-to-colour mapping is read from the chart graphics. Needs clinical verification before use.',
  sources: [
    { title: 'HQSC NZEWS vital sign chart (Nov 2018)', url: 'https://www.hqsc.govt.nz/assets/Our-work/Improved-service-delivery/Patient-deterioration/Publications-resources/Interactive-NVSC-final-Nov-2018-1-v2.pdf' },
    { title: 'HQSC vital sign chart user guide (July 2017)', url: 'https://www.hqsc.govt.nz/assets/Our-work/Improved-service-delivery/Patient-deterioration/Publications-resources/Vital_sign_chart_user_guide_July_2017_.pdf' },
  ],
  timeHeading: 'Time (24 hour)',
  zones: NZ_ZONES,
  parameters: [
    {
      id: 'respiratoryRate', label: 'Respiratory rate', shortLabel: 'RR', unit: 'breaths/min', unitDefinition: 'breaths per minute', type: 'numeric',
      bands: [
        { from: 36, score: null, zone: 'blue', label: '≥ 36', writeValue: true },
        { from: 25, to: 36, score: 3, zone: 'red', label: '25–35' },
        { from: 21, to: 25, score: 2, zone: 'orange', label: '21–24' },
        { from: 12, to: 21, score: 0, zone: 'none', label: '12–20' },
        { from: 9, to: 12, score: 1, zone: 'yellow', label: '9–11' },
        { from: 5, to: 9, score: 3, zone: 'red', label: '5–8' },
        { to: 5, score: null, zone: 'blue', label: '≤ 4', writeValue: true },
      ],
    },
    {
      id: 'oxygenSaturation', label: 'Oxygen saturation', shortLabel: 'SpO2', unit: '%', unitDefinition: 'per cent', type: 'numeric',
      bands: [
        { from: 96, score: 0, zone: 'none', label: '≥ 96' },
        { from: 94, to: 96, score: 1, zone: 'yellow', label: '94–95' },
        { from: 92, to: 94, score: 2, zone: 'orange', label: '92–93' },
        { to: 92, score: 3, zone: 'red', label: '≤ 91' },
      ],
    },
    {
      id: 'supplementalOxygen', label: 'Oxygen', shortLabel: 'O2', type: 'categorical',
      options: [{ value: 'air', label: 'Room air' }, { value: 'oxygen', label: 'Supplement' }],
      bands: [
        { values: ['air'], score: 0, zone: 'none', label: 'Room air' },
        { values: ['oxygen'], score: 2, zone: 'orange', label: 'Supplement (L/min)' },
      ],
    },
    {
      id: 'heartRate', label: 'Heart rate', shortLabel: 'HR', unit: 'beats/min', unitDefinition: 'beats per minute', type: 'numeric',
      bands: [
        { from: 140, score: null, zone: 'blue', label: '≥ 140', writeValue: true },
        { from: 130, to: 140, score: 3, zone: 'red', label: '130s' },
        { from: 110, to: 130, score: 2, zone: 'orange', label: '110s–120s' },
        { from: 90, to: 110, score: 1, zone: 'yellow', label: '90s–100s' },
        { from: 50, to: 90, score: 0, zone: 'none', label: '50s–80s' },
        { from: 40, to: 50, score: 2, zone: 'orange', label: '40s' },
        { to: 40, score: null, zone: 'blue', label: '30s', writeValue: true },
      ],
    },
    {
      id: 'systolicBloodPressure', label: 'Blood pressure (systolic scored)', shortLabel: 'BP', unit: 'mmHg', unitDefinition: 'millimetres of mercury', type: 'numeric',
      bands: [
        { from: 220, score: 3, zone: 'red', label: '≥ 220', writeValue: true },
        { from: 110, to: 220, score: 0, zone: 'none', label: '110s–210s' },
        { from: 100, to: 110, score: 1, zone: 'yellow', label: '100s' },
        { from: 90, to: 100, score: 2, zone: 'orange', label: '90s' },
        { from: 70, to: 90, score: 3, zone: 'red', label: '70s–80s' },
        { to: 70, score: null, zone: 'blue', label: '50s–60s', writeValue: true },
      ],
    },
    {
      id: 'temperature', label: 'Temperature', shortLabel: 'Temp', unit: '°C', unitDefinition: 'degrees Celsius', type: 'numeric', precision: 1,
      bands: [
        { from: 39, score: 2, zone: 'orange', label: '≥ 39s' },
        { from: 38, to: 39, score: 1, zone: 'yellow', label: '38s' },
        { from: 36, to: 38, score: 0, zone: 'none', label: '36s–37s' },
        { from: 35, to: 36, score: 1, zone: 'yellow', label: '35s' },
        { to: 35, score: 2, zone: 'orange', label: '≤ 34s' },
      ],
    },
    {
      id: 'consciousness', label: 'Level of consciousness', shortLabel: 'LOC', type: 'categorical',
      options: [{ value: 'A', label: 'Alert' }, { value: 'V', label: 'Voice' }, { value: 'P', label: 'Pain' }, { value: 'U', label: 'Unresponsive' }],
      bands: [
        { values: ['A'], score: 0, zone: 'none', label: 'Alert' },
        { values: ['V'], score: 3, zone: 'red', label: 'Voice' },
        { values: ['P'], score: 3, zone: 'red', label: 'Pain' },
        { values: ['U'], score: null, zone: 'blue', label: 'Unresponsive' },
      ],
    },
  ],
  responses: [
    { id: 'zero', zone: 'none', label: 'EWS 0', response: 'Continue observations as set by the patient’s monitoring plan.', local: true, minTotal: 0, maxTotal: 0, rank: 0 },
    { id: 'yellow', zone: 'yellow', label: 'EWS 1–5', shortLabel: 'Yellow', response: 'Take the actions your organisation sets for the yellow zone.', local: true, minTotal: 1, maxTotal: 5, rank: 1 },
    {
      id: 'orange', zone: 'orange', label: 'EWS 6–7', shortLabel: 'Orange', descriptor: 'Acute illness or unstable chronic disease',
      response: 'Take the actions your organisation sets for the orange zone.', local: true, minTotal: 6, maxTotal: 7, rank: 2,
    },
    {
      id: 'red', zone: 'red', label: 'EWS 8–9 or any vital sign in the red zone', shortLabel: 'Red', descriptor: 'Likely to deteriorate rapidly',
      response: 'Take the actions your organisation sets for the red zone.', local: true, minTotal: 8, maxTotal: 9, anyParameterZones: ['red'], rank: 3,
    },
    {
      id: 'blue', zone: 'blue', label: 'EWS 10 or more, or any vital sign in the blue zone', shortLabel: 'Blue (RRT)', descriptor: 'Immediately life threatening critical illness',
      response: 'Rapid response call (RRT). Make the call even when senior clinicians are at the bedside.', minTotal: 10, anyParameterZones: ['blue'], rank: 4,
    },
  ],
  mandatoryText: [
    'ESCALATE CARE FOR ANY PATIENT YOU, THEY OR THEIR FAMILY ARE WORRIED ABOUT, REGARDLESS OF VITAL SIGNS OR EWS',
    'If there is no timely response to your request for review, escalate to the next coloured zone.',
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Australia: Adult Deterioration Detection System (ADDS), ACSQHC.
// Bands: https://www.safetyandquality.gov.au/sites/default/files/migrated/ADDS-chart-without-blood-pressure-table-2012.pdf
// Development report (cut-offs "should be regarded as placeholders and subject to clinical review"):
//   https://www.safetyandquality.gov.au/sites/default/files/migrated/35981-ChartDevelopment.pdf
// Consensus Statement (3rd ed, 2021): https://www.safetyandquality.gov.au/sites/default/files/2021-12/essential_elements_for_recognising_and_responding_to_acute_physiological_deterioration.pdf
// Bands and response actions per G10 12.3 [VERIFIED]; per-band scores and colours are PLACEHOLDERS (G10 12.3 [UNCERTAIN]).
// ---------------------------------------------------------------------------------------------------------------

const AU_ZONES: EwsZone[] = [
  { id: 'none', label: 'No zone', rank: 0 },
  { id: 'yellow', label: 'Yellow zone', colourVar: '--ews-zone-yellow', rank: 1 },
  { id: 'orange', label: 'Orange zone', colourVar: '--ews-zone-orange', rank: 2 },
  { id: 'red', label: 'Red zone', colourVar: '--ews-zone-red', rank: 3 },
  { id: 'purple', label: 'Purple zone (emergency)', shortLabel: 'Call', colourVar: '--ews-zone-purple', rank: 4 },
];

const decades = (top: number, bottom: number, zoneScore: (lo: number) => [number | null, string]) => {
  const out = [];
  for (let lo = top; lo >= bottom; lo -= 10) {
    const [score, zone] = zoneScore(lo);
    out.push({ from: lo, to: lo + 10, score, zone, label: `${lo}s` });
  }
  return out;
};

/**
 * ADDS (ACSQHC 2011/2012): row bands as published; every score and zone is a PLACEHOLDER. Configure them from the
 * chart in use with configureEwsChart before clinical use (G10 12.3, AU-OB-01).
 */
export const EWS_ADDS_PLACEHOLDER: EwsChartDefinition = {
  id: 'au-adds-placeholder',
  name: 'Adult Deterioration Detection System (ADDS)',
  totalLabel: 'ADDS score',
  region: 'AU',
  population: 'Adults (separate charts exist for maternity and paediatrics)',
  status: 'placeholder',
  verification:
    'Row bands and response thresholds follow the ACSQHC ADDS chart (2012). The per-band scores and zone colours are placeholders: the published scores were in images and ACSQHC says the cut-offs are placeholders subject to clinical review. Replace them with your local chart (configureEwsChart) before use.',
  sources: [
    { title: 'ACSQHC ADDS chart without blood pressure table (2012)', url: 'https://www.safetyandquality.gov.au/sites/default/files/migrated/ADDS-chart-without-blood-pressure-table-2012.pdf' },
    { title: 'ACSQHC ADDS chart development report', url: 'https://www.safetyandquality.gov.au/sites/default/files/migrated/35981-ChartDevelopment.pdf' },
    { title: 'ACSQHC National Consensus Statement, 3rd edition (2021)', url: 'https://www.safetyandquality.gov.au/sites/default/files/2021-12/essential_elements_for_recognising_and_responding_to_acute_physiological_deterioration.pdf' },
  ],
  zones: AU_ZONES,
  parameters: [
    {
      id: 'respiratoryRate', label: 'Respiratory rate', shortLabel: 'RR', unit: 'breaths/min', unitDefinition: 'breaths per minute', type: 'numeric',
      bands: [
        { from: 35, score: null, zone: 'purple', label: '≥ 35', writeValue: true },
        { from: 30, to: 35, score: 3, zone: 'red', label: '30–34' },
        { from: 25, to: 30, score: 2, zone: 'orange', label: '25–29' },
        { from: 20, to: 25, score: 1, zone: 'yellow', label: '20–24' },
        { from: 15, to: 20, score: 0, zone: 'none', label: '15–19' },
        { from: 10, to: 15, score: 0, zone: 'none', label: '10–14' },
        { from: 5, to: 10, score: 2, zone: 'orange', label: '5–9' },
        { to: 5, score: null, zone: 'purple', label: '≤ 4', writeValue: true },
      ],
    },
    {
      id: 'oxygenSaturation', label: 'Oxygen saturation', shortLabel: 'SpO2', unit: '%', unitDefinition: 'per cent', type: 'numeric',
      bands: [
        { from: 98, score: 0, zone: 'none', label: '98–100' },
        { from: 95, to: 98, score: 0, zone: 'none', label: '95–97' },
        { from: 93, to: 95, score: 1, zone: 'yellow', label: '93–94' },
        { from: 90, to: 93, score: 2, zone: 'orange', label: '90–92' },
        { from: 87, to: 90, score: 3, zone: 'red', label: '87–89' },
        { from: 85, to: 87, score: 3, zone: 'red', label: '85–86' },
        { to: 85, score: null, zone: 'purple', label: '≤ 84', writeValue: true },
      ],
    },
    {
      id: 'oxygenFlow', label: 'Oxygen flow', shortLabel: 'O2', unit: 'L/min', unitDefinition: 'litres per minute', type: 'numeric',
      bands: [
        { from: 13, score: 3, zone: 'red', label: '≥ 13' },
        { from: 10, to: 13, score: 2, zone: 'orange', label: '10–12' },
        { from: 7, to: 10, score: 1, zone: 'yellow', label: '7–9' },
        { from: 4, to: 7, score: 1, zone: 'yellow', label: '4–6' },
        { to: 4, score: 0, zone: 'none', label: '≤ 3' },
      ],
    },
    {
      id: 'systolicBloodPressure', label: 'Systolic blood pressure', shortLabel: 'BP', unit: 'mmHg', unitDefinition: 'millimetres of mercury', type: 'numeric',
      bands: [
        { from: 200, score: 3, zone: 'red', label: '≥ 200', writeValue: true },
        ...decades(190, 50, lo => (lo >= 190 ? [2, 'orange'] : lo >= 180 ? [1, 'yellow'] : lo >= 110 ? [0, 'none'] : lo >= 100 ? [1, 'yellow'] : lo >= 90 ? [2, 'orange'] : lo >= 80 ? [3, 'red'] : [null, 'purple'])),
        { to: 50, score: null, zone: 'purple', label: '40s', writeValue: true },
      ],
    },
    {
      id: 'heartRate', label: 'Heart rate', shortLabel: 'HR', unit: 'beats/min', unitDefinition: 'beats per minute', type: 'numeric',
      bands: [
        { from: 140, score: null, zone: 'purple', label: '≥ 140', writeValue: true },
        ...decades(130, 40, lo => (lo >= 130 ? [3, 'red'] : lo >= 120 ? [2, 'orange'] : lo >= 110 ? [1, 'yellow'] : lo >= 50 ? [0, 'none'] : [2, 'orange'])),
        { to: 40, score: null, zone: 'purple', label: '≤ 30s', writeValue: true },
      ],
    },
    {
      id: 'temperature', label: 'Temperature', shortLabel: 'Temp', unit: '°C', unitDefinition: 'degrees Celsius', type: 'numeric', precision: 1,
      bands: [
        { from: 39.1, score: 2, zone: 'orange', label: '≥ 39.1', writeValue: true },
        { from: 38.5, to: 39.1, score: 1, zone: 'yellow', label: '38.5–39.0' },
        { from: 38.0, to: 38.5, score: 0, zone: 'none', label: '38.0–38.4' },
        { from: 37.5, to: 38.0, score: 0, zone: 'none', label: '37.5–37.9' },
        { from: 37.0, to: 37.5, score: 0, zone: 'none', label: '37.0–37.4' },
        { from: 36.5, to: 37.0, score: 0, zone: 'none', label: '36.5–36.9' },
        { from: 36.0, to: 36.5, score: 0, zone: 'none', label: '36.0–36.4' },
        { from: 35.5, to: 36.0, score: 1, zone: 'yellow', label: '35.5–35.9' },
        { to: 35.5, score: 2, zone: 'orange', label: '≤ 35.4', writeValue: true },
      ],
    },
    {
      id: 'consciousness', label: 'Consciousness (AVPU)', shortLabel: 'LOC', type: 'categorical',
      options: [{ value: 'A', label: 'Alert' }, { value: 'V', label: 'Voice' }, { value: 'P', label: 'Pain' }, { value: 'U', label: 'Unresponsive' }],
      bands: [
        { values: ['A'], score: 0, zone: 'none', label: 'Alert' },
        { values: ['V'], score: 2, zone: 'orange', label: 'Voice' },
        { values: ['P'], score: 3, zone: 'red', label: 'Pain' },
        { values: ['U'], score: null, zone: 'purple', label: 'Unresponsive' },
      ],
    },
  ],
  responses: [
    { id: 'zero', zone: 'none', label: 'Score 0', response: 'Continue observations as set by the patient’s monitoring plan.', local: true, minTotal: 0, maxTotal: 0, rank: 0 },
    { id: 'score1to3', zone: 'yellow', label: 'Score 1–3', shortLabel: 'Yellow', response: 'Inform the nurse in charge. Increase the frequency of observations.', minTotal: 1, maxTotal: 3, rank: 1 },
    { id: 'score4to5', zone: 'orange', label: 'Score 4–5', shortLabel: 'Orange', response: 'Senior nurse and/or junior medical officer review within 30 minutes. Increase the frequency of observations.', minTotal: 4, maxTotal: 5, rank: 2 },
    { id: 'score6to7', zone: 'red', label: 'Score 6–7', shortLabel: 'Red', response: 'Registrar-level (senior medical officer) review within 30 minutes.', minTotal: 6, maxTotal: 7, rank: 3 },
    {
      id: 'emergency', zone: 'purple', label: 'Score 8 or more, or any observation in a purple area', shortLabel: 'Emergency', response: 'Emergency call.',
      minTotal: 8, anyParameterZones: ['purple'], rank: 4,
    },
  ],
  mandatoryText: [
    'Make an emergency call whatever the score for: any observation in a purple area, threatened airway, respiratory or cardiac arrest, new SpO2 below 90%, sudden fall in level of consciousness, seizure, or serious concern by staff, the patient or their family.',
  ],
  additionalObservations: [
    { id: 'newConfusion', label: 'New confusion or change in behaviour' },
    { id: 'concern', label: 'Staff, patient or family concern' },
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Australia, New South Wales: Between the Flags (BTF) calling criteria, NSW Health Standard Adult General
// Observation (SAGO) chart, Clinical Excellence Commission (CEC). See G10 "NSW Between the Flags: SAGO calling criteria".
// Primary, chart (form SMR110010; zone actions, additional criteria, ACVPU, alterations to calling criteria):
//   https://cec.health.nsw.gov.au/__data/assets/pdf_file/0012/258699/NSW-Health-Standard-Adult-General-Observation-Chart.PDF
// Primary, policy (zones described, no numeric criteria): NSW Health PD2025_014, April 2025 (replaces PD2020_018):
//   https://www1.health.nsw.gov.au/pds/ActivePDSDocuments/PD2025_014.pdf
// Secondary, numeric boundaries (the SAGO chart draws the zones graphically; its text layer has no numbers):
//   https://www.seslhd.health.nsw.gov.au/sites/default/files/groups/Prince_of_Wales_Hospital/Medical%20education/Medical%20Officer%20Orientation%20Uploads/RegistrarOrientationBetweentheFlags2025.pdf
//   https://seslhd.health.nsw.gov.au/sites/default/files/POWMedEd/2024%20MEU%20secure/Between%20the%20Flags%20Orientation%20SZSA5Feb24.pdf
//   https://www.seslhd.health.nsw.gov.au/sites/default/files/documents/adultacuteforescalation19.pdf (red zone only, 2018)
// Where the secondary sources give a boundary in both zones (e.g. yellow 25-30 and red >= 30) the value is placed
// in the red zone (the safer reading). VERIFY LOCALLY against the SAGO chart in use.
// ---------------------------------------------------------------------------------------------------------------

const BTF_ZONES: EwsZone[] = [
  { id: 'none', label: 'Within the flags', rank: 0 },
  { id: 'yellow', label: 'Yellow Zone', shortLabel: 'Yellow', colourVar: '--ews-zone-yellow', rank: 1 },
  { id: 'red', label: 'Red Zone', shortLabel: 'Red', colourVar: '--ews-zone-red', rank: 2 },
];

/**
 * NSW Between the Flags adult calling criteria (CEC SAGO chart, SMR110010). Zone-based: no aggregate score; any
 * observation in the Yellow Zone calls for a Clinical Review, any in the Red Zone for a Rapid Response.
 * Numeric boundaries come from secondary NSW sources and must be verified against the local chart before use.
 */
export const EWS_NSW_BTF: EwsChartDefinition = {
  id: 'au-nsw-btf-sago',
  name: 'NSW Between the Flags, Standard Adult General Observation chart (SAGO)',
  totalLabel: 'Between the Flags',
  region: 'AU',
  population: 'Adults aged over 16 years in NSW public health facilities (not maternity, paediatrics or emergency department charts)',
  status: 'published',
  scoring: 'zones',
  localVerificationRequired: true,
  verification:
    'Zone actions, additional criteria and ACVPU are from the CEC SAGO chart (SMR110010). The chart draws the zone boundaries graphically, so the numbers come from NSW Health orientation material (SESLHD 2024 and 2025). Where those give a boundary in both zones (respiratory rate 30, SpO2 90%, systolic 90 and 200, heart rate 40 and 140) it is placed in the Red Zone. Temperature is in the Yellow Zone only. Oxygen uses the chart wording rather than flow rates. Verify every boundary against the SAGO chart in use and any local CERS changes before clinical use.',
  sources: [
    { title: 'CEC NSW Health Standard Adult General Observation chart (SMR110010)', url: 'https://cec.health.nsw.gov.au/__data/assets/pdf_file/0012/258699/NSW-Health-Standard-Adult-General-Observation-Chart.PDF' },
    { title: 'NSW Health PD2025_014 Recognition and management of patients who are deteriorating (April 2025)', url: 'https://www1.health.nsw.gov.au/pds/ActivePDSDocuments/PD2025_014.pdf' },
    { title: 'SESLHD Between the Flags registrar orientation (February 2025), secondary', url: 'https://www.seslhd.health.nsw.gov.au/sites/default/files/groups/Prince_of_Wales_Hospital/Medical%20education/Medical%20Officer%20Orientation%20Uploads/RegistrarOrientationBetweentheFlags2025.pdf' },
    { title: 'SESLHD Between the Flags orientation (February 2024), secondary', url: 'https://seslhd.health.nsw.gov.au/sites/default/files/POWMedEd/2024%20MEU%20secure/Between%20the%20Flags%20Orientation%20SZSA5Feb24.pdf' },
  ],
  zones: BTF_ZONES,
  parameters: [
    {
      id: 'respiratoryRate', label: 'Respiratory rate', shortLabel: 'RR', unit: 'breaths/min', unitDefinition: 'breaths per minute', type: 'numeric',
      bands: [
        { from: 30, score: null, zone: 'red', label: '≥ 30' },
        { from: 25, to: 30, score: null, zone: 'yellow', label: '25–29' },
        { from: 11, to: 25, score: null, zone: 'none', label: '11–24' },
        { from: 6, to: 11, score: null, zone: 'yellow', label: '6–10' },
        { to: 6, score: null, zone: 'red', label: '≤ 5' },
      ],
    },
    {
      id: 'oxygenSaturation', label: 'Oxygen saturation', shortLabel: 'SpO2', unit: '%', unitDefinition: 'per cent', type: 'numeric',
      bands: [
        { from: 96, score: null, zone: 'none', label: '≥ 96' },
        { from: 91, to: 96, score: null, zone: 'yellow', label: '91–95' },
        { to: 91, score: null, zone: 'red', label: '≤ 90' },
      ],
    },
    {
      id: 'supplementalOxygen', label: 'Oxygen requirement', shortLabel: 'O2', type: 'categorical',
      options: [
        { value: 'none', label: 'No increase' },
        { value: 'increasing', label: 'Increasing' },
        { value: 'increasingToKeepAbove90', label: 'Increasing to keep SpO2 > 90%' },
      ],
      bands: [
        { values: ['none'], score: null, zone: 'none', label: 'No increase' },
        { values: ['increasing'], score: null, zone: 'yellow', label: 'Increasing' },
        { values: ['increasingToKeepAbove90'], score: null, zone: 'red', label: 'Increasing to keep SpO2 > 90%' },
      ],
    },
    {
      id: 'systolicBloodPressure', label: 'Systolic blood pressure', shortLabel: 'SBP', unit: 'mmHg', unitDefinition: 'millimetres of mercury', type: 'numeric',
      bands: [
        { from: 200, score: null, zone: 'red', label: '≥ 200' },
        { from: 180, to: 200, score: null, zone: 'yellow', label: '180–199' },
        { from: 101, to: 180, score: null, zone: 'none', label: '101–179' },
        { from: 91, to: 101, score: null, zone: 'yellow', label: '91–100' },
        { to: 91, score: null, zone: 'red', label: '≤ 90' },
      ],
    },
    {
      id: 'heartRate', label: 'Heart rate', shortLabel: 'HR', unit: 'beats/min', unitDefinition: 'beats per minute', type: 'numeric',
      bands: [
        { from: 140, score: null, zone: 'red', label: '≥ 140' },
        { from: 120, to: 140, score: null, zone: 'yellow', label: '120–139' },
        { from: 51, to: 120, score: null, zone: 'none', label: '51–119' },
        { from: 41, to: 51, score: null, zone: 'yellow', label: '41–50' },
        { to: 41, score: null, zone: 'red', label: '≤ 40' },
      ],
    },
    {
      id: 'temperature', label: 'Temperature', shortLabel: 'Temp', unit: '°C', unitDefinition: 'degrees Celsius', type: 'numeric', precision: 1,
      bands: [
        { from: 38.5, score: null, zone: 'yellow', label: '≥ 38.5' },
        { from: 35.6, to: 38.5, score: null, zone: 'none', label: '35.6–38.4' },
        { to: 35.6, score: null, zone: 'yellow', label: '≤ 35.5' },
      ],
    },
    {
      id: 'consciousness', label: 'Level of consciousness (ACVPU)', shortLabel: 'LOC', type: 'categorical',
      options: [
        { value: 'A', label: 'Alert' }, { value: 'C', label: 'New confusion' }, { value: 'V', label: 'Voice' }, { value: 'P', label: 'Pain' }, { value: 'U', label: 'Unresponsive' },
      ],
      bands: [
        { values: ['A'], score: null, zone: 'none', label: 'Alert' },
        { values: ['C', 'V'], score: null, zone: 'yellow', label: 'New confusion or voice' },
        { values: ['P', 'U'], score: null, zone: 'red', label: 'Pain or unresponsive' },
      ],
    },
  ],
  responses: [
    { id: 'within', zone: 'none', label: 'Within the flags', response: 'Continue observations as set by the patient’s monitoring plan.', local: true, minTotal: 0, maxTotal: 0, rank: 0 },
    {
      id: 'yellow', zone: 'yellow', label: 'Yellow Zone: Clinical Review', shortLabel: 'Clinical review', descriptor: 'Early warning signs of deterioration',
      response: 'Initiate appropriate clinical care. Repeat and increase the frequency of observations as indicated by the patient’s condition. Consult promptly with the Nurse in Charge to decide whether to call a Clinical Review.',
      anyParameterZones: ['yellow'], rank: 1,
    },
    {
      id: 'red', zone: 'red', label: 'Red Zone: Rapid Response', shortLabel: 'Rapid response', descriptor: 'Late warning signs of deterioration',
      response: 'Call for a Rapid Response as per your local Clinical Emergency Response System (CERS). Initiate appropriate clinical care. Inform the Nurse in Charge that you have called for a Rapid Response. Repeat and increase the frequency of observations. Document an A to G assessment, the reason for escalation, treatment and outcome. Inform the Attending Medical Officer as soon as practicable.',
      anyParameterZones: ['red'], rank: 2,
    },
  ],
  mandatoryText: [
    'Concern from the patient, family or staff is a Yellow Zone criterion; serious concern is a Red Zone criterion. Escalate whatever the observations show.',
    'Alterations to calling criteria must be signed by a Medical Officer and confirmed by the Attending Medical Officer. Acute alterations last up to 12 hours.',
  ],
  additionalObservations: [
    { id: 'concern', label: 'Patient, family or staff concern' },
    { id: 'pain', label: 'New, increasing or uncontrolled pain' },
    { id: 'urineOutput', label: 'Urine output' },
    { id: 'bloodGlucose', label: 'Blood glucose' },
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Great Britain: National Early Warning Score 2 (NEWS2), Royal College of Physicians, December 2017.
// Source: https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/
// Bands and thresholds from the published NEWS2 scoring system and clinical response charts.
// Colours: the score-1/2/3 fills reuse the library's yellow, orange and red zone tokens [suggested].
// ---------------------------------------------------------------------------------------------------------------

const GB_ZONES: EwsZone[] = [
  { id: 'none', label: 'Score 0', rank: 0 },
  { id: 'yellow', label: 'Score 1', colourVar: '--ews-zone-yellow', rank: 1 },
  { id: 'orange', label: 'Score 2', colourVar: '--ews-zone-orange', rank: 2 },
  { id: 'red', label: 'Score 3', colourVar: '--ews-zone-red', rank: 3 },
];

/** Builds the NEWS2 chart with SpO2 scale 1 (default) or scale 2 (hypercapnic respiratory failure, on clinical decision). */
export function news2ChartDefinition(opts: { spo2Scale?: 1 | 2 } = {}): EwsChartDefinition {
  const scale2 = opts.spo2Scale === 2;
  return {
    id: scale2 ? 'gb-news2-scale2' : 'gb-news2',
    name: `National Early Warning Score 2 (NEWS2)${scale2 ? ', SpO2 scale 2' : ''}`,
    totalLabel: 'NEWS2',
    region: 'GB',
    population: 'Adults aged 16 and over (not for pregnancy or children)',
    status: 'published',
    verification: 'Bands and thresholds from the RCP NEWS2 charts (December 2017). Verify against the chart in use locally before clinical use.',
    sources: [{ title: 'Royal College of Physicians, National Early Warning Score (NEWS) 2 (2017)', url: 'https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/' }],
    zones: GB_ZONES,
    parameters: [
      {
        id: 'respiratoryRate', label: 'Respiration rate', shortLabel: 'RR', unit: 'breaths/min', unitDefinition: 'breaths per minute', type: 'numeric',
        bands: [
          { from: 25, score: 3, zone: 'red', label: '≥ 25' },
          { from: 21, to: 25, score: 2, zone: 'orange', label: '21–24' },
          { from: 12, to: 21, score: 0, zone: 'none', label: '12–20' },
          { from: 9, to: 12, score: 1, zone: 'yellow', label: '9–11' },
          { to: 9, score: 3, zone: 'red', label: '≤ 8' },
        ],
      },
      scale2
        ? {
            id: 'oxygenSaturation', label: 'SpO2 scale 2', shortLabel: 'SpO2', unit: '%', unitDefinition: 'per cent', type: 'numeric' as const,
            bands: [
              { from: 97, score: 3, zone: 'red', label: '≥ 97 on O2', when: { parameterId: 'supplementalOxygen', values: ['oxygen'] } },
              { from: 95, to: 97, score: 2, zone: 'orange', label: '95–96 on O2', when: { parameterId: 'supplementalOxygen', values: ['oxygen'] } },
              { from: 93, to: 95, score: 1, zone: 'yellow', label: '93–94 on O2', when: { parameterId: 'supplementalOxygen', values: ['oxygen'] } },
              { from: 93, score: 0, zone: 'none', label: '≥ 93 on air', when: { parameterId: 'supplementalOxygen', values: ['air'] } },
              { from: 88, to: 93, score: 0, zone: 'none', label: '88–92' },
              { from: 86, to: 88, score: 1, zone: 'yellow', label: '86–87' },
              { from: 84, to: 86, score: 2, zone: 'orange', label: '84–85' },
              { to: 84, score: 3, zone: 'red', label: '≤ 83' },
            ],
          }
        : {
            id: 'oxygenSaturation', label: 'SpO2 scale 1', shortLabel: 'SpO2', unit: '%', unitDefinition: 'per cent', type: 'numeric' as const,
            bands: [
              { from: 96, score: 0, zone: 'none', label: '≥ 96' },
              { from: 94, to: 96, score: 1, zone: 'yellow', label: '94–95' },
              { from: 92, to: 94, score: 2, zone: 'orange', label: '92–93' },
              { to: 92, score: 3, zone: 'red', label: '≤ 91' },
            ],
          },
      {
        id: 'supplementalOxygen', label: 'Air or oxygen?', shortLabel: 'O2', type: 'categorical',
        options: [{ value: 'air', label: 'Air' }, { value: 'oxygen', label: 'Oxygen' }],
        bands: [
          { values: ['oxygen'], score: 2, zone: 'orange', label: 'Oxygen' },
          { values: ['air'], score: 0, zone: 'none', label: 'Air' },
        ],
      },
      {
        id: 'systolicBloodPressure', label: 'Systolic blood pressure', shortLabel: 'BP', unit: 'mmHg', unitDefinition: 'millimetres of mercury', type: 'numeric',
        bands: [
          { from: 220, score: 3, zone: 'red', label: '≥ 220' },
          { from: 111, to: 220, score: 0, zone: 'none', label: '111–219' },
          { from: 101, to: 111, score: 1, zone: 'yellow', label: '101–110' },
          { from: 91, to: 101, score: 2, zone: 'orange', label: '91–100' },
          { to: 91, score: 3, zone: 'red', label: '≤ 90' },
        ],
      },
      {
        id: 'heartRate', label: 'Pulse', shortLabel: 'HR', unit: 'beats/min', unitDefinition: 'beats per minute', type: 'numeric',
        bands: [
          { from: 131, score: 3, zone: 'red', label: '≥ 131' },
          { from: 111, to: 131, score: 2, zone: 'orange', label: '111–130' },
          { from: 91, to: 111, score: 1, zone: 'yellow', label: '91–110' },
          { from: 51, to: 91, score: 0, zone: 'none', label: '51–90' },
          { from: 41, to: 51, score: 1, zone: 'yellow', label: '41–50' },
          { to: 41, score: 3, zone: 'red', label: '≤ 40' },
        ],
      },
      {
        id: 'consciousness', label: 'Consciousness', shortLabel: 'ACVPU', type: 'categorical',
        options: [
          { value: 'A', label: 'Alert' }, { value: 'C', label: 'New confusion' }, { value: 'V', label: 'Voice' }, { value: 'P', label: 'Pain' }, { value: 'U', label: 'Unresponsive' },
        ],
        bands: [
          { values: ['A'], score: 0, zone: 'none', label: 'Alert' },
          { values: ['C', 'V', 'P', 'U'], score: 3, zone: 'red', label: 'New confusion, V, P or U' },
        ],
      },
      {
        id: 'temperature', label: 'Temperature', shortLabel: 'Temp', unit: '°C', unitDefinition: 'degrees Celsius', type: 'numeric', precision: 1,
        bands: [
          { from: 39.1, score: 2, zone: 'orange', label: '≥ 39.1' },
          { from: 38.1, to: 39.1, score: 1, zone: 'yellow', label: '38.1–39.0' },
          { from: 36.1, to: 38.1, score: 0, zone: 'none', label: '36.1–38.0' },
          { from: 35.1, to: 36.1, score: 1, zone: 'yellow', label: '35.1–36.0' },
          { to: 35.1, score: 3, zone: 'red', label: '≤ 35.0' },
        ],
      },
    ],
    responses: [
      { id: 'zero', zone: 'none', label: 'Score 0', response: 'Continue routine NEWS monitoring.', frequency: 'Minimum 12-hourly', minTotal: 0, maxTotal: 0, rank: 0 },
      {
        id: 'low', zone: 'yellow', label: 'Low (score 1–4)', shortLabel: 'Low', response: 'Inform the registered nurse, who must assess the patient and decide whether more frequent monitoring or escalation of care is needed.',
        frequency: 'Minimum 4–6-hourly', minTotal: 1, maxTotal: 4, rank: 1,
      },
      {
        id: 'lowMedium', zone: 'orange', label: 'Low–medium (score 3 in a single parameter)', shortLabel: 'Low–medium', response: 'Registered nurse to inform the medical team caring for the patient, who will review and decide whether escalation of care is necessary.',
        frequency: 'Minimum 1-hourly', anySingleScoreAtLeast: 3, rank: 2,
      },
      {
        id: 'medium', zone: 'orange', label: 'Medium (score 5–6)', shortLabel: 'Medium', descriptor: 'Key threshold for urgent response',
        response: 'Registered nurse to immediately inform the medical team caring for the patient and request urgent assessment by a clinician or team with competence in the care of acutely ill patients. Provide care in an environment with monitoring facilities.',
        frequency: 'Minimum 1-hourly', minTotal: 5, maxTotal: 6, rank: 3,
      },
      {
        id: 'high', zone: 'red', label: 'High (score 7 or more)', shortLabel: 'High', descriptor: 'Urgent or emergency response',
        response: 'Registered nurse to immediately inform the medical team (at least specialist registrar level). Emergency assessment by a team with critical care competencies, including airway skills. Consider transfer to a level 2 or 3 care facility.',
        frequency: 'Continuous monitoring of vital signs', minTotal: 7, rank: 4,
      },
    ],
  };
}

/** NEWS2 with SpO2 scale 1. */
export const EWS_NEWS2: EwsChartDefinition = news2ChartDefinition();

/** Default chart per region: GB NEWS2, AU ADDS (placeholder scores), NZ NZEWS. */
export const EWS_DEFAULT_CHARTS: Record<ClinicalRegion, EwsChartDefinition> = {
  GB: EWS_NEWS2,
  AU: EWS_ADDS_PLACEHOLDER,
  NZ: EWS_NZEWS,
};

/** Default chart for a region (pure; pass the region explicitly). */
export function ewsDefaultChart(region: ClinicalRegion = 'GB'): EwsChartDefinition {
  return EWS_DEFAULT_CHARTS[region];
}
