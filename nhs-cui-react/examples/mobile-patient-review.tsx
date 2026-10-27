/**
 * Mobile: patient-first review (concepts A1, A2, A3 and P3).
 *
 * One patient's record on a phone, as four screens of the same app side by side: the summary, the medicines list, the
 * one-day drug chart and the patient details sheet. All four read one record, so they always agree (the chart events
 * drive what is due). A patient switch, from the ward list or from a wristband scan that finds someone else, goes
 * through PatientSwitchGuard and changes every screen at once.
 */
import React from 'react';
import {
  MobileDrugAgenda,
  MobileMedicationsList,
  MobilePatientHeader,
  MobileSummary,
  MobileTabBar,
  MOBILE_RECORD_TABS,
  PatientSwitchGuard,
  SheetContainerProvider,
  TouchButton,
  mobilePatientName,
  formatTime,
} from '@clinical-cui/react';
import type { AdminEvent, AdminMedication, ClinicalRegion, MobilePatientIdentity } from '@clinical-cui/react';
import { ExampleShell, PhoneFrame, type ExampleMeta } from './shell/ExampleShell';
import {
  ALERTS,
  CHART,
  DUE,
  EXAMPLE_NOW,
  MAIN_PATIENT,
  MEDICATION_ALERTS,
  MEDICINES,
  SWITCH_TARGET_CHART,
  SWITCH_TARGET_MEDICINES,
  latestObservations,
  mobileIdentity,
  switchTarget,
  today,
} from './data/mobile-patient-review';

export const meta: ExampleMeta = {
  title: 'Patient review on a phone',
  description:
    'The patient-first record (direction A): summary with the early warning score, medicines list, one-day drug chart and the full patient details sheet. A patient switch, from the ward list or a wristband scan, goes through PatientSwitchGuard and changes every screen.',
  kind: 'mobile',
  regions: ['AU', 'NZ', 'GB'],
  components: [
    'MobileSummary',
    'MobileMedicationsList',
    'MobileDrugAgenda',
    'MobilePatientHeader',
    'MobileTabBar',
    'PatientDetailsSheet',
    'PatientSwitchGuard',
    'TouchButton',
  ],
};

const NOW = EXAMPLE_NOW;

/**
 * The phone screen inside a PhoneFrame. SheetContainerProvider sends every sheet below it (the details sheet, the
 * switch confirmation) into this phone's own layer, so a sheet covers this phone only and does not lock the scroll of
 * the docs page; autoFocus={false} keeps sheets that are open on load from drawing a focus ring. PhoneFrame has a
 * transform, so it is the containing block for the sheets' `position: fixed`. The screen is exactly one phone high:
 * PatientSwitchGuard with `fill` takes that height and scrolls the patient screen inside it, so sticky headers and
 * bottom tab bars stay on the phone's edges.
 */
function Screen({ children }: { children: React.ReactNode }) {
  // State setters are stable, so they work as callback refs. Content waits for the layer, so a sheet that is open on
  // load opens in the phone, never in the page.
  const [layer, setLayer] = React.useState<HTMLDivElement | null>(null);
  return (
    <SheetContainerProvider container={layer} autoFocus={false}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-sunken)' }}>
        {layer ? children : null}
      </div>
      <div ref={setLayer} />
    </SheetContainerProvider>
  );
}

/** A screen at least one phone high that grows with its content (inside a `fill` guard, which scrolls it). */
const tallScreen: React.CSSProperties = { display: 'flex', flexDirection: 'column', flex: '1 0 auto' };

