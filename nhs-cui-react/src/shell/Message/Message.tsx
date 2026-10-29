import React from 'react';
import { Icon, cx } from '../../core';
import { ShellGlyph } from '../internal/shellIcons';

export type MessageTone = 'info' | 'success' | 'warning' | 'error';

export interface MessageProps {
  /**
   * Meaning, carried by icon, words and colour together: info (blue, advisory), success (green, acceptable), warning
   * (amber, caution), error (red, no-go). Default 'info'.
   */
  tone?: MessageTone;
  /** The message in a few words, e.g. "2 fields need attention". */
  title: React.ReactNode;
  /** More detail: what happened and what to do next. */
  children?: React.ReactNode;
  /** Actions after the text (Buttons or links). */
  actions?: React.ReactNode;
  /** Shows a dismiss button. Never offer it on an error that still applies [suggested]. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /**
   * How it is announced when it appears: 'status' (polite), 'alert' (at once) or 'off' (already on the page when it
   * loads). Default 'alert' for error, 'status' otherwise.
   */
  live?: 'status' | 'alert' | 'off';
  /** Words read before the title for screen readers. Default per tone ("Error", "Warning", "Success", "Information"). */
  toneLabel?: string;
  /** 'block' (default) with room for detail, or 'inline' as one dense line inside a panel or form. */
  layout?: 'block' | 'inline';
  className?: string;
  id?: string;
}

/** Default words for each tone. */
export const MESSAGE_TONE_LABELS: Record<MessageTone, string> = { info: 'Information', success: 'Success', warning: 'Warning', error: 'Error' };

/**
 * Inline message on the page or in a panel: icon, words and tone colour together, with optional detail and actions.
 * Use it for the state of a page or task; use a Toast only for a passing confirmation.
 */
export function Message({ tone = 'info', title, children, actions, onDismiss, dismissLabel = 'Dismiss', live, toneLabel, layout = 'block', className, id }: MessageProps) {
  const mode = live ?? (tone === 'error' ? 'alert' : 'status');
  const glyph = tone === 'success' ? <ShellGlyph name="success" size={20} /> : <Icon name={tone === 'error' ? 'error' : tone === 'warning' ? 'warning' : 'info'} size={20} />;
  return (
    <div id={id} role={mode === 'off' ? undefined : mode} className={cx('cui-message', `cui-message--${tone}`, `cui-message--${layout}`, className)}>
      <span className="cui-message__icon">{glyph}</span>
      <div className="cui-message__content">
        <div className="cui-message__title">
          <span className="cui-visually-hidden">{toneLabel ?? MESSAGE_TONE_LABELS[tone]}: </span>
          <span className="cui-message__text">{title}</span>
        </div>
        {children ? <div className="cui-message__body">{children}</div> : null}
        {actions ? <div className="cui-message__actions">{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className="cui-message__dismiss" aria-label={dismissLabel} title={dismissLabel} onClick={onDismiss}>
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </div>
  );
}
