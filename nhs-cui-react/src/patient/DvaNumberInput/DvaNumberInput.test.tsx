import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DvaNumberInput } from './DvaNumberInput';

afterEach(cleanup);

describe('DvaNumberInput', () => {
  it('upper case without spaces as typed (G10 1.4)', () => {
    const onChange = vi.fn();
    render(<DvaNumberInput onChange={onChange} />);
    const box = screen.getByLabelText('DVA file number') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'nbur 9080' } });
    expect(box.value).toBe('NBUR9080');
    expect(onChange).toHaveBeenLastCalledWith('NBUR9080');
  });
  it('format problems are warnings, not errors (AU-X-03)', () => {
    render(<DvaNumberInput defaultValue="ABUR9080" />);
    fireEvent.blur(screen.getByLabelText('DVA file number'));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText(/state letter/)).toBeTruthy();
  });
  it('card type recorded as text', () => {
    const onCard = vi.fn();
    render(<DvaNumberInput onCardTypeChange={onCard} />);
    fireEvent.change(screen.getByLabelText('Card type'), { target: { value: 'Gold' } });
    expect(onCard).toHaveBeenCalledWith('Gold');
  });
  it('required', () => {
    render(<DvaNumberInput required />);
    fireEvent.blur(screen.getByLabelText(/DVA file number/));
    expect(screen.getByRole('alert').textContent).toBe('Enter the DVA file number');
  });
});
