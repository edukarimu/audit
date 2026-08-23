// Minimal offline app-shell cache for the Karimu Field Audit PWA.
// Strategy: network-first, falling back to cache when there's no
// connection — never cache API calls, since those are the sync writes.
const CACHE = "karimu-audit-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // never intercept POST /api/sync etc.
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return; // always hit the network
  if (url.origin !== self.location.origin) return; // leave Google Fonts alone

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("/")))
  );
});
