import React from 'react';
import { Button, Icon, cx, useClinicalLocale, useControllableState, useId, type ClinicalRegion } from '../../core';
import { ConceptFlyout } from '../ConceptFlyout/ConceptFlyout';
import { RequiredFieldIndicator } from '../RequiredFieldIndicator/RequiredFieldIndicator';
import { selectPreferredTerm, type TermDescription } from '../utils/preferredTerm';
import { terminologyEditionFor, type SnomedEditionInfo, type TerminologySubsetInfo } from '../utils/regions/terminology';
import { createRequestSequencer, type RequestTicket } from '../utils/requestSequencer';
import { composeTermText, findTermMatchRanges, tokeniseSearchText } from '../utils/searchText';
import { orderTermResults, stripSemanticTag, wrapTermLabel, type TermOrderStrategy } from '../utils/termResults';

/** One search result as returned by the consumer's search function. */
export interface TerminologyResult {
  /** Stable key (concept or description id). Used for keys only and never displayed (SCT-044). */
  id: string;
  /** Matched description: Preferred term or synonym, never the FSN as primary (Matching 2.3.2). */
  term: string;
  /** Fully specified name, shown in the details flyout. */
  fsn?: string;
  /** Preferred term, shown in the flyout when `term` is a synonym. */
  preferredTerm?: string;
  /** `term` is a synonym (Matching 2.3.1, SCT-045). */
  isSynonym?: boolean;
  /** In the clinical authority's common-matches list (CNA-0210). */
  isCommon?: boolean;
  /** Frequency of use (for the 'frequency' ordering). */
  frequency?: number;
  /** Engine relevance score, higher first (for 'relevance' ordering). */
  score?: number;
  /** Parent concepts for the flyout ("Is a", "And a"). */
  parents?: string[];
  /**
   * The term is an abbreviation that the description does not expand (e.g. "SLE"): shown as
   * "SLE - Systemic lupus erythematosus" using the FSN minus its semantic tag (Matching 2.3.4, SCT-046).
   */
  isUnexpandedAbbreviation?: boolean;
  /**
   * All descriptions of the concept with their language reference set acceptability. When given,
   * the displayed term is chosen by the region's language reference set (AU 11, NZ 10; SCT-007 in GB)
   * instead of `term`. Macrons are always displayed as supplied.
   */
  descriptions?: TermDescription[];
  /** Language of `term` when it is not English, e.g. "mi" (marked with a `lang` attribute, WCAG 3.1.2). */
  lang?: string;
}

/** Options passed to the consumer's search on every request. */
export interface TerminologySearchRequest {
  /** Abort work when this fires (a newer request superseded it). */
  signal: AbortSignal;
  /** Region of the control. */
  region: ClinicalRegion;
  /** Edition to search: URI, module and language reference set (AU-TM-01; NZ 10; SCT-001). */
  edition: SnomedEditionInfo;
  /** Subset, reference set or value set the user filtered by, if any (Matching 2.4.1). */
  subset?: TerminologySubsetInfo | null;
  /** Matching should ignore macrons and other diacritics (SCT-018/019; NZ 11.1). */
  foldDiacritics: boolean;
}

/** Consumer-supplied asynchronous search. Abort work when `signal` fires. */
export type TerminologySearchFn = (query: string, options: TerminologySearchRequest) => Promise<TerminologyResult[]>;

