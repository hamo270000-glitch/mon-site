import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmoothScroll from './SmoothScroll';
import { CartProvider, useCart } from './cart';
import { PHOTOS, SIZES, euros, sizeFor, type SizeId } from './data';
import { IconArrow, IconBag, IconCheck, IconChevron, IconClose, IconDrop, IconFoam, IconMinus, IconPlus, IconRuler, IconWash } from './ui/Icons';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Logo unique : fichiers copiés depuis site-6/brand/ vers source/public/logo/. Pour le remplacer, changer ces fichiers. */
function Logo({ clair = false, className = 'h-9 w-auto' }: { clair?: boolean; className?: string }) {
  return <img src={clair ? './logo/logo-clair.svg' : './logo/logo.svg'} alt="Veilleuse" width={127} height={36} className={className} />;
}

function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-bordure bg-carte pt-[env(safe-area-inset-top)]">
      <div className="conteneur flex h-16 items-center justify-between">
        <a href="#haut" className="-ml-1 flex min-h-11 items-center rounded px-1" aria-label="Veilleuse, retour en haut de page"><Logo className="h-8 w-auto sm:h-9" /></a>
        <div className="flex items-center gap-2">
          <a href="#produit" className="bouton bouton-or hidden min-h-11 px-5 text-[0.9rem] sm:inline-flex">Choisir sa taille</a>
          <button type="button" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}
            className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full text-primaire ring-1 ring-bordure transition-colors hover:bg-carte">
            <IconBag />
            {count > 0 && <span className="chiffres absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-or px-1 text-[0.7rem] font-bold text-white">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="haut" aria-labelledby="titre-hero" className="overflow-hidden bg-carte">
      <div className="conteneur grid grid-cols-1 items-center gap-8 pb-12 pt-8 md:grid-cols-[0.9fr_1.1fr] md:gap-6 md:pb-20 md:pt-16">
        <div className="relative z-10">
          <p className="surtitre text-or">Le panier Veilleuse</p>
          <h1 id="titre-hero" className="mt-4 text-[clamp(2.75rem,6.4vw,5.25rem)] text-primaire">Ses vieux jours méritent <em>un vrai repos</em>.</h1>
          <p className="mt-5 max-w-md text-[1.05rem] text-texte-muted md:text-lg">Un panier en mousse à mémoire de forme, pensé pour les chiens qui vieillissent. Pour qu'il se couche et se relève à son rythme.</p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-start">
            <a href="#produit" className="bouton bouton-or text-[1.02rem]">Choisir sa taille <IconArrow /></a>
            <p className="text-[0.88rem] text-texte-muted sm:pl-1">Boutique en préparation · À partir de <span className="chiffres">95 €</span></p>
          </div>
        </div>
        <div className="relative md:-mr-16 lg:-mr-24">
          <img src="./vues/hero.jpg" width={1260} height={568} fetchPriority="high" decoding="async"
            alt="Un golden retriever allongé sur le panier Veilleuse, entre les traversins matelassés beige-taupe."
            className="h-auto w-full [mask-image:linear-gradient(to_bottom,#000_82%,transparent)]" />
        </div>
      </div>
    </section>
  );
}

const REASSURANCE = [
  { t: 'Mousse à mémoire de forme', I: IconFoam },
  { t: 'Housse amovible et lavable', I: IconWash },
  { t: 'Doublure 100 % imperméable', I: IconDrop },
  { t: 'Quatre tailles, de S à XL', I: IconRuler },
];

