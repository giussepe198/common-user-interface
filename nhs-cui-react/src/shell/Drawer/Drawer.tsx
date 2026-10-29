import React from 'react';
import { Icon, cx, useId } from '../../core';
import { BottomSheet, useSheetContainer } from '../../touch';
import {
  OverlayScope,
  shellFocusable,
  ShellPortal,
  useOverlayRegistration,
  useShellMediaQuery,
  useStableContent,
  useShellModal,
  type ShellCloseReason,
} from '../internal/overlay';

export interface DrawerProps {
  /** Shown when true. Modal like Dialog: focus trapped and returned, Esc closes, no global shortcut acts behind it. */
  open: boolean;
  /**
   * Modal (default true). With false the drawer is a non-modal side panel for read-only detail and quick edits: no
   * dimmed page, no scroll lock and no focus trap, so the page beside it stays visible and usable; focus still moves in
   * on open and back to the opener on close, and Esc (focus inside the panel) closes it. On phones it is still the
   * bottom sheet.
   */
  modal?: boolean;
  /** Close was requested ('closeButton', 'escape', 'backdrop', 'back' or 'swipe'). Set `open` to false. */
  onClose: (reason: ShellCloseReason) => void;
  /** Visible heading and accessible name. Required. */
  title: React.ReactNode;
  /** Context under the title; becomes the accessible description. */
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Footer actions, kept in view while the body scrolls. */
  footer?: React.ReactNode;
  /** 'end' (default) for detail and filters; 'start' for navigation. */
  side?: 'start' | 'end';
  /** Width: sm 320px, md 400px (default), lg 560px; never wider than the screen. */
  size?: 'sm' | 'md' | 'lg';
  /** Clicking the dimmed page closes the drawer. Default true; refused while `hasUnsavedData` [suggested]. */
  closeOnBackdrop?: boolean;
  /** The drawer holds unsaved input: backdrop, swipe and back no longer close it; the close button and Esc still ask. */
  hasUnsavedData?: boolean;
  /** Accessible name of the close button. Default "Close". */
  closeLabel?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Return focus to the opener. Default true. */
  returnFocus?: boolean;
  /** Move focus in when already open on first render. Default true (or the SheetContainerProvider setting). */
  autoFocus?: boolean;
  /** Heading level of the title. Default 2. */
  headingLevel?: 1 | 2 | 3;
  /** Below `phoneBreakpoint` the drawer becomes the touch area's BottomSheet. Default true; set false for navigation. */
  sheetOnPhone?: boolean;
  /** Viewport width in px under which the bottom sheet is used. Default 600. */
  phoneBreakpoint?: number;
  /** Render in a portal (default) or in place. Defaults come from SheetContainerProvider. */
  portal?: boolean;
  container?: HTMLElement | null;
  className?: string;
  id?: string;
}

/**
 * Side panel over the page for detail, filters or navigation. Modal, labelled by its title, with its body scrolling
 * between a fixed header and footer. On phones it becomes a BottomSheet (except navigation drawers).
 */
