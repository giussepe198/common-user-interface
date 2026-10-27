import React from 'react';
import { Icon, cx, useId } from '../../core';
import { TouchPortal, useModal, type SheetCloseReason } from './modal';
import { useSheetContainer } from '../SheetContainerProvider/SheetContainerProvider';

export interface SheetFrameProps {
  kind: 'bottom' | 'full';
  open: boolean;
  onClose: (reason: SheetCloseReason) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  hasUnsavedData?: boolean;
  allowDismissWithUnsavedData?: boolean;
  onCloseBlocked?: (reason: SheetCloseReason) => void;
  unsavedMessage?: string;
  closeOnBackdrop?: boolean;
  swipeToClose?: boolean;
  closeOnBrowserBack?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  closeStyle?: 'icon' | 'text' | 'back';
  initialFocusRef?: React.RefObject<HTMLElement>;
  autoFocus?: boolean;
  returnFocus?: boolean;
  headingLevel?: 1 | 2 | 3;
  role?: 'dialog' | 'alertdialog';
  portal?: boolean;
  container?: HTMLElement | null;
  className?: string;
  id?: string;
}

const GUARDED: SheetCloseReason[] = ['swipe', 'backdrop', 'back'];
const SWIPE_CLOSE_PX = 80;

export function SheetFrame(p: SheetFrameProps) {
  const {
    kind,
    open,
    onClose,
    title,
    description,
    children,
    footer,
    headerAction,
    hasUnsavedData = false,
    allowDismissWithUnsavedData = false,
    onCloseBlocked,
    unsavedMessage = 'This has unsaved changes. Save them, or close it with the button.',
    closeOnBackdrop = true,
    swipeToClose = true,
    closeOnBrowserBack = true,
    showCloseButton = true,
    closeLabel = kind === 'full' ? 'Cancel' : 'Close',
    closeStyle = kind === 'full' ? 'text' : 'icon',
    initialFocusRef,
    returnFocus = true,
    headingLevel = 2,
    role = 'dialog',
    className,
  } = p;
  const host = useSheetContainer();
  const portal = p.portal ?? host.portal ?? true;
  const container = portal ? (p.container !== undefined ? p.container : host.container) ?? undefined : undefined;
  const autoFocus = p.autoFocus ?? host.autoFocus ?? true;
  const id = useId('cui-sheet', p.id);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = React.useState(false);
  const [drag, setDrag] = React.useState(0);
  const dragStart = React.useRef<{ y: number; pointerId: number } | null>(null);

  React.useEffect(() => {
    if (!open) setBlocked(false);
  }, [open]);

  /** Request a close; returns false when refused because of unsaved data. */
  const request = (reason: SheetCloseReason): boolean => {
    if (hasUnsavedData && !allowDismissWithUnsavedData && GUARDED.includes(reason)) {
      setBlocked(true);
      onCloseBlocked?.(reason);
      return false;
    }
    onClose(reason);
    return true;
  };

  const { onKeyDown } = useModal({
    open,
    dialogRef,
    onDismiss: request,
    initialFocusRef,
    returnFocus,
    closeOnBrowserBack,
    lockScroll: portal && !container,
    autoFocus,
  });

  if (!open) return null;

  const H = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  const canSwipe = kind === 'bottom' && swipeToClose;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canSwipe || (e.target as HTMLElement).closest('button, a, input, textarea, select')) return;
    dragStart.current = { y: e.clientY, pointerId: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current || dragStart.current.pointerId !== e.pointerId) return;
    const dy = e.clientY - dragStart.current.y;
    setDrag(Math.max(0, dy));
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    if (!dragStart.current || dragStart.current.pointerId !== e.pointerId) return;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = null;
    setDrag(0);
    if (dy > SWIPE_CLOSE_PX) request('swipe');
  };

  const closeButton = showCloseButton ? (
    <button
      type="button"
      className={cx('cui-sheet__close', `cui-sheet__close--${closeStyle}`)}
      onClick={() => onClose('closeButton')}
      aria-label={closeStyle === 'icon' ? closeLabel : undefined}
    >
      {closeStyle === 'icon' ? <Icon name="close" size={24} /> : null}
      {closeStyle === 'back' ? <Icon name="chevron-left" size={24} /> : null}
      {closeStyle !== 'icon' ? <span>{closeLabel}</span> : null}
    </button>
  ) : null;

  const sheet = (
    <div className={cx('cui-sheet-layer', `cui-sheet-layer--${kind}`)}>
      {kind === 'bottom' ? (
        <div className="cui-sheet-backdrop" aria-hidden="true" onClick={() => closeOnBackdrop && request('backdrop')} />
      ) : null}
      <div
        ref={dialogRef}
        id={id}
        role={role}
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-desc` : undefined}
        tabIndex={-1}
        className={cx('cui-sheet', `cui-sheet--${kind}`, drag > 0 && 'cui-sheet--dragging', className)}
        style={drag > 0 ? { transform: `translateY(${drag}px)` } : undefined}
        onKeyDown={onKeyDown}
      >
        <div
          className={cx('cui-sheet__top', canSwipe && 'cui-sheet__top--grab')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          {kind === 'bottom' ? <span className="cui-sheet__handle" aria-hidden="true" /> : null}
          <div className="cui-sheet__header">
            {closeStyle === 'back' ? closeButton : null}
            <H id={`${id}-title`} className="cui-sheet__title">
              {title}
            </H>
            {headerAction}
            {closeStyle !== 'back' ? closeButton : null}
          </div>
          {description ? (
            <div id={`${id}-desc`} className="cui-sheet__description">
              {description}
            </div>
          ) : null}
        </div>
        {blocked && hasUnsavedData ? (
          <div className="cui-sheet__blocked" role="status">
            <Icon name="info" size={20} />
            <span>{unsavedMessage}</span>
          </div>
        ) : null}
        <div className="cui-sheet__body">{children}</div>
        {footer ? <div className="cui-sheet__footer">{footer}</div> : null}
      </div>
    </div>
  );
  return (
    <TouchPortal enabled={portal} container={container}>
      {sheet}
    </TouchPortal>
  );
}
