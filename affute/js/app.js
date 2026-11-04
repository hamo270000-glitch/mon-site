import { ACTIVITY, PACES, BODIES, SLOTS, computePlan, safetyCheck, bmi } from './calc.js';
import {
  loadData, loadFoods, norm, mealNutrition, mealPrice, mealPricesByStore, dietCheck, portionFactor, displayQty, ingredientPrice,
} from './data.js';
import { bodySVG } from './body.js';
import { savePhoto, listPhotos, deletePhoto, loadImage, blobToImage, simulate } from './photo.js';
import { viewScan, viewScanProduct, stopScan, ALLERGENS } from './scan.js';

// ---------- Stockage local (tout reste sur le téléphone) ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem(`affute.${k}`); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(`affute.${k}`, JSON.stringify(v)); } catch (e) { /* stockage plein ou bloqué */ } },
};

let profile = store.get('profil', null);
let DATA = null;

const $app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (v, d = 0) => Number(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const euro = (v) => Number(v).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const dateFr = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) => new Date(d).toLocaleDateString('fr-FR', opts);
const storeName = (id) => (DATA?.magasins.find((m) => m.id === id) || {}).nom || 'Moyenne France';
const myStore = () => profile?.magasin || 'leclerc';

const ICON_SWAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>';

// ---------- Navigation ----------
async function route() {
  const [, page = '', arg] = (location.hash || '').split('/');
  if (!DATA) {
    try { DATA = await loadData(); } catch (e) {
      $app.innerHTML = '<div class="notice stop">Impossible de charger les données. Vérifie ta connexion et recharge la page.</div>';
      return;
    }
  }
  if (!profile && page !== 'profil') { location.hash = '#/profil'; return; }
  await stopScan();
  document.querySelectorAll('.tabbar a').forEach((a) => {
    const on = a.dataset.tab === page || (page === 'repas' && a.dataset.tab === 'repas');
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
  const views = {
    profil: viewProfil, plan: viewPlan, semaine: viewSemaine, repas: arg ? () => viewRepasDetail(arg) : viewRepas, aliments: viewAliments, photos: viewCorps,
    scan: arg ? () => viewScanProduct($app, arg.replace(/\D/g, ''), profile, computePlan(profile)) : () => viewScan($app),
  };
  (views[page] || viewPlan)();
  $app.classList.remove('fade-in'); void $app.offsetWidth; $app.classList.add('fade-in');
}
window.addEventListener('hashchange', route);

// Petit effet 3D : les cartes « .tilt » suivent le doigt.
document.addEventListener('pointermove', (e) => {
  const el = e.target.closest?.('.tilt');
  if (!el) return;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
});
document.addEventListener('pointerout', (e) => { const el = e.target.closest?.('.tilt'); if (el) el.style.transform = ''; });

// ---------- Profil ----------
function viewProfil() {
  const p = profile || { sexe: 'h', activite: 'leger', rythme: 'normale', corps: 'athletique', regimes: [], magasin: 'leclerc' };
  const radio = (name, value, label, detail, extra = '') => `
    <label class="choice ${extra}"><input type="radio" name="${name}" value="${value}" ${p[name] === value ? 'checked' : ''}>
      <b>${label}</b>${detail ? `<small>${detail}</small>` : ''}</label>`;
  const num = (name, label, unit, attrs) => `
    <label class="field"><span>${label}</span><div class="unit-input">
      <input class="input" type="number" inputmode="decimal" name="${name}" value="${p[name] ?? ''}" ${attrs}><em>${unit}</em></div></label>`;

  $app.innerHTML = `
    <h1 class="title">${profile ? 'Mon profil' : 'Ta sèche, <span class="grad-text">sur mesure</span>.'}</h1>
    <p class="lead">${profile ? 'Modifie tes infos : ton plan se recalcule tout seul.' : 'Réponds en 1 minute : calories, protéines, repas avec les vrais prix de ton magasin et l\'aperçu de ton futur corps.'}</p>
    <form id="pf" class="stack" novalidate>
      <section class="card">
        <h2>1. Toi</h2>
        <div class="choices two">${radio('sexe', 'h', 'Homme')}${radio('sexe', 'f', 'Femme')}</div>
        <div class="grid3" style="margin-top:12px">
          ${num('age', 'Âge', 'ans', 'min="12" max="99" required')}
          ${num('taille', 'Taille', 'cm', 'min="120" max="230" required')}
          ${num('poids', 'Poids', 'kg', 'min="30" max="300" step="0.1" required')}
        </div>
        <label class="choice" id="preg-wrap" style="margin-top:12px;${p.sexe === 'f' ? '' : 'display:none'}">
          <input type="checkbox" name="enceinte" ${p.enceinte ? 'checked' : ''}><b>Je suis enceinte ou j'allaite</b></label>
      </section>

      <section class="card">
        <h2>2. Ton activité</h2>
        <div class="choices">${ACTIVITY.map((a) => radio('activite', a.id, a.label, a.detail)).join('')}</div>
      </section>

      <section class="card">
        <h2>3. Le corps que tu veux</h2>
        <div class="choices two" id="bodies">${BODIES.map((b) => `
          <label class="choice body-choice"><input type="radio" name="corps" value="${b.id}" ${p.corps === b.id ? 'checked' : ''}>
            <span class="fig" data-body="${b.id}"></span><b>${b.label}</b><small>${b.detail}</small></label>`).join('')}
        </div>
        <div style="margin-top:12px">${num('poidsCible', 'Poids visé (facultatif : sinon calculé pour toi)', 'kg', 'min="35" max="250" step="0.5"')}</div>
      </section>

      <section class="card">
        <h2>4. Ton rythme</h2>
        <div class="choices">${PACES.map((x) => radio('rythme', x.id, x.label, x.detail)).join('')}</div>
      </section>

      <section class="card">
        <h2>5. Tes habitudes</h2>
        <p class="small muted" style="margin-top:-6px">Régime alimentaire</p>
        <div class="chips" id="diets">${[['halal', 'Halal'], ['vegetarien', 'Végétarien'], ['sanslactose', 'Sans lactose']].map(([id, l]) => `
          <button type="button" class="chip" data-diet="${id}" aria-pressed="${(p.regimes || []).includes(id)}">${l}</button>`).join('')}</div>
        <p class="small muted">Allergies (pour le scanner)</p>
        <div class="chips" id="allergies" style="flex-wrap:wrap">${ALLERGENS.map((a) => `
          <button type="button" class="chip" data-allergy="${a.tag}" aria-pressed="${(p.allergies || []).includes(a.tag)}">${a.label}</button>`).join('')}</div>
        <p class="small muted">Ton magasin habituel</p>
        <div class="chips" id="stores">${DATA.magasins.map((m) => `
          <button type="button" class="chip" data-store="${m.id}" aria-pressed="${p.magasin === m.id}">${m.nom}</button>`).join('')}</div>
        <details style="margin-top:14px">
          <summary class="small" style="cursor:pointer;color:var(--mint)">+ Mes mensurations (plus précis)</summary>
          <p class="small muted">Avec un mètre ruban : tour de taille au niveau du nombril, tour de cou sous la pomme d'Adam${p.sexe === 'f' ? ', tour de hanches au plus large' : ''}.</p>
          <div class="grid3">
            ${num('tourTaille', 'Taille', 'cm', 'min="40" max="200"')}
            ${num('tourCou', 'Cou', 'cm', 'min="20" max="70"')}
            ${num('tourHanches', 'Hanches', 'cm', 'min="50" max="200"')}
          </div>
        </details>
      </section>

      <p id="err" class="notice stop" hidden></p>
      <button class="btn block" type="submit">${profile ? 'Enregistrer' : 'Calculer mon plan ⚡'}</button>
      ${profile ? '<button class="btn ghost block" type="button" id="reset">Tout effacer</button>' : ''}
      <p class="footer-note">Tes données restent sur ton téléphone. Affûté ne remplace pas l'avis d'un médecin ou d'un diététicien.</p>
    </form>`;

  const form = document.getElementById('pf');
  const drawBodies = () => {
    const sexe = form.sexe.value || 'h';
    document.querySelectorAll('[data-body]').forEach((el) => {
      const b = BODIES.find((x) => x.id === el.dataset.body);
      el.innerHTML = bodySVG({ sexe, bf: sexe === 'h' ? b.h : b.f, size: 90, label: b.label });
    });
    document.getElementById('preg-wrap').style.display = sexe === 'f' ? '' : 'none';
  };
  drawBodies();
  form.addEventListener('change', (e) => { if (e.target.name === 'sexe') drawBodies(); });

  const diets = new Set(p.regimes || []);
  const allergies = new Set(p.allergies || []);
  document.getElementById('allergies').addEventListener('click', (e) => {
    const b = e.target.closest('[data-allergy]'); if (!b) return;
    const id = b.dataset.allergy;
    allergies.has(id) ? allergies.delete(id) : allergies.add(id);
    b.setAttribute('aria-pressed', allergies.has(id));
  });
  let shop = p.magasin || 'leclerc';
  document.getElementById('diets').addEventListener('click', (e) => {
    const b = e.target.closest('[data-diet]'); if (!b) return;
    const id = b.dataset.diet;
    diets.has(id) ? diets.delete(id) : diets.add(id);
    b.setAttribute('aria-pressed', diets.has(id));
  });
  document.getElementById('stores').addEventListener('click', (e) => {
    const b = e.target.closest('[data-store]'); if (!b) return;
    shop = b.dataset.store;
    document.querySelectorAll('[data-store]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  });
  document.getElementById('reset')?.addEventListener('click', () => {
    if (!confirm('Effacer ton profil, ton suivi de poids et tes choix de repas ? (Les photos restent.)')) return;
    ['profil', 'poids', 'semaine'].forEach((k) => localStorage.removeItem(`affute.${k}`));
    profile = null; location.hash = '#/profil'; route();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const n = (k) => { const v = parseFloat(String(f.get(k) || '').replace(',', '.')); return Number.isFinite(v) ? v : null; };
    const np = {
      sexe: f.get('sexe') || 'h', age: n('age'), taille: n('taille'), poids: n('poids'),
      activite: f.get('activite') || 'leger', corps: f.get('corps') || 'athletique', rythme: f.get('rythme') || 'normale',
      poidsCible: n('poidsCible'), regimes: [...diets], allergies: [...allergies], magasin: shop,
      tourTaille: n('tourTaille'), tourCou: n('tourCou'), tourHanches: n('tourHanches'),
      enceinte: f.get('sexe') === 'f' && f.get('enceinte') === 'on',
      depart: profile?.depart || { date: Date.now(), poids: n('poids') },
    };
    const err = document.getElementById('err');
    const problems = [];
    if (!np.age || np.age < 12 || np.age > 99) problems.push('ton âge');
    if (!np.taille || np.taille < 120 || np.taille > 230) problems.push('ta taille en cm (ex. 175)');
    if (!np.poids || np.poids < 30 || np.poids > 300) problems.push('ton poids en kg (ex. 80)');
    if (problems.length) { err.hidden = false; err.textContent = `Vérifie ${problems.join(', ')}.`; err.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (np.poidsCible && np.poidsCible >= np.poids) np.poidsCible = null;
    profile = np;
    store.set('profil', profile);
    // Premier poids du suivi
    const log = store.get('poids', []);
    if (!log.length) store.set('poids', [{ d: Date.now(), kg: np.poids }]);
    location.hash = '#/plan';
  });
}

// ---------- Plan ----------
function chartSVG(series, { height = 170, target, labels = [] } = {}) {
  const W = 340; const H = height; const pad = { l: 34, r: 10, t: 12, b: 22 };
  const all = series.flatMap((s) => s.points.map((p) => p[1])).concat(target ? [target] : []);
  const minY = Math.floor(Math.min(...all) - 1); const maxY = Math.ceil(Math.max(...all) + 1);
  const maxX = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p[0])));
  const X = (x) => pad.l + (x / maxX) * (W - pad.l - pad.r);
  const Y = (y) => pad.t + (1 - (y - minY) / (maxY - minY || 1)) * (H - pad.t - pad.b);
  const ticks = [minY, Math.round((minY + maxY) / 2), maxY];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution du poids">
    <defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2bd89c" stop-opacity=".35"/><stop offset="1" stop-color="#2bd89c" stop-opacity="0"/></linearGradient></defs>
    ${ticks.map((t) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Y(t)}" y2="${Y(t)}" stroke="rgba(16,60,38,.08)"/><text x="${pad.l - 6}" y="${Y(t) + 4}" fill="#5f6f66" font-size="10" text-anchor="end">${t}</text>`).join('')}
    ${target ? `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Y(target)}" y2="${Y(target)}" stroke="#4a9a00" stroke-dasharray="4 4" opacity=".8"/><text x="${W - pad.r}" y="${Y(target) - 5}" fill="#4a9a00" font-size="10" text-anchor="end">Objectif ${fmt(target, 1)} kg</text>` : ''}
    ${series.map((s) => {
      const pts = s.points.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`);
      const area = s.fill ? `<path d="M${pts[0]} L${pts.join(' L')} L${X(s.points.at(-1)[0])},${H - pad.b} L${X(s.points[0][0])},${H - pad.b} Z" fill="url(#cg)"/>` : '';
      const dots = s.dots ? s.points.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="3.5" fill="${s.color}"/>`).join('') : '';
      return `${area}<polyline points="${pts.join(' ')}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.5}" stroke-linecap="round" stroke-linejoin="round" ${s.dash ? 'stroke-dasharray="5 5"' : ''}/>${dots}`;
    }).join('')}
    ${labels.map(([x, t]) => `<text x="${X(x)}" y="${H - 6}" fill="#5f6f66" font-size="10" text-anchor="middle">${t}</text>`).join('')}
  </svg>`;
}

function viewPlan() {
  const p = profile;
  const stops = safetyCheck(p);
  const plan = computePlan(p);
  const ring = (val, max, color) => {
    const r = 58; const c = 2 * Math.PI * r;
    return `<circle cx="68" cy="68" r="${r}" fill="none" stroke="rgba(16,60,38,.07)" stroke-width="14"/>
      <circle cx="68" cy="68" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${(c * Math.min(1, val / max)).toFixed(1)} ${c.toFixed(1)}"/>`;
  };
  const macroKcal = plan.prot * 4 + plan.gluc * 4 + plan.lip * 9;
  const macro = (label, g, kcalPerG, color) => `
    <div class="macro"><div class="row"><span>${label}</span><b>${g} g</b></div>
      <div class="bar"><i style="width:${Math.round((g * kcalPerG / macroKcal) * 100)}%;background:${color}"></i></div></div>`;

  if (stops.length) {
    $app.innerHTML = `
      <h1 class="title">Ton plan</h1>
      ${stops.map((s) => `<div class="notice stop">${esc(s)}</div>`).join('')}
      <section class="card"><h2>Tes besoins pour garder ton poids</h2>
        <p style="font-size:2rem;margin:0"><b>${fmt(plan.tdee)}</b> <span class="muted small">kcal par jour</span></p>
        <p class="small muted">Les repas de l'appli restent utiles : riches en protéines, variés et pas chers.</p></section>
      <a class="btn block" href="#/profil">Modifier mon profil</a>`;
    return;
  }

  $app.innerHTML = `
    <h1 class="title">${plan.toLose > 0 ? `<span class="grad-text">−${fmt(plan.toLose, 1)} kg</span> en ${plan.nbWeeks > 26 ? `${Math.round(plan.nbWeeks / 4.35)} mois` : `${plan.nbWeeks} semaines`}` : 'Tu es déjà à ton objectif 💪'}</h1>
    <p class="lead">${plan.toLose > 0 ? `Objectif atteint vers le <b style="color:var(--text)">${dateFr(plan.end)}</b> en suivant ton plan.` : 'On garde tes calories à l\'équilibre et on mise sur le muscle.'}</p>

    <section class="card">
      <div class="hero3d">
        <div class="fig"><div id="fig-now"></div><div class="platform"></div><b>${fmt(p.poids, 1)} kg</b><span>Aujourd'hui · ${fmt(plan.bfNow)} % de gras</span></div>
        <div class="arrow" aria-hidden="true">→</div>
        <div class="fig"><div id="fig-goal"></div><div class="platform"></div><b id="goal-kg">${fmt(plan.target, 1)} kg</b><span id="goal-bf">Objectif · ${fmt(plan.bfAt(plan.target))} % de gras</span></div>
      </div>
      ${plan.nbWeeks > 0 ? `
      <label class="field" style="margin-top:12px"><span id="wk-label">Fais glisser pour voir ton corps semaine après semaine</span>
        <input type="range" id="wk" min="0" max="${plan.nbWeeks}" value="${plan.nbWeeks}"></label>` : ''}
      <p class="small muted" style="margin:6px 0 0">${plan.bfMesure ? 'Taux de gras calculé avec tes mensurations (formule de la Marine américaine).' : 'Taux de gras estimé à partir de ton IMC. Ajoute tes mensurations dans ton profil pour plus de précision.'}</p>
    </section>

    <section class="card tilt">
      <h2>Chaque jour</h2>
      <div class="ring-wrap">
        <div class="ring"><svg viewBox="0 0 136 136"><defs><linearGradient id="rg"><stop offset="0" stop-color="#d8ff4a"/><stop offset="1" stop-color="#22e3a0"/></linearGradient></defs>${ring(plan.kcal, plan.tdee, 'url(#rg)')}</svg>
          <div class="val"><b>${fmt(plan.kcal)}</b><span>kcal / jour</span></div></div>
        <div>
          ${macro('🥩 Protéines', plan.prot, 4, 'var(--lime)')}
          ${macro('🍚 Glucides', plan.gluc, 4, 'var(--cyan)')}
          ${macro('🥑 Lipides', plan.lip, 9, 'var(--orange)')}
        </div>
      </div>
      ${plan.limited ? '<div class="notice warn" style="margin:12px 0 0">Ton rythme a été ralenti pour ne pas descendre sous un minimum de calories sans danger.</div>' : ''}
      ${plan.nbWeeks > 26 ? '<div class="notice info" style="margin:12px 0 0">Objectif sur le long terme : fixe-toi des étapes de 5 kg et fais une pause de 1 à 2 semaines à l\'équilibre tous les 3 mois. Un suivi par un médecin ou un diététicien est conseillé.</div>' : ''}
    </section>

    <div class="grid2">
      <div class="stat"><b>${fmt(plan.tdee)}</b><span>kcal dépensées / jour</span></div>
      <div class="stat"><b>−${fmt(plan.deficit)}</b><span>kcal de déficit / jour</span></div>
      <div class="stat"><b>${fmt(plan.perWeek, 2)} kg</b><span>perdus / semaine en moyenne</span></div>
      <div class="stat"><b>${fmt(plan.eau, 1)} L</b><span>d'eau / jour au minimum</span></div>
    </div>

    <section class="card" style="margin-top:14px">
      <h2>Ta courbe prévue</h2>
      ${chartSVG([{ points: plan.weeks.map((w, i) => [i, w]), color: '#0c9f70', fill: true }], {
        target: plan.target,
        labels: [[0, 'Auj.'], [Math.round(plan.nbWeeks / 2), `S${Math.round(plan.nbWeeks / 2)}`], [plan.nbWeeks, `S${plan.nbWeeks}`]],
      })}
      <p class="small muted" style="margin:6px 0 0">Normal : le poids bouge de ±1 kg d'un jour à l'autre (eau, sel). Regarde la tendance sur 2 semaines.</p>
    </section>

    <a class="btn block" href="#/semaine">🍽️ Voir mes repas de la semaine</a>

    <section class="card" style="margin-top:14px">
      <h2>Les 6 règles d'une sèche réussie</h2>
      <ol class="steps">
        <li><b>Muscu 3 à 4 fois par semaine</b> : sinon tu perds du muscle en même temps que le gras.</li>
        <li><b>${plan.prot} g de protéines par jour</b>, réparties sur tes repas.</li>
        <li><b>8 000 à 10 000 pas par jour</b> : ça brûle sans donner faim.</li>
        <li><b>7 à 9 heures de sommeil</b> : moins de faim et meilleure récupération.</li>
        <li><b>Pèse-toi le matin</b>, à jeun, et regarde la moyenne de la semaine.</li>
        <li><b>Si tu stagnes 3 semaines</b> : baisse de 100 à 150 kcal ou ajoute 2 000 pas.</li>
      </ol>
    </section>
    <p class="footer-note">Calculs : Mifflin-St Jeor, 1 kg de gras ≈ 7 700 kcal, protéines ${p.sexe === 'h' ? '2' : '1,8'} g/kg. Estimations : chaque corps réagit différemment. Ne descends jamais sous ${p.sexe === 'h' ? '1 500' : '1 200'} kcal sans suivi médical.</p>`;

  const now = document.getElementById('fig-now');
  const goal = document.getElementById('fig-goal');
  now.innerHTML = bodySVG({ sexe: p.sexe, bf: plan.bfNow, size: 150, label: 'Toi aujourd\'hui' });
  const drawGoal = (w) => {
    const kg = plan.weeks[w];
    const bf = plan.bfAt(kg);
    goal.innerHTML = bodySVG({ sexe: p.sexe, bf, size: 150, label: `Toi dans ${w} semaines` });
    document.getElementById('goal-kg').textContent = `${fmt(kg, 1)} kg`;
    document.getElementById('goal-bf').textContent = `${w === plan.nbWeeks ? 'Objectif' : `Semaine ${w}`} · ${fmt(bf)} % de gras`;
  };
  drawGoal(plan.nbWeeks);
  const slider = document.getElementById('wk');
  slider?.addEventListener('input', () => drawGoal(Number(slider.value)));
}

// ---------- Semaine ----------
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function candidates(slot) {
  return DATA.repas.filter((m) => m.type === slot && dietCheck(m, DATA, profile.regimes).ok);
}

function weekPlan() {
  const plan = computePlan(profile);
  const kcal = safetyCheck(profile).length ? plan.tdee : plan.kcal;
  const picks = store.get('semaine', {});
  return DAYS.map((name, d) => {
    const meals = SLOTS.map((s, si) => {
      const list = candidates(s.id);
      if (!list.length) return null;
      const key = `${d}-${s.id}`;
      const idx = (picks[key] ?? (d * 3 + si * 2)) % list.length;
      const meal = list[idx];
      const factor = portionFactor(meal, DATA, kcal * s.part);
      return { slot: s, meal, factor, key, nut: mealNutrition(meal, DATA, factor) };
    }).filter(Boolean);
    const tot = meals.reduce((t, m) => ({ kcal: t.kcal + m.nut.kcal, prot: t.prot + m.nut.prot }), { kcal: 0, prot: 0 });
    return { name, meals, tot };
  });
}

function viewSemaine() {
  const plan = computePlan(profile);
  const shop = store.get('magasinSemaine', myStore());
  const week = weekPlan();
  const sum = {};
  week.forEach((day) => day.meals.forEach((m) => m.meal.ing.forEach(([id, g]) => { sum[id] = (sum[id] || 0) + g * m.factor; })));
  const shopping = Object.entries(sum).map(([id, g]) => ({ x: DATA.byId[id], g })).filter((r) => r.x);
  const totals = DATA.magasins.map((m) => {
    let total = 0; let reels = 0;
    for (const r of shopping) { const pr = ingredientPrice(r.x, m.id); if (pr) { total += (pr.kg * r.g) / 1000; if (pr.reel) reels++; } }
    return { ...m, total, reels };
  }).sort((a, b) => a.total - b.total);
  const reliable = totals.filter((t) => t.reels >= shopping.length * 0.7);
  const best = (reliable.length ? reliable : totals)[0];
  const cur = totals.find((t) => t.id === shop) || totals[0];

  $app.innerHTML = `
    <h1 class="title">Ma semaine</h1>
    <p class="lead">${fmt(plan.kcal)} kcal et ${plan.prot} g de protéines par jour. Touche ⇄ pour changer un plat.</p>
    <div class="chips" id="shop-chips" style="margin-bottom:12px">${DATA.magasins.map((m) => `<button class="chip" data-store="${m.id}" aria-pressed="${m.id === shop}">${m.nom}</button>`).join('')}</div>
    <section class="card tilt">
      <div class="row between"><div><span class="small muted">Courses de la semaine chez ${esc(cur.nom)}</span><div style="font-size:2rem;font-weight:850;letter-spacing:-.03em">${euro(cur.total)}</div>
        <span class="small muted">soit ${euro(cur.total / 7)} par jour</span></div>
        <div class="emoji3d big">🛒</div></div>
      ${best && best.id !== cur.id ? `<div class="notice info" style="margin:12px 0 0">💡 Moins cher chez <b>${esc(best.nom)}</b> : ${euro(best.total)} (−${euro(cur.total - best.total)}).</div>` : ''}
    </section>
    ${week.map((day, d) => `
      <div class="day">
        <div class="day-head"><h3 style="margin:0">${day.name}</h3><span class="small muted">${fmt(day.tot.kcal)} kcal · ${fmt(day.tot.prot)} g prot.</span></div>
        ${day.meals.map((m) => `
          <div class="slot">
            <div class="emoji3d">${m.meal.emoji}</div>
            <div><div class="small muted">${m.slot.label}</div><a href="#/repas/${m.meal.id}">${esc(m.meal.nom)}</a>
              <div class="small muted">${fmt(m.nut.kcal)} kcal · ${fmt(m.nut.prot)} g prot. · ${euro(mealPrice(m.meal, DATA, shop, m.factor).total)}</div></div>
            <button class="swap" data-swap="${m.key}" data-slot="${m.slot.id}" aria-label="Changer de plat">${ICON_SWAP}</button>
          </div>`).join('')}
      </div>`).join('')}

    <section class="card">
      <h2>🛒 Liste de courses</h2>
      <table class="t"><thead><tr><th>Produit</th><th class="num">Quantité</th><th class="num">${esc(cur.nom)}</th></tr></thead><tbody>
      ${shopping.sort((a, b) => a.x.nom.localeCompare(b.x.nom)).map((r) => {
        const pr = ingredientPrice(r.x, shop);
        return `<tr><td>${esc(r.x.nom)}</td><td class="num">${r.x.unit_g ? displayQty(r.x, r.g) : r.g >= 1000 ? `${fmt(r.g / 1000, 1)} kg` : `${Math.round(r.g / 10) * 10} g`}</td>
          <td class="num">${pr ? `${euro((pr.kg * r.g) / 1000)}${pr.reel ? '' : '*'}` : '–'}</td></tr>`;
      }).join('')}
      </tbody></table>
      <hr>
      <h3>Le même panier dans chaque magasin</h3>
      <table class="t"><tbody>${totals.map((t) => `<tr class="${t.id === best.id ? 'best' : ''}"><td>${esc(t.nom)}</td><td class="small muted">${t.reels}/${shopping.length} prix réels</td><td class="num">${euro(t.total)}</td></tr>`).join('')}</tbody></table>
      <p class="small muted">* Pas assez de relevés dans ce magasin : prix moyen en France. Prix réels relevés par la communauté Open Prices (médiane des 18 derniers mois, mise à jour ${dateFr(DATA.maj, { day: 'numeric', month: 'short', year: 'numeric' })}). Les prix en magasin peuvent varier.</p>
    </section>`;

  document.getElementById('shop-chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-store]'); if (!b) return;
    store.set('magasinSemaine', b.dataset.store); viewSemaine();
  });
  $app.querySelectorAll('[data-swap]').forEach((b) => b.addEventListener('click', () => {
    const picks = store.get('semaine', {});
    const [d] = b.dataset.swap.split('-');
    const si = SLOTS.findIndex((s) => s.id === b.dataset.slot);
    picks[b.dataset.swap] = (picks[b.dataset.swap] ?? (Number(d) * 3 + si * 2)) + 1;
    store.set('semaine', picks);
    const y = window.scrollY; viewSemaine(); window.scrollTo(0, y);
  }));
}

