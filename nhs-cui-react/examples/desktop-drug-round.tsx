/**
 * Drug round: a nurse records administrations on the drug administration chart.
 *
 * Composition
 * - PatientBanner first: every dose recorded below belongs to this patient.
 * - A slim toolbar with the decision support status. Dose Calculations is not running, so the
 *   indicator is in its degraded state (attention colour plus warning symbol) and the nurse knows
 *   dose checks are not being made for this round.
 * - DrugAdministrationChart with regular, when-required and infusion lines. The patient is nil by
 *   mouth, so the chart shows its NilByMouthBanner below the day headings (MEDa-0163). It informs and
 *   never blocks recording (MEDa-0164).
 * - Recording happens in the chart's own form (AdministrationRecordingForm, opened from a Due, Overdue
 *   or Next event, or "Record" on a when-required line). `onRecord` writes the payload back into state,
 *   so the cell changes to the recorded status at once. The chart never edits its own data.
 * - The infusion is recorded in InfusionDetailView, not in the chart (MEDa-0160). It opens from the
 *   infusion line's status box and is open on arrival here so the record can be read.
 *
 * Region: AU shows NIMC codes (W, R, F...) with "When required" and a code legend; NZ shows HQSC codes
 * (W, D, RV...); GB records statuses only. The recording form offers the same national lists.
 */
import React, { useState } from 'react';
import {
  DecisionSupportStatusIndicator,
  DrugAdministrationChart,
  InfusionDetailView,
  PatientBanner,
} from '@clinical-cui/react';
import type {
  AdminEvent,
  AdminInfusionEntry,
  AdminMedication,
  AdministrationRecordingPayload,
  ClinicalRegion,
  DecisionSupportService,
} from '@clinical-cui/react';
import { ExampleShell } from './shell/ExampleShell';
import type { ExampleMeta } from './shell/ExampleShell';
import { EXAMPLE_NOW, MAIN_PATIENT } from './data/patients';
import { CURRENT_NURSE, at, bannerProps } from './data/desktop-patient-record';
import { roundMedications } from './data/desktop-drug-round';

export const meta: ExampleMeta = {
  title: 'Drug round',
  description:
    'The drug administration chart during an afternoon round: regular, when-required and infusion lines, the patient nil by mouth, regional not-given codes, decision support status, and the infusion record opened from its line. Recording a dose updates the chart.',
  kind: 'desktop',
  regions: ['GB', 'AU', 'NZ'],
  components: ['PatientBanner', 'DecisionSupportStatusIndicator', 'NilByMouthBanner', 'DrugAdministrationChart', 'AdministrationRecordingForm', 'InfusionDetailView'],
};

/** Services from the standard catalogue (2.1.2). One is down, so the indicator is degraded. */
const SERVICES: DecisionSupportService[] = [
  { id: 'allergy', name: 'Allergy Checking', state: 'running' },
  { id: 'dose', name: 'Dose Calculations', state: 'notRunning', since: at(0, 13, 20) },
  { id: 'interaction', name: 'Drug Interaction Checking', state: 'running' },
  { id: 'duplicate', name: 'Duplicate Therapy Checking', state: 'running' },
  { id: 'disease', name: 'Drug to Disease Contraindications Checking', state: 'unavailable' },
];

/** Administration sites, a limited list (MEDa-0212). */
const SITES = ['Abdomen, left', 'Abdomen, right', 'Thigh, left', 'Thigh, right', 'Upper arm, left', 'Upper arm, right'];

/** Merge a recorded payload into an event, keeping everything the chart needs to show it. */
function applyPayload(event: AdminEvent, p: AdministrationRecordingPayload): AdminEvent {
  return {
    ...event,
    status: p.status,
    administeredAt: p.administeredAt,
    timePrecision: p.timePrecision,
    dose: p.dose,
    recordedBy: p.recordedBy,
    notes: p.notes,
    reasonCode: p.reasonCode,
    reasonText: p.reasonText,
    // Changing an existing record always shows the edited marker (MEDa-0096).
    edited: event.status ? true : undefined,
  };
}

