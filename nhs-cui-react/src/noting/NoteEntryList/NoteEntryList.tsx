import React from 'react';
import { Button, cx, useClinicalLocale, useControllableState, useId, type ClinicalRegion, type DateLike } from '../../core';
import { NaturalDateInput } from '../NaturalDateInput/NaturalDateInput';
import { TerminologySearch, type TerminologySearchFn, type TerminologySearchProps } from '../TerminologySearch/TerminologySearch';
import { clinicalDateSortKey, formatClinicalDateValue, parseNaturalDuration, type ClinicalDateValue } from '../utils/naturalDate';

/** A coded qualifier offered from the additional text (CNA-0680/0690). */
export interface NoteEntryQualifier {
  id: string;
  /** Preferred term or synonym of the qualifier, e.g. "Severe". */
  label: string;
}

/** One entry in a note list (e.g. a past medical history item). */
export interface NoteEntry {
  id: string;
  /** Text the user typed to find the concept; used to reopen the results (CNA-0760). For unencoded entries, the retained text. */
  text: string;
  /** Matched concept. Absent when the user kept unencoded text (CNA-0350). The id is never displayed. */
  concept?: { id: string; term: string };
  /** Duration and/or date(s) as typed (CNA-0510/0520). */
  dateText?: string;
  /** Additional free text (CNA-0650). */
  additionalText?: string;
  /** Confirmed coded qualifiers (CNA-0690). */
  qualifiers?: NoteEntryQualifier[];
  /** Interpretation of `dateText` in standard form (hazard mitigation: entries can be sorted by date). */
  dateValue?: ClinicalDateValue;
  /** Laterality (CNA-0700): left, right, both, or neither (not applicable). */
  laterality?: NoteEntryLaterality;
  /** 'Current problem' attribute (CNA-0700). */
  currentProblem?: boolean;
}

/** Laterality values offered by CNA-0700. */
export type NoteEntryLaterality = 'left' | 'right' | 'both' | 'neither';

const LATERALITY_LABEL: Record<NoteEntryLaterality, string> = { left: 'Left', right: 'Right', both: 'Both sides', neither: 'Not applicable' };

export interface NoteEntryListProps {
  /** Entries (controlled). */
  entries?: NoteEntry[];
  /** Initial entries when uncontrolled. */
  defaultEntries?: NoteEntry[];
  onEntriesChange?: (entries: NoteEntry[]) => void;
  /** Terminology search used by the entry field. */
  search: TerminologySearchFn;
  /**
   * Instructional label of the search entry field (CNA-0130, mandatory), e.g. "Search for a condition.
   * Further fields will appear for additional details."
   */
  instructionText: string;
  /** In-field prompt, grey italic, without examples (CNA-0140, CNA-0260/0270). Default "Type a term". */
  placeholder?: string;
  /** Prompting text below the field with an example of what to type (CNA-0150..0170). */
  helpText?: string;
  /** Heading of the list, e.g. "Past medical history". */
  heading?: string;
  /** Ask for confirmation before deleting an entry (CNA-0820). Default true. */
  confirmDelete?: boolean;
  /** Offer to keep unencoded text when nothing matches (CNA-0350). Default true. */
  allowUnencoded?: boolean;
  /** Entries already committed to the record: no editing or deleting here (CNA-0720 applies before saving only). */
  readOnly?: boolean;
  /** Show the duration/date field (CNA-0510, mandatory for past medical history). Default true. */
  showDateField?: boolean;
  /** Label of the date field (CNA-0520). Default "Duration and/or date(s)". */
  dateLabel?: string;
  /**
   * Turns typed duration/date text into the formal confirmation shown to the right of the field and in
   * the summary (CNA-0590..0620), e.g. "From 1999 (approximate); To present". Return undefined if not understood.
   * Overrides the built-in natural-language parser.
   */
  interpretDate?: (text: string) => string | undefined;
  /** Use the built-in natural-language date parser when `interpretDate` is not given (CNA-0570). Default true. */
  naturalDates?: boolean;
  /** Offer the date menu beside the date field (CNA-0630). Default false. */
  showDateMenu?: boolean;
  /** "Now" for relative date phrases. Default today. */
  referenceDate?: Date;
  /** Patient's date of birth, for phrases such as "during childhood". */
  birthDate?: DateLike;
  /**
   * Offer laterality (left, right, both, not applicable) where clinically appropriate (CNA-0700).
   * `true` for every entry, or a function deciding per entry (e.g. only for paired body structures).
   */
  showLaterality?: boolean | ((entry: NoteEntry) => boolean);
  /** Offer a 'Current problem' check box next to the date field (CNA-0700 research). Default false. */
  showCurrentProblem?: boolean;
  /** Label of the current problem check box. Default "Current problem". */
  currentProblemLabel?: string;
  /**
   * Allow reordering entries with Move up/Move down buttons and Alt+Up/Alt+Down, plus "Sort by date"
   * ([suggested] from the research conclusion; not a numbered guideline). Default false.
   */
  reorderable?: boolean;
  /** Jurisdiction (date reading, seasons, terminology edition). Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Label of the additional text field (CNA-0660). Default "Enter additional text". */
  additionalTextLabel?: string;
  /** Qualifiers that can be post-coordinated from the additional text, offered as check boxes (CNA-0680/0690). */
  suggestQualifiers?: (entry: NoteEntry) => NoteEntryQualifier[];
  /** Further options passed to the search field (ordering, label mode, delays). */
  searchOptions?: Partial<Omit<TerminologySearchProps, 'search' | 'label'>>;
  /** Creates ids for new entries. */
  createId?: () => string;
  className?: string;
}

