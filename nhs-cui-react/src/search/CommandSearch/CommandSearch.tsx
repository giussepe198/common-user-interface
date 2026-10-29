import React from 'react';
import { Button, Icon, cx, useId } from '../../core';
import { smartHighlightParts } from '../utils/smartSearch';

/** One result of a command search. */
export interface CommandSearchItem {
  /** Unique within its source. */
  id: string;
  /** The words shown, e.g. "SMITH, John" or "Caseload". */
  label: string;
  /** Second line that tells look-alikes apart ("Born 12-Mar-1980 (46y), Record number URN-000123"). */
  description?: string;
  /** Where the result goes. */
  href?: string;
  /** Ranges of `label` to mark as matched. */
  matchRanges?: ReadonlyArray<readonly [number, number]>;
  /** Why a close match matched ("Sounds like "kathryn""). */
  matchNote?: string;
  /** A warning shown with the warning symbol (a similar name among the results). */
  warning?: string;
}

/** A group of results with its own search: screens, people, this record's sections. */
export interface CommandSearchSource {
  id: string;
  /** Group heading ("Screens", "People"). */
  label: string;
  /** Results for the text. Synchronous results show at once; a promise is awaited (superseded searches are aborted). */
  search: (query: string, options: { signal: AbortSignal }) => CommandSearchItem[] | Promise<CommandSearchItem[]>;
  /** Characters typed before this source searches. Default 1. */
  minChars?: number;
  /** Wait after typing stops before searching (for a server search). Default 0. */
  debounceMs?: number;
  /** Results shown while the box is empty (recent people). */
  initial?: (options: { signal: AbortSignal }) => CommandSearchItem[] | Promise<CommandSearchItem[]>;
  /** Shown while the text is shorter than `minChars` ("Type 2 letters or a record number to find a person"). */
  hint?: string;
  /**
   * Words saying what the text still needs before this source can search ("Add a given name or a date of birth"), or
   * null when it can search. The source is not searched while this returns words.
   */
  hintFor?: (query: string) => string | null;
  /** Most results shown. Default 8. */
  limit?: number;
}

export interface CommandSearchProps {
  /** Names the panel and its box. Default "Search". */
  label?: string;
  /** In-box prompt. */
  placeholder?: string;
  sources: readonly CommandSearchSource[];
  /** A result was chosen (Enter or a click). The panel does not close itself: close it in `onClose` when you navigate. */
  onSelect: (item: CommandSearchItem, sourceId: string, event: React.SyntheticEvent | KeyboardEvent) => void;
  /** Escape, a click outside or focus leaving the panel. */
  onClose: () => void;
  /**
   * Where the panel starts, in px from the top of the window: below the top bar and any patient banner, which it never
   * covers. Read on open, on scroll and on resize. Default 0.
   */
  getTop?: () => number;
  /** Text to start with. */
  initialQuery?: string;
  className?: string;
}

type Group = { source: CommandSearchSource; status: 'idle' | 'hint' | 'loading' | 'done' | 'error'; items: CommandSearchItem[]; hint?: string };

/**
 * A command-style search panel [suggested]: one box, results grouped by source and navigated with the arrow keys, Enter
 * to open, Escape to close. It is a non-modal panel (no scrim, the page stays visible and usable) placed below the top
 * bar and the patient banner, never over them; under 600px wide it fills the screen below them. The box is an ARIA 1.2
 * combobox controlling a grouped listbox; the result count is announced politely.
 */
