import {slice} from "./utils.js"

const source = slice(document.location)

self.addEventListener("fetch", async e => {
  const request = e.request
  const url = new URL(request.url)
  url.search = `?${URL.searchParams(`
  const response = fetch(request.url)
})