import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { MedicationLine } from '../MedicationLine/MedicationLine';
import type { PrescriptionOption} from '../PrescriptionForm/SentenceSelect';
import { NONE_LEAVE_BLANK, SentenceSelect } from '../PrescriptionForm/SentenceSelect';
import type { PrescriptionOptionalField } from '../PrescriptionForm/PrescriptionForm';
import { PrescriptionPreview } from '../PrescriptionPreview/PrescriptionPreview';
import { TemplateReopenControl } from '../TemplateReopenControl/TemplateReopenControl';
import type { MedicationLineData } from '../utils/medicationLine';
import type { PrescriptionFieldRelation,
  PrescriptionValues} from '../utils/prescription';
import {
  canAuthorise as canAuthoriseFn, firstDoseTimeIndex, missingPrescriptionFields, parseAdministrationTimes, resolvePrescriptionConflicts,
} from '../utils/prescription';

/** Fields of the detailed form, always in this order (MSP-1530). */
export type PrescriptionDetailFieldId =
  | 'route' | 'strength' | 'form' | 'device' | 'dose' | 'frequency' | 'giveWhen' | 'administrationTimes' | 'firstDose' | 'duration';

/** A strength choice with the doses valid for it (MSP-1970). */
export interface PrescriptionStrengthOption extends PrescriptionOption {
  /** Dose values valid with this strength. Doses not listed go in a "For other doses" section (MSP-1980). */
  doses?: string[];
}

/** An optional field, revealed in place by an "Add ..." control (MSP-1760), on one of the two tabs. */
export interface PrescriptionDetailOptionalField extends PrescriptionOptionalField {
  /** Tab the field belongs to. Default "drug". */
  tab?: 'drug' | 'schedule';
}

export type PrescriptionDetailTab = 'drug' | 'schedule';

