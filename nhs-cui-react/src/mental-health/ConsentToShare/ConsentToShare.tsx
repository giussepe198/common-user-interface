import React from 'react';
import { Button, cx, Icon, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { MhGlyph } from '../internal/MhGlyph';
import { useMinuteClock } from '../internal/useMinuteClock';
import { mhFormatZonedDate, mhIsReviewOverdue } from '../utils/mentalHealth';
import type { ConsentState } from '../ConsentIndicator/ConsentIndicator';

/** A category of information, from the host, in its words. */
export interface ConsentToShareCategory {
  id: string;
  label: string;
}

/** A recipient row: a support person, agency or practitioner. */
export interface ConsentToShareRecipient {
  id: string;
  /** Name in words, e.g. "Linh Nguyen, sister". */
  name: string;
  /** Kind in words, e.g. "Carer", "GP". */
  kind?: string;
  /** State per category id; a missing category is "not recorded", never "allowed". */
  states: Readonly<Record<string, ConsentState>>;
  /** Reason or basis in words, e.g. "The person's stated preference, 12-Aug-2026". */
  reason?: string | null;
  /** Who gave it, e.g. "The person", "Guardian". */
  grantor?: string | null;
  /** Review date; once passed the row says "Review overdue". */
  reviewDue?: DateLike | null;
  /**
   * An ended decision stays in the matrix for the record, muted, with "Ended" and the date in words
   * [suggested]. Its cells still say what it held.
   */
  ended?: { date: DateLike; text?: string | null } | null;
}

/** Cell words; defaults [suggested]. */
export interface ConsentToShareLabels {
  allowed: string;
  restricted: string;
  withdrawn: string;
  'not-recorded': string;
}

const DEFAULT_LABELS: ConsentToShareLabels = { allowed: 'May share', restricted: 'Do not share', withdrawn: 'Withdrawn', 'not-recorded': 'Not asked' };

export interface ConsentToShareProps {
  categories: ReadonlyArray<ConsentToShareCategory>;
  recipients: ReadonlyArray<ConsentToShareRecipient>;
  /** Caption. Default "Who may receive which information". */
  caption?: string;
  labels?: Partial<ConsentToShareLabels>;
  /** Edit a recipient's consent (opens the host's form). */
  onEdit?: (recipient: ConsentToShareRecipient) => void;
  /** The host's own commands for a row, after the reason and review (for example "End"), each named for the recipient [suggested]. */
  renderActions?: (recipient: ConsentToShareRecipient) => React.ReactNode;
  /** Words when there are no rows. Default "No sharing preferences recorded". */
  emptyText?: string;
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

/**
 * A matrix of who may receive which information: each cell says the consent state in words with an icon, consent
 * colours and, for "do not share" and "withdrawn", the inline-start bar; each row gives the reason, who gave it and the
 * review date, with "Review overdue" in words. Missing is
 * "Not asked", never read as allowed. Labelled cards when narrow.
 */
export function ConsentToShare({
  categories,
  recipients,
  caption = 'Who may receive which information',
  labels,
  onEdit,
  renderActions,
  emptyText = 'No sharing preferences recorded',
  now: nowProp,
  timeZone: tzProp,
  region,
  className,
}: ConsentToShareProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const now = useMinuteClock(nowProp);
  const words = { ...DEFAULT_LABELS, ...labels };

  return (
    <div className={cx('cui-consent-share', className)}>
      <table className="cui-consent-share__table">
        <caption className="cui-consent-share__caption">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Recipient</th>
            {categories.map((c) => (
              <th scope="col" key={c.id} className="cui-consent-share__cat">
                {c.label}
              </th>
            ))}
            <th scope="col">Reason and review</th>
          </tr>
        </thead>
        <tbody>
          {recipients.length === 0 ? (
            <tr>
              <td colSpan={categories.length + 2} className="cui-consent-share__empty">
                {emptyText}
              </td>
            </tr>
          ) : null}
          {recipients.map((r) => {
            const ended = !!r.ended;
            const overdue = !ended && mhIsReviewOverdue(r.reviewDue, now);
            return (
              <tr key={r.id} className={cx(ended && 'cui-consent-share__row--ended')}>
                <th scope="row" className="cui-consent-share__who">
                  <span className="cui-consent-share__name">{r.name}</span>
                  {r.kind ? <span className="cui-consent-share__kind">{r.kind}</span> : null}
                </th>
                {categories.map((c) => {
                  const state: ConsentState = r.states[c.id] ?? 'not-recorded';
                  return (
                    <td key={c.id} data-label={c.label} className="cui-consent-share__cell">
                      <span className={cx('cui-consent-share__state', `cui-consent-share__state--${state}`)} data-consent-state={state}>
                        {state === 'not-recorded' ? <Icon name="warning" size={16} /> : state === 'allowed' ? <MhGlyph name="handshake" /> : <Icon name="close" size={16} />}
                        {words[state]}
                      </span>
                    </td>
                  );
                })}
                <td data-label="Reason and review" className="cui-consent-share__reason">
                  {r.reason ? <span className="cui-consent-share__reason-text">{r.reason}</span> : null}
                  {r.grantor ? <span className="cui-consent-share__grantor">{`Given by ${r.grantor}`}</span> : null}
                  {r.ended ? (
                    <span className="cui-consent-share__ended">
                      <Icon name="history" size={16} />
                      {`Ended ${mhFormatZonedDate(r.ended.date, timeZone)}${r.ended.text ? `: ${r.ended.text}` : ''}`}
                    </span>
                  ) : null}
                  {!ended && r.reviewDue ? (
                    <span className={cx('cui-consent-share__review', overdue && 'cui-consent-share__review--overdue')}>
                      {overdue ? <Icon name="warning" size={16} /> : null}
                      {`${overdue ? 'Review overdue: was due' : 'Review by'} ${mhFormatZonedDate(r.reviewDue, timeZone)}`}
                    </span>
                  ) : null}
                  {onEdit ? (
                    <Button size="sm" variant="quiet" icon="pencil" onClick={() => onEdit(r)} aria-label={`Change sharing for ${r.name}`}>
                      Change
                    </Button>
                  ) : null}
                  {renderActions ? <span className="cui-consent-share__actions">{renderActions(r)}</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
