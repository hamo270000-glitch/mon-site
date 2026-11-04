// Avatar « hologramme » : silhouette de face calculée à partir du sexe et du taux de masse grasse.
// Plus le taux baisse, plus la taille s'affine et plus les muscles (abdos, pectoraux) se dessinent.

// Courbe lisse passant par des points (Catmull-Rom → Bézier).
function smooth(points, closed = true) {
  const p = points;
  const n = p.length;
  const get = (i) => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = get(i - 1); const p1 = get(i); const p2 = get(i + 1); const p3 = get(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? `${d} Z` : d;
}

const mirror = (pts) => pts.map(([x, y]) => [200 - x, y]).reverse();

let uid = 0;

export function bodySVG({ sexe = 'h', bf = 20, label = '', size = 220 } = {}) {
  const id = `b${++uid}`;
  const h = sexe === 'h';
  const lean = h ? 8 : 15;
  const f = Math.max(0, Math.min(1.4, (bf - lean) / 28)); // 0 = très sec, 1 = surpoids
  const def = Math.max(0, Math.min(1, ((h ? 24 : 31) - bf) / (h ? 14 : 13))); // visibilité des muscles

  const C = 100;
  const sw = h ? 52 : 44; // épaules
  const cw = (h ? 40 : 35) + 7 * f; // poitrine
  const ww = (h ? 29 : 25) + 19 * f; // taille
  const hw = (h ? 33 : 40) + 13 * f; // hanches
  const tw = (h ? 17 : 19) + 8 * f; // cuisses
  const aw = (h ? 10 : 8) + 4.5 * f; // bras
  const belly = 6 * f;

  const torso = [
    [C + 11, 72], [C + sw - 6, 86], [C + sw, 100], [C + cw + 2, 124], [C + cw, 145],
    [C + ww + belly * 0.4, 175], [C + ww, 195], [C + hw, 228], [C + hw - 3, 250], [C + 5, 262],
  ];
  const torsoPath = smooth([...torso, ...mirror(torso)]);

  const leg = (side) => {
    const s = side;
    const cx = C + s * (hw * 0.48);
    const pts = [
      [C + s * hw, 232], [cx + s * (tw + 1), 275], [cx + s * (tw * 0.62), 330], [cx + s * (tw * 0.7), 360],
      [cx + s * 6, 402], [cx - s * 4, 404], [cx - s * (tw * 0.45), 360], [cx - s * (tw * 0.45), 330],
      [C + s * 3, 266],
    ];
    return smooth(s > 0 ? pts : pts.slice().reverse(), true);
  };

  const arm = (side) => {
    const s = side;
    const x0 = C + s * sw;
    const pts = [
      [x0 - s * 4, 92], [x0 + s * (aw * 0.9), 108], [x0 + s * (aw + 2), 150], [x0 + s * (aw * 0.7), 188],
      [x0 + s * (aw * 0.6), 240], [x0 + s * 2, 256], [x0 - s * 4, 240], [x0 - s * (aw * 0.45), 190],
      [x0 - s * (aw * 0.6), 140], [x0 - s * 8, 112],
    ];
    return smooth(s > 0 ? pts : pts.slice().reverse(), true);
  };

  // Lignes de définition musculaire (opacité selon la sécheresse).
  const absTop = 150; const absBottom = 215;
  const absLines = [];
  for (let i = 1; i <= 3; i++) {
    const y = absTop + ((absBottom - absTop) / 4) * i;
    absLines.push(`M${C - 15},${y.toFixed(1)} Q${C - 7},${(y + 3).toFixed(1)} ${C},${y.toFixed(1)} Q${C + 7},${(y + 3).toFixed(1)} ${C + 15},${y.toFixed(1)}`);
  }
  const muscles = [
    `M${C},${absTop - 4} L${C},${absBottom + 18}`,
    ...absLines,
    `M${C - 15},${absTop} Q${C - 19},${(absTop + absBottom) / 2} ${C - 14},${absBottom + 10}`,
    `M${C + 15},${absTop} Q${C + 19},${(absTop + absBottom) / 2} ${C + 14},${absBottom + 10}`,
    h ? `M${C - 34},118 Q${C - 18},${136} ${C - 2},${128}` : `M${C - 26},132 Q${C - 15},${148} ${C - 4},${138}`,
    h ? `M${C + 34},118 Q${C + 18},${136} ${C + 2},${128}` : `M${C + 26},132 Q${C + 15},${148} ${C + 4},${138}`,
    `M${C - ww + 2},200 L${C - 16},${absBottom + 22}`,
    `M${C + ww - 2},200 L${C + 16},${absBottom + 22}`,
    `M${C - sw + 2},104 Q${C - sw + 10},${116} ${C - sw + 6},${132}`,
    `M${C + sw - 2},104 Q${C + sw - 10},${116} ${C + sw - 6},${132}`,
  ];

  return `
<svg class="avatar" viewBox="0 0 200 430" width="${size}" height="${Math.round(size * 2.15)}" role="img" aria-label="${label || 'Silhouette'}">
  <defs>
    <linearGradient id="${id}g" x1="0" x2="1">
      <stop offset="0" stop-color="var(--holo-a)" stop-opacity=".25"/>
      <stop offset=".5" stop-color="var(--holo-b)" stop-opacity=".55"/>
      <stop offset="1" stop-color="var(--holo-a)" stop-opacity=".25"/>
    </linearGradient>
    <radialGradient id="${id}r" cx=".5" cy=".35" r=".6">
      <stop offset="0" stop-color="#fff" stop-opacity=".35"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <filter id="${id}f" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="${id}p" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 8 L8 0" stroke="var(--holo-b)" stroke-opacity=".12" stroke-width="1"/>
    </pattern>
  </defs>
  <ellipse cx="100" cy="414" rx="60" ry="9" fill="var(--holo-b)" opacity=".18"/>
  <ellipse cx="100" cy="414" rx="34" ry="5" fill="var(--holo-b)" opacity=".3"/>
  <g filter="url(#${id}f)" stroke="var(--holo-b)" stroke-width="1.6" stroke-linejoin="round">
    <path d="${arm(-1)}" fill="url(#${id}g)"/>
    <path d="${arm(1)}" fill="url(#${id}g)"/>
    <path d="${leg(-1)}" fill="url(#${id}g)"/>
    <path d="${leg(1)}" fill="url(#${id}g)"/>
    <path d="${torsoPath}" fill="url(#${id}g)"/>
    <path d="${torsoPath}" fill="url(#${id}p)" stroke="none"/>
    <rect x="${C - 9}" y="58" width="18" height="18" rx="6" fill="url(#${id}g)"/>
    <ellipse cx="${C}" cy="38" rx="20" ry="24" fill="url(#${id}g)"/>
    <ellipse cx="${C}" cy="38" rx="20" ry="24" fill="url(#${id}r)" stroke="none"/>
  </g>
  <g stroke="var(--holo-c)" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="${(0.12 + def * 0.85).toFixed(2)}">
    ${muscles.map((d) => `<path d="${d}"/>`).join('')}
  </g>
  <path d="${torsoPath}" fill="url(#${id}r)" stroke="none" opacity=".6"/>
</svg>`;
}
