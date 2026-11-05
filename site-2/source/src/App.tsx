import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SmoothScroll from './SmoothScroll';
import Aurora from './components/reactbits/Aurora';
import BlurText from './components/reactbits/BlurText';
import ShinyText from './components/reactbits/ShinyText';
import RotatingText from './components/reactbits/RotatingText';
import Magnet from './components/reactbits/Magnet';
import CountUp from './components/reactbits/CountUp';
import ScrollReveal from './components/reactbits/ScrollReveal';
import SpotlightCard from './components/reactbits/SpotlightCard';
import AnimatedContent from './components/reactbits/AnimatedContent';

gsap.registerPlugin(useGSAP);

const FEATURES = [
  { icon: '⚡', title: 'GSAP', text: 'Le moteur d’animation des grands sites : timelines, défilement, effets précis à la milliseconde.' },
  { icon: '🌊', title: 'Lenis', text: 'Un défilement doux et régulier, qui rend chaque page plus agréable à parcourir.' },
  { icon: '✨', title: 'React Bits', text: 'Des composants animés prêts à l’emploi : textes, fonds, cartes, boutons magnétiques.' },
  { icon: '⚛️', title: 'React', text: 'Des blocs réutilisables pour construire le site pièce par pièce, proprement.' },
];

// Bande de mots qui défile en boucle : écrite à la main avec GSAP.
function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.to(track.current, { xPercent: -50, duration: 18, ease: 'none', repeat: -1 });
  }, { scope: track });
  const words = ['Animé', 'Fluide', 'Rapide', 'Moderne', 'Unique', 'Vivant'];
  return (
    <div className="overflow-hidden border-y border-white/10 py-5" aria-hidden="true">
      <div ref={track} className="flex w-max gap-10 whitespace-nowrap text-3xl font-bold text-white/80 sm:text-5xl">
        {[...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w}
            <span className="text-violet">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SmoothScroll>
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 backdrop-blur-md">
        <a href="#top" className="text-lg font-bold tracking-tight">Site 2</a>
        <a href="#contact" className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/15">Contact</a>
      </header>

      <main id="top">
        {/* ---------- Accueil ---------- */}
        <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 text-center">
          <div className="absolute inset-0 opacity-70">
            <Aurora colorStops={['#8b5cf6', '#22d3ee', '#f472b6']} amplitude={1.1} blend={0.6} speed={0.6} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm ring-1 ring-white/15">
              <ShinyText text="Nouveau projet" speed={3} />
            </span>
            <BlurText
              text="Un site qui prend vie"
              animateBy="words"
              direction="top"
              delay={120}
              className="justify-center text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl"
            />
            <p className="flex flex-wrap items-center justify-center gap-2 text-lg text-white/70 sm:text-xl">
              Pensé pour être
              <RotatingText
                texts={['fluide', 'animé', 'rapide', 'unique']}
                mainClassName="overflow-hidden rounded-lg bg-violet px-2.5 py-0.5 font-semibold text-white"
                rotationInterval={2200}
              />
            </p>
            <Magnet padding={60} magnetStrength={3}>
              <a href="#outils" className="mt-2 inline-block rounded-full bg-white px-7 py-3.5 font-semibold text-ink shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                Découvrir
              </a>
            </Magnet>
          </div>
          <div className="absolute bottom-6 z-10 text-xs uppercase tracking-[0.3em] text-white/50">Fais défiler</div>
        </section>

        <Marquee />

        {/* ---------- Texte qui se révèle au défilement ---------- */}
        <section className="mx-auto max-w-3xl px-5 py-28">
          <ScrollReveal baseOpacity={0.12} enableBlur baseRotation={3} blurStrength={6} textClassName="text-3xl font-semibold leading-snug sm:text-4xl">
            Chaque mot apparaît au moment où tu fais défiler la page. Le mouvement guide le regard et donne envie d’aller plus loin.
          </ScrollReveal>
        </section>

        {/* ---------- Chiffres ---------- */}
        <section className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-5 pb-24 text-center">
          {[
            { to: 60, suffix: ' i/s', label: 'images par seconde' },
            { to: 4, suffix: '', label: 'outils réunis' },
            { to: 100, suffix: '%', label: 'sur mesure' },
          ].map((s) => (
            <div key={s.label}>
              <CountUp to={s.to} suffix={s.suffix} duration={2} className="whitespace-nowrap text-3xl font-extrabold text-cyan sm:text-6xl" />
              <p className="mt-1 text-sm text-white/60">{s.label}</p>
            </div>
          ))}
        </section>

        {/* ---------- Outils ---------- */}
        <section id="outils" className="mx-auto max-w-5xl scroll-mt-20 px-5 pb-28">
          <h2 className="mb-8 text-3xl font-bold sm:text-4xl">Ce qu’il y a sous le capot</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <AnimatedContent key={f.title} distance={60} delay={i * 0.08} duration={0.8}>
                <SpotlightCard className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7" spotlightColor="rgba(139, 92, 246, 0.35)">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-white/65">{f.text}</p>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        </section>

        {/* ---------- Contact ---------- */}
        <section id="contact" className="scroll-mt-20 px-5 pb-32 text-center">
          <AnimatedContent distance={40}>
            <h2 className="text-4xl font-extrabold sm:text-6xl">On construit la suite&nbsp;?</h2>
            <p className="mx-auto mt-4 max-w-md text-white/65">Ce site est une base : textes, couleurs et sections peuvent tous être changés.</p>
          </AnimatedContent>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-white/40">
        Site 2 · fait avec React, React Bits, GSAP et Lenis
      </footer>
    </SmoothScroll>
  );
}
