import { describe, expect, it } from 'vitest';
import { dragAutoScrollDelta, dragCountWords, dragInsertionIndex, dragKeyOf, dragMoveBetween, dragPositionWords, dragReorder, dragStepIndex } from './dragDrop';

describe('dragReorder', () => {
  it('moves an item to its final index', () => {
    expect(dragReorder(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(dragReorder(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
  });
  it('clamps the target and ignores an unknown source', () => {
    expect(dragReorder(['a', 'b'], 0, 9)).toEqual(['b', 'a']);
    expect(dragReorder(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
  });
  it('never changes the input', () => {
    const list = ['a', 'b'];
    dragReorder(list, 0, 1);
    expect(list).toEqual(['a', 'b']);
  });
});

describe('dragMoveBetween', () => {
  it('takes the key out of its column and puts it at the index in the other', () => {
    expect(dragMoveBetween({ todo: ['a', 'b'], done: ['c'] }, 'a', 'done', 0)).toEqual({ todo: ['b'], done: ['a', 'c'] });
    expect(dragMoveBetween({ todo: ['a', 'b'], done: ['c'] }, 'b', 'done', 5)).toEqual({ todo: ['a'], done: ['c', 'b'] });
  });
  it('reorders within one column', () => {
    expect(dragMoveBetween({ todo: ['a', 'b', 'c'] }, 'a', 'todo', 2)).toEqual({ todo: ['b', 'c', 'a'] });
  });
  it('leaves everything as it was for an unknown key or column', () => {
    expect(dragMoveBetween({ todo: ['a'] }, 'z', 'todo', 0)).toEqual({ todo: ['a'] });
    expect(dragMoveBetween({ todo: ['a'] }, 'a', 'nowhere', 0)).toEqual({ todo: ['a'] });
  });
});

describe('dragInsertionIndex', () => {
  const others = [
    { start: 0, size: 40 },
    { start: 40, size: 40 },
    { start: 80, size: 40 },
  ];
  it('counts the items whose middle is above the pointer', () => {
    expect(dragInsertionIndex(-10, others)).toBe(0);
    expect(dragInsertionIndex(19, others)).toBe(0);
    expect(dragInsertionIndex(21, others)).toBe(1);
    expect(dragInsertionIndex(70, others)).toBe(2);
    expect(dragInsertionIndex(500, others)).toBe(3);
  });
});

describe('dragAutoScrollDelta (DND-0140)', () => {
  it('scrolls towards the near edge, faster at the edge', () => {
    expect(dragAutoScrollDelta(300, 0, 600)).toBe(0);
    expect(dragAutoScrollDelta(40, 0, 600)).toBeLessThan(0);
    expect(dragAutoScrollDelta(0, 0, 600)).toBe(-18);
    expect(dragAutoScrollDelta(600, 0, 600)).toBe(18);
    expect(Math.abs(dragAutoScrollDelta(10, 0, 600))).toBeGreaterThan(Math.abs(dragAutoScrollDelta(40, 0, 600)));
  });
  it('does nothing in a frame too small to have a middle', () => {
    expect(dragAutoScrollDelta(10, 0, 80)).toBe(0);
  });
});

describe('keyboard steps (DND-0020)', () => {
  it('maps arrow, Home and End keys', () => {
    expect(dragKeyOf('ArrowUp')).toBe('up');
    expect(dragKeyOf('ArrowRight')).toBe('right');
    expect(dragKeyOf('End')).toBe('end');
    expect(dragKeyOf('a')).toBeNull();
  });
  it('steps and clamps within the list', () => {
    expect(dragStepIndex(0, 3, 'up')).toBe(0);
    expect(dragStepIndex(1, 3, 'down')).toBe(2);
    expect(dragStepIndex(2, 3, 'down')).toBe(2);
    expect(dragStepIndex(2, 3, 'home')).toBe(0);
    expect(dragStepIndex(0, 3, 'end')).toBe(2);
    expect(dragStepIndex(0, 3, 'left')).toBeNull();
    expect(dragStepIndex(0, 0, 'down')).toBeNull();
  });
});

describe('words (DND-0210)', () => {
  it('says positions and counts', () => {
    expect(dragPositionWords(2, 5)).toBe('position 3 of 5');
    expect(dragCountWords(1, { one: 'task', other: 'tasks' })).toBe('1 task');
    expect(dragCountWords(0, { one: 'task', other: 'tasks' })).toBe('0 tasks');
  });
});