export interface PrescriptionDetailFormProps {
  /** The selected drug, kept in view at the top with the route (MSP-1550, MSP-1640, MSP-1680). */
  drug: Pick<MedicationLineData, 'genericName' | 'brandName' | 'brandDescriptor' | 'ingredients'>;
  /** Values (controlled). null = "None (leave blank)". */
  values?: PrescriptionValues;
  defaultValues?: PrescriptionValues;
  /** Called after every change with the values, the field changed and any fields cleared because they conflicted (MSP-1990). */
  onChange?: (values: PrescriptionValues, changedField: string, cleared: string[]) => void;
  /** Option lists relevant to the drug and route (MSP-0890, MSP-1970). Omit a list to leave that field out. */
  options: Partial<Record<Exclude<PrescriptionDetailFieldId, 'strength'>, PrescriptionOption[]>> & { strength?: PrescriptionStrengthOption[] };
  /** Fields that also offer "other..." for free entry (MSP-1900). */
  allowOther?: PrescriptionDetailFieldId[];
  /** Required fields. Default: route, dose, frequency, administration times, first dose, duration (give when for "as required"). */
  requiredFields?: string[];
  /** Optional fields (MSP-1630); `promoted` ones are shown and required with "None (leave blank)" (MSP-1720/1730). */
  optionalFields?: PrescriptionDetailOptionalField[];
  /**
   * Further inter-related fields. Strength and dose are related automatically: with `doses` on strength options
   * only conflicting values are cleared (MSP-1990); without, changing either clears the other (MSP-2010).
   */
  relations?: PrescriptionFieldRelation[];
  /** Pre-fill dependent fields after a change (MSP-2040/2060); changed fields are highlighted (MSP-2050). */
  getPrefill?: (changedField: string, values: PrescriptionValues) => PrescriptionValues;
  /** Visible tab (controlled). Default "drug". */
  tab?: PrescriptionDetailTab;
  defaultTab?: PrescriptionDetailTab;
  onTabChange?: (tab: PrescriptionDetailTab) => void;
  /** Fields filled by the applied template (MSP-1250). With `onOpenTemplates`, shows the Template Prescriptions control (MSP-1260). */
  templateFieldIds?: string[];
  /** Reopen the template list (MSP-1260/1270). */
  onOpenTemplates?: () => void;
  /** Name of the applied template, shown on the control [suggested]. */
  appliedTemplate?: string;
  /** "Edit drug name and route" from the combined drug and route control (MSP-1650). */
  onEditDrugAndRoute?: () => void;
  /** "Go Back" to the required-fields view, keeping every value (MSP-1360, MSP-1410). */
  onGoBack?: () => void;
  /** Authorise; only possible when complete and previewed after the last change (MSP-2220, MSP-2310). */
  onAuthorise?: (values: PrescriptionValues) => void;
  /**
   * Hold Authorise with a reason, e.g. "Answer the High Priority interaction alert before authorising". While set,
   * Authorise is disabled, the reason is shown beside the commands and referenced by the button's aria-describedby, and
   * the status never says "ready to authorise" [suggested].
   */
  authoriseBlockedReason?: string;
  onPreview?: (values: PrescriptionValues) => void;
  onCancel?: () => void;
  /** Show the built-in PrescriptionPreview. Default true. */
  builtInPreview?: boolean;
  /** Heading. Default "Full prescription form". */
  title?: string;
  /** Jurisdiction for the drug line and preview; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  className?: string;
}

const PROMPTS: Record<PrescriptionDetailFieldId, string> = {
  route: 'Select a route', strength: 'Select a strength', form: 'Select a form', device: 'Select a device', dose: 'Select a dose',
  frequency: 'Select a frequency', giveWhen: 'Select when to give', administrationTimes: 'Select administration times',
  firstDose: 'Select the first dose', duration: 'Select a duration',
};
const OTHER_PROMPTS: Partial<Record<PrescriptionDetailFieldId, string>> = {
  dose: 'Enter a dose', strength: 'Enter a strength', frequency: 'Enter a frequency', duration: 'Enter a duration', route: 'Enter a route',
  giveWhen: 'Enter a description of when this medication should be given', device: 'Enter a device', form: 'Enter a form',
};
const NAMES: Record<PrescriptionDetailFieldId, string> = {
  route: 'Route', strength: 'Strength', form: 'Form', device: 'Device', dose: 'Dose', frequency: 'Frequency', giveWhen: 'Give when',
  administrationTimes: 'Administration Times', firstDose: 'First Dose', duration: 'Duration',
};
const TAB_FIELDS: Record<PrescriptionDetailTab, PrescriptionDetailFieldId[]> = {
  drug: ['strength', 'form', 'device', 'dose', 'frequency', 'giveWhen'],
  schedule: ['administrationTimes', 'firstDose', 'duration'],
};

const isAsRequired = (f: string | null | undefined) => !!f && /as required|when required/i.test(f);

/**
 * Detailed (full) prescription form with tabs (Search and Prescribe 8.3, MSP-1530 to MSP-1810; 9.3,
 * MSP-1960 to MSP-2170): drug name and route combined at the top and always in view; nothing else until
 * the route is chosen; "Drug Details" and "Administration Schedule" tabs; labels on the left; strength and
 * dose never side by side; a conflicting strength or dose is cleared and must be selected again; fields
 * changed automatically are highlighted; Preview is required before Authorise because the details span tabs.
 */
export function PrescriptionDetailForm({
  drug, values: valuesProp, defaultValues = {}, onChange, options, allowOther = [], requiredFields, optionalFields = [], relations = [],
  getPrefill, tab: tabProp, defaultTab = 'drug', onTabChange, templateFieldIds = [], onOpenTemplates, appliedTemplate, onEditDrugAndRoute,
  onGoBack, onAuthorise, authoriseBlockedReason, onPreview, onCancel, builtInPreview = true, title = 'Full prescription form', region: regionProp, className,
}: PrescriptionDetailFormProps) {
  const uid = useId('cui-rx-detail');
  const { region } = useClinicalLocale(regionProp);
  const [values, setValues] = useControllableState<PrescriptionValues>(valuesProp, defaultValues, undefined);
  const [tab, setTab] = useControllableState<PrescriptionDetailTab>(tabProp, defaultTab, onTabChange);
  const [autoChanged, setAutoChanged] = React.useState<string[]>([]);
  const [cleared, setCleared] = React.useState<string[]>([]);
  const [announce, setAnnounce] = React.useState('');
  const [added, setAdded] = React.useState<string[]>(() => optionalFields.filter(f => defaultValues[f.id] !== undefined).map(f => f.id));
  const [templateHighlight, setTemplateHighlight] = React.useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewedVersion, setPreviewedVersion] = React.useState<number | null>(null);
  const [version, setVersion] = React.useState(0);
  const previewBtn = React.useRef<HTMLButtonElement>(null);
  const tabRefs = React.useRef<Record<PrescriptionDetailTab, HTMLButtonElement | null>>({ drug: null, schedule: null });

