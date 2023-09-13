//import { getFirst, isValidURL, proxyURL } from "./utils.js?proxyresource"

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
/*function proxyURL(url, origin) {
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
}*/

const DOMAIN = self.location.host;

function replaceURL(originalURL, currentBase) {
  const url = new URL(originalURL);
  const params = new URLSearchParams(url.search);

  // this is a proxyresource, which should not be altered
  if (params.has("proxyresource")) return originalURL;
  else if (url.hostname === DOMAIN) {
    const basePath = getFirst(url.pathname);
    if (isValidURL(basePath)) return originalURL;
    return "https://" + DOMAIN + "/" + encodeURIComponent(currentBase) + url.pathname;
  } else {
    return originalURL
    //return proxyURL(originalURL, DOMAIN);
  }
}

function getModifications(req) {
  const obj = {}
  if (req.method !== "GET" && req.method !== "HEAD") obj.duplex = "half"
  return obj
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
    console.log(request)

    // 3. change the request
    
    // first: add critical stuff
    const h = new Request(request, getModifications(request))
    
    // second: change url
    const r = new Request(newURL, h);

    // 4. return it

    return await fetch(r);
  }
  return await fetch(request);
}

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(mockClientRequest(e.request, e.clientId));
});
