import React from 'react';
import { cx, Icon } from '../../core';
import type { ClinicalRegion } from '../../core';
import { MedicationLine } from '../../medications';
import { adminKindLabelFor, adminMidnightScheduleNote } from '../utils/adminRegion';
import { formatDateTime, formatShortDate, formatTime, toDate } from '../../core/format';
import { adminIsSameDay } from '../utils/adminChart';
import type { AdminMedication} from '../utils/adminEvents';
import { adminIsAsRequired } from '../utils/adminEvents';

export type AdminInfoTab = 'verification' | 'instructions' | 'prescriber';

interface MedicationLeftPanelProps {
  medication: AdminMedication;
  isPast: boolean;
  lockoutEnd: Date | null;
  now: Date;
  medicationLine?: React.ReactNode;
  onOpenInfo: (tab: AdminInfoTab) => void;
  region: ClinicalRegion;
}

/** Default drug details: the medications area's MedicationLine (MEDa-0265). */
export function AdminDefaultMedicationLine({ medication: m }: { medication: AdminMedication }) {
  if (m.line) return <MedicationLine {...m.line} block className="cui-dac-lhp__medline" />;
  return (
    <>
      <MedicationLine genericName={m.name} className="cui-dac-lhp__medline" />
      {m.details ? <span className="cui-dac-lhp__details"> {m.details}</span> : null}
    </>
  );
}

/**
 * Left-hand panel: drug details at the top, status icons in a fixed place with verification
 * leftmost, then prescriber, start, end or review, or a past label (MEDa-0042 to MEDa-0046, 0222 to 0229).
 */
export function MedicationLeftPanel({ medication: m, isPast, lockoutEnd, now, medicationLine, onOpenInfo, region }: MedicationLeftPanelProps) {
  const kindLabel = adminKindLabelFor(m.kind, region);
  const midnight = adminMidnightScheduleNote(m.scheduledTimes, region);
  const end = toDate(m.endDate ?? null);
  const review = toDate(m.reviewDate ?? null);
  return (
    <div className="cui-dac-lhp__inner">
      <div className="cui-dac-lhp__top">
        <div className="cui-dac-lhp__line">
          {medicationLine ?? <AdminDefaultMedicationLine medication={m} />}
        </div>
        {m.verification || m.instructions ? (
          <span className="cui-dac-lhp__status-icons">
            {m.verification ? (
              <button
                type="button"
                tabIndex={-1}
                className={cx('cui-dac-lhp__status', `cui-dac-lhp__status--${m.verification}`)}
                title={m.verification === 'verified' ? 'Verified by pharmacist' : 'Awaiting pharmacist verification'}
                aria-label={m.verification === 'verified' ? 'Verified by pharmacist' : 'Awaiting pharmacist verification'}
                onClick={e => {
                  e.stopPropagation();
                  onOpenInfo('verification');
                }}
              >
                {m.verification === 'verified' ? <Icon name="check" size={16} /> : <span className="cui-dac-lhp__awaiting" aria-hidden="true">P</span>}
              </button>
            ) : null}
            {m.instructions ? (
              <button
                type="button"
                tabIndex={-1}
                className="cui-dac-lhp__status"
                title="Additional administration instructions"
                aria-label="Additional administration instructions"
                onClick={e => {
                  e.stopPropagation();
                  onOpenInfo('instructions');
                }}
              >
                <Icon name="info" size={16} />
              </button>
            ) : null}
          </span>
        ) : null}
      </div>
      {kindLabel || m.asRequired?.criteria ? (
        <div className="cui-dac-lhp__kind">
          {kindLabel ? <span className={cx('cui-dac-lhp__tag', `cui-dac-lhp__tag--${m.kind === 'onceOnly' ? 'once' : adminIsAsRequired(m.kind) ? 'prn' : 'sd'}`)}>{kindLabel}</span> : null}
          {m.asRequired?.criteria ? <span className="cui-dac-lhp__criteria">{m.asRequired.criteria}</span> : null}
        </div>
      ) : null}
      {midnight ? (
        <div className="cui-dac-lhp__midnight">
          <Icon name="clock" size={16} />
          <span>{midnight}</span>
        </div>
      ) : null}
      {lockoutEnd ? (
        <div className="cui-dac-lhp__lockout">
          <Icon name="lock" size={16} />
          <span>
            Time restriction until {adminIsSameDay(lockoutEnd, now) ? formatTime(lockoutEnd) : formatDateTime(lockoutEnd)}
          </span>
        </div>
      ) : null}
      {m.prescriber ? (
        <button
          type="button"
          tabIndex={-1}
          className="cui-dac-lhp__meta cui-dac-lhp__prescriber"
          onClick={e => {
            e.stopPropagation();
            onOpenInfo('prescriber');
          }}
        >
          <Icon name="user" label="Prescriber" size={16} /> {m.prescriber}
        </button>
      ) : null}
      <div className="cui-dac-lhp__meta">
        <span className="cui-dac-lhp__meta-label">{m.startIsActual ? 'Started' : 'Start'}</span> {formatDateTime(m.startDate)}
      </div>
      {isPast ? (
        <div className="cui-dac-lhp__meta">
          <span className="cui-dac-lhp__past">{m.pastState === 'discontinued' ? 'Discontinued' : 'Completed'}</span>
          {end ? ` ${formatDateTime(end)}` : ''}
        </div>
      ) : end ? (
        <div className="cui-dac-lhp__meta">
          <span className="cui-dac-lhp__meta-label">End</span> {formatDateTime(end)}
        </div>
      ) : review ? (
        <div className="cui-dac-lhp__meta">
          <span className="cui-dac-lhp__meta-label">Review</span> {formatShortDate(review)}
        </div>
      ) : null}
    </div>
  );
}

