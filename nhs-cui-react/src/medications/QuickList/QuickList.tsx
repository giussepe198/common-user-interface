import React from 'react';
import { cx, formatShortDate, Icon, useClinicalLocale, useControllableState, useId, VisuallyHidden, DateLike } from '../../core';
import type { ClinicalRegion } from '../../core';
import type { DrugQuickList } from '../DrugSearch/DrugSearch';
import { directResult, DrugName } from '../DrugSearch/DrugName';
import type { DrugCatalogueEntry } from '../utils/drugSearch';
import { drugShortcutLabel } from '../utils/drugSearch';
import { tallManDefaultFor } from '../utils/tallMan';

export interface QuickListProps {
  /** Centrally managed Quick Lists (MSP-0060). One is always shown (MSP-0080). Only drug names, no templates (MSP-0130). */
  lists: DrugQuickList[];
  /** Shown list (controlled). Must always have a value: the selector has no "None" (MSP-0260). */
  listId?: string;
  defaultListId?: string;
  onListChange?: (id: string) => void;
  /** A drug was chosen by click, Enter or its shortcut. */
  onSelect: (entry: DrugCatalogueEntry) => void;
  /** Selected drug id, highlighted. */
  selectedId?: string;
  /** Contents changed since last shown to this user: a date or true (MSP-0170). */
  changedOn?: DateLike | true;
  /** Notice closed; `permanent` when "Don't show this message again" was ticked (MSP-0180/0190). */
  onNoticeDismiss?: (permanent: boolean) => void;
  /** Shortcut modifier (MSP-0140/0150). Default "Ctrl". */
  shortcutModifier?: 'Ctrl' | 'Alt';
  /** Listen for shortcuts on the whole page rather than only inside the list. Default false. */
  globalShortcuts?: boolean;
  /** Warning beside often mis-selected names (MSP-0720). Default "this drug is often mis-selected". */
  misSelectionText?: string;
  /** Jurisdiction; otherwise read from ClinicalLocaleProvider. AU and NZ use Title Case brands and mixed-case lettering. */
  region?: ClinicalRegion;
  /** Mixed-case lettering. Default on for AU and NZ. */
  tallManLettering?: boolean;
  className?: string;
}

/**
 * Quick List of preselected drug names on its own (Search and Prescribe section 4, MSP-0060 to MSP-0270):
 * description of the contents, at most 10 items so it never scrolls, a shortcut key shown right of each
 * item, alternate shading, a "Quick List" selector when there is more than one list, and a change notice
 * beside the list that turns shortcuts off until it is closed. DrugSearch embeds the same behaviour.
 */
export function QuickList({
  lists, listId, defaultListId, onListChange, onSelect, selectedId, changedOn, onNoticeDismiss, shortcutModifier = 'Ctrl',
  globalShortcuts = false, misSelectionText = 'this drug is often mis-selected', region: regionProp, tallManLettering, className,
}: QuickListProps) {
  const uid = useId('cui-quick-list');
  const { region } = useClinicalLocale(regionProp);
  const nameOpts = { region, tallMan: tallManLettering ?? tallManDefaultFor(region), misSelectionText };
  const [id, setId] = useControllableState(listId, defaultListId ?? lists[0]?.id ?? '', onListChange);
  const [noticeOpen, setNoticeOpen] = React.useState(changedOn != null);
  const [forget, setForget] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);
  React.useEffect(() => { setNoticeOpen(changedOn != null); }, [changedOn]);
  const list = lists.find(l => l.id === id) ?? lists[0];
  // Never more than fits without scrolling (MSP-0120).
  const items = list ? list.items.slice(0, 10) : [];

  const closeNotice = (permanent: boolean) => {
    if (!noticeOpen) return;
    setNoticeOpen(false);
    onNoticeDismiss?.(permanent);
  };
  const choose = (entry: DrugCatalogueEntry) => {
    onSelect(entry);
    closeNotice(forget); // auto-close on selection (MSP-0220)
  };

  const onShortcut = React.useCallback((e: KeyboardEvent | React.KeyboardEvent) => {
    const mod = shortcutModifier === 'Ctrl' ? e.ctrlKey : e.altKey;
    if (!mod || !/^[0-9]$/.test(e.key)) return;
    // Shortcuts do nothing while the change notice is open (MSP-0230).
    if (noticeOpen) return;
    const n = e.key === '0' ? 9 : Number(e.key) - 1;
    if (items[n]) { e.preventDefault(); choose(items[n]); }
  }, [shortcutModifier, noticeOpen, items, forget]);
  React.useEffect(() => {
    if (!globalShortcuts) return undefined;
    const h = (e: KeyboardEvent) => onShortcut(e);
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [globalShortcuts, onShortcut]);

  const focus = (i: number) => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    setActive(n);
    listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[n]?.focus();
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); focus(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focus(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focus(0); }
    else if (e.key === 'End') { e.preventDefault(); focus(items.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(items[i]); }
  };

  if (!list) return null;
  const noticeText = changedOn === true
    ? 'The contents of the Quick List have changed.'
    : changedOn != null ? `The contents of the Quick List were updated on ${formatShortDate(changedOn)}.` : '';

  return (
    <div className={cx('cui-quick-list', className)} onKeyDown={globalShortcuts ? undefined : onShortcut}>
      {lists.length > 1 ? (
        <label className="cui-quick-list__select">
          <span className="cui-quick-list__label">Quick List</span>
          <select value={list.id} onChange={e => { setId(e.target.value); setActive(0); }}>
            {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </label>
      ) : null}
      <div className="cui-quick-list__area">
        <div className="cui-quick-list__box">
          <div className="cui-drug-search__ql-desc" id={`${uid}-desc`}>{list.description}</div>
          <ul ref={listRef} role="listbox" aria-label={`Quick List: ${list.name}`} aria-describedby={`${uid}-desc`} className="cui-drug-search__list">
            {items.map((entry, i) => {
              const shortcut = drugShortcutLabel(i)?.replace('Ctrl', shortcutModifier);
              const isSel = entry.id === selectedId;
              return (
                <li
                  key={entry.id}
                  role="option"
                  aria-selected={isSel}
                  tabIndex={i === Math.min(active, items.length - 1) ? 0 : -1}
                  className={cx('cui-drug-search__option', i % 2 === 1 && 'is-shaded', entry.misSelectionRisk && 'is-risk', isSel && 'is-selected')}
                  onClick={() => { setActive(i); choose(entry); }}
                  onFocus={() => setActive(i)}
                  onKeyDown={e => onKey(e, i)}
                >
                  <DrugName r={directResult(entry)} opts={nameOpts} />
                  {shortcut ? <span className="cui-drug-search__shortcut"><VisuallyHidden>, shortcut </VisuallyHidden>{shortcut}</span> : null}
                </li>
              );
            })}
          </ul>
        </div>
        {noticeOpen && noticeText ? (
          <div className="cui-drug-search__notice" role="note" aria-label="Quick List changed">
            <div className="cui-drug-search__notice-text">
              <Icon name="info" size={16} />
              <span>{noticeText}</span>
            </div>
            <label className="cui-drug-search__notice-check">
              <input type="checkbox" checked={forget} onChange={e => setForget(e.target.checked)} />
              Don't show this message again
            </label>
            <button type="button" className="cui-drug-search__notice-close" onClick={() => closeNotice(forget)}>Close</button>
            <span className="cui-drug-search__notice-hint">Shortcut keys are turned off while this message is open.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
