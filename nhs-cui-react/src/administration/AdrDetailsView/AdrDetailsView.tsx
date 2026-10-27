import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useId, VisuallyHidden } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatDateTime } from '../../core/format';
import type { DateLike } from '../../core/format';
import { AdrRemoveConfirm } from '../AdrRecordingDialog/AdrRemoveConfirm';
import { AdrEntry, adrConceptLabel, adrSummaryWording } from '../utils/adr';

/** One change in the edit history of an entry (RAD-0890). */
export interface AdrHistoryItem {
  at: DateLike;
  by: string;
  /** What changed, e.g. "Reaction added: wheezing". */
  description: string;
}

export interface AdrDetailsViewProps {
  /** The entry shown. */
  entry: AdrEntry;
  /** Edit history with dates (RAD-0890). The control to show it is hidden when empty. */
  history?: AdrHistoryItem[];
  /** Jurisdiction; defaults to the ClinicalLocaleProvider. AU shows type and date; NZ shows "New this admission". */
  region?: ClinicalRegion;
  /** "Edit": open the entry dialog in edit mode; everything except the causative agent is editable (RAD-0830). */
  onEdit?: () => void;
  /** Remove the entry from the summary after the confirmation (RAD-0680 to RAD-0750). Clinical notes are kept. */
  onRemove?: (reason: string) => void;
  /** Back to the summary list. */
  onBack: () => void;
  className?: string;
}

/**
 * Details view of one adverse drug reaction entry: everything recorded, who recorded it, an edit
 * history, and the "Edit" and "Remove from list" controls (RAD-0680.1, 0680.2, 0700, 0830.1, 0830.3, 0890).
 * Removal asks for confirmation that names the drug and explains what happens (RAD-0750).
 */
export function AdrDetailsView({ entry, history = [], region: regionProp, onEdit, onRemove, onBack, className }: AdrDetailsViewProps) {
  const id = useId('cui-adr-det');
  const { region } = useClinicalLocale(regionProp);
  const w = adrSummaryWording(region);
  const [confirm, setConfirm] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const removeRef = React.useRef<HTMLButtonElement>(null);
  const agent = adrConceptLabel(entry.agent);

  if (confirm && onRemove) {
    return (
      <AdrRemoveConfirm
        className={className}
        agentName={agent}
        listName={w.listName}
        onConfirm={reason => {
          setConfirm(false);
          onRemove(reason);
        }}
        onCancel={() => {
          setConfirm(false);
          requestAnimationFrame(() => removeRef.current?.focus());
        }}
      />
    );
  }

  const rows: [string, React.ReactNode][] = [];
  rows.push([w.agentLabel, <span className={cx('cui-adr-det__agent', !entry.agent.code && 'cui-adr-det__agent--free')}>{agent}{entry.agent.code ? null : <span className="cui-adr-det__uncoded"> (not coded)</span>}</span>]);
  rows.push([
    w.reactionsLabel,
    entry.reactions.length ? (
      <ul className="cui-adr-det__rx">
        {entry.reactions.map((r, i) => (
          <li key={i}>
            <span className={cx('cui-adr-det__rx-term', !r.concept.code && 'cui-adr-det__rx-term--free')}>{adrConceptLabel(r.concept)}</span>
            {r.elaboration ? <span className="cui-adr-det__rx-detail"> {r.elaboration}</span> : null}
          </li>
        ))}
      </ul>
    ) : (
      'Not known'
    ),
  ]);
  if (w.recordTypeAndDate) {
    rows.push(['Type', entry.reactionType === 'allergy' ? 'Allergy' : entry.reactionType === 'intolerance' ? 'Intolerance' : 'Not recorded']);
    rows.push(['Date of reaction', entry.reactionDate || 'Not recorded']);
  }
  if (w.newThisAdmission) rows.push(['New this admission', entry.newThisAdmission ? 'Yes' : 'No']);
  rows.push(['Source of information', entry.source || 'Not recorded']);
  rows.push(['Clinician witnessed reaction', entry.clinicianWitnessed ? 'Yes' : 'No']);
  if (entry.details) rows.push(['Other details/ justification', entry.details]);
  if (entry.recordedAt || entry.recordedBy) {
    rows.push(['Recorded', [entry.recordedAt ? formatDateTime(entry.recordedAt) : '', entry.recordedBy ? `by ${entry.recordedBy}` : ''].filter(Boolean).join(' ')]);
  }

  return (
    <section
      className={cx('cui-adr', 'cui-adr-det', className)}
      aria-labelledby={`${id}-h`}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onBack();
        }
      }}
    >
      <div className="cui-adr__head">
        <h2 className="cui-adr__title" id={`${id}-h`}>
          {agent}
        </h2>
        <div className="cui-adr__buttons">
          {onEdit && !entry.removed ? (
            <Button icon="pencil" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          {onRemove && !entry.removed ? (
            <Button
              ref={removeRef}
              variant="danger"
              icon="trash"
              title="Removes this entry from the list. You can give a reason. Clinical notes are kept."
              aria-describedby={`${id}-rm-help`}
              onClick={() => setConfirm(true)}
            >
              Remove from list
            </Button>
          ) : null}
          <Button onClick={onBack}>Back</Button>
        </div>
        <VisuallyHidden id={`${id}-rm-help`}>Removes this entry from the list. You can give a reason. Clinical notes are kept.</VisuallyHidden>
      </div>
      {entry.removed ? (
        <div className="cui-adr__warn" role="note">
          <Icon name="info" size={16} />
          <span>
            Removed from the {w.listName}
            {entry.removedAt ? ` on ${formatDateTime(entry.removedAt)}` : ''}
            {entry.removedBy ? ` by ${entry.removedBy}` : ''}
            {entry.removedReason ? `. Reason: ${entry.removedReason}` : ''}.
          </span>
        </div>
      ) : null}
      <dl className="cui-adr-det__list">
        {rows.map(([k, v]) => (
          <div key={k} className="cui-adr-det__row">
            <dt className="cui-adr-det__dt">{k}</dt>
            <dd className="cui-adr-det__dd">{v}</dd>
          </div>
        ))}
      </dl>
      {history.length ? (
        <div className="cui-adr-det__history">
          <button type="button" className="cui-adr-det__toggle" aria-expanded={showHistory} aria-controls={`${id}-hist`} onClick={() => setShowHistory(!showHistory)}>
            <Icon name={showHistory ? 'chevron-down' : 'chevron-right'} size={16} />
            <Icon name="history" size={16} />
            Edit history ({history.length})
          </button>
          {showHistory ? (
            <ol className="cui-adr-det__hist-list" id={`${id}-hist`}>
              {history.map((h, i) => (
                <li key={i}>
                  <span className="cui-adr-det__hist-when">{formatDateTime(h.at)}</span> {h.by}: {h.description}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
