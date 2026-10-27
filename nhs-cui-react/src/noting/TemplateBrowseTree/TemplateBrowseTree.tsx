import React from 'react';
import { Button, Icon, cx, useControllableState, useId } from '../../core';
import type { TemplateSectionDef } from '../utils/templates';

export interface TemplateBrowseTreeProps {
  /** The form's section structure. */
  sections: TemplateSectionDef[];
  /** Open a section in the note. `path` holds the headings above it. */
  onOpenSection: (section: TemplateSectionDef, path: string[]) => void;
  /** Open the whole form in one action (Theme 7). */
  onOpenFullForm?: () => void;
  /** Sections already addressed in the note, marked with a tick [suggested: future work in Theme 7]. */
  addressedIds?: string[];
  /** Panel shown (controlled). Default open (Theme 7). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Heading. Default "Form structure". */
  title?: string;
  className?: string;
}

/**
 * Browse tree of a form's structure in a right-hand panel (Noting Using Templates, Theme 7;
 * experimental): open by default, top-level sections only until expanded, can be hidden and shown
 * again, sections open by clicking, and the full form can be opened in one action.
 */
export function TemplateBrowseTree({ sections, onOpenSection, onOpenFullForm, addressedIds = [], open, defaultOpen = true, onOpenChange, title = 'Form structure', className }: TemplateBrowseTreeProps) {
  const id = useId('cui-tbrowse');
  const [isOpen, setOpen] = useControllableState<boolean>(open, defaultOpen, onOpenChange);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggle = (sid: string) =>
    setExpanded((x) => {
      const n = new Set(x);
      if (n.has(sid)) n.delete(sid);
      else n.add(sid);
      return n;
    });

  const renderList = (items: TemplateSectionDef[], path: string[], level: number): React.ReactNode => (
    <ul className="cui-template-tree__list" role={level === 0 ? undefined : 'group'}>
      {items.map((s) => {
        const hasKids = !!s.children?.length;
        const ex = expanded.has(s.id);
        const done = addressedIds.includes(s.id);
        return (
          <li key={s.id} className="cui-template-tree__item">
            <div className="cui-template-tree__row" style={{ paddingLeft: `calc(${level} * var(--space-4))` }}>
              {hasKids ? (
                <button type="button" className="cui-template-tree__expand" aria-expanded={ex} aria-label={`${ex ? 'Collapse' : 'Expand'} ${s.title}`} onClick={() => toggle(s.id)}>
                  <Icon name={ex ? 'chevron-down' : 'chevron-right'} size={16} />
                </button>
              ) : (
                <span className="cui-template-tree__expand-space" />
              )}
              <button type="button" className="cui-template-tree__open" onClick={() => onOpenSection(s, path)}>
                {s.title}
              </button>
              {done ? (
                <span className="cui-template-tree__done" title="Addressed in the note">
                  <Icon name="check" size={16} />
                  <span className="cui-visually-hidden">, addressed</span>
                </span>
              ) : null}
            </div>
            {hasKids && ex ? renderList(s.children!, [...path, s.title], level + 1) : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className={cx('cui-template-tree', !isOpen && 'cui-template-tree--hidden', className)} aria-labelledby={`${id}-title`}>
      <div className="cui-template-tree__head">
        <h3 id={`${id}-title`} className="cui-template-tree__title">{title}</h3>
        <Button size="sm" variant="quiet" aria-expanded={isOpen} aria-controls={`${id}-body`} onClick={() => setOpen(!isOpen)}>
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </div>
      <div id={`${id}-body`} hidden={!isOpen} className="cui-template-tree__body">
        {onOpenFullForm ? (
          <Button size="sm" icon="plus" onClick={onOpenFullForm}>Open full form</Button>
        ) : null}
        {renderList(sections, [], 0)}
      </div>
    </aside>
  );
}
