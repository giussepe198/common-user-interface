import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { NotGivenSheet } from './NotGivenSheet';

afterEach(cleanup);

describe('NotGivenSheet', () => {
  it('AU: NIMC codes; W needs a reason before it records; commit names the code', () => {
    const onRecord = vi.fn();
    render(<NotGivenSheet open onClose={() => {}} onRecord={onRecord} region="AU" description="CHEN, Wei · paracetamol 1 g, due 13:00" closeOnBrowserBack={false} />);
    expect(screen.getByRole('dialog', { name: 'Why was it not given?' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'NIMC code' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Record' }));
    expect(onRecord).not.toHaveBeenCalled();
    expect(screen.getByText('Choose a nimc code.')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'W: Withheld' }));
    const commit = screen.getByRole('button', { name: 'Record W: Withheld' });
    fireEvent.click(commit);
    expect(onRecord).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a reason. A reason is required for W: Withheld.')).toBeTruthy();
    fireEvent.change(screen.getByRole('textbox', { name: /Reason/ }), { target: { value: 'Temperature 36.9' } });
    fireEvent.click(commit);
    expect(onRecord).toHaveBeenCalledWith({ code: 'W', reason: 'Temperature 36.9', prompts: {} }, expect.objectContaining({ code: 'W', status: 'withheld' }));
  });
  it('R prompts "Prescriber notified"; it can be required', () => {
    const onRecord = vi.fn();
    render(<NotGivenSheet open onClose={() => {}} onRecord={onRecord} region="AU" requirePrescriberPrompt closeOnBrowserBack={false} />);
    fireEvent.click(screen.getByRole('radio', { name: 'R: Refused' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record R: Refused' }));
    expect(onRecord).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: /Prescriber notified/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Record R: Refused' }));
    expect(onRecord).toHaveBeenCalledTimes(1);
  });
  it('NZ uses NMC codes; GB shows meanings without code letters', () => {
    render(<NotGivenSheet open onClose={() => {}} onRecord={() => {}} region="NZ" closeOnBrowserBack={false} />);
    expect(screen.getByRole('group', { name: 'NMC code' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /^RV: / })).toBeTruthy();
    cleanup();
    render(<NotGivenSheet open onClose={() => {}} onRecord={() => {}} region="GB" closeOnBrowserBack={false} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Patient refused' }));
    expect(screen.getByRole('button', { name: 'Record Patient refused' })).toBeTruthy();
  });
  it('passes initialFocusRef, autoFocus and container through', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(<NotGivenSheet open onClose={() => {}} onRecord={() => {}} region="AU" container={host} autoFocus={false} closeOnBrowserBack={false} />);
    expect(host.contains(screen.getByRole('dialog', { name: 'Why was it not given?' }))).toBe(true);
    expect(document.activeElement).toBe(document.body);
    cleanup();
    function WithRef() {
      const ref = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <button type="button" ref={ref}>Outside</button>
          <NotGivenSheet open onClose={() => {}} onRecord={() => {}} region="AU" portal={false} initialFocusRef={ref} closeOnBrowserBack={false} />
        </>
      );
    }
    render(<WithRef />);
    expect(document.activeElement?.textContent).toBe('Outside');
    host.remove();
  });
});
