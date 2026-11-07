import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { MedicationLine } from '../MedicationLine/MedicationLine';
import { PrescriptionPreview } from '../PrescriptionPreview/PrescriptionPreview';
import type { MedicationLineData } from '../utils/medicationLine';
import type { PrescriptionValues} from '../utils/prescription';
import {
  canAuthorise as canAuthoriseFn, firstDoseTimeIndex, missingPrescriptionFields, parseAdministrationTimes
} from '../utils/prescription';
import type { PrescriptionOption} from './SentenceSelect';
import { NONE_LEAVE_BLANK, SentenceSelect } from './SentenceSelect';

export type { PrescriptionOption } from './SentenceSelect';

/** Built-in prescription fields, in the fixed order used for every prescription (MSP-1530). */
export type PrescriptionFieldId =
  | 'route' | 'strength' | 'dose' | 'frequency' | 'giveWhen' | 'administrationTimes' | 'firstDose' | 'duration';

/** An optional field revealed by an "+ Add ..." control (MSP-1760 to MSP-1800). */
export interface PrescriptionOptionalField {
  id: string;
  /** Control text, e.g. "Add a reason for prescribing". Shown grey with "+" (MSP-1760/1790). */
  addLabel: string;
  /** Label inside the field once added, e.g. "for" or "review on". */
  inlineLabel?: string;
  /** Name for assistive technology and the preview, e.g. "Reason for prescribing". */
  label: string;
  /** Verb-first prompt, e.g. "Select or enter a reason for prescribing" (MSP-1750). */
  prompt: string;
  options: PrescriptionOption[];
  /** Offer "other..." for free text (MSP-1900). */
  allowOther?: boolean;
  /** Promoted optional field: shown without "+ Add", required, with "None (leave blank)" (MSP-1720/1730). */
  promoted?: boolean;
}

