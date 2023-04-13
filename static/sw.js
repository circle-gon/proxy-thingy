const CACHE_KEY = "v0.0.2";

const DOMAIN = "$$PROJECT_DOMAIN$$"

async function putInCache(request, response) {
  const cache = await caches.open(CACHE_KEY);
  await cache.put(request, response);
};

async function deleteOldCaches() {
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter((k) => k !== CACHE_KEY);
  await Promise.all(cachesToDelete.map((r) => caches.delete(r)));
}

function replaceURL(originalURL) {
  const url    
}

async function cacheFirst(request) {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("activate", (e) => {
  e.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(cacheFirst(e.request))
});
