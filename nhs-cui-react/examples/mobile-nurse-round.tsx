/**
 * Mobile: the task-first medication round (concepts B1, B2, B3 and P4).
 *
 * Four screens of the same nursing app, side by side, sharing one list of tasks:
 *   1. the worklist (the nursing home screen) with filter chips and a similar-name pair;
 *   2. an overdue oral dose, after a wristband scan that matches;
 *   3. a high-risk insulin dose: second check, typed read-back and hold-to-confirm;
 *   4. "Why was it not given?" for a withheld dose, with the region's codes.
 * Recording in 2, 3 or 4 completes the task: it leaves the worklist, the chip counts change, and the worklist shows
 * an undo window. Undo puts the task back and reopens the dose.
 */
import React from 'react';
import {
  DoseAdministrationFlow,
  MobileNavBar,
  SheetContainerProvider,
  UndoToast,
  Worklist,
  formatTime,
  medicationDrugName,
  mobileFormatQuantity,
  mobilePatientName,
} from '@clinical-cui/react';
import type { AdminReasonCode, ClinicalRegion, ReasonCodeValue, WorklistFilter, WorklistTask } from '@clinical-cui/react';
import { ExampleShell, PhoneFrame, type ExampleMeta } from './shell/ExampleShell';
import { EXAMPLE_NOW } from './data/patients';
import { CURRENT_USER_ID, SECOND_CHECKER, roundTasks, withheldChoice, wristbandScan, type RoundTask } from './data/mobile-nurse-round';

export const meta: ExampleMeta = {
  title: 'Nurse medication round',
  description:
    'The task-first worklist (direction B) with an overdue oral dose after a matching wristband scan, a high-risk insulin dose with second check, typed read-back and hold-to-confirm, and a withheld dose with the region’s not-given codes. Recording updates the worklist and offers an undo window.',
  kind: 'mobile',
  regions: ['AU', 'NZ', 'GB'],
  components: [
    'Worklist',
    'WorklistTaskCard',
    'MobileNavBar',
    'DoseAdministrationFlow',
    'IdentityScanResult',
    'SecondCheckField',
    'TypedReadBackConfirm',
    'HoldToConfirmButton',
    'NotGivenSheet',
    'UndoToast',
  ],
};

const NOW = EXAMPLE_NOW;

/**
 * The phone screen inside a PhoneFrame. SheetContainerProvider sends every sheet below it (time given, Not given,
 * patient details, the hold-to-confirm dialog) into this phone's own layer, so a sheet covers this phone only and does
 * not lock the scroll of the docs page; autoFocus={false} keeps the sheet that is open on load from drawing a focus
 * ring. PhoneFrame has a transform, so it is the containing block for `position: fixed`. The inner div is the
 * scroller and exactly one phone high, so the sticky patient header and action bar stick to the phone's edges, the
 * screens (DoseAdministrationFlow has `min-height: 100%`) fill it, and a fixed sheet or toast sits on the visible
 * screen however far the content is scrolled.
 */
function Screen({ children, scrollToEnd }: { children: React.ReactNode; scrollToEnd?: boolean }) {
  // State setters are stable, so they work as callback refs. Content waits for the layer, so a sheet that is open on
  // load opens in the phone, never in the page.
  const [layer, setLayer] = React.useState<HTMLDivElement | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    // Frame 3 opens scrolled to the high-risk checks, the part of the screen this example is about.
    if (scrollToEnd && layer && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [scrollToEnd, layer]);
  return (
    <SheetContainerProvider container={layer} autoFocus={false}>
      <div ref={ref} style={{ height: '100%', overflow: 'auto', background: 'var(--surface-sunken)' }}>
        {layer ? children : null}
      </div>
      <div ref={setLayer} />
    </SheetContainerProvider>
  );
}

/** Shown in a dose frame when no dose is open there (after recording, or after Back). */
function NoDoseOpen({ text }: { text: string }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 18, lineHeight: '24px' }}>No dose open</h2>
      <p style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: 'var(--ink-muted)' }}>{text}</p>
    </div>
  );
}

/** A latest result shown before giving (P4 "Blood glucose 9.8 mmol/L at 13:55 (meter)"). */
function CheckCard({ check }: { check: NonNullable<NonNullable<RoundTask['administration']>['check']> }) {
  return (
    <section
      aria-label={check.label}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: '18px',
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          color: 'var(--ink-muted)',
        }}
      >
        {check.label}
      </h3>
      <span style={{ fontSize: 16, lineHeight: '22px' }}>
        <strong style={{ fontSize: 20, fontVariantNumeric: 'tabular-nums' }}>{check.value}</strong> at {formatTime(check.at)}{' '}
        <span style={{ color: 'var(--ink-muted)' }}>({check.source})</span>
      </span>
    </section>
  );
}

