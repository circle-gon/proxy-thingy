console.log("service worker go brrrrrrrr")
self.addEventListener("fetch", e => {
  console.log("SERVICE WORKER: request made")
  e.respondWith(fetch(e.request))
})