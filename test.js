import {JSDOM, ResourceLoader} from "jsdom"

const thing = new JSDOM(`
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <script src="https://adaptive-tricolor-whip.glitch.me/brr.js"></script>
  </body>
</html>`, {
  url: "https://discord.com",
  resources: "usable",
  runScripts: "dangerously"
})

console.log(thing.window.document.documentElement.outerHTML)