// Scanner de Clair intégré dans Affûté : on réutilise les modules de Clair (dossier ../js)
// pour la note sur 100, les allergènes, les régimes, les prix et les alternatives,
// et on ajoute une analyse « spéciale sèche ».
import { fetchProduct, productName, searchAlternatives, fetchLatestPrice } from '../../js/api.js';
import { analyze } from '../../js/score.js';
import { ALLERGENS } from '../../js/data.js';
import { addEntry } from './journal.js';

export { ALLERGENS };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (v, d = 0) => Number(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const euro = (v) => Number(v).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const safeUrl = (u) => (typeof u === 'string' && /^https:\/\//.test(u) ? esc(u) : '');

// Enseignes : identifiants d'Affûté → identifiants utilisés par Clair / Open Food Facts.
const STORE_SLUG = { leclerc: 'e-leclerc', superu: 'super-u', lidl: 'lidl', carrefour: 'carrefour', intermarche: 'intermarche', auchan: 'auchan', aldi: 'aldi' };

function readJSON(key, d) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function writeJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* stockage plein */ } }

// Profil au format de Clair. Si la personne utilise aussi Clair (même site), on reprend
// ses allergies, problèmes de santé et médicaments.
export function clairProfile(p) {
  const clair = readJSON('clair.profile', {}) || {};
  const diets = new Set(clair.diets || []);
  (p.regimes || []).forEach((r) => diets.add({ halal: 'halal', vegetarien: 'vegetarian', sanslactose: 'nolactose' }[r]));
  diets.delete(undefined);
  const conditions = new Set(clair.conditions || []);
  if (p.enceinte) conditions.add('pregnant');
  return {
    allergens: [...new Set([...(clair.allergens || []), ...(p.allergies || [])])],
    diets: [...diets],
    conditions: [...conditions],
    goal: p.objectif === 'masse' ? 'sport' : 'weight',
    children: Boolean(clair.children),
    meds: clair.meds || [],
    store: STORE_SLUG[p.magasin] || '',
  };
}

// ---------- Caméra ----------
let scanner = null;

export async function stopScan() {
  if (!scanner) return;
  try { await scanner.stop(); } catch (e) { /* déjà arrêté */ }
  try { scanner.clear(); } catch (e) { /* rien */ }
  scanner = null;
}

function loadLib() {
  if (window.Html5Qrcode) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = '../vendor/html5-qrcode.min.js';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function startCamera() {
  const msg = document.getElementById('cam-msg');
  try { await loadLib(); } catch (e) { msg.textContent = 'Le scanner n\'a pas pu se charger. Tape le code-barres.'; return; }
  const F = window.Html5QrcodeSupportedFormats;
  try {
    scanner = new window.Html5Qrcode('reader', { formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E], experimentalFeatures: { useBarCodeDetectorIfSupported: true }, verbose: false });
    document.getElementById('cam-ph').hidden = true;
    msg.textContent = 'Vise le code-barres…';
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: (w, h) => ({ width: Math.floor(w * 0.8), height: Math.floor(h * 0.42) }) },
      (text) => {
        const code = text.replace(/\D/g, '');
        if (code.length < 6) return;
        if (navigator.vibrate) navigator.vibrate(60);
        location.hash = `#/scan/${code}`;
      },
      () => {},
    );
    writeJSON('affute.camOk', true);
  } catch (err) {
    writeJSON('affute.camOk', false);
    scanner = null;
    const ph = document.getElementById('cam-ph');
    if (ph) ph.hidden = false;
    if (msg) msg.textContent = 'Impossible d\'ouvrir la caméra. Autorise-la dans Réglages › Safari › Appareil photo, ou tape le code-barres.';
  }
}