// ---------- Repas ----------
let repasFilter = 'tous';
let repasSort = 'prix';

function viewRepas() {
  const shop = myStore();
  const types = [['tous', 'Tous'], ...SLOTS.map((s) => [s.id, s.label])];
  const sorts = [['prix', '💶 Moins cher'], ['prot', '🥩 + de protéines'], ['kcal', '🔥 − de calories']];
  const list = DATA.repas
    .filter((m) => repasFilter === 'tous' || m.type === repasFilter)
    .filter((m) => dietCheck(m, DATA, profile.regimes).ok)
    .map((m) => ({ m, nut: mealNutrition(m, DATA), price: mealPrice(m, DATA, shop) }))
    .sort((a, b) => (repasSort === 'prix' ? a.price.total - b.price.total : repasSort === 'prot' ? b.nut.prot - a.nut.prot : a.nut.kcal - b.nut.kcal));

  $app.innerHTML = `
    <h1 class="title">Repas <span class="grad-text">sèche</span></h1>
    <p class="lead">${DATA.repas.length} recettes riches en protéines, avec leur prix chez ${esc(storeName(shop))}.</p>
    <div class="chips" id="types">${types.map(([id, l]) => `<button class="chip" data-t="${id}" aria-pressed="${repasFilter === id}">${l}</button>`).join('')}</div>
    <div class="chips" id="sorts" style="margin:8px 0 14px">${sorts.map(([id, l]) => `<button class="chip" data-s="${id}" aria-pressed="${repasSort === id}">${l}</button>`).join('')}</div>
    <div class="meal-list">${list.map(({ m, nut, price }) => `
      <a class="meal tilt" href="#/repas/${m.id}">
        <div class="emoji3d">${m.emoji}</div>
        <div><div class="name">${esc(m.nom)}</div>
          <div class="meta"><span class="pill k">${fmt(nut.kcal)} kcal</span><span class="pill p">${fmt(nut.prot)} g prot.</span><span>⏱ ${m.min} min</span></div></div>
        <div class="price-tag"><b>${euro(price.total)}</b><small>la portion</small></div>
      </a>`).join('') || '<p class="muted">Aucun repas ne correspond à ton régime dans cette catégorie.</p>'}
    </div>`;
  document.getElementById('types').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) { repasFilter = b.dataset.t; viewRepas(); } });
  document.getElementById('sorts').addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (b) { repasSort = b.dataset.s; viewRepas(); } });
}

