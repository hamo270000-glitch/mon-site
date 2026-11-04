#!/usr/bin/env node
// Générateur des illustrations de plats d'Affûté (img/plats/<id>.svg).
// Vue du dessus (« flat lay »), fond transparent, lumière en haut à gauche.
// Sans dépendance : node affute/tools/plats.mjs [id ...]
//
// Organisation :
//   1. outils (aléatoire déterministe, chemins lissés, contexte SVG par fichier)
//   2. contenants (assiette, bol, verre, planche)
//   3. bibliothèque d'ingrédients (une fonction de dessin par ingrédient)
//   4. compositions : une fonction par recette, positions définies à la main
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'img', 'plats');
const TAU = Math.PI * 2, RAD = Math.PI / 180;

/* ───────────────────────── 1. Outils ───────────────────────── */
const f = (v) => Math.round(v * 10) / 10;
const f2 = (v) => Math.round(v * 100) / 100;
const P = (x, y) => `${f(x)} ${f(y)}`;
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const stp = ([o, col, a]) => `<stop offset="${o}" stop-color="${col}"${a != null && a !== 1 ? ` stop-opacity="${a}"` : ''}/>`;
const attrs = (o) => Object.entries(o).filter(([, v]) => v != null).map(([k, v]) => ` ${k}="${v}"`).join('');
const rotp = (x, y, deg) => { const a = deg * RAD, co = Math.cos(a), si = Math.sin(a); return [x * co - y * si, x * si + y * co]; };

class Ctx {
  constructor(id) { this.p = id; this.defs = []; this.keys = new Set(); this.r = mulberry32(hash(id)); this.k = 0; }
  id(k) { return `${this.p}-${k}`; }
  rnd(a = 0, b = 1) { return a + (b - a) * this.r(); }
  pick(a) { return a[Math.floor(this.r() * a.length)]; }
  def(k, fn) { if (!this.keys.has(k)) { this.keys.add(k); this.defs.push(fn(this.id(k))); } return this.id(k); }
  ref(k) { return `url(#${this.id(k)})`; }
  // dégradé radial éclairé en haut à gauche (coordonnées de la boîte englobante)
  rg(k, stops, o = {}) {
    this.def(k, (id) => `<radialGradient id="${id}"${attrs({ cx: o.cx ?? 0.45, cy: o.cy ?? 0.42, r: o.r ?? 0.62, fx: o.fx ?? 0.32, fy: o.fy ?? 0.28 })}>${stops.map(stp).join('')}</radialGradient>`);
    return this.ref(k);
  }
  // dégradé radial centré (sans foyer décalé)
  rc(k, stops, o = {}) {
    this.def(k, (id) => `<radialGradient id="${id}"${attrs({ cx: o.cx ?? 0.5, cy: o.cy ?? 0.5, r: o.r ?? 0.5 })}>${stops.map(stp).join('')}</radialGradient>`);
    return this.ref(k);
  }
  lg(k, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
    this.def(k, (id) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(stp).join('')}</linearGradient>`);
    return this.ref(k);
  }
  blur(sd) {
    const k = 'b' + String(sd).replace('.', '_');
    this.def(k, (id) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
    return this.ref(k);
  }
  // ombre portée douce vers le bas à droite (lumière en haut à gauche)
  ds(level = 1) {
    const [dx, dy, sd, op] = { 1: [2.2, 3.2, 2.4, 0.34], 2: [1, 1.5, 0.9, 0.32], 3: [3.5, 5, 4.5, 0.3] }[level];
    this.def('ds' + level, (id) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${sd}" flood-color="#3b2412" flood-opacity="${op}"/></filter>`);
    return this.ref('ds' + level);
  }
  pat(k, w, h, content) { this.def(k, (id) => `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${content}</pattern>`); return this.ref(k); }
  clip(content) { const id = this.id('c' + this.k++); this.defs.push(`<clipPath id="${id}">${content}</clipPath>`); return `url(#${id})`; }
  sym(k, fn) { if (!this.keys.has(k)) { this.keys.add(k); const body = fn(); this.defs.push(`<g id="${this.id(k)}">${body}</g>`); } return '#' + this.id(k); }
}

const tr = (x, y, rot = 0, s = 1) => ` transform="translate(${f(x)} ${f(y)})${rot ? ` rotate(${f(rot)})` : ''}${s !== 1 ? ` scale(${f2(s)})` : ''}"`;
const use = (href, x, y, rot = 0, s = 1, extra = '') => `<use href="${href}"${tr(x, y, rot, s)}${extra}/>`;
const G = (inner, a = '') => `<g${a}>${inner}</g>`;
const fl = (c, l = 1) => ` filter="${c.ds(l)}"`;

