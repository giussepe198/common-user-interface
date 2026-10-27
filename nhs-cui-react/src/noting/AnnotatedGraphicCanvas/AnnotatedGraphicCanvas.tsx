import React from 'react';
import { Button, cx, useControllableState, useId } from '../../core';
import { GraphicToolbar, type GraphicTool, type ReadyMadeSymbol } from '../GraphicToolbar/GraphicToolbar';
import {
  canvasHeightFor,
  clampToCanvas,
  freehandPath,
  isInsideGraphic,
  nearestGraphicSide,
  placeAnnotationTextBox,
  pointsBounds,
  rectEdgePoint,
  type GraphicPoint,
  type GraphicRect,
} from '../utils/graphics';

/** One image of a graphic, e.g. "Front view". Simple greyscale line art only (NwG-0001/0002). */
export interface GraphicImage {
  /** Orientation label shown under the image (NwG-0008), e.g. "Front view". */
  label: string;
  /** Position and size inside the graphic, in pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Line-art paths in graphic coordinates, drawn as thin grey strokes with no fill. */
  paths?: string[];
  /** Or an image URL (data URI); it is shown in greyscale. */
  src?: string;
}

/** A diagram that can be annotated (NwG Graphics). */
export interface GraphicDefinition {
  id: string;
  /** Title shown above the graphic where the wrong one could be chosen (NwG-0088), e.g. "Left hand". */
  title: string;
  width: number;
  height: number;
  images: GraphicImage[];
  /** Age group the drawing suits (NwG-0004). */
  ageGroup?: 'adult' | 'teenager' | 'child' | 'infant' | 'baby';
  /** Sex the drawing suits (NwG-0087). */
  sex?: 'male' | 'female';
  /** Words for the keyword search in `GraphicPicker` (NwG-0026). */
  keywords?: string[];
}

/** The mark of a finding: a ready-made symbol, a free-hand line or a shaded region. Coordinates are relative to the graphic (NwG-0011). */
export type GraphicMark =
  | { kind: 'symbol'; symbolId: string; x: number; y: number }
  | { kind: 'freehand' | 'region'; points: GraphicPoint[] };

/**
 * One finding: a mark with its arrow and text-box (NwG-0043), or a general comment text-box with no
 * mark (NwG-0055). Moved and deleted as one (NwG-0041, NwG-0094/0095).
 */
export interface GraphicFinding {
  id: string;
  mark?: GraphicMark;
  /** Text-box position (top left, relative to the graphic) and width. */
  box: { x: number; y: number; width: number };
  text: string;
  emphasis?: { bold?: boolean; underline?: boolean };
}

export interface AnnotatedGraphicCanvasProps {
  /** The loaded graphic. The canvas is never blank (NwG-0099). */
  graphic: GraphicDefinition;
  /** Findings (controlled). */
  findings?: GraphicFinding[];
  defaultFindings?: GraphicFinding[];
  onFindingsChange?: (findings: GraphicFinding[]) => void;
  /** 'edit' shows the canvas and toolbar (NwG-0112); 'view' shows the canvas only, read-only (NwG-0113/0114). */
  mode?: 'edit' | 'view';
  /** Ready-made symbols for this graphic, including one for an exact location (NwG-0092). */
  symbols?: ReadyMadeSymbol[];
  /** Width of the text area on each side of the graphic (NwG-0005). Default 200. */
  sideWidth?: number;
  /** Undo levels kept (NwG-0067: at least one). Default 20. */
  undoDepth?: number;
  /** Placeholder of new text-boxes (NwG-0048). Default "Enter text here...". */
  textPlaceholder?: string;
  /** Remove the whole module (NwG-0018), shown in the toolbar. */
  onRemoveModule?: () => void;
  /** Accessible name of the drawing area. Default: the graphic title. */
  label?: string;
  /** Makes ids for new findings. */
  createId?: () => string;
  className?: string;
}

/** Default ready-made symbols [suggested]: exact location 'X' (NwG-0092), circle, and a small set. */
export const DEFAULT_GRAPHIC_SYMBOLS: ReadyMadeSymbol[] = [
  { id: 'x', label: 'Exact location (X)', path: 'M5 5L19 19M19 5L5 19' },
  { id: 'circle', label: 'Circle', path: 'M12 3a9 9 0 1 0 0.01 0' },
  { id: 'triangle', label: 'Triangle', path: 'M12 3L21 20H3Z' },
];

