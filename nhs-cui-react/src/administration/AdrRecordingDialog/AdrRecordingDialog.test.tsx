import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AdrRecordingDialog } from './AdrRecordingDialog';
import { ClinicalLocaleProvider } from '../../core/locale';
import type { AdrEntry } from '../utils/adr';

afterEach(cleanup);

const pen = { code: '764146007', term: 'Penicillin', isClass: true };
const rash = { code: '271807003', term: 'Rash' };
const existing: AdrEntry[] = [{ id: 'x1', agent: pen, reactions: [{ concept: rash }] }];
const sources = ['Patient testimony', 'Clinician witnessed reaction'];
const search = (text: string, field: 'agent' | 'reaction') =>
  (field === 'agent' ? [pen, { code: '387458008', term: 'Aspirin' }] : [rash]).filter(c => c.term.toLowerCase().startsWith(text.toLowerCase()));

describe('AdrRecordingDialog', () => {
  it('only the agent is available at first; Finish is disabled (RAD-0040, 0090)', () => {
    render(<AdrRecordingDialog existingEntries={existing} sources={sources} onFinish={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Add new drug reaction' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Finish' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText('Source of information') as HTMLSelectElement).disabled).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole('combobox', { name: 'Causative agent (drug or substance)' })); // RAD-0120
  });

  it('searches with the keyboard and finishes with the expression (RAD-0190)', async () => {
    const onFinish = vi.fn();
    render(<AdrRecordingDialog existingEntries={[]} sources={sources} searchConcepts={search} onFinish={onFinish} onCancel={vi.fn()} />);
    const input = screen.getByRole('combobox', { name: 'Causative agent (drug or substance)' });
    await act(async () => {
      fireEvent.change(input, { target: { value: 'asp' } });
    });
    fireEvent.keyDown(input, { key: 'Enter' });
    const finish = screen.getByRole('button', { name: 'Finish' }) as HTMLButtonElement;
    expect(finish.disabled).toBe(false);
    fireEvent.change(screen.getByLabelText('Source of information'), { target: { value: 'Clinician witnessed reaction' } });
    expect((screen.getByLabelText('Clinician witnessed reaction') as HTMLInputElement).checked).toBe(true); // RAD-0440.2
    fireEvent.click(finish);
    expect(onFinish.mock.calls[0][0]).toMatchObject({ agent: { term: 'Aspirin' }, expression: '419511003 : 246075003 = 387458008' });
    expect(onFinish.mock.calls[0][0].reactionType).toBeUndefined();
  });

  it('warns on a duplicate agent and blocks Finish (RAD-0610)', () => {
    render(<AdrRecordingDialog existingEntries={existing} sources={sources} initial={{ agent: pen }} onFinish={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('alert').textContent).toContain('already in the adverse drug reaction summary');
    expect((screen.getByRole('button', { name: 'Finish' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('edit mode: Back becomes Cancel after a change, removal is confirmed (RAD-0750, 0860)', () => {
    const onRemove = vi.fn();
    render(<AdrRecordingDialog mode="edit" entryId="x1" initial={existing[0]} existingEntries={existing} sources={sources} onFinish={vi.fn()} onCancel={vi.fn()} onRemove={onRemove} />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Clinician witnessed reaction'));
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove from list' }));
    expect(screen.getByRole('heading', { name: 'Remove Penicillin (class) from the adverse drug reaction summary?' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Reason for removal'), { target: { value: 'Tolerated amoxicillin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Remove from list' }));
    expect(onRemove).toHaveBeenCalledWith('Tolerated amoxicillin');
  });

  it('Esc cancels', () => {
    const onCancel = vi.fn();
    render(<AdrRecordingDialog existingEntries={[]} sources={sources} onFinish={vi.fn()} onCancel={onCancel} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('AU: NIMC wording, type and date are recorded (AU-AL-03)', () => {
    const onFinish = vi.fn();
    render(
      <ClinicalLocaleProvider region="AU">
        <AdrRecordingDialog existingEntries={existing} sources={sources} initial={{ agent: { term: 'Morphine', code: '373529000' } }} onFinish={onFinish} onCancel={vi.fn()} />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Add allergy or adverse drug reaction' })).toBeTruthy();
    expect(screen.getByText('Medicine (or other)')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Existing allergies and adverse drug reactions' })).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Intolerance'));
    fireEvent.change(screen.getByLabelText('Date of reaction'), { target: { value: '2019' } });
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onFinish.mock.calls[0][0]).toMatchObject({ reactionType: 'intolerance', reactionDate: '2019' });
    expect(onFinish.mock.calls[0][0].newThisAdmission).toBeUndefined();
  });

  it('NZ: allergy guidance and "New this admission" (G11 9.2)', () => {
    const onFinish = vi.fn();
    render(<AdrRecordingDialog region="NZ" existingEntries={[]} sources={sources} initial={{ agent: { term: 'Peanut' } }} onFinish={onFinish} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Add allergy or adverse reaction' })).toBeTruthy();
    expect(screen.getByText(/documented as an allergy/)).toBeTruthy();
    expect(screen.queryByLabelText('Date of reaction')).toBeNull();
    fireEvent.click(screen.getByLabelText('New this admission'));
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onFinish.mock.calls[0][0]).toMatchObject({ newThisAdmission: true, expression: null });
  });
});