function smoothPath(pts, closed = true) {
  const n = pts.length;
  const get = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${P(...pts[0])}`;
  const lim = closed ? n : n - 1;
  for (let i = 0; i < lim; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    d += `C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`;
  }
  return d + (closed ? 'Z' : '');
}
function blob(c, cx, cy, rx, ry = rx, irr = 0.12, n = 9, rot = 0) {
  const pts = [], a0 = c.rnd(0, TAU);
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * TAU + c.rnd(-0.25, 0.25) / n * 4, k = 1 + c.rnd(-irr, irr);
    const [x, y] = rotp(Math.cos(a) * rx * k, Math.sin(a) * ry * k, rot);
    pts.push([cx + x, cy + y]);
  }
  return smoothPath(pts);
}
// zones de placement
const ell = (cx, cy, rx, ry = rx) => (c) => { const a = c.rnd(0, TAU), r = Math.sqrt(c.r()); return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]; };
const sect = (a0, a1, r0, r1, cx = 200, cy = 200) => (c) => { const a = c.rnd(a0, a1) * RAD, r = Math.sqrt(c.rnd((r0 * r0) / (r1 * r1), 1)) * r1; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
function scatter(c, n, area, minD = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    let best = null, bestD = -1;
    for (let t = 0; t < 40; t++) {
      const p = area(c);
      const d = pts.length ? Math.min(...pts.map((q) => Math.hypot(q[0] - p[0], q[1] - p[1]))) : 1e9;
      if (d >= minD) { best = p; break; }
      if (d > bestD) { bestD = d; best = p; }
    }
    pts.push(best);
  }
  return pts;
}
const byDepth = (pts) => pts.slice().sort((a, b) => b[0] + b[1] - (a[0] + a[1]));
const arcPts = (x0, y0, x1, y1, bend, n) => Array.from({ length: n }, (_, i) => {
  const t = n === 1 ? 0.5 : i / (n - 1), mx = (x0 + x1) / 2, my = (y0 + y1) / 2, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny);
  const k = 4 * t * (1 - t) * bend;
  return [x0 + (x1 - x0) * t + (nx / L) * k, y0 + (y1 - y0) * t + (ny / L) * k];
});

// motif répété sans couture
function tilePat(c, k, w, base, n, item) {
  if (c.keys.has(k)) return c.ref(k);
  let s = base ? `<rect width="${w}" height="${w}" fill="${base}"/>` : '';
  for (let i = 0; i < n; i++) {
    const it = item(i), x = c.rnd(0, w), y = c.rnd(0, w), m = it.m ?? 5;
    for (const dx of [-w, 0, w]) for (const dy of [-w, 0, w]) {
      const X = x + dx, Y = y + dy;
      if (X > -m && X < w + m && Y > -m && Y < w + m) s += it.s(X, Y);
    }
  }
  return c.pat(k, w, w, s);
}
// voile de volume (reflet en haut à gauche, ombre en bas à droite) posé sur une forme
const volume = (c, d, op = 1) => `<path d="${d}" fill="${c.rg('vol', [[0, '#fff', 0.55], [0.32, '#fff', 0], [0.7, '#000', 0], [1, '#2a1806', 0.3]], { cx: 0.5, cy: 0.5, r: 0.56, fx: 0.32, fy: 0.27 })}"${op !== 1 ? ` opacity="${op}"` : ''}/>`;
const reflet = (c, x, y, rx, ry, rot = -35, op = 0.7, b = 1.2) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${rot} ${f(x)} ${f(y)})" fill="#fff" opacity="${op}"${b ? ` filter="${c.blur(b)}"` : ''}/>`;
const tache = (c, x, y, rx, ry, col, op, b = 2) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${col}" opacity="${op}" filter="${c.blur(b)}"/>`;

/* ───────────────────────── 2. Contenants ───────────────────────── */
const reflArc = (c, r, a0, a1, w, op) => {
  const p0 = [200 + Math.cos(a0 * RAD) * r, 200 + Math.sin(a0 * RAD) * r], p1 = [200 + Math.cos(a1 * RAD) * r, 200 + Math.sin(a1 * RAD) * r];
  return `<path d="M${P(...p0)}A${r} ${r} 0 0 1 ${P(...p1)}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity="${op}" filter="${c.blur(1.5)}"/>`;
};
function assiette(c, contenu) {
  return `<circle cx="211" cy="216" r="166" fill="#2b1d12" opacity=".2" filter="${c.blur(9)}"/>` +
    `<circle cx="203" cy="206" r="169" fill="#2b1d12" opacity=".15" filter="${c.blur(2.5)}"/>` +
    `<circle cx="200" cy="200" r="170" fill="${c.lg('as', [[0, '#ffffff'], [0.55, '#f6f6f8'], [1, '#e0e0e6']], 0.15, 0.1, 0.85, 0.95)}"/>` +
    `<circle cx="200" cy="200" r="168.8" fill="none" stroke="${c.lg('asb', [[0, '#ffffff'], [1, '#c4c4cd']], 0.2, 0.15, 0.8, 0.9)}" stroke-width="2.2"/>` +
    `<circle cx="200" cy="200" r="132" fill="${c.lg('asw', [[0, '#d3d3db'], [0.5, '#ececf0'], [1, '#ffffff']], 0.2, 0.15, 0.8, 0.9)}"/>` +
    `<circle cx="201" cy="201" r="126" fill="${c.rc('asf', [[0, '#ffffff'], [1, '#f1f1f5']], { cx: 0.45, cy: 0.42, r: 0.6 })}"/>` +
    reflArc(c, 152, 198, 252, 5, 0.95) + zoomG(contenu, 1.1);
}
const zoomG = (s, k) => `<g transform="matrix(${k} 0 0 ${k} ${f(200 - 200 * k)} ${f(200 - 200 * k)})">${s}</g>`;
function bol(c, contenu, apres = '') {
  return `<circle cx="214" cy="221" r="164" fill="#2b1d12" opacity=".24" filter="${c.blur(11)}"/>` +
    `<circle cx="203" cy="206" r="169" fill="#2b1d12" opacity=".16" filter="${c.blur(2.5)}"/>` +
    `<circle cx="200" cy="200" r="170" fill="${c.lg('bo', [[0, '#ffffff'], [0.55, '#f5f5f8'], [1, '#dcdce3']], 0.15, 0.1, 0.85, 0.95)}"/>` +
    `<circle cx="200" cy="200" r="168.8" fill="none" stroke="${c.lg('asb', [[0, '#ffffff'], [1, '#c4c4cd']], 0.2, 0.15, 0.8, 0.9)}" stroke-width="2.2"/>` +
    `<circle cx="200" cy="200" r="162" fill="${c.lg('bw', [[0, '#c9c9d3'], [0.45, '#e8e8ee'], [1, '#ffffff']], 0.2, 0.15, 0.8, 0.9)}"/>` +
    `<g clip-path="${c.clip('<circle cx="200" cy="200" r="150"/>')}">${contenu}</g>` +
    `<circle cx="200" cy="200" r="150.5" fill="${c.rc('bsh', [[0.7, '#000', 0], [0.93, '#1a1208', 0.18], [1, '#1a1208', 0.4]], { cx: 0.56, cy: 0.58, r: 0.6 })}"/>` +
    reflArc(c, 165.5, 200, 250, 3.2, 0.95) + apres;
}
function verre(c, liquide, teinte, apres = '') {
  return `<circle cx="212" cy="218" r="160" fill="${teinte}" opacity=".22" filter="${c.blur(11)}"/>` +
    `<circle cx="203" cy="206" r="165" fill="#2b1d12" opacity=".1" filter="${c.blur(3)}"/>` +
    `<circle cx="200" cy="200" r="166" fill="#eef3f6" opacity=".55"/>` +
    `<g clip-path="${c.clip('<circle cx="200" cy="200" r="154"/>')}">${liquide}</g>` +
    `<circle cx="200" cy="200" r="154" fill="${c.rc('vin', [[0.8, '#fff', 0], [0.96, '#fff', 0.18], [1, '#fff', 0.45]], { cx: 0.47, cy: 0.46, r: 0.53 })}"/>` +
    `<circle cx="200" cy="200" r="160" fill="none" stroke="${c.lg('vr', [[0, '#ffffff'], [0.5, '#dfe7ec'], [1, '#aab6c0']], 0.15, 0.1, 0.85, 0.95)}" stroke-width="12"/>` +
    `<circle cx="200" cy="200" r="165.5" fill="none" stroke="#9aa6b0" stroke-width="1" opacity=".6"/>` +
    `<circle cx="200" cy="200" r="154.3" fill="none" stroke="#8d99a3" stroke-width=".8" opacity=".5"/>` +
    reflArc(c, 160, 195, 255, 4, 1) + reflArc(c, 160, 20, 45, 2.5, 0.7) + apres;
}
function planche(c, contenu) {
  let grain = '';
  for (let y = 58; y < 352; y += c.rnd(9, 17)) {
    const w = c.rnd(0.5, 1.5);
    grain += `<path d="M20 ${f(y)}C110 ${f(y + c.rnd(-7, 7))} 250 ${f(y + c.rnd(-7, 7))} 380 ${f(y + c.rnd(-5, 5))}" stroke="${c.r() < 0.75 ? '#a8733a' : '#f6dcae'}" stroke-width="${f(w)}" opacity="${f(c.rnd(0.2, 0.45))}" fill="none"/>`;
  }
  grain += `<ellipse cx="300" cy="300" rx="16" ry="5" fill="none" stroke="#a8733a" opacity=".35"/><ellipse cx="300" cy="300" rx="9" ry="2.5" fill="#b07c42" opacity=".35"/>`;
  return `<rect x="38" y="64" width="344" height="300" rx="26" fill="#2b1d12" opacity=".22" filter="${c.blur(10)}"/>` +
    `<rect x="31" y="55" width="344" height="300" rx="26" fill="#9c6a35"/>` +
    `<rect x="28" y="50" width="344" height="300" rx="26" fill="${c.lg('wd', [[0, '#f0cf9f'], [0.5, '#dfb47b'], [1, '#c8955a']], 0, 0, 1, 1)}"/>` +
    `<g clip-path="${c.clip('<rect x="28" y="50" width="344" height="300" rx="26"/>')}">${grain}<ellipse cx="120" cy="110" rx="140" ry="70" fill="#fff" opacity=".14" filter="${c.blur(18)}"/></g>` +
    `<rect x="29.2" y="51.2" width="341.6" height="297.6" rx="25" fill="none" stroke="${c.lg('wdb', [[0, '#fbe6c2'], [1, '#97642e']], 0, 0, 1, 1)}" stroke-width="2.4"/>` + zoomG(contenu, 1.07);
}

/* ───────────────────────── 3. Ingrédients ───────────────────────── */
const GRAINS_RIZ = ['#fffdf6', '#f9f3e6', '#f1e8d4', '#ffffff', '#f6eedc'];
function rizPat(c, k = 'rizp', base = '#efe6d2', cols = GRAINS_RIZ, st = '#d2c3a2') {
  const gid = '#' + c.def('grain', (id) => `<ellipse id="${id}" rx="4.4" ry="1.8"/>`);
  return tilePat(c, k, 38, base, 36, () => {
    const a = c.rnd(0, 180), col = c.pick(cols);
    return { m: 6, s: (x, y) => use(gid, x, y, a, 1, ` fill="${col}" stroke="${st}" stroke-width=".45"`) };
  });
}
function grainsLibres(c, cx, cy, rx, ry, n, cols = GRAINS_RIZ, st = '#d2c3a2') {
  const gid = '#' + c.def('grain', (id) => `<ellipse id="${id}" rx="4.4" ry="1.8"/>`);
  let s = `<g stroke="${st}" stroke-width=".45">`;
  for (let i = 0; i < n; i++) {
    const a = c.rnd(0, TAU), k = c.r() < 0.65 ? c.rnd(0.86, 1.05) : c.rnd(0, 0.85);
    s += use(gid, cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k, c.rnd(0, 180), 1, ` fill="${c.pick(cols)}"`);
  }
  return s + '</g>';
}
function riz(c, cx, cy, rx, ry = rx, rot = 0) {
  const d = blob(c, cx, cy, rx, ry, 0.07, 11, rot);
  return G(`<path d="${d}" fill="${rizPat(c)}"/>${grainsLibres(c, cx, cy, rx, ry, Math.round((rx + ry) * 0.5))}${volume(c, d, 0.85)}`, fl(c));
}
function rizFond(c, k = 'rizp', base, cols, st) {
  return `<circle cx="200" cy="200" r="152" fill="${rizPat(c, k, base, cols, st)}"/>` + grainsLibres(c, 200, 200, 140, 140, 60, cols, st);
}
const QUINOA = ['#f2e3bf', '#e9d4a3', '#dcc28a', '#f8efd8', '#e5cd98', '#f4e6c6'];
function quinoaPat(c) {
  return tilePat(c, 'quip', 46, '#dcc594', 150, () => {
    const col = c.r() < 0.06 ? c.pick(['#8e3f2c', '#4a3426']) : c.pick(QUINOA), r = c.rnd(1.8, 2.4);
    return { m: 3, s: (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${col}" stroke="#c4a66b" stroke-width=".45"/>` };
  });
}
function quinoaLibres(c, area, n) {
  let s = '<g stroke="#c4a66b" stroke-width=".45">';
  for (const [x, y] of scatter(c, n, area)) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(c.rnd(1.9, 2.4))}" fill="${c.r() < 0.07 ? '#8e3f2c' : c.pick(QUINOA)}"/>`;
  return s + '</g>';
}
function quinoa(c, cx, cy, rx, ry = rx) {
  const d = blob(c, cx, cy, rx, ry, 0.07, 11);
  return G(`<path d="${d}" fill="${quinoaPat(c)}"/>${quinoaLibres(c, (cc) => { const a = cc.rnd(0, TAU), k = cc.rnd(0.85, 1.06); return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; }, Math.round(rx + ry))}${volume(c, d, 0.8)}`, fl(c));
}
const quinoaFond = (c) => `<circle cx="200" cy="200" r="152" fill="${quinoaPat(c)}"/>`;

function brocoliSym(c, v) {
  return c.sym('broc' + v, () => {
    const top = c.rg('brt', [[0, '#93cc4a'], [0.5, '#4f8f26'], [1, '#24511a']], { r: 0.66 });
    const bud = tilePat(c, 'budp', 10, null, 9, () => {
      const r = c.rnd(0.9, 1.9), col = c.pick(['#a9d863', '#2c5a16', '#86c043', '#1d4410', '#bfe57a', '#3d7020']);
      return { m: 2, s: (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${col}" opacity=".85"/>` };
    });
    let s = `<path d="M-7 6L-7.5 27Q0 31 7.5 27L7 6Z" fill="${c.lg('brs', [[0, '#e6f0bc'], [0.6, '#b8d47a'], [1, '#8bb04e']], 0, 0, 1, 0)}"/><path d="M-3 12L-3 26" stroke="#f4f8dc" stroke-width="1.5" opacity=".6"/>`;
    const bumps = [];
    const outer = 6 + (v % 2);
    for (let i = 0; i < outer; i++) { const a = (i / outer) * TAU + c.rnd(-0.2, 0.2) + v; bumps.push([Math.cos(a) * 15, Math.sin(a) * 13 - 4, c.rnd(9.5, 12)]); }
    bumps.push([c.rnd(-3, 3), -5, 13]);
    bumps.sort((a, b) => b[0] + b[1] - (a[0] + a[1]));
    for (const [x, y, r] of bumps) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${top}" stroke="#1d3f10" stroke-width=".7"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${bud}"/>`;
    s += `<ellipse cx="-8" cy="-14" rx="9" ry="5" fill="#d8f29a" opacity=".35" filter="${c.blur(2)}"/>`;
    return s;
  });
}
const brocoli = (c, x, y, s = 1, rot = 0, v = 0) => use(brocoliSym(c, v % 3), x, y, rot, s, fl(c));

// filets de poisson
function filetPath(w, h) {
  const a = w / 2, b = h / 2;
  return `M${P(-a, -b * 0.75)}C${P(-a * 0.5, -b * 1.15)} ${P(a * 0.45, -b * 1.05)} ${P(a, -b * 0.55)}C${P(a * 1.12, -b * 0.1)} ${P(a * 1.08, b * 0.45)} ${P(a * 0.88, b * 0.7)}C${P(a * 0.4, b * 1.08)} ${P(-a * 0.5, b * 1.12)} ${P(-a * 0.95, b * 0.78)}C${P(-a * 1.12, b * 0.4)} ${P(-a * 1.12, -b * 0.4)} ${P(-a, -b * 0.75)}Z`;
}
function saumon(c, x, y, { w = 140, h = 80, rot = 0 } = {}) {
  const d = filetPath(w, h), cl = c.clip(`<path d="${d}"/>`);
  let lignes = '';
  for (let i = 1; i < 8; i++) {
    const X = -w / 2 + (i * w) / 8 + c.rnd(-3, 3);
    const dd = `M${P(X - 8, -h * 0.6)}Q${P(X + 12, 0)} ${P(X - 6, h * 0.6)}`;
    lignes += `<path d="${dd}" stroke="#ffe3d2" stroke-width="3.2" opacity=".8"/><path d="${dd}" stroke="#fff" stroke-width="1.1" opacity=".55" transform="translate(-1 -1)"/>`;
  }
  let croute = '';
  for (let i = 0; i < 6; i++) croute += tache(c, c.rnd(-w * 0.4, w * 0.4), c.rnd(-h * 0.35, h * 0.35), c.rnd(8, 16), c.rnd(5, 9), '#b5491f', c.rnd(0.25, 0.45), 3);
  const inner = `<path d="${d}" fill="#5d6368" transform="translate(3 4)"/>` +
    `<path d="${d}" fill="${c.lg('sal', [[0, '#ffa877'], [0.5, '#f47c4c'], [1, '#d65a30']], 0, 0, 0.6, 1)}"/>` +
    `<g clip-path="${cl}" fill="none">${lignes}${croute}<path d="${d}" fill="${c.rc('salb', [[0.62, '#7a2a10', 0], [1, '#7a2a10', 0.55]], { r: 0.55 })}"/></g>` +
    volume(c, d, 0.9) + reflet(c, -w * 0.22, -h * 0.25, w * 0.18, h * 0.08, -12, 0.55, 2);
  return `<g${tr(x, y, rot)}><g${fl(c)}>${inner}</g>${poivre(c, 0, 0, w * 0.35, h * 0.3, 14)}</g>`;
}
function cabillaud(c, x, y, { w = 130, h = 70, rot = 0, pane = false } = {}) {
  const d = filetPath(w, h), cl = c.clip(`<path d="${d}"/>`);
  let s = '';
  if (pane) {
    const pan = tilePat(c, 'panp', 16, null, 14, () => {
      const r = c.rnd(0.6, 1.6), col = c.pick(['#f7d08a', '#a25c18', '#e9b45a', '#8a4a12', '#fbe2a8']);
      return { m: 2, s: (X, Y) => `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(r)}" fill="${col}" opacity=".8"/>` };
    });
    s = `<path d="${d}" fill="${c.rg('pan', [[0, '#f6c068'], [0.55, '#d98d32'], [1, '#a5601c']])}"/><path d="${d}" fill="${pan}"/>` + volume(c, d, 0.8) + reflet(c, -w * 0.2, -h * 0.25, w * 0.16, h * 0.07, -10, 0.4, 2);
  } else {
    let fl2 = '';
    for (let i = 1; i < 7; i++) { const X = -w / 2 + (i * w) / 7; fl2 += `<path d="M${P(X - 4, -h * 0.55)}Q${P(X + 9, 0)} ${P(X - 3, h * 0.55)}" stroke="#e4d4b8" stroke-width="2" fill="none" opacity=".9"/>`; }
    let dore = '';
    for (let i = 0; i < 5; i++) dore += tache(c, c.rnd(-w * 0.35, w * 0.35), c.rnd(-h * 0.3, h * 0.3), c.rnd(10, 20), c.rnd(6, 10), '#e2a24e', c.rnd(0.35, 0.55), 4);
    s = `<path d="${d}" fill="${c.rg('cab', [[0, '#ffffff'], [0.6, '#f7efe0'], [1, '#e2d3b6']])}"/><g clip-path="${cl}">${dore}${fl2}<path d="${d}" fill="${c.rc('cabb', [[0.6, '#b8742a', 0], [1, '#b8742a', 0.5]], { r: 0.55 })}"/></g>` + volume(c, d, 0.7) + reflet(c, -w * 0.2, -h * 0.25, w * 0.16, h * 0.07, -10, 0.6, 2);
  }
  return `<g${tr(x, y, rot)}><g${fl(c)}>${s}</g></g>`;
}

// volailles
function poulet(c, x, y, { len = 130, h = 50, n = 6, rot = 0 } = {}) {
  const sw = len / n;
  let tranches = '', faces = '', shapes = '';
  for (let i = 0; i < n; i++) {
    const hi = h * (0.45 + 0.55 * Math.sqrt(Math.sin((Math.PI * (i + 0.5)) / n))) * c.rnd(0.96, 1.03);
    const X = -len / 2 + i * sw + i * 1.6, Y = -hi / 2 + c.rnd(-1.5, 1.5), rr = i === 0 || i === n - 1 ? 9 : 5;
    faces += `<rect x="${f(X + 3.2)}" y="${f(Y + 0.5)}" width="${f(sw)}" height="${f(hi)}" rx="${rr}" fill="#f8ecd6" stroke="#e0c49a" stroke-width=".8"/>`;
    const r = `<rect x="${f(X)}" y="${f(Y)}" width="${f(sw - 0.5)}" height="${f(hi)}" rx="${rr}"/>`;
    shapes += r;
    tranches += r.replace('/>', ` fill="${c.lg('chk', [[0, '#f9d495'], [0.5, '#e6aa5c'], [1, '#bb7832']], 0, 0, 0.3, 1)}"/>`);
  }
  const cl = c.clip(shapes);
  let marques = '';
  for (let k = -len; k < len; k += 21) marques += `<path d="M${f(k)} ${f(-h)}l${f(h * 0.9)} ${f(h * 2)}"/>`;
  const L = len + 3 * n;
  const inner = faces + tranches + `<g clip-path="${cl}"><g stroke="#7a3f14" stroke-width="9" opacity=".22" fill="none">${marques}</g><g stroke="#4a230c" stroke-width="3.6" stroke-linecap="round" opacity=".72" fill="none" filter="${c.blur(0.7)}">${marques}</g>` +
    `<rect x="${f(-L / 2)}" y="${f(-h / 2 - 4)}" width="${f(L)}" height="${f(h + 8)}" fill="${c.lg('chv', [[0, '#fff', 0.35], [0.4, '#fff', 0], [1, '#3a1a06', 0.25]])}"/></g>`;
  return `<g${tr(x, y, rot)}><g${fl(c)}>${inner}</g>${reflet(c, -len * 0.2, -h * 0.25, len * 0.12, 2.2, 0, 0.5, 0.8)}${reflet(c, len * 0.15, -h * 0.28, len * 0.08, 1.8, 0, 0.45, 0.8)}</g>`;
}
function dinde(c, x, y, { n = 5, rot = 0, s = 1 } = {}) {
  const id = c.sym('dinde', () => {
    const d = 'M-40 -6C-36 -26 30 -28 40 -8C44 8 26 24 0 24C-28 24 -44 12 -40 -6Z';
    return `<path d="${d}" fill="${c.rg('din', [[0, '#fcf3e4'], [0.6, '#f3dfbf'], [0.86, '#e4be88'], [1, '#c08846']], { r: 0.6 })}" stroke="#a5662a" stroke-width="2.6"/><path d="M-26 -2C-12 -10 14 -10 26 0" stroke="#fff" stroke-width="2.4" opacity=".55" fill="none"/><path d="M-22 8C-6 4 10 4 24 9" stroke="#e6c79a" stroke-width="1.4" opacity=".7" fill="none"/>`;
  });
  let o = '';
  for (let i = n - 1; i >= 0; i--) o += use(id, i * 15 - (n - 1) * 7.5, i * 7 - (n - 1) * 3.5 + c.rnd(-2, 2), c.rnd(-5, 5) + i * 4, 1, fl(c, 2));
  return `<g${tr(x, y, rot, s)}>${o}</g>`;
}
function escalope(c, x, y, { w = 130, h = 84, rot = 0 } = {}) {
  const d = blob(c, 0, 0, w / 2, h / 2, 0.07, 10), cl = c.clip(`<path d="${d}"/>`);
  let m = '';
  for (let k = -3; k <= 3; k++) m += `<path d="M${f(k * 22 - 20)} ${f(-h / 2 - 4)}l${f(h * 0.5)} ${f(h + 8)}"/>`;
  let dore = '';
  for (let i = 0; i < 6; i++) dore += tache(c, c.rnd(-w * 0.35, w * 0.35), c.rnd(-h * 0.3, h * 0.3), c.rnd(8, 16), c.rnd(5, 9), '#c9822e', c.rnd(0.3, 0.5), 3);
  return `<g${tr(x, y, rot)}><g${fl(c)}><path d="${d}" fill="${c.rg('esc', [[0, '#fbe2b0'], [0.55, '#ecbd78'], [1, '#c48a44']])}"/><g clip-path="${cl}">${dore}<g stroke="#5a2c0e" stroke-width="5" stroke-linecap="round" opacity=".62" fill="none" filter="${c.blur(1)}">${m}</g></g>${volume(c, d, 0.7)}</g>${reflet(c, -w * 0.2, -h * 0.22, w * 0.14, 2.5, -10, 0.6, 1)}${reflet(c, w * 0.1, -h * 0.05, w * 0.08, 2, -10, 0.45, 1)}${poivre(c, 0, 0, w * 0.35, h * 0.3, 10)}</g>`;
}
function morceauxPoulet(c, pts, curry = false) {
  let o = '';
  const fill = curry ? c.rg('chc', [[0, '#f7c27a'], [0.55, '#dd8f3a'], [1, '#a95a1a']]) : c.rg('chm', [[0, '#f8d8a2'], [0.55, '#e3a65c'], [1, '#b8742e']]);
  for (const [x, y] of byDepth(pts)) {
    const d = blob(c, x, y, c.rnd(9, 12), c.rnd(7, 10), 0.18, 6, c.rnd(0, 180));
    o += `<path d="${d}" fill="${fill}"/>` + (curry ? '' : `<path d="M${P(x - 6, y - 2)}l9 6" stroke="#6a3410" stroke-width="2.2" opacity=".55" stroke-linecap="round"/>`) + reflet(c, x - 3, y - 4, 3, 1.4, -30, 0.55, 0.6);
  }
  return G(o, fl(c, 2));
}
function steak(c, x, y, r = 56) {
  const d = blob(c, x, y, r, r * 0.95, 0.05, 12), cl = c.clip(`<path d="${d}"/>`);
  const tex = tilePat(c, 'stkp', 14, null, 12, () => {
    const rr = c.rnd(0.7, 2), col = c.pick(['#b2683e', '#3a1a0a', '#8d4a28', '#c97a4a', '#2a1006']);
    return { m: 3, s: (X, Y) => `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(rr)}" fill="${col}" opacity=".6"/>` };
  });
  let m = '';
  for (let k = -2; k <= 2; k++) m += `<path d="M${P(x - r + k * 26, y - r)}l${f(r * 1.3)} ${f(r * 2)}"/>`;
  let jus = '';
  for (let i = 0; i < 9; i++) { const [px, py] = ell(x - 8, y - 10, r * 0.6, r * 0.55)(c); jus += reflet(c, px, py, c.rnd(1.5, 4), c.rnd(0.8, 1.5), c.rnd(-60, 0), c.rnd(0.35, 0.6), 0.5); }
  return G(`<path d="${d}" fill="${c.rg('stk', [[0, '#a5603a'], [0.55, '#6e3519'], [1, '#3b1a0b']])}"/><path d="${d}" fill="${tex}"/><g clip-path="${cl}"><g stroke="#1e0c04" stroke-width="6" stroke-linecap="round" opacity=".7" filter="${c.blur(1.2)}">${m}</g></g>${volume(c, d, 0.7)}<path d="${d}" fill="none" stroke="#2a1006" stroke-width="2" opacity=".5"/>`, fl(c)) + jus + poivre(c, x, y, r * 0.6, r * 0.6, 14);
}
function jambon(c, x, y, rot = 0, s = 1) {
  const id = c.sym('jam', () => {
    const d = 'M0 0L54 2C55 14 51 28 42 39C33 49 19 55 3 55Z';
    return `<path d="${d}" fill="${c.rg('jmf', [[0, '#ffd3cf'], [0.55, '#f5a3a6'], [1, '#d97c86']], { cx: 0.25, cy: 0.25, fx: 0.15, fy: 0.15, r: 0.9 })}"/>` +
      `<path d="M54 2C55 14 51 28 42 39C33 49 19 55 3 55" fill="none" stroke="#fff3ea" stroke-width="5"/><path d="M57 2C58 15 54 30 44 41C35 51 20 58 3 58" fill="none" stroke="#e6b6aa" stroke-width="1.2"/>` +
      `<path d="M10 14C22 18 30 28 34 40M8 30C14 34 18 40 20 48" stroke="#fff" stroke-width="1.2" opacity=".35" fill="none"/><path d="M0 0L54 2" stroke="#c76a74" stroke-width="1.2" opacity=".6"/>` + reflet(c, 18, 14, 10, 3, 40, 0.35, 1.5);
  });
  return use(id, x, y, rot, s, fl(c));
}

// œufs
function oeufPlat(c, x, y, s = 1, rot = 0) {
  const d = blob(c, 0, 0, 46, 40, 0.12, 9);
  return `<g${tr(x, y, rot, s)}><g${fl(c)}><path d="${d}" fill="${c.rg('blc', [[0, '#ffffff'], [0.7, '#fbf9f4'], [1, '#ece4d4']])}" stroke="#e7c890" stroke-width="2"/>` +
    `<circle cx="7" cy="-3" r="18" fill="#c47a00" opacity=".35" filter="${c.blur(2)}" transform="translate(1.5 2)"/><circle cx="7" cy="-3" r="17.5" fill="${c.rg('jau', [[0, '#ffe680'], [0.45, '#ffbd22'], [1, '#e48700']])}"/></g>` +
    reflet(c, 1, -10, 5.5, 3, -35, 0.9, 0.6) + reflet(c, 14, 5, 3, 1.5, -35, 0.4, 0.6) + `</g>`;
}
function oeufDurSym(c) {
  return c.sym('oed', () => `<ellipse rx="21" ry="28" fill="${c.rg('blc2', [[0, '#ffffff'], [0.7, '#f6f2ea'], [1, '#e0d8ca']])}"/>` +
    `<ellipse cx="1" cy="2" rx="12" ry="13.5" fill="${c.rg('jdur', [[0, '#ffe58a'], [0.6, '#fac73c'], [1, '#e9a71c']])}"/>` +
    `<ellipse cx="1" cy="2" rx="7" ry="8" fill="#ffe9a0" opacity=".45" filter="${c.blur(1.5)}"/>` + reflet(c, -8, -14, 5, 2.4, -60, 0.8, 1));
}
const oeufDur = (c, x, y, rot = 0, s = 1) => use(oeufDurSym(c), x, y, rot, s, fl(c));
function oeufsBrouilles(c, cx, cy, rx, ry, n = 18) {
  const fill = c.rg('scb', [[0, '#fff8d4'], [0.55, '#fbe27e'], [1, '#e8b844']]);
  let o = `<path d="${blob(c, cx, cy, rx, ry, 0.12, 10)}" fill="#f2c95a"/>`;
  for (const [x, y] of byDepth(scatter(c, n, ell(cx, cy, rx * 0.75, ry * 0.75), 12))) o += `<path d="${blob(c, x, y, c.rnd(13, 19), c.rnd(10, 15), 0.22, 8, c.rnd(0, 180))}" fill="${fill}"/>`;
  return G(o, fl(c)) + ciboulette(c, cx, cy, rx * 0.8, ry * 0.8, 14) + poivre(c, cx, cy, rx * 0.8, ry * 0.8, 12);
}
function omelette(c, x, y, { r = 82, rot = 0, garniture = '' } = {}) {
  const d = `M${-r} 0A${r} ${f(r * 0.92)} 0 0 0 ${r} 0C${f(r * 0.55)} ${f(-r * 0.2)} ${f(-r * 0.55)} ${f(-r * 0.2)} ${-r} 0Z`;
  const cl = c.clip(`<path d="${d}"/>`);
  let spots = '';
  for (let i = 0; i < 16; i++) { const [px, py] = ell(0, r * 0.4, r * 0.85, r * 0.45)(c); spots += tache(c, px, py, c.rnd(4, 11), c.rnd(3, 7), '#c9862a', c.rnd(0.2, 0.42), 2.2); }
  const pli = `M${f(-r * 0.93)} -1C${f(-r * 0.5)} ${f(-r * 0.17)} ${f(r * 0.5)} ${f(-r * 0.17)} ${f(r * 0.93)} -1`;
  return `<g${tr(x, y, rot)}>${garniture}<g${fl(c)}><path d="${d}" fill="${c.rg('om', [[0, '#fdeca6'], [0.5, '#f6cd58'], [1, '#d99c2a']], { cx: 0.45, cy: 0.3, fx: 0.35, fy: 0.15, r: 0.8 })}"/><g clip-path="${cl}">${spots}<path d="${pli}" transform="translate(0 9)" stroke="#b07414" stroke-width="8" opacity=".18" fill="none" filter="${c.blur(3)}"/></g>${volume(c, d, 0.6)}<path d="${pli}" stroke="#fff6cf" stroke-width="3" opacity=".85" fill="none" stroke-linecap="round"/></g>${ciboulette(c, 0, r * 0.38, r * 0.7, r * 0.35, 16)}${poivre(c, 0, r * 0.4, r * 0.7, r * 0.35, 10)}</g>`;
}

// fruits et légumes
function avocatSym(c) {
  return c.sym('avs', () => {
    const d = 'M0 0C12 -22 52 -22 64 0C48 -7 16 -7 0 0Z';
    return `<path d="${d}" fill="${c.lg('avf', [[0, '#4b7420'], [0.18, '#8fb83a'], [0.6, '#d3e27c'], [1, '#eaeea4']])}"/><path d="M0 0C12 -22 52 -22 64 0" fill="none" stroke="#2c4514" stroke-width="2.4" stroke-linecap="round"/><path d="M10 -6C22 -11 42 -11 54 -6" fill="none" stroke="#fff" stroke-width="1.3" opacity=".45"/>`;
  });
}
function avocat(c, x, y, { n = 6, rot = 0, s = 1, dx = 6, dy = 8 } = {}) {
  const id = avocatSym(c);
  let o = '';
  for (let i = 0; i < n; i++) o += use(id, i * dx, i * dy, i * 1.5, 1, fl(c, 2));
  return `<g${tr(x, y, rot, s)}><g transform="translate(${f(-32 - (n - 1) * dx / 2)} ${f(5 - (n - 1) * dy / 2)})">${o}</g></g>`;
}
function avocatDes(c, pts) {
  const id = c.sym('avd', () => `<rect x="-5.5" y="-5.5" width="11" height="11" rx="2.5" fill="${c.rg('avdf', [[0, '#eef2a8'], [0.55, '#bcd660'], [1, '#7aa236']])}"/>`);
  return G(byDepth(pts).map(([x, y]) => use(id, x, y, c.rnd(0, 90))).join(''), fl(c, 2));
}
function tomateSym(c, kind) {
  return c.sym('tom' + kind, () => {
    const skin = c.rg('tsk', [[0, '#ff7452'], [0.55, '#e2321c'], [1, '#a3150b']]);
    if (kind === 'h' || kind === 's') {
      const R = kind === 'h' ? 14 : 25, nl = kind === 'h' ? 3 : 5;
      let s = `<circle r="${R}" fill="${skin}"/><circle r="${f(R * 0.87)}" fill="${c.rc('tfl', [[0, '#ffa184'], [1, '#ec4a30']])}"/>`;
      for (let k = 0; k < nl; k++) {
        const a = (k / nl) * 360 + 30, [px, py] = rotp(R * 0.44, 0, a);
        s += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(R * 0.27)}" ry="${f(R * 0.2)}" transform="rotate(${f(a)} ${f(px)} ${f(py)})" fill="#ffc7a2" opacity=".9"/>`;
        for (const t of [-0.1, 0.12]) { const [sx, sy] = rotp(R * (0.44 + t), t * R * 0.6, a); s += `<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="1.3" ry=".8" transform="rotate(${f(a)} ${f(sx)} ${f(sy)})" fill="#f3e2a0"/>`; }
      }
      return s + `<circle r="${f(R * 0.15)}" fill="#ffb59c"/>` + reflet(c, -R * 0.45, -R * 0.55, R * 0.22, R * 0.11, -40, 0.7, 0.5);
    }
    if (kind === 'q') {
      return `<path d="M-22 4C-18 -17 18 -17 22 4C10 9 -10 9 -22 4Z" fill="${skin}"/><path d="M-17 3C-12 -8 12 -8 17 3C8 6 -8 6 -17 3Z" fill="#f45a3c"/><ellipse cx="0" cy="0" rx="9" ry="3.2" fill="#ffc29a"/><g fill="#f3e2a0"><ellipse cx="-4" cy="0" rx="1.3" ry=".8"/><ellipse cx="1" cy="1" rx="1.3" ry=".8"/><ellipse cx="5" cy="-.5" rx="1.3" ry=".8"/></g>` + reflet(c, -9, -10, 5, 1.6, -15, 0.7, 0.6);
    }
    if (kind === 'd') return `<rect x="-5" y="-5" width="10" height="10" rx="2.2" fill="${skin}"/><path d="M-3 -1L3 -1L2 3L-2 3Z" fill="#ffb08a" opacity=".8"/>`;
    // entière (tomate cerise)
    return `<circle r="13" fill="${skin}"/><path d="M0 -5L1.6 -1.6L5.5 -1.8L2.4 .7L3.6 4.5L0 2.3L-3.6 4.5L-2.4 .7L-5.5 -1.8L-1.6 -1.6Z" fill="#3e7a22" stroke="#2a5a14" stroke-width=".6"/>` + reflet(c, -5.5, -6.5, 3.6, 2, -40, 0.85, 0.6);
  });
}
const tomate = (c, kind, x, y, rot = 0, s = 1, l = 2) => use(tomateSym(c, kind), x, y, rot, s, fl(c, l));
function concombreSym(c) {
  return c.sym('cuc', () => {
    let s = `<circle r="14" fill="#2a541a"/><circle r="12.8" fill="#86ad4c"/><circle r="12" fill="${c.rc('cuf', [[0, '#f3f9de'], [0.6, '#d8ecb2'], [1, '#a6cc76']])}"/>`;
    for (let k = 0; k < 3; k++) { const a = k * 120 + 90, [px, py] = rotp(4.3, 0, a); s += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="3.6" ry="2.4" transform="rotate(${a} ${f(px)} ${f(py)})" fill="#eef7d4"/><ellipse cx="${f(px * 1.05)}" cy="${f(py * 1.05)}" rx="1.1" ry=".7" transform="rotate(${a} ${f(px)} ${f(py)})" fill="#fbfde9"/>`; }
    return s + reflet(c, -5, -6, 4, 1.8, -40, 0.6, 0.6);
  });
}
const concombre = (c, x, y, s = 1) => use(concombreSym(c), x, y, c.rnd(0, 360), s, fl(c, 2));
function courgetteSym(c, grill) {
  return c.sym(grill ? 'coug' : 'cou', () => {
    let s = `<circle r="14" fill="#2f5a1a"/><circle r="12.2" fill="${c.rc('cof', [[0, '#f6f7d6'], [0.6, '#e0e9ac'], [1, '#bccf72']])}"/>`;
    for (let k = 0; k < 7; k++) { const a = k * 51.4, [px, py] = rotp(5.2, 0, a); s += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="1.4" ry=".8" transform="rotate(${f(a)} ${f(px)} ${f(py)})" fill="#c9d68e"/>`; }
    if (grill) s += `<g stroke="#5a3214" stroke-width="2.6" opacity=".6" stroke-linecap="round" filter="${c.blur(0.5)}"><path d="M-9 -4L3 -11M-10 5L8 -6M-4 11L10 3"/></g><ellipse cx="0" cy="0" rx="11" ry="11" fill="#d8a24a" opacity=".22"/>`;
    return s + reflet(c, -5, -6, 4, 1.8, -40, 0.55, 0.6);
  });
}
const courgette = (c, x, y, s = 1, grill = false) => use(courgetteSym(c, grill), x, y, c.rnd(0, 360), s, fl(c, 2));
function courgetteDemi(c, x, y, rot) {
  const id = c.sym('coud', () => `<path d="M-13 0A13 13 0 0 0 13 0Z" fill="#2f5a1a"/><path d="M-11.2 0A11.2 11.2 0 0 0 11.2 0Z" fill="${c.rc('cof2', [[0, '#f6f7d6'], [1, '#c5d67e']], { cy: 0, r: 0.9 })}"/><g fill="#c9d68e"><ellipse cx="-4" cy="4" rx="1.3" ry=".8"/><ellipse cx="0" cy="5.5" rx="1.3" ry=".8"/><ellipse cx="4" cy="4" rx="1.3" ry=".8"/></g>`);
  return use(id, x, y, rot, 1, fl(c, 2));
}
function carotteSym(c, kind) {
  return c.sym('car' + kind, () => {
    if (kind === 'r') return `<circle r="9.5" fill="${c.rg('crf', [[0, '#ffb950'], [0.55, '#f68a1c'], [1, '#d4600a']])}"/><circle r="5" fill="none" stroke="#ffcb80" stroke-width="1.1" opacity=".7"/><circle r="2.8" fill="#ffaa44"/>` + reflet(c, -3.5, -4, 2.5, 1.2, -40, 0.6, 0.4);
    // bâtonnet
    return `<rect x="-28" y="-5" width="56" height="10" rx="4.5" fill="${c.lg('crb', [[0, '#ffc46a'], [0.45, '#f68c1e'], [1, '#c9580a']])}"/><path d="M-22 -2.5H20M-14 1.5H24" stroke="#ffd9a0" stroke-width=".9" opacity=".6"/><path d="M-20 3H-14M2 3.2H8" stroke="#b44a06" stroke-width=".8" opacity=".5"/>`;
  });
}
const carotte = (c, kind, x, y, rot = 0, s = 1) => use(carotteSym(c, kind), x, y, rot, s, fl(c, 2));
function carotteRapee(c, area, n) {
  let o = '';
  for (const [x, y] of scatter(c, n, area)) {
    const a = c.rnd(0, 180), L = c.rnd(8, 15), [dx, dy] = rotp(L / 2, 0, a), b = c.rnd(-4, 4);
    o += `<path d="M${P(x - dx, y - dy)}q${P(dx + b, dy - b)} ${P(dx * 2, dy * 2)}" stroke="${c.pick(['#f58a1e', '#ff9d2e', '#e8760f', '#ffad48'])}"/>`;
  }
  return G(o, ` stroke-width="2.6" stroke-linecap="round" fill="none"${fl(c, 2)}`);
}
function julienne(c, area, n, cols, w = 3) {
  let o = '';
  for (const [x, y] of scatter(c, n, area)) {
    const a = c.rnd(0, 180), L = c.rnd(18, 28), [dx, dy] = rotp(L / 2, 0, a);
    o += `<path d="M${P(x - dx, y - dy)}L${P(x + dx, y + dy)}" stroke="${c.pick(cols)}"/>`;
  }
  return G(o, ` stroke-width="${w}" stroke-linecap="round"${fl(c, 2)}`);
}
const POIVRONS = { rouge: ['#9e1508', '#e2311a', '#ff9a7a'], jaune: ['#c98400', '#f6bd18', '#fff0a0'], vert: ['#285f12', '#4a9a28', '#aee07c'], orange: ['#c45a00', '#f88a14', '#ffd08a'] };
function lanieres(c, pts, coul, L = 30) {
  let o = '';
  for (const [x, y] of pts) {
    const [d1, d2, d3] = POIVRONS[coul], a = c.rnd(0, 180), b = c.rnd(-8, 8);
    const [ax, ay] = rotp(-L / 2, 0, a), [bx, by] = rotp(0, b, a), [cx2, cy2] = rotp(L / 2, 0, a);
    const d = `M${P(x + ax, y + ay)}Q${P(x + bx, y + by)} ${P(x + cx2, y + cy2)}`;
    o += `<path d="${d}" stroke="${d1}" stroke-width="8.5"/><path d="${d}" stroke="${d2}" stroke-width="6.5"/><path d="${d}" stroke="${d3}" stroke-width="1.6" opacity=".8" transform="translate(-1 -1.3)"/>`;
  }
  return G(o, ` fill="none" stroke-linecap="round"${fl(c, 2)}`);
}
function des(c, pts, coul, t = 9) {
  const [d1, d2, d3] = POIVRONS[coul];
  let o = '';
  for (const [x, y] of pts) { const a = c.rnd(0, 90); o += `<g${tr(x, y, a)}><rect x="${-t / 2}" y="${-t / 2}" width="${t}" height="${t}" rx="2" fill="${d2}" stroke="${d1}" stroke-width="1"/><path d="M${-t / 2 + 2} ${-t / 2 + 1.6}H${t / 2 - 2}" stroke="${d3}" stroke-width="1.3" opacity=".8"/></g>`; }
  return G(o, fl(c, 2));
}
function oignon(c, pts, des = false) {
  let o = '';
  for (const [x, y] of pts) {
    const a = c.rnd(0, 180);
    if (des) o += `<rect x="-3.5" y="-3.5" width="7" height="7" rx="1.5"${tr(x, y, a)} fill="#f6ebf2" stroke="#b05c92" stroke-width="1"/>`;
    else o += `<g${tr(x, y, a)}><path d="M-12 0Q0 -8 12 0" stroke="#8e3474" stroke-width="3.4"/><path d="M-10 2Q0 -4.5 10 2" stroke="#f6e6f0" stroke-width="2"/></g>`;
  }
  return G(o, ` fill="none" stroke-linecap="round"${fl(c, 2)}`);
}
function champignonSym(c, cuit) {
  return c.sym(cuit ? 'chpc' : 'chp', () => {
    const d = 'M-17 0C-17 -15 17 -15 17 0C17 3 12 4.5 6 4.5L5.5 15C5.5 18 -5.5 18 -5.5 15L-6 4.5C-12 4.5 -17 3 -17 0Z';
    const fill = cuit ? c.rg('chcf', [[0, '#e2be92'], [0.6, '#bf8f5c'], [1, '#86592f']]) : c.rg('chrf', [[0, '#fbf2e4'], [0.6, '#ecd8bc'], [1, '#c9a274']]);
    return `<path d="${d}" fill="${fill}" stroke="${cuit ? '#6a4220' : '#9a6c42'}" stroke-width="1.6"/><path d="M-14 1.5Q0 5 14 1.5" stroke="${cuit ? '#7a4f28' : '#b89068'}" stroke-width="1" fill="none" opacity=".7"/>` + reflet(c, -7, -7, 5, 1.8, -20, cuit ? 0.45 : 0.6, 0.6);
  });
}
const champignon = (c, x, y, rot = 0, s = 1, cuit = true) => use(champignonSym(c, cuit), x, y, rot, s, fl(c, 2));
function citronSym(c, kind) {
  return c.sym('ct' + kind, () => {
    if (kind === 'q') {
      let s = `<path d="M-32 4C-26 -24 26 -24 32 4C12 9 -12 9 -32 4Z" fill="#f2c200"/><path d="M-28 3C-22 -18 22 -18 28 3C12 7 -12 7 -28 3Z" fill="#fff5cc"/><path d="M-25 2.5C-19 -14 19 -14 25 2.5C12 6 -12 6 -25 2.5Z" fill="${c.lg('ctf', [[0, '#fff4a6'], [1, '#f6d63e']])}"/>`;
      s += `<g stroke="#fffbe0" stroke-width="1.4" opacity=".9">${[-16, -8, 0, 8, 16].map((xx) => `<path d="M${xx * 0.3} 5L${xx} -10"/>`).join('')}</g>`;
      return s + reflet(c, -12, -10, 8, 1.8, -20, 0.6, 0.6);
    }
    let s = `<circle r="22" fill="#f2c200"/><circle r="19.8" fill="#fff6d2"/>`;
    for (let k = 0; k < 9; k++) {
      const a0 = (k / 9) * 360 + 3, a1 = ((k + 1) / 9) * 360 - 3, [x0, y0] = rotp(17.5, 0, a0), [x1, y1] = rotp(17.5, 0, a1), [xm, ym] = rotp(2.5, 0, (a0 + a1) / 2);
      s += `<path d="M${P(xm, ym)}L${P(x0, y0)}A17.5 17.5 0 0 1 ${P(x1, y1)}Z" fill="${c.rc('ctrf', [[0, '#fff6b8'], [1, '#f5d43a']], { r: 0.75 })}"/>`;
    }
    return s + reflet(c, -8, -10, 7, 2, -40, 0.6, 0.6);
  });
}
const citron = (c, kind, x, y, rot = 0, s = 1) => use(citronSym(c, kind), x, y, rot, s, fl(c, 2));
function crevetteSym(c) {
  return c.sym('crev', () => {
    const a0 = 200, a1 = 465, outer = [], inner = [], mid = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, a = (a0 + (a1 - a0) * t) * RAD, ro = 18 - 4.5 * t, ri = 6 + 5.2 * t;
      outer.push([Math.cos(a) * ro, Math.sin(a) * ro]); inner.push([Math.cos(a) * ri, Math.sin(a) * ri]); mid.push([a, ri, ro]);
    }
    const d = smoothPath([...outer, ...inner.slice().reverse()]);
    let s = `<path d="${d}" fill="${c.rg('crf2', [[0, '#ffd2b4'], [0.5, '#ff8c5e'], [1, '#df5228']], { r: 0.65 })}"/>`;
    for (let i = 2; i <= 10; i += 1.6) {
      const [a, ri, ro] = mid[Math.round(i)];
      s += `<path d="M${P(Math.cos(a) * (ri + 0.5), Math.sin(a) * (ri + 0.5))}L${P(Math.cos(a) * (ro - 0.3), Math.sin(a) * (ro - 0.3))}" stroke="#e04a20" stroke-width="2.2" opacity=".55"/>`;
      const a2 = a + 0.09;
      s += `<path d="M${P(Math.cos(a2) * (ri + 1), Math.sin(a2) * (ri + 1))}L${P(Math.cos(a2) * (ro - 1), Math.sin(a2) * (ro - 1))}" stroke="#ffe0cc" stroke-width="1.1" opacity=".75"/>`;
    }
    const [ae] = mid[12], ex = Math.cos(ae) * 11.5, ey = Math.sin(ae) * 11.5, tang = (ae * 180) / Math.PI + 90;
    s += `<g${tr(ex, ey, tang)}><path d="M-1 -4L11 -9Q15 0 11 9L-1 4Z" fill="#e85a2a"/><path d="M0 0L12 0M0 -2L11 -6M0 2L11 6" stroke="#ffb38c" stroke-width=".8" opacity=".8"/></g>`;
    s += `<path d="${smoothPath(outer.slice(1, 8).map(([x, y]) => [x * 0.86, y * 0.86]), false)}" stroke="#fff" stroke-width="1.6" opacity=".55" fill="none"/>`;
    return s;
  });
}
const crevette = (c, x, y, rot = 0, s = 1) => use(crevetteSym(c), x, y, rot, s, fl(c));
function thon(c, cx, cy, rx, ry, n = 22) {
  let o = '';
  for (const [x, y] of byDepth(scatter(c, n, ell(cx, cy, rx, ry), 6))) {
    const r = c.rnd(5, 9);
    o += `<path d="${blob(c, x, y, r, r * c.rnd(0.6, 0.9), 0.3, 6, c.rnd(0, 180))}" fill="${c.pick(['#d9a48c', '#c88e74', '#e6bba5', '#bf8169', '#d39b84'])}"/><path d="M${P(x - r * 0.5, y - 1)}l${f(r * 0.8)} ${f(c.rnd(-2, 2))}" stroke="#f4dccd" stroke-width="1.1" opacity=".8"/>`;
  }
  return G(o, fl(c, 2));
}
function painPath(w, h) {
  const a = w / 2, b = h / 2;
  return `M${P(-a, b - 7)}V${f(-b * 0.2)}C${P(-a - 9, -b * 0.62)} ${P(-a * 0.55, -b - 7)} 0 ${f(-b)}C${P(a * 0.55, -b - 7)} ${P(a + 9, -b * 0.62)} ${P(a, -b * 0.2)}V${f(b - 7)}Q${P(a, b)} ${P(a - 7, b)}H${f(-a + 7)}Q${P(-a, b)} ${P(-a, b - 7)}Z`;
}
function pain(c, x, y, { w = 112, h = 120, rot = 0, garniture = '' } = {}) {
  const d = painPath(w, h), di = painPath(w - 13, h - 13);
  const mie = tilePat(c, 'miep', 22, null, 9, (i) => {
    if (i < 5) { const rx = c.rnd(1, 2.5), ry = c.rnd(0.6, 1.3), a = c.rnd(0, 180); return { m: 3, s: (X, Y) => `<ellipse cx="${f(X)}" cy="${f(Y)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(a)} ${f(X)} ${f(Y)})" fill="#8f5a26" opacity=".55"/>` }; }
    const a = c.rnd(0, 180), col = c.pick(['#4d2a12', '#f4dcae', '#3a2010']);
    return { m: 3, s: (X, Y) => `<ellipse cx="${f(X)}" cy="${f(Y)}" rx="1.9" ry="1" transform="rotate(${f(a)} ${f(X)} ${f(Y)})" fill="${col}"/>` };
  });
  return `<g${tr(x, y, rot)}><g${fl(c)}><path d="${d}" fill="${c.lg('crou', [[0, '#9a5a28'], [1, '#62330f']], 0, 0, 1, 1)}"/><path d="${di}" fill="${c.rc('mie', [[0, '#e2a560'], [0.55, '#d9a96a'], [1, '#c38a4c']], { r: 0.6 })}"/><path d="${di}" fill="${mie}"/>${volume(c, di, 0.6)}</g>${garniture}</g>`;
}
function epinardSym(c, v) {
  return c.sym('epi' + v, () => {
    const d = blob(c, 0, 0, 15, 11, 0.22, 8);
    const fill = v ? c.rg('epf1', [[0, '#5d9c3c'], [0.6, '#2f6824'], [1, '#1a3f14']]) : c.rg('epf0', [[0, '#4e8c32'], [0.6, '#275a1e'], [1, '#163612']]);
    return `<path d="${d}" fill="${fill}"/><path d="M-12 1Q0 -3 13 0" stroke="#7fb45c" stroke-width="1.3" fill="none" opacity=".7"/><path d="M-4 -1L-1 -7M4 -1L7 -6M-2 0L1 6" stroke="#6aa04a" stroke-width=".8" opacity=".5"/>` + reflet(c, -4, -5, 5, 1.8, -20, 0.35, 1);
  });
}
function epinards(c, cx, cy, rx, ry, n = 14) {
  return G(byDepth(scatter(c, n, ell(cx, cy, rx, ry), 9)).map(([x, y], i) => use(epinardSym(c, i % 3 ? 1 : 0), x, y, c.rnd(0, 360), c.rnd(0.75, 1.15))).join(''), fl(c, 2));
}
function pousseEpinard(c, x, y, rot, s = 1) {
  const id = c.sym('pep', () => `<path d="M0 -18C11 -14 12 4 0 16C-12 4 -11 -14 0 -18Z" fill="${c.rg('pepf', [[0, '#5aa83a'], [0.6, '#2f7a24'], [1, '#1d5216']])}"/><path d="M0 -15V22" stroke="#a6d47c" stroke-width="1.3"/><path d="M0 -4L6 -9M0 4L-6 -2M0 9L6 4" stroke="#83bd5c" stroke-width=".7" opacity=".7"/>` + reflet(c, -4, -6, 3, 6, 10, 0.3, 1));
  return use(id, x, y, rot, s, fl(c, 2));
}
function saladeSym(c, v) {
  return c.sym('sal' + v, () => {
    const d = blob(c, 0, 0, 30, 22, 0.16, 15);
    const fill = v === 2 ? c.rg('slf2', [[0, '#9fd05a'], [0.6, '#5c9a2c'], [1, '#2f6a1a']]) : c.rg('slf', [[0, '#e6f6b0'], [0.5, '#a8d65e'], [1, '#5f9a2c']]);
    return `<path d="${d}" fill="${fill}" stroke="#4f8a24" stroke-width=".8"/><path d="M-24 4Q0 -2 26 -2" stroke="#f2fbd8" stroke-width="2.6" fill="none" opacity=".8"/><path d="M-10 1Q-6 -8 -2 -14M4 0Q8 -8 14 -12M-6 2Q-2 10 2 15M10 0Q14 8 18 12" stroke="#e6f6c0" stroke-width="1" fill="none" opacity=".6"/>`;
  });
}
function salade(c, cx, cy, rx, ry, n = 6) {
  return G(byDepth(scatter(c, n, ell(cx, cy, rx, ry), 22)).map(([x, y], i) => use(saladeSym(c, i % 3), x, y, c.rnd(0, 360), c.rnd(0.8, 1.1))).join(''), fl(c));
}
function haricots(c, x, y, { n = 12, len = 120, rot = 0 } = {}) {
  let o = '';
  for (let i = 0; i < n; i++) {
    const y0 = (i - (n - 1) / 2) * 6.2 + c.rnd(-1.5, 1.5), dx = c.rnd(-10, 10), L = len * c.rnd(0.82, 1.04), cv = c.rnd(-7, 7);
    const d = `M${P(-L / 2 + dx, y0)}Q${P(dx, y0 + cv)} ${P(L / 2 + dx, y0 + c.rnd(-4, 4))}`;
    o += `<path d="${d}" stroke="#2c6416" stroke-width="7.6"/><path d="${d}" stroke="#56a032" stroke-width="5.6"/><path d="${d}" stroke="#bfe68e" stroke-width="1.5" opacity=".85" transform="translate(-.6 -1.4)"/>`;
  }
  return `<g${tr(x, y, rot)} fill="none" stroke-linecap="round"${fl(c)}>${o}</g>`;
}
function pdtRoties(c, pts, palette = 'pdt') {
  const fill = palette === 'pdt' ? c.rg('pdr', [[0, '#ffeaa8'], [0.5, '#f0b950'], [1, '#b46e1c']]) : c.rg('pdd', [[0, '#ffc06a'], [0.5, '#f58a26'], [1, '#b84e0c']]);
  let o = '', herbes = '';
  for (const [x, y] of byDepth(pts)) {
    const r = c.rnd(17, 22), d = blob(c, x, y, r, r * c.rnd(0.72, 0.9), 0.2, 7, c.rnd(0, 180));
    o += `<path d="${d}" fill="${fill}"/>` + tache(c, x + c.rnd(-4, 6), y + c.rnd(-2, 6), c.rnd(3, 6), c.rnd(2, 4), palette === 'pdt' ? '#8a4a12' : '#6a2606', 0.45, 1.4) + reflet(c, x - r * 0.35, y - r * 0.4, r * 0.3, r * 0.14, -35, 0.6, 1);
    herbes += `<path d="M${P(x + c.rnd(-6, 6), y + c.rnd(-6, 6))}l${P(c.rnd(-5, 5), c.rnd(-5, 5))}" stroke="#3a6a26" stroke-width="1.6" stroke-linecap="round"/>`;
  }
  return G(o, fl(c)) + herbes + sel(c, pts);
}
function pdtVapeur(c, x, y, rot = 0, s = 1) {
  const id = c.sym('pdv', () => {
    const d = blob(c, 0, 0, 22, 17, 0.08, 8);
    return `<path d="${d}" fill="${c.rg('pdvs', [[0, '#fbe6a4'], [0.55, '#e4b860'], [1, '#a8752e']])}"/><g fill="#9a6a2e" opacity=".55"><circle cx="9" cy="-7" r="1.1"/><circle cx="-12" cy="5" r="1"/><circle cx="3" cy="9" r=".9"/><path d="M-6 -10q3 -1.5 5 0" stroke="#9a6a2e" fill="none"/></g>` + reflet(c, -7, -7, 7, 3, -30, 0.7, 1.4);
  });
  return use(id, x, y, rot, s, fl(c)) + persil(c, x + c.rnd(-5, 5), y + c.rnd(-4, 4), c.rnd(0, 360), 0.5);
}
function frites(c, cx, cy, n = 16, rot = 0) {
  const id = c.sym('frt', () => `<rect x="-28" y="-4.5" width="56" height="9" rx="2.5" fill="${c.lg('frf', [[0, '#ffefaa'], [0.45, '#f6c24a'], [1, '#c98a1c']])}"/><rect x="21" y="-4.5" width="7" height="9" rx="2.5" fill="#b8741a" opacity=".55"/><path d="M-24 -2.4H16" stroke="#fff6cc" stroke-width="1" opacity=".7"/>`);
  let o = '';
  for (let i = 0; i < n; i++) o += use(id, cx + c.rnd(-32, 32), cy + c.rnd(-26, 26), rot + c.rnd(-35, 35), c.rnd(0.85, 1.1), fl(c, 2));
  return `<g>${o}</g>` + sel(c, [[cx, cy], [cx - 20, cy + 10], [cx + 15, cy - 12]]);
}
function patateDouceCubes(c, pts) {
  const id = c.sym('pdc', () => `<rect x="-10" y="-10" width="20" height="20" rx="5" fill="${c.rg('pdcf', [[0, '#ffc875'], [0.5, '#f58c26'], [1, '#bd520e']])}"/><path d="M4 10Q10 10 10 4" stroke="#6a2606" stroke-width="3" opacity=".4" fill="none" filter="${c.blur(1)}"/><path d="M-6 -7H4" stroke="#fff0c8" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>`);
  return G(byDepth(pts).map(([x, y]) => use(id, x, y, c.rnd(0, 90), c.rnd(0.85, 1.1))).join(''), fl(c)) + pts.slice(0, 5).map(([x, y]) => persil(c, x + 6, y - 5, c.rnd(0, 360), 0.45)).join('');
}
function puree(c, cx, cy, rx, ry, cols) {
  const d = blob(c, cx, cy, rx, ry, 0.08, 10);
  let s = '';
  for (let i = 0; i < 4; i++) { const k = 0.85 - i * 0.2; s += `<path d="M${P(cx - rx * k, cy + ry * 0.1 * i)}C${P(cx - rx * k * 0.4, cy - ry * k)} ${P(cx + rx * k * 0.5, cy - ry * k)} ${P(cx + rx * k, cy - ry * 0.1 * i)}" stroke="${cols[2]}" stroke-width="3" fill="none" opacity=".55"/><path d="M${P(cx - rx * k, cy + ry * 0.1 * i - 3)}C${P(cx - rx * k * 0.4, cy - ry * k - 3)} ${P(cx + rx * k * 0.5, cy - ry * k - 3)} ${P(cx + rx * k, cy - ry * 0.1 * i - 3)}" stroke="#fff" stroke-width="1.5" fill="none" opacity=".45"/>`; }
  return G(`<path d="${d}" fill="${c.rg('pur' + cols[0].slice(1), [[0, cols[0]], [0.6, cols[1]], [1, cols[2]]])}"/>${s}${volume(c, d, 0.7)}`, fl(c));
}
function poisChiches(c, pts, s = 1) {
  const id = c.sym('pc', () => `<circle r="7.5" fill="${c.rg('pcf', [[0, '#fbe4b2'], [0.55, '#e5b76e'], [1, '#b98845']])}"/><path d="M-1.5 -6.5Q2.5 -1 -.5 6" stroke="#b07d3c" stroke-width=".9" fill="none" opacity=".7"/><path d="M5 -5.5l2 -2" stroke="#a47236" stroke-width="1.2" stroke-linecap="round"/>` + reflet(c, -3, -3.5, 2.6, 1.3, -40, 0.65, 0.4));
  return G(byDepth(pts).map(([x, y]) => use(id, x, y, c.rnd(0, 360), s * c.rnd(0.9, 1.1))).join(''), fl(c, 2));
}
function lentillesPts(c, pts, cols) {
  return G(pts.map(([x, y]) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="3.4" ry="2.7" transform="rotate(${f(c.rnd(0, 180))} ${f(x)} ${f(y)})" fill="${c.pick(cols)}"/>`).join(''), ` stroke="#3a2a14" stroke-width=".4" stroke-opacity=".5"`);
}
function myrtilles(c, pts, k = 1) {
  const id = c.sym('myr', () => `<circle r="8.5" fill="${c.rg('myf', [[0, '#8d9ad8'], [0.45, '#4b4f9e'], [1, '#1d1d4a']])}"/><circle r="8.5" fill="${c.rc('myb', [[0, '#c9cff0', 0.35], [1, '#c9cff0', 0]])}"/><path d="M2 -3.5l1 2 2-.2-1.5 1.6.6 2-1.8-1-1.8 1 .6-2-1.5-1.6 2 .2Z" fill="#1a1838" stroke="#6a70a8" stroke-width=".4"/>` + reflet(c, -3.2, -3.8, 2.6, 1.4, -40, 0.8, 0.4));
  return G(byDepth(pts).map(([x, y]) => use(id, x, y, c.rnd(0, 360), k * c.rnd(0.85, 1.12))).join(''), fl(c, 2));
}
function framboises(c, pts, k = 1) {
  const id = c.sym('frb', () => {
    let s = '<circle r="10.5" fill="#8e0f2a"/>';
    const dr = c.rg('drp', [[0, '#ff8b98'], [0.5, '#e02a4c'], [1, '#9c0f2e']]);
    for (const [ring, k, r] of [[7.4, 10, 2.9], [3.6, 6, 2.7]]) for (let i = 0; i < k; i++) { const a = (i / k) * TAU + ring; s += `<circle cx="${f(Math.cos(a) * ring)}" cy="${f(Math.sin(a) * ring)}" r="${r}" fill="${dr}"/>`; }
    return s + '<circle r="2.4" fill="#6a0a1e"/>' + reflet(c, -4, -5, 3, 1.4, -40, 0.5, 0.6);
  });
  return G(byDepth(pts).map(([x, y]) => use(id, x, y, c.rnd(0, 360), k * c.rnd(0.9, 1.1))).join(''), fl(c, 2));
}
function fraises(c, pts, k = 1) {
  const id = c.sym('frs', () => {
    const d = 'M0 -20C14 -21 21 -9 17 5C13 15 5 22 0 24C-5 22 -13 15 -17 5C-21 -9 -14 -21 0 -20Z';
    let s = `<path d="${d}" fill="#c8102a"/><path d="${d}" transform="scale(.84) translate(0 1)" fill="${c.rc('frsf', [[0, '#ffe0dc'], [0.45, '#ff8a8c'], [1, '#e2303c']], { cy: 0.4, r: 0.6 })}"/><path d="M0 -14C-3 -4 -3 8 0 16C3 8 3 -4 0 -14Z" fill="#ffd8d4" opacity=".8"/>`;
    for (const [x, y] of [[-14, -6], [14, -6], [-12, 8], [12, 8], [-6, 17], [6, 17]]) s += `<ellipse cx="${x}" cy="${y}" rx="1.1" ry=".7" fill="#ffe28a"/>`;
    s += '<path d="M0 -19L-9 -26L-3 -21L0 -28L3 -21L9 -26Z" fill="#4c8a24"/>';
    return s + reflet(c, -8, -10, 4, 2, -40, 0.6, 0.6);
  });
  return G(pts.map(([x, y, a]) => use(id, x, y, a ?? c.rnd(-40, 40), k * c.rnd(0.85, 1))).join(''), fl(c, 2));
}
function bananeSym(c) {
  return c.sym('ban', () => `<ellipse rx="13.5" ry="12.5" fill="${c.rg('bnf', [[0, '#fffcea'], [0.55, '#f8ecb8'], [1, '#e3cb7c']])}" stroke="#cfb064" stroke-width="1.4"/><ellipse rx="9" ry="8.2" fill="none" stroke="#efdf9c" stroke-width="1.2" opacity=".7"/><ellipse rx="3.6" ry="3.2" fill="#f2e2a6"/><g fill="#a8925c" opacity=".55"><circle cx="0" cy="-1.4" r=".55"/><circle cx="-1.3" cy=".8" r=".55"/><circle cx="1.3" cy=".8" r=".55"/></g>` + reflet(c, -5, -5.5, 3.5, 1.6, -40, 0.75, 0.6));
}
function bananes(c, pts, s = 1.2) {
  const id = bananeSym(c);
  return G(pts.map(([x, y]) => use(id, x, y, c.rnd(0, 360), s * c.rnd(0.94, 1.04))).join(''), fl(c));
}
function bananeEntiere(c, x, y, rot = 0, s = 1) {
  const d = 'M-80 -6C-50 30 40 34 82 -10C86 -6 86 -2 84 2C44 52 -54 48 -86 2C-86 -3 -84 -6 -80 -6Z';
  return `<g${tr(x, y, rot, s)}><g${fl(c)}><path d="${d}" fill="${c.lg('bnw', [[0, '#ffe766'], [0.5, '#f5c51a'], [1, '#d09a0a']])}"/><path d="M-80 -2C-46 30 38 32 82 -6" stroke="#fff6b0" stroke-width="3" fill="none" opacity=".75"/><path d="M-84 6C-50 40 40 42 84 2" stroke="#b88a10" stroke-width="2" fill="none" opacity=".5"/><path d="M-84 -6C-90 -8 -96 -12 -98 -16L-94 -20C-90 -14 -86 -12 -80 -10Z" fill="#7a5a1c"/><circle cx="84" cy="-4" r="4" fill="#3a2a10"/>${tache(c, -20, 26, 3, 2, '#7a5014', 0.5, 0.6)}${tache(c, 30, 24, 2.5, 1.6, '#7a5014', 0.5, 0.6)}</g></g>`;
}
function kiwis(c, pts, k = 1.25) {
  const id = c.sym('kiw', () => {
    let s = `<circle r="24" fill="#7a5a2c"/><circle r="22.4" fill="${c.rc('kif', [[0, '#f4f4c6'], [0.28, '#c6df63'], [0.75, '#86bd34'], [1, '#5c9a24']])}"/><g stroke="#e0f09a" stroke-width=".8" opacity=".55">`;
    for (let k = 0; k < 16; k++) { const [x0, y0] = rotp(6, 0, k * 22.5), [x1, y1] = rotp(20, 0, k * 22.5 + 4); s += `<path d="M${P(x0, y0)}L${P(x1, y1)}"/>`; }
    s += '</g><g fill="#1c160c">';
    for (let k = 0; k < 22; k++) { const a = k * (360 / 22), rr = k % 2 ? 9 : 10.8, [x, y] = rotp(rr, 0, a); s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.5" ry=".7" transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`; }
    return s + `</g><ellipse rx="5.5" ry="4" fill="#f7f4d6"/>` + reflet(c, -9, -11, 7, 2.2, -40, 0.5, 0.8);
  });
  return G(pts.map(([x, y]) => use(id, x, y, c.rnd(0, 360), k * c.rnd(0.95, 1.05))).join(''), fl(c));
}
function orangeDemi(c, x, y, rot = 0, s = 1) {
  const id = c.sym('orh', () => {
    let s2 = `<path d="M-27 0A27 27 0 0 0 27 0Z" fill="#ec7a0e"/><path d="M-24.5 0A24.5 24.5 0 0 0 24.5 0Z" fill="#fff0d4"/>`;
    for (let k = 0; k < 5; k++) {
      const a0 = k * 36 + 2.5, a1 = (k + 1) * 36 - 2.5, [x0, y0] = rotp(22.5, 0, a0), [x1, y1] = rotp(22.5, 0, a1), [xm, ym] = rotp(2.5, 0, (a0 + a1) / 2);
      s2 += `<path d="M${P(xm, ym)}L${P(x0, y0)}A22.5 22.5 0 0 1 ${P(x1, y1)}Z" fill="${c.rc('orf', [[0, '#ffd27a'], [1, '#f88a12']], { r: 0.7 })}"/>`;
    }
    return s2 + `<path d="M-26 1H26" stroke="#c45f08" stroke-width="1.4" opacity=".5"/>` + reflet(c, -6, 10, 7, 2, -10, 0.45, 0.8);
  });
  return use(id, x, y, rot, s, fl(c, 2));
}
function pommeEntiere(c, x, y, r = 52, cuite = false) {
  const fill = cuite ? c.rg('pmc', [[0, '#e8743e'], [0.55, '#b5301a'], [1, '#64140c']]) : c.rg('pmw', [[0, '#ff8a6a'], [0.5, '#df3226'], [1, '#8e1414']]);
  let stries = '';
  for (let k = 0; k < 10; k++) { const a = k * 36 + c.rnd(-8, 8), [x1, y1] = rotp(r * c.rnd(0.6, 0.9), 0, a); stries += `<path d="M${P(x, y)}Q${P(x + x1 * 0.5 + 4, y + y1 * 0.5 - 4)} ${P(x + x1, y + y1)}" stroke="${cuite ? '#4a0c06' : '#f6c24a'}" stroke-width="${cuite ? 1.6 : 2.4}" opacity="${cuite ? 0.35 : 0.22}" fill="none"/>`; }
  const cuv = `<circle cx="${x}" cy="${y}" r="${f(r * 0.24)}" fill="${c.rc('pmcv', [[0, '#4a0a06', 0.6], [1, '#4a0a06', 0]])}"/>`;
  const top = cuite ? `<circle cx="${x}" cy="${y}" r="${f(r * 0.32)}" fill="${c.rc('pmin', [[0, '#f6d48a'], [0.7, '#e2a24a'], [1, '#a5541a']])}"/>` + cannelle(c, x, y, r * 0.3, 30)
    : cuv + `<path d="M${x} ${y}q3 -9 9 -14" stroke="#5a3a1a" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M${x + 7} ${y - 10}c10 -10 22 -8 26 -4c-8 8 -18 10 -26 4Z" fill="#4c9a2a"/><path d="M${x + 7} ${y - 10}c8 -2 14 -3 26 -4" stroke="#a6dc7a" stroke-width=".8" fill="none"/>`;
  return G(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>${stries}${top}`, fl(c)) + reflet(c, x - r * 0.42, y - r * 0.45, r * 0.26, r * 0.13, -40, cuite ? 0.6 : 0.55, 2) + reflet(c, x - r * 0.55, y - r * 0.1, r * 0.06, r * 0.04, 0, 0.7, 0.5);
}
function pommeTranches(c, x, y, { n = 6, rot = 0 } = {}) {
  const id = c.sym('pmt', () => `<path d="M-32 4C-24 -26 24 -26 32 4C18 -1 -18 -1 -32 4Z" fill="${c.rg('pmtf', [[0, '#fffcea'], [0.6, '#f7eccc'], [1, '#e2cf98']])}"/><path d="M-32 4C-24 -26 24 -26 32 4" stroke="#c42820" stroke-width="3.6" stroke-linecap="round" fill="none"/><path d="M-22 -10C-12 -18 12 -18 22 -10" stroke="#fff" stroke-width="1.2" opacity=".6" fill="none"/><ellipse cx="0" cy="-1" rx="2.4" ry="1.4" fill="#6b3c1a"/>`);
  let o = '';
  for (let i = 0; i < n; i++) o += use(id, (i - (n - 1) / 2) * 13, Math.abs(i - (n - 1) / 2) * 4, (i - (n - 1) / 2) * 9, 1, fl(c, 2));
  return `<g${tr(x, y, rot)}>${o}</g>`;
}
function amandes(c, pts, s = 1) {
  const id = c.sym('amd', () => `<path d="M0 -11C6.5 -8 7.5 4 0 11.5C-7.5 4 -6.5 -8 0 -11Z" fill="${c.rg('amf', [[0, '#dca06a'], [0.55, '#a8682e'], [1, '#6a3a16']])}"/><path d="M-2 -6Q-3 2 -1 8M2 -5Q2.5 2 1.5 7" stroke="#6a3814" stroke-width=".6" fill="none" opacity=".6"/>` + reflet(c, -2.5, -4, 1.6, 3.2, 15, 0.45, 0.5));
  return G(byDepth(pts).map(([x, y]) => use(id, x, y, c.rnd(0, 360), s * c.rnd(0.9, 1.1))).join(''), fl(c, 2));
}
function cacahuetes(c, pts) {
  const id = c.sym('cac', () => `<ellipse rx="5.8" ry="4.2" fill="${c.rg('ccf', [[0, '#f8deaa'], [0.55, '#e0ae66'], [1, '#a87638']])}"/><path d="M0 -4V4" stroke="#b58046" stroke-width=".7" opacity=".7"/>`);
  return G(pts.map(([x, y]) => use(id, x, y, c.rnd(0, 360), c.rnd(0.8, 1.05))).join(''), fl(c, 2));
}
function beurreCacahuete(c, x, y, r) {
  const d = blob(c, x, y, r, r * 0.9, 0.1, 9);
  const pts = []; for (let t = 0; t <= 1; t += 0.06) { const a = t * TAU * 1.5, rr = r * 0.75 * (1 - t) + 2; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9]); }
  const sp = smoothPath(pts, false);
  return G(`<path d="${d}" fill="${c.rg('bcc', [[0, '#e8b06a'], [0.55, '#c68840'], [1, '#93581f']])}"/><path d="${sp}" stroke="#8e521c" stroke-width="2.6" fill="none" opacity=".55"/><path d="${sp}" stroke="#f6cf92" stroke-width="1.4" fill="none" opacity=".8" transform="translate(-1.5 -1.5)"/>`, fl(c)) + reflet(c, x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.1, -35, 0.7, 1);
}
function ramequin(c, x, y, r, contenu) {
  return `<circle cx="${x + 4}" cy="${y + 6}" r="${r}" fill="#2b1d12" opacity=".25" filter="${c.blur(5)}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c.lg('rq', [[0, '#ffffff'], [1, '#d8d8e0']], 0.15, 0.1, 0.85, 0.95)}"/><circle cx="${x}" cy="${y}" r="${f(r - 4)}" fill="${c.lg('rqw', [[0, '#c9c9d3'], [1, '#ffffff']], 0.2, 0.15, 0.8, 0.9)}"/>` +
    `<g clip-path="${c.clip(`<circle cx="${x}" cy="${y}" r="${f(r - 8)}"/>`)}">${contenu}<circle cx="${x}" cy="${y}" r="${f(r - 8)}" fill="${c.rc('bsh', [[0.7, '#000', 0], [0.93, '#1a1208', 0.18], [1, '#1a1208', 0.4]], { cx: 0.56, cy: 0.58, r: 0.6 })}"/></g>`;
}
function chocolat(c, x, y, rot = 0, s = 1) {
  const id = c.sym('choc', () => `<rect x="-15" y="-15" width="30" height="30" rx="2.5" fill="#2e170c"/><rect x="-11.5" y="-11.5" width="23" height="23" rx="1.5" fill="${c.lg('chcl', [[0, '#7c4b2c'], [0.5, '#5a321c'], [1, '#3a1d0e']], 0, 0, 1, 1)}"/><path d="M-15 -15H15L11.5 -11.5H-11.5V11.5L-15 15Z" fill="#9a6a48" opacity=".5"/><path d="M15 15H-15L-11.5 11.5H11.5V-11.5L15 -15Z" fill="#1a0c04" opacity=".5"/><path d="M-9 -8L0 -9.5" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>`);
  return use(id, x, y, rot, s, fl(c));
}
function copeaux(c, area, n) {
  let o = '';
  for (const [x, y] of scatter(c, n, area)) o += `<path d="M${P(x, y)}q${P(c.rnd(2, 4), c.rnd(-3, -1))} ${P(c.rnd(5, 8), 0)}" stroke="${c.pick(['#4a2614', '#6a3a1e', '#2e170c'])}" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  return G(o, fl(c, 2));
}
function galetteRiz(c, x, y, r = 58) {
  const puff = tilePat(c, 'puff', 13, null, 9, () => {
    const rx = c.rnd(2, 3.6), ry = c.rnd(1.4, 2.4), a = c.rnd(0, 180), col = c.pick(['#fffaf0', '#e2c690', '#f6e6c4', '#d4b27a']);
    return { m: 4, s: (X, Y) => `<ellipse cx="${f(X)}" cy="${f(Y)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(a)} ${f(X)} ${f(Y)})" fill="${col}" opacity=".85"/>` };
  });
  return G(`<circle cx="${x}" cy="${y}" r="${r}" fill="${c.rg('glr', [[0, '#fbf2dc'], [0.6, '#efdcb0'], [1, '#cfab70']])}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${puff}"/><circle cx="${x}" cy="${y}" r="${r - 1.5}" fill="none" stroke="#c49a5c" stroke-width="3" opacity=".6"/>${volume(c, `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`, 0.6)}`, fl(c));
}

// sauces, crèmes et céréales
function yaourtSurface(c, cx, cy, R, { teinte = 'blanc', spirale = true } = {}) {
  const fill = teinte === 'blanc' ? c.rc('yof', [[0, '#ffffff'], [0.6, '#f9f7f2'], [1, '#e9e4d9']], { cx: 0.45, cy: 0.42 }) : teinte;
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${fill}"/>`;
  if (spirale) {
    const pts = []; for (let t = 0; t <= 1; t += 0.025) { const a = t * TAU * 2.6, rr = R * 0.85 * (1 - t) + 4; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    const sp = smoothPath(pts, false);
    s += `<path d="${sp}" stroke="#ddd6c8" stroke-width="5" fill="none" opacity=".7" filter="${c.blur(1.2)}"/><path d="${sp}" stroke="#fff" stroke-width="2.4" fill="none" transform="translate(-2.5 -2.5)" opacity=".95"/>`;
  }
  return s + reflet(c, cx - R * 0.4, cy - R * 0.45, R * 0.22, R * 0.08, -40, 0.6, 3);
}
function dollop(c, x, y, r, cols = ['#ffffff', '#f8f6f1', '#e3ddd0']) {
  const d = blob(c, x, y, r, r * 0.92, 0.1, 9);
  const pts = []; for (let t = 0; t <= 1; t += 0.05) { const a = t * TAU * 1.7, rr = r * 0.78 * (1 - t) + 2; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.95]); }
  const sp = smoothPath(pts, false);
  return G(`<path d="${d}" fill="${c.rg('dol' + cols[0].slice(1), [[0, cols[0]], [0.6, cols[1]], [1, cols[2]]])}"/><path d="${sp}" stroke="${cols[2]}" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="${sp}" stroke="#fff" stroke-width="1.4" fill="none" transform="translate(-1.3 -1.3)" opacity=".9"/>`, fl(c)) + reflet(c, x - r * 0.35, y - r * 0.42, r * 0.25, r * 0.12, -35, 0.85, 1.2);
}
function filetCreme(c, pts, w = 3.2, col = '#fffdf8') {
  const d = smoothPath(pts, false);
  return `<path d="${d}" stroke="#000" stroke-opacity=".12" stroke-width="${w + 1.5}" fill="none" stroke-linecap="round" transform="translate(1 1.5)"/><path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
}
function miel(c, pts, w = 4.5) {
  const d = smoothPath(pts, false);
  return `<path d="${d}" stroke="#7a4400" stroke-opacity=".25" stroke-width="${w + 2}" fill="none" stroke-linecap="round" transform="translate(1.5 2)" filter="${c.blur(1)}"/><path d="${d}" stroke="#d48806" stroke-width="${w + 1}" fill="none" stroke-linecap="round" opacity=".95"/><path d="${d}" stroke="#f5b324" stroke-width="${w * 0.7}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fff3c0" stroke-width="${f(w * 0.25)}" fill="none" stroke-linecap="round" transform="translate(-.8 -.9)" opacity=".9"/>`;
}
function boucles(x0, y0, x1, y1, n, amp) {
  const pts = [], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  for (let i = 0; i <= n * 14; i++) { const t = i / (n * 14), ph = t * n * TAU, a = Math.sin(ph) * amp, b = Math.cos(ph) * amp * 0.12; pts.push([x0 + dx * t - uy * a + ux * b, y0 + dy * t + ux * a + uy * b]); }
  return pts;
}
function spirale(cx, cy, R, tours, r0 = 6) {
  const pts = [], n = Math.round(tours * 18);
  for (let i = 0; i <= n; i++) { const t = i / n, a = t * tours * TAU + 0.6; pts.push([cx + Math.cos(a) * (r0 + (R - r0) * t), cy + Math.sin(a) * (r0 + (R - r0) * t)]); }
  return pts;
}
function zigzag(x0, y0, x1, y1, n, amp) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny), k = (i % 2 ? 1 : -1) * amp; pts.push([x0 + (x1 - x0) * t + (nx / L) * k, y0 + (y1 - y0) * t + (ny / L) * k]); }
  return pts;
}
function flocons(c, area, n, s = 1) {
  const id = c.def('flk', (i) => `<path id="${i}" d="M-4.6 -1.6C-3 -3.8 2.6 -3.9 4.5 -1.8C5.7 .3 3.6 3.1 .4 3.3C-3 3.5 -5.7 .8 -4.6 -1.6Z"/>`);
  let o = '';
  for (const [x, y] of scatter(c, n, area)) o += use('#' + id, x, y, c.rnd(0, 360), s * c.rnd(0.85, 1.35), ` fill="${c.pick(['#f1deb0', '#e3c993', '#f7ebcc', '#d6b77c', '#ecd4a2'])}"`);
  return G(o, ` stroke="#c39c62" stroke-width=".45"${fl(c, 2)}`);
}
function porridgeFond(c, R = 152, base = ['#f5e9cf', '#e8d4a8', '#c9a874'], nb = 150) {
  const id = '#' + c.def('flk', (i) => `<path id="${i}" d="M-4.6 -1.6C-3 -3.8 2.6 -3.9 4.5 -1.8C5.7 .3 3.6 3.1 .4 3.3C-3 3.5 -5.7 .8 -4.5 -1.6Z"/>`);
  let noy = '';
  for (const [x, y] of scatter(c, nb, ell(200, 200, R))) noy += use(id, x, y, c.rnd(0, 360), c.rnd(0.9, 1.5), ` fill="${c.pick(['#fbf2dc', '#dcc290', '#efdcb4', '#d2b47e'])}" opacity="${f2(c.rnd(0.35, 0.75))}"`);
  let creme = '';
  for (let i = 0; i < 7; i++) { const [x, y] = ell(200, 200, R * 0.8)(c); creme += `<path d="M${P(x - 22, y)}q22 ${f(c.rnd(-12, -6))} 44 0" stroke="#fffaf0" stroke-width="3" fill="none" opacity=".45" filter="${c.blur(1.2)}"/>`; }
  return `<circle cx="200" cy="200" r="${R}" fill="${c.rc('pof', [[0, base[0]], [0.7, base[1]], [1, base[2]]], { cx: 0.45, cy: 0.42 })}"/>` + noy + creme + flocons(c, ell(200, 200, R * 0.92), 26);
}
function brillances(c, cx, cy, rx, ry, n) {
  let gl = '';
  for (let i = 0; i < n; i++) { const [x, y] = ell(cx, cy, rx, ry)(c); gl += reflet(c, x, y, c.rnd(2, 5), c.rnd(1, 2), c.rnd(-60, 0), c.rnd(0.3, 0.55), 0.6); }
  return gl;
}
function sauce(c, cx, cy, rx, ry, cols, { irr = 0.1, n = 11, gloss = 7 } = {}) {
  const d = blob(c, cx, cy, rx, ry, irr, n);
  let gl = '';
  for (let i = 0; i < gloss; i++) { const [x, y] = ell(cx - rx * 0.15, cy - ry * 0.15, rx * 0.7, ry * 0.7)(c); gl += reflet(c, x, y, c.rnd(2, 5), c.rnd(1, 2), c.rnd(-60, 0), c.rnd(0.3, 0.55), 0.6); }
  return { d, svg: G(`<path d="${d}" fill="${c.rg('sc' + cols[0].slice(1), [[0, cols[0]], [0.6, cols[1]], [1, cols[2]]])}"/>${volume(c, d, 0.5)}`, fl(c)) + gl };
}
function surface(c, cols, R = 152) {
  return `<circle cx="200" cy="200" r="${R}" fill="${c.rc('sf' + cols[0].slice(1), [[0, cols[0]], [0.65, cols[1]], [1, cols[2]]], { cx: 0.45, cy: 0.42 })}"/>`;
}
function hachis(c, area, n, cols = ['#6b3420', '#8a4527', '#5a2a18', '#a5502c', '#4a2010']) {
  let o = '';
  for (const [x, y] of scatter(c, n, area)) o += `<path d="${blob(c, x, y, c.rnd(2.5, 4.5), c.rnd(2, 3.5), 0.35, 5, c.rnd(0, 180))}" fill="${c.pick(cols)}"/>`;
  return G(o, fl(c, 2));
}
function spaghetti(c, cx, cy, R, n = 60, cols = ['#d39f45', '#f0c977', '#fde9b0']) {
  let base = '', hl = '';
  for (let i = 0; i < n; i++) {
    const ox = cx + c.rnd(-R * 0.25, R * 0.25), oy = cy + c.rnd(-R * 0.25, R * 0.25), r = c.rnd(R * 0.3, R * 0.78), a0 = c.rnd(0, TAU), sw = c.rnd(1.2, 2.6);
    const p0 = [ox + Math.cos(a0) * r, oy + Math.sin(a0) * r], p1 = [ox + Math.cos(a0 + sw) * r, oy + Math.sin(a0 + sw) * r];
    const d = `M${P(...p0)}A${f(r)} ${f(r)} 0 0 1 ${P(...p1)}`;
    base += `<path d="${d}"/>`; hl += `<path d="${d}"/>`;
  }
  return `<g fill="none" stroke-linecap="round"${fl(c)}><g stroke="${cols[0]}" stroke-width="5">${base}</g><g stroke="${cols[1]}" stroke-width="3.4">${base}</g><g stroke="${cols[2]}" stroke-width="1.2" opacity=".85" transform="translate(-.8 -.9)">${hl}</g></g>`;
}
function penne(c, pts, cols = ['#f8dc8f', '#e9b85a', '#c48a34']) {
  const id = c.sym('pen' + cols[0].slice(1), () => `<path d="M-15 -5.5L11 -5.5L15 5.5L-11 5.5Z" fill="${c.lg('pnf' + cols[0].slice(1), [[0, cols[0]], [0.55, cols[1]], [1, cols[2]]])}" stroke-linejoin="round" stroke="${cols[2]}" stroke-width="1.2"/><path d="M-12 -2.6H12M-11 0H13M-10 2.6H14" stroke="${cols[2]}" stroke-width=".6" opacity=".6"/><ellipse cx="13" cy="0" rx="2" ry="5.2" transform="rotate(-20 13 0)" fill="${cols[2]}" opacity=".9"/><ellipse cx="13" cy="0" rx="1.1" ry="3.6" transform="rotate(-20 13 0)" fill="#7a4a12" opacity=".7"/><path d="M-12 -4H9" stroke="#fff6d0" stroke-width="1.1" opacity=".7"/>`);
  return G(byDepth(pts).map(([x, y]) => use(id, x, y, c.rnd(0, 360))).join(''), fl(c, 2));
}
function croutons(c, pts) {
  const id = c.sym('crt', () => `<rect x="-7" y="-7" width="14" height="14" rx="3" fill="${c.rg('crtf', [[0, '#f0c27a'], [0.55, '#c98a42'], [1, '#8a5420']])}"/><circle cx="-2" cy="-1" r="1" fill="#6a3c14"/><circle cx="3" cy="2.5" r=".9" fill="#6a3c14"/>`);
  return G(pts.map(([x, y]) => use(id, x, y, c.rnd(0, 90), c.rnd(0.85, 1.1))).join(''), fl(c, 2));
}

// herbes et assaisonnements
function persil(c, x, y, rot = 0, s = 1) {
  const id = c.sym('per', () => `<path d="M0 0C-4 -3 -10 -4 -11 -10C-8 -13 -4 -12 -2.5 -9.5C-3 -14 1 -16 3.5 -13C6 -15 10.5 -12 9 -8C7 -4.5 3.5 -2 0 0Z" fill="${c.rg('perf', [[0, '#6cbf48'], [0.6, '#3a8a26'], [1, '#225a16']])}"/><path d="M0 0L-6 -8M0 0L2 -11M0 0L6 -7" stroke="#8fd06a" stroke-width=".7" opacity=".7"/>`);
  return use(id, x, y, rot, s, fl(c, 2));
}
function persils(c, pts, s = 0.8) { return pts.map(([x, y]) => persil(c, x, y, c.rnd(0, 360), s * c.rnd(0.8, 1.2))).join(''); }
function basilic(c, x, y, rot = 0, s = 1) {
  const id = c.sym('bas', () => `<path d="M0 -16C10 -12 11 6 0 15C-11 6 -10 -12 0 -16Z" fill="${c.rg('basf', [[0, '#7acc52'], [0.55, '#3e8e26'], [1, '#1f5a14']])}"/><path d="M0 -13V15" stroke="#9ad87a" stroke-width="1"/><path d="M0 -4L6 -8M0 3L-6 -1M0 8L6 4M0 -2L-6 -6" stroke="#8acb68" stroke-width=".6" opacity=".7"/>` + reflet(c, -3.5, -5, 2.2, 6, 10, 0.4, 0.8));
  return use(id, x, y, rot, s, fl(c, 2));
}
function aneth(c, x, y, rot = 0, s = 1) {
  let d = 'M-16 0Q0 -3 16 1';
  for (let i = -12; i <= 12; i += 4) d += `M${i} ${f(-1 + i * 0.03)}l${f(c.rnd(-3, 3))} ${f(c.rnd(-7, -4))}M${i} ${f(-0.6)}l${f(c.rnd(-3, 3))} ${f(c.rnd(4, 7))}`;
  return `<path d="${d}"${tr(x, y, rot, s)} stroke="#4f9030" stroke-width="1" fill="none" stroke-linecap="round"${fl(c, 2)}/>`;
}
function coriandre(c, pts, s = 0.75) { return pts.map(([x, y]) => persil(c, x, y, c.rnd(0, 360), s * c.rnd(0.8, 1.15))).join(''); }
function ciboulette(c, cx, cy, rx, ry, n) {
  let o = '';
  for (const [x, y] of scatter(c, n, ell(cx, cy, rx, ry))) o += `<circle cx="${f(x)}" cy="${f(y)}" r="1.8"/>`;
  return G(o, ` fill="#4c9a2a" stroke="#2a6614" stroke-width=".6"`);
}
function poivre(c, cx, cy, rx, ry, n) {
  let o = '';
  for (const [x, y] of scatter(c, n, ell(cx, cy, rx, ry))) o += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(c.rnd(0.6, 1.1))}"/>`;
  return G(o, ' fill="#2a2018" opacity=".8"');
}
function sel(c, pts) {
  let o = '';
  for (const [x, y] of pts) for (let i = 0; i < 2; i++) o += `<rect x="${f(x + c.rnd(-8, 8))}" y="${f(y + c.rnd(-8, 8))}" width="1.6" height="1.6" fill="#fff"/>`;
  return o;
}
function sesame(c, area, n, noir = 0.25) {
  let o = '';
  for (const [x, y] of scatter(c, n, area)) { const a = c.rnd(0, 180); o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.9" ry="1.1" transform="rotate(${f(a)} ${f(x)} ${f(y)})" fill="${c.r() < noir ? '#2a2420' : '#fbf1d6'}"/>`; }
  return G(o, ' stroke="#b89a68" stroke-width=".3"');
}
function cannelle(c, cx, cy, R, n = 60) {
  let o = '';
  for (const [x, y] of scatter(c, n, ell(cx, cy, R, R))) o += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(c.rnd(0.6, 1.5))}"/>`;
  return G(o, ' fill="#8a4a1e" opacity=".55"');
}
function oignonVert(c, area, n) {
  let o = '';
  for (const [x, y] of scatter(c, n, area)) o += `<circle cx="${f(x)}" cy="${f(y)}" r="2.6" fill="none" stroke="#5aa832" stroke-width="1.6"/><circle cx="${f(x)}" cy="${f(y)}" r="1.1" fill="#d8f0b0"/>`;
  return G(o, fl(c, 2));
}

// pains garnis, wraps, tacos, burger
function tortillaPat(c) {
  return tilePat(c, 'torp', 34, null, 7, () => {
    const r = c.rnd(2.5, 6), col = c.pick(['#b06c24', '#c08032', '#a05e1c']);
    return { m: 9, s: (X, Y) => `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(r * 1.5)}" fill="${c.rc('tsp' + col.slice(1), [[0, col, 0.4], [1, col, 0]])}"/>` };
  });
}
function wrapMoitie(c, x, y, rot, { L = 140, R = 30, avocat = false } = {}) {
  const tort = tortillaPat(c);
  const body = `M${L / 2} ${-R}L${f(-L / 2 + R * 0.6)} ${-R}Q${f(-L / 2 - R * 0.45)} 0 ${f(-L / 2 + R * 0.6)} ${R}L${L / 2} ${R}Z`;
  const ex = L / 2, rx = R * 0.62;
  const face = `<ellipse cx="${ex}" cy="0" rx="${f(rx)}" ry="${R}" fill="#f2dcab" stroke="#d2a868" stroke-width="1.2"/><ellipse cx="${ex}" cy="0" rx="${f(rx * 0.82)}" ry="${f(R * 0.86)}" fill="#fbf8f0"/>`;
  const fcl = c.clip(`<ellipse cx="${ex}" cy="0" rx="${f(rx * 0.82)}" ry="${f(R * 0.86)}"/>`);
  let fill = '';
  const items = [['#f2c27a', 0.24, -0.45], ['#5aa032', 0.2, -0.12], [avocat ? '#bcd65e' : '#e2321c', 0.17, 0.2], ['#e9b066', 0.21, 0.5], ['#9fd05a', 0.15, 0.75], ['#e2321c', 0.13, -0.72], [avocat ? '#cfe07a' : '#86b84a', 0.15, 0.02], ['#f2c27a', 0.18, 0.28]];
  for (const [col, r, yy] of items) fill += `<ellipse cx="${f(ex + c.rnd(-rx * 0.3, rx * 0.3))}" cy="${f(yy * R)}" rx="${f(r * R * 0.8)}" ry="${f(r * R)}" fill="${col}"/>`;
  const salade = `<path d="${blob(c, ex + 6, -4, 10, R * 0.95, 0.3, 12)}" fill="#7cc04a" stroke="#4f8a24" stroke-width=".8"/>`;
  return `<g${tr(x, y, rot)}><g${fl(c)}>${salade}<path d="${body}" fill="${c.lg('tor', [[0, '#fbebc4'], [0.45, '#efd296'], [1, '#c99456']])}"/><path d="${body}" fill="${tort}"/><g clip-path="${c.clip(`<path d="${body}"/>`)}" stroke="#8e5218" stroke-width="3" opacity=".2" stroke-linecap="round">${[-0.4, -0.2, 0, 0.2].map((k) => `<path d="M${f(L * k)} ${-R}l${f(R * 0.7)} ${2 * R}"/>`).join('')}</g><path d="M${f(L * 0.05)} ${-R}C${f(L * 0.2)} ${f(-R * 0.4)} ${f(L * 0.3)} ${f(-R * 0.1)} ${f(L * 0.45)} ${f(-R * 0.05)}" stroke="#c9a061" stroke-width="1.3" fill="none" opacity=".7"/>${face}<g clip-path="${fcl}">${fill}</g></g>${reflet(c, -L * 0.15, -R * 0.55, L * 0.25, 2.5, 0, 0.5, 1.5)}</g>`;
}
function taco(c, x, y, rot) {
  const L = 150, W = 72;
  const ins = `M${-L / 2 + 8} 0C${-L / 4} ${-W / 2 + 4} ${L / 4} ${-W / 2 + 4} ${L / 2 - 8} 0C${L / 4} ${W / 2 - 4} ${-L / 4} ${W / 2 - 4} ${-L / 2 + 8} 0Z`;
  let o = `<ellipse rx="${L / 2}" ry="${W / 2}" fill="${c.lg('tac', [[0, '#f8deA0'], [0.5, '#e8bf72'], [1, '#b8803c']])}"/><ellipse rx="${L / 2}" ry="${W / 2}" fill="${tortillaPat(c)}"/>`;
  o += `<path d="${ins}" fill="#4a2a10" opacity=".4" transform="translate(1 2)" filter="${c.blur(2)}"/>`;
  const cl = c.clip(`<path d="${ins}"/>`);
  let fill = `<path d="${ins}" fill="#6fb23e"/>`;
  for (let i = 0; i < 26; i++) { const x0 = c.rnd(-L * 0.4, L * 0.4), y0 = c.rnd(-W * 0.3, W * 0.3); fill += `<path d="M${P(x0, y0)}l${P(c.rnd(-9, 9), c.rnd(-4, 4))}" stroke="${c.pick(['#b8e07a', '#4c9a2a', '#d6f0a0'])}" stroke-width="2.2" stroke-linecap="round"/>`; }
  for (let i = 0; i < 9; i++) fill += `<path d="${blob(c, c.rnd(-L * 0.32, L * 0.32), c.rnd(-8, 8), c.rnd(8, 11), c.rnd(6, 8), 0.2, 6)}" fill="${c.rg('chm', [[0, '#f8d8a2'], [0.55, '#e3a65c'], [1, '#b8742e']])}"/>`;
  return `<g${tr(x, y, rot)}><g${fl(c)}>${o}<g clip-path="${cl}">${fill}</g><path d="${ins}" fill="none" stroke="#fbeec8" stroke-width="2"/></g></g>`;
}
function burger(c, x, y, r = 84) {
  const laitue = `<path d="${blob(c, x, y, r + 12, r + 10, 0.07, 26)}" fill="${c.rg('blt', [[0, '#c6ea80'], [0.7, '#86c440'], [1, '#4c8a22']])}" stroke="#3e7a1c" stroke-width="1"/>`;
  let peek = '';
  for (const a of [30, 150, 250]) { const [px, py] = rotp(r + 2, 0, a); peek += `<ellipse cx="${f(x + px)}" cy="${f(y + py)}" rx="16" ry="9" transform="rotate(${a + 90} ${f(x + px)} ${f(y + py)})" fill="#e2321c" stroke="#a8160c" stroke-width="1"/>`; }
  for (const a of [95, 205, 330]) { const [px, py] = rotp(r + 3, 0, a); peek += `<ellipse cx="${f(x + px)}" cy="${f(y + py)}" rx="14" ry="6" transform="rotate(${a + 90} ${f(x + px)} ${f(y + py)})" fill="#5a2a14"/>`; }
  for (const a of [60, 280]) { const [px, py] = rotp(r + 1, 0, a); peek += `<path d="M${P(x + px - 8, y + py)}q8 -5 16 0" stroke="#9b3f7e" stroke-width="3" fill="none"/>`; }
  let graines = '';
  for (const [px, py] of scatter(c, 34, ell(x, y, r * 0.78, r * 0.78), 10)) { const a = c.rnd(0, 180); graines += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="2.8" ry="1.5" transform="rotate(${f(a)} ${f(px)} ${f(py)})" fill="${c.pick(['#fbf0d0', '#f3e2b4', '#e8d4a0'])}"/>`; }
  return G(laitue + peek, fl(c)) + G(`<circle cx="${x}" cy="${y}" r="${r}" fill="${c.rg('bun', [[0, '#e7a45c'], [0.55, '#b06a2a'], [1, '#6e3a12']])}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${tortillaPat(c)}"/><g stroke="#8a5a22" stroke-width=".4">${graines}</g>`, fl(c, 3)) + reflet(c, x - r * 0.38, y - r * 0.42, r * 0.3, r * 0.14, -40, 0.4, 4);
}

/* ───────────────────────── 4. Recettes ───────────────────────── */
// Raccourcis de zones
const E = (cx, cy, rx, ry) => ell(cx, cy, rx, ry ?? rx);
const R = {};

// ---- petit-déjeuner
R['porridge-banane'] = (c) => bol(c, porridgeFond(c) +
  bananes(c, arcPts(98, 186, 300, 138, -40, 9)) + dollop(c, 250, 262, 40) + flocons(c, E(140, 270, 34, 26), 14));
R['omelette-epinards'] = (c) => assiette(c,
  pain(c, 278, 270, { w: 84, h: 92, rot: 24 }) + pain(c, 300, 238, { w: 84, h: 92, rot: 8 }) +
  omelette(c, 178, 170, { r: 86, rot: -14, garniture: [-50, -25, 0, 25, 50].map((xx) => pousseEpinard(c, xx, -8, 180 + c.rnd(-30, 30), 1.1)).join('') }) +
  [[118, 268], [146, 292], [176, 280]].map(([x, y]) => pousseEpinard(c, x, y, c.rnd(0, 360), 1.1)).join(''));
R['skyr-fruits-rouges'] = (c) => bol(c, yaourtSurface(c, 200, 200, 152) +
  fraises(c, [[214, 98, -20], [256, 108, 15], [292, 136, 40], [240, 146, -5]], 1.3) +
  myrtilles(c, scatter(c, 16, E(296, 214, 36, 46), 17), 1.25) +
  framboises(c, scatter(c, 8, E(232, 282, 46, 28), 22), 1.25) +
  flocons(c, E(140, 262, 40, 32), 26, 1.2) + amandes(c, scatter(c, 7, E(116, 176, 26, 34), 18), 1.3));
R['tartines-oeufs'] = (c) => planche(c,
  pain(c, 128, 170, { w: 116, h: 124, rot: -10, garniture: oeufsBrouilles(c, 0, 4, 46, 48, 10) }) +
  pain(c, 262, 210, { w: 116, h: 124, rot: 8, garniture: avocat(c, 0, 6, { n: 6, rot: -45, s: 1.15 }) + tomate(c, 'h', 30, 42, 0, 0.85) }) +
  tomate(c, 'h', 104, 290, 20) + tomate(c, 'h', 136, 300, 80) + tomate(c, 'w', 86, 262) + tomate(c, 'h', 340, 300, 10) + tomate(c, 'w', 312, 316));
R['pancakes-avoine'] = (c) => assiette(c, (() => {
  const pk = (dx, dy, r) => `<circle cx="${195 + dx}" cy="${195 + dy}" r="${r}" fill="${c.rc('pk', [[0, '#b8702c'], [0.55, '#d4924a'], [0.9, '#efc985'], [1, '#d8a560']])}"/>`;
  return G(pk(12, 16, 92) + pk(6, 8, 92), fl(c)) + G(pk(0, 0, 92) + `<circle cx="195" cy="195" r="92" fill="${tilePat(c, 'pkp', 18, null, 4, () => { const r = c.rnd(0.6, 1.3); return { m: 2, s: (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#7a4414" opacity=".45"/>` }; })}"/>` + volume(c, 'M103 195a92 92 0 1 0 184 0a92 92 0 1 0 -184 0', 0.6), fl(c)) +
    bananes(c, [[150, 160], [168, 140], [192, 132], [216, 140], [238, 158], [150, 232], [176, 248]]) + dollop(c, 205, 196, 30) +
    miel(c, [[170, 210], [200, 228], [236, 218], [262, 236], [276, 262], [286, 286]], 5);
})());
R['grec-kiwi'] = (c) => bol(c, yaourtSurface(c, 200, 200, 152) + kiwis(c, [[238, 96], [282, 128], [302, 182], [292, 240], [258, 286], [210, 306], [244, 196]]) + flocons(c, E(140, 180, 46, 60), 40, 1.25));

