import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { EWS_NZEWS } from '../../lists';
import { parseSpokenObservations } from '../utils/spokenObservations';
import { LiveTranscript } from './LiveTranscript';

afterEach(cleanup);

describe('LiveTranscript', () => {
  it('highlights recognised values and marks words to check', () => {
    const text = 'Resp rate fifteen, sats ninety three';
    const r = parseSpokenObservations(text, EWS_NZEWS);
    const { container } = render(<LiveTranscript text={text} highlights={r.highlights} />);
    expect(screen.getByRole('heading', { name: 'What I heard' })).toBeTruthy();
    expect(Array.from(container.querySelectorAll('.cui-live-transcript__value')).map(m => m.textContent)).toEqual(['ninety three']);
    const check = container.querySelector('.cui-live-transcript__check');
    expect(check?.textContent).toBe('fifteen (check)');
    expect(container.querySelector('p')?.textContent).toBe('Resp rate fifteen (check), sats ninety three');
  });
  it('shows interim text muted and hidden from the live region', () => {
    const { container } = render(<LiveTranscript text="sats ninety three" interim="BP one ten" />);
    const interim = container.querySelector('.cui-live-transcript__interim');
    expect(interim?.textContent).toBe(' BP one ten');
    expect(interim?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.cui-live-transcript__more')).toBeTruthy();
  });
  it('announces only newly added final text', () => {
    const { rerender } = render(<LiveTranscript text="sats ninety three" />);
    const live = screen.getByRole('status');
    expect(live.textContent).toBe('');
    rerender(<LiveTranscript text="sats ninety three BP one ten on seventy" />);
    expect(live.textContent).toBe('BP one ten on seventy');
  });
  it('says when nothing has been heard and keeps macrons', () => {
    render(<LiveTranscript text="" />);
    expect(screen.getByText('Nothing heard yet.')).toBeTruthy();
    cleanup();
    const { container } = render(<LiveTranscript text="Mereana is at Ōtautahi ward" />);
    expect(container.querySelector('p')?.textContent).toBe('Mereana is at Ōtautahi ward');
  });
});