interface InfoPanelProps {
  medication: AdminMedication;
  tab: AdminInfoTab;
  onTab: (t: AdminInfoTab) => void;
  onClose: () => void;
  id: string;
}

/** Information panel extending downwards from the LHP, tabs in LHP icon order then Prescriber (MEDa-0060 to MEDa-0063). */
export function MedicationInfoPanel({ medication: m, tab, onTab, onClose, id }: InfoPanelProps) {
  const tabs: { id: AdminInfoTab; label: string; icon: 'check' | 'info' | 'user' }[] = [];
  if (m.verification) tabs.push({ id: 'verification', label: 'Verification', icon: 'check' });
  if (m.instructions) tabs.push({ id: 'instructions', label: 'Instructions', icon: 'info' });
  tabs.push({ id: 'prescriber', label: 'Prescriber', icon: 'user' });
  const active = tabs.some(t => t.id === tab) ? tab : tabs[0].id;
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  React.useEffect(() => {
    refs.current[active]?.focus();
  }, [active]);
  return (
    <div
      className="cui-dac-info"
      role="region"
      aria-label={`Information for ${m.name}`}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="cui-dac-info__tabs" role="tablist" aria-label="Medication information">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el; }}
            type="button"
            role="tab"
            id={`${id}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${id}-panel`}
            tabIndex={active === t.id ? 0 : -1}
            className="cui-dac-info__tab"
            onClick={() => onTab(t.id)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
                onTab(n.id);
              }
            }}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
        <button type="button" className="cui-dac-info__close" aria-label="Close information" onClick={onClose}>
          <Icon name="close" size={16} />
        </button>
      </div>
      <div className="cui-dac-info__panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
        {active === 'verification' ? (
          m.verification === 'verified' ? (
            <p>
              Verified by {m.verifiedBy ?? 'a pharmacist'}
              {m.verifiedAt ? ` on ${formatDateTime(m.verifiedAt)}` : ''}.
            </p>
          ) : (
            <p>Awaiting pharmacist verification.</p>
          )
        ) : active === 'instructions' ? (
          <p>{m.instructions}</p>
        ) : (
          <p>Prescribed by {m.prescriber ?? 'unknown prescriber'}.</p>
        )}
      </div>
    </div>
  );
}
