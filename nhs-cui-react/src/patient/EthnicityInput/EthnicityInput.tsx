import React from 'react';
import { cx, Icon, useControllableState, useId } from '../../core';
import {
  NZ_ETHNICITY_MAX_CODES,
  NZ_ETHNICITY_NONE_ENTERED_OPTIONS,
  NZ_ETHNICITY_QUESTION,
  NZ_ETHNICITY_RESIDUAL_CODES,
} from '../utils/regions/demographics';

/** One recorded ethnicity: a HISO 10001 level 4 code with its label. */
export interface EthnicityEntry {
  code: string;
  label: string;
}

/** Recorded ethnicities in the order given; there is never a "principal" ethnicity (HISO 10001). */
export interface EthnicityValue {
  /** Level 4 codes in the order recorded. Systems record up to six; more need the Stats NZ reduction process. */
  entries: ReadonlyArray<EthnicityEntry>;
  /** The person's own words for "Other" (ethnicity detail, up to 600 characters, HISO 10046). */
  otherText?: string;
}

/** One classification item returned by the consumer's lookup (Stats NZ Ethnicity classification, level 4). */
export interface EthnicityClassificationItem {
  code: string;
  label: string;
}

export interface EthnicityInputProps {
  /** Controlled value. */
  value?: EthnicityValue;
  /** Uncontrolled initial value. Default nothing selected: never pre-fill or guess ethnicity (HISO 10001, G11 11.3). */
  defaultValue?: EthnicityValue;
  /** Called on every change. */
  onChange?: (value: EthnicityValue) => void;
  /**
   * Lookup in the Stats NZ ethnicity classification for the "Other" entry. Suggestions can be added as coded entries; the
   * list never restricts what can be typed (HISO 10001). The control makes no network calls itself.
   */
  classification?: (query: string) => Promise<EthnicityClassificationItem[]> | ReadonlyArray<EthnicityClassificationItem>;
  /** "written" (form) or "verbal" (read aloud; the last item becomes "Another ethnic group"). Default "written". */
  version?: 'written' | 'verbal';
  /** Wording of the "Other" item. Default "Other such as Dutch, Japanese, Tokelauan. Please state:" ([UNCERTAIN], check HISO 10001 Figure 1). */
  otherLabel?: string;
  /** Why the question is asked and how the data is used (G11 11.3) [suggested]. */
  purpose?: string;
  /** Error from the consumer. */
  error?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const STANDARD_CODES = new Set(NZ_ETHNICITY_QUESTION.options.map((o) => o.code));
const RESIDUAL_CODES = new Set(NZ_ETHNICITY_RESIDUAL_CODES.map((o) => o.code));
const EMPTY: EthnicityValue = { entries: [] };

/** All level 4 codes in the order recorded. */
export function ethnicityCodes(value: EthnicityValue | null | undefined): string[] {
  return (value?.entries ?? []).map((e) => e.code);
}

/** True when more than six codes were given, so the Stats NZ reduction process applies (HISO 10001 Appendix A). */
export function ethnicityNeedsReduction(value: EthnicityValue | null | undefined): boolean {
  return ethnicityCodes(value).length > NZ_ETHNICITY_MAX_CODES;
}

/**
 * New Zealand standard ethnicity question (HISO 10001:2017): exact wording and options, multiple selection, a visible
 * "Other" entry with an optional classification lookup, and the two "nothing entered" responses. No principal ethnicity.
 */
export function EthnicityInput({
  value,
  defaultValue = EMPTY,
  onChange,
  classification,
  version = 'written',
  otherLabel,
  purpose,
  error,
  disabled,
  id: idProp,
  className,
}: EthnicityInputProps) {
  const id = useId('cui-ethnicity', idProp);
  const [val, setVal] = useControllableState<EthnicityValue>(value, defaultValue, onChange);
  const entries = val.entries ?? [];
  const otherEntries = entries.filter((e) => !STANDARD_CODES.has(e.code) && !RESIDUAL_CODES.has(e.code));
  const hasResidual = entries.some((e) => RESIDUAL_CODES.has(e.code));
  const [otherOpen, setOtherOpen] = React.useState(!!val.otherText || otherEntries.length > 0);
  const [askedEmpty, setAskedEmpty] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<EthnicityClassificationItem[]>([]);
  const [active, setActive] = React.useState(-1);
  const [status, setStatus] = React.useState('');
  const seq = React.useRef(0);
  const fieldsetRef = React.useRef<HTMLFieldSetElement>(null);
  const otherChecked = otherOpen || !!val.otherText || otherEntries.length > 0;
  const nothing = entries.length === 0 && !val.otherText;

  const update = (next: Partial<EthnicityValue>) => setVal({ ...val, entries, ...next });
  const withoutResiduals = entries.filter((e) => !RESIDUAL_CODES.has(e.code));

  const toggleStandard = (code: string, label: string, checked: boolean) => {
    update({ entries: checked ? [...withoutResiduals, { code, label }] : entries.filter((e) => e.code !== code) });
  };
  const toggleResidual = (code: string, label: string, checked: boolean) => {
    setOtherOpen(false);
    update({ entries: checked ? [{ code, label }] : [], otherText: checked ? '' : val.otherText });
  };
  const runLookup = async (q: string) => {
    if (!classification || q.trim().length < 2) {
      setSuggestions([]);
      setStatus('');
      return;
    }
    const n = ++seq.current;
    try {
      const found = await classification(q.trim());
      if (n !== seq.current) return;
      const list = found.filter((f) => !entries.some((e) => e.code === f.code)).slice(0, 10);
      setSuggestions(list);
      setActive(-1);
      setStatus(list.length ? `${list.length} suggestion${list.length === 1 ? '' : 's'} from the ethnicity classification` : '');
    } catch {
      if (n === seq.current) setSuggestions([]);
    }
  };
  const addCoded = (item: EthnicityClassificationItem) => {
    update({ entries: [...withoutResiduals, { code: item.code, label: item.label }] });
    setSuggestions([]);
    setStatus(`${item.label} added`);
  };

  const listId = `${id}-suggestions`;
  const otherId = `${id}-other`;
  const errId = `${id}-error`;
  const otherText = version === 'verbal' ? NZ_ETHNICITY_QUESTION.otherLabelVerbal : otherLabel ?? NZ_ETHNICITY_QUESTION.otherLabel;

  return (
    <fieldset
      ref={fieldsetRef}
      className={cx('cui-patient-question', 'cui-ethnicity-input', error && 'cui-patient-question--error', className)}
      disabled={disabled}
      aria-describedby={error ? errId : undefined}
      onBlur={(e) => {
        if (!fieldsetRef.current?.contains(e.relatedTarget as Node | null) && nothing) setAskedEmpty(true);
      }}
    >
      <legend className="cui-patient-question__legend">{NZ_ETHNICITY_QUESTION.question}</legend>
      <p className="cui-patient-question__hint">{NZ_ETHNICITY_QUESTION.instruction}</p>
      {purpose ? <p className="cui-patient-question__purpose">{purpose}</p> : null}
      <div className="cui-patient-question__options">
        {NZ_ETHNICITY_QUESTION.options.map((o) => (
          <div key={o.code} className="cui-patient-question__option" data-touch-target>
            <input
              type="checkbox"
              id={`${id}-${o.code}`}
              checked={entries.some((e) => e.code === o.code)}
              onChange={(e) => toggleStandard(o.code, o.label, e.target.checked)}
            />
            <label htmlFor={`${id}-${o.code}`}>{o.label}</label>
          </div>
        ))}
        <div className="cui-patient-question__option" data-touch-target>
          <input
            type="checkbox"
            id={`${otherId}-check`}
            checked={otherChecked}
            onChange={(e) => {
              setOtherOpen(e.target.checked);
              if (!e.target.checked) {
                setSuggestions([]);
                update({ entries: entries.filter((x) => STANDARD_CODES.has(x.code)), otherText: '' });
              } else if (hasResidual) {
                update({ entries: withoutResiduals });
              }
            }}
          />
          <label htmlFor={`${otherId}-check`}>{otherText}</label>
        </div>
      </div>

      {otherChecked ? (
        <div className="cui-ethnicity-input__other">
          <label className="cui-visually-hidden" htmlFor={otherId}>
            Other ethnic group or groups, in the person&apos;s own words
          </label>
          <div className="cui-patient-question__combo">
            <input
              id={otherId}
              type="text"
              className="cui-patient-question__text"
              maxLength={600}
              value={val.otherText ?? ''}
              autoComplete="off"
              role={classification ? 'combobox' : undefined}
              aria-autocomplete={classification ? 'list' : undefined}
              aria-expanded={classification ? suggestions.length > 0 : undefined}
              aria-controls={classification ? listId : undefined}
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              placeholder="e.g. Dutch, Tokelauan"
              onChange={(e) => {
                update({ otherText: e.target.value, entries: withoutResiduals });
                void runLookup(e.target.value.split(/[,;]/).pop() ?? '');
              }}
              onKeyDown={(e) => {
                if (!suggestions.length) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, suggestions.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === 'Enter' && active >= 0) {
                  e.preventDefault();
                  addCoded(suggestions[active]);
                } else if (e.key === 'Escape') {
                  setSuggestions([]);
                }
              }}
            />
            {classification && suggestions.length ? (
              <ul id={listId} role="listbox" className="cui-patient-question__listbox" aria-label="Ethnicity classification suggestions">
                {suggestions.map((s, i) => (
                  <li
                    key={s.code}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addCoded(s)}
                  >
                    {s.label}
                    <span className="cui-patient-question__meta">{s.code}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {otherEntries.length ? (
            <ul className="cui-patient-question__chips" aria-label="Coded other ethnic groups">
              {otherEntries.map((e) => (
                <li key={e.code} className="cui-patient-question__chip">
                  <span>{e.label}</span>
                  <button type="button" aria-label={`Remove ${e.label}`} onClick={() => update({ entries: entries.filter((x) => x.code !== e.code) })}>
                    <Icon name="close" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="cui-patient-question__status" role="status">
            {status}
          </div>
        </div>
      ) : null}

      {(askedEmpty && nothing) || hasResidual ? (
        <div className="cui-patient-question__panel" role="group" aria-labelledby={`${id}-none-title`}>
          <p id={`${id}-none-title`} className="cui-patient-question__panel-title">
            <Icon name="warning" size={16} />
            <span>No ethnic group has been marked. Ask again, or record one of these responses.</span>
          </p>
          {NZ_ETHNICITY_NONE_ENTERED_OPTIONS.map((o) => (
            <div key={o.code} className="cui-patient-question__option" data-touch-target>
              <input
                type="checkbox"
                id={`${id}-${o.code}`}
                checked={entries.some((e) => e.code === o.code)}
                onChange={(e) => toggleResidual(o.code, o.label, e.target.checked)}
              />
              <label htmlFor={`${id}-${o.code}`}>{o.label}</label>
            </div>
          ))}
        </div>
      ) : null}

      {ethnicityNeedsReduction(val) ? (
        <div className="cui-patient-question__warning" role="status">
          <Icon name="warning" size={16} />
          <span>
            More than six ethnic groups were given. Up to six are stored, chosen with the Stats NZ reduction process (HISO 10001
            Appendix A), never at random.
          </span>
        </div>
      ) : null}
      {error ? (
        <div id={errId} className="cui-patient-question__error" role="alert">
          <Icon name="error" size={16} />
          <span>{error}</span>
        </div>
      ) : null}
    </fieldset>
  );
}
