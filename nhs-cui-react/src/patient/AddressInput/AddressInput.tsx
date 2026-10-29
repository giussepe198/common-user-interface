import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import {
  ADDRESS_LABELS,
  checkAuPostcodeState,
  formatAddress,
  formatPostcode,
  isValidFourDigitPostcode,
  normaliseRuralDelivery,
  parseAuUnitAddress,
} from '../utils/patient';
import type { AddressValue } from '../utils/patient';
import { ISO_COUNTRY_NAMES } from '../utils/countries';
import { AU_ADDRESS_LABELS, AU_STATES, HOME_COUNTRY_NAMES, NZ_ADDRESS_LABELS } from '../utils/regions/address';

export interface AddressInputValue {
  line1: string;
  line2: string;
  line3: string;
  /** Non-UK addresses only (ADR-0051). */
  line4?: string;
  town: string;
  /** UK addresses only. */
  county?: string;
  /** UK postcode, or the postal code of a non-UK address. */
  postcode: string;
  /** Empty for an address in the region's own country; an ISO 3166-1 name otherwise (ADR-0057). */
  country?: string;
  /** AU: state or territory abbreviation, e.g. "VIC" (G10 6.1). */
  state?: string;
  /** AU: unit, flat or level, e.g. "Unit 2", stored apart from the street line (AU-AD-01). */
  unit?: string;
  /** NZ: suburb, or "RD 2" for rural delivery (NZ Post). */
  suburb?: string;
  /** NZ: building name (HISO 10046). */
  buildingName?: string;
  /** Identifier of the chosen lookup result, e.g. a G-NAF PID or an NZ Post delivery point ID, kept with the address (G10 6.4). */
  addressId?: string;
  /** No fixed address (AU-AD-03; NZ [suggested]). */
  noFixedAddress?: boolean;
}

/** One candidate returned by a consumer-supplied lookup. */
export interface AddressLookupResult {
  /** Text shown in the result list. Default: the address joined with ", " (ADR-0001). */
  label?: string;
  /** Fields to copy into the input when this result is chosen. */
  address: Partial<AddressInputValue>;
}

/** Query passed to `onFindAddress` (UK address finder, ADR-0031..0034). */
export interface AddressFinderQuery {
  buildingNumber: string;
  buildingName: string;
  postcode: string;
}

export interface AddressInputProps {
  /**
   * Region. GB: UK form (ADR rules). AU: Australia Post fields with a state select, 4-digit postcode and a postcode/state
   * check that warns but never blocks (AU-AD-02). NZ: NZ Post and HISO 10046 fields with suburb or RD, town or city and a
   * 4-digit postcode. Default from `ClinicalLocaleProvider`.
   */
  region?: ClinicalRegion;
  /**
   * AU and NZ address lookup hook (for example G-NAF or the NZ Post address API), called with the text typed into
   * "Find an address". Return candidates; the user picks one, and every field stays editable. No network access is made by the control.
   */
  onSearchAddress?: (query: string) => Promise<AddressLookupResult[]> | AddressLookupResult[];
  /** AU and NZ: offer "No fixed address" (AU-AD-03). Default true. */
  allowNoFixedAddress?: boolean;
  /** Controlled value. */
  value?: AddressInputValue;
  /** Uncontrolled initial value. */
  defaultValue?: AddressInputValue;
  /** Called on every change. */
  onChange?: (value: AddressInputValue) => void;
  /**
   * Postcode lookup hook for the "Find Postcode" button (ADR-0013, ADR-0014). The button is only shown
   * when this is supplied, and is enabled once a street line and Town/City are entered.
   * Return candidate addresses (with postcodes); the user picks one. No network access is made by the control.
   */
  onFindPostcode?: (address: AddressInputValue) => Promise<AddressLookupResult[]> | AddressLookupResult[];
  /**
   * Address finder hook (ADR-0031..0038). When supplied, a "House/Building Number", "House/Building Name",
   * "Postcode" and "Find Address" group is shown above the address fields. "Find Address" is enabled once a postcode is entered.
   */
  onFindAddress?: (query: AddressFinderQuery) => Promise<AddressLookupResult[]> | AddressLookupResult[];
  /** Offer the non-UK address form (ADR-0050..0059) through an "Address outside the UK" checkbox [suggested]. Default true. */
  allowNonUk?: boolean;
  /** Country names for the non-UK combo box. Default: ISO 3166-1 names, alphabetical (ADR-0057, ADR-0058). */
  countries?: ReadonlyArray<string>;
  /** Group legend. Default "Address". */
  legend?: string;
  /** Prompts per field, e.g. { town: "e.g. Ipswich", county: "e.g. Northshire" } (QIG examples). */
  placeholders?: Partial<Record<keyof AddressInputValue, string>>;
  /** Tooltips per field, e.g. { line1: "Enter the first line of the address" }. */
  tooltips?: Partial<Record<keyof AddressInputValue, string>>;
  disabled?: boolean;
  /** Base id; fields get `${id}-${field}`. */
  id?: string;
  className?: string;
}

