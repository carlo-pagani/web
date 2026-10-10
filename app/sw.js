// Permite abrir la app sin conexión. Los datos no pasan por aquí: viven en el teléfono.
const VERSION = 'fc-1';
const BASICO = ['./', './app.js?v=1', './app.css?v=1', './manifest.webmanifest', './icono-192.png', './icono-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASICO)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const propio = url.origin === location.origin && url.pathname.startsWith(new URL('./', self.registration.scope).pathname);
  const fuentes = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!propio && !fuentes) return;
  // La página: primero la red (para recibir mejoras), si no hay conexión, la copia guardada.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(VERSION).then((k) => k.put('./', c)); return r; }).catch(() => caches.match('./')));
    return;
  }
  // Lo demás (código, lector de facturas, fuentes): la copia guardada si existe.
  e.respondWith(caches.match(e.request).then((g) => g || fetch(e.request).then((r) => {
    if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSION).then((k) => k.put(e.request, c)); }
    return r;
  })));
});
