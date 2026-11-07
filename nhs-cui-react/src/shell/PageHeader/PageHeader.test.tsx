import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PageHeader } from './PageHeader';

afterEach(cleanup);

describe('PageHeader', () => {
  it('renders the h1 title with subtitle, meta and actions', () => {
    render(<PageHeader title="Caseload" subtitle="Acute team" meta={<span>42 people</span>} actions={<button type="button">Add person</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Caseload' })).toBeTruthy();
    expect(screen.getByText('Acute team')).toBeTruthy();
    expect(screen.getByText('42 people')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add person' }).closest('.cui-page-header__actions')).toBeTruthy();
    vi.fn();
    fireEvent.click(document.body);
  });
  it('says the save state before the commands, as a polite status', () => {
    render(<PageHeader title="Update patient details" status="Unsaved changes" actions={<button type="button">Save details</button>} />);
    const status = screen.getByRole('status');
    expect(status.textContent).toBe('Unsaved changes');
    const actions = status.closest('.cui-page-header__actions');
    expect(actions).toBeTruthy();
    expect(actions!.firstElementChild).toBe(status);
  });
  it('keeps an empty status region in place', () => {
    render(<PageHeader title="Edit" status="" />);
    expect(screen.getByRole('status').textContent).toBe('');
  });
  it('can use a level 2 heading', () => {
    render(<PageHeader title="Section" headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Section' })).toBeTruthy();
  });
});
