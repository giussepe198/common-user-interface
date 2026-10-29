import React from 'react';
import { cx } from '../../core';
import { renderShellIcon, type ShellIconProp } from '../internal/shellIcons';

export interface EmptyStateProps {
  /** What is empty, said plainly: "No contacts recorded" (never only "No data"). */
  title: React.ReactNode;
  /** Why it may be empty and what to do, e.g. "Filters hide 12 contacts." */
  children?: React.ReactNode;
  /** The next step: usually one Button ("Add contact" or "Clear filters"). */
  action?: React.ReactNode;
  /** Decorative icon. Default 'inbox'. Pass null for none. */
  icon?: ShellIconProp | null;
  /** 'block' (default) centred in a panel or page; 'inline' as one dense row inside a list or table. */
  layout?: 'block' | 'inline';
  /** Heading level of the title in block layout. Default none (a paragraph), so the page outline is unchanged. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * What a list, panel or page shows when it has nothing to show: what is empty, why, and the next step. An empty
 * clinical list says so in words; it never looks like a list still loading [suggested].
 */
export function EmptyState({ title, children, action, icon = 'inbox', layout = 'block', headingLevel, className }: EmptyStateProps) {
  const T = headingLevel ? (`h${headingLevel}` as 'h2' | 'h3' | 'h4') : 'p';
  return (
    <div className={cx('cui-empty-state', `cui-empty-state--${layout}`, className)}>
      {icon !== null ? <span className="cui-empty-state__icon">{renderShellIcon(icon, layout === 'inline' ? 16 : 24)}</span> : null}
      <div className="cui-empty-state__text">
        <T className="cui-empty-state__title">{title}</T>
        {children ? <div className="cui-empty-state__body">{children}</div> : null}
      </div>
      {action ? <div className="cui-empty-state__action">{action}</div> : null}
    </div>
  );
}
