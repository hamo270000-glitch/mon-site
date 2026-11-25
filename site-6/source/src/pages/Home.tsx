import { useState } from 'react';
import BedCanvas from '../three/BedCanvas';
import Magnet from '../components/reactbits/Magnet';
import XRayStory from './XRayStory';
import SizeFinder from './SizeFinder';
import { LAYERS, PRODUCT, SIZES, euros } from '../data/catalog';
import { useCover } from '../theme';
import ColorPicker from '../ui/ColorPicker';
import { href } from '../router';
import { IconArrow, IconPress } from '../ui/Icons';

const SIGNS = [
  ['Il met plus longtemps à se lever le matin.', 'Les premiers pas sont raides, puis ça « se dérouille ».'],
  ['Il cherche le froid du carrelage.', 'Ou il tourne longtemps avant de se coucher, sans trouver sa place.'],
  ['Il hésite devant l’escalier ou la voiture.', 'Ce qu’il faisait d’un bond lui demande maintenant de réfléchir.'],
  ['Il change de côté plusieurs fois la nuit.', 'Rester longtemps sur la même hanche devient inconfortable.'],
];

// Coupe du panier, à l'échelle des épaisseurs (provisoires).
function CrossSection() {
  const scale = 22; // px par cm
  const rows = [
    { l: LAYERS[0], h: 0.6 },
    { l: LAYERS[1], h: 6 },
    { l: LAYERS[2], h: 8 },
    { l: LAYERS[3], h: 0.5 },
  ];
  let y = 0;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 560 ${15.1 * scale + 20}`} className="h-auto w-full" role="img" aria-label="Coupe du panier : housse, 6 cm de mousse à mémoire de forme, 8 cm de mousse de soutien, fond antidérapant.">
        {rows.map(({ l, h }) => {
          const top = y;
          y += h * scale;
          return (
            <g key={l.name}>
              <rect x="0" y={top} width="300" height={h * scale} rx={h > 1 ? 6 : 2} fill={l.tone} opacity={l.tone === '#1c2a30' ? 1 : 0.92} stroke={l.tone === '#1c2a30' ? '#3a4d55' : 'none'} />
              <line x1="312" x2="336" y1={top + (h * scale) / 2} y2={top + (h * scale) / 2} stroke="var(--color-brume)" strokeWidth="1" />
              <text x="346" y={top + (h * scale) / 2 + 5} fontSize="16" fill="var(--color-creme)">{l.name}</text>
              {l.thickness !== 'tissu' && <text x="346" y={top + (h * scale) / 2 + 25} fontSize="14" fill="var(--color-brume)">{l.thickness}</text>}
            </g>
          );
        })}
      </svg>
      <figcaption className="legende mt-3">Coupe à l’échelle des épaisseurs prévues, à confirmer avec l’échantillon du fournisseur.</figcaption>
    </figure>
  );
}

export default function Home() {
  const [pressed, setPressed] = useState(false);
  const { color: c } = useCover();
  const [mobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  return (
    <div>
      {/* 1. La veillée : le panier sous la lampe */}
      <section data-hero aria-labelledby="titre-accueil" className="relative isolate min-h-[100svh] overflow-hidden">
        <div data-lampe aria-hidden="true" className="lampe absolute left-[-20%] top-[8%] h-[70vh] w-[90vw] md:left-[-5%] md:w-[60vw]" />
        <div data-hero-bed className="absolute inset-x-0 top-[34%] bottom-0 md:left-[38%] md:top-0">
          <BedCanvas
            className="absolute inset-0"
            label={`${PRODUCT.name}, panier orthopédique en 3D, coloris ${c.label}. Appuie sur la housse : elle s’enfonce puis remonte lentement.`}
            cover={c.cover}
            bolster={c.bolster}
            lookY={mobile ? -0.25 : -0.1}
            camera={[3.1, 2.6, 4.4]}
            scale={mobile ? 0.66 : 0.95}
            onPress={() => setPressed(true)}
          />
        </div>
        <div data-hero-copy className="pointer-events-none relative mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 pt-24 sm:px-8 md:justify-center md:pt-0">
          <div className="pointer-events-auto max-w-xl">
            <p className="surtitre">Paniers orthopédiques · chiens âgés</p>
            <h1 id="titre-accueil" className="mt-4 text-[clamp(2.15rem,6.2vw,5rem)]">Ses vieux os méritent <em>mieux que le carrelage.</em></h1>
            <p className="mt-5 hidden max-w-md text-lg text-creme/80 md:block">Quatorze centimètres de mousse pour les chiens qui ont blanchi du museau, se lèvent lentement et dorment de plus en plus.</p>
            <div className="mt-7 hidden flex-wrap items-center gap-5 md:flex">
              <Magnet padding={40} magnetStrength={5}>
                <a href={href.tailles} className="bouton">Trouver sa taille <IconArrow /></a>
              </Magnet>
              <p className="chiffres text-brume">dès <strong className="serif text-2xl font-normal text-creme">{euros(SIZES[0].price)}</strong></p>
            </div>
          </div>
          <div className="pointer-events-auto mt-auto flex flex-col gap-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:mt-0 md:pb-0 md:pt-10">
            <p className="legende inline-flex items-center gap-2" aria-live="polite"><IconPress />{pressed ? 'Elle remonte lentement : c’est la mémoire de forme.' : 'Appuie sur la mousse'}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:hidden">
              <a href={href.tailles} className="bouton">Trouver sa taille <IconArrow /></a>
              <p className="chiffres text-brume">dès <strong className="serif text-xl font-normal text-creme">{euros(SIZES[0].price)}</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Les signes */}
      <section aria-labelledby="titre-signes" className="py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <p className="surtitre">Ça commence souvent comme ça</p>
              <h2 id="titre-signes" className="mt-3 text-[clamp(2.1rem,4.6vw,3.6rem)]">Il n’est pas paresseux. <em>Il a mal aux articulations.</em></h2>
            </div>
            <ol className="divide-y divide-creme/10 border-y border-creme/10" data-rows>
              {SIGNS.map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[3.5rem_1fr] gap-x-4 py-6">
                  <span className="serif chiffres text-4xl italic text-ambre-clair" aria-hidden="true">{['i', 'ii', 'iii', 'iv'][i]}</span>
                  <div>
                    <p className="serif text-2xl">{t}</p>
                    <p className="mt-1 text-brume">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-8 max-w-2xl text-brume md:ml-[40%]">Si tu reconnais ton chien, parles-en d’abord à ton vétérinaire : c’est lui qui soigne. Nous, on s’occupe de l’endroit où il dort.</p>
        </div>
      </section>

      {/* 3. La radiographie */}
      <XRayStory />

      {/* 4. Le Doyen en coupe */}
      <section aria-labelledby="titre-coupe" className="py-24 sm:py-36">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="surtitre">{PRODUCT.name}, en coupe</p>
            <h2 id="titre-coupe" className="mt-3 text-[clamp(2.1rem,4.6vw,3.6rem)]">Ferme dessous, <em>tendre dessus.</em></h2>
            <ul className="mt-8 space-y-6" data-rows>
              {[
                ['Une entrée basse', 'L’avant est ouvert, sans rebord à enjamber. Pour les pattes arrière qui ne lèvent plus haut.'],
                ['Un traversin pour la tête', 'Sur trois côtés : les vieux chiens aiment poser le menton et s’adosser.'],
                ['Une housse qui se lave', 'Fermeture éclair, machine à 30 °C. La mousse reste à l’abri, dans une doublure.'],
              ].map(([t, d]) => (
                <li key={t} className="border-l border-ambre/60 pl-5">
                  <p className="text-lg font-semibold">{t}</p>
                  <p className="text-brume">{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <CrossSection />
        </div>
      </section>

      {/* 5. Trois coloris */}
      <section aria-labelledby="titre-coloris" className="relative isolate overflow-hidden py-20 sm:py-28">
        <div data-lampe aria-hidden="true" className="lampe absolute right-[-15%] top-[10%] h-[80%] w-[80vw] md:w-[50vw]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center">
          <div>
            <p className="surtitre">Trois housses</p>
            <h2 id="titre-coloris" className="mt-3 text-[clamp(2.1rem,4.6vw,3.6rem)]">Des couleurs <em>qui ne crient pas.</em></h2>
            <p className="mt-4 max-w-sm text-lg text-brume">{c.note}.</p>
            <div className="mt-8"><ColorPicker id="coloris-accueil" big /></div>
          </div>
          <BedCanvas
            className="relative h-[46svh] min-h-[300px] w-full md:h-[64svh]"
            label={`${PRODUCT.name} en 3D, coloris ${c.label}. Appuie sur la housse pour la voir s’enfoncer.`}
            cover={c.cover}
            bolster={c.bolster}
          />
        </div>
      </section>

      {/* 6. La bonne taille */}
      <SizeFinder compact />

      {/* 7. Ce que nous ne promettons pas */}
      <section aria-labelledby="titre-promesses" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <p className="surtitre">Entre nous</p>
          <h2 id="titre-promesses" className="mt-3 max-w-[20ch] text-[clamp(2.1rem,4.6vw,3.6rem)]">Ce que nous <em>ne te promettrons pas.</em></h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3" data-rows>
            {[
              ['Qu’il va guérir.', 'Un panier ne soigne pas l’arthrose. Il rend le repos plus confortable, c’est tout, et c’est déjà beaucoup.'],
              ['De faux avis.', 'La boutique ouvre à peine : pas encore d’avis clients. Nous n’en inventerons pas.'],
              ['Une offre qui expire.', 'Pas de compte à rebours ni de « plus que 2 en stock ». Prends le temps de mesurer ton chien.'],
            ].map(([t, d]) => (
              <div key={t} className="voile rounded-2xl p-6">
                <p className="serif text-2xl line-through decoration-ambre/70 decoration-1">{t}</p>
                <p className="mt-3 text-brume">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Bonne nuit */}
      <section aria-labelledby="titre-fin" className="relative isolate overflow-hidden pb-32 pt-24 text-center sm:pb-44">
        <div data-lampe aria-hidden="true" className="lampe absolute bottom-[-30%] left-1/2 h-[90%] w-[110vw] -translate-x-1/2 md:w-[60vw]" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 sm:px-8">
          <svg width="56" height="56" viewBox="0 0 32 32" aria-hidden="true"><path d="M21.5 4.5A12 12 0 1 0 27.5 22 9.5 9.5 0 0 1 21.5 4.5Z" fill="var(--color-ambre)" /></svg>
          <h2 id="titre-fin" className="text-[clamp(2.8rem,8vw,6.5rem)]">Bonne nuit, <em>vieux copain.</em></h2>
          <a href={href.produit} className="bouton text-lg">Découvrir {PRODUCT.name} <IconArrow /></a>
        </div>
      </section>
    </div>
  );
}
