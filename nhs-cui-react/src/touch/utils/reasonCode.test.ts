import { describe, it, expect } from 'vitest';
import { reasonCodeCommitLabel, reasonCodeProblems, reasonCodePrompts, type ReasonCodeOption } from './reasonCode';

const codes: ReasonCodeOption[] = [
  { code: 'R', label: 'Refused', notifyPrescriber: true },
  { code: 'W', label: 'Withheld', requiresReason: true },
  { code: 'X', label: 'Other', showCode: false, prompts: [{ id: 'charge', label: 'Nurse in charge told', required: true }] },
];

describe('reasonCodeProblems', () => {
  it('needs a code', () => {
    expect(reasonCodeProblems(codes, { code: null, reason: '', prompts: {} })[0]).toMatchObject({ field: 'code', message: 'Choose a reason.' });
  });
  it('needs a reason for configured codes', () => {
    expect(reasonCodeProblems(codes, { code: 'W', reason: ' ', prompts: {} })[0].message).toBe('Enter a reason. A reason is required for W: Withheld.');
    expect(reasonCodeProblems(codes, { code: 'W', reason: 'Temp 36.9', prompts: {} })).toEqual([]);
  });
  it('needs required prompts ticked', () => {
    expect(reasonCodeProblems(codes, { code: 'X', reason: '', prompts: {} })[0]).toMatchObject({ field: 'prompt', promptId: 'charge' });
    expect(reasonCodeProblems(codes, { code: 'R', reason: '', prompts: {} })).toEqual([]);
    expect(reasonCodeProblems(codes, { code: 'R', reason: '', prompts: {} }, { requirePrescriberPrompt: true })[0].message).toBe('Confirm: Prescriber notified.');
  });
});

describe('prompts and labels', () => {
  it('adds the prescriber prompt', () => {
    expect(reasonCodePrompts(codes[0]).map(p => p.label)).toEqual(['Prescriber notified']);
    expect(reasonCodePrompts(undefined)).toEqual([]);
  });
  it('builds the commit label', () => {
    expect(reasonCodeCommitLabel(codes[1])).toBe('Record W: Withheld');
    expect(reasonCodeCommitLabel(codes[2])).toBe('Record Other');
  });
});
