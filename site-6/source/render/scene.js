// La chambre de Veilleuse, la nuit. Cette scène sert à calculer la vidéo image par image (render/rendre.sh) :
// le site n'affiche ensuite que des images, aucune 3D n'est calculée sur le téléphone.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const q = new URLSearchParams(location.search);
const T = Math.min(1, Math.max(0, parseFloat(q.get('t') ?? '0')));
const W = parseInt(q.get('w') ?? '1280', 10);
const H = parseInt(q.get('h') ?? '720', 10);
const portrait = H > W;

// Hasard reproductible : toutes les images de la vidéo ont exactement les mêmes textures.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b1317');
scene.fog = new THREE.Fog('#0b1317', 6, 11);

/* ---------- Textures dessinées en code ---------- */
function canvasTex(size, draw, repeat = [1, 1], srgb = true) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Parquet : lames de chêne foncé, chaque lame un peu différente, avec son veinage.
const parquet = canvasTex(1024, (g, s) => {
  const lame = s / 8;
  for (let i = 0; i < 8; i++) {
    const base = 70 + rnd() * 30;
    g.fillStyle = `rgb(${base + 38},${base + 12},${base - 12})`;
    g.fillRect(0, i * lame, s, lame);
    for (let k = 0; k < 40; k++) {
      g.strokeStyle = `rgba(40,22,10,${0.05 + rnd() * 0.12})`;
      g.lineWidth = 0.6 + rnd() * 1.6;
      const y = i * lame + rnd() * lame;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= s; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + k) * (2 + rnd() * 3));
      g.stroke();
    }
    const cut = rnd() * s;
    g.fillStyle = 'rgba(20,10,4,0.8)';
    g.fillRect(cut, i * lame, 3, lame);
    g.fillRect(0, i * lame, s, 3);
  }
}, [3, 3]);

// Tapis en laine écrue, bordure tissée.
const tapis = canvasTex(512, (g, s) => {
  g.fillStyle = '#cfc4b0';
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(${rnd() > 0.5 ? '255,250,240' : '120,105,85'},${0.05 + rnd() * 0.08})`;
    g.fillRect(rnd() * s, rnd() * s, 2, 2);
  }
  g.strokeStyle = 'rgba(110,92,70,0.55)';
  g.lineWidth = 10;
  g.strokeRect(26, 26, s - 52, s - 52);
  g.lineWidth = 3;
  g.strokeRect(46, 46, s - 92, s - 92);
});

// Tissage du velours de la housse (relief).
const tissage = canvasTex(256, (g, s) => {
  g.fillStyle = '#808080';
  g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 2) { g.fillStyle = `rgba(255,255,255,${0.04 + rnd() * 0.05})`; g.fillRect(0, y, s, 1); }
  for (let x = 0; x < s; x += 3) { g.fillStyle = `rgba(0,0,0,${0.05 + rnd() * 0.05})`; g.fillRect(x, 0, 1, s); }
}, [8, 6], false);

// Pores de la mousse (relief).
const pores = canvasTex(512, (g, s) => {
  g.fillStyle = '#fff';
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 14000; i++) {
    g.fillStyle = `rgba(0,0,0,${0.15 + rnd() * 0.35})`;
    g.beginPath();
    g.arc(rnd() * s, rnd() * s, 0.6 + rnd() * 2.2, 0, Math.PI * 2);
    g.fill();
  }
}, [3, 2], false);

// Plâtre des murs, légèrement irrégulier.
const platre = canvasTex(512, (g, s) => {
  g.fillStyle = '#808080';
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? 255 : 0},${rnd() > 0.5 ? 255 : 0},${rnd() > 0.5 ? 255 : 0},0.03)`; g.fillRect(rnd() * s, rnd() * s, 6, 6); }
}, [4, 2], false);

