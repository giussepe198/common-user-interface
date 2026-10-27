import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cx, useId, useControllableState, useClinicalLocale, Button, Icon } from '../../core';
import type { ClinicalRegion } from '../../core';
import {
  AbbreviationFinding,
  DangerousAbbreviation,
  applyAbbreviationSuggestion,
  getDangerousAbbreviations,
  findDangerousAbbreviations,
  findUnexpandedAbbreviations,
} from '../utils/abbreviations';

export interface AbbreviationCheckedTextAreaProps {
  /**
   * Visible label for the field. Omit it when the control is wrapped in `FormField` (noting), whose label then
   * labels the text area through the id FormField passes. Without either, pass `aria-label`.
   */
  label?: string;
  /** Hide the label visually (still read by screen readers). Use only when a heading labels the field. */
  hideLabel?: boolean;
  /** Required field: red asterisk after the label and `aria-required` (CNA-1080/1110), as `FormField`. */
  required?: boolean;
  /**
   * The user moved past this required field while empty: yellow shading, warning icon and screen-reader text
   * "Required field not completed." (CNA-1160..1180), as `FormField`. When wrapped in `FormField`, set `missed` on
   * FormField instead (it shades the text area and adds the icon and text).
   */
  missed?: boolean;
  /** In-field prompt (FormField passes it for `promptPlacement="in-field"`); grey italic, no examples (CNA-2130..2160). */
  placeholder?: string;
  /** Extra ids describing the text area (merged with the alert summary and missed text ids). */
  'aria-describedby'?: string;
  /** Marks the text area invalid (FormField passes this for an error or missed field). Dangerous items also set it. */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Marks the text area required (FormField passes this). */
  'aria-required'?: boolean | 'true' | 'false';
  /** Accessible name when there is no visible label and no FormField. */
  'aria-label'?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * Known dangerous abbreviations; maintain the list centrally (abbracs 3.1). Default by region:
   * GB the abbracs Appendix A, B and C list; AU the ACSQHC 2024 "do not use" terms; NZ the HQSC
   * "DO NOT USE" list.
   */
  dangerousList?: DangerousAbbreviation[];
  /** Region; otherwise read from ClinicalLocaleProvider. Chooses the default list, suggestions and dose rules. */
  region?: ClinicalRegion;
  /** Other known abbreviations and their possible meanings; flagged as unexpanded but not blocking (abbracsfree). */
  knownAbbreviations?: Record<string, string[]>;
  /** Also check dose formats: trailing zero, missing leading zero, name and dose run together, "/" between doses. Default true. */
  checkDoseFormats?: boolean;
  /**
   * Called when validity changes. `isValid` is false while any dangerous item remains: the host
   * must not store the text (abbracs 3.1: prevent storage under all circumstances).
   */
  onValidityChange?: (isValid: boolean, findings: AbbreviationFinding[]) => void;
  /** Show the alert now, e.g. when the user tries to save. Alerts otherwise appear when the user leaves the field (abbracs 3.1). */
  showAlerts?: boolean;
  rows?: number;
  /** Read-only view for later readers: shows a warning when unexpanded items remain (abbracsfree). */
  readOnly?: boolean;
  disabled?: boolean;
  /** Id of the text area itself, so `FormField` and `<label htmlFor>` reach it. Generated when omitted. */
  id?: string;
  className?: string;
}

const KIND_TEXT = (f: AbbreviationFinding) =>
  f.severity === 'unexpanded' ? 'Abbreviation' : f.kind === 'dose-format' ? 'Dose format hazard' : 'Dangerous abbreviation';

/**
 * Free text field that checks for known dangerous abbreviations and dose-format hazards in the
 * background, alerts when the user leaves the field, offers expansions with none pre-selected, and
 * reports `isValid = false` so the host blocks saving while any dangerous item remains (abbracs 3.1;
 * abbracsfree design suggestion).
 */
