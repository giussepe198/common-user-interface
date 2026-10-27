import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AdrSummaryList } from './AdrSummaryList';
import { ClinicalLocaleProvider } from '../../core/locale';
import type { AdrEntry } from '../utils/adr';

afterEach(cleanup);

const NOW = new Date(2026, 4, 27, 10, 20);
const entries: AdrEntry[] = [
  { id: '1', agent: { code: '764146007', term: 'Penicillin', isClass: true }, reactions: [{ concept: { code: '271807003', term: 'Rash' } }], reactionType: 'allergy', reactionDate: '2019', newThisAdmission: true },
  { id: '2', agent: { term: 'Elastoplast' }, reactions: [], removed: true, removedAt: new Date(2026, 3, 1, 9, 0), removedBy: 'Dr A', removedReason: 'Entered in error' },
];

describe('AdrSummaryList', () => {
  it('never shows an empty list as "no known": shows Not recorded as a warning (RAD 5, AU-AL-01)', () => {
    const { container } = render(<AdrSummaryList entries={[]} currentUser="A Nurse" now={NOW} />);
    expect(screen.getByRole('heading', { name: 'Adverse drug reaction summary' })).toBeTruthy();
    expect(container.querySelector('.cui-adr-sum__status--not-recorded')!.textContent).toContain('Adverse drug reaction status not recorded');
    expect(container.textContent).not.toContain('No known adverse drug reaction risks');
  });

  it('GB "No known adverse drug reaction risks" flow: phrase, author and date, Close becomes Finish, button disabled (RAD-0760 to 0820)', () => {
    const onRecordStatus = vi.fn();
    render(<AdrSummaryList entries={[]} currentUser="A Nurse" now={NOW} sources={['Patient testimony']} onRecordStatus={onRecordStatus} onAdd={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Unknown' })).toBeNull(); // GB has no unknown state
    const nk = screen.getByRole('button', { name: 'No known adverse drug reaction risks' });
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
    fireEvent.click(nk);
    expect((nk as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    expect(screen.getByText('Recorded 27-May-2026 10:20 by A Nurse')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Source of information'), { target: { value: 'Patient testimony' } });
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onRecordStatus).toHaveBeenCalledWith({ status: 'noKnown', recordedAt: NOW, recordedBy: 'A Nurse', source: 'Patient testimony', details: undefined });
  });

  it('shows a recorded no known status with who and when', () => {
    render(<AdrSummaryList entries={[]} statusRecord={{ status: 'noKnown', recordedAt: NOW, recordedBy: 'A Nurse' }} currentUser="B" />);
    expect(screen.getByText('No known adverse drug reaction risks')).toBeTruthy();
    expect(screen.getByText('Recorded 27-May-2026 10:20 by A Nurse')).toBeTruthy();
  });

  it('lists entries with New and Updated highlights, opens details (RAD-0630)', () => {
    const onOpenDetails = vi.fn();
    render(<AdrSummaryList entries={entries} highlight={{ '1': 'New' }} currentUser="A" onOpenDetails={onOpenDetails} onRecordStatus={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /No known/ })).toBeNull(); // entries recorded
    const item = screen.getByRole('button', { name: /Penicillin \(class\)/ });
    expect(item.parentElement!.textContent).toContain('New');
    fireEvent.click(item);
    expect(onOpenDetails).toHaveBeenCalledWith('1');
  });

  it('displays deactivated summaries on request (RAD-0710)', () => {
    render(<AdrSummaryList entries={entries} currentUser="A" />);
    expect(screen.queryByText('Deactivated summaries')).toBeNull();
    fireEvent.click(screen.getByLabelText('Display deactivated summaries (1)'));
    expect(screen.getByRole('heading', { name: 'Deactivated summaries' })).toBeTruthy();
    expect(screen.getByText(/Removed 01-Apr-2026 09:00 by Dr A\. Reason: Entered in error/)).toBeTruthy();
  });

  it('AU: "Nil known" and "Unknown", type and date on entries (AU-AL-01, 03)', () => {
    const onRecordStatus = vi.fn();
    const { unmount } = render(
      <ClinicalLocaleProvider region="AU">
        <AdrSummaryList entries={[]} currentUser="A Nurse" now={NOW} onRecordStatus={onRecordStatus} />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Allergies and adverse drug reactions (ADR)' })).toBeTruthy();
    expect(screen.getByText('Not recorded')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Unknown' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onRecordStatus.mock.calls[0][0].status).toBe('unknown');
    unmount();
    render(<AdrSummaryList region="AU" entries={entries} currentUser="A" />);
    expect(screen.getByText('Allergy, 2019')).toBeTruthy();
    expect(screen.queryByText('New this admission')).toBeNull();
  });

  it('NZ: three states; Unknown needs a reason; "New this admission" tag (G11 9.2)', () => {
    const onRecordStatus = vi.fn();
    const { unmount } = render(<AdrSummaryList region="NZ" entries={[]} currentUser="A Nurse" now={NOW} onRecordStatus={onRecordStatus} />);
    expect(screen.getByRole('heading', { name: 'Allergies & Adverse Reactions' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'No known allergies or adverse reactions' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Unknown' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onRecordStatus).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('Enter why the status is unknown');
    fireEvent.change(screen.getByLabelText('Why the status is unknown (required)'), { target: { value: 'Unconscious, no records' } });
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onRecordStatus.mock.calls[0][0]).toMatchObject({ status: 'unknown', details: 'Unconscious, no records' });
    unmount();
    render(<AdrSummaryList region="NZ" entries={entries} currentUser="A" />);
    expect(screen.getByText('New this admission')).toBeTruthy();
  });

  it('Cancel abandons a status being recorded', () => {
    render(<AdrSummaryList entries={[]} currentUser="A" onRecordStatus={vi.fn()} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'No known adverse drug reaction risks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });
});
