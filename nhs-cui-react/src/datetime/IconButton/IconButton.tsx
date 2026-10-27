import React, { useEffect } from 'react';
import { cx, Icon } from '../../core';
import type { IconName } from '../../core';

/** Icon categories from the Icons and Symbology guidance (iconssymb Table 6). */
export type IconButtonVariant = 'global' | 'toolbar' | 'functional' | 'component' | 'inline-active' | 'inline-status' | 'information';

/** Conventional colour meanings (iconssymb 2.2 colour): red no-go, yellow caution, green acceptable, blue advisory. */
export type IconMeaning = 'error' | 'caution' | 'ok' | 'advisory';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  /** Glyph. Prefer image-related icons with an accepted meaning (iconssymb 2.1.2, 2.3). */
  icon: IconName;
  /**
   * What the icon does, not what it shows: "Save", not "Disk" (alertsymbdes 8; iconssymb 2.1.5 [M]).
   * Two or three words at most, sentence case (iconssymb 2.2 labels).
   */
  label: string;
  /**
   * Show the label as visible text. Default true: needed for abstract or safety-critical icons and
   * important messages (iconssymb 2.2 labels [M]). When false the label is the accessible name and tooltip.
   */
  showLabel?: boolean;
  /** Label beside or below the icon. Default "beside". */
  labelPosition?: 'beside' | 'below';
  /** 16 lists, 24 menus and toolbars, 32 and 48 larger surfaces (iconssymb Table 4). Default 16. */
  size?: 16 | 24 | 32 | 48;
  /**
   * Category (iconssymb Table 6). "information" and "inline-status" are display only: rendered as
   * a non-focusable image, never a button. Others are buttons. Default "functional".
   */
  variant?: IconButtonVariant;
  /** Active state of a toggle (Global buttons: Enabled, Active, Disabled). Sets aria-pressed. */
  pressed?: boolean;
  /** Conventional colour meaning; colour is a secondary cue only, the label carries the meaning. */
  meaning?: IconMeaning;
  /**
   * "high": larger icon, heavier border and more space (iconssymb 2.3, conveying importance (L)).
   * High-importance icons are never blue or green, so "ok" and "advisory" colours are dropped.
   */
  importance?: 'normal' | 'high';
  /** Keyboard alternative, e.g. "Ctrl+S": icons must not be the only way to a function (iconssymb 2.3 [M]). Shown in the tooltip. */
  shortcut?: string;
}

const NEXT_SIZE: Record<number, 16 | 24 | 32 | 48> = { 16: 24, 24: 32, 32: 48, 48: 48 };

/**
 * An icon command or status icon following the Icons and Symbology guidance: function-based text
 * equivalent, optional visible label, conventional colours only as a secondary cue, display-only
 * icons that are not focusable, and a keyboard shortcut shown alongside.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, showLabel = true, labelPosition = 'beside', size = 16, variant = 'functional', pressed, meaning, importance = 'normal', shortcut, className, title, ...rest },
  ref,
) {
  useEffect(() => {
    if (label.trim().split(/\s+/).length > 3) console.warn(`IconButton: label "${label}" is longer than three words (iconssymb 2.2 labels).`);
  }, [label]);
  const colour = importance === 'high' && (meaning === 'ok' || meaning === 'advisory') ? undefined : meaning;
  const px = importance === 'high' ? NEXT_SIZE[size] : size;
  const tip = title ?? (shortcut ? `${label} (${shortcut})` : label);
  const classes = cx(
    'cui-icon-button',
    `cui-icon-button--${variant}`,
    `cui-icon-button--${labelPosition}`,
    colour && `cui-icon-button--${colour}`,
    importance === 'high' && 'cui-icon-button--high',
    pressed && 'cui-icon-button--pressed',
    !showLabel && 'cui-icon-button--icon-only',
    className,
  );
  const glyph = <Icon name={icon} size={px === 48 ? 48 : px === 32 ? 32 : px === 24 ? 24 : 16} />;

  if (variant === 'information' || variant === 'inline-status') {
    return (
      <span className={classes} role="img" aria-label={label} title={tip}>
        {glyph}
        {showLabel ? <span className="cui-icon-button__label" aria-hidden="true">{label}</span> : null}
      </span>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      title={showLabel && !shortcut ? title : tip}
      aria-pressed={pressed === undefined ? undefined : pressed}
      aria-keyshortcuts={shortcut ? shortcut.replace(/Ctrl/g, 'Control') : undefined}
      aria-label={showLabel ? undefined : label}
      {...rest}
    >
      {glyph}
      {showLabel ? <span className="cui-icon-button__label">{label}</span> : null}
    </button>
  );
});
