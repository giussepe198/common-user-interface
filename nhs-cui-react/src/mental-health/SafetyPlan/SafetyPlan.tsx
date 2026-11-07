import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useControllableState, useId, VisuallyHidden } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { FormRow, TextInput } from '../../forms';
import { FormField, RepeatableFieldGroup } from '../../noting';
import { TelephoneNumberDisplay } from '../../patient';
import { mhFormatZonedDate, mhFormatZonedDateTime } from '../utils/mentalHealth';

/** One line of a safety plan, in the person's own words where they wrote it. */
export interface SafetyPlanEntry {
  id: string;
  /** The words. */
  text: string;
  /** When the line was added (the repeatable group labels each line with it, Theme 8). */
  recordedAt: DateLike;
  /** Telephone number, for people and services (shown through `TelephoneNumberDisplay`). */
  phone?: string;
  /** Extra detail, e.g. "Available after 17:00". */
  detail?: string;
}

/** The sections of a safety plan held by the person. */
export type SafetyPlanSectionKey =
  | 'warningSigns'
  | 'copingStrategies'
  | 'distraction'
  | 'helpPeople'
  | 'professionals'
  | 'environment'
  | 'reasonsForLiving';

export type SafetyPlanValue = Record<SafetyPlanSectionKey, SafetyPlanEntry[]>;

export const EMPTY_SAFETY_PLAN: SafetyPlanValue = {
  warningSigns: [],
  copingStrategies: [],
  distraction: [],
  helpPeople: [],
  professionals: [],
  environment: [],
  reasonsForLiving: [],
};

const SECTION_ORDER: SafetyPlanSectionKey[] = ['warningSigns', 'copingStrategies', 'distraction', 'helpPeople', 'professionals', 'environment', 'reasonsForLiving'];
const WITH_PHONE: SafetyPlanSectionKey[] = ['helpPeople', 'professionals'];

/** Section headings; the service's co-designed wording may replace them. Defaults [suggested]. */
export const SAFETY_PLAN_HEADINGS: Record<SafetyPlanSectionKey, string> = {
  warningSigns: 'My warning signs',
  copingStrategies: 'Things I can do on my own to cope',
  distraction: 'People and places that help take my mind off things',
  helpPeople: 'People I can ask for help',
  professionals: 'Professionals and services I can contact',
  environment: 'Making my surroundings safer',
  reasonsForLiving: 'My reasons for living',
};

/** Sharing state of the plan with the person. */
export interface SafetyPlanSharing {
  shared: boolean;
  /** When and how, e.g. "Printed copy given". */
  sharedAt?: DateLike | null;
  how?: string | null;
}

export interface SafetyPlanProps {
  value?: SafetyPlanValue;
  defaultValue?: SafetyPlanValue;
  onChange?: (value: SafetyPlanValue) => void;
  /** View or edit. Default "view". */
  mode?: 'view' | 'edit';
  onEdit?: () => void;
  onSave?: (value: SafetyPlanValue) => void;
  onCancel?: () => void;
  /** Print the plan; the layout is print friendly either way. */
  onPrint?: () => void;
  /** Whether the person has the current version. */
  sharing?: SafetyPlanSharing;
  /** Mark the plan as shared with the person. */
  onMarkShared?: () => void;
  /** Section headings (the service's co-designed words). */
  headings?: Partial<Record<SafetyPlanSectionKey, string>>;
  /** Title. Default "Safety plan". */
  title?: string;
  /** Who last updated it, and when (the print shows it). */
  updatedBy?: string;
  updatedAt?: DateLike;
  /** Review date, shown in the header. */
  reviewDue?: DateLike | null;
  /** Creates ids for new lines. Default a counter [suggested]. */
  createId?: () => string;
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  headingLevel?: 2 | 3;
  className?: string;
}

let counter = 0;
const defaultId = () => `sp-${Date.now().toString(36)}-${(counter += 1)}`;

/**
 * A safety plan held by the person with its seven sections in the person's own words: warning signs, coping strategies,
 * people and places for distraction, people to ask for help, professionals and services with their numbers, making
 * the surroundings safer, and reasons for living. View and edit modes (lines added through
 * `noting/RepeatableFieldGroup`), "shared with the person" state, and a print layout that keeps every section and the
 * date.
 */