/* ---------- Matériaux ---------- */
const M = {
  sol: new THREE.MeshStandardMaterial({ map: parquet, roughness: 0.5, metalness: 0 }),
  mur: new THREE.MeshStandardMaterial({ color: '#33434c', roughness: 0.95, bumpMap: platre, bumpScale: 0.4 }),
  plinthe: new THREE.MeshStandardMaterial({ color: '#d9d2c4', roughness: 0.6 }),
  tapis: new THREE.MeshStandardMaterial({ map: tapis, roughness: 1 }),
  housse: new THREE.MeshPhysicalMaterial({ color: '#b9b5ad', roughness: 0.8, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color('#f4efe6'), bumpMap: tissage, bumpScale: 0.35 }),
  memoire: new THREE.MeshStandardMaterial({ color: '#efe9dc', roughness: 1, bumpMap: pores, bumpScale: 0.9 }),
  soutien: new THREE.MeshStandardMaterial({ color: '#6f8b7b', roughness: 1, bumpMap: pores, bumpScale: 0.7 }),
  semelle: new THREE.MeshStandardMaterial({ color: '#1f2528', roughness: 0.75 }),
  bois: new THREE.MeshStandardMaterial({ color: '#4a3324', roughness: 0.55 }),
  laiton: new THREE.MeshStandardMaterial({ color: '#b08a4c', roughness: 0.3, metalness: 0.9 }),
  abatJour: new THREE.MeshStandardMaterial({ color: '#f3dfbd', emissive: '#ffb45e', emissiveIntensity: 1.6, roughness: 0.9, side: THREE.DoubleSide }),
  vitre: new THREE.MeshBasicMaterial({ color: '#41607a' }),
  cadreFenetre: new THREE.MeshStandardMaterial({ color: '#e6e0d4', roughness: 0.6 }),
  balle: new THREE.MeshStandardMaterial({ color: '#b9cf4a', roughness: 1, bumpMap: pores, bumpScale: 0.5 }),
  tableau: new THREE.MeshStandardMaterial({ color: '#7f6a52', roughness: 0.9 }),
};

const add = (geo, mat, pos = [0, 0, 0], opts = {}) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (opts.rot) m.rotation.set(...opts.rot);
  m.castShadow = opts.cast ?? true;
  m.receiveShadow = opts.receive ?? true;
  (opts.parent ?? scene).add(m);
  return m;
};

/* ---------- La pièce ---------- */
add(new THREE.PlaneGeometry(10, 10), M.sol, [0, 0, 0], { rot: [-Math.PI / 2, 0, 0], cast: false });
add(new THREE.PlaneGeometry(10, 3), M.mur, [0, 1.5, -2.1], { cast: false });
add(new THREE.PlaneGeometry(10, 3), M.mur, [-2.3, 1.5, 0], { rot: [0, Math.PI / 2, 0], cast: false });
add(new THREE.PlaneGeometry(10, 3), M.mur, [2.6, 1.5, 0], { rot: [0, -Math.PI / 2, 0], cast: false });
add(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: '#1c262b', roughness: 1 }), [0, 2.7, 0], { rot: [Math.PI / 2, 0, 0], cast: false });
add(new THREE.BoxGeometry(10, 0.1, 0.02), M.plinthe, [0, 0.05, -2.09], { cast: false });
add(new THREE.BoxGeometry(0.02, 0.1, 10), M.plinthe, [-2.29, 0.05, 0], { cast: false });

// Le mur de l'entrée, avec l'embrasure de la porte par laquelle on arrive.
const murEntree = new THREE.MeshStandardMaterial({ color: '#283840', roughness: 0.95 });
add(new THREE.BoxGeometry(2.0, 2.7, 0.12), murEntree, [-1.5, 1.35, 3.2]);
add(new THREE.BoxGeometry(2.2, 2.7, 0.12), murEntree, [1.6, 1.35, 3.2]);
add(new THREE.BoxGeometry(1.0, 0.6, 0.12), murEntree, [0, 2.4, 3.2]);
add(new THREE.BoxGeometry(0.06, 2.12, 0.16), M.plinthe, [-0.5, 1.06, 3.2]);
add(new THREE.BoxGeometry(0.06, 2.12, 0.16), M.plinthe, [0.5, 1.06, 3.2]);
add(new THREE.BoxGeometry(1.06, 0.06, 0.16), M.plinthe, [0, 2.12, 3.2]);

