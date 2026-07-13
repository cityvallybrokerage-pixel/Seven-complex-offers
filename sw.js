/* Seven Complex — offline cache (optional companion for GitHub Pages) */
const CACHE = 'seven-complex-v3';
const STATIC = [
  './seven_Complex_off.pdf',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Marhey:wght@600&display=swap'
];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(STATIC.map(u => c.add(u).catch(()=>{})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isDoc = req.mode === 'navigate' || (req.destination === 'document');
  if (isDoc) {
    // network-first for the app itself, so updates show immediately when online
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy).catch(()=>{}));
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./')))
    );
    return;
  }
  // cache-first for static third-party assets (fonts / jsPDF)
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy).catch(()=>{}));
      return res;
    }).catch(() => hit))
  );
});