export function Drawer(props: DrawerProps) {
  const {
    open,
    onClose,
    modal = true,
    title,
    description,
    children,
    footer,
    side = 'end',
    size = 'md',
    closeOnBackdrop = true,
    hasUnsavedData = false,
    closeLabel = 'Close',
    initialFocusRef,
    returnFocus = true,
    headingLevel = 2,
    sheetOnPhone = true,
    phoneBreakpoint = 600,
    className,
  } = props;
  const host = useSheetContainer();
  const portal = props.portal ?? host.portal ?? true;
  const container = portal ? (props.container !== undefined ? props.container : host.container) ?? undefined : undefined;
  const autoFocus = props.autoFocus ?? host.autoFocus ?? true;
  const phone = useShellMediaQuery(`(max-width: ${phoneBreakpoint - 0.02}px)`);
  const asSheet = sheetOnPhone && phone;
  const id = useId('cui-drawer', props.id);
  const ref = React.useRef<HTMLDivElement>(null);

  const requestClose = (reason: ShellCloseReason) => {
    if (hasUnsavedData && (reason === 'backdrop' || reason === 'swipe' || reason === 'back')) return;
    onClose(reason);
  };
  useOverlayRegistration(open && (modal || asSheet), requestClose);
  const onKeyDown = useShellModal({
    open: open && !asSheet && modal,
    ref,
    onEscape: () => requestClose('escape'),
    initialFocusRef,
    returnFocus,
    autoFocus,
    lockScroll: portal && !container,
  });
  const onPanelKeyDown = useNonModalPanel({ open: open && !asSheet && !modal, ref, onEscape: () => requestClose('escape'), initialFocusRef, returnFocus, autoFocus });

  // The content keeps its state when the frame turns into a bottom sheet and back (a resize, a turned tablet).
  const content = useStableContent(children);
  if (!open) return null;

  if (asSheet) {
    return (
      <>
        <OverlayScope>
          <BottomSheet
            open
            onClose={requestClose}
            title={title}
            description={description}
            footer={footer ? <div className="cui-drawer__sheet-footer">{footer}</div> : undefined}
            closeLabel={closeLabel}
            closeOnBackdrop={closeOnBackdrop}
            hasUnsavedData={hasUnsavedData}
            initialFocusRef={initialFocusRef}
            returnFocus={returnFocus}
            autoFocus={autoFocus}
            headingLevel={headingLevel}
            portal={portal}
            container={container}
            closeOnBrowserBack={false}
            className={className}
            id={id}
          >
            <div className="cui-drawer__sheet-body">{content.slot}</div>
          </BottomSheet>
        </OverlayScope>
        {content.portal}
      </>
    );
  }

  const H = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  const header = (
    <div className="cui-drawer__header">
      <div className="cui-drawer__titles">
        <H id={`${id}-title`} className="cui-drawer__title">
          {title}
        </H>
        {description ? (
          <div id={`${id}-desc`} className="cui-drawer__description">
            {description}
          </div>
        ) : null}
      </div>
      <button type="button" className="cui-drawer__close" data-cui-close="" aria-label={closeLabel} title={closeLabel} onClick={() => onClose('closeButton')}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );

  if (!modal) {
    // Non-modal: no backdrop and no overlay guard; the layer lets pointer events through to the page beside the panel.
    return (
      <>
        <ShellPortal enabled={portal} container={container}>
          <div className={cx('cui-drawer-layer', `cui-drawer-layer--${side}`, 'cui-drawer-layer--nonmodal')}>
            <div
              ref={ref}
              id={id}
              role="dialog"
              aria-modal="false"
              aria-labelledby={`${id}-title`}
              aria-describedby={description ? `${id}-desc` : undefined}
              tabIndex={-1}
              className={cx('cui-drawer', 'cui-drawer--nonmodal', `cui-drawer--${side}`, `cui-drawer--${size}`, className)}
              onKeyDown={onPanelKeyDown}
            >
              {header}
              <div className="cui-drawer__body">{content.slot}</div>
              {footer ? <div className="cui-drawer__footer">{footer}</div> : null}
            </div>
          </div>
        </ShellPortal>
        {content.portal}
      </>
    );
  }

  return (
    <>
      <OverlayScope>
        <ShellPortal enabled={portal} container={container}>
          <div className={cx('cui-drawer-layer', `cui-drawer-layer--${side}`)} data-cui-overlay="">
            <div
              className="cui-drawer-backdrop"
              aria-hidden="true"
              onMouseDown={e => e.preventDefault()}
              onClick={() => closeOnBackdrop && requestClose('backdrop')}
            />
            <div
              ref={ref}
              id={id}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${id}-title`}
              aria-describedby={description ? `${id}-desc` : undefined}
              tabIndex={-1}
              className={cx('cui-drawer', `cui-drawer--${side}`, `cui-drawer--${size}`, className)}
              onKeyDown={onKeyDown}
            >
              {header}
              <div className="cui-drawer__body">{content.slot}</div>
              {footer ? <div className="cui-drawer__footer">{footer}</div> : null}
            </div>
          </div>
        </ShellPortal>
      </OverlayScope>
      {content.portal}
    </>
  );
}

/**
 * A non-modal panel's focus: in on open (the first control, else the panel), back to the opener on close when focus is
 * still in the panel or on the page body, and Esc closes. Tab moves freely between the panel and the page.
 */
function useNonModalPanel({ open, ref, onEscape, initialFocusRef, returnFocus, autoFocus }: { open: boolean; ref: React.RefObject<HTMLElement | null>; onEscape: () => void; initialFocusRef?: React.RefObject<HTMLElement | null>; returnFocus: boolean; autoFocus: boolean }) {
  const escRef = React.useRef(onEscape);
  escRef.current = onEscape;
  const skipFirst = React.useRef(open && !autoFocus);
  React.useEffect(() => {
    if (!open) {
      skipFirst.current = false;
      return;
    }
    if (skipFirst.current) return;
    const previous = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;
    const el = ref.current;
    if (el) {
      const target = initialFocusRef?.current ?? shellFocusable(el).find(n => !n.hasAttribute('data-cui-close')) ?? el;
      target.focus({ preventScroll: true });
    }
    return () => {
      if (!returnFocus || !previous || typeof previous.focus !== 'function' || !document.contains(previous)) return;
      // The page stayed usable: if the user has moved on to another control, leave focus there.
      const active = document.activeElement;
      if (active && active !== document.body && !(el && el.contains(active)) && active.isConnected) return;
      previous.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return React.useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    escRef.current();
  }, []);
}
