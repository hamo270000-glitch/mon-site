// Fonctionne hors ligne : on garde une copie de l'appli et des données.
const CACHE = 'affute-v16';
const ASSETS = [
  './', 'index.html', 'css/app.css', 'js/app.js', 'js/calc.js', 'js/data.js', 'js/body.js', 'js/photo.js', 'js/scan.js', 'js/journal.js', 'js/sport.js', 'js/sport-data.js', 'js/muscles.js',
  '../js/api.js', '../js/score.js', '../js/data.js', '../vendor/html5-qrcode.min.js',
  'data/ingredients.json', 'data/repas.json', 'data/photos.json', 'data/aliments.json', 'manifest.webmanifest',
  'icons/logo.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('affute-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Réseau d'abord (dernière version), copie locale si pas de réseau.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))),
  );
});
