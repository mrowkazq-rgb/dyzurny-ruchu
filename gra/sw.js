// Service worker gry (PWA): gra dziala bez internetu po pierwszym wczytaniu.
// Strona gry - najpierw siec (zawsze najnowsza wersja), w razie braku sieci - kopia.
// Biblioteki, czcionki, modele 3D - najpierw kopia (szybko), w tle odswiezenie.
// Licznik odwiedzin i ranking (API) - tylko siec, bez kopii.
const WERSJA = '202610072205';
const KOPIA = 'dyzurny-' + WERSJA;
const START = ['./', './manifest.webmanifest', './ikona-192.png', './ikona-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(KOPIA).then(c => c.addAll(START)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('dyzurny-') && n !== KOPIA).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (/abacus|supabase|indexnow/.test(u.hostname)) return;              // API - tylko siec
  const strona = r.mode === 'navigate' || (u.origin === location.origin && /\/(index\.html)?$/.test(u.pathname));
  if (strona) {
    e.respondWith(fetch(r).then(res => { const k = res.clone(); caches.open(KOPIA).then(c => c.put(r, k)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => {
    const siec = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const k = res.clone(); caches.open(KOPIA).then(c => c.put(r, k)); } return res; })
      .catch(() => m);
    return m || siec;
  }));
});
