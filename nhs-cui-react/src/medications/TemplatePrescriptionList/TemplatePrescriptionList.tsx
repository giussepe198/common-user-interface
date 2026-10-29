import React from 'react';
import { cx, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatQuantity } from '../utils/numbers';
import type { TemplatePrescription } from '../utils/prescription';
import { formatBrandNameForRegion } from '../utils/regionalText';
import { applyTallManLettering, tallManDefaultFor } from '../utils/tallMan';

export interface TemplatePrescriptionListProps {
  /** Templates relevant to the drug and cascade selections (MSP-1160), as few as practical (MSP-1050). */
  templates: TemplatePrescription[];
  /** Selected template id (highlighted). */
  value?: string | null;
  /** A template was chosen: pre-fill its fields as editable controls (MSP-1250). */
  onSelect: (template: TemplatePrescription) => void;
  /** "other...": go to the prescription form without a template (MSP-1230). */
  onSkipToForm?: () => void;
  /** list (default): "DOSE 250 mg twice a day". medicationLine where space is limited: "DOSE 2.5 mg – tablet – once only" (MSP-1140). */
  layout?: 'list' | 'medicationLine';
  /** right of the cascading lists, or below on a new line when text might wrap (MSP-0880, MSP-1070). Default "below". */
  placement?: 'right' | 'below';
  /** Last item, below a line (MSP-1240). Default "other...". */
  otherLabel?: string;
  /** Small caption above the list [suggested]; there are no column headings (MSP-1110). Default "Template prescriptions". */
  caption?: string;
  /** Jurisdiction for dose and brand formatting; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** Move focus to the first template when shown. Default false. */
  autoFocus?: boolean;
  className?: string;
}

/**
 * Template prescriptions shown once every cascading list has a selection (MSP-1030/1040): one row per
 * template, no column headings, each starting with "DOSE" and the dose (MSP-1110 to MSP-1140), wrapping
 * rather than scrolling sideways (MSP-1150), supplementary text in grey italics (MSP-1210), and "other..."
 * last below a line to go straight to the form (MSP-1230/1240).
 */
export function TemplatePrescriptionList({
  templates, value, onSelect, onSkipToForm, layout = 'list', placement = 'below', otherLabel = 'other...', caption = 'Template prescriptions',
  region: regionProp, autoFocus = false, className,
}: TemplatePrescriptionListProps) {
  const uid = useId('cui-templates');
  const { region } = useClinicalLocale(regionProp);
  const listRef = React.useRef<HTMLUListElement>(null);
  React.useEffect(() => {
    if (autoFocus) listRef.current?.querySelector<HTMLElement>('[role="option"]')?.focus();
  }, [autoFocus]);

  const onKey = (e: React.KeyboardEvent) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, i - 1)]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
  };

  const tallMan = tallManDefaultFor(region);
  const brandText = (b: string) => {
    const t = formatBrandNameForRegion(b, region);
    return tallMan ? applyTallManLettering(t, region) : t;
  };
  const sep = layout === 'medicationLine' ? ' – ' : ' ';
  const activeIndex = Math.max(0, templates.findIndex(t => t.id === value));

  return (
    <div className={cx('cui-templates', `cui-templates--${placement}`, `cui-templates--${region.toLowerCase()}`, className)}>
      <span className="cui-templates__caption" id={`${uid}-caption`}>{caption}</span>
      <ul ref={listRef} role="listbox" aria-labelledby={`${uid}-caption`} className="cui-templates__list" onKeyDown={onKey}>
        {templates.map((t, i) => {
          const isSel = t.id === value;
          const pick = () => onSelect(t);
          return (
            <li
              key={t.id}
              role="option"
              aria-selected={isSel}
              tabIndex={i === activeIndex ? 0 : -1}
              className={cx('cui-templates__option', isSel && 'is-selected', i % 2 === 1 && 'is-shaded')}
              onClick={pick}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }}
            >
              <span className="cui-templates__text">
                {t.brandName ? <span className="cui-templates__brand">{brandText(t.brandName)}</span> : null}
                {t.brandName ? (layout === 'medicationLine' ? ' – ' : '  ') : null}
                {t.dose != null ? (
                  <span className="cui-templates__dose">
                    <span className="cui-templates__label">{t.doseLabel ?? 'DOSE'}</span>{' '}
                    <strong>{formatQuantity(t.dose, region)}</strong>
                  </span>
                ) : null}
                {t.attributes.map((a, ai) => (
                  <React.Fragment key={ai}>
                    {t.dose != null || ai > 0 ? sep : null}
                    <span className="cui-templates__attr">{a}</span>
                  </React.Fragment>
                ))}
              </span>
              {t.supplementary ? <span className="cui-templates__supp">{t.supplementary}</span> : null}
            </li>
          );
        })}
        {onSkipToForm ? (
          <li
            role="option"
            aria-selected={false}
            tabIndex={templates.length ? -1 : 0}
            className="cui-templates__option cui-templates__option--other"
            onClick={onSkipToForm}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSkipToForm(); } }}
          >
            {otherLabel}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