function DrugRound({ region }: { region: ClinicalRegion }) {
  const [medications, setMedications] = useState<AdminMedication[]>(() => roundMedications(region));
  // The infusion record is open on arrival so readers can see it; Close returns to the chart only.
  const [infusionId, setInfusionId] = useState<string | null>('nacl');
  const [announcement, setAnnouncement] = useState('');
  const nurse = CURRENT_NURSE[region];

  const onRecord = (med: AdminMedication, event: AdminEvent | null, p: AdministrationRecordingPayload) => {
    setMedications(list =>
      list.map(m => {
        if (m.id !== med.id) return m;
        // `event` is null for a new when-required dose (MEDa-0271): add it as an unscheduled event.
        if (!event) return { ...m, events: [...m.events, applyPayload({ id: `${m.id}-${m.events.length + 1}` }, p)] };
        return { ...m, events: m.events.map(e => (e.id === event.id ? applyPayload(e, p) : e)) };
      }),
    );
    setAnnouncement(`${med.name}: ${p.outcome === 'given' ? 'given' : 'not given'} recorded by ${p.recordedBy}.`);
  };

  const onInfusionRecord = (entry: Omit<AdminInfusionEntry, 'id'>) => {
    setMedications(list =>
      list.map(m => (m.id === infusionId && m.infusion
        ? { ...m, infusion: { ...m.infusion, log: [...(m.infusion.log ?? []), { ...entry, id: `log-${(m.infusion.log ?? []).length + 1}` }] } }
        : m)),
    );
  };

  const resolveIssue = (entryId: string) => {
    setMedications(list =>
      list.map(m => (m.id === infusionId && m.infusion
        ? { ...m, infusion: { ...m.infusion, log: (m.infusion.log ?? []).map(e => (e.id === entryId ? { ...e, resolved: true } : e)) } }
        : m)),
    );
  };

  const infusionMed = medications.find(m => m.id === infusionId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PatientBanner {...bannerProps(region)} />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, lineHeight: '24px', fontWeight: 600 }}>Drug administration</h2>
          <div style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{MAIN_PATIENT[region].location} · Afternoon round · {nurse}</div>
        </div>
        {/* Top right of the clinical area, next to where decisions are made (2.1.1). Degraded state is derived from the services. */}
        <DecisionSupportStatusIndicator services={SERVICES} changedSinceViewed />
      </div>

      {/* Polite confirmation of each recording, for screen reader users and as a visual receipt. */}
      <div role="status" style={{ fontSize: 14, color: 'var(--ink-muted)', minHeight: 20, marginTop: -8 }}>{announcement}</div>

      <DrugAdministrationChart
        medications={medications}
        now={EXAMPLE_NOW}
        // Shown by the chart as a NilByMouthBanner under the day headings; oral lines get a reminder in the form.
        nilByMouth={{ since: at(0, 10), until: at(0, 16), reason: 'For bronchoscopy at 16:00' }}
        currentUser={nurse}
        sites={SITES}
        onRecord={onRecord}
        onOpenSignificantDurationDetail={m => setInfusionId(m.id)}
        // Tall enough that every line, and so every recorded code, is in view without scrolling.
        maxListHeight={1600}
      />

      {infusionMed ? (
        <section aria-label="Infusion record" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
          {/* Significant duration doses are recorded here (MEDa-0160): bag changes, rates, checks, issues. */}
          <InfusionDetailView
            medication={infusionMed}
            now={EXAMPLE_NOW}
            currentUser={nurse}
            categories={['Cannula site', 'Pump alarm', 'Fluid balance', 'Other']}
            onRecord={onInfusionRecord}
            onResolveIssue={resolveIssue}
            onIssueAction={() => setAnnouncement('Cannula resite requested.')}
            onClose={() => setInfusionId(null)}
          />
        </section>
      ) : null}
    </div>
  );
}

export default function DesktopDrugRound() {
  return <ExampleShell meta={meta}>{region => <DrugRound region={region} />}</ExampleShell>;
}
