import * as esbuild from 'esbuild';
import fs from 'fs';
const shim = {
  name: 'react-global',
  setup(b) {
    b.onResolve({ filter: /^react(-dom)?(\/client)?$/ }, a => ({ path: a.path, namespace: 'g' }));
    b.onLoad({ filter: /.*/, namespace: 'g' }, a => ({
      contents: a.path.startsWith('react-dom') ? 'module.exports = window.ReactDOM;' : 'module.exports = window.React;',
      loader: 'js',
    }));
  },
};
const AREA = process.env.AREA; const OUT = AREA ? `dist-${AREA}` : 'dist';
let entry = 'src/index.ts';
if (AREA) { entry = `src/.entry-${AREA}.ts`; fs.writeFileSync(entry, `export * from './core';\nexport * from './${AREA}';\n`); }
const common = { entryPoints: [entry], bundle: true, jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', target: 'es2019', logLevel: 'warning', loader: { '.css': 'css' } };
await esbuild.build({ ...common, outfile: `${OUT}/bundle.js`, format: 'iife', globalName: 'ClinicalCUI', plugins: [shim], minify: false, legalComments: 'none' });
await esbuild.build({ ...common, outdir: `${OUT}/esm`, format: 'esm', external: ['react', 'react-dom'], splitting: false });
// The design system page needs: no literal </script or <!-- in bundle.js
let js = fs.readFileSync(`${OUT}/bundle.js`, 'utf8');
js = js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '\\x3C!--');
fs.writeFileSync(`${OUT}/bundle.js`, js); if (AREA) fs.unlinkSync(entry);
console.log('built', (js.length / 1024).toFixed(0) + ' KB js,', (fs.statSync(`${OUT}/bundle.css`).size / 1024).toFixed(0) + ' KB css');