function viewRepasDetail(id) {
  const m = DATA.repas.find((x) => x.id === id);
  if (!m) { location.hash = '#/repas'; return; }
  const plan = computePlan(profile);
  const slot = SLOTS.find((s) => s.id === m.type);
  const mine = store.get('portionPerso', true);
  const factor = mine ? portionFactor(m, DATA, plan.kcal * slot.part) : 1;
  const nut = mealNutrition(m, DATA, factor);
  const shop = myStore();
  const prices = mealPricesByStore(m, DATA, factor);
  const diet = dietCheck(m, DATA, profile.regimes);

  $app.innerHTML = `
    <a href="#/repas" class="small" style="text-decoration:none">← Tous les repas</a>
    <div class="row" style="margin:12px 0 4px;gap:14px"><div class="emoji3d big">${m.emoji}</div>
      <div><span class="pill">${slot.label}</span><h1 class="title" style="font-size:1.6rem">${esc(m.nom)}</h1><span class="muted small">⏱ ${m.min} min · 1 portion</span></div></div>
    ${diet.notes.map((n) => `<div class="notice info">${esc(n)}</div>`).join('')}
    <div class="chips" style="margin:10px 0 14px">
      <button class="chip" id="p-mine" aria-pressed="${mine}">Portion pour mon objectif</button>
      <button class="chip" id="p-std" aria-pressed="${!mine}">Portion standard</button>
    </div>
    <section class="card tilt">
      <div class="nutri" style="margin:0">
        <div><b>${fmt(nut.kcal)}</b><span>kcal</span></div>
        <div><b style="color:var(--lime)">${fmt(nut.prot)} g</b><span>protéines</span></div>
        <div><b style="color:var(--cyan)">${fmt(nut.gluc)} g</b><span>glucides</span></div>
        <div><b style="color:var(--orange)">${fmt(nut.lip)} g</b><span>lipides</span></div>
      </div>
      <p class="small muted" style="margin:10px 0 0">Dont sucres ${fmt(nut.suc, 1)} g · fibres ${fmt(nut.fib, 1)} g · sel ${fmt(nut.sel, 2)} g${mine ? ` · ${Math.round((nut.kcal / plan.kcal) * 100)} % de ta journée` : ''}</p>
    </section>
    <section class="card">
      <h2>Ingrédients</h2>
      <table class="t"><tbody>${m.ing.map(([iid, g]) => {
        const x = DATA.byId[iid]; const pr = ingredientPrice(x, shop);
        return `<tr><td>${esc(x.nom)}</td><td class="num">${displayQty(x, g * factor)}</td><td class="num muted">${pr ? `${euro((pr.kg * g * factor) / 1000)}${pr.reel ? '' : '*'}` : '–'}</td></tr>`;
      }).join('')}</tbody></table>
    </section>
    <section class="card">
      <h2>Prix dans chaque magasin</h2>
      <table class="t"><tbody>${prices.map((s, i) => `
        <tr class="${i === 0 ? 'best' : ''}"><td>${i === 0 ? '🏆 ' : ''}${esc(s.nom)}${s.id === shop ? ' <span class="pill ok">ton magasin</span>' : ''}</td>
          <td class="small muted">${s.reels}/${s.nb} prix réels</td><td class="num">${euro(s.total)}</td></tr>`).join('')}</tbody></table>
      <p class="small muted">* prix moyen en France quand il manque des relevés dans le magasin. Source : Open Prices.</p>
    </section>
    <section class="card"><h2>Préparation</h2><ol class="steps">${m.etapes.map((e) => `<li>${esc(e)}</li>`).join('')}</ol></section>
    <p class="footer-note">Valeurs nutritionnelles : table Ciqual 2025 de l'ANSES.</p>`;
  document.getElementById('p-mine').onclick = () => { store.set('portionPerso', true); viewRepasDetail(id); };
  document.getElementById('p-std').onclick = () => { store.set('portionPerso', false); viewRepasDetail(id); };
}

