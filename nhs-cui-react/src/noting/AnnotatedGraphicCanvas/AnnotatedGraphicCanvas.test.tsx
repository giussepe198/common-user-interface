import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within, act } from '@testing-library/react';
import { AnnotatedGraphicCanvas, type GraphicFinding } from './AnnotatedGraphicCanvas';
import { TEST_GRAPHIC } from './testGraphic';

afterEach(cleanup);
let n = 0;
const createId = () => `f${++n}`;

function canvas() {
  return screen.getByRole('application');
}

describe('AnnotatedGraphicCanvas', () => {
  it('shows the toolbar in edit mode only, with titles and orientation labels (NwG-0112/0113, NwG-0088, NwG-0008)', () => {
    const { rerender } = render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} />);
    expect(screen.getByRole('toolbar', { name: 'Drawing tools' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Adult body' })).toBeTruthy();
    expect(screen.getByText('Front view')).toBeTruthy();
    cleanup();
    void rerender;
    render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} mode="view" defaultFindings={[{ id: 'a', box: { x: -190, y: 10, width: 170 }, text: 'Bruise' }]} />);
    expect(screen.queryByRole('toolbar')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Bruise')).toBeTruthy();
  });
  it('places a symbol from the keyboard with an automatic, focused, empty text-box on the nearest side (NwG-0043/0045/0047/0098)', () => {
    const onChange = vi.fn();
    render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} onFindingsChange={onChange} createId={createId} />);
    fireEvent.click(screen.getByRole('button', { name: /Exact location/ }));
    const c = canvas();
    fireEvent.focus(c);
    for (let i = 0; i < 3; i++) fireEvent.keyDown(c, { key: 'ArrowLeft', shiftKey: true });
    fireEvent.keyDown(c, { key: 'Enter' });
    const f: GraphicFinding = onChange.mock.calls.at(-1)![0][0];
    expect(f.mark).toEqual({ kind: 'symbol', symbolId: 'x', x: 22, y: 140 });
    expect(f.text).toBe('');
    expect(f.box.x).toBeLessThan(0);
    expect(document.activeElement?.tagName).toBe('TEXTAREA');
    expect((document.activeElement as HTMLTextAreaElement).placeholder).toBe('Enter text here...');
  });
  it('refuses ready-made symbols outside the graphic (NwG-0036) but accepts them on it', () => {
    const onChange = vi.fn();
    render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} onFindingsChange={onChange} createId={createId} />);
    fireEvent.click(screen.getByRole('button', { name: /Exact location/ }));
    const c = canvas();
    fireEvent.keyDown(c, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    for (let i = 0; i < 20; i++) fireEvent.keyDown(c, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(c, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
  it('deletes a finding with its text-box and arrow together (NwG-0094/0095) and undoes (NwG-0067)', () => {
    const findings: GraphicFinding[] = [{ id: 'a', mark: { kind: 'symbol', symbolId: 'x', x: 70, y: 100 }, box: { x: -190, y: 80, width: 170 }, text: 'Graze' }];
    render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} defaultFindings={findings} />);
    fireEvent.click(screen.getByRole('button', { name: /Delete Exact location/ }));
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Graze');
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
    expect(screen.queryByRole('textbox')).toBeNull();
  });
  it('asks Cancel/Continue before removing everything (NwG-0069/0070)', () => {
    const findings: GraphicFinding[] = [{ id: 'a', box: { x: -190, y: 10, width: 170 }, text: 'General comment' }];
    render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} defaultFindings={findings} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove all' }));
    const alert = screen.getByRole('alertdialog');
    fireEvent.click(within(alert).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('textbox')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove all' }));
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Continue' }));
    expect(screen.queryByRole('textbox')).toBeNull();
  });
  it('moves the selected symbol with its text-box (NwG-0041) and selects with N', () => {
    const onChange = vi.fn();
    const findings: GraphicFinding[] = [{ id: 'a', mark: { kind: 'symbol', symbolId: 'x', x: 70, y: 100 }, box: { x: -190, y: 80, width: 170 }, text: 'Graze' }];
    render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} defaultFindings={findings} onFindingsChange={onChange} />);
    const c = canvas();
    fireEvent.keyDown(c, { key: 'n' });
    fireEvent.keyDown(c, { key: 'ArrowDown' });
    const moved: GraphicFinding = onChange.mock.calls.at(-1)![0][0];
    expect(moved.mark).toEqual({ kind: 'symbol', symbolId: 'x', x: 70, y: 104 });
    expect(moved.box.y).toBe(84);
  });
  it('adds a general comment text-box (NwG-0055) and applies emphasis (NwG-0051)', () => {
    const onChange = vi.fn();
    render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} onFindingsChange={onChange} createId={createId} />);
    fireEvent.click(screen.getByRole('button', { name: 'Comment' }));
    fireEvent.keyDown(canvas(), { key: 'Enter' });
    const box = screen.getByRole('textbox');
    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: 'Old scar' } });
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onChange.mock.calls.at(-1)![0][0]).toEqual(expect.objectContaining({ text: 'Old scar', emphasis: { bold: true } }));
    expect(onChange.mock.calls.at(-1)![0][0].mark).toBeUndefined();
  });

  it('draws free-hand from the keyboard: Enter puts the pen down, arrows draw, Enter finishes (NwG-0028)', () => {
    const onChange = vi.fn();
    render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} onFindingsChange={onChange} createId={createId} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pen' }));
    const c = canvas();
    fireEvent.focus(c);
    fireEvent.keyDown(c, { key: 'Enter' });
    expect(screen.getByText(/^Pen down\. Arrow keys draw/)).toBeTruthy();
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    fireEvent.keyDown(c, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(c, { key: 'PageDown' });
    fireEvent.keyDown(c, { key: 'ArrowDown' });
    fireEvent.keyDown(c, { key: 'Backspace' });
    fireEvent.keyDown(c, { key: 'Enter' });
    const f = onChange.mock.calls.at(-1)![0][0] as GraphicFinding;
    expect(f.mark?.kind).toBe('freehand');
    const pts = f.mark && f.mark.kind !== 'symbol' ? f.mark.points : [];
    expect(pts).toHaveLength(4);
    expect(pts[1].x - pts[0].x).toBe(4);
    expect(pts[2].x - pts[1].x).toBe(16);
    expect([pts[3].x - pts[2].x, pts[3].y - pts[2].y]).toEqual([4, 4]);
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });
  it('cancels a keyboard drawing with Escape and shades a region from the keyboard', () => {
    const onChange = vi.fn();
    render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} onFindingsChange={onChange} createId={createId} />);
    fireEvent.click(screen.getByRole('button', { name: 'Shade area' }));
    const c = canvas();
    fireEvent.keyDown(c, { key: ' ' });
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    fireEvent.keyDown(c, { key: 'Escape' });
    expect(screen.getByText('Drawing cancelled.')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(c, { key: 'Enter' });
    fireEvent.keyDown(c, { key: 'Enter' });
    expect(screen.getByText(/Nothing drawn/)).toBeTruthy();
    fireEvent.keyDown(c, { key: 'Enter' });
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    fireEvent.keyDown(c, { key: 'ArrowDown' });
    fireEvent.keyDown(c, { key: 'Enter' });
    expect((onChange.mock.calls.at(-1)![0][0] as GraphicFinding).mark?.kind).toBe('region');
  });
  it('shows "More of the diagram is below" only while the canvas bottom is off screen (NwG-0108)', () => {
    let cb: ((e: Partial<IntersectionObserverEntry>[]) => void) | null = null;
    class FakeIO {
      constructor(fn: (e: Partial<IntersectionObserverEntry>[]) => void) { cb = fn; }
      observe() {}
      disconnect() {}
    }
    const g = globalThis as { IntersectionObserver?: unknown };
    const saved = g.IntersectionObserver;
    g.IntersectionObserver = FakeIO;
    try {
      render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} />);
      const rootBounds = { bottom: 800 } as DOMRectReadOnly;
      act(() => cb!([{ isIntersecting: true, rootBounds, boundingClientRect: { bottom: 700 } as DOMRectReadOnly }]));
      expect(screen.queryByText('More of the diagram is below')).toBeNull();
      act(() => cb!([{ isIntersecting: true, rootBounds, boundingClientRect: { bottom: 1100 } as DOMRectReadOnly }]));
      expect(screen.getByText('More of the diagram is below')).toBeTruthy();
      act(() => cb!([{ isIntersecting: false, rootBounds, boundingClientRect: { bottom: 2000 } as DOMRectReadOnly }]));
      expect(screen.queryByText('More of the diagram is below')).toBeNull();
    } finally {
      g.IntersectionObserver = saved;
    }
  });
  it('adds no layout element below the drawing when the whole canvas is visible', () => {
    const { container } = render(<AnnotatedGraphicCanvas graphic={TEST_GRAPHIC} />);
    expect(container.querySelector('.cui-graphic-canvas__sentinel')).toBeNull();
    expect(container.querySelector('.cui-graphic-canvas__look-ahead-anchor')).toBeNull();
  });
});
