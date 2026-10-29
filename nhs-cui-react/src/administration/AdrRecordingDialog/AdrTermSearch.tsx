import React from 'react';
import { Button, cx, Icon } from '../../core';
import type { AdrConcept} from '../utils/adr';
import { adrConceptLabel } from '../utils/adr';

export interface AdrTermSearchProps {
  id: string;
  /** id of the visible label element. */
  labelledBy: string;
  search?: (text: string) => AdrConcept[] | Promise<AdrConcept[]>;
  onSelect: (c: AdrConcept) => void;
  /** Accept the typed text as uncoded free text (RAD-0191). */
  onFreeText?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  minChars?: number;
  describedBy?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, text: string) => void;
}

/**
 * Terminology search: matches after three characters or on Enter or the search button; results
 * show "(class)" for class concepts and a definition for the highlighted term; no match offers
 * free text, clearly marked as not coded (RAD-0160 to RAD-0191, A.5).
 */
export function AdrTermSearch({
  id,
  labelledBy,
  search,
  onSelect,
  onFreeText,
  placeholder,
  disabled,
  autoFocus,
  minChars = 3,
  describedBy,
  inputRef,
  onKeyDown,
}: AdrTermSearchProps) {
  const [text, setText] = React.useState('');
  const [results, setResults] = React.useState<AdrConcept[]>([]);
  const [open, setOpen] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  const seq = React.useRef(0);
  const listId = `${id}-list`;

  const run = (q: string) => {
    if (!search || q.trim().length === 0) return;
    const n = ++seq.current;
    Promise.resolve(search(q.trim())).then(r => {
      if (n !== seq.current) return;
      setResults(r);
      setHi(0);
      setSearched(true);
      setOpen(true);
    });
  };

  const pick = (c: AdrConcept) => {
    onSelect(c);
    setText('');
    setResults([]);
    setOpen(false);
    setSearched(false);
  };

  const free = () => {
    if (!onFreeText || !text.trim()) return;
    onFreeText(text.trim());
    setText('');
    setResults([]);
    setOpen(false);
    setSearched(false);
  };

  const active = open && results[hi];

  return (
    <div className="cui-adr-search">
      <div className="cui-adr-search__row">
        <input
          ref={inputRef}
          id={id}
          className="cui-adr-search__input"
          role="combobox"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active ? `${id}-opt-${hi}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          value={text}
          onChange={e => {
            const v = e.target.value;
            setText(v);
            if (v.trim().length >= minChars) run(v);
            else {
              setOpen(false);
              setSearched(false);
            }
          }}
          onKeyDown={e => {
            onKeyDown?.(e, text);
            if (e.defaultPrevented) return;
            if (e.key === 'ArrowDown' && open) {
              e.preventDefault();
              setHi(Math.min(results.length - 1, hi + 1));
            } else if (e.key === 'ArrowUp' && open) {
              e.preventDefault();
              setHi(Math.max(0, hi - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (active) pick(results[hi]);
              else run(text);
            } else if (e.key === 'Escape' && open) {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }
          }}
        />
        <Button size="sm" icon="search" iconOnly disabled={disabled} onClick={() => run(text)}>
          Search
        </Button>
      </div>
      {open ? (
        <div className="cui-adr-search__pop">
          {results.length ? (
            <>
              <ul className="cui-adr-search__list" id={listId} role="listbox" aria-labelledby={labelledBy}>
                {results.map((r, i) => (
                  <li
                    key={`${r.code ?? r.term}-${i}`}
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={i === hi}
                    className={cx('cui-adr-search__opt', i === hi && 'cui-adr-search__opt--hi')}
                    onMouseDown={e => e.preventDefault()}
                    onMouseEnter={() => setHi(i)}
                    onClick={() => pick(r)}
                  >
                    {adrConceptLabel(r)}
                  </li>
                ))}
              </ul>
              {active && results[hi].definition ? (
                <div className="cui-adr-search__def" aria-live="polite">
                  <span className="cui-label">Definition</span>
                  <span>{results[hi].definition}</span>
                </div>
              ) : null}
            </>
          ) : searched ? (
            <div className="cui-adr-search__none" id={listId} role="status">
              <span>
                <Icon name="warning" size={16} /> "{text}" was not recognised as a coded term.
              </span>
              {onFreeText ? (
                <Button size="sm" onClick={free}>
                  Use as free text (not coded)
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
