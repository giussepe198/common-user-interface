/**
 * Prescribing a new medicine, end to end: search, prescribe, check, preview, authorise.
 *
 * The story: the cannula site in the drug round example has become red and sore, and the doctor
 * prescribes an antibiotic for cellulitis. The page opens part way through, with flucloxacillin chosen
 * and the form filled, so the decision support step is visible:
 * - GB and NZ: flucloxacillin is a penicillin and the patient has penicillin anaphylaxis recorded, so
 *   a High Priority AlertItem sits between the drug and the form, and Authorise is held (with the reason
 *   beside it, through authoriseBlockedReason) until it has a response. Choosing a recommended action swaps the drug.
 * - AU: allergies are recorded as "Nil known", so no allergy alert is raised. Choosing erythromycin
 *   shows the interaction alert with the current simvastatin instead.
 *
 * Composition
 * - DrugSearch with an asynchronous search (a stand-in for a terminology server) over a small
 *   formulary, with a Quick List while the box is empty. AU and NZ show mixed-case lettering.
 * - Once a drug is chosen, the search is replaced by a SelectionTrail (drug, then route). Activating
 *   any item reopens the search with the text restored, instead of back and undo buttons (MSP-1080).
 * - PrescriptionForm in sentence layout; its Preview opens PrescriptionPreview beside it, so the form
 *   and the preview can be compared. Authorise in either place commits.
 * - After Authorise the new line appears in the MedicationsList below, selected so it can be found. If an alert
 *   was raised and overridden, the row carries the alert icon with the alert named in its text (hasAlert, alertLabel).
 */
import React, { useMemo, useState } from 'react';
import {
  AlertItem,
  DrugSearch,
  MedicationLine,
  MedicationsList,
  PatientBanner,
  PrescriptionForm,
  PrescriptionPreview,
  SelectionTrail,
  canAuthorise,
  medicationDrugName,
  parseAdministrationTimes,
  searchDrugCatalogue,
} from '@clinical-cui/react';
import type {
  ClinicalRegion,
  DecisionSupportAlertResponse,
  DrugCatalogueEntry,
  DrugSearchOutcome,
  MedicationLineData,
  MedicationRecord,
  PrescriptionValues,
} from '@clinical-cui/react';
import { ExampleShell } from './shell/ExampleShell';
import type { ExampleMeta } from './shell/ExampleShell';
import { EXAMPLE_NOW } from './data/patients';
import { CURRENT_USER, MEDICATIONS, at, bannerProps } from './data/desktop-patient-record';
import { CATALOGUE, QUICK_LISTS, checkPrescription, formularyItem } from './data/desktop-prescribing';
import type { FormularyItem } from './data/desktop-prescribing';

export const meta: ExampleMeta = {
  title: 'Prescribing a new medicine',
  description:
    'Search a formulary, prescribe in sentence layout, check against recorded allergies and current medicines (an unanswered High Priority alert holds Authorise, with the reason shown), preview and authorise. The authorised line joins the medications list, with its alert icon if one was raised.',
  kind: 'desktop',
  regions: ['GB', 'AU', 'NZ'],
  components: ['PatientBanner', 'DrugSearch', 'SelectionTrail', 'AlertItem', 'PrescriptionForm', 'PrescriptionPreview', 'MedicationLine', 'MedicationsList'],
};

/** The fields Authorise waits for (the form's default required set). */
const REQUIRED = ['route', 'dose', 'frequency', 'administrationTimes', 'firstDose', 'duration'];

/** The page opens with this drug chosen and the form filled, part way through the task. */
const OPENING_DRUG = 'fluclox';
const OPENING_VALUES: PrescriptionValues = {
  route: 'oral', dose: '1 g', frequency: 'four times a day', administrationTimes: '06:00; 12:00; 18:00; 22:00',
  firstDose: 'Today 18:00', duration: '7 days', reason: 'cellulitis at cannula site',
};

/** Simulated terminology server: the library's matcher behind a short delay that honours aborts. */
function searchAsync(query: string, signal: AbortSignal): Promise<DrugSearchOutcome> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(searchDrugCatalogue(query, CATALOGUE)), 350);
    signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); });
  });
}