// ---- midi
R['poulet-riz-brocoli'] = (c) => assiette(c, riz(c, 138, 158, 62, 56) + persils(c, [[132, 146]], 0.6) +
  poulet(c, 262, 176, { len: 128, h: 74, n: 6, rot: 64 }) +
  brocoli(c, 112, 248, 1, 200, 0) + brocoli(c, 152, 282, 1.05, 150, 1) + brocoli(c, 198, 272, 0.95, 120, 2) + brocoli(c, 168, 232, 0.9, 170, 0));
R['dinde-patate-douce'] = (c) => assiette(c,
  haricots(c, 205, 282, { n: 12, len: 160, rot: -12 }) +
  patateDouceCubes(c, scatter(c, 12, E(268, 172, 44, 50), 19)) +
  escalope(c, 142, 152, { w: 132, h: 86, rot: 25 }) + persils(c, [[132, 146], [150, 160]], 0.6));
R['steak-pdt-salade'] = (c) => assiette(c,
  salade(c, 210, 268, 70, 34, 6) + tomate(c, 'q', 180, 262, 20) + tomate(c, 'q', 232, 280, -30) + tomate(c, 'q', 256, 250, 60) +
  pdtRoties(c, scatter(c, 7, E(272, 162, 40, 48), 30)) + steak(c, 145, 165, 56) + persils(c, [[140, 158]], 0.6));
