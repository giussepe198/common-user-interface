import React from 'react';
import { Icon, cx, useId } from '../../core';
import { useKeepInView } from '../../core/hooks';
import { renderShellIcon, type ShellIconProp } from '../internal/shellIcons';

/** One command in a MenuButton. */
export interface MenuButtonItem {
  id: string;
  /** Visible words, a verb in sentence case ("Print letter"). */
  label: string;
  /** Leading icon (decorative; the label carries the meaning). */
  icon?: ShellIconProp;
  /** Second line in smaller text, e.g. what the command acts on. */
  description?: string;
  /** Shortcut shown at the end of the row (display only), e.g. "Ctrl+P". */
  shortcut?: string;
  /** Render as a link. */
  href?: string;
  disabled?: boolean;
  /** A destructive command: danger colour and the label says what is lost. */
  danger?: boolean;
  /** Shown as a checked state (role menuitemcheckbox). */
  checked?: boolean;
  /** Runs when chosen (also for links, before navigation: call `event.preventDefault()` for client routing). */
  onSelect?: (event?: React.SyntheticEvent) => void;
}

/** A divider between groups of commands. */
export interface MenuButtonSeparator {
  separator: true;
  id: string;
}

export type MenuButtonEntry = MenuButtonItem | MenuButtonSeparator;

