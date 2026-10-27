/**
 * Ranking of candidate expressions against typed text, following the illustrative parsing
 * algorithm in Terminology Post Coordination 2007, Appendix B step 4: efficiency, then matching
 * scope, then proximity, then order. Each input word is used at most once per expression.
 */
import { SEARCH_STOP_WORDS, searchWords } from './searchText';

export interface ExpressionCandidate {
  /** Words of the candidate expression (base concept plus attribute labels). */
  label: string;
}

export interface RankedExpression<T> {
  candidate: T;
  /** Share of the expression's words accounted for by input words (0 to 1). */
  efficiency: number;
  /** Share of input words (stop words excluded) accounted for by the expression (0 to 1). */
  scope: number;
  /** 1 when the matched input words are adjacent, lower as they spread out. */
  proximity: number;
  /** Share of matched word pairs that keep the expression's word order. */
  order: number;
  /** True when every input word (stop words excluded) is used: the parser can stop here. */
  coversAllInput: boolean;
  /** Positions of input words used, in input order. */
  usedInputIndexes: number[];
}

const EPS = 1e-9;

/** Rank candidates, best first. Candidates with no matching word are omitted. */
export function rankExpressions<T extends ExpressionCandidate>(
  input: string,
  candidates: readonly T[],
  options: { stopWords?: readonly string[] } = {},
): RankedExpression<T>[] {
  const stop = options.stopWords ?? SEARCH_STOP_WORDS;
  const inputWords = searchWords(input);
  const inputIdx = inputWords.map((w, i) => ({ w, i })).filter((x) => !stop.includes(x.w));
  const ranked = candidates.map((candidate, ci) => {
    const exprWords = searchWords(candidate.label).filter((w) => !stop.includes(w));
    const used = new Set<number>();
    const pairs: Array<{ exprPos: number; inputPos: number }> = [];
    exprWords.forEach((ew, exprPos) => {
      const hit = inputIdx.find((x) => !used.has(x.i) && (ew.startsWith(x.w) || (x.w.length >= 4 && x.w.startsWith(ew))));
      if (hit) {
        used.add(hit.i);
        pairs.push({ exprPos, inputPos: hit.i });
      }
    });
    const n = pairs.length;
    const positions = pairs.map((p) => p.inputPos).sort((a, b) => a - b);
    const span = n > 1 ? positions[n - 1] - positions[0] : 0;
    let inOrder = 0;
    for (let k = 1; k < n; k++) if (pairs[k].inputPos > pairs[k - 1].inputPos) inOrder++;
    return {
      ci,
      r: {
        candidate,
        efficiency: exprWords.length ? n / exprWords.length : 0,
        scope: inputIdx.length ? n / inputIdx.length : 0,
        proximity: n > 1 ? (n - 1) / span : 1,
        order: n > 1 ? inOrder / (n - 1) : 1,
        coversAllInput: inputIdx.length > 0 && n === inputIdx.length,
        usedInputIndexes: positions,
      } as RankedExpression<T>,
      n,
    };
  });
  return ranked
    .filter((x) => x.n > 0)
    .sort((a, b) => {
      for (const k of ['efficiency', 'scope', 'proximity', 'order'] as const) {
        const d = b.r[k] - a.r[k];
        if (Math.abs(d) > EPS) return d;
      }
      return a.ci - b.ci;
    })
    .map((x) => x.r);
}
