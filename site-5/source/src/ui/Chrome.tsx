import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCart } from '../cart';
import { euros, RAYONS } from '../data';
import { lien, type Route } from '../router';
import Visuel from './Visuel';
import { IconSac, IconFermer, IconMenu, IconPlus, IconMoins, IconFleche, IconPatte, IconLoupe, IconCamion, IconRetour, IconCadenas } from './Icons';

export function Logo({ clair = false }: { clair?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-[family-name:var(--font-titre)] text-[1.55rem] font-bold tracking-[-0.04em] ${clair ? 'text-creme' : 'text-foret'}`}>
      <span className={`grid size-8 place-items-center rounded-lg ${clair ? 'bg-creme text-foret' : 'bg-foret text-creme'}`}><IconPatte /></span>
      truffe
    </span>
  );
}

const MESSAGES = [
  { icone: <IconCamion />, texte: 'Livraison suivie partout en France' },
  { icone: <IconRetour />, texte: '14 jours pour changer d’avis' },
  { icone: <IconCadenas />, texte: 'Paiement sécurisé' },
];

// Bandeau d'infos en haut : les messages défilent un par un.
function Bandeau() {
  const [i, setI] = useState(0);
  const el = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => {
      if (!el.current) return;
      gsap.to(el.current, { yPercent: -100, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => {
        setI((n) => (n + 1) % MESSAGES.length);
        gsap.fromTo(el.current, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
      } });
    }, 3800);
    return () => window.clearInterval(t);
  }, []);
  const m = MESSAGES[i];
  return (
    <div className="bg-foret text-creme">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center overflow-hidden px-4 text-sm font-semibold md:justify-between">
        <p ref={el} className="flex items-center gap-2 md:hidden" aria-live="off">{m.icone}{m.texte}</p>
        {MESSAGES.map((x) => <p key={x.texte} className="hidden items-center gap-2 md:flex">{x.icone}{x.texte}</p>)}
      </div>
    </div>
  );
}

function Recherche({ auto = false, onDone }: { auto?: boolean; onDone?: () => void }) {
  const [q, setQ] = useState('');
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) { window.location.hash = lien.recherche(q.trim()); onDone?.(); } }} className="relative w-full">
      <label htmlFor={auto ? 'recherche-mobile' : 'recherche'} className="sr-only">Rechercher un produit</label>
      <input id={auto ? 'recherche-mobile' : 'recherche'} type="search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus={auto} placeholder="Panier, gamelle, harnais…"
        className="h-11 w-full rounded-full bg-white pl-11 pr-4 text-[1rem] ring-1 ring-ligne placeholder:text-doux/80 focus:outline-none focus:ring-2 focus:ring-foret" />
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-doux"><IconLoupe /></span>
    </form>
  );
}

export function Header({ route }: { route: Route }) {
  const { count, setOpen, cible, secousse } = useCart();
  const [menu, setMenu] = useState(false);
  const [chercher, setChercher] = useState(false);
  const [ombre, setOmbre] = useState(false);
  const badge = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const on = () => setOmbre(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setMenu(false); setChercher(false); }, [route]);
  useEffect(() => {
    if (!secousse || !cible.current) return;
    gsap.fromTo(cible.current, { scale: 1.15 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1.1, 0.4)' });
    if (badge.current) gsap.fromTo(badge.current, { scale: 1.7 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  }, [secousse, cible]);

  const rayonActif = route.page === 'collection' ? route.rayon : undefined;

  return (
    <header className={`sticky top-0 z-40 bg-creme/95 backdrop-blur-md transition-shadow duration-300 ${ombre ? 'shadow-[0_6px_24px_-12px_rgb(29_38_33/0.3)]' : ''}`}>
      <Bandeau />
      <div className="border-b border-ligne">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <button type="button" onClick={() => setMenu(true)} aria-label="Ouvrir le menu" aria-expanded={menu} aria-controls="menu-mobile" className="-ml-2 grid size-11 cursor-pointer place-items-center rounded-full lg:hidden"><IconMenu /></button>
          <a href={lien.accueil} aria-label="Truffe, accueil" className="rounded-lg"><Logo /></a>
          <nav aria-label="Rayons" className="ml-6 hidden items-center gap-1 lg:flex">
            {RAYONS.map((r) => (
              <a key={r.id} href={lien.collection(r.id)} aria-current={rayonActif === r.id ? 'page' : undefined}
                className={`relative rounded-full px-3.5 py-2 font-semibold transition-colors hover:text-foret after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-abricot after:transition-transform hover:after:scale-x-100 ${rayonActif === r.id ? 'text-foret after:scale-x-100' : ''}`}>{r.label}</a>
            ))}
            <a href={lien.collection()} className="rounded-full px-3.5 py-2 font-semibold hover:text-foret">Tout voir</a>
          </nav>
          <div className="ml-auto hidden w-72 md:block"><Recherche /></div>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button type="button" onClick={() => setChercher((c) => !c)} aria-label="Rechercher" aria-expanded={chercher} className="grid size-11 cursor-pointer place-items-center rounded-full md:hidden"><IconLoupe /></button>
            <button ref={cible} type="button" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}
              className="relative grid size-11 cursor-pointer place-items-center rounded-full hover:bg-creme-2">
              <IconSac />
              {count > 0 && <span ref={badge} className="chiffres absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-abricot px-1 text-xs font-extrabold text-sur-abricot">{count}</span>}
            </button>
          </div>
        </div>
        {chercher && <div className="px-4 pb-3 md:hidden"><Recherche auto onDone={() => setChercher(false)} /></div>}
      </div>
      {menu && <MenuMobile fermer={() => setMenu(false)} />}
    </header>
  );
}

function MenuMobile({ fermer }: { fermer: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panel.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(panel.current, { xPercent: -100 }, { xPercent: 0, duration: 0.45, ease: 'expo.out' });
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') fermer(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [fermer]);
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" aria-label="Fermer le menu" className="absolute inset-0 bg-encre/40" onClick={fermer} />
      <div ref={panel} id="menu-mobile" className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-creme">
        <div className="flex h-16 items-center justify-between border-b border-ligne px-4"><Logo /><button type="button" onClick={fermer} aria-label="Fermer" className="grid size-11 cursor-pointer place-items-center rounded-full"><IconFermer /></button></div>
        <nav className="flex-1 overflow-y-auto p-2" aria-label="Rayons">
          {RAYONS.map((r) => (
            <a key={r.id} href={lien.collection(r.id)} onClick={fermer} className="flex min-h-14 items-center gap-3 rounded-xl px-3 hover:bg-creme-2">
              <span className="size-10 shrink-0 overflow-hidden rounded-lg"><Visuel teinte={r.teinte} petit /></span>
              <span className="flex-1"><span className="block font-semibold">{r.label}</span><span className="text-sm text-doux">{r.phrase}</span></span>
            </a>
          ))}
          <a href={lien.collection()} onClick={fermer} className="mt-2 flex min-h-12 items-center justify-between rounded-xl px-3 font-semibold hover:bg-creme-2">Toute la boutique <IconFleche /></a>
          <a href={lien.aide()} onClick={fermer} className="flex min-h-12 items-center justify-between rounded-xl px-3 font-semibold hover:bg-creme-2">Aide et livraison <IconFleche /></a>
        </nav>
      </div>
    </div>
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
    if (panel.current) gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.45, ease: 'expo.out' });
    return () => { window.removeEventListener('keydown', onKey); avant?.focus?.(); };
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="titre-tiroir">
      <button type="button" aria-label="Fermer le panier" className="absolute inset-0 cursor-default bg-encre/40" onClick={() => setOpen(false)} />
      <div ref={panel} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-creme pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-ligne px-5 py-4">
          <h2 id="titre-tiroir" className="text-xl">Ton panier {lignes.length > 0 && <span className="chiffres font-normal text-doux">({lignes.reduce((n, l) => n + l.qty, 0)})</span>}</h2>
          <button ref={fermer} type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-creme-2"><IconFermer /></button>
        </div>
        {lignes.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6">
            <p className="text-lg font-semibold">Ton panier est vide.</p>
            <a href={lien.collection()} onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foret px-6 font-bold text-creme">Voir la boutique <IconFleche /></a>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ligne overflow-y-auto px-5" data-lenis-prevent>
              {lignes.map((l) => (
                <li key={l.key} className="flex gap-4 py-4">
                  <span className="size-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-ligne"><Visuel teinte={l.produit.teinte} petit /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug">{l.produit.nom}</p>
                    <p className="text-sm text-doux">{l.variante.label} · {l.coloris.label}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full ring-1 ring-ligne" role="group" aria-label={`Quantité de ${l.produit.nom}`}>
                        <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Retirer un" className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-creme-2"><IconMoins /></button>
                        <span className="chiffres w-7 text-center font-bold" aria-live="polite">{l.qty}</span>
                        <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Ajouter un" className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-creme-2"><IconPlus /></button>
                      </div>
                      <p className="chiffres font-bold">{euros(l.qty * l.variante.price)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-ligne px-5 py-5">
              <div className="flex items-baseline justify-between"><span className="font-semibold">Sous-total</span><span className="chiffres text-xl font-bold">{euros(total)}</span></div>
              <p className="text-sm text-doux">Livraison calculée à l’étape suivante.</p>
              <a href={lien.panier} onClick={() => setOpen(false)} className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-foret px-6 font-bold text-creme hover:bg-foret-2">Voir le panier <IconFleche /></a>
              <button type="button" onClick={() => setOpen(false)} className="w-full cursor-pointer py-2 text-sm font-semibold text-doux underline underline-offset-4">Continuer mes achats</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Footer() {
  const cols = [
    { titre: 'Boutique', liens: [...RAYONS.map((r) => ({ href: lien.collection(r.id), label: r.label })), { href: lien.collection(), label: 'Tout voir' }] },
    { titre: 'Aide', liens: [{ href: lien.aide('livraison'), label: 'Livraison' }, { href: lien.aide('retours'), label: 'Retours et remboursements' }, { href: lien.aide('tailles'), label: 'Guide des tailles' }, { href: lien.aide('contact'), label: 'Nous contacter' }] },
    { titre: 'Informations', liens: [{ href: lien.aide('cgv'), label: 'Conditions générales de vente' }, { href: lien.aide('mentions'), label: 'Mentions légales' }, { href: lien.aide('confidentialite'), label: 'Confidentialité' }] },
  ];
  return (
    <footer className="mt-20 bg-foret text-creme">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo clair />
          <p className="max-w-xs text-creme/75">Des produits choisis pour le confort de ton chien : mieux dormir, mieux manger, mieux se balader.</p>
        </div>
        {cols.map((c) => (
          <nav key={c.titre} aria-label={c.titre}>
            <p className="font-semibold">{c.titre}</p>
            <ul className="mt-3 space-y-2 text-creme/75">{c.liens.map((l) => <li key={l.href}><a href={l.href} className="hover:text-creme hover:underline">{l.label}</a></li>)}</ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-creme/15">
        <p className="mx-auto max-w-7xl px-4 py-5 text-sm text-creme/60 sm:px-6">© {new Date().getFullYear()} Truffe · Boutique en préparation : prix et délais confirmés avant l’ouverture des commandes.</p>
      </div>
    </footer>
  );
}
