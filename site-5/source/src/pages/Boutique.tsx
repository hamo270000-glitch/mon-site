import { useRef } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PRODUITS, RAYONS } from '../data';
import { lien } from '../router';
import Carte from '../ui/Carte';

export default function Boutique({ rayon }: { rayon?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const actif = RAYONS.find((r) => r.id === rayon);
  const liste = actif ? PRODUITS.filter((p) => p.rayon === actif.id) : PRODUITS;

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from('[data-tete] > *', { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07 });
  }, { scope: root });

  return (
    <div ref={root} className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-8 md:pt-32">
      <div data-tete>
        <p className="font-bold text-abricot">La boutique</p>
        <h1 className="mt-2 text-[clamp(2.6rem,7vw,5rem)] text-foret">{actif ? actif.label : 'Tout pour ton chien'}</h1>
        <p className="mt-3 max-w-lg text-lg text-doux">{actif ? actif.phrase : 'Peu de produits, mais choisis pour durer.'}</p>
      </div>
      <LayoutGroup>
        <nav aria-label="Rayons" className="mt-8 flex flex-wrap gap-2">
          {[{ id: undefined, label: 'Tout' }, ...RAYONS.map((r) => ({ id: r.id as string | undefined, label: r.label }))].map((r) => {
            const on = r.id === actif?.id;
            return (
              <a key={r.label} href={lien.boutique(r.id)} aria-current={on ? 'page' : undefined} className="relative min-h-11 rounded-full px-5 py-2.5 font-bold ring-1 ring-encre/10">
                {on && <motion.span layoutId="puce" className="absolute inset-0 rounded-full bg-foret" transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }} />}
                <span className={`relative ${on ? 'text-creme' : 'text-encre'}`}>{r.label}</span>
              </a>
            );
          })}
        </nav>
        <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {liste.map((p, i) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.55, delay: i * 0.05 }}>
                <Carte p={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
