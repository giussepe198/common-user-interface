import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { DateInput, DurationInput, TimeInput } from '../../datetime';
import type { DateInputValue, TimeInputEntry } from '../../datetime';
import { CheckboxGroup, FormRow, Select, TextArea } from '../../forms';
import { FormField } from '../../noting';
import { Message } from '../../shell';
import { mhFormatZonedDateTime } from '../utils/mentalHealth';
import { mhFormatMinutes } from '../utils/mentalHealthCare';

/** A choice from a host value set (contact type, setting, participant), in the host's words. */
export interface ContactEntryOption {
  value: string;
  label: string;
}

/** Duration parts as `datetime/DurationInput` gives them. */
export interface ContactDurationParts {
  days?: number;
  hours?: number;
  minutes?: number;
}

/** What the clinician enters. */
export interface ContactEntryValue {
  date?: DateInputValue | null;
  time?: TimeInputEntry;
  duration?: ContactDurationParts | null;
  contactType?: string;
  setting?: string;
  participants?: string[];
  note?: string;
}

/** A saved contact as shown in view mode. */
export interface ContactRecord {
  startAt: DateLike;
  durationMinutes?: number | null;
  /** Contact type in the host's words, e.g. "Face to face". */
  contactType?: string | null;
  /** Setting in the host's words, e.g. "Home visit". */
  setting?: string | null;
  /** Who took part, in words, e.g. "The person", "Carer". */
  participants?: ReadonlyArray<string>;
  /** Author as the host attributes it. */
  author?: string | null;
  note?: string | null;
  /** Marked entered in error with a reason; stays visible in history. */
  enteredInError?: { reason: string } | null;
}

