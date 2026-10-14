/* Bump the cache version for each published asset or glossary update. */
const CACHE_NAME = "investment-glossary-v1.0.0";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./app.js", "./diagrams.js",
  "./data/glossary.json", "./sources.html", "./manifest.webmanifest",
  "./assets/icon.svg", "./assets/icon-192.png", "./assets/icon-512.png"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS.map((path) => new URL(path, self.registration.scope)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("investment-glossary-") && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (request.mode === "navigate") {
        const fallback = await cache.match(new URL("./index.html", self.registration.scope));
        if (fallback) return fallback;
      }
      return new Response("Offline resource unavailable", { status: 503, statusText: "Offline" });
    }
  })());
});
