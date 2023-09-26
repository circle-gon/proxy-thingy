// ARGH
//import { getFirst, isValidURL, proxyURL } from "./utils.js?proxyresource"
import { getFirst} from "./utils.js?proxyresource"
const BASE_URL = "https://adaptive-tricolor-whip.glitch.me"

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

/*function getFirst(url) {
  return decodeURIComponent(slice(url)[0]);
}*/

function proxyOutboundURL(url) {
  const urlify = new URL(url);
  return (
    BASE_URL +
    encodeURIComponent(urlify.origin) +
    urlify.pathname
  );
}

function proxyURL(originalURL, currentBase = undefined) {
  const url = new URL(originalURL);
  if (url.origin === BASE_URL) {
    const basePath = getFirst(url.pathname);
    if (isValidURL(basePath)) return originalURL;
    
    if (currentBase) {
    return (
      BASE_URL + encodeURIComponent(currentBase) + url.pathname
    );
    } else {
      throw new TypeError("Absolute url was given, but there is no currentBase")
    }
  } else {
    return proxyOutboundURL(originalURL)
  }
}

function replaceURL(originalURL, currentBase) {
  const params = new URLSearchParams(new URL(originalURL).search);

  // this is a proxyresource, which should not be altered
  if (params.has("proxyresource")) return originalURL;
  return proxyURL(originalURL, currentBase)
}

function getModifications(req) {
  const obj = {};
  if (req.method !== "GET" && req.method !== "HEAD") obj.duplex = "half";
  return obj;
}

const REQUEST_KEYS = [
  "method",
  "headers",
  "body",
  "mode",
  "credentials",
  "cache",
  "redirect",
  "referrer",
  "referrerPolicy",
  "integrity",
  "keepalive",
  "signal",
  "priority",
];

function requestToObject(request) {
  const obj = {};
  for (const key of REQUEST_KEYS) {
    if (key === "body") {
      const method = request.method;
      if (method === "GET" || method === "HEAD") continue;
    }
    obj[key] = request[key];
  }
  return obj;
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
    console.log(`Proxied url: ${request.url} -> ${newURL}`);
    console.log(request);

    // 3. change the request
    const modi = getModifications(request);

    console.log(JSON.stringify(modi));

    const newRequest = new Request(newURL, {
      ...requestToObject(request),
      ...modi,
    });

    // 4. return it

    console.log(newRequest);

    return await fetch(newRequest);
  }
  return await fetch(request);
}

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(mockClientRequest(e.request, e.clientId));
});
