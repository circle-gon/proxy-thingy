const CACHE_KEY = "v0.0.1";

async function deleteOldCaches() {
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter((k) => k === CACHE_KEY);
  await Promise.all(cachesToDelete.map((r) => caches.delete(r)));
}

async function addResourcesToCache(resources) {
  const cache = await caches.open(CACHE_KEY);
  await cache.addAll(resources);
}

self.addEventListener("install", (e) => {
  e.waitUntil(addResourcesToCache(["/https%3A%2F%2Fglitch.com/favicon.ico"]));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url)
  if (url.pathname === "/favicon.ico") {
    e.respondWith(caches.match('/https%3A%2F%2Fglitch.com/favicon.ico'));
  }
});
