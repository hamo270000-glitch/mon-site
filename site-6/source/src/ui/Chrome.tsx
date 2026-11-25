import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCart } from '../shop/cart';
import { PRODUCT, euros } from '../data/catalog';
import { href, type Route } from '../router';
import { IconBag, IconClose, IconMenu, IconMinus, IconPlus, IconArrow } from './Icons';

// Logo : un croissant de lune (la veillée) et le nom en serif, « Gris » en italique argent.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M21.5 4.5A12 12 0 1 0 27.5 22 9.5 9.5 0 0 1 21.5 4.5Z" fill="var(--color-ambre)" />
        <circle cx="24.5" cy="9" r="1.3" fill="var(--color-argent)" />
      </svg>
      <span className="serif text-[1.45rem] leading-none">Museau <span className="italic font-light text-argent">Gris</span></span>
    </span>
  );
}

const NAV: { route: Route; label: string }[] = [
  { route: 'produit', label: 'Le panier' },
  { route: 'appuis', label: 'Points d’appui' },
  { route: 'tailles', label: 'Guide des tailles' },
];

export function Header({ route }: { route: Route }) {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const badge = useRef<HTMLSpanElement>(null);
  const prev = useRef(count);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setMenu(false); }, [route]);
  useEffect(() => {
    if (count > prev.current && badge.current) gsap.fromTo(badge.current, { scale: 1.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    prev.current = count;
  }, [count]);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-500 ${scrolled || menu ? 'border-creme/10 bg-ciel/95' : 'border-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <a href={href.accueil} aria-label="Museau Gris, accueil" className="rounded text-creme"><Logo /></a>
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a key={n.route} href={href[n.route]} aria-current={route === n.route ? 'page' : undefined}
              className="relative py-2 text-[0.95rem] text-creme/80 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-ambre after:transition-transform after:duration-500 hover:text-creme hover:after:scale-x-100 aria-[current=page]:text-creme aria-[current=page]:after:scale-x-100">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}
            className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full text-creme transition-colors hover:bg-creme/8">
            <IconBag />
            {count > 0 && (
              <span ref={badge} className="chiffres absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-ambre px-1 text-[0.72rem] font-bold text-sur-ambre">{count}</span>
            )}
          </button>
          <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="menu-mobile" aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-creme hover:bg-creme/8 md:hidden">
            {menu ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      <nav id="menu-mobile" aria-label="Navigation" hidden={!menu} className="border-t border-creme/10 px-4 pb-4 md:hidden">
        {[{ route: 'accueil' as Route, label: 'Accueil' }, ...NAV].map((n) => (
          <a key={n.route} href={href[n.route]} aria-current={route === n.route ? 'page' : undefined}
            className="serif flex min-h-14 items-center justify-between border-b border-creme/8 text-2xl text-creme aria-[current=page]:text-ambre-clair">
            {n.label}<IconArrow />
          </a>
        ))}
      </nav>
    </header>
  );
}

export function CartDrawer() {
  const { lines, total, open, setOpen, setQty } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    if (panel.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.6, ease: 'expo.out' });
    return () => { window.removeEventListener('keydown', onKey); prevFocus?.focus?.(); };
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="titre-panier">
      <button type="button" aria-label="Fermer le panier" className="absolute inset-0 cursor-default bg-black/60" onClick={() => setOpen(false)} />
      <div ref={panel} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-encre pb-[env(safe-area-inset-bottom)] shadow-[-20px_0_60px_rgb(0_0_0/0.5)]">
        <div className="flex items-center justify-between border-b border-creme/10 px-5 py-4">
          <h2 id="titre-panier" className="text-3xl">Ton panier</h2>
          <button ref={closeBtn} type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full hover:bg-creme/8"><IconClose /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6">
            <p className="serif text-2xl">Ton panier est vide.</p>
            <p className="text-brume">Commence par trouver la bonne taille pour ton chien.</p>
            <a href={href.tailles} onClick={() => setOpen(false)} className="bouton">Trouver sa taille <IconArrow /></a>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-creme/8 overflow-y-auto px-5" data-lenis-prevent>
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-4 py-5">
                  <span className="h-14 w-14 shrink-0 rounded-xl border border-creme/10" style={{ background: `linear-gradient(160deg, ${l.color.cover}, ${l.color.bolster})` }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{PRODUCT.name} · {l.size.id}</p>
                    <p className="legende">{l.size.outer[0]} × {l.size.outer[1]} cm · {l.color.label}</p>
                    <div className="mt-2 flex items-center gap-1" role="group" aria-label="Quantité">
                      <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Retirer un" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-creme/15 hover:border-ambre/70"><IconMinus /></button>
                      <span className="chiffres w-8 text-center" aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Ajouter un" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-creme/15 hover:border-ambre/70"><IconPlus /></button>
                    </div>
                  </div>
                  <p className="chiffres font-semibold">{euros(l.qty * l.size.price)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-creme/10 px-5 py-5">
              <div className="flex items-baseline justify-between"><span className="text-brume">Total</span><span className="chiffres serif text-3xl">{euros(total)}</span></div>
              <a href={href.panier} onClick={() => setOpen(false)} className="bouton w-full">Voir le panier et commander <IconArrow /></a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-creme/10 bg-ciel/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-brume">Des paniers orthopédiques pour les chiens qui ont blanchi du museau. Pensés pour les nuits de ceux qui se relèvent lentement.</p>
        </div>
        <nav aria-label="Pied de page" className="flex flex-col gap-1">
          <a className="py-1.5 hover:text-ambre-clair" href={href.produit}>{PRODUCT.name}</a>
          <a className="py-1.5 hover:text-ambre-clair" href={href.appuis}>Points d’appui</a>
          <a className="py-1.5 hover:text-ambre-clair" href={href.tailles}>Guide des tailles</a>
          <a className="py-1.5 hover:text-ambre-clair" href={href.panier}>Mon panier</a>
        </nav>
        <div className="legende space-y-2">
          <p>Boutique en préparation : mesures, densités et délais seront confirmés avec l’échantillon du fournisseur.</p>
          <p>Un panier ne soigne pas l’arthrose. Pour la douleur, parle à ton vétérinaire.</p>
          <p>© {new Date().getFullYear()} Museau Gris · France</p>
        </div>
      </div>
    </footer>
  );
}
