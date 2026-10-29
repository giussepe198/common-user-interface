import React from 'react';
import { cx, formatDateTime, toDate, useId } from '../../core';
import { ClinicalStatement } from '../ClinicalStatement/ClinicalStatement';
import { STATEMENT_PATTERN_HEADINGS, type ClinicalStatementData } from '../utils/statement';

export interface StatementListProps {
  statements: ClinicalStatementData[];
  /**
   * 'pattern': grouped under full pattern headings (single session, e.g. admission clerking), the
   * context is carried by the heading. 'chronological': newest first, mixed patterns, each
   * statement starts with its context and shows who recorded it (patient review).
   */
  grouping?: 'pattern' | 'chronological';
  /** Order of pattern groups. Default PMH, PSH, FH, MH, AAR, HCC, CM, SR, then others. */
  patternOrder?: string[];
  /** Override heading text per pattern. */
  headings?: Readonly<Record<string, string>>;
  /** Common session details shown once in the list heading (not repeated per statement). */
  session?: { author?: string; sessionTime?: Date | string; location?: string };
  /** Keep headings in view while scrolling, so context is never lost. Default true. */
  stickyHeadings?: boolean;
  /** Alternate row shading (banding). Default true for chronological, false for pattern. */
  banding?: boolean;
  /** Offer the user a "Highlight coded terms" option. Default true. */
  showHighlightToggle?: boolean;
  /** Statements recorded with no coded term offer "Add terms". */
  onAddEncoding?: (statement: ClinicalStatementData) => void;
  onEdit?: (statement: ClinicalStatementData) => void;
  /** Text shown when there are no statements. */
  emptyText?: string;
  /** The flag on a statement with no coded term (clinicalstatements: "No terms available", "Not coded"). */
  unboundLabel?: string;
  className?: string;
}

const DEFAULT_ORDER = ['PMH', 'PSH', 'FH', 'MH', 'AAR', 'HCC', 'CM', 'SR'];

function sortKey(s: ClinicalStatementData): number {
  const o = s.observationTime;
  if (o) return new Date(o.year, (o.month ?? 1) - 1, o.day ?? 1, o.hour ?? 0, o.minute ?? 0).getTime();
  return toDate(s.sessionTime ?? null)?.getTime() ?? 0;
}

/** List of clinical statements grouped by pattern or in date order (experimental). Dates sit at the left; at most two content columns. */
export function StatementList({
  statements,
  grouping = 'pattern',
  patternOrder = DEFAULT_ORDER,
  headings,
  session,
  stickyHeadings = true,
  banding,
  showHighlightToggle = true,
  onAddEncoding,
  onEdit,
  emptyText = 'No statements recorded.',
  unboundLabel,
  className,
}: StatementListProps) {
  const id = useId('cui-statements');
  const [highlight, setHighlight] = React.useState(false);
  const band = banding ?? grouping === 'chronological';
  const sessionTime = toDate(session?.sessionTime ?? null);
  const headingFor = (p: string) => headings?.[p] ?? STATEMENT_PATTERN_HEADINGS[p] ?? p;

  const common = { highlightCoded: highlight, onAddEncoding, onEdit, as: 'li' as const, ...(unboundLabel ? { unboundLabel } : {}) };
  let body: React.ReactNode;
  if (!statements.length) body = <p className="cui-statement-list__empty">{emptyText}</p>;
  else if (grouping === 'chronological') {
    const sorted = statements.map((s, i) => ({ s, i })).sort((a, b) => sortKey(b.s) - sortKey(a.s) || a.i - b.i).map((x) => x.s);
    body = (
      <ul className="cui-statement-list__items">
        {sorted.map((s) => <ClinicalStatement key={s.id} statement={s} inMixedList showProvenance {...common} />)}
      </ul>
    );
  } else {
    const patterns = Array.from(new Set(statements.map((s) => String(s.pattern))));
    patterns.sort((a, b) => {
      const ia = patternOrder.indexOf(a);
      const ib = patternOrder.indexOf(b);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
    body = patterns.map((p) => (
      <section key={p} className="cui-statement-list__group" aria-labelledby={`${id}-${p}`}>
        <h4 id={`${id}-${p}`} className="cui-statement-list__heading">{headingFor(p)}</h4>
        <ul className="cui-statement-list__items">
          {statements.filter((s) => String(s.pattern) === p).map((s) => <ClinicalStatement key={s.id} statement={s} {...common} />)}
        </ul>
      </section>
    ));
  }

  return (
    <div className={cx('cui-statement-list', stickyHeadings && 'cui-statement-list--sticky', band && 'cui-statement-list--banded', className)}>
      {(session && (session.author || sessionTime)) || showHighlightToggle ? (
        <div className="cui-statement-list__bar">
          {session && (session.author || sessionTime) ? (
            <span className="cui-statement-list__session">
              {session.author ? `Recorded by ${session.author}` : 'Recorded'}
              {sessionTime ? ` on ${formatDateTime(sessionTime)}` : ''}
              {session.location ? `, ${session.location}` : ''}
            </span>
          ) : <span />}
          {showHighlightToggle && statements.length ? (
            <label className="cui-statement-list__toggle" data-touch-target>
              <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} />
              Highlight coded terms
            </label>
          ) : null}
        </div>
      ) : null}
      {body}
    </div>
  );
}