R['pates-thon'] = (c) => assiette(c, sauce(c, 200, 198, 112, 108, ['#e8603a', '#c63a20', '#8e2210'], { gloss: 0 }).svg +
  penne(c, scatter(c, 52, E(200, 198, 98, 95), 13), ['#f9b77a', '#e98d48', '#b85c22']) +
  [[150, 160], [250, 145], [262, 240], [140, 250], [208, 280], [180, 120]].map(([x, y]) => courgetteDemi(c, x, y, c.rnd(0, 360))).join('') +
  thon(c, 200, 192, 46, 40, 18) + tomate(c, 'h', 128, 196, 0, 1) + tomate(c, 'h', 270, 196, 0, 1) + tomate(c, 'h', 218, 120, 0, 0.9) +
  basilic(c, 196, 186, 30, 0.9) + basilic(c, 214, 200, 110, 0.75));
R['wrap-poulet'] = (c) => planche(c,
  wrapMoitie(c, 160, 140, 18, { L: 160, R: 38 }) + wrapMoitie(c, 172, 238, 18, { L: 160, R: 38 }) +
  ramequin(c, 310, 112, 36, yaourtSurface(c, 310, 112, 30, { spirale: false }) + ciboulette(c, 310, 112, 16, 16, 8)) +
  [[310, 228], [330, 258], [302, 262]].map(([x, y]) => concombre(c, x, y)).join('') + tomate(c, 'q', 300, 310, 20) + tomate(c, 'q', 250, 318, -40));