// ---------- Aliments ----------
let foodTab = 'anses';
let foodQuery = '';
let foodFilter = 'tous';

async function viewAliments() {
  $app.innerHTML = `
    <h1 class="title">Tous les <span class="grad-text">aliments</span></h1>
    <p class="lead">La table officielle de l'ANSES (plus de 3 300 aliments) et des millions de produits de marque.</p>
    <div class="chips" id="ftabs"><button class="chip" data-tab="anses" aria-pressed="${foodTab === 'anses'}">Aliments (ANSES)</button>
      <button class="chip" data-tab="marques" aria-pressed="${foodTab === 'marques'}">Produits de marque</button></div>
    <form id="fs" class="search" style="margin:12px 0" role="search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input class="input" id="fq" type="search" placeholder="${foodTab === 'anses' ? 'Ex. poulet, riz, banane…' : 'Ex. skyr, Danone, thon Petit Navire…'}" value="${esc(foodQuery)}" autocomplete="off" aria-label="Rechercher un aliment">
    </form>
    ${foodTab === 'anses' ? `<div class="chips" id="ff" style="margin-bottom:12px">${[['tous', 'Tous'], ['prot', '💪 Riches en protéines'], ['leger', '🪶 Très légers'], ['prix', '💶 Avec prix']].map(([id, l]) => `<button class="chip" data-f="${id}" aria-pressed="${foodFilter === id}">${l}</button>`).join('')}</div>` : ''}
    <section class="card" id="fres"><div class="spinner"></div></section>`;

  document.getElementById('ftabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { foodTab = b.dataset.tab; viewAliments(); } });
  document.getElementById('ff')?.addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) { foodFilter = b.dataset.f; viewAliments(); } });
  const input = document.getElementById('fq');
  const res = document.getElementById('fres');

  if (foodTab === 'anses') {
    const foods = await loadFoods();
    const byCiqual = Object.fromEntries(DATA.ingredients.map((x) => [x.ciqual, x]));
    const render = () => {
      const q = norm(input.value.trim()); foodQuery = input.value;
      const words = q.split(/\s+/).filter(Boolean);
      let list = foods.filter((f) => { const n = norm(f.n); return words.every((w) => n.includes(w)); });
      if (foodFilter === 'prot') list = list.filter((f) => f.prot >= 15).sort((a, b) => b.prot / Math.max(1, b.kcal) - a.prot / Math.max(1, a.kcal));
      else if (foodFilter === 'leger') list = list.filter((f) => f.kcal <= 50).sort((a, b) => a.kcal - b.kcal);
      else if (foodFilter === 'prix') list = list.filter((f) => byCiqual[f.c]);
      else if (words.length) list.sort((a, b) => (norm(a.n).startsWith(words[0]) ? 0 : 1) - (norm(b.n).startsWith(words[0]) ? 0 : 1) || a.n.length - b.n.length);
      const total = list.length;
      list = list.slice(0, 60);
      res.innerHTML = list.length ? `<p class="small muted" style="margin-top:0">${total} aliment${total > 1 ? 's' : ''}${total > 60 ? ' (60 premiers affichés)' : ''} · valeurs pour 100 g</p>${list.map((f) => foodRow(f, byCiqual[f.c])).join('')}` : '<p class="muted">Aucun aliment trouvé. Essaie un autre mot (ex. « poulet »).</p>';
    };
    render();
    input.addEventListener('input', render);
    document.getElementById('fs').addEventListener('submit', (e) => { e.preventDefault(); input.blur(); });
  } else {
    const search = async () => {
      const q = input.value.trim(); foodQuery = q;
      if (q.length < 2) { res.innerHTML = '<p class="muted" style="margin:0">Tape le nom d\'un produit ou d\'une marque, puis valide.</p>'; return; }
      res.innerHTML = '<div class="spinner"></div>';
      try {
        const products = await searchBrands(q);
        res.innerHTML = products.length ? `<p class="small muted" style="margin-top:0">Source : Open Food Facts · valeurs pour 100 g</p>${products.map(brandRow).join('')}` : '<p class="muted">Aucun produit trouvé.</p>';
      } catch (e) {
        res.innerHTML = '<p class="muted">La base Open Food Facts ne répond pas pour l\'instant. Réessaie dans une minute.</p>';
      }
    };
    document.getElementById('fs').addEventListener('submit', (e) => { e.preventDefault(); input.blur(); search(); });
    search();
  }
}

