// Journal du jour : ce que la personne a mangé, pour remplir ses objectifs (calories, protéines…).
// Tout reste sur le téléphone (localStorage).

const KEY = 'affute.journal';
const fmt = (v, d = 0) => Number(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Date du jour au format AAAA-MM-JJ (heure locale).
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
function save(all) {
  // On garde 90 jours maximum.
  const keys = Object.keys(all).sort();
  while (keys.length > 90) delete all[keys.shift()];
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* stockage plein */ }
}

export function entries(day = dayKey()) { return load()[day] || []; }

export function addEntry(e, day = dayKey()) {
  const all = load();
  const list = all[day] || [];
  const entry = {
    id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, t: Date.now(),
    nom: e.nom, src: e.src || 'manuel', ref: e.ref || null, emoji: e.emoji || '🍽️',
    kcal: Math.round(e.kcal || 0), prot: Math.round((e.prot || 0) * 10) / 10,
    gluc: Math.round((e.gluc || 0) * 10) / 10, lip: Math.round((e.lip || 0) * 10) / 10,
  };
  list.push(entry);
  all[day] = list;
  save(all);
  window.dispatchEvent(new CustomEvent('journal'));
  return entry;
}

export function removeEntry(id, day = dayKey()) {
  const all = load();
  all[day] = (all[day] || []).filter((x) => x.id !== id);
  save(all);
  window.dispatchEvent(new CustomEvent('journal'));
}

export const findByRef = (ref, day = dayKey()) => entries(day).find((x) => x.ref === ref);

export function totals(list = entries()) {
  return list.reduce((t, x) => ({ kcal: t.kcal + x.kcal, prot: t.prot + x.prot, gluc: t.gluc + x.gluc, lip: t.lip + x.lip }), { kcal: 0, prot: 0, gluc: 0, lip: 0 });
}

const reached = (t, plan) => t.kcal >= plan.kcal * 0.9 && t.kcal <= plan.kcal * 1.1 && t.prot >= plan.prot * 0.9;

// Nombre de jours d'affilée (avant aujourd'hui, plus aujourd'hui si atteint) où l'objectif a été rempli.
export function streak(plan) {
  const all = load();
  let n = 0;
  const d = new Date();
  if (reached(totals(all[dayKey(d)] || []), plan)) n++;
  for (let i = 1; i < 90; i++) {
    d.setDate(d.getDate() - 1);
    if (reached(totals(all[dayKey(d)] || []), plan)) n++; else break;
  }
  return n;
}

