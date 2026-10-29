import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';

export interface PanelProps {
  /** Heading of the panel. Required: every panel is named. */
  title: React.ReactNode;
  /** Heading level, so the page outline stays correct. Default 2. */
  headingLevel?: 2 | 3 | 4;
  /** Count after the title, e.g. the number of rows; shown only while collapsed when `countWhenCollapsed` (MEDv-089). */
  count?: number;
  /** Words for the count for screen readers, e.g. "3 alerts". Default the number. */
  countLabel?: string;
  /** Show the count only while the panel is collapsed (MEDv-089 style). Default false: always shown. */
  countWhenCollapsed?: boolean;
  /** A short line under the heading, e.g. "Updated 12-Aug-2026 14:32". */
  subtitle?: React.ReactNode;
  /** Commands in the header (quiet Buttons or a MenuButton), kept at the end. */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  /** Bottom strip, e.g. "Show all 24". */
  footer?: React.ReactNode;
  /** The heading becomes a button that shows and hides the body. Default false. */
  collapsible?: boolean;
  /** Collapsed (controlled). */
  collapsed?: boolean;
  /** Initially collapsed (uncontrolled). Default false: panels start open (MEDv-191). */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Body padding: 'compact' (default) or 'none' for a list or table that runs to the edges. */
  padding?: 'compact' | 'none';
  /** Visual weight: 'default' bordered surface, or 'sunken' for a panel inside a panel. */
  variant?: 'default' | 'sunken';
  /**
   * Header style: 'bar' (default) a compact header strip above a divider, for lists and tools; 'section' a larger
   * heading with no divider and roomier padding, for a form section or a summary card on a record overview.
   */
  appearance?: 'bar' | 'section';
  className?: string;
  id?: string;
}

/**
 * The dense card: a named section with a heading, optional count, commands at the end, a body and an optional
 * footer. Collapsible panels use a chevron button in the heading (never a black triangle, ADR-0041).
 */
export function Panel({
  title,
  headingLevel = 2,
  count,
  countLabel,
  countWhenCollapsed = false,
  subtitle,
  actions,
  children,
  footer,
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  padding = 'compact',
  variant = 'default',
  appearance = 'bar',
  className,
  id: idProp,
}: PanelProps) {
  const id = useId('cui-panel', idProp);
  const [isCollapsed, setCollapsed] = useControllableState<boolean>(collapsed, defaultCollapsed, onCollapsedChange);
  const closed = collapsible && isCollapsed;
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const showCount = count !== undefined && (!countWhenCollapsed || closed);
  const countNode = showCount ? (
    <>
      <span className="cui-panel__count" aria-hidden="true">
        {count}
      </span>
      <span className="cui-visually-hidden">, {countLabel ?? String(count)}</span>
    </>
  ) : null;
  return (
    <section className={cx('cui-panel', `cui-panel--${variant}`, appearance === 'section' && 'cui-panel--section', closed && 'cui-panel--collapsed', className)} aria-labelledby={`${id}-title`}>
      <div className="cui-panel__header">
        <div className="cui-panel__titles">
          <H className="cui-panel__heading">
            {collapsible ? (
              <button
                type="button"
                id={`${id}-title`}
                className="cui-panel__toggle"
                aria-expanded={!closed}
                aria-controls={`${id}-body`}
                onClick={() => setCollapsed(!isCollapsed)}
              >
                <Icon name={closed ? 'chevron-right' : 'chevron-down'} size={16} className="cui-panel__chevron" />
                <span className="cui-panel__title">{title}</span>
                {countNode}
              </button>
            ) : (
              <span id={`${id}-title`} className="cui-panel__title-wrap">
                <span className="cui-panel__title">{title}</span>
                {countNode}
              </span>
            )}
          </H>
          {subtitle ? <div className="cui-panel__subtitle">{subtitle}</div> : null}
        </div>
        {actions ? <div className="cui-panel__actions">{actions}</div> : null}
      </div>
      <div id={`${id}-body`} className={cx('cui-panel__body', padding === 'none' && 'cui-panel__body--flush')} hidden={closed}>
        {children}
      </div>
      {footer && !closed ? <div className="cui-panel__footer">{footer}</div> : null}
    </section>
  );
}
