import { useEffect, useRef } from 'react';

// Le ciel derrière tout le site : un calque « nuit » et des étoiles, posés une fois pour toutes.
// Pendant le défilement, GSAP ne change que leur opacité (src/motion.tsx) : le téléphone n'a rien à redessiner.
export default function Sky() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;
    let lastW = 0;
    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (Math.abs(w - lastW) < 2 && lastW) return; // la barre d'adresse de Safari change la hauteur : on ignore
      lastW = w;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = w * dpr;
      cv.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const n = Math.round((w * h) / 6000);
      for (let i = 0; i < n; i++) {
        const y = Math.random() * h * 0.9;
        const r = Math.random() * 1.1 + 0.25;
        g.globalAlpha = (0.35 + Math.random() * 0.65) * (1 - (y / h) * 0.6);
        g.fillStyle = r > 1.1 ? '#f3dcae' : '#e9eef0';
        g.beginPath();
        g.arc(Math.random() * w, y, r, 0, Math.PI * 2);
        g.fill();
      }
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div id="ciel-nuit" className="absolute inset-0 bg-[#0d171b] opacity-0" />
      <canvas id="ciel-etoiles" ref={ref} className="absolute inset-0 h-full w-full opacity-15" />
    </div>
  );
}
