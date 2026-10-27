import { describe, it, expect } from 'vitest';
import { nearestGraphicSide, clampToCanvas, isInsideGraphic, placeAnnotationTextBox, canvasHeightFor, rectsOverlap, freehandPath, rectEdgePoint, pointsBounds } from './graphics';

describe('graphics geometry', () => {
  it('chooses the nearest side for text-boxes (NwG-0045)', () => {
    expect(nearestGraphicSide(10, 50)).toBe('left');
    expect(nearestGraphicSide(60, 50)).toBe('right');
  });
  it('keeps points in the canvas and symbols in the graphic (NwG-0100, NwG-0036)', () => {
    expect(clampToCanvas({ x: -5, y: 900 }, { x: 0, y: 0, width: 100, height: 200 })).toEqual({ x: 0, y: 200 });
    expect(isInsideGraphic({ x: 10, y: 10 }, [{ x: 0, y: 0, width: 20, height: 20 }])).toBe(true);
    expect(isInsideGraphic({ x: 30, y: 10 }, [{ x: 0, y: 0, width: 20, height: 20 }])).toBe(false);
  });
  it('places text-boxes without overlapping (NwG-0046) and grows the canvas (NwG-0083)', () => {
    const first = placeAnnotationTextBox(50, { x: 0, width: 100 }, 40, []);
    const second = placeAnnotationTextBox(50, { x: 0, width: 100 }, 40, [first]);
    expect(rectsOverlap(first, second, 6)).toBe(false);
    expect(canvasHeightFor(100, [{ x: 0, y: 90, width: 10, height: 50 }])).toBe(148);
    expect(canvasHeightFor(300, [])).toBe(300);
  });
  it('builds paths and edges', () => {
    expect(freehandPath([{ x: 0, y: 0 }, { x: 1, y: 2 }], true)).toBe('M0.0 0.0 L1.0 2.0 Z');
    expect(rectEdgePoint({ x: 0, y: 0, width: 100, height: 40 }, { x: 200, y: 20 })).toEqual({ x: 100, y: 20 });
    expect(pointsBounds([{ x: 1, y: 5 }, { x: 4, y: 2 }])).toEqual({ x: 1, y: 2, width: 3, height: 3 });
  });
});