export const AbbreviationCheckedTextArea = React.forwardRef<HTMLTextAreaElement, AbbreviationCheckedTextAreaProps>(function AbbreviationCheckedTextArea(props, ref) {
  const {
    label, hideLabel, value: valueProp, defaultValue = '', onChange, dangerousList: listProp, knownAbbreviations,
    checkDoseFormats = true, onValidityChange, showAlerts, rows = 4, readOnly, disabled, id, className, region: regionProp,
    required = false, missed = false, placeholder,
    'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid, 'aria-required': ariaRequired, 'aria-label': ariaLabel,
  } = props;
  const { region } = useClinicalLocale(regionProp);
  const dangerousList = listProp ?? getDangerousAbbreviations(region);
  const fieldId = useId('cui-abbr-text', id);
  const [value, setValue] = useControllableState<string>(valueProp, defaultValue, onChange);
  const [alerted, setAlerted] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingCaret = useRef<number | null>(null);

  const findings = useMemo(() => {
    const dangerous = findDangerousAbbreviations(value, dangerousList, { doseFormats: checkDoseFormats, region });
    const known = knownAbbreviations ? findUnexpandedAbbreviations(value, knownAbbreviations) : [];
    const overlaps = (f: AbbreviationFinding) => dangerous.some(d => f.start < d.end && d.start < f.end);
    return [...dangerous, ...known.filter(f => !overlaps(f))].sort((a, b) => a.start - b.start);
  }, [value, dangerousList, knownAbbreviations, checkDoseFormats, region]);
  const dangerousCount = findings.filter(f => f.severity === 'dangerous').length;
  const isValid = dangerousCount === 0;

  useEffect(() => {
    onValidityChange?.(isValid, findings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, findings.length]);

  useEffect(() => {
    if (pendingCaret.current != null && areaRef.current) {
      areaRef.current.focus();
      areaRef.current.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  });

  const setRefs = (el: HTMLTextAreaElement | null) => {
    areaRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  const selectFinding = (f: AbbreviationFinding) => {
    const el = areaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(f.start, f.end);
  };

  /** "Go to next unexpanded item" (abbracs accessibility), also on F8 [suggested key]. */
  const goToNext = () => {
    const el = areaRef.current;
    if (!el || !findings.length) return;
    const from = el.selectionEnd ?? 0;
    const next = findings.find(f => f.start >= from && !(f.start === el.selectionStart && f.end === el.selectionEnd)) ?? findings[0];
    selectFinding(next);
  };

  const apply = (f: AbbreviationFinding, suggestion: string) => {
    const out = applyAbbreviationSuggestion(value, f, suggestion);
    pendingCaret.current = out.caret;
    setValue(out.text);
  };

  const visible = (alerted || showAlerts) && findings.length > 0 && !readOnly;
  const summaryId = `${fieldId}-summary`;
  const missedId = `${fieldId}-missed`;
  const blockingShown = visible && dangerousCount > 0;
  const describedBy = cx(ariaDescribedBy, missed && missedId, visible && summaryId) || undefined;
  const invalid = blockingShown || ariaInvalid === true || ariaInvalid === 'true' || missed ? true : undefined;
  const summary =
    dangerousCount > 0
      ? `${dangerousCount} dangerous ${dangerousCount === 1 ? 'item' : 'items'} must be resolved before this text can be saved.`
      : `${findings.length} ${findings.length === 1 ? 'abbreviation is' : 'abbreviations are'} not expanded.`;

  return (
    <div className={cx('cui-abbr-text', missed && 'cui-abbr-text--missed', className)}>
      {label ? (
        <label htmlFor={fieldId} className={cx('cui-abbr-text__label', hideLabel && 'cui-visually-hidden')}>
          {label}
          {required ? (
            // Same markup as noting's RequiredFieldIndicator (not imported: noting already imports datetime).
            <span className="cui-required-indicator">
              <span className="cui-required-indicator__mark cui-abbr-text__required" aria-hidden="true">*</span>
              <span className="cui-visually-hidden"> (required)</span>
            </span>
          ) : null}
        </label>
      ) : null}
      {readOnly && findings.length ? (
        <div className="cui-abbr-text__reader-warning" role="note">
          <Icon name="warning" size={16} />
          <span>
            This text contains {findings.length} unexpanded {findings.length === 1 ? 'abbreviation' : 'abbreviations'} ({findings.map(f => f.text).join(', ')}). Check the meaning before acting on it.
          </span>
        </div>
      ) : null}
      <div className="cui-abbr-text__field">
      <textarea
        ref={setRefs}
        id={fieldId}
        className={cx('cui-abbr-text__area', blockingShown && 'cui-abbr-text__area--invalid')}
        rows={rows}
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={label ? undefined : ariaLabel}
        aria-invalid={invalid}
        aria-required={ariaRequired === true || ariaRequired === 'true' || required ? true : undefined}
        aria-describedby={describedBy}
        onChange={e => setValue(e.target.value)}
        onBlur={() => {
          if (findings.length) setAlerted(true);
        }}
        onKeyDown={e => {
          if (e.key === 'F8') {
            e.preventDefault();
            setAlerted(true);
            goToNext();
          }
        }}
      />
      {missed ? (
        <span className="cui-abbr-text__missed-icon" title="Required field not completed" aria-hidden="true">
          <Icon name="warning" />
        </span>
      ) : null}
      </div>
      {missed ? <span id={missedId} className="cui-visually-hidden">Required field not completed.</span> : null}
      {visible ? (
        <div className={cx('cui-abbr-text__alert', dangerousCount > 0 && 'cui-abbr-text__alert--danger')}>
          <div id={summaryId} role="alert" className="cui-abbr-text__summary">
            <Icon name={dangerousCount > 0 ? 'error' : 'info'} size={16} />
            <span>{summary}</span>
          </div>
          <ul className="cui-abbr-text__list">
            {findings.map((f, i) => (
              <li key={`${f.start}-${i}`} className={cx('cui-abbr-text__item', `cui-abbr-text__item--${f.severity}`)}>
                <div className="cui-abbr-text__item-head">
                  <Icon name={f.severity === 'dangerous' ? 'warning' : 'info'} size={16} />
                  <span className="cui-abbr-text__kind">{KIND_TEXT(f)}</span>
                  <button type="button" className="cui-abbr-text__term" onClick={() => selectFinding(f)} title="Show in text">
                    {f.text.trim() || f.text}
                  </button>
                  <span className="cui-abbr-text__reason">{f.reason}</span>
                </div>
                <div className="cui-abbr-text__options">
                  {f.suggestions.length ? (
                    <>
                      <span className="cui-abbr-text__options-label">{f.resolution === 'expand' ? 'Expand as:' : 'Replace with:'}</span>
                      {f.suggestions.map(s => (
                        <Button key={s} size="sm" onClick={() => apply(f, s)}>
                          {s.trim()}
                        </Button>
                      ))}
                    </>
                  ) : (
                    <span className="cui-abbr-text__options-label">Write this in full.</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="cui-abbr-text__footer">
            <Button size="sm" variant="quiet" icon="chevron-right" onClick={goToNext}>
              Go to next item (F8)
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
});
