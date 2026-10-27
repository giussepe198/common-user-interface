import React from 'react';
import { SheetFrame } from '../internal/SheetFrame';
import type { TouchSheetBaseProps } from '../BottomSheet/BottomSheet';

export interface FullScreenSheetProps extends TouchSheetBaseProps {
  /**
   * 'text' (default): a "Cancel" text button on the right of the header (P1). 'back': a back chevron with text on
   * the left, for drill-down screens.
   */
  closeStyle?: 'text' | 'back';
  /** Extra header control, e.g. a "Help" button. Keep it to one. */
  headerAction?: React.ReactNode;
}

/**
 * Modal screen that covers the whole viewport for a focused task (P1 "When did the fall happen?"): header with
 * title and Cancel, scrolling body, bottom action area. Same modal behaviour as BottomSheet, without backdrop
 * or swipe dismissal.
 */
export function FullScreenSheet({ closeStyle = 'text', ...props }: FullScreenSheetProps) {
  return <SheetFrame {...props} kind="full" closeStyle={closeStyle} swipeToClose={false} closeOnBackdrop={false} />;
}
