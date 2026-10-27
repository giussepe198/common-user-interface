import React, { useRef, useState } from 'react';
import { cx } from '../../core';
import type { IconName } from '../../core';
import { IconButton } from '../IconButton/IconButton';
import type { IconMeaning } from '../IconButton/IconButton';

export interface IconToolbarItem {
  /** Unique within its group. The same command may appear in more than one group (iconssymb 2.2 icon groups). */
  id: string;
  icon: IconName;
  /** Function name, two or three words, sentence case: "Add patient", "Edit patient" (iconssymb 2.4 grammar). */
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Toggle state (Active). */
  pressed?: boolean;
  /**
   * Needs a selected record, e.g. Edit and Delete: disabled while `hasSelection` is false
   * (iconssymb 2.4: with no patient selected, Edit and Delete are disabled).
   */
  requiresSelection?: boolean;
  /** Keyboard alternative shown in the tooltip, e.g. "Ctrl+N" (iconssymb 2.3: icons are never the only way). */
  shortcut?: string;
  meaning?: IconMeaning;
  importance?: 'normal' | 'high';
}

export interface IconToolbarGroup {
  id: string;
  /** Task name for the group, used as its accessible name, e.g. "Patient record" (group by user task, not system architecture). */
  label: string;
  items: IconToolbarItem[];
}

export interface IconToolbarProps {
  /** Accessible name of the toolbar, e.g. "Patient list tools". */
  label: string;
  /** Groups in a stable order (supports spatial memory, iconssymb 2.2 icon groups [M]). */
  groups: IconToolbarGroup[];
  /** A record is selected; items with `requiresSelection` are disabled when false. Default true. */
  hasSelection?: boolean;
  /** Visible labels beside or below icons, or hidden (tooltip and accessible name only). Default "beside". */
  labels?: 'beside' | 'below' | 'hidden';
  /** Icon size: 16 (dense) or 24 (toolbar, iconssymb Table 4). Default 24. */
  size?: 16 | 24;
  className?: string;
}

/**
 * Toolbar of icon commands grouped by user task, with space and a divider between groups, a
 * common background per group, selection-dependent commands disabled (but still reachable and
 * announced as unavailable), and arrow-key movement between commands (one Tab stop).
 */
export function IconToolbar({ label, groups, hasSelection = true, labels = 'beside', size = 24, className }: IconToolbarProps) {
  const flat = groups.flatMap(g => g.items.map(i => ({ key: `${g.id}:${i.id}`, item: i })));
  const [activeKey, setActiveKey] = useState<string | null>(flat[0]?.key ?? null);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const current = flat.some(f => f.key === activeKey) ? activeKey : flat[0]?.key ?? null;

  const focusAt = (index: number) => {
    const f = flat[(index + flat.length) % flat.length];
    if (!f) return;
    setActiveKey(f.key);
    refs.current.get(f.key)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = flat.findIndex(f => f.key === current);
    if (e.key === 'ArrowRight') focusAt(idx + 1);
    else if (e.key === 'ArrowLeft') focusAt(idx - 1);
    else if (e.key === 'Home') focusAt(0);
    else if (e.key === 'End') focusAt(flat.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div role="toolbar" aria-label={label} className={cx('cui-icon-toolbar', `cui-icon-toolbar--${labels}`, className)} onKeyDown={onKeyDown}>
      {groups.map((g, gi) => (
        <React.Fragment key={g.id}>
          {gi > 0 ? <div role="separator" aria-orientation="vertical" className="cui-icon-toolbar__separator" /> : null}
          <div role="group" aria-label={g.label} className="cui-icon-toolbar__group">
            {g.items.map(item => {
              const key = `${g.id}:${item.id}`;
              const unavailable = !!item.disabled || (!!item.requiresSelection && !hasSelection);
              return (
                <IconButton
                  key={key}
                  ref={el => {
                    if (el) refs.current.set(key, el);
                    else refs.current.delete(key);
                  }}
                  icon={item.icon}
                  label={item.label}
                  showLabel={labels !== 'hidden'}
                  labelPosition={labels === 'below' ? 'below' : 'beside'}
                  size={size}
                  variant="toolbar"
                  pressed={item.pressed}
                  meaning={item.meaning}
                  importance={item.importance}
                  shortcut={item.shortcut}
                  tabIndex={key === current ? 0 : -1}
                  aria-disabled={unavailable || undefined}
                  onFocus={() => setActiveKey(key)}
                  onClick={() => {
                    if (!unavailable) item.onClick?.();
                  }}
                />
              );
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