function nutriGrid(n) {
  const v = (x, d = 1) => (x == null ? '–' : fmt(x, d));
  return `<div class="nutri">
    <div><b style="color:var(--lime)">${v(n.prot)}</b><span>protéines g</span></div>
    <div><b style="color:var(--cyan)">${v(n.gluc)}</b><span>glucides g</span></div>
    <div><b>${v(n.suc)}</b><span>dont sucres g</span></div>
    <div><b style="color:var(--orange)">${v(n.lip)}</b><span>lipides g</span></div>
    <div><b>${v(n.ags)}</b><span>dont saturés g</span></div>
    <div><b>${v(n.fib)}</b><span>fibres g</span></div>
    <div><b>${v(n.sel, 2)}</b><span>sel g</span></div>
    <div><b>${n.prot != null && n.kcal ? fmt((n.prot * 4 / n.kcal) * 100) : '–'} %</b><span>kcal en prot.</span></div>
  </div>`;
}

function foodRow(f, ing) {
  const prices = ing ? DATA.magasins.map((m) => ({ m, p: ing.prix.magasins[m.id] })).filter((x) => x.p && x.p.n >= 2).sort((a, b) => a.p.kg - b.p.kg) : [];
  return `<details class="food"><summary><div><div class="fname">${esc(f.n)}</div><div class="fgrp">${esc(f.g)}${ing ? ' · <span style="color:var(--lime)">prix dispo</span>' : ''}</div></div>
    <div class="kcal">${f.kcal != null ? fmt(f.kcal) : '–'} kcal</div></summary>
    ${nutriGrid(f)}
    ${ing ? `<table class="t" style="margin-top:10px"><tbody>${prices.map(({ m, p }, i) => `<tr class="${i === 0 ? 'best' : ''}"><td>${esc(m.nom)}</td><td class="small muted">${p.n} relevés</td><td class="num">${euro(p.kg)}/kg</td></tr>`).join('')}
      <tr><td>Moyenne France</td><td class="small muted">${ing.prix.n} relevés</td><td class="num">${euro(ing.prix.kg)}/kg</td></tr></tbody></table>` : ''}
  </details>`;
}

