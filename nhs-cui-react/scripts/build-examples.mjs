// Builds the worked examples in examples/*.tsx into a static docs site (docs/site) and
// design system showcase pages (design/showcase). Run after `node scripts/build.mjs`.
// Usage: node scripts/build-examples.mjs [filter]
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const filter = process.argv[2] || '';
const SITE = 'docs/site';
const SHOW = 'design/showcase';
fs.mkdirSync(`${SITE}/assets`, { recursive: true });
fs.mkdirSync(`${SITE}/examples`, { recursive: true });
fs.mkdirSync(`${SITE}/components`, { recursive: true });
fs.mkdirSync(SHOW, { recursive: true });

// Shared assets
for (const [from, to] of [
  ['node_modules/react/umd/react.production.min.js', 'react.production.min.js'],
  ['node_modules/react-dom/umd/react-dom.production.min.js', 'react-dom.production.min.js'],
  ['dist/bundle.js', 'clinical-cui.js'],
  ['dist/bundle.css', 'clinical-cui.css'],
  ['src/styles/tokens.css', 'tokens.css'],
]) fs.copyFileSync(from, `${SITE}/assets/${to}`);

const globals = {
  name: 'globals',
  setup(b) {
    b.onResolve({ filter: /^(react|react-dom|react-dom\/client|@clinical-cui\/react)$/ }, a => ({ path: a.path, namespace: 'g' }));
    b.onLoad({ filter: /.*/, namespace: 'g' }, a => ({
      contents: a.path === '@clinical-cui/react' ? 'module.exports = window.ClinicalCUI;'
        : a.path.startsWith('react-dom') ? 'module.exports = window.ReactDOM;' : 'module.exports = window.React;',
      loader: 'js',
    }));
  },
};

const head = (title, prefix) => `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Clinical CUI</title>
<link rel="stylesheet" href="${prefix}assets/tokens.css">
<link rel="stylesheet" href="${prefix}assets/clinical-cui.css">
<style>body{margin:0;background:var(--surface-sunken);color:var(--ink);font-family:var(--font-sans)}</style>
<script src="${prefix}assets/react.production.min.js"></script>
<script src="${prefix}assets/react-dom.production.min.js"></script>
<script src="${prefix}assets/clinical-cui.js"></script>
</head>`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const files = fs.readdirSync('examples').filter(f => /^[a-z0-9-]+\.tsx$/.test(f) && f.includes(filter)).sort();
const built = [];
for (const f of files) {
  const name = f.replace(/\.tsx$/, '');
  const entry = `examples/.entry-${name}.tsx`;
  fs.writeFileSync(entry, `import React from 'react';\nimport Example, { meta } from './${name}';\n(window as any).__exampleMeta = meta;\nconst el = document.getElementById('root');\nif (el) (window as any).ReactDOM.createRoot(el).render(React.createElement(Example));\n`);
  try {
    const r = await esbuild.build({ entryPoints: [entry], bundle: true, write: false, format: 'iife', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', target: 'es2019', plugins: [globals], logLevel: 'error', minify: false });
    let js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '\\x3C!--');
    fs.writeFileSync(`${SITE}/examples/${name}.js`, js);
    // read meta by evaluating a tiny meta-only build
    const m = await esbuild.build({ stdin: { contents: `export { meta } from './${name}';`, resolveDir: 'examples', loader: 'ts' }, bundle: true, write: false, format: 'cjs', platform: 'node', jsx: 'transform', jsxFactory: 'React.createElement', plugins: [globals], logLevel: 'error' });
    const mod = { exports: {} };
    const window = { ClinicalCUI: new Proxy({}, { get: () => () => null }), React: { createElement: () => null, useState: () => [], useEffect: () => {} }, ReactDOM: {} };
    new Function('module', 'exports', 'window', 'require', m.outputFiles[0].text)(mod, mod.exports, window, () => ({}));
    const meta = mod.exports.meta;
    built.push({ name, meta, js });
    fs.writeFileSync(`${SITE}/${name}.html`, `${head(esc(meta.title), '')}
<body>
<div id="root"></div>
<script src="examples/${name}.js"></script>
</body>
</html>
`);
    // Design system showcase page: no toolbar, default region
    const camel = 'Example' + name.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('');
    const dir = `${SHOW}/${camel}`;
    fs.mkdirSync(dir, { recursive: true });
    const width = meta.kind === 'mobile' ? 1760 : 1440;
    const height = meta.kind === 'mobile' ? 940 : 1200;
    fs.writeFileSync(`${dir}/preview.html`, `<!-- @dsCard group="Examples" height=${height} width=${width} subtitle="${esc(meta.title)}" page -->
<div id="root"></div>
<script>
try { history.replaceState(null, '', '?chrome=0'); } catch (e) {}
${js}
</script>
`);
    fs.writeFileSync(`${dir}/README.md`, `# ${camel}

${meta.description}

## Components used

${meta.components.map(c => `- ${c}`).join('\n')}

## Source

\`examples/${name}.tsx\` in the package. Open \`docs/site/${name}.html\` locally to switch region (${meta.regions.join(', ')}) and theme.
`);
  } finally {
    fs.unlinkSync(entry);
  }
  console.log('built', name);
}

// Component pages: every preview.html wrapped as a standalone page
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const comps = walk('src').filter(f => f.endsWith('preview.html')).map(f => {
  const src = fs.readFileSync(f, 'utf8');
  const marker = src.split('\n')[0];
  const name = path.basename(path.dirname(f));
  const group = (/group="([^"]+)"/.exec(marker) || [])[1] || 'Other';
  const subtitle = (/subtitle="([^"]+)"/.exec(marker) || [])[1] || '';
  const width = Number((/width=(\d+)/.exec(marker) || [])[1] || 900);
  fs.writeFileSync(`${SITE}/components/${name}.html`, `${head(name, '../')}
<body>
<div class="cui-root" style="padding:16px 24px;max-width:${Math.max(width, 390) + 48}px">
<p style="margin:0 0 4px;font-size:12px"><a href="../index.html" style="color:var(--accent)">Clinical CUI</a> · ${esc(group)}</p>
<h1 style="margin:0 0 4px;font-size:20px">${name}</h1>
<p style="margin:0 0 16px;font-size:14px;color:var(--ink-muted)">${esc(subtitle)} · Guidelines: <code>${path.dirname(f)}/README.md</code></p>
</div>
<div style="padding:0 24px 24px">
${src.split('\n').slice(1).join('\n')}
</div>
</body>
</html>
`);
  return { name, group };
});

