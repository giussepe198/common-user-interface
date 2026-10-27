import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EncodableTextEditor } from './EncodableTextEditor';
import { adjustMatchesForEdit } from '../utils/encodable';
import type { EncodableMatch } from '../utils/encodable';

afterEach(cleanup);
const TEXT = 'mild fever for three days';
const MATCHES: EncodableMatch[] = [
  { id: 'a', start: 0, end: 4, status: 'elaboration', expressionId: 'x', label: 'Mild' },
  { id: 'b', start: 5, end: 10, status: 'encodable', expressionId: 'x', label: 'Fever' },
];

function Host(props: Partial<React.ComponentProps<typeof EncodableTextEditor>> & { initial?: EncodableMatch[] }) {
  const [text, setText] = useState(TEXT);
  const [matches, setMatches] = useState(props.initial ?? MATCHES);
  return (
    <EncodableTextEditor
      label="Notes"
      value={text}
      matches={matches}
      onChange={(t, edit) => {
        setText(t);
        setMatches(m => adjustMatchesForEdit(m, edit));
      }}
      onBoundaryChange={(id, start, end) => setMatches(ms => ms.map(m => (m.id === id ? { ...m, start, end } : m)))}
      {...props}
    />
  );
}

describe('EncodableTextEditor', () => {
  it('highlights encodable and elaboration phrases inside one expression marquee', () => {
    const { container } = render(<Host focusedExpressionId="x" />);
    expect([...container.querySelectorAll('mark')].map(m => [m.textContent, m.className.split('--')[1]])).toEqual([['mild', 'elaboration'], ['fever', 'encodable']]);
    expect(container.querySelectorAll('.cui-encodable__marquee')).toHaveLength(1);
    expect(container.querySelectorAll('.cui-encodable__handle')).toHaveLength(2);
    expect(screen.getByText('2 phrases can be coded, 0 confirmed.')).toBeTruthy();
  });
  it('confirms the phrase at the caret with Alt+Enter or double-click, and announces it', () => {
    const onConfirm = vi.fn();
    const onFocusExpression = vi.fn();
    render(<Host onConfirm={onConfirm} onFocusExpression={onFocusExpression} />);
    const area = screen.getByLabelText('Notes') as HTMLTextAreaElement;
    area.focus();
    area.setSelectionRange(7, 7);
    fireEvent.keyUp(area, { key: 'ArrowRight' });
    expect(onFocusExpression).toHaveBeenLastCalledWith('x');
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe('"fever" can be coded as Fever. Not yet confirmed.');
    fireEvent.keyDown(area, { key: 'Enter', altKey: true });
    expect(onConfirm).toHaveBeenCalledWith('b');
    fireEvent.doubleClick(area);
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });
  it('locks confirmed text until it is unconfirmed (displaystandards 2.2)', () => {
    const onUnconfirm = vi.fn();
    const confirmed: EncodableMatch[] = [{ id: 'b', start: 5, end: 10, status: 'confirmed', label: 'Fever' }];
    const { container } = render(<Host initial={confirmed} onUnconfirm={onUnconfirm} />);
    const area = screen.getByLabelText('Notes') as HTMLTextAreaElement;
    expect(container.querySelector('.cui-encodable__mark--confirmed')?.textContent).toBe('fever');
    fireEvent.change(area, { target: { value: 'mild feXver for three days' } });
    expect(area.value).toBe(TEXT);
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toMatch(/is confirmed and cannot be edited/);
    fireEvent.change(area, { target: { value: 'very mild fever for three days' } });
    expect(area.value).toBe('very mild fever for three days');
    expect(container.querySelector('.cui-encodable__mark--confirmed')?.textContent).toBe('fever');
    area.setSelectionRange(12, 12);
    fireEvent.keyDown(area, { key: 'Backspace', altKey: true });
    expect(onUnconfirm).toHaveBeenCalledWith('b');
  });
  it('moves a phrase boundary by a word from the keyboard', () => {
    const { container } = render(<Host />);
    const area = screen.getByLabelText('Notes') as HTMLTextAreaElement;
    area.focus();
    area.setSelectionRange(7, 7);
    fireEvent.keyDown(area, { key: 'ArrowRight', altKey: true, shiftKey: true });
    expect([...container.querySelectorAll('mark')].map(m => m.textContent)).toEqual(['mild', 'fever for']);
    fireEvent.keyDown(area, { key: 'ArrowLeft', altKey: true, shiftKey: true });
    expect([...container.querySelectorAll('mark')].map(m => m.textContent)).toEqual(['mild', 'fever']);
  });

  it('drags the end handle with the mouse, snapping to whole words (2.1.5)', () => {
    const text = 'Mild fever for three days. Cough.';
    const matches: EncodableMatch[] = [
      { id: 'mild', start: 0, end: 4, status: 'elaboration', expressionId: 'e1' },
      { id: 'fever', start: 5, end: 10, status: 'encodable', expressionId: 'e1' },
    ];
    const onBoundary = vi.fn();
    // jsdom has no layout: each character is 8px wide on one line.
    const proto = Range.prototype as unknown as { getBoundingClientRect?: () => DOMRect };
    const original = proto.getBoundingClientRect;
    proto.getBoundingClientRect = function (this: Range) {
      const el = this.startContainer.parentElement as HTMLElement;
      const left = (Number(el.dataset.o) + this.startOffset) * 8;
      return { left, right: left + 8, top: 0, bottom: 20, height: 20, width: 8, x: left, y: 0, toJSON: () => ({}) } as DOMRect;
    };
    try {
      const { container } = render(<EncodableTextEditor label="Note" value={text} matches={matches} focusedExpressionId="e1" onBoundaryChange={onBoundary} />);
      const end = container.querySelector('.cui-encodable__handle--end') as HTMLElement;
      expect(end.getAttribute('title')).toBe('Drag the handles to include or exclude text in the expression');
      fireEvent.pointerDown(end);
      fireEvent(document, new MouseEvent('pointermove', { clientX: 158, clientY: 10 }));
      expect(onBoundary).toHaveBeenLastCalledWith('fever', 5, 20);
      fireEvent(document, new MouseEvent('pointermove', { clientX: 400, clientY: 10 }));
      expect(onBoundary).toHaveBeenLastCalledWith('fever', 5, 25);
      fireEvent(document, new MouseEvent('pointerup'));
      expect(screen.getByText('Selection is now "fever for three days".')).toBeTruthy();
      // The start handle moves the first phrase of the expression.
      const start = container.querySelector('.cui-encodable__handle--start') as HTMLElement;
      fireEvent.pointerDown(start);
      fireEvent(document, new MouseEvent('pointermove', { clientX: 42, clientY: 10 }));
      expect(onBoundary).not.toHaveBeenCalledWith('mild', expect.anything(), expect.anything());
      fireEvent(document, new MouseEvent('pointerup'));
    } finally {
      proto.getBoundingClientRect = original;
    }
  });
  it('offers no drag on handles when read-only or without onBoundaryChange', () => {
    const matches: EncodableMatch[] = [{ id: 'f', start: 0, end: 5, status: 'encodable' }];
    const { container } = render(<EncodableTextEditor label="Note" value="fever today" matches={matches} focusedExpressionId="f" />);
    expect(container.querySelector('.cui-encodable__handle--draggable')).toBeNull();
    expect(container.querySelector('.cui-encodable__handle--end')).toBeTruthy();
  });
});