const brandCache = new Map();
async function searchBrands(q) {
  if (brandCache.has(q)) return brandCache.get(q);
  const params = new URLSearchParams({
    search_terms: q, search_simple: '1', action: 'process', json: '1', page_size: '30', sort_by: 'unique_scans_n',
    fields: 'code,product_name,product_name_fr,brands,quantity,nutriments,nutriscore_grade,image_front_small_url',
    tagtype_0: 'countries', tag_contains_0: 'contains', tag_0: 'france', lc: 'fr',
  });
  const url = `https://world.openfoodfacts.org/cgi/search.pl?${params}`;
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      const out = (d.products || []).filter((p) => p.nutriments && p.nutriments['energy-kcal_100g'] != null);
      brandCache.set(q, out);
      return out;
    } catch (e) { lastErr = e; await new Promise((res) => setTimeout(res, 1500 * (i + 1))); }
  }
  throw lastErr;
}

function brandRow(p) {
  const n = p.nutriments;
  const f = { kcal: n['energy-kcal_100g'], prot: n.proteins_100g, gluc: n.carbohydrates_100g, suc: n.sugars_100g, lip: n.fat_100g, ags: n['saturated-fat_100g'], fib: n.fiber_100g, sel: n.salt_100g };
  const img = typeof p.image_front_small_url === 'string' && p.image_front_small_url.startsWith('https://') ? p.image_front_small_url : '';
  const ns = (p.nutriscore_grade || '').toUpperCase();
  return `<details class="food"><summary><div class="row" style="gap:10px">${img ? `<img src="${esc(img)}" alt="" loading="lazy" style="width:42px;height:42px;object-fit:contain;border-radius:10px;background:#fff">` : ''}
      <div><div class="fname">${esc(p.product_name_fr || p.product_name || 'Produit')}</div><div class="fgrp">${esc(p.brands || '')} ${esc(p.quantity || '')}${/^[A-E]$/.test(ns) ? ` · Nutri-Score ${ns}` : ''}</div></div></div>
    <div class="kcal">${fmt(f.kcal)} kcal</div></summary>${nutriGrid(f)}</details>`;
}

