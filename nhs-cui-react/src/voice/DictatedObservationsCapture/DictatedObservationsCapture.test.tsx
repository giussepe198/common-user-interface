import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent, within } from '@testing-library/react';
import { ClinicalLocaleProvider } from '../../core';
import { EWS_NZEWS } from '../../lists';
import { ScriptedSpeechEngine } from '../SpeechEngine/SpeechEngine';
import { DictatedObservationsCapture } from './DictatedObservationsCapture';

afterEach(cleanup);

const C1 = "Resp rate twenty two, sats ninety three, BP one ten on seventy, heart rate one hundred and twelve, temp thirty eight point four, she's alert";

const rows = () =>
  Array.from(document.querySelectorAll('.cui-dictate-obs__row')).map(r => `${r.querySelector('dt')?.textContent}: ${r.querySelector('dd')?.textContent}`);

describe('DictatedObservationsCapture', () => {
  it('reads back every parameter and says what was not heard (C1)', () => {
    render(<DictatedObservationsCapture definition={EWS_NZEWS} transcript={C1} banner={<header aria-label="Patient">Ngata, Mereana</header>} />);
    expect(screen.getByLabelText('Patient').textContent).toBe('Ngata, Mereana');
    expect(screen.getByRole('heading', { name: 'Observations by voice' })).toBeTruthy();
    expect(screen.getByText('Nothing is saved until you review and confirm.')).toBeTruthy();
    expect(rows()).toEqual([
      'Respiratory rate: 22 breaths/min',
      'Oxygen saturation: 93 %',
      'Oxygen: Not heard yet',
      'Heart rate: 112 beats/min',
      'Blood pressure: 110/70 mmHg',
      'Temperature: 38.4 °C',
      'Level of consciousness: Alert',
    ]);
    expect(screen.getByRole('heading', { name: /Read back.*6 of 7 heard/ })).toBeTruthy();
  });
  it('listens with a speech engine, highlighting values, and passes what was heard to Review', () => {
    const engine = new ScriptedSpeechEngine([{ interim: ['resp rate'], final: 'Resp rate twenty two' }, { final: 'sats ninety three on air' }], { endAfterScript: false });
    const onReview = vi.fn();
    render(
      <ClinicalLocaleProvider region="NZ">
        <DictatedObservationsCapture engine={engine} onReview={onReview} />
      </ClinicalLocaleProvider>,
    );
    const mic = screen.getByRole('button', { name: 'Start listening' });
    fireEvent.click(mic);
    expect(engine.lastStartOptions?.language).toBe('en-NZ');
    expect(screen.getByRole('button', { name: 'Stop listening' }).getAttribute('aria-pressed')).toBe('true');
    act(() => {
      engine.next();
      engine.next();
    });
    expect(Array.from(document.querySelectorAll('.cui-live-transcript__value')).map(m => m.textContent)).toEqual(['twenty two', 'ninety three', 'on air']);
    expect(rows()[2]).toBe('Oxygen: Room air');
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(onReview).toHaveBeenCalledTimes(1);
    const arg = onReview.mock.calls[0][0];
    expect(arg.transcript).toBe('Resp rate twenty two sats ninety three on air');
    expect(arg.values).toEqual({ respiratoryRate: '22', oxygenSaturation: '93', supplementalOxygen: 'air' });
    expect(engine.isListening).toBe(false);
  });
  it('works by touch when no engine is available', () => {
    const onTypeInstead = vi.fn();
    render(<DictatedObservationsCapture region="GB" onTypeInstead={onTypeInstead} />);
    expect(screen.getByRole('note').textContent).toContain('Voice input is not available');
    expect(screen.getByRole('button', { name: 'Start listening' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Type instead' }));
    expect(onTypeInstead).toHaveBeenCalled();
    // GB default chart (NEWS2)
    expect(rows()[0]).toBe('Respiration rate: Not heard yet');
  });
  it('shows ambiguous numbers as a question in the read-back', () => {
    render(<DictatedObservationsCapture definition={EWS_NZEWS} transcript="resp rate fifteen" parameterIds={['respiratoryRate']} />);
    expect(rows()).toEqual(['Respiratory rate: 15 or 50?']);
  });
  it('keeps the action targets touch sized in the thumb zone', () => {
    render(<DictatedObservationsCapture definition={EWS_NZEWS} transcript={C1} />);
    const bar = screen.getByRole('group', { name: 'Dictation actions' });
    expect(bar.className).toContain('cui-action-bar');
    within(bar).getAllByRole('button').forEach(b => {
      expect(b.className).toMatch(/cui-touch-button|cui-mic-button__button/);
    });
  });
});
