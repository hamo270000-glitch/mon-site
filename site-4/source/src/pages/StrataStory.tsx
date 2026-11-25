import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import BedCanvas from '../three/BedCanvas';
import { LAYERS } from '../data/catalog';
import { useTheme } from '../theme';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Section épinglée : en faisant défiler, le panier s'ouvre en couches, une couche à la fois.
export default function StrataStory({ id = 'couches', title = 'Quatre strates, du sol jusqu’à lui.' }: { id?: string; title?: string }) {
  const root = useRef<HTMLElement>(null);
  const { color } = useTheme();
  const [explode, setExplode] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=260%',
        pin: '[data-pin]',
        refreshPriority: 1,
        scrub: true,
        onUpdate: (st) => {
          const p = st.progress;
          setExplode(Math.min(1, p * 2.2));
          const i = p < 0.2 ? null : Math.min(LAYERS.length - 1, Math.floor((p - 0.2) / 0.2));
          setActive(i);
        },
      });
    });
    mm.add('(prefers-reduced-motion: reduce)', () => { setExplode(1); });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-titre`} className="relative isolate">
      <div data-pin className="relative flex min-h-[100svh] flex-col overflow-hidden md:flex-row md:items-center">
        <div aria-hidden="true" className="halo absolute bottom-[-20%] right-[-5%] h-[80%] w-[100vw] md:w-[60vw]" />
        <div className="relative z-10 order-2 px-4 pb-6 sm:px-8 md:order-1 md:w-[42%] md:py-0 md:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          <p aria-hidden="true" className="chiffres font-[family-name:var(--font-display)] text-[clamp(4.5rem,12vw,9rem)] font-extrabold leading-[0.8] tracking-[-0.06em]">4</p>
          <h2 id={`${id}-titre`} className="mt-2 max-w-md text-[clamp(1.6rem,4vw,3rem)]">{title}</h2>
          <ol className="mt-4 space-y-0.5 md:mt-8 md:space-y-1">
            {LAYERS.map((l, i) => (
              <li key={l.name}
                className={`grid grid-cols-[2.2rem_1fr] gap-x-3 rounded-2xl px-3 py-2 transition md:py-3-[background-color,opacity] duration-500 ${active === i ? 'bg-texte/[0.07] opacity-100' : active === null ? 'opacity-90' : 'opacity-45'}`}>
                <span className="mt-1.5 h-3 w-8 rounded-full border border-texte/20" style={{ background: l.tone }} aria-hidden="true" />
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-3 text-lg font-semibold">{l.name}<span className="legende chiffres font-normal">{l.thickness}</span></p>
                  <p className={`max-h-0 overflow-hidden text-[0.95rem] text-doux opacity-0 transition-[max-height,opacity] duration-500 md:text-base ${active === i ? 'max-h-28 opacity-100' : ''}`}>{l.role}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="legende mt-3 md:mt-5">Épaisseurs provisoires, confirmées à la réception de l’échantillon.</p>
        </div>
        <BedCanvas
          className="relative order-1 mt-16 h-[40svh] w-full shrink-0 md:order-2 md:mt-0 md:h-[100svh] md:flex-1"
          label="Vue éclatée du panier Lové : la housse, la mousse à mémoire de forme, la mousse de soutien et la semelle se séparent."
          cover={color.cover}
          bolster={color.bolster}
          glow={color.glow}
          explode={explode}
          scale={0.78}
          lookY={0.55}
          camera={[2.6, 2.6, 3.9]}
          highlight={active}
          breathe={false}
          interactive={false}
        />
      </div>
    </section>
  );
}
