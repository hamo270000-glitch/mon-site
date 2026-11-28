// Petit serveur local qui imite Vercel (pages sans .html + fonction /api/commande).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import handler from '../api/commande.js';
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const port = Number(process.env.PORT || 4190);
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/commande') {
    let brut = ''; for await (const c of req) brut += c;
    req.body = /json/.test(req.headers['content-type'] || '') ? JSON.parse(brut || '{}') : Object.fromEntries(new URLSearchParams(brut));
    return handler(req, res);
  }
  const essais = url.pathname === '/' ? ['index.html'] : [url.pathname.slice(1), url.pathname.slice(1) + '.html'];
  for (const e of essais) {
    try { const f = join('dist', e); if ((await stat(f)).isFile()) { res.setHeader('Content-Type', TYPES[extname(f)] || 'application/octet-stream'); return res.end(await readFile(f)); } } catch {}
  }
  res.statusCode = 404; res.setHeader('Content-Type', TYPES['.html']); res.end(await readFile('dist/404.html'));
}).listen(port, () => console.log('http://localhost:' + port));
