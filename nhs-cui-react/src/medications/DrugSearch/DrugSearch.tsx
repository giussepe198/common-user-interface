import React from 'react';
import { cx, formatShortDate, Icon, useClinicalLocale, useControllableState, useId, VisuallyHidden } from '../../core';
import type { ClinicalRegion , DateLike } from '../../core';
import type {
  DrugCatalogueEntry, DrugSearchGroup, DrugSearchGroupResult, DrugSearchOutcome,
  DrugSearchResult} from '../utils/drugSearch';
import { drugSearchGroupLabel, drugSearchGroupMembers, drugSearchCountMessage, drugSearchFeedback, drugShortcutLabel, searchDrugCatalogue,
} from '../utils/drugSearch';
import { tallManDefaultFor } from '../utils/tallMan';
import type { DrugNameDisplay } from './DrugName';
import { directResult, DrugName } from './DrugName';

/** A centrally managed Quick List (MSP-0060, MSP-0090). Up to 10 drug names, no templates (MSP-0120/0130). */
export interface DrugQuickList {
  id: string;
  /** Shown in the "Quick List" selector, e.g. "General Medicine" (MSP-0270). */
  name: string;
  /** Description of the contents, e.g. "10 commonly prescribed medications" (MSP-0090). */
  description: string;
  items: DrugCatalogueEntry[];
}

export interface DrugSearchProps {
  /** Searchable drug names. Matching follows MSP-0500 to MSP-0840. */
  catalogue: DrugCatalogueEntry[];
  /** Replace the built-in search (must still follow MSP-0500 to MSP-0540). */
  search?: (query: string) => DrugSearchOutcome;
  /**
   * Asynchronous search, e.g. a terminology server. Called after `debounceMs` with an AbortSignal that is
   * aborted when the text changes. "Searching..." is shown meanwhile (MSP 5.3.4 feedback while processing).
   */
  searchAsync?: (query: string, signal: AbortSignal) => Promise<DrugSearchOutcome>;
  /** Delay before an asynchronous search starts, in ms ("a slight delay", MSP 5.3.3) [suggested 250]. */
  debounceMs?: number;
  /** The consumer is still fetching results for the current text: show the busy state. */
  busy?: boolean;
  /** Groups of related, less commonly prescribed drugs for the built-in search (MSP-0550/0560). Members carry `groupId`. */
  groups?: DrugSearchGroup[];
  /** Jurisdiction; otherwise read from ClinicalLocaleProvider. AU and NZ show brands in Title Case (AU italic) and apply mixed-case lettering. */
  region?: ClinicalRegion;
  /** Mixed-case (Tall Man) lettering in results and the Quick List (AU on-screen 6.1.4, NZ HQSC list). Default on for AU and NZ, off for GB. */
  tallManLettering?: boolean;
  /** Local mixed-case forms added to the regional list (AU-MD-04). */
  tallManForms?: readonly string[];
  /** Visible label above the box [suggested]. Default "Drug search". */
  label?: string;
  /** In-field prompt describing the scope (MSP-0290/0300). Default "Type a drug name to search". */
  placeholder?: string;
  /** Search text (controlled). */
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Selected drug (controlled). */
  value?: DrugCatalogueEntry | null;
  defaultValue?: DrugCatalogueEntry | null;
  /** Called when a drug is chosen from the results or the Quick List. */
  onSelect?: (entry: DrugCatalogueEntry) => void;
  /** Maximum result rows before "Show all" (MSP-0430/0440). Default 10. */
  maxVisibleRows?: number;
  /** Quick Lists; one is always shown by default when the search box is empty (MSP-0080). */
  quickLists?: DrugQuickList[];
  quickListId?: string;
  defaultQuickListId?: string;
  onQuickListChange?: (id: string) => void;
  /** Quick List changed since last shown: a date ("...were updated on 23-Jun-2008.") or true ("...have changed.") (MSP-0170). */
  quickListChangedOn?: DateLike | true;
  /** Notice closed. `permanent` is true when "Don't show this message again" was ticked (MSP-0180/0190). */
  onQuickListNoticeDismiss?: (permanent: boolean) => void;
  /** Label of the prioritised section (MSP-0640). Default "Commonly prescribed matches". */
  prioritisedLabel?: string;
  /** Label of the standard section (MSP-0660). Default "Standard matches". */
  standardLabel?: string;
  /** Warning beside often mis-selected names (MSP-0720). Default "this drug is often mis-selected". */
  misSelectionText?: string;
  /** Modifier for shortcut keys (MSP-0140/0690). Default "Ctrl". */
  shortcutModifier?: 'Ctrl' | 'Alt';
  /** After selection, replace the box and results with the selected name (MSP-0350/0360). Default false. */
  collapseOnSelect?: boolean;
  className?: string;
  id?: string;
}

