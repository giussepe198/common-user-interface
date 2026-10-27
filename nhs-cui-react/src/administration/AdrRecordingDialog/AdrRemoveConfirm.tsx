import React from 'react';
import { Button, cx, useId } from '../../core';

export interface AdrRemoveConfirmProps {
  /** Agent name as displayed, e.g. "Penicillin (class)". */
  agentName: string;
  /** The list named in running text, e.g. "adverse drug reaction summary". */
  listName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * Removal confirmation (RAD-0750): names the drug and the list, explains that notes remain and
 * warnings stop, encourages a reason (RAD-0720), two buttons worded to match the question.
 * Shared by AdrRecordingDialog and AdrDetailsView.
 */
export function AdrRemoveConfirm({ agentName, listName, onConfirm, onCancel, className }: AdrRemoveConfirmProps) {
  const id = useId('cui-adr-rm');
  const [reason, setReason] = React.useState('');
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <section
      className={cx('cui-adr', className)}
      role="dialog"
      aria-labelledby={`${id}-h`}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <div className="cui-adr__head">
        <h2 className="cui-adr__title" id={`${id}-h`} tabIndex={-1} ref={headingRef}>
          Remove {agentName} from the {listName}?
        </h2>
        <div className="cui-adr__buttons">
          <Button variant="danger" onClick={() => onConfirm(reason.trim())}>
            Remove from list
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </div>
      <div className="cui-adr__confirm">
        <ul>
          <li>
            <strong>{agentName}</strong> will be removed from the {listName}.
          </li>
          <li>The related clinical notes remain on the patient's record.</li>
          <li>Clinicians will no longer be warned by the system not to administer {agentName}.</li>
        </ul>
        <div className="cui-adr__field">
          <label className="cui-adr__label" htmlFor={`${id}-reason`}>
            Reason for removal
          </label>
          <textarea
            id={`${id}-reason`}
            className="cui-adr__control"
            rows={3}
            value={reason}
            placeholder="Enter why this entry is being removed"
            onChange={e => setReason(e.target.value)}
          />
        </div>
        <p className="cui-adr__hint">Removed entries can still be viewed by displaying deactivated summaries.</p>
      </div>
    </section>
  );
}
