import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { ClinicalLocaleProvider, useClinicalLocale } from '../locale';

describe('Button', () => {
  it('renders an accessible icon-only button and fires onClick', () => {
    const onClick = vi.fn();
    render(<Button iconOnly icon="search" onClick={onClick}>Search</Button>);
    const b = screen.getByRole('button', { name: 'Search' });
    expect(b.getAttribute('type')).toBe('button');
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('ClinicalLocaleProvider', () => {
  function Probe({ r }: { r?: 'GB' | 'AU' | 'NZ' }) {
    const l = useClinicalLocale(r);
    return <span>{`${l.region} ${l.timeZone}`}</span>;
  }
  it('defaults to GB and lets a prop override the provider', () => {
    render(<><Probe /><ClinicalLocaleProvider region="NZ"><Probe /><Probe r="AU" /></ClinicalLocaleProvider></>);
    expect(screen.getByText('GB Europe/London')).toBeTruthy();
    expect(screen.getByText('NZ Pacific/Auckland')).toBeTruthy();
    expect(screen.getByText('AU Australia/Sydney')).toBeTruthy();
  });
});
