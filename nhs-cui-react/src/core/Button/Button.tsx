import React from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: one per view, the main commit action. secondary: default. quiet: toolbar/inline. danger: destructive. */
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  size?: 'sm' | 'md';
  /** Leading icon. Buttons always keep a visible text label unless `iconOnly` is set. */
  icon?: IconName;
  /** Hide the text visually; children become the accessible name. */
  iconOnly?: boolean;
}

/** Command button. Labels are verbs in sentence case ("Add medication", not "ADD"). */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, iconOnly, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx('cui-button', `cui-button--${variant}`, `cui-button--${size}`, iconOnly && 'cui-button--icon-only', className)}
      title={iconOnly && typeof children === 'string' ? children : rest.title}
      {...rest}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {iconOnly ? <span className="cui-visually-hidden">{children}</span> : children}
    </button>
  );
});
