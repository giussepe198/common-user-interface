import React from 'react';
import { cx } from '../../core';
import { MobileGlyph, type MobileIconName } from '../internal/mobileIcons';

/** One tab or navigation destination. */
export interface MobileTabItem {
  id: string;
  /** Visible label, always shown under the icon (no icon-only tabs). */
  label: string;
  /** Glyph: a core icon name or a mobile glyph ('summary', 'medicines', 'obs', 'notes', 'dots', 'tick', 'scan', 'dictate', 'handover'). */
  icon?: MobileIconName;
  /** Render as a link to this URL. Otherwise a button that calls `onSelect`. */
  href?: string;
  /** Count shown on the tab, e.g. medicines due. Announced with `badgeLabel`. */
  badge?: number;
  /** Words for the badge, e.g. "2 due". Default the number. */
  badgeLabel?: string;
  disabled?: boolean;
}

export interface MobileTabBarProps {
  /** Two to five tabs (concept A1: Summary, Medicines, Obs, Notes, More). */
  items: ReadonlyArray<MobileTabItem>;
  /** The current tab id; it gets aria-current="page" and a heavier label (colour is never the only cue). */
  current?: string;
  /** A tab was chosen (also called for links, before navigation). */
  onSelect?: (id: string, e: React.MouseEvent) => void;
  /** Accessible name of the navigation. Default "Patient record". */
  label?: string;
  /** Stick to the bottom of the scrolling container. Default true. */
  sticky?: boolean;
  className?: string;
}

/** Renders one destination as a link or button with a 64 px target. Shared with MobileNavBar. */
export function MobileTabLink({ item, current, onSelect, className }: { item: MobileTabItem; current: boolean; onSelect?: MobileTabBarProps['onSelect']; className?: string }) {
  const content = (
    <>
      <span className="cui-mobile-tab__icon">
        {item.icon ? <MobileGlyph name={item.icon} size={24} /> : null}
        {item.badge ? (
          <span className="cui-mobile-tab__badge" aria-hidden="true">
            {item.badge}
          </span>
        ) : null}
      </span>
      <span className="cui-mobile-tab__label">{item.label}</span>
      {item.badge ? <span className="cui-visually-hidden">, {item.badgeLabel ?? String(item.badge)}</span> : null}
    </>
  );
  const cls = cx('cui-mobile-tab', current && 'cui-mobile-tab--current', className);
  if (item.href && !item.disabled) {
    return (
      <a className={cls} href={item.href} aria-current={current ? 'page' : undefined} onClick={e => onSelect?.(item.id, e)}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={cls} aria-current={current ? 'page' : undefined} disabled={item.disabled} onClick={e => onSelect?.(item.id, e)}>
      {content}
    </button>
  );
}

/**
 * Bottom tab bar for the patient record (concept A1): 64 px tall targets, icon and label on every tab, the current tab
 * marked with aria-current, weight, an underline bar and colour together.
 */
export function MobileTabBar({ items, current, onSelect, label = 'Patient record', sticky = true, className }: MobileTabBarProps) {
  return (
    <nav aria-label={label} className={cx('cui-mobile-tabbar', sticky && 'cui-mobile-tabbar--sticky', className)}>
      {items.slice(0, 5).map(item => (
        <MobileTabLink key={item.id} item={item} current={item.id === current} onSelect={onSelect} />
      ))}
    </nav>
  );
}
