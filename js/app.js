import { ALLERGENS, DIETS, CONDITIONS, GOALS, MEDS, STORES, SUGAR_CUBE_G } from './data.js';
import { analyze } from './score.js';
import { fetchProduct, productName, searchAlternatives, fetchLatestPrice, pricePerKg, priceUnit } from './api.js';

// ---------- Stockage local (reste sur le téléphone) ----------
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(`clair.${key}`); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(`clair.${key}`, JSON.stringify(value)); } catch (e) { /* stockage indisponible */ }
  },
};

const DEFAULT_PROFILE = { allergens: [], diets: [], conditions: [], goal: 'none', children: false, meds: [], store: '' };
let profile = { ...DEFAULT_PROFILE, ...store.get('profile', {}) };
const hasProfile = () => store.get('profile', null) !== null;

const productCache = new Map();

// ---------- Utilitaires ----------
const $app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (typeof u === 'string' && /^https:\/\//.test(u) ? esc(u) : '');
const euro = (v) => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const fmt = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('fr-FR');
const dateFr = (d) => { try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return d; } };
const STATUS_LABEL = { ok: 'Oui', no: 'Non', warn: 'À vérifier', unknown: 'Inconnu' };

function render(html) {
  $app.innerHTML = html;
  window.scrollTo(0, 0);
}

function scoreClass(a) { return `v-${a.verdict.key}`; }
function scoreText(a) { return a.verdict.key === 'blocked' ? '✕' : a.score == null ? '?' : a.score; }

// ---------- Navigation ----------
let scanner = null;
async function stopScanner() {
  if (!scanner) return;
  try { if (scanner.isScanning) await scanner.stop(); scanner.clear(); } catch (e) { /* déjà arrêté */ }
  scanner = null;
}

async function route() {
  await stopScanner();
  const hash = location.hash || '';
  const [, page, arg] = hash.split('/');
  if (!hasProfile() && page !== 'profile') { location.replace('#/profile/welcome'); return; }
  document.querySelectorAll('.tabbar a').forEach((a) => {
    const current = a.dataset.tab === (page === 'product' ? 'scan' : page || 'scan');
    if (current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  document.getElementById('back-btn').hidden = page !== 'product';
  if (page === 'product' && arg) return showProduct(decodeURIComponent(arg));
  if (page === 'history') return showHistory();
  if (page === 'profile') return showProfile(arg === 'welcome');
  return showScan();
}

window.addEventListener('hashchange', route);
document.getElementById('back-btn').addEventListener('click', () => {
  if (history.length > 1) history.back(); else location.hash = '#/scan';
});

// ---------- Écran Scanner ----------
function showScan() {
  render(`
    <section class="hero">
      <h1>Scanne un produit</h1>
      <p class="muted">Vise le code-barres. Clair te dit si c'est bon <strong>pour toi</strong>.</p>
    </section>
    <div class="scanner">
      <div id="reader"></div>
      <div class="placeholder" id="cam-placeholder">
        <p>La caméra sert uniquement à lire le code-barres.</p>
        <button class="btn" id="start-cam" type="button">Activer la caméra</button>
      </div>
      <div class="frame" id="cam-frame" hidden></div>
    </div>
    <p class="small muted center" id="cam-msg" role="status"></p>
    <div class="divider">ou</div>
    <form class="field" id="code-form">
      <input id="code-input" inputmode="numeric" pattern="[0-9]{6,14}" autocomplete="off" placeholder="Tape le code-barres (ex. 3017620422003)" aria-label="Code-barres">
      <button class="btn" type="submit">OK</button>
    </form>
    <p class="small center" style="margin-top:12px"><a href="#/product/3017620422003">Essayer avec un exemple</a></p>
  `);
  document.getElementById('code-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('code-input').value.replace(/\D/g, '');
    if (code.length >= 6) location.hash = `#/product/${code}`;
  });
  document.getElementById('start-cam').addEventListener('click', startCamera);
  if (store.get('camOk', false)) startCamera();
}

async function startCamera() {
  const msg = document.getElementById('cam-msg');
  if (!window.Html5Qrcode) { msg.textContent = 'Le scanner n\'a pas pu se charger. Tape le code-barres ci-dessous.'; return; }
  const F = window.Html5QrcodeSupportedFormats;
  try {
    scanner = new window.Html5Qrcode('reader', {
      formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E],
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      verbose: false,
    });
    document.getElementById('cam-placeholder').hidden = true;
    msg.textContent = 'Recherche du code-barres…';
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: (w, h) => ({ width: Math.floor(w * 0.76), height: Math.floor(h * 0.4) }) },
      (text) => {
        const code = text.replace(/\D/g, '');
        if (code.length < 6) return;
        if (navigator.vibrate) navigator.vibrate(60);
        location.hash = `#/product/${code}`;
      },
      () => {},
    );
    document.getElementById('cam-frame').hidden = false;
    store.set('camOk', true);
  } catch (err) {
    store.set('camOk', false);
    const ph = document.getElementById('cam-placeholder');
    if (ph) ph.hidden = false;
    if (msg) msg.textContent = 'Impossible d\'accéder à la caméra. Autorise-la dans les réglages du navigateur, ou tape le code-barres.';
    scanner = null;
  }
}

