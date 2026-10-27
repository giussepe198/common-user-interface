import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { HeaderCellFilter } from './HeaderCellFilter';
import type { ListAttribute } from '../utils/listTypes';

afterEach(cleanup);

const news: ListAttribute = { id: 'news', label: 'NEWS2 score', dataType: 'integer' };

describe('HeaderCellFilter', () => {
  it('focuses the operator, offers only valid operators plus Custom (FSG-0032, 0037)', () => {
    const onCustom = vi.fn();
    render(<HeaderCellFilter attribute={news} onApply={() => {}} onCancel={() => {}} onCustom={onCustom} />);
    const op = screen.getByLabelText('NEWS2 score operator') as HTMLSelectElement;
    expect(document.activeElement).toBe(op);
    expect(Array.from(op.options).map(o => o.textContent)).toContain('Custom…');
    fireEvent.change(op, { target: { value: '__custom' } });
    expect(onCustom).toHaveBeenCalled();
  });
  it('applies a single criterion only when complete', () => {
    const onApply = vi.fn();
    render(<HeaderCellFilter attribute={news} onApply={onApply} onCancel={() => {}} />);
    const apply = screen.getByRole('button', { name: 'Apply' }) as HTMLButtonElement;
    expect(apply.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('NEWS2 score operator'), { target: { value: 'greaterThanOrEqual' } });
    fireEvent.change(screen.getByLabelText('NEWS2 score value'), { target: { value: '5' } });
    fireEvent.click(apply);
    expect(onApply).toHaveBeenCalledWith({ attributeId: 'news', operator: 'greaterThanOrEqual', value: '5', value2: undefined });
  });
  it('closes on Escape and offers Remove filter when one exists', () => {
    const onCancel = vi.fn();
    const onRemove = vi.fn();
    render(<HeaderCellFilter attribute={news} initial={{ attributeId: 'news', operator: 'lessThan', value: '3' }} replacesFilter onApply={() => {}} onRemove={onRemove} onCancel={onCancel} />);
    expect(screen.getByText('Applying this replaces the current filter.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove filter' }));
    expect(onRemove).toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
});