export interface TerminologySearchProps {
  /** Runs the search. Responses that arrive out of order are ignored (Matching 2.3.1). */
  search: TerminologySearchFn;
  /**
   * Visible instructional label (CNA-0130). Omit it when the control is wrapped in `FormField`, whose label then
   * labels the input (the search box gets the id FormField passes).
   */
  label?: string;
  /** Hide the label visually (it is still read by screen readers). Use only when a heading labels the field. */
  hideLabel?: boolean;
  /** In-field prompt: grey italic, no examples, stays on focus and goes when typing (CNA-0140, CNA-0250..0280). */
  placeholder?: string;
  /** Prompting text below the field, low prominence, with an example of what to type (CNA-0150..0170). */
  helpText?: string;
  /** Typed text (controlled). */
  query?: string;
  /** Initial typed text when uncontrolled. */
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Selected result (controlled); `null` for none. */
  selected?: TerminologyResult | null;
  defaultSelected?: TerminologyResult | null;
  /** Called when a result is chosen, or with null when typing clears the selection. */
  onSelectionChange?: (result: TerminologyResult | null, query: string) => void;
  /** Clear the field after a selection (for lists that add a new entry per selection). Default false. */
  clearOnSelect?: boolean;
  /**
   * Offer a control to keep the typed text unencoded when nothing matches (CNA-0350). Retained
   * text is not recommended and the message says so (CNA-0360/0370).
   */
  onKeepText?: (text: string) => void;
  /** Minimum non-whitespace characters before searching. Default 2 (SCT-011). */
  minChars?: number;
  /** Progressive matching delay after typing stops. Default 200 ms (Matching 2.2.2). */
  debounceMs?: number;
  /** Show the busy indicator only after this delay. Default 1000 ms (CNA-0090). */
  busyDelayMs?: number;
  /** Ordering after the prioritised group (SCT-050). Default 'relevance' (engine order). */
  ordering?: TermOrderStrategy;
  /** 'wrap' shows long labels in full (default, SCT-040 option 1); 'truncate' cuts after two lines with '…'. */
  labelMode?: 'wrap' | 'truncate';
  /** Rows visible before the list scrolls. Default 10 (SCT-037: at least 10, SCT-038: at most 20). */
  visibleRows?: number;
  /** Show the number of results (SCT-053). Default true. */
  showCount?: boolean;
  /** Label of the common group (CNA-0240). Default "Common matches". */
  commonLabel?: string;
  /** Label of the remaining group (CNA-0240). Default "All matches". */
  otherLabel?: string;
  /** Message when nothing matches (CNA-0340, SCT-054). Default "No matches found". */
  noMatchesText?: string;
  /** Help shown under the no-matches message (CNA-0360, SCT-055). */
  noMatchesHelp?: string;
  /** Show the concept details flyout beside the highlighted result. Default true. */
  showDetails?: boolean;
  /** Adds "Browse for related concepts" to the flyout. */
  onBrowseRelated?: (result: TerminologyResult) => void;
  /** Characters visible in the field, using 'M' widths. Default 32 (CNA-0200, SCT-010). */
  widthChars?: number;
  /** Run the search on mount when `defaultQuery`/`query` is set (re-opening an entry, CNA-0760). */
  searchOnMount?: boolean;
  /** Called when focus leaves the whole control, with the current text. */
  onLeave?: (query: string) => void;
  autoFocus?: boolean;
  /** Jurisdiction: selects the edition and language reference set. Default from `ClinicalLocaleProvider` (GB). */
  region?: ClinicalRegion;
  /** Overrides of the region's edition data, e.g. verified identifiers from the current release (AU-TM-01). */
  edition?: Partial<SnomedEditionInfo>;
  /** Subset or value set passed to `search` (Matching 2.4.1). Default: none (the consumer applies global filters). */
  subset?: TerminologySubsetInfo | null;
  /** Whose terms to display when results carry `descriptions`: clinician (default) or consumer-friendly. */
  audience?: 'clinician' | 'consumer';
  /** Language of consumer terms, e.g. "mi" for te reo Māori (NZ only). */
  consumerLanguage?: string;
  /** Ignore macrons and other diacritics when highlighting and ask `search` to do the same. Default true (SCT-019, NZ 11.1). */
  foldDiacritics?: boolean;
  /** Show the edition in the details flyout (e.g. "NZ Edition"). Default false. [suggested] */
  showEdition?: boolean;
  /** Required field: red asterisk after the label and `aria-required` (CNA-1080/1110), as `FormField`. */
  required?: boolean;
  /**
   * The user moved past this required field while empty: yellow shading, warning icon and screen-reader text
   * "Required field not completed." (CNA-1160..1180), as `FormField`. When wrapped in `FormField`, set `missed` on
   * FormField instead.
   */
  missed?: boolean;
  /** Extra ids describing the search box (merged with the help text id). */
  'aria-describedby'?: string;
  /** Marks the search box invalid (FormField passes this for an error or missed field). */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Marks the search box required (FormField passes this). */
  'aria-required'?: boolean | 'true' | 'false';
  /**
   * Id of the search box itself. Default: `id` when given (so `FormField` and `<label htmlFor>` reach the input),
   * otherwise generated.
   */
  inputId?: string;
  /** Id of the search box (see `inputId`); other internal ids are derived from it. */
  id?: string;
  className?: string;
}