// ---------- Fiche produit ----------
async function getProduct(code) {
  if (productCache.has(code)) return productCache.get(code);
  const p = await fetchProduct(code);
  if (p) productCache.set(code, p);
  return p;
}

async function showProduct(code) {
  render('<div class="spinner" role="status" aria-label="Chargement"></div>');
  let p;
  try {
    p = await getProduct(code);
  } catch (e) {
    render(`
      <div class="card empty">
        <h2>Pas de connexion</h2>
        <p>Impossible de joindre la base de produits. Vérifie ta connexion internet.</p>
        <button class="btn" onclick="location.reload()">Réessayer</button>
      </div>`);
    return;
  }
  if (!p) {
    render(`
      <div class="card empty">
        <h2>Produit inconnu</h2>
        <p>Le code <strong>${esc(code)}</strong> n'est pas encore dans la base Open Food Facts.</p>
        <p class="small">Tu peux l'ajouter gratuitement avec l'appli Open Food Facts : il sera ensuite disponible pour tout le monde.</p>
        <a class="btn" href="#/scan">Scanner un autre produit</a>
      </div>`);
    return;
  }

  const a = analyze(p, profile);
  addToHistory(p, a);
  const name = productName(p);

  const alerts = [
    ...a.blockers.map((t) => `<div class="alert danger">${esc(t)}</div>`),
    ...a.warnings.map((t) => `<div class="alert warn">${esc(t)}</div>`),
  ].join('');
  const allGood = !a.blockers.length && !a.warnings.length && (profile.allergens.length || profile.diets.length)
    ? '<div class="alert ok">Compatible avec tes allergies et ton régime.</div>' : '';

  render(`
    <article>
      <div class="card product-head">
        ${safeUrl(p.image_front_small_url) ? `<img class="thumb" src="${safeUrl(p.image_front_small_url)}" alt="">` : '<div class="thumb"></div>'}
        <div>
          <h1>${esc(name)}</h1>
          <p class="muted small" style="margin:0">${esc([p.brands, p.quantity].filter(Boolean).join(' · '))}</p>
        </div>
      </div>

      <section class="card" aria-labelledby="verdict-title">
        <div class="verdict">
          <div class="ring ${scoreClass(a)}" style="--v:${a.score ?? 0}"><b>${scoreText(a)}</b></div>
          <div>
            <div class="label ${scoreClass(a)}" id="verdict-title">${esc(a.verdict.label)}</div>
            <div class="small muted">${a.score != null ? 'Note sur 100, calculée selon ton profil' : a.verdict.key === 'blocked' ? 'À cause de ton profil' : 'Valeurs nutritionnelles incomplètes'}</div>
          </div>
        </div>
        ${alerts}${allGood}
      </section>

      ${a.negatives.length || a.positives.length ? `
      <section class="card">
        <h2>Pourquoi cette note</h2>
        <ul class="points">
          ${a.negatives.map((x) => `<li class="neg"><span class="dot"></span><span>${esc(x.text)}</span></li>`).join('')}
          ${a.positives.map((x) => `<li class="pos"><span class="dot"></span><span>${esc(x.text)}</span></li>`).join('')}
        </ul>
      </section>` : ''}

      ${renderChild(a)}
      ${renderDiets(a)}
      ${renderSupplement(a)}

      <section class="card" id="price-card">
        <h2>Prix</h2>
        <div class="spinner" aria-label="Chargement du prix"></div>
      </section>

      <section class="card" id="alt-card">
        <h2>Mieux et moins cher</h2>
        <p class="small muted">Produits de la même catégorie, mieux notés pour toi${profile.store ? `, de préférence chez ${esc(STORES.find((s) => s.id === profile.store)?.label || '')}` : ''}.</p>
        <button class="btn block" id="alt-btn" type="button">Trouver des alternatives</button>
        <div id="alt-list"></div>
      </section>

      <p class="disclaimer">
        Données : <a href="https://world.openfoodfacts.org/product/${encodeURIComponent(p.code)}" target="_blank" rel="noopener">Open Food Facts</a> et Open Prices (bases collaboratives).
        Clair donne des informations générales, pas un avis médical. En cas d'allergie grave, vérifie toujours l'étiquette.
      </p>
    </article>
  `);

  loadPrice(p);
  document.getElementById('alt-btn').addEventListener('click', () => loadAlternatives(p, a));
}

