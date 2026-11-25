import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import type { Route } from './router';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Grammaire de mouvement de Museau Gris : lent et doux, comme un vieux chien qui va se coucher.
// Une seule courbe (power3.out), des durées longues, rien qui sautille.
gsap.defaults({ ease: 'power3.out', duration: 1.2 });


/** Animations au défilement de la page affichée. Relancées à chaque changement de page. */
export function useScrollMotion(route: Route) {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    // 0. Du crépuscule à la nuit : le calque « nuit » et les étoiles apparaissent (opacité seulement, très léger).
    gsap.set('#ciel-nuit', { opacity: 0 });
    gsap.set('#ciel-etoiles', { opacity: 0.15 });
    mm.add('(prefers-reduced-motion: reduce)', () => { gsap.set('#ciel-nuit', { opacity: 0.6 }); gsap.set('#ciel-etoiles', { opacity: 0.6 }); });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const main = document.getElementById('contenu');
      if (!main) return;

      const nuit = gsap.timeline({ scrollTrigger: { trigger: main, start: 'top top', end: 'bottom bottom', scrub: 1.2 } });
      nuit.to('#ciel-nuit', { opacity: 1, ease: 'none' }, 0).to('#ciel-etoiles', { opacity: 1, ease: 'none' }, 0);

      // 1. Titres : chaque ligne se lève doucement de derrière un masque, mot par mot.
      main.querySelectorAll<HTMLElement>('h1, h2:not(.sr-only)').forEach((el) => {
        const inHero = !!el.closest('[data-hero]');
        SplitText.create(el, {
          type: 'lines,words',
          mask: 'lines',
          autoSplit: true,
          aria: 'auto',
          onSplit: (self) => gsap.from(self.words, {
            yPercent: 105,
            duration: 1.4,
            stagger: 0.06,
            delay: inHero ? 0.5 : 0,
            scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 88%', once: true },
          }),
        });
      });

      // 2. Listes : les rangées se posent une à une.
      ScrollTrigger.batch(main.querySelectorAll('[data-rows] > *'), {
        start: 'top 92%',
        once: true,
        onEnter: (els) => gsap.from(els, { y: 28, autoAlpha: 0.001, stagger: 0.1, duration: 1.4, overwrite: true }),
      });

      // 3. Accueil : en quittant le haut de page, la scène s'éloigne et le texte s'estompe.
      const hero = main.querySelector('[data-hero]');
      if (hero) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 } });
        tl.to('[data-hero-bed]', { yPercent: -10, scale: 0.94, ease: 'none' }, 0)
          .to('[data-hero-copy]', { yPercent: 16, autoAlpha: 0.1, ease: 'none' }, 0);
      }
    });

    // Les sections épinglées sont créées par les pages (avant ce hook) : on remet tout dans l'ordre.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, { dependencies: [route], revertOnUpdate: true });
}

/** Transition entre les pages : quatre bandes de ciel descendent comme un store, de plus en plus sombres. */
export function NightfallTransition({ route }: { route: Route }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const bands = root.querySelectorAll('span');
    if (first.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      first.current = false;
      gsap.set(root, { autoAlpha: 0 });
      return;
    }
    const tl = gsap.timeline();
    tl.set(root, { autoAlpha: 1 })
      .set(bands, { scaleY: 1, transformOrigin: 'bottom' })
      .to(bands, { scaleY: 0, duration: 1, ease: 'power3.inOut', stagger: { each: 0.08, from: 'start' } })
      .set(root, { autoAlpha: 0 });
    return () => { tl.kill(); };
  }, [route]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-[70] grid grid-cols-4">
      {['#2a3f48', '#1f323a', '#16262d', '#0d171b'].map((c) => (
        <span key={c} className="block h-full" style={{ background: c }} />
      ))}
    </div>
  );
}