  const asRequired = isAsRequired(values.frequency);
  const routeChosen = !!values.route;
  const required = React.useMemo(() => {
    const base = requiredFields ?? ['route', 'dose', 'frequency', 'administrationTimes', 'firstDose', 'duration'];
    const extra = asRequired && options.giveWhen ? ['giveWhen'] : [];
    const promoted = optionalFields.filter(f => f.promoted).map(f => f.id);
    const list = [...base, ...extra, ...promoted].filter(f => !(asRequired && f === 'administrationTimes'));
    return Array.from(new Set(list));
  }, [requiredFields, asRequired, options.giveWhen, optionalFields]);
  const missing = missingPrescriptionFields(required, values);
  const complete = canAuthoriseFn(required, values);
  const blocked = !!authoriseBlockedReason;
  const blockedId = `${uid}-blocked`;
  // Details span two tabs, so a preview of the current values is required before Authorise (MSP-2220).
  const previewed = previewedVersion === version;

  // Strength and dose are always inter-related (MSP-1960 to MSP-2010).
  const strengthOpts = options.strength ?? [];
  const hasDoseData = strengthOpts.some(o => o.doses);
  const doseValidFor = (strength: string | null | undefined, dose: string | null | undefined) => {
    const opt = strengthOpts.find(o => o.value === strength);
    return !opt?.doses || !dose || opt.doses.includes(dose);
  };
  const allRelations: PrescriptionFieldRelation[] = [
    { fields: ['strength', 'dose'], isValid: hasDoseData ? v => doseValidFor(v.strength, v.dose) : undefined },
    ...relations,
  ];

  const set = (field: string, v: string | null | undefined) => {
    if (values[field] === v) return;
    let next: PrescriptionValues = { ...values, [field]: v };
    if (field === 'frequency' && !isAsRequired(v) && next.giveWhen !== undefined) next = { ...next, giveWhen: undefined }; // MSP-1860
    const res = resolvePrescriptionConflicts(field, next, allRelations);
    next = res.values;
    let auto = autoChanged.filter(f => f !== field && !res.cleared.includes(f));
    if (getPrefill) {
      const pre = getPrefill(field, next);
      const changed = Object.keys(pre).filter(k => k !== field && pre[k] !== next[k]);
      next = { ...next, ...pre };
      auto = Array.from(new Set([...auto, ...changed]));
    }
    setAutoChanged(auto);
    setCleared(c => [...c.filter(f => f !== field), ...res.cleared]);
    setAnnounce(res.cleared.length
      ? `${res.cleared.map(f => (NAMES as Record<string, string>)[f] ?? f).join(' and ')} cleared because it did not match the ${(NAMES as Record<string, string>)[field] ?? field}. Select it again.`
      : '');
    setValues(next);
    setVersion(n => n + 1);
    onChange?.(next, field, res.cleared);
  };

  const fieldShown = (f: PrescriptionDetailFieldId) => {
    if (f === 'route') return true;
    if (!options[f]) return false;
    if (f === 'giveWhen') return asRequired;
    if (f === 'administrationTimes' && asRequired) return false;
    return true;
  };

  const times = parseAdministrationTimes(values.administrationTimes);
  const firstIdx = firstDoseTimeIndex(times, values.firstDose);
  const timesDisplay = times.length > 6
    ? <span>{times.length} times a day</span> // no horizontal list above 6 a day (MSP-2120)
    : times.map((t, i) => (
        <React.Fragment key={t + i}>
          {i > 0 ? '; ' : ''}
          {i === firstIdx ? <strong>{t}</strong> : t}
        </React.Fragment>
      ));