function Reassurance() {
  return (
    <section aria-label="En bref" className="border-y border-bordure bg-fond">
      <ul className="conteneur grid grid-cols-2 gap-x-4 gap-y-5 py-6 md:grid-cols-4 md:py-7">
        {REASSURANCE.map(({ t, I }) => (
          <li key={t} className="flex items-center gap-3 text-[0.88rem] font-medium leading-snug text-secondaire md:justify-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fond text-or ring-1 ring-bordure"><I /></span>{t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Signes() {
  const signes = [
    'Il met plus de temps à se lever le matin.',
    'Il cherche le carrelage froid pour s’allonger.',
    'Il tourne longtemps avant de se coucher.',
    'Il hésite devant les marches qu’il montait sans y penser.',
  ];
  return (
    <section aria-labelledby="titre-signes" className="sombre bg-primaire text-clair">
      <div className="conteneur py-20 md:py-28">
        <h2 id="titre-signes" data-reveal className="text-[clamp(2.4rem,5vw,4rem)]">Il a changé, <em>doucement</em>.</h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-secondaire md:mt-14 md:grid-cols-2">
          {signes.map((s, i) => (
            <li key={s} data-reveal className="flex items-baseline gap-5 bg-primaire p-6 md:p-8">
              <span className="serif chiffres text-3xl italic text-or-clair" aria-hidden="true">0{i + 1}</span>
              <span className="text-[1.05rem] text-clair md:text-lg">{s}</span>
            </li>
          ))}
        </ol>
        <p data-reveal className="serif mt-12 max-w-2xl text-[clamp(1.6rem,3.2vw,2.4rem)] italic leading-tight text-clair md:mt-16">Il ne te le dira pas. Mais il mérite un endroit où se poser vraiment.</p>
      </div>
    </section>
  );
}

function Galerie() {
  const [i, setI] = useState(0);
  const p = PHOTOS[i];
  const go = (d: number) => setI((n) => (n + d + PHOTOS.length) % PHOTOS.length);
  return (
    <div className="md:sticky md:top-24">
      <figure className="relative m-0 overflow-hidden rounded-2xl bg-sable ring-1 ring-bordure">
        <div className="grid aspect-[4/3] place-items-center">
          <img key={p.src} src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" className="max-h-full w-full object-contain" />
        </div>
        <figcaption className="sr-only" aria-live="polite">Photo {i + 1} sur {PHOTOS.length}</figcaption>
        <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-carte/90 text-primaire shadow ring-1 ring-bordure hover:bg-carte">
          <span className="rotate-90"><IconChevron /></span>
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-carte/90 text-primaire shadow ring-1 ring-bordure hover:bg-carte">
          <span className="-rotate-90"><IconChevron /></span>
        </button>
      </figure>
      <ul className="mt-3 grid grid-cols-6 gap-2" aria-label="Choisir une photo">
        {PHOTOS.map((x, n) => (
          <li key={x.src}>
            <button type="button" onClick={() => setI(n)} aria-label={`Photo ${n + 1} : ${x.alt}`} aria-pressed={n === i}
              className={`block aspect-square w-full cursor-pointer overflow-hidden rounded-lg bg-sable ring-offset-2 ring-offset-fond transition-shadow ${n === i ? 'ring-2 ring-or' : 'ring-1 ring-bordure hover:ring-secondaire'}`}>
              <img src={x.mini} alt="" width={240} height={Math.round((240 * x.h) / x.w)} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CARACTERISTIQUES = [
  'Mousse à mémoire de forme qui suit les contours du corps',
  'Rebords arrondis sur trois côtés, pour poser la tête',
  'Avant ouvert et bas, facile à enjamber',
  'Doublure 100 % imperméable, qui protège la mousse',
  'Housse matelassée amovible et lavable',
];

function Produit({ size, setSize, buyRef }: { size: SizeId; setSize: (s: SizeId) => void; buyRef: React.RefObject<HTMLButtonElement | null> }) {
  const [added, setAdded] = useState(false);
  const { add, setOpen } = useCart();
  const s = SIZES.find((x) => x.id === size)!;
  useEffect(() => setAdded(false), [size]);
  return (
    <section id="produit" aria-labelledby="titre-produit" className="bg-fond">
      <div className="conteneur grid grid-cols-1 gap-10 py-20 md:grid-cols-[1.08fr_0.92fr] md:gap-14 md:py-28">
        <Galerie />
        <div>
          <h2 id="titre-produit" className="text-[clamp(2.4rem,4.6vw,3.75rem)] text-primaire">Le panier <em>Veilleuse</em></h2>
          <p className="chiffres serif mt-2 text-[2.1rem] text-primaire" aria-live="polite">{euros(s.price)} <span className="font-sans text-[0.9rem] font-medium text-texte-muted">· taille {s.id}</span></p>
          <p className="mt-4 text-texte-muted">Un panier ferme et enveloppant, conçu pour les chiens âgés ou raides. La mousse épouse son corps. Les rebords soutiennent sa tête. L'avant reste bas, pour entrer sans effort.</p>

          <fieldset className="mt-8">
            <legend className="text-[0.95rem] font-semibold text-primaire">Taille</legend>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {SIZES.map((x) => (
                <label key={x.id} className={`flex min-h-[5.25rem] cursor-pointer flex-col justify-between rounded-xl border bg-carte p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-or ${size === x.id ? 'border-or ring-1 ring-or' : 'border-bordure hover:border-secondaire'}`}>
                  <input type="radio" name="taille" value={x.id} checked={size === x.id} onChange={() => setSize(x.id)} className="sr-only" />
                  <span className="flex items-baseline justify-between"><span className="serif text-[1.75rem] leading-none text-primaire">{x.id}</span><span className="chiffres font-semibold text-primaire">{euros(x.price)}</span></span>
                  <span className="chiffres mt-2 text-[0.8rem] leading-snug text-texte-muted">{x.outer[0]} × {x.outer[1]} cm · jusqu'à {x.maxWeight} kg</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-[0.88rem] text-texte-muted">Par exemple : {s.example}. <a href="#tailles" className="font-medium text-or underline underline-offset-4">Trouver sa taille</a></p>
          </fieldset>

          <button ref={buyRef} type="button" onClick={() => { add(size); setAdded(true); setTimeout(() => setOpen(true), 350); }} className="bouton bouton-or mt-7 w-full text-[1.02rem]">
            {added ? <>Ajouté à ton panier <IconCheck /></> : <>Ajouter au panier · <span className="chiffres">{euros(s.price)}</span></>}
          </button>
          <p className="mt-3 text-center text-[0.82rem] text-texte-muted">Boutique en préparation : le paiement n'est pas encore ouvert.</p>

          <ul className="mt-8 space-y-3 border-t border-bordure pt-6">
            {CARACTERISTIQUES.map((c) => (
              <li key={c} className="flex gap-3 text-[0.95rem] text-secondaire"><span className="mt-0.5 shrink-0 text-or"><IconCheck /></span>{c}</li>
            ))}
          </ul>
          <p className="mt-6 text-[0.8rem] text-texte-muted">Mesures provisoires, vérifiées sur échantillon avant l'ouverture.</p>
        </div>
      </div>
    </section>
  );
}

const COUCHES = [
  { t: 'Housse matelassée amovible', d: 'Douce au toucher, motif chevrons, elle s’enlève pour passer au lavage.' },
  { t: 'Mousse à mémoire de forme', d: 'Elle épouse le corps de ton chien et répartit son poids.' },
  { t: 'Mousse de soutien', d: 'Plus ferme, elle évite qu’il ne s’enfonce jusqu’au sol.' },
  { t: 'Doublure imperméable et fond antidérapant', d: 'Elle protège la mousse des petits accidents et garde le panier en place.' },
];

/* Schéma des 4 couches, en vue éclatée (formes simples, aucune image). */
function SchemaCouches() {
  const couches = [
    { c: 'h-8 bg-taupe bg-[repeating-linear-gradient(135deg,transparent_0_9px,rgb(255_255_255/0.3)_9px_11px)]', n: 'Housse' },
    { c: 'h-12 bg-carte ring-1 ring-bordure', n: 'Mémoire de forme' },
    { c: 'h-10 bg-secondaire', n: 'Soutien' },
    { c: 'h-3 bg-primaire', n: 'Doublure' },
  ];
  return (
    <div aria-hidden="true" className="rounded-2xl bg-fond p-5 ring-1 ring-bordure sm:p-7">
      {couches.map((x, n) => (
        <div key={x.n} className="flex items-center gap-4 py-2">
          <span className="serif grid h-8 w-8 shrink-0 place-items-center rounded-full border border-or text-[1.05rem] leading-none text-or">{n + 1}</span>
          <div className={`flex-1 rounded-md shadow-sm ${x.c}`} />
          <span className="w-28 shrink-0 text-[0.78rem] font-medium text-texte-muted sm:w-32">{x.n}</span>
        </div>
      ))}
    </div>
  );
}

function Couches() {
  return (
    <section aria-labelledby="titre-couches" className="border-t border-bordure bg-carte">
      <div className="conteneur grid grid-cols-1 gap-12 py-20 md:grid-cols-2 md:items-center md:gap-16 md:py-28">
        <div>
          <p className="surtitre text-or">Comment c'est fait</p>
          <h2 id="titre-couches" data-reveal className="mt-4 text-[clamp(2.2rem,4.4vw,3.5rem)] text-primaire">Quatre couches, <em>une seule idée</em> : son confort.</h2>
          <div className="mt-10"><SchemaCouches /></div>
        </div>
        <ol className="space-y-7">
          {COUCHES.map((c, n) => (
            <li key={c.t} data-reveal className="flex gap-5 border-t border-bordure pt-6">
              <span className="serif chiffres text-[1.75rem] leading-none text-or" aria-hidden="true">{n + 1}</span>
              <div><h3 className="text-[1.5rem] text-primaire">{c.t}</h3><p className="mt-1.5 text-texte-muted">{c.d}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Pourquoi() {
  const blocs = [
    ['Un appui partout', 'Un coussin classique se tasse là où le corps pèse le plus. La mémoire de forme répartit le poids sur toute la surface.'],
    ['Moins de points de pression', 'Hanches, épaules, coudes : ce sont eux qui touchent le sol en premier. Ici, ils reposent sur une mousse qui les accueille.'],
    ['Un repos plus profond', 'Un chien bien installé change moins souvent de position. Il peut enfin s’abandonner à de longues siestes.'],
  ];
  return (
    <section aria-labelledby="titre-pourquoi" className="bg-fond">
      <div className="conteneur py-20 md:py-28">
        <h2 id="titre-pourquoi" data-reveal className="max-w-[16ch] text-[clamp(2.2rem,4.4vw,3.5rem)] text-primaire">Pourquoi un panier <em>orthopédique</em> ?</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          {blocs.map(([t, d], n) => (
            <div key={t} data-reveal className="rounded-2xl border border-bordure bg-carte p-7">
              <p className="serif text-[2rem] italic leading-none text-or" aria-hidden="true">{['i', 'ii', 'iii'][n]}.</p>
              <h3 className="mt-4 text-[1.6rem] text-primaire">{t}</h3>
              <p className="mt-2 text-texte-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tailles({ choose }: { choose: (s: SizeId) => void }) {
  const [len, setLen] = useState(65);
  const [kg, setKg] = useState(20);
  const best = sizeFor(len, kg);
  const a = useId(), b = useId();
  return (
    <section id="tailles" aria-labelledby="titre-tailles" className="border-y border-bordure bg-muted">
      <div className="conteneur grid grid-cols-1 gap-12 py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-14 md:py-28">
        <div>
          <h2 id="titre-tailles" data-reveal className="text-[clamp(2.2rem,4.4vw,3.5rem)] text-primaire">Trouver <em>sa</em> taille</h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-bordure bg-carte">
            <table className="w-full min-w-[20rem] border-collapse text-left text-[0.88rem]">
              <caption className="sr-only">Les quatre tailles du panier Veilleuse (mesures provisoires, à confirmer)</caption>
              <thead>
                <tr className="border-b border-bordure text-[0.72rem] uppercase tracking-[0.12em] text-texte-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">Taille</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Dimensions</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Poids du chien</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Prix</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map((x) => (
                  <tr key={x.id} className={`border-b border-bordure last:border-0 ${x.id === best.id ? 'bg-fond' : ''}`}>
                    <th scope="row" className="px-4 py-3.5 align-top font-normal">
                      <span className="serif block text-[1.6rem] leading-none text-primaire">{x.id}</span>
                      <span className="mt-1 block text-[0.78rem] leading-snug text-texte-muted">{x.example}</span>
                    </th>
                    <td className="chiffres whitespace-nowrap px-2 py-3.5 align-top text-secondaire">{x.outer[0]} × {x.outer[1]} cm</td>
                    <td className="chiffres px-2 py-3.5 align-top text-secondaire">jusqu'à {x.maxWeight} kg</td>
                    <td className="chiffres whitespace-nowrap px-4 py-3.5 text-right align-top font-semibold text-primaire">{euros(x.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[0.8rem] text-texte-muted">Mesures provisoires, à confirmer.</p>
        </div>

        <div className="md:pt-4">
          <div className="rounded-2xl border border-bordure bg-carte p-6 md:p-8">
            <p className="text-[0.95rem] text-secondaire">Mesure ton chien allongé, du bout du museau à la base de la queue. Ajoute 15 à 20 cm pour qu'il puisse s'étirer.</p>
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex items-baseline justify-between gap-3"><label htmlFor={a} className="text-[0.95rem] font-semibold text-primaire">Longueur de ton chien allongé</label><output htmlFor={a} className="chiffres serif shrink-0 text-[1.75rem] text-primaire">{len} cm</output></div>
                <input id={a} type="range" min={25} max={120} value={len} onChange={(e) => setLen(+e.target.value)} />
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-3"><label htmlFor={b} className="text-[0.95rem] font-semibold text-primaire">Son poids</label><output htmlFor={b} className="chiffres serif shrink-0 text-[1.75rem] text-primaire">{kg} kg</output></div>
                <input id={b} type="range" min={2} max={75} value={kg} onChange={(e) => setKg(+e.target.value)} />
              </div>
            </div>
            <div className="sombre mt-6 rounded-xl bg-primaire p-5 text-clair" aria-live="polite">
              <p className="surtitre text-clair-muted">Taille conseillée</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="serif text-[3.5rem] leading-none text-or-clair">{best.id}</span>
                <span className="chiffres text-[0.9rem] leading-snug text-clair-muted">{best.outer[0]} × {best.outer[1]} cm<br />{euros(best.price)}</span>
              </div>
              {kg > 65 && <p className="mt-3 text-[0.85rem] text-clair-muted">La taille XL est prévue jusqu'à 65 kg. Au-delà, nous préférons ne rien te promettre que nous n'avons pas vérifié.</p>}
              <a href="#produit" onClick={() => choose(best.id)} className="bouton bouton-or mt-5 w-full">Choisir la taille {best.id} <IconArrow /></a>
            </div>
            <p className="mt-5 text-[0.9rem] text-secondaire"><strong className="font-semibold text-primaire">Entre deux tailles ?</strong> Prends la plus grande. Un vieux chien aime s'étaler.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Engagements() {
  const items = [
    ['Aucun faux avis', 'Pas d’étoiles inventées, pas de témoignages fabriqués. Les avis viendront de vrais clients, ou ne viendront pas.'],
    ['Des mesures vérifiées', 'Nous contrôlons chaque taille sur échantillon avant d’ouvrir la boutique. Les chiffres affichés seront ceux que tu recevras.'],
    ['Aucune pression', 'Pas de compte à rebours, pas de stock « presque épuisé ». Prends le temps qu’il te faut.'],
  ];
  return (
    <section aria-labelledby="titre-engagements" className="bg-fond">
      <div className="conteneur py-20 md:py-28">
        <h2 id="titre-engagements" data-reveal className="text-[clamp(2.2rem,4.4vw,3.5rem)] text-primaire">Ce que <em>nous promettons</em></h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {items.map(([t, d]) => (
            <div key={t} data-reveal className="border-t-2 border-or pt-6">
              <h3 className="text-[1.6rem] text-primaire">{t}</h3>
              <p className="mt-2 text-texte-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  ['Comment laver le panier ?', 'La housse s’enlève et se lave. Les consignes exactes de lavage seront précisées à l’ouverture de la boutique, après test sur échantillon.'],
  ['Comment choisir la bonne taille ?', 'Mesure ton chien allongé, du museau à la base de la queue, puis ajoute 15 à 20 cm. En cas de doute, choisis la taille au-dessus.'],
  ['Le panier est-il vraiment imperméable ?', 'Oui, une doublure 100 % imperméable entoure la mousse. Elle la protège des petits accidents, fréquents avec l’âge.'],
  ['Mon chien est très lourd. Le panier tiendra-t-il ?', 'La taille XL est prévue pour les chiens jusqu’à 65 kg. Au-delà, nous préférons ne rien te promettre que nous n’avons pas vérifié.'],
  ['Quand et comment sera-t-il livré ?', 'La boutique est encore en préparation. Livraison, retours et paiement seront détaillés ici avant la première commande.'],
  ['Ce panier soigne-t-il l’arthrose ?', 'Non. Un panier ne soigne pas, il offre du confort et un meilleur repos. Si ton chien a mal, parles-en à ton vétérinaire.'],
];

function Faq() {
  return (
    <section aria-labelledby="titre-faq" className="border-t border-bordure bg-carte">
      <div className="conteneur max-w-3xl py-20 md:py-28">
        <h2 id="titre-faq" data-reveal className="text-[clamp(2.2rem,4.4vw,3.5rem)] text-primaire">Questions <em>fréquentes</em></h2>
        <div className="mt-10 border-t border-bordure">
          {FAQ.map(([q, r]) => (
            <details key={q} className="group border-b border-bordure">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.02rem] font-semibold text-primaire">
                {q}<span className="shrink-0 text-or transition-transform duration-300 group-open:rotate-180"><IconChevron /></span>
              </summary>
              <p className="pb-5 pr-8 text-texte-muted">{r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function DernierAppel() {
  return (
    <section aria-labelledby="titre-fin" className="sombre bg-primaire text-clair">
      <div className="conteneur flex flex-col items-center py-24 text-center md:py-32">
        <img src="./logo/symbole.svg" alt="" width={56} height={56} loading="lazy" className="h-14 w-14" />
        <h2 id="titre-fin" data-reveal className="mt-8 max-w-[18ch] text-[clamp(2.5rem,5.6vw,4.5rem)]">Il a veillé sur toi toute sa vie. <em>À ton tour.</em></h2>
        <a href="#produit" className="bouton bouton-or mt-10 w-full max-w-sm text-[1.02rem] sm:w-auto">Choisir son panier Veilleuse <IconArrow /></a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="sombre border-t border-secondaire bg-primaire text-clair-muted">
      <div className="conteneur flex flex-col gap-8 py-14 pb-28 md:flex-row md:items-end md:justify-between md:pb-14">
        <div className="space-y-4">
          <Logo clair className="h-10 w-auto" />
          <p className="serif max-w-sm text-[1.35rem] italic leading-snug text-clair">Veilleuse — une lumière douce pour ses nuits.</p>
        </div>
        <div className="max-w-md space-y-1.5 text-[0.85rem]">
          <p>Boutique en préparation. Aucune commande n'est encore possible.</p>
          <p>Livraison, retours et paiement : informations à venir.</p>
          <p>Ce panier apporte du confort, il ne remplace pas un avis vétérinaire.</p>
          <p>© Veilleuse</p>
        </div>
      </div>
    </footer>
  );
}

/* Barre d'achat collante (téléphone) : visible dans la zone produit quand le bouton principal n'est plus à l'écran. */
function BarreAchat({ size, buyRef }: { size: SizeId; buyRef: React.RefObject<HTMLButtonElement | null> }) {
  const [inZone, setInZone] = useState(false);
  const [btnVisible, setBtnVisible] = useState(true);
  const { add, setOpen } = useCart();
  const s = SIZES.find((x) => x.id === size)!;
  useEffect(() => {
    const zone = document.getElementById('produit');
    const btn = buyRef.current;
    if (!zone || !btn) return;
    const o1 = new IntersectionObserver(([e]) => setInZone(e.isIntersecting), { rootMargin: '0px 0px -20% 0px' });
    const o2 = new IntersectionObserver(([e]) => setBtnVisible(e.isIntersecting));
    o1.observe(zone); o2.observe(btn);
    return () => { o1.disconnect(); o2.disconnect(); };
  }, [buyRef]);
  const show = inZone && !btnVisible;
  return (
    <div aria-hidden={!show} inert={!show}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-bordure bg-carte pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(0_0_0/0.08)] transition-transform duration-300 md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="conteneur flex items-center justify-between gap-3 py-2.5">
        <p className="leading-tight"><span className="block text-[0.78rem] text-texte-muted">Panier Veilleuse · taille {s.id}</span><span className="chiffres serif text-[1.4rem] text-primaire">{euros(s.price)}</span></p>
        <button type="button" onClick={() => { add(size); setOpen(true); }} className="bouton bouton-or min-h-12 px-5 text-[0.95rem]">Ajouter au panier</button>
      </div>
    </div>
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
    if (panel.current && !reduceMotion()) gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.45, ease: 'expo.out' });
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open, setOpen]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="titre-tiroir">
      <button type="button" aria-label="Fermer le panier" className="absolute inset-0 cursor-default bg-primaire/60" onClick={() => setOpen(false)} />
      <div ref={panel} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-fond pb-[env(safe-area-inset-bottom)] text-texte shadow-2xl">
        <div className="flex items-center justify-between border-b border-bordure px-5 py-4">
          <h2 id="titre-tiroir" className="text-[2rem] text-primaire">Ton panier</h2>
          <button ref={close} type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full hover:bg-muted"><IconClose /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6">
            <p className="serif text-[1.6rem] text-primaire">Il est vide pour l’instant.</p>
            <a href="#produit" onClick={() => setOpen(false)} className="bouton bouton-or">Choisir sa taille <IconArrow /></a>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-bordure overflow-y-auto px-5" data-lenis-prevent>
              {lines.map((l) => (
                <li key={l.size.id} className="flex items-center gap-4 py-5">
                  <img src={PHOTOS[0].mini} alt="" width={240} height={180} className="h-14 w-16 shrink-0 rounded-lg bg-carte object-cover ring-1 ring-bordure" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-primaire">Panier Veilleuse · {l.size.id}</p>
                    <p className="chiffres text-[0.85rem] text-texte-muted">{l.size.outer[0]} × {l.size.outer[1]} cm</p>
                    <div className="mt-2 flex items-center gap-1" role="group" aria-label={`Quantité, taille ${l.size.id}`}>
                      <button type="button" onClick={() => setQty(l.size.id, l.qty - 1)} aria-label="Retirer un panier" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-bordure hover:bg-carte"><IconMinus /></button>
                      <span className="chiffres w-8 text-center" aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.size.id, l.qty + 1)} aria-label="Ajouter un panier" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-bordure hover:bg-carte"><IconPlus /></button>
                    </div>
                  </div>
                  <p className="chiffres font-semibold text-primaire">{euros(l.qty * l.size.price)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-bordure px-5 py-5">
              <div className="flex items-baseline justify-between"><span className="text-texte-muted">Total</span><span className="chiffres serif text-[2rem] text-primaire">{euros(total)}</span></div>
              <button type="button" disabled className="flex min-h-13 w-full cursor-not-allowed items-center justify-center rounded-full bg-muted px-6 font-semibold text-texte-muted ring-1 ring-bordure">Paiement bientôt disponible</button>
              <p className="text-[0.82rem] text-texte-muted">La boutique ouvre bientôt. Ton panier reste enregistré sur cet appareil.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Apparitions douces au défilement : opacité + petit glissement, une seule fois. Rien si l'utilisateur réduit les animations. */
function useReveal() {
  useEffect(() => {
    if (reduceMotion()) return;
    const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
    gsap.set(els, { opacity: 0, y: 18 });
    const triggers = ScrollTrigger.batch(els, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08, overwrite: true }),
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => { triggers.forEach((t) => t.kill()); gsap.set(els, { clearProps: 'opacity,transform' }); };
  }, []);
}

export default function App() {
  const [size, setSize] = useState<SizeId>('M');
  const buyRef = useRef<HTMLButtonElement>(null);
  useReveal();
  return (
    <CartProvider>
      <SmoothScroll>
        <Header />
        <main>
          <Hero />
          <Reassurance />
          <Signes />
          <Produit size={size} setSize={setSize} buyRef={buyRef} />
          <Couches />
          <Pourquoi />
          <Tailles choose={setSize} />
          <Engagements />
          <Faq />
          <DernierAppel />
        </main>
        <Footer />
        <BarreAchat size={size} buyRef={buyRef} />
        <CartDrawer />
      </SmoothScroll>
    </CartProvider>
  );
}
