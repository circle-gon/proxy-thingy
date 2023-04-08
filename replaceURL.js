import { proxyURL, slice, hasHTTPProtocol } from "./shared/utils.js";

const origin = process.env.PROJECT_DOMAIN + ".glitch.me"

function ignoreURL(url) {
  return false;
}

export function getCorrectURL(uri, currentURL) {
  const url = new URL(currentURL)
  const protocol = url.protocol
  if (ignoreURL(uri)) {
    // blacklisted urls
    return uri;
  } else if (uri.startsWith("//")) {
    // url to another page, starting with // 
    const goTo = uri.replace("//", "")
    
    // points to itself
    if (goTo.startsWith(origin)) return uri
    
    return proxyURL(protocol + "//" + goTo, origin)
  } else if (uri.startsWith("/")) {
    // url to root
    const path = url.pathname
    return "https://" + origin + "/" + slice(path)[0] + uri
  } else if (hasHTTPProtocol(uri)) {
    // url to another page, http or https
    // other protocols are outside this scope
    if (uri.startsWith(origin)) return uri
    return proxyURL(uri)
  } else {
    // other url types or relative url
    return uri;
  }
}
