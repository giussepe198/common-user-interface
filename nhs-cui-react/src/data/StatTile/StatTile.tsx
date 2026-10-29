import React from 'react';
import { Icon, cx, formatDateTime, useId, type DateLike } from '../../core';

/** A change since an earlier period, always in words. */
export interface StatTileTrend {
  /** Which way the number moved. Drawn as an arrow or a level line beside the words. */
  direction: 'up' | 'down' | 'same';
  /** The change in words, e.g. "Up 3 since last week" or "No change since September". Required: the arrow never stands alone. */
  text: string;
}

export interface StatTileProps {
  /** What the number counts, as the tile's heading, e.g. "Referrals waiting". */
  label: string;
  /** The number, already formatted, e.g. 42 or "99.9%". null means it is not shown (see `suppressedText`), never zero. */
  value: React.ReactNode | null;
  /** Unit after the number, e.g. "days". */
  unit?: string;
  /** Words shown in place of a value that is not shown, e.g. "Fewer than 5". Default "Not shown". */
  suppressedText?: string;
  /** Change since an earlier period, in words with an arrow. Neutral colour: whether up is good is for the reader [suggested]. */
  trend?: StatTileTrend;
  /** A status in words beside the number, e.g. a status chip "None overdue". Never colour alone. */
  status?: React.ReactNode;
  /** One line of context, e.g. "Open referrals for the North team". */
  note?: React.ReactNode;
  /** When the number was counted. Shown as "As at 28-Oct-2026 09:00". */
  asAt?: DateLike;
  /** Heading level of the label, so the page outline stays correct. Default 3. */
  level?: 2 | 3 | 4;
  /** Make the tile open the list behind the number. The whole label becomes a button. */
  onOpen?: () => void;
  className?: string;
}

const TREND_ICON = { up: 'arrow-up', down: 'arrow-down', same: 'minus' } as const;

/**
 * One count or rate with its label as a heading, an optional trend and status in words, and a line of context. Numbers
 * use tabular figures so a row of tiles lines up. A tile is not a chart: the numbers behind a trend belong in a
 * LineChart or BarChart with its table.
 */
export function StatTile({ label, value, unit, suppressedText = 'Not shown', trend, status, note, asAt, level = 3, onOpen, className }: StatTileProps) {
  const id = useId('cui-st');
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  const shown = value === null || value === undefined || value === '';
  return (
    <section className={cx('cui-stat-tile', onOpen && 'cui-stat-tile--interactive', className)} aria-labelledby={`${id}-label`}>
      <Heading id={`${id}-label`} className="cui-stat-tile__label">
        {onOpen ? (
          <button type="button" className="cui-stat-tile__open" onClick={onOpen}>
            {label}
            <span className="cui-visually-hidden">: open the list</span>
          </button>
        ) : (
          label
        )}
      </Heading>
      <div className="cui-stat-tile__main">
        {shown ? (
          <span className="cui-stat-tile__suppressed">{suppressedText}</span>
        ) : (
          <span className="cui-stat-tile__value">
            {value}
            {unit ? <span className="cui-stat-tile__unit"> {unit}</span> : null}
          </span>
        )}
        {status ? <span className="cui-stat-tile__status">{status}</span> : null}
      </div>
      {trend ? (
        <p className="cui-stat-tile__trend">
          <Icon name={TREND_ICON[trend.direction]} />
          <span>{trend.text}</span>
        </p>
      ) : null}
      {note ? <div className="cui-stat-tile__note">{note}</div> : null}
      {asAt !== undefined ? <div className="cui-stat-tile__as-at cui-tabular">{`As at ${formatDateTime(asAt)}`}</div> : null}
    </section>
  );
}
