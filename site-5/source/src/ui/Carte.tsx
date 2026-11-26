import { useRef } from 'react';
import { gsap } from 'gsap';
import { euros, prixMin, type Produit } from '../data';
import { lien } from '../router';
import Art from './Art';
import Ajouter from './Ajouter';

// Carte produit : elle se penche vers le doigt ou la souris, et l'ajout fait voler le produit jusqu'au panier.
export default function Carte({ p }: { p: Produit }) {
  const carte = useRef<HTMLElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const c = p.coloris[0];
  const v = p.variantes.find((x) => x.id === 'M') ?? p.variantes[0];

  const penche = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !carte.current) return;
    const r = carte.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(carte.current, { rotationY: x * 8, rotationX: -y * 8, transformPerspective: 800, duration: 0.4, ease: 'power3' });
    gsap.to(image.current, { x: x * 14, y: y * 10, duration: 0.4, ease: 'power3' });
  };
  const repos = () => {
    gsap.to(carte.current, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    gsap.to(image.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  };

  return (
    <article ref={carte} onPointerMove={penche} onPointerLeave={repos} data-carte
      className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_2px_0_rgb(28_43_34/0.06),0_20px_40px_-24px_rgb(28_43_34/0.35)] ring-1 ring-encre/5">
      <a href={lien.produit(p.id)} className="relative block aspect-[5/4] overflow-hidden rounded-[1.6rem] m-2" style={{ background: p.fond }} aria-label={`${p.nom}, voir le produit`}>
        {p.etoile && <span className="absolute left-3 top-3 z-10 rounded-full bg-foret px-3 py-1 text-sm font-bold text-creme">Notre star</span>}
        <div ref={image} className="absolute inset-0 grid place-items-center p-6 transition-transform duration-500 group-hover:scale-105">
          <Art art={p.art} a={c.a} b={c.b} className="w-full max-w-[16rem]" />
        </div>
      </a>
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-2">
        <div>
          <h3 className="text-xl"><a href={lien.produit(p.id)} className="hover:text-foret">{p.nom}</a></h3>
          <p className="text-doux">{p.accroche}</p>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`${p.coloris.length} coloris`}>
          {p.coloris.map((k) => <span key={k.id} className="size-4 rounded-full ring-2 ring-white" style={{ background: k.a, boxShadow: '0 0 0 1px rgb(28 43 34 / .15)' }} title={k.label} />)}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="chiffres text-xl font-extrabold">{p.variantes.length > 1 && <span className="text-base font-semibold text-doux">dès </span>}{euros(prixMin(p))}</p>
          <Ajouter id={p.id} variante={v.id} coloris={c.id} image={image} label="Ajouter" />
        </div>
      </div>
    </article>
  );
}
