import React from 'react';
import { DateInput, TimeInput, type DateInputValue, type TimeInputEntry } from '../../datetime';
import { pad2 } from '../../core';
import type { ListAttribute } from '../utils/listTypes';

/** "YYYY-MM-DD" to a DateInput value. */
export function listIsoToDateValue(iso: string | undefined): DateInputValue | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? { kind: 'full', year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) } : null;
}
/** DateInput value to "YYYY-MM-DD" (full dates only). */
export function listDateValueToIso(v: DateInputValue | null): string {
  return v && v.kind === 'full' ? `${String(v.year).padStart(4, '0')}-${pad2(v.month)}-${pad2(v.day)}` : '';
}
/** "...THH:mm" to a TimeInput value. */
export function listIsoToTimeValue(iso: string | undefined): TimeInputEntry {
  const m = /T(\d{2}):(\d{2})/.exec(iso ?? '');
  return m ? { hours: Number(m[1]), minutes: Number(m[2]) } : null;
}

export interface ListFilterValueInputProps<T> {
  attr: ListAttribute<T>;
  /** Value as kept in the filter state: decimal text, YYYY-MM-DD or YYYY-MM-DDTHH:mm. */
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for single-box inputs; visible label text for date and time fields. */
  label: string;
  id: string;
  className?: string;
}

/**
 * Value control appropriate to the data type (FSG-0035): a select for value sets, the CUI DateInput for dates and
 * DateInput plus TimeInput for date-times (so dates show as dd-Mmm-yyyy, not the browser's locale format), and
 * number or text inputs otherwise. Area-internal.
 */
export function ListFilterValueInput<T>({ attr, value, onChange, label, id, className = 'cui-list-input cui-filter-dialog__value' }: ListFilterValueInputProps<T>) {
  const [timePart, setTimePart] = React.useState<TimeInputEntry>(() => listIsoToTimeValue(value));
  const [datePart, setDatePart] = React.useState<DateInputValue | null>(() => listIsoToDateValue(value));
  React.useEffect(() => {
    // Follow external resets (e.g. "Remove all filters").
    if (value === '') {
      if (attr.dataType === 'dateTime') {
        setTimePart(null);
        setDatePart(null);
      }
    } else {
      setDatePart(listIsoToDateValue(value));
      setTimePart(listIsoToTimeValue(value));
    }
  }, [value, attr.dataType]);

  if ((attr.dataType === 'ordinal' || attr.dataType === 'unorderedSymbol') && attr.options) {
    return (
      <select id={id} className={className} value={value} aria-label={label} onChange={e => onChange(e.target.value)}>
        <option value="">Select a value</option>
        {attr.options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }
  if (attr.dataType === 'date') {
    return (
      <span className="cui-list-datefield">
        <DateInput id={id} label={label} hideInstructions allowUnknown={false} value={listIsoToDateValue(value)} onChange={v => onChange(listDateValueToIso(v))} />
      </span>
    );
  }
  if (attr.dataType === 'dateTime') {
    const combine = (d: DateInputValue | null, t: TimeInputEntry) => {
      const ds = listDateValueToIso(d);
      return ds && t && t !== 'unknown' ? `${ds}T${pad2(t.hours)}:${pad2(t.minutes)}` : '';
    };
    return (
      <span className="cui-list-datefield cui-list-datefield--pair">
        <DateInput
          id={id}
          label={`${label} date`}
          hideInstructions
          allowUnknown={false}
          value={datePart}
          onChange={d => {
            setDatePart(d);
            onChange(combine(d, timePart));
          }}
        />
        <TimeInput
          label={`${label} time`}
          hideInstructions
          showClockIndicator={false}
          allowUnknown={false}
          value={timePart}
          onChange={t => {
            setTimePart(t);
            onChange(combine(datePart, t));
          }}
        />
      </span>
    );
  }
  const numeric = attr.dataType === 'integer' || attr.dataType === 'real';
  return (
    <input
      id={id}
      className={className}
      type={numeric ? 'number' : 'text'}
      step={attr.dataType === 'integer' ? 1 : attr.dataType === 'real' ? 'any' : undefined}
      inputMode={attr.dataType === 'integer' ? 'numeric' : attr.dataType === 'real' ? 'decimal' : undefined}
      placeholder="Value"
      aria-label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}
