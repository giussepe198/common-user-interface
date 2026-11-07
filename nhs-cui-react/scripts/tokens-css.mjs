// Generates src/styles/tokens.css from design/tokens.json.
// The dark theme also follows prefers-color-scheme unless the page sets data-theme="light";
// type styles are variables (--font-size-<style>, --line-height-<style>, --font-weight-<style>) and prefixed classes
// (.cui-type-<style>), so nothing collides with app class names; control and target sizes are tokens, with the
// standard density and coarse pointers changing them.
import fs from 'fs';
const [,, src, out, title = 'Clinical UI'] = process.argv;
const t = JSON.parse(fs.readFileSync(src));
const themes = t.color.themes.map((x) => x.id);
const first = themes[0];
const v = (tok, th) => (typeof tok.value === 'string' ? (th === first ? tok.value : null) : (tok.value[th] ?? null));
const block = (th) => {
  let s = '';
  for (const fam of ['color', 'shadow']) for (const tok of t[fam]?.tokens || []) { const x = v(tok, th); if (x) s += `  --${tok.name}: ${x};\n`; }
  return s;
};
let css = `/* ${title}: generated from tokens.json by scripts/tokens-css.mjs; do not edit. */\n`;
css += `:root, [data-theme="${first}"] {\n${block(first)}}\n`;
for (const th of themes.filter((x) => x !== first)) {
  css += `[data-theme="${th}"] {\n${block(th)}}\n`;
  if (th === 'dark') css += `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="${first}"]) {\n${block(th).replace(/^/gm, '  ').replace(/\n {2}$/, '\n')}  }\n}\n`;
}
css += `:root {\n`;
for (const fam of ['spacing', 'radius', 'control']) for (const tok of t[fam]?.tokens || []) css += `  --${tok.name}: ${tok.value};\n`;
for (const [k, s] of Object.entries(t.type.families)) css += `  --font-${k}: ${s};\n`;
for (const g of t.type.groups) for (const s of g.styles) {
  css += `  --font-size-${s.name}: ${s.fontSize};\n  --line-height-${s.name}: ${s.lineHeight};\n  --font-weight-${s.name}: ${s.fontWeight};\n`;
}
css += `}\n`;
css += `[data-density="standard"] {\n  --control-height: var(--control-height-standard);\n}\n`;
css += `@media (pointer: coarse) {\n  :root {\n    --control-height: var(--target-coarse);\n  }\n}\n`;
for (const g of t.type.groups) for (const s of g.styles) {
  const fam = s.family || g.family;
  css += `.cui-type-${s.name} { font-family: var(--font-${fam}); font-size: var(--font-size-${s.name}); line-height: var(--line-height-${s.name}); font-weight: var(--font-weight-${s.name})${s.fontStyle ? `; font-style: ${s.fontStyle}` : ''}; }\n`;
}
fs.writeFileSync(out, css);