// La fenêtre : nuit bleue, croisillons, et la tache de lune sur le parquet.
const fen = new THREE.Group();
fen.position.set(1.0, 1.45, -2.08);
scene.add(fen);
add(new THREE.PlaneGeometry(1.1, 1.5), M.vitre, [0, 0, 0], { parent: fen, cast: false, receive: false });
for (const [w, h, x, y] of [[1.22, 0.07, 0, 0.78], [1.22, 0.07, 0, -0.78], [0.07, 1.6, -0.58, 0], [0.07, 1.6, 0.58, 0], [0.04, 1.5, 0, 0], [1.1, 0.04, 0, 0.2]]) {
  add(new THREE.BoxGeometry(w, h, 0.06), M.cadreFenetre, [x, y, 0.02], { parent: fen, cast: false });
}
add(new THREE.BoxGeometry(1.36, 0.05, 0.16), M.cadreFenetre, [0, -0.82, 0.06], { parent: fen, cast: false });
// Petite lune et quelques étoiles dans la vitre.
add(new THREE.CircleGeometry(0.07, 32), new THREE.MeshBasicMaterial({ color: '#f4ecd6' }), [0.28, 0.45, 0.005], { parent: fen, cast: false, receive: false });
for (let i = 0; i < 24; i++) add(new THREE.CircleGeometry(0.004 + rnd() * 0.004, 6), new THREE.MeshBasicMaterial({ color: '#dfe8f0' }), [-0.5 + rnd() * 1.0, -0.6 + rnd() * 1.3, 0.004], { parent: fen, cast: false, receive: false });
const tache = canvasTex(256, (g, s) => {
  const gr = g.createLinearGradient(0, 0, 0, s);
  gr.addColorStop(0, 'rgba(160,190,230,0.22)');
  gr.addColorStop(1, 'rgba(160,190,230,0)');
  g.fillStyle = gr;
  g.fillRect(20, 0, s / 2 - 30, s);
  g.fillRect(s / 2 + 10, 0, s / 2 - 30, s);
});
add(new THREE.PlaneGeometry(1.3, 1.9), new THREE.MeshBasicMaterial({ map: tache, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), [0.75, 0.003, -1.0], { rot: [-Math.PI / 2, 0, 0.25], cast: false, receive: false });

// Un tableau au mur, une table de chevet et sa lampe.
add(new THREE.BoxGeometry(0.62, 0.46, 0.03), M.bois, [-1.05, 1.55, -2.07], { cast: false });
add(new THREE.PlaneGeometry(0.54, 0.38), M.tableau, [-1.05, 1.55, -2.05], { cast: false });
const chevet = new THREE.Group();
chevet.position.set(-1.25, 0, -1.25);
scene.add(chevet);
add(new RoundedBoxGeometry(0.5, 0.04, 0.4, 3, 0.01), M.bois, [0, 0.56, 0], { parent: chevet });
add(new RoundedBoxGeometry(0.46, 0.03, 0.36, 3, 0.01), M.bois, [0, 0.22, 0], { parent: chevet });
for (const [x, z] of [[-0.22, -0.17], [0.22, -0.17], [-0.22, 0.17], [0.22, 0.17]]) add(new THREE.CylinderGeometry(0.014, 0.01, 0.56, 10), M.bois, [x, 0.28, z], { parent: chevet });
add(new THREE.CylinderGeometry(0.07, 0.08, 0.03, 32), M.laiton, [0, 0.595, 0], { parent: chevet });
add(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 12), M.laiton, [0, 0.75, 0], { parent: chevet });
add(new THREE.CylinderGeometry(0.11, 0.16, 0.2, 48, 1, true), M.abatJour, [0, 0.95, 0], { parent: chevet, cast: false });
add(new THREE.BoxGeometry(0.16, 0.02, 0.22), new THREE.MeshStandardMaterial({ color: '#6b4c3a', roughness: 0.8 }), [0.08, 0.59, 0.06], { parent: chevet, rot: [0, 0.3, 0] });

// Le tapis.
add(new THREE.BoxGeometry(2.3, 0.012, 1.7), M.tapis, [0.05, 0.006, 0.15], { cast: false });

