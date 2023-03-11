import {isValidURL, proxyURL, slice, hasProtocol} from "./utils.js"

const origin = document.location.origin + "/"

function addProtocol(url) {
  if (!url.startsWith("http://") || !url.startsWith("https://")) return "https://" + url
  return url
}

function getCorrectURI(uri) {
  if (uri.startsWith("//")) {
    // url to another page
    return proxyURL(addProtocol(uri.replace("//", "")))
  } else if (uri.startsWith("/")) {
    // url to root
    return origin + slice(document.location.pathname)[0] + "/" + uri.replace("/", "")
  } else if (hasProtocol(uri)) {
    // url to another page
    return proxyURL(uri)
  } else {
    // other url types or relative url
    return uri 
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
           addedNode.setAttribute("href", getCorrectURI(href))
         }
         break
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