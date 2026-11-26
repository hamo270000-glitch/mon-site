import type { ArtId } from '../data';

// Illustrations des produits, dessinées en SVG (les vraies photos arriveront avec l'échantillon du fournisseur).
// `a` = couleur principale, `b` = couleur d'ombre.
export default function Art({ art, a, b, className = '', titre }: { art: ArtId; a: string; b: string; className?: string; titre?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} role={titre ? 'img' : undefined} aria-label={titre} aria-hidden={titre ? undefined : true}>
      <ellipse cx="100" cy="146" rx="78" ry="8" fill="#1c2b22" opacity=".12" />
      {art === 'panier' && <Panier a={a} b={b} />}
      {art === 'tapis' && (
        <g>
          <path d="M28 118 L150 118 Q172 118 172 104 L172 96 Q150 104 40 104 Z" fill={b} />
          <rect x="28" y="84" width="144" height="34" rx="14" fill={a} />
          <circle cx="160" cy="101" r="17" fill={b} />
          <circle cx="160" cy="101" r="11" fill={a} />
          <circle cx="160" cy="101" r="5" fill={b} />
          <rect x="70" y="80" width="10" height="42" rx="3" fill="#1c2b22" opacity=".75" />
          <path d="M40 101h100" stroke="#fff" strokeOpacity=".35" strokeWidth="2" strokeDasharray="4 6" />
        </g>
      )}
      {art === 'gamelle' && (
        <g>
          <path d="M30 96 Q34 132 100 132 Q166 132 170 96 Z" fill={b} />
          <ellipse cx="100" cy="96" rx="70" ry="22" fill={a} />
          <ellipse cx="100" cy="96" rx="56" ry="16" fill={b} opacity=".55" />
          <path d="M100 82 V110 M72 88 Q86 96 72 104 M128 88 Q114 96 128 104 M84 84 Q100 92 116 84 M84 108 Q100 100 116 108" stroke={a} strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      )}
      {art === 'harnais' && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M48 70 Q100 38 152 70" stroke={b} strokeWidth="16" />
          <path d="M48 70 Q100 38 152 70" stroke={a} strokeWidth="10" />
          <path d="M60 74 Q100 128 140 74" stroke={b} strokeWidth="22" />
          <path d="M60 74 Q100 128 140 74" stroke={a} strokeWidth="15" />
          <path d="M70 92 Q100 118 130 92" stroke="#fff" strokeWidth="2.5" strokeOpacity=".8" strokeDasharray="5 5" />
          <circle cx="100" cy="52" r="8" stroke="#1c2b22" strokeWidth="4" />
          <rect x="88" y="98" width="24" height="14" rx="4" fill="#1c2b22" stroke="none" />
        </g>
      )}
      {art === 'jouet' && (
        <g>
          <circle cx="100" cy="92" r="46" fill={a} />
          <path d="M58 76 Q100 56 142 76 M56 104 Q100 128 144 104" stroke={b} strokeWidth="7" fill="none" strokeLinecap="round" />
          <circle cx="100" cy="92" r="11" fill="#1c2b22" opacity=".85" />
          <circle cx="86" cy="70" r="7" fill="#fff" opacity=".4" />
          <g fill="#a86b3c"><circle cx="150" cy="128" r="6" /><circle cx="162" cy="134" r="5" /><circle cx="140" cy="136" r="4.5" /></g>
        </g>
      )}
      {art === 'plaid' && (
        <g>
          <path d="M34 120 Q30 74 64 66 L150 60 Q172 62 168 96 L166 122 Z" fill={b} />
          <path d="M40 112 Q36 72 68 66 L148 60 Q166 64 162 96 L160 112 Q100 124 40 112 Z" fill={a} />
          <path d="M60 80 Q90 74 120 80 M58 96 Q100 88 146 96" stroke="#fff" strokeOpacity=".4" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M150 112 Q160 128 172 122 Q160 134 142 124 Z" fill={b} />
        </g>
      )}
    </svg>
  );
}

// Le panier orthopédique, en couches (réutilisé pour la vue éclatée).
export function Panier({ a, b, eclate = 0 }: { a: string; b: string; eclate?: number }) {
  const e = eclate * 26;
  return (
    <g>
      <g transform={`translate(0 ${e * 1.6})`}>
        <rect x="30" y="112" width="140" height="18" rx="9" fill="#2d3a31" />
      </g>
      <g transform={`translate(0 ${e * 0.9})`}>
        <rect x="36" y="94" width="128" height="24" rx="10" fill="#f2e6c8" />
        <path d="M44 106h112" stroke="#d9c9a0" strokeWidth="3" strokeDasharray="2 5" />
      </g>
      <g transform={`translate(0 ${e * 0.2})`}>
        <rect x="40" y="82" width="120" height="18" rx="9" fill="#f7d58c" />
      </g>
      <g transform={`translate(0 ${-e * 0.6})`}>
        <path d="M26 104 Q22 58 60 56 L140 56 Q178 58 174 104 Q174 120 158 120 L42 120 Q26 120 26 104 Z" fill={b} />
        <path d="M44 100 Q44 76 66 76 L134 76 Q156 76 156 100 Z" fill={a} />
        <path d="M30 98 Q28 64 60 62 L140 62 Q172 64 170 98" stroke={a} strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d="M64 88 Q100 82 136 88" stroke="#fff" strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
}