function renderChild(a) {
  if (!profile.children || !a.child) return '';
  const c = a.child;
  const cubes = c.cubesServing ?? c.cubes100;
  const full = Math.floor(cubes);
  const part = Math.round((cubes - full) * 100);
  const cubeHtml = Array.from({ length: Math.min(full, 30) }, () => '<span class="cube"></span>').join('')
    + (part >= 10 && full < 30 ? `<span class="cube part" style="--p:${part}%"></span>` : '');
  const pct = Math.min(c.pctDailyChild, 100);
  const color = c.pctDailyChild > 50 ? 'var(--bad)' : c.pctDailyChild > 25 ? 'var(--poor)' : 'var(--excellent)';
  return `
    <section class="card">
      <h2>👶 Pour mon enfant</h2>
      <p style="margin:0"><strong>${fmt(cubes)} morceau${cubes >= 2 ? 'x' : ''} de sucre</strong> ${esc(c.basis)}</p>
      <div class="sugar" aria-hidden="true">${cubeHtml || '<span class="small muted">Presque pas de sucre</span>'}</div>
      <div class="meter" aria-hidden="true"><i style="width:${pct}%; --c:${color}"></i></div>
      <p class="small muted" style="margin:0">
        Soit ${c.pctDailyChild} % du maximum conseillé par jour pour un enfant (25 g de sucres ajoutés).
        1 morceau = ${SUGAR_CUBE_G} g. Le calcul inclut aussi les sucres naturels (fruits, lait).
      </p>
    </section>`;
}

function renderDiets(a) {
  const items = DIETS.map((d) => {
    const r = a.diets[d.id];
    const mine = profile.diets.includes(d.id);
    return `
      <details class="diet ${mine ? 'mine' : ''}">
        <summary>${esc(d.label)} <span class="badge ${r.status}">${STATUS_LABEL[r.status]}</span></summary>
        <ul>${r.reasons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </details>`;
  }).join('');
  return `
    <section class="card">
      <h2>Régime et religion</h2>
      <p class="small muted">Touche une case pour voir le détail. Tes choix sont encadrés en vert.</p>
      <div class="diet-grid">${items}</div>
    </section>`;
}

function renderSupplement(a) {
  if (!a.supplement) return '';
  const s = a.supplement;
  const rows = s.nutrients.map((n) => `
    <tr>
      <td>${esc(n.label)}${n.note ? `<div class="small" style="color:var(--${n.level === 'no' ? 'bad' : 'poor'})">${esc(n.note)}</div>` : ''}</td>
      <td class="num">${esc(n.amount)}<div class="small muted">${esc(n.basis)}</div></td>
      <td class="num"><span class="badge ${n.level}">${n.pct} %</span></td>
    </tr>`).join('');
  const inter = s.interactions.map((i) => `
    <div class="alert ${i.forYou ? 'danger' : 'warn'}">${esc(i.msg)}${i.forYou ? ` <strong>Concerne ton traitement : ${esc(i.meds.join(', '))}.</strong>` : ''}</div>`).join('');
  return `
    <section class="card">
      <h2>💊 Complément alimentaire</h2>
      ${rows ? `
        <table>
          <thead><tr><th>Nutriment</th><th class="num">Dose</th><th class="num">% des besoins</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>` : '<p class="small muted">Les doses de ce complément ne sont pas renseignées dans la base.</p>'}
      ${inter || (profile.meds.length ? '<div class="alert ok">Aucune interaction connue détectée avec tes médicaments.</div>' : '')}
      <p class="small muted" style="margin-top:10px">Avant de prendre un complément, surtout si tu as un traitement, demande l'avis de ton pharmacien ou de ton médecin.</p>
    </section>`;
}

