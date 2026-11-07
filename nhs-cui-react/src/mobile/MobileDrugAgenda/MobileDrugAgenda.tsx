import React from 'react';
import { DAY_SHORT, Icon, cx, formatShortDate, formatTime, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { ADMIN_CHART_WORDING, adminAddDays, adminIsSameDay, adminStartOfDay, type AdminEvent, type AdminMedication } from '../../administration';
import { applyTallManLettering, medicationDrugName } from '../../medications';
import { TouchButton } from '../../touch';
import { MobileGlyph } from '../internal/mobileIcons';
import { MobileStatusMark } from '../internal/MobileStatusMark';
import { MOBILE_TEXT_SEPARATOR } from '../internal/identity';
import { mobileAgendaSlots, type MobileAgendaEvent } from '../utils/mobileAgendaSlots';

export interface MobileDrugAgendaProps {
  /** Medication lines with their events: the administration area's model, the same data as DrugAdministrationChart. */
  medications: ReadonlyArray<AdminMedication>;
  /** Current time: due states and the now line. Default now. */
  now?: Date;
  /** Day shown (controlled). Default today. */
  selectedDate?: DateLike;
  defaultSelectedDate?: DateLike;
  onSelectedDateChange?: (date: Date) => void;
  /** Open an event: an outstanding dose (to B2 administration) or a recorded one (to its details). Without it events are not interactive. */
  onOpenEvent?: (medication: AdminMedication, event: AdminEvent) => void;
  /** Open a when-required medicine (to give a dose). */
  onOpenAsRequired?: (medication: AdminMedication) => void;
  /** Alerts per medication id, shown in words after the status, e.g. { fluc: ['allergy alert'] }. */
  medicationAlerts?: Readonly<Record<string, ReadonlyArray<string>>>;
  /** Content shown instead of the agenda when a phone is in landscape, e.g. <DrugAdministrationChart ... /> (4-day chart). */
  landscapeChart?: React.ReactNode;
  /** Open the 4-day chart without rotating (rotation may be locked). Shows a button in the hint. */
  onOpenChart?: () => void;
  /** Show "Turn the phone sideways for the 4-day chart". Default true when `landscapeChart` or `onOpenChart` is given. */
  showLandscapeHint?: boolean;
  /** Accessible name of the agenda. Default "Drug chart". */
  label?: string;
  /** Region; otherwise read from ClinicalLocaleProvider. Codes (AU NIMC, NZ NMC), "When required" wording and lettering follow it. */
  region?: ClinicalRegion;
  className?: string;
}

function useMediaQuery(query: string): boolean {
  const get = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [query]);
  return matches;
}

const dayShort = (d: Date) => (
  <span>
    <span className="cui-mobile-agenda__weekday">{DAY_SHORT[d.getDay()]} </span>
    {String(d.getDate()).padStart(2, '0')}
  </span>
);

/** Medicine text for a row: drug name in bold with regional lettering, then the dose, route and frequency text. */
function MedText({ med, region }: { med: AdminMedication; region: ClinicalRegion }) {
  const name = med.line ? medicationDrugName(med.line, { region }) : applyTallManLettering(med.name, region);
  return (
    <>
      <strong>{name}</strong>
      {med.details ? ` ${med.details}` : null}
    </>
  );
}

/**
 * One-day drug chart for phones (concept P3): doses by time with a now line, a day switcher, each dose's state by shape
 * and words (with the region's code and meaning for doses not given), a when-required section with availability, and a
 * hint and slot for the 4-day chart in landscape.
 */
