import React from 'react';
import { cx, useId } from '../../core';
import { renderShellIcon, type ShellIconProp } from '../internal/shellIcons';

/** One destination. */
export interface SideNavItem {
  id: string;
  /** Visible words. In the collapsed rail they show on hover and focus and stay the accessible name. */
  label: string;
  /** Link target. Without it the item is a button that calls `onSelect`. */
  href?: string;
  /** Icon (decorative; the label carries the meaning). The collapsed rail shows the first letters when there is none. */
  icon?: ShellIconProp;
  /** Items waiting there, e.g. unread notifications. Announced with `countLabel`. */
  count?: number;
  /** Words for the count, e.g. "4 unread". Default "{n} items". */
  countLabel?: string;
  /** Language of the label when it differs from the page, e.g. "mi" for te reo Māori. */
  lang?: string;
  disabled?: boolean;
}

/** A headed group of destinations. */
export interface SideNavGroup {
  id: string;
  /** Heading, e.g. "Work". Omit for an unheaded first group. */
  label?: string;
  items: ReadonlyArray<SideNavItem>;
  lang?: string;
}

export interface SideNavProps {
  /** Accessible name of the navigation landmark. Default "Main". */
  label?: string;
  /** Groups of destinations, in a fixed order. Show only what the person may use; never disabled teasers [suggested]. */
  groups: ReadonlyArray<SideNavGroup>;
  /** Id of the current destination: aria-current="page", weight, a bar and colour together. */
  current?: string;
  /** A destination was chosen (also for links, before navigation; call preventDefault for client routing). */
  onSelect?: (id: string, e: React.MouseEvent) => void;
  /** Icon rail: icons only, words on hover and focus. Default false. */
  collapsed?: boolean;
  /** Content above the groups, e.g. the organisation. Hidden in the collapsed rail unless `headerCollapsed` is given. */
  header?: React.ReactNode;
  /** Content for the top of the collapsed rail, e.g. the organisation's mark. */
  headerCollapsed?: React.ReactNode;
  /** Content below the groups, e.g. the version. */
  footer?: React.ReactNode;
  className?: string;
  id?: string;
}

const initials = (label: string) =>
  label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

/**
 * Side navigation for the application frame: headed groups of destinations with icons and counts, the current one
 * marked in several ways. Collapses to an icon rail; the AppShell turns it into a drawer on narrow screens.
 */
export function SideNav({ label = 'Main', groups, current, onSelect, collapsed = false, header, headerCollapsed, footer, className, id: idProp }: SideNavProps) {
  const id = useId('cui-sidenav', idProp);
  return (
    <nav id={id} aria-label={label} className={cx('cui-sidenav', collapsed && 'cui-sidenav--collapsed', className)}>
      {collapsed ? (headerCollapsed ? <div className="cui-sidenav__header">{headerCollapsed}</div> : null) : header ? <div className="cui-sidenav__header">{header}</div> : null}
      {groups.map((group, gi) => {
        const headingId = `${id}-g-${group.id}`;
        return (
          <div key={group.id} className="cui-sidenav__group">
            {group.label ? (
              <h2 id={headingId} lang={group.lang} className={cx('cui-sidenav__heading', collapsed && 'cui-visually-hidden')}>
                {group.label}
              </h2>
            ) : null}
            {collapsed && gi > 0 ? <div className="cui-sidenav__rule" aria-hidden="true" /> : null}
            <ul className="cui-sidenav__list" aria-labelledby={group.label ? headingId : undefined}>
              {group.items.map(item => {
                const isCurrent = item.id === current;
                const icon = item.icon ? renderShellIcon(item.icon, 16) : collapsed ? <span className="cui-sidenav__initials">{initials(item.label)}</span> : null;
                const countWords = item.countLabel ?? `${item.count} ${item.count === 1 ? 'item' : 'items'}`;
                const content = (
                  <>
                    {icon ? (
                      <span className="cui-sidenav__icon" aria-hidden="true">
                        {icon}
                      </span>
                    ) : null}
                    <span className={cx('cui-sidenav__label', collapsed && 'cui-visually-hidden')} lang={item.lang}>
                      {item.label}
                    </span>
                    {item.count ? (
                      <>
                        <span className="cui-sidenav__count" aria-hidden="true">
                          {item.count > 99 ? '99+' : item.count}
                        </span>
                        <span className="cui-visually-hidden">, {countWords}</span>
                      </>
                    ) : null}
                    {collapsed ? (
                      <span className="cui-sidenav__tip" aria-hidden="true" lang={item.lang}>
                        {item.label}
                        {item.count ? ` (${item.count})` : ''}
                      </span>
                    ) : null}
                  </>
                );
                const cls = cx('cui-sidenav__item', isCurrent && 'cui-sidenav__item--current');
                return (
                  <li key={item.id} className="cui-sidenav__li">
                    {item.href && !item.disabled ? (
                      <a className={cls} href={item.href} aria-current={isCurrent ? 'page' : undefined} onClick={e => onSelect?.(item.id, e)}>
                        {content}
                      </a>
                    ) : (
                      <button type="button" className={cls} aria-current={isCurrent ? 'page' : undefined} disabled={item.disabled} onClick={e => onSelect?.(item.id, e)}>
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {footer && !collapsed ? <div className="cui-sidenav__footer">{footer}</div> : null}
    </nav>
  );
}