/* ---------- Le panier ---------- */
const L = 1.1, P = 0.85, R = 0.085;
const H_SEM = 0.008, H_SOU = 0.08, H_MEM = 0.06, H_COU = 0.035;
const panier = new THREE.Group();
panier.position.set(0.05, 0.012, 0.15);
panier.rotation.y = -0.38;
scene.add(panier);
const couche = () => { const g = new THREE.Group(); panier.add(g); return g; };
const gSem = couche(), gSou = couche(), gMem = couche(), gHou = couche();
add(new RoundedBoxGeometry(L + 0.01, H_SEM, P + 0.01, 2, 0.004), M.semelle, [0, H_SEM / 2, 0], { parent: gSem });
add(new RoundedBoxGeometry(L, H_SOU, P, 4, 0.018), M.soutien, [0, H_SOU / 2, 0], { parent: gSou });
add(new RoundedBoxGeometry(L, H_MEM, P, 4, 0.018), M.memoire, [0, H_MEM / 2, 0], { parent: gMem });
// La housse : coussin du dessus + traversin en U, ouvert à l'avant.
const coussin = new RoundedBoxGeometry(L - 2 * R * 1.5, H_COU, P - R * 2, 6, 0.016);
add(coussin, M.housse, [0, H_COU / 2, R * 0.2], { parent: gHou });
const x0 = -L / 2 + R, x1 = L / 2 - R, zb = -P / 2 + R, zf = P / 2 - R * 0.7, c = R * 1.5;
const courbe = new THREE.CatmullRomCurve3([
  new THREE.Vector3(x0, 0, zf), new THREE.Vector3(x0, 0, zb + c), new THREE.Vector3(x0 + c * 0.3, 0, zb + c * 0.3), new THREE.Vector3(x0 + c, 0, zb),
  new THREE.Vector3(x1 - c, 0, zb), new THREE.Vector3(x1 - c * 0.3, 0, zb + c * 0.3), new THREE.Vector3(x1, 0, zb + c), new THREE.Vector3(x1, 0, zf),
], false, 'centripetal', 0.5);
const traversin = add(new THREE.TubeGeometry(courbe, 220, R, 40, false), M.housse, [0, R * 0.95, 0], { parent: gHou });
traversin.scale.y = 0.92;
for (const s of [-1, 1]) add(new THREE.SphereGeometry(R, 40, 28), M.housse, [s * (L / 2 - R), R * 0.95 * 0.92, zf], { parent: gHou });
// Couture le long du traversin.
add(new THREE.TubeGeometry(courbe, 220, 0.003, 6, false), new THREE.MeshStandardMaterial({ color: '#6e767b', roughness: 0.9 }), [0, R * 0.95 + R * 0.86, 0], { parent: gHou, cast: false });

// La vieille balle de tennis du chien, au pied du panier.
add(new THREE.SphereGeometry(0.033, 32, 24), M.balle, [0.75, 0.045, 0.75]);

/* ---------- Lumières ---------- */
const hemi = new THREE.HemisphereLight('#8fa9c4', '#1a1410', 0.35);
scene.add(hemi);
const lampe = new THREE.PointLight('#ffb466', 9, 7, 1.6);
lampe.position.set(-1.25, 0.93, -1.25);
lampe.castShadow = true;
lampe.shadow.mapSize.set(2048, 2048);
lampe.shadow.radius = 8;
lampe.shadow.blurSamples = 20;
lampe.shadow.bias = -0.0004;
scene.add(lampe);
const lune = new THREE.DirectionalLight('#9dbbe0', 1.1);
lune.position.set(2.2, 3.2, -4.5);
lune.target.position.set(0.2, 0, 0.3);
lune.castShadow = true;
lune.shadow.mapSize.set(2048, 2048);
lune.shadow.camera.left = -3; lune.shadow.camera.right = 3; lune.shadow.camera.top = 3; lune.shadow.camera.bottom = -3;
lune.shadow.radius = 6;
lune.shadow.blurSamples = 16;
lune.shadow.bias = -0.0003;
scene.add(lune, lune.target);
// Lumière d'appoint chaude, côté porte (comme un couloir allumé) : le panier garde sa vraie couleur.
const appoint = new THREE.DirectionalLight('#ffd6a0', 0.75);
appoint.position.set(1.2, 2.2, 4);
appoint.target.position.set(0, 0, 0);
scene.add(appoint, appoint.target);
// Lumière de découpe ambrée, pour la vue éclatée de la fin.
const decoupe = new THREE.SpotLight('#ffc27a', 0, 6, 0.6, 0.8, 1.5);
decoupe.position.set(-1.2, 1.4, 1.6);
decoupe.target = panier;
scene.add(decoupe);
const face = new THREE.DirectionalLight('#f1e6d6', 0);
face.position.set(2, 1.2, 2);
scene.add(face);

