/**
 * Hold-to-confirm timing (P4). Pure functions, no React.
 */

/**
 * Progress of a hold from 0 to 1. With reduced motion the progress moves in quarters instead of smoothly,
 * so the fill changes in a few clear steps with no animation (WCAG 2.3.3) [suggested].
 */
export function holdProgress(elapsedMs: number, durationMs: number, reducedMotion = false): number {
  if (!(durationMs > 0)) return 1;
  const p = Math.min(1, Math.max(0, elapsedMs / durationMs));
  if (!reducedMotion || p >= 1) return p;
  return Math.floor(p * 4) / 4;
}

/** "1.5 seconds", "2 seconds", "1 second". */
export function holdDurationText(durationMs: number): string {
  const s = Math.round(durationMs / 100) / 10;
  return `${s} second${s === 1 ? '' : 's'}`;
}
