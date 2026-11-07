import React from 'react';
import { Button, cx, Icon, useId } from '../../core';
import { Checkbox, RadioGroup, TextArea } from '../../forms';
import { FormField } from '../../noting';
import { Dialog, Message } from '../../shell';
import { MhGlyph } from '../internal/MhGlyph';

/** What the user chose when opening a record in an emergency. */
export interface BreakGlassRequest {
  /** The chosen reason's value (host value set). */
  reason: string;
  /** The written justification, trimmed, at least `minimumLength` characters. */
  explanation: string;
  /** Minutes of access; 0 means until the end of the shift. */
  minutes: number;
  /** Always true: the confirm button is disabled until the declaration is ticked. */
  declared: true;
}

export interface BreakGlassDialogProps {
  /** Shows the dialog. Every opening starts afresh: a reason is never carried over. */
  open: boolean;
  /** Cancel, Esc. */
  onClose: () => void;
  /** Called with the request once the reason, explanation, duration and declaration are complete. The host records it, asks for step-up and opens the record. */
  onConfirm: (request: BreakGlassRequest) => void;
  /** Reasons for emergency access from the host (value set break-glass-reason). */
  reasons: ReadonlyArray<{ value: string; label: string }>;
  /** Durations from the service, in minutes; 0 means until the end of the shift. Never beyond the service maximum. */
  durations?: ReadonlyArray<{ minutes: number; label: string }>;
  /** Preselected duration. Default 60 when offered, else the first. */
  defaultMinutes?: number;
  /** The service maximum in words ("12 hours"), shown with the durations. */
  maximum?: string;
  /** The shortest justification accepted. Default 20. */
  minimumLength?: number;
  /** The declaration the user ticks. Default [suggested] wording below. */
  declaration?: string;
  /** The person, when known: name for the title and the identifiers line, in the banner's words and order. */
  person?: { name: string; identifiers: string };
  /** Restricted information is opened under the grant (sealed never is; outside the named roles). */
  includesRestricted?: boolean;
  /** "You will confirm it is you with your passkey." when step-up follows. */
  stepUpNote?: string;
  /** A refusal from the host, in words. */
  error?: string | null;
  /** The request is on its way: actions wait. */
  busy?: boolean;
  className?: string;
}

const DEFAULT_DURATIONS = [
  { minutes: 30, label: '30 minutes' },
  { minutes: 60, label: '60 minutes' },
  { minutes: 0, label: 'Until the end of my shift' },
];

const DEFAULT_DECLARATION =
  'I need this record now to provide care in an emergency. I understand that this access is recorded, reviewed and reported to the privacy officer.';

function BreakGlassForm({
  onClose,
  onConfirm,
  reasons,
  durations = DEFAULT_DURATIONS,
  defaultMinutes,
  maximum,
  minimumLength = 20,
  declaration = DEFAULT_DECLARATION,
  person,
  includesRestricted = false,
  stepUpNote,
  error = null,
  busy = false,
  className,
}: Omit<BreakGlassDialogProps, 'open'>) {
  const id = useId('cui-break-glass');
  const initialMinutes = defaultMinutes ?? (durations.some((d) => d.minutes === 60) ? 60 : durations[0]?.minutes ?? 0);
  const [reason, setReason] = React.useState('');
  const [explanation, setExplanation] = React.useState('');
  const [minutes, setMinutes] = React.useState(initialMinutes);
  const [declared, setDeclared] = React.useState(false);
  const length = explanation.trim().length;
  const short = length < minimumLength;
  const counter = short
    ? `${minimumLength - length} more ${minimumLength - length === 1 ? 'character' : 'characters'} needed.`
    : `${length} characters entered.`;
  const chosen = durations.find((d) => d.minutes === minutes) ?? durations[0];
  const action = !chosen ? 'Open record' : chosen.minutes ? `Open record for ${chosen.label}` : 'Open record until the end of my shift';
  const complete = !!reason && !short && declared && !!chosen;

  return (
    <Dialog
      open
      onClose={() => onClose()}
      closeLabel="Close emergency access"
      className={cx('cui-break-glass', className)}
      title={
        <span className="cui-break-glass__title">
          <MhGlyph name="key" size={20} />
          {person ? `Emergency access to ${person.name}` : 'Emergency access'}
        </span>
      }
      description={<span className="cui-break-glass__lead">You are not in this person's care team. Emergency access is recorded, and the privacy officer is told.</span>}
      footer={
        <>
          <Button size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={!complete || busy}
            aria-busy={busy || undefined}
            aria-describedby={complete ? undefined : `${id}-needs`}
            onClick={() => chosen && onConfirm({ reason, explanation: explanation.trim(), minutes: chosen.minutes, declared: true })}
          >
            {action}
          </Button>
        </>
      }
    >
      <div className="cui-break-glass__body">
        {person ? <p className="cui-break-glass__person">{person.identifiers}</p> : null}
        {error ? (
          <Message tone="error" layout="inline" title="Emergency access was not opened.">
            {error}
          </Message>
        ) : null}
        <RadioGroup
          label="Reason for emergency access"
          required
          name={`${id}-reason`}
          options={reasons.map((r) => ({ value: r.value, label: r.label }))}
          value={reason || null}
          onChange={setReason}
        />
        <FormField label="Why you need the record now, in your own words" required prompt={`At least ${minimumLength} characters.`}>
          <TextArea rows={3} maxLength={1000} showCount={false} value={explanation} aria-describedby={`${id}-count`} onChange={(v) => setExplanation(v)} />
        </FormField>
        <p id={`${id}-count`} className="cui-break-glass__hint" aria-live="polite">
          {counter}
        </p>
        <RadioGroup
          label="How long you need access"
          name={`${id}-duration`}
          prompt={maximum ? `Your organisation allows up to ${maximum}.` : undefined}
          options={durations.map((d) => ({ value: String(d.minutes), label: d.label }))}
          value={String(minutes)}
          onChange={(v) => setMinutes(Number(v))}
        />
        {includesRestricted ? (
          <p className="cui-break-glass__restricted">
            <Icon name="lock" size={16} />
            <span>Includes restricted information. Sealed information is not included.</span>
          </p>
        ) : null}
        <Checkbox className="cui-break-glass__declare" label={declaration} checked={declared} onChange={(c) => setDeclared(c)} />
        {stepUpNote ? <p className="cui-break-glass__hint">{stepUpNote}</p> : null}
        {complete ? null : (
          <p id={`${id}-needs`} className="cui-break-glass__hint">
            Choose a reason, explain why you need the record now and tick the declaration to continue.
          </p>
        )}
      </div>
    </Dialog>
  );
}

/**
 * Opening a record without a legitimate relationship, in an emergency: a reason from the service's list, a written
 * justification of at least 20 characters, a time box and a declaration, then the host's step-up, in `shell/Dialog` with the forms controls. Follows the CUI My Health Record emergency access pattern (G12 2):
 * conditions shown, confirm disabled until complete, Esc cancels. Calm, neutral wording.
 */
export function BreakGlassDialog({ open, ...rest }: BreakGlassDialogProps) {
  // Mounting the form only while open means every opening starts with empty fields.
  return open ? <BreakGlassForm {...rest} /> : null;
}
