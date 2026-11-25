import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import BedCanvas from '../three/BedCanvas';
import { PRESSURE } from '../three/Dog';
import { useCover } from '../theme';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  { t: 'Sur le carrelage', d: 'Couché sur le flanc, tout son poids repose sur quatre points : épaule, coude, hanche, genou. Ce sont souvent les articulations qui raidissent en premier.' },
  { t: 'La mousse se glisse dessous', d: 'Quatorze centimètres de mousse le soulèvent du sol froid. La couche à mémoire de forme se creuse sous les os qui dépassent.' },
  { t: 'Le poids se répartit', d: 'Au lieu de quatre points durs, c’est tout le flanc qui porte. Les appuis s’apaisent, il peut rester couché longtemps sans changer de côté.' },
];

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Section épinglée : en faisant défiler, le panier « pousse » sous le chien et ses points d'appui passent du rouge au bleu.
export default function XRayStory({ id = 'radio', title = 'Ce que voit <em>son corps</em> la nuit.' }: { id?: string; title?: string }) {
  const root = useRef<HTMLElement>(null);
  const { color } = useCover();
  const [p, setP] = useState(0);
  const [reduced, setReduced] = useState(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=240%',
        pin: '[data-pin]',
        refreshPriority: 1,
        scrub: true,
        onUpdate: (st) => setP(st.progress),
      });
    });
    mm.add('(prefers-reduced-motion: reduce)', () => { setReduced(true); setP(1); });
    return () => mm.revert();
  }, { scope: root });

  const rise = smooth(0.18, 0.5, p);
  const relief = smooth(0.4, 0.78, p);
  const step = p < 0.3 ? 0 : p < 0.62 ? 1 : 2;

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-titre`} className="relative isolate">
      <div data-pin className="relative flex min-h-[100svh] flex-col overflow-hidden md:flex-row md:items-center">
        <div className="relative z-10 order-2 px-4 pb-8 sm:px-8 md:order-1 md:w-[42%] md:py-0 md:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          <p className="surtitre">Vue en radiographie</p>
          <h2 id={`${id}-titre`} className="mt-3 max-w-md text-[clamp(1.9rem,4.4vw,3.4rem)]" dangerouslySetInnerHTML={{ __html: title }} />
          <ol className="mt-5 space-y-1 md:mt-8">
            {STEPS.map((s, i) => (
              <li key={s.t} className={`grid grid-cols-[2.2rem_1fr] gap-x-2 border-l py-2 pl-4 transition-[opacity,border-color] duration-700 ${step === i ? 'border-ambre opacity-100' : 'border-creme/15 opacity-45'}`}>
                <span className="serif chiffres text-xl italic text-ambre-clair">{['i', 'ii', 'iii'][i]}.</span>
                <div>
                  <p className="text-lg font-semibold">{s.t}</p>
                  <p className={`overflow-hidden text-[0.95rem] text-brume transition-[max-height,opacity] duration-700 ${step === i || reduced ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1" aria-label="Points d’appui">
            {PRESSURE.map((pt) => (
              <li key={pt.id} className="legende inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full transition-colors duration-700" style={{ background: relief > 0.5 ? 'var(--color-repos)' : 'var(--color-douleur)', boxShadow: `0 0 10px ${relief > 0.5 ? 'var(--color-repos)' : 'var(--color-douleur)'}` }} aria-hidden="true" />
                {pt.label}
              </li>
            ))}
          </ul>
          {reduced && (
            <div className="mt-5 flex gap-2" role="group" aria-label="Comparer">
              <button type="button" onClick={() => setP(0)} aria-pressed={p === 0} className="min-h-11 cursor-pointer rounded-full border border-creme/20 px-4 aria-pressed:border-ambre aria-pressed:text-ambre-clair">Sur le carrelage</button>
              <button type="button" onClick={() => setP(1)} aria-pressed={p === 1} className="min-h-11 cursor-pointer rounded-full border border-creme/20 px-4 aria-pressed:border-ambre aria-pressed:text-ambre-clair">Sur Le Doyen</button>
            </div>
          )}
          <p className="legende mt-4">Illustration pour comprendre, pas une mesure médicale.</p>
        </div>
        <BedCanvas
          className="relative order-1 mt-16 h-[44svh] w-full shrink-0 md:order-2 md:mt-0 md:h-[100svh] md:flex-1"
          label="Un chien couché sur le flanc, vu en transparence. Sur le sol, ses épaules, coudes, hanches et genoux sont en rouge. Le panier se glisse sous lui et ces points passent au bleu."
          cover={color.cover}
          bolster={color.bolster}
          dog
          rise={rise}
          relief={relief}
          lamp={0.4 + rise * 0.6}
          scale={0.9}
          lookY={0}
          camera={[1.3, 3.7, 4.3]}
          breathe={false}
          interactive={false}
          rotY={{ current: -0.15 }}
        />
      </div>
    </section>
  );
}
