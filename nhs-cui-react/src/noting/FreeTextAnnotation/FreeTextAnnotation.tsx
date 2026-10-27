import React from 'react';
import { Button, cx, useControllableState, useId } from '../../core';

export interface FreeTextAnnotationProps {
  /** The fixed-choice control (radio group, check box, list box) the text belongs to (CNA-1680). */
  children: React.ReactNode;
  /** Free text (controlled). */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  onChange?: (text: string) => void;
  /**
   * Whether the fixed-choice control has a selection. The text field is offered only after a
   * selection (CNA-1720). When it changes from true to false and text exists, the user is asked
   * whether to delete the text too (requirements: delete with the data item, warn first). Default true.
   */
  hasSelection?: boolean;
  /** 'popup': a small dialog with one text field (CNA-1690, default). 'inline': a field beside the control that becomes read-only text when focus leaves. */
  mode?: 'popup' | 'inline';
  /** Where the text is shown: 'right' of the control (CNA-1790, default) or 'below' (CNA-1800). */
  placement?: 'right' | 'below';
  /** Label of the add control. Default "Add text" [suggested]. */
  addLabel?: string;
  /** Accessible name of the text field, e.g. "Additional text for smoking status". Default "Additional text". */
  label?: string;
  /**
   * Text is required or recommended for this item: the field is always shown, never behind the
   * add control (CNA-1860).
   */
  required?: boolean | 'recommended';
  /** Contingent free text ('Other, please specify'): the field is shown when true (CNA-1870). */
  revealWhen?: boolean;
  /** Text has been submitted to the record: shown read-only (editing is allowed only before, CNA-1830). */
  readOnly?: boolean;
  /** Move focus to the add control right after a selection is made in a list box (CNA-1740). Default true. */
  focusAfterSelect?: boolean;
  id?: string;
  className?: string;
}

/**
 * Free text attached to a fixed-choice selection (CNA-1680..1870): an "Add text" control appears on
 * focus, selection or hover; the text is shown beside the control inside a faint marquee and can be
 * clicked to edit; it is never hidden while the control is in view.
 */
export function FreeTextAnnotation({
  children,
  value,
  defaultValue = '',
  onChange,
  hasSelection = true,
  mode = 'popup',
  placement = 'right',
  addLabel = 'Add text',
  label = 'Additional text',
  required = false,
  revealWhen,
  readOnly = false,
  focusAfterSelect = true,
  id,
  className,
}: FreeTextAnnotationProps) {
  const baseId = useId('cui-freetext', id);
  const [text, setText] = useControllableState<string>(value, defaultValue, onChange);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(text);
  const [active, setActive] = React.useState(false);
  const [confirm, setConfirm] = React.useState<null | 'clear' | 'deselected'>(null);
  const [announcement, setAnnouncement] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const fieldRef = React.useRef<HTMLTextAreaElement>(null);
  const textButtonRef = React.useRef<HTMLButtonElement>(null);
  const alwaysField = !!required || !!revealWhen;
  const hasText = text.trim().length > 0;

  const prevSelection = React.useRef(hasSelection);
  React.useEffect(() => {
    const was = prevSelection.current;
    prevSelection.current = hasSelection;
    if (was && !hasSelection && hasText && !readOnly) setConfirm('deselected');
    if (!was && hasSelection && focusAfterSelect && !hasText && !alwaysField) {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'SELECT' && rootRef.current?.contains(activeEl)) {
        setActive(true);
        setTimeout(() => addRef.current?.focus(), 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSelection]);

  React.useEffect(() => {
    if (editing) fieldRef.current?.focus();
  }, [editing]);

  const open = () => {
    setDraft(text);
    setEditing(true);
  };
  const commit = (next: string) => {
    if (hasText && !next.trim()) {
      setConfirm('clear');
      return;
    }
    setText(next);
    setEditing(false);
    setAnnouncement(next.trim() ? 'Text added.' : '');
    setTimeout(() => (next.trim() ? textButtonRef.current : addRef.current)?.focus(), 0);
  };
  const remove = () => {
    setText('');
    setDraft('');
    setEditing(false);
    setConfirm(null);
    setAnnouncement('Text deleted.');
  };

  const showAdd = !readOnly && !alwaysField && !hasText && !editing && hasSelection && active;
  const fieldShown = !readOnly && (editing || (alwaysField && !hasText) || (mode === 'inline' && editing));
  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  };

  const editor = (
    <div
      className={cx('cui-free-text__editor', mode === 'popup' && !alwaysField && 'cui-free-text__editor--popup')}
      role={mode === 'popup' && !alwaysField ? 'dialog' : undefined}
      aria-label={mode === 'popup' && !alwaysField ? label : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && editing) {
          e.stopPropagation();
          setEditing(false);
          setTimeout(() => (hasText ? textButtonRef.current : addRef.current)?.focus(), 0);
        }
      }}
    >
      <textarea
        ref={fieldRef}
        id={`${baseId}-field`}
        className="cui-noting-input cui-free-text__field"
        aria-label={label}
        placeholder={required === 'recommended' ? `${label} (recommended)` : label}
        aria-required={required === true ? true : undefined}
        rows={2}
        wrap="soft"
        value={editing ? draft : text}
        onChange={(e) => {
          autoGrow(e.target);
          if (editing) setDraft(e.target.value);
          else {
            setEditing(true);
            setDraft(e.target.value);
          }
        }}
        onBlur={(e) => {
          if (mode === 'inline' && editing && !e.currentTarget.parentElement?.contains(e.relatedTarget as Node | null)) commit(draft);
        }}
      />
      <div className="cui-free-text__actions">
        <Button size="sm" variant="quiet" onMouseDown={(e) => e.preventDefault()} onClick={() => { setDraft(''); fieldRef.current?.focus(); }}>
          Clear text
        </Button>
        {editing ? <Button size="sm" onClick={() => commit(draft)}>Done</Button> : null}
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      id={baseId}
      className={cx('cui-free-text', `cui-free-text--${placement}`, (hasText || editing) && 'cui-free-text--marquee', className)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setActive(false);
          if (editing && mode === 'popup') commit(draft);
        }
      }}
    >
      <div className="cui-free-text__control">{children}</div>
      <div className="cui-free-text__side">
        {showAdd ? (
          <Button ref={addRef} size="sm" variant="secondary" icon="plus" className="cui-free-text__add" onClick={open} aria-controls={`${baseId}-field`}>
            {addLabel}
          </Button>
        ) : null}
        {fieldShown ? editor : null}
        {hasText && !editing ? (
          readOnly ? (
            <p className="cui-free-text__text cui-free-text__text--static">{text}</p>
          ) : (
            <button ref={textButtonRef} type="button" className="cui-free-text__text" aria-label={`${label}: ${text}. Edit text`} onClick={open}>
              {text}
            </button>
          )
        ) : null}
        {confirm ? (
          <div className="cui-free-text__confirm" role="alertdialog" aria-labelledby={`${baseId}-confirm`}>
            <span id={`${baseId}-confirm`}>
              {confirm === 'deselected' ? 'The selection was cleared. Delete the added text too?' : 'Delete the added text?'}
            </span>
            <Button size="sm" variant="danger" onClick={remove}>Delete text</Button>
            <Button size="sm" autoFocus onClick={() => { setConfirm(null); if (confirm === 'clear') setDraft(text); }}>
              Keep text
            </Button>
          </div>
        ) : null}
      </div>
      <span className="cui-visually-hidden" aria-live="polite">{announcement}</span>
    </div>
  );
}
