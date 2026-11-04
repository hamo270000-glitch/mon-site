// Onglet Sport : planning de la semaine, séance guidée (séries, charges, chrono de repos),
// historique et records, bibliothèque d'exercices. Inspiré des meilleures applis :
// programme automatique (Fitbod), suivi des séries et records (Hevy, Strong), fiches d'exercices (Jefit).
import { EXERCISES, byId, SESSIONS, PROGRAMS, LIEUX, NIVEAUX, MUSCLES, available, prescription, sessionExercises } from './sport-data.js';
import { muscleMap, levelsFor } from './muscles.js';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (v, d = 0) => Number(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const get = (k, d) => { try { const v = localStorage.getItem(`affute.${k}`); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const set = (k, v) => { try { localStorage.setItem(`affute.${k}`, JSON.stringify(v)); } catch (e) { /* plein */ } };
const num = (v) => { const x = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(x) ? x : null; };
const restTxt = (r) => (r < 60 ? `${r} s` : r % 60 ? `${Math.floor(r / 60)} min ${r % 60}` : `${r / 60} min`);
const todayIdx = () => (new Date().getDay() + 6) % 7;
const weekStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - todayIdx()); return d.getTime(); };

let PROFILE = null;
const settings = () => get('sport', null);
const history = () => get('seances', []);

function exercisesForDay(i) {
  const s = settings();
  const tpl = s.planning[i];
  return tpl === 'repos' ? [] : sessionExercises(tpl, s.lieu, s.barre);
}
const rx = (ex) => prescription(ex, { objectif: PROFILE?.objectif || 'seche', niveau: settings()?.niveau });
const estMinutes = (exs) => Math.round(exs.reduce((t, e) => {
  const p = rx(e);
  if (p.cardio) return t + 30;
  return t + p.series * (0.8 + p.repos / 60);
}, 8));

// Dernière performance enregistrée sur un exercice.
function lastPerf(id) {
  for (const s of history().slice().reverse()) {
    const e = s.exos.find((x) => x.id === id);
    if (e && e.sets.some((x) => x.done)) return { date: s.date, sets: e.sets.filter((x) => x.done) };
  }
  return null;
}
const e1rm = (kg, reps) => (kg && reps ? kg * (1 + reps / 30) : 0); // formule d'Epley
function bestE1rm(id, exclude) {
  let best = 0;
  for (const s of history()) {
    if (s === exclude) continue;
    const e = s.exos.find((x) => x.id === id);
    if (e) for (const st of e.sets) if (st.done) best = Math.max(best, e1rm(num(st.kg), num(st.reps)));
  }
  return best;
}
function suggestion(ex) {
  const last = lastPerf(ex.id);
  const p = rx(ex);
  if (!last || p.cardio || p.temps) return null;
  const allTop = last.sets.length >= p.series && last.sets.every((x) => (num(x.reps) || 0) >= p.max);
  const kg = Math.max(...last.sets.map((x) => num(x.kg) || 0));
  if (!allTop) return { text: `Vise ${p.max} répétitions sur chaque série avant d'augmenter.`, kg };
  if (!kg) return { text: 'Bravo ! Ajoute 1 à 2 répétitions, ou rends l\'exercice plus difficile.', kg };
  const step = ex.type === 'poly' ? 2.5 : 1;
  return { text: `Tu as tout réussi la dernière fois : passe à ${fmt(kg + step, 1)} kg 💪`, kg: kg + step };
}

// ---------- Réglages (premier passage) ----------
function viewSetup(app, rerender) {
  const s = settings() || { lieu: 'salle', jours: 4, niveau: 'debutant', barre: false };
  app.innerHTML = `
    <h1 class="title">Entraînement</h1>
    <p class="lead">3 questions et ton programme de la semaine est prêt : exercices, séries, répétitions et repos, adaptés à ${PROFILE?.objectif === 'masse' ? 'ta prise de masse' : 'ta sèche'}.</p>
    <form id="sp" class="stack">
      <section class="card"><h2>Où t'entraînes-tu ?</h2><div class="choices">${LIEUX.map((l) => `
        <label class="choice"><input type="radio" name="lieu" value="${l.id}" ${s.lieu === l.id ? 'checked' : ''}><b>${l.emoji} ${l.label}</b><small>${l.detail}</small></label>`).join('')}</div>
        <label class="choice" style="margin-top:10px"><input type="checkbox" name="barre" ${s.barre ? 'checked' : ''}><b>J'ai une barre de traction à la maison</b></label></section>
      <section class="card"><h2>Combien de séances par semaine ?</h2><div class="choices two">${Object.entries(PROGRAMS).map(([n, pg]) => `
        <label class="choice"><input type="radio" name="jours" value="${n}" ${Number(s.jours) === Number(n) ? 'checked' : ''}><b>${n} séances</b><small>${pg.nom}</small></label>`).join('')}</div></section>
      <section class="card"><h2>Ton niveau</h2><div class="choices">${NIVEAUX.map((n) => `
        <label class="choice"><input type="radio" name="niveau" value="${n.id}" ${s.niveau === n.id ? 'checked' : ''}><b>${n.label}</b><small>${n.detail}</small></label>`).join('')}</div></section>
      <button class="btn block" type="submit">Créer mon programme</button>
    </form>`;
  app.querySelector('#sp').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const jours = Number(f.get('jours')) || 4;
    set('sport', { lieu: f.get('lieu') || 'salle', barre: f.get('barre') === 'on', jours, niveau: f.get('niveau') || 'debutant', planning: [...PROGRAMS[jours].jours] });
    rerender();
  });
}