R['buddha-pois-chiche'] = (c) => bol(c, quinoaFond(c) +
  poisChiches(c, scatter(c, 24, sect(160, 245, 50, 140), 16), 1.3) +
  carotteRapee(c, sect(250, 322, 46, 140), 70) +
  [...scatter(c, 6, sect(328, 392, 60, 126), 30)].map(([x, y]) => concombre(c, x, y, 1.4)).join('') +
  avocat(c, 224, 290, { n: 6, rot: 20, s: 1.35 }) +
  oeufDur(c, 196, 196, -20, 1.35) + sesame(c, E(200, 200, 120), 40));
R['saumon-riz-epinards'] = (c) => assiette(c, riz(c, 128, 218, 55, 64) + epinards(c, 220, 278, 62, 30, 14) +
  saumon(c, 238, 165, { w: 140, h: 82, rot: -22 }) + aneth(c, 236, 160, -30, 1.2) + aneth(c, 252, 172, 20, 0.9) +
  citron(c, 'q', 304, 250, -60, 0.95));
R['chili-lentilles'] = (c) => bol(c, surface(c, ['#c84a2c', '#9a2c16', '#5e160a']) +
  lentillesPts(c, scatter(c, 44, E(200, 200, 145)), ['#7a4a28', '#8a5a30', '#5e3a1e', '#a0603a']) +
  hachis(c, E(200, 200, 140), 36) +
  des(c, scatter(c, 10, E(180, 180, 110), 18), 'rouge', 9) + des(c, scatter(c, 7, E(180, 180, 110), 18), 'vert', 9) +
  oignon(c, scatter(c, 10, E(190, 190, 110)), true) +
  brillances(c, 190, 190, 120, 120, 14) +
  riz(c, 262, 262, 58, 48) + coriandre(c, [[150, 160], [190, 130], [130, 220], [240, 170], [176, 205], [150, 270]], 0.9));
