/**
 * Patient record overview: what a doctor sees on opening an inpatient's record.
 *
 * Composition
 * - PatientBanner across the top, the only banner on the screen (PAB-0015), so everything below it
 *   belongs to one patient.
 * - Left column, the medicines picture: MedicationsList (current list by default) and the
 *   AdrSummaryList, kept next to each other so an allergy and a conflicting prescription can be read
 *   together.
 * - Right column, the deterioration picture: the early warning summary for the latest set (the
 *   region's chart: NEWS2, ADDS, NZEWS), the key observation graphs on one time axis, and the
 *   decision support alerts.
 *
 * Region differences all come from the components reading ClinicalLocaleProvider (set by
 * ExampleShell): identifiers (NHS No. / IHI, URN and Medicare / NHI), allergy wording ("Nil known" in
 * AU, "No known allergies or adverse reactions" in NZ), mixed-case lettering in AU and NZ, and the
 * early warning chart. The example never branches on region for display rules; it only picks the
 * region's data.
 */
import React, { useMemo, useState } from 'react';
import {
  AdrSummaryList,
  AlertContainer,
  EarlyWarningScoreSummary,
  GraphStack,
  MedicationsList,
  PatientBanner,
  SeriesStyleAllocator,
  formatShortDate,
} from '@clinical-cui/react';
import type { ClinicalRegion, DecisionSupportAlertResponse, GraphStackGraph } from '@clinical-cui/react';
import { ExampleShell } from './shell/ExampleShell';
import type { ExampleMeta } from './shell/ExampleShell';
import { EXAMPLE_NOW, MAIN_PATIENT } from './data/patients';
import {
  ADR_ENTRIES,
  ADR_STATUS,
  BLOOD_PRESSURE,
  CRITICAL_THRESHOLDS,
  CURRENT_USER,
  MEDICATIONS,
  OBS_WINDOW,
  SERIES,
  alerts as regionAlerts,
  at,
  bannerProps,
  latestObservation,
} from './data/desktop-patient-record';

export const meta: ExampleMeta = {
  title: 'Patient record overview',
  description:
    'The record a clinician opens first: patient banner, current medications beside the allergy and adverse reaction summary, and the early warning score, key observations and decision support alerts.',
  kind: 'desktop',
  regions: ['GB', 'AU', 'NZ'],
  components: ['PatientBanner', 'MedicationsList', 'AdrSummaryList', 'EarlyWarningScoreSummary', 'GraphStack', 'AlertContainer'],
};

/* Layout glue only: tokens for colour and spacing, no component restyling. */
const panel: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-4)',
  minWidth: 0,
};
const h2: React.CSSProperties = { margin: '0 0 var(--space-3)', fontSize: 18, lineHeight: '24px', fontWeight: 600 };

/** Encounter context shown under the banner. It is not identity data, so it stays out of the banner. */
const ENCOUNTER: Record<ClinicalRegion, { consultant: string; specialty: string }> = {
  GB: { consultant: 'Dr M Hughes', specialty: 'Acute medicine' },
  AU: { consultant: 'Dr S Kapoor', specialty: 'General medicine' },
  NZ: { consultant: 'Dr W Rangi', specialty: 'General medicine' },
};