// Carte « Aujourd'hui » : jauges qui se remplissent au fil des repas.
export function dayCard(plan, { masse = false } = {}) {
  const list = entries();
  const t = totals(list);
  const pct = (v, max) => Math.max(0, Math.round((v / max) * 100));
  const kp = pct(t.kcal, plan.kcal);
  const left = plan.kcal - t.kcal;
  const s = streak(plan);
  const bar = (label, v, max, unit, color) => {
    const p = pct(v, max);
    return `<div class="macro"><div class="row between"><span>${label}</span><span class="nw"><b>${fmt(v)}</b><span class="muted">/${fmt(max)}${unit}</span></span></div>
      <div class="bar fill"><i style="width:${Math.min(100, p)}%;background:${p > 115 ? '#ff3b30' : color}"></i></div></div>`;
  };
  let msg;
  if (!list.length) msg = `<p class="small muted" style="margin:0">Touche <b>✓ Mangé</b> dans « Semaine », ou « J'ai mangé ce repas » sur une recette, ou ajoute un produit scanné : ta jauge se remplit.</p>`;
  else if (reached(t, plan)) msg = '<div class="notice ok-notice">🎉 <b>Objectif du jour atteint !</b> Bravo, continue comme ça.</div>';
  else if (left < -plan.kcal * 0.1) msg = `<div class="notice warn">${masse ? 'Tu as bien mangé aujourd\'hui 💪' : `Tu as dépassé de ${fmt(-left)} kcal. Pas grave : reprends normalement demain.`}</div>`;
  else if (left > 0) msg = `<p class="small" style="margin:0">Encore <b>${fmt(left)} kcal</b> et <b>${fmt(Math.max(0, plan.prot - t.prot))} g de protéines</b> pour aujourd'hui.</p>`;
  else msg = `<p class="small" style="margin:0">Calories atteintes. Il manque <b>${fmt(Math.max(0, plan.prot - t.prot))} g de protéines</b>.</p>`;

  const r = 52; const c = 2 * Math.PI * r;
  return `
  <section class="card day-card" id="day-card">
    <div class="row between"><h2 style="margin:0">Aujourd'hui</h2>${s ? `<span class="pill warn">🔥 ${s} jour${s > 1 ? 's' : ''} d'affilée</span>` : ''}</div>
    <div class="ring-wrap" style="margin-top:12px">
      <div class="ring"><svg viewBox="0 0 136 136">
        <circle cx="68" cy="68" r="${r}" fill="none" stroke="rgba(250,17,79,.14)" stroke-width="16"/>
        <circle class="ring-fill" cx="68" cy="68" r="${r}" fill="none" stroke="url(#dg)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(c * Math.min(1, kp / 100)).toFixed(1)} ${c.toFixed(1)}"/>
        <defs><linearGradient id="dg"><stop offset="0" stop-color="#fa114f"/><stop offset="1" stop-color="#ff6482"/></linearGradient></defs></svg>
        <div class="val"><b>${kp} %</b><span>${fmt(t.kcal)} / ${fmt(plan.kcal)}<br>kcal</span></div></div>
      <div>
        ${bar('🥩 Protéines', t.prot, plan.prot, 'g', 'var(--prot)')}
        ${bar('🍚 Glucides', t.gluc, plan.gluc, 'g', 'var(--gluc)')}
        ${bar('🥑 Lipides', t.lip, plan.lip, 'g', 'var(--lip)')}
      </div>
    </div>
    <div style="margin-top:12px">${msg}</div>
    ${list.length ? `<ul class="day-list">${list.map((x) => `<li><span>${esc(x.emoji)} ${esc(x.nom)}</span><span class="muted small">${fmt(x.kcal)} kcal · ${fmt(x.prot)} g prot.</span><button class="chip" data-del-entry="${x.id}" aria-label="Retirer ${esc(x.nom)}">✕</button></li>`).join('')}</ul>` : ''}
    <details class="quick-add"><summary class="small">+ Ajouter autre chose</summary>
      <form id="qa" class="stack" style="margin-top:10px">
        <input class="input" name="nom" placeholder="Ex. sandwich, pizza…" required aria-label="Ce que tu as mangé">
        <div class="grid2"><div class="unit-input"><input class="input" name="kcal" inputmode="decimal" placeholder="Calories" required aria-label="Calories"><em>kcal</em></div>
          <div class="unit-input"><input class="input" name="prot" inputmode="decimal" placeholder="Protéines" aria-label="Protéines"><em>g</em></div></div>
        <button class="btn small" type="submit">Ajouter</button>
      </form></details>
  </section>`;
}

// À appeler après avoir affiché la carte.
export function bindDayCard(root, rerender) {
  root.querySelectorAll('[data-del-entry]').forEach((b) => b.addEventListener('click', () => { removeEntry(b.dataset.delEntry); rerender(); }));
  root.querySelector('#qa')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const n = (k) => parseFloat(String(f.get(k) || '').replace(',', '.')) || 0;
    if (!String(f.get('nom')).trim() || !n('kcal')) return;
    addEntry({ nom: String(f.get('nom')).trim(), kcal: n('kcal'), prot: n('prot'), src: 'manuel', emoji: '✍️' });
    rerender();
  });
}

// Petit compteur dans la barre du haut, visible partout.
export function updateChip(plan) {
  const el = document.getElementById('day-chip');
  if (!el) return;
  if (!plan) { el.hidden = true; return; }
  const t = totals();
  const p = Math.round((t.kcal / plan.kcal) * 100);
  const r = 9; const c = 2 * Math.PI * r;
  el.hidden = false;
  el.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="${r}" fill="none" stroke="rgba(250,17,79,.18)" stroke-width="4"/>
    <circle cx="12" cy="12" r="${r}" fill="none" stroke="#fa114f" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(c * Math.min(1, p / 100)).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 12 12)"/></svg>
    <span><b>${fmt(t.kcal)}</b>/${fmt(plan.kcal)}</span>`;
  el.setAttribute('aria-label', `Aujourd'hui : ${fmt(t.kcal)} sur ${fmt(plan.kcal)} kcal`);
}
