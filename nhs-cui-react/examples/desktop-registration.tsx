/**
 * Register or update a patient (desktop).
 *
 * Composition:
 * - One state object holds the record. Every input is controlled from it, and PatientBanner is rendered from the
 *   same state, so the banner previews exactly what will be saved, in the region's display rules (name case,
 *   identifier format, "Not Known" for anything missing). Nothing is guessed to fill the banner.
 * - The banner is shown without clinical information (PAB-0008): registration staff do not need allergies.
 * - Sections follow the minimum data set order: name, identity, identifiers, contact, then the questions that
 *   only one region asks (AU Indigenous status and My Health Record; NZ ethnicity, Māori descent, iwi and the
 *   HISO 10046 protection flags). A region's section is not rendered at all in another region.
 * - Questions about identity and culture start unanswered and are never pre-filled (CGS-0013, AU-IS-02,
 *   HISO 10001/10094); this example shows a record being updated, so earlier answers are loaded where the cast holds them.
 * - Lookups (address, NHI, ethnicity, iwi) are host hooks from ./data/desktop-registration; the controls make no
 *   network calls.
 */
import React, { useState } from 'react';
import {
  AddressInput,
  Button,
  DateInput,
  DvaNumberInput,
  EthnicityInput,
  IndigenousStatusInput,
  IwiInput,
  MaoriDescentInput,
  MyHealthRecordStatus,
  PartialDateOfBirthInput,
  PatientBanner,
  PatientIdentifierInput,
  PatientNameInput,
  ProtectionFlagInput,
  SexGenderInput,
  TelephoneNumberInput,
  addressInputToValue,
  dateInputValueToIso,
  formatTime,
} from '@clinical-cui/react';
import type {
  AddressInputValue,
  ClinicalRegion,
  DateInputValue,
  EthnicityValue,
  IndigenousStatusCode,
  IwiValue,
  MaoriDescentAnswer,
  MyHealthRecordAccessState,
  PatientIdentifier,
  PatientNameValue,
} from '@clinical-cui/react';
import { ExampleShell, type ExampleMeta } from './shell/ExampleShell';
import { EXAMPLE_NOW, MAIN_PATIENT } from './data/patients';
import { IWI_LIST, gbFindAddress, gbFindPostcode, lookupEthnicity, lookupNhi, registrationStart, searchAddress } from './data/desktop-registration';

export const meta: ExampleMeta = {
  title: 'Patient registration',
  description:
    'Updating a patient record: name, date of birth, sex and gender, region identifiers (NHS number; IHI, URN, Medicare with valid to date and DVA; NHI with dormant handling), address lookup and telephone, with the AU and NZ questions shown only in their region. The patient banner above previews the record as it is typed.',
  kind: 'desktop',
  regions: ['GB', 'AU', 'NZ'],
  components: [
    'PatientBanner', 'PatientNameInput', 'DateInput', 'PartialDateOfBirthInput', 'SexGenderInput', 'PatientIdentifierInput',
    'DvaNumberInput', 'AddressInput', 'TelephoneNumberInput', 'IndigenousStatusInput',
    'MyHealthRecordStatus', 'EthnicityInput', 'MaoriDescentInput', 'IwiInput', 'ProtectionFlagInput',
  ],
};

interface RecordState {
  name: PatientNameValue;
  dob: DateInputValue | null;
  /** NZ: HISO 10046 partial date of birth, "YYYY[MM[DD]]". */
  dobHiso: string;
  gender: string | null;
  sex: string | null;
  nhs: string;
  ihi: string;
  mrn: string;
  medicare: string;
  medicareIrn: string;
  medicareValidTo: string;
  dva: string;
  dvaCardType: string;
  nhi: string;
  nhiDormantLive: string | null;
  address: AddressInputValue;
  phone: string;
  indigenous: IndigenousStatusCode | null;
  ethnicity: EthnicityValue;
  maoriDescent: MaoriDescentAnswer | null;
  iwi: IwiValue;
  nameProtected: boolean;
  addressProtected: boolean;
  contactProtected: boolean;
}

