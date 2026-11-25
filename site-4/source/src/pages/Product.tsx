import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import BedCanvas from '../three/BedCanvas';
import { LAYERS, PRODUCT, SIZES, euros, type SizeId } from '../data/catalog';
import { useTheme } from '../theme';
import ColorPicker from '../ui/ColorPicker';
import { useCart } from '../shop/cart';
import { href } from '../router';
import { IconArrow, IconPress } from '../ui/Icons';

const SCALE: Record<SizeId, number> = { S: 0.74, M: 0.86, L: 0.98, XL: 1.1 };

export default function Product({ initialSize }: { initialSize?: string | null }) {
  const start = SIZES.find((s) => s.id === initialSize)?.id ?? 'M';
  const [size, setSize] = useState<SizeId>(start);
  const { color: c } = useTheme();
  const color = c.id;
  const [added, setAdded] = useState(false);
  const { add, setOpen } = useCart();
  const s = SIZES.find((x) => x.id === size)!;
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => { if (initialSize && SIZES.some((x) => x.id === initialSize)) setSize(initialSize as SizeId); }, [initialSize]);
  useEffect(() => { setAdded(false); }, [size, color]);

  const onAdd = () => {
    add(size, color);
    setAdded(true);
    if (btn.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(btn.current, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
    }
    setTimeout(() => setOpen(true), 380);
  };

  return (
    <div className="pt-16">
      <div className="mx-auto grid max-w-7xl md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-10 md:px-8">
        <div className="relative md:sticky md:top-16 md:h-[calc(100svh-4rem)]">
          <div className="relative isolate h-[52svh] min-h-[320px] overflow-hidden md:h-full md:rounded-[2rem] md:bg-basalte-2">
            <div aria-hidden="true" className="halo absolute inset-x-[5%] bottom-[-10%] h-[60%] transition-[background] duration-700" />
            <p aria-hidden="true" className="mot-contour pointer-events-none absolute inset-x-0 top-[12%] text-center font-[family-name:var(--font-display)] text-[30vw] font-extrabold leading-none tracking-[-0.06em] md:text-[17vw]">{s.id}</p>
            <BedCanvas
              className="absolute inset-0"
              label={`Le panier Lové en 3D, taille ${s.id}, coloris ${c.label}. Appuie sur la housse pour la voir s’enfoncer.`}
              cover={c.cover}
              bolster={c.bolster}
              glow={c.glow}
              scale={SCALE[size]}
            />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
              <div className="legende chiffres rounded-2xl bg-basalte/75 px-3 py-2 backdrop-blur-md">
                <span className="block text-texte">{s.outer[0]} × {s.outer[1]} cm</span>
                couchage {s.sleep[0]} × {s.sleep[1]} cm
              </div>
              <p className="legende hidden items-center gap-2 rounded-full bg-basalte/75 px-3 py-2 text-texte backdrop-blur-md sm:inline-flex"><IconPress /> Appuie sur la mousse</p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-20 pt-8 sm:px-8 md:px-0 md:py-14">
          <p className="legende">{PRODUCT.tagline}</p>
          <h1 className="mt-2 text-[clamp(2.4rem,5vw,3.8rem)]">{PRODUCT.name}</h1>
          <p className="chiffres mt-4 text-3xl font-semibold" aria-live="polite">{euros(s.price)}</p>
          <p className="mt-4 max-w-md text-lg text-texte/80">Quatre couches de mousse, un traversin sur trois côtés pour poser la tête, une entrée basse à l’avant pour ne pas avoir à enjamber.</p>

          <fieldset className="mt-9">
            <legend className="flex w-full items-baseline justify-between font-semibold">Taille <a href={href.tailles} className="text-[0.95rem] font-normal text-doux underline hover:text-lichen">Quelle taille choisir ?</a></legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SIZES.map((x) => (
                <label key={x.id} className={`relative flex min-h-[5.5rem] cursor-pointer flex-col justify-between rounded-2xl border p-3 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lichen ${size === x.id ? 'border-lichen bg-lichen/[0.08]' : 'border-texte/14 hover:border-texte/35'}`}>
                  <input type="radio" name="taille" value={x.id} checked={size === x.id} onChange={() => setSize(x.id)} className="sr-only" />
                  <span className="flex items-baseline justify-between"><span className="font-[family-name:var(--font-display)] text-2xl font-bold">{x.id}</span><span className="chiffres text-[0.95rem]">{euros(x.price)}</span></span>
                  <span className="legende chiffres">{x.outer[0]} × {x.outer[1]} cm · jusqu’à {x.maxWeight} kg</span>
                </label>
              ))}
            </div>
            <p className="legende mt-2">Exemples : {s.example}.</p>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="font-semibold">Coloris · <span className="font-normal text-doux">{c.label}</span></legend>
            <div className="mt-3"><ColorPicker id="coloris-produit" /></div>
          </fieldset>

          <div className="sticky bottom-0 z-10 -mx-4 mt-9 border-t border-texte/10 bg-basalte/92 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:-mx-8 sm:px-8 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
            <button ref={btn} type="button" onClick={onAdd} className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-lichen px-6 text-lg font-semibold text-sur-lichen transition-colors hover:bg-lichen-fonce">
              {added ? 'Ajouté, on ouvre ton panier' : <>Ajouter au panier · <span className="chiffres">{euros(s.price)}</span></>}
            </button>
          </div>

          <div className="mt-12 divide-y divide-texte/10 border-y border-texte/10">
            <details className="group py-4" open>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-lg font-semibold">Ce qu’il y a dedans <span className="transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
              <ul className="mt-3 space-y-3">
                {LAYERS.map((l) => (
                  <li key={l.name} className="grid grid-cols-[2rem_1fr] gap-3"><span className="mt-2 h-2.5 w-7 rounded-full" style={{ background: l.tone }} aria-hidden="true" /><span><strong className="font-semibold">{l.name}</strong> <span className="legende chiffres">{l.thickness}</span><br /><span className="text-doux">{l.role}</span></span></li>
                ))}
              </ul>
              <a href={href.couches} className="mt-4 inline-flex items-center gap-2 font-semibold text-lichen">Voir les couches en 3D <IconArrow /></a>
            </details>
            <details className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-lg font-semibold">Entretien <span className="transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="mt-3 text-doux">La housse s’enlève avec sa fermeture éclair et se lave en machine. La mousse ne se lave pas : aère-la de temps en temps.</p>
            </details>
            <details className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-lg font-semibold">Livraison et retours <span className="transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="mt-3 text-doux">La boutique est en préparation. Les délais de livraison et les conditions de retour seront affichés ici avant l’ouverture des commandes.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
