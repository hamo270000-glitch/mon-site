// Animations du site : défilement doux (Lenis) et entrées en douceur (GSAP).
// Partagé par Clair et Affûté. Tout est coupé si l'iPhone demande de réduire les animations.
// Option sur la balise <script> : data-pages="on" anime aussi le contenu à chaque changement de page.
(() => {
  const me = document.currentScript;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // ---------- Défilement doux ----------
  if (window.Lenis) {
    const lenis = new window.Lenis({ autoRaf: true, anchors: true });
    window.lenis = lenis;
    // Les éléments qui défilent eux-mêmes (listes horizontales, fenêtres) gardent leur défilement normal.
    document.addEventListener('pointerdown', (e) => {
      const el = e.target.closest && e.target.closest('dialog, .chips, [data-scroll]');
      if (el && !el.hasAttribute('data-lenis-prevent')) el.setAttribute('data-lenis-prevent', '');
    }, { passive: true });
  }

  const gsap = window.gsap;
  if (!gsap) return;

  // ---------- Barre du haut et menu du bas qui arrivent à l'ouverture ----------
  const bars = () => {
    const top = document.querySelector('.topbar');
    const tab = document.querySelector('.tabbar');
    if (top) gsap.from(top, { y: -24, opacity: 0, duration: 0.6, ease: 'power3.out', clearProps: 'transform,opacity' });
    if (tab) gsap.from(tab, { y: 40, opacity: 0, duration: 0.7, delay: 0.1, ease: 'power3.out', clearProps: 'transform,opacity' });
  };

  // ---------- Contenu de chaque page qui apparaît en cascade ----------
  const pages = () => {
    const app = document.getElementById('app');
    if (!app) return;
    let last = null;
    const play = () => {
      const kids = [...app.children].filter((el) => !el.classList.contains('spinner')).slice(0, 12);
      if (!kids.length || kids[0] === last) return;
      last = kids[0];
      gsap.killTweensOf(kids);
      gsap.from(kids, { y: 18, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'transform,opacity' });
    };
    new MutationObserver(play).observe(app, { childList: true });
    play();
  };

  const start = () => { bars(); if (me && me.dataset.pages === 'on') pages(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
