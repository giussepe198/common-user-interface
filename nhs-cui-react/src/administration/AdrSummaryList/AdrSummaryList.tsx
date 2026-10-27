import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatDateTime } from '../../core/format';
import type { DateLike } from '../../core/format';
import { NilByMouthWarningSymbol } from '../NilByMouthBanner/NilByMouthBanner';
import {
  AdrEntry,
  AdrStatusRecord,
  adrActiveEntries,
  adrConceptLabel,
  adrDeactivatedEntries,
  adrSummaryState,
  adrSummaryWording,
} from '../utils/adr';

export interface AdrSummaryListProps {
  /** All entries, including removed ones (shown only in the deactivated summaries list, RAD-0710). */
  entries: AdrEntry[];
  /** Positively recorded status when there are no entries: "no known" or (AU, NZ) "unknown". Never inferred from an empty list. */
  statusRecord?: AdrStatusRecord | null;
  /** Jurisdiction; defaults to the ClinicalLocaleProvider. Changes the title and the status wording (AU "Nil known", NZ "No known allergies or adverse reactions"). */
  region?: ClinicalRegion;
  /** Entries added or changed in this viewing only, shown with "New" or "Updated" beside them (RAD-0630 to RAD-0670). */
  highlight?: Record<string, 'New' | 'Updated'>;
  /** Display deactivated summaries (RAD-0710). */
  showDeactivated?: boolean;
  defaultShowDeactivated?: boolean;
  onShowDeactivatedChange?: (show: boolean) => void;
  /** Fixed list of sources for a "no known" record (RAD-0790). */
  sources?: string[];
  /** Logged-in user, recorded as the author (RAD-0780). */
  currentUser: string;
  /** Time used as the date of entry. Defaults to the current time. */
  now?: Date;
  /** "Add new drug reaction": always visible (RAD-0010). Opens the entry dialog. */
  onAdd?: () => void;
  /** Open the details view of an entry, from which it can be edited or removed (RAD-0680.1, 0830.1). */
  onOpenDetails?: (entryId: string) => void;
  /** Record "no known" or "unknown" (Finish after choosing the status, RAD-0770 to RAD-0820). */
  onRecordStatus?: (record: AdrStatusRecord) => void;
  /** Close (becomes Finish while a status is being recorded, RAD-0810). */
  onClose?: () => void;
  /** Heading level of the title. Default 2. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * Adverse drug reaction summary (AU: allergies and ADR box; NZ: Allergies & Adverse Reactions).
 * Shows active entries, a positively recorded "no known" or "unknown" status with who and when,
 * or a "Not recorded" warning; an empty list is never shown as "no known". Buttons sit together
 * top right (RAD-0010.3.1, 0760.1 to 0760.4). Removed entries are viewable as deactivated summaries.
 */
export function AdrSummaryList({
  entries,
  statusRecord,
  region: regionProp,
  highlight = {},
  showDeactivated,
  defaultShowDeactivated = false,
  onShowDeactivatedChange,
  sources = [],
  currentUser,
  now,
  onAdd,
  onOpenDetails,
  onRecordStatus,
  onClose,
  headingLevel = 2,
  className,
}: AdrSummaryListProps) {
  const id = useId('cui-adr-sum');
  const { region } = useClinicalLocale(regionProp);
  const w = adrSummaryWording(region);
  const H = `h${headingLevel}` as 'h2';
  const [deactivated, setDeactivated] = useControllableState(showDeactivated, defaultShowDeactivated, onShowDeactivatedChange);
  const [pending, setPending] = React.useState<null | { status: 'noKnown' | 'unknown'; at: Date }>(null);
  const [source, setSource] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [error, setError] = React.useState('');
  const pendingRef = React.useRef<HTMLDivElement>(null);

  const active = adrActiveEntries(entries);
  const removed = adrDeactivatedEntries(entries);
  const state = adrSummaryState(entries, statusRecord, region);
  const canRecordStatus = !!onRecordStatus && state !== 'entries';
  const offersUnknown = region !== 'GB' && !!w.unknownButton;

  React.useEffect(() => {
    if (pending) pendingRef.current?.focus();
  }, [pending]);

  const start = (status: 'noKnown' | 'unknown') => {
    setPending({ status, at: now ?? new Date() });
    setSource('');
    setDetails('');
    setError('');
  };

  const finish = () => {
    if (!pending) return;
    if (pending.status === 'unknown' && w.unknownNeedsReason && !details.trim()) {
      setError('Enter why the status is unknown. Also document it in the health record.');
      return;
    }
    onRecordStatus?.({
      status: pending.status,
      recordedAt: pending.at,
      recordedBy: currentUser,
      source: source || undefined,
      details: details.trim() || undefined,
    });
    setPending(null);
  };

  const recordedLine = (at: DateLike, by: string) => (
    <span className="cui-adr-sum__meta">
      Recorded {formatDateTime(at)} by {by}
    </span>
  );

  const entryLine = (e: AdrEntry) => (
    <>
      <span className={cx('cui-adr-sum__agent', !e.agent.code && 'cui-adr-sum__agent--free')}>{adrConceptLabel(e.agent)}</span>
      {e.reactions.length ? (
        <span className="cui-adr-sum__rx">
          {e.reactions.map(r => adrConceptLabel(r.concept) + (r.elaboration ? ` (${r.elaboration})` : '')).join('; ')}
        </span>
      ) : (
        <span className="cui-adr-sum__rx cui-adr-sum__rx--none">Reaction not known</span>
      )}
      {w.recordTypeAndDate && (e.reactionType || e.reactionDate) ? (
        <span className="cui-adr-sum__meta">
          {[e.reactionType === 'allergy' ? 'Allergy' : e.reactionType === 'intolerance' ? 'Intolerance' : '', e.reactionDate ?? ''].filter(Boolean).join(', ')}
        </span>
      ) : null}
      {w.newThisAdmission && e.newThisAdmission ? <span className="cui-adr-sum__tag">New this admission</span> : null}
    </>
  );

  return (
    <section className={cx('cui-adr-sum', className)} aria-labelledby={`${id}-h`}>
      <div className="cui-adr-sum__head">
        <H className="cui-adr-sum__title" id={`${id}-h`}>
          {w.title}
        </H>
        <div className="cui-adr-sum__buttons">
          {canRecordStatus ? (
            <>
              <Button disabled={!!pending} aria-pressed={pending?.status === 'noKnown' || undefined} onClick={() => start('noKnown')}>
                {w.noKnownButton}
              </Button>
              {offersUnknown ? (
                <Button disabled={!!pending} aria-pressed={pending?.status === 'unknown' || undefined} onClick={() => start('unknown')}>
                  {w.unknownButton}
                </Button>
              ) : null}
            </>
          ) : null}
          {onAdd ? (
            <Button variant={pending ? 'secondary' : 'primary'} icon="plus" onClick={onAdd}>
              {w.addLabel}
            </Button>
          ) : null}
          {pending ? (
            <>
              <Button variant="quiet" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={finish}>
                Finish
              </Button>
            </>
          ) : onClose ? (
            <Button onClick={onClose}>Close</Button>
          ) : null}
        </div>
      </div>

      <div className="cui-adr-sum__main">
        {pending ? (
          <div className="cui-adr-sum__status cui-adr-sum__status--pending" tabIndex={-1} ref={pendingRef} aria-label={`Recording: ${pending.status === 'noKnown' ? w.noKnownText : w.unknownText}`}>
            <div className="cui-adr-sum__status-text">
              <strong>{pending.status === 'noKnown' ? w.noKnownText : w.unknownText}</strong>
              {recordedLine(pending.at, currentUser)}
            </div>
            {pending.status === 'noKnown' && sources.length ? (
              <div className="cui-adr-sum__field">
                <label className="cui-adr-sum__label" htmlFor={`${id}-source`}>
                  Source of information
                </label>
                <select id={`${id}-source`} className="cui-adr-sum__control" value={source} onChange={e => setSource(e.target.value)}>
                  <option value="">Enter source of most recent information</option>
                  {sources.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="cui-adr-sum__field">
              <label className="cui-adr-sum__label" htmlFor={`${id}-details`}>
                {pending.status === 'unknown' && w.unknownNeedsReason ? 'Why the status is unknown (required)' : 'Supporting details'}
              </label>
              <textarea
                id={`${id}-details`}
                className="cui-adr-sum__control"
                rows={2}
                value={details}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? `${id}-err` : undefined}
                placeholder={pending.status === 'unknown' ? 'For example, patient unconscious and no records available' : undefined}
                onChange={e => setDetails(e.target.value)}
              />
              {error ? (
                <span className="cui-adr-sum__error" id={`${id}-err`} role="alert">
                  <Icon name="error" size={16} /> {error}
                </span>
              ) : null}
            </div>
          </div>
        ) : state === 'entries' ? (
          <ul className="cui-adr-sum__list" aria-label={w.title}>
            {active.map(e => (
              <li key={e.id} className={cx('cui-adr-sum__item', highlight[e.id] && 'cui-adr-sum__item--hl')}>
                {onOpenDetails ? (
                  <button type="button" className="cui-adr-sum__entry" onClick={() => onOpenDetails(e.id)}>
                    {entryLine(e)}
                  </button>
                ) : (
                  <span className="cui-adr-sum__entry">{entryLine(e)}</span>
                )}
                {highlight[e.id] ? <span className="cui-adr-sum__new">{highlight[e.id]}</span> : null}
              </li>
            ))}
          </ul>
        ) : state === 'noKnown' || state === 'unknown' ? (
          <div className={cx('cui-adr-sum__status', `cui-adr-sum__status--${state}`)}>
            <div className="cui-adr-sum__status-text">
              <strong>{state === 'noKnown' ? w.noKnownText : w.unknownText}</strong>
              {recordedLine(statusRecord!.recordedAt, statusRecord!.recordedBy)}
            </div>
            {statusRecord!.source ? <span className="cui-adr-sum__meta">Source: {statusRecord!.source}</span> : null}
            {statusRecord!.details ? <span className="cui-adr-sum__meta">{statusRecord!.details}</span> : null}
          </div>
        ) : (
          <div className="cui-adr-sum__status cui-adr-sum__status--not-recorded">
            <NilByMouthWarningSymbol />
            <div className="cui-adr-sum__status-text">
              <strong>{w.notRecordedText}</strong>
              <span className="cui-adr-sum__meta">{w.notRecordedHint}</span>
            </div>
          </div>
        )}
      </div>

      {removed.length ? (
        <div className="cui-adr-sum__deactivated">
          <label className="cui-adr-sum__check">
            <input type="checkbox" checked={deactivated} onChange={e => setDeactivated(e.target.checked)} aria-controls={`${id}-deact`} />
            Display deactivated summaries ({removed.length})
          </label>
          {deactivated ? (
            <div id={`${id}-deact`}>
              <h3 className="cui-adr-sum__subtitle">{w.deactivatedTitle}</h3>
              <ul className="cui-adr-sum__list cui-adr-sum__list--removed">
                {removed.map(e => (
                  <li key={e.id} className="cui-adr-sum__item cui-adr-sum__item--removed">
                    <span className="cui-adr-sum__entry">
                      {entryLine(e)}
                      <span className="cui-adr-sum__meta">
                        Removed{e.removedAt ? ` ${formatDateTime(e.removedAt)}` : ''}
                        {e.removedBy ? ` by ${e.removedBy}` : ''}
                        {e.removedReason ? `. Reason: ${e.removedReason}` : ''}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
