import {isValidURL} from "./utils.js"

const origin = document.location.origin + "/"

function getCorrectURI(uri) {
  if (uri.startsWith("//")) {
    const url = new URL(uri.replace("//", ""))
    return origin + encodeURIComponent(url.origin)
  }
}

function onChange(record) {
 for (const mutation of record) {
   for (const addedNode of mutation.addedNodes) {
     switch (addedNode.tagName.toLowerCase()) {
       case "link":
       case "a":
         const href = addedNode.getAttribute("href")
         if (href !== null) {
           
         }
     }
   }
 } 
}

const observer = new MutationObserver(onChange)
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["src", "href"],
})