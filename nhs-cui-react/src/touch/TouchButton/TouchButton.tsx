import React from 'react';
import { Icon, cx, type IconName } from '../../core';

/** Height of a touch button in px. All are at least the 48 px touch target (Phase 4 mobile rules). */
export type TouchButtonSize = 48 | 56 | 64;

export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Same meanings as the core Button: primary is the one main commit action on a screen, secondary the default,
   * quiet for low-emphasis actions, danger for destructive actions.
   */
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  /** Minimum height in px. 48 for ordinary actions, 56 for commit actions (default), 64 for high-risk commits. */
  size?: TouchButtonSize;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
  /** Icon shown with the text label. The text is always visible unless `iconOnly` is set. */
  icon?: IconName;
  /** Put the icon after the label (e.g. "Next: oxygen" with a chevron). Default 'start'. */
  iconPosition?: 'start' | 'end';
  /** Hide the text visually; children become the accessible name. The button stays at least 48 x 48 px. */
  iconOnly?: boolean;
  /**
   * The button sits on its own at the bottom of the screen (thumb zone): adds the iOS safe-area inset below it so
   * the home indicator never covers it. Not needed inside ActionBar, which pads itself.
   */
  bottomAction?: boolean;
}

/**
 * Large touch button. Labels are verbs in sentence case ("Record dose", not "OK"). Use ActionBar for the bottom
 * commit bar of a screen.
 */
export const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(function TouchButton(
  { variant = 'secondary', size = 56, fullWidth, icon, iconPosition = 'start', iconOnly, bottomAction, className, children, type = 'button', ...rest },
  ref,
) {
  const glyph = icon ? <Icon name={icon} size={20} /> : null;
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'cui-touch-button',
        `cui-touch-button--${variant}`,
        `cui-touch-button--h${size}`,
        fullWidth && 'cui-touch-button--full',
        iconOnly && 'cui-touch-button--icon-only',
        bottomAction && 'cui-touch-button--bottom',
        className,
      )}
      {...rest}
    >
      {iconPosition === 'start' ? glyph : null}
      {iconOnly ? <span className="cui-visually-hidden">{children}</span> : <span className="cui-touch-button__label">{children}</span>}
      {iconPosition === 'end' ? glyph : null}
    </button>
  );
});