type Status = 'idle' | 'pending' | 'done' | 'error';

interface TermChoice {
  region: ClinicalRegion;
  edition: SnomedEditionInfo;
  audience: 'clinician' | 'consumer';
  consumerLanguage?: string;
}

/** Display label: matched description (or regional preferred term), acronyms expanded, semantic tags never shown. */
function displayLabel(r: TerminologyResult, choice?: TermChoice): { text: string; abbrevLength: number; lang?: string } {
  if (r.isUnexpandedAbbreviation && r.fsn) {
    const abbr = r.term.toUpperCase();
    return { text: `${abbr} - ${stripSemanticTag(r.fsn)}`, abbrevLength: abbr.length };
  }
  const picked = r.descriptions?.length && choice ? selectPreferredTerm(r.descriptions, { region: choice.region, edition: choice.edition, audience: choice.audience, consumerLanguage: choice.consumerLanguage }) : undefined;
  const term = picked?.term ?? r.term;
  const lang = picked ? picked.lang : r.lang;
  return { text: stripSemanticTag(term, { knownTagsOnly: true }).replace(/\s+/g, ' '), abbrevLength: 0, lang: lang && !/^en\b/.test(lang) ? lang : undefined };
}

/** Render one wrapped line with highlighted ranges. */
function renderLine(line: string, offset: number, ranges: Array<[number, number]>, abbrevLength: number): React.ReactNode[] {
  const marks = new Array<number>(line.length).fill(0);
  for (const [s, e] of ranges) for (let i = Math.max(s, offset); i < Math.min(e, offset + line.length); i++) marks[i - offset] |= 1;
  for (let i = 0; i < line.length; i++) if (offset + i < abbrevLength) marks[i] |= 2;
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < line.length) {
    const m = marks[i];
    let j = i;
    while (j < line.length && marks[j] === m) j++;
    const t = line.slice(i, j);
    out.push(m === 0 ? t : <span key={i} className={cx((m & 1) !== 0 && 'cui-terminology-search__hit', (m & 2) !== 0 && 'cui-terminology-search__abbr')}>{t}</span>);
    i = j;
  }
  return out;
}

/**
 * Single-concept terminology search: field plus results list with progressive matching, common
 * matches first, result count, busy indicator, no-matches message and keyboard selection.
 * The consumer supplies the search; out-of-order responses are discarded.
 */
