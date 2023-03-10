const source = new URL(document.location).searchParams.get("url")

self.addEventListener("fetch", async e => {
  const request = e.request
  const url = new URL(request.url)
  url.search = `?${URL.searchParams(`
  const response = fetch(request.url)
})