import React from 'react';
import { Button, cx, formatShortDate, formatTime, toDate, useId, type DateLike } from '../../core';

/** One set of repeated measurements. */
export interface RepeatableInstance {
  id: string;
  /** Time of entry or measurement: each set is labelled with it, never "first" or "second" (Theme 8). */
  recordedAt: DateLike;
}

export interface RepeatableFieldGroupProps<T extends RepeatableInstance = RepeatableInstance> {
  /** Group heading, e.g. "Vital signs". */
  label: string;
  /** Instances in the order recorded. */
  instances: T[];
  /** Render the fields of one set. */
  renderInstance: (instance: T, index: number) => React.ReactNode;
  /** Add a new set (the consumer creates it with the current time). */
  onAdd: () => void;
  /** Label of the add button. Default "Add another" (Theme 8). */
  addLabel?: string;
  /** Lay the sets side by side ('row', default) or one under another ('column'). Either way they are adjacent. */
  layout?: 'row' | 'column';
  /** "Now", to decide whether to show the date with the time. Default today. */
  now?: Date;
  /** Maximum sets [suggested]. */
  maxInstances?: number;
  className?: string;
}

/** Label for a set: time today, date and time otherwise (Theme 8: labelled with time of entry). */
function instanceLabel(at: DateLike, now: Date): string {
  const d = toDate(at);
  if (!d) return 'Time not recorded';
  const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  return sameDay ? `Recorded ${formatTime(d)}` : `Recorded ${formatShortDate(d)} ${formatTime(d)}`;
}

/**
 * Repeated sets of measurement fields (Noting Using Templates, Theme 8; experimental): sets are
 * adjacent, each labelled with its time of entry, with a prominent "Add another" next to the most recent.
 */
export function RepeatableFieldGroup<T extends RepeatableInstance>({
  label,
  instances,
  renderInstance,
  onAdd,
  addLabel = 'Add another',
  layout = 'row',
  now,
  maxInstances,
  className,
}: RepeatableFieldGroupProps<T>) {
  const id = useId('cui-repeat');
  const ref = now ?? new Date();
  const full = maxInstances != null && instances.length >= maxInstances;
  return (
    <section className={cx('cui-repeat-group', `cui-repeat-group--${layout}`, className)} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="cui-repeat-group__title">{label}</h3>
      <div className="cui-repeat-group__sets">
        {instances.map((inst, i) => {
          const tag = instanceLabel(inst.recordedAt, ref);
          return (
            <fieldset key={inst.id} className="cui-repeat-group__set">
              <legend className="cui-repeat-group__legend">
                <span className="cui-visually-hidden">{label}, </span>
                {tag}
              </legend>
              {renderInstance(inst, i)}
            </fieldset>
          );
        })}
        <div className="cui-repeat-group__add">
          <Button icon="plus" onClick={onAdd} disabled={full} aria-describedby={full ? `${id}-full` : undefined}>
            {addLabel}
          </Button>
          {full ? <span id={`${id}-full`} className="cui-repeat-group__full">No more sets can be added.</span> : null}
        </div>
      </div>
    </section>
  );
}
