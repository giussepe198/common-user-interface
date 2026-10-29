import React from 'react';
import { cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { CURRENT_GENDER_DEFINITIONS, CURRENT_GENDER_VALUES, SEX_DEFINITIONS, SEX_VALUES } from '../utils/patient';
import { DefinitionTip } from '../LabelledValue/DefinitionTip';
import {
  AU_SEX_GENDER_QUESTIONS,
  GENDER_DETAIL_MAX_LENGTH,
  NZ_SEX_GENDER_QUESTIONS,
} from '../utils/regions/demographics';
import type { PatientCodedValue } from '../utils/regions/demographics';
import { REGIONAL_SEX_GENDER } from '../GenderDisplay/GenderDisplay';

export interface SexGenderInputProps extends SexGenderInputBaseProps {
  /**
   * "currentGender": GB Current Gender (CGS-0001..0008, CGS-0020..0022, CGS-0025..0027); AU gender (ABS 2020, METeOR 741842);
   * NZ gender (HISO 10046, Stats NZ). "sex": GB Sex (CGS-0009..0016, CGS-0023/0024, CGS-0028..0030); AU sex recorded at birth
   * (METeOR 741686); NZ sex at birth (Stats NZ 2021). Default "currentGender".
   */
  kind?: 'currentGender' | 'sex';
  /**
   * Controlled value; null means not yet chosen. GB: the full-text value ("Male", "Not Known" ...). AU: METeOR code
   * ("1".."5"; 9 is administrative and never offered). NZ: gender code F, M, O, U, or sex at birth code 1, 2 (3 if enabled).
   */
  value?: string | null;
  /** Uncontrolled initial value. GB Current Gender defaults to "Not Known" (CGS-0008); GB Sex, AU and NZ start with nothing selected (CGS-0013). */
  defaultValue?: string | null;
  /** Called when the user picks a value. There is no way back to "nothing chosen" (CGS-0028). */
  onChange?(value: string): void;
}

export interface SexGenderInputBaseProps {
  /** "radio" option buttons (preferred, safest) or "select" drop-down to save space. Default "radio". */
  variant?: 'radio' | 'select';
  /** Radio layout. "horizontal" fills top-to-bottom then left-to-right (CGS-0021). Default "vertical". */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Label. GB: must not be confusable with the other concept; default "Current Gender" (CGS-0001) or "Sex" (CGS-0009).
   * AU and NZ: default the standard question, e.g. "How do you describe your gender?" (ABS 2020) or "What is your gender?" (Stats NZ).
   */
  label?: string;
  /** Show the short definition on the label and per-value definitions (CGS-0004, CGS-0015, CGS-0017..0019). GB only. Default true. */
  showDefinitions?: boolean;
  /** Region. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** NZ: show te reo Māori labels with the options (HISO 10046, Stats NZ). Default from the provider's `teReoLabels`. */
  teReoLabels?: boolean;
  /** AU and NZ: controlled "please specify" text (ABS 2020 write-in; HISO 10046 gender detail, required for O, max 150). */
  detail?: string;
  /** Uncontrolled initial "please specify" text. */
  defaultDetail?: string;
  /** Called when the "please specify" text changes. */
  onDetailChange?: (detail: string) => void;
  /** AU and NZ: why the question is asked (Stats NZ: explain the purpose; collect sex at birth only with a purpose) [suggested]. */
  purpose?: string;
  /** NZ sex at birth: offer code 3 "Another term" for collections that need it, such as perinatal data (Stats NZ). Default false. */
  includeAnotherTerm?: boolean;
  /** Form field name. */
  name?: string;
  id?: string;
  disabled?: boolean;
  /** Error message from the consumer (for example "Select the patient's sex"). */
  error?: string;
  className?: string;
}

/**
 * Current Gender or Sex input with the exact valid values, in the mandated order, never abbreviated
 * or coded. Current Gender defaults to "Not Known"; Sex starts with nothing selected.
 */
export function SexGenderInput(props: SexGenderInputProps) {
  const { region } = useClinicalLocale(props.region);
  if (region !== 'GB') return <RegionalSexGenderInput {...props} region={region} />;
  return <GbSexGenderInput {...props} />;
}

function GbSexGenderInput(props: SexGenderInputProps) {
  const {
    kind = 'currentGender',
    variant = 'radio',
    orientation = 'vertical',
    label,
    showDefinitions = true,
    name,
    id: idProp,
    disabled,
    error,
    className,
  } = props;
  const isSex = kind === 'sex';
  const defs = isSex ? SEX_DEFINITIONS : CURRENT_GENDER_DEFINITIONS;
  const options: ReadonlyArray<string> = isSex ? SEX_VALUES : CURRENT_GENDER_VALUES;
  const id = useId(isSex ? 'cui-sex' : 'cui-gender', idProp);
  const fieldName = name ?? id;
  const initial = props.defaultValue !== undefined ? props.defaultValue : isSex ? null : 'Not Known';
  const [value, setValue] = useControllableState<string | null>(
    props.value,
    initial,
    props.onChange ? (v: string | null) => v != null && props.onChange?.(v) : undefined,
  );
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const labelText = label ?? defs.label;
  const errId = `${id}-error`;
  const aboutId = `${id}-about`;
  const valueDefs = defs.values as Record<string, string>;

  const labelNode = showDefinitions ? <DefinitionTip definition={defs.short}>{labelText}</DefinitionTip> : labelText;

  const about = showDefinitions ? (
    <div className="cui-sex-gender__about">
      <button
        type="button"
        className="cui-sex-gender__about-toggle"
        aria-expanded={aboutOpen}
        aria-controls={aboutId}
        onClick={() => setAboutOpen(!aboutOpen)}
      >
        <Icon name="info" size={16} />
        {`About ${labelText} values`}
      </button>
      <div id={aboutId} className="cui-sex-gender__about-body" hidden={!aboutOpen}>
        <p>{defs.full}</p>
        <dl>
          {options.map((o) => (
            <React.Fragment key={o}>
              <dt>{o}</dt>
              <dd>{valueDefs[o]}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
    </div>
  ) : null;

  const errorNode = error ? (
    <div id={errId} className="cui-sex-gender__error" role="alert">
      <Icon name="error" size={16} />
      <span>{error}</span>
    </div>
  ) : null;

  if (variant === 'select') {
    return (
      <div className={cx('cui-sex-gender', 'cui-sex-gender--select', error && 'cui-sex-gender--error', className)}>
        <label className="cui-sex-gender__label" htmlFor={id}>
          {labelText}
        </label>
        {showDefinitions ? (
          <span className="cui-sex-gender__short">{defs.short}</span>
        ) : null}
        <select
          id={id}
          name={fieldName}
          className="cui-sex-gender__select"
          value={value ?? ''}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          onChange={(e) => {
            if (e.target.value) setValue(e.target.value);
          }}
        >
          {/* Blank, no prompt, and only until a value is chosen (CGS-0028, CGS-0030). */}
          {value == null ? <option value="" /> : null}
          {options.map((o) => (
            <option key={o} value={o} title={valueDefs[o]}>
              {o}
            </option>
          ))}
        </select>
        {errorNode}
        {about}
      </div>
    );
  }

  return (
    <fieldset
      className={cx(
        'cui-sex-gender',
        'cui-sex-gender--radio',
        `cui-sex-gender--${orientation}`,
        error && 'cui-sex-gender--error',
        className,
      )}
      disabled={disabled}
      aria-describedby={error ? errId : undefined}
    >
      <legend className="cui-sex-gender__label">{labelNode}</legend>
      <div className={cx('cui-sex-gender__options', isSex && 'cui-sex-gender__options--four')}>
        {options.map((o, i) => {
          const optId = `${id}-${i}`;
          return (
            <div key={o} className="cui-sex-gender__option" data-touch-target>
              <input
                type="radio"
                id={optId}
                name={fieldName}
                value={o}
                checked={value === o}
                onChange={() => setValue(o)}
                aria-describedby={showDefinitions ? `${optId}-def` : undefined}
              />
              <label htmlFor={optId} title={showDefinitions ? valueDefs[o] : undefined}>
                {o}
              </label>
              {showDefinitions ? (
                <span id={`${optId}-def`} hidden>
                  {valueDefs[o]}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {errorNode}
      {about}
    </fieldset>
  );
}

/** Standard question, note and options for AU and NZ. */
function regionalQuestion(region: 'AU' | 'NZ', kind: 'currentGender' | 'sex') {
  if (region === 'AU') {
    return kind === 'sex'
      ? { question: AU_SEX_GENDER_QUESTIONS.sex, note: undefined }
      : { question: AU_SEX_GENDER_QUESTIONS.gender, note: AU_SEX_GENDER_QUESTIONS.genderNote };
  }
  return kind === 'sex'
    ? { question: NZ_SEX_GENDER_QUESTIONS.sex, note: NZ_SEX_GENDER_QUESTIONS.sexNote }
    : { question: NZ_SEX_GENDER_QUESTIONS.gender, note: undefined };
}

/** AU (ABS 2020) and NZ (HISO 10046, Stats NZ 2021) sex and gender questions with exact labels and order and a "please specify" box. */
function RegionalSexGenderInput(props: SexGenderInputProps & { region: 'AU' | 'NZ' }) {
  const {
    region,
    kind = 'currentGender',
    variant = 'radio',
    orientation = 'vertical',
    label,
    name,
    id: idProp,
    disabled,
    error,
    className,
    purpose,
    includeAnotherTerm = false,
  } = props;
  const locale = useClinicalLocale(region);
  const teReo = region === 'NZ' && (props.teReoLabels ?? locale.teReoLabels);
  const set = REGIONAL_SEX_GENDER[region][kind];
  const options: ReadonlyArray<PatientCodedValue> = set.values.filter(
    (v) => v.formOption !== false || (region === 'NZ' && kind === 'sex' && v.code === '3' && includeAnotherTerm),
  );
  const id = useId(kind === 'sex' ? 'cui-sex' : 'cui-gender', idProp);
  const fieldName = name ?? id;
  const [value, setValue] = useControllableState<string | null>(
    props.value,
    props.defaultValue ?? null,
    props.onChange ? (v: string | null) => v != null && props.onChange?.(v) : undefined,
  );
  const [detail, setDetail] = useControllableState<string>(props.detail, props.defaultDetail ?? '', props.onDetailChange);
  const { question, note } = regionalQuestion(region, kind);
  const labelText = label ?? question;
  const selected = options.find((o) => o.code === value);
  const errId = `${id}-error`;
  const noteId = `${id}-note`;
  const detailId = `${id}-detail`;
  const optionLabel = (o: PatientCodedValue) =>
    teReo && o.teReo ? (
      <>
        {o.label} / <span lang="mi">{o.teReo}</span>
      </>
    ) : (
      o.label
    );

  const specify = selected?.specify ? (
    <div className="cui-sex-gender__specify">
      <label className="cui-sex-gender__specify-label" htmlFor={detailId}>
        {region === 'NZ' ? 'Gender, in the person\u2019s own words' : 'Please specify'}
      </label>
      <input
        id={detailId}
        type="text"
        className="cui-sex-gender__specify-box"
        maxLength={GENDER_DETAIL_MAX_LENGTH[region]}
        value={detail}
        disabled={disabled}
        aria-required={region === 'NZ' || undefined}
        onChange={(e) => setDetail(e.target.value)}
      />
    </div>
  ) : null;

  const errorNode = error ? (
    <div id={errId} className="cui-sex-gender__error" role="alert">
      <Icon name="error" size={16} />
      <span>{error}</span>
    </div>
  ) : null;
  const noteNode = note ? (
    <span id={noteId} className="cui-sex-gender__short">
      {note}
    </span>
  ) : null;
  const purposeNode = purpose ? <span className="cui-sex-gender__short">{purpose}</span> : null;

  if (variant === 'select') {
    return (
      <div className={cx('cui-sex-gender', 'cui-sex-gender--select', error && 'cui-sex-gender--error', className)}>
        <label className="cui-sex-gender__label" htmlFor={id}>
          {labelText}
        </label>
        {noteNode}
        {purposeNode}
        <select
          id={id}
          name={fieldName}
          className="cui-sex-gender__select"
          value={value ?? ''}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(note && noteId, error && errId) || undefined}
          onChange={(e) => {
            if (e.target.value) setValue(e.target.value);
          }}
        >
          {value == null ? <option value="" /> : null}
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {teReo && o.teReo ? `${o.label} / ${o.teReo}` : o.label}
            </option>
          ))}
        </select>
        {specify}
        {errorNode}
      </div>
    );
  }

  return (
    <fieldset
      className={cx('cui-sex-gender', 'cui-sex-gender--radio', `cui-sex-gender--${orientation}`, error && 'cui-sex-gender--error', className)}
      disabled={disabled}
      aria-describedby={cx(note && noteId, error && errId) || undefined}
    >
      <legend className="cui-sex-gender__label">{labelText}</legend>
      {noteNode}
      {purposeNode}
      <div className="cui-sex-gender__options">
        {options.map((o, i) => {
          const optId = `${id}-${i}`;
          return (
            <div key={o.code} className="cui-sex-gender__option" data-touch-target>
              <input type="radio" id={optId} name={fieldName} value={o.code} checked={value === o.code} onChange={() => setValue(o.code)} />
              <label htmlFor={optId}>{optionLabel(o)}</label>
            </div>
          );
        })}
      </div>
      {specify}
      {errorNode}
    </fieldset>
  );
}