const TEXT_W = 170;
const LINE_H = 18;
let counter = 0;
const defaultCreateId = () => `finding-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Estimated text-box height: grows with the text and is never truncated (NwG-0050, NwG-0109). */
function boxHeight(text: string, width: number): number {
  const perLine = Math.max(8, Math.floor((width - 14) / 7));
  const lines = (text || ' ').split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(l.length / perLine)), 0);
  return Math.max(2, lines) * LINE_H + 12;
}

function markAnchor(m: GraphicMark): GraphicPoint {
  if (m.kind === 'symbol') return { x: m.x, y: m.y };
  const b = pointsBounds(m.points);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

function moveMark(m: GraphicMark, dx: number, dy: number): GraphicMark {
  if (m.kind === 'symbol') return { ...m, x: m.x + dx, y: m.y + dy };
  return { ...m, points: m.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
}

/**
 * Canvas for annotating a body diagram with symbols, free-hand drawing, shading and text-boxes
 * (Noting with Graphics). Each mark gets a text-box on the nearest side with a distinct dashed arrow;
 * text is never truncated or hidden; the canvas grows downwards instead of scrolling.
 */
export function AnnotatedGraphicCanvas({
  graphic,
  findings: findingsProp,
  defaultFindings = [],
  onFindingsChange,
  mode = 'edit',
  symbols = DEFAULT_GRAPHIC_SYMBOLS,
  sideWidth = 200,
  undoDepth = 20,
  textPlaceholder = 'Enter text here...',
  onRemoveModule,
  label,
  createId = defaultCreateId,
  className,
}: AnnotatedGraphicCanvasProps) {
  const baseId = useId('cui-graphic');
  const [findings, setFindingsRaw] = useControllableState<GraphicFinding[]>(findingsProp, defaultFindings, onFindingsChange);
  const findingsRef = React.useRef(findings);
  findingsRef.current = findings;
  const [past, setPast] = React.useState<GraphicFinding[][]>([]);
  const [future, setFuture] = React.useState<GraphicFinding[][]>([]);
  const [tool, setTool] = React.useState<GraphicTool>('select');
  const [selected, setSelected] = React.useState<string | null>(null);
  const [focusedText, setFocusedText] = React.useState<string | null>(null);
  const [edited, setEdited] = React.useState<Set<string>>(() => new Set(defaultFindings.concat(findingsProp ?? []).filter((f) => f.text).map((f) => f.id)));
  const [drawing, setDrawing] = React.useState<GraphicPoint[] | null>(null);
  /** Keyboard pen: the pen is down and arrow keys draw (NwG-0028/0034 from the keyboard [suggested]). */
  const [keyDrawing, setKeyDrawing] = React.useState(false);
  const [drag, setDrag] = React.useState<{ id: string; start: GraphicPoint; dx: number; dy: number; placing?: boolean } | null>(null);
  // Keyboard pointer starts in the middle of the first image, so Enter places a symbol on the body.
  const firstImage = graphic.images[0];
  const [cursor, setCursor] = React.useState<GraphicPoint>(firstImage ? { x: firstImage.x + firstImage.width / 2, y: firstImage.y + firstImage.height / 2 } : { x: graphic.width / 2, y: graphic.height / 2 });
  const [canvasFocused, setCanvasFocused] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState('');
  const [lookAhead, setLookAhead] = React.useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const focusBox = React.useRef<string | null>(null);
  const typingSnapshot = React.useRef<string | null>(null);
  const edit = mode === 'edit';

  const width = sideWidth * 2 + graphic.width;
  const ox = sideWidth; // graphic origin inside the canvas
  const rects = (list: GraphicFinding[]): GraphicRect[] => list.map((f) => ({ x: f.box.x + ox, y: f.box.y, width: f.box.width, height: boxHeight(f.text, f.box.width) }));
  const height = canvasHeightFor(graphic.height + 24, rects(findings));
  const canvasRect: GraphicRect = { x: -ox, y: 0, width, height };
  const imageRects: GraphicRect[] = graphic.images.map((i) => ({ x: i.x, y: i.y, width: i.width, height: i.height }));
  const symbolById = (id: string) => symbols.find((s) => s.id === id);

  const commit = (next: GraphicFinding[], message?: string) => {
    setPast((p) => [...p, findingsRef.current].slice(-Math.max(1, undoDepth)));
    setFuture([]);
    findingsRef.current = next;
    setFindingsRaw(next);
    if (message) setAnnouncement(message);
  };

  React.useEffect(() => {
    if (!focusBox.current) return;
    const el = document.getElementById(`${baseId}-box-${focusBox.current}`);
    focusBox.current = null;
    el?.focus();
  });

  React.useEffect(() => {
    // Look-ahead (NwG): only while part of the canvas is in view and its bottom edge is below the viewport.
    const el = surfaceRef.current;
    const IO = (globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver;
    if (!el || !IO) return;
    const io = new IO(
      (entries) => {
        const e = entries[entries.length - 1];
        const viewBottom = e.rootBounds ? e.rootBounds.bottom : window.innerHeight;
        setLookAhead(e.isIntersecting && e.boundingClientRect.bottom > viewBottom + 1);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 0.99, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [height]);

  /** Point in graphic coordinates from a pointer event. */
  const toGraphic = (e: React.PointerEvent | React.MouseEvent): GraphicPoint => {
    const svg = svgRef.current;
    const r = svg?.getBoundingClientRect();
    const sx = r && r.width ? width / r.width : 1;
    const sy = r && r.height ? height / r.height : 1;
    return { x: (e.clientX - (r?.left ?? 0)) * sx - ox, y: (e.clientY - (r?.top ?? 0)) * sy };
  };

  /** Text-box for a new mark: nearest side, close to the mark, never on top of other items (NwG-0045/0046). */
  const newBoxFor = (anchor: GraphicPoint, list: GraphicFinding[], avoid: GraphicRect[] = []) => {
    const side = nearestGraphicSide(anchor.x, graphic.width / 2);
    const colX = side === 'left' ? 8 : ox + graphic.width + sideWidth - TEXT_W - 8;
    const markRects = list.flatMap((f) => (f.mark && f.mark.kind !== 'symbol' ? [pointsBounds(f.mark.points)] : []));
    const occupied = [...rects(list), ...[...avoid, ...markRects].map((r) => ({ ...r, x: r.x + ox }))];
    const r = placeAnnotationTextBox(anchor.y, { x: colX, width: TEXT_W }, boxHeight('', TEXT_W), occupied);
    return { x: r.x - ox, y: r.y, width: TEXT_W };
  };

  const addFinding = (mark: GraphicMark | undefined, at?: GraphicPoint) => {
    const id = createId();
    const anchor = mark ? markAnchor(mark) : at ?? cursor;
    const box = mark ? newBoxFor(anchor, findingsRef.current) : (() => {
      const side = nearestGraphicSide(anchor.x, graphic.width / 2);
      const inMargin = anchor.x < 0 || anchor.x > graphic.width;
      const colX = inMargin ? Math.min(Math.max(anchor.x + ox, 8), width - TEXT_W - 8) : side === 'left' ? 8 : ox + graphic.width + sideWidth - TEXT_W - 8;
      const r = placeAnnotationTextBox(anchor.y, { x: colX, width: TEXT_W }, boxHeight('', TEXT_W), rects(findingsRef.current));
      return { x: r.x - ox, y: r.y, width: TEXT_W };
    })();
    const f: GraphicFinding = { id, mark, box, text: '' };
    commit([...findingsRef.current, f], mark ? `${mark.kind === 'symbol' ? symbolById(mark.symbolId)?.label ?? 'Symbol' : mark.kind === 'region' ? 'Shaded area' : 'Drawing'} added with a text-box.` : 'Comment text-box added.');
    setSelected(id);
    focusBox.current = id;
  };

  const removeFinding = (id: string) => {
    commit(findingsRef.current.filter((f) => f.id !== id), 'Finding deleted with its arrow and text.');
    setSelected(null);
  };

  const placeSymbol = (symbolId: string, p: GraphicPoint) => {
    if (!isInsideGraphic(p, imageRects)) {
      setAnnouncement('Ready-made symbols can only be placed on the diagram.');
      return false;
    }
    addFinding({ kind: 'symbol', symbolId, x: p.x, y: p.y });
    return true;
  };

  // Pointer handling
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!edit) return;
    const p = toGraphic(e);
    if (tool === 'pen' || tool === 'region') {
      const c = clampToCanvas(p, canvasRect);
      setDrawing([c]);
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } else if (tool.startsWith('symbol:')) {
      if (!isInsideGraphic(p, imageRects)) {
        setAnnouncement('Ready-made symbols can only be placed on the diagram.');
        return;
      }
      setDrag({ id: '__new', start: p, dx: 0, dy: 0, placing: true });
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } else if (tool === 'text') {
      addFinding(undefined, p);
    } else {
      setSelected(null);
      setFocusedText(null);
    }
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drawing) setDrawing([...drawing, clampToCanvas(toGraphic(e), canvasRect)]);
    else if (drag) {
      const p = toGraphic(e);
      setDrag({ ...drag, dx: p.x - drag.start.x, dy: p.y - drag.start.y });
    }
  };
  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drawing) {
      const pts = drawing;
      setDrawing(null);
      if (pts.length > 1) addFinding({ kind: tool === 'region' ? 'region' : 'freehand', points: pts });
    } else if (drag) {
      const d = drag;
      setDrag(null);
      if (d.placing && tool.startsWith('symbol:')) placeSymbol(tool.slice(7), { x: d.start.x + d.dx, y: d.start.y + d.dy });
      else if (!d.placing && (d.dx || d.dy)) moveFinding(d.id, d.dx, d.dy);
    }
    void e;
  };

  const moveFinding = (id: string, dx: number, dy: number) => {
    const f = findingsRef.current.find((x) => x.id === id);
    if (!f?.mark) return;
    const moved = moveMark(f.mark, dx, dy);
    if (moved.kind === 'symbol' && !isInsideGraphic(moved, imageRects)) {
      setAnnouncement('Symbols must stay on the diagram.');
      return;
    }
    commit(findingsRef.current.map((x) => (x.id === id ? { ...x, mark: moved, box: { ...x.box, y: Math.max(0, x.box.y + dy) } } : x)), 'Finding moved with its text-box.');
  };

  const finishKeyDrawing = (cancel = false) => {
    const pts = drawing ?? [];
    setKeyDrawing(false);
    setDrawing(null);
    if (cancel) setAnnouncement('Drawing cancelled.');
    else if (pts.length > 1) addFinding({ kind: tool === 'region' ? 'region' : 'freehand', points: pts });
    else setAnnouncement('Nothing drawn: move the pen with the arrow keys before finishing.');
  };

  const onCanvasKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!edit) return;
    const step = e.shiftKey ? 16 : 4;
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
      // Diagonals for the keyboard pen [suggested]: Home up-left, PageUp up-right, End down-left, PageDown down-right.
      ...(keyDrawing ? { Home: [-step, -step], PageUp: [step, -step], End: [-step, step], PageDown: [step, step] } : {}),
    };
    if (keyDrawing && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      finishKeyDrawing(true);
      return;
    }
    if (keyDrawing && e.key === 'Backspace') {
      e.preventDefault();
      const pts = drawing ?? [];
      if (pts.length > 1) {
        const rest = pts.slice(0, -1);
        setDrawing(rest);
        setCursor(rest[rest.length - 1]);
        setAnnouncement('Last step removed.');
      }
      return;
    }
    if (arrows[e.key]) {
      e.preventDefault();
      const [dx, dy] = arrows[e.key];
      if (keyDrawing) {
        const next = clampToCanvas({ x: cursor.x + dx, y: cursor.y + dy }, canvasRect);
        setCursor(next);
        setDrawing([...(drawing ?? [cursor]), next]);
      } else if (tool === 'select' && selected) moveFinding(selected, dx, dy);
      else setCursor((c) => clampToCanvas({ x: c.x + dx, y: c.y + dy }, canvasRect));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (tool.startsWith('symbol:')) placeSymbol(tool.slice(7), cursor);
      else if (tool === 'text') addFinding(undefined, cursor);
      else if (tool === 'pen' || tool === 'region') {
        if (keyDrawing) finishKeyDrawing();
        else {
          setKeyDrawing(true);
          setDrawing([cursor]);
          setAnnouncement(`${tool === 'region' ? 'Shading' : 'Pen'} down. Arrow keys draw, with Shift for longer steps; Home, End, Page Up and Page Down draw diagonally; Backspace removes the last step. Enter or Space finishes, Escape cancels.`);
        }
      }
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
      e.preventDefault();
      removeFinding(selected);
    } else if (e.key === 'n' || e.key === 'p') {
      const list = findings.filter((f) => f.mark);
      if (!list.length) return;
      const i = list.findIndex((f) => f.id === selected);
      const next = i < 0 ? list[e.key === 'n' ? 0 : list.length - 1] : list[(i + (e.key === 'n' ? 1 : list.length - 1)) % list.length];
      setSelected(next.id);
      setAnnouncement(`Selected: ${describe(next)}`);
    }
  };

  const describe = (f: GraphicFinding) => {
    const what = !f.mark ? 'Comment' : f.mark.kind === 'symbol' ? symbolById(f.mark.symbolId)?.label ?? 'Symbol' : f.mark.kind === 'region' ? 'Shaded area' : 'Drawing';
    return `${what}${f.text ? `: ${f.text}` : ''}`;
  };

  const undo = () => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture([findingsRef.current, ...future]);
    findingsRef.current = prev;
    setFindingsRaw(prev);
    setAnnouncement('Undone.');
  };
  const redo = () => {
    if (!future.length) return;
    const [next, ...rest] = future;
    setPast([...past, findingsRef.current]);
    setFuture(rest);
    findingsRef.current = next;
    setFindingsRaw(next);
    setAnnouncement('Redone.');
  };

  const focused = findings.find((f) => f.id === focusedText);
  const cursorStyle = !edit ? 'default' : tool === 'select' ? 'default' : tool === 'text' ? 'text' : 'crosshair';

  const renderMark = (f: GraphicFinding, dx = 0, dy = 0) => {
    const m = f.mark;
    if (!m) return null;
    const isSel = selected === f.id;
    if (m.kind === 'symbol') {
      const s = symbolById(m.symbolId);
      const size = s?.size ?? 22;
      const x = m.x + dx + ox;
      const y = m.y + dy;
      return (
        <g
          key={f.id}
          className={cx('cui-graphic-canvas__symbol', isSel && 'cui-graphic-canvas__symbol--selected')}
          transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}
          onPointerDown={(e) => {
            if (!edit || tool !== 'select') return;
            e.stopPropagation();
            setSelected(f.id);
            setDrag({ id: f.id, start: toGraphic(e), dx: 0, dy: 0 });
            svgRef.current?.setPointerCapture?.(e.pointerId);
          }}
        >
          <rect x={-2} y={-2} width={28} height={28} className="cui-graphic-canvas__hit" />
          <path d={s?.path ?? DEFAULT_GRAPHIC_SYMBOLS[0].path} />
        </g>
      );
    }
    const d = freehandPath(m.points.map((p) => ({ x: p.x + dx + ox, y: p.y + dy })), m.kind === 'region');
    return (
      <path
        key={f.id}
        d={d}
        className={cx(m.kind === 'region' ? 'cui-graphic-canvas__region' : 'cui-graphic-canvas__freehand', isSel && 'cui-graphic-canvas__mark--selected')}
        fill={m.kind === 'region' ? `url(#${baseId}-hatch)` : 'none'}
        onPointerDown={(e) => {
          if (!edit || tool !== 'select') return;
          e.stopPropagation();
          setSelected(f.id);
          setDrag({ id: f.id, start: toGraphic(e), dx: 0, dy: 0 });
        }}
      />
    );
  };

  const arrowFor = (f: GraphicFinding, dx = 0, dy = 0) => {
    if (!f.mark) return null;
    const a = markAnchor(f.mark);
    const target = { x: a.x + dx + ox, y: a.y + dy };
    const r = { x: f.box.x + ox, y: f.box.y + dy, width: f.box.width, height: boxHeight(f.text, f.box.width) };
    const start = rectEdgePoint(r, target);
    const len = Math.hypot(target.x - start.x, target.y - start.y) || 1;
    const back = f.mark.kind === 'symbol' ? (symbolById(f.mark.symbolId)?.size ?? 22) / 2 + 4 : 6;
    const end = { x: target.x - ((target.x - start.x) / len) * back, y: target.y - ((target.y - start.y) / len) * back };
    return <line key={`a-${f.id}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="cui-graphic-canvas__arrow" markerEnd={`url(#${baseId}-head)`} />;
  };

  return (
    <div className={cx('cui-graphic-canvas', `cui-graphic-canvas--${mode}`, className)}>
      {edit ? (
        <GraphicToolbar
          tool={tool}
          onToolChange={(t) => {
            if (keyDrawing) {
              setKeyDrawing(false);
              setDrawing(null);
            }
            setTool(t);
            setAnnouncement(t === 'select' ? 'Select tool' : t.startsWith('symbol:') ? `${symbolById(t.slice(7))?.label} symbol: click on the diagram, or use the arrow keys and Enter` : t === 'text' ? 'Comment tool: click where the comment should go' : 'Drawing tool: drag with a pointer, or press Enter on the drawing area to put the pen down and draw with the arrow keys');
          }}
          symbols={symbols}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onUndo={undo}
          onRedo={redo}
          onDeleteSelected={() => selected && removeFinding(selected)}
          canDeleteSelected={!!selected}
          onRemoveAll={() => setConfirmClear(true)}
          canRemoveAll={findings.length > 0}
          emphasis={{ bold: !!focused?.emphasis?.bold, underline: !!focused?.emphasis?.underline, enabled: !!focused }}
          onToggleEmphasis={(k) => {
            if (!focused) return;
            commit(findingsRef.current.map((x) => (x.id === focused.id ? { ...x, emphasis: { ...x.emphasis, [k]: !x.emphasis?.[k] } } : x)));
            focusBox.current = focused.id;
          }}
          onRemoveModule={onRemoveModule}
        />
      ) : null}
      {confirmClear ? (
        <div className="cui-graphic-canvas__confirm" role="alertdialog" aria-labelledby={`${baseId}-clear`}>
          <span id={`${baseId}-clear`}>Remove all symbols, drawings and text from the diagram?</span>
          <Button size="sm" autoFocus onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              commit([], 'All annotations removed.');
              setSelected(null);
              setConfirmClear(false);
            }}
          >
            Continue
          </Button>
        </div>
      ) : null}
      <h3 className="cui-graphic-canvas__title" id={`${baseId}-title`}>{graphic.title}</h3>
      <div ref={surfaceRef} className="cui-graphic-canvas__surface" style={{ width, height }}>
        <svg
          ref={svgRef}
          className="cui-graphic-canvas__svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role={edit ? 'application' : 'img'}
          aria-roledescription={edit ? 'drawing canvas' : undefined}
          aria-labelledby={`${baseId}-title`}
          aria-describedby={`${baseId}-desc`}
          tabIndex={edit ? 0 : undefined}
          style={{ cursor: cursorStyle }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onCanvasKey}
          onFocus={() => setCanvasFocused(true)}
          onBlur={() => {
            setCanvasFocused(false);
            if (keyDrawing) finishKeyDrawing();
          }}
        >
          <defs>
            <marker id={`${baseId}-head`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" className="cui-graphic-canvas__arrowhead" />
            </marker>
            <pattern id={`${baseId}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" className="cui-graphic-canvas__hatch" />
            </pattern>
          </defs>
          <g className="cui-graphic-canvas__graphic" transform={`translate(${ox} 0)`} aria-hidden="true">
            {graphic.images.map((img, i) => (
              <g key={i}>
                {img.src ? <image href={img.src} x={img.x} y={img.y} width={img.width} height={img.height} className="cui-graphic-canvas__image" /> : null}
                {(img.paths ?? []).map((d, k) => <path key={k} d={d} className="cui-graphic-canvas__line" />)}
                <text x={img.x + img.width / 2} y={img.y + img.height + 16} textAnchor="middle" className="cui-graphic-canvas__orientation">{img.label}</text>
              </g>
            ))}
          </g>
          <g aria-hidden="true">
            {findings.map((f) => {
              const moving = drag && !drag.placing && drag.id === f.id;
              return (
                <React.Fragment key={f.id}>
                  {arrowFor(f, moving ? drag.dx : 0, moving ? drag.dy : 0)}
                  {renderMark(f, moving ? drag.dx : 0, moving ? drag.dy : 0)}
                </React.Fragment>
              );
            })}
            {drawing && drawing.length > 1 ? <path d={freehandPath(drawing.map((p) => ({ x: p.x + ox, y: p.y })))} className="cui-graphic-canvas__freehand cui-graphic-canvas__freehand--live" fill="none" /> : null}
            {drag ? (() => {
              const f = drag.placing ? null : findings.find((x) => x.id === drag.id);
              const s = drag.placing ? symbolById(tool.slice(7)) : f?.mark?.kind === 'symbol' ? symbolById(f.mark.symbolId) : undefined;
              const size = s?.size ?? 22;
              const base = drag.placing ? drag.start : f?.mark ? markAnchor(f.mark) : null;
              if (!base) return null;
              const x = base.x + drag.dx + ox;
              const y = base.y + drag.dy;
              return (
                <g>
                  {drag.placing && s ? <path d={s.path} transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`} className="cui-graphic-canvas__symbol-live" /> : null}
                  <rect x={x - size / 2 - 6} y={y - size / 2 - 6} width={size + 12} height={size + 12} className="cui-graphic-canvas__bounding" />
                </g>
              );
            })() : null}
            {edit && canvasFocused && tool !== 'select' ? (
              <g className={cx('cui-graphic-canvas__cursor', keyDrawing && 'cui-graphic-canvas__cursor--down')} transform={`translate(${cursor.x + ox} ${cursor.y})`}>
                <circle r="9" />
                <path d="M-14 0H-5M5 0H14M0 -14V-5M0 5V14" />
              </g>
            ) : null}
          </g>
        </svg>
        {findings.map((f) => {
          const moving = drag && !drag.placing && drag.id === f.id;
          const top = f.box.y + (moving ? drag.dy : 0);
          const h = boxHeight(f.text, f.box.width);
          const isNew = !f.text && !edited.has(f.id);
          const style: React.CSSProperties = { left: f.box.x + ox, top, width: f.box.width, minHeight: h, fontWeight: f.emphasis?.bold ? 700 : undefined, textDecoration: f.emphasis?.underline ? 'underline' : undefined };
          return edit ? (
            <div key={f.id} className={cx('cui-graphic-canvas__box', isNew && 'cui-graphic-canvas__box--new', selected === f.id && 'cui-graphic-canvas__box--selected')} style={{ left: style.left, top, width: style.width }}>
              <textarea
                id={`${baseId}-box-${f.id}`}
                className="cui-graphic-canvas__textarea"
                aria-label={`Text for ${describe({ ...f, text: '' })}`}
                placeholder={textPlaceholder}
                value={f.text}
                rows={Math.max(2, Math.round((h - 12) / LINE_H))}
                style={{ height: h, fontWeight: style.fontWeight, textDecoration: style.textDecoration }}
                onFocus={() => {
                  setFocusedText(f.id);
                  setSelected(f.id);
                  typingSnapshot.current = null;
                }}
                onChange={(e) => {
                  const next = findingsRef.current.map((x) => (x.id === f.id ? { ...x, text: e.target.value } : x));
                  if (typingSnapshot.current !== f.id) {
                    typingSnapshot.current = f.id;
                    commit(next);
                  } else {
                    findingsRef.current = next;
                    setFindingsRaw(next);
                  }
                  if (!edited.has(f.id)) setEdited(new Set(edited).add(f.id));
                }}
              />
              <button type="button" className="cui-graphic-canvas__box-delete" title="Delete this text-box with its symbol and arrow" aria-label={`Delete ${describe(f)}`} onClick={() => removeFinding(f.id)}>
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" /></svg>
              </button>
            </div>
          ) : (
            <div key={f.id} className="cui-graphic-canvas__box cui-graphic-canvas__box--view" style={style}>
              {f.text || <span className="cui-graphic-canvas__empty">No text</span>}
            </div>
          );
        })}
      </div>
      {lookAhead ? (
        <div className="cui-graphic-canvas__look-ahead-anchor" aria-hidden="true">
          <div className="cui-graphic-canvas__look-ahead">More of the diagram is below</div>
        </div>
      ) : null}
      <p id={`${baseId}-desc`} className="cui-visually-hidden">
        {findings.length ? `${findings.length} annotations: ${findings.map(describe).join('; ')}.` : 'No annotations.'}
        {edit ? ' Choose a tool in the toolbar. With a symbol or comment tool, arrow keys move the pointer and Enter places it. With the pen or shading tool, Enter puts the pen down, arrow keys draw (Home, End, Page Up and Page Down diagonally), Backspace removes the last step, Enter finishes and Escape cancels. With the select tool, N and P select the next or previous finding, arrow keys move it and Delete removes it.' : ''}
      </p>
      <span className="cui-visually-hidden" aria-live="polite">{announcement}</span>
    </div>
  );
}
