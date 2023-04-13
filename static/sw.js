self.addEventListener("fetch", e => {
  const url = "https://glitch.com/favicon.ico"
  const newRequest = new Request(url, e.request)
  e.respondWith(fetch(newRequest))
})