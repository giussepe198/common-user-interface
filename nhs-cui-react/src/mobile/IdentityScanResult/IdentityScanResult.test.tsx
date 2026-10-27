import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { IdentityScanResult } from './IdentityScanResult';

afterEach(cleanup);

describe('IdentityScanResult', () => {
  it('a match is a polite status with the scan time', () => {
    render(<IdentityScanResult status="match" scannedAt={new Date(2026, 9, 27, 14, 6)} matched={['URN']} region="AU" />);
    expect(screen.getByRole('status').textContent).toContain('Wristband scanned 14:06. Identity matches.');
  });
  it('a mismatch is an alert listing differences and the band patient', () => {
    const onSwitch = vi.fn();
    render(
      <IdentityScanResult
        status="mismatch"
        region="AU"
        differences={['URN differs']}
        scannedPatient={{ name: { familyName: 'Smith', givenName: 'John' }, identifiers: [{ type: 'mrn', value: '0398812' }] }}
        onScan={() => {}}
        onSwitchToScanned={onSwitch}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Wristband does not match this patient.');
    expect(alert.textContent).toContain('URN differs');
    expect(alert.textContent).toContain('SMITH, John');
    expect(screen.getByRole('button', { name: 'Scan again' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open SMITH, John' }));
    expect(onSwitch).toHaveBeenCalled();
  });
  it('not scanned offers a 48 px scan button', () => {
    const onScan = vi.fn();
    render(<IdentityScanResult status="notScanned" onScan={onScan} />);
    const b = screen.getByRole('button', { name: 'Scan wristband' });
    expect(b.className).toContain('cui-touch-button--h48');
    fireEvent.click(b);
    expect(onScan).toHaveBeenCalled();
  });
});
