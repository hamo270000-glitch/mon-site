import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PRODUITS, RAYONS, euros, trouve } from '../data';
import { lien } from '../router';
import Visuel from '../ui/Visuel';
import Carte from '../ui/Carte';
import { IconFleche, IconGauche, IconDroite, IconCamion, IconRetour, IconCadenas, IconBulle, IconCheck, IconChevron } from '../ui/Icons';

gsap.registerPlugin(ScrollTrigger);

const SLIDES = [
  { sur: 'Meilleure vente', titre: 'Le panier orthopédique qui l’aide à se relever.', texte: 'Mousse à mémoire de forme, rebords pour poser la tête, housse lavable. De la taille S à XL.', cta: 'Découvrir le panier Nuage', href: lien.produit('panier-nuage'), teinte: '#efe4d2', vue: 'Panier Nuage avec un chien' },
  { sur: 'Repas', titre: 'Il mange trop vite ? On ralentit le rythme.', texte: 'La gamelle anti-glouton Zen transforme le repas en petit jeu.', cta: 'Voir les gamelles', href: lien.collection('repas'), teinte: '#dfe9e1', vue: 'Gamelle anti-glouton' },
  { sur: 'Balade', titre: 'Des balades sans tirer sur la gorge.', texte: 'Harnais rembourré, réglable en 4 points, avec bandes réfléchissantes.', cta: 'Voir la balade', href: lien.collection('balade'), teinte: '#dde6ef', vue: 'Harnais porté' },
];

