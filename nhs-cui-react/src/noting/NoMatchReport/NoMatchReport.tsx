import React from 'react';
import { Button, cx, useId } from '../../core';

/** What the report sends. */
export interface NoMatchReportData {
  /** The text that found no match, as edited by the user. */
  text: string;
  /** What the user was trying to record. */
  comment: string;
  /** Context such as the note heading or subset in use. */
  context?: string;
}

export interface NoMatchReportProps {
  /** Text that found no match (G8 7: 'No match found' button). */
  text: string;
  /** Context recorded with the report, e.g. "Past medical history; filter: none". */
  context?: string;
  /** Send the report. The process after this is local policy (undefined in the guidance). */
  onSubmit: (report: NoMatchReportData) => void;
  onCancel: () => void;
  /** Heading. Default "Report a missing term". */
  title?: string;
  className?: string;
}

/**
 * Two-step form for reporting text the terminology could not match (G8 7 and 13; process
 * undefined in the guidance, so every step here is [suggested]): describe, then check and send.
 */
export function NoMatchReport({ text, context, onSubmit, onCancel, title = 'Report a missing term', className }: NoMatchReportProps) {
  const id = useId('cui-nomatch');
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [term, setTerm] = React.useState(text);
  const [comment, setComment] = React.useState('');
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    if (step > 1) headingRef.current?.focus();
  }, [step]);
  const stepText = step === 1 ? 'Step 1 of 2: describe the term' : step === 2 ? 'Step 2 of 2: check and send' : 'Sent';
  return (
    <section className={cx('cui-no-match-report', className)} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} ref={headingRef} tabIndex={-1} className="cui-no-match-report__title">{title}</h3>
      <p className="cui-no-match-report__step">{stepText}</p>
      {step === 1 ? (
        <>
          <label className="cui-no-match-report__field">
            <span>Text that found no match</span>
            <input className="cui-noting-input" type="text" value={term} onChange={(e) => setTerm(e.target.value)} />
          </label>
          <label className="cui-no-match-report__field">
            <span>What were you trying to record?</span>
            <textarea className="cui-noting-input" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          </label>
          <div className="cui-no-match-report__actions">
            <Button onClick={onCancel}>Cancel</Button>
            <Button variant="primary" disabled={!term.trim()} onClick={() => setStep(2)}>Next</Button>
          </div>
        </>
      ) : step === 2 ? (
        <>
          <dl className="cui-no-match-report__summary">
            <dt>Text</dt>
            <dd>{term.trim()}</dd>
            <dt>Trying to record</dt>
            <dd>{comment.trim() || 'Not given'}</dd>
            {context ? (
              <>
                <dt>Context</dt>
                <dd>{context}</dd>
              </>
            ) : null}
          </dl>
          <p className="cui-prompt">The report goes to the terminology team. Your note keeps the text as typed.</p>
          <div className="cui-no-match-report__actions">
            <Button onClick={() => setStep(1)} icon="chevron-left">Back</Button>
            <Button
              variant="primary"
              onClick={() => {
                onSubmit({ text: term.trim(), comment: comment.trim(), context });
                setStep(3);
              }}
            >
              Send report
            </Button>
          </div>
        </>
      ) : (
        <p role="status" className="cui-no-match-report__done">Report sent. Thank you.</p>
      )}
    </section>
  );
}