function initialRecord(region: ClinicalRegion): RecordState {
  const s = registrationStart(region);
  const m = MAIN_PATIENT[region];
  const [y, mo, d] = s.dateOfBirth.split('-').map(Number);
  // Gender codes per region: GB full-text value, AU ABS 2020 code, NZ HISO 10046 code.
  const gender = region === 'GB' ? m.gender : region === 'AU' ? (m.gender === 'Male' ? '1' : '2') : m.gender === 'Male' ? 'M' : 'F';
  return {
    name: s.name,
    dob: { kind: 'full', year: y, month: mo, day: d },
    dobHiso: s.dateOfBirth.replace(/-/g, ''),
    gender,
    sex: region === 'GB' ? m.gender : region === 'AU' ? null : null,
    nhs: s.nhs, ihi: s.ihi, mrn: s.mrn,
    medicare: s.medicare, medicareIrn: s.medicareIrn, medicareValidTo: s.medicareValidTo,
    dva: '', dvaCardType: '',
    nhi: s.nhi, nhiDormantLive: null,
    address: s.address,
    phone: s.phone,
    indigenous: (m.indigenousStatus as IndigenousStatusCode | undefined) ?? null,
    ethnicity: { entries: (m.ethnicity ?? []).map(code => ({ code, label: code === '21111' ? 'Māori' : code === '31111' ? 'Samoan' : code })) },
    maoriDescent: region === 'NZ' ? 'yes' : null,
    iwi: region === 'NZ' ? { knows: 'yes', iwi: [{ code: 'demo-01', name: 'Ngāti Porou', rohe: 'Te Tai Rāwhiti' }] } : { knows: null, iwi: [] },
    nameProtected: false,
    addressProtected: false,
    contactProtected: false,
  };
}

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-6)',
  display: 'grid', gap: 'var(--space-4)', alignContent: 'start', minWidth: 0,
};
const h2: React.CSSProperties = { margin: 0, fontSize: 18, lineHeight: '24px', fontWeight: 600 };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `reg-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <section aria-labelledby={id} style={card}>
      <h2 id={id} style={h2}>{title}</h2>
      {children}
    </section>
  );
}

function RegistrationScreen({ region }: { region: ClinicalRegion }) {
  const [rec, setRec] = useState<RecordState>(() => initialRecord(region));
  const set = <K extends keyof RecordState>(key: K) => (value: RecordState[K]) => setRec(r => ({ ...r, [key]: value }));
  const [mhrState, setMhrState] = useState<MyHealthRecordAccessState>('available');
  const [mhrCheckedAt, setMhrCheckedAt] = useState<Date>(new Date(EXAMPLE_NOW.getTime() - 20 * 60000));
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Banner identifiers, in the region's order. Only values actually held are passed; the banner shows the primary
  // identifier as "Not Known" when it is empty (G10 1.6, G11 12.6).
  const identifiers: PatientIdentifier[] = [];
  if (region === 'AU') {
    if (rec.ihi) identifiers.push({ type: 'ihi', value: rec.ihi });
    if (rec.mrn) identifiers.push({ type: 'mrn', value: rec.mrn });
    if (rec.medicare) identifiers.push({ type: 'medicare', value: rec.medicare, irn: rec.medicareIrn, medicareValidTo: rec.medicareValidTo || undefined });
    if (rec.dva) identifiers.push({ type: 'dva', value: rec.dva, dvaCardType: rec.dvaCardType || undefined });
  }
  if (region === 'NZ' && rec.nhi) {
    identifiers.push(rec.nhiDormantLive ? { type: 'nhi', value: rec.nhi, nhiStatus: 'dormant', liveNhi: rec.nhiDormantLive } : { type: 'nhi', value: rec.nhi });
  }

  const useLiveNhi = (live: string) => setRec(r => ({ ...r, nhi: live, nhiDormantLive: null }));

  // Identifiers sit under the identity sections in AU and NZ; in GB (one identifier) they balance the right column.
  const identifiersSection = (
    <Section title="Identifiers">
      {region === 'GB' ? (
        <PatientIdentifierInput type="nhs" value={rec.nhs} onChange={(_s, n) => set('nhs')(n)} required />
      ) : null}
      {region === 'AU' ? (
        <>
          {/* IHI first, then the local URN (G10 1.6). Medicare and DVA are recorded as printed on the card. */}
          <PatientIdentifierInput type="ihi" value={rec.ihi} onChange={(_s, n) => set('ihi')(n)} />
          <PatientIdentifierInput type="mrn" value={rec.mrn} onChange={(_s, n) => set('mrn')(n)} mrnPattern={/^\d{7}$/} mrnPatternMessage="A URN at this hospital has 7 digits" />
          {/* PatientIdentifierInput passes the Medicare IRN and "Valid to" boxes through to MedicareNumberInput (G12 1). */}
          <PatientIdentifierInput
            type="medicare"
            value={rec.medicare}
            onChange={(_shown, digits) => set('medicare')(digits)}
            irn={rec.medicareIrn}
            onIrnChange={set('medicareIrn')}
            validTo={rec.medicareValidTo}
            onValidToChange={(_text, norm) => set('medicareValidTo')(norm)}
            now={EXAMPLE_NOW}
          />
          <DvaNumberInput value={rec.dva} onChange={set('dva')} cardType={rec.dvaCardType} onCardTypeChange={set('dvaCardType')} />
        </>
      ) : null}
      {region === 'NZ' ? (
        // PatientIdentifierInput passes the NHI lookup through: the host's NHI service reports a dormant number with
        // its live NHI, and the user chooses to switch (G12 4).
        <PatientIdentifierInput
          type="nhi"
          value={rec.nhi}
          onChange={(shown, nhi) => setRec(r => ({ ...r, nhi: shown, nhiDormantLive: nhi === r.nhi ? r.nhiDormantLive : null }))}
          lookupNhi={nhi => lookupNhi(nhi).then(res => {
            setRec(r => ({ ...r, nhiDormantLive: res.status === 'dormant' && r.nhi.toUpperCase() === nhi ? res.liveNhi ?? null : null }));
            return res;
          })}
          onUseLiveNhi={useLiveNhi}
          flagTestNumbers={false}
          required
        />
      ) : null}
    </Section>
  );

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {/* Live preview: the banner reads the form state, so a change in any field shows here at once. */}
      <PatientBanner
        name={{ familyName: rec.name.familyName, givenName: rec.name.singleName ? '' : rec.name.givenName, title: rec.name.title }}
        preferredName={rec.name.preferredName || null}
        dateOfBirth={region === 'NZ' ? undefined : dateInputValueToIso(rec.dob) || null}
        partialDateOfBirth={region === 'NZ' ? rec.dobHiso || null : undefined}
        gender={rec.gender}
        nhsNumber={region === 'GB' ? rec.nhs || null : undefined}
        identifiers={identifiers}
        // Test-range NHIs are expected in this documentation environment.
        flagTestIdentifiers={false}
        onUseLiveNhi={useLiveNhi}
        nameProtected={region === 'NZ' && rec.nameProtected}
        // addressInputToValue maps the AddressInput value to the banner's address in the region's fields.
        address={{ ...addressInputToValue(rec.address, region), protected: region === 'NZ' && rec.addressProtected }}
        contacts={region === 'GB' ? { home: rec.phone, protected: false } : { mobile: rec.phone, protected: region === 'NZ' && rec.contactProtected }}
        myHealthRecord={region === 'AU' ? { state: mhrState, checkedAt: mhrCheckedAt } : undefined}
        showClinicalInformation={false}
        now={EXAMPLE_NOW}
        sticky={false}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, lineHeight: '26px' }}>Update patient details</h2>
          <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--ink-muted)' }}>Check each section with the patient. The banner shows the record as it will be saved.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span role="status" style={{ fontSize: 14, color: savedAt ? 'var(--success)' : 'var(--ink-muted)' }}>
            {savedAt ? `Saved at ${formatTime(savedAt)}` : 'Unsaved changes'}
          </span>
          <Button variant="secondary" onClick={() => { setRec(initialRecord(region)); setSavedAt(null); }}>Discard changes</Button>
          <Button variant="primary" onClick={() => setSavedAt(EXAMPLE_NOW)}>Save details</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--space-4)', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
          <Section title="Name">
            {/* GB upper-cases the family name on leaving the field; AU and NZ keep the case given and offer "only one name". */}
            <PatientNameInput value={rec.name} onChange={set('name')} id="reg-name" />
            {region === 'NZ' ? (
              <ProtectionFlagInput kind="name" checked={rec.nameProtected} onChange={v => set('nameProtected')(v)} />
            ) : null}
          </Section>

          <Section title="Date of birth, sex and gender">
            {region === 'NZ' ? (
              // NZ records a partial date when only the year or month is known (HISO 10046 2.3.1), with its source.
              <PartialDateOfBirthInput value={rec.dobHiso} onChange={(_v, hiso) => set('dobHiso')(hiso)} showSource defaultSource="BRCT" now={EXAMPLE_NOW} />
            ) : (
              <DateInput
                label="Date of birth"
                value={rec.dob}
                onChange={set('dob')}
                allowUnknown
                today={EXAMPLE_NOW}
                max={EXAMPLE_NOW}
                validate={v => (v.kind === 'full' && new Date(v.year, v.month - 1, v.day) > EXAMPLE_NOW ? 'The date of birth is in the future. Enter the correct date of birth.' : null)}
                required
              />
            )}
            {/* Gender and sex are separate questions, never merged (CGS-0001, CGS-0009; ABS 2020; Stats NZ). */}
            <SexGenderInput kind="currentGender" orientation="horizontal" value={rec.gender} onChange={v => set('gender')(v)} />
            {region !== 'NZ' ? (
              <SexGenderInput
                kind="sex"
                orientation="horizontal"
                value={rec.sex}
                onChange={v => set('sex')(v)}
                purpose={region === 'AU' ? 'Asked so that clinical care and screening can be offered correctly.' : undefined}
              />
            ) : null}
          </Section>

          {region !== 'GB' ? identifiersSection : null}
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
          <Section title="Contact">
            <AddressInput
              legend="Usual address"
              value={rec.address}
              onChange={set('address')}
              onFindAddress={region === 'GB' ? gbFindAddress : undefined}
              onFindPostcode={region === 'GB' ? gbFindPostcode : undefined}
              onSearchAddress={region === 'GB' ? undefined : searchAddress(region)}
              id="reg-address"
            />
            <TelephoneNumberInput
              label={region === 'GB' ? 'Home telephone' : 'Mobile'}
              value={rec.phone}
              onChange={set('phone')}
            />
            {region === 'NZ' ? (
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <ProtectionFlagInput kind="address" checked={rec.addressProtected} onChange={v => set('addressProtected')(v)} />
                <ProtectionFlagInput kind="contact" checked={rec.contactProtected} onChange={v => set('contactProtected')(v)} />
              </div>
            ) : null}
          </Section>

          {region === 'GB' ? identifiersSection : null}

          {region === 'AU' ? (
            <>
              <Section title="Aboriginal and Torres Strait Islander status">
                {/* Asked of every patient, never assumed from appearance or name (AU-IS-02). */}
                <IndigenousStatusInput value={rec.indigenous} onChange={set('indigenous')} purpose="Asked of everyone so that services can be offered and planned." />
              </Section>
              <Section title="My Health Record">
                <MyHealthRecordStatus
                  state={mhrState}
                  checkedAt={mhrCheckedAt}
                  onCheck={() => { setMhrState('available'); setMhrCheckedAt(EXAMPLE_NOW); }}
                  onOpen={() => undefined}
                  doNotUpload={false}
                />
              </Section>
            </>
          ) : null}

          {region === 'NZ' ? (
            <Section title="Ethnicity, Māori descent and iwi">
              {/* Self-identified; up to six codes recorded; never guessed (HISO 10001). */}
              <EthnicityInput value={rec.ethnicity} onChange={set('ethnicity')} classification={lookupEthnicity} />
              <MaoriDescentInput value={rec.maoriDescent} onChange={set('maoriDescent')} />
              {/* Iwi follows a "Yes" to Māori descent (HISO 10094 routing); every iwi given is kept, with no "main" iwi. */}
              {rec.maoriDescent === 'yes' ? <IwiInput value={rec.iwi} onChange={set('iwi')} iwiList={IWI_LIST} /> : null}
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function DesktopRegistration() {
  return <ExampleShell meta={meta}>{region => <RegistrationScreen region={region} />}</ExampleShell>;
}
