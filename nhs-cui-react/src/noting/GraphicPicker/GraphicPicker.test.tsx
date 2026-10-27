import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { GraphicPicker } from './GraphicPicker';
import { TEST_GRAPHIC } from '../AnnotatedGraphicCanvas/testGraphic';

afterEach(cleanup);
const hand = { ...TEST_GRAPHIC, id: 'hand-l', title: 'Left hand', keywords: ['hand', 'fingers'], images: [{ ...TEST_GRAPHIC.images[0], label: 'Palm' }] };

describe('GraphicPicker', () => {
  it('lists common graphics first with age and views (NwG-0024, NwG-0004)', () => {
    render(<GraphicPicker graphics={[TEST_GRAPHIC, hand]} commonIds={['body-adult']} onLoad={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Common diagrams' })).toBeTruthy();
    expect(screen.getByText('Adult, front view and back view')).toBeTruthy();
  });
  it('searches by keyword in a separate area and loads (NwG-0026/0027)', () => {
    const onLoad = vi.fn();
    render(<GraphicPicker graphics={[TEST_GRAPHIC, hand]} commonIds={['body-adult']} onLoad={onLoad} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search all diagrams' }), { target: { value: 'fing' } });
    fireEvent.click(screen.getByRole('button', { name: 'Load Left hand' }));
    expect(onLoad).toHaveBeenCalledWith(hand);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
    expect(screen.getByText(/No diagrams found/)).toBeTruthy();
  });
  it('marks the loaded graphic', () => {
    render(<GraphicPicker graphics={[TEST_GRAPHIC]} commonIds={['body-adult']} onLoad={vi.fn()} loadedId="body-adult" />);
    expect(screen.getByText('Loaded')).toBeTruthy();
  });
});