function PatientRecord({ region }: { region: ClinicalRegion }) {
  // Dismissed or answered alerts leave the container; the rest stay until acted on.
  const [closedAlerts, setClosedAlerts] = useState<string[]>([]);
  const [lastResponse, setLastResponse] = useState<string>('');
  // One focus time shared by every graph in the stack (GTAB-057). It opens on the 06:00 set, the
  // reading that breached the critical temperature limit, so every graph shows its value at that time.
  const [focusTime, setFocusTime] = useState<Date | null>(at(0, 6));
  // One style allocator per consultation so a series keeps its colour and symbol (GTAB-003..005).
  const styles = useMemo(() => new SeriesStyleAllocator(), []);

  const activeAlerts = regionAlerts(region).filter(a => !closedAlerts.includes(a.id));
  const encounter = ENCOUNTER[region];

  // Key observations. Every graph uses a predefined y range, never one fitted to the data (GTAB-069..072).
  // The temperature graph carries the team's critical limit, drawn as a labelled line (GTAB-177, GTAB-182).
  const graphs: GraphStackGraph[] = [
    { id: 'temp', series: [SERIES.temperature], yRange: { min: 35, max: 41 }, criticalThresholds: CRITICAL_THRESHOLDS },
    { id: 'bp', bloodPressure: { ...BLOOD_PRESSURE, systolicRange: { low: 100, high: 140, population: 'adult' } }, yRange: { min: 40, max: 180 }, criticalThresholds: CRITICAL_THRESHOLDS },
    { id: 'pulse', series: [SERIES.heartRate], yRange: { min: 40, max: 160 }, normalRange: { low: 60, high: 100, population: 'adult' } },
    { id: 'rr', series: [SERIES.respiratoryRate], yRange: { min: 0, max: 40 }, normalRange: { low: 12, high: 20, population: 'adult' } },
  ];

  const onResponse = (id: string, r: DecisionSupportAlertResponse) => {
    // A real system takes the user to where the response is recorded (2.2). Here we record and close it.
    setClosedAlerts(c => [...c, id]);
    setLastResponse(r.overrideReason ? `Override recorded: ${r.overrideReason}` : 'Response recorded.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PatientBanner {...bannerProps(region)} />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 'var(--space-2) var(--space-6)', fontSize: 14, color: 'var(--ink-muted)' }}>
        <h2 style={{ ...h2, margin: 0, color: 'var(--ink)' }}>Record overview</h2>
        <span>{MAIN_PATIENT[region].location}</span>
        <span>Admitted {formatShortDate(at(-1, 17, 30))}</span>
        <span>{encounter.specialty}, {encounter.consultant}</span>
        <span>Community-acquired pneumonia</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: 'var(--space-4)', alignItems: 'start' }}>
        {/* Left: medicines. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0 }}>
          <section style={panel} aria-labelledby="meds-h">
            <h2 id="meds-h" style={h2}>Medications</h2>
            {/* Current list by default, sorted by start date with no grouping (MEDv-062, MEDv-083, MEDv-099).
                Rows flagged hasAlert show a warning icon after the drug details, named by the row's alertLabel
                (MEDv-023), and carry it into the look-ahead strips (MEDv-053). `now` is fixed
                so the "completed in the last 48 hours" note is stable. */}
            <MedicationsList medications={MEDICATIONS[region]} now={EXAMPLE_NOW} maxHeight={560} />
          </section>

          {/* AU shows "Nil known" from a signed status record; GB and NZ list the entries. An empty list
                is never shown as "no known" (RAD 5 principle, AU-AL-01, G11 9.2). */}
            <AdrSummaryList
              entries={ADR_ENTRIES[region]}
              statusRecord={ADR_STATUS[region]}
              currentUser={CURRENT_USER[region]}
              now={EXAMPLE_NOW}
              headingLevel={2}
              onAdd={() => undefined}
              onOpenDetails={() => undefined}
            />
        </div>

        {/* Right: what needs acting on now. The score summary and the alerts sit at the top of the
            page, beside the medicines they refer to, rather than below the graphs. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0 }}>
          {/* The region's default chart: NEWS2 (GB), ADDS with placeholder scores (AU), NZEWS (NZ).
              Shows the total, the zone in words and the required response next to the trigger.
              The summary draws its own frame, so it is not wrapped in a panel. */}
          <EarlyWarningScoreSummary observation={latestObservation(region)} headingLevel={2} />

          {/* High Priority above Priority, newest first; High Priority opens expanded (2.4). */}
          <AlertContainer
            alerts={activeAlerts}
            height={430}
            resizable={false}
            onRecordResponse={onResponse}
            onDismiss={id => setClosedAlerts(c => [...c, id])}
          />
          {/* Live region kept mounted so the confirmation is announced when it appears. */}
          <div role="status" style={{ fontSize: 14, color: 'var(--ink-muted)', marginTop: lastResponse ? 0 : -16 }}>{lastResponse}</div>
        </div>
      </div>

      {/* Full width so the time axis has room: one shared axis and one focus line across every graph
          (GTAB-057, GTAB-147). */}
      <section style={panel}>
        <GraphStack
          title="Key observations"
          graphs={graphs}
          start={OBS_WINDOW.start}
          end={OBS_WINDOW.end}
          rangeLabel="Last 24 hours"
          now={EXAMPLE_NOW}
          focusTime={focusTime}
          onFocusTimeChange={setFocusTime}
          styleAllocator={styles}
          graphHeight={120}
          allowReorder={false}
        />
      </section>
    </div>
  );
}

export default function DesktopPatientRecord() {
  return <ExampleShell meta={meta}>{region => <PatientRecord region={region} />}</ExampleShell>;
}
