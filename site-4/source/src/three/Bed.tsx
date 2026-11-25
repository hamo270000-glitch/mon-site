import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// Le panier Lové en 3D, construit en code (aucun fichier à télécharger).
// - explode (0 → 1) : écarte les couches pour la vue éclatée.
// - la housse se creuse là où on appuie, puis remonte lentement, comme une mousse à mémoire de forme.

const L = 2.2; // longueur (axe x)
const W = 1.7; // largeur (axe z)
const R = 0.2; // rayon du traversin
const H_SOLE = 0.03;
const H_SUPPORT = 0.26;
const H_MEMORY = 0.18;
const H_CUSHION = 0.1;
const SEG_X = 96;
const SEG_Z = 72;
const TUFTS: [number, number][] = [[-0.45, -0.35], [0, -0.35], [0.45, -0.35], [-0.45, 0.35], [0, 0.35], [0.45, 0.35]];

function noiseTexture(kind: 'weave' | 'pores', base: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  if (kind === 'weave') {
    for (let y = 0; y < 256; y += 2) {
      g.fillStyle = `rgba(255,255,255,${0.035 + Math.random() * 0.03})`;
      g.fillRect(0, y, 256, 1);
    }
    for (let x = 0; x < 256; x += 3) {
      g.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.04})`;
      g.fillRect(x, 0, 1, 256);
    }
  } else {
    for (let i = 0; i < 2600; i++) {
      const r = Math.random() * 1.6 + 0.3;
      g.fillStyle = `rgba(0,0,0,${0.12 + Math.random() * 0.2})`;
      g.beginPath();
      g.arc(Math.random() * 256, Math.random() * 256, r, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(kind === 'weave' ? 6 : 3, kind === 'weave' ? 5 : 2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Traversin en U (arrière + deux côtés), ouvert à l'avant pour que le chien entre.
function bolsterCurve() {
  const x0 = -L / 2 + R;
  const x1 = L / 2 - R;
  const zb = -W / 2 + R;
  const zf = W / 2 - R * 0.6;
  const c = R * 1.4;
  const pts = [
    new THREE.Vector3(x0, 0, zf),
    new THREE.Vector3(x0, 0, zb + c),
    new THREE.Vector3(x0 + c * 0.3, 0, zb + c * 0.3),
    new THREE.Vector3(x0 + c, 0, zb),
    new THREE.Vector3(x1 - c, 0, zb),
    new THREE.Vector3(x1 - c * 0.3, 0, zb + c * 0.3),
    new THREE.Vector3(x1, 0, zb + c),
    new THREE.Vector3(x1, 0, zf),
  ];
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
}


// Traversin matelassé : le tube se gonfle entre les coutures, comme un vrai coussin rembourré.
function quiltedBolster(curve: THREE.CatmullRomCurve3) {
  const TS = 260;
  const RS = 36;
  const g = new THREE.TubeGeometry(curve, TS, R, RS, false);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const len = curve.getLength();
  const baffles = Math.round(len / 0.34);
  const c = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i <= TS; i++) {
    const u = i / TS;
    curve.getPointAt(u, c);
    const puff = 0.86 + 0.16 * Math.pow(Math.abs(Math.sin(Math.PI * u * baffles)), 0.55);
    for (let j = 0; j <= RS; j++) {
      const k = i * (RS + 1) + j;
      v.fromBufferAttribute(pos, k).sub(c);
      v.multiplyScalar(puff);
      if (v.y < 0) v.y *= 0.72; // posé sur la base : le dessous s'écrase un peu
      v.add(c);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return g;
}

// Liseré (passepoil) autour du haut de la housse.
function pipingCurve(w: number, d: number, r: number) {
  const pts: THREE.Vector3[] = [];
  const hw = w / 2 - r;
  const hd = d / 2 - r;
  const corners: [number, number, number][] = [[hw, hd, 0], [-hw, hd, Math.PI / 2], [-hw, -hd, Math.PI], [hw, -hd, (3 * Math.PI) / 2]];
  for (const [cx, cz, a0] of corners) {
    for (let i = 0; i <= 8; i++) {
      const a = a0 + (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r));
    }
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

function lighten(hex: string, amt: number) {
  return '#' + new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), amt).getHexString();
}

export interface BedProps {
  cover: string;
  bolster: string;
  explode?: number;
  highlight?: number | null; // index de couche mise en avant (0 = housse … 3 = semelle)
  interactive?: boolean;
  breathe?: boolean;
  onPress?: () => void;
  /** rotation imposée (pilotée par le défilement) ; sinon le panier tourne doucement tout seul */
  rotY?: { current: number } | null;
}

export default function Bed({ cover, bolster, explode = 0, highlight = null, interactive = true, breathe = true, onPress, rotY = null }: BedProps) {
  const cushion = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Object3D | null)[]>([]);
  const press = useRef({ down: false, x: 0, z: 0, t: 0 });
  const explodeNow = useRef(explode);

  const weave = useMemo(() => noiseTexture('weave', '#808080'), []);
  const pores = useMemo(() => noiseTexture('pores', '#ffffff'), []);
  const curve = useMemo(bolsterCurve, []);
  const bolsterGeo = useMemo(() => quiltedBolster(curve), [curve]);
  const piping = useMemo(() => pipingCurve(L + 0.03, W + 0.03, 0.07), []);
  const sleeveMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const pipeMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const sleeve = useRef<THREE.Group>(null);

  // Housse intérieure : une boîte très découpée dont on déforme la face du dessus.
  const cushionGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(L - 2 * R * 1.55, H_CUSHION, W - R * 2.1, SEG_X, 1, SEG_Z);
    return g;
  }, []);
  const base = useMemo(() => Float32Array.from(cushionGeo.attributes.position.array as Float32Array), [cushionGeo]);
  const depth = useMemo(() => new Float32Array(cushionGeo.attributes.position.count), [cushionGeo]);
  const halfX = (L - 2 * R * 1.55) / 2;
  const halfZ = (W - R * 2.1) / 2;

  useEffect(() => () => { weave.dispose(); pores.dispose(); cushionGeo.dispose(); bolsterGeo.dispose(); }, [weave, pores, cushionGeo, bolsterGeo]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const k = Math.min(dt, 1 / 20);

    // Écartement des couches, adouci.
    explodeNow.current += (explode - explodeNow.current) * Math.min(1, k * 6);
    const e = explodeNow.current;
    const offs = [0.95, 0.55, 0.25, 0];
    const baseY = [H_SOLE + H_SUPPORT + H_MEMORY, H_SOLE + H_SUPPORT, H_SOLE, 0];
    layers.current.forEach((o, i) => { if (o) o.position.y = baseY[i] + offs[i] * e * 1.6; });
    // La housse extérieure recouvre les mousses ; elle s'efface quand on ouvre le panier.
    const show = Math.max(0, 1 - e * 3);
    if (sleeve.current) sleeve.current.visible = show > 0.01;
    for (const m of [sleeveMat.current, pipeMat.current]) {
      if (m) { m.opacity = show; m.transparent = show < 0.999; m.depthWrite = show > 0.5; }
    }

    // Déformation de la mousse.
    const pos = cushionGeo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const p = press.current;
    const breath = breathe ? 0.012 + 0.01 * Math.sin(t * 1.3) : 0;
    for (let i = 0; i < pos.count; i++) {
      const y0 = base[i * 3 + 1];
      if (y0 <= 0) continue; // seulement la face du dessus
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      const edge = Math.min(1, (halfX - Math.abs(x)) / 0.12, (halfZ - Math.abs(z)) / 0.12);
      let target = -breath * Math.exp(-(x * x) / 0.35 - (z * z) / 0.2);
      if (p.down) {
        const dx = x - p.x;
        const dz = z - p.z;
        target -= 0.085 * Math.exp(-(dx * dx + dz * dz) / 0.07);
      }
      target *= Math.max(0, edge);
      // Descend vite, remonte lentement : c'est le comportement d'une mousse à mémoire de forme.
      const rate = target < depth[i] ? 9 : 0.9;
      depth[i] += (target - depth[i]) * Math.min(1, k * rate);
      const nx = x / halfX;
      const nz = z / halfZ;
      let rest = 0.055 * (1 - nx ** 4) * (1 - nz ** 4); // coussin bombé
      for (const [tx, tz] of TUFTS) rest -= 0.018 * Math.exp(-((nx - tx) ** 2 + (nz - tz) ** 2) / 0.006); // capitons
      arr[i * 3 + 1] = y0 + depth[i] + Math.max(0, edge) * rest;
    }
    pos.needsUpdate = true;
    cushionGeo.computeVertexNormals();

    if (group.current) {
      const g = group.current;
      const px = interactive ? state.pointer.x : 0;
      const py = interactive ? state.pointer.y : 0;
      const target = rotY ? rotY.current : -0.5 + Math.sin(t * 0.25) * 0.35 + px * 0.18;
      g.rotation.y += (target - g.rotation.y) * Math.min(1, k * 3);
      g.rotation.x += ((py * -0.05) - g.rotation.x) * Math.min(1, k * 2.5);
    }
  });

  const toLocal = (ev: ThreeEvent<PointerEvent>) => {
    const m = cushion.current;
    if (!m) return;
    const v = m.worldToLocal(ev.point.clone());
    press.current.x = v.x;
    press.current.z = v.z;
  };

  const dim = (i: number) => (highlight === null || highlight === i ? 1 : 0.35);

  return (
    <group ref={group} rotation={[0, -0.5, 0]} position={[0, -0.32, 0]}>
      {/* 0 : housse (coussin + traversin) */}
      <group ref={(o) => { layers.current[0] = o; }}>
        <mesh
          ref={cushion}
          geometry={cushionGeo}
          position={[0, H_CUSHION / 2, R * 0.25]}
          castShadow
          receiveShadow
          onPointerDown={interactive ? (ev) => { ev.stopPropagation(); (ev.target as Element | null)?.setPointerCapture?.(ev.pointerId); press.current.down = true; toLocal(ev); onPress?.(); } : undefined}
          onPointerMove={interactive ? (ev) => { if (press.current.down) toLocal(ev); } : undefined}
          onPointerUp={interactive ? () => { press.current.down = false; } : undefined}
          onPointerLeave={interactive ? () => { press.current.down = false; } : undefined}
          onPointerOver={interactive ? () => { document.body.style.cursor = 'grab'; } : undefined}
          onPointerOut={interactive ? () => { document.body.style.cursor = ''; } : undefined}
        >
          <meshPhysicalMaterial color={cover} roughness={1} sheen={1} sheenRoughness={0.5} sheenColor={lighten(cover, 0.55)} bumpMap={weave} bumpScale={0.35} transparent={dim(0) < 1} opacity={dim(0)} />
        </mesh>
        <mesh position={[0, R * 0.9, 0]} geometry={bolsterGeo} castShadow receiveShadow>
          <meshPhysicalMaterial color={bolster} roughness={1} sheen={1} sheenRoughness={0.45} sheenColor={lighten(bolster, 0.6)} bumpMap={weave} bumpScale={0.35} transparent={dim(0) < 1} opacity={dim(0)} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (L / 2 - R), R * 0.9, W / 2 - R * 0.6]} castShadow>
            <sphereGeometry args={[R * 0.9, 32, 24]} />
            <meshPhysicalMaterial color={bolster} roughness={1} sheen={1} sheenRoughness={0.45} sheenColor={lighten(bolster, 0.6)} bumpMap={weave} bumpScale={0.35} transparent={dim(0) < 1} opacity={dim(0)} />
          </mesh>
        ))}
      </group>

      {/* Housse extérieure : elle habille les mousses quand le panier est fermé */}
      <group ref={sleeve}>
        <RoundedBox args={[L + 0.03, H_MEMORY + H_SUPPORT + 0.012, W + 0.03]} radius={0.07} smoothness={5} position={[0, H_SOLE + (H_MEMORY + H_SUPPORT) / 2, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial ref={sleeveMat} color={bolster} roughness={1} sheen={1} sheenRoughness={0.5} sheenColor={lighten(bolster, 0.5)} bumpMap={weave} bumpScale={0.35} />
        </RoundedBox>
        {[H_SOLE + H_MEMORY + H_SUPPORT - 0.005, H_SOLE + 0.02].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <tubeGeometry args={[piping, 220, 0.016, 10, true]} />
            <meshPhysicalMaterial ref={y > 0.1 ? pipeMat : undefined} color={lighten(bolster, -0.0)} roughness={0.8} sheen={0.6} sheenColor={lighten(bolster, 0.4)} />
          </mesh>
        ))}
      </group>

      {/* 1 : mousse à mémoire de forme */}
      <group ref={(o) => { layers.current[1] = o; }}>
        <RoundedBox args={[L, H_MEMORY, W]} radius={0.05} smoothness={4} position={[0, H_MEMORY / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#ece6d6" roughness={1} bumpMap={pores} bumpScale={1.2} transparent opacity={dim(1)} />
        </RoundedBox>
      </group>

      {/* 2 : mousse de soutien */}
      <group ref={(o) => { layers.current[2] = o; }}>
        <RoundedBox args={[L, H_SUPPORT, W]} radius={0.05} smoothness={4} position={[0, H_SUPPORT / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8d8f98" roughness={1} bumpMap={pores} bumpScale={0.8} transparent opacity={dim(2)} />
        </RoundedBox>
      </group>

      {/* 3 : semelle antidérapante */}
      <group ref={(o) => { layers.current[3] = o; }}>
        <RoundedBox args={[L + 0.02, H_SOLE, W + 0.02]} radius={0.012} smoothness={2} position={[0, H_SOLE / 2, 0]} receiveShadow>
          <meshStandardMaterial color="#2a2a30" roughness={0.7} transparent opacity={dim(3)} />
        </RoundedBox>
      </group>
    </group>
  );
}
