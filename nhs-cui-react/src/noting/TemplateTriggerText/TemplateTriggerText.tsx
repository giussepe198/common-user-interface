import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import type { SuggestedTemplate, TemplateTrigger } from '../TemplateSuggestionsPanel/TemplateSuggestionsPanel';
import { findTemplateTriggerPhrases, type TemplateTriggerTextMatch } from '../utils/templates';

/** A trigger term looked for in free text, with its templates (Theme 6). */
export interface TemplateTextTrigger extends TemplateTrigger {
  /** Phrases to tag, e.g. ["blood pressure", "BP"]. Default: the term. Matching is fuzzy on word endings ("smokes" matches "smoking"). */
  phrases?: string[];
}

export interface TemplateTriggerTextProps {
  /** The free text of the note, shown with tags over matched phrases. */
  text: string;
  /** Terms to look for (from a context-determined subset, e.g. SNOMED CT measurement concepts) and their templates. */
  triggers: TemplateTextTrigger[];
  /** Open a template chosen from a tag's drop-down. */
  onOpenTemplate: (template: SuggestedTemplate, trigger: TemplateTrigger, match: TemplateTriggerTextMatch) => void;
  /** Free-text triggering on (controlled). Theme 6: an option to switch it off. */
  enabled?: boolean;
  /** Default true. */
  defaultEnabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  /** Show the on/off option under the text. Default true. Hide it when `TemplateSuggestionsPanel` shows the same option. */
  showToggle?: boolean;
  /**
   * Called with the triggers found in the text, in text order, marked `source: 'free text'`, for
   * `TemplateSuggestionsPanel` (Theme 6: same right-hand panel as Theme 5).
   */
  onMatchedTriggersChange?: (triggers: TemplateTrigger[]) => void;
  /** Accessible name of the text. Default "Note text". */
  label?: string;
  className?: string;
}

/**
 * Free text with muted tags over phrases that have related templates (Noting Using Templates,
 * Theme 6; experimental). A tag spans the whole matched phrase, is not an underline, and opens a
 * floating drop-down of optional templates on focus or click. Free-text triggering can be switched off.
 */
export function TemplateTriggerText({
  text,
  triggers,
  onOpenTemplate,
  enabled,
  defaultEnabled = true,
  onEnabledChange,
  showToggle = true,
  onMatchedTriggersChange,
  label = 'Note text',
  className,
}: TemplateTriggerTextProps) {
  const id = useId('cui-ttags');
  const [on, setOn] = useControllableState<boolean>(enabled, defaultEnabled, onEnabledChange);
  const [open, setOpen] = React.useState<number | null>(null);
  const tagRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const returning = React.useRef(false);

  const matches = React.useMemo(
    () => (on ? findTemplateTriggerPhrases(text, triggers.map((t) => ({ id: t.id, phrases: t.phrases?.length ? t.phrases : [t.term] }))) : []),
    [on, text, triggers],
  );
  const byId = (tid: string) => triggers.find((t) => t.id === tid);

  const matchedKey = matches.map((m) => m.triggerId).join('|');
  const reported = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!onMatchedTriggersChange || reported.current === matchedKey) return;
    reported.current = matchedKey;
    const seen = new Set<string>();
    const list: TemplateTrigger[] = [];
    for (const m of matches) {
      const t = byId(m.triggerId);
      if (!t || seen.has(t.id)) continue;
      seen.add(t.id);
      list.push({ id: t.id, term: t.term, templates: t.templates, source: 'free text' });
    }
    onMatchedTriggersChange(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedKey]);

  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('.cui-template-tags__item') ?? []);
  const close = (refocus?: number) => {
    setOpen(null);
    if (refocus != null) {
      // Returning focus to the tag must not reopen its drop-down.
      returning.current = true;
      tagRefs.current[refocus]?.focus();
      returning.current = false;
    }
  };

  const parts: React.ReactNode[] = [];
  let pos = 0;
  matches.forEach((m, i) => {
    if (m.start > pos) parts.push(<React.Fragment key={`t${pos}`}>{text.slice(pos, m.start)}</React.Fragment>);
    const trig = byId(m.triggerId);
    const isOpen = open === i;
    const menuId = `${id}-menu-${i}`;
    parts.push(
      <span
        key={`m${m.start}`}
        className="cui-template-tags__wrap"
        onBlur={(e) => {
          if (isOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(null);
        }}
      >
        <button
          ref={(el) => (tagRefs.current[i] = el)}
          type="button"
          className={cx('cui-template-tags__tag', isOpen && 'cui-template-tags__tag--open')}
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={`${m.text}: ${trig?.templates.length ?? 0} suggested ${trig?.templates.length === 1 ? 'template' : 'templates'}`}
          onFocus={() => {
            if (!returning.current) setOpen(i);
          }}
          onClick={() => setOpen(isOpen ? null : i)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(i);
              setTimeout(() => items()[0]?.focus(), 0);
            } else if (e.key === 'Escape' && isOpen) {
              e.preventDefault();
              e.stopPropagation();
              setOpen(null);
            }
          }}
        >
          {m.text}
        </button>
        {isOpen && trig ? (
          <div
            ref={menuRef}
            id={menuId}
            role="group"
            aria-label={`Templates for ${trig.term}`}
            className="cui-template-tags__menu"
            onKeyDown={(e) => {
              const list = items();
              const k = list.indexOf(document.activeElement as HTMLButtonElement);
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const to = e.key === 'ArrowDown' ? Math.min(list.length - 1, k + 1) : k - 1;
                if (to < 0) {
                  returning.current = true;
                  tagRefs.current[i]?.focus();
                  returning.current = false;
                }
                else list[to]?.focus();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                close(i);
              }
            }}
          >
            <p className="cui-template-tags__optional">Optional templates for {trig.term}</p>
            {trig.templates.length ? (
              <ul className="cui-template-tags__list">
                {trig.templates.map((tpl) => (
                  <li key={tpl.id}>
                    <button
                      type="button"
                      className="cui-template-tags__item"
                      onClick={() => {
                        onOpenTemplate(tpl, { id: trig.id, term: trig.term, templates: trig.templates, source: 'free text' }, m);
                        close(i);
                      }}
                    >
                      <span>{tpl.title}</span>
                      {tpl.additional ? (
                        <span className="cui-template-tags__additional" title="Opens separately">
                          <Icon name="link" size={16} />
                          <span className="cui-visually-hidden">, opens separately</span>
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cui-template-tags__none">No templates found.</p>
            )}
          </div>
        ) : null}
      </span>,
    );
    pos = m.end;
  });
  if (pos < text.length) parts.push(<React.Fragment key={`t${pos}`}>{text.slice(pos)}</React.Fragment>);

  return (
    <div className={cx('cui-template-tags', className)}>
      <div className="cui-template-tags__text" role="group" aria-label={label} aria-describedby={`${id}-hint`}>
        {parts}
      </div>
      <p id={`${id}-hint`} className="cui-visually-hidden">
        {on ? `${matches.length} ${matches.length === 1 ? 'phrase has' : 'phrases have'} suggested templates. Focus a tagged phrase to see them; Down arrow moves into the list, Escape closes it.` : 'Template suggestions from free text are off.'}
      </p>
      {showToggle ? (
        <label className="cui-template-tags__toggle">
          <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
          Suggest templates from words in the text
        </label>
      ) : null}
    </div>
  );
}