  const optionSplit = (f: PrescriptionDetailFieldId): { main: PrescriptionOption[]; extra?: Array<{ label: string; options: PrescriptionOption[] }> } => {
    const list = (options[f] ?? []) as PrescriptionOption[];
    if (f === 'dose' && hasDoseData && values.strength) {
      const valid = list.filter(o => doseValidFor(values.strength, o.value));
      const other = list.filter(o => !doseValidFor(values.strength, o.value));
      return { main: valid, extra: [{ label: 'For other strengths', options: other }] };
    }
    if (f === 'strength' && hasDoseData && values.dose) {
      // Strengths that do not fit the chosen dose are in a separate section; choosing one clears the dose (MSP-1980/1990).
      const valid = strengthOpts.filter(o => doseValidFor(o.value, values.dose));
      const other = strengthOpts.filter(o => !doseValidFor(o.value, values.dose));
      return { main: valid, extra: [{ label: 'For other doses', options: other }] };
    }
    return { main: list };
  };

  const inlineLabel = (f: PrescriptionDetailFieldId) => (f === 'dose' ? 'DOSE' : undefined); // dose always labelled (MSP-2070)
  const fieldLabelText = (f: PrescriptionDetailFieldId) => (f === 'firstDose' && asRequired ? 'Starting From' : NAMES[f]); // MSP-2160

  const renderField = (f: PrescriptionDetailFieldId) => {
    const split = optionSplit(f);
    const label = fieldLabelText(f);
    const isCleared = cleared.includes(f) && !values[f];
    return (
      <div key={f} className={cx('cui-rx-detail__row', templateHighlight.includes(f) && 'cui-template-defined')}>
        <label className="cui-rx-detail__label" htmlFor={`${uid}-${f}`}>{label}</label>
        <div className="cui-rx-detail__field">
          <SentenceSelect
            id={`${uid}-${f}`}
            inlineLabel={inlineLabel(f)}
            accessibleLabel={label}
            value={values[f]}
            display={f === 'administrationTimes' ? timesDisplay : undefined}
            prompt={PROMPTS[f]}
            otherPrompt={OTHER_PROMPTS[f]}
            options={split.main}
            extraSections={split.extra}
            allowOther={allowOther.includes(f)}
            highlighted={autoChanged.includes(f) || isCleared}
            onChange={v => set(f, v)}
          />
          {isCleared ? <span className="cui-rx-detail__cleared"><Icon name="warning" size={16} />Cleared: select again</span> : null}
        </div>
      </div>
    );
  };

