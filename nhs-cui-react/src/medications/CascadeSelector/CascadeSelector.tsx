import React from 'react';
import { cx, useClinicalLocale, useControllableState, useId, VisuallyHidden } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatGenericName } from '../utils/names';
import { formatBrandNameForRegion } from '../utils/regionalText';
import { applyTallManLettering, tallManDefaultFor } from '../utils/tallMan';

/** One item in a cascading list, e.g. a route, form or strength. */
export interface CascadeOption {
  id: string;
  /** Attribute text, e.g. "oral", "oral – modified-release" (MSP-0970), "inhaled – nebuliser". */
  label: string;
  /** Drug the item belongs to, shown first ("atenolol – oral", "TENORMIN – oral") when a brand was selected (MSP-1000). */
  drug?: { genericName?: string; brandName?: string };
  /** generic or brand item: the list is split into a generic part above a brand part (MSP-1010/1020). */
  kind?: 'generic' | 'brand';
  /** Supplementary text in grey italics (MSP-1910). */
  supplementary?: string;
  /** The next cascading list after this item. Its options must be relevant to this choice (MSP-0890). */
  next?: CascadeLevel;
}

/** One cascading list. */
export interface CascadeLevel {
  id: string;
  /** Name of the list for assistive technology and the selection trail, e.g. "Route", "Form". */
  label: string;
  options: CascadeOption[];
  /** Item giving access to values not in the list (MSP-0940). Default "other...". Pass null when there are none. */
  otherLabel?: string | null;
}

export interface CascadeSelectorProps {
  /** The first cascading list, shown once a drug is selected (MSP-0850/0860). At most two further levels (MSP-0850). */
  root: CascadeLevel;
  /** Selected option ids, one per level (controlled). */
  value?: string[];
  defaultValue?: string[];
  /** Called on every selection with the path of option ids. */
  onChange?: (path: string[]) => void;
  /** Called when the last list has a selection: show template prescriptions next (MSP-1040). */
  onComplete?: (path: string[], options: CascadeOption[]) => void;
  /** "other..." chosen in a list: open the detailed form or extended options (MSP-0940). */
  onOther?: (levelId: string, pathSoFar: string[]) => void;
  /** Jurisdiction for drug names in items; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** Mixed-case lettering for drug names in items. Default on for AU and NZ. */
  tallManLettering?: boolean;
  /** Accessible name of the whole control. Default "Choose route and form". */
  label?: string;
  className?: string;
}

/** Levels shown for a path: the root, then each selected option's next list. */
export function cascadeLevelsForPath(root: CascadeLevel, path: string[]): Array<{ level: CascadeLevel; selected?: CascadeOption }> {
  const out: Array<{ level: CascadeLevel; selected?: CascadeOption }> = [];
  let level: CascadeLevel | undefined = root;
  let i = 0;
  while (level && out.length < 3) {
    const selected: CascadeOption | undefined = level.options.find(o => o.id === path[i]);
    out.push({ level, selected });
    level = selected?.next;
    i++;
  }
  return out;
}

function DrugPart({ drug, region, tallMan }: { drug: NonNullable<CascadeOption['drug']>; region: ClinicalRegion; tallMan: boolean }) {
  const letter = (s: string) => (tallMan ? applyTallManLettering(s, region) : s);
  const show = (plain: string, cls: string, Tag: 'strong' | 'span') => {
    const d = letter(plain);
    return (
      <Tag className={cls}>
        {d === plain ? plain : <><span aria-hidden="true">{d}</span><VisuallyHidden>{plain}</VisuallyHidden></>}
      </Tag>
    );
  };
  const g = drug.genericName ? formatGenericName(drug.genericName) : '';
  const b = drug.brandName ? formatBrandNameForRegion(drug.brandName, region) : '';
  return (
    <>
      {g ? show(g, 'cui-cascade__generic', 'strong') : null}
      {g && b ? ' – ' : null}
      {b ? show(b, 'cui-cascade__brand', 'span') : null}
      {' – '}
    </>
  );
}

/**
 * Cascading lists after a drug is selected (Search and Prescribe 6.3, MSP-0850 to MSP-1020): up to three
 * side-by-side lists such as route then form, each appearing when the previous has a selection, each
 * limited to items relevant to the previous choice, with "other..." last below a line. Lists never
 * overlap and stay visible with their selections. A brand selection gives a generic part above a brand part.
 */
