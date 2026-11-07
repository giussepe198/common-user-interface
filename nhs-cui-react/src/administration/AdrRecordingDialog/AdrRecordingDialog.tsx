import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useId, VisuallyHidden } from '../../core';
import type { ClinicalRegion } from '../../core';
import type {
  AdrConcept,
  AdrEntry,
  AdrReaction} from '../utils/adr';
import {
  ADR_DEFAULT_REACTION_LEXICON,
  adrBuildExpression,
  adrConceptLabel,
  adrDangerCategoryLabel,
  adrDetectDangerousWords,
  adrFindDuplicateAgent,
  adrFindUnenteredReactionWords,
  adrSummaryWording,
} from '../utils/adr';
import { AdrRemoveConfirm } from './AdrRemoveConfirm';
import { AdrTermSearch } from './AdrTermSearch';

/** Data being entered. */
export interface AdrDraft {
  agent: AdrConcept | null;
  reactions: AdrReaction[];
  /** Source of the most recent information; never pre-filled by the system (RAD-0430.6). */
  source: string;
  clinicianWitnessed: boolean;
  details: string;
  /** AU: allergy or intolerance (AU-AL-03). */
  reactionType?: 'allergy' | 'intolerance';
  /** AU: date of the reaction, free text such as "2019" or "March 2021" (NIMC "Reaction / type / date"). */
  reactionDate?: string;
  /** NZ: reaction caused during this admission (NMC "New this admission"). */
  newThisAdmission?: boolean;
}

/** What Finish passes back. */
export interface AdrFinishResult extends AdrDraft {
  agent: AdrConcept;
  /** Post-coordinated SNOMED CT expression, or null for a free text agent (RAD-0190). */
  expression: string | null;
}

/** Props given to a custom causative agent search field (the terminology slot). */
export interface AdrAgentSearchSlotProps {
  inputId: string;
  labelId: string;
  /** Current subset filter label, e.g. "Drug allergens" (RAD-0160). */
  subsetId: string;
  autoFocus: boolean;
  onSelect: (concept: AdrConcept) => void;
  onFreeText: (text: string) => void;
  /** Call on Tab while the field is empty: moves focus to Cancel (RAD-0130). */
  onTabWhenEmpty: () => void;
}

export interface AdrRecordingDialogProps {
  /** 'add' a new entry, or 'edit' an existing one (causative agent read-only, RAD-0830). Default 'add'. */
  mode?: 'add' | 'edit';
  /** Initial values, e.g. the entry being edited or data detected in notes (RAD-0550). Source is never pre-filled by the system. */
  initial?: Partial<AdrDraft>;
  /** Id of the entry being edited, ignored by the duplicate check. */
  entryId?: string;
  /** Existing entries, listed to the right and used for the duplicate warning (RAD-0070, 0080, 0610). */
  existingEntries: AdrEntry[];
  /** Fixed list of information sources set by the clinical authority (RAD-0430.5). */
  sources: string[];
  /** Terminology search used by the built-in fields. `field` says which field is searching; `subsetId` is the filter. */
  searchConcepts?: (text: string, field: 'agent' | 'reaction', subsetId: string) => AdrConcept[] | Promise<AdrConcept[]>;
  /** Replace the built-in causative agent search with your own terminology control (slot). */
  renderAgentSearch?: (slot: AdrAgentSearchSlotProps) => React.ReactNode;
  /** Subset filters for the causative agent. Default: Drug allergens, Non-drug substances (RAD-0160). */
  subsets?: { id: string; label: string }[];
  /** Words that suggest a reaction in the justification text (RAD-0410) [suggested default list]. */
  reactionLexicon?: string[];
  /** Finish: save and return to the list (RAD-0140, 0880). */
  onFinish: (result: AdrFinishResult) => void;
  /** Cancel (or Back): return to the list without saving (RAD-0870). */
  onCancel: () => void;
  /** Edit mode: remove the entry from the summary after confirmation (RAD-0680 to RAD-0750). */
  onRemove?: (reason: string) => void;
  /** Dialog title. Default per region, e.g. "Add new drug reaction" (GB, RAD-0020) or "Add allergy or adverse drug reaction" (AU). */
  title?: string;
  /** Jurisdiction; defaults to the ClinicalLocaleProvider. Changes labels and adds AU type and date, or the NZ "New this admission" flag. */
  region?: ClinicalRegion;
  className?: string;
}