async function loadPrice(p) {
  const card = document.getElementById('price-card');
  const price = await fetchLatestPrice(p.code, profile.store);
  if (!card.isConnected) return;
  if (!price) {
    card.innerHTML = `
      <h2>Prix</h2>
      <p class="small muted" style="margin:0">Aucun prix connu pour ce produit. Les prix viennent des contributions de la communauté (Open Prices).</p>`;
    return;
  }
  const kg = pricePerKg(price, p);
  card.innerHTML = `
    <h2>Prix</h2>
    <p style="margin:0"><strong style="font-size:1.25rem">${euro(price.price)}</strong>${kg ? ` <span class="muted">· ${euro(kg)} / ${priceUnit(p)}</span>` : ''}</p>
    <p class="small muted" style="margin:0">Relevé le ${esc(dateFr(price.date))}${price.store ? ` chez ${esc(price.store)}` : ''}${price.city || price.country ? ` (${esc([price.city, price.country].filter(Boolean).join(', '))})` : ''}.</p>`;
  p._price = price;
}

async function loadAlternatives(p, a) {
  const btn = document.getElementById('alt-btn');
  const list = document.getElementById('alt-list');
  btn.disabled = true;
  btn.textContent = 'Recherche en cours…';
  list.innerHTML = '<div class="spinner" aria-hidden="true"></div>';

  const candidates = await searchAlternatives(p, profile.store);
  const base = a.score ?? 0;
  let better = candidates
    .map((x) => ({ p: x, a: analyze(x, profile) }))
    .filter((x) => !x.a.blockers.length && x.a.score != null && x.a.score > base + 5)
    .sort((x, y) => (y.p._inStore - x.p._inStore) || (y.a.score - x.a.score))
    .slice(0, 6);

  if (!better.length) {
    btn.hidden = true;
    list.innerHTML = `<p class="small muted" style="margin:0">${a.verdict.key === 'excellent' ? 'Ce produit est déjà parmi les meilleurs pour toi 👍' : 'Aucune meilleure alternative trouvée dans la base pour l\'instant.'}</p>`;
    return;
  }

  // Prix des alternatives (en parallèle).
  const prices = await Promise.all(better.map((x) => fetchLatestPrice(x.p.code, profile.store)));
  const myPrice = p._price || await fetchLatestPrice(p.code, profile.store);
  const myKg = myPrice ? pricePerKg(myPrice, p) : null;
  better = better.map((x, i) => {
    const pr = prices[i];
    const kg = pr ? pricePerKg(pr, x.p) : null;
    const cheaper = myKg && kg ? kg < myKg : (myPrice && pr ? pr.price < myPrice.price : false);
    return { ...x, price: pr, kg, cheaper };
  });
  // D'abord celles du magasin habituel, puis par note (arrondie à 10 points près), puis les moins chères.
  better.sort((x, y) => (y.p._inStore - x.p._inStore)
    || (Math.round(y.a.score / 10) - Math.round(x.a.score / 10))
    || (y.cheaper - x.cheaper)
    || (y.a.score - x.a.score));

  better.forEach((x) => productCache.set(x.p.code, x.p));
  btn.hidden = true;
  list.innerHTML = `<ul class="list">${better.map((x) => `
    <li>
      <a class="item" href="#/product/${encodeURIComponent(x.p.code)}">
        ${safeUrl(x.p.image_front_small_url) ? `<img src="${safeUrl(x.p.image_front_small_url)}" alt="" loading="lazy">` : '<span class="noimg"></span>'}
        <span class="grow">
          <span class="title">${esc(productName(x.p))}</span>
          <span class="small muted">${esc(x.p.brands || '')}</span>
          <span class="tags">
            ${x.price ? `<span class="badge brand">${euro(x.price.price)}${x.kg ? ` · ${euro(x.kg)}/${priceUnit(x.p)}` : ''}</span>` : ''}
            ${x.cheaper ? '<span class="badge ok">Moins cher</span>' : ''}
            ${x.p._inStore ? `<span class="badge ok">Chez ${esc(STORES.find((s) => s.id === profile.store)?.label || '')}</span>` : ''}
            <span class="badge ok">+${x.a.score - base} pts</span>
          </span>
        </span>
        <span class="pill-score ${scoreClass(x.a)}">${scoreText(x.a)}</span>
      </a>
    </li>`).join('')}</ul>`;
}

// ---------- Historique ----------
function addToHistory(p, a) {
  const h = store.get('history', []).filter((x) => x.code !== p.code);
  h.unshift({
    code: p.code, name: productName(p), brand: p.brands || '', img: p.image_front_small_url || '',
    score: a.score, verdict: a.verdict.key, label: a.verdict.label, date: Date.now(),
  });
  store.set('history', h.slice(0, 60));
}

