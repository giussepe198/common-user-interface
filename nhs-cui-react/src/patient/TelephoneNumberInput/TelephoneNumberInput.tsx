import React from 'react';
import { cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatTelephoneNumber, validatePhoneNumber } from '../utils/patient';
import { PATIENT_COUNTRIES } from '../utils/countries';
import type { PatientCountry } from '../utils/countries';

export interface TelephoneNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'size'> {
  /** Visible label, e.g. "Home", "Work" or "Telephone Number". The guide leaves labels to the form (TID scope). */
  label: string;
  /**
   * Region. GB: TID rules, no validation message. AU: Style Manual formats; +61, 0061 and 0 accepted; a message is shown on
   * leaving the field if the number is not a valid Australian or international number (AU-PH-01, AU-PH-02). NZ: NZ formats,
   * +64 accepted, same message behaviour. Default from `ClinicalLocaleProvider`.
   */
  region?: ClinicalRegion;
  /** AU and NZ: show a warning when the number is not recognised on leaving the field. Default true. */
  validate?: boolean;
  /** Controlled value of the number box. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called on every keystroke with the text as typed (TID-0011, TID-0012). */
  onChange?: (raw: string) => void;
  /**
   * Called when the box loses focus with the full display value (including "+CC" and " x1234") and whether
   * it was recognised. Recognised numbers are reformatted in the box (TID-0013, TID-0014); others stay as typed (TID-0015).
   * The third argument is the E.164 form for storage ("+61491570159"), or null (AU-PH-01; HISO 10046 stores no punctuation).
   */
  onCommit?: (formatted: string, recognised: boolean, e164: string | null) => void;
  /** "inline": type the extension with an "x" in the same box (TID-0008). "separate": a second free-text box (TID-0026, TID-0027). Default "inline". */
  extensionMode?: 'inline' | 'separate';
  /** Controlled extension (separate mode). */
  extension?: string;
  /** Uncontrolled initial extension (separate mode). */
  defaultExtension?: string;
  /** Called when the extension changes (separate mode). */
  onExtensionChange?: (extension: string) => void;
  /** Label above the extension box. Default "Extension" (TID-0026). */
  extensionLabel?: string;
  /** Show the country code selector for a non-UK number (TID-0020..0025). Default false. */
  assisted?: boolean;
  /** Selected country (two-letter code, "UK" for the United Kingdom). Default "UK", "AU" or "NZ" by region, shown as "+44 (UK)" (TID-0020). */
  country?: string;
  /** Uncontrolled initial country. */
  defaultCountry?: string;
  /** Called when the country changes. */
  onCountryChange?: (code: string, dialCode: string) => void;
  /** Country list. Default: all ISO 3166-1 countries with ITU dialling codes. */
  countries?: ReadonlyArray<PatientCountry>;
  /** Label above the selector. Default "Country Code". */
  countryLabel?: string;
  /** Prompt in the empty box. Default "e.g. 01234 567890" (GB), "e.g. 0491 570 159" (AU) or "e.g. 021 123 4567" (NZ). */
  placeholder?: string;
  /** Prompt in the empty extension box. Default "e.g. 1234". */
  extensionPlaceholder?: string;
  /** Tooltip on the number box. */
  tooltip?: string;
  /** Hint below the label [suggested]. */
  hint?: string;
  /** Error message from the consumer. */
  error?: string;
}

/**
 * Free-text telephone number input that accepts any formatting while typing and tidies the number
 * when the field is left (TID-0011..0027). There is never a separate area code box.
 */
