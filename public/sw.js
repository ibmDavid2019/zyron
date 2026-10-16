const CACHE_NAME = "zyron-shell-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Only handle page navigations, falling back to a branded offline page when
// the network is unreachable. Static assets and data requests pass through
// untouched — there's no real backend cache to manage yet.
//
// One retry before giving up: a single failed fetch can be a transient
// network blip (a flaky tunnel/proxy reconnecting) rather than a genuine
// loss of connectivity, and OAuth callback navigations in particular can't
// just be silently swapped for a cached page — the user needs the real
// response, not a stale "offline" screen.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      fetch(event.request).catch(() => caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL)))
    )
  );
});
