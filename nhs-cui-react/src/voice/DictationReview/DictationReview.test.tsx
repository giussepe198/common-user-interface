import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, within } from '@testing-library/react';
import { ClinicalLocaleProvider } from '../../core';
import { EWS_NZEWS, EWS_NEWS2 } from '../../lists';
import { parseSpokenObservations } from '../utils/spokenObservations';
import { DictationReview } from './DictationReview';

afterEach(cleanup);

const C1 = "Resp rate twenty two, sats ninety three, BP one ten on seventy, heart rate one hundred and twelve, temp thirty eight point four, she's alert";
const heardC1 = parseSpokenObservations(C1, EWS_NZEWS).observations;

const save = () => screen.getByRole('button', { name: 'Save observations' });

describe('DictationReview', () => {
  it('shows the C2 state: oxygen question, scores in words, 7+ incomplete, NZ mandatory text, Save blocked', () => {
    render(<DictationReview definition={EWS_NZEWS} heard={heardC1} subject="she" takenAt={new Date(2026, 9, 27, 14, 8)} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Check before saving 14:08');
    const q = screen.getByRole('heading', { name: 'Oxygen was not heard. Is she on room air?' });
    expect(q).toBeTruthy();
    const rr = screen.getByText('Respiratory rate').closest('.cui-dictation-review__row') as HTMLElement;
    expect(rr.textContent).toContain('2 Orange');
    expect(within(rr).getByText('Score 2, Orange zone')).toBeTruthy();
    expect(rr.textContent).toContain('22 breaths/min');
    const total = document.querySelector('.cui-dictation-review__total') as HTMLElement;
    expect(total.textContent).toContain('7+');
    expect(total.textContent).toContain('Orange zone so far');
    expect(total.textContent).toContain('Incomplete until oxygen is answered');
    expect(screen.getByText(/ESCALATE CARE FOR ANY PATIENT/)).toBeTruthy();
    expect(save().hasAttribute('disabled')).toBe(true);
    const describedBy = (save().getAttribute('aria-describedby') ?? '').split(' ');
    expect(describedBy.map(i => document.getElementById(i)?.textContent)).toEqual(['Answer the question above to save', 'Oxygen was not heard. Is she on room air?']);
  });
  it('answers the question, completes the total and saves', () => {
    const onSave = vi.fn();
    render(<DictationReview definition={EWS_NZEWS} heard={heardC1} subject="she" onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Room air' }));
    expect(screen.queryByRole('heading', { name: /Oxygen was not heard/ })).toBeNull();
    const total = document.querySelector('.cui-dictation-review__total') as HTMLElement;
    expect(total.textContent).toContain('7');
    expect(total.textContent).not.toContain('7+');
    expect(save().hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(save());
    fireEvent.click(save());
    expect(onSave).toHaveBeenCalledTimes(1);
    const r = onSave.mock.calls[0][0];
    expect(r.values).toMatchObject({ supplementalOxygen: 'air', respiratoryRate: '22', systolicBloodPressure: '110' });
    expect(r.diastolic).toBe(70);
    expect(r.score.total).toBe(7);
    expect(r.score.complete).toBe(true);
    expect(r.changedParameterIds).toEqual(['supplementalOxygen']);
  });
  it('offers both candidates for an ambiguous number', () => {
    const heard = parseSpokenObservations('resp rate fifteen', EWS_NZEWS).observations;
    render(<DictationReview definition={EWS_NZEWS} heard={heard} requiredParameterIds={[]} parameterIds={['respiratoryRate']} />);
    expect(screen.getByRole('heading', { name: 'Was respiratory rate 15 or 50?' })).toBeTruthy();
    expect(save().hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '50 breaths/min' }));
    expect(screen.getByText('Respiratory rate').closest('.cui-dictation-review__row')?.textContent).toContain('50');
    expect(save().hasAttribute('disabled')).toBe(false);
  });
  it('needs a critical value confirmed (GTAB-177)', () => {
    const heard = parseSpokenObservations('sats eighty four', EWS_NZEWS).observations;
    render(
      <DictationReview
        definition={EWS_NZEWS}
        heard={heard}
        requiredParameterIds={[]}
        criticalThresholds={[{ direction: 'low', value: 85, appliesTo: 'oxygenSaturation' }]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Oxygen saturation 84 % is below the critical limit (85 %). Re-measure or confirm.' })).toBeTruthy();
    expect(save().hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm 84 %' }));
    expect(save().hasAttribute('disabled')).toBe(false);
  });
  it('edits a row with the keypad for that parameter', () => {
    render(<DictationReview definition={EWS_NZEWS} heard={heardC1} subject="she" />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit heart rate' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Edit heart rate' })).toBeTruthy();
    const del = within(dialog).getByRole('button', { name: /Delete|Backspace|Clear/i });
    fireEvent.click(del);
    fireEvent.click(del);
    fireEvent.click(del);
    ['9', '8'].forEach(k => fireEvent.click(within(dialog).getAllByRole('button', { name: k })[0]));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Use this value' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Heart rate').closest('.cui-dictation-review__row')?.textContent).toContain('98 beats/min');
  });
  it('uses the GB chart by default and its wording', () => {
    const heard = parseSpokenObservations('RR 18 sats 97 pulse 64 BP 128/82 temp 36.9 alert', EWS_NEWS2).observations;
    render(
      <ClinicalLocaleProvider region="GB">
        <DictationReview heard={heard} />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Oxygen was not heard. Is the patient on air?' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Air' }));
    const total = document.querySelector('.cui-dictation-review__total') as HTMLElement;
    expect(total.textContent).toContain('0');
    expect(screen.queryByText(/ESCALATE CARE/)).toBeNull();
  });
  it('touch targets: edit buttons and answers are at least 48 px', () => {
    render(<DictationReview definition={EWS_NZEWS} heard={heardC1} />);
    expect(screen.getAllByRole('button', { name: /^Edit / })[0].className).toBe('cui-dictation-review__edit');
    expect(screen.getByRole('button', { name: 'Room air' }).className).toContain('cui-touch-button--h48');
  });
  it('renders the edit keypad sheet into a container or in place', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const { container, rerender } = render(<DictationReview definition={EWS_NZEWS} heard={heardC1} subject="she" container={host} closeOnBrowserBack={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit heart rate' }));
    expect(host.contains(screen.getByRole('dialog'))).toBe(true);
    expect(document.body.style.overflow).toBe('');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<DictationReview definition={EWS_NZEWS} heard={heardC1} subject="she" portal={false} closeOnBrowserBack={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit heart rate' }));
    expect(container.contains(screen.getByRole('dialog'))).toBe(true);
    host.remove();
  });
});
