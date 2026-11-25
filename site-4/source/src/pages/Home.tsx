import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import BedCanvas from '../three/BedCanvas';
import Magnet from '../components/reactbits/Magnet';
import StrataStory from './StrataStory';
import SizeFinder from './SizeFinder';
import { SIZES, euros } from '../data/catalog';
import { useTheme } from '../theme';
import ColorPicker from '../ui/ColorPicker';
import { href } from '../router';
import { IconArrow, IconPress } from '../ui/Icons';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Un gros chiffre qui compte jusqu'à sa valeur quand il arrive à l'écran.
function BigNumber({ value, unit, className = '' }: { value: number; unit?: string; className?: string }) {
  return (
    <p className={`chiffres font-[family-name:var(--font-display)] font-extrabold leading-[0.8] tracking-[-0.06em] ${className}`}>
      <span data-count={value}>{value}</span>
      {unit && <span className="ml-2 align-top text-[0.22em] font-semibold tracking-[-0.02em] text-doux">{unit}</span>}
    </p>
  );
}

function Lines({ lines, className = '' }: { lines: string[]; className?: string }) {
  return (
    <p className={`font-[family-name:var(--font-display)] text-[clamp(1.7rem,3.6vw,3rem)] font-bold leading-[1.02] tracking-[-0.035em] ${className}`}>
      {lines.map((l) => <span key={l} className="block">{l}</span>)}
    </p>
  );
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const spin = useRef({ current: -0.5 });
  const [pressed, setPressed] = useState(false);
  const { color: c } = useTheme();
  const [mobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const hero = c;

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Le mot géant s'ouvre au chargement, puis s'éloigne quand on descend.
      gsap.from('[data-giant]', { yPercent: 18, autoAlpha: 0.001, letterSpacing: '0.04em', duration: 1.8, ease: 'expo.out' });
      gsap.to('[data-giant]', { yPercent: -22, scale: 0.92, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });

      // Le panier fait un tour complet pendant qu'on lit « 12 cm ».
      const st = { p: 0 };
      gsap.to(st, {
        p: 1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-spin]', start: 'top top', end: '+=180%', pin: true, scrub: 0.8, refreshPriority: 2 },
        onUpdate: () => { spin.current.current = -0.5 + st.p * Math.PI * 2; },
      });
      gsap.from('[data-spin-lines] span', { yPercent: 60, autoAlpha: 0.001, stagger: 0.12, duration: 1.1, scrollTrigger: { trigger: '[data-spin]', start: 'top 60%', once: true } });

      // Les chiffres comptent.
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count);
        const o = { v: 0 };
        gsap.to(o, { v: end, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true }, onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
      });

      // Les halos respirent.
      gsap.to('[data-halo]', { scale: 1.12, autoAlpha: 0.75, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <div ref={root}>
      {/* 1. Scène d'ouverture */}
      <section data-hero aria-labelledby="titre-accueil" className="relative isolate h-[100svh] min-h-[560px] overflow-hidden">
        <p data-giant aria-hidden="true" className="mot-geant pointer-events-none absolute inset-x-0 top-[14%] text-center text-[34vw] md:top-[6%] md:text-[27vw]">LOVÉ</p>
        <div data-hero-bed className="absolute inset-0">
          <BedCanvas
            className="absolute inset-0"
            label={`Le panier Lové en 3D, coloris ${c.label}. Appuie sur la housse : elle s’enfonce puis remonte lentement.`}
            cover={hero.cover}
            bolster={hero.bolster}
            glow={hero.glow}
            lookY={mobile ? -0.95 : -0.35}
            camera={[3.2, 2.9, 4.6]}
            scale={mobile ? 0.62 : 0.78}
            onPress={() => setPressed(true)}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 md:flex-row md:items-end md:justify-between md:pb-10">
          <div data-hero-copy>
            <h1 id="titre-accueil" className="max-w-[15ch] text-[clamp(2rem,4.6vw,3.6rem)]">Pour les chiens qui ont tout donné.</h1>
            <div className="mt-4"><ColorPicker id="coloris-haut" /></div>
            <p className="legende mt-2 inline-flex items-center gap-2" aria-live="polite"><IconPress />{pressed ? 'Elle remonte lentement. C’est la mémoire de forme.' : 'Appuie sur la mousse'}</p>
          </div>
          <div className="flex items-center gap-5">
            <p className="chiffres text-doux">dès <strong className="text-xl font-semibold text-texte">{euros(SIZES[0].price)}</strong></p>
            <Magnet padding={40} magnetStrength={4}>
              <a href={href.produit} className="inline-flex min-h-13 items-center gap-2 rounded-full bg-lichen px-7 font-semibold text-sur-lichen shadow-[0_10px_40px_color-mix(in_oklab,var(--t-accent)_35%,transparent)] transition-colors hover:bg-lichen-fonce">
                Choisir ma taille <IconArrow />
              </a>
            </Magnet>
          </div>
        </div>
      </section>

      {/* 2. Douze centimètres : le panier tourne avec le défilement */}
      <section data-spin aria-labelledby="titre-douze" className="relative isolate h-[100svh] overflow-hidden">
        <div data-halo aria-hidden="true" className="halo absolute bottom-[-10%] right-[-10%] h-[70vh] w-[90vw] md:w-[60vw]" />
        <div className="relative mx-auto grid h-full max-w-7xl grid-rows-[auto_1fr] px-4 pt-24 sm:px-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:grid-rows-1 md:items-center md:pt-0">
          <div>
            <h2 id="titre-douze" className="sr-only">Douze centimètres de mousse</h2>
            <BigNumber value={12} unit="cm" className="text-[clamp(7rem,22vw,17rem)]" />
            <div data-spin-lines><Lines lines={['De mousse sous lui.', 'Zéro contact', 'avec le sol.']} className="mt-4" /></div>
            <p className="legende mt-5 max-w-sm">5 cm de mémoire de forme sur 7 cm de mousse de soutien. Épaisseurs provisoires, confirmées avec l’échantillon.</p>
          </div>
          <BedCanvas
            className="relative h-full min-h-[300px] w-full"
            label="Le panier Lové tourne sur lui-même pendant le défilement."
            cover={c.cover}
            bolster={c.bolster}
            glow={c.glow}
            interactive={false}
            rotY={spin.current}
            scale={0.92}
          />
        </div>
      </section>

      {/* 3. Les quatre couches, en vue éclatée */}
      <StrataStory title="Quatre couches. Une seule mission : son repos." />

      {/* 4. Soixante kilos */}
      <section aria-labelledby="titre-soixante" className="relative isolate overflow-hidden py-28 sm:py-40">
        <div data-halo aria-hidden="true" className="halo absolute left-[-15%] top-[10%] h-[80%] w-[80vw] md:w-[55vw]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-end px-4 text-right sm:px-8">
          <h2 id="titre-soixante" className="sr-only">Jusqu’à soixante kilos</h2>
          <BigNumber value={60} unit="kg" className="text-[clamp(7rem,24vw,19rem)]" />
          <Lines lines={['Pensé pour les grands.', 'Doux pour les petits.']} className="mt-4" />
          <p className="legende mt-5 max-w-sm">En taille XL, pour les chiens jusqu’à 60 kg : bouvier bernois, berger allemand. Quatre tailles, du teckel au molosse.</p>
        </div>
      </section>

      {/* 5. Trois lumières : le coloris rallume la scène */}
      <section aria-labelledby="titre-coloris" className="relative isolate overflow-hidden py-24 sm:py-32">
        <p aria-hidden="true" className="mot-contour pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-[family-name:var(--font-display)] text-[30vw] font-extrabold leading-none tracking-[-0.06em]">{c.label.toUpperCase()}</p>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center">
          <div>
            <h2 id="titre-coloris" className="text-[clamp(2.2rem,5vw,4rem)]">Un panier.<br />Quatre ambiances.</h2>
            <p className="mt-4 max-w-sm text-lg text-doux">Choisis la couleur de la housse : tout le site change avec elle. Beige ou gris pour un intérieur clair, chocolat ou noir pour un salon plus sombre.</p>
            <div className="mt-8"><ColorPicker id="coloris-accueil" big /></div>
          </div>
          <BedCanvas
            className="relative h-[46svh] min-h-[300px] w-full md:h-[70svh]"
            label={`Le panier Lové en 3D, coloris ${c.label}. Appuie sur la housse pour la voir s’enfoncer.`}
            cover={c.cover}
            bolster={c.bolster}
            glow={c.glow}
          />
        </div>
      </section>

      {/* 6. La bonne taille */}
      <SizeFinder compact />

      {/* 7. Comparer les tailles */}
      <section aria-labelledby="titre-comparer" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <h2 id="titre-comparer" className="text-[clamp(2.2rem,5vw,4rem)]">Compare les quatre tailles.</h2>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4" data-rows>
            {SIZES.map((s) => (
              <div key={s.id} className="border-t border-texte/15 pt-5">
                <p className="font-[family-name:var(--font-display)] text-6xl font-extrabold tracking-[-0.05em]">{s.id}</p>
                <p className="mt-1 text-doux">{s.label}</p>
                <dl className="chiffres mt-6 space-y-4">
                  <div><dt className="legende">Extérieur</dt><dd className="text-xl font-semibold">{s.outer[0]} × {s.outer[1]} cm</dd></div>
                  <div><dt className="legende">Couchage</dt><dd className="text-xl font-semibold">{s.sleep[0]} × {s.sleep[1]} cm</dd></div>
                  <div><dt className="legende">Chien jusqu’à</dt><dd className="text-xl font-semibold">{s.maxLength} cm · {s.maxWeight} kg</dd></div>
                  <div><dt className="legende">Prix</dt><dd className="text-xl font-semibold">{euros(s.price)}</dd></div>
                </dl>
                <a href={`${href.produit}?taille=${s.id}`} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-lichen">Choisir le {s.id} <IconArrow /></a>
              </div>
            ))}
          </div>
          <p className="legende mt-10">Mesures provisoires, confirmées à la réception de l’échantillon.</p>
        </div>
      </section>

      {/* 8. Fin */}
      <section aria-labelledby="titre-fin" className="relative isolate overflow-hidden pb-28 pt-20 sm:pb-36">
        <div data-halo aria-hidden="true" className="halo absolute bottom-[-30%] left-1/2 h-[90%] w-[110vw] -translate-x-1/2 md:w-[70vw]" />
        <p aria-hidden="true" className="mot-geant pointer-events-none text-center text-[34vw] md:text-[26vw]" data-squeeze>LOVÉ</p>
        <div className="relative mx-auto mt-6 flex max-w-7xl flex-col items-center gap-7 px-4 text-center sm:px-8">
          <h2 id="titre-fin" className="text-[clamp(2.4rem,6vw,4.8rem)]">Ce soir, il dort dessus.</h2>
          <a href={href.produit} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-lichen px-8 text-lg font-semibold text-sur-lichen shadow-[0_10px_40px_color-mix(in_oklab,var(--t-accent)_35%,transparent)] transition-colors hover:bg-lichen-fonce">
            Voir le panier Lové <IconArrow />
          </a>
        </div>
      </section>
    </div>
  );
}