export function CascadeSelector({
  root, value, defaultValue = [], onChange, onComplete, onOther, region: regionProp, tallManLettering, label = 'Choose route and form', className,
}: CascadeSelectorProps) {
  const uid = useId('cui-cascade');
  const { region } = useClinicalLocale(regionProp);
  const tallMan = tallManLettering ?? tallManDefaultFor(region);
  const [path, setPath] = useControllableState(value, defaultValue, onChange);
  const levels = cascadeLevelsForPath(root, path);
  const listRefs = React.useRef<Array<HTMLUListElement | null>>([]);

  const focusList = (li: number, which: 'selected' | 'first' = 'selected') => {
    const ul = listRefs.current[li];
    const el = (which === 'selected' ? ul?.querySelector<HTMLElement>('[aria-selected="true"]') : null) ?? ul?.querySelector<HTMLElement>('[role="option"]');
    el?.focus();
  };

  const select = (li: number, opt: CascadeOption) => {
    const next = [...path.slice(0, li), opt.id];
    setPath(next);
    if (opt.next && li < 2) setTimeout(() => focusList(li + 1, 'first'), 0);
    else {
      const opts = cascadeLevelsForPath(root, next).map(l => l.selected).filter((o): o is CascadeOption => !!o);
      onComplete?.(next, opts);
    }
  };

  const onKey = (e: React.KeyboardEvent, li: number) => {
    const ul = listRefs.current[li];
    const items = Array.from(ul?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, i - 1)]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
    else if (e.key === 'ArrowRight' && levels[li + 1]) { e.preventDefault(); focusList(li + 1); }
    else if ((e.key === 'ArrowLeft' || e.key === 'Escape') && li > 0) { e.preventDefault(); focusList(li - 1); }
  };

  return (
    <div className={cx('cui-cascade', className)} role="group" aria-label={label}>
      {levels.map(({ level, selected }, li) => {
        const generic = level.options.filter(o => o.kind !== 'brand');
        const brand = level.options.filter(o => o.kind === 'brand');
        const otherLabel = level.otherLabel === undefined ? 'other...' : level.otherLabel;
        const renderOption = (o: CascadeOption, divided: boolean) => {
          const isSel = selected?.id === o.id;
          return (
            <li
              key={o.id}
              role="option"
              aria-selected={isSel}
              tabIndex={isSel || (!selected && o === level.options[0]) ? 0 : -1}
              className={cx('cui-cascade__option', isSel && 'is-selected', o.kind === 'brand' && 'cui-cascade__option--brand', divided && 'has-divider')}
              onClick={() => select(li, o)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(li, o); } }}
            >
              <span>
                {o.drug ? <DrugPart drug={o.drug} region={region} tallMan={tallMan} /> : null}
                {o.label}
              </span>
              {o.supplementary ? <span className="cui-cascade__supp">{o.supplementary}</span> : null}
            </li>
          );
        };
        return (
          <div key={`${level.id}-${li}`} className={cx('cui-cascade__level', `cui-cascade__level--${region.toLowerCase()}`)}>
            <span className="cui-cascade__heading" id={`${uid}-h${li}`}>{level.label}</span>
            <ul
              ref={el => { listRefs.current[li] = el; }}
              role="listbox"
              aria-labelledby={`${uid}-h${li}`}
              className="cui-cascade__list"
              onKeyDown={e => onKey(e, li)}
            >
              {/* Generic equivalents above brand items (MSP-1010/1020) */}
              {generic.map(o => renderOption(o, false))}
              {brand.map((o, i) => renderOption(o, i === 0 && generic.length > 0))}
              {otherLabel ? (
                // Last, below a line, no shortcut (MSP-0940 to MSP-0960)
                <li
                  role="option"
                  aria-selected={false}
                  tabIndex={-1}
                  className="cui-cascade__option cui-cascade__option--other has-divider"
                  onClick={() => onOther?.(level.id, path.slice(0, li))}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOther?.(level.id, path.slice(0, li)); } }}
                >
                  {otherLabel}
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
