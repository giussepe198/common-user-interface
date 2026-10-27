import { describe, it, expect } from 'vitest';
import { checkReadBack } from './readBack';

const units = { value: 6, unit: 'units', unitAliases: ['unit'] };

describe('checkReadBack', () => {
  it('matches the value with or without the unit', () => {
    expect(checkReadBack('6', units).status).toBe('match');
    expect(checkReadBack(' 6 units ', units).status).toBe('match');
    expect(checkReadBack('6', units).message).toBe('Matches the order');
  });
  it('reports a mismatch without revealing the expected value', () => {
    const r = checkReadBack('60', units);
    expect(r.status).toBe('mismatch');
    expect(r.message).not.toContain('6 ');
    expect(checkReadBack('six', units).status).toBe('mismatch');
  });
  it('refuses unsafe forms even when the number is equal', () => {
    expect(checkReadBack('6.0', units).status).toBe('unsafeFormat');
    expect(checkReadBack('.5', { value: 0.5, unit: 'mg' }).status).toBe('unsafeFormat');
    expect(checkReadBack('6 U', units)).toMatchObject({ status: 'wrongUnit' });
    expect(checkReadBack('6 mL', units).status).toBe('wrongUnit');
  });
  it('compares text values', () => {
    expect(checkReadBack('A positive', { value: 'A Positive' }).status).toBe('match');
    expect(checkReadBack('', units).status).toBe('empty');
  });
});
