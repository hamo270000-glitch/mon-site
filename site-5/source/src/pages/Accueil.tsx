import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { PRODUITS, RAYONS, euros } from '../data';
import { lien } from '../router';
import Mascotte from '../ui/Mascotte';
import Art, { Panier } from '../ui/Art';
import Carte from '../ui/Carte';
import { IconFleche, IconPatte, IconCamion, IconRetour, IconLavage, IconCheck } from '../ui/Icons';

gsap.registerPlugin(ScrollTrigger, SplitText);

const COUCHES = [
  { nom: 'Housse douce', role: 'Déhoussable, lavable à 30 °C.' },
  { nom: 'Mousse à mémoire de forme', role: 'Épouse le corps et répartit le poids.' },
  { nom: 'Mousse de soutien', role: 'Garde sa forme, nuit après nuit.' },
  { nom: 'Semelle antidérapante', role: 'Le panier ne glisse pas sur le carrelage.' },
];
const ARGUMENTS = ['Dormir mieux', 'Manger moins vite', 'Se balader sans tirer', 'Jouer plus longtemps', 'Housse lavable'];

export default function Accueil() {
  const root = useRef<HTMLDivElement>(null);
  const star = PRODUITS[0];

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const q = gsap.utils.selector(root);

    // Titre : les lettres arrivent en rebondissant.
    const split = SplitText.create(q('[data-titre]'), { type: 'words,chars', mask: 'words' });
    gsap.from(split.chars, { yPercent: 110, rotation: 8, duration: 0.8, ease: 'back.out(1.8)', stagger: 0.025, delay: 0.15 });
    gsap.from(q('[data-hero-fade]'), { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.55 });
    gsap.from(q('[data-pastille]'), { scale: 0, rotation: -30, duration: 0.9, ease: 'back.out(2.2)', stagger: 0.12, delay: 0.9 });

    // Formes du fond qui bougent doucement.
    q('[data-blob]').forEach((b, i) => {
      gsap.to(b, { x: `random(-40, 40)`, y: `random(-30, 30)`, rotation: `random(-25, 25)`, scale: `random(0.9, 1.12)`, duration: 6 + i, ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true });
    });

    // Titres de section : mots qui montent au défilement.
    q('[data-mots]').forEach((el) => {
      const s = SplitText.create(el, { type: 'words', mask: 'words' });
      gsap.from(s.words, { yPercent: 100, duration: 0.7, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });

    // Cartes et blocs : arrivée en vague.
    ScrollTrigger.batch(q('[data-vague] > *'), {
      start: 'top 88%',
      onEnter: (els) => gsap.from(els, { y: 40, scale: 0.94, opacity: 0, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.08, overwrite: true }),
      once: true,
    });

    // Le bandeau penche selon la vitesse de défilement.
    const ruban = q('[data-ruban]')[0];
    const skew = gsap.quickTo(ruban, 'skewX', { duration: 0.5, ease: 'power3' });
    ScrollTrigger.create({ onUpdate: (st) => skew(gsap.utils.clamp(-8, 8, st.getVelocity() / -300)) });
    ScrollTrigger.refresh();
  }, { scope: root });

  return (
    <div ref={root}>
      {/* HÉROS */}
      <section className="relative isolate overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div data-blob className="absolute -left-24 top-10 size-[26rem] rounded-[42%_58%_60%_40%] bg-sable/80 blur-[2px]" />
          <div data-blob className="absolute -right-20 top-40 size-[22rem] rounded-[60%_40%_45%_55%] bg-menthe/80" />
          <div data-blob className="absolute bottom-0 left-1/3 size-[18rem] rounded-[50%_50%_38%_62%] bg-rose/70" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-8 md:grid-cols-[1.05fr_1fr]">
          <div>
            <a data-hero-fade href={lien.produit(star.id)} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-sm ring-1 ring-encre/5 hover:ring-foret/30">
              <span className="rounded-full bg-abricot px-2 py-0.5 text-sur-abricot">Nouveau</span> Le panier orthopédique Nuage <IconFleche />
            </a>
            <h1 data-titre className="mt-5 text-[clamp(3rem,8.5vw,6.4rem)] text-foret">Des jours tout doux pour ton chien.</h1>
            <p data-hero-fade className="mt-5 max-w-lg text-xl text-doux">Paniers orthopédiques, gamelles, harnais et jouets : on choisit peu de produits, mais des bons, pour qu’il dorme, mange et se balade mieux.</p>
            <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
              <a href={lien.boutique()} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-abricot px-7 text-lg font-bold text-sur-abricot shadow-[0_2px_0_#b8461a,0_12px_28px_-10px_rgb(240_106_40/0.7)] transition-transform hover:-translate-y-0.5">Voir la boutique <IconFleche /></a>
              <a href={lien.produit(star.id)} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-white px-7 text-lg font-bold text-foret ring-2 ring-foret/15 transition-colors hover:bg-foret hover:text-creme">Le panier Nuage, dès {euros(89)}</a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[34rem]">
            <Mascotte className="relative z-10 w-full drop-shadow-[0_30px_30px_rgb(28_43_34/0.12)]" />
            <span data-pastille className="flotte absolute left-0 top-[18%] z-20 rounded-2xl bg-white px-3 py-2 text-sm font-bold shadow-lg [--r:-6deg]"><span className="text-abricot">●</span> Mémoire de forme</span>
            <span data-pastille className="flotte absolute right-0 top-[8%] z-20 rounded-2xl bg-foret px-3 py-2 text-sm font-bold text-creme shadow-lg [--r:5deg] [animation-delay:-1.5s]">Lavable à 30 °C</span>
            <span data-pastille className="flotte absolute bottom-[8%] right-[4%] z-20 rounded-2xl bg-abricot px-3 py-2 text-sm font-bold text-sur-abricot shadow-lg [--r:-4deg] [animation-delay:-3s]">Antidérapant</span>
          </div>
        </div>
      </section>

      {/* BANDEAU */}
      <div className="relative -my-2 overflow-hidden py-6" aria-hidden="true">
        <div data-ruban className="-rotate-2 bg-foret py-4 text-creme">
          <div className="defile flex w-max gap-10 whitespace-nowrap font-[family-name:var(--font-titre)] text-3xl font-bold md:text-4xl">
            {[...ARGUMENTS, ...ARGUMENTS, ...ARGUMENTS, ...ARGUMENTS].map((t, i) => <span key={i} className="flex items-center gap-10">{t}<span className="text-abricot"><IconPatte /></span></span>)}
          </div>
        </div>
      </div>

      {/* RAYONS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8" aria-labelledby="titre-rayons">
        <h2 id="titre-rayons" data-mots className="max-w-2xl text-[clamp(2.2rem,5vw,3.6rem)]">Tout ce qu’il lui faut, rangé par moment de la journée.</h2>
        <div data-vague className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {RAYONS.map((r, i) => {
            const p = PRODUITS.find((x) => x.rayon === r.id)!;
            return (
              <a key={r.id} href={lien.boutique(r.id)} className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[2rem] p-5 transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-[-1deg]" style={{ background: r.fond }}>
                <div>
                  <p className="chiffres text-sm font-bold text-encre/60">0{i + 1}</p>
                  <h3 className="mt-1 text-3xl md:text-4xl">{r.label}</h3>
                  <p className="text-encre/75">{r.phrase}</p>
                </div>
                <Art art={p.art} a={p.coloris[0].a} b={p.coloris[0].b} className="w-full transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-110" />
                <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-white text-foret transition-transform duration-300 group-hover:rotate-[-45deg]" aria-hidden="true"><IconFleche /></span>
              </a>
            );
          })}
        </div>
      </section>

      <Couches />

      {/* PRODUITS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8" aria-labelledby="titre-produits">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="titre-produits" data-mots className="max-w-xl text-[clamp(2.2rem,5vw,3.6rem)]">Les essentiels de Biscuit.</h2>
          <a href={lien.boutique()} className="inline-flex items-center gap-2 font-bold text-foret underline-offset-4 hover:underline">Toute la boutique <IconFleche /></a>
        </div>
        <div data-vague className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUITS.map((p) => <Carte key={p.id} p={p} />)}
        </div>
      </section>

      {/* POURQUOI */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8" aria-labelledby="titre-pourquoi">
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-sable p-6 md:p-12">
          <h2 id="titre-pourquoi" data-mots className="max-w-2xl text-[clamp(2rem,4.5vw,3.2rem)]">Coussin classique ou panier orthopédique ?</h2>
          <div data-vague className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white/60 p-6">
              <p className="text-lg font-bold">Coussin classique</p>
              <ul className="mt-3 space-y-2 text-doux">
                <li>Rembourrage en fibres qui s’aplatit</li>
                <li>Le chien finit par toucher le sol</li>
                <li>Souvent pas déhoussable</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-foret p-6 text-creme">
              <p className="text-lg font-bold">Le panier Nuage</p>
              <ul className="mt-3 space-y-2">
                {['Mousse à mémoire de forme sur mousse de soutien', 'Garde son épaisseur dans le temps', 'Housse lavable à 30 °C'].map((t) => (
                  <li key={t} className="flex gap-2"><span className="mt-0.5 text-abricot"><IconCheck /></span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ENGAGEMENTS */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8" aria-label="Nos engagements">
        <ul data-vague className="grid gap-4 md:grid-cols-3">
          {[
            { i: <IconCamion />, t: 'Livraison suivie', d: 'Le délai exact est affiché avant de payer.' },
            { i: <IconRetour />, t: '14 jours pour changer d’avis', d: 'Comme le prévoit la loi, sans justification.' },
            { i: <IconLavage />, t: 'Fait pour durer', d: 'Housses lavables et matières solides.' },
          ].map((e) => (
            <li key={e.t} className="flex gap-4 rounded-3xl bg-white p-6 ring-1 ring-encre/5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-menthe text-foret">{e.i}</span>
              <span><strong className="block text-lg">{e.t}</strong><span className="text-doux">{e.d}</span></span>
            </li>
          ))}
        </ul>
      </section>

      {/* FIN */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <div className="relative grid items-center gap-6 overflow-hidden rounded-[2.5rem] bg-abricot p-8 text-sur-abricot md:grid-cols-[1.3fr_1fr] md:p-14">
          <div>
            <h2 data-mots className="text-[clamp(2.4rem,6vw,4.6rem)]">Biscuit a validé. À ton tour.</h2>
            <p className="mt-4 max-w-md text-lg">Commence par le panier Nuage : c’est celui qui change le plus le quotidien d’un chien.</p>
            <a href={lien.produit(star.id)} className="mt-7 inline-flex min-h-14 items-center gap-2 rounded-full bg-foret px-7 text-lg font-bold text-creme transition-transform hover:-translate-y-0.5">Je choisis sa taille <IconFleche /></a>
          </div>
          <Mascotte className="mx-auto w-full max-w-xs" coussin="#a9c4a6" ombre="#7f9e7c" />
        </div>
      </section>
    </div>
  );
}

// Section à part : seul ce bloc se redessine pendant le défilement.
function Couches() {
  const root = useRef<HTMLElement>(null);
  const star = PRODUITS[0];
  const [eclate, setEclate] = useState(0);
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setEclate(1); return; }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: '+=140%', pin: true, scrub: 0.6, onUpdate: (st) => setEclate(st.progress) });
    });
    mm.add('(max-width: 767px)', () => {
      ScrollTrigger.create({ trigger: root.current!.querySelector('[data-story-art]'), start: 'top 80%', end: 'bottom 25%', scrub: 0.6, onUpdate: (st) => setEclate(st.progress) });
    });
  }, { scope: root });
  const etape = Math.min(COUCHES.length - 1, Math.floor(eclate * COUCHES.length));
  return (
      <section ref={root} className="relative bg-foret text-creme md:h-svh" aria-labelledby="titre-story">
        <div className="mx-auto grid h-full max-w-7xl items-center gap-10 px-4 py-20 sm:px-8 md:grid-cols-2">
          <div>
            <p className="font-bold text-abricot">Notre star · {star.nom}</p>
            <h2 id="titre-story" className="mt-3 text-[clamp(2.2rem,5vw,3.8rem)]">Quatre couches pour qu’il se relève sans peine.</h2>
            <ol className="mt-8 space-y-3">
              {COUCHES.map((c, i) => (
                <li key={c.nom} className={`flex gap-4 rounded-2xl p-3 transition-[background-color,opacity] duration-300 ${i === etape ? 'bg-creme/12 opacity-100' : 'opacity-55'}`}>
                  <span className={`chiffres grid size-9 shrink-0 place-items-center rounded-full font-bold transition-colors ${i === etape ? 'bg-abricot text-sur-abricot' : 'bg-creme/15'}`}>{i + 1}</span>
                  <span><strong className="block text-lg">{c.nom}</strong><span className="text-creme/75">{c.role}</span></span>
                </li>
              ))}
            </ol>
            <a href={lien.produit(star.id)} className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-full bg-abricot px-6 font-bold text-sur-abricot">Choisir sa taille <IconFleche /></a>
          </div>
          <div data-story-art className="relative">
            <div aria-hidden="true" className="absolute inset-[10%] rounded-full bg-abricot/25 blur-3xl" />
            <svg viewBox="0 10 200 170" className="relative w-full" role="img" aria-label="Le panier Nuage vu en couches : housse, mousse à mémoire de forme, mousse de soutien, semelle">
              <Panier a={star.coloris[0].a} b={star.coloris[0].b} eclate={eclate} />
            </svg>
          </div>
        </div>
      </section>
  );
}
