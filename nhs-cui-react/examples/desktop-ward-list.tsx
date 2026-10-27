/**
 * Ward patient list and handover (desktop).
 *
 * Composition:
 * - PatientList owns the list header, identification cells, update marks, sublists, sort indicators and the
 *   FilterNotification. The example owns the state (filter, sort, grouping, marks) so the screen behaves like
 *   a real ward system: every change is a state update and the list re-renders from data.
 * - DataToolbar sits in the list's toolbar slot (Filter, Sort, Group by in that order, FSG-0001/0002).
 *   Filter opens FilterDialog; Sort opens SortDialog; header context menus filter in the header cell
 *   (HeaderCellFilter, via `headerFilter`) and "Custom…" falls back to the full dialog.
 * - HandoverTaskList sits below the list, not beside it, so the list keeps its full width and the patient
 *   record is never shown next to the list (PAL-1040/1050). HandshakeDialog records the transfer of
 *   responsibility for every item, or for a single patient from that patient's row.
 */
import React, { useMemo, useState } from 'react';
import {
  Button,
  DataToolbar,
  FilterDialog,
  HandoverTaskList,
  HandshakeDialog,
  PatientList,
  SortDialog,
  formatTime,
  patientListAttributes,
  toDate,
} from '@clinical-cui/react';
import type {
  ClinicalRegion,
  HandoverPatient,
  HandoverTask,
  HandshakeRecord,
  ListAttribute,
  ListFilterState,
  ListSortKey,
  PatientListColumn,
  PatientListPatient,
  PatientListUpdate,
} from '@clinical-cui/react';
import { ExampleShell, type ExampleMeta } from './shell/ExampleShell';
import { EXAMPLE_NOW } from './data/patients';
import { WARD_SETUP, buildHandover, type WardRow } from './data/desktop-ward-list';

export const meta: ExampleMeta = {
  title: 'Ward list and handover',
  description:
    'A nursing ward list filtered, sorted and grouped through DataToolbar, FilterDialog and header filters, with region identifiers, the similar-name warning, update marks and task sublists. Below it, the handover list and the handshake that transfers responsibility.',
  kind: 'desktop',
  regions: ['GB', 'AU', 'NZ'],
  components: [
    'PatientList', 'PatientIdentificationCell', 'DataToolbar', 'FilterNotification', 'FilterDialog', 'HeaderCellFilter',
    'SortDialog', 'SortIndicator', 'SubList', 'UpdateMarker', 'HandoverTaskList', 'HandshakeDialog',
  ],
};

/**
 * Similar names (PAL-0560/0570). Identical names are always caught by the list; this adds a simple sound-alike
 * test: same family name, and given names equal once diacritics and a silent "h" are ignored ("John" and "Jon",
 * "Kahu" and "Kāhu"). Supplying this replaces the AU/NZ default diacritic test, so it includes that rule too.
 * A real system would use its own phonetic matcher. The same test goes to PatientList and HandoverTaskList, so the
 * ward list and the handover read-back warn about the same pairs.
 */
const looseKey = (s: string | null | undefined) =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/(.)h/g, '$1').trim();
type Named = Pick<PatientListPatient, 'familyName' | 'givenName'>;
function similarNames(a: Named, b: Named): boolean {
  return looseKey(a.familyName) === looseKey(b.familyName) && looseKey(a.givenName) === looseKey(b.givenName);
}

