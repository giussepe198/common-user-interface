import React from 'react';
import { cx, useClinicalLocale } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatTelephoneNumber, PATIENT_UNKNOWN_TEXT, telephoneHref } from '../utils/patient';
import { LabelledValue } from '../LabelledValue/LabelledValue';

export interface TelephoneNumberDisplayProps {
  /**
   * The number as stored, in any format (for example E.164 "+61491570159"). GB: formatted per Appendix A. AU: Style Manual
   * groupings, "02 5550 4321", "0491 570 159", "1300 975 707". NZ: "03 312 3456", "021 123 4567". Numbers from other
   * countries keep "+CC". Shown as received if not identifiable (TID-0015).
   */
  value: string | null | undefined;
  /** Region. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Extension held separately; shown as " x1234" (TID-0007, TID-0008). */
  extension?: string | null;
  /** Optional label such as "Home", "Work" or "Mobile" (PAB-0030). The control has no label of its own. */
  label?: string;
  /** Text when no number is held (PAB-0019). Default "Not Known". */
  unknownText?: string;
  /** Render the number as a "tel:" link [suggested]. AU and NZ links use the international form without spaces (Style Manual). Default false. */
  asLink?: boolean;
  className?: string;
}

/** Telephone number display: "0118 496 0123", "020 7946 0472 x1234", "+1 212 555 2368" (TID-0001..0010). */
export function TelephoneNumberDisplay({
  value,
  region: regionProp,
  extension,
  label,
  unknownText = PATIENT_UNKNOWN_TEXT,
  asLink = false,
  className,
}: TelephoneNumberDisplayProps) {
  const { region } = useClinicalLocale(regionProp);
  const raw = (value ?? '').trim();
  const ext = (extension ?? '').replace(/\D/g, '');
  const source = ext && !/x\s*\d+\s*$/i.test(raw) ? `${raw} x${ext}` : raw;
  const f = formatTelephoneNumber(source, region);
  const text = f.display;
  const content = text ? (
    asLink ? (
      <a
        className="cui-telephone__link"
        href={
          region === 'GB'
            ? `tel:${text.replace(/\s+x(\d+)$/, ',$1').replace(/[^\d+,]/g, '')}`
            : telephoneHref(source, region) ?? `tel:${text.replace(/[^\d+]/g, '')}`
        }
      >
        {text}
      </a>
    ) : (
      text
    )
  ) : null;
  if (label) {
    return (
      <LabelledValue className={cx('cui-telephone', className)} label={label} value={content} unknownText={unknownText} />
    );
  }
  return (
    <span className={cx('cui-telephone', !text && 'cui-telephone--unknown', className)}>{content ?? unknownText}</span>
  );
}
