import React from 'react';
import { Button, Icon, cx, useId } from '../../core';
import { useClickAway } from '../internal/ModalFrame';
import { phraseSimilarity, templateBreadcrumb } from '../utils/templates';

/** A section that can be inserted into the note. */
export interface SectionEntry {
  id: string;
  title: string;
  /** Headings above it, most general first, for the breadcrumb label (Theme 2). */
  path: string[];
  synonyms?: string[];
  abbreviations?: string[];
  /** Additional template (score, calculator): opens separately rather than inside the note (Theme 3). */
  additional?: boolean;
}

/** What happened on insert. */
export interface SectionInsertInfo {
  /** The section was already open: its data moves to the new place and the old instance is removed (Theme 8). */
  moved: boolean;
  /** Open sub-sections whose data moves into the inserted super-section (Theme 8). */
  absorbedIds: string[];
}

export interface SectionSearchProps {
  sections: SectionEntry[];
  /** Ids of sections already in the note. */
  openIds?: string[];
  onInsert: (section: SectionEntry, info: SectionInsertInfo) => void;
  /** Open the search at first (e.g. the noting area is blank, Theme 2). */
  defaultOpen?: boolean;
  /** Keyboard shortcut that opens the search. Default Ctrl+Shift+H [suggested: the consultation names no keys]. */
  shortcut?: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } | null;
  /** Label of the button and field. Default "Add a section". */
  label?: string;
  /** Minimum characters before matching. Default 2 [suggested]. */
  minChars?: number;
  className?: string;
}

const DEFAULT_SHORTCUT = { key: 'h', ctrlKey: true, shiftKey: true };
const ariaShortcut = (s: NonNullable<SectionSearchProps['shortcut']>) => [s.ctrlKey && 'Control', s.altKey && 'Alt', s.shiftKey && 'Shift', s.key.toUpperCase()].filter(Boolean).join('+');
const describeShortcut = (s: NonNullable<SectionSearchProps['shortcut']>) => [s.ctrlKey && 'Ctrl', s.altKey && 'Alt', s.shiftKey && 'Shift', s.key.toUpperCase()].filter(Boolean).join('+');

/**
 * Section search for building a note in any order (Noting Using Templates, Themes 2, 3, 4 and 8;
 * experimental): opened by a button or a key combination, results below the field with breadcrumb
 * labels, core and additional sections in one unbiased list, closes on choice, click-away or Escape.
 */
export function SectionSearch({
  sections,
  openIds = [],
  onInsert,
  defaultOpen = false,
  shortcut = DEFAULT_SHORTCUT,
  label = 'Add a section',
  minChars = 2,
  className,
}: SectionSearchProps) {
  const id = useId('cui-ssearch');
  const [open, setOpen] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(-1);
  const [message, setMessage] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  useClickAway(rootRef, open, () => setOpen(false));

  React.useEffect(() => {
    if (!shortcut) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === shortcut.key.toLowerCase() && !!e.ctrlKey === !!shortcut.ctrlKey && !!e.shiftKey === !!shortcut.shiftKey && !!e.altKey === !!shortcut.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcut]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const canSearch = query.replace(/\s/g, '').length >= minChars;
  const results = React.useMemo(() => {
    if (!canSearch) return [];
    const q = query.trim().toLowerCase();
    return sections
      .map((s) => {
        const abbr = (s.abbreviations ?? []).some((a) => a.toLowerCase() === q) ? 3 : 0;
        const score = abbr || Math.max(phraseSimilarity(query, s.title) * 2, ...(s.synonyms ?? []).map((x) => phraseSimilarity(query, x)));
        return { s, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.s.title.localeCompare(b.s.title))
      .map((x) => x.s);
  }, [sections, query, canSearch]);

  const choose = (s: SectionEntry) => {
    const moved = openIds.includes(s.id);
    const absorbedIds = sections.filter((x) => openIds.includes(x.id) && x.id !== s.id && x.path.includes(s.title)).map((x) => x.id);
    onInsert(s, { moved, absorbedIds });
    const name = templateBreadcrumb(s.path, s.title);
    setMessage(
      s.additional
        ? `${s.title} opens separately.`
        : moved
          ? `${name} was already in the note. It has been moved here with its data.`
          : absorbedIds.length
            ? `${name} added. Data already entered in its sub-sections has been moved into it.`
            : `${name} added.`,
    );
    setOpen(false);
    setQuery('');
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && results.length) {
      e.preventDefault();
      setActive((a) => (e.key === 'ArrowDown' ? (a + 1) % results.length : a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === 'Enter' && active >= 0 && results[active]) {
      e.preventDefault();
      choose(results[active]);
    }
  };

  return (
    <div ref={rootRef} className={cx('cui-section-search', className)}>
      {!open ? (
        <Button ref={buttonRef} icon="plus" onClick={() => setOpen(true)} aria-keyshortcuts={shortcut ? ariaShortcut(shortcut) : undefined}>
          {label}
          {shortcut ? <span className="cui-section-search__shortcut">{describeShortcut(shortcut)}</span> : null}
        </Button>
      ) : (
        <div className="cui-section-search__panel">
          <label htmlFor={`${id}-q`} className="cui-section-search__label">{label}</label>
          <div className="cui-section-search__field">
            <span className="cui-section-search__icon" aria-hidden="true"><Icon name="search" /></span>
            <input
              ref={inputRef}
              id={`${id}-q`}
              className="cui-noting-input cui-section-search__input"
              type="text"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={`${id}-list`}
              aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
              }}
              onKeyDown={onKeyDown}
            />
          </div>
          <span className="cui-visually-hidden" aria-live="polite">{canSearch ? `${results.length} sections found` : ''}</span>
          {canSearch ? (
            results.length ? (
              <ul id={`${id}-list`} role="listbox" aria-label="Sections" className="cui-section-search__list">
                {results.map((s, i) => (
                  <li
                    key={s.id}
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={active === i}
                    className={cx('cui-section-search__option', active === i && 'cui-section-search__option--active')}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(s)}
                  >
                    <span className="cui-section-search__name">
                      {s.title}
                      {s.additional ? (
                        <span className="cui-section-search__additional" title="Opens separately">
                          <Icon name="link" size={16} />
                          <span className="cui-visually-hidden">, opens separately</span>
                        </span>
                      ) : null}
                      {openIds.includes(s.id) ? <span className="cui-section-search__open"> (already in note)</span> : null}
                    </span>
                    {s.path.length ? <span className="cui-section-search__crumb">{templateBreadcrumb(s.path)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cui-section-search__none">No matching sections. Try another word or an abbreviation such as PMH.</p>
            )
          ) : null}
        </div>
      )}
      <p className="cui-section-search__message" role="status">{message}</p>
    </div>
  );
}
