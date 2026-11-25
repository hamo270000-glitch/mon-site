import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { LAYERS } from './data/catalog';
import type { Route } from './router';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Grammaire de mouvement de Lové : tout « se dépose » comme des strates.
// Une seule courbe (expo.out), des titres qui montent ligne par ligne, des reliefs qui glissent en parallaxe.
gsap.defaults({ ease: 'expo.out', duration: 1 });

/** Animations au défilement de la page affichée. Relancées à chaque changement de page. */
export function useScrollMotion(route: Route) {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const main = document.getElementById('contenu');
      if (!main) return;

      // 1. Titres : chaque ligne sort de sa strate (masque), mot par mot.
      main.querySelectorAll<HTMLElement>('h1, h2').forEach((el) => {
        const inHero = !!el.closest('[data-hero]');
        SplitText.create(el, {
          type: 'lines,words',
          mask: 'lines',
          autoSplit: true,
          aria: 'auto',
          onSplit: (self) => gsap.from(self.words, {
            yPercent: 110,
            duration: 1.1,
            stagger: 0.045,
            delay: inHero ? 0.35 : 0,
            scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 88%', once: true },
          }),
        });
      });

      // 2. Lignes de relief : elles glissent plus lentement que la page (profondeur).
      main.querySelectorAll<HTMLElement>('section').forEach((sec) => {
        const cv = sec.querySelector(':scope > canvas');
        if (!cv) return;
        gsap.fromTo(cv, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      // 3. Listes : les rangées se posent une à une, et leur trait se dessine.
      ScrollTrigger.batch(main.querySelectorAll('[data-rows] > *'), {
        start: 'top 92%',
        once: true,
        onEnter: (els) => gsap.from(els, { y: 36, autoAlpha: 0.001, stagger: 0.08, duration: 1.2, overwrite: true }),
      });

      // 4. Accueil : en quittant le haut de page, le panier s'élève et le texte s'efface doucement.
      const hero = main.querySelector('[data-hero]');
      if (hero) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } });
        tl.to('[data-hero-bed]', { yPercent: -14, scale: 1.06, ease: 'none' }, 0)
          .to('[data-hero-copy]', { yPercent: 18, autoAlpha: 0.15, ease: 'none' }, 0);
      }

      // 5. Grand titre de fin : il se resserre en arrivant, comme une couche qu'on tasse.
      main.querySelectorAll<HTMLElement>('[data-squeeze]').forEach((el) => {
        gsap.fromTo(el, { letterSpacing: '0.04em' }, { letterSpacing: '-0.035em', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: true } });
      });
    });

    // Les sections épinglées sont créées par les pages (avant ce hook) : on remet tout dans l'ordre de la page.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    // Les polices changent la hauteur des lignes : on recalcule une fois chargées.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, { dependencies: [route], revertOnUpdate: true });
}

/** Transition entre les pages : les quatre couches du panier balaient l'écran, de la semelle à la housse. */
export function StrataTransition({ route }: { route: Route }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const bands = root.querySelectorAll('span');
    if (first.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      first.current = false;
      gsap.set(bands, { yPercent: 100 });
      return;
    }
    const tl = gsap.timeline();
    tl.set(root, { autoAlpha: 1 })
      .set(bands, { yPercent: 0 })
      .to(bands, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', stagger: { each: 0.07, from: 'end' } })
      .set(root, { autoAlpha: 0 });
    return () => { tl.kill(); };
  }, [route]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-[70] flex flex-col">
      {[...LAYERS].map((l) => (
        <span key={l.name} className="block flex-1" style={{ background: l.tone }} />
      ))}
      <span className="block flex-[2] bg-basalte" />
    </div>
  );
}