export interface MenuButtonProps {
  /** Visible words on the button. With `iconOnly`, the accessible name. */
  label: React.ReactNode;
  /** Commands and separators, in a fixed order (commands never move between opens). */
  items: ReadonlyArray<MenuButtonEntry>;
  /** Leading icon on the button. */
  icon?: ShellIconProp;
  /** Hide the words visually (they stay the accessible name and the tooltip). Needs a string `label`. */
  iconOnly?: boolean;
  /** Button look, as core Button. Default 'secondary'. */
  variant?: 'primary' | 'secondary' | 'quiet';
  size?: 'sm' | 'md';
  /** Which edge of the button the menu lines up with. Default 'start'. */
  align?: 'start' | 'end';
  /** Called with the chosen item's id after its onSelect. */
  onAction?: (id: string) => void;
  /** Mark the button as holding the current selection (Tabs uses this for its More menu). */
  pressed?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const isItem = (e: MenuButtonEntry): e is MenuButtonItem => !('separator' in e);

/**
 * Button that opens a menu of commands (ARIA menu button). Arrow keys move through the commands, Home and End jump,
 * typing a letter finds a command, Enter or Space chooses, Esc closes and returns focus to the button.
 */
export function MenuButton({
  label,
  items,
  icon,
  iconOnly = false,
  variant = 'secondary',
  size = 'md',
  align = 'start',
  onAction,
  pressed,
  disabled,
  className,
  id: idProp,
}: MenuButtonProps) {
  const id = useId('cui-menu', idProp);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  useKeepInView(menuRef, open);
  const itemRefs = React.useRef<Array<HTMLElement | null>>([]);
  const typeahead = React.useRef({ text: '', at: 0 });
  const enabledIdx = items.map((e, i) => (isItem(e) && !e.disabled ? i : -1)).filter(i => i >= 0);

  const openAt = (which: 'first' | 'last') => {
    if (!enabledIdx.length) return;
    setOpen(true);
    setActive(which === 'first' ? enabledIdx[0] : enabledIdx[enabledIdx.length - 1]);
  };
  const close = (refocus: boolean) => {
    setOpen(false);
    setActive(-1);
    if (refocus) buttonRef.current?.focus();
  };

  React.useEffect(() => {
    if (open && active >= 0) itemRefs.current[active]?.focus();
  }, [open, active]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const move = (delta: 1 | -1) => {
    const pos = enabledIdx.indexOf(active);
    const next = enabledIdx[(pos + delta + enabledIdx.length) % enabledIdx.length];
    setActive(next);
  };

  const choose = (item: MenuButtonItem, event?: React.SyntheticEvent) => {
    if (item.disabled) return;
    item.onSelect?.(event);
    onAction?.(item.id);
    close(!item.href);
  };

  const onButtonKey = (e: React.KeyboardEvent) => {
    // Enter and Space reach onClick as a normal button activation.
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openAt('first');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt('last');
    }
  };

  const onMenuKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        move(1);
        return;
      case 'ArrowUp':
        e.preventDefault();
        move(-1);
        return;
      case 'Home':
        e.preventDefault();
        setActive(enabledIdx[0]);
        return;
      case 'End':
        e.preventDefault();
        setActive(enabledIdx[enabledIdx.length - 1]);
        return;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        close(true);
        return;
      case 'Tab':
        close(false);
        return;
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const now = Date.now();
          const t = typeahead.current;
          t.text = now - t.at < 700 ? t.text + e.key.toLowerCase() : e.key.toLowerCase();
          t.at = now;
          const order = [...enabledIdx.filter(i => i > active), ...enabledIdx.filter(i => i <= active)];
          const hit = order.find(i => (items[i] as MenuButtonItem).label.toLowerCase().startsWith(t.text));
          if (hit !== undefined) setActive(hit);
        }
    }
  };

  const textLabel = typeof label === 'string' ? label : undefined;
  return (
    <div ref={rootRef} className={cx('cui-menu-button', className)}>
      <button
        ref={buttonRef}
        id={`${id}-button`}
        type="button"
        className={cx(
          'cui-button',
          `cui-button--${variant}`,
          `cui-button--${size}`,
          iconOnly && 'cui-button--icon-only',
          'cui-menu-button__trigger',
          pressed && 'cui-menu-button__trigger--pressed',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        title={iconOnly ? textLabel : undefined}
        disabled={disabled}
        onClick={() => (open ? close(false) : openAt('first'))}
        onKeyDown={onButtonKey}
      >
        {renderShellIcon(icon)}
        {iconOnly ? <span className="cui-visually-hidden">{label}</span> : <span className="cui-menu-button__label">{label}</span>}
        {!iconOnly ? <Icon name="chevron-down" size={16} className="cui-menu-button__chevron" /> : null}
      </button>
      {open ? (
        <div
          ref={menuRef}
          id={`${id}-menu`}
          role="menu"
          aria-labelledby={`${id}-button`}
          className={cx('cui-menu', `cui-menu--${align}`)}
          onKeyDown={onMenuKey}
        >
          {items.map((entry, i) => {
            if (!isItem(entry)) return <div key={entry.id} role="separator" className="cui-menu__separator" />;
            const checkable = entry.checked !== undefined;
            const common = {
              ref: (el: HTMLElement | null) => {
                itemRefs.current[i] = el;
              },
              role: checkable ? 'menuitemcheckbox' : 'menuitem',
              'aria-checked': checkable ? entry.checked : undefined,
              'aria-disabled': entry.disabled || undefined,
              tabIndex: i === active ? 0 : -1,
              className: cx('cui-menu__item', entry.danger && 'cui-menu__item--danger', entry.disabled && 'cui-menu__item--disabled'),
              onMouseEnter: () => !entry.disabled && setActive(i),
            };
            const body = (
              <>
                <span className="cui-menu__icon">{checkable ? (entry.checked ? <Icon name="check" size={16} /> : null) : renderShellIcon(entry.icon)}</span>
                <span className="cui-menu__text">
                  <span className="cui-menu__label">{entry.label}</span>
                  {entry.description ? <span className="cui-menu__description">{entry.description}</span> : null}
                </span>
                {entry.shortcut ? <span className="cui-menu__shortcut">{entry.shortcut}</span> : null}
              </>
            );
            if (entry.href && !entry.disabled) {
              return (
                <a key={entry.id} href={entry.href} {...common} onClick={e => choose(entry, e)}>
                  {body}
                </a>
              );
            }
            return (
              <div
                key={entry.id}
                {...common}
                onClick={() => choose(entry)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    choose(entry);
                  }
                }}
              >
                {body}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