/** Form values to structured medication line data, for the preview and the medications list. */
function toLine(item: FormularyItem, v: PrescriptionValues): MedicationLineData {
  return {
    genericName: item.entry.genericName,
    brandName: item.entry.brandName,
    form: item.form,
    dose: v.dose ?? undefined,
    route: v.route ?? undefined,
    frequency: v.frequency ?? undefined,
    courseDuration: v.duration && v.duration !== 'ongoing' ? `for ${v.duration}` : undefined,
    indication: v.reason ?? undefined,
  };
}

function Prescribing({ region }: { region: ClinicalRegion }) {
  const [drugId, setDrugId] = useState<string | null>(OPENING_DRUG);
  const [query, setQuery] = useState('fluclox');
  const [values, setValues] = useState<PrescriptionValues>(OPENING_VALUES);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewRequested, setPreviewRequested] = useState(false);
  // Alert responses by alert id. A High Priority alert needs a response before Authorise.
  const [responses, setResponses] = useState<Record<string, DecisionSupportAlertResponse>>({});
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [medications, setMedications] = useState<MedicationRecord[]>(() => MEDICATIONS[region]);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState('');

  const item = drugId ? formularyItem(drugId) : undefined;
  const alert = useMemo(() => (item ? checkPrescription(item, region) : null), [item, region]);
  const alertShown = alert && !dismissed.includes(alert.id) ? alert : null;
  const alertOpen = alert?.status === 'High Priority' && !responses[alert.id];
  const complete = canAuthorise(REQUIRED, values);
  // Never authorise past an unanswered High Priority alert. The form and the preview disable Authorise and show this
  // reason beside it (linked by aria-describedby), so the page does not need its own check.
  const authoriseBlockedReason = alertOpen
    ? 'Respond to the High Priority alert before authorising: choose an alternative or override with a reason.'
    : undefined;

  const choose = (entry: DrugCatalogueEntry) => {
    setDrugId(entry.id);
    setValues({}); // A new drug starts a new form: nothing carries over from the last one.
    setPreviewOpen(false);
  };

  const onAlertResponse = (r: DecisionSupportAlertResponse) => {
    if (!alert) return;
    setResponses(x => ({ ...x, [alert.id]: r }));
    // A recommended alternative replaces the drug; an override keeps it, with the reason on record.
    const alternative = r.actionId ? formularyItem(r.actionId) : undefined;
    if (alternative && !r.overrideReason) {
      setQuery(alternative.entry.genericName ?? '');
      choose(alternative.entry);
    }
  };

  const authorise = () => {
    // The form and the preview only call this when complete and not blocked.
    if (!item) return;
    const id = `new-${medications.length + 1}`;
    const record: MedicationRecord = {
      id, status: 'Not Started', statusSupplement: 'Not Verified', startDate: at(0, 18), line: toLine(item, values),
      // An overridden alert stays visible on the row: an icon after the drug details, named by alertLabel (MEDv-023).
      hasAlert: alert ? true : undefined,
      alertLabel: alert ? `${alert.status} alert${responses[alert.id]?.overrideReason ? ', overridden' : ''}: ${alert.summary}` : undefined,
    };
    setMedications(m => [...m, record]);
    setSelected([id]);
    setConfirmation(`Authorised: ${medicationDrugName({ genericName: item.entry.genericName, brandName: item.entry.brandName }, { region })}, by ${CURRENT_USER[region]}. The new line is selected in the medications list.`);
    setDrugId(null);
    setQuery('');
    setValues({});
    setPreviewOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PatientBanner {...bannerProps(region)} />

      {/* The form carries the "New prescription" heading; this line only names who is prescribing. */}
      <div style={{ fontSize: 14, color: 'var(--ink-muted)' }}>Prescribing as {CURRENT_USER[region]}</div>
      <div role="status" style={{ fontSize: 14, color: 'var(--success)', marginTop: confirmation ? 0 : -16 }}>{confirmation}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: 'var(--space-4)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0 }}>
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
            {item ? (
              // The trail replaces the search once a drug is chosen; it stays in view above the form.
              <SelectionTrail
                items={[
                  { id: 'drug', kind: 'Drug', label: <MedicationLine genericName={item.entry.genericName} brandName={item.entry.brandName} />, text: item.entry.genericName },
                  ...(values.route ? [{ id: 'route', kind: 'Route', label: values.route }] : []),
                ]}
                onReopen={() => { setDrugId(null); setPreviewOpen(false); }}
              />
            ) : (
              <DrugSearch
                catalogue={CATALOGUE}
                searchAsync={searchAsync}
                debounceMs={250}
                quickLists={QUICK_LISTS}
                query={query}
                onQueryChange={setQuery}
                onSelect={choose}
                label="Find a medicine"
              />
            )}
          </section>

          {alertShown ? (
            // Shown between the drug and the form, where the decision is made. High Priority opens expanded.
            <AlertItem
              key={alertShown.id}
              alert={alertShown}
              headingLevel={3}
              onRecordResponse={onAlertResponse}
              onDismiss={alertShown.status === 'Priority' ? () => setDismissed(d => [...d, alertShown.id]) : undefined}
            />
          ) : item ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-muted)' }}>
              Allergy and interaction checks found no conflicts for {medicationDrugName({ genericName: item.entry.genericName, brandName: item.entry.brandName }, { region })}.
            </p>
          ) : null}
          {alert && responses[alert.id] ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-muted)' }}>
              Alert response recorded{responses[alert.id].overrideReason ? `: override, ${responses[alert.id].overrideReason}` : '.'}
            </p>
          ) : null}

          {item ? (
            <div>
              {/* The form and the preview draw their own frames, so they are not wrapped in panels.
                  Option lists come from the formulary for this drug and route (MSP-0890). Changing the frequency
                  pre-fills the matching standard times (MSP-2040). */}
              <PrescriptionForm
                key={item.entry.id}
                drug={{ genericName: item.entry.genericName, brandName: item.entry.brandName, form: item.form }}
                options={item.options}
                values={values}
                onChange={setValues}
                allowOther={['dose']}
                getPrefill={(field, v) => {
                  if (field !== 'frequency') return {};
                  const times = item.options.administrationTimes?.[0]?.value;
                  return times && v.frequency ? { administrationTimes: times } : {};
                }}
                optionalFields={[{
                  id: 'reason', addLabel: 'Add a reason for prescribing', inlineLabel: 'for', label: 'Reason for prescribing',
                  prompt: 'Select or enter a reason for prescribing', allowOther: true,
                  options: [{ value: 'cellulitis at cannula site' }, { value: 'community-acquired pneumonia' }],
                }]}
                builtInPreview={false}
                onPreview={() => { setPreviewOpen(true); setPreviewRequested(true); }}
                onAuthorise={authorise}
                authoriseBlockedReason={authoriseBlockedReason}
                onCancel={() => { setDrugId(null); setValues({}); setPreviewOpen(false); }}
              />
            </div>
          ) : null}
        </div>

        <div style={{ minWidth: 0 }}>
          {item && previewOpen ? (
            <>
              {/* Every defined value is shown (MSP-2190); focus goes to Close Preview, never to Authorise (MSP-2260). */}
              <PrescriptionPreview
                medication={toLine(item, values)}
                administrationTimes={parseAdministrationTimes(values.administrationTimes)}
                firstDose={values.firstDose ?? undefined}
                duration={values.duration ?? undefined}
                details={values.reason ? [{ label: 'Reason for prescribing', value: values.reason }] : []}
                canAuthorise={complete}
                onClose={() => setPreviewOpen(false)}
                onAuthorise={authorise}
                authoriseBlockedReason={authoriseBlockedReason}
                // Focus moves to Close Preview when the user opens it, not when the page first loads.
                autoFocus={previewRequested}
              />
            </>
          ) : item ? (
            <p style={{ margin: 0, padding: 'var(--space-4)', fontSize: 14, color: 'var(--ink-muted)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
              Choose Preview to check the prescription as it will appear on the chart.
            </p>
          ) : null}
        </div>
      </div>

      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }} aria-labelledby="rx-meds-h">
        <h2 id="rx-meds-h" style={{ margin: '0 0 var(--space-3)', fontSize: 18, lineHeight: '24px', fontWeight: 600 }}>Medications</h2>
        <MedicationsList medications={medications} now={EXAMPLE_NOW} selectedIds={selected} onSelectionChange={setSelected} maxHeight={520} />
      </section>
    </div>
  );
}

export default function DesktopPrescribing() {
  return <ExampleShell meta={meta}>{region => <Prescribing region={region} />}</ExampleShell>;
}
