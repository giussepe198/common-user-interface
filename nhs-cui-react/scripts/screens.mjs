// Renders every docs/site example page and saves screenshots to docs/screens.
// Fails on console errors or empty pages. Usage: node scripts/screens.mjs [filter] [--all-regions]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const { chromium } = createRequire(import.meta.url)('playwright');

const filter = process.argv.slice(2).find(a => !a.startsWith('--')) || '';
const allRegions = process.argv.includes('--all-regions');
const SITE = path.resolve('docs/site');
fs.mkdirSync('docs/screens', { recursive: true });
const pages = fs.readdirSync(SITE).filter(f => f.endsWith('.html') && f !== 'index.html' && f.includes(filter)).sort();
const browser = await chromium.launch();
let failed = 0;
for (const f of pages) {
  const name = f.replace(/\.html$/, '');
  const metaFile = `${SITE}/examples/${name}.json`;
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')).meta : { kind: 'desktop', regions: ['GB'] };
  const regions = allRegions ? meta.regions : [meta.regions[0]];
  for (const region of regions) {
    for (const theme of ['light', 'dark']) {
      const width = meta.kind === 'mobile' ? 1760 : 1440;
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(`file://${SITE}/${f}?chrome=0&region=${region}&theme=${theme}`);
      await page.waitForTimeout(400);
      const text = await page.evaluate(() => document.body.innerText.trim().length);
      const suffix = `${allRegions ? '-' + region.toLowerCase() : ''}${theme === 'dark' ? '-dark' : ''}`;
      await page.screenshot({ path: `docs/screens/${name}${suffix}.png`, fullPage: true });
      if (errors.length || text < 50) { failed++; console.log('FAIL', name, region, theme, text < 50 ? 'EMPTY' : '', errors.slice(0, 4).join(' | ')); }
      await page.close();
    }
  }
  console.log('ok', name);
}
await browser.close();
console.log(pages.length, 'pages,', failed, 'failures');
process.exit(failed ? 1 : 0);
