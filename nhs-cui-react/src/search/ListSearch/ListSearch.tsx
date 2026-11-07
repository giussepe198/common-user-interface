import React from 'react';
import { Button, Icon, cx } from '../../core';
import { SearchInput } from '../../forms/SearchInput/SearchInput';
import { MenuButton } from '../../shell/MenuButton/MenuButton';
import { smartCountWords, smartHighlightParts, type SmartQueryScope, type SmartSearchSuggestion } from '../utils/smartSearch';

export interface ListSearchProps {
  /** Names the search and its landmark, e.g. "Search referrals". */
  label: string;
  /** The query (controlled). */
  value: string;
  onChange: (value: string) => void;
  /** Fields that can limit a word ("Team", "Status"), offered under "Search in" and typed as "team:north". */
  scopes?: ReadonlyArray<{ key: string; label: string }>;
  /** Scopes in the query, shown as chips that remove themselves. */
  activeScopes?: ReadonlyArray<SmartQueryScope>;
  /** Rows that match, and rows searched. */
  shown: number;
  total: number;
  /** Plural noun for rows ("referrals"). */
  rowNoun: string;
  /** Singular noun ("referral"). Default the plural without its final "s". */
  rowNounSingular?: string;
  /** Some matches are close spellings or sound alike. */
  closeMatches?: boolean;
  /** When nothing matches: queries that do find something. */
  suggestions?: ReadonlyArray<SmartSearchSuggestion>;
  /** In-box prompt. Default "Name, number, date or word". */
  placeholder?: string;
  className?: string;
}

/** "Search referrals" for a list called "Referrals" (an acronym or a capitalised second letter is kept). */
export function listSearchLabel(name: string): string {
  const t = name.trim();
  return `Search ${/^\p{Lu}\p{Ll}/u.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t}`;
}

/** The word that selects a scope: its key when that is one plain word, else its label without spaces. */
export function listScopeWord(scope: { key: string; label: string }): string {
  if (/^[a-z][a-z0-9_-]*$/i.test(scope.key)) return scope.key.toLowerCase();
  return scope.label.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

/**
 * The search box of a list [suggested]: words in any order, close spellings and similar-sounding names, identifiers
 * and dates, with fields chosen under "Search in" or typed ("team:north"). It says how many rows match in words, marks
 * close matches, and when nothing matches offers the closest queries that find something and "Show all <rows>".
 */
export function ListSearch({
  label, value, onChange, scopes = [], activeScopes = [], shown, total, rowNoun, rowNounSingular, closeMatches, suggestions = [],
  placeholder = 'Name, number, date or word', className,
}: ListSearchProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const searching = !!value.trim();
  const noun = { plural: rowNoun, singular: rowNounSingular };
  const set = (q: string, focus = true) => {
    onChange(q);
    if (focus) requestAnimationFrame(() => inputRef.current?.focus());
  };
  const addScope = (s: { key: string; label: string }) => set(`${value.trim()} ${listScopeWord(s)}:`.trimStart());
  const removeScope = (s: SmartQueryScope) => set(value.replace(s.raw, ' ').replace(/\s+/g, ' ').trim());

  const count = smartCountWords(shown, total, noun, searching);
  return (
    <div className={cx('cui-list-search', className)} role="search" aria-label={label}>
      <div className="cui-list-search__row">
        <SearchInput
          ref={inputRef}
          aria-label={label}
          value={value}
          onChange={q => onChange(q)}
          placeholder={placeholder}
          className="cui-list-search__input"
          spellCheck={false}
        />
        {scopes.length ? (
          <MenuButton
            label="Search in"
            variant="quiet"
            items={scopes.map(s => ({ id: s.key, label: s.label, description: `Type ${listScopeWord(s)}:` }))}
            onAction={id => {
              const s = scopes.find(x => x.key === id);
              if (s) addScope(s);
            }}
          />
        ) : null}
      </div>
      {activeScopes.length ? (
        <ul className="cui-list-search__chips" aria-label="Searching in">
          {activeScopes.map(s => (
            <li key={s.raw}>
              <button type="button" className="cui-list-search__chip" aria-label={`Remove ${s.label}: ${s.value}`} onClick={() => removeScope(s)}>
                <span className="cui-list-search__chip-field">{s.label}:</span> {s.value}
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p className={cx('cui-list-search__count', !searching && 'cui-visually-hidden')} aria-live="polite">
        {searching && shown > 0 && closeMatches ? `${count}. Close matches are marked and come last` : searching ? count : ''}
      </p>
      {searching && shown === 0 ? (
        <div className="cui-list-search__none">
          <p className="cui-list-search__none-text">
            <Icon name="info" size={16} /> {`No ${rowNoun} match "${value.trim()}".`}
          </p>
          {suggestions.length ? (
            <p className="cui-list-search__suggest">
              <span>Closest:</span>
              {suggestions.map(s => (
                <Button key={s.query} size="sm" variant="secondary" onClick={() => set(s.query)} aria-label={`Search for ${s.query}, ${s.count} ${s.count === 1 ? noun.singular ?? rowNoun.replace(/s$/, '') : rowNoun}`}>
                  {s.query} ({s.count})
                </Button>
              ))}
            </p>
          ) : null}
          <Button size="sm" variant="quiet" icon="close" onClick={() => set('')}>{`Show all ${rowNoun}`}</Button>
        </div>
      ) : null}
    </div>
  );
}

/** Text with the matched parts marked [suggested]: a strong weight, never colour alone. */
export function SearchHighlight({ text, ranges }: { text: string; ranges: ReadonlyArray<readonly [number, number]> }) {
  if (!ranges.length) return <>{text}</>;
  return (
    <>
      {smartHighlightParts(text, ranges).map((p, i) =>
        p.hit ? (
          <mark key={i} className="cui-search-hit">{p.text}</mark>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ),
      )}
    </>
  );
}

/** Why a row is a close match, under its key cell ("Sounds like "kathryn""). */
export function SearchMatchNote({ note }: { note: string | null }) {
  if (!note) return null;
  return (
    <span className="cui-search-note">
      <Icon name="info" size={16} /> {note}
    </span>
  );
}
