import {
  getFirst,
  proxyAbsoluteURL,
  MESSAGE_TYPES as M,
  utilListen,
} from "/utils.js?proxyresource";

function replaceURL(originalURL, currentBase) {
  const params = new URL(originalURL).searchParams;

  // this is a proxyresource, which should not be altered
  if (params.has("proxyresource")) return originalURL;
  return proxyAbsoluteURL(originalURL, currentBase);
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
  const client = await self.clients.get(id);

  if (client) {
    const newURL = replaceURL(
      request.url,
      getFirst(new URL(client.url).pathname)
    );

    client.postMessage({
      type: M.FETCH,
      data: {
        oldURL: request.url,
        newURL: newURL,
      },
    });

    const modi = getModifications(request);

    const newRequest = new Request(newURL, {
      ...requestToObject(request),
      ...modi,
    });

    return await fetch(newRequest);
  }
  return await fetch(request);
}

self.addEventListener("activate", (e) => {
  self.skipWaiting();
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(mockClientRequest(e.request, e.clientId));
});
