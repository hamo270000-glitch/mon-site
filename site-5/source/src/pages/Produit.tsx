import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PRODUITS, euros, trouve } from '../data';
import { lien } from '../router';
import Art from '../ui/Art';
import Ajouter from '../ui/Ajouter';
import Carte from '../ui/Carte';
import { IconCheck, IconCamion, IconRetour } from '../ui/Icons';

export default function Produit({ id }: { id: string }) {
  const p = trouve(id) ?? PRODUITS[0];
  const [v, setV] = useState(p.variantes.find((x) => x.id === 'M')?.id ?? p.variantes[0].id);
  const [c, setC] = useState(p.coloris[0].id);
  const root = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const variante = p.variantes.find((x) => x.id === v) ?? p.variantes[0];
  const coloris = p.coloris.find((x) => x.id === c) ?? p.coloris[0];

  useEffect(() => { setV(p.variantes.find((x) => x.id === 'M')?.id ?? p.variantes[0].id); setC(p.coloris[0].id); }, [p]);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from('[data-entre]', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07 });
    gsap.from(image.current, { scale: 0.8, rotation: -6, duration: 1, ease: 'elastic.out(1, 0.6)' });
  }, { scope: root, dependencies: [p.id] });

  // Petit rebond de l'image quand on change de couleur ou de taille.
  useEffect(() => {
    if (!image.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(image.current, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
  }, [v, c]);

  const echelle = p.variantes.length > 1 ? 0.78 + (p.variantes.indexOf(variante) / (p.variantes.length - 1)) * 0.22 : 1;
  const autres = PRODUITS.filter((x) => x.id !== p.id).slice(0, 3);

  return (
    <div ref={root} className="pb-24 pt-24 md:pt-28">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="grain relative grid aspect-square place-items-center overflow-hidden rounded-[2.5rem]" style={{ background: p.fond }}>
            <div ref={image} className="w-[78%]" style={{ transform: `scale(${echelle})`, transition: 'transform .5s cubic-bezier(.32,.72,0,1)' }}>
              <Art art={p.art} a={coloris.a} b={coloris.b} className="w-full" titre={`${p.nom}, coloris ${coloris.label}`} />
            </div>
            <p className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1.5 text-sm font-bold backdrop-blur">Illustration · photos réelles bientôt</p>
          </div>
        </div>

        <div>
          <a data-entre href={lien.boutique(p.rayon)} className="font-bold text-abricot hover:underline">← {p.rayon[0].toUpperCase() + p.rayon.slice(1)}</a>
          <h1 data-entre className="mt-2 text-[clamp(2.4rem,5vw,3.8rem)] text-foret">{p.nom}</h1>
          <p data-entre className="mt-2 text-xl text-doux">{p.accroche}</p>
          <p data-entre className="chiffres mt-5 text-4xl font-extrabold" aria-live="polite">{euros(variante.price)}</p>

          {p.variantes.length > 1 && (
            <fieldset data-entre className="mt-8">
              <legend className="font-bold">Taille</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {p.variantes.map((x) => (
                  <label key={x.id} className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-2xl px-4 py-2 ring-2 transition-[box-shadow,background-color] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-abricot ${v === x.id ? 'bg-white ring-foret' : 'ring-encre/10 hover:ring-encre/30'}`}>
                    <input type="radio" name="taille" className="sr-only" checked={v === x.id} onChange={() => setV(x.id)} />
                    <span className="flex justify-between font-bold"><span>{x.label}</span><span className="chiffres">{euros(x.price)}</span></span>
                    {x.detail && <span className="text-sm text-doux">{x.detail}</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {p.variantes.length === 1 && p.variantes[0].detail && <p data-entre className="mt-4 text-doux">{p.variantes[0].detail}</p>}

          <fieldset data-entre className="mt-8">
            <legend className="font-bold">Coloris · <span className="font-normal text-doux">{coloris.label}</span></legend>
            <div className="mt-3 flex gap-3">
              {p.coloris.map((k) => (
                <label key={k.id} className="cursor-pointer has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-abricot rounded-full">
                  <input type="radio" name="coloris" className="sr-only" checked={c === k.id} onChange={() => setC(k.id)} aria-label={k.label} />
                  <span className={`block size-12 rounded-full ring-offset-2 ring-offset-creme transition-[box-shadow,transform] duration-200 ${c === k.id ? 'scale-110 ring-3 ring-foret' : 'ring-1 ring-encre/15 hover:scale-105'}`} style={{ background: `linear-gradient(140deg, ${k.a} 50%, ${k.b} 50%)` }} />
                </label>
              ))}
            </div>
          </fieldset>

          <div data-entre className="sticky bottom-0 z-10 -mx-4 mt-8 bg-creme/92 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mx-0 md:bg-transparent md:p-0">
            <Ajouter id={p.id} variante={variante.id} coloris={coloris.id} image={image} prix={euros(variante.price)} large />
          </div>

          <ul data-entre className="mt-8 space-y-3">
            {p.points.map((t) => <li key={t} className="flex gap-3"><span className="mt-0.5 text-foret"><IconCheck /></span>{t}</li>)}
          </ul>
          <div data-entre className="mt-8 grid gap-3 sm:grid-cols-2">
            <p className="flex gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-encre/5"><span className="text-foret"><IconCamion /></span>Livraison suivie, délai affiché avant de payer.</p>
            <p className="flex gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-encre/5"><span className="text-foret"><IconRetour /></span>14 jours pour changer d’avis.</p>
          </div>
        </div>
      </div>

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-8" aria-labelledby="titre-aussi">
        <h2 id="titre-aussi" className="text-[clamp(2rem,4vw,3rem)]">Ça va bien avec</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{autres.map((x) => <Carte key={x.id} p={x} />)}</div>
      </section>
    </div>
  );
}
