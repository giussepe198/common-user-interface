import React from 'react';
import { cx } from '../../core';

export interface ListDialogProps {
  /** Dialog title (FSG-0008: includes the table name). */
  title: string;
  /** Id for the title element. */
  titleId: string;
  /** Modal with a translucent backdrop (FSG-0074). When false the dialog renders inline. */
  modal: boolean;
  /** Called on Esc. */
  onDismiss: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** alertdialog for confirmations. */
  role?: 'dialog' | 'alertdialog';
  describedBy?: string;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Area-internal dialog shell: never larger than the screen (FSG-0015/0079), Esc closes, focus is kept inside. */
export function ListDialog({ title, titleId, modal, onDismiss, children, footer, className, role = 'dialog', describedBy }: ListDialogProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    if (modal) {
      const first = ref.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }
    return () => {
      if (modal && prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [modal]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onDismiss();
      return;
    }
    if (e.key === 'Tab' && modal && ref.current) {
      const els = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  const panel = (
    <div
      ref={ref}
      role={role}
      aria-modal={modal || undefined}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      className={cx('cui-list-dialog', modal && 'cui-list-dialog--modal', className)}
      onKeyDown={onKeyDown}
    >
      <h2 id={titleId} className="cui-list-dialog__title">{title}</h2>
      <div className="cui-list-dialog__body">{children}</div>
      {footer ? <div className="cui-list-dialog__footer">{footer}</div> : null}
    </div>
  );
  if (!modal) return panel;
  return (
    <div className="cui-list-dialog__layer">
      <div className="cui-list-dialog__backdrop" aria-hidden="true" onClick={onDismiss} />
      {panel}
    </div>
  );
}
