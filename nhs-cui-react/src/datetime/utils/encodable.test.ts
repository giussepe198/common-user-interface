import { describe, expect, it } from 'vitest';
import type {
  EncodableMatch} from './encodable';
import {
  adjustMatchesForEdit,
  diffTextEdit,
  editTouchesConfirmed,
  matchAtCaret,
  nextWordEnd,
  previousWordEnd,
  segmentEncodableText,
} from './encodable';

const text = 'mild fever for three days';
const matches: EncodableMatch[] = [
  { id: 'a', start: 0, end: 4, status: 'elaboration', expressionId: 'x' },
  { id: 'b', start: 5, end: 10, status: 'encodable', label: 'Fever', expressionId: 'x' },
  { id: 'c', start: 15, end: 25, status: 'encodable', expressionId: 'x' },
];

describe('encodable text model', () => {
  it('finds the single edit between two strings', () => {
    expect(diffTextEdit('abc', 'abXc')).toEqual({ start: 2, deleteCount: 0, insertText: 'X' });
    expect(diffTextEdit('abcdef', 'abef')).toEqual({ start: 2, deleteCount: 2, insertText: '' });
    expect(diffTextEdit('aaa', 'aaaa')).toEqual({ start: 3, deleteCount: 0, insertText: 'a' });
  });
  it('locks confirmed text', () => {
    const m: EncodableMatch[] = [{ id: 'f', start: 5, end: 10, status: 'confirmed' }];
    expect(editTouchesConfirmed(m, { start: 7, deleteCount: 0, insertText: 'x' })?.id).toBe('f');
    expect(editTouchesConfirmed(m, { start: 4, deleteCount: 2, insertText: '' })?.id).toBe('f');
    expect(editTouchesConfirmed(m, { start: 10, deleteCount: 0, insertText: ' x' })).toBeNull();
    expect(editTouchesConfirmed(m, { start: 5, deleteCount: 0, insertText: 'x ' })).toBeNull();
  });
  it('shifts matches after an edit and drops touched suggestions', () => {
    const out = adjustMatchesForEdit(matches, { start: 0, deleteCount: 0, insertText: 'Very ' });
    expect(out.map(m => [m.id, m.start, m.end])).toEqual([['a', 5, 9], ['b', 10, 15], ['c', 20, 30]]);
    expect(adjustMatchesForEdit(matches, { start: 7, deleteCount: 1, insertText: '' }).map(m => m.id)).toEqual(['a', 'c']);
    expect(adjustMatchesForEdit(matches, { start: 10, deleteCount: 0, insertText: 's' }).map(m => m.id)).toEqual(['a', 'c']);
  });
  it('segments text into one marquee per expression', () => {
    const runs = segmentEncodableText(text + ' and cough', [...matches, { id: 'd', start: 30, end: 35, status: 'encodable' }]);
    expect(runs.map(r => [r.expressionId, r.start, r.end])).toEqual([['x', 0, 25], [null, 25, 30], ['d', 30, 35]]);
    expect(runs[0].segments.map(s => [s.text, s.match?.id ?? null])).toEqual([
      ['mild', 'a'], [' ', null], ['fever', 'b'], [' for ', null], ['three days', 'c'],
    ]);
    expect(segmentEncodableText('', [])).toEqual([{ expressionId: null, start: 0, end: 0, segments: [] }]);
  });
  it('finds the match at the caret and word boundaries', () => {
    expect(matchAtCaret(matches, 7)?.id).toBe('b');
    expect(matchAtCaret(matches, 12)).toBeNull();
    expect(nextWordEnd(text, 10)).toBe(14);
    expect(previousWordEnd(text, 25)).toBe(20);
  });
});

import { marqueeDragCandidates, nearestMarqueeOffset } from './encodable';

describe('marquee mouse dragging (2.1.5)', () => {
  const text = 'Mild fever for three days. Productive cough.';
  const fever = { id: 'f', start: 5, end: 10, status: 'encodable' as const };
  it('offers word ends within the sentence for the end handle', () => {
    expect(marqueeDragCandidates(text, fever, [], 'end')).toEqual([10, 14, 20, 25]);
  });
  it('offers word starts for the start handle, keeping at least one word', () => {
    expect(marqueeDragCandidates(text, fever, [], 'start')).toEqual([0, 5]);
  });
  it('never crosses another confirmed phrase; a full stop between digits is not a boundary', () => {
    const confirmed = { id: 'm', start: 0, end: 4, status: 'confirmed' as const };
    expect(marqueeDragCandidates(text, fever, [confirmed], 'start')).toEqual([5]);
    expect(marqueeDragCandidates('Temp 38.5 today. Next', { id: 't', start: 0, end: 4 }, [], 'end')).toEqual([4, 7, 9, 15]);
  });
  it('picks the candidate nearest the pointer', () => {
    const pos = (o: number) => ({ x: o * 8, y: 0 });
    expect(nearestMarqueeOffset([10, 14, 20, 25], pos, { x: 150, y: 3 })).toBe(20);
    expect(nearestMarqueeOffset([10, 14], () => null, { x: 0, y: 0 })).toBeNull();
  });
});