  const optionalFor = (t: PrescriptionDetailTab) => optionalFields.filter(o => (o.tab ?? 'drug') === t);
  const renderOptional = (t: PrescriptionDetailTab) => {
    const list = optionalFor(t);
    if (!list.length) return null;
    return (
      <div className="cui-rx-detail__section">
        <h4 className="cui-rx-detail__section-title">{t === 'drug' ? 'Other Details' : 'Other Schedule Details'}</h4>
        {list.map(o => {
          const shown = o.promoted || added.includes(o.id);
          if (!shown) {
            // The control sits where the field will appear, grey with "+" (MSP-1760, MSP-1790).
            return (
              <div key={o.id} className="cui-rx-detail__row">
                <span className="cui-rx-detail__label" aria-hidden="true" />
                <div className="cui-rx-detail__field">
                  <button type="button" className="cui-rx-form__add" onClick={() => { setAdded(a => [...a, o.id]); setTimeout(() => document.getElementById(`${uid}-${o.id}`)?.click(), 0); }}>
                    <Icon name="plus" size={16} />
                    {o.addLabel}
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div key={o.id} className="cui-rx-detail__row">
              <label className="cui-rx-detail__label" htmlFor={`${uid}-${o.id}`}>{o.label}</label>
              <div className="cui-rx-detail__field">
                <SentenceSelect
                  id={`${uid}-${o.id}`}
                  inlineLabel={o.inlineLabel}
                  accessibleLabel={o.label}
                  value={values[o.id]}
                  prompt={o.prompt}
                  options={o.options}
                  allowOther={o.allowOther}
                  allowNone={o.promoted}
                  optional={!o.promoted}
                  onRemove={o.promoted ? undefined : () => { setAdded(a => a.filter(x => x !== o.id)); set(o.id, undefined); }}
                  onChange={v => set(o.id, v)}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const missingOn = (t: PrescriptionDetailTab) => missing.filter(m => (TAB_FIELDS[t] as string[]).includes(m) || optionalFor(t).some(o => o.id === m)).length;
  const tabs: Array<{ id: PrescriptionDetailTab; label: string }> = [
    { id: 'drug', label: 'Drug Details' },
    { id: 'schedule', label: 'Administration Schedule' },
  ];
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setTab(tabs[n].id);
    tabRefs.current[tabs[n].id]?.focus();
  };

  const section = (titleText: string, fields: PrescriptionDetailFieldId[], extra?: React.ReactNode) => {
    const shown = fields.filter(fieldShown);
    if (!shown.length) return null;
    return (
      <div className="cui-rx-detail__section">
        <div className="cui-rx-detail__section-head">
          <h4 className="cui-rx-detail__section-title">{titleText}</h4>
          {extra}
        </div>
        {shown.map(renderField)}
      </div>
    );
  };

  const templateControl = onOpenTemplates ? (
    <TemplateReopenControl
      definedFieldIds={templateFieldIds}
      fieldNames={NAMES}
      appliedTemplate={appliedTemplate}
      onOpen={onOpenTemplates}
      onHighlightChange={setTemplateHighlight}
    />
  ) : null;

  const doPreview = () => {
    onPreview?.(values);
    setPreviewedVersion(version);
    if (builtInPreview) setPreviewOpen(true);
  };

  const drugLine: MedicationLineData = { ...drug, route: values.route ?? undefined };
  const details = optionalFields
    .filter(f => values[f.id] !== undefined)
    .map(f => ({ label: f.label, value: values[f.id] === null ? NONE_LEAVE_BLANK : String(values[f.id]) }));
  if (values.device) details.unshift({ label: 'Device', value: String(values.device) });

  return (
    <section className={cx('cui-rx-form', 'cui-rx-detail', className)} aria-labelledby={`${uid}-title`}>
      {/* Drug name and route stay in view while the form scrolls (MSP-1550, MSP-1680) */}
      <header className="cui-rx-form__header cui-rx-detail__header">
        <div className="cui-rx-detail__titles">
          <h3 id={`${uid}-title`} className="cui-rx-form__title">{title}</h3>
          <span className={cx('cui-rx-form__state', !complete ? 'is-incomplete' : blocked ? 'is-blocked' : 'is-complete')} role="status">
            <Icon name={!complete ? 'pencil' : blocked ? 'lock' : 'check'} size={16} />
            {!complete
              ? `Incomplete prescription: ${missing.length} required field${missing.length === 1 ? '' : 's'} to complete`
              : blocked
                ? 'Not yet prescribed: authorise on hold'
                : 'Not yet prescribed: preview, then authorise'}
          </span>
        </div>
        <div className="cui-rx-detail__drug-row">
          <span className="cui-rx-detail__label">Drug Name and Route</span>
          {routeChosen ? (
            // Drug name and route in one control (MSP-1640); selecting it offers editing (MSP-1650).
            <button type="button" className="cui-rx-detail__drug" onClick={onEditDrugAndRoute} disabled={!onEditDrugAndRoute} aria-describedby={`${uid}-edit`}>
              <MedicationLine {...drugLine} region={region} />
              {onEditDrugAndRoute ? <span id={`${uid}-edit`} className="cui-rx-detail__edit"><Icon name="pencil" size={16} />Edit drug name and route</span> : null}
            </button>
          ) : (
            <span className="cui-rx-detail__drug-pending">
              <span className="cui-rx-form__drug"><MedicationLine {...drug} region={region} /></span>
              {renderRouteOnly()}
            </span>
          )}
        </div>
      </header>

      {routeChosen ? (
        <>
          <div role="tablist" aria-label="Prescription details" className="cui-rx-detail__tabs">
            {tabs.map((t, i) => {
              const n = missingOn(t.id);
              return (
                <button
                  key={t.id}
                  ref={el => { tabRefs.current[t.id] = el; }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${t.id}`}
                  aria-selected={tab === t.id}
                  aria-controls={`${uid}-panel-${t.id}`}
                  tabIndex={tab === t.id ? 0 : -1}
                  className={cx('cui-rx-detail__tab', tab === t.id && 'is-selected')}
                  onClick={() => setTab(t.id)}
                  onKeyDown={e => onTabKey(e, i)}
                >
                  {t.label}
                  {n ? <span className="cui-rx-detail__tab-count">{n} to complete</span> : null}
                </button>
              );
            })}
          </div>
          <div role="tabpanel" id={`${uid}-panel-${tab}`} aria-labelledby={`${uid}-tab-${tab}`} className="cui-rx-detail__panel">
            {tab === 'drug' ? (
              <>
                {section('Strength, Form and Device', ['strength', 'form', 'device'])}
                {section('How Much and When', ['dose', 'frequency', 'giveWhen'], templateControl)}
                {renderOptional('drug')}
              </>
            ) : (
              <>
                {section('Administration', ['administrationTimes', 'firstDose'], templateControl)}
                {section('Course Duration', ['duration'])}
                {renderOptional('schedule')}
              </>
            )}
          </div>
        </>
      ) : null}
      <div className="cui-visually-hidden" aria-live="polite">{announce}</div>

      <div className="cui-rx-form__commands">
        {onGoBack ? <Button variant="quiet" icon="chevron-left" onClick={onGoBack}>Go Back</Button> : null}
        <span className="cui-rx-form__spacer" />
        {onCancel ? <Button variant="quiet" onClick={onCancel}>Cancel</Button> : null}
        <Button ref={previewBtn} onClick={doPreview} disabled={!routeChosen}>Preview</Button>
        <Button
          variant="primary"
          disabled={!complete || !previewed || blocked}
          aria-describedby={blocked ? blockedId : undefined}
          onClick={() => complete && previewed && !blocked && onAuthorise?.(values)}
        >
          Authorise
        </Button>
      </div>
      {blocked ? (
        <p id={blockedId} className="cui-rx-form__blocked">
          <Icon name="warning" size={16} />
          <span>{authoriseBlockedReason}</span>
        </p>
      ) : null}
      {routeChosen && (!complete || !previewed) ? (
        <p className="cui-rx-form__missing">
          {!complete
            ? `To authorise, complete: ${missing.map(m => (NAMES as Record<string, string>)[m] ?? optionalFields.find(o => o.id === m)?.label ?? m).join(', ')}.`
            : 'Preview the prescription before authorising.'}
        </p>
      ) : null}

      {previewOpen && builtInPreview ? (
        <PrescriptionPreview
          region={region}
          className="cui-rx-form__preview"
          medication={{
            ...drug,
            strength: values.strength ?? undefined,
            form: values.form ?? undefined,
            dose: values.dose ?? undefined,
            route: values.route ?? undefined,
            frequency: values.frequency ?? undefined,
            qualifiers: values.giveWhen ? [`give when ${values.giveWhen}`] : undefined,
          }}
          administrationTimes={times}
          firstDose={values.firstDose ?? undefined}
          firstDoseLabel={asRequired ? 'starting from' : 'first dose'}
          duration={values.duration ?? undefined}
          details={details}
          canAuthorise={complete}
          authoriseBlockedReason={authoriseBlockedReason}
          onClose={() => { setPreviewOpen(false); setTimeout(() => previewBtn.current?.focus(), 0); }}
          onAuthorise={onAuthorise ? () => complete && !blocked && onAuthorise(values) : undefined}
        />
      ) : null}
    </section>
  );

  function renderRouteOnly() {
    // Only drug and route until the route is chosen: no other fields, not even disabled ones (MSP-1580).
    return (
      <SentenceSelect
        id={`${uid}-route`}
        accessibleLabel="Route"
        value={values.route}
        prompt={PROMPTS.route}
        otherPrompt={OTHER_PROMPTS.route}
        options={options.route ?? []}
        allowOther={allowOther.includes('route')}
        onChange={v => set('route', v)}
      />
    );
  }
}
