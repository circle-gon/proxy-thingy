import {slice} from "./utils.js"

const source = slice(document.pathname)[0]
const origin = document.origin

async function cloneRequest(request) {
  const headers = {}
  for (const [header, result] of request.headers.entries()) {
    headers[header] = result
  }
  const copy = {
    url: request.url,
    headers: headers,
    method: request.method,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer
  };  
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const body = await request.clone().text()
    copy.body = body
  }
  return copy
}

function transform(data) {
  return new Request(data.url, data)
}

async function modifyRequest(request) {
  const copy = await cloneRequest(request)
  let url = copy.url
  if (url.startsWith("/")) url = "." + url
  else if (url.startsWith("https://")) url = origin + url.replace("https://", "")
  copy.url = url
  return transform(copy)
}

self.addEventListener("fetch", async e => {
  //const modified = await modifyRequest(e.request)
  alert(e.request.url)
  e.respondWith(fetch(e.request))
})