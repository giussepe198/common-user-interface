import React from 'react';
import { Button, Icon, cx, useControllableState, useId } from '../../core';

/** One "Group by" choice. */
export interface DataToolbarGroupOption {
  id: string;
  label: string;
}

export interface DataToolbarProps {
  /** Open the filter dialog. Label "Filter" (FSG-0002). */
  onFilter?: () => void;
  /** Open the sort dialog. Label "Sort" (FSG-0002). */
  onSort?: () => void;
  /** Attributes offered in the "Group by" menu (FSG-0132). "None" is always offered first (FSG-0131). */
  groupOptions?: DataToolbarGroupOption[];
  /** Current grouping attribute id, or null for none. */
  groupBy?: string | null;
  defaultGroupBy?: string | null;
  onGroupByChange?: (id: string | null) => void;
  /** A filter is active: shows "Remove all filters" next to Filter (FSG remove-all placement). */
  filterActive?: boolean;
  /** Remove every filter (FSG-0057). */
  onRemoveAllFilters?: () => void;
  /**
   * Keyboard commands (FSG-0003 [M]). Default true: Alt+Shift+F Filter, Alt+Shift+S Sort, Alt+Shift+G Group by
   * [key choice suggested]. Listens on the document while mounted.
   */
  keyboardShortcuts?: boolean;
  /** Accessible name of the toolbar, e.g. "Patient list tools". */
  label?: string;
  /** Extra commands placed after the three standard ones. */
  children?: React.ReactNode;
  className?: string;
}

const KEYS = { filter: 'F', sort: 'S', group: 'G' };

/**
 * Filter, Sort and Group by commands for a table or list, in that order with those labels (FSG-0001/0002),
 * with keyboard commands (FSG-0003). The same three commands are offered from header context menus (FSG-0004).
 */
export function DataToolbar({
  onFilter, onSort, groupOptions = [], groupBy, defaultGroupBy = null, onGroupByChange, filterActive, onRemoveAllFilters,
  keyboardShortcuts = true, label = 'Data tools', children, className,
}: DataToolbarProps) {
  const [group, setGroup] = useControllableState<string | null>(groupBy, defaultGroupBy, onGroupByChange);
  const [open, setOpen] = React.useState(false);
  const menuId = useId('cui-dtb-menu');
  const groupBtn = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const barRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!keyboardShortcuts) return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
      const k = e.key.toUpperCase();
      const code = e.code;
      if ((k === KEYS.filter || code === 'KeyF') && onFilter) onFilter();
      else if ((k === KEYS.sort || code === 'KeyS') && onSort) onSort();
      else if ((k === KEYS.group || code === 'KeyG') && groupOptions.length) {
        setOpen(true);
        groupBtn.current?.focus();
      } else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [keyboardShortcuts, onFilter, onSort, groupOptions.length]);

  React.useEffect(() => {
    if (!open) return;
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]');
    const checked = menuRef.current?.querySelector<HTMLElement>('[aria-checked="true"]');
    (checked ?? items?.[0])?.focus();
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && e.target !== groupBtn.current) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Roving focus inside the toolbar: one tab stop, arrows move between commands [suggested].
  const onBarKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if ((e.target as HTMLElement).closest('[role="menu"]')) return;
    const btns = Array.from(barRef.current?.querySelectorAll<HTMLElement>(':scope > .cui-data-toolbar__item button:not([disabled])') ?? []);
    const i = btns.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    e.preventDefault();
    btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length]?.focus();
  };

  const choose = (id: string | null) => {
    setGroup(id);
    setOpen(false);
    groupBtn.current?.focus();
  };
  const onMenuKey = (e: React.KeyboardEvent) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') items[(i + 1) % items.length]?.focus();
    else if (e.key === 'ArrowUp') items[(i - 1 + items.length) % items.length]?.focus();
    else if (e.key === 'Home') items[0]?.focus();
    else if (e.key === 'End') items[items.length - 1]?.focus();
    else if (e.key === 'Escape') {
      setOpen(false);
      groupBtn.current?.focus();
    } else if (e.key === 'Tab') setOpen(false);
    else return;
    if (e.key !== 'Tab') e.preventDefault();
    e.stopPropagation();
  };
  const groupLabel = group ? groupOptions.find(o => o.id === group)?.label : null;
  const options: Array<{ id: string | null; label: string }> = [{ id: null, label: 'None' }, ...groupOptions];

  return (
    <div ref={barRef} role="toolbar" aria-label={label} className={cx('cui-data-toolbar', className)} onKeyDown={onBarKey}>
      <span className="cui-data-toolbar__item">
        <Button variant="quiet" icon="filter" onClick={onFilter} disabled={!onFilter} aria-keyshortcuts={keyboardShortcuts ? 'Alt+Shift+F' : undefined} title={keyboardShortcuts ? 'Filter (Alt+Shift+F)' : undefined}>
          Filter
        </Button>
      </span>
      {filterActive && onRemoveAllFilters ? (
        <span className="cui-data-toolbar__item">
          <Button variant="quiet" icon="close" size="sm" onClick={onRemoveAllFilters}>Remove all filters</Button>
        </span>
      ) : null}
      <span className="cui-data-toolbar__item">
        <Button variant="quiet" icon="sort" onClick={onSort} disabled={!onSort} aria-keyshortcuts={keyboardShortcuts ? 'Alt+Shift+S' : undefined} title={keyboardShortcuts ? 'Sort (Alt+Shift+S)' : undefined}>
          Sort
        </Button>
      </span>
      <span className="cui-data-toolbar__item cui-data-toolbar__group">
        <Button
          ref={groupBtn}
          variant="quiet"
          icon="group"
          disabled={!groupOptions.length}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-keyshortcuts={keyboardShortcuts ? 'Alt+Shift+G' : undefined}
          title={keyboardShortcuts ? 'Group by (Alt+Shift+G)' : undefined}
          onClick={() => setOpen(o => !o)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          <span>
            Group by{groupLabel ? ': ' : ''}
            {groupLabel ? <span className="cui-data-toolbar__current">{groupLabel}</span> : null}
          </span>
          <Icon name="chevron-down" />
        </Button>
        {open ? (
          <ul ref={menuRef} id={menuId} role="menu" aria-label="Group by" className="cui-data-toolbar__menu" onKeyDown={onMenuKey}>
            {options.map(o => (
              <li
                key={o.id ?? '__none'}
                role="menuitemradio"
                aria-checked={group === o.id}
                tabIndex={-1}
                className="cui-data-toolbar__menu-item"
                onClick={() => choose(o.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    choose(o.id);
                  }
                }}
              >
                <span className="cui-data-toolbar__check">{group === o.id ? <Icon name="check" /> : null}</span>
                {o.label}
              </li>
            ))}
          </ul>
        ) : null}
      </span>
      {children ? <span className="cui-data-toolbar__extra">{children}</span> : null}
    </div>
  );
}
