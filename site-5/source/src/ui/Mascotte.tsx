import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Panier } from './Art';

// Biscuit, la mascotte : il respire, cligne des yeux, remue la queue et suit le doigt ou la souris du regard.
export default function Mascotte({ className = '', coussin = '#e5cfa7', ombre = '#c9ab7c' }: { className?: string; coussin?: string; ombre?: string }) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const q = gsap.utils.selector(root);
    gsap.to(q('[data-queue]'), { rotation: 28, transformOrigin: '0% 100%', duration: 0.22, ease: 'sine.inOut', repeat: -1, yoyo: true });
    gsap.to(q('[data-corps]'), { scaleY: 1.035, transformOrigin: '50% 100%', duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
    gsap.to(q('[data-oreille-g]'), { rotation: -7, transformOrigin: '80% 10%', duration: 2.2, ease: 'sine.inOut', repeat: -1, yoyo: true });
    gsap.to(q('[data-oreille-d]'), { rotation: 7, transformOrigin: '20% 10%', duration: 2.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.3 });
    const cligne = () => gsap.to(q('[data-yeux]'), { scaleY: 0.1, svgOrigin: '160 112', duration: 0.08, yoyo: true, repeat: 1 });
    const blink = gsap.timeline({ repeat: -1, repeatDelay: 2.6 }).add(cligne).add(cligne, '+=0.25');
    gsap.from(q('[data-tete]'), { y: 30, rotation: -8, transformOrigin: '50% 100%', duration: 1.1, ease: 'elastic.out(1, 0.55)', delay: 0.3 });

    const pupilles = q('[data-pupille]');
    const qx = pupilles.map((p) => gsap.quickTo(p, 'x', { duration: 0.35, ease: 'power3' }));
    const qy = pupilles.map((p) => gsap.quickTo(p, 'y', { duration: 0.35, ease: 'power3' }));
    const tete = q('[data-tete]')[0];
    const rot = gsap.quickTo(tete, 'rotation', { duration: 0.8, ease: 'power3' });
    gsap.set(tete, { transformOrigin: '50% 90%' });
    const suit = (e: PointerEvent) => {
      const r = root.current!.getBoundingClientRect();
      const dx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.8));
      const dy = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height * 0.35)) / (r.height * 0.8));
      qx.forEach((f) => f(dx * 5));
      qy.forEach((f) => f(dy * 4));
      rot(dx * 6);
    };
    window.addEventListener('pointermove', suit);
    return () => { window.removeEventListener('pointermove', suit); blink.kill(); };
  }, { scope: root });

  return (
    <svg ref={root} viewBox="0 0 320 300" className={className} role="img" aria-label="Biscuit, un chien couleur caramel, installé dans un panier orthopédique">
      <ellipse cx="160" cy="286" rx="132" ry="10" fill="#1c2b22" opacity=".14" />
      <g transform="translate(-0 150) scale(1.6)"><g transform="translate(0 -40)"><Panier a={coussin} b={ombre} /></g></g>
      {/* queue */}
      <path data-queue d="M228 196 Q256 168 250 140" stroke="#c8874b" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* corps */}
      <g data-corps>
        <ellipse cx="160" cy="196" rx="74" ry="46" fill="#d99a5b" />
        <ellipse cx="160" cy="206" rx="46" ry="30" fill="#f3d4ad" />
        <ellipse cx="124" cy="232" rx="20" ry="12" fill="#f3d4ad" />
        <ellipse cx="196" cy="232" rx="20" ry="12" fill="#f3d4ad" />
      </g>
      {/* tête */}
      <g data-tete>
        <path data-oreille-g d="M104 92 Q76 96 80 150 Q88 168 106 150 Q112 118 120 100 Z" fill="#8a5631" />
        <path data-oreille-d d="M216 92 Q244 96 240 150 Q232 168 214 150 Q208 118 200 100 Z" fill="#8a5631" />
        <ellipse cx="160" cy="118" rx="62" ry="56" fill="#d99a5b" />
        <path d="M160 64 Q150 96 160 118 Q170 96 160 64 Z" fill="#f3d4ad" />
        <ellipse cx="160" cy="146" rx="36" ry="26" fill="#f3d4ad" />
        <g data-yeux>
          <ellipse cx="136" cy="112" rx="11" ry="12" fill="#fff" />
          <ellipse cx="184" cy="112" rx="11" ry="12" fill="#fff" />
          <circle data-pupille cx="136" cy="113" r="6.5" fill="#1c2b22" />
          <circle data-pupille cx="184" cy="113" r="6.5" fill="#1c2b22" />
        </g>
        {/* la truffe */}
        <ellipse cx="160" cy="138" rx="13" ry="9" fill="#2a1d16" />
        <ellipse cx="156" cy="135" rx="4" ry="2.4" fill="#fff" opacity=".45" />
        <path d="M160 147 Q160 156 150 158 M160 147 Q160 156 170 158" stroke="#2a1d16" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M152 160 Q160 172 168 160 Z" fill="#e8737a" />
        <ellipse cx="118" cy="140" rx="9" ry="5" fill="#f08a7e" opacity=".45" />
        <ellipse cx="202" cy="140" rx="9" ry="5" fill="#f08a7e" opacity=".45" />
      </g>
    </svg>
  );
}