export const TerminologySearch = React.forwardRef<HTMLInputElement, TerminologySearchProps>(function TerminologySearch(
  {
    search,
    label,
    hideLabel,
    placeholder,
    helpText,
    query: queryProp,
    defaultQuery = '',
    onQueryChange,
    selected: selectedProp,
    defaultSelected = null,
    onSelectionChange,
    clearOnSelect = false,
    onKeepText,
    minChars = 2,
    debounceMs = 200,
    busyDelayMs = 1000,
    ordering = 'relevance',
    labelMode = 'wrap',
    visibleRows = 10,
    showCount = true,
    commonLabel = 'Common matches',
    otherLabel = 'All matches',
    noMatchesText = 'No matches found',
    noMatchesHelp,
    showDetails = true,
    onBrowseRelated,
    widthChars = 32,
    searchOnMount = false,
    onLeave,
    autoFocus,
    region: regionProp,
    edition: editionOverrides,
    subset = null,
    audience = 'clinician',
    consumerLanguage,
    foldDiacritics = true,
    showEdition = false,
    required = false,
    missed = false,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    inputId: inputIdProp,
    id,
    className,
  },
  ref,
) {
  const { region } = useClinicalLocale(regionProp);
  const edition = React.useMemo(() => terminologyEditionFor(region, editionOverrides), [region, editionOverrides]);
  const choice: TermChoice = { region, edition, audience, consumerLanguage };
  const requestRef = React.useRef({ region, edition, subset, foldDiacritics });
  requestRef.current = { region, edition, subset, foldDiacritics };
  const baseId = useId('cui-termsearch', inputIdProp ?? id);
  const inputId = inputIdProp ?? id ?? `${baseId}-input`;
  const listId = `${baseId}-list`;
  const [query, setQuery] = useControllableState<string>(queryProp, defaultQuery, onQueryChange);
  const [selected, setSelected] = useControllableState<TerminologyResult | null>(selectedProp, defaultSelected, (r) => onSelectionChange?.(r, lastQueryRef.current));
  const [results, setResults] = React.useState<TerminologyResult[] | null>(null);
  const [resultsQuery, setResultsQuery] = React.useState('');
  const [status, setStatus] = React.useState<Status>('idle');
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [announcement, setAnnouncement] = React.useState('');

  const seq = React.useRef(createRequestSequencer());
  const abortRef = React.useRef<AbortController | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();
  const busyRef = React.useRef<ReturnType<typeof setTimeout>>();
  const queryRef = React.useRef(query);
  const lastQueryRef = React.useRef(query);
  const searchRef = React.useRef(search);
  searchRef.current = search;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setInputRef = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };

  const cancel = React.useCallback(() => {
    clearTimeout(debounceRef.current);
    clearTimeout(busyRef.current);
    abortRef.current?.abort();
    abortRef.current = null;
    seq.current.invalidate();
    setBusy(false);
  }, []);

  React.useEffect(() => cancel, [cancel]);

  const runSearch = React.useCallback(
    (text: string) => {
      clearTimeout(debounceRef.current);
      clearTimeout(busyRef.current);
      abortRef.current?.abort();
      const ticket: RequestTicket = seq.current.begin(text);
      const controller = new AbortController();
      abortRef.current = controller;
      lastQueryRef.current = text;
      setStatus('pending');
      busyRef.current = setTimeout(() => {
        if (seq.current.isCurrent(ticket)) {
          setBusy(true);
          setOpen(true);
          setAnnouncement('Searching');
        }
      }, busyDelayMs);
      searchRef.current(text, { signal: controller.signal, ...requestRef.current }).then(
        (res) => {
          if (!seq.current.isCurrent(ticket, queryRef.current)) return;
          clearTimeout(busyRef.current);
          setBusy(false);
          setResults(res);
          setResultsQuery(text);
          setStatus('done');
          setActive(-1);
          setOpen(true);
          setAnnouncement(res.length ? `${res.length} ${res.length === 1 ? 'match' : 'matches'}` : noMatchesText);
        },
        (err: unknown) => {
          if (controller.signal.aborted || !seq.current.isCurrent(ticket, queryRef.current)) return;
          clearTimeout(busyRef.current);
          setBusy(false);
          setStatus('error');
          setOpen(true);
          setAnnouncement('Search failed');
          void err;
        },
      );
    },
    [busyDelayMs, noMatchesText],
  );

  const onType = (typed: string) => {
    const text = composeTermText(typed);
    queryRef.current = text;
    setQuery(text);
    if (selected) setSelected(null);
    const t = tokeniseSearchText(text, { minChars });
    clearTimeout(debounceRef.current);
    if (!t.canSearch) {
      cancel();
      setResults(null);
      setStatus('idle');
      setOpen(false);
      setAnnouncement('');
      return;
    }
    setStatus('pending');
    debounceRef.current = setTimeout(() => runSearch(text), debounceMs);
  };

  React.useEffect(() => {
    queryRef.current = query;
    if (searchOnMount && tokeniseSearchText(query, { minChars }).canSearch) runSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ordered = React.useMemo(() => (results ? orderTermResults(results, { query: resultsQuery, strategy: ordering }) : { common: [], other: [] }), [results, resultsQuery, ordering]);
  const flat = React.useMemo(() => [...ordered.common, ...ordered.other], [ordered]);
  const grouped = ordered.common.length > 0;

  const choose = (r: TerminologyResult) => {
    lastQueryRef.current = resultsQuery || query;
    setOpen(false);
    setActive(-1);
    setAnnouncement(`${displayLabel(r, choice).text} selected`);
    if (clearOnSelect) {
      onSelectionChange?.(r, lastQueryRef.current);
      queryRef.current = '';
      setQuery('');
      setResults(null);
      setStatus('idle');
    } else {
      setSelected(r);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const count = flat.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!open && results) {
        setOpen(true);
        if (selected) setActive(Math.max(0, flat.findIndex((r) => r.id === selected.id)));
        e.preventDefault();
        return;
      }
      if (!count) return;
      e.preventDefault();
      setActive((a) => (e.key === 'ArrowDown' ? (a + 1) % count : a <= 0 ? count - 1 : a - 1));
    } else if (e.key === 'Enter') {
      if (open && active >= 0 && flat[active]) {
        e.preventDefault();
        choose(flat[active]);
      } else if (tokeniseSearchText(query, { minChars }).canSearch && !selected) {
        e.preventDefault();
        runSearch(query);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        setActive(-1);
      }
    }
  };

  const activeResult = open && active >= 0 ? flat[active] : undefined;
  const flyoutId = `${baseId}-details`;
  const showList = open && (busy || status === 'done' || status === 'error');
  const inputValue = selected && !clearOnSelect ? displayLabel(selected, choice).text : query;
  const helpId = helpText ? `${baseId}-help` : undefined;
  const missedId = missed ? `${baseId}-missed` : undefined;
  const describedBy = cx(ariaDescribedBy, helpId, missedId) || undefined;
  const keepHelp = onKeepText
    ? 'If nothing is suitable you can keep your text as entered. This is not recommended: entries are monitored for data quality.'
    : '';
  const help = noMatchesHelp ?? `Try a more general term or check the spelling.${keepHelp ? ` ${keepHelp}` : ''}`;

  const renderOption = (r: TerminologyResult, index: number) => {
    const { text, abbrevLength, lang } = displayLabel(r, choice);
    const wrapped = wrapTermLabel(text, { mode: labelMode, width: 32, indent: 2, maxLines: 2 });
    const ranges = findTermMatchRanges(resultsQuery, text, undefined, { foldDiacritics });
    let cursor = 0;
    const isSel = selected?.id === r.id;
    return (
      <li
        key={r.id}
        id={`${baseId}-opt-${index}`}
        role="option"
        aria-selected={active === index}
        aria-label={wrapped.truncated ? text : undefined}
        aria-describedby={active === index && showDetails ? flyoutId : undefined}
        title={wrapped.truncated ? text : undefined}
        className={cx('cui-terminology-search__option', active === index && 'cui-terminology-search__option--active', isSel && 'cui-terminology-search__option--selected')}
        onMouseDown={(e) => e.preventDefault()}
        onMouseEnter={() => setActive(index)}
        onClick={() => choose(r)}
      >
        <span className="cui-terminology-search__label" lang={lang}>
          {wrapped.lines.map((line, li) => {
            const plain = line.endsWith('…') && wrapped.truncated && li === wrapped.lines.length - 1 ? line.slice(0, -1) : line;
            const start = text.indexOf(plain, cursor);
            const offset = start < 0 ? cursor : start;
            cursor = offset + plain.length;
            return (
              <span key={li} className={cx('cui-terminology-search__line', li > 0 && 'cui-terminology-search__line--cont')}>
                {renderLine(plain, offset, ranges, abbrevLength)}
                {plain !== line ? '…' : null}
                {li < wrapped.lines.length - 1 ? ' ' : null}
              </span>
            );
          })}
        </span>
        {isSel ? <Icon name="check" label="Currently selected" /> : null}
      </li>
    );
  };

  let optionIndex = 0;
  const group = (items: TerminologyResult[], title: string | null, key: string) =>
    items.length ? (
      <li key={key} role="presentation" className="cui-terminology-search__group">
        {title ? <span className="cui-terminology-search__group-label" id={`${baseId}-${key}`}>{title}</span> : null}
        <ul role="group" aria-labelledby={title ? `${baseId}-${key}` : undefined} className="cui-terminology-search__group-list">
          {items.map((r) => renderOption(r, optionIndex++))}
        </ul>
      </li>
    ) : null;

  return (
    <div
      className={cx('cui-terminology-search', missed && 'cui-terminology-search--missed', className)}
      data-region={region}
      style={{ '--cui-term-width': `calc(${widthChars} * 0.86em + 40px)`, '--cui-term-rows': visibleRows } as React.CSSProperties}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setActive(-1);
          onLeave?.(queryRef.current);
        }
      }}
    >
      {label ? (
        <label htmlFor={inputId} className={cx('cui-terminology-search__label-text', hideLabel && 'cui-visually-hidden')}>
          {label}
          {required ? <RequiredFieldIndicator /> : null}
        </label>
      ) : null}
      <div className="cui-terminology-search__field">
        <span className={cx('cui-terminology-search__icon', busy && 'cui-terminology-search__icon--busy')} aria-hidden="true">
          {busy ? <span className="cui-terminology-search__spinner" /> : <Icon name="search" />}
        </span>
        <input
          ref={setInputRef}
          id={inputId}
          className={cx('cui-terminology-search__input', selected && !clearOnSelect && 'cui-terminology-search__input--encoded')}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={activeResult ? `${baseId}-opt-${active}` : undefined}
          aria-describedby={describedBy}
          aria-required={ariaRequired ?? (required || undefined)}
          aria-invalid={ariaInvalid ?? (missed || undefined)}
          autoComplete="off"
          spellCheck={false}
          maxLength={255}
          placeholder={placeholder}
          value={inputValue}
          autoFocus={autoFocus}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (results && !selected && status === 'done') setOpen(true);
          }}
        />
        {missed ? (
          <span className="cui-terminology-search__missed-icon" title="Required field not completed" aria-hidden="true">
            <Icon name="warning" />
          </span>
        ) : null}
      </div>
      {missed ? <span id={missedId} className="cui-visually-hidden">Required field not completed.</span> : null}
      {helpText ? <span id={helpId} className="cui-prompt cui-terminology-search__help">{helpText}</span> : null}
      <span className="cui-visually-hidden" aria-live="polite" aria-atomic="true">{announcement}</span>
      <div className="cui-terminology-search__popup" hidden={!showList}>
        <div className="cui-terminology-search__results">
          {busy ? (
            <div className="cui-terminology-search__status">
              <span>Searching</span>
              <Button size="sm" variant="quiet" onMouseDown={(e) => e.preventDefault()} onClick={() => { cancel(); setStatus('idle'); setOpen(false); setAnnouncement('Search cancelled'); }}>
                Cancel
              </Button>
            </div>
          ) : status === 'error' ? (
            <div className="cui-terminology-search__status cui-terminology-search__status--error">
              <Icon name="error" />
              <span>Search is not available. Try again.</span>
            </div>
          ) : results && results.length === 0 ? (
            <div className="cui-terminology-search__none">
              <p className="cui-terminology-search__none-title">{noMatchesText}</p>
              <p className="cui-terminology-search__none-help">{help}</p>
              {onKeepText ? (
                <Button size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => { onKeepText(query.trim()); setOpen(false); }}>
                  Keep text as entered
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              {showCount && results ? (
                <div className="cui-terminology-search__count" aria-hidden="true">
                  {results.length} {results.length === 1 ? 'match' : 'matches'}
                </div>
              ) : null}
              <ul id={listId} role="listbox" aria-label={`${label ?? 'Search'}: results`} className="cui-terminology-search__list">
                {grouped ? [group(ordered.common, commonLabel, 'common'), group(ordered.other, otherLabel, 'other')] : group(ordered.other, null, 'other')}
              </ul>
            </>
          )}
        </div>
        {showDetails && activeResult ? (
          <ConceptFlyout
            id={flyoutId}
            className="cui-terminology-search__flyout"
            concept={{ term: displayLabel(activeResult, choice).text, fsn: activeResult.fsn, isSynonym: activeResult.isSynonym, preferredTerm: activeResult.preferredTerm, parents: activeResult.parents, descriptions: activeResult.descriptions }}
            region={region}
            edition={showEdition ? edition.label : undefined}
            onBrowseRelated={onBrowseRelated ? () => onBrowseRelated(activeResult) : undefined}
          />
        ) : null}
      </div>
    </div>
  );
});
