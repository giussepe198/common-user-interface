import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { HierarchyBrowserDialog, type HierarchyConcept } from './HierarchyBrowserDialog';

afterEach(cleanup);

const C: Record<string, HierarchyConcept> = {
  asthma: { id: 'asthma', term: 'Asthma' },
  lung: { id: 'lung', term: 'Disorder of lung' },
  airway: { id: 'airway', term: 'Airway disease' },
  copd: { id: 'copd', term: 'Chronic obstructive lung disease' },
  aa: { id: 'aa', term: 'Allergic asthma' },
  ea: { id: 'ea', term: 'Exercise-induced asthma' },
};
const parents = (id: string) => (id === 'asthma' ? [C.lung, C.airway] : id === 'aa' ? [C.asthma] : []);
const children = (id: string) => (id === 'asthma' ? [C.ea, C.aa] : []);
const siblings = (id: string) => (id === 'asthma' ? [C.copd, C.asthma] : []);

describe('HierarchyBrowserDialog', () => {
  it('lists less specific, similar and more specific concepts alphabetically (Matching 2.5.1)', async () => {
    render(<HierarchyBrowserDialog concept={C.asthma} getParents={parents} getChildren={children} getSiblings={siblings} onOk={vi.fn()} onCancel={vi.fn()} />);
    await screen.findByRole('button', { name: 'Allergic asthma' });
    const more = screen.getByText('More specific concepts').closest('section')!;
    const items = within(more).getAllByRole('button').map((b) => b.textContent);
    expect(items).toEqual(['Allergic asthma', 'Exercise-induced asthma']);
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
  });
  it('re-centres on click, goes Back, and chooses with OK or double-click', async () => {
    const onOk = vi.fn();
    render(<HierarchyBrowserDialog concept={C.asthma} getParents={parents} getChildren={children} getSiblings={siblings} onOk={onOk} onCancel={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Allergic asthma' }));
    expect(document.querySelector('output')?.textContent).toBe('Allergic asthma');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(document.querySelector('output')?.textContent).toBe('Asthma');
    fireEvent.doubleClick(await screen.findByRole('button', { name: 'Exercise-induced asthma' }));
    expect(onOk).toHaveBeenCalledWith(C.ea);
  });
  it('Escape cancels; browsing is not offered for negated concepts', () => {
    const onCancel = vi.fn();
    render(<HierarchyBrowserDialog negated concept={C.asthma} getParents={parents} getChildren={children} getSiblings={siblings} onOk={vi.fn()} onCancel={onCancel} />);
    expect(screen.getByText(/cannot be browsed/)).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
  it('NZ sorts macron vowels with their base letter', async () => {
    const kids = () => [{ id: '1', term: 'Ōtaki case' }, { id: '2', term: 'Nelson case' }, { id: '3', term: 'Ahuriri case' }];
    render(<HierarchyBrowserDialog region="NZ" concept={C.asthma} getParents={() => []} getChildren={kids} getSiblings={() => []} onOk={vi.fn()} onCancel={vi.fn()} />);
    await screen.findByRole('button', { name: 'Ahuriri case' });
    const sec = screen.getByText('More specific concepts').closest('section')!;
    expect(within(sec).getAllByRole('button').map((b) => b.textContent)).toEqual(['Ahuriri case', 'Nelson case', 'Ōtaki case']);
  });

  it('refines defining attributes on tabs and hides "Browse related concepts" once refined (G8 2.5.1)', async () => {
    const ff = { id: 'ff', term: 'Fracture of forearm' };
    const forearm = { id: 'fa', term: 'Bone structure of forearm' };
    const radius = { id: 'r', term: 'Bone structure of radius' };
    const ulna = { id: 'u', term: 'Bone structure of ulna' };
    const attrs = () => [
      { id: 'morph', label: 'Associated morphology', lead: true, value: { id: 'f', term: 'Fracture' } },
      { id: 'site', label: 'Finding site', phrase: 'site of', value: forearm, canSelect: (c: HierarchyConcept) => c.id !== 'u' },
    ];
    const kids = (id: string) => (id === 'fa' ? [radius, ulna] : []);
    const onOk = vi.fn();
    render(<HierarchyBrowserDialog concept={ff} getParents={() => []} getChildren={kids} getSiblings={() => []} getAttributes={attrs} onOk={onOk} onCancel={vi.fn()} />);
    const related = await screen.findByRole('tab', { name: 'Browse related concepts' });
    expect(related.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(related, { key: 'End' });
    const site = screen.getByRole('tab', { name: /Finding site/ });
    expect(site.getAttribute('aria-selected')).toBe('true');
    fireEvent.click(await screen.findByRole('button', { name: 'Bone structure of radius' }));
    expect(screen.queryByRole('tab', { name: 'Browse related concepts' })).toBeNull();
    expect(screen.getByText('Fracture, site of Bone structure of radius')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onOk).toHaveBeenCalledWith(ff, { attributes: [{ attributeId: 'site', label: 'Finding site', value: radius }], text: 'Fracture, site of Bone structure of radius' });
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('tab', { name: 'Browse related concepts' })).toBeTruthy();
    // Values outside the sanctioned set cannot be chosen.
    fireEvent.click(await screen.findByRole('button', { name: 'Bone structure of ulna' }));
    expect((screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
