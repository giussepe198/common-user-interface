import React from 'react';
import { cx } from '../../core';

export interface TopBarProps {
  /** Leading controls, e.g. the navigation button the AppShell adds. */
  start?: React.ReactNode;
  /** The organisation: logo or name (with the service under it). Always visible. */
  brand?: React.ReactNode;
  /** Phone form of the brand, e.g. the mark alone (name kept as its accessible name). Shown under 600 px in place of `brand` [suggested]. */
  brandCompact?: React.ReactNode;
  /**
   * The working context: unit, team or role switcher. Always shown; on phones it takes its own line instead of being
   * hidden [suggested].
   */
  context?: React.ReactNode;
  /** Global search, e.g. a person search field. */
  search?: React.ReactNode;
  /** Other global commands (notifications), before help and account. */
  actions?: React.ReactNode;
  /** The help menu (a MenuButton). */
  help?: React.ReactNode;
  /** The account menu (a MenuButton with the person's name). Always last. */
  account?: React.ReactNode;
  /** Render a `header` (banner landmark, default) or a `div` when the page already has a banner. */
  as?: 'header' | 'div';
  className?: string;
}

/**
 * Global top bar of the application frame (the "title bar and global navigation" above the patient banner, PAB-0009):
 * organisation, working context, search, then help and the account menu at the end. Dense, one line on desktop; in
 * narrow containers the context and search move to a second line rather than being cut or hidden.
 */
export function TopBar({ start, brand, brandCompact, context, search, actions, help, account, as = 'header', className }: TopBarProps) {
  const El = as;
  return (
    <El className={cx('cui-top-bar', className)}>
      <div className="cui-top-bar__row">
        {start ? <div className="cui-top-bar__start">{start}</div> : null}
        {brand ? <div className={cx('cui-top-bar__brand', brandCompact ? 'cui-top-bar__brand--full' : undefined)}>{brand}</div> : null}
        {brandCompact ? <div className="cui-top-bar__brand cui-top-bar__brand--compact">{brandCompact}</div> : null}
        {context ? <div className="cui-top-bar__context">{context}</div> : null}
        {search ? <div className="cui-top-bar__search">{search}</div> : null}
        {actions || help || account ? (
          <div className="cui-top-bar__end">
            {actions}
            {help}
            {account}
          </div>
        ) : null}
      </div>
    </El>
  );
}