function Carrousel() {
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  const zone = useRef<HTMLDivElement>(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const aller = useCallback((n: number) => setI((n + SLIDES.length) % SLIDES.length), []);
  useEffect(() => {
    if (pause || reduce) return;
    const t = window.setTimeout(() => aller(i + 1), 6500);
    return () => window.clearTimeout(t);
  }, [i, pause, reduce, aller]);
  useEffect(() => {
    if (reduce || !zone.current) return;
    const q = gsap.utils.selector(zone);
    gsap.fromTo(q('[data-anim]'), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
    gsap.fromTo(q('[data-visuel]'), { scale: 1.06, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'power2.out' });
  }, [i, reduce]);

  const s = SLIDES[i];
  return (
    <section aria-roledescription="carrousel" aria-label="À la une" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} onFocus={() => setPause(true)} onBlur={() => setPause(false)}
      className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 md:pt-6">
      <div ref={zone} className="relative grid overflow-hidden rounded-3xl transition-colors duration-700 md:grid-cols-2" style={{ backgroundColor: s.teinte }}>
        <div className="order-2 flex flex-col justify-center gap-4 p-6 sm:p-10 md:order-1 md:p-14" aria-live={pause ? 'polite' : 'off'}>
          <p data-anim className="text-sm font-bold uppercase tracking-[0.14em] text-abricot-2">{s.sur}</p>
          <h1 data-anim className="text-[clamp(2rem,4.6vw,3.6rem)] text-foret">{s.titre}</h1>
          <p data-anim className="max-w-md text-lg text-doux">{s.texte}</p>
          <div data-anim className="mt-2 flex flex-wrap items-center gap-3">
            <a href={s.href} className="inline-flex min-h-13 items-center gap-2 rounded-full bg-foret px-6 font-bold text-creme transition-colors hover:bg-foret-2">{s.cta} <IconFleche /></a>
          </div>
        </div>
        <div className="order-1 aspect-[4/3] overflow-hidden md:order-2 md:aspect-auto md:min-h-[30rem]">
          <div data-visuel className="h-full w-full"><Visuel teinte={s.teinte} vue={s.vue} /></div>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 md:bottom-6 md:right-6">
          <button type="button" onClick={() => aller(i - 1)} aria-label="Diapositive précédente" className="grid size-10 cursor-pointer place-items-center rounded-full bg-white/90 shadow-sm hover:bg-white"><IconGauche /></button>
          <div className="flex gap-1.5 px-1">
            {SLIDES.map((x, n) => (
              <button key={x.titre} type="button" onClick={() => aller(n)} aria-label={`Diapositive ${n + 1}`} aria-current={n === i ? 'true' : undefined}
                className={`h-2 cursor-pointer rounded-full transition-[width,background-color] duration-300 ${n === i ? 'w-7 bg-foret' : 'w-2 bg-foret/30'}`} />
            ))}
          </div>
          <button type="button" onClick={() => aller(i + 1)} aria-label="Diapositive suivante" className="grid size-10 cursor-pointer place-items-center rounded-full bg-white/90 shadow-sm hover:bg-white"><IconDroite /></button>
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  { q: 'Quelle taille de panier choisir ?', r: 'Mesure ton chien couché, du bout du nez à la base de la queue, et ajoute 15 à 20 cm. Le guide des tailles détaille chaque modèle.' },
  { q: 'Quels sont les délais de livraison ?', r: 'Les produits sont expédiés avec un suivi. Le délai exact et les frais sont affichés avant le paiement.' },
  { q: 'Puis-je retourner un produit ?', r: 'Oui, tu as 14 jours après réception pour changer d’avis, comme le prévoit la loi.' },
  { q: 'Les housses passent-elles en machine ?', r: 'Oui, les housses des paniers et coussins se lavent à 30 °C. Les détails d’entretien sont sur chaque fiche produit.' },
];

export default function Accueil() {
  const root = useRef<HTMLDivElement>(null);
  const [onglet, setOnglet] = useState<'ventes' | 'nouveautes'>('ventes');
  const [faq, setFaq] = useState<number | null>(0);
  const star = trouve('panier-nuage')!;
  const liste = PRODUITS.filter((p) => (onglet === 'ventes' ? p.badge === 'Meilleure vente' || p.id === 'coussin-donut' : p.badge === 'Nouveau' || p.id === 'plaid-doudou')).slice(0, 4);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 36, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    ScrollTrigger.batch('[data-grille] > *', {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07, overwrite: true }),
    });
    gsap.to('[data-parallaxe]', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '[data-parallaxe]', start: 'top bottom', end: 'bottom top', scrub: true } });
  }, { scope: root });

  return (
    <div ref={root}>
      <Carrousel />

      {/* Rayons */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6" aria-labelledby="titre-rayons">
        <div data-reveal className="flex items-end justify-between gap-4">
          <h2 id="titre-rayons" className="text-[clamp(1.6rem,3vw,2.2rem)]">Acheter par rayon</h2>
          <a href={lien.collection()} className="hidden items-center gap-1 font-semibold text-foret hover:underline sm:inline-flex">Tout voir <IconFleche /></a>
        </div>
        <div data-grille className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
          {RAYONS.map((r) => (
            <a key={r.id} href={lien.collection(r.id)} className="group w-[62%] shrink-0 snap-start sm:w-auto">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-ligne">
                <div className="h-full transition-transform duration-700 ease-out group-hover:scale-105"><Visuel teinte={r.teinte} vue={r.label} /></div>
              </div>
              <p className="mt-3 flex items-center justify-between font-semibold">{r.label}<span className="transition-transform duration-300 group-hover:translate-x-1"><IconFleche /></span></p>
              <p className="text-sm text-doux">{r.phrase}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Produits */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6" aria-labelledby="titre-produits">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="titre-produits" className="text-[clamp(1.6rem,3vw,2.2rem)]">Les favoris de nos clients</h2>
          <div role="tablist" aria-label="Sélection" className="flex rounded-full bg-creme-2 p-1">
            {([['ventes', 'Meilleures ventes'], ['nouveautes', 'Nouveautés']] as const).map(([id, label]) => (
              <button key={id} role="tab" type="button" aria-selected={onglet === id} onClick={() => setOnglet(id)}
                className={`min-h-10 cursor-pointer rounded-full px-4 text-sm font-bold transition-colors ${onglet === id ? 'bg-white text-foret shadow-sm' : 'text-doux hover:text-encre'}`}>{label}</button>
            ))}
          </div>
        </div>
        <div key={onglet} data-grille className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">
          {liste.map((p) => <Carte key={p.id} p={p} />)}
        </div>
      </section>

      {/* Produit vedette */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6" aria-labelledby="titre-star">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-white ring-1 ring-ligne md:grid-cols-2">
          <div className="aspect-square overflow-hidden md:aspect-auto md:h-full md:min-h-[32rem]">
            <div data-parallaxe className="h-[110%]"><Visuel teinte={star.teinte} vue={star.vues[1]} /></div>
          </div>
          <div data-reveal className="p-6 sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-abricot-2">Notre produit phare</p>
            <h2 id="titre-star" className="mt-2 text-[clamp(1.8rem,3.6vw,2.8rem)] text-foret">{star.nom}</h2>
            <p className="mt-3 text-lg text-doux">{star.description}</p>
            <ul className="mt-6 space-y-2.5">{star.points.map((t) => <li key={t} className="flex gap-3"><span className="mt-0.5 text-foret"><IconCheck /></span>{t}</li>)}</ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={lien.produit(star.id)} className="inline-flex min-h-13 items-center gap-2 rounded-full bg-abricot px-6 font-bold text-sur-abricot transition-colors hover:bg-abricot-2">Choisir ma taille <IconFleche /></a>
              <p className="chiffres text-lg"><span className="text-doux">de </span><strong>{euros(89)}</strong><span className="text-doux"> à </span><strong>{euros(149)}</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* Réassurance */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6" aria-label="Nos engagements">
        <ul data-grille className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { i: <IconCamion />, t: 'Livraison suivie', d: 'Délai affiché avant de payer' },
            { i: <IconRetour />, t: '14 jours', d: 'Pour changer d’avis' },
            { i: <IconCadenas />, t: 'Paiement sécurisé', d: 'Carte bancaire chiffrée' },
            { i: <IconBulle />, t: 'Une question ?', d: 'Réponse sous 24 h ouvrées' },
          ].map((e) => (
            <li key={e.t} className="flex flex-col gap-2 rounded-2xl bg-white p-5 ring-1 ring-ligne sm:flex-row sm:items-center sm:gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-menthe text-foret">{e.i}</span>
              <span><strong className="block">{e.t}</strong><span className="text-sm text-doux">{e.d}</span></span>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-20 sm:px-6 md:grid-cols-[0.8fr_1.2fr]" aria-labelledby="titre-faq">
        <div data-reveal>
          <h2 id="titre-faq" className="text-[clamp(1.6rem,3vw,2.2rem)]">Questions fréquentes</h2>
          <p className="mt-3 text-doux">Tu ne trouves pas ta réponse ? <a href={lien.aide('contact')} className="font-semibold text-foret underline underline-offset-4">Écris-nous</a>.</p>
        </div>
        <div className="divide-y divide-ligne border-y border-ligne">
          {FAQ.map((f, n) => (
            <div key={f.q}>
              <h3>
                <button type="button" onClick={() => setFaq(faq === n ? null : n)} aria-expanded={faq === n} aria-controls={`faq-${n}`}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-lg font-semibold">
                  {f.q}<span className={`shrink-0 transition-transform duration-300 ${faq === n ? 'rotate-180' : ''}`}><IconChevron /></span>
                </button>
              </h3>
              <div id={`faq-${n}`} className={`grid transition-[grid-template-rows] duration-300 ${faq === n ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <p className="overflow-hidden text-doux"><span className="block pb-4">{f.r}</span></p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Nouveautes />
    </div>
  );
}

function Nouveautes() {
  const [ok, setOk] = useState(false);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6" aria-labelledby="titre-lettre">
      <div data-reveal className="grid items-center gap-6 rounded-3xl bg-foret p-8 text-creme md:grid-cols-2 md:p-12">
        <div>
          <h2 id="titre-lettre" className="text-[clamp(1.6rem,3vw,2.2rem)]">Reçois nos nouveautés</h2>
          <p className="mt-2 text-creme/75">Un e-mail de temps en temps : nouveaux produits et conseils pour ton chien. Désinscription en un clic.</p>
        </div>
        {ok ? (
          <p className="rounded-2xl bg-creme/10 p-4 font-semibold" role="status">Merci ! L’inscription sera active à l’ouverture de la boutique.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setOk(true); }} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="email" className="sr-only">Ton adresse e-mail</label>
            <input id="email" type="email" required autoComplete="email" placeholder="ton@email.fr" className="h-13 flex-1 rounded-full bg-white px-5 text-encre placeholder:text-doux/70 focus:outline-none focus:ring-3 focus:ring-abricot" />
            <button type="submit" className="h-13 cursor-pointer rounded-full bg-abricot px-6 font-bold text-sur-abricot hover:bg-abricot-2">Je m’inscris</button>
          </form>
        )}
      </div>
    </section>
  );
}
