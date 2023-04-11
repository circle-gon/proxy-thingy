import { proxyURL, slice, hasHTTPProtocol } from "./shared/utils.js";

const origin = process.env.PROJECT_DOMAIN + ".glitch.me"

function ignoreURL(url) {
  return false;
}

function isCorrectOrigin(uri) {
  return new URL(uri).origin === origin
}

export function getCorrectURL(uri, currentURL) {
  const url = new URL(currentURL)
  const protocol = url.protocol
  const urlPath = slice(url.pathname)[0]
  if (ignoreURL(uri)) {
    // blacklisted urls
    return uri;
  } else if (uri.startsWith("//")) {
    // url to another page, starting with // 
    const goTo = uri.replace("//", "")
    
    // points to itself
    if (isCorrectOrigin(goTo)) return uri
    
    return proxyURL(new URL(decodeURIComponent(urlPath)).protocol + "//" + goTo, origin)
  } else if (uri.startsWith("/")) {
    // url to root
    return "https://" + origin + "/" + urlPath + uri
  } else if (hasHTTPProtocol(uri)) {
    // url to another page, http or https
    // other protocols are outside this scope
    if (isCorrectOrigin(uri)) return uri
    return proxyURL(uri, origin)
  } else {
    // other url types or relative url
    return uri;
  }
}
