import React from 'react';
import { Button, cx, useId } from '../../core';
import type { GraphicDefinition } from '../AnnotatedGraphicCanvas/AnnotatedGraphicCanvas';
import { matchesDescription } from '../utils/searchText';

export interface GraphicPickerProps {
  /** All graphics available in this context. */
  graphics: GraphicDefinition[];
  /** Ids of the short list of commonly used graphics, the primary way to choose (NwG-0024). */
  commonIds: string[];
  /** Load the chosen graphic (NwG-0014/0023). */
  onLoad: (graphic: GraphicDefinition) => void;
  /** Id of the graphic already loaded, marked in the lists. */
  loadedId?: string;
  /** Heading. Default "Load a diagram". */
  title?: string;
  /** Minimum characters before keyword search runs. Default 2 [suggested]. */
  minChars?: number;
  className?: string;
}

const AGE: Record<string, string> = { adult: 'Adult', teenager: 'Teenager', child: 'Child', infant: 'Infant', baby: 'Baby' };

function describe(g: GraphicDefinition): string {
  return [g.ageGroup ? AGE[g.ageGroup] : '', g.sex === 'male' ? 'male' : g.sex === 'female' ? 'female' : '', g.images.map((i) => i.label.toLowerCase()).join(' and ')].filter(Boolean).join(', ');
}

/**
 * Choose and load a diagram (NwG-0014..0027): a short list of common graphics first, and a separate,
 * visually distinct keyword search for the rest. Age, sex and views are shown so the right drawing is chosen.
 */
export function GraphicPicker({ graphics, commonIds, onLoad, loadedId, title = 'Load a diagram', minChars = 2, className }: GraphicPickerProps) {
  const id = useId('cui-gpick');
  const [query, setQuery] = React.useState('');
  const common = commonIds.map((c) => graphics.find((g) => g.id === c)).filter((g): g is GraphicDefinition => !!g);
  const canSearch = query.replace(/\s/g, '').length >= minChars;
  const results = canSearch ? graphics.filter((g) => [g.title, ...(g.keywords ?? []), describe(g)].some((t) => matchesDescription(query, t))) : [];

  const item = (g: GraphicDefinition) => (
    <li key={g.id} className={cx('cui-graphic-picker__item', loadedId === g.id && 'cui-graphic-picker__item--loaded')}>
      <span className="cui-graphic-picker__text">
        <span className="cui-graphic-picker__name">{g.title}</span>
        <span className="cui-graphic-picker__meta">{describe(g)}</span>
      </span>
      {loadedId === g.id ? (
        <span className="cui-graphic-picker__current">Loaded</span>
      ) : (
        <Button size="sm" onClick={() => onLoad(g)} aria-label={`Load ${g.title}`}>Load</Button>
      )}
    </li>
  );

  return (
    <section className={cx('cui-graphic-picker', className)} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="cui-graphic-picker__title">{title}</h3>
      <div className="cui-graphic-picker__common">
        <h4 className="cui-graphic-picker__heading">Common diagrams</h4>
        <ul className="cui-graphic-picker__list">{common.map(item)}</ul>
      </div>
      <div className="cui-graphic-picker__search" role="search">
        <label htmlFor={`${id}-q`} className="cui-graphic-picker__heading">Search all diagrams</label>
        <input id={`${id}-q`} className="cui-noting-input cui-graphic-picker__input" type="search" value={query} placeholder="Type a body part or view" onChange={(e) => setQuery(e.target.value)} aria-describedby={`${id}-count`} />
        <span id={`${id}-count`} className="cui-visually-hidden" aria-live="polite">
          {canSearch ? `${results.length} ${results.length === 1 ? 'diagram' : 'diagrams'} found` : ''}
        </span>
        {canSearch ? (
          results.length ? <ul className="cui-graphic-picker__list">{results.map(item)}</ul> : <p className="cui-graphic-picker__none">No diagrams found. Try another word, such as "hand" or "chest".</p>
        ) : null}
      </div>
    </section>
  );
}
