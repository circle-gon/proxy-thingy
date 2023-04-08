import { proxyURL, slice, hasHTTPProtocol } from "./shared/utils.js";

const origin = process.env.PROJECT_DOMAIN + ".glitch.me"

function ignoreURL(url) {
  return false;
}

export function getCorrectURL(uri, currentURL) {
  //const curr = new URL(currentURL)
  /*const path = curr.pathname
  const base = curr.protocol + "//" + origin + slice(path)[0] + "/"*/
  const newProtocol = new URL(uri).protocol + "//"
  if (ignoreURL(uri)) {
    // blacklisted urls
    return uri;
  } else if (uri.startsWith("//")) {
    // url to another page, starting with // 
    const goTo = uri.replace("//", "")
    
    // points to itself
    if (goTo.startsWith(origin)) return uri
    
    return proxyURL(newProtocol + goTo)
  } else if (uri.startsWith("/")) {
    // url to root
  } else if (hasHTTPProtocol(uri)) {
    // url to another page, http or https
    // other protocols are outside this scope
  } else {
    // other url types or relative url
    return uri;
  }
}
