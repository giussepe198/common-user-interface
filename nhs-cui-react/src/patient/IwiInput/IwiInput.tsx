import React from 'react';
import { Button, cx, Icon, useControllableState, useId } from '../../core';
import { matchesIgnoringMacrons, nameSearchKey } from '../utils/patient';
import { NZ_IWI_QUESTION } from '../utils/regions/demographics';

/** One iwi from the consumer's reference list (Stats NZ iwi classification, level 2 codes such as 0104). */
export interface IwiOption {
  code: string;
  name: string;
  /** Rohe or region, if the list gives one. */
  rohe?: string;
}

/** One recorded iwi affiliation. `code` is absent for an iwi typed in that is not on the list. */
export interface IwiEntry {
  code?: string;
  name: string;
  rohe?: string;
}

export interface IwiValue {
  /** Answer to "Do you know the name(s) of your iwi?"; null when unanswered. */
  knows: 'yes' | 'no' | null;
  /** All iwi given, in the order given. At least six can be recorded; never a "main" iwi (HISO 10094). */
  iwi: ReadonlyArray<IwiEntry>;
}

export interface IwiInputProps {
  /** Controlled value. */
  value?: IwiValue;
  /** Uncontrolled initial value. Default unanswered with no iwi. */
  defaultValue?: IwiValue;
  /** Called on every change. */
  onChange?: (value: IwiValue) => void;
  /** Reference list, filtered in the browser ignoring macrons and case (HISO 10094). */
  iwiList?: ReadonlyArray<IwiOption>;
  /** Or a lookup supplied by the consumer, called as the user types. Results are shown as returned. */
  searchIwi?: (query: string) => Promise<ReadonlyArray<IwiOption>> | ReadonlyArray<IwiOption>;
  /** Show the te reo Māori line of the question (HISO 10094). Default true. */
  showTeReo?: boolean;
  /** Why the question is asked and how the data is protected (HISO 10094, G11 11.3) [suggested]. */
  purpose?: string;
  /** Maximum suggestions shown. Default 10. */
  maxSuggestions?: number;
  /** Error from the consumer. */
  error?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const EMPTY: IwiValue = { knows: null, iwi: [] };

/** Filters a reference list for an as-you-type query, ignoring macrons and case; matches at the start of a word rank first. */
export function filterIwiOptions(list: ReadonlyArray<IwiOption>, query: string, max = 10): IwiOption[] {
  const q = nameSearchKey(query);
  if (!q) return [];
  const hits = list.filter((o) => matchesIgnoringMacrons(o.name, q) || o.code === query.trim());
  const starts = (o: IwiOption) => nameSearchKey(o.name).split(/[\s-]+/).some((w) => w.startsWith(q));
  return [...hits.filter(starts), ...hits.filter((o) => !starts(o))].slice(0, max);
}

/**
 * HISO 10094:2022 iwi affiliation question with multi-iwi entry. The as-you-type list ignores macrons; free text with macrons
 * is accepted for an iwi not on the list; adding another iwi needs no extra clicks (the box clears and keeps focus).
 */
export function IwiInput({
  value,
  defaultValue = EMPTY,
  onChange,
  iwiList,
  searchIwi,
  showTeReo = true,
  purpose,
  maxSuggestions = 10,
  error,
  disabled,
  id: idProp,
  className,
}: IwiInputProps) {
  const id = useId('cui-iwi', idProp);
  const [val, setVal] = useControllableState<IwiValue>(value, defaultValue, onChange);
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<IwiOption[]>([]);
  const [active, setActive] = React.useState(-1);
  const [status, setStatus] = React.useState('');
  const seq = React.useRef(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = `${id}-list`;
  const entryId = `${id}-entry`;
  const errId = `${id}-error`;
  const hasList = !!(iwiList || searchIwi);

  const lookup = async (q: string) => {
    const n = ++seq.current;
    if (!q.trim()) {
      setSuggestions([]);
      setStatus('');
      return;
    }
    let found: ReadonlyArray<IwiOption> = [];
    try {
      found = searchIwi ? await searchIwi(q) : filterIwiOptions(iwiList ?? [], q, maxSuggestions);
    } catch {
      found = [];
    }
    if (n !== seq.current) return;
    const list = found.filter((o) => !val.iwi.some((e) => e.code === o.code)).slice(0, maxSuggestions);
    setSuggestions(list);
    setActive(-1);
    setStatus(hasList ? (list.length ? `${list.length} iwi found` : 'No iwi on the list match. You can add it as typed.') : '');
  };

  const add = (entry: IwiEntry) => {
    const name = entry.name.normalize('NFC').replace(/\s+/g, ' ').trim();
    if (!name) return;
    if (val.iwi.some((e) => (entry.code && e.code === entry.code) || nameSearchKey(e.name) === nameSearchKey(name))) {
      setStatus(`${name} is already recorded`);
    } else {
      setVal({ ...val, knows: 'yes', iwi: [...val.iwi, { ...entry, name }] });
      setStatus(`${name} added`);
    }
    setQuery('');
    setSuggestions([]);
    setActive(-1);
    inputRef.current?.focus();
  };

  const updateEntry = (i: number, patch: Partial<IwiEntry>) =>
    setVal({ ...val, iwi: val.iwi.map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  return (
    <fieldset
      className={cx('cui-patient-question', 'cui-iwi-input', error && 'cui-patient-question--error', className)}
      disabled={disabled}
      aria-describedby={error ? errId : undefined}
    >
      <legend className="cui-patient-question__legend">
        {NZ_IWI_QUESTION.question}
        {showTeReo ? (
          <span className="cui-patient-question__te-reo cui-iwi-input__te-reo" lang="mi">
            {NZ_IWI_QUESTION.teReo}
          </span>
        ) : null}
      </legend>
      {purpose ? <p className="cui-patient-question__purpose">{purpose}</p> : null}
      <div className="cui-patient-question__options">
        <div className="cui-patient-question__option" data-touch-target>
          <input type="radio" id={`${id}-yes`} name={`${id}-knows`} checked={val.knows === 'yes'} onChange={() => setVal({ ...val, knows: 'yes' })} />
          <label htmlFor={`${id}-yes`}>Yes</label>
        </div>
        {val.knows === 'yes' ? (
          <div className="cui-iwi-input__entry">
            <label className="cui-iwi-input__entry-label" htmlFor={entryId}>
              {NZ_IWI_QUESTION.yesPrompt}
            </label>
            <div className="cui-patient-question__combo">
              <input
                ref={inputRef}
                id={entryId}
                type="text"
                className="cui-patient-question__text"
                value={query}
                autoComplete="off"
                maxLength={100}
                role={hasList ? 'combobox' : undefined}
                aria-autocomplete={hasList ? 'list' : undefined}
                aria-expanded={hasList ? suggestions.length > 0 : undefined}
                aria-controls={hasList ? listId : undefined}
                aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                aria-describedby={hasList ? `${id}-disclaimer` : undefined}
                placeholder="Start typing an iwi name"
                onChange={(e) => {
                  setQuery(e.target.value);
                  void lookup(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && suggestions.length) {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, suggestions.length - 1));
                  } else if (e.key === 'ArrowUp' && suggestions.length) {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (active >= 0 && suggestions[active]) add(suggestions[active]);
                    else add({ name: query });
                  } else if (e.key === 'Escape') {
                    setSuggestions([]);
                    setActive(-1);
                  }
                }}
              />
              <Button size="md" icon="plus" disabled={!query.trim()} onClick={() => add({ name: query })}>
                Add as typed
              </Button>
              {hasList && suggestions.length ? (
                <ul id={listId} role="listbox" className="cui-patient-question__listbox" aria-label="Matching iwi">
                  {suggestions.map((o, i) => (
                    <li
                      key={o.code}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => add(o)}
                    >
                      {o.name}
                      {o.rohe ? <span className="cui-patient-question__meta">{o.rohe}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {hasList ? (
              <p id={`${id}-disclaimer`} className="cui-patient-question__hint">
                {NZ_IWI_QUESTION.guidanceDisclaimer}
              </p>
            ) : null}
            <div className="cui-patient-question__status" role="status">
              {status}
            </div>
            {val.iwi.length ? (
              <table className="cui-iwi-input__table">
                <caption className="cui-visually-hidden">Iwi recorded</caption>
                <thead>
                  <tr>
                    <th scope="col">Iwi</th>
                    <th scope="col">Rohe or region (if known)</th>
                    <th scope="col">
                      <span className="cui-visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {val.iwi.map((e, i) => (
                    <tr key={`${e.code ?? 'free'}-${i}`}>
                      <td>
                        {e.name}
                        {!e.code ? <span className="cui-iwi-input__free"> (not on the list)</span> : null}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="cui-patient-question__text cui-iwi-input__rohe"
                          aria-label={`Rohe or region for ${e.name}`}
                          value={e.rohe ?? ''}
                          maxLength={100}
                          onChange={(ev) => updateEntry(i, { rohe: ev.target.value })}
                        />
                      </td>
                      <td>
                        <Button
                          variant="quiet"
                          size="sm"
                          icon="trash"
                          iconOnly
                          onClick={() => {
                            setVal({ ...val, iwi: val.iwi.filter((_, j) => j !== i) });
                            setStatus(`${e.name} removed`);
                            inputRef.current?.focus();
                          }}
                        >
                          {`Remove ${e.name}`}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        ) : null}
        <div className="cui-patient-question__option" data-touch-target>
          <input type="radio" id={`${id}-no`} name={`${id}-knows`} checked={val.knows === 'no'} onChange={() => setVal({ knows: 'no', iwi: [] })} />
          <label htmlFor={`${id}-no`}>No</label>
        </div>
      </div>
      {error ? (
        <div id={errId} className="cui-patient-question__error" role="alert">
          <Icon name="error" size={16} />
          <span>{error}</span>
        </div>
      ) : null}
    </fieldset>
  );
}
