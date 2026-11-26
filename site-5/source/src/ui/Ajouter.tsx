import { useEffect, useRef, useState, type RefObject } from 'react';
import { animate } from 'motion/react';
import { useCart } from '../cart';
import { IconSac, IconCheck } from './Icons';

/*
 * Deux pièces adaptées de 21st.dev :
 *  - le vol en arc vers le panier vient de « Add to basket » (motiondotdev, exemples officiels Motion) ;
 *  - le bouton qui s'enfonce puis passe au vert vient de « Add to Cart Button » (bidyut10).
 */

function quad(t: number, p0: number, p1: number, p2: number) {
  const r = 1 - t;
  return r * r * p0 + 2 * r * t * p1 + t * t * p2;
}

// Fait voler une copie de l'image du produit jusqu'à l'icône du panier, le long d'une courbe.
export function voler(source: HTMLElement | null, cible: HTMLElement | null) {
  if (!source || !cible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const from = source.getBoundingClientRect();
  const to = cible.getBoundingClientRect();
  const clone = source.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: 'fixed', left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`,
    margin: '0', zIndex: '80', pointerEvents: 'none', transformOrigin: '50% 50%', willChange: 'transform',
  });
  clone.setAttribute('aria-hidden', 'true');
  document.body.appendChild(clone);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const len = Math.hypot(dx, dy) || 1;
  const cx = dx * 0.2 + (-dy / len) * 0.45 * len * -1;
  const cy = dy * 0.2 + (dx / len) * 0.45 * len * -1;
  const fin = Math.min(to.width / from.width, 0.25);
  animate(0, 1, {
    duration: 0.7,
    ease: [0.6, 0.05, 0.85, 0.6],
    onUpdate: (t) => {
      clone.style.transform = `translate(${quad(t, 0, cx, dx)}px, ${quad(t, 0, cy, dy)}px) scale(${1 + (fin - 1) * t}) rotate(${t * 24}deg)`;
      clone.style.opacity = t > 0.92 ? String(1 - (t - 0.92) / 0.08) : '1';
    },
    onComplete: () => clone.remove(),
  });
}

type Phase = 'pret' | 'ajout' | 'ajoute';

export default function Ajouter({ id, variante, coloris, image, prix, large = false, label = 'Ajouter au panier' }: {
  id: string; variante: string; coloris: string; image: RefObject<HTMLElement | null>; prix?: string; large?: boolean; label?: string;
}) {
  const { add, cible } = useCart();
  const [phase, setPhase] = useState<Phase>('pret');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const onClick = () => {
    if (phase !== 'pret') return;
    setPhase('ajout');
    voler(image.current, cible.current);
    timers.current.push(
      window.setTimeout(() => { add(id, variante, coloris); setPhase('ajoute'); }, 650),
      window.setTimeout(() => setPhase('pret'), 2200),
    );
  };

  const fond = phase === 'ajoute'
    ? 'bg-foret text-creme'
    : phase === 'ajout'
      ? 'bg-abricot-2 text-sur-abricot translate-y-[2px] shadow-[inset_0_3px_8px_rgb(0_0_0/0.25)]'
      : 'bg-abricot text-sur-abricot shadow-[0_2px_0_#b8461a,0_10px_24px_-8px_rgb(240_106_40/0.6)] hover:-translate-y-0.5 hover:bg-[#f47a3c] active:translate-y-[2px] active:shadow-[inset_0_3px_8px_rgb(0_0_0/0.25)]';

  return (
    <button type="button" onClick={onClick} aria-disabled={phase !== 'pret' || undefined}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full font-bold transition-[transform,background-color,box-shadow,color] duration-300 ease-[cubic-bezier(.32,.72,0,1)] ${large ? 'min-h-14 w-full px-7 text-lg' : 'min-h-12 px-5'} ${phase === 'pret' ? 'cursor-pointer' : 'cursor-default'} ${fond}`}>
      <span className="sr-only" aria-live="polite">{phase === 'ajoute' ? 'Ajouté au panier' : ''}</span>
      <span className="relative grid size-5 place-items-center" aria-hidden="true">
        <span className={`absolute transition-opacity duration-200 ${phase === 'pret' ? 'opacity-100 delay-150' : 'opacity-0'}`}><IconSac /></span>
        <span className={`absolute size-4 rounded-full border-2 border-current border-t-transparent transition-opacity duration-200 ${phase === 'ajout' ? 'animate-spin opacity-100 delay-150' : 'opacity-0'}`} />
        <span className={`absolute transition-opacity duration-200 ${phase === 'ajoute' ? 'opacity-100 delay-150' : 'opacity-0'}`}><IconCheck /></span>
      </span>
      <span className="grid">
        <span className={`col-start-1 row-start-1 transition-opacity duration-200 ${phase === 'pret' ? 'opacity-100 delay-150' : 'opacity-0'}`}>{label}{prix && <span className="chiffres"> · {prix}</span>}</span>
        <span aria-hidden="true" className={`col-start-1 row-start-1 transition-opacity duration-200 ${phase === 'ajout' ? 'opacity-100 delay-150' : 'opacity-0'}`}>Ça arrive…</span>
        <span aria-hidden="true" className={`col-start-1 row-start-1 transition-opacity duration-200 ${phase === 'ajoute' ? 'opacity-100 delay-150' : 'opacity-0'}`}>Dans le panier !</span>
      </span>
    </button>
  );
}
