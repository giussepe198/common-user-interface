import React from 'react';
import { cx, Icon, toDate, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { AddressDisplay, LabelledValue, PatientBanner, TelephoneNumberDisplay } from '../../patient';
import type { PatientBannerAddress, PatientBannerAllergies, PatientBannerContacts, PatientBannerItem, PatientBannerName, PatientBannerSection, PatientIdentifier } from '../../patient';
import { MobilePatientHeader } from '../../mobile';
import { AlertSymbol } from '../../datetime';
import type { LegalStatusBadgeProps } from '../LegalStatusBadge/LegalStatusBadge';
import { ConsentIndicator } from '../ConsentIndicator/ConsentIndicator';
import type { ConsentIndicatorProps } from '../ConsentIndicator/ConsentIndicator';
import { BreakGlassBar } from '../BreakGlassBar/BreakGlassBar';
import type { BreakGlassBarProps } from '../BreakGlassBar/BreakGlassBar';
import { RISK_ALERT_SEVERITY_LABELS, RISK_ALERT_SYMBOL } from '../RiskAlertItem/RiskAlertItem';
import { MhGlyph } from '../internal/MhGlyph';
import { mhFormatZonedDate, mhKnownAs } from '../utils/mentalHealth';
import type { MhAlertSeverity } from '../utils/mentalHealth';

/** One alert counted in the banner. The words are read in the alert panel or list. */
export interface MhBannerAlert {
  id: string;
  severity: MhAlertSeverity;
  /** The alert in words, e.g. "Safety to staff: two staff for home visits". */
  text: string;
}

/** Allergy summary. */
export interface MhBannerAllergies {
  /** known: one or more recorded. none-known: "No known allergies" was recorded. not-recorded: nothing recorded yet. */
  status: 'known' | 'none-known' | 'not-recorded';
  /** Each allergy; `note` (e.g. "Not yet verified") shows in the expanded list. */
  items?: ReadonlyArray<{ name: string; reaction?: string; note?: string }>;
  /** When "none known" was last checked. */
  checkedAt?: DateLike | null;
  /** The summary in the host's words (e.g. "Allergies: Nil known"); default built from the status and items. */
  text?: string;
}

/** A legal status for the banner: the badge words plus how near its end is (OrderCountdown). */
export interface MhBannerLegalStatus extends LegalStatusBadgeProps {
  /** "in 3 days", "passed 57 days ago": shown in the band only when `countdownTone` is soon, urgent or expired. */
  countdown?: string;
  countdownTone?: 'calm' | 'soon' | 'urgent' | 'expired';
}

/** Banner words; legal and service words come from the host. Defaults [suggested]. */
export interface MhPatientBannerLabels {
  sex: string;
  recordNumber: string;
  noRecordNumber: string;
  legalStatus: string;
  noLegalStatus: string;
  alerts: string;
  noAlerts: string;
  /** The alert count in words, e.g. "2 high, 3 other". */
  alertCount: (high: number, other: number) => string;
  showAllAlerts: string;
  moreOrders: (n: number) => string;
  interpreter: string;
  allergy: string;
  allergies: string;
  noKnownAllergies: string;
  allergiesNotRecorded: string;
  restricted: string;
  careTeam: string;
  sharing: string;
  unknown: string;
}

const DEFAULT_LABELS: MhPatientBannerLabels = {
  sex: 'Sex',
  recordNumber: 'Record number',
  noRecordNumber: 'No record number',
  legalStatus: 'Legal status',
  noLegalStatus: 'No order recorded',
  alerts: 'Alerts',
  noAlerts: 'No alerts recorded',
  alertCount: (high, other) => (high ? `${high} high${other ? `, ${other} other` : ''}` : `None high, ${other} other`),
  showAllAlerts: 'Show all alerts',
  moreOrders: (n) => `and ${n} more`,
  interpreter: 'Interpreter needed',
  allergy: 'Allergy',
  allergies: 'Allergies',
  noKnownAllergies: 'No known allergies',
  allergiesNotRecorded: 'Allergies not recorded',
  restricted: 'Restricted information held',
  careTeam: 'Care team',
  sharing: 'Sharing',
  unknown: 'Not Known',
};

/** On a phone these wait in the expanded details so the header stays short; safety items and host markers stay in it. */
const PHONE_DETAILS = new Set(['interpreter', 'consent', 'restricted']);
const NEAR = new Set(['soon', 'urgent', 'expired']);
const RESTRICTION = new Set(['restricted', 'withdrawn']);

export interface MhPatientBannerProps {
  /** Region: name case and identifier formats follow it (G10, G11). Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Legal name, shown as "FAMILY, Given" without labels and never truncated (PAB-0049..0053). */
  name: PatientBannerName;
  /** The name already rendered by the host (still "FAMILY, Given"); `name` still names the banner. */
  nameContent?: React.ReactNode;
  familyNameCase?: 'upper' | 'as-recorded';
  showTitle?: boolean;
  /** Preferred name as the person gave it: "Known as Lan" after the name when it differs. */
  preferredName?: string | null;
  /** Pronouns in the person's words, e.g. "she/her". */
  pronouns?: string | null;
  /** More after "Known as", e.g. how to say the name (muted). */
  nameExtension?: React.ReactNode;
  /** Same or similar name warning, below the name (AU-PI-04). May hold a link. */
  similarNameWarning?: React.ReactNode;
  /** Before the name, e.g. a consented photo where policy allows (PAB-0021 recommends none). */
  leading?: React.ReactNode;
  /** Date of birth: "Born dd-Mmm-yyyy (age)" with the CUI age (PAB-0033; PAB-0034). */
  dateOfBirth?: DateLike | null;
  /** The Born value already formatted by the host; overrides `dateOfBirth` for display. */
  bornText?: React.ReactNode;
  /** Date of death: "Died" with the deceased look (PAB-0055). */
  dateOfDeath?: DateLike | null;
  /** Deceased with the Died value already formatted ("02-Oct-2026"), or `true` when the date is not known. */
  deceased?: React.ReactNode | true;
  /** The person's current sex in the host's words (value set `sex`); "Not Known" when none. */
  sex?: React.ReactNode | null;
  /** The service record number, labelled with `labels.recordNumber`. Never truncated (NUM-0001). */
  recordNumber?: React.ReactNode | null;
  /** Identifiers the host marks for the header (IHI; NHI; Medicare), shown with the CUI identifier display. */
  identifiers?: ReadonlyArray<PatientIdentifier>;
  /** Current legal statuses, most restrictive first by the host's precedence. The first shows in the band. */
  legalStatuses?: ReadonlyArray<MhBannerLegalStatus>;
  /** Opens the legal status history from the band. Default the first status's `onOpen`. */
  onOpenLegalStatus?: () => void;
  /** Full legal status details (end, source, "Why this date") for Zone 2. */
  legalDetails?: React.ReactNode;
  /** Active alerts: the band shows their count by severity with the highest severity's symbol. */
  alerts?: ReadonlyArray<MhBannerAlert>;
  /** Opens the full alert list (the count becomes a button). */
  onShowAllAlerts?: () => void;
  /** The interpreter language in words ("Vietnamese"); shown as "Interpreter needed Vietnamese" when present. */
  interpreter?: string | null;
  /** Allergy summary. Omitted is treated as not recorded, never as none known. */
  allergies?: MhBannerAllergies | null;
  /** Consent to share: a restriction shows in the band; otherwise in Zone 2. */
  consent?: ConsentIndicatorProps | null;
  /** Restricted information is held: the marker in words, never what it is. A string replaces the words. */
  restricted?: boolean | string;
  /** Active emergency access grant: the bar shows at the top of the banner. */
  emergencyAccess?: BreakGlassBarProps | null;
  /** More band items (markers, assurance, other identifiers). */
  items?: ReadonlyArray<PatientBannerItem>;
  /** Address and contact details for Zone 2 (PAB-0025..0030). */
  address?: PatientBannerAddress | null;
  contacts?: PatientBannerContacts | null;
  /** Zone 2 section 3: the care team and key clinician. */
  careTeam?: PatientBannerSection;
  /** Zone 2 section 4. Default: sharing (consent) with the legal details. */
  safetySection?: PatientBannerSection;
  /** Actions at the end of Zone 1, e.g. "Safety summary". */
  actions?: React.ReactNode;
  /** Show Zone 2. Default true. */
  showZone2?: boolean;
  zone2Expanded?: boolean;
  defaultZone2Expanded?: boolean;
  onZone2ExpandedChange?: (expanded: boolean) => void;
  /** Words. Legal and service words come from the host. */
  labels?: Partial<MhPatientBannerLabels>;
  /** Keep the banner at the top of its scrolling container (PAB-0009, PAB-0011). Default true. */
  sticky?: boolean;
  /**
   * "auto" (default): the CUI PatientBanner, and the CUI MobilePatientHeader when the banner's own width is under
   * `phoneBelow`. "desktop" or "phone" force one.
   */
  layout?: 'auto' | 'desktop' | 'phone';
  /** Width in px below which "auto" shows the phone header. Default 600. */
  phoneBelow?: number;
  /** Print: light colours, nothing interactive. */
  print?: boolean;
  /**
   * The compact form, for while a panel or dialog opens below the banner and the full banner would leave it too little of
   * the screen [suggested]. Every identity and safety item stays (name, Born, sex, record number, legal status, the alert
   * count, allergies, markers): the phone header packs them closer in smaller type and its open details wait closed;
   * the desktop banner keeps Zone 2 collapsed. Nothing is removed and no item changes place, so focus kept on a band
   * item stays put. Turn it off when the panel closes; the details and Zone 2 come back as they were.
   */
  compact?: boolean;
  /** Phone header only: a back button before the name, as in the mobile patient review (MobilePatientHeader `onBack`) [suggested]. */
  onBack?: () => void;
  /** Accessible name of the back button ("Back to today's visits"). Default "Back". */
  backLabel?: string;
  /** "Now" for the age. */
  now?: DateLike;
  /** IANA zone for dates. Default the locale's zone. */
  timeZone?: string;
  className?: string;
}

/** The banner's own width, measured (a container query cannot swap components). */
function useOwnWidth(ref: React.RefObject<HTMLElement | null>, active: boolean): number | null {
  const [width, setWidth] = React.useState<number | null>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!active || !el || typeof ResizeObserver === 'undefined') return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, active]);
  return width;
}

