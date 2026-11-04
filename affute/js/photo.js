// Photos de progression (gardées sur le téléphone, dans IndexedDB) et simulation « après ».

const DB = 'affute-photos';

function db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('photos', { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction('photos', mode);
    const out = fn(t.objectStore('photos'));
    t.oncomplete = () => resolve(out && 'result' in out ? out.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

export const savePhoto = (photo) => tx('readwrite', (s) => s.put(photo));
export const deletePhoto = (id) => tx('readwrite', (s) => s.delete(id));
export async function listPhotos() {
  const all = await tx('readonly', (s) => s.getAll());
  return (all || []).sort((a, b) => b.date - a.date);
}

// Réduit la photo (moins de place, plus rapide) et renvoie une image JPEG.
export function loadImage(file, max = 1100) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Simulation : affine la silhouette autour du centre du corps.
 * cx, cy : centre du ventre (0 à 1). squeeze : 0,85 = taille 15 % plus fine.
 * C'est une déformation d'image (comme un filtre « liquify »), pas une prédiction médicale.
 */
export function simulate(img, { cx = 0.5, cy = 0.5, squeeze = 0.9, definition = 0 } = {}) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const src = document.createElement('canvas');
  src.width = w; src.height = h;
  const sctx = src.getContext('2d');
  sctx.drawImage(img, 0, 0, w, h);
  const input = sctx.getImageData(0, 0, w, h);
  const out = sctx.createImageData(w, h);
  const ix = input.data; const ox = out.data;

  const X = cx * w; const Y = cy * h;
  const R = 0.24 * w; // demi-largeur approximative du corps
  const R2 = 0.42 * w; // au-delà, l'image n'est pas modifiée
  const top = Y - 0.3 * h; const bottom = Y + 0.28 * h; // de la poitrine aux cuisses
  const smoothstep = (t) => t * t * (3 - 2 * t);

  for (let y = 0; y < h; y++) {
    // Force verticale : maximale au niveau du ventre, nulle en haut et en bas.
    let v = 0;
    if (y > top && y < bottom) {
      const t = y < Y ? (y - top) / (Y - top) : (bottom - y) / (bottom - Y);
      v = smoothstep(Math.max(0, Math.min(1, t * 1.6)));
    }
    const k = 1 - (1 - squeeze) * v; // le corps devient k fois plus étroit
    const inner = R * k;
    for (let x = 0; x < w; x++) {
      const d = x - X;
      const ad = Math.abs(d);
      let sd = ad;
      if (k < 1 && ad < R2) {
        // Corps : on rétrécit. Arrière-plan : on étire doucement pour boucher le vide.
        sd = ad < inner ? ad / k : R + ((ad - inner) / (R2 - inner)) * (R2 - R);
      }
      const sx = X + Math.sign(d) * sd;
      const x0 = Math.max(0, Math.min(w - 1, Math.floor(sx)));
      const x1 = Math.min(w - 1, x0 + 1);
      const fx = Math.max(0, Math.min(1, sx - Math.floor(sx)));
      const i = (y * w + x) * 4; const a0 = (y * w + x0) * 4; const a1 = (y * w + x1) * 4;
      for (let c = 0; c < 4; c++) ox[i + c] = ix[a0 + c] * (1 - fx) + ix[a1 + c] * fx;
    }
  }
  sctx.putImageData(out, 0, 0);

  // Léger contraste dans la zone du ventre pour suggérer plus de définition.
  if (definition > 0) {
    const g = sctx.createRadialGradient(X, Y, 0, X, Y, R);
    g.addColorStop(0, `rgba(0,0,0,${0.12 * definition})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.globalCompositeOperation = 'soft-light';
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, w, h);
    sctx.globalCompositeOperation = 'source-over';
  }
  return src;
}
