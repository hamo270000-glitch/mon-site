import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import Bed, { type BedProps } from './Bed';

function LookAt({ y }: { y: number }) {
  const camera = useThree((st) => st.camera);
  useEffect(() => { camera.lookAt(0, y, 0); camera.updateProjectionMatrix(); }, [camera, y]);
  return null;
}

// Halo coloré posé au sol, sous le panier (la « lumière de scène »).
function Glow({ color }: { color: string }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Color(color), [color]);
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 3);
    mat.current?.color.lerp(target, k);
    light.current?.color.lerp(target, k);
  });
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.335, 0]}>
        <planeGeometry args={[4.4, 3.1]} />
        <meshBasicMaterial ref={mat} map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.95} />
      </mesh>
      <pointLight ref={light} position={[0, -0.1, 1.2]} intensity={6} distance={4} decay={1.6} />
    </>
  );
}

// Scène 3D réutilisée sur toutes les pages : lumière douce de fin de journée, ombre au sol.
export default function BedCanvas({ className = '', scale = 1, lookY = 0, camera = [2.4, 2.15, 3.3], label, glow = '#ff5a1f', ...bed }: BedProps & { glow?: string; className?: string; scale?: number; lookY?: number; camera?: [number, number, number]; label: string }) {
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  // On met la scène en pause quand elle sort de l'écran (batterie du téléphone).
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { setVisible(e.isIntersecting); if (e.isIntersecting) setSeen(true); }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [el]);

  return (
    <div ref={setEl} className={className} role="img" aria-label={label}>
      {seen && <Canvas
        shadows
        dpr={[1, 1.75]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: camera, fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ touchAction: 'pan-y' }}
      >
        <Suspense fallback={null}>
          <LookAt y={lookY} />
          <hemisphereLight args={['#ffffff', '#060607', 0.35]} />
          <directionalLight
            position={[-3, 5, 2.5]}
            intensity={1.6}
            color="#ffffff"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-3}
            shadow-camera-right={3}
            shadow-camera-top={3}
            shadow-camera-bottom={-3}
            shadow-bias={-0.0004}
          />
          <directionalLight position={[3, 2.5, -3]} intensity={1.4} color={glow} />
          <Environment resolution={128}>
            <Lightformer form="rect" intensity={1.6} position={[-4, 4, 2]} scale={[5, 3, 1]} color="#ffffff" />
            <Lightformer form="rect" intensity={0.6} position={[4, 1, -3]} scale={[4, 2, 1]} color="#8a8aa0" />
            <Lightformer form="circle" intensity={0.4} position={[0, -3, 0]} scale={4} color="#060607" />
          </Environment>
          <group scale={scale}>
            <Bed {...bed} />
          </group>
          <Glow color={glow} />
          <ContactShadows position={[0, -0.33, 0]} opacity={0.7} scale={5} blur={2.2} far={2} color="#000000" />
        </Suspense>
      </Canvas>}
    </div>
  );
}
