import React from 'react';
import { cx } from '../../core';

export interface MedicationsMenuItem {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  /** Draw a divider above this item (between menu groups, MEDv-133). */
  separatorBefore?: boolean;
}

/**
 * Internal popover menu (role="menu"). Arrow keys move, Enter/Space choose, Esc closes and
 * returns focus to `returnFocusTo`, click outside closes.
 */
export function MedicationsMenu({ items, label, onSelect, onClose, returnFocusTo, radio, style, className }: {
  items: MedicationsMenuItem[];
  label: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  returnFocusTo?: React.RefObject<HTMLElement>;
  radio?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>('[aria-checked="true"]:not([disabled])') ?? el.querySelector<HTMLElement>('[role^="menuitem"]:not([disabled])');
    first?.focus();
    const onDoc = (e: MouseEvent) => {
      if (!el.contains(e.target as Node) && !(returnFocusTo?.current && returnFocusTo.current.contains(e.target as Node))) onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose, returnFocusTo]);

  const close = () => {
    onClose();
    returnFocusTo?.current?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const els = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])') ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); els[(i + 1) % els.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); els[(i - 1 + els.length) % els.length]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); els[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); els[els.length - 1]?.focus(); }
    else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); close(); }
  };
  return (
    <div ref={ref} role="menu" aria-label={label} className={cx('cui-medications-menu', className)} style={style} onKeyDown={onKeyDown}>
      {items.map(it => (
        <button
          key={it.id}
          type="button"
          role={radio ? 'menuitemradio' : 'menuitem'}
          aria-checked={radio ? !!it.checked : undefined}
          disabled={it.disabled}
          tabIndex={-1}
          className={cx('cui-medications-menu__item', it.checked && 'cui-medications-menu__item--checked', it.separatorBefore && 'cui-medications-menu__item--divided')}
          onClick={() => { onSelect(it.id); close(); }}
        >
          <span className="cui-medications-menu__check" aria-hidden="true">{it.checked ? '✓' : ''}</span>
          {it.label}
        </button>
      ))}
    </div>
  );
}
