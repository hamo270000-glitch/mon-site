import { useEffect, useRef } from 'react';

// Ciel étoilé derrière tout le site. Les étoiles s'allument à mesure que la nuit tombe (--etoiles).
export default function Sky() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0;
    let stars: { x: number; y: number; r: number; p: number; s: number }[] = [];

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 5200);
      stars = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.9, r: Math.random() * 1.1 + 0.25, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.2 }));
    };

    const draw = (t: number) => {
      const lvl = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--etoiles')) || 0;
      g.clearRect(0, 0, w, h);
      for (const st of stars) {
        const tw = reduce ? 0.8 : 0.55 + 0.45 * Math.sin(st.p + (t / 1000) * st.s);
        g.globalAlpha = Math.max(0, Math.min(1, lvl * tw * (1 - st.y / h * 0.6)));
        g.fillStyle = st.r > 1.1 ? '#f3dcae' : '#e9eef0';
        g.beginPath();
        g.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        g.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    if (reduce) {
      draw(0);
      const id = window.setInterval(() => draw(0), 1000);
      return () => { window.removeEventListener('resize', resize); clearInterval(id); };
    }
    raf = requestAnimationFrame(draw);
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); };
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
