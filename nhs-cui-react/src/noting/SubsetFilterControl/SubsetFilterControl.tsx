import React from 'react';
import { Icon, cx, useClinicalLocale, useControllableState, useId, type ClinicalRegion } from '../../core';
import { useClickAway } from '../internal/ModalFrame';
import { SNOMED_EDITIONS, type TerminologySubsetInfo } from '../utils/regions/terminology';
import { devWarn } from '../utils/dev';

export interface SubsetFilterControlProps {
  /**
   * Subsets (reference sets or value sets) with human-readable labels (Matching 2.4.1). At most three
   * (more are not shown). Default: the region's default subsets (AU NCTS value sets, NZ Edition
   * reference sets; none for GB).
   */
  levels?: TerminologySubsetInfo[];
  /**
   * The subsets are nested, most general first: a slider moves between "No filter" and each level
   * (Matching 2.4.1 SHOULD slider when nested). Otherwise "Filter"/"No filter" choices are offered,
   * one per subset, and several can be on at once.
   */
  nested?: boolean;
  /** Ids of the subsets in force (controlled). Empty for no filter. */
  value?: string[];
  defaultValue?: string[];
  /** Called immediately on every change so results update at once. */
  onChange?: (ids: string[]) => void;
  /** Instruction shown in the panel. */
  instruction?: string;
  /** Characters of the current filter label shown on the button before '…'. Default 20 (Matching 2.4.1). */
  maxButtonChars?: number;
  /** Jurisdiction for the default subsets. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  id?: string;
  className?: string;
}

/** Shorten a label to `max` characters with '…' (subset button labels, Matching 2.4.1). */
function truncateLabel(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, Math.max(1, max - 1)).trimEnd()}…` : label;
}

/**
 * Button and panel to adjust the subset filter applied to terminology matches (Matching 2.4.1):
 * shows the current filter on the button (truncated after 20 characters, full text inside), opens a
 * non-modal panel with a slider for nested subsets or Filter/No filter choices, and closes on click-away or Escape.
 */
export function SubsetFilterControl({
  levels: levelsProp,
  nested = false,
  value,
  defaultValue = [],
  onChange,
  instruction,
  maxButtonChars = 20,
  region: regionProp,
  id,
  className,
}: SubsetFilterControlProps) {
  const { region } = useClinicalLocale(regionProp);
  const baseId = useId('cui-subset', id);
  const all = levelsProp ?? SNOMED_EDITIONS[region].defaultSubsets;
  if (all.length > 3) devWarn('SubsetFilterControl: no more than three subset levels are shown (Matching 2.4.1).');
  const levels = all.slice(0, 3);
  const [selected, setSelected] = useControllableState<string[]>(value, defaultValue, onChange);
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  useClickAway(rootRef, open, () => setOpen(false));
  React.useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('input')?.focus();
  }, [open]);

  const active = levels.filter((l) => selected.includes(l.id));
  const current = active.length === 0 ? 'No filter' : active.map((l) => l.label).join(', ');
  const sliderIndex = nested ? (active.length ? levels.findIndex((l) => l.id === active[active.length - 1].id) + 1 : 0) : 0;

  if (!levels.length) return null;
  return (
    <div ref={rootRef} className={cx('cui-subset-filter', className)} data-region={region}>
      <button
        ref={buttonRef}
        type="button"
        className="cui-subset-filter__button"
        aria-expanded={open}
        aria-controls={`${baseId}-panel`}
        aria-label={`Subset filter: ${current}. Change filter`}
        title={current}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="filter" size={16} />
        <span>{truncateLabel(current, maxButtonChars)}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={`${baseId}-panel`}
          role="dialog"
          aria-labelledby={`${baseId}-title`}
          className="cui-noting-popover cui-subset-filter__panel"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              buttonRef.current?.focus();
            }
          }}
        >
          <p id={`${baseId}-title`} className="cui-subset-filter__current">
            Current filter: <strong>{current}</strong>
          </p>
          {instruction ? <p className="cui-prompt cui-subset-filter__instruction">{instruction}</p> : null}
          {nested ? (
            <div className="cui-subset-filter__slider">
              <input
                type="range"
                min={0}
                max={levels.length}
                step={1}
                value={sliderIndex}
                aria-label="Filter level"
                aria-valuetext={sliderIndex === 0 ? 'No filter' : levels[sliderIndex - 1].label}
                onChange={(e) => {
                  const i = Number(e.target.value);
                  setSelected(i === 0 ? [] : [levels[i - 1].id]);
                }}
              />
              <ol className="cui-subset-filter__ticks" aria-hidden="true">
                <li className={cx(sliderIndex === 0 && 'cui-subset-filter__tick--on')}>No filter</li>
                {levels.map((l, i) => (
                  <li key={l.id} className={cx(sliderIndex === i + 1 && 'cui-subset-filter__tick--on')}>{l.label}</li>
                ))}
              </ol>
            </div>
          ) : (
            levels.map((l) => {
              const on = selected.includes(l.id);
              const name = `${baseId}-${l.id}`;
              return (
                <fieldset key={l.id} className="cui-subset-filter__choice">
                  <legend className="cui-subset-filter__legend">{l.label}</legend>
                  {l.description ? <span className="cui-subset-filter__description">{l.description}</span> : null}
                  <span className="cui-subset-filter__radios">
                    <label>
                      <input type="radio" name={name} checked={on} onChange={() => setSelected([...selected.filter((x) => x !== l.id), l.id])} />
                      Filter
                    </label>
                    <label>
                      <input type="radio" name={name} checked={!on} onChange={() => setSelected(selected.filter((x) => x !== l.id))} />
                      No filter
                    </label>
                  </span>
                </fieldset>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