/** The record that is still inside its undo window. */
interface Pending {
  key: number;
  taskId: string;
  message: string;
}

function NurseRound({ region }: { region: ClinicalRegion }) {
  // Shared state: the tasks (completing one updates every frame), which dose is open in frames 2 and 3, the worklist
  // filter, and the latest record still inside its undo window.
  const [tasks, setTasks] = React.useState<RoundTask[]>(() => roundTasks(region));
  const [oralId, setOralId] = React.useState<string | null>('para13');
  const [highRiskId, setHighRiskId] = React.useState<string | null>('ins14');
  const [notGivenOpen, setNotGivenOpen] = React.useState(true);
  const [filter, setFilter] = React.useState<WorklistFilter>('dueNow');
  const [pending, setPending] = React.useState<Pending | null>(null);
  const [startNote, setStartNote] = React.useState('');
  // Bumped on undo so a reopened dose starts fresh (its own state, such as the typed dose, is not kept).
  const [reopen, setReopen] = React.useState(0);

  const task = (id: string | null) => (id ? tasks.find(t => t.id === id && !t.completedAt) : undefined);
  const name = (t: WorklistTask) => mobilePatientName(t.patient, region, { showTitle: false });
  const drug = (t: WorklistTask) => (t.medication ? medicationDrugName(t.medication, { region }) : (t.title ?? ''));

  /** Complete a task and open the undo window on the worklist. A new record makes the previous one final. */
  const complete = (t: RoundTask, message: string) => {
    setTasks(ts => ts.map(x => (x.id === t.id ? { ...x, completedAt: NOW } : x)));
    setPending({ key: Date.now(), taskId: t.id, message });
  };
  const undo = () => {
    if (!pending) return;
    setTasks(ts => ts.map(x => (x.id === pending.taskId ? { ...x, completedAt: null } : x)));
    if (pending.taskId === 'meto14') setNotGivenOpen(true);
    setPending(null);
    setReopen(n => n + 1);
  };

  // Start on the worklist opens the dose in the matching frame. Observation and other tasks belong to other screens.
  const start = (t: WorklistTask) => {
    const rt = t as RoundTask;
    if (rt.administration && rt.highRisk) setHighRiskId(rt.id);
    else if (rt.administration) setOralId(rt.id);
    setStartNote(
      rt.administration
        ? ''
        : rt.kind === 'observations'
          ? `${drug(t)} for ${name(t)} opens observation entry (see the voice capture example).`
          : `${drug(t)} for ${name(t)} is not part of this example.`,
    );
  };

  const recordedGiven = (t: RoundTask) => (r: { givenAt: Date; approximate: boolean }) =>
    complete(
      t,
      `Recorded ${drug(t)} ${mobileFormatQuantity(t.administration!.dose, region)} given at ${r.approximate ? 'Approx ' : ''}${formatTime(r.givenAt)} for ${name(t)}`,
    );
  const recordedNotGiven = (t: RoundTask) => (_v: ReasonCodeValue, code: AdminReasonCode) => {
    complete(t, `Recorded ${code.showCode ? `${code.code}: ` : ''}${code.label} for ${drug(t)}, ${name(t)}`);
  };

  /** One dose on DoseAdministrationFlow, with the settings every frame shares. `extra` adds frame-specific props. */
  const doseFlow = (t: RoundTask, onBack: () => void, extra?: Partial<React.ComponentProps<typeof DoseAdministrationFlow>>) => {
    const a = t.administration!;
    return (
      <DoseAdministrationFlow
        key={`${t.id}-${reopen}`}
        patient={t.patient}
        medication={t.medication!}
        dose={a.dose}
        unitDose={a.unitDose}
        scheduledAt={a.scheduledAt}
        now={NOW}
        // Identity first (B2): the band is compared with the patient on screen. Recording stays blocked until it
        // matches; a mismatch would name the band's owner and offer the switch, never "continue anyway".
        wristband={wristbandScan(t.patient, region, new Date(NOW.getTime() - 60000))}
        productScan={a.productText ? { status: 'match', productText: a.productText } : null}
        // Interval and 24-hour maximum are advisory (MEDa-0136): shown as warnings to acknowledge, never a block.
        lastGivenAt={a.lastGivenAt}
        minIntervalMinutes={a.minIntervalMinutes}
        givenIn24Hours={a.givenIn24Hours}
        maximumIn24Hours={a.maximumIn24Hours}
        checks={a.check ? <CheckCard check={a.check} /> : undefined}
        // High risk (P4): adds SecondCheckField (the signed-in nurse cannot check their own dose),
        // TypedReadBackConfirm (unsafe forms such as "6.0" or "U" are refused) and HoldToConfirmButton (a tap opens a
        // confirmation instead, so the hold is never the only route).
        highRisk={a.highRisk}
        currentUserId={CURRENT_USER_ID}
        onScanSecondChecker={() => SECOND_CHECKER[region]}
        resolveSecondChecker={text => (text.trim().toUpperCase() === SECOND_CHECKER[region].id ? SECOND_CHECKER[region] : null)}
        onNotNow={a.highRisk ? onBack : undefined}
        onBack={onBack}
        onRecordGiven={recordedGiven(t)}
        // Recording completes the task, so this screen closes and the worklist shows the undo window (frame 1). The
        // flow's own undo toast would never be seen, so the host owns the undo window instead.
        showUndoToast={false}
        onNotGiven={recordedNotGiven(t)}
        notGivenSheetProps={{ reasonHint: 'Type the reason. Dictation can fill this field where it is available.' }}
        // Sheets go to this phone's layer through SheetContainerProvider. No history entries on a page of several phones.
        closeOnBrowserBack={false}
        {...extra}
      />
    );
  };

  const oral = task(oralId);
  const insulin = task(highRiskId);
  const withheld = task('meto14');

  return (
    <>
      <PhoneFrame caption="1. Worklist">
        <Screen>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
            {/* Cross-patient list: every card carries the full identity strip, overdue sorts first, and patients
                with similar names are flagged on both cards (AU-PI-04). Completed tasks drop out of the list. */}
            <Worklist
              tasks={tasks}
              now={NOW}
              filter={filter}
              onFilterChange={setFilter}
              context={region === 'GB' ? 'Ward 7' : region === 'AU' ? 'Ward 5B' : 'Ward 24'}
              onStart={start}
            />
            {startNote ? (
              <p role="status" style={{ margin: 0, padding: '8px 16px', fontSize: 14, lineHeight: '20px', color: 'var(--ink-muted)' }}>
                {startNote}
              </p>
            ) : null}
            <div style={{ flex: '1 1 auto' }} />
            <MobileNavBar
              current="worklist"
              onScan={() => setStartNote('Scan opens the camera to read a wristband or a medicine barcode.')}
              items={[
                { id: 'worklist', label: 'Worklist', icon: 'tick' },
                { id: 'patients', label: 'Patients', icon: 'summary' },
                { id: 'dictate', label: 'Dictate', icon: 'dictate' },
                { id: 'handover', label: 'Handover', icon: 'handover' },
              ]}
            />
          </div>
          {/* A normal commit is one clear button with an undo window (Phase 4). The window is shown where the nurse
              lands after recording: the worklist. It clears the nav bar and can be paused. */}
          {pending ? (
            <UndoToast
              key={pending.key}
              open
              message={pending.message}
              onUndo={undo}
              onTimeout={() => setPending(null)}
              dismissible
              bottomOffset={104}
            />
          ) : null}
        </Screen>
      </PhoneFrame>

      <PhoneFrame caption="2. Overdue oral dose">
        <Screen>
          {oral ? doseFlow(oral, () => setOralId(null)) : <NoDoseOpen text="Start a medicine on the worklist to open it here." />}
        </Screen>
      </PhoneFrame>

      <PhoneFrame caption="3. High-risk dose: insulin">
        <Screen scrollToEnd>
          {insulin ? (
            doseFlow(insulin, () => setHighRiskId(null))
          ) : (
            <NoDoseOpen text="Start a high-risk medicine on the worklist to open it here." />
          )}
        </Screen>
      </PhoneFrame>

      <PhoneFrame caption="4. Not given: withheld">
        <Screen>
          {withheld ? (
            // B3 is opened from "Not given" on the dose screen, so the dose is behind the sheet. The flow's own
            // NotGivenSheet is held open here with `notGivenOpen`; Cancel closes it and the "Not given" button reopens it.
            doseFlow(withheld, () => setNotGivenOpen(false), {
              notGivenOpen,
              onNotGivenOpenChange: setNotGivenOpen,
              notGivenSheetProps: {
                // The state after the nurse's choice: the region's withheld code (AU NIMC W needs a reason, NZ NMC W
                // needs an explanation; GB uses the status without a code). The sheet never pre-selects by itself.
                defaultValue: withheldChoice(region),
                reasonHint: 'Type the reason. Dictation can fill this field where it is available.',
              },
            })
          ) : (
            <NoDoseOpen text="This dose has been recorded. Undo on the worklist brings it back." />
          )}
        </Screen>
      </PhoneFrame>
    </>
  );
}

export default function Example() {
  return <ExampleShell meta={meta}>{region => <NurseRound region={region} />}</ExampleShell>;
}