/* ---------- Le trajet de la caméra ---------- */
const keys = [
  { t: 0.0, p: [0.25, 1.55, 5.4], v: [0.0, 0.45, 0.0] },
  { t: 0.22, p: [0.15, 1.35, 2.7], v: [0.0, 0.3, 0.1] },
  { t: 0.42, p: [0.95, 1.0, 1.75], v: [0.0, 0.14, 0.12] },
  { t: 0.6, p: [1.05, 0.62, 1.12], v: [0.03, 0.12, 0.12] },
  { t: 0.8, p: [1.85, 0.72, 0.75], v: [0.05, 0.28, 0.12] },
  { t: 1.0, p: [1.6, 0.66, -0.75], v: [0.05, 0.3, 0.12] },
];
const courbeCam = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.p)), false, 'centripetal');
const courbeVise = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.v)), false, 'centripetal');
// Temps → position sur la courbe (les clés ne sont pas régulièrement espacées).
function u(t) {
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) { const k = (t - a.t) / (b.t - a.t); const e = k * k * (3 - 2 * k) * 0.5 + k * 0.5; return (i + e) / (keys.length - 1); }
  }
  return 1;
}

const camera = new THREE.PerspectiveCamera(portrait ? 58 : 38, W / H, 0.02, 30);

// Place la caméra et écarte les couches pour l'instant t (0 → 1) du film.
function poser(T) {
  camera.position.copy(courbeCam.getPoint(u(T)));
  const vise = courbeVise.getPoint(u(T));
  // En hauteur (téléphone), on regarde un peu plus haut : moins de sol, plus de lampe et de fenêtre.
  if (portrait) vise.y += 0.22 * (1 - smooth(0.55, 0.8, T));
  camera.lookAt(vise);
  // Vue éclatée : les couches se séparent, la chambre s'assombrit et une lumière de découpe s'allume.
  const e = smooth(0.6, 0.86, T);
  gHou.position.y = H_SEM + H_SOU + H_MEM + e * 0.36;
  gMem.position.y = H_SEM + H_SOU + e * 0.22;
  gSou.position.y = H_SEM + e * 0.1;
  lampe.intensity = 9 * (1 - 0.45 * e);
  lune.intensity = 1.1 * (1 - 0.5 * e);
  decoupe.intensity = 14 * e;
  face.intensity = 0.9 * e;
}

/* ---------- Rendu ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.45, 0.7, 0.82));
// Vignette douce et léger grain, comme une prise de vue.
composer.addPass(new ShaderPass({
  uniforms: { tDiffuse: { value: null } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv); float d = distance(vUv, vec2(0.5));
      c.rgb *= smoothstep(0.85, 0.3, d) * 0.55 + 0.45; gl_FragColor = c; }`,
}));
composer.addPass(new OutputPass());

// Une image (?t=0.5) ou une série (?de=0&a=19&n=120 : images 0 à 19 d'un film de 120).
// Chaque image sort dans le texte de la page (lu par render/rendre.py), à la taille exacte demandée.
const qualite = parseFloat(q.get('qualite') ?? '0.72');
const liste = q.has('de')
  ? Array.from({ length: +q.get('a') - +q.get('de') + 1 }, (_, k) => +q.get('de') + k)
  : [null];
const n = +(q.get('n') ?? '120');
for (const i of liste) {
  poser(i === null ? T : i / (n - 1));
  composer.render();
  const pre = document.createElement('pre');
  pre.dataset.i = String(i ?? 0);
  pre.textContent = renderer.domElement.toDataURL('image/jpeg', qualite);
  document.body.appendChild(pre);
}
document.title = 'fini';