const WITNESSED = 'Clinician witnessed reaction';

/**
 * Dialog for adding or editing an entry in the adverse drug reaction summary, with an inline
 * removal confirmation. Fields run top to bottom in tab order: causative agent, reaction types,
 * source, clinician witnessed, details (RAD-0150.1); existing entries are listed alongside.
 */
export function AdrRecordingDialog({
  mode = 'add',
  initial,
  entryId,
  existingEntries,
  sources,
  searchConcepts,
  renderAgentSearch,
  subsets = [
    { id: 'drug', label: 'Drug allergens' },
    { id: 'substance', label: 'Non-drug substances' },
  ],
  reactionLexicon = ADR_DEFAULT_REACTION_LEXICON,
  onFinish,
  onCancel,
  onRemove,
  title,
  region: regionProp,
  className,
}: AdrRecordingDialogProps) {
  const id = useId('cui-adr');
  const { region } = useClinicalLocale(regionProp);
  const w = adrSummaryWording(region);
  const start: AdrDraft = {
    agent: initial?.agent ?? null,
    reactions: initial?.reactions ?? [],
    source: initial?.source ?? '',
    clinicianWitnessed: initial?.clinicianWitnessed ?? false,
    details: initial?.details ?? '',
    reactionType: initial?.reactionType,
    reactionDate: initial?.reactionDate ?? '',
    newThisAdmission: initial?.newThisAdmission ?? false,
  };
  const [draft, setDraft] = React.useState<AdrDraft>(start);
  const [dirty, setDirty] = React.useState(false);
  const [subset, setSubset] = React.useState(subsets[0]?.id ?? 'drug');
  const [clearedWarning, setClearedWarning] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const finishRef = React.useRef<HTMLButtonElement>(null);
  const reactionInputRef = React.useRef<HTMLInputElement>(null);

  const update = (patch: Partial<AdrDraft>) => {
    setDraft(d => ({ ...d, ...patch }));
    setDirty(true);
  };

  const hasAgent = !!draft.agent;
  const duplicate = mode === 'add' ? adrFindDuplicateAgent(existingEntries, draft.agent, entryId) : undefined;
  const canFinish = hasAgent && !duplicate && (mode === 'add' || dirty);
  const subsetLabel = subsets.find(s => s.id === subset)?.label ?? '';
  const agentName = draft.agent ? adrConceptLabel(draft.agent) : '';
  const heading = title ?? (mode === 'edit' ? w.editTitle : w.addTitle);
  const reactionWords = adrFindUnenteredReactionWords(
    draft.details,
    reactionLexicon,
    draft.reactions.map(r => r.concept.term),
  );
  const uniqueWords = Array.from(new Set(reactionWords.map(w => w.word.toLowerCase())));

  const selectAgent = (c: AdrConcept) => {
    update({ agent: { ...c, isDrug: c.isDrug ?? subset !== 'substance' } });
    setClearedWarning(false);
    requestAnimationFrame(() => reactionInputRef.current?.focus()); // RAD-0100
  };
  const clearAgent = () => {
    const hasOther = draft.reactions.length > 0 || !!draft.source || !!draft.details.trim();
    update({ agent: null });
    setClearedWarning(hasOther); // RAD-0110
  };
  const finish = () => {
    if (!canFinish || !draft.agent) return;
    const out: AdrFinishResult = { ...draft, agent: draft.agent, expression: adrBuildExpression(draft.agent) };
    if (!w.recordTypeAndDate) {
      delete out.reactionType;
      delete out.reactionDate;
    } else if (!out.reactionDate) delete out.reactionDate;
    if (!w.newThisAdmission) delete out.newThisAdmission;
    onFinish(out);
  };

  const tabToCancel = () => cancelRef.current?.focus();

  // ---------- Removal confirmation (RAD-0750) ----------
  if (confirmRemove && draft.agent) {
    return (
      <AdrRemoveConfirm
        className={className}
        agentName={agentName}
        listName={w.listName}
        onConfirm={reason => onRemove?.(reason)}
        onCancel={() => setConfirmRemove(false)}
      />
    );
  }

  return (
    <section
      className={cx('cui-adr', className)}
      role="dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-prompt`}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <div className="cui-adr__head">
        <h2 className="cui-adr__title" id={`${id}-title`}>
          {heading}
        </h2>
        <div className="cui-adr__buttons">
          {mode === 'edit' && onRemove ? (
            <Button
              variant="danger"
              icon="trash"
              aria-describedby={`${id}-rm-help`}
              title="Removes this entry from the summary. You can give a reason. Clinical notes are kept."
              onClick={() => setConfirmRemove(true)}
            >
              Remove from list
            </Button>
          ) : null}
          <Button ref={cancelRef} onClick={onCancel}>
            {mode === 'edit' && !dirty ? 'Back' : 'Cancel'}
          </Button>
          <Button ref={finishRef} variant="primary" disabled={!canFinish} onClick={finish}>
            Finish
          </Button>
        </div>
        {mode === 'edit' && onRemove ? (
          <VisuallyHidden id={`${id}-rm-help`}>Removes this entry from the summary. You can give a reason. Clinical notes are kept.</VisuallyHidden>
        ) : null}
      </div>
      <p className="cui-adr__prompt" id={`${id}-prompt`}>
        {w.prompt}
      </p>
      {w.dialogHint ? (
        <p className="cui-adr__hint cui-adr__hint--region">
          <Icon name="info" size={16} /> {w.dialogHint}
        </p>
      ) : null}

      {/* Preview of the summary line (RAD-0040.1 to 0040.7) */}
      <div className="cui-adr__preview" aria-live="polite">
        <span className="cui-adr__preview-tag">{mode === 'edit' ? 'Updated' : 'New'}</span>
        {draft.agent ? (
          <>
            <span className={cx('cui-adr__agent', !draft.agent.code && 'cui-adr__agent--free')}>{agentName}</span>
            {draft.reactions.length ? (
              <span className="cui-adr__preview-reactions">
                {draft.reactions.map(r => adrConceptLabel(r.concept) + (r.elaboration ? ` (${r.elaboration})` : '')).join('; ')}
              </span>
            ) : null}
          </>
        ) : (
          <span className="cui-prompt">The new line in the summary will appear here as you type</span>
        )}
      </div>

      <div className="cui-adr__body">
        <div className="cui-adr__fields">
          {/* 1. Causative agent */}
          <div className="cui-adr__field">
            <span className="cui-adr__label" id={`${id}-agent-label`}>
              {w.agentLabel}
            </span>
            {draft.agent ? (
              <div className="cui-adr__chosen">
                <span className={cx('cui-adr__agent', !draft.agent.code && 'cui-adr__agent--free')}>{agentName}</span>
                <span className="cui-adr__coded">{draft.agent.code ? 'Coded' : 'Not coded'}</span>
                {mode === 'add' ? (
                  <Button size="sm" variant="quiet" icon="close" onClick={clearAgent}>
                    Clear
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="cui-adr__subset">
                  <label htmlFor={`${id}-subset`} className="cui-adr__subset-label">
                    Current filter:
                  </label>
                  <select id={`${id}-subset`} value={subset} onChange={e => setSubset(e.target.value)} className="cui-adr__subset-select">
                    {subsets.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                {renderAgentSearch ? (
                  renderAgentSearch({
                    inputId: `${id}-agent`,
                    labelId: `${id}-agent-label`,
                    subsetId: subset,
                    autoFocus: true,
                    onSelect: selectAgent,
                    onFreeText: t => selectAgent({ term: t }),
                    onTabWhenEmpty: tabToCancel,
                  })
                ) : (
                  <AdrTermSearch
                    id={`${id}-agent`}
                    labelledBy={`${id}-agent-label`}
                    autoFocus
                    placeholder="Type at least 3 letters of the drug or substance name"
                    search={searchConcepts ? t => searchConcepts(t, 'agent', subset) : undefined}
                    onSelect={selectAgent}
                    onFreeText={t => selectAgent({ term: t })}
                    onKeyDown={(e, text) => {
                      if (e.key === 'Tab' && !e.shiftKey && !text.trim()) {
                        e.preventDefault();
                        tabToCancel(); // RAD-0130
                      }
                    }}
                  />
                )}
              </>
            )}
            {mode === 'edit' ? (
              <span className="cui-adr__hint">The causative agent cannot be changed. To record a different agent, remove this entry and add a new one.</span>
            ) : null}
            {duplicate ? (
              <div className="cui-adr__warn" role="alert">
                <Icon name="warning" size={16} />
                <span>
                  {adrConceptLabel(duplicate.agent)} is already in the {w.listName}. Remove the existing entry before adding a new one
                  for the same agent.
                </span>
              </div>
            ) : null}
            {clearedWarning && !draft.agent ? (
              <div className="cui-adr__warn" role="alert">
                <Icon name="warning" size={16} />
                <span>Without a causative agent this entry will not be saved or shown in the list.</span>
              </div>
            ) : null}
          </div>

          {/* 2. Reaction types (RAD-0200 to RAD-0330) */}
          <fieldset className="cui-adr__fieldset" disabled={!hasAgent}>
            <legend className="cui-adr__label" id={`${id}-rx-label`}>
              {w.reactionsLabel}
            </legend>
            <AdrTermSearch
              id={`${id}-rx`}
              labelledBy={`${id}-rx-label`}
              inputRef={reactionInputRef}
              disabled={!hasAgent}
              placeholder="Search for a reaction, for example rash"
              search={searchConcepts ? t => searchConcepts(t, 'reaction', 'reaction') : undefined}
              onSelect={c => update({ reactions: [...draft.reactions, { concept: c, elaboration: '' }] })}
              onFreeText={t => update({ reactions: [...draft.reactions, { concept: { term: t }, elaboration: '' }] })}
            />
            {draft.reactions.length ? (
              <ul className="cui-adr__reactions">
                {draft.reactions.map((r, i) => {
                  const danger = adrDetectDangerousWords(r.elaboration ?? '');
                  const label = adrConceptLabel(r.concept);
                  return (
                    <li key={i} className="cui-adr__reaction">
                      <span className={cx('cui-adr__rx-term', !r.concept.code && 'cui-adr__rx-term--free')}>
                        {label}
                        <VisuallyHidden>{r.concept.code ? ' (coded)' : ' (not coded)'}</VisuallyHidden>
                      </span>
                      <input
                        className="cui-adr__control cui-adr__rx-detail"
                        aria-label={`Details for ${label}`}
                        placeholder="Add details, for example severe"
                        value={r.elaboration ?? ''}
                        onChange={e => update({ reactions: draft.reactions.map((x, j) => (j === i ? { ...x, elaboration: e.target.value } : x)) })}
                      />
                      <Button
                        size="sm"
                        variant="quiet"
                        icon="trash"
                        iconOnly
                        onClick={() => update({ reactions: draft.reactions.filter((_, j) => j !== i) })}
                      >
                        {`Delete ${label}`}
                      </Button>
                      {danger.length ? (
                        <div className="cui-adr__warn cui-adr__warn--inline" role="alert">
                          <Icon name="warning" size={16} />
                          <span>
                            {danger.map(d => `"${d.word}" ${adrDangerCategoryLabel(d.category)}`).join(', ')}. Check this does not change the meaning
                            of {label}.
                          </span>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="cui-adr__hint">Add at least one coded reaction for each distinct reaction, if known.</p>
            )}
          </fieldset>

          {w.recordTypeAndDate ? (
            <div className="cui-adr__row">
              <fieldset className="cui-adr__fieldset" disabled={!hasAgent}>
                <legend className="cui-adr__label">Type</legend>
                <div className="cui-adr__radios">
                  {(['allergy', 'intolerance'] as const).map(t => (
                    <label key={t} className="cui-adr__check" data-touch-target>
                      <input
                        type="radio"
                        name={`${id}-type`}
                        checked={draft.reactionType === t}
                        onChange={() => update({ reactionType: t })}
                      />
                      {t === 'allergy' ? 'Allergy' : 'Intolerance'}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="cui-adr__field">
                <label className="cui-adr__label" htmlFor={`${id}-date`}>
                  Date of reaction
                </label>
                <input
                  id={`${id}-date`}
                  className="cui-adr__control cui-adr__control--date"
                  disabled={!hasAgent}
                  placeholder="For example 2019 or 04-Mar-2021"
                  value={draft.reactionDate ?? ''}
                  onChange={e => update({ reactionDate: e.target.value })}
                />
              </div>
            </div>
          ) : null}

          {/* 3. Source (RAD-0430) */}
          <div className="cui-adr__field">
            <label className="cui-adr__label" htmlFor={`${id}-source`}>
              Source of information
            </label>
            <select
              id={`${id}-source`}
              className={cx('cui-adr__control', !draft.source && 'cui-adr__control--prompt')}
              disabled={!hasAgent}
              value={draft.source}
              onChange={e => {
                const v = e.target.value;
                update({ source: v, clinicianWitnessed: v === WITNESSED ? true : draft.clinicianWitnessed });
              }}
            >
              <option value="">Enter source of most recent information</option>
              {sources.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Clinician witnessed (RAD-0440) */}
          <label className="cui-adr__check" data-touch-target>
            <input
              type="checkbox"
              disabled={!hasAgent}
              checked={draft.clinicianWitnessed}
              onChange={e => update({ clinicianWitnessed: e.target.checked })}
            />
            Clinician witnessed reaction
          </label>

          {w.newThisAdmission ? (
            <label className="cui-adr__check" data-touch-target>
              <input
                type="checkbox"
                disabled={!hasAgent}
                checked={!!draft.newThisAdmission}
                onChange={e => update({ newThisAdmission: e.target.checked })}
              />
              New this admission
            </label>
          ) : null}

          {/* 5. Justification (RAD-0380 to RAD-0420) */}
          <div className="cui-adr__field">
            <label className="cui-adr__label" htmlFor={`${id}-details`}>
              Other details/ justification
            </label>
            <textarea
              id={`${id}-details`}
              className="cui-adr__control"
              rows={3}
              disabled={!hasAgent}
              placeholder="Describe what happened and why this entry is being added"
              value={draft.details}
              aria-describedby={uniqueWords.length ? `${id}-words` : undefined}
              onChange={e => update({ details: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Tab' && !e.shiftKey && canFinish) {
                  e.preventDefault();
                  finishRef.current?.focus();
                }
              }}
            />
            {uniqueWords.length ? (
              <div className="cui-adr__words" id={`${id}-words`}>
                <Icon name="info" size={16} />
                <span>
                  Reaction words found:{' '}
                  {uniqueWords.map((w, i) => (
                    <React.Fragment key={w}>
                      {i ? ', ' : ''}
                      <mark className="cui-adr__mark">{w}</mark>
                    </React.Fragment>
                  ))}
                  . Enter significant reactions in Type(s) of reactions experienced.
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Existing entries (RAD-0070) */}
        <aside className="cui-adr__existing" aria-labelledby={`${id}-ex`}>
          <h3 className="cui-adr__existing-title" id={`${id}-ex`}>
            {w.existingTitle}
          </h3>
          {existingEntries.filter(e => !e.removed).length ? (
            <ul className="cui-adr__existing-list">
              {existingEntries
                .filter(e => !e.removed)
                .map(e => (
                  <li key={e.id} className={cx('cui-adr__existing-item', e.id === entryId && 'cui-adr__existing-item--current', duplicate?.id === e.id && 'cui-adr__existing-item--dup')}>
                    <span className={cx('cui-adr__agent', !e.agent.code && 'cui-adr__agent--free')}>{adrConceptLabel(e.agent)}</span>
                    {e.reactions.length ? (
                      <span className="cui-adr__existing-rx">{e.reactions.map(r => adrConceptLabel(r.concept)).join(', ')}</span>
                    ) : null}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="cui-adr__hint">None recorded.</p>
          )}
        </aside>
      </div>
      {!hasAgent ? <span className="cui-adr__hint">Enter the causative agent first. The other fields become available after that.</span> : null}
      <VisuallyHidden aria-live="polite">{subsetLabel ? `Current filter: ${subsetLabel}` : ''}</VisuallyHidden>
    </section>
  );
}
