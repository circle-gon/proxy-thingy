import {JSDOM, ResourceLoader} from "jsdom"

const result = await JSDOM.fromURL("https://discord.com", {
  runScripts: "dangerously",
  resources: "usable"
})
console.log("Waiting...")
await new Promise(r=>setTimeout(r, 1000))
console.log(result.serialize())