/**
 * The mental health patient banner: the CUI PatientBanner (one dark band) with preferred name and pronouns and the mental health
 * items in Zone 1, and the CUI MobilePatientHeader on a narrow banner. Zone 1: "FAMILY, Given", "Known as Lan
 * (she/her)", Born with the CUI age, Sex in the host's words, the record number and host identifiers, then legal status
 * (most restrictive order, with its countdown words when near or past its end), the alert count by severity, an
 * interpreter, restricted information and a sharing restriction. Zone 2 (collapsed): address, phone and email, care team,
 * sharing and legal details, allergies. Nothing truncates; allergies are never "none known" unless
 * recorded so.
 */
export function MhPatientBanner({
  region: regionProp,
  name,
  nameContent,
  familyNameCase,
  showTitle,
  preferredName,
  pronouns,
  nameExtension,
  similarNameWarning,
  leading,
  dateOfBirth,
  bornText,
  dateOfDeath,
  deceased,
  sex,
  recordNumber,
  identifiers,
  legalStatuses,
  onOpenLegalStatus,
  legalDetails,
  alerts,
  onShowAllAlerts,
  interpreter,
  allergies,
  consent,
  restricted = false,
  emergencyAccess,
  onBack,
  backLabel,
  items: extraItems,
  address,
  contacts,
  careTeam,
  safetySection,
  actions,
  showZone2 = true,
  zone2Expanded,
  defaultZone2Expanded,
  onZone2ExpandedChange,
  labels: labelsProp,
  sticky = true,
  layout = 'auto',
  phoneBelow = 600,
  print = false,
  compact = false,
  now,
  timeZone: tzProp,
  className,
}: MhPatientBannerProps) {
  const locale = useClinicalLocale(regionProp);
  const region = locale.region;
  const timeZone = tzProp ?? locale.timeZone;
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const id = useId('cui-mh-banner');
  const ref = React.useRef<HTMLDivElement | null>(null);
  const width = useOwnWidth(ref, layout === 'auto' && !print);
  const phone = !print && (layout === 'phone' || (layout === 'auto' && !!width && width < phoneBelow));
  const [phoneOpen, setPhoneOpen] = React.useState(false);

  const knownAs = mhKnownAs({ givenName: name.givenName, familyName: name.familyName, preferredName, pronouns });
  const extension =
    knownAs || nameExtension ? (
      <>
        {knownAs ? (
          <span className="cui-mh-banner__known-as" data-known-as="">
            {knownAs.text}
          </span>
        ) : null}
        {nameExtension ? <span className="cui-mh-banner__name-more">{nameExtension}</span> : null}
      </>
    ) : null;

  // Zone 1 items in this order: identity first, then legal status, alerts and the markers.
  const sexWords = typeof sex === 'string' ? sex.trim() : sex;
  const rec = typeof recordNumber === 'string' ? recordNumber.trim() : recordNumber;
  const items: PatientBannerItem[] = [
    { id: 'sex', label: labels.sex, value: sexWords || labels.unknown, placement: 'after-born', className: 'cui-mh-banner__sex' },
    { id: 'record-number', label: labels.recordNumber, value: rec || labels.noRecordNumber, placement: 'after-born', className: 'cui-mh-banner__record' },
  ];

  const statuses = legalStatuses ?? [];
  const first = statuses[0];
  // On a phone the legal item shows the order alone; its warning words wait in the details, its symbol and tone stay.
  let legalShort: string | null = null;
  let legalFull: string | null = null;
  if (first) {
    const near = first.countdownTone && NEAR.has(first.countdownTone) && first.countdown;
    const warn = first.state === 'unconfirmed' || first.state === 'ended' || first.countdownTone === 'expired';
    const words = [
      first.state === 'historic' ? `${first.historicLabel ?? 'Historic'}: ${first.label}` : first.label,
      first.state === 'unconfirmed' && first.warning ? first.warning : null,
      near ? first.countdown : null,
      statuses.length > 1 ? labels.moreOrders(statuses.length - 1) : null,
    ].filter(Boolean);
    const open = print ? undefined : onOpenLegalStatus ?? first.onOpen;
    legalShort = [first.state === 'historic' ? `${first.historicLabel ?? 'Historic'}: ${first.label}` : first.label, near ? first.countdown : null, statuses.length > 1 ? labels.moreOrders(statuses.length - 1) : null].filter(Boolean).join(' · ');
    legalFull = words.length > 1 ? words.join(' · ') : null;
    items.push({
      id: 'legal-status',
      label: labels.legalStatus,
      // At a glance the order alone; why it needs checking is one click away in Zone 2 (privacy on a shared screen).
      value: legalShort ?? words.join(' · '),
      symbol:
        first.state === 'unconfirmed' ? (
          <span className="cui-mh-banner__symbol">
            <AlertSymbol kind="warning" label={first.warning ?? 'Status not confirmed'} />
          </span>
        ) : first.state === 'ended' ? (
          <Icon name="error" size={16} />
        ) : first.state === 'historic' ? (
          <Icon name="history" size={16} />
        ) : (
          <MhGlyph name="scale" />
        ),
      tone: warn ? 'warning' : 'default',
      onSelect: open,
      selectLabel: open ? `${labels.legalStatus}: ${words.join('. ')}` : undefined,
      className: 'cui-mh-banner__legal',
    });
  } else {
    items.push({ id: 'legal-status', label: labels.legalStatus, value: labels.noLegalStatus, className: 'cui-mh-banner__legal' });
  }

  const list = alerts ?? [];
  const high = list.filter((a) => a.severity === 'high').length;
  const top: MhAlertSeverity | null = high ? 'high' : list.some((a) => a.severity === 'moderate') ? 'moderate' : list.length ? 'low' : null;
  const alertWords = list.length ? labels.alertCount(high, list.length - high) : labels.noAlerts;
  items.push({
    id: 'alerts',
    label: labels.alerts,
    value: alertWords,
    symbol: top ? <AlertSymbol kind={RISK_ALERT_SYMBOL[top]} label={RISK_ALERT_SEVERITY_LABELS[top]} /> : null,
    tone: high ? 'alert' : 'default',
    onSelect: onShowAllAlerts && !print ? onShowAllAlerts : undefined,
    selectLabel: onShowAllAlerts && !print ? `${labels.alerts}: ${alertWords}. ${labels.showAllAlerts}` : undefined,
    className: 'cui-mh-banner__alerts',
  });

  const lang = (interpreter ?? '').trim();
  if (lang) items.push({ id: 'interpreter', label: labels.interpreter, value: lang, className: 'cui-mh-banner__interpreter' });
  if (consent && RESTRICTION.has(consent.state)) {
    items.push({ id: 'consent', value: <ConsentIndicator size="compact" {...consent} text={undefined} />, className: 'cui-mh-banner__consent' });
  }
  if (restricted) {
    items.push({
      id: 'restricted',
      value: typeof restricted === 'string' ? restricted : labels.restricted,
      symbol: <Icon name="lock" size={16} />,
      className: 'cui-mh-banner__restricted',
    });
  }
  items.push(...(extraItems ?? []));

  // Allergies: known lists the items, none-known says when it was checked, anything else is "not recorded".
  const allergyStatus = allergies?.status ?? 'not-recorded';
  const allergyItems = allergies?.items ?? [];
  // Collapsed, a known list is one line of names ("Allergies: Penicillin and 1 more"); reactions and notes wait in the
  // expanded list (PAB-0006, PAB-0064), so the summary never grows into a block.
  const allergyText =
    (allergyStatus === 'known' && allergyItems.length
      ? `${allergyItems.length === 1 ? labels.allergy : labels.allergies}: ${allergyItems[0]!.name}${allergyItems.length > 1 ? ` and ${allergyItems.length - 1} more` : ''}`
      : null) ??
    allergies?.text ??
    (allergyStatus === 'known' && allergyItems.length
      ? `${labels.allergy}: ${allergyItems.map((a) => `${a.name}${a.reaction ? ` (${a.reaction})` : ''}`).join('; ')}`
      : allergyStatus === 'none-known'
        ? `${labels.noKnownAllergies}${allergies?.checkedAt ? ` (checked ${mhFormatZonedDate(allergies.checkedAt, timeZone)})` : ''}`
        : labels.allergiesNotRecorded);
  const shownStatus = allergyStatus === 'known' && !allergyItems.length && !allergies?.text ? 'not-recorded' : allergyStatus;
  const bannerAllergies: PatientBannerAllergies = {
    status: shownStatus,
    items: shownStatus === 'known' ? allergyItems.map((a) => ({ name: a.name, reaction: a.reaction, note: a.note })) : [],
    ...(shownStatus === 'none-known' && allergies?.checkedAt ? { recordedAt: allergies.checkedAt } : {}),
  };
  const allergyLabels = { [shownStatus]: shownStatus === 'not-recorded' ? (allergies?.text && allergyStatus === 'not-recorded' ? allergies.text : labels.allergiesNotRecorded) : allergyText };

  const consentInZone2 = !!consent;
  const legalZone2 = legalDetails ?? legalFull;
  const section4: PatientBannerSection | undefined =
    safetySection ??
    (consentInZone2 || legalZone2
      ? {
          // A restriction already shows in the band, so the collapsed title leads with the legal details when there are any.
          title: consentInZone2 && !(legalZone2 && RESTRICTION.has(consent!.state)) ? (
            <ConsentIndicator size="compact" {...consent!} text={undefined} className="cui-mh-banner__consent-title" />
          ) : (
            <span className="cui-patient-banner__title-line">
              <span className="cui-patient-banner__title-label">{labels.legalStatus}</span> <span className="cui-patient-banner__title-value">{legalZone2}</span>
            </span>
          ),
          content: (
            <div className="cui-mh-banner__section-stack">
              {legalZone2}
              {consentInZone2 ? <ConsentIndicator size="compact" {...consent} /> : null}
            </div>
          ),
        }
      : undefined);

  const dob = toDate(dateOfBirth ?? null);
  const deceasedDisplay = deceased === true || deceased == null ? undefined : deceased;
  const isDeceased = !!deceased || !!dateOfDeath;

  const bar = emergencyAccess ? <BreakGlassBar {...emergencyAccess} timeZone={emergencyAccess.timeZone ?? timeZone} className="cui-mh-banner__emergency" /> : null;

  const desktop = (
    <PatientBanner
      region={region}
      name={name}
      nameContent={nameContent}
      familyNameCase={familyNameCase}
      showTitle={showTitle}
      nameExtension={extension}
      similarNameWarning={similarNameWarning}
      leading={leading}
      dateOfBirth={dob}
      dateOfBirthDisplay={bornText ?? (dob ? undefined : null)}
      unknownText={labels.unknown}
      dateOfDeath={dateOfDeath}
      dateOfDeathDisplay={deceasedDisplay}
      deceased={isDeceased}
      showGender={false}
      identifiers={identifiers}
      identifierTypes={(identifiers ?? []).map((x) => x.type)}
      requirePrimaryIdentifier={false}
      items={items}
      actions={print ? undefined : actions}
      address={address}
      contacts={contacts}
      allergies={bannerAllergies}
      allergyLabels={allergyLabels}
      section3={careTeam}
      section4={section4}
      showZone2={showZone2}
      zone2Expanded={compact ? false : zone2Expanded}
      defaultZone2Expanded={defaultZone2Expanded}
      onZone2ExpandedChange={onZone2ExpandedChange}
      now={now}
      sticky={false}
    />
  );

  let body: React.ReactNode;
  if (phone) {
    const detailsId = `${id}-details`;
    body = (
      <>
        <MobilePatientHeader
          variant="condensed"
          region={region}
          patient={{
            name: { familyName: name.familyName, givenName: name.givenName, title: name.title ?? undefined },
            dateOfBirth: dob,
            identifiers,
            allergies: { status: bannerAllergies.status, items: (bannerAllergies.items ?? []).map((a) => ({ name: a.name, reaction: a.reaction })) },
          }}
          nameContent={nameContent}
          nameExtension={extension}
          bornDisplay={bornText ?? (dob ? undefined : labels.unknown)}
          now={now}
          showGender={false}
          requirePrimaryIdentifier={false}
          showLocation={false}
          items={[...items.filter((it) => !PHONE_DETAILS.has(it.id)).map((it) => (it.id === 'legal-status' && legalShort ? { ...it, value: legalShort } : it)), ...(isDeceased ? [{ id: 'died', label: 'Died', value: deceasedDisplay ?? (dateOfDeath ? mhFormatZonedDate(dateOfDeath, timeZone) : labels.unknown), placement: 'after-born' as const }] : [])]}
          allergyLabels={allergyLabels}
          detailsOpen={phoneOpen && !compact}
          onShowDetails={() => setPhoneOpen(!phoneOpen)}
          aria-label="Patient summary"
          {...(onBack ? { onBack, ...(backLabel ? { backLabel } : {}) } : {})}
          className={cx('cui-mh-banner__phone', isDeceased && 'cui-mh-banner__phone--deceased')}
        />
        {similarNameWarning ? (
          <p className="cui-mh-banner__phone-similar" role="note">
            <Icon name="warning" size={16} />
            <span>{similarNameWarning}</span>
          </p>
        ) : null}
        <div id={detailsId} className="cui-mh-banner__phone-details" hidden={!phoneOpen || compact}>
          {legalFull ? <LabelledValue label={labels.legalStatus} value={legalFull} noWrap={false} layout="stacked" /> : null}
          {actions ? <div className="cui-mh-banner__phone-actions">{actions}</div> : null}
          {items.some((it) => PHONE_DETAILS.has(it.id)) ? (
            <div className="cui-mh-banner__phone-items">
              {items
                .filter((it) => PHONE_DETAILS.has(it.id))
                .map((it) => (
                  <span key={it.id} className={cx('cui-mobile-header__item', `cui-mobile-header__item--${it.tone ?? 'default'}`, it.className)} data-banner-item={it.id}>
                    {it.symbol ? <span className="cui-mobile-header__item-symbol">{it.symbol}</span> : null}
                    {it.label ? <LabelledValue label={it.label} value={it.value} noWrap={false} /> : <strong className="cui-mobile-header__item-value">{it.value}</strong>}
                  </span>
                ))}
            </div>
          ) : null}
          <LabelledValue label="Address" value={address ? <AddressDisplay address={address} region={region} addressProtected={!!address.protected} /> : null} unknownText={labels.unknown} noWrap={false} layout="stacked" />
          <div className="cui-mh-banner__phone-contacts">
            <span className="cui-labelled-value__label">Phone and email</span>
            {contacts?.protected ? (
              <span>Contact details protected</span>
            ) : contacts && (contacts.mobile || contacts.home || contacts.work || contacts.email) ? (
              <>
                {contacts.mobile ? <TelephoneNumberDisplay region={region} label="Mobile" value={contacts.mobile} /> : null}
                {contacts.home ? <TelephoneNumberDisplay region={region} label="Home" value={contacts.home} /> : null}
                {contacts.work ? <TelephoneNumberDisplay region={region} label="Work" value={contacts.work} /> : null}
                {contacts.email ? <LabelledValue label="Email" value={contacts.email} /> : null}
              </>
            ) : (
              <span>{labels.unknown}</span>
            )}
          </div>
          {careTeam ? <div className="cui-mh-banner__phone-section">{careTeam.content ?? careTeam.title}</div> : null}
          {section4 ? <div className="cui-mh-banner__phone-section">{section4.content ?? section4.title}</div> : null}
        </div>
      </>
    );
  } else {
    body = desktop;
  }

  // Open on a phone, the details scroll inside the banner (at most half the screen): a named, focusable region, so the
  // keyboard can scroll it too [suggested].
  const openRegion = phone && phoneOpen && !compact ? { role: 'region', 'aria-label': 'Patient details', tabIndex: 0 } : {};
  return (
    <div
      ref={ref}
      className={cx('cui-mh-banner', sticky && !print && 'cui-mh-banner--sticky', phone && 'cui-mh-banner--phone', phone && phoneOpen && !compact && 'cui-mh-banner--open', compact && !print && 'cui-mh-banner--compact', print && 'cui-mh-banner--print', emergencyAccess && 'cui-mh-banner--emergency', className)}
      data-region={region}
      data-layout={phone ? 'phone' : 'desktop'}
      {...(compact && !print ? { 'data-compact': '' } : {})}
      {...openRegion}
    >
      {bar}
      {body}
    </div>
  );
}
