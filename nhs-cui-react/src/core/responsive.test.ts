// The responsive contract (CONVENTIONS "Responsive") for the key desktop controls: each declares its size
// container and narrow rules in its stylesheet. jsdom has no layout, so the stylesheet is the thing under test here;
// the 320px rendering itself is checked in a browser.
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC = path.resolve(__dirname, '..');
const css = (f: string) => fs.readFileSync(path.join(SRC, f), 'utf8');

const CONTAINERS: Array<[string, string, string]> = [
  ['patient/PatientBanner/PatientBanner.css', '.cui-patient-banner', 'cui-patient-banner'],
  ['lists/PatientList/PatientList.css', '.cui-patient-list', 'cui-patient-list'],
  ['lists/TimelineView/TimelineView.css', '.cui-timeline', 'cui-timeline'],
  ['lists/HandoverTaskList/HandoverTaskList.css', '.cui-handover', 'cui-handover'],
  ['medications/MedicationsList/MedicationsList.css', '.cui-medications-list__scroll', 'cui-medications-list'],
  ['lists/shared/ListDialog.css', '.cui-list-dialog__body', 'cui-list-dialog'],
];

describe('responsive contract', () => {
  for (const [file, selector, name] of CONTAINERS) {
    it(`${selector} is a named inline-size container with narrow rules`, () => {
      const s = css(file);
      expect(s).toContain(`${selector} { container: ${name} / inline-size; }`);
      if (!file.includes('ListDialog')) expect(s).toMatch(new RegExp(`@container ${name} \\(max-width: \\d+px\\)`));
    });
  }
  it('the filter and sort dialogs stack their lines in a narrow dialog', () => {
    expect(css('lists/FilterDialog/FilterDialog.css')).toMatch(/@container cui-list-dialog/);
    expect(css('lists/SortDialog/SortDialog.css')).toMatch(/@container cui-list-dialog/);
  });
  it('a narrow PatientBanner keeps the allergy status visible and the other zone 2 titles for the expanded state', () => {
    const s = css('patient/PatientBanner/PatientBanner.css');
    expect(s).toMatch(/:not\(\.cui-patient-banner__zone2--expanded\) \.cui-patient-banner__section-title:not\(\.cui-patient-banner__section-title--allergies\) \{ display: none; \}/);
  });
  it('AlertContainer never asks for more width than it has', () => {
    expect(css('administration/AlertContainer/AlertContainer.css')).toContain('min-width: min(var(--cui-ds-alerts-min-width, 320px), 100%)');
  });
  it('no size container wraps a control that renders a fixed layer inline', () => {
    // A size container is the containing block for position: fixed descendants, which would trap menus and dialogs.
    expect(css('medications/MedicationsList/MedicationsList.css')).not.toMatch(/\.cui-medications-list \{ container/);
  });
  it('the root honours reduced motion and takes type and colour from tokens', () => {
    const base = css('core/base.css');
    expect(base).toContain('prefers-reduced-motion: reduce');
    expect(base).toMatch(/\.cui-root \{[^}]*font-size: var\(--font-size-body\)[^}]*background: var\(--surface\)/);
  });
});