let counter = 0;
const defaultCreateId = () => `note-entry-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Summary chunks of an entry's details: calculated date bold, coded attributes bold, free text plain (CNA-0640). */
function summaryChunks(e: NoteEntry, formalDate: (e: NoteEntry) => string | undefined): Array<{ text: string; strong: boolean }> {
  const chunks: Array<{ text: string; strong: boolean }> = [];
  if (e.laterality) chunks.push({ text: LATERALITY_LABEL[e.laterality], strong: true });
  if (e.dateText?.trim()) {
    const formal = formalDate(e);
    chunks.push(formal ? { text: formal, strong: true } : { text: e.dateText.trim(), strong: false });
  }
  if (e.currentProblem) chunks.push({ text: 'Current problem', strong: true });
  for (const q of e.qualifiers ?? []) chunks.push({ text: q.label, strong: true });
  if (e.additionalText?.trim()) chunks.push({ text: e.additionalText.trim(), strong: false });
  return chunks;
}

/**
 * List of coded note entries (CNA-0010..0820): a single search entry field adds entries one at a
 * time; each entry shows its matched concept in bold (unencoded text in normal weight) with the
 * additional details summarised to its right; terms and details can be edited before saving, and
 * entries deleted with confirmation.
 */
export function NoteEntryList({
  entries: entriesProp,
  defaultEntries = [],
  onEntriesChange,
  search,
  instructionText,
  placeholder = 'Type a term',
  helpText,
  heading,
  confirmDelete = true,
  allowUnencoded = true,
  readOnly = false,
  showDateField = true,
  dateLabel = 'Duration and/or date(s)',
  interpretDate,
  naturalDates = true,
  showDateMenu = false,
  referenceDate,
  birthDate,
  showLaterality = false,
  showCurrentProblem = false,
  currentProblemLabel = 'Current problem',
  reorderable = false,
  region: regionProp,
  additionalTextLabel = 'Enter additional text',
  suggestQualifiers,
  searchOptions,
  createId = defaultCreateId,
  className,
}: NoteEntryListProps) {
  const baseId = useId('cui-notes');
  const { region } = useClinicalLocale(regionProp);
  const formalDateOf = (e: NoteEntry): string | undefined => {
    const t = e.dateText?.trim();
    if (!t) return undefined;
    if (interpretDate) return interpretDate(t);
    if (!naturalDates) return undefined;
    if (e.dateValue) return formatClinicalDateValue(e.dateValue);
    const r = parseNaturalDuration(t, { referenceDate, region, birthDate });
    return r.length === 1 ? formatClinicalDateValue(r[0]) : undefined;
  };
  const lateralityFor = (e: NoteEntry) => (typeof showLaterality === 'function' ? showLaterality(e) : showLaterality);
  const [entries, setEntries] = useControllableState<NoteEntry[]>(entriesProp, defaultEntries, onEntriesChange);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [editingTermId, setEditingTermId] = React.useState<string | null>(null);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
  const [newRowKey, setNewRowKey] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState('');
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dropAt, setDropAt] = React.useState<{ id: string; after: boolean } | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pendingFocus = React.useRef<string | null>(null);
  const entriesRef = React.useRef(entries);
  entriesRef.current = entries;

  React.useEffect(() => {
    if (!pendingFocus.current || !rootRef.current) return;
    const el = rootRef.current.querySelector<HTMLElement>(pendingFocus.current);
    pendingFocus.current = null;
    el?.focus();
  });

  const update = (id: string, patch: Partial<NoteEntry>) => {
    const next = entriesRef.current.map((e) => (e.id === id ? { ...e, ...patch } : e));
    entriesRef.current = next;
    setEntries(next);
  };
  const entryLabel = (e: NoteEntry) => e.concept?.term ?? e.text;
  const focusAfterRemoval = (index: number) => {
    const next = entriesRef.current[index + 1] ?? entriesRef.current[index - 1];
    pendingFocus.current = next && entriesRef.current[index + 1] ? `[data-entry-id="${next.id}"] .cui-note-entry__term` : `#${baseId}-new input`;
  };
  const remove = (id: string) => {
    const index = entriesRef.current.findIndex((e) => e.id === id);
    const e = entriesRef.current[index];
    focusAfterRemoval(index);
    setEntries(entriesRef.current.filter((x) => x.id !== id));
    setConfirmingId(null);
    setOpenId(null);
    setEditingTermId(null);
    if (e) setAnnouncement(`${entryLabel(e)} deleted`);
  };

  const add = (entry: NoteEntry) => {
    setEntries([...entriesRef.current, entry]);
    setOpenId(entry.id);
    setNewRowKey((k) => k + 1);
    setAnnouncement(`${entryLabel(entry)} added. Further fields for additional details are shown.`);
    pendingFocus.current = `[data-entry-id="${entry.id}"] .cui-note-entry__details select, [data-entry-id="${entry.id}"] .cui-note-entry__details input, [data-entry-id="${entry.id}"] .cui-note-entry__details textarea`;
  };

  const reorder = (index: number, delta: number) => {
    const list = [...entriesRef.current];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);
    setEntries(list);
    setAnnouncement(`${entryLabel(item)} moved to position ${target + 1} of ${list.length}`);
    pendingFocus.current = `[data-entry-id="${item.id}"] .cui-note-entry__term`;
  };
  /** Move an entry to a new index (drag and drop). Announces the result like the buttons do. */
  const moveTo = (id: string, targetId: string, after: boolean) => {
    const list = [...entriesRef.current];
    const from = list.findIndex((x) => x.id === id);
    if (from < 0 || id === targetId) return;
    const [item] = list.splice(from, 1);
    let to = list.findIndex((x) => x.id === targetId);
    if (to < 0) return;
    if (after) to += 1;
    list.splice(to, 0, item);
    if (to === from) {
      setAnnouncement(`${entryLabel(item)} not moved. Still at position ${from + 1} of ${list.length}`);
      return;
    }
    setEntries(list);
    setAnnouncement(`${entryLabel(item)} moved to position ${to + 1} of ${list.length}`);
  };
  const dropSide = (ev: React.DragEvent<HTMLElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    return ev.clientY > r.top + r.height / 2;
  };
  const endDrag = () => {
    setDragId(null);
    setDropAt(null);
  };
  const dragHandlers = (e: NoteEntry) =>
    dragId
      ? {
          onDragOver: (ev: React.DragEvent<HTMLLIElement>) => {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'move';
            const after = dropSide(ev);
            if (!dropAt || dropAt.id !== e.id || dropAt.after !== after) setDropAt({ id: e.id, after });
          },
          onDrop: (ev: React.DragEvent<HTMLLIElement>) => {
            ev.preventDefault();
            if (dragId) moveTo(dragId, e.id, dropSide(ev));
            endDrag();
          },
        }
      : {};

  const sortByDate = () => {
    const list = entriesRef.current.map((e, i) => ({ e, i, k: clinicalDateSortKey(e.dateValue ?? (e.dateText ? parseNaturalDuration(e.dateText, { referenceDate, region, birthDate })[0] : undefined)) }));
    list.sort((a, b) => (a.k ?? Infinity) - (b.k ?? Infinity) || a.i - b.i);
    setEntries(list.map((x) => x.e));
    setAnnouncement('Entries sorted by date, earliest first. Entries without a date are last.');
  };

  const moveRow = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    if (e.altKey && reorderable && !readOnly) {
      reorder(index, e.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    const target = index + (e.key === 'ArrowDown' ? 1 : -1);
    const root = rootRef.current;
    if (!root || target < 0) return;
    setOpenId(null);
    const next = entriesRef.current[target];
    const el = next ? root.querySelector<HTMLElement>(`[data-entry-id="${next.id}"] .cui-note-entry__term`) : root.querySelector<HTMLElement>(`#${baseId}-new input`);
    el?.focus();
  };

  return (
    <div ref={rootRef} className={cx('cui-note-entry-list', className)}>
      {heading ? <h3 id={`${baseId}-heading`} className="cui-note-entry-list__heading">{heading}</h3> : null}
      <ul className="cui-note-entry-list__entries" aria-labelledby={heading ? `${baseId}-heading` : undefined} aria-label={heading ? undefined : 'Entries'}>
        {entries.map((e, index) => {
          const chunks = summaryChunks(e, formalDateOf);
          const isOpen = openId === e.id && !readOnly;
          const isEditingTerm = editingTermId === e.id && !readOnly;
          const label = entryLabel(e);
          const dateId = `${baseId}-${e.id}-date`;
          const textId = `${baseId}-${e.id}-text`;
          const formalDate = interpretDate && e.dateText?.trim() ? interpretDate(e.dateText.trim()) : undefined;
          const latId = `${baseId}-${e.id}-lat`;
          const qualifierOptions = isOpen && suggestQualifiers ? suggestQualifiers(e) : [];
          return (
            <li
              key={e.id}
              data-entry-id={e.id}
              className={cx(
                'cui-note-entry',
                isOpen && 'cui-note-entry--open',
                !e.concept && 'cui-note-entry--unencoded',
                dragId === e.id && 'cui-note-entry--dragging',
                dropAt?.id === e.id && dragId !== e.id && (dropAt.after ? 'cui-note-entry--drop-after' : 'cui-note-entry--drop-before'),
              )}
              {...dragHandlers(e)}
              onBlur={(ev) => {
                if (openId === e.id && !ev.currentTarget.contains(ev.relatedTarget as Node | null)) setOpenId(null);
              }}
            >
              <div className="cui-note-entry__line">
                {isEditingTerm ? (
                  <div className="cui-note-entry__edit">
                    <TerminologySearch
                      {...searchOptions}
                      search={search}
                      label={`Change ${label}`}
                      hideLabel
                      placeholder={placeholder}
                      defaultQuery={e.text}
                      searchOnMount
                      autoFocus
                      onSelectionChange={(r, q) => {
                        if (!r) return;
                        update(e.id, { concept: { id: r.id, term: r.term }, text: q });
                        setEditingTermId(null);
                        pendingFocus.current = `[data-entry-id="${e.id}"] .cui-note-entry__term`;
                      }}
                      onKeepText={allowUnencoded ? (t) => {
                        update(e.id, { concept: undefined, text: t });
                        setEditingTermId(null);
                        pendingFocus.current = `[data-entry-id="${e.id}"] .cui-note-entry__term`;
                      } : undefined}
                      onLeave={(q) => {
                        if (!q.trim()) remove(e.id);
                        else setEditingTermId(null);
                      }}
                    />
                  </div>
                ) : readOnly ? (
                  <span className={cx('cui-note-entry__term', 'cui-note-entry__term--static', e.concept && 'cui-note-entry__term--encoded')}>{label}</span>
                ) : (
                  <button
                    type="button"
                    className={cx('cui-note-entry__term', e.concept && 'cui-note-entry__term--encoded')}
                    aria-label={`${label}${e.concept ? '' : ' (not coded)'}: change term`}
                    onClick={() => {
                      setOpenId(null);
                      setEditingTermId(e.id);
                    }}
                    onKeyDown={(ev) => moveRow(ev, index)}
                  >
                    {label}
                  </button>
                )}
                {!isOpen && !isEditingTerm ? (
                  chunks.length ? (
                    readOnly ? (
                      <span className="cui-note-entry__summary cui-note-entry__summary--static">
                        {chunks.map((c, i) => <React.Fragment key={i}>{i > 0 ? '; ' : ''}{c.strong ? <strong>{c.text}</strong> : c.text}</React.Fragment>)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="cui-note-entry__summary"
                        aria-label={`Details for ${label}: ${chunks.map((c) => c.text).join('; ')}. Edit details`}
                        onClick={() => {
                          setOpenId(e.id);
                          pendingFocus.current = `#${showDateField ? dateId : textId}`;
                        }}
                        onKeyDown={(ev) => moveRow(ev, index)}
                      >
                        {chunks.map((c, i) => <React.Fragment key={i}>{i > 0 ? '; ' : ''}{c.strong ? <strong>{c.text}</strong> : c.text}</React.Fragment>)}
                      </button>
                    )
                  ) : !readOnly ? (
                    <button
                      type="button"
                      className="cui-note-entry__summary cui-note-entry__summary--empty"
                      aria-label={`Add details for ${label}`}
                      onClick={() => {
                        setOpenId(e.id);
                        pendingFocus.current = `#${showDateField ? dateId : textId}`;
                      }}
                      onKeyDown={(ev) => moveRow(ev, index)}
                    >
                      Add details
                    </button>
                  ) : null
                ) : null}
                {!readOnly && reorderable && !isEditingTerm ? (
                  <span className="cui-note-entry__move">
                    {entries.length > 1 ? (
                      <span
                        className="cui-note-entry__grip"
                        draggable
                        aria-hidden="true"
                        title="Drag to reorder (or use the arrow buttons, or Alt+Up and Alt+Down)"
                        onDragStart={(ev) => {
                          ev.dataTransfer.effectAllowed = 'move';
                          try {
                            ev.dataTransfer.setData('text/plain', label);
                          } catch {
                            /* some browsers refuse data on drag start */
                          }
                          setDragId(e.id);
                          setOpenId(null);
                          setAnnouncement(`Dragging ${label}, position ${index + 1} of ${entries.length}. Drop it above or below another entry.`);
                        }}
                        onDragEnd={() => {
                          if (dragId) setAnnouncement(`${label} not moved.`);
                          endDrag();
                        }}
                      >
                        <svg viewBox="0 0 12 16" width="10" height="14"><path d="M3 3h1M8 3h1M3 8h1M8 8h1M3 13h1M8 13h1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                      </span>
                    ) : null}
                    <Button variant="quiet" size="sm" icon="arrow-up" iconOnly disabled={index === 0} onClick={() => reorder(index, -1)}>{`Move ${label} up`}</Button>
                    <Button variant="quiet" size="sm" icon="arrow-down" iconOnly disabled={index === entries.length - 1} onClick={() => reorder(index, 1)}>{`Move ${label} down`}</Button>
                  </span>
                ) : null}
                {!readOnly ? (
                  <Button
                    className="cui-note-entry__delete"
                    variant="quiet"
                    size="sm"
                    icon="trash"
                    iconOnly
                    onClick={() => {
                      if (confirmDelete) {
                        setConfirmingId(e.id);
                        pendingFocus.current = `[data-entry-id="${e.id}"] .cui-note-entry__confirm-cancel`;
                      } else remove(e.id);
                    }}
                  >
                    {`Delete ${label}`}
                  </Button>
                ) : null}
              </div>
              {isOpen ? (
                <div className="cui-note-entry__details">
                  {showDateField || lateralityFor(e) || showCurrentProblem ? (
                    <div className="cui-note-entry__date-row">
                      {lateralityFor(e) ? (
                        <select
                          id={latId}
                          className="cui-noting-input cui-note-entry__laterality"
                          aria-label={`Laterality of ${label}`}
                          value={e.laterality ?? ''}
                          onChange={(ev) => update(e.id, { laterality: (ev.target.value || undefined) as NoteEntryLaterality | undefined })}
                        >
                          <option value="">Laterality</option>
                          {(Object.keys(LATERALITY_LABEL) as NoteEntryLaterality[]).map((k) => <option key={k} value={k}>{LATERALITY_LABEL[k]}</option>)}
                        </select>
                      ) : null}
                      {showDateField && interpretDate ? (
                        <>
                          <input
                            id={dateId}
                            className="cui-noting-input cui-note-entry__date"
                            type="text"
                            aria-label={dateLabel}
                            placeholder={dateLabel}
                            value={e.dateText ?? ''}
                            autoComplete="off"
                            onChange={(ev) => update(e.id, { dateText: ev.target.value })}
                          />
                          {formalDate ? <span className="cui-note-entry__date-confirm" aria-live="polite"><strong>{formalDate}</strong></span> : null}
                        </>
                      ) : showDateField ? (
                        <NaturalDateInput
                          id={dateId}
                          className="cui-note-entry__natural-date"
                          label={dateLabel}
                          labelMode="in-field"
                          value={e.dateText ?? ''}
                          onChange={(t) => update(e.id, { dateText: t })}
                          dateValue={e.dateValue ?? null}
                          onDateValueChange={(v) => update(e.id, { dateValue: v ?? undefined })}
                          referenceDate={referenceDate}
                          birthDate={birthDate}
                          region={region}
                          showDateMenu={showDateMenu}
                          interpret={naturalDates ? undefined : () => undefined}
                          showNotRecognised={naturalDates}
                        />
                      ) : null}
                      {showCurrentProblem ? (
                        <label className="cui-note-entry__current">
                          <input type="checkbox" checked={!!e.currentProblem} onChange={(ev) => update(e.id, { currentProblem: ev.target.checked || undefined })} />
                          {currentProblemLabel}
                        </label>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="cui-note-entry__text-row">
                    <textarea
                      id={textId}
                      className="cui-noting-input cui-note-entry__text"
                      aria-label={additionalTextLabel}
                      placeholder={additionalTextLabel}
                      rows={2}
                      value={e.additionalText ?? ''}
                      onChange={(ev) => update(e.id, { additionalText: ev.target.value })}
                    />
                    {qualifierOptions.length ? (
                      <fieldset className="cui-note-entry__qualifiers">
                        <legend className="cui-visually-hidden">Code these details</legend>
                        {qualifierOptions.map((q) => {
                          const checked = !!e.qualifiers?.some((x) => x.id === q.id);
                          return (
                            <label key={q.id} className="cui-note-entry__qualifier">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(ev) => update(e.id, { qualifiers: ev.target.checked ? [...(e.qualifiers ?? []), q] : (e.qualifiers ?? []).filter((x) => x.id !== q.id) })}
                              />
                              {q.label}
                            </label>
                          );
                        })}
                      </fieldset>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {confirmingId === e.id ? (
                <div className="cui-note-entry__confirm" role="alertdialog" aria-labelledby={`${baseId}-${e.id}-confirm`}>
                  <span id={`${baseId}-${e.id}-confirm`}>Delete {label} and its details?</span>
                  <Button size="sm" variant="danger" onClick={() => remove(e.id)}>Continue</Button>
                  <Button
                    size="sm"
                    className="cui-note-entry__confirm-cancel"
                    onClick={() => {
                      setConfirmingId(null);
                      pendingFocus.current = `[data-entry-id="${e.id}"] .cui-note-entry__term`;
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {!readOnly && reorderable && entries.length > 1 ? (
        <div className="cui-note-entry-list__tools">
          <Button size="sm" variant="quiet" icon="sort" onClick={sortByDate}>Sort by date</Button>
        </div>
      ) : null}
      {!readOnly ? (
        <div id={`${baseId}-new`} className="cui-note-entry-list__new" onKeyDown={(ev) => {
          if (ev.key === 'ArrowUp' && entriesRef.current.length && (ev.target as HTMLElement).tagName === 'INPUT' && !(ev.target as HTMLElement).getAttribute('aria-activedescendant')) {
            const last = entriesRef.current[entriesRef.current.length - 1];
            const input = ev.target as HTMLInputElement;
            if (input.getAttribute('aria-expanded') === 'true') return;
            ev.preventDefault();
            rootRef.current?.querySelector<HTMLElement>(`[data-entry-id="${last.id}"] .cui-note-entry__term`)?.focus();
          }
        }}>
          <TerminologySearch
            key={newRowKey}
            {...searchOptions}
            search={search}
            label={instructionText}
            placeholder={placeholder}
            helpText={helpText}
            clearOnSelect
            onSelectionChange={(r, q) => {
              if (r) add({ id: createId(), text: q, concept: { id: r.id, term: r.term } });
            }}
            onKeepText={allowUnencoded ? (t) => { if (t) add({ id: createId(), text: t }); } : undefined}
          />
        </div>
      ) : null}
      <span className="cui-visually-hidden" aria-live="polite">{announcement}</span>
    </div>
  );
}
