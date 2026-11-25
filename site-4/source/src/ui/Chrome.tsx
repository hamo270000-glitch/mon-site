import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCart } from '../shop/cart';
import { euros } from '../data/catalog';
import { href, type Route } from '../router';
import { IconBag, IconClose, IconMenu, IconMinus, IconPlus, IconArrow } from './Icons';

// Logo : trois courbes de niveau, comme un chien lové vu du dessus.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 3.5c7.6 0 12.5 4.9 12.5 11.6 0 7.4-5.6 13.4-13.2 13.4C8 28.5 3.5 23.4 3.5 16.6 3.5 9 8.6 3.5 16 3.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16.2 8.4c4.8 0 7.6 3 7.6 7 0 4.6-3.4 8.1-8 8.1-4.4 0-7.2-3-7.2-7.1 0-4.6 3-8 7.6-8Z" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
        <path d="M15.8 13c2.2 0 3.4 1.4 3.4 3.1 0 2-1.5 3.4-3.5 3.4-1.9 0-3.1-1.3-3.1-3 0-2 1.3-3.5 3.2-3.5Z" fill="var(--color-lichen)" />
      </svg>
      <span className="font-[family-name:var(--font-display)] text-[1.45rem] font-bold tracking-[-0.03em]">Lové</span>
    </span>
  );
}

const NAV: { route: Route; label: string }[] = [
  { route: 'produit', label: 'Le panier' },
  { route: 'couches', label: 'Les couches' },
  { route: 'tailles', label: 'Guide des tailles' },
];

export function Header({ route }: { route: Route }) {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const badge = useRef<HTMLSpanElement>(null);
  const prev = useRef(count);

  useEffect(() => { setMenu(false); }, [route]);
  useEffect(() => {
    if (count > prev.current && badge.current) gsap.fromTo(badge.current, { scale: 1.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    prev.current = count;
  }, [count]);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow,backdrop-filter] duration-300 ${scrolled || menu ? 'bg-basalte/85 shadow-[0_8px_30px_rgb(0_0_0/0.25)] backdrop-blur-md' : ''}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <a href={href.accueil} aria-label="Lové, accueil" className="rounded-lg text-texte">
          <Logo />
        </a>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 rounded-full border border-texte/10 bg-basalte/70 p-1 backdrop-blur-md md:flex">
          {NAV.map((n) => (
            <a key={n.route} href={href[n.route]} aria-current={route === n.route ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-[0.95rem] transition-colors duration-200 ${route === n.route ? 'bg-texte text-basalte' : 'text-texte/85 hover:bg-texte/8 hover:text-texte'}`}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}
            className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-texte/12 bg-basalte/70 text-texte backdrop-blur-md transition-colors hover:border-lichen/60">
            <IconBag />
            {count > 0 && (
              <span ref={badge} className="chiffres absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-lichen px-1 text-[0.72rem] font-bold text-sur-lichen">{count}</span>
            )}
          </button>
          <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="menu-mobile" aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-texte/12 bg-basalte/70 text-texte backdrop-blur-md md:hidden">
            {menu ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      <nav id="menu-mobile" aria-label="Navigation" hidden={!menu} className="mx-4 mb-3 rounded-3xl border border-texte/10 bg-basalte-2/95 p-2 shadow-[0_18px_40px_rgb(0_0_0/0.45)] backdrop-blur-md md:hidden">
        {[{ route: 'accueil' as Route, label: 'Accueil' }, ...NAV].map((n) => (
          <a key={n.route} href={href[n.route]} aria-current={route === n.route ? 'page' : undefined}
            className="flex min-h-12 items-center justify-between rounded-2xl px-4 text-lg text-texte aria-[current=page]:bg-texte/8">
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
    if (panel.current) gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: 'expo.out' });
    return () => { window.removeEventListener('keydown', onKey); prevFocus?.focus?.(); };
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="titre-panier">
      <button type="button" aria-label="Fermer le panier" className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div ref={panel} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-basalte-2 pb-[env(safe-area-inset-bottom)] shadow-[-20px_0_60px_rgb(0_0_0/0.5)]">
        <div className="flex items-center justify-between border-b border-texte/10 px-5 py-4">
          <h2 id="titre-panier" className="text-2xl">Ton panier</h2>
          <button ref={closeBtn} type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full hover:bg-texte/8"><IconClose /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6">
            <p className="text-xl">Ton panier est vide.</p>
            <p className="text-doux">Commence par trouver la bonne taille pour ton chien.</p>
            <a href={href.tailles} onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-lichen px-6 font-semibold text-sur-lichen">Trouver sa taille <IconArrow /></a>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-texte/8 overflow-y-auto px-5" data-lenis-prevent>
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-4 py-5">
                  <span className="h-14 w-14 shrink-0 rounded-2xl border border-texte/10" style={{ background: `linear-gradient(160deg, ${l.color.cover}, ${l.color.bolster})` }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Le panier Lové · {l.size.id}</p>
                    <p className="legende">{l.size.outer[0]} × {l.size.outer[1]} cm · {l.color.label}</p>
                    <div className="mt-2 flex items-center gap-1" role="group" aria-label="Quantité">
                      <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Retirer un" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-texte/15 hover:border-lichen/60"><IconMinus /></button>
                      <span className="chiffres w-8 text-center" aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Ajouter un" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-texte/15 hover:border-lichen/60"><IconPlus /></button>
                    </div>
                  </div>
                  <p className="chiffres font-semibold">{euros(l.qty * l.size.price)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-texte/10 px-5 py-5">
              <div className="flex items-baseline justify-between"><span className="text-doux">Total</span><span className="chiffres text-2xl font-semibold">{euros(total)}</span></div>
              <a href={href.panier} onClick={() => setOpen(false)} className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-lichen px-6 font-semibold text-sur-lichen transition-colors hover:bg-lichen-fonce">Voir le panier et commander <IconArrow /></a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-texte/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-doux">Des paniers orthopédiques pour les chiens qui se relèvent lentement. Pensés en France, pour dormir sans toucher le sol.</p>
        </div>
        <nav aria-label="Pied de page" className="flex flex-col gap-2">
          <a className="py-1 hover:text-lichen" href={href.produit}>Le panier</a>
          <a className="py-1 hover:text-lichen" href={href.couches}>Les couches</a>
          <a className="py-1 hover:text-lichen" href={href.tailles}>Guide des tailles</a>
          <a className="py-1 hover:text-lichen" href={href.panier}>Mon panier</a>
        </nav>
        <div className="legende space-y-2">
          <p>Boutique en préparation : les mesures et les couches seront confirmées avec l’échantillon du fournisseur.</p>
          <p>© {new Date().getFullYear()} Lové</p>
        </div>
      </div>
    </footer>
  );
}
