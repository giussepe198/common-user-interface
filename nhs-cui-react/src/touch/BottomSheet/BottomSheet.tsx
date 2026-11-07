import React from 'react';
import { SheetFrame } from '../internal/SheetFrame';
import type { SheetCloseReason } from '../internal/modal';

export type { SheetCloseReason };

/** Props shared by BottomSheet and FullScreenSheet. */
export interface TouchSheetBaseProps {
  /**
   * Shown when true. The sheet is modal: focus moves in, Tab stays inside, and the page behind does not scroll
   * (when the sheet renders on document.body).
   */
  open: boolean;
  /**
   * Close was requested: 'closeButton', 'escape', 'back' (browser or Android back), 'backdrop' or 'swipe'.
   * The consumer sets `open` to false (or asks to discard changes first).
   */
  onClose: (reason: SheetCloseReason) => void;
  /** Visible heading; it is also the dialog's accessible name. Required. */
  title: React.ReactNode;
  /** Context under the title, e.g. "CHEN, Wei · paracetamol 1 g, due 13:00" (B3). Becomes the accessible description. */
  description?: React.ReactNode;
  /** Content. It scrolls inside the sheet; the header and footer stay put. */
  children?: React.ReactNode;
  /** Bottom actions, usually `<ActionBar sticky={false} actions={...} />`. */
  footer?: React.ReactNode;
  /**
   * The sheet holds data that is not saved. Accidental dismissals (swipe, tapping the backdrop, the back button)
   * are then refused unless `allowDismissWithUnsavedData` is set; a notice says how to leave. The close button
   * and Esc still call `onClose`, so the consumer can ask whether to discard.
   */
  hasUnsavedData?: boolean;
  /** Let swipe, backdrop and back close the sheet even with unsaved data. Default false. */
  allowDismissWithUnsavedData?: boolean;
  /** A dismissal was refused because of unsaved data. */
  onCloseBlocked?: (reason: SheetCloseReason) => void;
  /** Notice shown when a dismissal is refused. */
  unsavedMessage?: string;
  /**
   * While open, push a browser history entry so the Android or browser back button closes the sheet instead of
   * leaving the page [suggested]. Default true. Turn off if your router manages history for overlays itself.
   */
  closeOnBrowserBack?: boolean;
  /** Show the close button. Default true. */
  showCloseButton?: boolean;
  /** Close button text (or accessible name of the icon). Default "Close" for BottomSheet, "Cancel" for FullScreenSheet. */
  closeLabel?: string;
  /** Element to focus on open. Default: the first focusable element in the sheet other than the close button. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * Move focus into the sheet when it is already open on first render. Default true (or the SheetContainerProvider
   * setting). Set false on documentation pages so they do not load with a focus ring; opening the sheet later
   * always moves focus in [suggested].
   */
  autoFocus?: boolean;
  /** Return focus to the element that opened the sheet. Default true. */
  returnFocus?: boolean;
  /** Heading level of the title. Default 2. */
  headingLevel?: 1 | 2 | 3;
  /** 'alertdialog' for confirmations that interrupt. Default 'dialog'. */
  role?: 'dialog' | 'alertdialog';
  /**
   * Render into a `.cui-root` container appended to document.body (default true). Set false to render in place,
   * or pass `container` when the theme is set on an element rather than on <html>. Defaults come from the nearest
   * SheetContainerProvider. The page behind is scroll-locked only when the sheet renders on document.body.
   */
  portal?: boolean;
  /** Element to render into instead of document.body (when `portal` is true). Default from SheetContainerProvider. */
  container?: HTMLElement | null;
  className?: string;
  id?: string;
}

export interface BottomSheetProps extends TouchSheetBaseProps {
  /** Tapping the dimmed page behind closes the sheet. Default true. */
  closeOnBackdrop?: boolean;
  /**
   * Dragging the top of the sheet down by 80 px closes it. Default true. The drag handle is decorative: every
   * close route also has a button or key. Refused while `hasUnsavedData`, unless allowed.
   */
  swipeToClose?: boolean;
}

/**
 * Modal sheet that rises from the bottom of the screen for short tasks in context (B3 "Why was it not given?",
 * pickers, confirmations). Labelled by its title, focus-trapped, closed by its button, Esc or back, and never
 * dismissed by a swipe while it holds unsaved data unless the consumer allows it.
 */
export function BottomSheet(props: BottomSheetProps) {
  return <SheetFrame {...props} kind="bottom" closeStyle="icon" />;
}
