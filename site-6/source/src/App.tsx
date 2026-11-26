import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmoothScroll from './SmoothScroll';
import Film from './Film';
import { CartProvider, useCart } from './cart';
import { LAYERS, SIZES, euros, sizeFor, type SizeId } from './data';
import { IconArrow, IconBag, IconClose, IconMinus, IconPlus } from './ui/Icons';

gsap.registerPlugin(ScrollTrigger);

const PHOTO = './film/large/062.jpg';

function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true"><path d="M9 11h14l-2.6 8H11.6z" fill="var(--color-ambre)" /><path d="M16 19v6M11.5 25h9" stroke="var(--color-ambre)" strokeWidth="1.8" strokeLinecap="round" /></svg>
      <span className="serif text-[1.4rem] leading-none">Veilleuse</span>
    </span>
  );
}

function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-10">
        <a href="#haut" className="rounded text-lin" aria-label="Veilleuse, haut de page"><Logo /></a>
        <div className="flex items-center gap-2">
          <a href="#panier" className="bouton bouton-ambre hidden min-h-10 px-5 text-[0.95rem] sm:inline-flex">Choisir ma taille</a>
          <button type="button" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}
            className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-nuit/70 text-lin ring-1 ring-white/15">
            <IconBag />
            {count > 0 && <span className="chiffres absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ambre px-1 text-[0.72rem] font-bold text-encre">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function Product() {
  const [size, setSize] = useState<SizeId>('M');
  const [added, setAdded] = useState(false);
  const { add, setOpen } = useCart();
  const s = SIZES.find((x) => x.id === size)!;
  useEffect(() => setAdded(false), [size]);
  return (
    <section id="panier" aria-labelledby="titre-produit" className="bg-lin text-encre">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-28">
        <figure className="m-0 overflow-hidden rounded-[1.25rem] bg-nuit">
          <img src={PHOTO} alt="Le panier Veilleuse dans une chambre la nuit, près d’une lampe de chevet : housse grise, traversin sur trois côtés, couches de mousse visibles." className="aspect-[4/3] h-full w-full object-cover" loading="lazy" width={1280} height={720} />
        </figure>
        <div>
          <p className="surtitre text-gris">Le matin, il se relève plus facilement</p>
          <h2 id="titre-produit" className="mt-3 text-[clamp(2.4rem,5vw,4rem)]">Le panier <em>Veilleuse</em></h2>
          <p className="chiffres serif mt-3 text-4xl" aria-live="polite">{euros(s.price)}</p>
          <p className="mt-4 max-w-md text-lg text-gris">Mousse à mémoire de forme sur mousse de soutien, entrée basse pour ne pas enjamber, traversin pour poser le menton.</p>
          <fieldset className="mt-8">
            <legend className="font-semibold">Taille</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SIZES.map((x) => (
                <label key={x.id} className={`flex min-h-[5rem] cursor-pointer flex-col justify-between rounded-xl border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-encre ${size === x.id ? 'border-encre bg-white' : 'border-encre/15 hover:border-encre/40'}`}>
                  <input type="radio" name="taille" value={x.id} checked={size === x.id} onChange={() => setSize(x.id)} className="sr-only" />
                  <span className="flex items-baseline justify-between"><span className="serif text-2xl italic">{x.id}</span><span className="chiffres">{euros(x.price)}</span></span>
                  <span className="chiffres text-[0.85rem] text-gris">{x.outer[0]} × {x.outer[1]} cm · ≤ {x.maxWeight} kg</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-[0.9rem] text-gris">Exemples : {s.example}. <a href="#tailles" className="underline">Quelle taille choisir ?</a></p>
          </fieldset>
          <button type="button" onClick={() => { add(size); setAdded(true); setTimeout(() => setOpen(true), 350); }} className="bouton bouton-encre mt-7 w-full text-lg">
            {added ? 'Ajouté, on ouvre ton panier' : <>Ajouter au panier · <span className="chiffres">{euros(s.price)}</span></>}
          </button>
          <ul className="mt-6 grid gap-2 text-[0.95rem] text-gris sm:grid-cols-2">
            <li>✓ Housse lavable en machine</li>
            <li>✓ Fond antidérapant</li>
            <li>✓ Quatre tailles, du teckel au bouvier</li>
            <li>✓ Mesures confirmées avant l’ouverture</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section aria-labelledby="titre-pourquoi" className="bg-lin-2 text-encre">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-10 md:py-28">
        <h2 id="titre-pourquoi" className="max-w-[18ch] text-[clamp(2.1rem,4.6vw,3.6rem)]">Pourquoi un panier <em>orthopédique</em> pour un chien âgé ?</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            ['Le poids est réparti', 'Couché sur le flanc, un chien appuie sur l’épaule, le coude, la hanche et le genou. La mémoire de forme se creuse sous ces points au lieu de les repousser.'],
            ['Il ne touche plus le sol', 'Un coussin classique s’écrase sous les grands chiens. La mousse de soutien garde l’épaisseur : plus de contact avec le carrelage froid.'],
            ['Il entre sans effort', 'L’avant est bas et ouvert. Un chien raide des hanches n’a pas à enjamber de rebord pour se coucher ou se relever.'],
          ].map(([t, d], i) => (
            <div key={t} className="border-t border-encre/15 pt-5">
              <p className="serif text-3xl italic text-ambre-fonce">{['i', 'ii', 'iii'][i]}.</p>
              <p className="mt-2 text-xl font-semibold">{t}</p>
              <p className="mt-2 text-gris">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-[0.92rem] text-gris">Un panier ne soigne pas l’arthrose : il rend le repos plus confortable. Si ton chien a mal, parles-en à ton vétérinaire.</p>
      </div>
    </section>
  );
}

function Sizes() {
  const [len, setLen] = useState(70);
  const [kg, setKg] = useState(22);
  const best = sizeFor(len, kg);
  const a = useId(), b = useId();
  return (
    <section id="tailles" aria-labelledby="titre-tailles" className="bg-lin text-encre">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-10 md:grid-cols-2 md:py-28">
        <div>
          <h2 id="titre-tailles" className="text-[clamp(2.1rem,4.6vw,3.6rem)]">La bonne taille, <em>en vingt secondes.</em></h2>
          <p className="mt-4 max-w-md text-lg text-gris">Mesure-le couché, de la truffe à la base de la queue. Entre deux tailles, prends la plus grande : un chien raide aime s’étirer.</p>
        </div>
        <div>
          <div className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between"><label htmlFor={a} className="font-semibold">Longueur du chien</label><output htmlFor={a} className="chiffres serif text-3xl">{len} cm</output></div>
              <input id={a} type="range" min={25} max={120} value={len} onChange={(e) => setLen(+e.target.value)} />
            </div>
            <div>
              <div className="flex items-baseline justify-between"><label htmlFor={b} className="font-semibold">Poids</label><output htmlFor={b} className="chiffres serif text-3xl">{kg} kg</output></div>
              <input id={b} type="range" min={2} max={75} value={kg} onChange={(e) => setKg(+e.target.value)} />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5" aria-live="polite">
            <span className="serif text-6xl italic">{best.id}</span>
            <span><span className="block font-semibold">Taille {best.label.toLowerCase()}</span><span className="chiffres block text-gris">{best.outer[0]} × {best.outer[1]} cm · {euros(best.price)}</span></span>
            <a href="#panier" className="bouton bouton-encre ml-auto">Choisir le {best.id} <IconArrow /></a>
          </div>
          {kg > 65 && <p className="mt-3 text-[0.9rem] text-gris">Au-delà de 65 kg, écris-nous avant de commander.</p>}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section aria-labelledby="titre-faq" className="bg-lin-2 text-encre">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-10 md:py-28">
        <h2 id="titre-faq" className="text-[clamp(2rem,4vw,3rem)]">Questions <em>fréquentes</em></h2>
        <div className="mt-8 divide-y divide-encre/10 border-y border-encre/10">
          {[
            ['Qu’y a-t-il dans le panier ?', LAYERS.map((l) => `${l.name} (${l.detail.toLowerCase()})`).join(', ') + '. Épaisseurs provisoires, confirmées avec l’échantillon du fournisseur.'],
            ['Comment le laver ?', 'La housse s’enlève avec sa fermeture éclair et passe en machine à 30 °C. La mousse ne se lave pas : aère-la de temps en temps.'],
            ['Quand sera-t-il livré ?', 'La boutique est en préparation. Les délais de livraison en France et les conditions de retour seront affichés avant l’ouverture des commandes.'],
            ['Pourquoi pas de photos de vrais clients ?', 'La boutique ouvre à peine : pas encore d’avis. Nous n’en inventerons pas. Les images du film sont des images 3D du panier.'],
          ].map(([q, r]) => (
            <details key={q} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">{q}<span className="shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="mt-2 text-gris">{r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CartDrawer() {
  const { lines, total, open, setOpen, setQty } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    if (panel.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'expo.out' });
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open, setOpen]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="titre-tiroir">
      <button type="button" aria-label="Fermer le panier" className="absolute inset-0 cursor-default bg-black/55" onClick={() => setOpen(false)} />
      <div ref={panel} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-lin pb-[env(safe-area-inset-bottom)] text-encre shadow-2xl">
        <div className="flex items-center justify-between border-b border-encre/10 px-5 py-4">
          <h2 id="titre-tiroir" className="text-3xl">Ton panier</h2>
          <button ref={close} type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full hover:bg-encre/5"><IconClose /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6">
            <p className="serif text-2xl">Il est vide pour l’instant.</p>
            <a href="#panier" onClick={() => setOpen(false)} className="bouton bouton-encre">Choisir ma taille <IconArrow /></a>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-encre/10 overflow-y-auto px-5" data-lenis-prevent>
              {lines.map((l) => (
                <li key={l.size.id} className="flex items-center gap-4 py-5">
                  <img src={PHOTO} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Panier Veilleuse · {l.size.id}</p>
                    <p className="chiffres text-[0.9rem] text-gris">{l.size.outer[0]} × {l.size.outer[1]} cm</p>
                    <div className="mt-2 flex items-center gap-1" role="group" aria-label="Quantité">
                      <button type="button" onClick={() => setQty(l.size.id, l.qty - 1)} aria-label="Retirer un" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-encre/20"><IconMinus /></button>
                      <span className="chiffres w-8 text-center" aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.size.id, l.qty + 1)} aria-label="Ajouter un" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-encre/20"><IconPlus /></button>
                    </div>
                  </div>
                  <p className="chiffres font-semibold">{euros(l.qty * l.size.price)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-encre/10 px-5 py-5">
              <div className="flex items-baseline justify-between"><span className="text-gris">Total</span><span className="chiffres serif text-3xl">{euros(total)}</span></div>
              <button type="button" disabled className="flex min-h-13 w-full cursor-not-allowed items-center justify-center rounded-full bg-encre/30 px-6 font-semibold text-lin">Paiement bientôt disponible</button>
              <p className="text-[0.85rem] text-gris">La boutique ouvre bientôt. Ton panier reste enregistré sur cet appareil.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-nuit text-brume">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:px-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3 text-lin"><Logo /><p className="max-w-sm text-brume">Le panier orthopédique pour les chiens qui vieillissent. Pensé pour la France.</p></div>
        <div className="space-y-1 text-[0.85rem]">
          <p>Boutique en préparation : mesures et délais confirmés avant l’ouverture.</p>
          <p>Images du film : rendu 3D du panier.</p>
          <p>© {new Date().getFullYear()} Veilleuse</p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  useEffect(() => { document.fonts?.ready.then(() => ScrollTrigger.refresh()); }, []);
  return (
    <CartProvider>
      <SmoothScroll>
        <div id="haut" />
        <Header />
        <main>
          <Film />
          <Product />
          <Why />
          <Sizes />
          <Faq />
        </main>
        <Footer />
        <CartDrawer />
      </SmoothScroll>
    </CartProvider>
  );
}
