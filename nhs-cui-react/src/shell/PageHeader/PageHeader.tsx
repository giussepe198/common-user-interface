import React from 'react';
import { cx } from '../../core';

export interface PageHeaderProps {
  /** The page title. Rendered as the page's h1 unless `headingLevel` says otherwise. */
  title: React.ReactNode;
  /** One line under the title: what the page shows or for whom (one line, no paragraph). */
  subtitle?: React.ReactNode;
  /** Facts and statuses about the page (a saved time, a count), in words; wraps and is never cut. */
  meta?: React.ReactNode;
  /** Breadcrumbs above the title (administration and reports). */
  breadcrumbs?: React.ReactNode;
  /** The page's commands: one primary at most, then secondary or quiet Buttons, or a MenuButton. */
  actions?: React.ReactNode;
  /**
   * The state of what the page edits, in words, just before the commands ("Unsaved changes", "Saved at 14:32"). It is
   * a polite live region, so a change is announced without moving focus. Pass an empty string to keep the region in
   * place while there is nothing to say.
   */
  status?: React.ReactNode;
  /** Heading level. Default 1. */
  headingLevel?: 1 | 2;
  className?: string;
  id?: string;
}

/**
 * Dense page header: title, one line of subtitle, a meta line and the page commands, with the save state in words before
 * them. The commands sit at the end of the title line and move under it in narrow containers. No decorative space [suggested].
 */
export function PageHeader({ title, subtitle, meta, breadcrumbs, actions, status, headingLevel = 1, className, id }: PageHeaderProps) {
  const H = `h${headingLevel}` as 'h1' | 'h2';
  return (
    <header id={id} className={cx('cui-page-header', className)}>
      {breadcrumbs ? <div className="cui-page-header__breadcrumbs">{breadcrumbs}</div> : null}
      <div className="cui-page-header__main">
        <div className="cui-page-header__titles">
          <H className="cui-page-header__title">{title}</H>
          {subtitle ? <p className="cui-page-header__subtitle">{subtitle}</p> : null}
          {meta ? <div className="cui-page-header__meta">{meta}</div> : null}
        </div>
        {actions || status !== undefined ? (
          <div className="cui-page-header__actions">
            {status !== undefined ? <span className="cui-page-header__status" role="status">{status}</span> : null}
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
