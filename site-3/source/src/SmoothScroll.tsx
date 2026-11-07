import { useEffect, useRef, type ReactNode } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Défilement doux (Lenis) relié à GSAP : les animations au défilement suivent le même rythme.
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const ref = useRef<LenisRef>(null);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduce) return;
    const tick = (t: number) => ref.current?.lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const lenis = ref.current?.lenis;
    lenis?.on('scroll', ScrollTrigger.update);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.off('scroll', ScrollTrigger.update);
    };
  }, [reduce]);

  if (reduce) return <>{children}</>;
  return (
    <ReactLenis root ref={ref} options={{ autoRaf: false, lerp: 0.1, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