// ---------- Accueil Sport ----------
export function viewSport(app, profile) {
  PROFILE = profile;
  stopTimerUI();
  const s = settings();
  if (!s) { viewSetup(app, () => viewSport(app, profile)); return; }
  const t = todayIdx();
  const ws = weekStart();
  const hist = history();
  const doneThisWeek = new Set(hist.filter((x) => x.date >= ws).map((x) => x.jour));
  const planned = s.planning.filter((x) => x !== 'repos').length;
  const weekVolume = hist.filter((x) => x.date >= ws).reduce((v, x) => v + (x.volume || 0), 0);

  // Récupération : muscles travaillés ces 3 derniers jours.
  const rec = {};
  const now = Date.now();
  for (const x of hist) {
    const h = (now - x.date) / 36e5;
    if (h > 72) continue;
    const lv = h < 24 ? 1 : h < 48 ? 0.6 : 0.3;
    for (const ex of x.exos) {
      const e = byId[ex.id]; if (!e || !ex.sets.some((y) => y.done)) continue;
      for (const m of e.muscles) rec[m] = Math.max(rec[m] || 0, lv);
    }
  }
  const todayTpl = s.planning[t];
  const todayExs = exercisesForDay(t);
  const draft = get('seance', null);

  app.innerHTML = `
    <h1 class="title">Entraînement</h1>
    <p class="lead">${PROGRAMS[s.jours]?.nom || 'Mon programme'} · ${LIEUX.find((l) => l.id === s.lieu)?.label} · ${NIVEAUX.find((n) => n.id === s.niveau)?.label}</p>

    <div class="week-strip">${DAYS.map((d, i) => `
      <a href="#/sport/jour/${i}" class="ws-day ${i === t ? 'today' : ''} ${doneThisWeek.has(i) ? 'done' : ''} ${s.planning[i] === 'repos' ? 'rest' : ''}">
        <span>${d.slice(0, 3)}</span><b>${doneThisWeek.has(i) ? '✓' : s.planning[i] === 'repos' ? '😴' : SESSIONS[s.planning[i]]?.emoji || '•'}</b></a>`).join('')}</div>

    <section class="card today-card">
      <span class="small muted">Aujourd'hui · ${DAYS[t]}</span>
      ${todayTpl === 'repos' ? `
        <h2 style="margin:4px 0 6px">😴 Jour de repos</h2>
        <p class="small" style="margin:0">Les muscles grandissent pendant le repos. ${PROFILE?.objectif === 'masse' ? 'Mange bien et dors 8 heures.' : 'Marche 30 à 45 minutes pour brûler un peu plus, sans fatigue.'}</p>`
    : `
        <h2 style="margin:4px 0 2px">${SESSIONS[todayTpl].emoji} ${esc(SESSIONS[todayTpl].nom)}</h2>
        <p class="small muted" style="margin:0 0 12px">${todayExs.length} exercices · environ ${estMinutes(todayExs)} min</p>
        <a class="btn block" href="#/sport/seance/${t}">${draft && draft.jour === t ? '▶ Reprendre ma séance' : doneThisWeek.has(t) ? '✓ Séance faite · la refaire' : '▶ Commencer la séance'}</a>`}
    </section>

    <div class="grid2">
      <div class="stat"><b>${doneThisWeek.size} / ${planned}</b><span>séances cette semaine</span></div>
      <div class="stat"><b>${fmt(weekVolume / 1000, 1)} t</b><span>soulevées cette semaine</span></div>
    </div>

    <section class="card" style="margin-top:14px">
      <h2>Ma semaine</h2>
      <ul class="plan-list">${DAYS.map((d, i) => {
        const tpl = s.planning[i];
        const exs = exercisesForDay(i);
        return `<li><a href="#/sport/jour/${i}"><span class="pl-day ${i === t ? 'today' : ''}">${d}</span>
          <span class="pl-what">${tpl === 'repos' ? '<span class="muted">Repos</span>' : `<b>${SESSIONS[tpl].emoji} ${esc(SESSIONS[tpl].nom)}</b><small>${exs.length} exercices · ${estMinutes(exs)} min</small>`}</span>
          <span class="pl-state">${doneThisWeek.has(i) ? '<span class="pill ok">✓ Fait</span>' : '›'}</span></a></li>`;
      }).join('')}</ul>
      <button class="btn ghost block small" id="edit-plan" type="button" style="margin-top:12px">✏️ Modifier mon planning</button>
    </section>

    <section class="card">
      <h2>Récupération</h2>
      <div class="center">${muscleMap(rec, { size: 120 })}</div>
      <p class="small muted" style="margin:6px 0 0">${Object.keys(rec).length ? '<span style="color:#ff2d55">●</span> travaillé il y a moins de 24 h · <span style="color:#ff9f0a">●</span> en récupération. Évite de retravailler un muscle rouge.' : 'Tous tes muscles sont reposés. Les muscles travaillés s\'afficheront ici après tes séances.'}</p>
    </section>

    <div class="grid2" style="margin-bottom:14px">
      <a class="btn ghost" href="#/sport/biblio">📚 Exercices</a>
      <a class="btn ghost" href="#/sport/historique">📈 Historique</a>
    </div>
    <button class="btn ghost block small" id="reset-prog" type="button">⚙️ Changer de lieu, de niveau ou de nombre de séances</button>
    <p class="footer-note">Échauffe-toi 5 à 10 minutes avant chaque séance. En cas de douleur, arrête l'exercice.</p>`;

  app.querySelector('#reset-prog').onclick = () => { viewSetup(app, () => viewSport(app, profile)); window.scrollTo(0, 0); };
  app.querySelector('#edit-plan').onclick = () => viewEditPlan(app, profile);
}

