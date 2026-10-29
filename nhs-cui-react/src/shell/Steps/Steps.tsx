import React from 'react';
import { Icon, cx } from '../../core';

/** One step of a multi-step task. */
export interface StepsItem {
  id: string;
  /** Visible words, e.g. "Check details". */
  label: string;
  /** Second line, e.g. what was chosen in a finished step. */
  description?: string;
  /** The step has a problem to fix: shown with the error icon and words. */
  error?: boolean;
}

export interface StepsProps {
  /** Accessible name of the list, e.g. "Steps to record leave". */
  label: string;
  items: ReadonlyArray<StepsItem>;
  /** Index of the current step (0-based). Earlier steps are done, later ones not started. */
  current: number;
  /**
   * Called when a finished step is chosen, to go back to it. Without it the steps are not interactive. Later steps are
   * never links: the task is done in order [suggested].
   */
  onStepSelect?: (index: number, id: string) => void;
  /** 'horizontal' (default; becomes vertical in narrow containers) or 'vertical'. */
  orientation?: 'horizontal' | 'vertical';
  /** Words for each state, read by screen readers. */
  stateLabels?: { done: string; current: string; todo: string; error: string };
  className?: string;
}

const DEFAULT_STATE_LABELS = { done: 'done', current: 'current step', todo: 'not started', error: 'needs attention' };

/**
 * Numbered steps of a multi-step task: done, current and not started are shown by number or tick, weight and words
 * together; the current step has aria-current="step".
 */
export function Steps({ label, items, current, onStepSelect, orientation = 'horizontal', stateLabels = DEFAULT_STATE_LABELS, className }: StepsProps) {
  return (
    <div className={cx('cui-steps', `cui-steps--${orientation}`, className)}>
      <ol aria-label={label} className="cui-steps__list">
        {items.map((s, i) => {
          const state = s.error ? 'error' : i < current ? 'done' : i === current ? 'current' : 'todo';
          const marker =
            state === 'done' ? <Icon name="check" size={16} /> : state === 'error' ? <Icon name="error" size={16} /> : <span>{i + 1}</span>;
          const text = (
            <>
              <span className={cx('cui-steps__marker', `cui-steps__marker--${state}`)} aria-hidden="true">
                {marker}
              </span>
              <span className="cui-steps__text">
                <span className="cui-steps__label">{s.label}</span>
                {s.description ? <span className="cui-steps__description">{s.description}</span> : null}
                <span className="cui-visually-hidden">
                  {' '}
                  (step {i + 1} of {items.length}, {stateLabels[state]})
                </span>
              </span>
            </>
          );
          const back = onStepSelect && i < current;
          return (
            <li key={s.id} className={cx('cui-steps__item', `cui-steps__item--${state}`)} aria-current={i === current ? 'step' : undefined}>
              {back ? (
                <button type="button" className="cui-steps__button" onClick={() => onStepSelect(i, s.id)}>
                  {text}
                </button>
              ) : (
                <span className="cui-steps__static">{text}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
