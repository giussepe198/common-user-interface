import React from 'react';
import { Button, cx, useId } from '../../core';
import { useClickAway } from '../internal/ModalFrame';

/** One spelling suggestion. */
export interface SpellingSuggestion {
  /** Replacement text, with macrons and diacritics as published. */
  text: string;
  /** Where it came from (G8 13: terminology plus dictionary). */
  source?: 'terminology' | 'dictionary';
}

export interface SpellCheckPopoverProps {
  /** The word as typed. */
  word: string;
  suggestions: SpellingSuggestion[];
  /** Replace the word. Only after the user chooses and presses OK: nothing is auto-confirmed (Matching 2.2.4). */
  onAccept: (replacement: string) => void;
  /** Keep the word as typed and stop flagging it. */
  onIgnore: () => void;
  /** Close without change (also Escape and click-away). */
  onCancel: () => void;
  /** Heading. Default "Check spelling". */
  title?: string;
  id?: string;
  className?: string;
}

/**
 * Spelling suggestions for a word flagged in a text-parser note (Matching 2.2.4; G8 13): a short
 * list from the terminology and a dictionary with OK, Ignore and Cancel. No suggestion is selected
 * at first, so OK needs a deliberate choice.
 */
export function SpellCheckPopover({ word, suggestions, onAccept, onIgnore, onCancel, title = 'Check spelling', id, className }: SpellCheckPopoverProps) {
  const baseId = useId('cui-spell', id);
  const [choice, setChoice] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  useClickAway(ref, true, onCancel);
  React.useEffect(() => {
    ref.current?.querySelector<HTMLElement>('input, button')?.focus();
  }, []);
  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby={`${baseId}-title`}
      className={cx('cui-noting-popover', 'cui-spell-check', className)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <h3 id={`${baseId}-title`} className="cui-noting-popover__title">{title}</h3>
      <p className="cui-spell-check__word">
        Not recognised: <strong>{word}</strong>
      </p>
      {suggestions.length ? (
        <fieldset className="cui-spell-check__choices">
          <legend className="cui-spell-check__legend">Did you mean</legend>
          {suggestions.map((s) => (
            <label key={s.text} className="cui-spell-check__choice">
              <input type="radio" name={`${baseId}-choice`} checked={choice === s.text} onChange={() => setChoice(s.text)} />
              <span>{s.text}</span>
              {s.source === 'dictionary' ? <span className="cui-spell-check__source">dictionary</span> : null}
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="cui-spell-check__none">No suggestions found.</p>
      )}
      <div className="cui-spell-check__actions">
        <Button size="sm" variant="primary" disabled={!choice} onClick={() => choice && onAccept(choice)}>OK</Button>
        <Button size="sm" onClick={onIgnore}>Ignore</Button>
        <Button size="sm" variant="quiet" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
