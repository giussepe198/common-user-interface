import fs from 'fs';
const [,, src, out, title='Clinical UI'] = process.argv;
const t = JSON.parse(fs.readFileSync(src));
const themes = t.color.themes.map(x=>x.id); const first = themes[0];
const v=(tok,th)=> typeof tok.value==='string'? (th===first?tok.value:null) : (tok.value[th] ?? null);
let css = `/* ${title} — generated from tokens.json */\n`;
for (const th of themes){
  css += th===first ? `:root, [data-theme="${th}"] {\n` : `[data-theme="${th}"] {\n`;
  for (const fam of ['color','shadow']) for (const tok of (t[fam]?.tokens||[])) { const x=v(tok,th); if(x) css+=`  --${tok.name}: ${x};\n`; }
  css += `}\n`;
}
css += `:root {\n`;
for (const fam of ['spacing','radius']) for (const tok of t[fam].tokens) css+=`  --${tok.name}: ${tok.value};\n`;
for (const [k,s] of Object.entries(t.type.families)) css+=`  --font-${k}: ${s};\n`;
css += `}\n`;
for (const g of t.type.groups) for (const s of g.styles) {
  css += `.${s.name} { font-family: var(--font-${s.family||g.family}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight}${s.fontStyle?`; font-style: ${s.fontStyle}`:''}; }\n`;
}
fs.writeFileSync(out, css);
