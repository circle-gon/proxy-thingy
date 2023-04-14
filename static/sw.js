import {getFirst, isValidURL, proxyURL} from "./utils.js?proxyresource"

//const CACHE_KEY = "v0.0.2";

const DOMAIN = self.location.host;

async function deleteOldCaches() {
  const keyList = await caches.keys();
  const cachesToDelete = keyList; //.filter((k) => k !== CACHE_KEY);
  await Promise.all(cachesToDelete.map((r) => caches.delete(r)));
}

function replaceURL(originalURL, currentBase) {
  const url = new URL(originalURL);
  const params = new URLSearchParams(url.search);

  // this is a proxyresource, which should not be altered
  if (params.has("proxyresource")) return originalURL;
  else if (url.hostname === DOMAIN) {
    const basePath = getFirst(url.pathname)
    if (isValidURL(basePath)) return originalURL;
    return "https://" + DOMAIN + "/"
  } else {
    
  }
}

async function mockClientRequest(request) {}

self.addEventListener("activate", (e) => {
  e.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(mockClientRequest(e.request));
});