// ---------- Corps : suivi du poids et photos ----------
async function viewCorps() {
  const plan = computePlan(profile);
  const log = store.get('poids', []).sort((a, b) => a.d - b.d);
  const start = profile.depart?.date || log[0]?.d || Date.now();
  const last = log.at(-1);
  const lost = last ? (profile.depart?.poids || log[0].kg) - last.kg : 0;
  const realPts = log.map((e) => [(e.d - start) / (7 * 864e5), e.kg]).filter(([x]) => x >= 0);
  const planPts = plan.weeks.map((w, i) => [i, w]);

  $app.innerHTML = `
    <h1 class="title">Mon <span class="grad-text">corps</span></h1>
    <p class="lead">Ton poids, tes photos et un aperçu de ton objectif.</p>
    <section class="card">
      <h2>⚖️ Mon poids</h2>
      <form id="wf" class="row">
        <div class="unit-input" style="flex:1"><input class="input" id="wkg" type="number" inputmode="decimal" step="0.1" min="30" max="300" placeholder="Poids de ce matin" aria-label="Poids de ce matin en kg"><em>kg</em></div>
        <button class="btn" type="submit">OK</button>
      </form>
      <div class="grid2" style="margin-top:12px">
        <div class="stat"><b>${lost > 0 ? '−' : ''}${fmt(Math.abs(lost), 1)} kg</b><span>depuis le début</span></div>
        <div class="stat"><b>${last ? fmt(Math.max(0, last.kg - plan.target), 1) : '–'} kg</b><span>restants jusqu'à ${fmt(plan.target, 1)} kg</span></div>
      </div>
      <div style="margin-top:12px">${chartSVG([
        { points: planPts, color: 'rgba(12,159,112,.6)', dash: true, width: 2 },
        ...(realPts.length ? [{ points: realPts, color: '#4a9a00', dots: true }] : []),
      ], { target: plan.target, labels: [[0, 'Début'], [plan.nbWeeks || 1, `S${plan.nbWeeks}`]] })}</div>
      <p class="small muted" style="margin:4px 0 0"><span style="color:var(--lime)">●</span> ton poids réel · <span style="color:var(--mint)">- -</span> la courbe prévue</p>
      ${log.length > 1 ? `<details style="margin-top:8px"><summary class="small" style="cursor:pointer;color:var(--mint)">Historique</summary>
        <table class="t">${log.slice().reverse().map((e) => `<tr><td>${dateFr(e.d, { weekday: 'short', day: 'numeric', month: 'short' })}</td><td class="num">${fmt(e.kg, 1)} kg</td>
          <td class="num"><button class="chip" data-del="${e.d}" aria-label="Supprimer">✕</button></td></tr>`).join('')}</table></details>` : ''}
    </section>

    <section class="card">
      <div class="row between"><h2 style="margin:0">📸 Mes photos</h2>
        <label class="btn small" style="cursor:pointer">+ Photo<input id="pin" type="file" accept="image/*" hidden></label></div>
      <p class="small muted">Prends-toi de face, même endroit, même lumière, chaque semaine. Les photos restent uniquement sur ton téléphone.</p>
      <div class="gallery" id="gal"><div class="spinner"></div></div>
    </section>
    <section id="sim"></section>`;

  document.getElementById('wf').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = parseFloat(String(document.getElementById('wkg').value).replace(',', '.'));
    if (!(v >= 30 && v <= 300)) return;
    const l = store.get('poids', []);
    const today = new Date().toDateString();
    const i = l.findIndex((x) => new Date(x.d).toDateString() === today);
    if (i >= 0) l[i] = { d: Date.now(), kg: v }; else l.push({ d: Date.now(), kg: v });
    store.set('poids', l);
    viewCorps();
  });
  $app.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    store.set('poids', store.get('poids', []).filter((x) => String(x.d) !== b.dataset.del)); viewCorps();
  }));

  document.getElementById('pin').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const blob = await loadImage(file);
      const kg = store.get('poids', []).at(-1)?.kg || profile.poids;
      const id = Date.now();
      await savePhoto({ id, date: id, kg, blob });
      await renderGallery();
      openSim(id);
    } catch (err) { alert('Impossible d\'enregistrer la photo sur ce téléphone.'); }
  });
  await renderGallery();
}

