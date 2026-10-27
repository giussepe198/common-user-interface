// Usage: node scripts/check-previews.mjs [filter]  -> renders every src/**/preview.html in light and dark
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import path from 'path';
const filter = process.argv[2] || '';
const DIST = process.env.AREA ? `dist-${process.env.AREA}` : 'dist';
const shots = process.env.SHOTS || `${DIST}/shots`;
fs.mkdirSync(shots, { recursive: true });
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const previews = [...walk('src'), ...(fs.existsSync('design/showcase') ? walk('design/showcase') : []).filter(f => f.endsWith('preview.html')), ...(fs.existsSync('design/Cover/preview.html')?['design/Cover/preview.html']:[])].filter(f => f.endsWith('preview.html') && f.includes(filter));
const head = ['src/styles/tokens.css', `${DIST}/bundle.css`].map(f => `<style>${fs.readFileSync(f, 'utf8')}</style>`).join('')
  + ['node_modules/react/umd/react.production.min.js', 'node_modules/react-dom/umd/react-dom.production.min.js', `${DIST}/bundle.js`].map(f => `<script>${fs.readFileSync(f, 'utf8')}</script>`).join('');
const browser = await chromium.launch();
let failed = 0;
for (const p of previews) {
  const name = path.basename(path.dirname(p));
  const src = fs.readFileSync(p, 'utf8');
  const marker = src.split('\n')[0];
  if (!/^<!-- @dsCard /.test(marker)) { console.log('NO MARKER', p); failed++; }
  const width = Number((/width=(\d+)/.exec(marker) || [])[1] || 900);
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: name === "Cover" ? 960 : width, height: 600 } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
    await page.setContent(`<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8">${head}<style>body{margin:0;padding:16px;background:var(--surface-sunken);color:var(--ink);font-family:var(--font-sans)}</style></head><body>${src}</body></html>`);
    await page.waitForTimeout(150);
    const text = await page.evaluate(() => document.body.innerText.trim().length);
    const h = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewportSize({ width, height: Math.min(Math.max(h, 100), 2000) });
    await page.screenshot({ path: `${shots}/${name}-${theme}.png`, fullPage: true });
    if (errors.length || text < 5) { failed++; console.log('FAIL', name, theme, text < 5 ? 'EMPTY' : '', errors.slice(0, 5).join(' | ')); }
    await page.close();
  }
  console.log('ok', name);
}
await browser.close();
console.log(previews.length, 'previews,', failed, 'failures');
process.exit(failed ? 1 : 0);