export function CommandSearch({ label = 'Search', placeholder, sources, onSelect, onClose, getTop, initialQuery = '', className }: CommandSearchProps) {
  const baseId = useId('cui-command-search');
  const listId = `${baseId}-list`;
  const [query, setQuery] = React.useState(initialQuery);
  const [groups, setGroups] = React.useState<Group[]>(() => sources.map(source => ({ source, status: 'idle', items: [] })));
  const [active, setActive] = React.useState(0);
  const [top, setTop] = React.useState(() => getTop?.() ?? 0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const aborts = React.useRef(new Map<string, AbortController>());

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Stay below the top bar and the banner as they move: the banner turns compact on scroll, and a record's banner may
  // arrive after the panel opens, so the place is also read again a few times a second while the panel is open.
  React.useEffect(() => {
    if (!getTop) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = getTop();
        setTop(prev => (Math.abs(prev - next) < 0.5 ? prev : next));
      });
    };
    measure();
    const every = setInterval(measure, 250);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(every);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [getTop]);

  // Search every source for the text: each on its own clock, a newer search aborting the one before.
  React.useEffect(() => {
    const q = query.trim();
    const setGroup = (id: string, patch: Partial<Group>) => setGroups(prev => prev.map(g => (g.source.id === id ? { ...g, ...patch } : g)));
    for (const source of sources) {
      clearTimeout(timers.current.get(source.id));
      aborts.current.get(source.id)?.abort();
      const controller = new AbortController();
      aborts.current.set(source.id, controller);
      const run = (fn: () => CommandSearchItem[] | Promise<CommandSearchItem[]>) => {
        let out: CommandSearchItem[] | Promise<CommandSearchItem[]>;
        try {
          out = fn();
        } catch {
          setGroup(source.id, { status: 'error', items: [] });
          return;
        }
        if (Array.isArray(out)) {
          setGroup(source.id, { status: 'done', items: out.slice(0, source.limit ?? 8) });
          return;
        }
        setGroup(source.id, { status: 'loading' });
        out.then(
          items => {
            if (!controller.signal.aborted) setGroup(source.id, { status: 'done', items: items.slice(0, source.limit ?? 8) });
          },
          () => {
            if (!controller.signal.aborted) setGroup(source.id, { status: 'error', items: [] });
          },
        );
      };
      if (!q) {
        if (source.initial) run(() => source.initial!({ signal: controller.signal }));
        else setGroup(source.id, { status: 'idle', items: [] });
        continue;
      }
      if (q.length < (source.minChars ?? 1)) {
        setGroup(source.id, { status: source.hint ? 'hint' : 'idle', items: [], hint: source.hint });
        continue;
      }
      const needs = source.hintFor?.(q) ?? null;
      if (needs) {
        setGroup(source.id, { status: 'hint', items: [], hint: needs });
        continue;
      }
      const go = () => run(() => source.search(q, { signal: controller.signal }));
      if (source.debounceMs) {
        setGroup(source.id, { status: 'loading', items: [] });
        timers.current.set(source.id, setTimeout(go, source.debounceMs));
      } else go();
    }
    setActive(0);
  }, [query, sources]);

  React.useEffect(
    () => () => {
      timers.current.forEach(t => clearTimeout(t));
      aborts.current.forEach(a => a.abort());
    },
    [],
  );

  // Close on a click outside (non-modal: the page keeps the click).
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);

  const flat: Array<{ item: CommandSearchItem; sourceId: string }> = [];
  for (const g of groups) for (const item of g.items) flat.push({ item, sourceId: g.source.id });
  const activeIndex = flat.length ? Math.min(active, flat.length - 1) : -1;
  const optionId = (i: number) => `${baseId}-opt-${i}`;
  const loading = groups.some(g => g.status === 'loading');

  React.useEffect(() => {
    const el = activeIndex >= 0 ? document.getElementById(optionId(activeIndex)) : null;
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const choose = (i: number, e: React.SyntheticEvent | KeyboardEvent) => {
    const f = flat[i];
    if (f) onSelect(f.item, f.sourceId, e);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActive(a => (flat.length ? (Math.min(a, flat.length - 1) + 1) % flat.length : 0));
    else if (e.key === 'ArrowUp') setActive(a => (flat.length ? (Math.min(a, flat.length - 1) - 1 + flat.length) % flat.length : 0));
    else if (e.key === 'Home' && e.ctrlKey) setActive(0);
    else if (e.key === 'End' && e.ctrlKey) setActive(Math.max(0, flat.length - 1));
    else if (e.key === 'PageDown') {
      // Next group.
      const cur = flat[activeIndex]?.sourceId;
      const next = flat.findIndex((f, i) => i > activeIndex && f.sourceId !== cur);
      if (next >= 0) setActive(next);
    } else if (e.key === 'PageUp') {
      const cur = flat[activeIndex]?.sourceId;
      let i = activeIndex - 1;
      while (i > 0 && flat[i].sourceId === cur) i--;
      const prevSource = flat[i]?.sourceId;
      while (i > 0 && flat[i - 1].sourceId === prevSource) i--;
      setActive(Math.max(0, i));
    } else if (e.key === 'Enter') {
      if (activeIndex < 0) return;
      choose(activeIndex, e);
    } else if (e.key === 'Escape') onClose();
    else return;
    e.preventDefault();
  };

  const count = flat.length;
  const shownGroups = groups.some(g => g.status !== 'idle');
  const announce = !query.trim() ? '' : loading ? 'Searching' : count ? `${count} ${count === 1 ? 'result' : 'results'}` : 'No results';

  let index = -1;
  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="false"
      aria-label={label}
      className={cx('cui-command-search', className)}
      style={{ '--cui-command-search-top': `${Math.max(0, Math.round(top))}px` } as React.CSSProperties}
      onBlur={e => {
        if (e.relatedTarget && !rootRef.current?.contains(e.relatedTarget as Node)) onClose();
      }}
      data-cui-overlay="non-modal"
    >
      <div className="cui-command-search__head">
        <span className="cui-field-box cui-command-search__box" data-cui-box="">
          <span className="cui-field-box__icon" aria-hidden="true">
            <Icon name="search" size={16} />
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label={label}
            aria-autocomplete="list"
            aria-expanded={count > 0}
            aria-controls={listId}
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            className="cui-field-box__input"
            data-cui-boxed=""
            value={query}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </span>
        <Button variant="quiet" icon="close" onClick={onClose}>Close</Button>
      </div>
      {/* The results scroll inside the panel by design: an intentional scroller, reachable by Tab so the keyboard can
          scroll it too (WCAG 2.1.1). Focus normally stays in the box, which moves through the results with the arrows. */}
      <div className="cui-command-search__body" data-scroll="intentional" role="region" aria-label={`${label} results area`} tabIndex={0}>
        <div id={listId} role={shownGroups ? 'listbox' : undefined} aria-label={shownGroups ? `${label} results` : undefined} className="cui-command-search__list">
          {groups.map(g => {
            if (g.status === 'idle') return null;
            const headingId = `${baseId}-g-${g.source.id}`;
            return (
              <div key={g.source.id} role="group" aria-labelledby={headingId} className="cui-command-search__group">
                <div id={headingId} role="presentation" className="cui-command-search__heading">{g.source.label}</div>
                {g.status === 'hint' ? <div role="presentation" className="cui-command-search__status">{g.hint}</div> : null}
                {g.status === 'loading' && !g.items.length ? <div role="presentation" className="cui-command-search__status">Searching</div> : null}
                {g.status === 'error' ? (
                  <div role="presentation" className="cui-command-search__status cui-command-search__status--error">
                    <Icon name="error" size={16} /> These results could not be loaded. Try again.
                  </div>
                ) : null}
                {g.status === 'done' && !g.items.length && query.trim() ? <div role="presentation" className="cui-command-search__status">Nothing found</div> : null}
                {g.items.map(item => {
                  index += 1;
                  const i = index;
                  const parts = item.matchRanges?.length ? smartHighlightParts(item.label, item.matchRanges) : [{ text: item.label, hit: false }];
                  return (
                    <div
                      key={`${g.source.id}:${item.id}`}
                      id={optionId(i)}
                      role="option"
                      aria-selected={i === activeIndex}
                      className={cx('cui-command-search__option', i === activeIndex && 'cui-command-search__option--active')}
                      onMouseDown={e => e.preventDefault()}
                      onMouseMove={() => i !== activeIndex && setActive(i)}
                      onClick={e => choose(i, e)}
                    >
                      <span className="cui-command-search__label">
                        {parts.map((p, k) => (p.hit ? <mark key={k} className="cui-search-hit">{p.text}</mark> : <React.Fragment key={k}>{p.text}</React.Fragment>))}
                      </span>
                      {item.description ? <span className="cui-command-search__description">{item.description}</span> : null}
                      {item.matchNote ? (
                        <span className="cui-command-search__description cui-command-search__note"><Icon name="info" size={16} />{item.matchNote}</span>
                      ) : null}
                      {item.warning ? (
                        <span className="cui-command-search__warning"><Icon name="warning" size={16} />{item.warning}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <p className="cui-command-search__keys" aria-hidden="true">Up and down arrows to move, Enter to open, Esc to close</p>
      </div>
      <div className="cui-visually-hidden" aria-live="polite">{announce}</div>
    </div>
  );
}
