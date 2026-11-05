import { useCallback, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SmoothScroll from './SmoothScroll';
import BlurText from './components/reactbits/BlurText';
import Magnet from './components/reactbits/Magnet';
import ScrollReveal from './components/reactbits/ScrollReveal';
import ProductArt from './shop/ProductArt';
import Sheet from './shop/Sheet';
import { CartProvider, useCart } from './shop/cart';
import { CATEGORIES, FREE_SHIPPING, PRODUCTS, euro, type Product } from './data/products';

gsap.registerPlugin(useGSAP);

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;
const tintBg = (tint: string) => ({ background: `color-mix(in srgb, ${tint} 45%, #fbfaf7)` });
const ROUTINE = [
  { id: 'gel-source', step: 'Nettoyer', text: 'Le gel Source retire les impuretés sans assécher.' },
  { id: 'serum-goutte', step: 'Désaltérer', text: 'Trois gouttes de sérum pour une peau rebondie.' },
  { id: 'creme-nuage', step: 'Protéger', text: 'La crème Nuage garde l’eau dans la peau toute la journée.' },
];

// ---------- En-tête ----------
function Header() {
  const { count, setOpen } = useCart();
  const badge = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    if (count && badge.current && !reduceMotion()) gsap.fromTo(badge.current, { scale: 1.6 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  }, { dependencies: [count] });
  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-porcelaine/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a href="#top" className="font-display text-[1.7rem] leading-none tracking-tight">Rosée</a>
        <nav className="flex items-center gap-1 text-[0.95rem]">
          <a href="#soins" className="hidden rounded-full px-3 py-2 sm:block">Soins</a>
          <a href="#routine" className="hidden rounded-full px-3 py-2 sm:block">Routine</a>
          <button onClick={() => setOpen(true)} className="relative ml-1 flex items-center gap-2 rounded-full bg-plum px-4 py-2.5 font-medium text-nacre">
            Panier
            <span ref={badge} className="grid min-w-6 place-items-center rounded-full bg-petale px-1.5 text-sm text-plum" aria-label={`${count} article${count > 1 ? 's' : ''}`}>{count}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

// ---------- Accueil : le flacon et sa goutte ----------
function Hero() {
  const root = useRef<HTMLElement>(null);
  const hero = byId('serum-goutte');
  const { add } = useCart();
  useGSAP(() => {
    if (reduceMotion()) return;
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-sun', { scale: 0.6, opacity: 0, duration: 1.4 })
      .from('.hero-bottle', { y: 80, rotate: -6, opacity: 0, duration: 1.2 }, 0.15)
      .from('.hero-more > *', { y: 16, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.7);
    // La goutte se forme, glisse le long du verre, puis recommence.
    gsap.timeline({ repeat: -1, repeatDelay: 1.6, delay: 1.6 })
      .fromTo('.hero-drop', { scale: 0, y: 0, opacity: 1 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.5)', transformOrigin: '50% 0%' })
      .to('.hero-drop', { y: 100, duration: 1.5, ease: 'power2.in' })
      .to('.hero-drop', { opacity: 0, duration: 0.25 }, '-=0.25');
  }, { scope: root });

  return (
    <section ref={root} id="top" className="relative overflow-hidden pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-2 px-5 pb-14 pt-2 sm:grid-cols-[1.1fr_1fr] sm:pb-24 sm:pt-16">
        <div className="relative z-10 max-w-xl">
          <h1 className="sr-only">Ta peau, comme au petit matin.</h1>
          <div aria-hidden="true">
            <BlurText
              text="Ta peau, comme au petit matin."
              animateBy="words"
              direction="bottom"
              delay={90}
              className="font-display text-[2.9rem] leading-[0.98] tracking-[-0.02em] sm:text-[5.2rem]"
            />
          </div>
          <div className="hero-more">
            <p className="mt-5 max-w-md text-lg leading-relaxed text-plum/75">
              Des soins courts et efficaces, pensés autour de l’eau. Pour une peau désaltérée, souple et lumineuse.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Magnet padding={40} magnetStrength={4}>
                <a href="#soins" className="inline-block rounded-full bg-baie px-7 py-4 font-semibold text-nacre">Voir les soins</a>
              </Magnet>
              <button onClick={() => add(hero.id)} className="rounded-full py-4 font-medium underline decoration-plum/30 underline-offset-4 sm:px-5">
                Ajouter le sérum ({euro(hero.price)})
              </button>
            </div>
          </div>
        </div>
        <div className="relative mx-auto -mt-4 w-[64%] max-w-[420px] sm:mt-0 sm:w-full">
          <div className="hero-sun absolute inset-[6%] rounded-full bg-petale" />
          <div className="hero-bottle relative">
            <ProductArt shape={hero.shape} tint={hero.tint} ink={hero.ink} className="w-full drop-shadow-[0_30px_40px_rgba(46,26,47,0.18)]" label="Flacon du sérum Goutte de rosée" />
            <svg viewBox="0 0 200 240" className="pointer-events-none absolute inset-0" aria-hidden="true">
              <path className="hero-drop" d="M118 96 C118 96 112 104 112 108 A6 6 0 0 0 124 108 C124 104 118 96 118 96 Z" fill="#fff" opacity="0.9" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Ingrédients qui défilent ----------
function Ingredients() {
  const track = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!reduceMotion()) gsap.to(track.current, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
  });
  const words = ['Acide hyaluronique', 'Beurre de karité', 'Eau de rose', 'Niacinamide', 'Argile rose', 'Huile de jojoba', 'Céramides', 'Aloe vera'];
  return (
    <div className="overflow-hidden border-y border-plum/10 bg-nacre py-4" aria-label="Nos ingrédients">
      <div ref={track} className="flex w-max whitespace-nowrap font-display text-xl italic text-plum/70 sm:text-2xl">
        {[...words, ...words].map((w, i) => (
          <span key={i} className="px-6" aria-hidden={i >= words.length}>{w}<span className="pl-12 not-italic text-jade">◦</span></span>
        ))}
      </div>
    </div>
  );
}

// ---------- Carte produit ----------
function ProductCard({ p, onOpen }: { p: Product; onOpen: (p: Product) => void }) {
  const { add } = useCart();
  return (
    <article className="group flex flex-col">
      <button onClick={() => onOpen(p)} className="relative block overflow-hidden rounded-[26px] text-left" style={tintBg(p.tint)} aria-label={`Voir ${p.kind} ${p.name}`}>
        {p.isNew && <span className="absolute left-3 top-3 rounded-full bg-nacre px-2.5 py-1 text-xs font-semibold text-baie">Nouveau</span>}
        <ProductArt shape={p.shape} tint={p.tint} ink={p.ink} className="mx-auto w-[82%] py-3 transition-transform duration-500 group-hover:-translate-y-1.5" />
      </button>
      <div className="mt-3 flex items-start justify-between gap-2 px-1">
        <button onClick={() => onOpen(p)} className="min-w-0 text-left">
          <h3 className="font-display text-xl leading-tight">{p.name}</h3>
          <p className="text-sm text-plum/65">{p.kind}</p>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="font-semibold">{euro(p.price)}</span>
          <button onClick={() => add(p.id)} className="grid size-9 place-items-center rounded-full bg-plum text-lg text-nacre" aria-label={`Ajouter ${p.name} au panier`}>+</button>
        </div>
      </div>
    </article>
  );
}

// ---------- Les soins ----------
function Shop({ onOpen }: { onOpen: (p: Product) => void }) {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('Tout');
  const list = useMemo(() => (cat === 'Tout' ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat)), [cat]);
  return (
    <section id="soins" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-[2.6rem] leading-none sm:text-6xl">Les soins</h2>
        <p className="text-plum/65">{list.length} produit{list.length > 1 ? 's' : ''}</p>
      </div>
      <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Filtrer par catégorie" data-lenis-prevent-horizontal>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`shrink-0 rounded-full border px-4 py-2 text-[0.95rem] transition-colors ${cat === c ? 'border-plum bg-plum text-nacre' : 'border-plum/20 bg-transparent'}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6">
        {list.map((p) => <ProductCard key={p.id} p={p} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

// ---------- Routine en 3 étapes ----------
function Routine({ onOpen }: { onOpen: (p: Product) => void }) {
  const { add, setOpen } = useCart();
  const items = ROUTINE.map((r) => ({ ...r, p: byId(r.id) }));
  const total = items.reduce((n, r) => n + r.p.price, 0);
  return (
    <section id="routine" className="scroll-mt-16 bg-jade text-nacre">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="max-w-lg font-display text-[2.6rem] leading-none sm:text-6xl">Ta routine du matin, en trois gestes</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {items.map((r, i) => (
            <li key={r.id} className="flex items-center gap-4 sm:flex-col sm:items-start">
              <button onClick={() => onOpen(r.p)} className="relative w-24 shrink-0 rounded-[22px] bg-nacre/10 sm:w-32" aria-label={`Voir ${r.p.name}`}>
                <span className="absolute -left-1 -top-1 grid size-8 place-items-center rounded-full bg-petale font-display text-lg text-plum">{i + 1}</span>
                <ProductArt shape={r.p.shape} tint={r.p.tint} ink={r.p.ink} className="w-full p-2" />
              </button>
              <div>
                <h3 className="font-display text-2xl">{r.step}</h3>
                <p className="mt-1 max-w-xs leading-relaxed text-nacre/80">{r.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <button
          onClick={() => { items.forEach((r) => add(r.id)); setOpen(true); }}
          className="mt-10 rounded-full bg-nacre px-7 py-4 font-semibold text-plum"
        >
          Ajouter les 3 soins ({euro(total)})
        </button>
      </div>
    </section>
  );
}

// ---------- Histoire de la marque ----------
function Story() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
      <ScrollReveal baseOpacity={0.15} enableBlur={false} baseRotation={0} textClassName="font-display text-[1.9rem] leading-[1.25] sm:text-[2.6rem]">
        La rosée se pose sans bruit et repart au soleil. Nos soins font pareil : peu d’ingrédients, choisis pour une raison, et une peau qui garde son eau toute la journée.
      </ScrollReveal>
      <ul className="mt-14 grid gap-6 border-t border-plum/15 pt-8 text-plum/80 sm:grid-cols-3">
        <li><strong className="block text-plum">Livraison offerte</strong>dès {euro(FREE_SHIPPING)} d’achat.</li>
        <li><strong className="block text-plum">Flacons en verre</strong>recyclables et rechargeables.</li>
        <li><strong className="block text-plum">Retours gratuits</strong>pendant 30 jours.</li>
      </ul>
    </section>
  );
}

// ---------- Fiche produit ----------
function ProductSheet({ p, onClose }: { p: Product | null; onClose: () => void }) {
  const { add, setOpen } = useCart();
  const [last, setLast] = useState<Product | null>(p);
  if (p && p !== last) setLast(p);
  const shown = p ?? last;
  return (
    <Sheet open={!!p} onClose={onClose} title={shown ? shown.name : ''}>
      {shown && (
        <div>
          <div className="rounded-[24px]" style={tintBg(shown.tint)}>
            <ProductArt shape={shown.shape} tint={shown.tint} ink={shown.ink} className="mx-auto w-1/2 py-2" />
          </div>
          <p className="mt-4 text-plum/65">{shown.kind} · {shown.size}</p>
          <p className="mt-2 leading-relaxed">{shown.description}</p>
          <h3 className="mt-5 font-semibold">Ingrédients clés</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {shown.ingredients.map((i) => <li key={i} className="rounded-full bg-porcelaine px-3 py-1.5 text-sm">{i}</li>)}
          </ul>
          <h3 className="mt-5 font-semibold">Comment l’utiliser</h3>
          <p className="mt-1 leading-relaxed text-plum/80">{shown.use}</p>
          <button
            onClick={() => { add(shown.id); onClose(); setOpen(true); }}
            className="mt-6 w-full rounded-full bg-baie py-4 font-semibold text-nacre"
          >
            Ajouter au panier ({euro(shown.price)})
          </button>
        </div>
      )}
    </Sheet>
  );
}

// ---------- Panier ----------
function CartSheet() {
  const { lines, total, setQty, open, setOpen } = useCart();
  const [tried, setTried] = useState(false);
  const close = useCallback(() => { setOpen(false); setTried(false); }, [setOpen]);
  const left = FREE_SHIPPING - total;
  return (
    <Sheet open={open} onClose={close} title="Ton panier">
      {lines.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-plum/70">Ton panier est vide.</p>
          <a href="#soins" onClick={close} className="mt-4 inline-block rounded-full bg-plum px-6 py-3 font-medium text-nacre">Voir les soins</a>
        </div>
      ) : (
        <div>
          <ul className="divide-y divide-plum/10">
            {lines.map(({ product: p, qty }) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <div className="w-16 shrink-0 rounded-2xl" style={tintBg(p.tint)}>
                  <ProductArt shape={p.shape} tint={p.tint} ink={p.ink} className="w-full p-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg leading-tight">{p.name}</p>
                  <p className="text-sm text-plum/60">{euro(p.price)}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-porcelaine p-1">
                  <button onClick={() => setQty(p.id, qty - 1)} className="grid size-8 place-items-center rounded-full bg-nacre" aria-label={`Retirer un ${p.name}`}>−</button>
                  <span className="w-6 text-center tabular-nums" aria-live="polite">{qty}</span>
                  <button onClick={() => setQty(p.id, qty + 1)} className="grid size-8 place-items-center rounded-full bg-nacre" aria-label={`Ajouter un ${p.name}`}>+</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl bg-porcelaine p-4 text-sm">
            {left > 0 ? <p>Plus que <strong>{euro(left)}</strong> pour la livraison offerte.</p> : <p><strong>Livraison offerte</strong> sur cette commande.</p>}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-nacre">
              <div className="h-full rounded-full bg-jade transition-[width] duration-500" style={{ width: `${Math.min(100, (total / FREE_SHIPPING) * 100)}%` }} />
            </div>
          </div>
          <div className="mt-5 flex items-baseline justify-between">
            <span>Total</span>
            <span className="font-display text-3xl">{euro(total)}</span>
          </div>
          <button onClick={() => setTried(true)} className="mt-4 w-full rounded-full bg-baie py-4 font-semibold text-nacre">Commander</button>
          {tried && (
            <p className="mt-3 rounded-2xl bg-petale/60 p-3 text-sm" role="status">
              Les commandes ne sont pas encore ouvertes. Ton panier reste enregistré sur cet appareil.
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
}

function Page() {
  const [current, setCurrent] = useState<Product | null>(null);
  const close = useCallback(() => setCurrent(null), []);
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Ingredients />
        <Shop onOpen={setCurrent} />
        <Routine onOpen={setCurrent} />
        <Story />
      </main>
      <footer className="border-t border-plum/10 px-5 py-10 text-center text-sm text-plum/60">
        <p className="font-display text-2xl text-plum">Rosée</p>
        <p className="mt-2">Boutique en préparation : les commandes ouvrent bientôt.</p>
      </footer>
      <ProductSheet p={current} onClose={close} />
      <CartSheet />
    </>
  );
}

export default function App() {
  return (
    <SmoothScroll>
      <CartProvider>
        <Page />
      </CartProvider>
    </SmoothScroll>
  );
}
