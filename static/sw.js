const CACHE_KEY = ""

self.addEventListener("fetch", e => {
  const r = e.request.clone()
  r.url
  e.respondWith(fetch(newRequest))
})