export function SafetyPlan({
  value,
  defaultValue,
  onChange,
  mode = 'view',
  onEdit,
  onSave,
  onCancel,
  onPrint,
  sharing,
  onMarkShared,
  headings,
  title = 'Safety plan',
  updatedBy,
  updatedAt,
  reviewDue,
  createId = defaultId,
  now,
  timeZone: tzProp,
  region,
  headingLevel = 2,
  className,
}: SafetyPlanProps) {
  const [plan, setPlan] = useControllableState<SafetyPlanValue>(value, defaultValue ?? EMPTY_SAFETY_PLAN, onChange);
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const id = useId('cui-safety-plan');
  const words = { ...SAFETY_PLAN_HEADINGS, ...headings };
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const H2 = `h${headingLevel + 1}` as 'h3' | 'h4';
  const editing = mode === 'edit';
  const empty = SECTION_ORDER.every((k) => (plan[k] ?? []).length === 0);

  const setSection = (k: SafetyPlanSectionKey, list: SafetyPlanEntry[]) => setPlan({ ...plan, [k]: list });
  const patch = (k: SafetyPlanSectionKey, entryId: string, p: Partial<SafetyPlanEntry>) =>
    setSection(k, (plan[k] ?? []).map((e) => (e.id === entryId ? { ...e, ...p } : e)));

  const save = () => {
    const cleaned = Object.fromEntries(SECTION_ORDER.map((k) => [k, (plan[k] ?? []).filter((e) => e.text.trim())])) as SafetyPlanValue;
    setPlan(cleaned);
    onSave?.(cleaned);
  };

  return (
    <section className={cx('cui-safety-plan', editing && 'cui-safety-plan--edit', className)} aria-labelledby={`${id}-title`}>
      <div className="cui-safety-plan__header">
        <H id={`${id}-title`} className="cui-safety-plan__title">
          {title}
        </H>
        <span className={cx('cui-safety-plan__shared', sharing?.shared ? 'cui-safety-plan__shared--yes' : 'cui-safety-plan__shared--no')}>
          <Icon name={sharing?.shared ? 'check' : 'warning'} size={16} />
          {sharing?.shared
            ? `Shared with the person${sharing.sharedAt ? ` ${mhFormatZonedDate(sharing.sharedAt, timeZone)}` : ''}${sharing.how ? `: ${sharing.how}` : ''}`
            : 'Not yet shared with the person'}
        </span>
        <p className="cui-safety-plan__meta">
          {updatedAt ? <span>{`Updated ${mhFormatZonedDateTime(updatedAt, timeZone)}${updatedBy ? ` by ${updatedBy}` : ''}`}</span> : null}
          {reviewDue ? <span>{`Review by ${mhFormatZonedDate(reviewDue, timeZone)}`}</span> : null}
        </p>
        <div className="cui-safety-plan__actions">
          {!editing && onEdit ? (
            <Button size="sm" icon="pencil" onClick={onEdit}>
              Edit plan
            </Button>
          ) : null}
          {!editing && !sharing?.shared && onMarkShared ? (
            <Button size="sm" onClick={onMarkShared}>
              Mark as shared with the person
            </Button>
          ) : null}
          {!editing && onPrint ? (
            <Button size="sm" variant="quiet" onClick={onPrint}>
              Print
            </Button>
          ) : null}
        </div>
      </div>
      {!editing && empty ? (
        <p className="cui-safety-plan__empty">
          <Icon name="warning" size={16} />
          No safety plan recorded
        </p>
      ) : null}
      <div className="cui-safety-plan__sections">
        {SECTION_ORDER.map((k, n) => {
          const list = plan[k] ?? [];
          const phone = WITH_PHONE.includes(k);
          if (editing) {
            return (
              <div key={k} className="cui-safety-plan__section">
                <RepeatableFieldGroup
                  label={`${n + 1}. ${words[k]}`}
                  layout="column"
                  instances={list}
                  addLabel="Add a line"
                  onAdd={() => setSection(k, [...list, { id: createId(), text: '', recordedAt: now ?? new Date() }])}
                  renderInstance={(entry, i) => (
                    <div className="cui-safety-plan__entry">
                      <FormRow columns={phone ? 2 : 1} template={phone ? 'minmax(0, 3fr) minmax(0, 2fr)' : undefined}>
                        <FormField label={<>{phone ? `Name ${i + 1}` : `Line ${i + 1}`}<VisuallyHidden>{`, ${words[k]}`}</VisuallyHidden></>}>
                          <TextInput className="cui-safety-plan__input" value={entry.text} onChange={(v) => patch(k, entry.id, { text: v })} />
                        </FormField>
                        {phone ? (
                          <FormField label={<>{`Phone ${i + 1}`}<VisuallyHidden>{`, ${words[k]}`}</VisuallyHidden></>}>
                            <TextInput className="cui-safety-plan__input" inputMode="tel" autoComplete="tel" widthChars={16} value={entry.phone ?? ''} onChange={(v) => patch(k, entry.id, { phone: v })} />
                          </FormField>
                        ) : null}
                      </FormRow>
                      <Button size="sm" variant="quiet" icon="trash" className="cui-safety-plan__remove" onClick={() => setSection(k, list.filter((e) => e.id !== entry.id))} aria-label={`Remove ${phone ? 'name' : 'line'} ${i + 1} from ${words[k]}`}>
                        Remove
                      </Button>
                    </div>
                  )}
                />
              </div>
            );
          }
          return (
            <section key={k} className="cui-safety-plan__section" aria-labelledby={`${id}-${k}`}>
              <H2 id={`${id}-${k}`} className="cui-safety-plan__section-title">
                <span className="cui-safety-plan__step" aria-hidden="true">{n + 1}</span>
                {words[k]}
              </H2>
              {list.length ? (
                <ul className="cui-safety-plan__list">
                  {list.map((e) => (
                    <li key={e.id}>
                      <span className="cui-safety-plan__text">{e.text}</span>
                      {phone ? <TelephoneNumberDisplay value={e.phone} region={region} asLink unknownText="No number recorded" className="cui-safety-plan__phone" /> : null}
                      {e.detail ? <span className="cui-safety-plan__detail">{e.detail}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="cui-safety-plan__none">Nothing recorded yet</p>
              )}
            </section>
          );
        })}
      </div>
      {editing ? (
        <div className="cui-safety-plan__edit-actions">
          <Button variant="primary" size="sm" onClick={save}>
            Save plan
          </Button>
          {onCancel ? (
            <Button size="sm" variant="quiet" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
