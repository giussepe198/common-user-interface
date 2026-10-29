import React from 'react';
import { Button, cx, Icon, toDate, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { TelephoneNumberDisplay } from '../../patient';
import { ConsentIndicator } from '../ConsentIndicator/ConsentIndicator';
import type { ConsentState } from '../ConsentIndicator/ConsentIndicator';
import { MhGlyph } from '../internal/MhGlyph';
import { mhFormatZonedDate } from '../utils/mentalHealth';

/** A role on the link, in the host's words. */
export interface SupportPersonRole {
  /** e.g. "Carer", "Nominated support person", "Guardian", "Whānau". */
  label: string;
  /** A role that carries legal authority or standing under the Act (nominated person, guardian): shown with the legal style. */
  legal?: boolean;
}

/**
 * A safety notice about contacting or involving the person, shown first on their card in words with a symbol: for
 * example "Do not contact" (contact is not safe) or "Do not involve" (the person's wish)
 * [suggested].
 */
export interface SupportPersonNotice {
  /** 'danger' for a notice that stops contact; 'warning' for one that limits it. */
  tone: 'danger' | 'warning';
  title: string;
  /** More in words, for example the note recorded with it. */
  text?: string | null;
}

/** A labelled fact on a support person's card, in words (for example "Consumer's wishes", "Linked since") [suggested]. */
export interface SupportPersonDetail {
  id: string;
  label: string;
  value: React.ReactNode;
}

/** A related person or group linked to the person. */
export interface SupportPerson {
  id: string;
  /** Name as the person or group is known, e.g. "Linh Nguyen", "Te Whare whānau". */
  name: string;
  roles: ReadonlyArray<SupportPersonRole>;
  /** Relationship to the person in words, e.g. "Sister". */
  relationship?: string | null;
  /** Members of a group such as a whānau, in words. */
  members?: ReadonlyArray<string>;
  phones?: ReadonlyArray<{ label?: string; value: string }>;
  email?: string | null;
  /** Contact preferences in words, e.g. "Text first; no voicemail". */
  contactPreferences?: string | null;
  /** What they may be told: the consent state and the scope in words. */
  sharing?: { state: ConsentState; text?: string } | null;
  /** Primary contact for the person [suggested]. */
  primary?: boolean;
  /** An ended or revoked link stays visible with the date and reason. */
  ended?: { date: DateLike; reason?: string } | null;
  /** Safety notices, shown first under the name [suggested]. */
  notices?: ReadonlyArray<SupportPersonNotice>;
  /** More labelled facts, after the contact details [suggested]. */
  details?: ReadonlyArray<SupportPersonDetail>;
  /** The host's commands for this person (for example "End link"), beside the name; name each one for the person [suggested]. */
  actions?: React.ReactNode;
  /** More content at the end of the card, for example statutory roles with their dates and commands [suggested]. */
  content?: React.ReactNode;
}

export interface SupportPersonListProps {
  people: ReadonlyArray<SupportPerson>;
  /** Caption. Default "Support people". */
  title?: string;
  /** Show ended or revoked links. Default false; a count says how many are hidden. */
  showEnded?: boolean;
  onOpen?: (person: SupportPerson) => void;
  onAdd?: () => void;
  /**
   * Show "May be told" with the sharing state on each card. Default true. Pass false where what each person may be told
   * is decided and shown elsewhere (for example a consent screen with the server's sharing check), so a card never says
   * "Not asked" for a person whose sharing is recorded there [suggested].
   */
  showSharing?: boolean;
  /** Words for the sharing state, from the service (passed to `ConsentIndicator`). */
  sharingLabels?: Partial<Record<ConsentState, string>>;
  emptyText?: string;
  headingLevel?: 2 | 3;
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

/**
 * The person's carers, nominated support person, guardian, whānau and other support people: role words from the host,
 * relationship, contact details, contact preferences and what each may be told, with ended links kept on request
 *.
 */
export function SupportPersonList({
  people,
  title = 'Support people',
  showEnded = false,
  onOpen,
  onAdd,
  showSharing = true,
  sharingLabels,
  emptyText = 'No support people recorded',
  headingLevel = 2,
  timeZone: tzProp,
  region,
  className,
}: SupportPersonListProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const H2 = `h${headingLevel + 1}` as 'h3' | 'h4';
  const isEnded = (p: SupportPerson) => !!toDate(p.ended?.date ?? null);
  const shown = people.filter((p) => showEnded || !isEnded(p)).sort((a, b) => Number(isEnded(a)) - Number(isEnded(b)) || Number(!!b.primary) - Number(!!a.primary));
  const hidden = people.length - shown.length;

  return (
    <section className={cx('cui-support-people', className)} aria-label={title}>
      <div className="cui-support-people__header">
        <H className="cui-support-people__title">{title}</H>
        {hidden ? <span className="cui-support-people__hidden">{`${hidden} ended not shown`}</span> : null}
        {onAdd ? (
          <Button size="sm" icon="plus" onClick={onAdd} className="cui-support-people__add">
            Add support person
          </Button>
        ) : null}
      </div>
      {shown.length === 0 ? <p className="cui-support-people__empty">{emptyText}</p> : null}
      <ul className="cui-support-people__list">
        {shown.map((p) => {
          const ended = isEnded(p);
          return (
            <li key={p.id} className={cx('cui-support-people__item', ended && 'cui-support-people__item--ended')}>
              <div className="cui-support-people__who">
                <H2 className="cui-support-people__name">
                  {onOpen ? (
                    <button type="button" className="cui-support-people__open" onClick={() => onOpen(p)}>
                      {p.name}
                    </button>
                  ) : (
                    p.name
                  )}
                </H2>
                {p.relationship ? <span className="cui-support-people__relationship">{p.relationship}</span> : null}
                {p.primary ? <span className="cui-support-people__primary">Primary contact</span> : null}
                {p.actions ? <div className="cui-support-people__actions">{p.actions}</div> : null}
              </div>
              {p.notices?.map((n, i) => (
                <div key={i} className={cx('cui-support-people__notice', `cui-support-people__notice--${n.tone}`)}>
                  <Icon name={n.tone === 'danger' ? 'error' : 'warning'} size={16} />
                  <span className="cui-support-people__notice-words">
                    <strong className="cui-support-people__notice-title">{n.title}</strong>
                    {n.text ? <span className="cui-support-people__notice-text">{n.text}</span> : null}
                  </span>
                </div>
              ))}
              <div className="cui-support-people__roles">
                {p.roles.map((r, i) => (
                  <span key={i} className={cx('cui-support-people__role', r.legal && 'cui-support-people__role--legal')}>
                    {r.legal ? <MhGlyph name="scale" /> : <Icon name="user" size={16} />}
                    {r.label}
                  </span>
                ))}
              </div>
              {ended ? (
                <p className="cui-support-people__ended">
                  <Icon name="history" size={16} />
                  {`Ended ${mhFormatZonedDate(p.ended?.date, timeZone)}${p.ended?.reason ? `: ${p.ended.reason}` : ''}`}
                </p>
              ) : null}
              {p.members?.length ? <p className="cui-support-people__members">{`Members: ${p.members.join(', ')}`}</p> : null}
              <div className="cui-support-people__contact">
                {/* A notice that stops contact (danger) leaves the numbers as text, never a call link. */}
                {(p.phones ?? []).map((ph, i) => (
                  <TelephoneNumberDisplay key={i} value={ph.value} label={ph.label} region={region} asLink={!p.notices?.some((n) => n.tone === 'danger')} className="cui-support-people__phone" />
                ))}
                {p.email ? <span className="cui-support-people__email">{p.email}</span> : null}
                {!p.phones?.length && !p.email ? <span className="cui-support-people__none">No contact details recorded</span> : null}
              </div>
              {p.contactPreferences ? <p className="cui-support-people__prefs">{p.contactPreferences}</p> : null}
              {p.details?.length ? (
                <dl className="cui-support-people__details">
                  {p.details.map((d) => (
                    <div key={d.id} className="cui-support-people__detail">
                      <dt className="cui-support-people__label">{d.label}</dt>
                      <dd className="cui-support-people__detail-value">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {showSharing ? (
                <div className="cui-support-people__sharing">
                  <span className="cui-support-people__label">May be told</span>
                  <ConsentIndicator size="compact" state={p.sharing?.state ?? 'not-recorded'} text={p.sharing?.text} labels={sharingLabels} />
                </div>
              ) : null}
              {p.content ? <div className="cui-support-people__content">{p.content}</div> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
