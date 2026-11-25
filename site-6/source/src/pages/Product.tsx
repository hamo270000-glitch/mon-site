import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import BedCanvas from '../three/BedCanvas';
import { LAYERS, PRODUCT, SIZES, euros, type SizeId } from '../data/catalog';
import { useCover } from '../theme';
import ColorPicker from '../ui/ColorPicker';
import { useCart } from '../shop/cart';
import { href } from '../router';
import { IconArrow, IconPress } from '../ui/Icons';

const SCALE: Record<SizeId, number> = { S: 0.74, M: 0.86, L: 0.98, XL: 1.1 };

export default function Product({ initialSize, withDog = false }: { initialSize?: string | null; withDog?: boolean }) {
  const start = SIZES.find((s) => s.id === initialSize)?.id ?? 'M';
  const [size, setSize] = useState<SizeId>(start);
  const [xray, setXray] = useState(withDog);
  const { color: c } = useCover();
  const [added, setAdded] = useState(false);
  const { add, setOpen } = useCart();
  const s = SIZES.find((x) => x.id === size)!;
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => { if (initialSize && SIZES.some((x) => x.id === initialSize)) setSize(initialSize as SizeId); }, [initialSize]);
  useEffect(() => { setAdded(false); }, [size, c.id]);

  const onAdd = () => {
    add(size, c.id);
    setAdded(true);
    if (btn.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(btn.current, { scale: 0.97 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    }
    setTimeout(() => setOpen(true), 400);
  };

  return (
    <div className="pt-16">
      <div className="mx-auto grid max-w-7xl md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-10 md:px-8">
        <div className="relative md:sticky md:top-16 md:h-[calc(100svh-4rem)]">
          <div className="relative isolate h-[52svh] min-h-[320px] overflow-hidden md:h-full md:rounded-[1.5rem] md:border md:border-creme/10">
            <div aria-hidden="true" className="lampe absolute left-[-10%] top-[-10%] h-[70%] w-[80%]" />
            <BedCanvas
              className="absolute inset-0"
              label={`${PRODUCT.name} en 3D, taille ${s.id}, coloris ${c.label}.${xray ? ' Un chien est couché dessus, vu en transparence, ses points d’appui en bleu.' : ' Appuie sur la housse pour la voir s’enfoncer.'}`}
              cover={c.cover}
              bolster={c.bolster}
              scale={SCALE[size]}
              dog={xray}
              relief={1}
              interactive={!xray}
            />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
              <div className="legende chiffres rounded-xl bg-ciel/95 px-3 py-2">
                <span className="block text-creme">{s.outer[0]} × {s.outer[1]} cm</span>
                couchage {s.sleep[0]} × {s.sleep[1]} cm
              </div>
              <button type="button" onClick={() => setXray((v) => !v)} aria-pressed={xray}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-creme/20 bg-ciel/95 px-4 text-[0.9rem] transition-colors hover:border-ambre aria-pressed:border-repos aria-pressed:text-repos">
                <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />{xray ? 'Masquer le chien' : 'Voir avec un chien'}
              </button>
            </div>
            {!xray && <p className="legende pointer-events-none absolute right-4 top-4 hidden items-center gap-2 sm:inline-flex"><IconPress /> Appuie sur la mousse</p>}
          </div>
        </div>

        <div className="px-4 pb-20 pt-8 sm:px-8 md:px-0 md:py-14">
          <p className="surtitre">{PRODUCT.tagline}</p>
          <h1 className="mt-3 text-[clamp(2.8rem,6vw,4.4rem)]">{PRODUCT.name}</h1>
          <p className="chiffres serif mt-3 text-4xl" aria-live="polite">{euros(s.price)}</p>
          <p className="mt-5 max-w-md text-lg text-creme/80">Quatorze centimètres de mousse, une entrée basse pour ne pas enjamber, un traversin sur trois côtés pour poser le menton.</p>

          <fieldset className="mt-10">
            <legend className="flex w-full items-baseline justify-between font-semibold">Taille <a href={href.tailles} className="text-[0.95rem] font-normal text-brume underline hover:text-ambre-clair">Quelle taille choisir ?</a></legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SIZES.map((x) => (
                <label key={x.id} className={`relative flex min-h-[5.5rem] cursor-pointer flex-col justify-between rounded-xl border p-3 transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ambre ${size === x.id ? 'border-ambre bg-ambre/[0.08]' : 'border-creme/14 hover:border-creme/35'}`}>
                  <input type="radio" name="taille" value={x.id} checked={size === x.id} onChange={() => setSize(x.id)} className="sr-only" />
                  <span className="flex items-baseline justify-between"><span className="serif text-3xl italic">{x.id}</span><span className="chiffres text-[0.95rem]">{euros(x.price)}</span></span>
                  <span className="legende chiffres">{x.outer[0]} × {x.outer[1]} cm · jusqu’à {x.maxWeight} kg</span>
                </label>
              ))}
            </div>
            <p className="legende mt-2">Exemples : {s.example}.</p>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="font-semibold">Coloris · <span className="font-normal text-brume">{c.label}</span></legend>
            <div className="mt-3"><ColorPicker id="coloris-produit" /></div>
          </fieldset>

          <div className="sticky bottom-0 z-10 -mx-4 mt-9 border-t border-creme/10 bg-ciel/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:-mx-8 sm:px-8 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
            <button ref={btn} type="button" onClick={onAdd} className="bouton w-full text-lg">
              {added ? 'Ajouté, on ouvre ton panier' : <>Ajouter au panier · <span className="chiffres">{euros(s.price)}</span></>}
            </button>
          </div>

          <div className="mt-12 divide-y divide-creme/10 border-y border-creme/10">
            <details className="group py-4" open>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-lg font-semibold">Ce qu’il y a dedans <span className="transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
              <ul className="mt-3 space-y-3">
                {LAYERS.map((l) => (
                  <li key={l.name} className="grid grid-cols-[2rem_1fr] gap-3"><span className="mt-2 h-2.5 w-7 rounded-full border border-creme/20" style={{ background: l.tone }} aria-hidden="true" /><span><strong className="font-semibold">{l.name}</strong> <span className="legende chiffres">{l.thickness}</span><br /><span className="text-brume">{l.role}</span></span></li>
                ))}
              </ul>
              <a href={href.appuis} className="bouton-lien mt-3">Pourquoi ça soulage les appuis <IconArrow /></a>
            </details>
            <details className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-lg font-semibold">Entretien <span className="transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="mt-3 text-brume">La housse s’enlève avec sa fermeture éclair et se lave en machine à 30 °C. La mousse, protégée par une doublure, ne se lave pas : aère-la de temps en temps.</p>
            </details>
            <details className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-lg font-semibold">Livraison et retours <span className="transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="mt-3 text-brume">La boutique est en préparation. Les délais de livraison en France et les conditions de retour seront affichés ici avant l’ouverture des commandes.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
