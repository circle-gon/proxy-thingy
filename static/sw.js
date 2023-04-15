//import { getFirst, isValidURL, proxyURL } from "./utils.js?proxyresource";

//const CACHE_KEY = "v0.0.2";

function hasHTTPProtocol(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function isValidURL(test) {
  let url;
  try {
    url = new URL(test);
  } catch (e) {
    return false;
  }
  return hasHTTPProtocol(test);
}
function slice(url) {
  return url.slice(1).split("/");
}

function getFirst(url) {
  return decodeURIComponent(slice(url)[0]);
}

// forcing origin as an option is better because http/https differences
// also less bad code/duplication

// url should start with http vs https based on current page
function proxyURL(url, origin) {
  const originGo = new URL(url).origin;
  // default to https, not that it matters anyway
  // if you're using http you have a problem
  return (
    "https://" +
    origin +
    "/" +
    encodeURIComponent(originGo) +
    // prefer this over url.pathname as it always
    // starts with /, even if you don't specify it
    url.replace(originGo, "")
  );
}

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
  const clientURL = (await self.clients.get(id))?.url;

  if (clientURL) {
    // 2. get a new url
    const newURL = replaceURL(
      request.url,
      getFirst(new URL(clientURL).pathname)
    );
    console.log(`Proxied url: ${request.url} -> ${newURL}`)

    // 3. change the request
    const r = new Request(newURL, request);

    // 4. return it

    return await fetch(r);
  }
  return await fetch(request);
}

self.addEventListener("activate", (e) => {
  e.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(mockClientRequest(e.request, e.clientId));
});
