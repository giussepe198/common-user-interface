import React from 'react';
import { Icon, cx, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { ewsDefaultChart, ewsZone, scoreEarlyWarning } from '../../lists';
import type { EwsChartDefinition, EwsModification, EwsObservationSet, EwsResult } from '../../lists';
import { MedicationLine, type MedicationLineData } from '../../medications';
import { TouchButton } from '../../touch';
import { MobilePatientHeader, type MobilePatientHeaderProps } from '../MobilePatientHeader/MobilePatientHeader';
import { MobileTabBar, type MobileTabItem } from '../MobileTabBar/MobileTabBar';
import { MobileStatusMark } from '../internal/MobileStatusMark';
import type { MobilePatientIdentity } from '../utils/mobileIdentity';
import { mobileRelativeTime } from '../utils/mobileTime';
import { mobileEwsHeadline } from '../utils/mobileEarlyWarning';

/** Early warning card data (concept A1). */
export interface MobileSummaryEarlyWarning {
  /** A result already scored with `scoreEarlyWarning`. Either this or `observation`. */
  result?: EwsResult | null;
  /** The latest observation set, scored here. */
  observation?: EwsObservationSet | null;
  /** Chart definition. Default the region's chart: GB NEWS2, AU ADDS (placeholder scores), NZ NZEWS (AU-OB-01). */
  definition?: EwsChartDefinition;
  /** Patient-specific modifications (AU-OB-05, G11 12.4). */
  modifications?: EwsModification[];
  /** When the next observations are due. */
  nextDueAt?: DateLike | null;
  /** Record observations (opens P2). */
  onRecord?: () => void;
  /** Button text. Default "Record observations". */
  recordLabel?: string;
}

/** A medicine due soon, for the "Medicines due" card. */
export interface MobileSummaryDueMedicine {
  id: string;
  line: MedicationLineData;
  /** Due state, shown by shape and word. */
  state: 'overdue' | 'due' | 'next';
  /** Scheduled time. */
  at: DateLike;
}

/** A high-priority alert card (decision support, MEDa alert levels). */
export interface MobileSummaryAlert {
  id: string;
  /** Heading. Default "High priority alert". */
  title?: string;
  /** What the alert says, in full. */
  message: React.ReactNode;
  /** Button text. Default "Review alert". */
  actionLabel?: string;
  onAction?: () => void;
}

export interface MobileSummaryProps {
  /** The patient; the header is always shown and never truncated. */
  patient: MobilePatientIdentity;
  /** Early warning score card. Omit to hide it. */
  earlyWarning?: MobileSummaryEarlyWarning | null;
  /** Medicines due, overdue first. Omit or pass [] to show "No medicines due". */
  medicinesDue?: ReadonlyArray<MobileSummaryDueMedicine>;
  /** Open a medicine due (B2). */
  onOpenMedicine?: (item: MobileSummaryDueMedicine) => void;
  /** Open the full medicines list (A3). */
  onAllMedicines?: () => void;
  /** High-priority alerts. */
  alerts?: ReadonlyArray<MobileSummaryAlert>;
  /** Patient record tabs. Default Summary, Medicines, Obs, Notes, More with Summary current. */
  tabs?: ReadonlyArray<MobileTabItem>;
  /** Current tab id. Default 'summary'. */
  currentTab?: string;
  onTabSelect?: (id: string) => void;
  /** Extra sections after the cards. */
  children?: React.ReactNode;
  /** Header settings (e.g. onRevealProtected, detailsSheetProps). */
  headerProps?: Partial<Omit<MobilePatientHeaderProps, 'patient'>>;
  /** Current time. Default now. */
  now?: Date;
  /** Region; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  className?: string;
}

/** Default patient record tabs (concept A1). */
export const MOBILE_RECORD_TABS: MobileTabItem[] = [
  { id: 'summary', label: 'Summary', icon: 'summary' },
  { id: 'medicines', label: 'Medicines', icon: 'medicines' },
  { id: 'obs', label: 'Obs', icon: 'obs' },
  { id: 'notes', label: 'Notes', icon: 'notes' },
  { id: 'more', label: 'More', icon: 'dots' },
];

function EarlyWarningCard({ ews, region, now }: { ews: MobileSummaryEarlyWarning; region: ClinicalRegion; now: Date }) {
  const id = useId('cui-msum-ews');
  const def = ews.definition ?? ewsDefaultChart(region);
  const result = ews.result ?? (ews.observation ? scoreEarlyWarning(def, ews.observation, ews.modifications ?? []) : null);
  const zone = result ? ewsZone(def, result.zone) : null;
  const zonesOnly = def.scoring === 'zones';
  const total = result ? (zonesOnly ? '' : result.complete ? String(result.total) : `${result.total} or more`) : '';
  const fill = zone?.colourVar ? ({ ['--cui-msum-zone' as string]: `var(${zone.colourVar})` } as React.CSSProperties) : undefined;
  return (
    <section className="cui-mobile-summary__card" aria-labelledby={`${id}-t`}>
      <div className="cui-mobile-summary__card-head">
        <h2 id={`${id}-t`} className="cui-mobile-summary__card-title">
          Early warning score
        </h2>
        {result?.time ? <span className="cui-mobile-summary__muted">Last {mobileRelativeTime(result.time, now)}</span> : null}
      </div>
      {result && zone ? (
        <div className={cx('cui-mobile-summary__zone', zone.colourVar && 'cui-mobile-summary__zone--filled')} style={fill}>
          {total ? (
            <span className="cui-mobile-summary__score" aria-label={`${def.totalLabel} ${total}`}>
              {total}
            </span>
          ) : null}
          <span className="cui-mobile-summary__zone-text">
            <strong>{mobileEwsHeadline(def, result)}</strong>
            {result.response ? <span>{result.response.response}</span> : null}
          </span>
        </div>
      ) : (
        <p className="cui-mobile-summary__empty">No observations recorded</p>
      )}
      <div className="cui-mobile-summary__card-body">
        {result && !result.complete ? (
          <span className="cui-mobile-summary__note">
            <Icon name="warning" size={16} />
            Incomplete: {result.missing.join(', ')} not recorded. {zonesOnly ? 'The zone may be more severe.' : 'The score may be higher.'}
          </span>
        ) : null}
        {result?.placeholder ? (
          <span className="cui-mobile-summary__note">
            <Icon name="warning" size={16} />
            Placeholder scores: not for clinical use.
          </span>
        ) : null}
        {(def.mandatoryText ?? []).map(t => (
          <span key={t} className="cui-mobile-summary__mandatory">
            {t}
          </span>
        ))}
        {ews.nextDueAt ? (
          <span className="cui-mobile-summary__muted">
            Next observations due <strong className="cui-mobile-summary__strong">{mobileRelativeTime(ews.nextDueAt, now)}</strong>
          </span>
        ) : null}
        {ews.onRecord ? (
          <TouchButton size={48} variant="primary" fullWidth onClick={ews.onRecord}>
            {ews.recordLabel ?? 'Record observations'}
          </TouchButton>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Patient summary for phones (concept A1): patient header, early warning card (score, zone in words, next due, record
 * button), medicines due, high-priority alerts and the patient record tab bar. Composed from the mobile pieces.
 */
export function MobileSummary(props: MobileSummaryProps) {
  const {
    patient,
    earlyWarning,
    medicinesDue = [],
    onOpenMedicine,
    onAllMedicines,
    alerts = [],
    tabs = MOBILE_RECORD_TABS,
    currentTab = 'summary',
    onTabSelect,
    children,
    headerProps,
    className,
  } = props;
  const now = props.now ?? new Date();
  const { region } = useClinicalLocale(props.region);
  const id = useId('cui-msum');
  const word = (s: MobileSummaryDueMedicine['state']) => (s === 'overdue' ? 'Overdue' : s === 'due' ? 'Due' : 'Next');

  return (
    <div className={cx('cui-mobile-summary', className)}>
      <MobilePatientHeader sticky {...headerProps} patient={patient} region={region} now={now} />
      <main className="cui-mobile-summary__main">
        {earlyWarning ? <EarlyWarningCard ews={earlyWarning} region={region} now={now} /> : null}

        <section className="cui-mobile-summary__card" aria-labelledby={`${id}-due`}>
          <div className="cui-mobile-summary__card-head">
            <h2 id={`${id}-due`} className="cui-mobile-summary__card-title">
              Medicines due
            </h2>
            {onAllMedicines ? (
              <TouchButton size={48} variant="quiet" onClick={onAllMedicines} className="cui-mobile-summary__link">
                All medicines
              </TouchButton>
            ) : null}
          </div>
          {medicinesDue.length ? (
            <ul className="cui-mobile-summary__due">
              {medicinesDue.map(m => {
                const inner = (
                  <>
                    <span className={cx('cui-mobile-summary__due-status', `cui-mobile-summary__due-status--${m.state}`)}>
                      <span className="cui-mobile-summary__due-word">
                        <MobileStatusMark shape={m.state === 'next' ? 'scheduled' : m.state} small />
                        {word(m.state)}
                      </span>
                      <span className="cui-mobile-summary__due-time">{mobileRelativeTime(m.at, now)}</span>
                    </span>
                    <MedicationLine {...m.line} region={region} block className="cui-mobile-summary__due-line" />
                  </>
                );
                return (
                  <li key={m.id}>
                    {onOpenMedicine ? (
                      <button type="button" className="cui-mobile-summary__due-row" onClick={() => onOpenMedicine(m)}>
                        {inner}
                      </button>
                    ) : (
                      <div className="cui-mobile-summary__due-row">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="cui-mobile-summary__empty">No medicines due</p>
          )}
        </section>

        {alerts.map(a => (
          <section key={a.id} className="cui-mobile-summary__alert" aria-labelledby={`${id}-a-${a.id}`}>
            <Icon name="error" size={20} />
            <div className="cui-mobile-summary__alert-body">
              <h2 id={`${id}-a-${a.id}`} className="cui-mobile-summary__card-title">
                {a.title ?? 'High priority alert'}
              </h2>
              <div className="cui-mobile-summary__alert-text">{a.message}</div>
              {a.onAction ? (
                <TouchButton size={48} onClick={a.onAction} className="cui-mobile-summary__alert-action">
                  {a.actionLabel ?? 'Review alert'}
                </TouchButton>
              ) : null}
            </div>
          </section>
        ))}
        {children}
      </main>
      <MobileTabBar items={tabs} current={currentTab} onSelect={id2 => onTabSelect?.(id2)} />
    </div>
  );
}

