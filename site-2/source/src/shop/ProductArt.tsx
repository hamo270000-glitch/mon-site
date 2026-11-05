import type { Shape } from '../data/products';

// Dessins des produits (pas de photos) : chaque forme est un petit SVG coloré.
interface Props {
  shape: Shape;
  tint: string;
  ink: string;
  className?: string;
  label?: string;
}

const Gloss = ({ x, y, h }: { x: number; y: number; h: number }) => (
  <rect x={x} y={y} width={7} height={h} rx={3.5} fill="#fff" opacity={0.45} />
);

export default function ProductArt({ shape, tint, ink, className, label }: Props) {
  return (
    <svg viewBox="0 0 200 240" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <ellipse cx="100" cy="222" rx="62" ry="8" fill={ink} opacity="0.12" />
      {shape === 'flacon' && (
        <g>
          <ellipse cx="100" cy="46" rx="15" ry="22" fill={ink} />
          <rect x="84" y="62" width="32" height="26" rx="4" fill={ink} opacity="0.85" />
          <path d="M70 100 Q70 88 84 88 H116 Q130 88 130 100 V204 Q130 218 116 218 H84 Q70 218 70 204 Z" fill={tint} />
          <rect x="80" y="134" width="40" height="46" rx="4" fill="#fff" opacity="0.7" />
          <rect x="88" y="146" width="24" height="3" rx="1.5" fill={ink} opacity="0.6" />
          <rect x="91" y="154" width="18" height="2" rx="1" fill={ink} opacity="0.35" />
          <Gloss x={76} y={98} h={100} />
        </g>
      )}
      {shape === 'pot' && (
        <g>
          <rect x="38" y="100" width="124" height="36" rx="12" fill={ink} />
          <rect x="38" y="126" width="124" height="6" fill="#000" opacity="0.12" />
          <path d="M46 136 H154 V194 Q154 218 130 218 H70 Q46 218 46 194 Z" fill={tint} />
          <rect x="74" y="156" width="52" height="34" rx="4" fill="#fff" opacity="0.7" />
          <rect x="84" y="167" width="32" height="3" rx="1.5" fill={ink} opacity="0.6" />
          <rect x="89" y="175" width="22" height="2" rx="1" fill={ink} opacity="0.35" />
          <Gloss x={54} y={144} h={52} />
        </g>
      )}
      {shape === 'tube' && (
        <g>
          <rect x="66" y="30" width="68" height="10" rx="2" fill={tint} />
          <path d="M64 40 H136 L128 172 H72 Z" fill={tint} />
          <path d="M64 40 H136 L135 56 H65 Z" fill="#000" opacity="0.06" />
          <rect x="82" y="96" width="36" height="46" rx="4" fill="#fff" opacity="0.7" />
          <rect x="89" y="108" width="22" height="3" rx="1.5" fill={ink} opacity="0.6" />
          <rect x="92" y="116" width="16" height="2" rx="1" fill={ink} opacity="0.35" />
          <rect x="74" y="172" width="52" height="46" rx="6" fill={ink} />
          <Gloss x={72} y={50} h={110} />
        </g>
      )}
      {shape === 'pompe' && (
        <g>
          <rect x="78" y="40" width="58" height="14" rx="5" fill={ink} />
          <rect x="94" y="52" width="12" height="22" fill={ink} opacity="0.8" />
          <rect x="84" y="72" width="32" height="18" rx="4" fill={ink} />
          <path d="M62 104 Q62 90 76 90 H124 Q138 90 138 104 V204 Q138 218 124 218 H76 Q62 218 62 204 Z" fill={tint} />
          <rect x="76" y="132" width="48" height="52" rx="4" fill="#fff" opacity="0.7" />
          <rect x="85" y="146" width="30" height="3" rx="1.5" fill={ink} opacity="0.6" />
          <rect x="89" y="154" width="22" height="2" rx="1" fill={ink} opacity="0.35" />
          <Gloss x={69} y={100} h={100} />
        </g>
      )}
      {shape === 'stick' && (
        <g>
          <path d="M84 70 Q84 40 100 36 Q116 40 116 70 Z" fill={ink} />
          <rect x="80" y="68" width="40" height="18" rx="3" fill={tint} opacity="0.7" />
          <rect x="76" y="84" width="48" height="134" rx="10" fill={tint} />
          <rect x="76" y="84" width="48" height="10" fill="#000" opacity="0.08" />
          <rect x="88" y="120" width="24" height="60" rx="3" fill="#fff" opacity="0.6" />
          <Gloss x={82} y={98} h={110} />
        </g>
      )}
    </svg>
  );
}
