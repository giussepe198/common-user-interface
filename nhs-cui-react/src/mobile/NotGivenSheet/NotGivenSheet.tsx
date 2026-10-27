import React from 'react';
import { cx, useClinicalLocale, useControllableState } from '../../core';
import type { ClinicalRegion } from '../../core';
import { adminReasonCodes, type AdminReasonCode } from '../../administration';
import {
  ActionBar,
  BottomSheet,
  EMPTY_REASON_CODE_VALUE,
  ReasonCodePicker,
  reasonCodeCommitLabel,
  reasonCodeProblems,
  type ReasonCodeValue,
} from '../../touch';
import { MOBILE_NOT_GIVEN_LEGEND } from '../utils/regions/mobileWording';

export interface NotGivenSheetProps {
  /** Shown when true. */
  open: boolean;
  /** Cancel, Esc, back or a deliberate swipe (refused while a code or reason is entered). */
  onClose: () => void;
  /** Record the choice. Called only when nothing blocks: a code is chosen and any required reason or prompt is complete. */
  onRecord: (value: ReasonCodeValue, code: AdminReasonCode) => void;
  /** Context line under the title, e.g. "CHEN, Wei · paracetamol 1 g, due 13:00" (concept B3). */
  description?: React.ReactNode;
  /** Title. Default "Why was it not given?". */
  title?: string;
  /** Region; otherwise read from ClinicalLocaleProvider. Picks the codes: AU NIMC, NZ NMC, GB statuses without codes (G10 9.6, G11 8.2, MEDa-0119). */
  region?: ClinicalRegion;
  /** AU paediatric chart: adds the parent or carer code (circled P). */
  paediatric?: boolean;
  /** Codes to offer instead of `adminReasonCodes(region)`. */
  codes?: ReadonlyArray<AdminReasonCode>;
  /** Codes to leave out, e.g. ['S'] where self-administration is recorded elsewhere. */
  excludeCodes?: ReadonlyArray<string>;
  /** Legend above the codes. Default per region: "NIMC code", "NMC code", "Reason". */
  legend?: string;
  /** Hint under the reason field, e.g. "Tap the field and speak, or type" when dictation is available (B3). */
  reasonHint?: React.ReactNode;
  /** The "Prescriber notified" prompt must be ticked before recording. Default false [suggested]; set it where local policy requires. */
  requirePrescriberPrompt?: boolean;
  /** The choice (controlled). */
  value?: ReasonCodeValue;
  defaultValue?: ReasonCodeValue;
  onChange?: (value: ReasonCodeValue) => void;
  /** Render in place (false) or in a portal (default). */
  portal?: boolean;
  container?: HTMLElement | null;
  /** Push a history entry so the back button closes the sheet. Default true. */
  closeOnBrowserBack?: boolean;
  /** Element to focus on open. Default: the first focusable element in the sheet. See BottomSheet. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /**
   * Move focus in when the sheet is already open on first render. Default true (or the SheetContainerProvider
   * setting); later opens always move focus. Set false on documentation pages [suggested].
   */
  autoFocus?: boolean;
  className?: string;
}

/**
 * "Not given" sheet (concept B3): the region's codes as large radio rows, a written reason where the code needs one,
 * a "Prescriber notified" prompt where the code asks for it, and a commit button that names the code ("Record W: Withheld").
 */
export function NotGivenSheet(props: NotGivenSheetProps) {
  const {
    open,
    onClose,
    onRecord,
    description,
    title = 'Why was it not given?',
    paediatric,
    excludeCodes = [],
    reasonHint,
    requirePrescriberPrompt = false,
    portal,
    container,
    closeOnBrowserBack,
    initialFocusRef,
    autoFocus,
    className,
  } = props;
  const { region } = useClinicalLocale(props.region);
  const [value, setValue] = useControllableState<ReasonCodeValue>(props.value, props.defaultValue ?? EMPTY_REASON_CODE_VALUE, props.onChange);
  const [tried, setTried] = React.useState(false);
  const options = (props.codes ?? adminReasonCodes(region, { paediatric })).filter(c => !excludeCodes.includes(c.code));
  const legend = props.legend ?? MOBILE_NOT_GIVEN_LEGEND[region];
  const chosen = options.find(o => o.code === value.code);

  React.useEffect(() => {
    if (!open) setTried(false);
  }, [open]);

  const record = () => {
    const problems = reasonCodeProblems(options, value, { requirePrescriberPrompt, codeName: legend.toLowerCase() });
    if (problems.length || !chosen) {
      setTried(true);
      return;
    }
    onRecord(value, chosen);
  };

  return (
    <BottomSheet
      open={open}
      onClose={() => onClose()}
      title={title}
      description={description}
      hasUnsavedData={!!value.code || !!value.reason.trim()}
      showCloseButton={false}
      portal={portal}
      container={container}
      closeOnBrowserBack={closeOnBrowserBack}
      initialFocusRef={initialFocusRef}
      autoFocus={autoFocus}
      className={cx('cui-not-given', className)}
      footer={
        <ActionBar
          sticky={false}
          actions={[
            { label: 'Cancel', onClick: () => onClose() },
            { label: reasonCodeCommitLabel(chosen), variant: 'primary', onClick: record, grow: 1.6 },
          ]}
        />
      }
    >
      <ReasonCodePicker
        options={options}
        value={value}
        onChange={setValue}
        legend={legend}
        reasonHint={reasonHint}
        requirePrescriberPrompt={requirePrescriberPrompt}
        showValidation={tried}
      />
    </BottomSheet>
  );
}
