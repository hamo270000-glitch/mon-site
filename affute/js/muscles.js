// Carte des muscles (face et dos), façon Fitbod : les muscles travaillés sont colorés.
// levels : { pecs: 1, triceps: 0.5, … } (0 = rien, 1 = muscle principal).

const BASE = '#dcdce1';
const SKIN = '#f1f1f4';

function shape(id, d, levels) {
  const v = levels[id] || 0;
  const fill = v >= 0.75 ? '#ff2d55' : v > 0 ? '#ff9f0a' : BASE;
  const op = v >= 0.75 ? 0.6 + 0.4 * v : v > 0 ? 0.55 + 0.45 * v : 1;
  return `<path d="${d}" fill="${fill}" fill-opacity="${op.toFixed(2)}" stroke="#ffffff" stroke-width="0.8" stroke-linejoin="round"><title>${id}</title></path>`;
}
const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${(100 - Number(x)).toFixed(1)},${y}`);
const both = (id, d, levels) => shape(id, d, levels) + shape(id, mirror(d), levels);

// Silhouette de fond (identique devant / derrière).
const SIL = `M50,4 C57,4 60,10 60,17 C60,23 57,27 55,29 L56,32 C63,33 70,35 74,40 C78,46 79,56 80,64 C81,74 82,84 83,96 L79,97
  C77,86 75,76 72,67 L71,92 C70,98 67,100 66,104 C67,120 66,138 63,152 C62,166 63,182 61,198 C61,204 62,210 60,214 L53,214
  C53,206 54,196 53,186 C52,170 52,150 51,128 L50,118 L49,128 C48,150 48,170 47,186 C46,196 47,206 47,214 L40,214 C38,210 39,204 39,198
  C37,182 38,166 37,152 C34,138 33,120 34,104 C33,100 30,98 29,92 L28,67 C25,76 23,86 21,97 L17,96 C18,84 19,74 20,64 C21,56 22,46 26,40
  C30,35 37,33 44,32 L45,29 C43,27 40,23 40,17 C40,10 43,4 50,4 Z`;

function front(levels) {
  return `
  <path d="${SIL}" fill="${SKIN}" stroke="#c7c7cc" stroke-width="0.8"/>
  ${both('trapezes', 'M45,31 C42,32 38,33 35,35 L44,35 Z', levels)}
  ${both('epaules', 'M34,35 C27,36 23,41 23,50 C26,48 30,46 34,46 C35,42 36,38 38,36 Z', levels)}
  ${both('pecs', 'M49,37 C44,36 39,36 36,38 C34,42 34,47 35,51 C39,55 45,55 49,52 Z', levels)}
  ${both('biceps', 'M24,52 C22,58 22,64 24,68 C27,68 29,64 30,58 C30,54 29,50 27,49 Z', levels)}
  ${both('avantbras', 'M23,70 C21,78 19,86 18,94 L21,95 C23,88 26,80 28,72 C27,70 25,69 23,70 Z', levels)}
  ${both('obliques', 'M36,56 C35,64 36,74 38,84 L43,86 L42,57 Z', levels)}
  ${both('abdos', 'M44,56 L49,56 L49,63 L44,63 Z', levels)}
  ${both('abdos', 'M44,64.5 L49,64.5 L49,71.5 L44,71.5 Z', levels)}
  ${both('abdos', 'M44,73 L49,73 L49,82 C47,85 45,85 44,84 Z', levels)}
  ${both('quadriceps', 'M36,104 C34,118 35,134 38,148 L44,150 C47,140 49,124 49,110 C46,106 41,104 36,104 Z', levels)}
  ${both('mollets', 'M39,160 C38,170 39,182 41,192 L44,192 C45,182 45,170 44,160 Z', levels)}`;
}

function back(levels) {
  return `
  <path d="${SIL}" fill="${SKIN}" stroke="#c7c7cc" stroke-width="0.8"/>
  ${shape('trapezes', 'M50,29 C46,31 40,33 36,36 C41,39 46,44 50,54 C54,44 59,39 64,36 C60,33 54,31 50,29 Z', levels)}
  ${both('epaules', 'M35,36 C28,37 24,42 23,50 C27,48 31,47 35,47 C35,43 36,39 37,37 Z', levels)}
  ${both('dos', 'M37,40 C35,46 35,54 37,62 C40,72 44,78 48,80 L49,58 C46,50 42,44 37,40 Z', levels)}
  ${both('triceps', 'M24,52 C22,58 22,64 24,69 C27,69 30,64 30,58 C30,54 28,50 26,49 Z', levels)}
  ${both('avantbras', 'M23,71 C21,79 19,87 18,94 L21,95 C23,88 26,80 28,73 C27,71 25,70 23,71 Z', levels)}
  ${both('lombaires', 'M44,82 L49,82 L49,95 L41,95 C41,90 42,86 44,82 Z', levels)}
  ${both('fessiers', 'M35,98 C34,104 35,112 39,116 C44,118 48,116 49,112 L49,98 C44,96 39,96 35,98 Z', levels)}
  ${both('ischios', 'M36,120 C35,132 36,142 38,150 L44,150 C46,140 48,130 48,120 C44,118 40,118 36,120 Z', levels)}
  ${both('mollets', 'M38,158 C36,166 37,176 40,184 C43,184 45,176 45,166 C45,160 43,156 40,156 Z', levels)}`;
}

export function muscleMap(levels = {}, { size = 150, labels = true } = {}) {
  return `<svg class="muscle-map" viewBox="0 0 210 232" width="${size * 1.4}" height="${Math.round(size * 1.55)}" role="img" aria-label="Muscles travaillés">
    <g transform="translate(0,6)">${front(levels)}</g>
    <g transform="translate(108,6)">${back(levels)}</g>
    ${labels ? '<text x="50" y="230" text-anchor="middle" font-size="9" fill="#8e8e93">Face</text><text x="158" y="230" text-anchor="middle" font-size="9" fill="#8e8e93">Dos</text>' : ''}
  </svg>`;
}

// Niveaux d'une liste d'exercices : muscle principal = 1, secondaire = 0,5.
export function levelsFor(exercises) {
  const l = {};
  for (const e of exercises) {
    for (const m of e.sec || []) l[m] = Math.max(l[m] || 0, 0.5);
    for (const m of e.muscles || []) l[m] = 1;
  }
  return l;
}
