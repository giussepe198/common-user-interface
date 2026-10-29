import React, { useLayoutEffect, useRef, useState } from 'react';
import { cx, useId } from '../../core';
import type {
  EncodableMatch,
  TextEdit} from '../utils/encodable';
import {
  diffTextEdit,
  editTouchesConfirmed,
  marqueeDragCandidates,
  matchAtCaret,
  nearestMarqueeOffset,
  type MarqueeEdge,
  nextWordEnd,
  nextWordStart,
  previousWordEnd,
  previousWordStart,
  segmentEncodableText,
} from '../utils/encodable';

export interface EncodableTextEditorProps {
  /** Visible label for the noting area. */
  label: string;
  /** Plain text (no user formatting, displaystandards 2.1.1). */
  value?: string;
  defaultValue?: string;
  /**
   * Called with the new text and the edit that produced it. Use `adjustMatchesForEdit(matches, edit)`
   * to keep your matches aligned until your parser re-runs.
   */
  onChange?: (text: string, edit: TextEdit) => void;
  /** Phrases recognised by your parser (offsets into the text). The editor does no matching itself. */
  matches: EncodableMatch[];
  /** Expression in focus (synchronised with SuggestedMatchList): bold marquee with handles (2.1.5). */
  focusedExpressionId?: string | null;
  /** The caret moved into (or out of) an expression. */
  onFocusExpression?: (expressionId: string | null) => void;
  /** Confirm the phrase at the caret: double-click or Alt+Enter [suggested key] (2.2: keyboard equivalent). */
  onConfirm?: (matchId: string) => void;
  /** Unconfirm the confirmed phrase at the caret: Alt+Backspace [suggested key]. Confirmed text is locked until then (2.2). */
  onUnconfirm?: (matchId: string) => void;
  /**
   * Move a phrase boundary (2.1.5): drag the yellow handles of the expression in focus with the mouse
   * (snapping to whole words), or by keyboard: Alt+Shift+Right or Left moves the end by one word; with
   * Ctrl the start [suggested keys]. Not offered for confirmed phrases.
   */
  onBoundaryChange?: (matchId: string, start: number, end: number) => void;
  /** Visible instructions under the field. Default lists the keys. */
  instructions?: string;
  hideInstructions?: boolean;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  className?: string;
}

const describe = (m: EncodableMatch, text: string) => {
  const phrase = `"${text.slice(m.start, m.end)}"`;
  if (m.status === 'confirmed') return `${phrase} confirmed${m.label ? ` as ${m.label}` : ''}.`;
  if (m.status === 'elaboration') return `${phrase} can be coded only as detail of another term${m.label ? ` (${m.label})` : ''}.`;
  return `${phrase} can be coded${m.label ? ` as ${m.label}` : ''}. Not yet confirmed.`;
};

/**
 * Plain-text noting area that highlights phrases your parser can code (light blue, with gaps
 * between adjacent concepts), draws a faint marquee around each expression and a bold one with
 * handles around the expression in focus, shows confirmed phrases bold on grey and locks them until
 * unconfirmed, and offers keyboard equivalents for confirming and moving boundaries
 * (Terminology Display Standards for Coded Information 2.1.1, 2.1.5, 2.2).
 */
