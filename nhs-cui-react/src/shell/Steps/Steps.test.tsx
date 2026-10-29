import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Steps } from './Steps';

afterEach(cleanup);

const items = [{ id: 'who', label: 'Choose person' }, { id: 'details', label: 'Leave details' }, { id: 'check', label: 'Check and save' }];

describe('Steps', () => {
  it('marks done, current and not started in words', () => {
    render(<Steps label="Steps to record leave" items={items} current={1} />);
    const list = screen.getByRole('list', { name: 'Steps to record leave' });
    const li = list.querySelectorAll('li');
    expect(li[0].textContent).toContain('step 1 of 3, done');
    expect(li[1].getAttribute('aria-current')).toBe('step');
    expect(li[1].textContent).toContain('current step');
    expect(li[2].textContent).toContain('not started');
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('lets finished steps be chosen, never later ones, and shows errors in words', () => {
    const onStepSelect = vi.fn();
    render(<Steps label="S" items={[items[0], { ...items[1], error: true }, items[2]]} current={2} onStepSelect={onStepSelect} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[0]);
    expect(onStepSelect).toHaveBeenCalledWith(0, 'who');
    expect(buttons[1].textContent).toContain('needs attention');
  });
});
