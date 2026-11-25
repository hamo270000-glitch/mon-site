import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

// Un vieux chien couché sur le flanc, vu « en radiographie » : silhouette translucide, colonne visible,
// et ses quatre points d'appui (épaule, coude, hanche, genou).
// relief (0 → 1) : 0 = couché sur le carrelage, les points sont rouges et pulsent ;
//                  1 = la mousse répartit le poids, les points refroidissent en bleu et rétrécissent.
// Construit en code, coordonnées dans le repère du panier (x = longueur, z = vers l'entrée, y = vers le haut).

export const PRESSURE = [
  { id: 'epaule', label: 'Épaule', pos: [0.42, 0.03, -0.14] as const },
  { id: 'coude', label: 'Coude', pos: [0.52, 0.03, 0.14] as const },
  { id: 'hanche', label: 'Hanche', pos: [-0.4, 0.03, -0.2] as const },
  { id: 'genou', label: 'Genou', pos: [-0.28, 0.03, 0.12] as const },
];

/** Creux laissés dans la mousse par le chien (coordonnées de la housse, décalée de 0,05 en z). */
// Le chien est réduit et recentré pour tenir entre les bords du traversin.
const K = 0.92;
const DX = -0.12;
export const DOG_DENTS = PRESSURE.map((p) => ({ x: p.pos[0] * K + DX, z: p.pos[2] * K - 0.05, d: 0.05 })).concat([{ x: DX, z: -0.17, d: 0.035 }]);

const HOT = new THREE.Color('#e0604a');
const COOL = new THREE.Color('#7fb2d6');

function haloTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function Ghost({ children, ...props }: ThreeElements['mesh']) {
  return (
    <mesh {...props}>
      {children}
      <meshStandardMaterial color="#4f8fb8" emissive="#1f5f86" emissiveIntensity={0.7} roughness={0.35} transparent opacity={0.42} depthWrite={false} />
    </mesh>
  );
}

export default function Dog({ relief = 1 }: { relief?: number }) {
  const breath = useRef<THREE.Group>(null);
  const cores = useRef<(THREE.Mesh | null)[]>([]);
  const halos = useRef<(THREE.Sprite | null)[]>([]);
  const reliefNow = useRef(relief);
  const tex = useMemo(haloTexture, []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  useEffect(() => () => tex.dispose(), [tex]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const k = Math.min(dt, 1 / 20);
    reliefNow.current += (relief - reliefNow.current) * Math.min(1, k * 4);
    const r = reliefNow.current;
    tmp.copy(HOT).lerp(COOL, r);
    // Respiration lente d'un vieux chien qui dort.
    if (breath.current && !reduce) breath.current.scale.z = 1 + 0.035 * Math.sin(t * 1.4);
    const pulse = reduce ? 0 : (1 - r) * 0.18 * (0.5 + 0.5 * Math.sin(t * 3.2));
    cores.current.forEach((m) => {
      if (!m) return;
      (m.material as THREE.MeshBasicMaterial).color.copy(tmp);
      m.scale.setScalar(1.25 - 0.55 * r + pulse);
    });
    halos.current.forEach((s) => {
      if (!s) return;
      s.material.color.copy(tmp);
      s.scale.setScalar((0.36 - 0.16 * r) * (1 + pulse * 1.5));
      s.material.opacity = 0.95 - 0.35 * r;
    });
  });

  return (
    <group scale={K} position={[DX, 0, 0]}>
      {/* Corps */}
      <group ref={breath} position={[0, 0.19, -0.16]}>
        <Ghost rotation={[0, 0, Math.PI / 2]} scale={[0.82, 1, 1.12]}><capsuleGeometry args={[0.2, 0.72, 8, 24]} /></Ghost>
        <Ghost position={[0.38, 0.01, 0.03]} scale={[1, 0.82, 1.12]}><sphereGeometry args={[0.25, 28, 20]} /></Ghost>
        <Ghost position={[-0.38, 0, -0.03]} scale={[1, 0.85, 1]}><sphereGeometry args={[0.22, 28, 20]} /></Ghost>
      </group>
      {/* Colonne vertébrale : petites vertèbres le long du dos */}
      {Array.from({ length: 15 }, (_, i) => {
        const x = -0.52 + i * 0.085;
        return (
          <mesh key={i} position={[x, 0.2, -0.38 + Math.sin((i / 14) * Math.PI) * -0.03]}>
            <sphereGeometry args={[0.026, 10, 8]} />
            <meshBasicMaterial color="#e9f6ff" transparent opacity={0.9} depthWrite={false} />
          </mesh>
        );
      })}
      {/* Cou et tête, posée sur la housse */}
      <Ghost position={[0.66, 0.17, -0.08]} rotation={[0, 0.35, Math.PI / 2]}><capsuleGeometry args={[0.12, 0.2, 8, 16]} /></Ghost>
      <Ghost position={[0.84, 0.15, -0.02]} scale={[1.05, 0.85, 1]}><sphereGeometry args={[0.16, 24, 18]} /></Ghost>
      {/* Le museau gris */}
      <mesh position={[1.01, 0.12, 0.04]} rotation={[0, -0.25, Math.PI / 2]}>
        <capsuleGeometry args={[0.075, 0.13, 8, 16]} />
        <meshStandardMaterial color="#e6eaec" emissive="#9fb2ba" emissiveIntensity={0.35} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh position={[1.11, 0.13, 0.07]}><sphereGeometry args={[0.03, 12, 10]} /><meshStandardMaterial color="#0f171b" roughness={0.3} /></mesh>
      {/* Oreille tombante */}
      <Ghost position={[0.78, 0.25, -0.12]} rotation={[0.2, 0.4, -0.3]} scale={[1.25, 0.3, 0.85]}><sphereGeometry args={[0.11, 18, 12]} /></Ghost>
      {/* Pattes avant, allongées vers l'entrée du panier */}
      <Ghost position={[0.5, 0.07, 0.18]} rotation={[Math.PI / 2, 0, -0.15]}><capsuleGeometry args={[0.055, 0.44, 6, 12]} /></Ghost>
      <Ghost position={[0.6, 0.18, 0.14]} rotation={[Math.PI / 2, 0, -0.35]}><capsuleGeometry args={[0.052, 0.4, 6, 12]} /></Ghost>
      {/* Pattes arrière */}
      <Ghost position={[-0.3, 0.07, 0.16]} rotation={[Math.PI / 2, 0, 0.25]}><capsuleGeometry args={[0.06, 0.42, 6, 12]} /></Ghost>
      <Ghost position={[-0.2, 0.19, 0.12]} rotation={[Math.PI / 2, 0, 0.05]}><capsuleGeometry args={[0.058, 0.38, 6, 12]} /></Ghost>
      {/* Queue */}
      <Ghost position={[-0.74, 0.08, 0.02]} rotation={[0, -0.9, Math.PI / 2]}><capsuleGeometry args={[0.035, 0.34, 6, 10]} /></Ghost>

      {/* Points d'appui */}
      {PRESSURE.map((p, i) => (
        <group key={p.id} position={p.pos as unknown as [number, number, number]}>
          <mesh ref={(m) => { cores.current[i] = m; }}>
            <sphereGeometry args={[0.045, 18, 14]} />
            <meshBasicMaterial color="#e0604a" toneMapped={false} />
          </mesh>
          <sprite ref={(s) => { halos.current[i] = s; }}>
            <spriteMaterial map={tex} color="#e0604a" transparent blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} toneMapped={false} />
          </sprite>
        </group>
      ))}
    </group>
  );
}