export interface PrescriptionFormProps {
  /** The selected drug. Always visible at the top of the form (MSP-1550, MSP-1680). */
  drug: Pick<MedicationLineData, 'genericName' | 'brandName' | 'brandDescriptor' | 'form' | 'ingredients'>;
  /** Field values (controlled). Keys are PrescriptionFieldId or optional field ids. null = "None (leave blank)". */
  values?: PrescriptionValues;
  defaultValues?: PrescriptionValues;
  onChange?: (values: PrescriptionValues, changedField: string) => void;
  /** Option lists supplied by the consumer, relevant to the drug and route (MSP-0890, MSP-1970). Omit a list to hide that field. */
  options: Partial<Record<PrescriptionFieldId, PrescriptionOption[]>>;
  /** Fields that also offer "other..." for free entry (MSP-1900). */
  allowOther?: PrescriptionFieldId[];
  /** Required fields. Default: route, dose, frequency, administration times, first dose, duration (plus strength when it has options, give when for "as required"). */
  requiredFields?: string[];
  /** Optional fields behind "More options" (MSP-1400, MSP-1630). */
  optionalFields?: PrescriptionOptionalField[];
  /** Pre-fill dependent fields after a change, e.g. frequency to administration times and first dose (MSP-2040/2060). Changed fields are highlighted (MSP-2050). */
  getPrefill?: (changedField: string, values: PrescriptionValues) => PrescriptionValues;
  /** Show required fields one at a time, each after the previous is complete (MSP-1320). Default false. */
  stepByStep?: boolean;
  /** Called with the values when Authorise is pressed (only possible when complete, MSP-2310). */
  onAuthorise?: (values: PrescriptionValues) => void;
  /**
   * Hold Authorise with a reason, e.g. "Answer the High Priority interaction alert before authorising". While set,
   * Authorise is disabled, the reason is shown beside the commands and referenced by the button's aria-describedby, and
   * the status never says "ready to authorise" [suggested].
   */
  authoriseBlockedReason?: string;
  /** Called when Preview is pressed. The built-in preview also opens unless `builtInPreview` is false. */
  onPreview?: (values: PrescriptionValues) => void;
  /** Show the built-in PrescriptionPreview below the form. Default true. */
  builtInPreview?: boolean;
  onCancel?: () => void;
  /** Heading. Default "New prescription". */
  title?: string;
  /** Jurisdiction for the drug name and preview line; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  className?: string;
}

const PROMPTS: Record<PrescriptionFieldId, string> = {
  route: 'Select a route',
  strength: 'Select a strength',
  dose: 'Select a dose',
  frequency: 'Select a frequency',
  giveWhen: 'Select when to give',
  administrationTimes: 'Select administration times',
  firstDose: 'Select the first dose',
  duration: 'Select a duration',
};
const OTHER_PROMPTS: Partial<Record<PrescriptionFieldId, string>> = {
  dose: 'Enter a dose',
  strength: 'Enter a strength',
  frequency: 'Enter a frequency',
  giveWhen: 'Enter a description of when this medication should be given',
  duration: 'Enter a duration',
  route: 'Enter a route',
};
const NAMES: Record<PrescriptionFieldId, string> = {
  route: 'Route', strength: 'Strength', dose: 'Dose', frequency: 'Frequency', giveWhen: 'Give when',
  administrationTimes: 'Administration times', firstDose: 'First dose', duration: 'Duration',
};

const isAsRequired = (freq: string | null | undefined) => !!freq && /as required/i.test(freq);

/**
 * Prescription form in sentence layout (Search and Prescribe sections 7 to 10): fields read like a
 * sentence, carry their own labels ("DOSE 500 mg", "at these times", "first dose", "duration"),
 * grow with their values and wrap whole; each group starts a new line. Nothing beyond the route is
 * shown until a route is chosen. Optional fields sit behind "More options". The command bar has
 * Preview then Authorise; Authorise is disabled until every required field is complete.
 */
export function PrescriptionForm({
  drug, values: valuesProp, defaultValues = {}, onChange, options, allowOther = [], requiredFields, optionalFields = [],
  getPrefill, stepByStep = false, onAuthorise, authoriseBlockedReason, onPreview, builtInPreview = true, onCancel, title = 'New prescription', className,
  region: regionProp,
}: PrescriptionFormProps) {
  const uid = useId('cui-rx-form');
  const { region } = useClinicalLocale(regionProp);
  const [values, setValues] = useControllableState<PrescriptionValues>(valuesProp, defaultValues, undefined);
  const [autoChanged, setAutoChanged] = React.useState<string[]>([]);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [added, setAdded] = React.useState<string[]>(() => optionalFields.filter(f => defaultValues[f.id] !== undefined).map(f => f.id));
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const previewBtn = React.useRef<HTMLButtonElement>(null);

  const asRequired = isAsRequired(values.frequency);
  const routeChosen = !!values.route;
  const required = React.useMemo(() => {
    const base = requiredFields ?? (['route', options.strength ? 'strength' : null, 'dose', 'frequency', 'administrationTimes', 'firstDose', 'duration'].filter(Boolean) as string[]);
    const extra = asRequired && options.giveWhen ? ['giveWhen'] : [];
    const promoted = optionalFields.filter(f => f.promoted).map(f => f.id);
    // As-required medicines have no fixed administration times.
    const list = [...base, ...extra, ...promoted].filter(f => !(asRequired && f === 'administrationTimes'));
    return Array.from(new Set(list));
  }, [requiredFields, options.strength, options.giveWhen, asRequired, optionalFields]);
  const missing = missingPrescriptionFields(required, values);
  const complete = canAuthoriseFn(required, values);
  const blocked = !!authoriseBlockedReason;
  const canAuth = complete && !blocked;
  const blockedId = `${uid}-blocked`;

  const set = (field: string, v: string | null | undefined) => {
    let next: PrescriptionValues = { ...values, [field]: v };
    if (field === 'frequency' && !isAsRequired(v) && next.giveWhen !== undefined) next = { ...next, giveWhen: undefined }; // dynamic field removed with its trigger (MSP-1860)
    let auto = autoChanged.filter(f => f !== field);
    if (getPrefill) {
      const pre = getPrefill(field, next);
      const changed = Object.keys(pre).filter(k => k !== field && pre[k] !== next[k]);
      next = { ...next, ...pre };
      auto = Array.from(new Set([...auto, ...changed]));
    }
    setAutoChanged(auto);
    setValues(next);
    onChange?.(next, field);
  };

  // Fields in a fixed order (MSP-1530), grouped onto lines (MSP-1490).
  const groups: PrescriptionFieldId[][] = [
    ['route', 'strength'],
    ['dose', 'frequency', 'giveWhen'],
    ['administrationTimes', 'firstDose'],
    ['duration'],
  ];
  const isShown = (f: PrescriptionFieldId) => {
    if (!options[f]) return false;
    if (f === 'giveWhen') return asRequired;
    if (f === 'administrationTimes' && asRequired) return false;
    if (f !== 'route' && !routeChosen) return false; // nothing beyond drug and route until the route is chosen (MSP-1310/1580)
    return true;
  };
  let stepCut = Infinity;
  if (stepByStep) {
    const order = groups.flat().filter(isShown);
    const firstMissing = order.findIndex(f => required.includes(f) && missing.includes(f));
    if (firstMissing >= 0) stepCut = firstMissing;
  }
  const visibleOrder = groups.flat().filter(isShown).filter((_, i) => i <= stepCut);

  const times = parseAdministrationTimes(values.administrationTimes);
  const firstIdx = firstDoseTimeIndex(times, values.firstDose);
  const timesDisplay = times.length > 6
    ? <span>{times.length} times a day (see schedule)</span> // no horizontal list above 6 a day (MSP-2120)
    : times.map((t, i) => (
        <React.Fragment key={t + i}>
          {i > 0 ? '; ' : ''}
          {i === firstIdx ? <strong>{t}</strong> : t}
        </React.Fragment>
      ));

  const fieldLabel = (f: PrescriptionFieldId): string | undefined => {
    switch (f) {
      case 'dose': return 'DOSE'; // always labelled (MSP-2070, MSP-1520)
      case 'strength': return 'strength'; // MSP-2090
      case 'giveWhen': return 'give when';
      case 'administrationTimes': return 'at these times';
      case 'firstDose': return asRequired ? 'starting from' : 'first dose'; // distinct labels (MSP-2160)
      case 'duration': return 'duration';
      default: return undefined;
    }
  };

  const renderField = (f: PrescriptionFieldId) => (
    <SentenceSelect
      key={f}
      id={`${uid}-${f}`}
      inlineLabel={fieldLabel(f)}
      accessibleLabel={f === 'firstDose' && asRequired ? 'Starting from' : NAMES[f]}
      value={values[f]}
      display={f === 'administrationTimes' ? timesDisplay : undefined}
      prompt={PROMPTS[f]}
      otherPrompt={OTHER_PROMPTS[f]}
      options={options[f] ?? []}
      allowOther={allowOther.includes(f)}
      highlighted={autoChanged.includes(f)}
      onChange={v => set(f, v)}
    />
  );

  const drugLine: MedicationLineData = { ...drug };
  const promoted = optionalFields.filter(f => f.promoted);
  const regularOptional = optionalFields.filter(f => !f.promoted);
  const shownOptional = regularOptional.filter(f => added.includes(f.id));
  const notAdded = regularOptional.filter(f => !added.includes(f.id));

  const previewValues = () => {
    const details = [...promoted, ...shownOptional]
      .filter(f => values[f.id] !== undefined)
      .map(f => ({ label: f.label, value: values[f.id] === null ? NONE_LEAVE_BLANK : String(values[f.id]) }));
    return details;
  };

  const doPreview = () => {
    onPreview?.(values);
    if (builtInPreview) setPreviewOpen(true);
  };

  return (
    <section className={cx('cui-rx-form', className)} aria-labelledby={`${uid}-title`}>
      {/* Drug name stays in view (MSP-1550); status says "not yet prescribed" (study note, MSP-0040) */}
      <header className="cui-rx-form__header">
        <h3 id={`${uid}-title`} className="cui-rx-form__title">{title}</h3>
        <span className={cx('cui-rx-form__state', !complete ? 'is-incomplete' : blocked ? 'is-blocked' : 'is-complete')} role="status">
          <Icon name={!complete ? 'pencil' : blocked ? 'lock' : 'check'} size={16} />
          {!complete
            ? `Incomplete prescription: ${missing.length} required field${missing.length === 1 ? '' : 's'} to complete`
            : blocked
              ? 'Not yet prescribed: authorise on hold'
              : 'Not yet prescribed: ready to authorise'}
        </span>
      </header>
      <div className="cui-rx-form__sentence">
        <div className="cui-rx-form__group">
          <span className="cui-rx-form__drug">
            <MedicationLine {...drugLine} region={region} />
          </span>
          {groups[0].filter(f => visibleOrder.includes(f)).map(renderField)}
        </div>
        {groups.slice(1).map((g, gi) => {
          const fs = g.filter(f => visibleOrder.includes(f));
          return fs.length ? <div key={gi} className="cui-rx-form__group">{fs.map(renderField)}</div> : null;
        })}
        {routeChosen && (promoted.length || shownOptional.length || (moreOpen && notAdded.length)) ? (
          <div className="cui-rx-form__group">
            {[...promoted, ...shownOptional].map(f => (
              <SentenceSelect
                key={f.id}
                id={`${uid}-${f.id}`}
                inlineLabel={f.inlineLabel}
                accessibleLabel={f.label}
                value={values[f.id]}
                prompt={f.prompt}
                options={f.options}
                allowOther={f.allowOther}
                allowNone={f.promoted}
                optional={!f.promoted}
                onRemove={f.promoted ? undefined : () => { setAdded(a => a.filter(x => x !== f.id)); set(f.id, undefined); }}
                onChange={v => set(f.id, v)}
              />
            ))}
            {moreOpen
              ? notAdded.map(f => (
                  <button key={f.id} type="button" className="cui-rx-form__add" onClick={() => { setAdded(a => [...a, f.id]); setTimeout(() => document.getElementById(`${uid}-${f.id}`)?.click(), 0); }}>
                    <Icon name="plus" size={16} />
                    {f.addLabel}
                  </button>
                ))
              : null}
          </div>
        ) : null}
      </div>

      <div className="cui-rx-form__commands">
        {regularOptional.length ? (
          <Button
            variant="quiet"
            size="sm"
            icon={moreOpen ? 'chevron-up' : 'chevron-down'}
            aria-expanded={moreOpen}
            disabled={!routeChosen}
            onClick={() => setMoreOpen(o => !o)}
            className="cui-rx-form__more"
          >
            More options
          </Button>
        ) : null}
        <span className="cui-rx-form__spacer" />
        {/* Preview before Authorise in layout and tab order (MSP-2270); Authorise exact label (MSP-2280), bottom right (MSP-2290), disabled until complete (MSP-2310) */}
        {onCancel ? <Button variant="quiet" onClick={onCancel}>Cancel</Button> : null}
        <Button ref={previewBtn} onClick={doPreview} disabled={!routeChosen}>Preview</Button>
        <Button variant="primary" disabled={!canAuth} aria-describedby={blocked ? blockedId : undefined} onClick={() => canAuth && onAuthorise?.(values)}>Authorise</Button>
      </div>
      {blocked ? (
        <p id={blockedId} className="cui-rx-form__blocked">
          <Icon name="warning" size={16} />
          <span>{authoriseBlockedReason}</span>
        </p>
      ) : null}
      {!complete && routeChosen ? (
        <p className="cui-rx-form__missing">
          To authorise, complete: {missing.map(m => (NAMES as Record<string, string>)[m] ?? optionalFields.find(o => o.id === m)?.label ?? m).join(', ')}.
        </p>
      ) : null}

      {previewOpen && builtInPreview ? (
        <PrescriptionPreview
          region={region}
          className="cui-rx-form__preview"
          medication={{
            ...drug,
            strength: values.strength ?? undefined,
            dose: values.dose ?? undefined,
            route: values.route ?? undefined,
            frequency: values.frequency ?? undefined,
            qualifiers: values.giveWhen ? [`give when ${values.giveWhen}`] : undefined,
          }}
          administrationTimes={times}
          firstDose={values.firstDose ?? undefined}
          firstDoseLabel={asRequired ? 'starting from' : 'first dose'}
          duration={values.duration ?? undefined}
          details={previewValues()}
          canAuthorise={complete}
          authoriseBlockedReason={authoriseBlockedReason}
          onClose={() => { setPreviewOpen(false); setTimeout(() => previewBtn.current?.focus(), 0); }}
          onAuthorise={onAuthorise ? () => canAuth && onAuthorise(values) : undefined}
        />
      ) : null}
    </section>
  );
}
