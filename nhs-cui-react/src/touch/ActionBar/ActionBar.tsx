import React from 'react';
import { cx, type IconName } from '../../core';
import { TouchButton, type TouchButtonSize } from '../TouchButton/TouchButton';

/** One action in an ActionBar. */
export interface ActionBarAction {
  /** Visible label, a verb in sentence case, e.g. "Use this date and time". */
  label: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Default 'secondary'. At most one primary action; it is placed on the right (row) or on top (stack). */
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  disabled?: boolean;
  /** 'submit' to submit the form named in `form`. Default 'button'. */
  type?: 'button' | 'submit';
  form?: string;
  /** Relative width in a row. Default 1 (primary 1.4) [suggested]. */
  grow?: number;
  /** Stable key; defaults to the index. */
  key?: string;
  id?: string;
  'aria-describedby'?: string;
}

export interface ActionBarProps {
  /** One to three actions. More than three are not shown: move the rest into the screen. */
  actions?: ActionBarAction[];
  /** Custom content instead of (or after) `actions`, e.g. a HoldToConfirmButton. */
  children?: React.ReactNode;
  /** Line above the actions, e.g. the P1 summary "Mon 26-Oct-2026 Approx 21:30". Announced politely when it changes. */
  summary?: React.ReactNode;
  /** 'row' (default): side by side, primary on the right. 'stack': full-width buttons, primary on top. */
  layout?: 'row' | 'stack';
  /** Button height. Default 56, the minimum for commit actions. */
  size?: TouchButtonSize;
  /** Stick to the bottom of the scrolling container. Default true. */
  sticky?: boolean;
  /** Accessible name of the bar. Default "Actions". */
  label?: string;
  className?: string;
}

/**
 * Bottom commit bar for mobile screens (thumb zone): one to three large actions with the primary action on the
 * right, padded for the iOS safe area (padding-bottom: max(16px, env(safe-area-inset-bottom))).
 */
export function ActionBar({ actions = [], children, summary, layout = 'row', size = 56, sticky = true, label = 'Actions', className }: ActionBarProps) {
  const shown = actions.slice(0, 3);
  const primary = shown.filter(a => a.variant === 'primary');
  const others = shown.filter(a => a.variant !== 'primary');
  const ordered = layout === 'row' ? [...others, ...primary] : [...primary, ...others];
  return (
    <div role="group" aria-label={label} className={cx('cui-action-bar', `cui-action-bar--${layout}`, sticky && 'cui-action-bar--sticky', className)}>
      {summary !== undefined && summary !== null && summary !== '' ? (
        <div className="cui-action-bar__summary" aria-live="polite">
          {summary}
        </div>
      ) : null}
      {ordered.length ? (
        <div className="cui-action-bar__actions">
          {ordered.map((a, i) => (
            <TouchButton
              key={a.key ?? i}
              id={a.id}
              variant={a.variant ?? 'secondary'}
              size={size}
              icon={a.icon}
              iconPosition={a.iconPosition}
              disabled={a.disabled}
              type={a.type ?? 'button'}
              form={a.form}
              onClick={a.onClick}
              aria-describedby={a['aria-describedby']}
              fullWidth={layout === 'stack'}
              style={layout === 'row' ? { flex: `${a.grow ?? (a.variant === 'primary' ? 1.4 : 1)} 1 0` } : undefined}
            >
              {a.label}
            </TouchButton>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}
