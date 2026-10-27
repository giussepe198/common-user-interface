import React from 'react';
import { cx } from '../../core';
import { MobileGlyph } from '../internal/mobileIcons';
import { MobileTabLink, type MobileTabBarProps, type MobileTabItem } from '../MobileTabBar/MobileTabBar';

export interface MobileNavBarProps {
  /**
   * App destinations either side of the Scan action, two to four (concept B1: Worklist, Patients | Scan | Dictate,
   * Handover). The first half goes left of Scan, the rest right.
   */
  items: ReadonlyArray<MobileTabItem>;
  /** The current destination: aria-current="page". */
  current?: string;
  onSelect?: MobileTabBarProps['onSelect'];
  /** Start a scan (wristband, product or badge; the scanner is the consumer's). */
  onScan: () => void;
  /** Scan button text. Default "Scan". */
  scanLabel?: string;
  /** Accessible name of the navigation. Default "Main". */
  label?: string;
  /** Stick to the bottom of the scrolling container. Default true. */
  sticky?: boolean;
  className?: string;
}

/** App navigation bar with a prominent centre Scan action (concept B1). Every item has a visible label and a 64 px target. */
export function MobileNavBar({ items, current, onSelect, onScan, scanLabel = 'Scan', label = 'Main', sticky = true, className }: MobileNavBarProps) {
  const list = items.slice(0, 4);
  const half = Math.ceil(list.length / 2);
  const render = (item: MobileTabItem) => <MobileTabLink key={item.id} item={item} current={item.id === current} onSelect={onSelect} />;
  return (
    <nav aria-label={label} className={cx('cui-mobile-tabbar', 'cui-mobile-navbar', sticky && 'cui-mobile-tabbar--sticky', className)}>
      {list.slice(0, half).map(render)}
      <button type="button" className="cui-mobile-navbar__scan" onClick={onScan}>
        <MobileGlyph name="scan" size={24} />
        <span>{scanLabel}</span>
      </button>
      {list.slice(half).map(render)}
    </nav>
  );
}
