import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCart } from '../cart';
import { euros, RAYONS } from '../data';
import { lien, type Route } from '../router';
import Art from './Art';
import { IconSac, IconFermer, IconMenu, IconPlus, IconMoins, IconFleche, IconPatte } from './Icons';

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-[family-name:var(--font-titre)] text-2xl font-extrabold tracking-[-0.04em] text-foret">
      <span className="grid size-9 place-items-center rounded-xl bg-foret text-creme"><IconPatte /></span>
      truffe
    </span>
  );
}

export function Header({ route }: { route: Route }) {
  const { count, setOpen, cible, secousse } = useCart();
  const [menu, setMenu] = useState(false);
  const [haut, setHaut] = useState(true);
  const badge = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const on = () => setHaut(window.scrollY < 20);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setMenu(false); }, [route]);
  useEffect(() => {
    if (!secousse || !cible.current) return;
    gsap.fromTo(cible.current, { rotation: -14, scale: 1.18 }, { rotation: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1.1, 0.35)' });
    if (badge.current) gsap.fromTo(badge.current, { scale: 1.8 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
  }, [secousse, cible]);

  const nav = [
    { href: lien.boutique(), label: 'Boutique', actif: route.page === 'boutique' && !('rayon' in route && route.rayon) },
    ...RAYONS.slice(0, 3).map((r) => ({ href: lien.boutique(r.id), label: r.label, actif: route.page === 'boutique' && route.rayon === r.id })),
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow] duration-300 ${haut && !menu ? '' : 'bg-creme/90 shadow-[0_8px_30px_-12px_rgb(28_43_34/0.25)] backdrop-blur-md'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <a href={lien.accueil} aria-label="Truffe, accueil" className="rounded-xl"><Logo /></a>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-encre/5 md:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} aria-current={n.actif ? 'page' : undefined}
              className={`rounded-full px-4 py-2 font-semibold transition-colors duration-200 ${n.actif ? 'bg-foret text-creme' : 'text-encre hover:bg-foret/8'}`}>{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button ref={cible} type="button" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}
            className="relative grid size-12 cursor-pointer place-items-center rounded-full bg-foret text-creme shadow-[0_6px_18px_-6px_rgb(19_78_58/0.6)] transition-transform hover:-translate-y-0.5">
            <IconSac />
            {count > 0 && <span ref={badge} className="chiffres absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-abricot px-1 text-sm font-extrabold text-sur-abricot ring-2 ring-creme">{count}</span>}
          </button>
          <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="menu-mobile" aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="grid size-12 cursor-pointer place-items-center rounded-full bg-white text-encre shadow-sm ring-1 ring-encre/10 md:hidden">{menu ? <IconFermer /> : <IconMenu />}</button>
        </div>
      </div>
      <nav id="menu-mobile" aria-label="Navigation" hidden={!menu} className="mx-4 mb-3 rounded-3xl bg-white p-2 shadow-xl ring-1 ring-encre/5 md:hidden">
        {[{ href: lien.accueil, label: 'Accueil' }, { href: lien.boutique(), label: 'Toute la boutique' }, ...RAYONS.map((r) => ({ href: lien.boutique(r.id), label: r.label }))].map((n) => (
          <a key={n.href} href={n.href} className="flex min-h-12 items-center justify-between rounded-2xl px-4 text-lg font-semibold hover:bg-creme">{n.label}<IconFleche /></a>
        ))}
      </nav>
    </header>
  );
}

export function Tiroir() {
  const { lignes, total, open, setOpen, setQty } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const fermer = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const avant = document.activeElement as HTMLElement | null;
    fermer.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    if (panel.current) gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'expo.out' });
    return () => { window.removeEventListener('keydown', onKey); avant?.focus?.(); };
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="titre-tiroir">
      <button type="button" aria-label="Fermer le panier" className="absolute inset-0 cursor-default bg-encre/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div ref={panel} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-creme pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-encre/10 px-5 py-4">
          <h2 id="titre-tiroir" className="text-2xl">Ton panier</h2>
          <button ref={fermer} type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-encre/5"><IconFermer /></button>
        </div>
        {lignes.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6">
            <p className="text-xl font-semibold">Ton panier est vide.</p>
            <p className="text-doux">Biscuit t’attend dans la boutique.</p>
            <a href={lien.boutique()} onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foret px-6 font-bold text-creme">Voir la boutique <IconFleche /></a>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-encre/8 overflow-y-auto px-5" data-lenis-prevent>
              {lignes.map((l) => (
                <li key={l.key} className="flex items-center gap-4 py-4">
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl" style={{ background: l.produit.fond }}><Art art={l.produit.art} a={l.coloris.a} b={l.coloris.b} className="w-14" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{l.produit.nom}</p>
                    <p className="text-sm text-doux">{l.variante.label} · {l.coloris.label}</p>
                    <div className="mt-2 flex items-center gap-1" role="group" aria-label={`Quantité de ${l.produit.nom}`}>
                      <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Retirer un" className="grid size-9 cursor-pointer place-items-center rounded-full ring-1 ring-encre/15 hover:bg-white"><IconMoins /></button>
                      <span className="chiffres w-8 text-center font-bold" aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Ajouter un" className="grid size-9 cursor-pointer place-items-center rounded-full ring-1 ring-encre/15 hover:bg-white"><IconPlus /></button>
                    </div>
                  </div>
                  <p className="chiffres font-bold">{euros(l.qty * l.variante.price)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-encre/10 px-5 py-5">
              <div className="flex items-baseline justify-between"><span className="text-doux">Total</span><span className="chiffres text-2xl font-extrabold">{euros(total)}</span></div>
              <a href={lien.panier} onClick={() => setOpen(false)} className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-foret px-6 font-bold text-creme hover:bg-foret-2">Voir le panier <IconFleche /></a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-foret text-creme">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 font-[family-name:var(--font-titre)] text-2xl font-extrabold tracking-[-0.04em]"><span className="grid size-9 place-items-center rounded-xl bg-creme text-foret"><IconPatte /></span>truffe</span>
          <p className="max-w-sm text-creme/80">Le confort de tous les jours pour ton chien : bien dormir, bien manger, bien se balader.</p>
        </div>
        <nav aria-label="Pied de page" className="flex flex-col gap-2">
          <a className="py-1 hover:text-abricot" href={lien.boutique()}>Toute la boutique</a>
          {RAYONS.map((r) => <a key={r.id} className="py-1 hover:text-abricot" href={lien.boutique(r.id)}>{r.label}</a>)}
        </nav>
        <div className="space-y-2 text-sm text-creme/75">
          <p>Boutique en préparation : les prix, délais de livraison et conditions seront confirmés avant l’ouverture des commandes.</p>
          <p>Droit de rétractation de 14 jours, comme le prévoit la loi.</p>
          <p>© {new Date().getFullYear()} Truffe</p>
        </div>
      </div>
    </footer>
  );
}
