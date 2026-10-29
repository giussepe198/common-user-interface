import React from 'react';
import { cx, Icon, toDate, useClinicalLocale } from '../../core';
import type { ClinicalRegion } from '../../core';
import { mhFormatZonedDateTime } from '../utils/mentalHealth';
import { mhFormatMinutes } from '../utils/mentalHealthCare';
import type { ContactRecord } from '../ContactEntry/ContactEntry';

export interface ContactSummaryItem extends ContactRecord {
  id: string;
}

export interface ContactSummaryListProps {
  contacts: ReadonlyArray<ContactSummaryItem>;
  /** Open a contact. The date becomes a button when given. */
  onOpen?: (contact: ContactSummaryItem) => void;
  /** Caption. Default "Contacts". */
  caption?: string;
  /** Show contacts entered in error (struck through, with the reason). Default false: they leave default views. */
  showEnteredInError?: boolean;
  /** Text when there are none. Default "No contacts recorded". */
  emptyText?: string;
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

/**
 * A dense list of contacts, newest first: date and time, duration, type, setting, author and the start of the note,
 * with a count and the total time. A table when wide, labelled cards when narrow.
 */
export function ContactSummaryList({
  contacts,
  onOpen,
  caption = 'Contacts',
  showEnteredInError = false,
  emptyText = 'No contacts recorded',
  timeZone: tzProp,
  region,
  className,
}: ContactSummaryListProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const rows = contacts
    .filter((c) => showEnteredInError || !c.enteredInError)
    .slice()
    .sort((a, b) => (toDate(b.startAt)?.getTime() ?? 0) - (toDate(a.startAt)?.getTime() ?? 0));
  const counted = rows.filter((c) => !c.enteredInError);
  const total = counted.reduce((s, c) => s + (c.durationMinutes ?? 0), 0);
  const hidden = contacts.length - rows.length;

  return (
    <div className={cx('cui-contact-summary', className)}>
      <table className="cui-contact-summary__table">
        <caption className="cui-contact-summary__caption">
          <span className="cui-contact-summary__caption-title">{caption}</span>
          <span className="cui-contact-summary__totals">{`${counted.length} contact${counted.length === 1 ? '' : 's'}, ${mhFormatMinutes(total) || '0 min'} in total${hidden ? `; ${hidden} entered in error not shown` : ''}`}</span>
        </caption>
        <thead>
          <tr>
            <th scope="col">Date and time</th>
            <th scope="col">Duration</th>
            <th scope="col">Type</th>
            <th scope="col">Setting</th>
            <th scope="col">Author</th>
            <th scope="col">Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="cui-contact-summary__empty-row">
              <td colSpan={6}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((c) => {
              const when = mhFormatZonedDateTime(c.startAt, timeZone);
              return (
                <tr key={c.id} className={cx(c.enteredInError && 'cui-contact-summary__row--error')}>
                  <td data-label="Date and time" className="cui-contact-summary__when">
                    {onOpen ? (
                      <button type="button" className="cui-contact-summary__open" onClick={() => onOpen(c)}>
                        {when}
                      </button>
                    ) : (
                      when
                    )}
                    {c.enteredInError ? (
                      <span className="cui-contact-summary__error">
                        <Icon name="error" size={16} />
                        {`Entered in error: ${c.enteredInError.reason}`}
                      </span>
                    ) : null}
                  </td>
                  <td data-label="Duration" className="cui-contact-summary__num">
                    {c.durationMinutes != null ? mhFormatMinutes(c.durationMinutes) : 'Not recorded'}
                  </td>
                  <td data-label="Type">{c.contactType ?? 'Not recorded'}</td>
                  <td data-label="Setting">{c.setting ?? ''}</td>
                  <td data-label="Author">{c.author ?? ''}</td>
                  <td data-label="Note" className="cui-contact-summary__note">
                    {c.note ? <span title={c.note}>{c.note}</span> : <span className="cui-contact-summary__none">No note</span>}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
