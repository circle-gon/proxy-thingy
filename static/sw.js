import { getFirst, isValidURL, proxyURL } from "./utils.js?proxyresource";

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
    const basePath = getFirst(url.pathname);
    if (isValidURL(basePath)) return originalURL;
    return "https://" + DOMAIN + "/" + currentBase + url.pathname;
  } else {
    return proxyURL(originalURL, DOMAIN);
  }
}

async function mockClientRequest(request, id) {
  // 1. get the url originating the request
  const clientURL = (await self.clients.get(id)).url;
  
  // 2. get a new url
  const newURL = replaceURL(request.url, getFirst(new URL(clientURL).pathname));
  
  // 3. change the request
  const r = new Request(newURL, request)
  
  // 4. return it
  
  return await fetch(r)
}

self.addEventListener("activate", (e) => {
  e.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(mockClientRequest(e.request, e.clientId));
});
