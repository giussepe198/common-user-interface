import React from 'react';
import { Icon, cx, useId } from '../../core';
import { FullScreenSheet, useSheetContainer } from '../../touch';
import {
  OverlayScope,
  ShellPortal,
  useOverlayRegistration,
  useShellMediaQuery,
  useStableContent,
  useShellModal,
  type ShellCloseReason,
} from '../internal/overlay';

export type { ShellCloseReason };

export interface DialogProps {
  /** Shown when true. The dialog is modal: focus moves in, Tab stays inside, focus returns on close. */
  open: boolean;
  /**
   * Close was requested ('closeButton', 'escape', 'backdrop' or 'back'). Set `open` to false, or ask about unsaved
   * changes first. Global shortcuts never fire while the dialog is open [suggested].
   */
  onClose: (reason: ShellCloseReason) => void;
  /** Visible heading and the dialog's accessible name. Required. */
  title: React.ReactNode;
  /** One line of context under the title (the record or list it acts on, FSG-0008). Becomes the accessible description. */
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Footer buttons, primary first in reading order and at the end of the row (pass `Button`s). */
  footer?: React.ReactNode;
  /** Width: sm 400px, md 560px (default), lg 800px. Never larger than the screen (FSG-0015, FSG-0079). */
  size?: 'sm' | 'md' | 'lg';
  /** 'alertdialog' for a confirmation that interrupts. Default 'dialog'. */
  role?: 'dialog' | 'alertdialog';
  /** Show the close button and let Esc close. Default true. Off for a dialog that must be answered. */
  dismissible?: boolean;
  /** Clicking the dimmed page closes the dialog. Default false, so a stray click never loses input [suggested]. */
  closeOnBackdrop?: boolean;
  /** Accessible name of the close button. Default "Close". */
  closeLabel?: string;
  /** Element to focus on open. Default: the first focusable element other than the close button. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Return focus to the element that opened the dialog. Default true. */
  returnFocus?: boolean;
  /** Move focus in when already open on first render. Default true (or the SheetContainerProvider setting). */
  autoFocus?: boolean;
  /** Heading level of the title. Default 2. */
  headingLevel?: 1 | 2 | 3;
  /**
   * Below `phoneBreakpoint` the dialog becomes a FullScreenSheet from the touch area (P1 pattern) [suggested].
   * Default true.
   */
  sheetOnPhone?: boolean;
  /** Viewport width in px under which the phone sheet is used. Default 600. */
  phoneBreakpoint?: number;
  /** On phones, let the browser or Android back button close the sheet. Default false (routers often own history). */
  closeOnBrowserBack?: boolean;
  /** Render into a portal on document.body (default) or in place. Defaults come from SheetContainerProvider. */
  portal?: boolean;
  /** Element to portal into instead of document.body. */
  container?: HTMLElement | null;
  className?: string;
  id?: string;
}

/**
 * Modal dialog: a titled card over a dimmed page, focus trapped and returned, Esc and the close button close it, and
 * no global keyboard shortcut acts behind it. On phones it becomes the touch area's FullScreenSheet.
 */
export function Dialog(props: DialogProps) {
  const {
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    role = 'dialog',
    dismissible = true,
    closeOnBackdrop = false,
    closeLabel = 'Close',
    initialFocusRef,
    returnFocus = true,
    headingLevel = 2,
    sheetOnPhone = true,
    phoneBreakpoint = 600,
    closeOnBrowserBack = false,
    className,
  } = props;
  const host = useSheetContainer();
  const portal = props.portal ?? host.portal ?? true;
  const container = portal ? (props.container !== undefined ? props.container : host.container) ?? undefined : undefined;
  const autoFocus = props.autoFocus ?? host.autoFocus ?? true;
  const phone = useShellMediaQuery(`(max-width: ${phoneBreakpoint - 0.02}px)`);
  const asSheet = sheetOnPhone && phone;
  const id = useId('cui-dialog', props.id);
  const ref = React.useRef<HTMLDivElement>(null);

  const requestClose = (reason: ShellCloseReason) => {
    if (!dismissible && reason !== 'closeButton') return;
    onClose(reason);
  };
  useOverlayRegistration(open, requestClose);
  const onKeyDown = useShellModal({
    open: open && !asSheet,
    ref,
    onEscape: () => requestClose('escape'),
    initialFocusRef,
    returnFocus,
    autoFocus,
    lockScroll: portal && !container,
  });

  // The content keeps its state when the frame turns into a bottom sheet and back (a resize, a turned tablet).
  const content = useStableContent(children);
  if (!open) return null;

  if (asSheet) {
    return (
      <>
        <OverlayScope>
          <FullScreenSheet
            open
            onClose={r => requestClose(r === 'swipe' ? 'closeButton' : r)}
            title={title}
            description={description}
            footer={footer ? <div className="cui-dialog__sheet-footer">{footer}</div> : undefined}
            showCloseButton={dismissible}
            closeLabel={closeLabel}
            initialFocusRef={initialFocusRef}
            returnFocus={returnFocus}
            autoFocus={autoFocus}
            headingLevel={headingLevel}
            role={role}
            portal={portal}
            container={container}
            closeOnBrowserBack={closeOnBrowserBack}
            className={className}
            id={id}
          >
            <div className="cui-dialog__sheet-body">{content.slot}</div>
          </FullScreenSheet>
        </OverlayScope>
        {content.portal}
      </>
    );
  }

  const H = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  return (
    <>
      <OverlayScope>
        <ShellPortal enabled={portal} container={container}>
          <div className="cui-dialog-layer" data-cui-overlay="">
            <div
              className="cui-dialog-backdrop"
              aria-hidden="true"
              onMouseDown={e => e.preventDefault()}
              onClick={() => closeOnBackdrop && requestClose('backdrop')}
            />
            <div
              ref={ref}
              id={id}
              role={role}
              aria-modal="true"
              aria-labelledby={`${id}-title`}
              aria-describedby={description ? `${id}-desc` : undefined}
              tabIndex={-1}
              className={cx('cui-dialog', `cui-dialog--${size}`, className)}
              onKeyDown={onKeyDown}
            >
              <div className="cui-dialog__header">
                <div className="cui-dialog__titles">
                  <H id={`${id}-title`} className="cui-dialog__title">
                    {title}
                  </H>
                  {description ? (
                    <div id={`${id}-desc`} className="cui-dialog__description">
                      {description}
                    </div>
                  ) : null}
                </div>
                {dismissible ? (
                  <button type="button" className="cui-dialog__close" data-cui-close="" aria-label={closeLabel} title={closeLabel} onClick={() => onClose('closeButton')}>
                    <Icon name="close" size={16} />
                  </button>
                ) : null}
              </div>
              <div className="cui-dialog__body">{content.slot}</div>
              {footer ? <div className="cui-dialog__footer">{footer}</div> : null}
            </div>
          </div>
        </ShellPortal>
      </OverlayScope>
      {content.portal}
    </>
  );
}