async function renderGallery() {
  const gal = document.getElementById('gal');
  if (!gal) return;
  let photos = [];
  try { photos = await listPhotos(); } catch (e) { gal.innerHTML = '<p class="small muted">Les photos ne peuvent pas être gardées dans ce navigateur (mode privé ?).</p>'; return; }
  gal.innerHTML = photos.length ? photos.map((p) => `<button data-photo="${p.id}" aria-label="Photo du ${dateFr(p.date)}"><img src="${URL.createObjectURL(p.blob)}" alt=""><span>${dateFr(p.date, { day: 'numeric', month: 'short' })} · ${fmt(p.kg, 1)} kg</span></button>`).join('')
    : '<p class="small muted" style="grid-column:1/-1">Aucune photo pour l\'instant. Ajoute ta première photo pour voir la simulation de ton objectif ✨</p>';
  gal.querySelectorAll('[data-photo]').forEach((b) => b.addEventListener('click', () => openSim(Number(b.dataset.photo))));
}

async function openSim(id) {
  const photos = await listPhotos();
  const ph = photos.find((p) => p.id === id); if (!ph) return;
  const plan = computePlan(profile);
  const sim = document.getElementById('sim');
  const img = await blobToImage(ph.blob);
  const center = { cx: 0.5, cy: 0.55 };
  const older = photos.filter((p) => p.id !== id).at(-1);

  sim.innerHTML = `
    <section class="card">
      <h2>✨ Simulation de ton objectif</h2>
      <p class="small muted" style="margin-top:-6px">1. Touche ton nombril sur la photo. 2. Fais glisser pour choisir la semaine.</p>
      <div class="target-pick" id="pick"><img src="${img.src}" alt="Ta photo"><div class="dot" id="dot" style="left:50%;top:55%"></div></div>
      <label class="field" style="margin-top:12px"><span id="sim-label"></span>
        <input type="range" id="sim-wk" min="1" max="${Math.max(1, plan.nbWeeks)}" value="${Math.max(1, plan.nbWeeks)}"></label>
      <div class="compare" id="cmp" style="margin-top:10px"></div>
      <div class="notice warn" style="margin:12px 0 0">Simulation approximative : Affûté affine la silhouette sur ta photo selon le poids prévu. Ce n'est pas une prédiction exacte. La vraie transformation dépend de ton entraînement, de ton sommeil et de ta génétique.</div>
      <div class="row" style="margin-top:12px">
        ${older ? `<button class="btn ghost small" id="vs">Comparer avec ma 1<sup>re</sup> photo</button>` : ''}
        <button class="btn ghost small" id="del">Supprimer la photo</button>
      </div>
    </section>`;

  const pick = document.getElementById('pick');
  const dot = document.getElementById('dot');
  const slider = document.getElementById('sim-wk');
  const cmp = document.getElementById('cmp');

  const renderCompare = (beforeEl, afterCanvas, leftLabel, rightLabel) => {
    cmp.innerHTML = `<div class="b"></div><div class="after"></div><div class="handle"></div><span class="tag l">${leftLabel}</span><span class="tag r">${rightLabel}</span>`;
    cmp.querySelector('.b').appendChild(beforeEl);
    cmp.querySelector('.after').appendChild(afterCanvas);
    const setPos = (clientX) => {
      const r = cmp.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
      cmp.querySelector('.after').style.clipPath = `inset(0 0 0 ${pct}%)`;
      cmp.querySelector('.handle').style.left = `${pct}%`;
    };
    cmp.onpointerdown = (e) => { cmp.setPointerCapture(e.pointerId); setPos(e.clientX); };
    cmp.onpointermove = (e) => { if (e.buttons || e.pointerType === 'touch') setPos(e.clientX); };
  };

  const update = () => {
    const w = Number(slider.value);
    const kg = plan.weeks[Math.min(w, plan.weeks.length - 1)] ?? ph.kg;
    const lostFrac = Math.max(0, (ph.kg - kg) / ph.kg);
    const squeeze = Math.max(0.78, 1 - lostFrac * 1.15);
    document.getElementById('sim-label').textContent = plan.nbWeeks
      ? `Dans ${w} semaine${w > 1 ? 's' : ''} : environ ${fmt(kg, 1)} kg (−${fmt(Math.max(0, ph.kg - kg), 1)} kg)`
      : 'Tu es déjà à ton objectif : la simulation montre peu de changement.';
    const before = new Image(); before.src = img.src; before.alt = 'Avant';
    const after = simulate(img, { ...center, squeeze, definition: Math.min(1, lostFrac * 8) });
    renderCompare(before, after, 'Maintenant', `Semaine ${w}`);
  };

  pick.addEventListener('click', (e) => {
    const r = pick.getBoundingClientRect();
    center.cx = (e.clientX - r.left) / r.width; center.cy = (e.clientY - r.top) / r.height;
    dot.style.left = `${center.cx * 100}%`; dot.style.top = `${center.cy * 100}%`;
    update();
  });
  let t; slider.addEventListener('input', () => { clearTimeout(t); t = setTimeout(update, 60); });
  document.getElementById('del').onclick = async () => {
    if (!confirm('Supprimer cette photo ?')) return;
    await deletePhoto(id); sim.innerHTML = ''; renderGallery();
  };
  document.getElementById('vs')?.addEventListener('click', async () => {
    const first = await blobToImage(older.blob);
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(first, 0, 0, c.width, c.height);
    const now = new Image(); now.src = img.src;
    renderCompare(now, c, `Photo du ${dateFr(ph.date, { day: 'numeric', month: 'short' })}`, `Photo du ${dateFr(older.date, { day: 'numeric', month: 'short' })}`);
  });
  update();
  sim.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- Démarrage ----------
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
route();

// Pour les tests
window.__affute = { computePlan, bmi };
