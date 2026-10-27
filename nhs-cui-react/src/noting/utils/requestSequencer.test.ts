import { describe, expect, it } from 'vitest';
import { createRequestSequencer } from './requestSequencer';

describe('createRequestSequencer', () => {
  it('only the latest ticket is current', () => {
    const s = createRequestSequencer();
    const a = s.begin('ast');
    const b = s.begin('asth');
    expect(s.isCurrent(a)).toBe(false);
    expect(s.isCurrent(b)).toBe(true);
    expect(s.latestId).toBe(2);
  });
  it('rejects a response if the text changed since the request', () => {
    const s = createRequestSequencer();
    const a = s.begin('asth');
    expect(s.isCurrent(a, 'asthma')).toBe(false);
    expect(s.isCurrent(a, 'asth')).toBe(true);
  });
  it('invalidate makes all tickets stale', () => {
    const s = createRequestSequencer();
    const a = s.begin('x');
    s.invalidate();
    expect(s.isCurrent(a)).toBe(false);
  });
  it('handles out-of-order async responses', async () => {
    const s = createRequestSequencer();
    const applied: string[] = [];
    const run = (text: string, delay: number) => {
      const t = s.begin(text);
      return new Promise<void>((res) => setTimeout(() => { if (s.isCurrent(t)) applied.push(text); res(); }, delay));
    };
    await Promise.all([run('as', 30), run('ast', 5)]);
    expect(applied).toEqual(['ast']);
  });
});
