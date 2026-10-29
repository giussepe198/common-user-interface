import React from 'react';
import { cx, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import {
  MedicationLine,
  groupMedications,
  isCurrentMedicationStatus,
  medicationDrugName,
  medicationLookAheadTokens,
  type MedicationGroupingOption,
} from '../../medications';
import { ActionBar, BottomSheet, SegmentedControl, TouchButton } from '../../touch';
import { MobileGlyph } from '../internal/mobileIcons';
import {
  MOBILE_MEDICATION_SORT_LABELS,
  mobileMedicationStatusParts,
  mobileSortMedications,
  type MobileMedicationItem,
  type MobileMedicationSort,
} from '../utils/mobileMedications';

/** Default grouping choices [suggested]: by route and by form, read from the medication line. */
export const MOBILE_MEDICATION_GROUPINGS: MedicationGroupingOption[] = [
  { id: 'route', label: 'Route', getValues: r => r.line.route },
  { id: 'form', label: 'Form', getValues: r => r.line.form },
];

export interface MobileMedicationsListProps {
  /** Current and past medicines. Current = Started, Not Started, Suspended; past = Completed, Discontinued (MEDv). */
  medications: ReadonlyArray<MobileMedicationItem>;
  /** Current time, for status words. Default now. */
  now?: Date;
  /** 'current' or 'past' (controlled). Default 'current'. */
  view?: 'current' | 'past';
  defaultView?: 'current' | 'past';
  onViewChange?: (view: 'current' | 'past') => void;
  /** Sort (controlled). Default 'due' for current, 'end' for past. */
  sort?: MobileMedicationSort;
  onSortChange?: (sort: MobileMedicationSort) => void;
  /** Grouping id, or 'none' (controlled). Default 'none' (MEDv-084). */
  grouping?: string;
  onGroupingChange?: (grouping: string) => void;
  /** Grouping choices. Default route and form. */
  groupingOptions?: ReadonlyArray<MedicationGroupingOption>;
  /** Open a medicine (e.g. B2 administration or its details). Without it the cards are not interactive. */
  onOpen?: (item: MobileMedicationItem) => void;
  /** Title. Default "Medicines". Pass null to hide it. */
  title?: string | null;
  /** Heading level of the title. Default 1. */
  headingLevel?: 1 | 2;
  /**
   * Let the list scroll inside a fixed height (number in px or a CSS length), or 'fill' to fill a flex parent.
   * The look-ahead strip ("2 more: enoxaparin, insulin glargine", MEDv-048) then names what is below. Default: no inner scroll.
   */
  listHeight?: number | string | 'fill';
  /** Region; otherwise read from ClinicalLocaleProvider. Medication line rules and mixed-case lettering follow it. */
  region?: ClinicalRegion;
  /** Render the group and sort sheet in a portal (default) or in place (false). Default from SheetContainerProvider. */
  portal?: boolean;
  /** Element the group and sort sheet renders into instead of document.body. Default from SheetContainerProvider. */
  container?: HTMLElement | null;
  /** Push a history entry so the back button closes the group and sort sheet. Default true. */
  closeOnBrowserBack?: boolean;
  className?: string;
}

function useBelowItems(enabled: boolean, listRef: React.RefObject<HTMLElement | null>, deps: unknown[]): string[] {
  const [below, setBelow] = React.useState<string[]>([]);
  const measure = React.useCallback(() => {
    const list = listRef.current;
    if (!enabled || !list) {
      setBelow(b => (b.length ? [] : b));
      return;
    }
    const bottom = list.getBoundingClientRect().bottom;
    const ids: string[] = [];
    list.querySelectorAll<HTMLElement>('[data-med-id]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.top + Math.min(24, r.height / 2) > bottom) ids.push(el.dataset.medId as string);
    });
    setBelow(prev => (prev.join('|') === ids.join('|') ? prev : ids));
  }, [enabled, listRef]);
  React.useEffect(() => {
    measure();
    const list = listRef.current;
    if (!enabled || !list) return undefined;
    list.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      list.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure, enabled, ...deps]);
  return below;
}

/**
 * Patient medicines list for phones (concept A3): Current and Past, group and sort from bottom sheets, each medicine as
 * a wrapping MedicationLine with regional mixed-case lettering and a status line in words, and a look-ahead strip that
 * names the medicines below the visible area.
 */
