import React from 'react';
import { cx, useId } from '../../core';

/** A ready-made symbol relevant to the loaded graphic (NwG-0029/0030/0032/0033). */
export interface ReadyMadeSymbol {
  id: string;
  /** Text label, also the tooltip (NwG-0076), e.g. "Exact location (X)". */
  label: string;
  /** SVG path data drawn in a 24 x 24 box centred on 12,12. Stroke only, no fill (NwG-0039). */
  path: string;
  /** Size on the canvas in pixels, matched to the graphic (NwG-0111). Default 22. */
  size?: number;
}

/** Drawing tool: select, a ready-made symbol, pen, region shading, or a general comment. */
export type GraphicTool = 'select' | 'pen' | 'region' | 'text' | `symbol:${string}`;

export interface GraphicToolbarProps {
  /** Current tool. */
  tool: GraphicTool;
  onToolChange: (tool: GraphicTool) => void;
  /** Ready-made symbols for the loaded graphic: a small, commonly used set (NwG-0033). */
  symbols: ReadyMadeSymbol[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  /** Delete the selected finding (symbol, arrow and text-box together, NwG-0094/0103). */
  onDeleteSelected?: () => void;
  canDeleteSelected?: boolean;
  /** Remove everything back to the loaded graphic (NwG-0069); the canvas asks Cancel/Continue first (NwG-0070). */
  onRemoveAll: () => void;
  canRemoveAll: boolean;
  /** Emphasis of the text-box in focus (NwG-0051). Omit to hide the format group. */
  emphasis?: { bold: boolean; underline: boolean; enabled: boolean };
  onToggleEmphasis?: (kind: 'bold' | 'underline') => void;
  /** Remove the whole graphics module where the context allows (NwG-0018). */
  onRemoveModule?: () => void;
  /** Accessible name of the toolbar. Default "Drawing tools". */
  label?: string;
  className?: string;
}

interface Item {
  key: string;
  label: string;
  tip: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}

const glyph = (d: string) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" className="cui-graphic-toolbar__glyph">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Toolbar for the annotated graphic canvas (NwG-0067..0104): related tools grouped (NwG-0075), every
 * tool with a text label and tooltip (NwG-0076), undo and redo (NwG-0067), delete one item
 * (NwG-0103) and remove all (NwG-0069). Arrow keys move between tools (one tab stop).
 */
export function GraphicToolbar({
  tool,
  onToolChange,
  symbols,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDeleteSelected,
  canDeleteSelected = false,
  onRemoveAll,
  canRemoveAll,
  emphasis,
  onToggleEmphasis,
  onRemoveModule,
  label = 'Drawing tools',
  className,
}: GraphicToolbarProps) {
  const id = useId('cui-gtool');
  const groups: Array<{ name: string; items: Item[] }> = [
    { name: 'Select', items: [{ key: 'select', label: 'Select', tip: 'Select, move or delete a finding', pressed: tool === 'select', onClick: () => onToolChange('select'), icon: glyph('M5 3l14 8-6 2-2 6z') }] },
    {
      name: 'Symbols',
      items: symbols.map((s) => ({ key: `symbol:${s.id}`, label: s.label, tip: `Place symbol: ${s.label}. Click on the diagram`, pressed: tool === `symbol:${s.id}`, onClick: () => onToolChange(`symbol:${s.id}`), icon: glyph(s.path) })),
    },
    {
      name: 'Draw',
      items: [
        { key: 'pen', label: 'Pen', tip: 'Draw free-hand', pressed: tool === 'pen', onClick: () => onToolChange('pen'), icon: glyph('M4 20l4-1 11-11-3-3L5 16z') },
        { key: 'region', label: 'Shade area', tip: 'Draw round an area to shade it', pressed: tool === 'region', onClick: () => onToolChange('region'), icon: glyph('M4 12c0-5 6-8 10-6s6 8 2 11-12 0-12-5z') },
      ],
    },
    { name: 'Text', items: [{ key: 'text', label: 'Comment', tip: 'Add a general comment text-box', pressed: tool === 'text', onClick: () => onToolChange('text'), icon: glyph('M5 5h14v10H9l-4 4z') }] },
    ...(emphasis && onToggleEmphasis
      ? [{
          name: 'Format',
          items: [
            { key: 'bold', label: 'Bold', tip: 'Bold text in the selected text-box', pressed: emphasis.bold, disabled: !emphasis.enabled, onClick: () => onToggleEmphasis('bold'), icon: glyph('M7 5h6a3 3 0 010 6H7zm0 6h7a3 3 0 010 6H7z') },
            { key: 'underline', label: 'Underline', tip: 'Underline text in the selected text-box', pressed: emphasis.underline, disabled: !emphasis.enabled, onClick: () => onToggleEmphasis('underline'), icon: glyph('M7 4v7a5 5 0 0010 0V4M5 20h14') },
          ],
        }]
      : []),
    {
      name: 'Edit',
      items: [
        { key: 'undo', label: 'Undo', tip: 'Undo the last change', disabled: !canUndo, onClick: onUndo, icon: glyph('M9 7L4 12l5 5M4 12h11a5 5 0 010 10') },
        { key: 'redo', label: 'Redo', tip: 'Redo the change', disabled: !canRedo, onClick: onRedo, icon: glyph('M15 7l5 5-5 5M20 12H9a5 5 0 000 10') },
        ...(onDeleteSelected ? [{ key: 'delete', label: 'Delete', tip: 'Delete the selected finding with its arrow and text', disabled: !canDeleteSelected, onClick: onDeleteSelected, icon: glyph('M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13') }] : []),
        { key: 'clear', label: 'Remove all', tip: 'Remove all annotations', disabled: !canRemoveAll, onClick: onRemoveAll, icon: glyph('M5 5l14 14M19 5L5 19'), danger: true },
        ...(onRemoveModule ? [{ key: 'module', label: 'Remove diagram', tip: 'Remove the diagram from the note', onClick: onRemoveModule, icon: glyph('M4 4h16v16H4zM8 12h8') }] : []),
      ],
    },
  ];
  const flat = groups.flatMap((g) => g.items);
  const [focusKey, setFocusKey] = React.useState<string>(flat.find((i) => i.pressed)?.key ?? flat[0]?.key ?? '');
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const tabKey = flat.some((i) => i.key === focusKey && !i.disabled) ? focusKey : flat.find((i) => !i.disabled)?.key;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const enabled = flat.filter((i) => !i.disabled);
    const i = enabled.findIndex((x) => x.key === tabKey);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? enabled.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : enabled.length - 1)) % enabled.length;
    const k = enabled[next]?.key;
    if (k) {
      setFocusKey(k);
      refs.current[k]?.focus();
    }
  };

  return (
    <div role="toolbar" aria-label={label} className={cx('cui-graphic-toolbar', className)} onKeyDown={onKeyDown}>
      {groups.filter((g) => g.items.length).map((g) => (
        <div key={g.name} role="group" aria-labelledby={`${id}-${g.name}`} className="cui-graphic-toolbar__group">
          <span id={`${id}-${g.name}`} className="cui-graphic-toolbar__group-label">{g.name}</span>
          <div className="cui-graphic-toolbar__buttons">
            {g.items.map((it) => (
              <button
                key={it.key}
                ref={(el) => {
                  refs.current[it.key] = el;
                }}
                type="button"
                className={cx('cui-graphic-toolbar__button', it.pressed && 'cui-graphic-toolbar__button--on', it.danger && 'cui-graphic-toolbar__button--danger')}
                title={it.tip}
                aria-pressed={it.pressed === undefined ? undefined : it.pressed}
                disabled={it.disabled}
                tabIndex={it.key === tabKey ? 0 : -1}
                onFocus={() => setFocusKey(it.key)}
                onClick={it.onClick}
              >
                {it.icon}
                <span>{it.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