R['poke-crevettes'] = (c) => bol(c, rizFond(c) +
  julienne(c, sect(110, 185, 50, 140), 34, ['#f58a1e', '#ff9d2e', '#e8760f'], 4) +
  [...scatter(c, 6, sect(30, 105, 58, 126), 30)].map(([x, y]) => concombre(c, x, y, 1.4)).join('') +
  avocat(c, 290, 184, { n: 6, rot: 75, s: 1.35 }) +
  [[146, 132, 10], [198, 106, 40], [250, 128, 70], [176, 166, 20], [228, 164, 50]].map(([x, y, a]) => crevette(c, x, y, a, 1.5)).join('') +
  sesame(c, E(200, 200, 125), 50, 0.4) + oignonVert(c, E(200, 190, 60), 8));
R['bolognaise-boeuf'] = (c) => assiette(c, spaghetti(c, 200, 200, 128, 75) +
  (() => { const s = sauce(c, 205, 192, 64, 58, ['#d9542f', '#a92d18', '#6e1a0c'], { irr: 0.16, gloss: 8 }); return s.svg + hachis(c, E(205, 192, 54, 48), 45) + oignon(c, scatter(c, 6, E(205, 192, 46, 40)), true); })() +
  basilic(c, 196, 176, -30, 1.1) + basilic(c, 214, 182, 40, 0.9) + basilic(c, 205, 196, 160, 0.8));
