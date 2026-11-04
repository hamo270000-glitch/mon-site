// Effets « vivants » : apparitions en 3D au défilement, chiffres qui comptent, photo du plat
// qu'on fait pivoter du doigt, parallaxe, indicateur du menu qui glisse.
// Tout est coupé si l'iPhone demande de réduire les animations.

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Apparition des blocs en 3D quand ils arrivent à l'écran ----------
const REVEAL = '.card, .meal, .cal-ing li, .cal-kcal, .cal-macro, .stat, .day, .notice, .wiz-card, .ex-card';
let io = null;
function observer() {
  if (io) return io;
  io = new IntersectionObserver((list) => {
    let i = 0;
    for (const en of list) {
      if (!en.isIntersecting) continue;
      const el = en.target;
      el.style.transitionDelay = `${Math.min(i++, 6) * 55}ms`;
      el.classList.add('fx-in');
      io.unobserve(el);
      const done = (e) => {
        if (e && e.target !== el) return;
        if (e && e.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', done);
        el.classList.remove('fx-pre', 'fx-in'); el.style.transitionDelay = '';
      };
      el.addEventListener('transitionend', done);
      setTimeout(() => done(), 1600); // au cas où la transition ne se termine pas
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
  return io;
}

// ---------- Chiffres qui comptent jusqu'à leur valeur ----------
function countUp(el) {
  const txt = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild : null;
  if (!txt) return;
  const raw = txt.textContent.trim();
  const target = Number(raw.replace(/\s| /g, '').replace(',', '.'));
  if (!Number.isFinite(target) || target <= 0) return;
  const dur = 900; const t0 = performance.now();
  const fmt = (v) => Math.round(v).toLocaleString('fr-FR');
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 - (1 - k) ** 3;
    txt.textContent = fmt(target * e);
    if (k < 1) requestAnimationFrame(step); else txt.textContent = raw;
  };
  txt.textContent = '0';
  requestAnimationFrame(step);
}

// ---------- Photo du plat : on la fait pivoter du doigt, et parallaxe au défilement ----------
let scrollHandler = null;
function hero3d(root) {
  const hero = root.querySelector('.cal-hero');
  const img = hero && hero.querySelector('img');
  if (scrollHandler) { window.removeEventListener('scroll', scrollHandler); scrollHandler = null; }
  if (!img) return;
  let rx = 0; let ry = 0; let sy = 0; let raf = 0;
  const apply = () => {
    raf = 0;
    img.style.transform = `translateY(${sy * 0.35}px) scale(${1 + Math.min(sy, 300) / 1500}) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    ry = ((e.clientX - r.left) / r.width - 0.5) * 16;
    rx = -((e.clientY - r.top) / r.height - 0.5) * 12;
    img.style.transition = 'transform .08s linear'; queue();
  });
  const reset = () => { rx = 0; ry = 0; img.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)'; queue(); };
  hero.addEventListener('pointerleave', reset);
  hero.addEventListener('pointerup', reset);
  hero.addEventListener('pointercancel', reset);
  scrollHandler = () => { sy = Math.max(0, window.scrollY); img.style.transition = 'none'; queue(); };
  window.addEventListener('scroll', scrollHandler, { passive: true });
}

// ---------- Menu du bas : la pastille grise glisse jusqu'à l'onglet ouvert ----------
export function moveTabIndicator() {
  const pill = document.querySelector('.tab-pill');
  if (!pill) return;
  let ind = pill.querySelector('.tab-ind');
  if (!ind) { ind = document.createElement('span'); ind.className = 'tab-ind'; pill.prepend(ind); }
  const cur = pill.querySelector('a[aria-current="page"]');
  if (!cur) { ind.style.opacity = '0'; return; }
  ind.style.opacity = '1';
  ind.style.width = `${cur.offsetWidth}px`;
  ind.style.height = `${cur.offsetHeight}px`;
  ind.style.transform = `translate(${cur.offsetLeft}px, ${cur.offsetTop}px)`;
}
window.addEventListener('resize', moveTabIndicator);

// ---------- À appeler à chaque nouvelle page ----------
export function enterPage(root) {
  moveTabIndicator();
  hero3d(root);
  if (reduce()) return;
  const obs = observer();
  root.querySelectorAll(REVEAL).forEach((el) => {
    if (el.closest('.cal-actions')) return;
    const r = el.getBoundingClientRect();
    // Les blocs déjà visibles apparaissent tout de suite, les autres au défilement.
    el.classList.add('fx-pre');
    if (r.top < window.innerHeight * 0.94) requestAnimationFrame(() => obs.observe(el));
    else obs.observe(el);
  });
  root.querySelectorAll('.cal-kcal .ck-txt b, .cal-macro b, .ring .val b').forEach(countUp);
  root.classList.add('fx-fill');
  setTimeout(() => root.classList.remove('fx-fill'), 1400);
}
