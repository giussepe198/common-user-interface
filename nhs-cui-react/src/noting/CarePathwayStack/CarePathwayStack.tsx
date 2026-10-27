import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import { PathwayTimeline, StatusSymbol, type CarePathway } from '../PathwayTimeline/PathwayTimeline';
import { pathwayStageCode } from '../utils/pathway';

/** How much of a pathway is shown: title bar only, compact, or full. Pathways can be shrunk but never hidden. */
export type PathwaySize = 'collapsed' | 'medium' | 'expanded';

export interface CarePathwayStackProps {
  pathways: CarePathway[];
  /** Size per pathway id (controlled). */
  sizes?: Record<string, PathwaySize>;
  defaultSizes?: Record<string, PathwaySize>;
  onSizesChange?: (sizes: Record<string, PathwaySize>) => void;
  /** Size of pathways without an entry. Default: 'expanded' for the first, 'collapsed' for the rest. */
  defaultSize?: PathwaySize;
  /** Heading. Default "Care pathways". */
  title?: string;
  className?: string;
}

const STATUS_LABEL: Record<CarePathway['status'], string> = { active: 'Active', paused: 'Paused', completed: 'Completed', abnormal: 'Needs attention' };

/**
 * Vertical stack of the care pathways a patient is on (Care Pathways Conceptual Modelling;
 * experimental): the number of pathways, a title bar per pathway with status and reason always
 * visible (even when collapsed), window-style controls on the right to minimise, show a compact view
 * or maximise, and the pathway timeline inside.
 */
export function CarePathwayStack({ pathways, sizes, defaultSizes, onSizesChange, defaultSize, title = 'Care pathways', className }: CarePathwayStackProps) {
  const id = useId('cui-pathways');
  const initial = React.useMemo(() => {
    const out: Record<string, PathwaySize> = { ...defaultSizes };
    pathways.forEach((p, i) => {
      if (!out[p.id]) out[p.id] = defaultSize ?? (i === 0 ? 'expanded' : 'collapsed');
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [state, setState] = useControllableState<Record<string, PathwaySize>>(sizes, initial, onSizesChange);
  const sizeOf = (p: CarePathway, i: number): PathwaySize => state[p.id] ?? defaultSize ?? (i === 0 ? 'expanded' : 'collapsed');

  return (
    <section className={cx('cui-pathway-stack', className)} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="cui-pathway-stack__title">
        {title}
        <span className="cui-pathway-stack__count">{`On ${pathways.length} ${pathways.length === 1 ? 'pathway' : 'pathways'}`}</span>
      </h2>
      <ul className="cui-pathway-stack__list">
        {pathways.map((p, i) => {
          const size = sizeOf(p, i);
          const currentIdx = p.stages.findIndex((s) => s.state === 'current');
          const current = p.stages[currentIdx];
          const abnormal = p.status === 'abnormal' || p.status === 'paused';
          const headId = `${id}-${p.id}`;
          const control = (to: PathwaySize, label: string, glyph: string) => (
            <button
              type="button"
              className={cx('cui-pathway-stack__control', size === to && 'cui-pathway-stack__control--on')}
              aria-pressed={size === to}
              title={label}
              onClick={() => setState({ ...state, [p.id]: to })}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d={glyph} fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
              <span className="cui-visually-hidden">{`${label}: ${p.title}`}</span>
            </button>
          );
          return (
            <li key={p.id} className={cx('cui-pathway-stack__item', `cui-pathway-stack__item--${p.status}`, `cui-pathway-stack__item--${size}`)}>
              <div className="cui-pathway-stack__bar">
                <h3 id={headId} className="cui-pathway-stack__name">{p.title}</h3>
                <span className={cx('cui-pathway-stack__status', abnormal && 'cui-pathway-stack__status--alert')}>
                  {p.status === 'abnormal' ? <Icon name="warning" size={16} /> : p.status === 'paused' ? <Icon name="clock" size={16} /> : p.status === 'completed' ? <Icon name="check" size={16} /> : null}
                  {STATUS_LABEL[p.status]}
                  {p.statusReason ? `: ${p.statusReason}` : ''}
                </span>
                {size === 'collapsed' && current ? (
                  <span className="cui-pathway-stack__current">
                    Current stage {pathwayStageCode(currentIdx)}: {current.title}
                    <StatusSymbol status={current.status} />
                  </span>
                ) : null}
                <span className="cui-pathway-stack__controls" role="group" aria-label={`View of ${p.title}`}>
                  {control('collapsed', 'Minimise', 'M3 12h10')}
                  {control('medium', 'Compact view', 'M3 6h10v6H3z')}
                  {control('expanded', 'Maximise', 'M2 2h12v12H2z')}
                </span>
              </div>
              {size !== 'collapsed' ? (
                <div className="cui-pathway-stack__body" aria-labelledby={headId} role="region">
                  {size === 'expanded' && p.nationalGuidance ? <p className="cui-pathway-stack__guidance">Guidance: {p.nationalGuidance}</p> : null}
                  <PathwayTimeline pathway={p} capacity={size === 'medium' ? 5 : 9} showBundles={size === 'expanded'} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