R['wraps-poulet-avocat'] = (c) => planche(c,
  wrapMoitie(c, 118, 120, 14, { L: 118, R: 32, avocat: true }) + wrapMoitie(c, 262, 112, 14, { L: 118, R: 32, avocat: true }) +
  wrapMoitie(c, 128, 210, 14, { L: 118, R: 32, avocat: true }) + wrapMoitie(c, 270, 200, 14, { L: 118, R: 32, avocat: true }) +
  ramequin(c, 140, 300, 30, yaourtSurface(c, 140, 300, 24, { spirale: false }) + ciboulette(c, 140, 300, 12, 12, 6)) +
  tomate(c, 'w', 230, 300) + tomate(c, 'w', 258, 312) + tomate(c, 'h', 290, 296) + avocatDes(c, [[318, 300], [330, 284]]));
R['curry-pois-chiches'] = (c) => assiette(c, riz(c, 132, 148, 56, 50) + coriandre(c, [[128, 140]], 0.55) +
  (() => { const s = sauce(c, 228, 228, 98, 86, ['#f6b048', '#de7c20', '#a8500e'], { gloss: 8 }); return s.svg; })() +
  epinards(c, 236, 238, 70, 58, 10) + poisChiches(c, scatter(c, 24, E(228, 228, 76, 64), 13)) +
  des(c, scatter(c, 6, E(228, 228, 70, 60), 20), 'rouge', 8) +
  filetCreme(c, arcPts(176, 230, 280, 214, -26, 8), 3.6) + coriandre(c, [[210, 200], [260, 250], [196, 262], [250, 192]]));
R['tacos-poulet'] = (c) => planche(c, (() => {
  let s = '';
  for (const [x, y] of [[132, 120], [200, 200], [268, 280]]) {
    s += taco(c, x, y, -32);
    const pts = scatter(c, 8, E(x, y, 40, 14), 9).map(([px, py]) => { const [rx, ry] = rotp(px - x, py - y, -32); return [x + rx, y + ry]; });
    s += morceauxPoulet(c, pts) + tomate(c, 'd', x - 16, y + 4, 0, 0.9) + tomate(c, 'd', x + 18, y - 14, 30, 0.9) + tomate(c, 'd', x + 4, y - 4, 50, 0.9);
    s += avocatDes(c, [[x - 4, y + 8], [x + 24, y - 10], [x - 26, y + 16]]) + oignon(c, [[x + 10, y + 2], [x - 12, y + 10]], true) + coriandre(c, [[x - 8, y - 4], [x + 18, y - 8]], 0.6);
  }
  return s + citron(c, 'q', 318, 140, -30, 0.9) + citron(c, 'q', 92, 290, 140, 0.9);
})());
R['burger-maison'] = (c) => planche(c, burger(c, 152, 178, 84) + frites(c, 292, 262, 16, -30) + frites(c, 300, 176, 6, 60));
R['salade-quinoa-poulet'] = (c) => bol(c, quinoaFond(c) +
  poulet(c, 250, 150, { len: 126, h: 70, n: 6, rot: 40 }) +
  [...scatter(c, 10, sect(150, 230, 45, 130), 22)].map(([x, y]) => tomate(c, 'h', x, y, c.rnd(0, 360), 0.95)).join('') +
  des(c, scatter(c, 12, sect(240, 290, 50, 132), 15), 'rouge', 10) + des(c, scatter(c, 6, sect(240, 290, 50, 132), 15), 'jaune', 10) +
  [...scatter(c, 12, sect(60, 140, 40, 132), 16)].map(([x, y]) => `<g${tr(x, y, c.rnd(0, 90))}${fl(c, 2)}><rect x="-6" y="-6" width="12" height="12" rx="2" fill="${c.rc('cud', [[0, '#f3f9de'], [1, '#bfdc94']])}"/><rect x="-6" y="-6" width="12" height="3.4" rx="1.5" fill="#2e5a1c"/></g>`).join('') +
  citron(c, 'q', 300, 262, -40, 0.85) + persils(c, [[190, 200], [230, 230], [160, 160]], 0.7));

// ---- soir
R['cabillaud-courgettes'] = (c) => assiette(c,
  [...scatter(c, 7, E(140, 248, 44, 42), 30)].map(([x, y]) => courgette(c, x, y, 1.45, true)).join('') +
  [[256, 262], [290, 228], [222, 296], [280, 290], [244, 228]].map(([x, y]) => pdtVapeur(c, x, y, c.rnd(0, 360))).join('') +
  cabillaud(c, 212, 148, { w: 136, h: 74, rot: -15 }) + citron(c, 'r', 248, 138, 0, 0.8) + persils(c, [[190, 142], [210, 156]], 0.8) + poivre(c, 200, 148, 40, 20, 12));
R['omelette-champignons'] = (c) => assiette(c,
  salade(c, 268, 270, 46, 38, 5) + pain(c, 140, 280, { w: 80, h: 86, rot: -18 }) +
  omelette(c, 188, 168, { r: 86, rot: -10, garniture: [-50, -22, 8, 38].map((xx) => champignon(c, xx, -10, 180 + c.rnd(-20, 20), 1)).join('') }) +
  champignon(c, 168, 198, -20, 0.9) + champignon(c, 206, 210, 15, 0.85) + persils(c, [[186, 186], [226, 192]], 0.6));
R['poulet-curry-legumes'] = (c) => assiette(c, riz(c, 132, 150, 58, 52) +
  sauce(c, 230, 228, 98, 88, ['#f6b048', '#e2861e', '#ab560c'], { gloss: 9 }).svg +
  lanieres(c, scatter(c, 6, E(230, 228, 70, 62), 22), 'rouge') + lanieres(c, scatter(c, 4, E(230, 228, 70, 62), 22), 'jaune') +
  [[200, 230], [262, 210], [240, 270], [196, 268]].map(([x, y]) => courgetteDemi(c, x, y, c.rnd(0, 360))).join('') +
  morceauxPoulet(c, scatter(c, 10, E(230, 226, 66, 58), 20), true) + oignon(c, scatter(c, 5, E(230, 228, 60, 52))) +
  filetCreme(c, arcPts(184, 250, 280, 196, 22, 8), 3.4) + coriandre(c, [[214, 214], [256, 244], [232, 186], [190, 238]]));
R['salade-thon-oeuf'] = (c) => bol(c, salade(c, 200, 200, 115, 115, 13) +
  [[128, 150], [118, 220], [150, 270]].map(([x, y]) => pdtVapeur(c, x, y, c.rnd(0, 360), 0.95)).join('') +
  [[248, 112, 30], [292, 160, -40], [300, 238, 80], [178, 116, -20]].map(([x, y, a]) => tomate(c, 'q', x, y, a)).join('') +
  [[236, 290], [270, 280], [208, 300]].map(([x, y]) => concombre(c, x, y, 1.05)).join('') +
  thon(c, 200, 200, 42, 36, 20) + oeufDur(c, 245, 228, -30) + oeufDur(c, 166, 204, 30) +
  filetCreme(c, arcPts(160, 160, 260, 170, -20, 6), 2, '#f3e3a0') + poivre(c, 200, 200, 70, 70, 16));
R['dinde-quinoa'] = (c) => assiette(c, quinoa(c, 134, 160, 58, 56) +
  (() => {
    let s = sauce(c, 208, 268, 84, 44, ['#e5603a', '#bf3a20', '#842010'], { gloss: 6 }).svg;
    s += des(c, scatter(c, 9, E(208, 268, 72, 34), 13), 'rouge', 10) + des(c, scatter(c, 6, E(208, 268, 72, 34), 13), 'jaune', 10);
    s += scatter(c, 9, E(208, 268, 70, 32), 14).map(([x, y]) => `<g${tr(x, y, c.rnd(0, 90))}${fl(c, 2)}><rect x="-5.5" y="-5.5" width="11" height="11" rx="2" fill="#e8eeb6"/><rect x="-5.5" y="-5.5" width="11" height="3.2" rx="1.4" fill="#2e5a1c"/></g>`).join('');
    return s + tomate(c, 'd', 190, 262) + tomate(c, 'd', 236, 276) + basilic(c, 214, 262, 20, 0.8);
  })() + escalope(c, 262, 150, { w: 118, h: 78, rot: 60 }) + persils(c, [[128, 150]], 0.6));
R['soupe-lentilles'] = (c) => bol(c, surface(c, ['#ffa856', '#ee8034', '#c2581a']) +
  lentillesPts(c, scatter(c, 50, E(200, 200, 140)), ['#f7a560', '#e88a40']) +
  (() => { const pts = []; for (let t = 0; t <= 1; t += 0.04) { const a = t * TAU * 1.8, rr = 46 * (1 - t) + 3; pts.push([196 + Math.cos(a) * rr, 192 + Math.sin(a) * rr]); } return filetCreme(c, pts, 4.5); })() +
  croutons(c, [[268, 124], [292, 150], [262, 158], [286, 182]]) + carotteRapee(c, E(140, 270, 22, 16), 8) +
  coriandre(c, [[180, 180], [210, 204], [150, 140], [240, 250]], 0.7) + poivre(c, 196, 192, 50, 50, 16)  + brillances(c, 190, 190, 110, 110, 8));
R['jambon-pdt-haricots'] = (c) => assiette(c,
  haricots(c, 205, 280, { n: 12, len: 150, rot: 8 }) +
  [[262, 150], [300, 190], [256, 200], [300, 142], [222, 176]].map(([x, y]) => pdtVapeur(c, x, y, c.rnd(0, 360))).join('') +
  jambon(c, 92, 104, 0, 1.45) + jambon(c, 118, 112, 25, 1.45) + jambon(c, 90, 140, -22, 1.45) + persils(c, [[150, 170]], 0.5));
R['saumon-quinoa'] = (c) => assiette(c, quinoa(c, 132, 236, 56, 60) +
  brocoli(c, 236, 278, 1, 200, 0) + brocoli(c, 280, 248, 1, 150, 1) + brocoli(c, 196, 300, 0.85, 220, 2) +
  saumon(c, 222, 148, { w: 136, h: 80, rot: 14 }) + aneth(c, 216, 146, 30, 1.1) + citron(c, 'q', 312, 176, 70, 0.9));
R['crevettes-wok'] = (c) => bol(c, `<circle cx="200" cy="200" r="152" fill="#8a4a1e"/>` + spaghetti(c, 200, 200, 175, 90, ['#9a5a20', '#c98a40', '#f0c27a']) +
  lanieres(c, scatter(c, 7, E(200, 200, 110), 26), 'rouge') + lanieres(c, scatter(c, 4, E(200, 200, 110), 26), 'jaune') +
  julienne(c, E(200, 200, 110), 14, ['#f58a1e', '#ff9d2e']) +
  scatter(c, 6, E(200, 200, 100), 30).map(([x, y]) => champignon(c, x, y, c.rnd(0, 360), 0.9)).join('') +
  [[170, 150, 0], [232, 160, 70], [150, 218, -50], [216, 222, 120], [258, 248, 30], [190, 270, 160]].map(([x, y, a]) => crevette(c, x, y, a, 1.1)).join('') +
  sesame(c, E(200, 200, 120), 50, 0.2) + oignonVert(c, E(200, 200, 100), 12));
R['riz-cantonais'] = (c) => bol(c, rizFond(c, 'rizc', '#ecd49a', ['#f7e3a8', '#f2d690', '#fbecc2', '#efcf86', '#f9e6b0'], '#c9a45a') +
  scatter(c, 14, E(200, 200, 130), 22).map(([x, y]) => `<path d="${blob(c, x, y, c.rnd(5, 8), c.rnd(4, 6), 0.3, 6)}" fill="${c.rg('scr', [[0, '#fff3b8'], [0.55, '#f9d55a'], [1, '#e2a92c']])}"${fl(c, 2)}/>`).join('') +
  scatter(c, 16, E(200, 200, 132), 16).map(([x, y]) => { const a = c.rnd(0, 180); return `<g${tr(x, y, a)}${fl(c, 2)}><rect x="-7" y="-3" width="14" height="6" rx="3" fill="#4c9a2a"/><path d="M-5 -1.2H5" stroke="#bfe68e" stroke-width="1"/></g>`; }).join('') +
  des(c, scatter(c, 18, E(200, 200, 132), 14), 'orange', 7) +
  [[160, 160, 20], [236, 150, 80], [170, 240, -40], [244, 236, 140], [205, 196, 10]].map(([x, y, a]) => crevette(c, x, y, a, 1.05)).join('') +
  oignonVert(c, E(200, 200, 120), 16));
