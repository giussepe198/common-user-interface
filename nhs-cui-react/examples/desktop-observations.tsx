/**
 * Observation review: a doctor reviewing a deteriorating patient's vital signs over the last day.
 *
 * Composition, top to bottom
 * - PatientBanner: the only banner on the page.
 * - VitalSignsChart with the region's early warning chart (GB NEWS2, AU ADDS with placeholder scores,
 *   NZ NZEWS) and its score summary for the latest set. Patient-specific critical limits are boxed in
 *   the chart without changing the score or zone (GTAB-177).
 * - Beside the chart, two focused graphs; below, the table of the same readings:
 *   - Temperature on its usual scale, which hides the 39.3 °C peak above the top of the plot. The graph
 *     then shows its GraphThumbnail, which always shows every value in the period, so nothing is lost
 *     off the scale (GTAB-078..083). The team's critical limit is a labelled line.
 *   - Pulse rate with the early warning zones shaded under the data, named in the legend (GTAB-083).
 *   - ObservationTable: the same readings as numbers, newest first, each annotated with its early
 *     warning score and zone in words, and critical values tagged with an arrow and "Critical".
 * - TimelineView (without its own banner, since the page banner is above it): admission events, medicines with their administrations, and the temperature graph on
 *   one time axis, so the fever can be read against the antibiotic and paracetamol doses.
 */
import React from 'react';
import {
  EWS_DEFAULT_CHARTS,
  ObservationGraph,
  ObservationTable,
  PatientBanner,
  SeriesStyleAllocator,
  TimelineView,
  VitalSignsChart,
  ewsGraphZones,
  ewsObservationAnnotator,
  formatQuantity,
  medicationDrugName,
} from '@clinical-cui/react';
import type { ClinicalRegion, ObservationCriticalThreshold, TimelineRow, TimelineSection } from '@clinical-cui/react';
import { ExampleShell } from './shell/ExampleShell';
import type { ExampleMeta } from './shell/ExampleShell';
import { EXAMPLE_NOW, MAIN_PATIENT } from './data/patients';
import { BLOOD_PRESSURE, CRITICAL_THRESHOLDS, OBS_WINDOW, SERIES, at, bannerProps, observationSets } from './data/desktop-patient-record';
import { roundMedications } from './data/desktop-drug-round';

export const meta: ExampleMeta = {
  title: 'Observation review',
  description:
    'Vital signs over the last 24 hours on the regional early warning chart, focused graphs with thumbnails and critical limits, the readings as a table, and a timeline of the admission and medicines alongside.',
  kind: 'desktop',
  regions: ['GB', 'AU', 'NZ'],
  components: ['PatientBanner', 'VitalSignsChart', 'ObservationGraph', 'GraphThumbnail', 'ObservationTable', 'TimelineView'],
};

const panel: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', minWidth: 0,
};
const h2: React.CSSProperties = { margin: '0 0 var(--space-3)', fontSize: 18, lineHeight: '24px', fontWeight: 600 };

/** The chart uses parameter ids; graphs and tables use series ids ('systolic' for blood pressure). */
const CHART_THRESHOLDS: ObservationCriticalThreshold[] = CRITICAL_THRESHOLDS.map(t =>
  t.appliesTo === 'systolic' ? { ...t, appliesTo: 'systolicBloodPressure' } : t);

/** Timeline rows for the medicines, built from the same chart lines the drug round uses. */
function medicationRows(region: ClinicalRegion): TimelineRow[] {
  return roundMedications(region).map(m => {
    const l = m.line ?? { genericName: m.name };
    // The first label field is the name and is never cut (TLN-0550); mixed-case lettering follows the region.
    const name = medicationDrugName(l, { region });
    const dose = l.dose ? formatQuantity(l.dose, region) : l.doseEquivalent ? formatQuantity(l.doseEquivalent.quantity, region) : undefined;
    const fields = [name, dose, l.route, l.frequency].filter((f): f is string => Boolean(f));
    const administrations = m.events
      .filter(e => e.status || e.scheduledTime)
      .map(e => ({
        id: e.id,
        time: (e.administeredAt ?? e.scheduledTime)!,
        label: e.status ? `${name} ${e.status === 'given' ? 'given' : 'not given'}${e.reasonCode ? ` (${e.reasonCode})` : ''}` : `${name} planned`,
        status: e.status,
        planned: !e.status,
      }));
    // Infusions have a known duration; regular prescriptions are open-ended from the first dose (TLN-0380, 0430).
    const entry = m.infusion
      ? { id: `${m.id}-e`, kind: 'known' as const, start: m.infusion.actualStart ?? m.infusion.scheduledStart, end: at(0, 18, 5), labelFields: fields }
      : { id: `${m.id}-e`, kind: 'open' as const, start: m.startDate, labelFields: fields, events: { administrations } };
    return { id: m.id, label: name, entries: [entry] };
  });
}