function viewEditPlan(app, profile) {
  const s = settings();
  const opts = [['repos', '😴 Repos'], ...Object.entries(SESSIONS).map(([k, v]) => [k, `${v.emoji} ${v.nom}`])];
  app.innerHTML = `
    <a href="#/sport" class="small" style="text-decoration:none">‹ Entraînement</a>
    <h1 class="title">Mon planning</h1>
    <p class="lead">Choisis la séance de chaque jour. Par exemple : lundi « Bras », mardi « Jambes »…</p>
    <form id="ep" class="card">${DAYS.map((d, i) => `
      <label class="field plan-edit"><span>${d}</span>
        <select class="input" name="d${i}">${opts.map(([k, l]) => `<option value="${k}" ${s.planning[i] === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`).join('')}
      <button class="btn block" type="submit" style="margin-top:14px">Enregistrer</button>
      <button class="btn ghost block" type="button" id="default-plan" style="margin-top:10px">Revenir au planning conseillé</button>
    </form>`;
  app.querySelector('#ep').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    s.planning = DAYS.map((_, i) => f.get(`d${i}`) || 'repos');
    set('sport', s);
    location.hash = '#/sport';
    viewSport(app, profile);
  });
  app.querySelector('#default-plan').onclick = () => { s.planning = [...PROGRAMS[s.jours].jours]; set('sport', s); viewEditPlan(app, profile); };
}

// ---------- Détail d'un jour ----------
export function viewSportDay(app, profile, i) {
  PROFILE = profile;
  const s = settings();
  if (!s) { location.hash = '#/sport'; return; }
  const tpl = s.planning[i];
  const exs = exercisesForDay(i);
  if (tpl === 'repos') {
    app.innerHTML = `<a href="#/sport" class="small" style="text-decoration:none">‹ Entraînement</a><h1 class="title">${DAYS[i]} · Repos</h1>
      <section class="card"><p style="margin:0">Pas de musculation aujourd'hui. ${profile?.objectif === 'masse' ? 'Repose-toi et mange bien.' : 'Une marche rapide de 30 à 45 minutes est idéale.'}</p></section>
      <a class="btn ghost block" href="#/sport/ex/marche">🚶 Voir la marche rapide</a>`;
    return;
  }
  app.innerHTML = `
    <a href="#/sport" class="small" style="text-decoration:none">‹ Entraînement</a>
    <h1 class="title">${DAYS[i]}</h1>
    <p class="lead">${SESSIONS[tpl].emoji} ${esc(SESSIONS[tpl].nom)} · ${exs.length} exercices · environ ${estMinutes(exs)} min</p>
    <section class="card center">${muscleMap(levelsFor(exs), { size: 120 })}
      <p class="small muted" style="margin:6px 0 0"><span style="color:#ff2d55">●</span> muscles principaux · <span style="color:#ff9f0a">●</span> muscles secondaires</p></section>
    <section class="card"><h2>Exercices</h2><ol class="ex-list">${exs.map((e) => {
      const p = rx(e);
      return `<li><a href="#/sport/ex/${e.id}"><span class="emoji3d sm">${e.emoji}</span><span><b>${esc(e.nom)}</b>
        <small>${p.cardio ? p.reps : `${p.series} séries × ${p.reps}${p.temps ? '' : ' répétitions'} · repos ${restTxt(p.repos)}`}</small></span><span class="muted">›</span></a></li>`;
    }).join('')}</ol></section>
    <a class="btn block" href="#/sport/seance/${i}">▶ Commencer la séance</a>`;
}

// ---------- Fiche exercice ----------
export function viewExercise(app, profile, id) {
  PROFILE = profile;
  const e = byId[id];
  if (!e) { location.hash = '#/sport/biblio'; return; }
  const p = rx(e);
  const hist = history().filter((s) => s.exos.some((x) => x.id === id && x.sets.some((y) => y.done))).slice(-10);
  const pts = hist.map((s) => Math.max(...s.exos.find((x) => x.id === id).sets.filter((y) => y.done).map((y) => e1rm(num(y.kg), num(y.reps)) || num(y.reps) || 0)));
  const alt = e.alt && byId[e.alt];
  const lp = lastPerf(id);
  app.innerHTML = `
    <a href="javascript:history.back()" class="small" style="text-decoration:none">‹ Retour</a>
    <div class="row" style="gap:14px;margin:12px 0"><span class="emoji3d big">${e.emoji}</span>
      <div><h1 class="title" style="font-size:1.6rem;margin:0">${esc(e.nom)}</h1>
        <span class="small muted">${e.muscles.map((m) => MUSCLES[m]).join(', ')}${e.sec.length ? ` · aussi : ${e.sec.map((m) => MUSCLES[m]).join(', ')}` : ''}</span></div></div>
    <section class="card center">${muscleMap(levelsFor([e]), { size: 120 })}</section>
    <section class="card">
      <h2>Pour toi</h2>
      <p style="margin:0"><b>${p.cardio ? p.reps : `${p.series} séries × ${p.reps}${p.temps ? '' : ' répétitions'}`}</b>${p.repos ? ` · ${restTxt(p.repos)} de repos` : ''}</p>
      ${lp ? `<p class="small muted" style="margin:6px 0 0">Dernière fois : ${lp.sets.map((x) => `${x.reps}${num(x.kg) ? `×${fmt(num(x.kg), 1)} kg` : ''}`).join(', ')}</p>` : ''}
      ${e.besoin ? `<p class="small muted" style="margin:6px 0 0">Matériel : ${esc(e.besoin)}.</p>` : ''}
    </section>
    <section class="card"><h2>Comment faire</h2><ol class="steps">${e.etapes.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      <div class="notice info" style="margin:12px 0 0">💡 ${esc(e.conseil)}</div>
      <div class="notice warn" style="margin:8px 0 0">⚠️ <b>Erreur fréquente :</b> ${esc(e.erreur)}</div></section>
    ${pts.length > 1 ? `<section class="card"><h2>Ta progression</h2>${sparkline(pts)}<p class="small muted" style="margin:6px 0 0">Force estimée (formule d'Epley) sur tes ${pts.length} dernières séances.</p></section>` : ''}
    ${alt ? `<a class="btn ghost block" href="#/sport/ex/${alt.id}">🔁 Variante : ${esc(alt.nom)}</a>` : ''}`;
}

function sparkline(pts) {
  const W = 320; const H = 90; const min = Math.min(...pts); const max = Math.max(...pts);
  const X = (i) => 10 + (i / (pts.length - 1)) * (W - 20);
  const Y = (v) => H - 12 - ((v - min) / (max - min || 1)) * (H - 24);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><polyline points="${pts.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}" fill="none" stroke="#007aff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="#007aff"/>`).join('')}</svg>`;
}

// ---------- Bibliothèque ----------
let biblioMuscle = 'tous';
export function viewBiblio(app, profile) {
  PROFILE = profile;
  const s = settings() || { lieu: 'salle' };
  const list = EXERCISES.filter((e) => biblioMuscle === 'tous' || e.muscles.includes(biblioMuscle))
    .sort((a, b) => available(b, s.lieu, s.barre) - available(a, s.lieu, s.barre) || a.nom.localeCompare(b.nom));
  app.innerHTML = `
    <a href="#/sport" class="small" style="text-decoration:none">‹ Entraînement</a>
    <h1 class="title">Exercices</h1>
    <p class="lead">${EXERCISES.length} exercices expliqués, avec les muscles travaillés.</p>
    <div class="chips" id="bm" style="margin-bottom:12px">${[['tous', 'Tous'], ...Object.entries(MUSCLES)].map(([k, l]) => `<button class="chip" data-m="${k}" aria-pressed="${biblioMuscle === k}">${l}</button>`).join('')}</div>
    <section class="card"><ul class="ex-list">${list.map((e) => `
      <li><a href="#/sport/ex/${e.id}"><span class="emoji3d sm">${e.emoji}</span><span><b>${esc(e.nom)}</b>
        <small>${e.muscles.map((m) => MUSCLES[m]).join(', ')} · ${{ salle: 'salle', halteres: 'haltères', corps: 'sans matériel', barre: 'barre de traction' }[e.equip]}${available(e, s.lieu, s.barre) ? '' : ' · <span style="color:#c93400">pas dispo là où tu t\'entraînes</span>'}</small></span><span class="muted">›</span></a></li>`).join('')}</ul></section>`;
  app.querySelector('#bm').addEventListener('click', (ev) => { const b = ev.target.closest('[data-m]'); if (b) { biblioMuscle = b.dataset.m; viewBiblio(app, profile); } });
}

// ---------- Historique ----------
export function viewHistory(app, profile) {
  PROFILE = profile;
  const h = history().slice().reverse();
  app.innerHTML = `
    <a href="#/sport" class="small" style="text-decoration:none">‹ Entraînement</a>
    <h1 class="title">Historique</h1>
    ${h.length ? h.map((s) => `<section class="card"><div class="row between"><b>${SESSIONS[s.tpl]?.emoji || '🏋️'} ${esc(SESSIONS[s.tpl]?.nom || 'Séance')}</b>
      <span class="small muted">${new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
      <p class="small muted" style="margin:4px 0 8px">${s.duree} min · ${fmt(s.volume || 0)} kg soulevés${s.records?.length ? ` · 🏆 ${s.records.length} record${s.records.length > 1 ? 's' : ''}` : ''}</p>
      <ul class="hist-ex">${s.exos.filter((x) => x.sets.some((y) => y.done)).map((x) => `<li><span>${esc(byId[x.id]?.nom || x.id)}</span><span class="muted small">${x.sets.filter((y) => y.done).map((y) => `${y.reps}${num(y.kg) ? `×${fmt(num(y.kg), 1)}` : ''}`).join(' · ')}</span></li>`).join('')}</ul></section>`).join('')
    : '<section class="card"><p style="margin:0">Aucune séance pour l\'instant. Lance ta première séance depuis l\'onglet Sport 💪</p></section>'}`;
}

// ---------- Séance guidée ----------
let timer = null;
function stopTimerUI() { clearInterval(timer?.int); timer = null; document.getElementById('rest-timer')?.remove(); }

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25].forEach((t) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.2, ctx.currentTime + t); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.15); });
  } catch (e) { /* pas de son */ }
}

function startRest(seconds, label) {
  stopTimerUI();
  if (!seconds) return;
  const el = document.createElement('div');
  el.id = 'rest-timer'; el.className = 'rest-timer'; el.setAttribute('role', 'timer');
  document.body.appendChild(el);
  const end = { t: Date.now() + seconds * 1000, total: seconds };
  const draw = () => {
    const left = Math.max(0, Math.round((end.t - Date.now()) / 1000));
    el.innerHTML = `<div class="rt-bar"><i style="width:${(left / end.total) * 100}%"></i></div>
      <div class="rt-row"><div><small>Repos · ${esc(label)}</small><b>${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</b></div>
      <div class="rt-btns"><button type="button" data-rt="-15">−15 s</button><button type="button" data-rt="15">+15 s</button><button type="button" data-rt="skip" class="rt-skip">Passer</button></div></div>`;
    if (left <= 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      beep();
      el.innerHTML = '<div class="rt-row"><b>C\'est reparti ! 💪</b></div>';
      clearInterval(timer?.int);
      setTimeout(() => el.remove(), 2500);
    }
  };
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rt]'); if (!b) return;
    if (b.dataset.rt === 'skip') { stopTimerUI(); return; }
    end.t += Number(b.dataset.rt) * 1000; end.total = Math.max(end.total, Math.round((end.t - Date.now()) / 1000)); draw();
  });
  draw();
  timer = { int: setInterval(draw, 500) };
}

export function viewSeance(app, profile, i, toast) {
  PROFILE = profile;
  const s = settings();
  if (!s) { location.hash = '#/sport'; return; }
  let d = get('seance', null);
  if (!d || d.jour !== i) {
    const exs = exercisesForDay(i);
    d = {
      jour: i, tpl: s.planning[i], start: Date.now(),
      exos: exs.map((e) => {
        const p = rx(e); const last = lastPerf(e.id); const sug = suggestion(e);
        const n = p.cardio ? 1 : p.series;
        return { id: e.id, sets: Array.from({ length: n }, (_, k) => ({ kg: sug?.kg ? String(sug.kg) : last?.sets[k]?.kg || '', reps: last?.sets[k]?.reps || '', done: false })) };
      }),
    };
    set('seance', d);
  }
  const save = () => set('seance', d);
  const total = d.exos.reduce((t, x) => t + x.sets.length, 0);
  const done = d.exos.reduce((t, x) => t + x.sets.filter((y) => y.done).length, 0);

  app.innerHTML = `
    <a href="#/sport" class="small" style="text-decoration:none">‹ Entraînement</a>
    <h1 class="title" style="margin-bottom:2px">${SESSIONS[d.tpl]?.emoji || ''} ${esc(SESSIONS[d.tpl]?.nom || 'Séance')}</h1>
    <div class="seance-progress"><div class="wiz-bar"><i style="width:${Math.round((done / total) * 100)}%"></i></div><span class="small"><b>${done}</b>/${total} séries</span></div>
    ${d.exos.map((x, xi) => {
      const e = byId[x.id]; const p = rx(e); const lp = lastPerf(e.id); const sug = suggestion(e);
      const bodyweight = e.equip === 'corps' || e.equip === 'barre';
      return `<section class="card ex-card ${x.sets.every((y) => y.done) ? 'complete' : ''}">
        <div class="row between"><a href="#/sport/ex/${e.id}" class="ex-title"><span class="emoji3d sm">${e.emoji}</span><span><b>${esc(e.nom)}</b><small>${p.cardio ? p.reps : `${p.series} × ${p.reps}${p.temps ? '' : ' rép.'} · repos ${restTxt(p.repos)}`}</small></span></a></div>
        ${lp ? `<p class="small muted" style="margin:8px 0 0">Dernière fois : ${lp.sets.map((y) => `${y.reps}${num(y.kg) ? ` × ${fmt(num(y.kg), 1)} kg` : ''}`).join(' · ')}</p>` : ''}
        ${sug ? `<p class="small" style="margin:4px 0 0;color:var(--lime)">${esc(sug.text)}</p>` : ''}
        ${p.cardio ? `<div class="set-row cardio"><span>Durée (min)</span><input class="input" inputmode="decimal" data-x="${xi}" data-s="0" data-f="reps" value="${esc(x.sets[0].reps)}" placeholder="${p.reps}"><button type="button" class="set-ok ${x.sets[0].done ? 'on' : ''}" data-x="${xi}" data-s="0" aria-label="Valider">✓</button></div>`
    : `<div class="set-head"><span>Série</span>${bodyweight ? '<span>Lest (kg)</span>' : '<span>Poids (kg)</span>'}<span>${p.temps ? 'Secondes' : 'Répétitions'}</span><span></span></div>
        ${x.sets.map((y, si) => `<div class="set-row ${y.done ? 'done' : ''}"><span class="set-n">${si + 1}</span>
          <input class="input" inputmode="decimal" data-x="${xi}" data-s="${si}" data-f="kg" value="${esc(y.kg)}" placeholder="${bodyweight ? '0' : '–'}" aria-label="Poids série ${si + 1}">
          <input class="input" inputmode="numeric" data-x="${xi}" data-s="${si}" data-f="reps" value="${esc(y.reps)}" placeholder="${p.temps ? p.reps.replace(' s', '') : p.max || ''}" aria-label="Répétitions série ${si + 1}">
          <button type="button" class="set-ok ${y.done ? 'on' : ''}" data-x="${xi}" data-s="${si}" aria-label="Série ${si + 1} faite">✓</button></div>`).join('')}
        <button type="button" class="add-set" data-add="${xi}">+ Ajouter une série</button>`}
      </section>`;
    }).join('')}
    <button class="btn block" id="finish" type="button">🏁 Terminer la séance</button>
    <button class="btn ghost block small" id="cancel" type="button" style="margin-top:10px">Abandonner cette séance</button>`;

  app.querySelectorAll('input[data-f]').forEach((inp) => inp.addEventListener('input', () => {
    const sets = d.exos[inp.dataset.x].sets;
    const si = Number(inp.dataset.s);
    sets[si][inp.dataset.f] = inp.value;
    // Comme dans Hevy : le poids tapé se recopie dans les séries suivantes pas encore faites.
    if (inp.dataset.f === 'kg') {
      sets.forEach((st, k) => {
        if (k > si && !st.done) {
          st.kg = inp.value;
          const other = app.querySelector(`input[data-x="${inp.dataset.x}"][data-s="${k}"][data-f="kg"]`);
          if (other) other.value = inp.value;
        }
      });
    }
    save();
  }));
  app.querySelectorAll('.set-ok').forEach((b) => b.addEventListener('click', () => {
    const x = d.exos[b.dataset.x]; const st = x.sets[b.dataset.s]; const e = byId[x.id]; const p = rx(e);
    if (!st.done && !st.reps) st.reps = String(p.max || num(p.reps) || '');
    const prev = x.sets[Number(b.dataset.s) - 1];
    if (!st.done && !st.kg && prev?.kg) st.kg = prev.kg;
    st.done = !st.done; save();
    const y = window.scrollY; viewSeance(app, profile, i, toast); window.scrollTo(0, y);
    if (st.done && !p.cardio) startRest(p.repos, e.nom);
  }));
  app.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => {
    const x = d.exos[b.dataset.add]; const last = x.sets[x.sets.length - 1];
    x.sets.push({ kg: last?.kg || '', reps: last?.reps || '', done: false }); save();
    const y = window.scrollY; viewSeance(app, profile, i, toast); window.scrollTo(0, y);
  }));
  app.querySelector('#cancel').onclick = () => { if (confirm('Abandonner cette séance ? Les séries notées seront perdues.')) { set('seance', null); stopTimerUI(); location.hash = '#/sport'; } };
  app.querySelector('#finish').onclick = () => {
    if (!done && !confirm('Aucune série validée. Terminer quand même ?')) return;
    stopTimerUI();
    const duree = Math.max(1, Math.round((Date.now() - d.start) / 60000));
    let volume = 0;
    const records = [];
    for (const x of d.exos) {
      let best = 0;
      for (const st of x.sets) if (st.done) { volume += (num(st.kg) || 0) * (num(st.reps) || 0); best = Math.max(best, e1rm(num(st.kg), num(st.reps))); }
      if (best && best > bestE1rm(x.id) + 0.1 && lastPerf(x.id)) records.push(byId[x.id].nom);
    }
    const seance = { date: Date.now(), jour: d.jour, tpl: d.tpl, duree, volume: Math.round(volume), records, exos: d.exos };
    const h = history(); h.push(seance); set('seances', h.slice(-200));
    set('seance', null);
    const kcal = Math.round(5 * (PROFILE?.poids || 75) * (duree / 60));
    app.innerHTML = `
      <section class="card center finish-card">
        <div style="font-size:3.5rem">🎉</div>
        <h1 class="title" style="font-size:1.8rem">Séance terminée !</h1>
        <div class="grid3" style="margin:14px 0">
          <div class="stat"><b>${duree}</b><span>minutes</span></div>
          <div class="stat"><b>${done}</b><span>séries</span></div>
          <div class="stat"><b>${fmt(volume)}</b><span>kg soulevés</span></div>
        </div>
        ${records.length ? `<div class="notice ok-notice">🏆 <b>Nouveau record :</b> ${records.map(esc).join(', ')}</div>` : ''}
        <p class="small muted">Environ ${fmt(kcal)} kcal dépensées. ${PROFILE?.objectif === 'masse' ? 'Mange un repas riche en protéines dans les 2 heures.' : 'Bois de l\'eau et mange des protéines à ton prochain repas.'}</p>
        <a class="btn block" href="#/sport">Retour au programme</a>
      </section>`;
    if (toast) toast('Séance enregistrée 💪');
  };
}
