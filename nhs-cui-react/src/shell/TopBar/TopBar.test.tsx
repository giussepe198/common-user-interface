import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TopBar } from './TopBar';

afterEach(cleanup);

describe('TopBar', () => {
  it('renders the banner landmark with slots in reading order', () => {
    render(<TopBar brand="Riverside Mental Health" context={<span>Acute team</span>} help={<button type="button">Help</button>} account={<button type="button">Ana Silva</button>} />);
    const banner = screen.getByRole('banner');
    expect(banner.textContent).toBe('Riverside Mental HealthAcute teamHelpAna Silva');
    vi.fn();
  });
  it('can render without a landmark and leaves out empty slots', () => {
    render(<TopBar as="div" brand="Org" />);
    expect(screen.queryByRole('banner')).toBeNull();
    expect(document.querySelector('.cui-top-bar__end')).toBeNull();
    fireEvent.click(document.body);
  });
  it('renders a compact brand beside the full one for phones', () => {
    render(<TopBar brand="Riverside Mental Health" brandCompact={<span role="img" aria-label="Riverside Mental Health">RM</span>} />);
    expect(document.querySelector('.cui-top-bar__brand--full')?.textContent).toBe('Riverside Mental Health');
    expect(document.querySelector('.cui-top-bar__brand--compact')?.textContent).toBe('RM');
  });
});
