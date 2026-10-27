import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';

/** A template offered for a trigger term. */
export interface SuggestedTemplate {
  id: string;
  title: string;
  /** Opens separately (scores, calculators), marked with an icon (Theme 3). */
  additional?: boolean;
}

/** A term that triggered suggestions: encoded (Theme 5) or matched in free text (Theme 6). */
export interface TemplateTrigger {
  id: string;
  /** The trigger term as shown in the note, e.g. "Deep vein thrombosis". */
  term: string;
  /** How it was found. */
  source?: 'encoded' | 'free text';
  templates: SuggestedTemplate[];
}

export interface TemplateSuggestionsPanelProps {
  /** Trigger terms in the order they were encoded or matched; the drop-down builds up from these. */
  triggers: TemplateTrigger[];
  /** Selected trigger (controlled). Default: the most recent. */
  selectedTriggerId?: string;
  onSelectedTriggerChange?: (id: string) => void;
  /** Open a suggested template. */
  onOpenTemplate: (template: SuggestedTemplate, trigger: TemplateTrigger) => void;
  /** Free-text triggering on (Theme 6: an option to switch it off). Omit to hide the option. */
  freeTextTriggering?: boolean;
  onFreeTextTriggeringChange?: (on: boolean) => void;
  /** Heading. Default "Suggested templates". */
  title?: string;
  className?: string;
}

/**
 * Right-hand, non-modal panel of templates suggested by terms in the note (Noting Using Templates,
 * Themes 5 and 6; experimental): a drop-down chooses which term's suggestions to show, the list is
 * linked to that term, the suggestions are marked as optional, and free-text triggering can be switched off.
 */
export function TemplateSuggestionsPanel({
  triggers,
  selectedTriggerId,
  onSelectedTriggerChange,
  onOpenTemplate,
  freeTextTriggering,
  onFreeTextTriggeringChange,
  title = 'Suggested templates',
  className,
}: TemplateSuggestionsPanelProps) {
  const id = useId('cui-tsugg');
  const latest = triggers[triggers.length - 1]?.id ?? '';
  const [selected, setSelected] = useControllableState<string>(selectedTriggerId, latest, onSelectedTriggerChange);
  const prevLatest = React.useRef(latest);
  React.useEffect(() => {
    // A newly encoded or matched term becomes the focus of the panel (Theme 5: options persist until another term is chosen).
    if (latest && latest !== prevLatest.current && selectedTriggerId === undefined) setSelected(latest);
    prevLatest.current = latest;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest]);
  const trigger = triggers.find((t) => t.id === selected) ?? triggers[triggers.length - 1];

  return (
    <aside className={cx('cui-template-suggestions', className)} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="cui-template-suggestions__title">{title}</h3>
      <p className="cui-template-suggestions__optional">
        <Icon name="info" size={16} />
        Optional: these are suggestions only, not clinical advice. You do not have to complete them.
      </p>
      {triggers.length ? (
        <>
          <label className="cui-template-suggestions__for" htmlFor={`${id}-term`}>Suggestions for</label>
          <select id={`${id}-term`} className="cui-noting-input cui-template-suggestions__select" value={trigger?.id} onChange={(e) => setSelected(e.target.value)}>
            {triggers.map((t) => (
              <option key={t.id} value={t.id}>{t.term}{t.source === 'free text' ? ' (in text)' : ''}</option>
            ))}
          </select>
          {trigger && trigger.templates.length ? (
            <ul className="cui-template-suggestions__list" aria-label={`Templates for ${trigger.term}`}>
              {trigger.templates.map((tpl) => (
                <li key={tpl.id}>
                  <button type="button" className="cui-template-suggestions__item" onClick={() => onOpenTemplate(tpl, trigger)}>
                    <span>{tpl.title}</span>
                    {tpl.additional ? (
                      <span className="cui-template-suggestions__additional" title="Opens separately">
                        <Icon name="link" size={16} />
                        <span className="cui-visually-hidden">, opens separately</span>
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cui-template-suggestions__none">No templates found for {trigger?.term}.</p>
          )}
        </>
      ) : (
        <p className="cui-template-suggestions__none">Templates related to terms in your note appear here.</p>
      )}
      {freeTextTriggering !== undefined ? (
        <label className="cui-template-suggestions__toggle">
          <input type="checkbox" checked={freeTextTriggering} onChange={(e) => onFreeTextTriggeringChange?.(e.target.checked)} />
          Suggest from words in free text
        </label>
      ) : null}
    </aside>
  );
}