/** A polite status line for link-outs this example does not build (they open screens shown in the other examples). */
function Note({ text }: { text: string }) {
  return (
    <p
      role="status"
      style={{
        margin: 0,
        padding: '8px 16px',
        fontSize: 14,
        lineHeight: '20px',
        color: 'var(--ink-muted)',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {text}
    </p>
  );
}

/** The record for whichever patient is on screen. */
interface PatientRecord {
  patient: MobilePatientIdentity;
  chart: AdminMedication[];
  medicines: typeof MEDICINES;
  due: typeof DUE;
  hasObs: boolean;
}

function recordFor(which: 'main' | 'other', region: ClinicalRegion): PatientRecord {
  if (which === 'main') {
    return { patient: mobileIdentity(MAIN_PATIENT[region], region), chart: CHART, medicines: MEDICINES, due: DUE, hasObs: true };
  }
  const ins = SWITCH_TARGET_CHART[0];
  return {
    patient: switchTarget(region),
    chart: SWITCH_TARGET_CHART,
    medicines: SWITCH_TARGET_MEDICINES,
    due: [{ id: 'ins', line: ins.line!, state: 'next', at: today(18) }],
    hasObs: false,
  };
}

function PatientReview({ region }: { region: ClinicalRegion }) {
  // Shared state: which patient is open, and a switch waiting for confirmation (wristband scan mismatch).
  const [which, setWhich] = React.useState<'main' | 'other'>('main');
  const [pending, setPending] = React.useState<'main' | 'other' | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(true);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const note = (frame: string, text: string) => setNotes(n => ({ ...n, [frame]: text }));

  const rec = recordFor(which, region);
  const otherKey = which === 'main' ? 'other' : 'main';
  const other = recordFor(otherKey, region).patient;
  const otherName = mobilePatientName(other, region, { showTitle: false });
  const patient = rec.patient;

  // Every patient screen sits inside PatientSwitchGuard (Phase 4: switching patient must be unmistakable). When the
  // patient changes, each guard flashes the new identity. Only frame 1 raises a scan mismatch, so only its guard
  // carries the pending switch; its confirmation sheet goes to frame 1's layer through SheetContainerProvider.
  // `fill` makes the guard one phone high, with the flash at the top and the screen scrolling below it.
  const guard = (children: React.ReactNode, withPending = false) => (
    <PatientSwitchGuard
      fill
      patient={patient}
      now={NOW}
      pendingPatient={withPending && pending ? recordFor(pending, region).patient : null}
      pendingReason="scanMismatch"
      onConfirmSwitch={() => {
        if (pending) setWhich(pending);
        setPending(null);
      }}
      onCancelSwitch={() => setPending(null)}
    >
      {children}
    </PatientSwitchGuard>
  );

  const condensedHeader = <MobilePatientHeader patient={patient} variant="condensed" now={NOW} sticky showDetailsButton={false} />;

  return (
    <>
      <PhoneFrame caption="1. Summary">
        <Screen>
          {guard(
            <div style={tallScreen}>
              {/* MobileSummary composes the full header (sticky), the early warning card scored with the region's chart
                  (NEWS2, ADDS placeholder or NZEWS, AU-OB-01), medicines due by shape and word, alerts and the tab bar. */}
              <MobileSummary
                patient={patient}
                now={NOW}
                earlyWarning={{
                  observation: rec.hasObs ? latestObservations(region) : null,
                  nextDueAt: rec.hasObs ? today(17, 40) : null,
                  onRecord: () => note('f1', 'Record observations opens keypad or voice entry (see the voice capture example).'),
                }}
                medicinesDue={rec.due}
                onOpenMedicine={m => note('f1', `Opens dose administration for ${m.line.genericName} (see the nurse round example).`)}
                onAllMedicines={() => note('f1', 'Opens the Medicines tab (frame 2).')}
                alerts={
                  which === 'main' ? ALERTS.map(a => ({ ...a, onAction: () => note('f1', 'Review alert opens the alert details.') })) : []
                }
                headerProps={{ detailsSheetProps: { closeOnBrowserBack: false } }}
              >
                {/* Demonstration controls, shown as an ordinary card. Navigation switches at once (and is flashed);
                    a wristband scan that finds another patient needs an explicit choice first. */}
                <section
                  aria-labelledby="pr-switch"
                  style={{
                    margin: '0 16px 16px',
                    padding: 12,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <h2 id="pr-switch" style={{ margin: 0, fontSize: 15, lineHeight: '20px' }}>
                    Try a patient switch
                  </h2>
                  <TouchButton size={48} onClick={() => setWhich(otherKey)}>
                    Open {otherName} ({other.location?.replace(/^Ward [^,]+, /, '')})
                  </TouchButton>
                  <TouchButton size={48} icon="refresh" onClick={() => setPending(otherKey)}>
                    Scan a wristband ({otherName}'s)
                  </TouchButton>
                </section>
                {notes.f1 ? <Note text={notes.f1} /> : null}
              </MobileSummary>
            </div>,
            true,
          )}
        </Screen>
      </PhoneFrame>

      <PhoneFrame caption="2. Medicines">
        <Screen>
          {guard(
            // Exactly one phone high: the medicines list scrolls inside it.
            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
              {/* List screens use the condensed header: name, born, primary identifier and the allergy count. */}
              {condensedHeader}
              {/* listHeight="fill" scrolls the list inside the phone, so the look-ahead strip (MEDv-048) names the
                  medicines below the visible area instead of leaving them unseen. */}
              <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <MobileMedicationsList
                  medications={rec.medicines}
                  now={NOW}
                  listHeight="fill"
                  onOpen={m => note('f2', `Opens ${m.line.genericName}: details, or dose administration when due.`)}
                />
              </div>
              {notes.f2 ? <Note text={notes.f2} /> : null}
              <MobileTabBar items={MOBILE_RECORD_TABS} current="medicines" />
            </div>,
          )}
        </Screen>
      </PhoneFrame>

      <PhoneFrame caption="3. Drug chart today">
        <Screen>
          {guard(
            <div style={tallScreen}>
              {condensedHeader}
              {/* The same chart events as the desktop DrugAdministrationChart: overdue above the now line, due just
                  below it, codes with their meaning for doses not given (AU NIMC, NZ NMC), and when-required
                  availability as advice only (MEDa-0136). */}
              <MobileDrugAgenda
                medications={rec.chart}
                now={NOW}
                medicationAlerts={which === 'main' ? MEDICATION_ALERTS : undefined}
                onOpenEvent={(m: AdminMedication, e: AdminEvent) =>
                  note(
                    'f3',
                    `Opens ${m.name}${e.scheduledTime ? ` ${formatTime(e.scheduledTime)}` : ''}: dose administration (see the nurse round example).`,
                  )
                }
                onOpenAsRequired={m => note('f3', `Opens a when-required dose of ${m.name}.`)}
                onOpenChart={() => note('f3', 'Opens the 4-day chart (DrugAdministrationChart).')}
              />
              {notes.f3 ? <Note text={notes.f3} /> : null}
              <div style={{ flex: '1 1 auto' }} />
              <MobileTabBar items={MOBILE_RECORD_TABS} current="medicines" />
            </div>,
          )}
        </Screen>
      </PhoneFrame>

      <PhoneFrame caption="4. Patient details">
        <Screen>
          {/* The details sheet opens from the header's expand button. It is full screen; SheetContainerProvider puts it
              in this phone's layer. NZ: the address is protected (HISO 10046) and is revealed only with a reason, which the
              host records for audit. AU: My Health Record state in words (G12 2). */}
          <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
            <MobilePatientHeader
              patient={patient}
              now={NOW}
              sticky
              detailsOpen={detailsOpen}
              onDetailsOpenChange={setDetailsOpen}
              onRevealProtected={(kind, reason) => {
                note('f4', `Audit: ${kind} revealed at ${formatTime(NOW)}, reason "${reason}".`);
                return true;
              }}
              detailsSheetProps={{ closeOnBrowserBack: false, now: NOW }}
            />
            <p style={{ margin: 16, fontSize: 14, lineHeight: '20px', color: 'var(--ink-muted)' }}>
              Use the expand button in the header to open the patient details.
            </p>
            {notes.f4 ? <Note text={notes.f4} /> : null}
          </div>
        </Screen>
      </PhoneFrame>
    </>
  );
}

export default function Example() {
  return <ExampleShell meta={meta}>{region => <PatientReview region={region} />}</ExampleShell>;
}
