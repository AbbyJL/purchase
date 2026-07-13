import esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/assets/index-latest.js',
  format: 'esm',
  loader: { '.tsx': 'tsx', '.ts': 'ts', '.css': 'css' },
  logLevel: 'warning',
  minify: true,
  target: ['es2020'],
  define: { 'process.env.NODE_ENV': '"production"' },
  jsx: 'automatic',
});

let html = readFileSync('dist/index.html', 'utf8');
html = html.replace(/src="\/assets\/[^"]+"/g, 'src="/assets/index-latest.js"');
html = html.replace(/href="\/assets\/[^"]+"/g, 'href="/assets/index-latest.css"');
writeFileSync('dist/index.html', html);
console.log('Build OK');
