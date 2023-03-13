import {JSDOM, ResourceLoader} from "jsdom"

const result = await JSDOM.fromURL("https://adaptive-tricolor-whip.glitch.me/", {
  runScripts: "dangerously",
  resources: "usable"
})
console.log("waiting...")
let done = false
result.window.ready = function() {
  console.log(result.serialize())
  done = true
}

await (async r => {
  while (true) {
    if (done === true) return 1
    else {
      console.log("waiting...")
      await new Promise(r => setTimeout(r, 1000))
    }
  }
})()