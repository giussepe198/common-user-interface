import fs from 'fs'; import path from 'path';
const D = process.argv[2]; const P = path.join(D, 'project');
fs.rmSync(D, { recursive: true, force: true }); fs.mkdirSync(path.join(P, 'components'), { recursive: true });
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const order = ['Foundations','Patient identification','Dates and times','Display standards','Lists and filtering','Timeline and graphs','Handover','Medications','Drug administration','Decision support','Clinical noting','Terminology','Mobile touch inputs','Mobile screens','Mobile voice'];
const comps = walk('src').filter(f => f.endsWith('preview.html')).map(f => {
  const dir = path.dirname(f); const name = path.basename(dir);
  const group = (/group="([^"]+)"/.exec(fs.readFileSync(f, 'utf8').split('\n')[0]) || [])[1];
  return { name, dir, group };
}).sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.name.localeCompare(b.name));
for (const c of comps) {
  const out = path.join(P, 'components', c.name); fs.mkdirSync(out, { recursive: true });
  fs.copyFileSync(path.join(c.dir, 'preview.html'), path.join(out, 'preview.html'));
  fs.copyFileSync(path.join(c.dir, 'README.md'), path.join(out, 'README.md'));
}
for (const ex of fs.existsSync('design/showcase') ? fs.readdirSync('design/showcase') : []) {
  const out = path.join(P, 'components', ex); fs.mkdirSync(out, { recursive: true });
  for (const f of ['preview.html', 'README.md']) fs.copyFileSync(path.join('design/showcase', ex, f), path.join(out, f));
}
fs.mkdirSync(path.join(P, 'components', 'Cover'), { recursive: true });
fs.copyFileSync('design/Cover/preview.html', path.join(P, 'components', 'Cover', 'preview.html'));
const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: 'ClinicalCUI', components: comps.map(c => ({ name: c.name })) })} */\n`;
fs.writeFileSync(path.join(P, 'components', 'bundle.js'), header + fs.readFileSync('dist/bundle.js', 'utf8'));
fs.copyFileSync('dist/bundle.css', path.join(P, 'components', 'bundle.css'));
fs.copyFileSync('dist/index.d.ts', path.join(P, 'components', 'index.d.ts'));
fs.copyFileSync('design/tokens.json', path.join(P, 'tokens.json'));
fs.copyFileSync('src/styles/tokens.css', path.join(P, 'tokens.css'));
fs.copyFileSync('design/README.md', path.join(P, 'README.md'));
const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
fs.writeFileSync(path.join(P, 'design-system.json'), JSON.stringify({ v: 3, layout: 'files', createdOnFiles: { v: 1, at: now }, title: 'Clinical CUI', namespace: 'ClinicalCUI',
  libraries: [{ name: 'react', version: '18.3.1' }, { name: 'react-dom', version: '18.3.1' }], sections: {}, groups: [], assetGroups: {}, blobs: {}, docs: { readme: 'project/README.md', sections: [] },
  lastChange: { by: 'Gabe Rijpma', at: now, via: 'Claude (Cowork)', note: 'Worked examples (10 showcase screens) and component fixes found while composing them' } }, null, 1));
const files = walk(P).map(f => path.relative(D, f)).filter(f => f !== 'project/design-system.json');
fs.writeFileSync(path.join(D, 'files.json'), JSON.stringify(Object.fromEntries(files.map(f => [f, f]))));
console.log(comps.length, 'components,', files.length + 1, 'files');
for (const f of ['components/bundle.js']) { const s = fs.readFileSync(path.join(P, f), 'utf8'); if (/<\/script|<!--/i.test(s)) console.log('BAD', f); }
if (/<\/style/i.test(fs.readFileSync(path.join(P,'components/bundle.css'),'utf8'))) console.log('BAD css');
