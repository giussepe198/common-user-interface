import { describe, it, expect } from 'vitest';
import { applyNumberPadKey, numberPadKeyFromKeyboard, parseNumberPadValue } from './numberPad';

const type = (keys: string[], rules = {}) => keys.reduce((t, k) => applyNumberPadKey(t, k as never, rules), '');

describe('applyNumberPadKey', () => {
  it('enters digits and deletes', () => {
    expect(type(['8', '4'])).toBe('84');
    expect(type(['8', '4', 'delete'])).toBe('8');
    expect(type(['8', 'clear'])).toBe('');
  });
  it('refuses decimals unless allowed, and gives a leading zero', () => {
    expect(type(['3', '.', '5'])).toBe('35');
    expect(type(['.', '5'], { allowDecimal: true })).toBe('0.5');
    expect(type(['3', '6', '.', '.', '5'], { allowDecimal: true })).toBe('36.5');
    expect(type(['0', '.', 'delete'], { allowDecimal: true })).toBe('');
  });
  it('limits decimal places and length and drops leading zeros', () => {
    expect(type(['3', '6', '.', '5', '2'], { allowDecimal: true, maxDecimals: 1 })).toBe('36.5');
    expect(type(['1', '2', '3', '4'], { maxLength: 3 })).toBe('123');
    expect(type(['0', '7'])).toBe('7');
  });
});

describe('parseNumberPadValue and keyboard', () => {
  it('parses', () => {
    expect(parseNumberPadValue('36.5')).toBe(36.5);
    expect(parseNumberPadValue('12.')).toBe(12);
    expect(parseNumberPadValue('')).toBeNull();
  });
  it('maps keyboard keys', () => {
    expect(numberPadKeyFromKeyboard('7')).toBe('7');
    expect(numberPadKeyFromKeyboard(',')).toBe('.');
    expect(numberPadKeyFromKeyboard('Backspace')).toBe('delete');
    expect(numberPadKeyFromKeyboard('a')).toBeNull();
  });
});
