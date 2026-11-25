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
    <section aria-labelledby="titre-taille" className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center">
        <div>
          <p className="surtitre">Guide des tailles</p>
          <h2 id="titre-taille" className="mt-3 max-w-[16ch] text-[clamp(2.1rem,4.6vw,3.6rem)]">{compact ? <>Mesure-le <em>pendant qu’il dort.</em></> : <>Ta taille en <em>vingt secondes.</em></>}</h2>
          <p className="mt-4 max-w-md text-lg text-brume">Couché dans sa position préférée, de la truffe à la base de la queue. Entre deux tailles, prends la plus grande : un chien raide aime s’étirer sans toucher les bords.</p>

          <div className="mt-8 space-y-6">
            <div>
              <div className="flex items-baseline justify-between"><label htmlFor={idLen} className="font-semibold">Longueur du chien</label><output htmlFor={idLen} className="chiffres serif text-3xl">{len} cm</output></div>
              <input id={idLen} type="range" min={25} max={120} step={1} value={len} onChange={(e) => setLen(+e.target.value)} />
            </div>
            <div>
              <div className="flex items-baseline justify-between"><label htmlFor={idKg} className="font-semibold">Poids</label><output htmlFor={idKg} className="chiffres serif text-3xl">{kg} kg</output></div>
              <input id={idKg} type="range" min={2} max={75} step={1} value={kg} onChange={(e) => setKg(+e.target.value)} />
            </div>
          </div>

          <div className="voile mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl p-5" aria-live="polite">
            <p className="flex items-baseline gap-3">
              <span className="serif text-6xl italic text-ambre-clair">{best.id}</span>
              <span>
                <span className="block font-semibold">Taille {best.label.toLowerCase()}</span>
                <span className="chiffres block text-[0.95rem] text-brume">{best.outer[0]} × {best.outer[1]} cm · {euros(best.price)}</span>
              </span>
            </p>
            <a href={`${href.produit}?taille=${best.id}`} className="bouton ml-auto">Prendre le {best.id} <IconArrow /></a>
          </div>
          {kg > 65 && <p className="legende mt-3">Au-delà de 65 kg, écris-nous avant de commander : nous vérifierons avec le fournisseur.</p>}
          {compact && <p className="mt-5"><a href={href.tailles} className="bouton-lien">Voir le guide complet des tailles <IconArrow /></a></p>}
        </div>

        <figure className="m-0">
          <svg viewBox={`0 0 ${W} ${H + 40}`} className="h-auto w-full text-creme" role="img" aria-label={`Plan à l’échelle des quatre tailles. Ton chien mesure ${len} cm : la taille ${best.id} est conseillée.`}>
            {SIZES.slice().reverse().map((s) => {
              const w = s.outer[0] * k;
              const h = s.outer[1] * k;
              const on = s.id === best.id;
              return (
                <g key={s.id}>
                  <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h * 0.2}
                    fill={on ? 'color-mix(in oklab, var(--color-ambre) 14%, transparent)' : 'none'} stroke={on ? 'var(--color-ambre)' : 'currentColor'} strokeWidth={on ? 2 : 1} strokeOpacity={on ? 1 : 0.25} strokeDasharray={on ? undefined : '3 5'}
                    style={{ transition: 'fill 500ms var(--ease-veille)' }} />
                  <text x={cx + w / 2 - 14} y={cy - h / 2 + 24} textAnchor="end" fontSize="16" fontStyle="italic" fontFamily="var(--font-serif)" fill={on ? 'var(--color-ambre-clair)' : 'currentColor'} fillOpacity={on ? 1 : 0.5}>{s.id}</text>
                </g>
              );
            })}
            {/* Le chien, mesuré : une ligne cotée */}
            <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1={cx - (len * k) / 2} x2={cx + (len * k) / 2} y1={cy} y2={cy} style={{ transition: 'all 300ms var(--ease-veille)' }} />
              <line x1={cx - (len * k) / 2} x2={cx - (len * k) / 2} y1={cy - 10} y2={cy + 10} />
              <line x1={cx + (len * k) / 2} x2={cx + (len * k) / 2} y1={cy - 10} y2={cy + 10} />
            </g>
            <text x={cx} y={cy - 16} textAnchor="middle" fontSize="16" fontWeight="600" fill="currentColor">ton chien · {len} cm</text>
            <g transform={`translate(20 ${H + 14})`} fill="var(--color-brume)" fontSize="13">
              <rect width={50 * k} height="5" fill="none" stroke="var(--color-brume)" />
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