// ---------- Écran Scan ----------
export function viewScan(app) {
  const hist = readJSON('affute.scans', []);
  app.innerHTML = `
    <h1 class="title">Scanne, <span class="grad-text">mange malin</span>.</h1>
    <p class="lead">Vise le code-barres : note sur 100 pour ton profil, protéines, calories et alternatives moins chères. Propulsé par Clair.</p>
    <div class="scan-box">
      <div id="reader"></div>
      <div class="scan-ph" id="cam-ph">
        <div class="emoji3d big">📷</div>
        <p class="small muted">La caméra sert uniquement à lire le code-barres.</p>
        <button class="btn" id="cam-btn" type="button">Activer la caméra</button>
      </div>
      <div class="scan-frame" aria-hidden="true"></div>
    </div>
    <p class="small muted center" id="cam-msg" role="status"></p>
    <form id="code-f" class="row" style="margin:14px 0">
      <input class="input" id="code" inputmode="numeric" autocomplete="off" placeholder="Ou tape le code-barres" aria-label="Code-barres">
      <button class="btn" type="submit">OK</button>
    </form>
    <p class="small center"><a href="#/scan/3033490506629">Essayer avec un exemple (fromage blanc)</a></p>
    ${hist.length ? `<section class="card"><h2>Derniers scans</h2><div class="meal-list">${hist.slice(0, 12).map((h) => `
      <a class="meal" href="#/scan/${esc(h.code)}">
        ${safeUrl(h.img) ? `<img class="thumb" src="${safeUrl(h.img)}" alt="" loading="lazy">` : '<div class="emoji3d">🛒</div>'}
        <div><div class="name">${esc(h.name)}</div><div class="meta"><span class="pill k">${fmt(h.kcal ?? 0)} kcal</span><span class="pill p">${fmt(h.prot ?? 0, 1)} g prot.</span></div></div>
        <span class="score-pill ${scoreClass(h)}">${h.blocked ? '✕' : h.score ?? '?'}</span>
      </a>`).join('')}</div></section>` : ''}`;
  document.getElementById('code-f').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('code').value.replace(/\D/g, '');
    if (code.length >= 6) location.hash = `#/scan/${code}`;
  });
  document.getElementById('cam-btn').addEventListener('click', startCamera);
  if (readJSON('affute.camOk', false)) startCamera();
}

function scoreClass(a) {
  if (a.blocked) return 's-bad';
  if (a.score == null) return 's-unk';
  return a.score >= 75 ? 's-top' : a.score >= 50 ? 's-good' : a.score >= 25 ? 's-mid' : 's-bad';
}

// Analyse « sèche » : densité en protéines et part de la journée.
function secheInfo(p, plan) {
  const n = p.nutriments || {};
  const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
  const kcal = num(n['energy-kcal_100g']);
  const prot = num(n.proteins_100g);
  const serving = num(p.serving_quantity);
  const ratio = kcal && prot != null ? (prot * 4 / kcal) * 100 : null; // % des calories venant des protéines
  let verdict;
  const masse = plan?.mode === 'masse';
  const suc = num(n.sugars_100g);
  if (masse && ratio != null) {
    if (ratio >= 35) verdict = { key: 's-top', label: 'Top pour le muscle', text: 'Très riche en protéines : parfait pour construire du muscle.' };
    else if (ratio >= 20) verdict = { key: 's-good', label: 'Bon pour le muscle', text: 'Bonne source de protéines.' };
    else if (kcal != null && kcal >= 350 && (suc == null || suc < 25)) verdict = { key: 's-good', label: 'Pratique pour la masse', text: 'Riche en calories : aide à atteindre tes calories du jour sans manger des quantités énormes.' };
    else if (kcal != null && kcal >= 350) verdict = { key: 's-mid', label: 'Calories vides', text: 'Beaucoup de sucre et peu de protéines : ça fait grossir, mais pas en muscle. Avec modération.' };
    else if (kcal != null && kcal <= 60) verdict = { key: 's-mid', label: 'Léger', text: 'Bon pour la santé, mais apporte peu de calories pour ta prise de masse.' };
    else verdict = { key: 's-mid', label: 'Correct', text: 'Ça passe dans ta journée, sans être un atout particulier pour le muscle.' };
  } else if (ratio == null) verdict = { key: 's-unk', label: 'Données insuffisantes', text: 'Calories ou protéines inconnues pour ce produit.' };
  else if (ratio >= 35) verdict = { key: 's-top', label: 'Top pour la sèche', text: 'Très riche en protéines pour peu de calories : idéal pour garder ton muscle.' };
  else if (ratio >= 20) verdict = { key: 's-good', label: 'Bon pour la sèche', text: 'Bonne source de protéines.' };
  else if (kcal != null && kcal <= 60) verdict = { key: 's-good', label: 'Léger', text: 'Peu calorique : bon pour remplir l\'assiette sans exploser tes calories.' };
  else if (kcal != null && kcal >= 400) verdict = { key: 's-bad', label: 'À limiter pendant la sèche', text: 'Très calorique et peu de protéines : une petite portion pèse lourd dans ta journée.' };
  else verdict = { key: 's-mid', label: 'Avec modération', text: 'Pas idéal, mais ça passe en petite quantité dans tes calories du jour.' };
  const portion = serving || 100;
  const portionKcal = kcal != null ? (kcal * portion) / 100 : null;
  return { kcal, prot, gluc: num(n.carbohydrates_100g), lip: num(n.fat_100g), suc: num(n.sugars_100g), ratio, verdict, portion, serving, portionKcal, pctDay: portionKcal != null && plan ? Math.round((portionKcal / plan.kcal) * 100) : null, portionProt: prot != null ? (prot * portion) / 100 : null };
}

