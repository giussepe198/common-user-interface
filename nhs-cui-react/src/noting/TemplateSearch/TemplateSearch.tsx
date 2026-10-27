import React from 'react';
import { Button, Icon, cx, useId } from '../../core';
import { findTermMatchRanges } from '../utils/searchText';
import { matchTemplates, templateBreadcrumb, type TemplateDefinition, type TemplateMatch, type TemplateSectionDef } from '../utils/templates';

export interface TemplateSearchProps {
  /** Templates that can be found. */
  templates: TemplateDefinition[];
  /** Open the chosen whole template (only whole templates can be chosen from results, Theme 1). */
  onSelect: (template: TemplateDefinition) => void;
  /** Field label. Default "Find a template". */
  label?: string;
  /** Current context, e.g. the clinician's specialty; shown in the filter control (Theme 1). */
  context?: string;
  /** Context filter on (controlled). Default on when a context is given. */
  filterEnabled?: boolean;
  onFilterEnabledChange?: (on: boolean) => void;
  /** Results shown before "Show more". Default 10 [suggested]. */
  maxResults?: number;
  /** Replaces the built-in matcher. */
  match?: (query: string, options: { context?: string; filterEnabled: boolean }) => { templates: TemplateMatch[]; sections: TemplateMatch[] };
  /** Minimum characters before matching. Default 2 [suggested]. */
  minChars?: number;
  id?: string;
  className?: string;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const ranges = findTermMatchRanges(query, text);
  if (!ranges.length) return <>{text}</>;
  const out: React.ReactNode[] = [];
  let i = 0;
  ranges.forEach(([s, e], k) => {
    if (s > i) out.push(text.slice(i, s));
    out.push(<mark key={k} className="cui-template-search__hit">{text.slice(s, e)}</mark>);
    i = e;
  });
  if (i < text.length) out.push(text.slice(i));
  return <>{out}</>;
}

