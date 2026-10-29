import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import { canHideSection } from '../utils/formState';
import { toSentenceCase } from '../utils/sentenceCase';

export interface RevealSectionProps {
  /**
   * Label of the reveal/hide control that summarises what the fields capture (CNA-0900, CNA-1010),
   * e.g. "Further details: CVS examination". Never just "Open".
   */
  label: string;
  /** Prompt next to the control saying what it does (CNA-0920). */
  prompt?: string;
  /** Whether the fields are shown (controlled). */
  open?: boolean;
  /** Initial state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Data-triggered reveal (CNA-0880): when this becomes true the section opens; when it becomes
   * false the section closes again only if it holds no data (CNA-0970).
   */
  trigger?: boolean;
  /** Whether any field in the section holds data: the hide control is then disabled (CNA-0960/0970). */
  hasData?: boolean;
  /** Alternative to `hasData`: current field values, checked with `canHideSection`. */
  values?: readonly unknown[] | Readonly<Record<string, unknown>>;
  /** Text shown when hiding is blocked. [suggested] */
  lockedText?: string;
  /** Nesting level, 0 for top level. Each level is indented (CNA-1050). */
  level?: number;
  /** Message announced when the fields appear (CNA-1920). */
  revealAnnouncement?: string;
  /** Apply sentence case to the label (CNA-2060). Default true. */
  sentenceCase?: boolean;
  /** The fields revealed by the control. */
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * Optional fields hidden until requested or triggered by data (CNA-0830..1050). One check box both
 * reveals and hides (CNA-0930); the control and the revealed fields share light shading (CNA-1030,
 * CNA-1040) that sets them apart from data entry controls (CNA-0860/0940).
 */
export function RevealSection({
  label,
  prompt,
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  hasData,
  values,
  lockedText = 'Contains entered data, so it cannot be hidden.',
  level = 0,
  revealAnnouncement,
  sentenceCase = true,
  children,
  id,
  className,
}: RevealSectionProps) {
  const baseId = useId('cui-reveal', id);
  const [isOpen, setOpen] = useControllableState<boolean>(open, defaultOpen || !!trigger, onOpenChange);
  const containsData = hasData ?? (values ? !canHideSection(values) : false);
  const locked = isOpen && containsData;
  const [announcement, setAnnouncement] = React.useState('');
  const text = sentenceCase ? toSentenceCase(label) : label;
  const announce = (on: boolean) => setAnnouncement(on ? revealAnnouncement ?? `${text}: further fields shown below.` : `${text}: fields hidden.`);

  const prevTrigger = React.useRef(trigger);
  React.useEffect(() => {
    if (trigger === prevTrigger.current) return;
    prevTrigger.current = trigger;
    if (trigger && !isOpen) {
      setOpen(true);
      announce(true);
    } else if (trigger === false && isOpen && !containsData) {
      setOpen(false);
      announce(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const contentId = `${baseId}-content`;
  return (
    <section
      id={baseId}
      className={cx('cui-reveal-section', isOpen && 'cui-reveal-section--open', className)}
      style={{ marginLeft: level ? `calc(${level} * var(--space-6))` : undefined }}
      aria-labelledby={`${baseId}-label`}
    >
      <div className="cui-reveal-section__control">
        <label className="cui-reveal-section__toggle" data-touch-target htmlFor={`${baseId}-toggle`}>
          <input
            id={`${baseId}-toggle`}
            type="checkbox"
            checked={isOpen}
            disabled={locked}
            aria-controls={contentId}
            aria-describedby={[prompt ? `${baseId}-prompt` : '', locked ? `${baseId}-locked` : ''].filter(Boolean).join(' ') || undefined}
            onChange={(e) => {
              if (locked) return;
              setOpen(e.target.checked);
              announce(e.target.checked);
            }}
          />
          <span id={`${baseId}-label`} className="cui-reveal-section__label">{text}</span>
        </label>
        {prompt ? <span id={`${baseId}-prompt`} className="cui-prompt cui-reveal-section__prompt">{prompt}</span> : null}
        {locked ? <span id={`${baseId}-locked`} className="cui-reveal-section__locked">{lockedText}</span> : null}
      </div>
      <div id={contentId} className="cui-reveal-section__content" hidden={!isOpen}>
        {children}
      </div>
      <span className="cui-visually-hidden" aria-live="polite">{announcement}</span>
    </section>
  );
}
