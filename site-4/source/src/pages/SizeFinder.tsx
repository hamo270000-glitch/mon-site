import { useId, useState } from 'react';
import { SIZES, sizeFor, euros } from '../data/catalog';
import { href } from '../router';
import { IconArrow } from '../ui/Icons';

// Trouver la taille : la longueur et le poids du chien donnent la taille, dessinée comme un plan à l'échelle.
export default function SizeFinder({ compact = false }: { compact?: boolean }) {
  const [len, setLen] = useState(70);
  const [kg, setKg] = useState(22);
  const best = sizeFor(len, kg);
  const idLen = useId();
  const idKg = useId();

  // Plan à l'échelle : 1 cm = 3 unités SVG.
  const k = 3;
  const W = 130 * k + 40;
  const H = 100 * k + 40;
  const cx = W / 2;
  const cy = H / 2;

  return (
    <section aria-labelledby="titre-taille" className="calcaire relative py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center">
        <div>
          <h2 id="titre-taille" className="max-w-[16ch] text-[clamp(2.1rem,4.6vw,3.6rem)]">{compact ? 'Mesure ton chien, on s’occupe du reste.' : 'Ta taille en 20 secondes.'}</h2>
          <p className="mt-4 max-w-md text-lg text-doux">Mesure-le couché, de la truffe à la base de la queue. Dans le doute entre deux tailles, prends la plus grande : un chien âgé aime s’étirer.</p>

          <div className="mt-8 space-y-6">
            <div>
              <div className="flex items-baseline justify-between"><label htmlFor={idLen} className="font-semibold">Longueur du chien</label><output htmlFor={idLen} className="chiffres text-2xl font-semibold">{len} cm</output></div>
              <input id={idLen} type="range" min={25} max={120} step={1} value={len} onChange={(e) => setLen(+e.target.value)} />
            </div>
            <div>
              <div className="flex items-baseline justify-between"><label htmlFor={idKg} className="font-semibold">Poids</label><output htmlFor={idKg} className="chiffres text-2xl font-semibold">{kg} kg</output></div>
              <input id={idKg} type="range" min={2} max={70} step={1} value={kg} onChange={(e) => setKg(+e.target.value)} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-3xl border border-texte/10 bg-basalte p-5" aria-live="polite">
            <p className="flex items-baseline gap-3">
              <span className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.04em] text-lichen">{best.id}</span>
              <span>
                <span className="block font-semibold">Taille {best.label.toLowerCase()}</span>
                <span className="chiffres block text-[0.95rem] text-doux">{best.outer[0]} × {best.outer[1]} cm · {euros(best.price)}</span>
              </span>
            </p>
            <a href={`${href.produit}?taille=${best.id}`} className="ml-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-lichen px-6 font-semibold text-sur-lichen transition-colors hover:bg-lichen-fonce">
              Prendre le {best.id} <IconArrow />
            </a>
          </div>
          {compact && <p className="mt-5"><a href={href.tailles} className="font-semibold underline">Voir le guide complet des tailles</a></p>}
        </div>

        <figure className="m-0">
          <svg viewBox={`0 0 ${W} ${H + 40}`} className="h-auto w-full" role="img" aria-label={`Plan à l’échelle des quatre tailles. Ton chien mesure ${len} cm : la taille ${best.id} est conseillée.`}>
            {SIZES.slice().reverse().map((s) => {
              const w = s.outer[0] * k;
              const h = s.outer[1] * k;
              const on = s.id === best.id;
              return (
                <g key={s.id}>
                  <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h * 0.18}
                    fill={on ? 'color-mix(in oklab, var(--t-accent) 16%, transparent)' : 'none'} stroke={on ? 'var(--t-accent)' : 'currentColor'} strokeWidth={on ? 2 : 1} strokeOpacity={on ? 1 : 0.3}
                    style={{ transition: 'fill 400ms var(--ease-sortie)' }} />
                  <text x={cx + w / 2 - 14} y={cy - h / 2 + 22} textAnchor="end" fontSize="15" fontWeight="600" fill={on ? 'var(--t-accent)' : 'currentColor'} fillOpacity={on ? 1 : 0.5}>{s.id}</text>
                </g>
              );
            })}
            {/* Le chien, mesuré : une ligne cotée */}
            <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1={cx - (len * k) / 2} x2={cx + (len * k) / 2} y1={cy} y2={cy} style={{ transition: 'all 300ms var(--ease-sortie)' }} />
              <line x1={cx - (len * k) / 2} x2={cx - (len * k) / 2} y1={cy - 10} y2={cy + 10} />
              <line x1={cx + (len * k) / 2} x2={cx + (len * k) / 2} y1={cy - 10} y2={cy + 10} />
            </g>
            <text x={cx} y={cy - 16} textAnchor="middle" fontSize="16" fontWeight="600" fill="currentColor">ton chien · {len} cm</text>
            {/* échelle */}
            <g transform={`translate(20 ${H + 14})`} fill="var(--t-muted)" fontSize="13">
              <rect width={50 * k} height="5" fill="none" stroke="var(--t-muted)" />
              <rect width={25 * k} height="5" />
              <text x="0" y="22">0</text>
              <text x={50 * k} y="22" textAnchor="end">50 cm</text>
            </g>
          </svg>
          <figcaption className="legende mt-2">Plan vu du dessus, à l’échelle. Mesures extérieures provisoires.</figcaption>
        </figure>
      </div>
    </section>
  );
}