export const EncodableTextEditor = React.forwardRef<HTMLTextAreaElement, EncodableTextEditorProps>(function EncodableTextEditor(props, ref) {
  const {
    label, value: valueProp, defaultValue = '', onChange, matches, focusedExpressionId, onFocusExpression, onConfirm, onUnconfirm,
    onBoundaryChange, instructions, hideInstructions, rows = 6, disabled, readOnly, id, className,
  } = props;
  const fieldId = useId('cui-encodable', id);
  const [inner, setInner] = useState(defaultValue);
  const controlled = valueProp !== undefined;
  const text = controlled ? (valueProp as string) : inner;
  const [, forceRender] = useState(0);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const restoreCaret = useRef<number | null>(null);
  const lastMatch = useRef<string | null>(null);
  const [status, setStatus] = useState('');
  const [dragging, setDragging] = useState<MarqueeEdge | null>(null);

  const setRefs = (el: HTMLTextAreaElement | null) => {
    areaRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  useLayoutEffect(() => {
    if (restoreCaret.current != null && areaRef.current) {
      areaRef.current.setSelectionRange(restoreCaret.current, restoreCaret.current);
      restoreCaret.current = null;
    }
  });

  const runs = segmentEncodableText(text, matches);
  const confirmedCount = matches.filter(m => m.status === 'confirmed').length;
  const codable = matches.length - confirmedCount;

  const caretMatch = () => {
    const el = areaRef.current;
    return el ? matchAtCaret(matches, el.selectionStart ?? 0) : null;
  };

  const syncCaret = () => {
    const m = caretMatch();
    const key = m ? `${m.id}:${m.status}` : null;
    if (key === lastMatch.current) return;
    lastMatch.current = key;
    onFocusExpression?.(m ? m.expressionId ?? m.id : null);
    setStatus(m ? describe(m, text) : '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    const edit = diffTextEdit(text, next);
    const locked = editTouchesConfirmed(matches, edit);
    if (locked) {
      restoreCaret.current = edit.start;
      setStatus(`"${text.slice(locked.start, locked.end)}" is confirmed and cannot be edited. Unconfirm it first${onUnconfirm ? ' (Alt+Backspace)' : ''}.`);
      forceRender(n => n + 1);
      return;
    }
    if (!controlled) setInner(next);
    onChange?.(next, edit);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.altKey || disabled || readOnly) return;
    const m = caretMatch();
    if (!m) return;
    if (e.key === 'Enter' && !e.shiftKey && m.status !== 'confirmed' && onConfirm) {
      e.preventDefault();
      onConfirm(m.id);
      return;
    }
    if (e.key === 'Backspace' && m.status === 'confirmed' && onUnconfirm) {
      e.preventDefault();
      onUnconfirm(m.id);
      return;
    }
    if (e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && m.status !== 'confirmed' && onBoundaryChange) {
      e.preventDefault();
      let { start, end } = m;
      const others = matches.filter(o => o.id !== m.id);
      if (e.ctrlKey) start = e.key === 'ArrowLeft' ? previousWordStart(text, start) : Math.min(nextWordStart(text, start), previousWordStart(text, end));
      else end = e.key === 'ArrowRight' ? nextWordEnd(text, end) : Math.max(previousWordEnd(text, end), nextWordEnd(text, start));
      if (start >= end || others.some(o => o.status === 'confirmed' && start < o.end && end > o.start)) return;
      onBoundaryChange(m.id, start, end);
      setStatus(`Selection is now "${text.slice(start, end)}".`);
    }
  };

  /** Screen position of a text offset, measured on the highlight layer (which mirrors the textarea). */
  const offsetPosition = (offset: number, edge: MarqueeEdge): { x: number; y: number } | null => {
    const back = backRef.current;
    if (!back || typeof document.createRange !== 'function') return null;
    const nodes = Array.from(back.querySelectorAll<HTMLElement>('[data-o]'));
    // The character just inside the phrase: after the start, before the end.
    const charAt = edge === 'start' ? offset : offset - 1;
    const el = nodes.find(n => {
      const o = Number(n.dataset.o);
      return charAt >= o && charAt < o + (n.textContent?.length ?? 0);
    });
    const node = el?.firstChild;
    if (!el || !node) return null;
    const local = charAt - Number(el.dataset.o);
    const range = document.createRange();
    range.setStart(node, local);
    range.setEnd(node, local + 1);
    const r = typeof range.getBoundingClientRect === 'function' ? range.getBoundingClientRect() : null;
    if (!r) return null;
    return { x: edge === 'start' ? r.left : r.right, y: r.top + r.height / 2 };
  };

  const canDrag = !!onBoundaryChange && !readOnly && !disabled;
  const startDrag = (e: React.PointerEvent, expressionId: string, edge: MarqueeEdge) => {
    const group = matches.filter(m => (m.expressionId ?? m.id) === expressionId);
    if (!group.length || !onBoundaryChange) return;
    const target = edge === 'start' ? group.reduce((a, b) => (b.start < a.start ? b : a)) : group.reduce((a, b) => (b.end > a.end ? b : a));
    if (target.status === 'confirmed') return;
    e.preventDefault();
    e.stopPropagation();
    let current = { start: target.start, end: target.end };
    const candidates = marqueeDragCandidates(text, target, matches, edge);
    const move = (ev: PointerEvent) => {
      if (!Number.isFinite(ev.clientX) || !Number.isFinite(ev.clientY)) return;
      const best = nearestMarqueeOffset(candidates, o => offsetPosition(o, edge), { x: ev.clientX, y: ev.clientY });
      if (best == null) return;
      const next = edge === 'start' ? { start: best, end: current.end } : { start: current.start, end: best };
      if (next.start === current.start && next.end === current.end) return;
      current = next;
      onBoundaryChange(target.id, next.start, next.end);
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      setDragging(null);
      areaRef.current?.focus();
      setStatus(`Selection is now "${text.slice(current.start, current.end)}".`);
    };
    setDragging(edge);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  const handle = (expressionId: string, edge: MarqueeEdge) => {
    const group = matches.filter(m => (m.expressionId ?? m.id) === expressionId);
    const edgeMatch = group.length ? (edge === 'start' ? group.reduce((a, b) => (b.start < a.start ? b : a)) : group.reduce((a, b) => (b.end > a.end ? b : a))) : null;
    const draggable = canDrag && !!edgeMatch && edgeMatch.status !== 'confirmed';
    return (
      <span
        className={cx('cui-encodable__handle', `cui-encodable__handle--${edge}`, draggable && 'cui-encodable__handle--draggable', dragging === edge && 'cui-encodable__handle--dragging')}
        data-edge={edge}
        title={draggable ? 'Drag the handles to include or exclude text in the expression' : undefined}
        onPointerDown={draggable ? e => startDrag(e, expressionId, edge) : undefined}
      />
    );
  };

  const instructionText =
    instructions ??
    `Highlighted words can be coded. ${onConfirm ? 'Double-click or press Alt+Enter to confirm the phrase at the cursor. ' : ''}${onUnconfirm ? 'Alt+Backspace unconfirms. ' : ''}${onBoundaryChange ? 'Drag the yellow handles, or press Alt+Shift+Right or Left to move the end of the phrase by a word; add Ctrl to move the start.' : ''}`.trim();
  const hintId = `${fieldId}-hint`;
  const summaryId = `${fieldId}-summary`;

  return (
    <div className={cx('cui-encodable', disabled && 'cui-encodable--disabled', className)}>
      <label htmlFor={fieldId} className="cui-encodable__label">{label}</label>
      <div className="cui-encodable__frame">
        <div ref={backRef} className="cui-encodable__backdrop" aria-hidden="true">
          {runs.map(run => {
            const content = run.segments.map(seg =>
              seg.match ? (
                <mark key={seg.start} data-o={seg.start} className={cx('cui-encodable__mark', `cui-encodable__mark--${seg.match.status}`)}>{seg.text}</mark>
              ) : (
                <span key={seg.start} data-o={seg.start}>{seg.text}</span>
              ),
            );
            if (!run.expressionId) return <React.Fragment key={`t${run.start}`}>{content}</React.Fragment>;
            const focused = run.expressionId === focusedExpressionId;
            return (
              <span key={`e${run.start}`} className={cx('cui-encodable__marquee', focused && 'cui-encodable__marquee--focused')}>
                {focused ? handle(run.expressionId, 'start') : null}
                {content}
                {focused ? handle(run.expressionId, 'end') : null}
              </span>
            );
          })}
          {/* keeps a trailing newline's height */}
          {'​'}
        </div>
        <textarea
          ref={setRefs}
          id={fieldId}
          className="cui-encodable__input"
          rows={rows}
          value={text}
          spellCheck
          disabled={disabled}
          readOnly={readOnly}
          aria-describedby={`${hintId} ${summaryId}`}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onKeyUp={syncCaret}
          onSelect={syncCaret}
          onClick={syncCaret}
          onFocus={syncCaret}
          onDoubleClick={() => {
            const m = caretMatch();
            if (m && m.status !== 'confirmed' && onConfirm && !readOnly && !disabled) onConfirm(m.id);
          }}
          onScroll={e => {
            if (backRef.current) backRef.current.scrollTop = e.currentTarget.scrollTop;
          }}
        />
      </div>
      <div id={hintId} className={cx('cui-encodable__hint', hideInstructions && 'cui-visually-hidden')}>{instructionText}</div>
      <div id={summaryId} className="cui-visually-hidden">
        {`${codable} ${codable === 1 ? 'phrase' : 'phrases'} can be coded, ${confirmedCount} confirmed.`}
      </div>
      <div className="cui-visually-hidden" aria-live="polite">{status}</div>
    </div>
  );
});
