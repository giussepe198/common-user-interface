import { describe, it, expect } from 'vitest';
import {
  graphStackAnnouncement,
  graphStackConventionalOrder,
  graphStackDataTimes,
  graphStackFocusSummary,
  graphStackMove,
  graphStackOrder,
  type GraphStackGraphData,
} from './graphStack';

const graphs: GraphStackGraphData[] = [
  { id: 'rr', series: [{ id: 'rr', label: 'Respiratory rate', unit: 'breaths/min', points: [{ time: '2026-10-27T08:00', value: 22 }, { time: '2026-10-27T16:00', value: 24 }] }] },
  {
    id: 'temp', series: [{ id: 'temp', label: 'Temperature', unit: '°C', points: [{ time: '2026-10-27T12:02', value: 39.6, display: '39.6', source: 'manual' }] }],
    criticalThresholds: [{ direction: 'high', value: 39.5 }],
  },
  { id: 'bp', bloodPressure: { points: [{ time: '2026-10-27T12:00', systolic: 104, diastolic: 64 }, { time: '2026-10-28T02:00', systolic: 110, diastolic: 70 }] } },
];

describe('graph stack helpers', () => {
  it('collects every reading time in the period once, ascending', () => {
    const t = graphStackDataTimes(graphs, '2026-10-27T00:00', '2026-10-28T00:00').map(x => new Date(x).getHours() * 60 + new Date(x).getMinutes());
    expect(t).toEqual([480, 720, 722, 960]);
  });
  it('aligns readings within the tolerance and gives neighbours otherwise (GTAB-058, 060)', () => {
    const s = graphStackFocusSummary(graphs, '2026-10-27T12:00');
    expect(s[0].aligned).toHaveLength(0);
    expect(s[0].before[0].text).toBe('22');
    expect(s[0].after[0].text).toBe('24');
    expect(s[1].aligned[0].text).toBe('39.6');
    expect(s[1].aligned[0].critical?.direction).toBe('high');
    expect(s[2].aligned[0].text).toBe('104/64');
    expect(graphStackFocusSummary(graphs, '2026-10-27T12:00', 60_000)[1].aligned).toHaveLength(0);
  });
  it('announces every graph at the focus time', () => {
    const text = graphStackAnnouncement(graphStackFocusSummary(graphs, '2026-10-27T12:00'), '2026-10-27T12:00');
    expect(text).toBe(
      '27-Oct-2026 12:00. Respiratory rate: no reading at this time; before 22 at 08:00, after 24 at 16:00. Temperature 39.6 °C, manual, critical high. Blood pressure 104/64 mmHg.',
    );
  });
  it('orders by the given order then insertion order, moves, and follows convention (GTAB-149..151)', () => {
    expect(graphStackOrder(['a', 'b', 'c'], ['c', 'x', 'c'])).toEqual(['c', 'a', 'b']);
    expect(graphStackMove(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c']);
    expect(graphStackMove(['a', 'b', 'c'], 'a', 1)).toEqual(['b', 'a', 'c']);
    expect(graphStackConventionalOrder([...graphs, { id: 'pulse', title: 'Pulse rate' }, { id: 'pain', title: 'Pain score' }])).toEqual(['temp', 'bp', 'pulse', 'rr', 'pain']);
  });
});