R['gratin-patate-douce'] = (c) => assiette(c, (() => {
  // tian : rondelles fines de patate douce en spirale, nappées de sauce, gratinées
  let s = `<circle cx="200" cy="200" r="114" fill="${c.rg('gcr', [[0, '#fbf0d6'], [0.7, '#efd9a8'], [1, '#c99a52']])}"/>`;
  const id = c.sym('gpd', () => `<ellipse rx="10" ry="21" fill="${c.lg('gpf', [[0, '#ffc070'], [0.5, '#f48c2a'], [1, '#b8540e']], 0, 0, 1, 0)}" stroke="#7a3206" stroke-width="1.2" stroke-opacity=".6"/><path d="M-5 -16Q-8 0 -5 16" stroke="#ffe2b0" stroke-width="1.6" fill="none" opacity=".75"/>`);
  for (const [rr, k] of [[96, 34], [70, 26], [44, 17], [18, 8]]) for (let i = 0; i < k; i++) { const a = (i / k) * 360, [x, y] = rotp(rr, 0, a); s += use(id, 200 + x, 200 + y, a + 20, 1, fl(c, 2)); }
  s += [[150, 160], [250, 170], [230, 250], [160, 240], [200, 120], [290, 220], [116, 210], [200, 290]].map(([x, y]) => pousseEpinard(c, x, y, c.rnd(0, 360), 0.7)).join('');
  s += morceauxPoulet(c, [[176, 196], [224, 206], [204, 166], [196, 236], [140, 140], [262, 136], [268, 268], [134, 262]]);
  const cl = c.clip('<circle cx="200" cy="200" r="114"/>');
  let g2 = '';
  for (let i = 0; i < 16; i++) { const [x, y] = ell(200, 200, 105)(c); g2 += tache(c, x, y, c.rnd(8, 18), c.rnd(6, 12), c.pick(['#6a2a06', '#8a4410']), c.rnd(0.25, 0.4), 4); }
  for (let i = 0; i < 9; i++) { const [x, y] = ell(200, 200, 100)(c); g2 += tache(c, x, y, c.rnd(6, 12), c.rnd(4, 8), '#fff4d6', 0.5, 2.5); }
  return G(s, fl(c)) + `<g clip-path="${cl}">${g2}</g>` + brillances(c, 190, 190, 90, 90, 10) + persils(c, [[200, 196], [170, 230], [236, 170]], 0.6);
})());
R['dahl-lentilles'] = (c) => bol(c, surface(c, ['#ffcb52', '#f0a02a', '#b8701a']) +
  lentillesPts(c, scatter(c, 80, E(200, 200, 140)), ['#f7b84a', '#e89a30', '#ffcd6a']) +
  epinards(c, 160, 200, 60, 90, 12) + des(c, scatter(c, 6, E(190, 200, 90), 20), 'rouge', 7) +
  oignon(c, scatter(c, 6, E(180, 200, 80))) +
  riz(c, 260, 252, 56, 50) + dollop(c, 222, 150, 26) +
  (() => { let o = ''; for (const [x, y] of scatter(c, 26, E(180, 220, 80))) o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.8" ry=".8" transform="rotate(${f(c.rnd(0, 180))} ${f(x)} ${f(y)})" fill="#4a2a10"/>`; return o; })() +
  coriandre(c, [[150, 160], [200, 220], [140, 250], [180, 290], [230, 190]]));
R['poisson-pane-maison'] = (c) => assiette(c,
  dollop(c, 136, 236, 58, ['#b8e07a', '#86bc48', '#4e8a26']) + brocoli(c, 112, 210, 0.7, 160, 1) +
  [[100, 268], [176, 286], [96, 200]].map(([x, y]) => pdtVapeur(c, x, y, c.rnd(0, 360), 0.85)).join('') +
  cabillaud(c, 236, 140, { w: 120, h: 62, rot: -18, pane: true }) + cabillaud(c, 262, 214, { w: 86, h: 52, rot: 24, pane: true }) +
  citron(c, 'q', 278, 292, -45, 0.95) + persils(c, [[220, 130], [256, 210]], 0.7));
R['saumon-pdt-avocat'] = (c) => assiette(c,
  salade(c, 258, 268, 44, 32, 4) + avocat(c, 262, 262, { n: 6, rot: -30, s: 1.1 }) +
  pdtRoties(c, scatter(c, 6, E(126, 230, 38, 52), 30)) +
  saumon(c, 220, 146, { w: 140, h: 80, rot: -10 }) + aneth(c, 214, 140, 20, 1.2));

// ---- collations et petits-déjeuners
R['skyr-miel'] = (c) => bol(c, yaourtSurface(c, 200, 200, 152, { spirale: false }) +
  `<circle cx="198" cy="196" r="16" fill="${c.rg('mlp', [[0, '#ffd86a', 0.9], [0.6, '#f0a418', 0.9], [1, '#c07206', 0.9]])}"${fl(c, 2)}/>` +
  miel(c, spirale(198, 196, 118, 3.2, 10), 5.5) + reflet(c, 190, 188, 5, 2, -30, 0.9, 0.5));
R['pomme-cacahuete'] = (c) => planche(c, pommeEntiere(c, 116, 136, 62) +
  `<g transform="translate(180 268) scale(1.4) translate(-180 -268)">${pommeTranches(c, 180, 268, { n: 6, rot: -6 })}</g>` +
  ramequin(c, 290, 160, 60, `<circle cx="290" cy="160" r="48" fill="${c.rg('bcc', [[0, '#e8b06a'], [0.55, '#c68840'], [1, '#93581f']])}"/>` + beurreCacahuete(c, 290, 160, 34)) +
  cacahuetes(c, [[306, 262], [326, 280], [340, 256], [316, 302], [296, 286]]));
R['galettes-thon'] = (c) => planche(c,
  galetteRiz(c, 138, 164, 70) + thon(c, 138, 164, 46, 42, 20) + [[118, 148], [156, 180], [128, 190]].map(([x, y]) => concombre(c, x, y, 1)).join('') + aneth(c, 146, 150, 30, 0.9) +
  galetteRiz(c, 264, 236, 70) + thon(c, 264, 236, 46, 42, 20) + [[244, 220], [282, 252], [276, 214]].map(([x, y]) => concombre(c, x, y, 1)).join('') + aneth(c, 256, 246, -20, 0.9) +
  poivre(c, 200, 200, 120, 80, 18) + [[310, 108], [334, 130], [72, 300]].map(([x, y]) => concombre(c, x, y, 1.1)).join(''));
R['oeufs-durs'] = (c) => assiette(c,
  [[-12, 0], [-4, 0], [4, 0], [12, 0], [-8, 0], [8, 0], [0, 0]].map(([d], i) => carotte(c, 'b', 268 + d * 1.2, 150 + i * 13, -60 + c.rnd(-6, 6))).join('') +
  [...scatter(c, 7, E(220, 280, 56, 30), 25)].map(([x, y]) => concombre(c, x, y, 1.1)).join('') +
  oeufDur(c, 124, 150, -20, 1.2) + oeufDur(c, 178, 136, 20, 1.2) + oeufDur(c, 118, 224, -10, 1.2) + oeufDur(c, 172, 210, 30, 1.2) +
  poivre(c, 150, 180, 46, 50, 16) + ciboulette(c, 150, 180, 40, 46, 12) + sel(c, [[150, 180], [130, 200]]));
R['banane-amandes'] = (c) => planche(c, bananeEntiere(c, 196, 136, -10, 1.45) +
  bananes(c, [[96, 262], [126, 282], [158, 270], [116, 312]], 1.45) +
  amandes(c, scatter(c, 20, E(268, 268, 62, 42), 17), 1.45));
R['smoothie-prot'] = (c) => verre(c, (() => {
  let s = `<circle cx="200" cy="200" r="156" fill="${c.rc('smo', [[0, '#e486a6'], [0.6, '#c64a72'], [1, '#8a2248']], { cx: 0.45, cy: 0.42 })}"/>`;
  s += `<circle cx="200" cy="200" r="146" fill="none" stroke="#f7b6cb" stroke-width="8" opacity=".5" filter="${c.blur(3)}"/>`;
  for (const [x, y] of scatter(c, 40, E(200, 200, 140))) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(c.rnd(1, 3.2))}" fill="#fff" opacity="${f2(c.rnd(0.15, 0.4))}"/>`;
  for (const [x, y] of scatter(c, 40, E(200, 200, 130))) s += `<circle cx="${f(x)}" cy="${f(y)}" r=".9" fill="#5a1028" opacity=".5"/>`;
  s += framboises(c, [[152, 150], [176, 128], [132, 176]]) + myrtilles(c, [[170, 166], [192, 150], [150, 192], [196, 174]]) + bananes(c, [[214, 132], [120, 210]]);
  return s + reflet(c, 150, 120, 50, 12, -40, 0.35, 6);
})(), '#c64a72', paille(c, ['#ffd3de', '#f06a8c', '#b8365a']));
R['grec-chocolat'] = (c) => bol(c, yaourtSurface(c, 200, 200, 152) +
  [[126, 252, 140], [162, 290, 170], [98, 206, 110], [210, 306, 195], [110, 160, 90]].map(([x, y, a]) => orangeDemi(c, x, y, a - 180, 1.3)).join('') +
  chocolat(c, 226, 140, 12, 1.4) + chocolat(c, 276, 174, -18, 1.4) + chocolat(c, 238, 200, 30, 1.2) + copeaux(c, E(230, 210, 70, 50), 22));
R['shake-masse'] = (c) => verre(c, (() => {
  let s = `<circle cx="200" cy="200" r="156" fill="${c.rc('shk', [[0, '#f5e6c8'], [0.6, '#e2c595'], [1, '#b98e58']], { cx: 0.45, cy: 0.42 })}"/>`;
  for (const [x, y] of scatter(c, 50, E(200, 200, 140))) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(c.rnd(1, 3.4))}" fill="#fff" opacity="${f2(c.rnd(0.2, 0.5))}"/>`;
  s += flocons(c, E(200, 200, 110), 30) + bananes(c, [[150, 160], [174, 146], [140, 186]]) + cacahuetes(c, scatter(c, 7, E(200, 220, 80), 18));
  s += miel(c, boucles(120, 250, 250, 130, 4, 16), 3) + `<path d="${smoothPath(boucles(160, 290, 290, 160, 4, 14), false)}" stroke="#a8692a" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".9"/>`;
  return s + reflet(c, 150, 120, 50, 12, -40, 0.35, 6);
})(), '#c49a5c', paille(c, ['#f6e8cf', '#d9b27a', '#9a6a32']));
R['bowl-avoine-cacahuete'] = (c) => bol(c, porridgeFond(c) +
  bananes(c, arcPts(112, 112, 290, 282, 30, 10)) + beurreCacahuete(c, 266, 150, 32) + dollop(c, 148, 252, 36) +
  cacahuetes(c, scatter(c, 10, E(250, 250, 40, 30), 14)) + flocons(c, E(140, 160, 30, 30), 10));
R['omelette-4-oeufs'] = (c) => assiette(c,
  pain(c, 290, 280, { w: 80, h: 88, rot: 28 }) + pain(c, 304, 238, { w: 80, h: 88, rot: 10 }) +
  avocat(c, 128, 270, { n: 6, rot: 30, s: 1.05 }) +
  omelette(c, 186, 160, { r: 94, rot: -8, garniture: [-60, -30, 0, 30, 60].map((xx) => tomate(c, 'h', xx, -8, 0, 0.85)).join('') }) +
  tomate(c, 's', 214, 290, 0, 0.8));
R['grec-miel-amandes'] = (c) => bol(c, yaourtSurface(c, 200, 200, 152) +
  amandes(c, scatter(c, 12, E(262, 160, 46, 52), 15), 1.1) + flocons(c, E(140, 250, 44, 40), 30) +
  miel(c, spirale(186, 214, 70, 2.2, 6), 4.4));
R['overnight-oats'] = (c) => bol(c, porridgeFond(c, 152, ['#efdcb6', '#dcc192', '#b8955e'], 110) + flocons(c, E(200, 200, 140), 24) +
  dollop(c, 150, 196, 54) +
  (() => { const s = sauce(c, 262, 214, 54, 66, ['#b0284e', '#7e1236', '#4a0a20'], { irr: 0.18, gloss: 5 }); return s.svg; })() +
  myrtilles(c, scatter(c, 8, E(262, 214, 40, 50), 15)) + framboises(c, [[248, 168], [284, 262], [270, 200]]) + fraises(c, [[236, 246, 20]]) +
  miel(c, boucles(110, 160, 200, 280, 2, 10), 3.5));
R['crepes-proteinees'] = (c) => assiette(c, (() => {
  // crêpes pliées en quatre : bord arrondi, dentelle dorée irrégulière, pli souligné
  const crepe = (x, y, rot) => {
    const d = 'M0 0L108 4C112 50 82 98 34 110C20 112 8 112 4 108Z', cl = c.clip(`<path d="${d}"/>`);
    let lace = '';
    for (let i = 0; i < 40; i++) { const [px, py] = ell(52, 52, 52, 52)(c); lace += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(c.rnd(3, 8))}" fill="${c.rc('lsp', [[0, '#9a5214', 0.55], [1, '#9a5214', 0]])}"/>`; }
    return `<g${tr(x, y, rot)}><g${fl(c)}><path d="${d}" fill="${c.rg('crpf', [[0, '#f9dc9a'], [0.55, '#e9b45e'], [1, '#c07a2c']], { cx: 0.3, cy: 0.3, fx: 0.15, fy: 0.15, r: 0.9 })}"/><g clip-path="${cl}">${lace}<path d="M0 0L108 4M0 0L4 108" stroke="#a8641e" stroke-width="7" opacity=".18" filter="${c.blur(3)}"/></g><path d="M3 2L104 5M2 3L5 104" stroke="#fff6d8" stroke-width="2.2" opacity=".8"/></g></g>`;
  };
  return crepe(120, 92, 30) + crepe(96, 150, -8) +
    bananes(c, [[226, 238], [252, 214], [270, 186], [200, 262], [282, 254], [258, 282], [176, 176], [150, 200]], 1.25) + dollop(c, 240, 260, 28);
})());
R['tartines-thon'] = (c) => planche(c, (() => {
  const top = (k) => `<path d="${blob(c, 0, 2, 44, 46, 0.1, 10)}" fill="${c.rg('rill', [[0, '#fbf3ec'], [0.6, '#f0ddd0'], [1, '#d9b9a6']])}"/>` + thon(c, 0, 0, 34, 36, 10) +
    [[-16, -20], [14, -14], [-12, 14], [16, 20], [0, -2]].map(([x, y]) => concombre(c, x, y, 1)).join('') + aneth(c, 6 * k, -8, 40 * k, 0.9) + poivre(c, 0, 0, 34, 36, 10);
  return pain(c, 130, 180, { w: 112, h: 122, rot: -12, garniture: top(1) }) + pain(c, 262, 214, { w: 112, h: 122, rot: 10, garniture: top(-1) }) +
    citron(c, 'q', 108, 300, 20, 0.95) + citron(c, 'q', 312, 100, -30, 0.9);
})());
R['pomme-skyr-cannelle'] = (c) => bol(c, yaourtSurface(c, 200, 200, 152) + cannelle(c, 200, 200, 130, 90) +
  `<path d="${blob(c, 204, 206, 94, 88, 0.12, 10)}" fill="${c.rg('car', [[0, '#e8a050'], [0.7, '#c26a1e'], [1, '#8a400c']])}" opacity=".8"${fl(c, 2)}/>` + brillances(c, 204, 206, 88, 84, 8) +
  pommeEntiere(c, 196, 196, 74, true) +
  amandes(c, scatter(c, 9, sect(20, 130, 100, 138), 22), 1.15) + amandes(c, scatter(c, 6, sect(190, 260, 100, 138), 22), 1.15));

function paille(c, cols) {
  const L = 175, W = 15;
  const st = c.pat('pst', 12, 12, `<path d="M-3 15L15 -3M9 15L15 9M-3 3L3 -3" stroke="#fff" stroke-width="3" opacity=".75"/>`);
  return `<g transform="translate(222 182) rotate(-52)"><rect x="6" y="${-W / 2 + 7}" width="${L}" height="${W}" rx="7" fill="#000" opacity=".25" filter="${c.blur(3)}"/><ellipse cx="0" cy="0" rx="12" ry="14" fill="none" stroke="#fff" stroke-width="2" opacity=".35"/>` +
    `<rect x="0" y="${-W / 2}" width="${L}" height="${W}" rx="${W / 2}" fill="${c.lg('pai', [[0, cols[0]], [0.5, cols[1]], [1, cols[2]]])}"/><rect x="0" y="${-W / 2}" width="${L}" height="${W}" rx="${W / 2}" fill="${st}" opacity=".7"/>` +
    `<ellipse cx="${L - 2}" cy="0" rx="4" ry="${W / 2 - 0.5}" fill="${cols[2]}"/><ellipse cx="${L - 2}" cy="0" rx="2.6" ry="${W / 2 - 2.5}" fill="#3a1020" opacity=".8"/><path d="M8 -4H${L - 10}" stroke="#fff" stroke-width="1.6" opacity=".6"/></g>`;
}

/* ───────────────────────── Génération ───────────────────────── */
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
const repas = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'repas.json'), 'utf8'));
const liste = Array.isArray(repas) ? repas : repas.repas;
const demandes = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
let total = 0, nb = 0;
for (const r of liste) {
  if (demandes.length && !demandes.includes(r.id)) continue;
  const fn = R[r.id];
  if (!fn) { console.warn('⚠ pas de composition pour', r.id); continue; }
  const c = new Ctx(r.id);
  const body = fn(c);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img"><title>${esc(r.nom)}</title><defs>${c.defs.join('')}</defs>${body}</svg>\n`;
  fs.writeFileSync(path.join(OUT, `${r.id}.svg`), svg);
  total += svg.length; nb++;
  if (svg.length > 40 * 1024) console.warn(`⚠ ${r.id} : ${(svg.length / 1024).toFixed(1)} Ko`);
}
console.log(`${nb} illustrations écrites dans ${path.relative(process.cwd(), OUT) || OUT} (${(total / 1024).toFixed(0)} Ko au total)`);
