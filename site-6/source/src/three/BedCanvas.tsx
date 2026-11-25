import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import Bed, { val, type BedProps, type Val } from './Bed';
import Dog, { DOG_DENTS } from './Dog';

function LookAt({ y }: { y: number }) {
  const camera = useThree((st) => st.camera);
  useEffect(() => { camera.lookAt(0, y, 0); camera.updateProjectionMatrix(); }, [camera, y]);
  return null;
}

// Flaque de lumière ambrée au sol, comme sous une lampe de chevet.
function LampPool({ strength = 1 }: { strength?: Val }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, dt) => { if (mat.current) mat.current.opacity += (0.55 * val(strength) - mat.current.opacity) * Math.min(1, dt * 3); });
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, -0.335, 0.2]}>
      <planeGeometry args={[5, 3.6]} />
      <meshBasicMaterial ref={mat} map={tex} color="#e8a54b" transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0} />
    </mesh>
  );
}

// Le carrelage froid sous le chien : il s'efface quand la mousse prend sa place.
function Tiles({ fade }: { fade: Val }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = '#7f8c90';
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#5e6a6e';
    g.fillRect(0, 0, 256, 4);
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(7, 7);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  // Bord fondu : le carrelage disparaît doucement dans la nuit.
  const fadeTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(64, 64, 10, 64, 64, 64);
    r.addColorStop(0, '#fff');
    r.addColorStop(1, '#000');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => fadeTex.dispose(), [fadeTex]);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, dt) => { if (mat.current) mat.current.opacity += ((1 - val(fade)) * 0.8 - mat.current.opacity) * Math.min(1, dt * 4); });
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.325, 0]} receiveShadow>
      <circleGeometry args={[2.6, 48]} />
      <meshStandardMaterial ref={mat} map={tex} alphaMap={fadeTex} roughness={0.35} metalness={0.1} transparent opacity={0.8} depthWrite={false} />
    </mesh>
  );
}

// Téléphone : moins de pixels et pas d'ombres calculées, pour garder le défilement fluide.
const PHONE = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;

type Props = BedProps & {
  className?: string;
  scale?: number;
  lookY?: number;
  camera?: [number, number, number];
  label: string;
  /** affiche le chien en radiographie ; relief 0 → 1 */
  dog?: boolean;
  relief?: Val;
  lamp?: Val;
};

// Scène 3D réutilisée sur toutes les pages : lampe ambrée à gauche, clair de lune bleuté à droite.
export default function BedCanvas({ className = '', scale = 1, lookY = 0, camera = [2.4, 2.15, 3.3], label, dog = false, relief = 1, lamp = 1, ...bed }: Props) {
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
        shadows={!PHONE}
        dpr={PHONE ? [1, 1.25] : [1, 1.6]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: camera, fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ touchAction: 'pan-y' }}
      >
        <Suspense fallback={null}>
          <LookAt y={lookY} />
          <hemisphereLight args={['#b7c9d4', '#0b1418', 0.75]} />
          {/* Lumière d'appoint douce, côté spectateur, pour garder les volumes lisibles. */}
          <directionalLight position={[1.5, 2, 4]} intensity={0.55} color="#f3e6d2" />
          {/* La lampe de chevet : chaude, elle porte l'ombre. */}
          <pointLight position={[-2.4, 2.6, 1.6]} intensity={22} distance={9} decay={1.7} color="#ffc27a" castShadow={!PHONE} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
          {/* Le clair de lune : froid, en contre-jour. */}
          <directionalLight position={[3, 3, -3]} intensity={1.1} color="#8fb4d9" />
          <Environment resolution={PHONE ? 64 : 128}>
            <Lightformer form="circle" intensity={1.4} position={[-4, 3, 2]} scale={3} color="#ffcf8f" />
            <Lightformer form="rect" intensity={0.5} position={[4, 2, -3]} scale={[4, 2, 1]} color="#7d9cc0" />
            <Lightformer form="circle" intensity={0.3} position={[0, -3, 0]} scale={4} color="#0b1418" />
          </Environment>
          <group scale={scale}>
            <Bed {...bed} dents={dog ? DOG_DENTS : bed.dents} dentScale={dog ? relief : 1}>
              {dog && <Dog relief={relief} />}
            </Bed>
          </group>
          {dog && <Tiles fade={bed.rise ?? 1} />}
          <LampPool strength={lamp} />
          <ContactShadows position={[0, -0.33, 0]} opacity={0.75} scale={5} blur={2.4} far={2} color="#000000" />
        </Suspense>
      </Canvas>}
    </div>
  );
}
