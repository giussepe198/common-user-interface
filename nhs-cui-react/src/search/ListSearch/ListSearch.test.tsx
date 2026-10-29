import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DataTable, type DataTableColumn } from '../../data/DataTable/DataTable';
import { PatientList, type PatientListColumn } from '../../lists/PatientList/PatientList';
import { ListSearch } from './ListSearch';

afterEach(cleanup);

interface Referral {
  id: string;
  person: string;
  team: string;
  status: string;
  received: string;
  code: string;
}
const teams = ['North adult team', 'South adult team', 'Māori health team', 'Youth team'];
const names = ['SMITH, John', 'SMYTHE, Jon', 'TAMIHANA, Aroha', "O'BRIEN, Catherine", 'JOHNSON, Smith', 'NGATA, Wiremu', 'PATEL, Priya', 'NGUYEN, Linh', 'BROWN, Ava'];
const rows: Referral[] = names.map((person, i) => ({ id: `r${i}`, person, team: teams[i % 4], status: i % 3 ? 'Waiting' : 'Overdue', received: `2026-0${(i % 9) + 1}-1${i}`, code: `RF-00${i}` }));
const columns: DataTableColumn<Referral>[] = [
  { id: 'person', title: 'Person', isRowKey: true, searchKind: 'name' },
  { id: 'team', title: 'Team' },
  { id: 'status', title: 'Status' },
  { id: 'received', title: 'Received', dataType: 'date' },
  { id: 'code', title: 'Reference', searchable: true, searchKind: 'identifier' },
];

const table = (extra: Partial<React.ComponentProps<typeof DataTable<Referral>>> = {}) =>
  render(<DataTable caption="Referrals" rowNoun="referrals" columns={columns} rows={rows} getRowKey={r => r.id} defaultVisibleColumnIds={['person', 'team', 'status', 'received']} {...extra} />);

const bodyRows = () => screen.getAllByRole('row').slice(1);
const type = (text: string) => fireEvent.change(screen.getByRole('searchbox', { name: 'Search referrals' }), { target: { value: text } });

describe('DataTable list search', () => {
  it('shows the search box once a list has 8 rows, and never when told not to', () => {
    table();
    expect(screen.getByRole('search', { name: 'Search referrals' })).toBeTruthy();
    cleanup();
    table({ rows: rows.slice(0, 3) });
    expect(screen.queryByRole('search')).toBeNull();
    cleanup();
    table({ search: false });
    expect(screen.queryByRole('search')).toBeNull();
  });

  it('matches words in any order, says how many match and highlights them', () => {
    table();
    type('jo smi');
    expect(screen.getByText(/of 9 referrals match/)).toBeTruthy();
    expect(bodyRows()[0].textContent).toContain('SMITH, John');
    expect(bodyRows()[0].querySelectorAll('mark').length).toBeGreaterThan(0);
  });

  it('finds a close spelling and a similar sound, marked and listed last', () => {
    table();
    type('kathryn');
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0].textContent).toContain('Sounds like "kathryn"');
    expect(screen.getByText(/Close matches are marked and come last/)).toBeTruthy();
  });

  it('searches a hidden column the list declares searchable, and limits a word to a field', () => {
    table();
    type('RF-003');
    expect(bodyRows()).toHaveLength(1);
    type('team:maori');
    expect(bodyRows()).toHaveLength(Math.ceil((9 - 2) / 4));
    expect(screen.getByRole('button', { name: 'Remove Team: maori' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Team: maori' }));
    expect(bodyRows()).toHaveLength(9);
  });

  it('when nothing matches, offers the closest queries and a way back', () => {
    const onChange: string[] = [];
    table({ onSearchQueryChange: q => onChange.push(q) });
    type('xamihanaqq');
    const box = screen.getByText(/No referrals match "xamihanaqq"/).closest('.cui-list-search__none') as HTMLElement;
    const suggestion = within(box).getByRole('button', { name: /Search for tamihana/ });
    act(() => suggestion.click());
    expect(onChange.at(-1)).toBe('tamihana');
    expect(bodyRows()).toHaveLength(1);
  });
});

describe('PatientList list search', () => {
  interface Row {
    id: string;
    family: string;
    given: string;
    preferred?: string;
    dob: string;
    mrn: string;
  }
  const people: Row[] = [
    ['SMITH', 'John', '1980-03-12', 'URN-000123'],
    ['SMYTHE', 'Jon', '1975-07-01', 'URN-000456'],
    ['TAMIHANA', 'Aroha', '1990-11-30', 'URN-000789'],
    ['BROWN', 'Ava', '1980-01-05', 'URN-001000'],
    ['PATEL', 'Priya', '1999-02-02', 'URN-001001'],
    ['NGATA', 'Wiremu', '1988-08-08', 'URN-001002'],
    ['NGUYEN', 'Linh', '1970-07-07', 'URN-001003'],
    ['GREEN', 'Ana', '1960-06-06', 'URN-001004'],
  ].map(([family, given, dob, mrn], i) => ({ id: `p${i}`, family: `${family}`, given, dob, mrn }));
  const cols: PatientListColumn<Row>[] = [{ id: 'person', title: 'Person', kind: 'patient' }];
  const list = () =>
    render(
      <PatientList<Row>
        title="Caseload"
        rowNoun="people"
        rowNounSingular="person"
        timestamp="2026-10-29T09:00:00Z"
        columns={cols}
        rows={people}
        getRowKey={r => r.id}
        getPatient={r => ({ familyName: r.family, givenName: r.given, dateOfBirth: r.dob, mrn: r.mrn })}
        region="AU"
      />,
    );

  it('finds a person by name in either order, by record number and by date of birth', () => {
    list();
    const box = screen.getByRole('searchbox', { name: 'Search caseload' });
    fireEvent.change(box, { target: { value: 'aroha tamihana' } });
    expect(screen.getByText(/1 of 8 people matches/)).toBeTruthy();
    // "John SMITH" also finds "Jon SMYTHE" as a close spelling, listed after the exact match.
    fireEvent.change(box, { target: { value: 'john smith' } });
    expect(screen.getByText(/2 of 8 people match/)).toBeTruthy();
    fireEvent.change(box, { target: { value: '000789' } });
    expect(screen.getByText(/1 of 8 people matches/)).toBeTruthy();
    fireEvent.change(box, { target: { value: 'born:1980' } });
    expect(screen.getByText(/2 of 8 people match/)).toBeTruthy();
    fireEvent.change(box, { target: { value: '12/3/80' } });
    expect(screen.getByText(/1 of 8 people matches/)).toBeTruthy();
  });

  it('keeps the query out of the address (component state only)', () => {
    list();
    const before = window.location.href;
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search caseload' }), { target: { value: 'smith' } });
    expect(window.location.href).toBe(before);
  });
});

describe('ListSearch', () => {
  it('inserts a scope word from "Search in"', () => {
    const seen: string[] = [];
    render(<ListSearch label="Search tasks" value="smi" onChange={q => seen.push(q)} scopes={[{ key: 'team', label: 'Team' }]} shown={1} total={4} rowNoun="tasks" />);
    fireEvent.click(screen.getByRole('button', { name: 'Search in' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Team/ }));
    expect(seen.at(-1)).toBe('smi team:');
  });
});