function Observations({ region }: { region: ClinicalRegion }) {
  const styles = React.useMemo(() => new SeriesStyleAllocator(), []);
  const chart = EWS_DEFAULT_CHARTS[region];
  const p = MAIN_PATIENT[region];

  const sections: TimelineSection[] = [
    {
      id: 'events', title: 'Admission', defaultLevelOfDetail: 'full', height: 120,
      rows: [
        { id: 'adm', label: 'Inpatient stay', entries: [{ id: 'adm-e', kind: 'open', start: at(-1, 17, 30), labelFields: [`Admitted, ${p.location}`, 'community-acquired pneumonia'] }] },
        { id: 'tests', label: 'Investigations', entries: [
          { id: 'cxr', kind: 'point', start: at(-1, 18, 40), labelFields: ['Chest X-ray', 'right lower lobe consolidation'] },
          { id: 'bloods', kind: 'point', start: at(0, 9), labelFields: ['Blood tests', 'CRP 186 mg/L'] },
          { id: 'bronch', kind: 'point', start: at(0, 16), labelFields: ['Bronchoscopy', 'planned'] },
        ] },
      ],
    },
    {
      id: 'meds', title: 'Medications', defaultLevelOfDetail: 'full', height: 480,
      eventSets: [{ id: 'administrations', label: 'Administrations', kind: 'administrations', levels: ['full'], defaultShown: true }],
      rows: medicationRows(region),
    },
    {
      id: 'obs', title: 'Observations', height: 140,
      graphs: [{ id: 'temp', label: 'Temperature (°C)', graph: { series: [SERIES.temperature], yRange: { min: 35, max: 41 }, criticalThresholds: CRITICAL_THRESHOLDS, styleAllocator: styles, height: 100 } }],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PatientBanner {...bannerProps(region)} />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 'var(--space-2) var(--space-6)', fontSize: 14, color: 'var(--ink-muted)' }}>
        <h2 style={{ ...h2, margin: 0, color: 'var(--ink)' }}>Observations</h2>
        <span>{p.location}</span>
        <span>Last 24 hours, 6 sets</span>
        <span>Monitoring: every hour</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 870px) minmax(0, 1fr)', gap: 'var(--space-4)', alignItems: 'start' }}>
        <section style={panel}>
          {/* The whole early warning chart, as on paper: bands as coloured rows with the zone named in words. */}
          <VitalSignsChart
            observations={observationSets(region)}
            criticalThresholds={CHART_THRESHOLDS}
            caption="Vital signs, last 24 hours"
          />
        </section>

        <section style={panel} aria-labelledby="graphs-h">
          <h2 id="graphs-h" style={h2}>Trends</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Usual temperature scale (never fitted to the data, GTAB-072). The 39.3 °C peak is above it, so the
                thumbnail appears and shows the whole period with the plotted part outlined. */}
            <ObservationGraph
              series={[SERIES.temperature]}
              start={OBS_WINDOW.start} end={OBS_WINDOW.end} rangeLabel="Last 24 hours" now={EXAMPLE_NOW}
              yRange={{ min: 35, max: 39 }}
              criticalThresholds={CRITICAL_THRESHOLDS}
              thumbnail="auto"
              styleAllocator={styles}
              height={180}
            />
            {/* Early warning zones for this parameter from the region's chart, shaded under the data. */}
            <ObservationGraph
              series={[SERIES.heartRate]}
              start={OBS_WINDOW.start} end={OBS_WINDOW.end} rangeLabel="Last 24 hours" now={EXAMPLE_NOW}
              yRange={{ min: 40, max: 160 }}
              zones={ewsGraphZones(chart, 'heartRate')}
              thumbnail="always"
              styleAllocator={styles}
              height={180}
            />
            {/* Blood pressure keeps its T-bar symbology; the critical limit applies to systolic only. */}
            <ObservationGraph
              bloodPressure={{ ...BLOOD_PRESSURE, systolicRange: { low: 100, high: 140, population: 'adult' } }}
              start={OBS_WINDOW.start} end={OBS_WINDOW.end} rangeLabel="Last 24 hours" now={EXAMPLE_NOW}
              yRange={{ min: 40, max: 180 }}
              criticalThresholds={CRITICAL_THRESHOLDS}
              thumbnail="never"
              styleAllocator={styles}
              height={180}
            />
          </div>
        </section>
      </div>

      <section style={panel}>
        {/* Same readings, as numbers, full width so every column fits. Each value carries its score and zone
            in words, not colour alone. */}
        <ObservationTable
          caption="Readings, newest first"
          series={[SERIES.temperature, SERIES.heartRate, SERIES.respiratoryRate, SERIES.oxygenSaturation]}
          bloodPressure={BLOOD_PRESSURE}
          annotate={ewsObservationAnnotator(chart)}
          criticalThresholds={CRITICAL_THRESHOLDS}
          maxHeight={400}
        />
      </section>

      <section style={panel} aria-labelledby="timeline-h">
        <h2 id="timeline-h" style={h2}>Timeline</h2>
        {/* The timeline must be shown with the patient banner (TLN 3.2.1). This page already shows PatientBanner at the
            top and must not show two, so patientBanner is left out and TimelineView renders no banner of its own. */}
        <TimelineView
          sections={sections}
          now={EXAMPLE_NOW}
          defaultPeriod="24h"
          dataExtent={{ start: at(-1, 17), end: at(1, 0) }}
        />
      </section>
    </div>
  );
}

export default function DesktopObservations() {
  return <ExampleShell meta={meta}>{region => <Observations region={region} />}</ExampleShell>;
}