type Row =
  | { kind: 'heading'; text: string; first: boolean }
  | { kind: 'result'; result: DrugSearchResult; shaded: boolean; shortcut?: string }
  | { kind: 'group'; group: DrugSearchGroupResult; shaded: boolean };

type Option = { kind: 'drug'; entry: DrugCatalogueEntry } | { kind: 'group'; group: DrugSearchGroupResult };

const EMPTY: DrugSearchOutcome = { prioritised: [], standard: [], total: 0 };

/**
 * Drug search box with results and Quick List (Search and Prescribe, section 4 and 5):
 * progressive beginning-of-word matching on generic and brand names, generic before brand,
 * prioritised and standard sections, height-limited results with "Show all", feedback messages,
 * spelling and synonym matches inline, mis-selection warnings and keyboard shortcuts.
 */
export function DrugSearch({
  catalogue, search, searchAsync, debounceMs = 250, busy: busyProp = false, groups, region: regionProp, tallManLettering, tallManForms,
  label = 'Drug search', placeholder = 'Type a drug name to search', query: queryProp, defaultQuery = '',
  onQueryChange, value: valueProp, defaultValue = null, onSelect, maxVisibleRows = 10, quickLists = [], quickListId: qlProp,
  defaultQuickListId, onQuickListChange, quickListChangedOn, onQuickListNoticeDismiss,
  prioritisedLabel = 'Commonly prescribed matches', standardLabel = 'Standard matches',
  misSelectionText = 'this drug is often mis-selected', shortcutModifier = 'Ctrl', collapseOnSelect = false, className, id,
}: DrugSearchProps) {
  const uid = useId('cui-drug-search', id);
  const { region } = useClinicalLocale(regionProp);
  const nameOpts: DrugNameDisplay = { region, tallMan: tallManLettering ?? tallManDefaultFor(region), tallManForms, misSelectionText };
  const [query, setQuery] = useControllableState(queryProp, defaultQuery, onQueryChange);
  const [selected, setSelected] = useControllableState<DrugCatalogueEntry | null>(valueProp, defaultValue, undefined);
  const [qlId, setQlId] = useControllableState(qlProp, defaultQuickListId ?? quickLists[0]?.id ?? '', onQuickListChange);
  const [showAll, setShowAll] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [noticeOpen, setNoticeOpen] = React.useState(quickListChangedOn != null);
  const [noticeForget, setNoticeForget] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const collapsedBtn = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => { setNoticeOpen(quickListChangedOn != null); }, [quickListChangedOn]);

  // A group opened from the results replaces the text with its title and the results with its members (MSP-0560).
  const [openGroup, setOpenGroup] = React.useState<DrugSearchGroup | null>(null);
  const groupOpen = !!openGroup && query === openGroup.title;

  // Asynchronous search: debounce, abort stale requests, keep the latest outcome for its query.
  const [asyncState, setAsyncState] = React.useState<{ query: string; outcome: DrugSearchOutcome | null; error: boolean } | null>(null);
  React.useEffect(() => {
    if (!searchAsync || groupOpen) return undefined;
    if (query.replace(/\s/g, '').length < 2) { setAsyncState(null); return undefined; }
    const ctrl = new AbortController();
    setAsyncState(s => (s && s.query === query ? s : { query, outcome: null, error: false }));
    const timer = setTimeout(() => {
      searchAsync(query, ctrl.signal).then(
        outcome => { if (!ctrl.signal.aborted) setAsyncState({ query, outcome, error: false }); },
        () => { if (!ctrl.signal.aborted) setAsyncState({ query, outcome: null, error: true }); },
      );
    }, debounceMs);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [searchAsync, query, debounceMs, groupOpen]);

  const syncOutcome = React.useMemo(
    () => (searchAsync ? null : search ? search(query) : searchDrugCatalogue(query, catalogue, { groups })),
    [search, searchAsync, query, catalogue, groups],
  );
  const asyncReady = !!asyncState && asyncState.query === query && !!asyncState.outcome;
  const asyncError = !!asyncState && asyncState.query === query && asyncState.error;
  const tooShort = query.replace(/\s/g, '').length < 2;
  const busy = !groupOpen && !tooShort && (busyProp || (!!searchAsync && !asyncReady && !asyncError));
  const groupMembers = React.useMemo(() => (groupOpen && openGroup ? drugSearchGroupMembers(openGroup, catalogue) : null), [groupOpen, openGroup, catalogue]);
  const outcome: DrugSearchOutcome = groupMembers
    ? { prioritised: [], standard: groupMembers, total: groupMembers.length }
    : syncOutcome ?? (asyncReady ? (asyncState!.outcome as DrugSearchOutcome) : EMPTY);
  const feedback = asyncError
    ? 'The search could not be completed. Try again.'
    : busy && !tooShort ? null : drugSearchFeedback(query, outcome.total);
  const hasQuery = query.trim().length > 0;
  const quickList = quickLists.find(q => q.id === qlId) ?? quickLists[0];
  const showingQuickList = !hasQuery && !!quickList;

  // Flattened rows with section headings; shading restarts per section (MSP-0800).
  const rows: Row[] = [];
  const options: Option[] = [];
  let truncated = false;
  if (hasQuery && !feedback && !busy) {
    const limit = showAll ? Infinity : maxVisibleRows;
    let count = 0;
    const hasPri = outcome.prioritised.length > 0;
    const add = (list: DrugSearchResult[], heading: string | null, withShortcuts: boolean) => {
      if (!list.length || count >= limit) return;
      if (heading) rows.push({ kind: 'heading', text: heading, first: rows.length === 0 });
      list.forEach((result, i) => {
        if (count >= limit) { truncated = true; return; }
        rows.push({ kind: 'result', result, shaded: i % 2 === 1, shortcut: withShortcuts ? drugShortcutLabel(i)?.replace('Ctrl', shortcutModifier) : undefined });
        options.push({ kind: 'drug', entry: result.entry });
        count++;
      });
    };
    // Omit section labels when there are no prioritised matches (MSP-0670).
    add(outcome.prioritised, hasPri ? prioritisedLabel : null, true);
    const standardCount = outcome.standard.length;
    add(outcome.standard, hasPri ? standardLabel : null, false);
    // Group rows after the standard matches, shading continuing in the section (MSP-0550, MSP-0800).
    (outcome.groups ?? []).forEach((group, gi) => {
      if (count >= limit) { truncated = true; return; }
      if (hasPri && !standardCount && gi === 0) rows.push({ kind: 'heading', text: standardLabel, first: rows.length === 0 });
      rows.push({ kind: 'group', group, shaded: (standardCount + gi) % 2 === 1 });
      options.push({ kind: 'group', group });
      count++;
    });
    if (count < outcome.total) truncated = true;
  } else if (showingQuickList) {
    quickList.items.slice(0, 10).forEach((entry, i) => {
      rows.push({ kind: 'result', result: directResult(entry), shaded: i % 2 === 1, shortcut: drugShortcutLabel(i)?.replace('Ctrl', shortcutModifier) });
      options.push({ kind: 'drug', entry });
    });
  }
  const shownCount = options.length;
  const activeIdx = Math.min(active, Math.max(0, options.length - 1));

  const closeNotice = (permanent: boolean) => {
    if (!noticeOpen) return;
    setNoticeOpen(false);
    onQuickListNoticeDismiss?.(permanent);
  };

  const choose = (entry: DrugCatalogueEntry) => {
    setSelected(entry);
    onSelect?.(entry);
    closeNotice(noticeForget); // auto-close on selection (MSP-0220)
    if (collapseOnSelect) {
      setCollapsed(true);
      setTimeout(() => collapsedBtn.current?.focus(), 0);
    }
  };

  const openGroupRow = (g: DrugSearchGroupResult) => {
    setOpenGroup(g.group);
    setQuery(g.group.title);
    setShowAll(false);
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const activate = (o: Option) => (o.kind === 'group' ? openGroupRow(o.group) : choose(o.entry));

  const focusOption = (i: number) => {
    const n = Math.max(0, Math.min(options.length - 1, i));
    setActive(n);
    const el = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[n];
    el?.focus();
  };

  const onRootKeyDown = (e: React.KeyboardEvent) => {
    const mod = shortcutModifier === 'Ctrl' ? e.ctrlKey : e.altKey;
    if (mod && /^[0-9]$/.test(e.key)) {
      const n = e.key === '0' ? 9 : Number(e.key) - 1;
      // Shortcuts select only prioritised matches (MSP-0680) or Quick List items, and are locked while the change notice is open (MSP-0230).
      if (showingQuickList && noticeOpen) return;
      const target = rows.filter((r): r is Extract<Row, { kind: 'result' }> => r.kind === 'result' && !!r.shortcut)[n];
      if (target) { e.preventDefault(); choose(target.result.entry); }
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && options.length) { e.preventDefault(); focusOption(0); }
    else if (e.key === 'Escape' && query) { e.preventDefault(); setQuery(''); setShowAll(false); }
  };

  const onOptionKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); focusOption(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (i === 0) inputRef.current?.focus(); else focusOption(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusOption(0); }
    else if (e.key === 'End') { e.preventDefault(); focusOption(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(options[i]); }
    else if (e.key === 'Escape') { e.preventDefault(); inputRef.current?.focus(); }
  };

  if (collapsed && selected) {
    const r: DrugSearchResult = directResult(selected);
    return (
      <div className={cx('cui-drug-search', className)} id={uid}>
        <span className="cui-drug-search__label" id={`${uid}-label`}>{label}</span>
        <button
          ref={collapsedBtn}
          type="button"
          className="cui-drug-search__collapsed"
          aria-describedby={`${uid}-label`}
          onClick={() => { setCollapsed(false); setTimeout(() => inputRef.current?.focus(), 0); }}
        >
          <DrugName r={r} opts={nameOpts} />
          <Icon name="pencil" label="Change drug" />
        </button>
      </div>
    );
  }

  let optionIndex = -1;
  const statusText = busy ? 'Searching' : feedback ?? (hasQuery && truncated ? drugSearchCountMessage(shownCount, outcome.total) : hasQuery ? `${outcome.total} match${outcome.total === 1 ? '' : 'es'}` : '');
  const noticeText = quickListChangedOn === true
    ? 'The contents of the Quick List have changed.'
    : quickListChangedOn != null ? `The contents of the Quick List were updated on ${formatShortDate(quickListChangedOn)}.` : '';

  return (
    <div className={cx('cui-drug-search', className)} id={uid} onKeyDown={onRootKeyDown}>
      <label className="cui-drug-search__label" htmlFor={`${uid}-input`}>{label}</label>
      <div className="cui-drug-search__box">
        <Icon name="search" size={16} className="cui-drug-search__icon" />
        <input
          ref={inputRef}
          id={`${uid}-input`}
          className="cui-drug-search__input"
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-controls={!busy && !feedback ? `${uid}-list` : undefined}
          aria-describedby={`${uid}-status`}
          onChange={e => {
            setQuery(e.target.value);
            setOpenGroup(null);
            setShowAll(false);
            setActive(0);
            if (e.target.value) closeNotice(noticeForget); // auto-close on typing (MSP-0220)
          }}
          onKeyDown={onInputKeyDown}
        />
        {query ? (
          <button type="button" tabIndex={-1} className="cui-drug-search__clear" onClick={() => { setQuery(''); setShowAll(false); inputRef.current?.focus(); }}>
            <Icon name="close" label="Clear search" />
          </button>
        ) : null}
      </div>

      {showingQuickList && quickLists.length > 1 ? (
        <label className="cui-drug-search__ql-select">
          <span className="cui-drug-search__label">Quick List</span>
          <select value={quickList.id} onChange={e => setQlId(e.target.value)}>
            {quickLists.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
          </select>
        </label>
      ) : null}

      <div className="cui-drug-search__area">
        <div className={cx('cui-drug-search__results', showAll && 'is-expanded')} style={showAll ? { maxHeight: `calc(${maxVisibleRows} * 30px + 8px)` } : undefined}>
          {showingQuickList ? <div className="cui-drug-search__ql-desc">{quickList.description}</div> : null}
          {busy ? (
            <div className="cui-drug-search__message cui-drug-search__message--busy" aria-busy="true">
              <span className="cui-drug-search__spinner" aria-hidden="true" />
              Searching...
            </div>
          ) : feedback ? (
            <div className="cui-drug-search__message">{feedback}</div>
          ) : (
            <ul
              ref={listRef}
              id={`${uid}-list`}
              role="listbox"
              aria-label={showingQuickList ? `Quick List: ${quickList.name}` : groupOpen && openGroup ? `Group: ${openGroup.title}` : 'Search results'}
              className="cui-drug-search__list"
            >
              {rows.map((row, ri) => {
                if (row.kind === 'heading') {
                  return (
                    <li key={`h${ri}`} role="presentation" className={cx('cui-drug-search__section', !row.first && 'cui-drug-search__section--divided')}>
                      {row.text}
                    </li>
                  );
                }
                optionIndex++;
                const i = optionIndex;
                if (row.kind === 'group') {
                  const g = row.group;
                  return (
                    <li
                      key={`g${g.group.id}`}
                      role="option"
                      aria-selected={false}
                      aria-label={`${drugSearchGroupLabel(g)}, group of related drugs. Press Enter to show.`}
                      tabIndex={i === activeIdx ? 0 : -1}
                      className={cx('cui-drug-search__option', 'cui-drug-search__option--group', row.shaded && 'is-shaded')}
                      onClick={() => { setActive(i); openGroupRow(g); }}
                      onFocus={() => setActive(i)}
                      onKeyDown={e => onOptionKeyDown(e, i)}
                    >
                      <span className="cui-drug-search__group-name">
                        <strong className="cui-drug-search__generic">{g.group.title}</strong> ({g.count})
                      </span>
                      <span className="cui-drug-search__group-show" aria-hidden="true">Show</span>
                    </li>
                  );
                }
                const r = row.result;
                const isSel = !!selected && selected.id === r.entry.id;
                return (
                  <li
                    key={`${r.entry.id}-${ri}`}
                    role="option"
                    aria-selected={isSel}
                    tabIndex={i === activeIdx ? 0 : -1}
                    className={cx('cui-drug-search__option', row.shaded && 'is-shaded', r.entry.misSelectionRisk && 'is-risk', isSel && 'is-selected')}
                    onClick={() => { setActive(i); choose(r.entry); }}
                    onFocus={() => setActive(i)}
                    onKeyDown={e => onOptionKeyDown(e, i)}
                  >
                    <DrugName r={r} opts={nameOpts} />
                    {row.shortcut ? <span className="cui-drug-search__shortcut"><VisuallyHidden>, shortcut </VisuallyHidden>{row.shortcut}</span> : null}
                  </li>
                );
              })}
            </ul>
          )}
          {hasQuery && truncated && !feedback ? (
            <div className="cui-drug-search__more">
              <span>{drugSearchCountMessage(shownCount, outcome.total)}</span>
              <button type="button" className="cui-drug-search__show-all" onClick={() => { setShowAll(true); setTimeout(() => focusOption(shownCount), 0); }}>
                Show all
              </button>
            </div>
          ) : null}
        </div>
        {showingQuickList && noticeOpen && noticeText ? (
          <div className="cui-drug-search__notice" role="note" aria-label="Quick List changed">
            <div className="cui-drug-search__notice-text">
              <Icon name="info" size={16} />
              <span>{noticeText}</span>
            </div>
            <label className="cui-drug-search__notice-check" data-touch-target>
              <input type="checkbox" checked={noticeForget} onChange={e => setNoticeForget(e.target.checked)} />
              Don't show this message again
            </label>
            <button type="button" className="cui-drug-search__notice-close" onClick={() => closeNotice(noticeForget)}>Close</button>
            <span className="cui-drug-search__notice-hint">Shortcut keys are turned off while this message is open.</span>
          </div>
        ) : null}
      </div>
      <div id={`${uid}-status`} className="cui-visually-hidden" aria-live="polite">{statusText}</div>
    </div>
  );
}