function remember(p, a, s) {
  const hist = readJSON('affute.scans', []).filter((h) => h.code !== p.code);
  hist.unshift({ code: p.code, name: productName(p), img: p.image_front_small_url || '', score: a.score, blocked: a.blockers.length > 0, kcal: s.kcal, prot: s.prot, t: Date.now() });
  writeJSON('affute.scans', hist.slice(0, 40));
}

export async function viewScanProduct(app, code, profile, plan) {
  app.innerHTML = '<div class="spinner" aria-label="Chargement"></div>';
  let p;
  try { p = await fetchProduct(code); } catch (e) {
    app.innerHTML = `<div class="notice stop">Pas de connexion à la base Open Food Facts. Réessaie dans un instant.</div><a class="btn ghost block" href="#/scan">← Retour au scanner</a>`;
    return;
  }
  if (!p) {
    app.innerHTML = `<div class="notice warn">Produit ${esc(code)} introuvable dans Open Food Facts. Tu peux l'ajouter gratuitement avec l'appli Open Food Facts.</div><a class="btn ghost block" href="#/scan">← Scanner un autre produit</a>`;
    return;
  }
  const cp = clairProfile(profile);
  const a = analyze(p, cp);
  const s = secheInfo(p, plan);
  remember(p, a, s);
  const v = (x, d = 1) => (x == null ? '–' : fmt(x, d));

  app.innerHTML = `
    <a href="#/scan" class="small" style="text-decoration:none">← Scanner</a>
    <div class="row" style="margin:12px 0 14px;gap:14px">
      ${safeUrl(p.image_front_small_url) ? `<img class="thumb big" src="${safeUrl(p.image_front_small_url)}" alt="">` : '<div class="emoji3d big">🛒</div>'}
      <div><h1 class="title" style="font-size:1.45rem;margin:0">${esc(productName(p))}</h1><span class="muted small">${esc(p.brands || '')} ${esc(p.quantity || '')}</span></div>
    </div>

    <div class="grid2">
      <section class="card tilt score-card ${a.blockers.length ? 's-bad' : scoreClass({ score: a.score })}">
        <span class="small muted">Note Clair pour toi</span>
        <b class="big-score">${a.blockers.length ? '✕' : a.score ?? '?'}<small>${a.blockers.length || a.score == null ? '' : '/100'}</small></b>
        <span class="small">${esc(a.verdict.label)}</span>
      </section>
      <section class="card tilt score-card ${s.verdict.key}">
        <span class="small muted">${plan.mode === 'masse' ? 'Indice muscle' : 'Indice sèche'}</span>
        <b class="big-score">${s.ratio == null ? '?' : fmt(s.ratio)}<small>${s.ratio == null ? '' : ' %'}</small></b>
        <span class="small">${esc(s.verdict.label)}</span>
      </section>
    </div>
    ${a.blockers.map((b) => `<div class="notice stop">⛔ ${esc(b)}</div>`).join('')}
    ${a.warnings.map((w) => `<div class="notice warn">${esc(w)}</div>`).join('')}

    <section class="card">
      <h2>💪 Pour ta ${plan.mode === 'masse' ? 'prise de masse' : 'sèche'}</h2>
      <p class="small" style="margin-top:-4px">${esc(s.verdict.text)} <span class="muted">(${plan.mode === 'masse' ? 'Indice muscle' : 'Indice sèche'} = part des calories qui vient des protéines.)</span></p>
      <div class="nutri">
        <div><b>${v(s.kcal, 0)}</b><span>kcal</span></div>
        <div><b style="color:var(--lime)">${v(s.prot)}</b><span>protéines g</span></div>
        <div><b style="color:var(--cyan)">${v(s.gluc)}</b><span>glucides g</span></div>
        <div><b style="color:var(--orange)">${v(s.lip)}</b><span>lipides g</span></div>
      </div>
      <p class="small muted" style="margin:10px 0 0">Pour 100 ${a.drink ? 'ml' : 'g'}.${s.portionKcal != null ? ` ${s.serving ? `Une portion (${fmt(s.portion)} ${a.drink ? 'ml' : 'g'})` : '100 g'} = <b style="color:var(--text)">${fmt(s.portionKcal)} kcal</b>${s.portionProt != null ? ` et ${fmt(s.portionProt, 1)} g de protéines` : ''}${s.pctDay != null ? `, soit <b style="color:var(--text)">${s.pctDay} %</b> de tes ${fmt(plan.kcal)} kcal du jour` : ''}.` : ''}</p>
    </section>

    ${s.kcal != null ? `<section class="card add-day">
      <h2>🍽️ Je l'ai mangé</h2>
      <form id="add-f" class="row">
        <div class="unit-input" style="flex:1"><input class="input" id="add-g" inputmode="decimal" value="${fmt(s.portion)}" aria-label="Quantité mangée"><em>${a.drink ? 'ml' : 'g'}</em></div>
        <button class="btn" type="submit">Ajouter</button>
      </form>
      <p class="small muted" id="add-prev" style="margin:8px 0 0"></p>
    </section>` : ''}
    ${a.negatives.length || a.positives.length ? `<section class="card"><h2>Pourquoi cette note</h2><ul class="reasons">
      ${a.negatives.map((x) => `<li class="neg">${esc(x.text)}</li>`).join('')}
      ${a.positives.map((x) => `<li class="pos">${esc(x.text)}</li>`).join('')}</ul></section>` : ''}

    <section class="card"><h2>Régimes</h2><div class="chips" style="flex-wrap:wrap">${[['halal', 'Halal'], ['vegetarian', 'Végétarien'], ['vegan', 'Végan'], ['nolactose', 'Sans lactose']].map(([k, l]) => {
      const st = a.diets[k]?.status || 'unknown';
      const lab = { ok: 'Oui', no: 'Non', warn: 'À vérifier', unknown: '?' }[st];
      return `<span class="pill ${st === 'ok' ? 'ok' : st === 'no' ? 'bad' : 'warn'}" title="${esc(a.diets[k]?.reasons?.[0] || '')}">${l} : ${lab}</span>`;
    }).join('')}</div></section>

    <section class="card" id="price"><h2>Prix</h2><div class="spinner"></div></section>
    <section class="card" id="alts"><h2>Mieux pour ta ${plan.mode === 'masse' ? 'prise de masse' : 'sèche'}</h2>
      <p class="small muted" style="margin-top:-6px">Produits de la même catégorie, mieux notés pour toi.</p>
      <button class="btn ghost block" id="alt-btn">Chercher des alternatives</button><div id="alt-list"></div></section>
    <p class="footer-note">Analyse : Clair · Données : Open Food Facts et Open Prices. <a href="../#/product/${esc(code)}">Ouvrir dans Clair</a></p>`;

  // Ajout au journal du jour
  const addF = document.getElementById('add-f');
  if (addF) {
    const inp = document.getElementById('add-g');
    const prev = document.getElementById('add-prev');
    const calc = () => {
      const g = parseFloat(String(inp.value).replace(',', '.')) || 0;
      const k = g / 100;
      return { g, kcal: s.kcal * k, prot: (s.prot || 0) * k, gluc: (s.gluc || 0) * k, lip: (s.lip || 0) * k };
    };
    const show = () => { const c = calc(); prev.textContent = `= ${fmt(c.kcal)} kcal · ${fmt(c.prot, 1)} g de protéines`; };
    show(); inp.addEventListener('input', show);
    addF.addEventListener('submit', (e) => {
      e.preventDefault();
      const c = calc(); if (!c.g) return;
      addEntry({ nom: `${productName(p)} (${fmt(c.g)} ${a.drink ? 'ml' : 'g'})`, emoji: '📷', ref: `scan:${p.code}`, src: 'scan', ...c });
      prev.innerHTML = `✓ Ajouté à ta journée. <a href="#/plan">Voir ma jauge</a>`;
    });
  }

  // Prix
  fetchLatestPrice(p.code, cp.store).then((pr) => {
    const box = document.getElementById('price'); if (!box) return;
    box.innerHTML = pr ? `<h2>Prix</h2><p style="margin:0"><b style="font-size:1.4rem">${euro(pr.price)}</b></p><p class="small muted" style="margin:4px 0 0">Relevé le ${new Date(pr.date).toLocaleDateString('fr-FR')}${pr.store ? ` chez ${esc(pr.store)}` : ''}${pr.city ? ` (${esc(pr.city)})` : ''}. Source : Open Prices.</p>`
      : '<h2>Prix</h2><p class="small muted" style="margin:0">Aucun prix relevé pour ce produit pour l\'instant.</p>';
  });

  // Alternatives (bouton : la recherche d'Open Food Facts est limitée en nombre de requêtes)
  document.getElementById('alt-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget; const list = document.getElementById('alt-list');
    btn.disabled = true; btn.textContent = 'Recherche…'; list.innerHTML = '<div class="spinner"></div>';
    const cands = await searchAlternatives(p, cp.store);
    const base = a.score ?? 0;
    const better = cands.map((x) => ({ x, a: analyze(x, cp), s: secheInfo(x, plan) }))
      .filter((r) => !r.a.blockers.length && r.a.score != null && r.a.score > base + 5)
      .sort((r1, r2) => (r2.x._inStore - r1.x._inStore) || ((r2.s.ratio || 0) - (r1.s.ratio || 0)) || (r2.a.score - r1.a.score))
      .slice(0, 6);
    btn.hidden = true;
    list.innerHTML = better.length ? `<div class="meal-list">${better.map((r) => `
      <a class="meal" href="#/scan/${esc(r.x.code)}">
        ${safeUrl(r.x.image_front_small_url) ? `<img class="thumb" src="${safeUrl(r.x.image_front_small_url)}" alt="" loading="lazy">` : '<div class="emoji3d">🛒</div>'}
        <div><div class="name">${esc(productName(r.x))}</div><div class="meta"><span class="pill k">${fmt(r.s.kcal ?? 0)} kcal</span><span class="pill p">${fmt(r.s.prot ?? 0, 1)} g prot.</span>${r.x._inStore ? '<span class="pill ok">Ton magasin</span>' : ''}</div></div>
        <span class="score-pill ${scoreClass({ score: r.a.score })}">${r.a.score}</span>
      </a>`).join('')}</div>` : `<p class="small muted">${a.score >= 75 ? 'Ce produit est déjà parmi les meilleurs 👍' : 'Pas de meilleure alternative trouvée pour l\'instant.'}</p>`;
  });
}
