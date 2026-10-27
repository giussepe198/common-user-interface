import React from 'react';
import { cx, useId } from '../../core';
import { useClickAway } from '../internal/ModalFrame';

/** One meaning of a clinician's shorthand. */
export interface ShorthandResolution {
  id: string;
  /** Expanded term, e.g. "Myocardial infarction". */
  label: string;
  /** Short note, e.g. the specialty where it is used. */
  description?: string;
}

export interface ShorthandResolverProps {
  /** The shorthand as typed, e.g. "MI". */
  shorthand: string;
  /** Possible meanings from the national shorthand database (Matching 2.2.5). Shown in the order given; none is pre-selected. */
  resolutions: ShorthandResolution[];
  onResolve: (resolution: ShorthandResolution) => void;
  /** Close without choosing (Escape or click-away). */
  onDismiss: () => void;
  id?: string;
  className?: string;
}

/**
 * Menu of possible meanings for clinicians' shorthand flagged in a note (Matching 2.2.5, low
 * confidence; G8 13): no top match is chosen for the user, it closes on click-away or Escape, and
 * arrow keys move through the meanings.
 */
export function ShorthandResolver({ shorthand, resolutions, onResolve, onDismiss, id, className }: ShorthandResolverProps) {
  const baseId = useId('cui-shorthand', id);
  const [active, setActive] = React.useState(-1);
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  useClickAway(ref, true, onDismiss);
  React.useEffect(() => {
    listRef.current?.focus();
  }, []);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = resolutions.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (n) setActive((a) => (e.key === 'ArrowDown' ? (a + 1) % n : a <= 0 ? n - 1 : a - 1));
    } else if ((e.key === 'Enter' || e.key === ' ') && active >= 0) {
      e.preventDefault();
      onResolve(resolutions[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onDismiss();
    }
  };
  return (
    <div ref={ref} className={cx('cui-noting-popover', 'cui-shorthand', className)}>
      <h3 id={`${baseId}-title`} className="cui-noting-popover__title">
        What does <abbr title="Shorthand as typed">{shorthand}</abbr> mean here?
      </h3>
      {resolutions.length ? (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={0}
          aria-labelledby={`${baseId}-title`}
          aria-activedescendant={active >= 0 ? `${baseId}-opt-${active}` : undefined}
          className="cui-shorthand__list"
          onKeyDown={onKeyDown}
        >
          {resolutions.map((r, i) => (
            <li
              key={r.id}
              id={`${baseId}-opt-${i}`}
              role="option"
              aria-selected={active === i}
              className={cx('cui-shorthand__option', active === i && 'cui-shorthand__option--active')}
              onMouseEnter={() => setActive(i)}
              onClick={() => onResolve(r)}
            >
              <span className="cui-shorthand__label">{r.label}</span>
              {r.description ? <span className="cui-shorthand__description">{r.description}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="cui-shorthand__none" tabIndex={-1}>No meanings found. Type the term in full.</p>
      )}
      <p className="cui-prompt cui-shorthand__help">Choose a meaning, or press Escape to leave the text as typed.</p>
    </div>
  );
}