// Index page
const all = fs.readdirSync(SITE).filter(f => /\.html$/.test(f) && f !== 'index.html').map(f => f.replace(/\.html$/, ''));
const metas = [];
for (const name of all) {
  const b = built.find(x => x.name === name);
  if (b) metas.push(b);
  else if (fs.existsSync(`${SITE}/examples/${name}.json`)) metas.push(JSON.parse(fs.readFileSync(`${SITE}/examples/${name}.json`, 'utf8')));
}
for (const b of built) fs.writeFileSync(`${SITE}/examples/${b.name}.json`, JSON.stringify({ name: b.name, meta: b.meta }));
const groups = {};
for (const c of comps) (groups[c.group] ||= []).push(c.name);
const card = ({ name, meta }) => `<a class="card" href="${name}.html"><img src="../screens/${name}.png" alt="" loading="lazy"><span class="t">${esc(meta.title)}</span><span class="d">${esc(meta.description)}</span><span class="r">${meta.regions.join(' · ')}</span></a>`;
fs.writeFileSync(`${SITE}/index.html`, `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Clinical CUI examples</title>
<link rel="stylesheet" href="assets/tokens.css">
<style>
body{margin:0;background:var(--surface-sunken);color:var(--ink);font-family:var(--font-sans)}
main{max-width:1400px;margin:0 auto;padding:24px}
h1{font-size:28px;margin:0 0 6px} h2{font-size:18px;margin:32px 0 12px} h3{font-size:14px;margin:16px 0 6px;color:var(--ink-muted)}
p{max-width:900px;color:var(--ink-muted);line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr));gap:16px}
.card{display:flex;flex-direction:column;gap:6px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;color:var(--ink);text-decoration:none}
.card:hover{background:var(--hover)} .card img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top left;border:1px solid var(--border);background:var(--surface-muted)}
.t{font-weight:600}.d{font-size:13px;color:var(--ink-muted);line-height:1.4}.r{font-size:12px;color:var(--ink-muted)}
ul{columns:4 220px;padding-left:18px;margin:0} li{font-size:14px;line-height:1.7} a{color:var(--accent)}
</style>
</head>
<body>
<main>
<h1>Clinical CUI examples</h1>
<p>Worked screens built only from the library's components, to show how they fit together. Each page has a region switch (UK, Australia, New Zealand) and a light and dark theme. The source for every example is in <code>examples/</code>; read it next to the rendered page. Patients and data are fictional.</p>
<h2>Desktop screens</h2>
<div class="grid">${metas.filter(m => m.meta.kind === 'desktop').map(card).join('')}</div>
<h2>Mobile flows</h2>
<div class="grid">${metas.filter(m => m.meta.kind === 'mobile').map(card).join('')}</div>
<h2>Every component on its own</h2>
${Object.entries(groups).sort().map(([g, n]) => `<h3>${esc(g)}</h3><ul>${n.sort().map(x => `<li><a href="components/${x}.html">${x}</a></li>`).join('')}</ul>`).join('\n')}
</main>
</body>
</html>
`);
console.log(built.length, 'examples,', comps.length, 'component pages');