export interface ContactEntryProps {
  /** View a saved contact, or edit a new or draft one. Default "view". */
  mode?: 'view' | 'edit';
  /** View mode: the saved contact. */
  contact?: ContactRecord;
  /** Edit mode: the draft (controlled or uncontrolled). */
  value?: ContactEntryValue;
  defaultValue?: ContactEntryValue;
  onChange?: (value: ContactEntryValue) => void;
  onSave?: (value: ContactEntryValue) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  /** Host value sets. */
  contactTypes?: ReadonlyArray<ContactEntryOption>;
  settings?: ReadonlyArray<ContactEntryOption>;
  participantOptions?: ReadonlyArray<ContactEntryOption>;
  /** Note label. Default "Note". */
  noteLabel?: string;
  /** Prompt under the note, e.g. "Include the person's own words where you can". */
  notePrompt?: string;
  /** Heading. Default "Contact". */
  title?: string;
  headingLevel?: 2 | 3;
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

/** Whole minutes in a duration (days, hours, minutes). */
export function contactDurationMinutes(d: ContactDurationParts | null | undefined): number | null {
  if (!d) return null;
  const m = (d.days ?? 0) * 1440 + (d.hours ?? 0) * 60 + (d.minutes ?? 0);
  return Number.isFinite(m) ? m : null;
}

/**
 * A contact or note header: date and time, duration, contact type, setting and participants, with the note text. View
 * mode is one dense line plus the note; edit mode stacks the CUI date, time and duration inputs and labelled fields.
 * Saving needs a date, a time, a duration and a contact type
 * [suggested; the host may add more checks of its own].
 */
export function ContactEntry({
  mode = 'view',
  contact,
  value,
  defaultValue,
  onChange,
  onSave,
  onCancel,
  onEdit,
  contactTypes = [],
  settings = [],
  participantOptions = [],
  noteLabel = 'Note',
  notePrompt,
  title = 'Contact',
  headingLevel = 2,
  timeZone: tzProp,
  region,
  className,
}: ContactEntryProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const id = useId('cui-contact-entry');
  const [draft, setDraft] = useControllableState<ContactEntryValue>(value, defaultValue ?? {}, onChange);
  const [attempted, setAttempted] = React.useState(false);
  const H = `h${headingLevel}` as 'h2' | 'h3';

  if (mode === 'view') {
    if (!contact) return null;
    const bits = [
      mhFormatZonedDateTime(contact.startAt, timeZone),
      contact.durationMinutes != null ? mhFormatMinutes(contact.durationMinutes) : 'Duration not recorded',
      contact.contactType,
      contact.setting,
    ].filter(Boolean) as string[];
    const err = contact.enteredInError;
    return (
      <article className={cx('cui-contact-entry', err && 'cui-contact-entry--error', className)} aria-labelledby={`${id}-title`}>
        <div className="cui-contact-entry__header">
          <H id={`${id}-title`} className="cui-contact-entry__title">
            {title}
          </H>
          <p className="cui-contact-entry__line">
            {bits.map((b, i) => (
              <span key={i} className="cui-contact-entry__bit">
                {b}
              </span>
            ))}
          </p>
          {onEdit && !err ? (
            <Button size="sm" variant="quiet" icon="pencil" onClick={onEdit} className="cui-contact-entry__edit">
              Edit
            </Button>
          ) : null}
        </div>
        <p className="cui-contact-entry__meta">
          {contact.participants?.length ? <span>{`With: ${contact.participants.join(', ')}`}</span> : null}
          {contact.author ? <span>{`By: ${contact.author}`}</span> : null}
        </p>
        {err ? (
          <p className="cui-contact-entry__error-flag">
            <Icon name="error" size={16} />
            {`Entered in error: ${err.reason}`}
          </p>
        ) : null}
        {contact.note ? <p className="cui-contact-entry__note">{contact.note}</p> : <p className="cui-contact-entry__none">No note recorded</p>}
      </article>
    );
  }

  const set = (p: Partial<ContactEntryValue>) => setDraft({ ...draft, ...p });
  const missing = {
    date: !draft.date || draft.date.kind !== 'full',
    time: !draft.time || draft.time === 'unknown',
    duration: contactDurationMinutes(draft.duration) == null || contactDurationMinutes(draft.duration) === 0,
    contactType: !draft.contactType,
  };
  const invalid = Object.values(missing).some(Boolean);
  const save = () => {
    setAttempted(true);
    if (!invalid) onSave?.(draft);
  };

  return (
    <section className={cx('cui-contact-entry', 'cui-contact-entry--edit', className)} aria-labelledby={`${id}-title`}>
      <H id={`${id}-title`} className="cui-contact-entry__title">
        {title}
      </H>
      <div className="cui-contact-entry__fields">
        <FormRow template="minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr)">
          <FormField label="Date" required error={attempted && missing.date ? 'Enter the date of the contact' : undefined}>
            <DateInput label="Date" bare hideInstructions value={draft.date ?? null} onChange={(d) => set({ date: d })} required region={region} />
          </FormField>
          <FormField label="Start time" required error={attempted && missing.time ? 'Enter the start time' : undefined}>
            <TimeInput label="Start time" bare hideInstructions value={draft.time ?? null} onChange={(t) => set({ time: t })} required region={region} />
          </FormField>
          <FormField label="Duration" required error={attempted && missing.duration ? 'Enter how long the contact took' : undefined}>
            <DurationInput
              label="Duration"
              bare
              hideInstructions
              value={draft.duration ?? null}
              onChange={(d) => set({ duration: d ? { days: d.days, hours: d.hours, minutes: d.minutes } : null })}
              required
              region={region}
            />
          </FormField>
        </FormRow>
        <FormRow columns={settings.length ? 2 : 1}>
          <FormField label="Contact type" required error={attempted && missing.contactType ? 'Choose the contact type' : undefined}>
            <Select options={contactTypes} placeholder="Choose" value={draft.contactType ?? ''} onChange={(v) => set({ contactType: v || undefined })} />
          </FormField>
          {settings.length ? (
            <FormField label="Setting">
              <Select options={settings} placeholder="Choose" value={draft.setting ?? ''} onChange={(v) => set({ setting: v || undefined })} />
            </FormField>
          ) : null}
        </FormRow>
        {participantOptions.length ? (
          <CheckboxGroup
            label="Participants"
            orientation="horizontal"
            options={participantOptions}
            value={participantOptions.filter((o) => (draft.participants ?? []).includes(o.value)).map((o) => o.value)}
            onChange={(list) => set({ participants: list })}
          />
        ) : null}
        <FormField label={noteLabel} prompt={notePrompt}>
          <TextArea rows={6} autoGrow maxRows={16} value={draft.note ?? ''} onChange={(v) => set({ note: v })} />
        </FormField>
      </div>
      <div className="cui-contact-entry__actions">
        <Button variant="primary" size="sm" onClick={save}>
          Save contact
        </Button>
        {onCancel ? (
          <Button size="sm" variant="quiet" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
      {attempted && invalid ? <Message tone="error" layout="inline" title="Complete the date, start time, duration and contact type to save" /> : null}
    </section>
  );
}