function SectionTree({ sections, depth = 0 }: { sections: TemplateSectionDef[]; depth?: number }) {
  return (
    <ul className="cui-template-search__tree" style={{ paddingLeft: depth ? 'var(--space-4)' : undefined }}>
      {sections.map((s) => (
        <li key={s.id}>
          {s.title}
          {s.children?.length ? <SectionTree sections={s.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * Template search (Noting Using Templates, Theme 1, experimental): progressive matching on title,
 * synonyms, abbreviations and section headings; context filter shown and switchable; suggested
 * templates marked; additional templates marked as opening separately; metadata in a fly-out on
 * hover and focus; labels wrap and are never truncated.
 */
export function TemplateSearch({
  templates,
  onSelect,
  label = 'Find a template',
  context,
  filterEnabled,
  onFilterEnabledChange,
  maxResults = 10,
  match,
  minChars = 2,
  id,
  className,
}: TemplateSearchProps) {
  const baseId = useId('cui-tsearch', id);
  const [query, setQuery] = React.useState('');
  const [filterOwn, setFilterOwn] = React.useState(true);
  const filterOn = !!context && (filterEnabled ?? filterOwn);
  const [showAll, setShowAll] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [flyout, setFlyout] = React.useState<string | null>(null);
  const canSearch = query.replace(/\s/g, '').length >= minChars;
  const result = canSearch ? (match ? match(query, { context, filterEnabled: filterOn }) : matchTemplates(templates, query, { context, filterEnabled: filterOn })) : { templates: [], sections: [] };
  const shown = showAll ? result.templates : result.templates.slice(0, maxResults);
  const hidden = result.templates.length - shown.length;
  const setFilter = (on: boolean) => {
    setFilterOwn(on);
    onFilterEnabledChange?.(on);
  };

  return (
    <div className={cx('cui-template-search', className)}>
      <label htmlFor={`${baseId}-q`} className="cui-template-search__label">{label}</label>
      <div className="cui-template-search__field">
        <span className="cui-template-search__icon" aria-hidden="true"><Icon name="search" /></span>
        <input
          id={`${baseId}-q`}
          className="cui-noting-input cui-template-search__input"
          type="text"
          autoComplete="off"
          value={query}
          aria-describedby={`${baseId}-status`}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowAll(false);
          }}
        />
      </div>
      {context ? (
        <label className="cui-template-search__filter">
          <input type="checkbox" checked={filterOn} onChange={(e) => setFilter(e.target.checked)} />
          <span>
            Filter: <strong>{context}</strong>
            <span className="cui-template-search__filter-note">{filterOn ? ' (general templates included)' : ' (off: all templates)'}</span>
          </span>
        </label>
      ) : null}
      <span id={`${baseId}-status`} className="cui-visually-hidden" aria-live="polite">
        {canSearch ? `${result.templates.length} templates and ${result.sections.length} sections found` : ''}
      </span>
      {canSearch ? (
        result.templates.length || result.sections.length ? (
          <div className="cui-template-search__results">
            {result.templates.length ? (
              <ul className="cui-template-search__list" aria-label="Templates">
                {shown.map((m) => {
                  const t = m.template;
                  const isOpen = expanded.has(t.id);
                  const flyId = `${baseId}-fly-${t.id}`;
                  return (
                    <li
                      key={t.id}
                      className={cx('cui-template-search__item', t.suggested && 'cui-template-search__item--suggested')}
                      onMouseEnter={() => setFlyout(t.id)}
                      onMouseLeave={() => setFlyout((f) => (f === t.id ? null : f))}
                      onFocus={() => setFlyout(t.id)}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFlyout((f) => (f === t.id ? null : f));
                      }}
                    >
                      <div className="cui-template-search__row">
                        {t.sections?.length ? (
                          <button
                            type="button"
                            className="cui-template-search__expand"
                            aria-expanded={isOpen}
                            aria-label={`${isOpen ? 'Hide' : 'Show'} sections of ${t.title}`}
                            onClick={() => setExpanded((x) => {
                              const n = new Set(x);
                              if (n.has(t.id)) n.delete(t.id);
                              else n.add(t.id);
                              return n;
                            })}
                          >
                            <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={16} />
                          </button>
                        ) : <span className="cui-template-search__expand-space" />}
                        <button type="button" className="cui-template-search__title" aria-describedby={t.metadata?.length ? flyId : undefined} onClick={() => onSelect(t)}>
                          <Highlight text={t.title} query={query} />
                          {m.via === 'abbreviation' ? <span className="cui-template-search__via"> (abbreviation)</span> : m.via === 'synonym' ? <span className="cui-template-search__via"> (matched another name)</span> : null}
                        </button>
                        {t.suggested ? <span className="cui-template-search__badge">Suggested</span> : null}
                        {t.additional ? (
                          <span className="cui-template-search__additional" title="Opens separately">
                            <Icon name="link" size={16} />
                            <span className="cui-visually-hidden">Opens separately</span>
                          </span>
                        ) : null}
                      </div>
                      {isOpen && t.sections ? <SectionTree sections={t.sections} /> : null}
                      {t.metadata?.length ? (
                        <dl id={flyId} className="cui-template-search__flyout" hidden={flyout !== t.id}>
                          {t.metadata.map((md) => (
                            <React.Fragment key={md.label}>
                              <dt>{md.label}</dt>
                              <dd><Highlight text={md.value} query={query} /></dd>
                            </React.Fragment>
                          ))}
                        </dl>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {hidden > 0 ? (
              <Button size="sm" variant="quiet" icon="chevron-down" onClick={() => setShowAll(true)}>{`Show ${hidden} more`}</Button>
            ) : null}
            {result.sections.length ? (
              <div className="cui-template-search__sections">
                <h4 className="cui-template-search__group">Matching sections</h4>
                <ul className="cui-template-search__list">
                  {result.sections.map((m) => (
                    <li key={`${m.template.id}-${m.section?.id}`} className="cui-template-search__section">
                      <span><Highlight text={m.section?.title ?? ''} query={query} /></span>
                      <span className="cui-template-search__crumb">in {templateBreadcrumb(m.section?.path ?? [])}</span>
                      <Button size="sm" variant="quiet" onClick={() => onSelect(m.template)} aria-label={`Open ${m.template.title}`}>Open template</Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="cui-template-search__none" role="status">
            <p className="cui-template-search__none-title">No matching templates</p>
            <p className="cui-template-search__none-help">
              Try a shorter or more general word, an abbreviation such as PMH{context && filterOn ? `, or turn off the ${context} filter` : ''}. You can also browse the form structure.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