const EMPTY: AddressInputValue = { line1: '', line2: '', line3: '', line4: '', town: '', county: '', postcode: '', country: '' };
/** ADR-0021 allowed characters for UK address input. */
const DISALLOWED = /[^A-Za-z0-9./,:' -]/g;
const isUkCountry = (c?: string) => !c || /^(united kingdom|uk)$/i.test(c.trim());

type FieldKey = keyof AddressInputValue;

/**
 * UK address input (Line 1-3, Town/City, County, Postcode) with optional consumer-supplied postcode
 * lookup and address finder, plus a non-UK form (Country first, Line 1-4, Town/City, Postal Code).
 */
export function AddressInput({
  region: regionProp,
  onSearchAddress,
  allowNoFixedAddress = true,
  value,
  defaultValue = EMPTY,
  onChange,
  onFindPostcode,
  onFindAddress,
  allowNonUk = true,
  countries = ISO_COUNTRY_NAMES,
  legend = 'Address',
  placeholders,
  tooltips,
  disabled,
  id: idProp,
  className,
}: AddressInputProps) {
  const { region } = useClinicalLocale(regionProp);
  const base = useId('cui-address-input', idProp);
  const [addr, setAddr] = useControllableState<AddressInputValue>(value, defaultValue, onChange);
  const isHome = (c?: string) => (region === 'GB' ? isUkCountry(c) : !c || HOME_COUNTRY_NAMES[region].test(c.trim()));
  const [outsideUk, setOutsideUk] = React.useState(!isHome(addr.country));
  const [query, setQuery] = React.useState('');
  const [touchedFields, setTouchedFields] = React.useState<Partial<Record<FieldKey, boolean>>>({});
  const touch = (f: FieldKey) => setTouchedFields((t) => ({ ...t, [f]: true }));
  const [note, setNote] = React.useState('');
  const [finder, setFinder] = React.useState<AddressFinderQuery>({ buildingNumber: '', buildingName: '', postcode: '' });
  const [results, setResults] = React.useState<AddressLookupResult[] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [lookupError, setLookupError] = React.useState('');
  const resultsRef = React.useRef<HTMLUListElement>(null);
  const fid = (f: string) => `${base}-${f}`;

  const update = (patch: Partial<AddressInputValue>) => setAddr({ ...addr, ...patch });

  const ukText = (f: FieldKey, v: string) => {
    if (outsideUk || region !== 'GB') return update({ [f]: v, addressId: undefined });
    const clean = v.replace(DISALLOWED, '');
    setNote(clean !== v ? "Only letters, numbers, spaces and the characters . / , : ' - can be used in a UK address." : '');
    update({ [f]: clean });
  };

  const runLookup = async (fn: () => Promise<AddressLookupResult[]> | AddressLookupResult[]) => {
    setBusy(true);
    setLookupError('');
    setStatus('Searching');
    try {
      const found = await fn();
      setResults(found);
      setStatus(found.length === 0 ? 'No addresses found' : `${found.length} ${found.length === 1 ? 'address' : 'addresses'} found`);
      if (found.length) requestAnimationFrame(() => resultsRef.current?.querySelector('button')?.focus());
    } catch {
      setResults(null);
      setStatus('');
      setLookupError('The address lookup is not available. Enter the address in the boxes below.');
    } finally {
      setBusy(false);
    }
  };

  const choose = (r: AddressLookupResult) => {
    const next = { ...addr, ...r.address };
    if (next.postcode && region === 'GB') next.postcode = formatPostcode(next.postcode);
    setAddr(next);
    setResults(null);
    setStatus('Address selected');
    requestAnimationFrame(() => document.getElementById(fid('line1'))?.focus());
  };

  const resultLabel = (r: AddressLookupResult) =>
    r.label ??
    (region === 'GB'
      ? formatAddress({ lines: [r.address.line1 ?? '', r.address.line2 ?? '', r.address.line3 ?? ''], town: r.address.town, county: r.address.county, postcode: r.address.postcode }, 'horizontal')
      : formatAddress(addressInputToValue({ ...EMPTY, ...r.address }, region), 'horizontal', region));

  type FieldOpts = {
    maxLength?: number;
    list?: string;
    onBlur?: () => void;
    after?: React.ReactNode;
    hint?: string;
    message?: { text: string; tone: 'error' | 'warning' } | null;
    inputMode?: 'numeric' | 'text';
  };
  const field = (f: FieldKey, label: string, width: number, opts: FieldOpts = {}) => {
    const hintId = opts.hint ? fid(`${f}-hint`) : undefined;
    const msgId = opts.message ? fid(`${f}-msg`) : undefined;
    return (
      <div className="cui-address-input__row" key={f}>
        <label className="cui-address-input__label" htmlFor={fid(f)}>
          {label}
        </label>
        <div className="cui-address-input__control">
          <input
            id={fid(f)}
            type="text"
            className="cui-address-input__box"
            style={{ width: `${width}ch` }}
            value={(addr[f] as string | undefined) ?? ''}
            maxLength={opts.maxLength ?? 35}
            list={opts.list}
            inputMode={opts.inputMode}
            placeholder={placeholders?.[f] as string | undefined}
            title={tooltips?.[f] as string | undefined}
            disabled={disabled}
            autoComplete="off"
            aria-describedby={cx(hintId, msgId) || undefined}
            aria-invalid={opts.message?.tone === 'error' ? true : undefined}
            onChange={(e) => (f === 'country' ? update({ country: e.target.value }) : ukText(f, e.target.value))}
            onBlur={opts.onBlur}
          />
          {opts.after}
          {opts.hint ? (
            <span id={hintId} className="cui-address-input__hint">
              {opts.hint}
            </span>
          ) : null}
          {opts.message ? (
            <span id={msgId} className={cx('cui-address-input__message', `cui-address-input__message--${opts.message.tone}`)}>
              <Icon name={opts.message.tone === 'error' ? 'error' : 'warning'} size={16} />
              <span>{opts.message.text}</span>
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  const canFindPostcode = !!(addr.line1.trim() || addr.line2.trim() || addr.line3.trim()) && !!addr.town.trim();
  const listId = fid('countries');

  const resultsList =
    results && results.length ? (
      <ul
        ref={resultsRef}
        className="cui-address-input__results"
        aria-label="Matching addresses"
        onKeyDown={(e) => {
          const buttons = Array.from(resultsRef.current?.querySelectorAll('button') ?? []);
          const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            buttons[Math.min(i + 1, buttons.length - 1)]?.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            buttons[Math.max(i - 1, 0)]?.focus();
          } else if (e.key === 'Escape') {
            setResults(null);
            setStatus('');
          }
        }}
      >
        {results.map((r, i) => (
          <li key={i}>
            <button type="button" className="cui-address-input__result" onClick={() => choose(r)}>
              {resultLabel(r)}
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  if (region !== 'GB') {
    const L = region === 'AU' ? AU_ADDRESS_LABELS : NZ_ADDRESS_LABELS;
    const postcode = (addr.postcode ?? '').trim();
    const postcodeError = touchedFields.postcode && postcode && !isValidFourDigitPostcode(postcode) ? 'Enter a 4-digit postcode' : null;
    const stateCheck = region === 'AU' ? checkAuPostcodeState(postcode, addr.state) : 'incomplete';
    const postcodeWarning =
      !postcodeError && touchedFields.postcode && stateCheck === 'mismatch'
        ? `Postcode ${postcode} is not usually in ${addr.state}. Check that the suburb, state and postcode match.`
        : null;
    const nfa = !!addr.noFixedAddress;
    return (
      <fieldset className={cx('cui-address-input', `cui-address-input--${region.toLowerCase()}`, className)} disabled={disabled}>
        <legend className="cui-address-input__legend">{legend}</legend>
        {allowNoFixedAddress ? (
          <div className="cui-address-input__outside" data-touch-target>
            <input
              type="checkbox"
              id={fid('nfa')}
              checked={nfa}
              onChange={(e) => {
                setResults(null);
                update(e.target.checked ? { ...EMPTY, noFixedAddress: true } : { noFixedAddress: false });
              }}
            />
            <label htmlFor={fid('nfa')}>{L.noFixedAddress}</label>
          </div>
        ) : null}
        {allowNonUk && !nfa ? (
          <div className="cui-address-input__outside" data-touch-target>
            <input
              type="checkbox"
              id={fid('outside')}
              checked={outsideUk}
              onChange={(e) => {
                setOutsideUk(e.target.checked);
                setResults(null);
                update(e.target.checked ? { country: '', state: '', unit: '', suburb: '', buildingName: '' } : { country: '', line4: '' });
              }}
            />
            <label htmlFor={fid('outside')}>{L.outside}</label>
          </div>
        ) : null}
        {nfa ? null : outsideUk ? (
          <>
            {field('country', ADDRESS_LABELS.country, 32, { list: listId, maxLength: 60 })}
            <datalist id={listId}>
              {countries.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {field('line1', ADDRESS_LABELS.line1, 32)}
            {field('line2', ADDRESS_LABELS.line2, 32)}
            {field('line3', ADDRESS_LABELS.line3, 32)}
            {field('line4', ADDRESS_LABELS.line4, 32)}
            {field('town', ADDRESS_LABELS.town, 24)}
            {field('postcode', ADDRESS_LABELS.postalCode, 12, { maxLength: 12 })}
          </>
        ) : (
          <>
            {onSearchAddress ? (
              <div className="cui-address-input__finder" role="search" aria-label="Find an address">
                <div className="cui-address-input__row">
                  <label className="cui-address-input__label" htmlFor={fid('search')}>
                    Find an address
                  </label>
                  <div className="cui-address-input__control">
                    <input
                      id={fid('search')}
                      type="search"
                      className="cui-address-input__box"
                      style={{ width: '32ch' }}
                      value={query}
                      autoComplete="off"
                      placeholder={region === 'AU' ? 'e.g. 14 Smith Street Bunbury' : 'e.g. 23 Main Street Rangiora'}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && query.trim().length >= 3) {
                          e.preventDefault();
                          void runLookup(() => onSearchAddress(query.trim()));
                        }
                      }}
                    />
                    <Button size="md" icon="search" disabled={query.trim().length < 3 || busy} onClick={() => runLookup(() => onSearchAddress(query.trim()))}>
                      Find address
                    </Button>
                    <span className="cui-address-input__hint">Or enter the address in the boxes below.</span>
                  </div>
                </div>
              </div>
            ) : null}
            {region === 'AU' ? (
              <>
                {field('unit', AU_ADDRESS_LABELS.unit, 16, { maxLength: 40 })}
                {field('line1', AU_ADDRESS_LABELS.line1, 32, {
                  maxLength: 40,
                  hint: 'e.g. 14 Smith Street, or PO Box 37. "2/14 Smith Street" is split into unit and street.',
                  onBlur: () => {
                    const p = !addr.unit ? parseAuUnitAddress(addr.line1) : null;
                    if (p) update({ unit: p.unit, line1: p.street });
                  },
                })}
                {field('line2', AU_ADDRESS_LABELS.line2, 32, { maxLength: 40 })}
                {field('town', AU_ADDRESS_LABELS.locality, 24, { maxLength: 40 })}
                <div className="cui-address-input__row">
                  <label className="cui-address-input__label" htmlFor={fid('state')}>
                    {AU_ADDRESS_LABELS.state}
                  </label>
                  <div className="cui-address-input__control">
                    <select
                      id={fid('state')}
                      className="cui-address-input__select"
                      value={addr.state ?? ''}
                      disabled={disabled}
                      onChange={(e) => update({ state: e.target.value, addressId: undefined })}
                    >
                      <option value="" />
                      {AU_STATES.map((st) => (
                        <option key={st.code} value={st.code}>
                          {`${st.code} (${st.name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {field('buildingName', NZ_ADDRESS_LABELS.buildingName, 32, { maxLength: 100 })}
                {field('line1', NZ_ADDRESS_LABELS.line1, 32, { maxLength: 100, hint: 'e.g. 1/23 Main Street, 21A Main Street or PO Box 23226' })}
                {field('suburb', NZ_ADDRESS_LABELS.suburb, 24, {
                  maxLength: 50,
                  hint: 'For rural delivery enter RD and its number, e.g. RD 2',
                  onBlur: () => {
                    const n = normaliseRuralDelivery(addr.suburb ?? '');
                    if (n !== (addr.suburb ?? '')) update({ suburb: n });
                  },
                })}
                {field('town', NZ_ADDRESS_LABELS.town, 24, { maxLength: 50 })}
              </>
            )}
            {field('postcode', region === 'AU' ? AU_ADDRESS_LABELS.postcode : NZ_ADDRESS_LABELS.postcode, 4, {
              maxLength: 4,
              inputMode: 'numeric',
              onBlur: () => touch('postcode'),
              message: postcodeError ? { text: postcodeError, tone: 'error' } : postcodeWarning ? { text: postcodeWarning, tone: 'warning' } : null,
            })}
          </>
        )}
        <div className="cui-address-input__status" role="status" aria-live="polite">
          {note || status}
        </div>
        {lookupError ? (
          <div className="cui-address-input__error" role="alert">
            <Icon name="warning" size={16} />
            <span>{lookupError}</span>
          </div>
        ) : null}
        {resultsList}
      </fieldset>
    );
  }

  return (
    <fieldset className={cx('cui-address-input', className)} disabled={disabled}>
      <legend className="cui-address-input__legend">{legend}</legend>

      {allowNonUk ? (
        <div className="cui-address-input__outside" data-touch-target>
          <input
            type="checkbox"
            id={fid('outside')}
            checked={outsideUk}
            onChange={(e) => {
              setOutsideUk(e.target.checked);
              setResults(null);
              setNote('');
              // Clear fields the other form does not show, so no hidden data is saved [suggested].
              update(e.target.checked ? { country: '', county: '' } : { country: '', line4: '' });
            }}
          />
          <label htmlFor={fid('outside')}>Address outside the UK</label>
        </div>
      ) : null}

      {!outsideUk && onFindAddress ? (
        <div className="cui-address-input__finder" role="group" aria-labelledby={fid('finder-title')}>
          <div id={fid('finder-title')} className="cui-address-input__finder-title">
            Find an address
          </div>
          <div className="cui-address-input__row">
            <label className="cui-address-input__label" htmlFor={fid('number')}>
              {ADDRESS_LABELS.buildingNumber}
            </label>
            <div className="cui-address-input__control">
              <input id={fid('number')} type="text" className="cui-address-input__box" style={{ width: '6ch' }} value={finder.buildingNumber} onChange={(e) => setFinder({ ...finder, buildingNumber: e.target.value })} />
            </div>
          </div>
          <div className="cui-address-input__row">
            <label className="cui-address-input__label" htmlFor={fid('name')}>
              {ADDRESS_LABELS.buildingName}
            </label>
            <div className="cui-address-input__control">
              <input id={fid('name')} type="text" className="cui-address-input__box" style={{ width: '24ch' }} value={finder.buildingName} onChange={(e) => setFinder({ ...finder, buildingName: e.target.value })} />
            </div>
          </div>
          <div className="cui-address-input__row">
            <label className="cui-address-input__label" htmlFor={fid('find-postcode')}>
              {ADDRESS_LABELS.postcode}
            </label>
            <div className="cui-address-input__control">
              <input
                id={fid('find-postcode')}
                type="text"
                className="cui-address-input__box cui-address-input__box--postcode"
                maxLength={8}
                value={finder.postcode}
                onChange={(e) => setFinder({ ...finder, postcode: e.target.value })}
                onBlur={() => setFinder({ ...finder, postcode: formatPostcode(finder.postcode) })}
              />
              <Button size="md" icon="search" disabled={!finder.postcode.trim() || busy} onClick={() => runLookup(() => onFindAddress({ ...finder, postcode: formatPostcode(finder.postcode) }))}>
                {ADDRESS_LABELS.findAddress}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {outsideUk ? (
        <>
          {field('country', ADDRESS_LABELS.country, 32, { list: listId, maxLength: 60 })}
          <datalist id={listId}>
            {countries.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {field('line1', ADDRESS_LABELS.line1, 32)}
          {field('line2', ADDRESS_LABELS.line2, 32)}
          {field('line3', ADDRESS_LABELS.line3, 32)}
          {field('line4', ADDRESS_LABELS.line4, 32)}
          {field('town', ADDRESS_LABELS.town, 24)}
          {field('postcode', ADDRESS_LABELS.postalCode, 12, { maxLength: 12 })}
        </>
      ) : (
        <>
          {field('line1', ADDRESS_LABELS.line1, 32)}
          {field('line2', ADDRESS_LABELS.line2, 32)}
          {field('line3', ADDRESS_LABELS.line3, 32)}
          {field('town', ADDRESS_LABELS.town, 24)}
          {field('county', ADDRESS_LABELS.county, 18)}
          {field('postcode', ADDRESS_LABELS.postcode, 8, {
            maxLength: 8,
            onBlur: () => {
              const p = formatPostcode(addr.postcode);
              if (p !== addr.postcode) update({ postcode: p });
            },
            after: onFindPostcode ? (
              <Button size="md" icon="search" disabled={!canFindPostcode || busy} onClick={() => runLookup(() => onFindPostcode(addr))}>
                {ADDRESS_LABELS.findPostcode}
              </Button>
            ) : null,
          })}
        </>
      )}

      <div className="cui-address-input__status" role="status" aria-live="polite">
        {note || status}
      </div>
      {lookupError ? (
        <div className="cui-address-input__error" role="alert">
          <Icon name="warning" size={16} />
          <span>{lookupError}</span>
        </div>
      ) : null}
      {resultsList}
    </fieldset>
  );
}

/**
 * Converts the AddressInput value to the `AddressValue` that `AddressDisplay`, `PatientBanner` (`address`),
 * `MicroPatientBanner` and `formatAddress` take, for any region. GB keeps county; AU keeps state and unit; NZ keeps
 * suburb and building name. "No fixed address" is carried through. Fields that do not apply to the region are dropped,
 * and the lookup `addressId` is not part of the display value (keep it from the input value).
 */
export function addressInputToValue(v: AddressInputValue, region: ClinicalRegion = 'GB'): AddressValue {
  const lines = [v.line1, v.line2, v.line3, v.line4 ?? ''];
  const nfa = v.noFixedAddress ? { noFixedAddress: true } : {};
  if (region === 'GB') return { lines, town: v.town, county: v.county, postcode: v.postcode, country: v.country, ...nfa };
  if (region === 'AU') return { lines, town: v.town, postcode: v.postcode, country: v.country, state: v.state, unit: v.unit, ...nfa };
  return { lines, town: v.town, postcode: v.postcode, country: v.country, suburb: v.suburb, buildingName: v.buildingName, ...nfa };
}
