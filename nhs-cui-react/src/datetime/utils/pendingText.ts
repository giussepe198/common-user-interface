import React from 'react';

/**
 * Typed text a date or time control has not committed yet (CUI Date and Time Input commits on leaving the field or
 * Enter), kept by the control's id. A host that renders the control again in a different place at a new width (a
 * window resized, a tablet turned, a page zoomed) mounts it afresh; the new control takes the text the old one held,
 * so nothing typed is lost. Kept only for a moment after the old control goes, so a later control with the same id
 * never starts with someone else's text.
 */
const pending = new Map<string, { text: string; leftAt: number | null }>();
const KEEP_MS = 1500;

function kept(id: string): string | null {
  const p = pending.get(id);
  if (!p) return null;
  return p.leftAt !== null && Date.now() - p.leftAt > KEEP_MS ? null : p.text;
}

/**
 * The control's text state, seeded from the text a control with the same id left uncommitted a moment ago. `committed`
 * is the text of the committed value; text that differs from it is held until it is committed or the control goes.
 * The text follows the committed value only when that value changes (`resetKey`), never on mount, so text taken over
 * stays.
 */
export function usePendingText(id: string, committed: () => string, resetKey: string): [string, React.Dispatch<React.SetStateAction<string>>] {
  const [text, setText] = React.useState(() => kept(id) ?? committed());
  const committedText = committed();
  const lastKey = React.useRef(resetKey);
  React.useEffect(() => {
    if (lastKey.current === resetKey) return;
    lastKey.current = resetKey;
    setText(committedText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);
  React.useEffect(() => {
    if (text !== committedText) pending.set(id, { text, leftAt: null });
    else pending.delete(id);
  }, [id, text, committedText]);
  React.useEffect(
    () => () => {
      const p = pending.get(id);
      if (p) p.leftAt = Date.now();
    },
    [id],
  );
  return [text, setText];
}
