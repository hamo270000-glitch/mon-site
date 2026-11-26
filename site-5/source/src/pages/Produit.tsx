import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PRODUITS, RAYONS, euros, trouve, LIVRAISON_TEXTE } from '../data';
import { lien } from '../router';
import Visuel from '../ui/Visuel';
import Ajouter from '../ui/Ajouter';
import Carte from '../ui/Carte';
import { IconCheck, IconCamion, IconRetour, IconCadenas, IconPlus, IconMoins, IconChevron } from '../ui/Icons';

function Onglet({ titre, children, ouvert = false }: { titre: string; children: ReactNode; ouvert?: boolean }) {
  const [o, setO] = useState(ouvert);
  return (
    <div>
      <h3>
        <button type="button" onClick={() => setO(!o)} aria-expanded={o} className="flex min-h-14 w-full cursor-pointer items-center justify-between py-3 text-left font-semibold">
          {titre}<span className={`transition-transform duration-300 ${o ? 'rotate-180' : ''}`}><IconChevron /></span>
        </button>
      </h3>
      <div className={`grid transition-[grid-template-rows] duration-300 ${o ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden"><div className="pb-4 text-doux">{children}</div></div>
      </div>
    </div>
  );
}

export default function Produit({ id }: { id: string }) {
  const p = trouve(id) ?? PRODUITS[0];
  const rayon = RAYONS.find((r) => r.id === p.rayon)!;
  const [v, setV] = useState(p.variantes.find((x) => x.id === 'M')?.id ?? p.variantes[0].id);
  const [c, setC] = useState(p.coloris[0].id);
  const [qty, setQty] = useState(1);
  const [vue, setVue] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const galerie = useRef<HTMLDivElement>(null);
  const variante = p.variantes.find((x) => x.id === v) ?? p.variantes[0];
  const coloris = p.coloris.find((x) => x.id === c) ?? p.coloris[0];
  const autres = PRODUITS.filter((x) => x.id !== p.id && x.rayon === p.rayon).concat(PRODUITS.filter((x) => x.rayon !== p.rayon)).slice(0, 4);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from('[data-entre]', { y: 22, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 });
  }, { scope: root });

  // Galerie mobile : on suit la photo visible quand on fait glisser.
  useEffect(() => {
    const g = galerie.current;
    if (!g) return;
    const on = () => setVue(Math.round(g.scrollLeft / g.clientWidth));
    g.addEventListener('scroll', on, { passive: true });
    return () => g.removeEventListener('scroll', on);
  }, []);
  const montrer = (n: number) => {
    setVue(n);
    galerie.current?.scrollTo({ left: n * galerie.current.clientWidth, behavior: 'smooth' });
  };

  return (
    <div ref={root} className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <nav aria-label="Fil d’Ariane" className="text-sm text-doux">
        <a href={lien.accueil} className="hover:underline">Accueil</a> / <a href={lien.collection(rayon.id)} className="hover:underline">{rayon.label}</a> / <span aria-current="page">{p.nom}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* Galerie */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="flex gap-3">
            <div className="hidden w-20 shrink-0 flex-col gap-2 lg:flex">
              {p.vues.map((x, n) => (
                <button key={x} type="button" onClick={() => montrer(n)} aria-label={`Voir : ${x}`} aria-current={vue === n ? 'true' : undefined}
                  className={`aspect-square cursor-pointer overflow-hidden rounded-xl ring-2 transition-shadow ${vue === n ? 'ring-foret' : 'ring-transparent hover:ring-ligne'}`}>
                  <Visuel teinte={p.teinte} petit />
                </button>
              ))}
            </div>
            <div className="relative min-w-0 flex-1">
              <div ref={galerie} className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl ring-1 ring-ligne [scrollbar-width:none]" data-lenis-prevent>
                {p.vues.map((x, n) => (
                  <div key={x} ref={n === 0 ? image : undefined} className="aspect-square w-full shrink-0 snap-center">
                    <Visuel teinte={p.teinte} vue={x} nom={p.nom} />
                  </div>
                ))}
              </div>
              {p.badge && <span className="absolute left-3 top-3 rounded-full bg-foret px-2.5 py-1 text-xs font-bold text-creme">{p.badge}</span>}
              <div className="mt-3 flex justify-center gap-1.5 lg:hidden">
                {p.vues.map((x, n) => <button key={x} type="button" onClick={() => montrer(n)} aria-label={`Photo ${n + 1}`} className={`h-2 cursor-pointer rounded-full transition-[width] ${vue === n ? 'w-6 bg-foret' : 'w-2 bg-foret/25'}`} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Infos */}
        <div>
          <h1 data-entre className="text-[clamp(1.8rem,3.4vw,2.6rem)] text-foret">{p.nom}</h1>
          <p data-entre className="mt-1 text-lg text-doux">{p.accroche}</p>
          <p data-entre className="chiffres mt-4 text-3xl font-bold" aria-live="polite">{euros(variante.price)}</p>
          <p data-entre className="text-sm text-doux">TVA incluse · frais de livraison calculés au paiement</p>

          {p.variantes.length > 1 && (
            <fieldset data-entre className="mt-7">
              <legend className="flex w-full justify-between font-semibold">Taille : <span className="font-normal">{variante.label}</span><a href={lien.aide('tailles')} className="ml-auto text-sm font-semibold text-foret underline underline-offset-4">Guide des tailles</a></legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.variantes.map((x) => (
                  <label key={x.id} className={`flex min-h-12 min-w-14 cursor-pointer items-center justify-center rounded-xl px-4 font-semibold ring-1 transition-[box-shadow,background-color] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-abricot ${v === x.id ? 'bg-foret text-creme ring-foret' : 'bg-white ring-ligne hover:ring-encre/40'}`}>
                    <input type="radio" name="taille" className="sr-only" checked={v === x.id} onChange={() => setV(x.id)} />{x.label}
                  </label>
                ))}
              </div>
              {variante.detail && <p className="mt-2 text-sm text-doux">{variante.detail}</p>}
            </fieldset>
          )}
          {p.variantes.length === 1 && <p data-entre className="mt-4 text-doux">{variante.label}</p>}

          <fieldset data-entre className="mt-6">
            <legend className="font-semibold">Coloris : <span className="font-normal">{coloris.label}</span></legend>
            <div className="mt-3 flex gap-3">
              {p.coloris.map((k) => (
                <label key={k.id} className="cursor-pointer rounded-full has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-abricot">
                  <input type="radio" name="coloris" className="sr-only" checked={c === k.id} onChange={() => setC(k.id)} aria-label={k.label} />
                  <span className={`block size-10 rounded-full ring-offset-2 ring-offset-creme transition-shadow ${c === k.id ? 'ring-2 ring-foret' : 'ring-1 ring-encre/15'}`} style={{ background: k.hex }} />
                </label>
              ))}
            </div>
          </fieldset>

          <div data-entre className="mt-7 flex gap-3">
            <div className="flex items-center rounded-full bg-white ring-1 ring-ligne" role="group" aria-label="Quantité">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Retirer un" className="grid size-12 cursor-pointer place-items-center rounded-full hover:bg-creme-2"><IconMoins /></button>
              <span className="chiffres w-8 text-center font-bold" aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty(Math.min(9, qty + 1))} aria-label="Ajouter un" className="grid size-12 cursor-pointer place-items-center rounded-full hover:bg-creme-2"><IconPlus /></button>
            </div>
            <div className="flex-1 [&>button]:min-h-12 [&>button]:w-full"><Ajouter id={p.id} variante={variante.id} coloris={coloris.id} image={image} qty={qty} /></div>
          </div>

          <ul data-entre className="mt-6 space-y-2.5 rounded-2xl bg-white p-5 text-sm ring-1 ring-ligne">
            <li className="flex gap-3"><span className="text-foret"><IconCamion /></span>Livraison suivie en France, délai affiché avant de payer</li>
            <li className="flex gap-3"><span className="text-foret"><IconRetour /></span>14 jours pour changer d’avis</li>
            <li className="flex gap-3"><span className="text-foret"><IconCadenas /></span>Paiement sécurisé</li>
          </ul>

          <ul data-entre className="mt-6 space-y-2">{p.points.map((t) => <li key={t} className="flex gap-3"><span className="mt-0.5 text-foret"><IconCheck /></span>{t}</li>)}</ul>

          <div data-entre className="mt-6 divide-y divide-ligne border-y border-ligne">
            <Onglet titre="Description" ouvert><p>{p.description}</p></Onglet>
            <Onglet titre="Caractéristiques">
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                {p.caracteristiques.map(([k, val]) => <Fragment key={k}><dt className="font-semibold text-encre">{k}</dt><dd>{val}</dd></Fragment>)}
                {variante.detail && <><dt className="font-semibold text-encre">Dimensions</dt><dd>{variante.detail}</dd></>}
              </dl>
            </Onglet>
            <Onglet titre="Entretien"><p>{p.entretien}</p></Onglet>
            <Onglet titre="Livraison et retours"><p>{LIVRAISON_TEXTE}</p></Onglet>
          </div>
        </div>
      </div>

      <section className="mt-20" aria-labelledby="titre-aussi">
        <h2 id="titre-aussi" className="text-[clamp(1.5rem,3vw,2rem)]">Tu aimeras aussi</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">{autres.map((x) => <Carte key={x.id} p={x} />)}</div>
      </section>
    </div>
  );
}
