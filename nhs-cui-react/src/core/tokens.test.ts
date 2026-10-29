// Guards the token rules: type sizes, spacing and colours in component CSS come from tokens.
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC = path.resolve(__dirname, '..');
const walk = (d: string): string[] =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const rel = (f: string) => path.relative(SRC, f).split(path.sep).join('/');
const cssFiles = walk(SRC).filter((f) => f.endsWith('.css') && !rel(f).startsWith('styles/'));

/** Files another piece of work owns; they move to tokens with that work. Remove an entry once its file is converted. */
const PENDING: string[] = [];
const pending = (f: string) => PENDING.some((p) => rel(f).startsWith(p));

/** Pixel sizes that have a type token: caption 11, label 12, detail 13, body 14, subheading 15, touch-body 16, heading 18, patient-name 20. */
const TOKEN_SIZES = ['11px', '12px', '13px', '14px', '15px', '16px', '18px', '20px'];

describe('component CSS uses tokens', () => {
  it('has no literal font size that a type token covers', () => {
    const bad: string[] = [];
    for (const f of cssFiles.filter((x) => !pending(x))) {
      const css = fs.readFileSync(f, 'utf8');
      for (const m of css.matchAll(/font-size:\s*(\d+px)/g)) if (TOKEN_SIZES.includes(m[1])) bad.push(`${rel(f)}: ${m[0]}`);
    }
    expect(bad).toEqual([]);
  });

  it('has no literal colour except the black and white the alert symbol guidance fixes', () => {
    const bad: string[] = [];
    for (const f of cssFiles) {
      const css = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) if (!/^#(000000|ffffff)$/i.test(m[0])) bad.push(`${rel(f)}: ${m[0]}`);
      for (const m of css.matchAll(/\b(rgba?|hsla?)\(/g)) bad.push(`${rel(f)}: ${m[0]}`);
    }
    expect(bad).toEqual([]);
  });

  it('has no literal spacing on the 4, 8, 12, 16, 24, 32 scale in padding, margin or gap', () => {
    const bad: string[] = [];
    for (const f of cssFiles.filter((x) => !pending(x))) {
      const css = fs.readFileSync(f, 'utf8');
      for (const m of css.matchAll(/(?:^|[;{\s])((?:padding|margin)(?:-[a-z-]+)?|gap|row-gap|column-gap):\s*([^;}]+)/g)) {
        // calc(), max() and negative offsets are geometry, not spacing.
        const plain = m[2].replace(/(calc|max|min)\([^)]*\)/g, '');
        if (/(^|\s)(4|8|12|16|24|32)px\b/.test(plain)) bad.push(`${rel(f)}: ${m[1]}: ${m[2].trim()}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('generated tokens.css', () => {
  const tokens = fs.readFileSync(path.join(SRC, 'styles/tokens.css'), 'utf8');
  it('emits prefixed type classes only', () => {
    for (const s of ['patient-name', 'heading', 'subheading', 'body', 'body-strong', 'label', 'prompt', 'numeric', 'caption', 'detail', 'touch-body']) {
      expect(tokens).toContain(`.cui-type-${s} {`);
      expect(tokens).not.toMatch(new RegExp(`(^|\\n)\\.${s} \\{`));
    }
  });
  it('defines the early warning zone fills for light, dark and the dark colour scheme', () => {
    expect(tokens.match(/--ews-zone-red:/g)?.length).toBe(3);
  });
});

describe('no source uses the old unprefixed type classes', () => {
  it('finds none in TSX, CSS or previews', () => {
    const old = /(class(?:Name)?=["'{`][^"'`]*\b|\.)(patient-name|subheading|body-strong)\b(?!-)/;
    const bad = walk(SRC)
      .filter((f) => /\.(tsx|css|html)$/.test(f) && !rel(f).startsWith('styles/'))
      .filter((f) => fs.readFileSync(f, 'utf8').split('\n').some((l) => old.test(l.replace(/cui-[a-z-]+/g, ''))))
      .map(rel);
    expect(bad).toEqual([]);
  });
});