export function MobileDrugAgenda(props: MobileDrugAgendaProps) {
  const { medications, onOpenEvent, onOpenAsRequired, medicationAlerts = {}, landscapeChart, onOpenChart, label = 'Drug chart', className } = props;
  const now = props.now ?? new Date();
  const { region } = useClinicalLocale(props.region);
  const id = useId('cui-agenda');
  const [selected, setSelected] = useControllableState<DateLike>(props.selectedDate, props.defaultSelectedDate ?? now, d => props.onSelectedDateChange?.(adminStartOfDay(d)));
  const day = adminStartOfDay(selected);
  const today = adminStartOfDay(now);
  const landscape = useMediaQuery('(orientation: landscape) and (max-height: 520px)');
  const showHint = props.showLandscapeHint ?? !!(landscapeChart || onOpenChart);
  const agenda = mobileAgendaSlots(medications, day, now, region);
  const prev = adminAddDays(day, -1);
  const next = adminAddDays(day, 1);
  const rel = adminIsSameDay(day, today) ? 'Today' : adminIsSameDay(day, adminAddDays(today, -1)) ? 'Yesterday' : adminIsSameDay(day, adminAddDays(today, 1)) ? 'Tomorrow' : '';
  const asRequiredHeading = ADMIN_CHART_WORDING[region].asRequired;

  if (landscape && landscapeChart) {
    return <div className={cx('cui-mobile-agenda', 'cui-mobile-agenda--landscape', className)}>{landscapeChart}</div>;
  }

  const eventRow = (e: MobileAgendaEvent) => {
    const alerts = medicationAlerts[e.medication.id] ?? [];
    const status = [e.statusText, e.note, e.actionable ? alerts.join(', ') : ''].filter(Boolean).join(MOBILE_TEXT_SEPARATOR);
    const inner = (
      <>
        <MobileStatusMark shape={e.shape} glyph={e.glyph} round={e.medication.kind === 'onceOnly' && e.shape !== 'overdue' ? true : undefined} />
        <span className="cui-mobile-agenda__text">
          <span className="cui-mobile-agenda__name">
            <MedText med={e.medication} region={region} />
          </span>
          <span className={cx('cui-mobile-agenda__status', `cui-mobile-agenda__status--${e.shape}`)}>{status}</span>
        </span>
        {onOpenEvent ? <Icon name="chevron-right" size={20} /> : null}
      </>
    );
    return onOpenEvent ? (
      <button type="button" className="cui-mobile-agenda__event" onClick={() => onOpenEvent(e.medication, e.event)}>
        {inner}
      </button>
    ) : (
      <div className="cui-mobile-agenda__event">{inner}</div>
    );
  };

  return (
    <section className={cx('cui-mobile-agenda', className)} aria-label={label}>
      <nav className="cui-mobile-agenda__days" aria-label="Chart day">
        <button type="button" className="cui-mobile-agenda__day" aria-label={`Previous day, ${formatShortDate(prev, { dayOfWeek: true })}`} onClick={() => setSelected(prev)}>
          <Icon name="chevron-left" size={16} />
          {dayShort(prev)}
        </button>
        <button
          type="button"
          className="cui-mobile-agenda__day cui-mobile-agenda__day--current"
          aria-current={rel === 'Today' ? 'date' : undefined}
          aria-label={rel === 'Today' ? `Today, ${formatShortDate(day, { dayOfWeek: true })}` : `${formatShortDate(day, { dayOfWeek: true })}. Go to today`}
          onClick={() => setSelected(today)}
        >
          {rel ? <span className="cui-mobile-agenda__rel">{rel}</span> : <span className="cui-mobile-agenda__rel">Go to today</span>}
          <span className="cui-mobile-agenda__date">
            {DAY_SHORT[day.getDay()]} <span className="cui-mobile-agenda__date-part">{formatShortDate(day)}</span>
          </span>
        </button>
        <button type="button" className="cui-mobile-agenda__day" aria-label={`Next day, ${formatShortDate(next, { dayOfWeek: true })}`} onClick={() => setSelected(next)}>
          {dayShort(next)}
          <Icon name="chevron-right" size={16} />
        </button>
      </nav>

      <h2 id={`${id}-sched`} className="cui-visually-hidden">
        Scheduled doses, {formatShortDate(day, { dayOfWeek: true })}
      </h2>
      {agenda.slots.length ? (
        <ol className="cui-mobile-agenda__slots" aria-labelledby={`${id}-sched`}>
          {agenda.slots.map((s, i) => (
            <React.Fragment key={s.key}>
              {i === agenda.nowIndex ? <NowLine now={now} /> : null}
              <li className={cx('cui-mobile-agenda__slot', `cui-mobile-agenda__slot--${s.tone}`)}>
                <span className="cui-mobile-agenda__time">{s.label}</span>
                <ul className="cui-mobile-agenda__events" aria-label={`${s.label}`}>
                  {s.events.map(e => (
                    <li key={e.key}>{eventRow(e)}</li>
                  ))}
                </ul>
              </li>
            </React.Fragment>
          ))}
          {agenda.nowIndex === agenda.slots.length ? <NowLine now={now} /> : null}
        </ol>
      ) : (
        <p className="cui-mobile-agenda__empty">No scheduled doses on this day.</p>
      )}

      {agenda.asRequired.length ? (
        <>
          <h2 className="cui-mobile-step-label cui-mobile-agenda__prn-title">{asRequiredHeading}</h2>
          <ul className="cui-mobile-agenda__prn">
            {agenda.asRequired.map(a => {
              const inner = (
                <>
                  <MobileStatusMark shape={a.available ? 'available' : 'unavailable'} />
                  <span className="cui-mobile-agenda__text">
                    <span className="cui-mobile-agenda__name">
                      <MedText med={a.medication} region={region} />
                    </span>
                    <span className={cx('cui-mobile-agenda__status', a.available ? 'cui-mobile-agenda__status--available' : 'cui-mobile-agenda__status--scheduled')}>
                      {[a.statusText, a.lastText, a.givenOnDay > 1 ? `${a.givenOnDay} doses this day` : ''].filter(Boolean).join(MOBILE_TEXT_SEPARATOR)}
                    </span>
                  </span>
                  {onOpenAsRequired ? <Icon name="chevron-right" size={20} /> : null}
                </>
              );
              return (
                <li key={a.medication.id}>
                  {onOpenAsRequired ? (
                    <button type="button" className="cui-mobile-agenda__event" onClick={() => onOpenAsRequired(a.medication)}>
                      {inner}
                    </button>
                  ) : (
                    <div className="cui-mobile-agenda__event">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {showHint ? (
        <div className="cui-mobile-agenda__hint">
          <MobileGlyph name="rotate" size={20} />
          <span>Turn the phone sideways for the 4-day chart.</span>
          {onOpenChart ? (
            <TouchButton size={48} variant="quiet" onClick={onOpenChart}>
              Open 4-day chart
            </TouchButton>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function NowLine({ now }: { now: Date }) {
  return (
    <li className="cui-mobile-agenda__now-item">
      <div role="separator" aria-label={`Now ${formatTime(now)}`} className="cui-mobile-agenda__now">
        <span className="cui-mobile-agenda__now-label" aria-hidden="true">
          Now {formatTime(now)}
        </span>
        <span className="cui-mobile-agenda__now-rule" aria-hidden="true" />
      </div>
    </li>
  );
}
