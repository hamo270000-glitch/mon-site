// Silhouette réaliste (vue de face), dessinée en SVG à partir du sexe et du taux de masse grasse.
// Plus le taux baisse : la taille s'affine, le ventre et les poignées d'amour disparaissent,
// les abdos, les pectoraux, les épaules et les cuisses se dessinent.

export const SKINS = ['#f2cba9', '#dca47c', '#b0754d', '#74482c'];

// Éclaircit (k > 0) ou assombrit (k < 0) une couleur hexadécimale.
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k)));
  return `#${ch.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`;
}

// Courbe lisse fermée passant par des points (Catmull-Rom → Bézier).
function smooth(p) {
  const n = p.length;
  const g = (i) => p[(i + n) % n];
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [g(i - 1), g(i), g(i + 1), g(i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}
const mirror = (pts) => pts.map(([x, y]) => [200 - x, y]).reverse();
const sym = (right) => smooth([...right, ...mirror(right)]);

let uid = 0;

export function bodySVG({ sexe = 'h', bf = 20, label = '', size = 220, skin, muscle = 0 } = {}) {
  const id = `b${++uid}`;
  const h = sexe === 'h';
  const tone = skin || (typeof localStorage !== 'undefined' && (() => { try { return JSON.parse(localStorage.getItem('affute.peau')); } catch (e) { return null; } })()) || SKINS[1];
  const lean = h ? 8 : 15;
  const f = Math.max(0, Math.min(1.6, (bf - lean) / 22)); // 0 = très sec … 1,6 = forte surcharge
  const def = Math.max(0, Math.min(1, ((h ? 21 : 28) - bf) / (h ? 11 : 11))); // visibilité des muscles

  const C = 100;
  // Largeurs (demi-largeurs depuis le centre)
  const m = Math.max(0, Math.min(1, muscle)); // muscle gagné (prise de masse)
  const sw = (h ? 49 : 41) + 2 * f + (h ? 15 : 9) * m; // épaules
  const cw = (h ? 37 : 33) + 6 * f + (h ? 12 : 5) * m; // poitrine
  const ww = (h ? 25 : 22) + 23 * f; // taille
  const lh = ww + 3.5 * f; // poignées d'amour
  const hw = (h ? 31 : 37) + 15 * f; // hanches
  const tw = (h ? 16.5 : 18) + 9 * f + (h ? 6 : 4) * m; // cuisse
  const aw = (h ? 9.5 : 7.5) + 5 * f + (h ? 9 : 6) * m; // bras
  const belly = Math.max(0, f - 0.15); // ventre visible

  const dark = shade(tone, -0.32);
  const mid = shade(tone, -0.12);
  const light = shade(tone, 0.18);
  const groove = shade(tone, -0.45);
  const cloth = '#2e3b35';
  const clothHi = '#46564e';

  // --- Torse ---
  const torso = sym([
    [C + 9, 70], [C + 16, 79], [C + sw - 8, 86], [C + sw, 96], [C + cw + 4, 116], [C + cw, 140],
    [C + ww + 2 * belly, 172], [C + lh, 200], [C + hw - 2, 222], [C + hw, 236], [C + 6, 244],
  ]);

  // --- Bras ---
  const arm = (s) => {
    const x0 = C + s * sw;
    const pts = [
      [x0 - s * 6, 90], [x0 + s * (aw * 0.55), 94], [x0 + s * (aw + 1.5), 112], [x0 + s * (aw + 1 + 2 * def), 136],
      [x0 + s * (aw * 0.85), 160], [x0 + s * (aw * 0.95), 182], [x0 + s * (aw * 0.6), 226], [x0 + s * 3, 250],
      [x0 - s * 3, 252], [x0 - s * (aw * 0.4), 228], [x0 - s * (aw * 0.55), 184], [x0 - s * (aw * 0.6), 162],
      [x0 - s * (aw * 0.55), 132], [x0 - s * 6, 108],
    ];
    return smooth(s > 0 ? pts : pts.slice().reverse());
  };

  // --- Jambes ---
  const leg = (s) => {
    const cx = C + s * (hw * 0.5);
    const pts = [
      [C + s * hw, 236], [cx + s * (tw + 2), 268], [cx + s * (tw * 0.85), 300], [cx + s * (tw * 0.55), 330],
      [cx + s * (tw * 0.62 + 1), 352], [cx + s * (tw * 0.45), 392], [cx + s * 6, 412], [cx + s * 9, 420],
      [cx - s * 7, 421], [cx - s * 6, 410], [cx - s * (tw * 0.42), 390], [cx - s * (tw * 0.5), 352],
      [cx - s * (tw * 0.42), 330], [cx - s * (tw * 0.55 + 2 * f), 290], [C + s * 2, 250],
    ];
    return smooth(s > 0 ? pts : pts.slice().reverse());
  };

  // --- Short ---
  const shorts = sym([
    [C + 6, 226], [C + hw - 1, 226], [C + hw + 1.5, 240], [C + hw * 0.5 + tw + 3, 274], [C + hw * 0.5 + 1, 280], [C + 3, 256],
  ]);

  // --- Abdos (6 blocs) ---
  const abs = [];
  const top = h ? 146 : 150; const rowH = 17;
  for (let r = 0; r < 3; r++) {
    for (const s of [-1, 1]) {
      const x = s < 0 ? C - 15 : C + 2.5;
      const y = top + r * rowH;
      abs.push(`<rect x="${x}" y="${y}" width="12.5" height="${rowH - 3}" rx="5" fill="url(#${id}ab)"/>`);
    }
  }

  // --- Pectoraux / poitrine ---
  const chest = h
    ? [-1, 1].map((s) => `<path d="M${C},${108} Q${C + s * 18},${100 - def * 2} ${C + s * (cw - 4)},${110} Q${C + s * (cw - 2)},${124 + 5 * f} ${C + s * 16},${130 + 6 * f} Q${C + s * 6},${132 + 6 * f} ${C},${128}" fill="url(#${id}pec)" stroke="${groove}" stroke-opacity="${(0.08 + 0.25 * Math.max(def, m * 0.8)).toFixed(2)}" stroke-width="1"/>`).join('')
    : `${[-1, 1].map((s) => `<path d="M${C + s * 14},${84} L${C + s * 22},${110}" stroke="${cloth}" stroke-width="4" stroke-linecap="round"/>`).join('')}
       <path d="${sym([[C + 4, 118], [C + 14, 108], [C + cw - 3, 108], [C + cw + 1, 122], [C + cw, 140 + 2 * f], [C + 3, 142 + 2 * f]])}" fill="url(#${id}sh)"/>
       ${[-1, 1].map((s) => `<path d="M${C + s * 3},${132} Q${C + s * (cw * 0.5)},${142 + 2 * f} ${C + s * (cw - 3)},${130}" stroke="${clothHi}" stroke-width="1.2" fill="none" opacity=".7"/>`).join('')}
       <path d="M${C - cw},${139 + 2 * f} L${C + cw},${139 + 2 * f}" stroke="${clothHi}" stroke-width="3"/>`;

  // --- Ventre (bombé, plis) ---
  const bellyShape = belly > 0.05 ? `
    <ellipse cx="${C}" cy="${196 + 6 * belly}" rx="${ww * 0.9}" ry="${20 + 14 * belly}" fill="url(#${id}belly)" opacity="${Math.min(0.9, belly * 1.2).toFixed(2)}"/>
    <path d="M${C - ww * 0.75},${214 + 10 * belly} Q${C},${226 + 14 * belly} ${C + ww * 0.75},${214 + 10 * belly}" stroke="${dark}" stroke-width="${(1 + 2 * belly).toFixed(1)}" fill="none" opacity="${Math.min(0.7, belly).toFixed(2)}" stroke-linecap="round"/>` : '';

  // Lignes en V (obliques) et quadriceps quand c'est sec
  const vlines = [-1, 1].map((s) => `<path d="M${C + s * (ww - 2)},${190} Q${C + s * (ww - 6)},${212} ${C + s * 9},${232}" stroke="${groove}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`).join('');
  const quads = [-1, 1].map((s) => {
    const cx = C + s * (hw * 0.5);
    return `<path d="M${cx + s * (tw * 0.1)},${284} Q${cx - s * 2},${312} ${cx - s * (tw * 0.25)},${334}" stroke="${groove}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
            <path d="M${cx + s * (tw * 0.75)},${282} Q${cx + s * (tw * 0.55)},${314} ${cx + s * (tw * 0.1)},${336}" stroke="${groove}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  }).join('');
  const delts = [-1, 1].map((s) => `<path d="M${C + s * (sw - 10)},${90} Q${C + s * (sw + aw * 0.6)},${96} ${C + s * (sw + aw * 0.2)},${124}" stroke="${groove}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`).join('');

  // ---------- Ombres et reflets (floutés) : donnent le relief réaliste ----------
  const dm = Math.max(def, m * 0.85); // définition musculaire visible
  const hi = shade(tone, 0.4);
  const line = (d, op, w = 3, col = groove) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${Math.max(0, Math.min(1, op)).toFixed(2)}"/>`;
  const glow = (cx, cy, rx, ry, op) => `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${hi}" opacity="${Math.max(0, Math.min(1, op)).toFixed(2)}"/>`;
  const shadows = [];
  const lights = [];
  for (const sg of [-1, 1]) {
    const x0 = C + sg * sw; // épaule
    // Côtés du torse (creux sous les bras) et taille
    shadows.push(line(`M${C + sg * (cw - 3)},120 Q${C + sg * (cw - 4)},150 ${C + sg * (ww - 2)},182`, 0.28, 4));
    // Clavicules
    shadows.push(line(`M${C + sg * 5},${88} Q${C + sg * (sw * 0.45)},${84} ${C + sg * (sw - 9)},${90}`, 0.12 + 0.25 * def, 1.6));
    lights.push(line(`M${C + sg * 5},${86} Q${C + sg * (sw * 0.45)},${82} ${C + sg * (sw - 9)},${88}`, 0.25 + 0.3 * def, 2, hi));
    // Deltoïdes : reflet sur l'épaule et sillon avec le bras
    lights.push(glow(x0 + sg * aw * 0.25, 104, aw * 0.65 + 2, 10, 0.3 + 0.35 * dm));
    shadows.push(line(`M${x0 - sg * 2},${120} Q${x0 + sg * aw * 0.4},${128} ${x0 + sg * (aw + 1)},${124}`, 0.35 * dm, 2.5));
    // Biceps (reflet) et triceps (ombre sur l'extérieur du bras)
    lights.push(glow(x0 + sg * aw * 0.15, 142, aw * 0.5, 13, 0.22 + 0.3 * dm));
    shadows.push(line(`M${x0 + sg * (aw - 1.5)},${122} Q${x0 + sg * (aw - 0.5 + 1.5 * dm)},${146} ${x0 + sg * (aw * 0.7)},${176}`, 0.3, 3));
    shadows.push(line(`M${x0 - sg * (aw * 0.4)},${184} L${x0 + sg * (aw * 0.6)},${186}`, 0.25, 2)); // pli du coude
    lights.push(glow(x0 + sg * aw * 0.1, 206, aw * 0.4, 14, 0.18 + 0.15 * dm)); // avant-bras
    if (h) {
      // Pectoraux : ombre en dessous, reflet dessus
      shadows.push(line(`M${C + sg * 4},${130 + 6 * f} Q${C + sg * 17},${136 + 7 * f} ${C + sg * (cw - 3)},${122 + 5 * f}`, 0.2 + 0.45 * dm, 4.5));
      lights.push(glow(C + sg * 16, 113, 10, 6, 0.22 + 0.3 * dm));
    }
    // Dentelés (sous les bras) quand c'est sec
    if (def > 0.35) for (let k = 0; k < 3; k++) shadows.push(line(`M${C + sg * (cw - 2)},${138 + k * 8} l${-sg * 6},${4}`, (def - 0.35) * 1.2, 1.8));
    // Obliques / ligne en V
    shadows.push(line(`M${C + sg * (ww - 3)},${186} Q${C + sg * (ww - 7)},${210} ${C + sg * 10},${232}`, 0.45 * def, 3));
    // Poignées d'amour
    if (f > 0.5) shadows.push(line(`M${C + sg * (lh - 2)},${196} Q${C + sg * (lh - 6)},${212} ${C + sg * (hw - 6)},${226}`, Math.min(0.45, (f - 0.5) * 0.6), 4));
    // Jambes : cuisses, « goutte » du quadriceps, genou, mollet
    const cx = C + sg * (hw * 0.5);
    lights.push(glow(cx + sg * tw * 0.1, 296, tw * 0.42, 20, 0.22 + 0.15 * dm));
    shadows.push(line(`M${cx + sg * (tw * 0.7)},${284} Q${cx + sg * (tw * 0.55)},${310} ${cx + sg * (tw * 0.25)},${338}`, 0.15 + 0.35 * def, 2.5));
    lights.push(glow(cx - sg * tw * 0.22, 330, 6, 8, 0.25 * def));
    lights.push(glow(cx, 352, 6, 7, 0.35));
    shadows.push(line(`M${cx - sg * 6},${362} Q${cx},${366} ${cx + sg * 6},${362}`, 0.3, 2));
    lights.push(glow(cx - sg * tw * 0.18, 374, 5.5, 13, 0.25 + 0.15 * dm));
    shadows.push(line(`M${cx + sg * (tw * 0.35)},${362} Q${cx + sg * (tw * 0.45)},${378} ${cx + sg * (tw * 0.3)},${394}`, 0.22, 2.5));
  }
  // Abdos : sillons horizontaux et ligne centrale
  for (let r = 1; r <= 3; r++) shadows.push(line(`M${C - 15},${top + r * rowH - 1.5} Q${C},${top + r * rowH + 1} ${C + 15},${top + r * rowH - 1.5}`, def * (h ? 0.55 : 0.4), 2.2));
  shadows.push(line(`M${C},${top - 2} L${C},${top + 3 * rowH + 4}`, def * 0.5, 2));
  // Ventre : pli sous le nombril quand il y a du gras
  if (belly > 0.2) shadows.push(line(`M${C - ww * 0.7},${218 + 10 * belly} Q${C},${230 + 14 * belly} ${C + ww * 0.7},${218 + 10 * belly}`, Math.min(0.5, belly * 0.6), 5));
  // Visage discret
  const face = `
    ${line(`M${C - 12},${48} Q${C},${62} ${C + 12},${48}`, 0.28, 3)}
    <ellipse cx="${C - 6}" cy="35" rx="2.6" ry="1.5" fill="#3b2a22" opacity=".55"/><ellipse cx="${C + 6}" cy="35" rx="2.6" ry="1.5" fill="#3b2a22" opacity=".55"/>
    ${line(`M${C - 9},${30.5} Q${C - 6},${29} ${C - 3},${30.5}`, 0.5, 1.4, h ? '#2a1f19' : '#3a2a20')}
    ${line(`M${C + 3},${30.5} Q${C + 6},${29} ${C + 9},${30.5}`, 0.5, 1.4, h ? '#2a1f19' : '#3a2a20')}
    ${line(`M${C},${36} L${C - 1.5},${43} L${C + 1},${44}`, 0.3, 1.4)}
    ${line(`M${C - 4},${49} Q${C},${50.5} ${C + 4},${49}`, 0.4, 1.3, shade(tone, -0.4))}`;
  // Mains et pieds
  const ends = [-1, 1].map((sg) => {
    const x0 = C + sg * sw; const cx = C + sg * (hw * 0.5);
    return `<ellipse cx="${(x0 + sg * 0.5).toFixed(1)}" cy="257" rx="5.5" ry="9" fill="url(#${id}s)"/>
      <ellipse cx="${(cx + sg * 2).toFixed(1)}" cy="420" rx="9" ry="4" fill="${mid}"/>`;
  }).join('');

  const hair = h
    ? `<path d="M${C - 17},${34} Q${C - 18},${10} ${C},${10} Q${C + 18},${10} ${C + 17},${34} Q${C + 12},${22} ${C},${22} Q${C - 12},${22} ${C - 17},${34} Z" fill="#2a1f19"/>`
    : `<path d="M${C - 19},${44} Q${C - 22},${8} ${C},${9} Q${C + 22},${8} ${C + 19},${44} Q${C + 21},${70} ${C + 14},${84} L${C + 10},${60} Q${C + 12},${26} ${C},${24} Q${C - 12},${26} ${C - 10},${60} L${C - 14},${84} Q${C - 21},${70} ${C - 19},${44} Z" fill="#3a2a20"/>`;

  return `
<svg class="avatar" viewBox="0 0 200 440" width="${size}" height="${Math.round(size * 2.2)}" role="img" aria-label="${label || 'Silhouette'}">
  <defs>
    <linearGradient id="${id}s" x1="0" x2="1">
      <stop offset="0" stop-color="${dark}"/><stop offset=".22" stop-color="${mid}"/><stop offset=".5" stop-color="${light}"/>
      <stop offset=".78" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    <radialGradient id="${id}ab" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/></radialGradient>
    <radialGradient id="${id}pec" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/></radialGradient>
    <radialGradient id="${id}belly" cx=".5" cy=".4" r=".55"><stop offset="0" stop-color="${light}" stop-opacity=".9"/><stop offset=".6" stop-color="${tone}" stop-opacity=".5"/><stop offset="1" stop-color="${tone}" stop-opacity="0"/></radialGradient>
    <filter id="${id}blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="${id}blur2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.2"/></filter>
    <linearGradient id="${id}sh" x1="0" x2="1"><stop offset="0" stop-color="${cloth}"/><stop offset=".5" stop-color="${clothHi}"/><stop offset="1" stop-color="${cloth}"/></linearGradient>
  </defs>
  <ellipse cx="${C}" cy="424" rx="${48 + 10 * f}" ry="7" fill="#000" opacity=".12"/>
  <path d="${leg(-1)}" fill="url(#${id}s)"/>
  <path d="${leg(1)}" fill="url(#${id}s)"/>
  <path d="${arm(-1)}" fill="url(#${id}s)"/>
  <path d="${arm(1)}" fill="url(#${id}s)"/>
  <path d="M${C - 9 - 2 * m},${56} L${C - 10 - 4 * m},${76} Q${C},${82} ${C + 10 + 4 * m},${76} L${C + 9 + 2 * m},${56} Z" fill="${mid}"/>
  <path d="${torso}" fill="url(#${id}s)"/>
  <ellipse cx="${C}" cy="36" rx="17" ry="22" fill="url(#${id}s)"/>
  <ellipse cx="${C - 17}" cy="38" rx="3" ry="5" fill="${mid}"/><ellipse cx="${C + 17}" cy="38" rx="3" ry="5" fill="${mid}"/>
  ${ends}
  ${hair}
  ${face}
  <g opacity="${(0.15 + 0.5 * Math.max(def, m)).toFixed(2)}">${delts}</g>
  ${chest}
  <g opacity="${def.toFixed(2)}">${abs.join('')}</g>
  ${bellyShape}
  <ellipse cx="${C}" cy="${212 + 6 * belly}" rx="1.6" ry="${(2.2 + 1.5 * belly).toFixed(1)}" fill="${groove}" opacity=".6"/>
  <g opacity="${(def * 0.5).toFixed(2)}">${vlines}${quads}</g>
  <g filter="url(#${id}blur)">${shadows.join('')}</g>
  <g filter="url(#${id}blur2)">${lights.join('')}</g>
  <path d="${shorts}" fill="url(#${id}sh)"/>
  <path d="M${C - hw + 1},${229} L${C + hw - 1},${229}" stroke="${clothHi}" stroke-width="3"/>
</svg>`;
}
