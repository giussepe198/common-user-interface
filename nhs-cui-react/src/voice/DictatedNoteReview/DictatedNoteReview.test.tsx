import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ClinicalLocaleProvider } from '../../core';
import { ScriptedSpeechEngine } from '../SpeechEngine/SpeechEngine';
import { DictatedNoteReview, type DictatedNoteMatcher } from './DictatedNoteReview';

afterEach(cleanup);

const NOTE =
  'Day 2 of cellulitis of left lower leg. Erythema now 2 cm beyond the marked margin, worse since yesterday. Fever 38.4. Plan: continue flucloxacillin five hundred micrograms four times a day, review bloods tomorrow.';

const matcher: DictatedNoteMatcher = text => {
  const out = [];
  const a = text.indexOf('cellulitis of left lower leg');
  if (a >= 0) {
    out.push({
      start: a, end: a + 'cellulitis of left lower leg'.length,
      suggestion: { id: 'cellulitis', label: 'Cellulitis of lower leg', confirmed: true, attributes: [{ id: 'left', label: 'Left', mandatory: true, confirmed: true }] },
    });
  }
  const f = text.indexOf('Fever');
  if (f >= 0) out.push({ start: f, end: f + 5, suggestion: { id: 'fever', label: 'Fever' } });
  return out;
};

const prescribed = [{ medicine: 'flucloxacillin', dose: { value: 500, unit: 'mg' } }];
const sign = () => screen.getByRole('button', { name: 'Sign note' });

describe('DictatedNoteReview', () => {
  it('shows the C3 state: highlights, the dose check, codes, and Sign blocked with the reason', () => {
    const { container } = render(<DictatedNoteReview defaultText={NOTE} matchCodes={matcher} prescribed={prescribed} heading="Ward round note" draftAt={new Date(2026, 9, 27, 14, 10)} />);
    expect(screen.getByText('Draft, 14:10')).toBeTruthy();
    expect(container.querySelector('.cui-dictated-note__confirmed')?.textContent).toBe('cellulitis of left lower leg (confirmed code)');
    expect(container.querySelector('.cui-dictated-note__encodable')?.textContent).toBe('Fever (suggested code)');
    expect(container.querySelector('.cui-dictated-note__check')?.textContent).toBe('five hundred micrograms (check this dose)');
    expect(screen.getByRole('heading', { name: 'Check this dose' })).toBeTruthy();
    expect(screen.getByText('Heard "five hundred micrograms". The prescribed dose is 500 mg (1,000 times larger).')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Suggested codes (tap to confirm)' })).toBeTruthy();
    expect(sign().hasAttribute('disabled')).toBe(true);
    const ids = (sign().getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids.map(i => document.getElementById(i)?.textContent)).toEqual(['Resolve the check above to sign', 'Check this dose']);
    expect(screen.getByRole('button', { name: 'Save draft' }).hasAttribute('disabled')).toBe(false);
  });
  it('"Use 500 mg" replaces the words, unblocks Sign and records the choice', () => {
    const onSign = vi.fn();
    const onTextChange = vi.fn();
    render(<DictatedNoteReview defaultText={NOTE} matchCodes={matcher} prescribed={prescribed} onSign={onSign} onTextChange={onTextChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use 500 mg' }));
    expect(onTextChange.mock.calls[0][0]).toContain('continue flucloxacillin 500 mg four times a day');
    expect(sign().hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(sign());
    fireEvent.click(sign());
    const r = onSign.mock.calls[0][0];
    expect(r.doseDecisions).toEqual([{ medicine: 'flucloxacillin', heard: 'five hundred micrograms', prescribed: '500 mg', decision: 'prescribed', status: 'unit-mismatch' }]);
    expect(r.codes.find((c: { id: string }) => c.id === 'cellulitis').confirmed).toBe(true);
    expect(r.blockers).toEqual([]);
  });
  it('"Keep as heard" keeps the text and unblocks Sign', () => {
    const onSign = vi.fn();
    render(<DictatedNoteReview defaultText={NOTE} prescribed={prescribed} onSign={onSign} />);
    fireEvent.click(screen.getByRole('button', { name: 'Keep as heard' }));
    expect(screen.queryByRole('heading', { name: 'Check this dose' })).toBeNull();
    fireEvent.click(sign());
    expect(onSign.mock.calls[0][0].text).toContain('five hundred micrograms');
    expect(onSign.mock.calls[0][0].doseDecisions[0].decision).toBe('heard');
  });
  it('saves a draft at any time, with the blockers', () => {
    const onSaveDraft = vi.fn();
    render(<DictatedNoteReview defaultText={NOTE} prescribed={prescribed} onSaveDraft={onSaveDraft} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(onSaveDraft.mock.calls[0][0].blockers[0].kind).toBe('dose');
  });
  it('ticks codes (nothing coded without confirmation)', () => {
    const onCodesChange = vi.fn();
    render(<DictatedNoteReview defaultText={NOTE} matchCodes={matcher} onCodesChange={onCodesChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Fever/ }));
    const codes = onCodesChange.mock.calls[0][0];
    expect(codes.find((c: { id: string }) => c.id === 'fever').confirmed).toBe(true);
    expect(document.querySelectorAll('.cui-dictated-note__confirmed')).toHaveLength(2);
  });
  it('checks dangerous abbreviations by region and replaces them', () => {
    const text = 'Continue flucloxacillin 500 mg QDS.';
    render(
      <ClinicalLocaleProvider region="AU">
        <DictatedNoteReview defaultText={text} prescribed={prescribed} />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Replace "QDS"' })).toBeTruthy();
    expect(sign().hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'four times a day' }));
    expect(screen.getByText(/Continue flucloxacillin 500 mg four times a day\./)).toBeTruthy();
    expect(sign().hasAttribute('disabled')).toBe(false);
    cleanup();
    // GB list does not include QDS.
    render(<DictatedNoteReview region="GB" defaultText={text} prescribed={prescribed} />);
    expect(screen.queryByRole('heading', { name: 'Replace "QDS"' })).toBeNull();
    expect(sign().hasAttribute('disabled')).toBe(false);
  });
  it('uses the region wording for the prescribed dose (NZ "microgram")', () => {
    render(<DictatedNoteReview region="NZ" defaultText="digoxin one hundred and twenty five mg daily" prescribed={[{ medicine: 'digoxin', dose: { value: 0.125, unit: 'mg' } }]} />);
    expect(screen.getByRole('button', { name: 'Use 125 microgram' })).toBeTruthy();
  });
  it('dictates more with an engine, appending final text', () => {
    const engine = new ScriptedSpeechEngine([{ final: 'Discussed with daughter.' }]);
    render(<DictatedNoteReview defaultText="Day 2." engine={engine} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dictate more' }));
    act(() => {
      engine.next();
    });
    expect(screen.getByText('Day 2. Discussed with daughter.')).toBeTruthy();
  });
  it('lets the text be edited by touch', () => {
    render(<DictatedNoteReview defaultText="Day 2." />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }));
    const ta = screen.getByLabelText('Note text') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'Day 3.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByText('Day 3.')).toBeTruthy();
  });
});
