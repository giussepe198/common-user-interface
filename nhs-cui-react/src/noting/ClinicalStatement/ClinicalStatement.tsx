import React from 'react';
import { Button, cx, formatDateTime, formatShortDate, toDate } from '../../core';
import { formatStatementDate, renderStatementText, type ClinicalStatementData } from '../utils/statement';

export type { ClinicalStatementData };

export interface ClinicalStatementProps {
  statement: ClinicalStatementData;
  /** True in a list that mixes patterns: the context is shown at the start of the statement. */
  inMixedList?: boolean;
  /** Visually highlight the coded parts (a user option for validating encoding). Default false. */
  highlightCoded?: boolean;
  /** Show the date to the left of the statement (observation time preferred). Default true. */
  showDate?: boolean;
  /** Show author and session time on a subsidiary line (for multi-session views). Default false. */
  showProvenance?: boolean;
  /** Flag text for statements with no coded term. Default "No terms available". */
  unboundLabel?: string;
  /** Offers an "Add terms" action on unbound statements. */
  onAddEncoding?: (statement: ClinicalStatementData) => void;
  /** Offers an explicit "Edit" action (editing needs a specific user action). */
  onEdit?: (statement: ClinicalStatementData) => void;
  /** Element to render: 'div' (default) or 'li' inside a list. */
  as?: 'div' | 'li';
  className?: string;
}

/** Date shown for a statement: observation time at captured precision, else session date. */
export function statementDateText(s: ClinicalStatementData): string {
  if (s.observationTime) return formatStatementDate(s.observationTime);
  const d = toDate(s.sessionTime ?? null);
  return d ? formatShortDate(d) : '';
}

/**
 * One clinical statement as readable text (Display of Clinical Statements, experimental): context
 * and negation first, coded and free text merged, coded parts set apart by size and colour rather
 * than bold or italics, unbound statements shown in full with a flag. Never shows concept IDs.
 */
export function ClinicalStatement({
  statement,
  inMixedList = false,
  highlightCoded = false,
  showDate = true,
  showProvenance = false,
  unboundLabel = 'No terms available',
  onAddEncoding,
  onEdit,
  as = 'div',
  className,
}: ClinicalStatementProps) {
  const rendered = renderStatementText(statement, { inMixedList });
  const Tag = as;
  const date = showDate ? statementDateText(statement) : '';
  const session = toDate(statement.sessionTime ?? null);
  return (
    <Tag className={cx('cui-clinical-statement', highlightCoded && 'cui-clinical-statement--highlight', rendered.unbound && 'cui-clinical-statement--unbound', !showDate && 'cui-clinical-statement--no-date', className)}>
      {showDate ? <span className="cui-clinical-statement__date">{date || <span className="cui-visually-hidden">No date</span>}</span> : null}
      <span className="cui-clinical-statement__main">
        <span className="cui-clinical-statement__text">
          {rendered.parts.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && !/^[,.;:)]/.test(p.text) ? ' ' : ''}
              <span className={`cui-clinical-statement__${p.kind}`}>
                {p.kind === 'free' && !rendered.unbound ? <span className="cui-visually-hidden">(free text) </span> : null}
                {p.text}
              </span>
            </React.Fragment>
          ))}
        </span>
        {rendered.unbound ? (
          <span className="cui-clinical-statement__flag">
            {unboundLabel}
            {onAddEncoding ? (
              <Button size="sm" variant="quiet" onClick={() => onAddEncoding(statement)}>Add terms</Button>
            ) : null}
          </span>
        ) : null}
        {showProvenance && (statement.author || session) ? (
          <span className="cui-clinical-statement__provenance">
            {statement.author ? `Recorded by ${statement.author}` : 'Recorded'}
            {session ? ` on ${formatDateTime(session)}` : ''}
            {statement.location ? `, ${statement.location}` : ''}
          </span>
        ) : null}
      </span>
      {onEdit ? (
        <Button className="cui-clinical-statement__edit" size="sm" variant="quiet" icon="pencil" onClick={() => onEdit(statement)}>Edit</Button>
      ) : null}
    </Tag>
  );
}
