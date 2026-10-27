import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { FilterDialog } from './FilterDialog';
import type { ListAttribute } from '../utils/listTypes';

afterEach(cleanup);

const attrs: ListAttribute[] = [
  { id: 'news', label: 'NEWS2 score', dataType: 'integer' },
  { id: 'temp', label: 'Temperature', dataType: 'real', unit: '°C' },
  { id: 'admitted', label: 'Admitted', dataType: 'date' },
  { id: 'seen', label: 'Last seen', dataType: 'dateTime' },
];
const enter = (el: HTMLElement, text: string) => {
  fireEvent.change(el, { target: { value: text } });
  fireEvent.keyDown(el, { key: 'Enter' });
};

describe('FilterDialog', () => {
  it('shows the lead text and only Cancel enabled at first (FSG-0009, FSG-0017)', () => {
    render(<FilterDialog tableName="patient list" rowNoun="patients" attributes={attrs} onOk={() => {}} onCancel={() => {}} modal={false} />);
    expect(screen.getByText('Filter to show rows of patients where:')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement).disabled).toBe(false);
  });
  it('offers no "equal to" for real numbers (FSG-0032) and builds a criterion', () => {
    const onOk = vi.fn();
    render(<FilterDialog tableName="patient list" rowNoun="patients" attributes={attrs} onOk={onOk} onCancel={() => {}} modal={false} />);
    fireEvent.change(screen.getByLabelText('Criterion 1 attribute'), { target: { value: 'temp' } });
    const ops = Array.from((screen.getByLabelText('Criterion 1 operator') as HTMLSelectElement).options).map(o => o.textContent);
    expect(ops).toEqual(['Select an operator', 'less than', 'greater than']);
    fireEvent.change(screen.getByLabelText('Criterion 1 operator'), { target: { value: 'greaterThan' } });
    fireEvent.change(screen.getByLabelText('Criterion 1 value'), { target: { value: '38' } });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onOk).toHaveBeenCalledWith({ combine: 'or', criteria: [{ attributeId: 'temp', operator: 'greaterThan', value: '38', value2: undefined }] });
  });
  it('uses the CUI DateInput for dates, stored as YYYY-MM-DD', () => {
    const onOk = vi.fn();
    render(<FilterDialog tableName="patient list" rowNoun="patients" attributes={attrs} onOk={onOk} onCancel={() => {}} modal={false} />);
    fireEvent.change(screen.getByLabelText('Criterion 1 attribute'), { target: { value: 'admitted' } });
    fireEvent.change(screen.getByLabelText('Criterion 1 operator'), { target: { value: 'onOrAfter' } });
    const input = screen.getByLabelText('Criterion 1 value') as HTMLInputElement;
    expect(input.type).toBe('text');
    enter(input, '05-Apr-2026');
    expect(input.value).toBe('05-Apr-2026');
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onOk.mock.calls[0][0].criteria[0].value).toBe('2026-04-05');
  });
  it('combines date and time for date-times', () => {
    const onOk = vi.fn();
    render(<FilterDialog tableName="patient list" rowNoun="patients" attributes={attrs} onOk={onOk} onCancel={() => {}} modal={false} />);
    fireEvent.change(screen.getByLabelText('Criterion 1 attribute'), { target: { value: 'seen' } });
    fireEvent.change(screen.getByLabelText('Criterion 1 operator'), { target: { value: 'after' } });
    enter(screen.getByLabelText('Criterion 1 value date'), '27-Oct-2026');
    enter(screen.getByLabelText('Criterion 1 value time'), '14:30');
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onOk.mock.calls[0][0].criteria[0].value).toBe('2026-10-27T14:30');
  });
  it('shows OR first and default once there are two lines (FSG-0026/0027); Escape cancels with the original', () => {
    const onCancel = vi.fn();
    const initial = { combine: 'or' as const, criteria: [{ attributeId: 'news', operator: 'greaterThan' as const, value: '4' }] };
    render(<FilterDialog tableName="patient list" rowNoun="patients" attributes={attrs} initial={initial} onOk={() => {}} onCancel={onCancel} modal={false} />);
    expect(screen.queryByRole('radio')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios[0].parentElement?.textContent).toMatch(/Any of which are true/);
    expect(radios[0].checked).toBe(true);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledWith(initial);
  });
});