export const TelephoneNumberInput = React.forwardRef<HTMLInputElement, TelephoneNumberInputProps>(
  function TelephoneNumberInput(
    {
      label,
      region: regionProp,
      validate = true,
      value,
      defaultValue = '',
      onChange,
      onCommit,
      extensionMode = 'inline',
      extension,
      defaultExtension = '',
      onExtensionChange,
      extensionLabel = 'Extension',
      assisted = false,
      country,
      defaultCountry,
      onCountryChange,
      countries = PATIENT_COUNTRIES,
      countryLabel = 'Country Code',
      placeholder,
      extensionPlaceholder = 'e.g. 1234',
      tooltip,
      hint,
      error,
      id: idProp,
      className,
      disabled,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const { region } = useClinicalLocale(regionProp);
    const homeCode = region === 'GB' ? 'UK' : region;
    const homeDial = region === 'AU' ? '61' : region === 'NZ' ? '64' : '44';
    const id = useId('cui-tel', idProp);
    const [warning, setWarning] = React.useState('');
    const [raw, setRaw] = useControllableState<string>(value, defaultValue, onChange);
    const [ext, setExt] = useControllableState<string>(extension, defaultExtension, onExtensionChange);
    const [code, setCode] = useControllableState<string>(country, defaultCountry ?? homeCode, undefined);
    const uk = countries.find((c) => c.code === homeCode) ?? { name: 'United Kingdom', code: 'UK', dialCode: '44' };
    const selected = countries.find((c) => c.code === code) ?? uk;
    const isUk = !assisted || selected.dialCode === homeDial;
    const shownPlaceholder = placeholder ?? (region === 'AU' ? 'e.g. 0491 570 159' : region === 'NZ' ? 'e.g. 021 123 4567' : 'e.g. 01234 567890');
    const hintId = `${id}-hint`;
    const errId = `${id}-error`;

    const commit = (box: string, extDigits: string) => {
      const trimmed = box.trim();
      if (!trimmed) {
        setWarning('');
        onCommit?.('', false, null);
        return;
      }
      const extSuffix = extensionMode === 'separate' && extDigits ? ` x${extDigits}` : '';
      const source =
        isUk || /^(\+|00)/.test(trimmed) ? trimmed : `+${selected.dialCode} ${trimmed.replace(/^0+/, '')}`;
      const f = formatTelephoneNumber(source + extSuffix, region);
      const check = validatePhoneNumber(source + extSuffix, region);
      setWarning(region !== 'GB' && validate && !check.valid ? check.message ?? '' : '');
      if (f.recognised) {
        let shown = f.display;
        if (extSuffix) shown = shown.replace(/ x\d+$/, '');
        if (!isUk && shown.startsWith(`+${selected.dialCode} `) && !/^(\+|00)/.test(trimmed)) {
          shown = shown.slice(selected.dialCode.length + 2);
        }
        if (shown !== box) setRaw(shown);
      }
      onCommit?.(f.display, f.recognised, check.e164);
    };

    const extDigits = (ext ?? '').replace(/\D/g, '');

    return (
      <div
        className={cx(
          'cui-tel-input',
          assisted && 'cui-tel-input--assisted',
          extensionMode === 'separate' && 'cui-tel-input--separate',
          error && 'cui-tel-input--error',
          className,
        )}
      >
        {assisted ? (
          <div className="cui-tel-input__field cui-tel-input__field--country">
            <label className="cui-tel-input__label" htmlFor={`${id}-country`}>
              {countryLabel}
            </label>
            <span className="cui-tel-input__country">
              <span className="cui-tel-input__country-value" aria-hidden="true">
                {`+${selected.dialCode} (${selected.code})`}
                <Icon name="chevron-down" size={16} />
              </span>
              <select
                id={`${id}-country`}
                className="cui-tel-input__country-select"
                value={code}
                disabled={disabled}
                onChange={(e) => {
                  const c = e.target.value.replace(/^top:/, '');
                  setCode(c);
                  const found = countries.find((x) => x.code === c);
                  onCountryChange?.(c, found?.dialCode ?? '');
                }}
              >
                {/* Home country (United Kingdom in GB) once at the top and again in alphabetical position (TID-0022). */}
                <option value={`top:${uk.code}`}>{`${uk.name} +${uk.dialCode} (${uk.code})`}</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {`${c.name} +${c.dialCode} (${c.code})`}
                  </option>
                ))}
              </select>
            </span>
          </div>
        ) : null}
        <div className="cui-tel-input__field cui-tel-input__field--number">
          <label className="cui-tel-input__label" htmlFor={id}>
            {label}
          </label>
          {hint ? (
            <span id={hintId} className="cui-tel-input__hint">
              {hint}
            </span>
          ) : null}
          <input
            {...rest}
            ref={ref}
            id={id}
            type="tel"
            autoComplete={rest.autoComplete ?? 'off'}
            className="cui-tel-input__box"
            value={raw}
            placeholder={shownPlaceholder}
            title={tooltip}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={cx(hint && hintId, error && errId, warning && !error && `${id}-warning`) || undefined}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={(e) => {
              commit(e.target.value, extDigits);
              onBlur?.(e);
            }}
          />
        </div>
        {extensionMode === 'separate' ? (
          <div className="cui-tel-input__field cui-tel-input__field--ext">
            <label className="cui-tel-input__label" htmlFor={`${id}-ext`}>
              {extensionLabel}
            </label>
            <input
              id={`${id}-ext`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="cui-tel-input__box cui-tel-input__box--ext"
              value={ext}
              placeholder={extensionPlaceholder}
              disabled={disabled}
              onChange={(e) => setExt(e.target.value)}
              onBlur={(e) => commit(raw, e.target.value.replace(/\D/g, ''))}
            />
          </div>
        ) : null}
        {warning && !error ? (
          <div id={`${id}-warning`} className="cui-tel-input__warning" role="status">
            <Icon name="warning" size={16} />
            <span>{warning}</span>
          </div>
        ) : null}
        {error ? (
          <div id={errId} className="cui-tel-input__error" role="alert">
            <Icon name="error" size={16} />
            <span>{error}</span>
          </div>
        ) : null}
      </div>
    );
  },
);
