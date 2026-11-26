import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LAYERS } from './data';

// La « vidéo au défilement » : 120 images calculées à l'avance (render/), peintes sur un canvas fixe.
// Le doigt choisit l'image : le téléphone n'a aucune 3D à calculer, juste des photos à afficher.
const N = 120;

// Chaque phrase apparaît sur une portion du film (0 = début, 1 = fin).
const CAPTIONS: { from: number; to: number; align: 'bas' | 'haut'; node: ReactNode }[] = [
  {
    from: -1, to: 0.14, align: 'bas',
    node: (
      <>
        <p className="surtitre text-brume">Veilleuse · panier orthopédique</p>
        <h1 className="mt-3 text-[clamp(2.4rem,7vw,5.6rem)]">Il est 23 h.<br /><em className="text-ambre">Il cherche sa place.</em></h1>
        <p className="mt-5 inline-flex items-center gap-2 text-brume"><span className="inline-block h-6 w-px animate-pulse bg-brume" aria-hidden="true" /> Fais défiler pour entrer</p>
      </>
    ),
  },
  {
    from: 0.2, to: 0.38, align: 'bas',
    node: <h2 className="text-[clamp(2rem,5.5vw,4.2rem)]">Pas le carrelage froid.<br /><em className="text-ambre">Pas le coussin qui s’écrase.</em></h2>,
  },
  {
    from: 0.43, to: 0.6, align: 'bas',
    node: <h2 className="text-[clamp(2rem,5.5vw,4.2rem)]">Un vrai lit, pour<br /><em className="text-ambre">les articulations qui fatiguent.</em></h2>,
  },
  {
    from: 0.72, to: 2, align: 'haut',
    node: (
      <>
        <h2 className="text-[clamp(1.9rem,5vw,3.8rem)]">Quatorze centimètres <em className="text-ambre">entre lui et le sol.</em></h2>
        <ol className="mt-5 grid max-w-xl gap-x-6 gap-y-2 sm:grid-cols-2">
          {LAYERS.map((l) => (
            <li key={l.name} className="flex gap-3">
              <span className="mt-2 h-2.5 w-6 shrink-0 rounded-full border border-white/20" style={{ background: l.tone }} aria-hidden="true" />
              <span><span className="block font-semibold">{l.name}</span><span className="block text-[0.92rem] text-brume">{l.detail}</span></span>
            </li>
          ))}
        </ol>
      </>
    ),
  },
];

export default function Film() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    const cv = canvas.current;
    const sec = section.current;
    if (!cv || !sec) return;
    const g = cv.getContext('2d');
    if (!g) return;
    const set = window.innerHeight > window.innerWidth ? 'haut' : 'large';
    const imgs: (HTMLImageElement | null)[] = Array(N).fill(null);
    const ready: boolean[] = Array(N).fill(false);
    let current = 0;
    let drawn = -1;
    let alive = true;

    const nearest = (i: number) => {
      for (let d = 0; d < N; d++) {
        if (i - d >= 0 && ready[i - d]) return i - d;
        if (i + d < N && ready[i + d]) return i + d;
      }
      return -1;
    };
    // Dessine l'image la plus proche déjà chargée, en « cover » (remplit l'écran sans déformer).
    const draw = () => {
      const k = nearest(current);
      if (k < 0 || k === drawn) return;
      drawn = k;
      const im = imgs[k]!;
      const cw = cv.width, ch = cv.height;
      const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      g.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
    };
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      drawn = -1;
      draw();
    };

    // Ordre de chargement : une image sur 16, puis sur 8, 4, 2, 1. Le film est utilisable très vite.
    const order: number[] = [];
    const seen = new Set<number>();
    for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < N; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    if (!seen.has(N - 1)) order.splice(1, 0, N - 1);
    let count = 0;
    for (const i of order) {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        if (!alive) return;
        ready[i] = true;
        imgs[i] = im;
        count++;
        if (count % 8 === 0 || count === N) setLoaded(count);
        if (Math.abs(i - current) <= Math.abs(nearest(current) - current)) { drawn = -1; draw(); }
      };
      im.src = `./film/${set}/${String(i).padStart(3, '0')}.jpg`;
    }

    // Le défilement choisit l'image et fait apparaître les phrases (styles posés à la main : aucun re-rendu React).
    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        current = Math.round(p * (N - 1));
        draw();
        CAPTIONS.forEach((c, i) => {
          const el = caps.current[i];
          if (!el) return;
          const o = Math.min(1, Math.max(0, (p - c.from) / 0.04)) * Math.min(1, Math.max(0, (c.to - p) / 0.04));
          el.style.opacity = String(o);
          el.style.transform = `translate3d(0, ${(1 - o) * 24}px, 0)`;
          el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        });
      },
    });
    size();
    window.addEventListener('resize', size);
    return () => { alive = false; st.kill(); window.removeEventListener('resize', size); };
  }, []);

  return (
    <section ref={section} aria-label="Entrer dans la chambre : film du panier Veilleuse" className="relative h-[620svh] bg-nuit">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" role="img" aria-label="La caméra entre dans une chambre la nuit, s’approche du panier près de la lampe de chevet, puis le panier s’ouvre en quatre couches." />
        {/* Voile pour lire le texte sur l'image. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-nuit/90 via-nuit/40 to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-nuit/80 to-transparent" />
        {CAPTIONS.map((c, i) => (
          <div key={i} ref={(el) => { caps.current[i] = el; }}
            className={`absolute inset-x-0 mx-auto max-w-7xl px-5 sm:px-10 ${c.align === 'bas' ? 'bottom-[max(2.5rem,env(safe-area-inset-bottom))] sm:bottom-16' : 'top-24 sm:top-28'}`}
            style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden', willChange: 'opacity, transform' }}>
            {c.node}
          </div>
        ))}
        {loaded < N && (
          <p className="chiffres absolute bottom-4 right-5 text-[0.78rem] text-brume/80" aria-live="polite">Chargement du film · {Math.round((loaded / N) * 100)} %</p>
        )}
      </div>
    </section>
  );
}
