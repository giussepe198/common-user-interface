import React from 'react';
import { cx, Icon, useId } from '../../core';

export interface TemplateReopenControlProps {
  /** Field ids the applied template filled, e.g. ['dose', 'frequency', 'duration'] (MSP-1250). */
  definedFieldIds: string[];
  /** Names of those fields for the accessible description, e.g. { dose: 'Dose' }. Default: the ids. */
  fieldNames?: Record<string, string>;
  /** Reopen the template list to choose an alternative template (MSP-1260/1270). */
  onOpen: () => void;
  /**
   * Highlight these fields while the control has focus or the pointer (MSP-1280/1290); called with [] when it
   * loses them. The form draws the highlight.
   */
  onHighlightChange?: (fieldIds: string[]) => void;
  /** The template list is open. */
  expanded?: boolean;
  /** Button text. Default "Template Prescriptions" (MSP-1260 example). */
  label?: string;
  /** Name of the template applied, shown after the label [suggested]. */
  appliedTemplate?: string;
  className?: string;
}

/**
 * Control that reopens the template prescription list after a template has been applied (MSP-1260 to
 * MSP-1290). While it has focus or the pointer, the fields the template defines are highlighted, so it is
 * clear which values will change.
 */
export function TemplateReopenControl({
  definedFieldIds, fieldNames = {}, onOpen, onHighlightChange, expanded, label = 'Template Prescriptions', appliedTemplate, className,
}: TemplateReopenControlProps) {
  const uid = useId('cui-template-reopen');
  const [active, setActive] = React.useState({ focus: false, hover: false });
  const on = active.focus || active.hover;
  const last = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (last.current === on) return;
    last.current = on;
    onHighlightChange?.(on ? definedFieldIds : []);
  }, [on, definedFieldIds, onHighlightChange]);
  const names = definedFieldIds.map(f => fieldNames[f] ?? f).join(', ');
  return (
    <span className={cx('cui-template-reopen', on && 'is-active', className)}>
      <button
        type="button"
        className="cui-template-reopen__button"
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-describedby={`${uid}-desc`}
        onClick={onOpen}
        onFocus={() => setActive(a => ({ ...a, focus: true }))}
        onBlur={() => setActive(a => ({ ...a, focus: false }))}
        onMouseEnter={() => setActive(a => ({ ...a, hover: true }))}
        onMouseLeave={() => setActive(a => ({ ...a, hover: false }))}
      >
        <Icon name="history" size={16} />
        <span>{label}</span>
        {appliedTemplate ? <span className="cui-template-reopen__applied">{appliedTemplate}</span> : null}
        <Icon name="chevron-down" size={16} />
      </button>
      <span id={`${uid}-desc`} className="cui-visually-hidden">
        {names ? `The template filled: ${names}.` : 'No template applied.'}
      </span>
    </span>
  );
}
