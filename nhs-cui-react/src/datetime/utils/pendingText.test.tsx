import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DateInput } from '../DateInput/DateInput';
import { TimeInput } from '../TimeInput/TimeInput';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** A host that draws its field in one frame or another by width, as a drawer that becomes a bottom sheet does. */
function Host({ narrow, children }: { narrow: boolean; children: React.ReactNode }) {
  return narrow ? <section>{children}</section> : <div>{children}</div>;
}

describe('uncommitted date and time text', () => {
  it('stays through a re-render with new props before it is committed', () => {
    const { rerender } = render(<DateInput id="d1" label="Date" />);
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '05-Dec-2031' } });
    rerender(<DateInput id="d1" label="Date" className="wide" />);
    expect((screen.getByLabelText('Date') as HTMLInputElement).value).toBe('05-Dec-2031');
  });

  it('stays when the host draws the control in another frame (a remount) before it is committed', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Host narrow={false}><DateInput id="d2" label="Date" onChange={onChange} /></Host>);
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '05-Dec-2031' } });
    rerender(<Host narrow><DateInput id="d2" label="Date" onChange={onChange} /></Host>);
    const input = screen.getByLabelText('Date') as HTMLInputElement;
    expect(input.value).toBe('05-Dec-2031');
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith({ kind: 'full', year: 2031, month: 12, day: 5 });
  });

  it('keeps a typed time through a remount, and commits it on leaving the field', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Host narrow={false}><TimeInput id="t1" label="Time" onChange={onChange} /></Host>);
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '15:30' } });
    rerender(<Host narrow><TimeInput id="t1" label="Time" onChange={onChange} /></Host>);
    const input = screen.getByLabelText('Time') as HTMLInputElement;
    expect(input.value).toBe('15:30');
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith({ hours: 15, minutes: 30 });
  });

  it('never hands old text to a control mounted later with the same id', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const first = render(<DateInput id="d3" label="Date" />);
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '05-Dec-2031' } });
    first.unmount();
    vi.setSystemTime(Date.now() + 60_000);
    render(<DateInput id="d3" label="Date" />);
    expect((screen.getByLabelText('Date') as HTMLInputElement).value).toBe('');
  });

  it('follows a new committed value from the host', () => {
    const { rerender } = render(<DateInput id="d4" label="Date" value={{ kind: 'full', year: 2026, month: 10, day: 30 }} />);
    expect((screen.getByLabelText('Date') as HTMLInputElement).value).toBe('30-Oct-2026');
    rerender(<DateInput id="d4" label="Date" value={{ kind: 'full', year: 2026, month: 11, day: 2 }} />);
    expect((screen.getByLabelText('Date') as HTMLInputElement).value).toBe('02-Nov-2026');
  });
});