function showHistory() {
  const h = store.get('history', []);
  if (!h.length) {
    render(`
      <div class="empty">
        <h1>Historique</h1>
        <p>Les produits que tu scannes apparaîtront ici.</p>
        <a class="btn" href="#/scan">Scanner un produit</a>
      </div>`);
    return;
  }
  render(`
    <h1>Historique</h1>
    <div class="card">
      <ul class="list">
        ${h.map((x) => `
          <li>
            <a class="item" href="#/product/${encodeURIComponent(x.code)}">
              ${safeUrl(x.img) ? `<img src="${safeUrl(x.img)}" alt="" loading="lazy">` : '<span class="noimg"></span>'}
              <span class="grow">
                <span class="title">${esc(x.name)}</span>
                <span class="small muted">${esc(x.label)}${x.brand ? ` · ${esc(x.brand)}` : ''}</span>
              </span>
              <span class="pill-score v-${esc(x.verdict)}">${x.verdict === 'blocked' ? '✕' : x.score ?? '?'}</span>
            </a>
          </li>`).join('')}
      </ul>
    </div>
    <button class="btn secondary block" id="clear-history" type="button">Effacer l'historique</button>
  `);
  document.getElementById('clear-history').addEventListener('click', () => {
    if (confirm('Effacer tout l\'historique ?')) { store.set('history', []); showHistory(); }
  });
}

// ---------- Profil ----------
function chips(name, options, selected, type = 'checkbox') {
  return `<div class="chips">${options.map((o) => `
    <label class="chip">
      <input type="${type}" name="${name}" value="${esc(o.id ?? o.tag)}" ${selected.includes(o.id ?? o.tag) ? 'checked' : ''}>
      <span>${esc(o.label)}</span>
    </label>`).join('')}</div>`;
}

function showProfile(welcome) {
  render(`
    ${welcome ? `
      <section class="hero">
        <img src="icons/icon.svg" alt="" width="64" height="64">
        <h1>Bienvenue sur Clair</h1>
        <p class="muted">Réponds à quelques questions : chaque produit sera noté <strong>pour toi</strong>. Tout reste sur ton téléphone.</p>
      </section>` : '<h1>Mon profil</h1><p class="muted small">Ces informations restent sur ton téléphone et servent uniquement à personnaliser les notes.</p>'}
    <form id="profile-form" class="card">
      <fieldset>
        <legend>Allergies et intolérances</legend>
        <p class="hint">Les produits qui en contiennent seront marqués « Déconseillé ».</p>
        ${chips('allergens', ALLERGENS, profile.allergens)}
      </fieldset>
      <fieldset>
        <legend>Régime alimentaire</legend>
        ${chips('diets', DIETS, profile.diets)}
      </fieldset>
      <fieldset>
        <legend>Santé</legend>
        ${chips('conditions', CONDITIONS, profile.conditions)}
      </fieldset>
      <fieldset>
        <legend>Objectif</legend>
        ${chips('goal', GOALS, [profile.goal], 'radio')}
      </fieldset>
      <fieldset>
        <label class="switch">
          <span><strong>J'achète pour des enfants</strong><br><span class="hint">Affiche le sucre en morceaux et des alertes adaptées.</span></span>
          <input type="checkbox" name="children" ${profile.children ? 'checked' : ''}>
        </label>
      </fieldset>
      <fieldset>
        <legend>Médicaments</legend>
        <p class="hint">Pour être alerté si un complément alimentaire peut interagir avec ton traitement.</p>
        ${chips('meds', MEDS, profile.meds)}
      </fieldset>
      <fieldset>
        <legend><label for="store-select">Mon magasin habituel</label></legend>
        <p class="hint">Pour te proposer des alternatives vendues là où tu fais tes courses.</p>
        <select id="store-select" name="store">
          ${STORES.map((s) => `<option value="${esc(s.id)}" ${s.id === profile.store ? 'selected' : ''}>${esc(s.label)}</option>`).join('')}
        </select>
      </fieldset>
      <div class="sticky-actions">
        <button class="btn block" type="submit">${welcome ? 'C\'est parti' : 'Enregistrer'}</button>
      </div>
      <p class="small muted center" id="saved-msg" role="status" style="margin:8px 0 0"></p>
    </form>
  `);
  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    profile = {
      allergens: f.getAll('allergens'),
      diets: f.getAll('diets'),
      conditions: f.getAll('conditions'),
      goal: f.get('goal') || 'none',
      children: f.get('children') === 'on',
      meds: f.getAll('meds'),
      store: f.get('store') || '',
    };
    store.set('profile', profile);
    if (welcome) location.hash = '#/scan';
    else document.getElementById('saved-msg').textContent = 'Profil enregistré ✓';
  });
}

// ---------- Démarrage ----------
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
route();
