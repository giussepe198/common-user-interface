import React from 'react';
import { cx } from '../../core';
import { MobileGlyph } from './mobileIcons';

export type MobileMarkShape = 'overdue' | 'due' | 'scheduled' | 'given' | 'notGiven' | 'available' | 'unavailable' | 'done' | 'upcoming' | 'suspended';

/**
 * Status mark for agenda events, tasks and medicine status lines. It is always paired with words beside it, so it is
 * hidden from screen readers. Shapes differ as well as colours (MEDa-0117, MEDa-0120): filled square = given,
 * solid-border square with code = not given, filled circle "!" = overdue, square with clock = due, dashed square =
 * scheduled, circle "+" = available.
 */
export function MobileStatusMark({ shape, glyph, round, small }: { shape: MobileMarkShape; glyph?: string; round?: boolean; small?: boolean }) {
  let inner: React.ReactNode = null;
  const size = small ? 16 : 18;
  switch (shape) {
    case 'given':
    case 'done':
      inner = !glyph || glyph === 'check' ? <MobileGlyph name="tick" size={size === 18 ? 20 : 16} /> : <span className="cui-mobile-mark__code">{glyph}</span>;
      break;
    case 'notGiven':
      inner = <span className="cui-mobile-mark__code">{glyph || '?'}</span>;
      break;
    case 'overdue':
      inner = <span className="cui-mobile-mark__code">!</span>;
      break;
    case 'due':
      inner = <MobileGlyph name="due" size={16} />;
      break;
    case 'available':
      inner = <MobileGlyph name="plusCircle" size={16} />;
      break;
    case 'unavailable':
      inner = <MobileGlyph name="pause" size={16} />;
      break;
    case 'suspended':
      inner = <MobileGlyph name="pause" size={16} />;
      break;
    default:
      inner = null;
  }
  return (
    <span className={cx('cui-mobile-mark', `cui-mobile-mark--${shape}`, round && 'cui-mobile-mark--round', small && 'cui-mobile-mark--small')} aria-hidden="true">
      {inner}
    </span>
  );
}