function WardScreen({ region }: { region: ClinicalRegion }) {
  const setup = WARD_SETUP[region];

  // Columns: key identifiers first (bed, then patient), frozen at the left (PAL-0610/0620).
  // Bed is held as a number so "Bed 10" sorts after "Bed 9"; the cell shows the bed number only.
  const columns = useMemo<PatientListColumn<WardRow>[]>(
    () => [
      { id: 'bed', title: 'Bed', kind: 'location', dataType: 'integer', align: 'center', width: 64 },
      { id: 'patient', title: 'Patient', kind: 'patient', width: 260 },
      { id: 'ews', title: setup.ewsTitle, dataType: 'integer', align: 'right', width: 88 },
      { id: 'consultant', title: 'Consultant', dataType: 'unorderedSymbol', options: setup.consultants, width: 150 },
      { id: 'admitted', title: 'Admitted', dataType: 'date', width: 120 },
      { id: 'diagnosis', title: 'Working diagnosis', width: 320 },
      // Sublist: every task on its own sub-row, never "2 of 5" (PAL-0390..0410).
      { id: 'tasks', title: 'Outstanding tasks', sublist: r => r.tasks, getValue: r => r.tasks.length, width: 370 },
    ],
    [setup],
  );

  // Attributes for the filter and sort dialogs: the displayed columns in table order (FSG-0011, 0093), mapped by
  // patientListAttributes. With getPatient the patient column filters and sorts on the name as the list shows it.
  // The task sublist is not a single value, so it is left out.
  const attributes = useMemo<ListAttribute<WardRow>[]>(
    () => patientListAttributes(columns.filter(c => !c.sublist), { getPatient: r => r.patient, region }),
    [columns, region],
  );

  // Opening state: the team is looking at patients with any early warning score, grouped by consultant.
  const [filter, setFilter] = useState<ListFilterState | null>({
    criteria: [{ attributeId: 'ews', operator: 'greaterThanOrEqual', value: '1' }],
    combine: 'or',
  });
  const [sort, setSort] = useState<ListSortKey[]>([{ attributeId: 'bed', direction: 'asc' }]);
  const [groupBy, setGroupBy] = useState<string | null>('consultant');
  const [dialog, setDialog] = useState<'filter' | 'sort' | null>(null);

  // Update marks are per user (PAL-0970): this is the current nurse's own set. A newly admitted patient is marked
  // as a whole row (PAL-0940); a changed score marks one cell; a new task marks only that sublist entry (PAL-0900).
  const newest = setup.rows.filter(r => r.admitted === '2026-10-27' && r.diagnosis.startsWith('Urinary'))[0];
  const sickest = setup.rows.reduce((a, b) => ((b.ews ?? -1) > (a.ews ?? -1) ? b : a));
  const [updates, setUpdates] = useState<PatientListUpdate[]>(() => [
    { id: 'u1', rowKey: String(newest.bed) },
    { id: 'u2', rowKey: String(sickest.bed), columnId: 'ews' },
    { id: 'u3', rowKey: String(sickest.bed), columnId: 'tasks', sublistIndex: 0 },
  ]);

  // Handover state, derived once from the same rows so identities always match the list.
  const initialHandover = useMemo(() => buildHandover(region), [region]);
  const [hoPatients, setHoPatients] = useState<HandoverPatient[]>(initialHandover.patients);
  const [hoTasks, setHoTasks] = useState<HandoverTask[]>(initialHandover.tasks);
  const [hideCompleted, setHideCompleted] = useState(false);
  // null = closed; 'all' = every outstanding item; otherwise one patient id.
  const [handshakeFor, setHandshakeFor] = useState<string | null>(null);
  const [lastHandshake, setLastHandshake] = useState<HandshakeRecord | null>(null);

  const label = (p: HandoverPatient) => `${p.location}: ${(p.familyName ?? '').toUpperCase()}, ${p.givenName ?? ''}`;
  const handshakeItems =
    handshakeFor === 'all'
      ? hoPatients.filter(p => p.handoverState !== 'handedOver').map(p => ({ id: p.id, label: label(p) }))
      : hoPatients.filter(p => p.id === handshakeFor).map(p => ({ id: p.id, label: label(p) }));
  const toHandOver = hoPatients.filter(p => p.handoverState !== 'handedOver').length;

  const onHandshake = (rec: HandshakeRecord) => {
    setHandshakeFor(null);
    setLastHandshake(rec);
    // Only an accepted handover moves responsibility; a refusal is recorded but changes nothing (RID 87).
    if (rec.outcome === 'accepted') {
      setHoPatients(ps =>
        ps.map(p =>
          rec.itemIds.includes(p.id)
            ? { ...p, handoverState: 'handedOver', responsible: { name: rec.receiver, role: 'Registered nurse' }, updatedAt: rec.dateTime, updatedBy: rec.receiver }
            : p,
        ),
      );
    }
  };

  const section: React.CSSProperties = { display: 'grid', gap: 'var(--space-3)' };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <section aria-label="Ward list" style={section}>
        <PatientList<WardRow>
          title="Ward list"
          listFor={setup.listFor}
          locations={[setup.ward]}
          timestamp={EXAMPLE_NOW}
          timestampKind="lastUpdated"
          realTime={false}
          lastRefreshed={new Date(EXAMPLE_NOW.getTime() - 3 * 60000)}
          now={EXAMPLE_NOW}
          refreshIntervalLabel="every 5 minutes"
          onRefresh={() => undefined}
          columns={columns}
          rows={setup.rows}
          getRowKey={r => String(r.bed)}
          getPatient={r => r.patient}
          similarNames={similarNames}
          filter={filter}
          onFilterChange={setFilter}
          headerFilter
          sort={sort}
          onSortChange={setSort}
          groupBy={groupBy}
          onHeaderCommand={(cmd, columnId) => {
            // Header context menu (FSG-0004): sort by that column, group by it, or open the full filter dialog.
            if (cmd === 'filter') setDialog('filter');
            else if (cmd === 'sort') setSort([{ attributeId: columnId, direction: 'asc' }]);
            else setGroupBy(columnId);
          }}
          updates={updates}
          onUnmark={ids => setUpdates(u => u.filter(x => !ids.includes(x.id)))}
          maxHeight={780}
          toolbar={
            <DataToolbar
              label="Ward list tools"
              onFilter={() => setDialog('filter')}
              onSort={() => setDialog('sort')}
              groupOptions={[{ id: 'consultant', label: 'Consultant' }, { id: 'ews', label: setup.ewsTitle }, { id: 'admitted', label: 'Admitted' }]}
              groupBy={groupBy}
              onGroupByChange={setGroupBy}
              filterActive={!!filter}
              onRemoveAllFilters={() => setFilter(null)}
            />
          }
        />
      </section>

      <section aria-labelledby="handover-heading" style={section}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 'var(--space-4)', justifyContent: 'space-between' }}>
          <div>
            <h2 id="handover-heading" style={{ margin: 0, fontSize: 18, lineHeight: '24px' }}>Afternoon handover</h2>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--ink-muted)' }}>
              Giver {setup.giver} · Receiver {setup.receiver} · {toHandOver} of {hoPatients.length} patients still to hand over
            </p>
          </div>
          <Button variant="primary" icon="user" disabled={toHandOver === 0} onClick={() => setHandshakeFor('all')}>
            Record handover
          </Button>
        </div>

        {lastHandshake ? (
          // Outcome stated in words, with who and when (RID 20, 27). Refusals are as visible as acceptances.
          <p role="status" style={{ margin: 0, padding: 'var(--space-2) var(--space-3)', fontSize: 14, background: lastHandshake.outcome === 'accepted' ? 'var(--success-surface)' : 'var(--warning-surface)', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            Handover {lastHandshake.outcome === 'accepted' ? 'accepted' : 'refused'} by {lastHandshake.receiver} at {formatTime(toDate(lastHandshake.dateTime) ?? EXAMPLE_NOW)}, {lastHandshake.place}.
            {' '}{lastHandshake.itemIds.length} patient{lastHandshake.itemIds.length === 1 ? '' : 's'}.
            {lastHandshake.outcome === 'refused' && lastHandshake.refusalReason ? ` Reason: ${lastHandshake.refusalReason}.` : ''}
          </p>
        ) : null}

        <HandoverTaskList
          title="Handover tasks"
          patients={hoPatients}
          tasks={hoTasks}
          now={EXAMPLE_NOW}
          hideCompleted={hideCompleted}
          onHideCompletedChange={setHideCompleted}
          onStatusChange={(taskId, statusId) => setHoTasks(ts => ts.map(t => (t.id === taskId ? { ...t, status: statusId, updatedAt: EXAMPLE_NOW, updatedBy: setup.giver } : t)))}
          // Removal is always a manual step, never automatic on the due date (RID 104).
          onRemoveTask={taskId => setHoTasks(ts => ts.filter(t => t.id !== taskId))}
          onReadBackConfirm={pid => setHoPatients(ps => ps.map(p => (p.id === pid ? { ...p, readBackConfirmed: true } : p)))}
          onRecordHandover={pid => setHandshakeFor(pid)}
          // Same similar-name test as the ward list above (PAL-0560).
          similarNames={similarNames}
        />
      </section>

      {dialog === 'filter' ? (
        <FilterDialog<WardRow>
          tableName="ward list"
          rowNoun="patients"
          attributes={attributes}
          initial={filter}
          onPreview={setFilter}
          onOk={f => { setFilter(f); setDialog(null); }}
          onCancel={original => { setFilter(original); setDialog(null); }}
        />
      ) : null}

      {dialog === 'sort' ? (
        <SortDialog<WardRow>
          tableName="ward list"
          rowNoun="patients"
          attributes={attributes}
          initial={sort}
          onPreview={setSort}
          onOk={s => { setSort(s); setDialog(null); }}
          onCancel={original => { setSort(original); setDialog(null); }}
        />
      ) : null}

      {handshakeFor ? (
        // Date, time, place, giver and receiver are captured for the user to confirm (RID 27); the receiver records it.
        <HandshakeDialog
          items={handshakeItems}
          giver={setup.giver}
          receiver={setup.receiver}
          actingAs="receiver"
          place={setup.handoverPlace}
          dateTime={EXAMPLE_NOW}
          reasons={['Shift change', 'Break cover', 'Transfer of care']}
          onSubmit={onHandshake}
          onCancel={() => setHandshakeFor(null)}
        />
      ) : null}
    </div>
  );
}

export default function DesktopWardList() {
  return <ExampleShell meta={meta}>{region => <WardScreen region={region} />}</ExampleShell>;
}