export function MobileMedicationsList(props: MobileMedicationsListProps) {
  const {
    medications,
    onOpen,
    title = 'Medicines',
    headingLevel = 1,
    listHeight,
    groupingOptions = MOBILE_MEDICATION_GROUPINGS,
    portal,
    container,
    closeOnBrowserBack,
    className,
  } = props;
  const now = props.now ?? new Date();
  const { region } = useClinicalLocale(props.region);
  const id = useId('cui-mmeds');
  const [view, setView] = useControllableState<'current' | 'past'>(props.view, props.defaultView ?? 'current', props.onViewChange);
  const [sortState, setSort] = useControllableState<MobileMedicationSort | undefined>(props.sort, undefined, v => v && props.onSortChange?.(v));
  const [grouping, setGrouping] = useControllableState<string>(props.grouping, 'none', props.onGroupingChange);
  const [sheet, setSheet] = React.useState<'sort' | 'group' | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const current = medications.filter(m => isCurrentMedicationStatus(m.status));
  const past = medications.filter(m => !isCurrentMedicationStatus(m.status));
  const rows = view === 'current' ? current : past;
  const sortChoices: MobileMedicationSort[] = view === 'current' ? ['due', 'name', 'start'] : ['end', 'name'];
  const sort: MobileMedicationSort = sortState && sortChoices.includes(sortState) ? sortState : sortChoices[0];
  const sorted = mobileSortMedications(rows, sort, region);
  const groupOption = groupingOptions.find(g => g.id === grouping);
  const groups = groupOption
    ? groupMedications(sorted, groupOption)
    : [{ key: 'all', label: '', isNull: false, rows: sorted }];
  const flat = groups.flatMap(g => g.rows);
  const scrolls = listHeight != null;
  const below = useBelowItems(scrolls, listRef, [view, sort, grouping, medications]);

  const Title = headingLevel === 1 ? 'h1' : 'h2';
  const GroupHeading = headingLevel === 1 ? 'h2' : 'h3';
  const name = (m: MobileMedicationItem) => medicationDrugName(m.line, { region });

  let strip: React.ReactNode = null;
  if (below.length) {
    const entries = below
      .map(bid => flat.find(m => m.id === bid))
      .filter((m): m is MobileMedicationItem => !!m)
      .map(m => ({ id: m.id, label: name(m), hasAlert: !!m.alerts?.length || !!m.hasAlert }));
    const width = (listRef.current?.clientWidth || 358) - 96;
    const tokens = medicationLookAheadTokens(entries, { mode: view === 'past' ? 'countOnly' : 'names', availableWidth: width, measure: (s, bold) => s.length * (bold ? 8 : 7.4) });
    const placed = new Set(tokens.flatMap(t => (t.kind === 'name' ? [t.id] : [])));
    // Nearest first, reading downwards (the tokens are ordered right to left for a horizontal strip, MEDv-048).
    const names = entries.filter(e => placed.has(e.id));
    const others = entries.length - names.length;
    const alert = entries.some(e => e.hasAlert);
    strip = (
      <button
        type="button"
        className="cui-mobile-meds__lookahead"
        aria-label={`${entries.length} more medicines below${names.length ? `: ${entries.map(e => e.label).join(', ')}` : ''}${alert ? '. One or more has an alert' : ''}. Show the next one`}
        onClick={() =>
          Array.from(listRef.current?.querySelectorAll<HTMLElement>('[data-med-id]') ?? [])
            .find(el => el.dataset.medId === entries[0].id)
            ?.scrollIntoView({ block: 'nearest' })
        }
      >
        <MobileGlyph name="arrowDown" size={16} />
        <span>
          <strong>{entries.length} more{names.length ? ':' : ''}</strong>
          {names.length ? ` ${names.map(n => n.label).join(', ')}${others ? `, ${others} other${others === 1 ? '' : 's'}` : ''}` : ''}
          {alert ? <span className="cui-mobile-meds__lookahead-alert"> (alert)</span> : null}
        </span>
      </button>
    );
  }

  return (
    <section
      className={cx('cui-mobile-meds', listHeight === 'fill' && 'cui-mobile-meds--fill', className)}
      aria-labelledby={title ? `${id}-t` : undefined}
      aria-label={title ? undefined : 'Medicines'}
    >
      <div className="cui-mobile-meds__controls">
        {title ? (
          <Title id={`${id}-t`} className="cui-mobile-meds__title">
            {title}
          </Title>
        ) : null}
        <SegmentedControl
          label="Show"
          value={view}
          onChange={v => setView(v as 'current' | 'past')}
          options={[
            { value: 'current', label: 'Current', count: current.length },
            { value: 'past', label: 'Past', count: past.length },
          ]}
        />
        <div className="cui-mobile-meds__tools">
          <TouchButton size={48} icon="group" onClick={() => setSheet('group')} aria-haspopup="dialog">
            Group: {groupOption ? groupOption.label.toLowerCase() : 'none'}
          </TouchButton>
          <TouchButton size={48} icon="sort" onClick={() => setSheet('sort')} aria-haspopup="dialog">
            Sort: {MOBILE_MEDICATION_SORT_LABELS[sort]}
          </TouchButton>
        </div>
      </div>

      <div
        ref={listRef}
        className={cx('cui-mobile-meds__list', scrolls && 'cui-mobile-meds__list--scroll')}
        style={scrolls && listHeight !== 'fill' ? { maxHeight: listHeight } : undefined}
        tabIndex={scrolls ? 0 : undefined}
        role={scrolls ? 'region' : undefined}
        aria-label={scrolls ? `${view === 'current' ? 'Current' : 'Past'} medicines` : undefined}
      >
        {flat.length === 0 ? <p className="cui-mobile-meds__empty">{view === 'current' ? 'No current medicines.' : 'No past medicines.'}</p> : null}
        {groups.map(g => (
          <React.Fragment key={g.key}>
            {groupOption ? (
              <GroupHeading className="cui-mobile-meds__group-title">
                {g.label} ({g.rows.length})
              </GroupHeading>
            ) : null}
            <ul className="cui-mobile-meds__items">
              {g.rows.map(m => {
                const parts = mobileMedicationStatusParts(m, now);
                const content = (
                  <>
                    <MedicationLine {...m.line} region={region} block className="cui-mobile-meds__line" />
                    {parts.length ? (
                      <span className="cui-mobile-meds__status">
                        {parts.map((p, i) => (
                          <span key={i} className={cx('cui-mobile-meds__part', `cui-mobile-meds__part--${p.tone}`)}>
                            {p.mark ? <MobileGlyph name={p.mark === 'available' ? 'plusCircle' : p.mark === 'suspended' ? 'pause' : p.mark} size={16} /> : null}
                            {p.text}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </>
                );
                return (
                  <li key={m.id} data-med-id={m.id} className="cui-mobile-meds__item">
                    {onOpen ? (
                      <button type="button" className="cui-mobile-meds__card" onClick={() => onOpen(m)}>
                        {content}
                      </button>
                    ) : (
                      <div className="cui-mobile-meds__card">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        ))}
      </div>
      {strip}

      <BottomSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet === 'group' ? 'Group medicines' : 'Sort medicines'}
        portal={portal}
        container={container}
        closeOnBrowserBack={closeOnBrowserBack}
        footer={<ActionBar sticky={false} actions={[{ label: 'Done', variant: 'primary', onClick: () => setSheet(null) }]} />}
      >
        <fieldset className="cui-mobile-meds__choices">
          <legend className="cui-visually-hidden">{sheet === 'group' ? 'Group by' : 'Sort by'}</legend>
          {(sheet === 'group'
            ? [{ value: 'none', label: 'No grouping' }, ...groupingOptions.map(g => ({ value: g.id, label: g.label }))]
            : sortChoices.map(s => ({ value: s, label: MOBILE_MEDICATION_SORT_LABELS[s].replace(/^./, c => c.toUpperCase()) }))
          ).map(o => {
            const checked = sheet === 'group' ? grouping === o.value : sort === o.value;
            return (
              <label key={o.value} className={cx('cui-mobile-meds__choice', checked && 'cui-mobile-meds__choice--on')}>
                <input
                  type="radio"
                  name={`${id}-${sheet}`}
                  checked={checked}
                  onChange={() => (sheet === 'group' ? setGrouping(o.value) : setSort(o.value as MobileMedicationSort))}
                />
                <span>{o.label}</span>
              </label>
            );
          })}
        </fieldset>
      </BottomSheet>
    </section>
  );
}
