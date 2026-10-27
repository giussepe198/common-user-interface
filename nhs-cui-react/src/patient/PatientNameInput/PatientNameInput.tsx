import React from 'react';
import { cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { PATIENT_NAME_LABELS_BY_REGION, PATIENT_NAME_MAX_LENGTHS_BY_REGION } from '../utils/regions/banner';
import {
  formatFamilyName,
  formatGivenName,
  formatTitle,
  PATIENT_NAME_FIELDS,
  PATIENT_NAME_LABELS,
  PATIENT_NAME_MAX_LENGTHS,
  PATIENT_NAME_PROMPTS,
  PATIENT_NAME_TOOLTIPS,
  TITLE_PRESETS,
} from '../utils/patient';
import type { PatientNameField } from '../utils/patient';

export interface PatientNameValue {
  title?: string;
  familyName: string;
  givenName: string;
  middleNames?: string;
  suffix?: string;
  /** "Known as" (preferred name). */
  preferredName?: string;
  /**
   * AU and NZ: the person has only one name, recorded in the family name field with the given name left blank
   * (METeOR 613331, HISO 10046). Given and middle names are then not required [suggested control].
   */
  singleName?: boolean;
}

export interface PatientNameInputProps {
  /**
   * Region. GB: NHS CUI labels, family name upper-cased on leaving the field (NID-0025). AU: METeOR labels; names are kept in
   * the case the person gives (upper case is a display transform only). NZ: HISO 10046 labels and lengths, case as given.
   * AU and NZ offer a "This person has only one name" option. Macrons are kept and normalised to NFC everywhere (G11 2.3).
   * Default from `ClinicalLocaleProvider`.
   */
  region?: ClinicalRegion;
  /** Controlled value. */
  value?: PatientNameValue;
  /** Uncontrolled initial value. */
  defaultValue?: PatientNameValue;
  /** Called on every change, and again on blur when Family Name is upper-cased (NID-0025) or Given Name capitalised (NID-0031). */
  onChange?: (value: PatientNameValue) => void;
  /** "inform": stacked fields, labels to the left (NID-0047, default). "inline": fields in a row, labels above, wrapping only between whole fields (NID-0049, NID-0051). */
  layout?: 'inform' | 'inline';
  /** Fields to show. Order is always Title, Family Name, Given Name, Middle name(s), Suffix, Known as (NID-0048, NID-0050). Default all six. */
  fields?: ReadonlyArray<PatientNameField>;
  /** Override labels (NID-0054 wording is Recommended; "Last Name"/"First Name" are permitted alternatives). */
  labels?: Partial<Record<PatientNameField, string>>;
  /** Override prompts (NID-0055..0059). */
  prompts?: Partial<Record<PatientNameField, string>>;
  /** Override tooltips (NID-0060, NID-0061). */
  tooltips?: Partial<Record<PatientNameField, string>>;
  /** Title presets in order; "Other..." switches to free text (NID-0016, NID-0017). */
  titleOptions?: ReadonlyArray<string>;
  /** Override maximum lengths. GB defaults: Title 35, Family Name 40 (see README), Given Name 35, Middle name(s) 100, Suffix 35, Known as 35. AU 40 per name [UNCERTAIN]; NZ per HISO 10046. */
  maxLengths?: Partial<Record<PatientNameField, number>>;
  /** Fields that must be completed. Default Family Name and Given Name (minimum data set, section 2.2.10). The given name is not required for a single-name person (AU, NZ). */
  required?: ReadonlyArray<PatientNameField>;
  /** Error messages from the consumer, per field. Shown in place of built-in messages. */
  errors?: Partial<Record<PatientNameField, string>>;
  disabled?: boolean;
  /** Base id; each field gets `${id}-${field}`. */
  id?: string;
  className?: string;
}

/** Prompts for AU and NZ with fictional examples; macrons shown so users know they are accepted [suggested]. */
const REGIONAL_PROMPTS: Record<'AU' | 'NZ', Record<PatientNameField, string>> = {
  AU: { title: 'e.g. Ms', familyName: "e.g. O'Brien", givenName: 'e.g. Mia', middleNames: 'e.g. Rose', suffix: 'e.g. Jnr', preferredName: 'e.g. Mimi' },
  NZ: { title: 'e.g. Ms', familyName: 'e.g. Te Huia', givenName: 'e.g. Kāhu', middleNames: 'e.g. Mere Ana', suffix: 'e.g. ONZM', preferredName: 'e.g. Mere' },
};

const EMPTY: PatientNameValue = { title: '', familyName: '', givenName: '', middleNames: '', suffix: '', preferredName: '' };
const OTHER = 'Other...';

/** Field widths in characters: Title 4 minimum, others default 14 (NID-0015, NID-0022..0045). */
const WIDTH: Record<PatientNameField, number> = {
  title: 14,
  familyName: 14,
  givenName: 14,
  middleNames: 14,
  suffix: 14,
  preferredName: 14,
};

/** Patient name entry: up to six labelled fields in a fixed order, with prompts and tooltips (NID-0014..0064). */
export function PatientNameInput({
  region: regionProp,
  value,
  defaultValue = EMPTY,
  onChange,
  layout = 'inform',
  fields = PATIENT_NAME_FIELDS,
  labels,
  prompts,
  tooltips,
  titleOptions = TITLE_PRESETS,
  maxLengths,
  required = ['familyName', 'givenName'],
  errors,
  disabled,
  id: idProp,
  className,
}: PatientNameInputProps) {
  const { region } = useClinicalLocale(regionProp);
  const base = useId('cui-name', idProp);
  const [name, setName] = useControllableState<PatientNameValue>(value, defaultValue, onChange);
  const [touched, setTouched] = React.useState<Partial<Record<PatientNameField, boolean>>>({});
  const presets = titleOptions.filter((t) => t !== OTHER);
  const titleValue = name.title ?? '';
  const [otherTitle, setOtherTitle] = React.useState(titleValue !== '' && !presets.includes(titleValue));
  const otherRef = React.useRef<HTMLInputElement>(null);
  const focusOther = React.useRef(false);
  React.useEffect(() => {
    if (focusOther.current && otherRef.current) {
      otherRef.current.focus();
      focusOther.current = false;
    }
  });

  const shown = PATIENT_NAME_FIELDS.filter((f) => fields.includes(f));
  const label = (f: PatientNameField) => labels?.[f] ?? (region === 'GB' ? PATIENT_NAME_LABELS[f] : PATIENT_NAME_LABELS_BY_REGION[region][f]);
  const prompt = (f: PatientNameField) => prompts?.[f] ?? (region === 'GB' ? PATIENT_NAME_PROMPTS[f] : REGIONAL_PROMPTS[region][f]);
  const tip = (f: PatientNameField) => tooltips?.[f] ?? PATIENT_NAME_TOOLTIPS[f];
  const max = (f: PatientNameField) => maxLengths?.[f] ?? (region === 'GB' ? PATIENT_NAME_MAX_LENGTHS[f] : PATIENT_NAME_MAX_LENGTHS_BY_REGION[region][f]);
  const single = region !== 'GB' && !!name.singleName;
  const isRequired = (f: PatientNameField) => required.includes(f) && !(single && (f === 'givenName' || f === 'middleNames'));
  const update = (patch: Partial<PatientNameValue>) => setName({ ...name, ...patch });
  const errorFor = (f: PatientNameField): string | undefined => {
    if (errors?.[f]) return errors[f];
    const v = (name[f] ?? '').trim();
    if (touched[f] && isRequired(f) && !v) return `Enter the ${label(f).toLowerCase().replace('(s)', 's')}`;
    return undefined;
  };

  const blurFormat = (f: PatientNameField, v: string) => {
    setTouched((t) => ({ ...t, [f]: true }));
    let next = v;
    if (region === 'GB') {
      if (f === 'familyName') next = formatFamilyName(v);
      else if (f === 'givenName') next = formatGivenName(v);
      else if (f === 'title') next = formatTitle(v);
      else next = v.replace(/\s+/g, ' ').trim();
    } else if (f === 'familyName' || f === 'givenName' || f === 'middleNames' || f === 'preferredName') {
      // Kept as the person gives it; hyphens without spaces (METeOR 613331); NFC so macrons are precomposed (G11 2.3).
      next = formatFamilyName(v, 'as-recorded');
    } else if (f === 'title') next = formatTitle(v);
    else next = v.normalize('NFC').replace(/\s+/g, ' ').trim();
    if (next !== v) update({ [f]: next });
  };

  const renderControl = (f: PatientNameField, fieldId: string, describedBy: string | undefined, err: string | undefined) => {
    const common = {
      disabled,
      'aria-describedby': describedBy,
      'aria-invalid': err ? true : undefined,
      'aria-required': isRequired(f) || undefined,
    } as const;
    if (f === 'title') {
      return (
        <span className="cui-name-input__title">
          <select
            {...common}
            id={fieldId}
            className="cui-name-input__select"
            title={tip(f)}
            value={otherTitle ? OTHER : titleValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === OTHER) {
                setOtherTitle(true);
                focusOther.current = true;
                update({ title: '' });
              } else {
                setOtherTitle(false);
                update({ title: v });
              }
            }}
          >
            <option value="" />
            {presets.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value={OTHER}>{OTHER}</option>
          </select>
          {otherTitle ? (
            <input
              ref={otherRef}
              {...common}
              id={`${fieldId}-other`}
              aria-labelledby={`${fieldId}-label ${fieldId}-other-label`}
              className="cui-name-input__box"
              style={{ width: `${WIDTH.title}ch` }}
              type="text"
              maxLength={max('title')}
              placeholder={prompt('title')}
              title={tip('title')}
              value={titleValue}
              onChange={(e) => update({ title: e.target.value })}
              onBlur={(e) => blurFormat('title', e.target.value)}
            />
          ) : null}
          <span id={`${fieldId}-other-label`} className="cui-visually-hidden">
            other
          </span>
        </span>
      );
    }
    return (
      <input
        {...common}
        id={fieldId}
        className={cx('cui-name-input__box', f === 'familyName' && 'cui-name-input__box--family')}
        style={{ width: `${WIDTH[f]}ch` }}
        type="text"
        autoComplete="off"
        spellCheck={false}
        maxLength={max(f)}
        placeholder={prompt(f)}
        title={tip(f)}
        value={single && (f === 'givenName' || f === 'middleNames') ? '' : name[f] ?? ''}
        disabled={disabled || (single && (f === 'givenName' || f === 'middleNames'))}
        onChange={(e) => update({ [f]: e.target.value })}
        onBlur={(e) => blurFormat(f, e.target.value)}
      />
    );
  };

  return (
    <div className={cx('cui-name-input', `cui-name-input--${layout}`, className)}>
      {shown.map((f) => {
        const fieldId = `${base}-${f}`;
        const err = errorFor(f);
        const errId = `${fieldId}-error`;
        return (
          <div key={f} className={cx('cui-name-input__field', err && 'cui-name-input__field--error')}>
            <label id={`${fieldId}-label`} className="cui-name-input__label" htmlFor={fieldId}>
              {label(f)}
              {isRequired(f) ? <span className="cui-name-input__required"> (required)</span> : null}
            </label>
            <div className="cui-name-input__control">
              {renderControl(f, fieldId, err ? errId : undefined, err)}
              {err ? (
                <div id={errId} className="cui-name-input__error" role="alert">
                  <Icon name="error" size={16} />
                  <span>{err}</span>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
      {region !== 'GB' && shown.includes('givenName') ? (
        <div className="cui-name-input__single">
          <input
            type="checkbox"
            id={`${base}-single`}
            checked={single}
            disabled={disabled}
            onChange={(e) =>
              update(e.target.checked ? { singleName: true, givenName: '', middleNames: '' } : { singleName: false })
            }
          />
          <label htmlFor={`${base}-single`}>This person has only one name (enter it as the family name)</label>
        </div>
      ) : null}
    </div>
  );
}
