import { proxyURL, slice, hasHTTPProtocol } from "./shared/utils.js";

const origin = process.env.PROJECT_DOMAIN + ".glitch.me"



function ignoreURL(url) {
  return false;
}

export function getCorrectURL(uri, currentURL) {
  const urlified = new URL(uri)
  const urlpath = currentURL.replace(new URL(currentURL))
  if (ignoreURL(uri)) {
    // blacklisted urls
    return uri;
  } else if (uri.startsWith("//")) {
    // url to another page, starting with // 
    // (technically a relative one but :shrug:)
    const realURL = uri.replace("//", "")
    
    // this url points to this page
    if (realURL.startsWith(origin)) return uri
    
    return 
  } else if (uri.startsWith("/")) {
    // url to root
    return (
      origin + slice(new URL(currentURL))[0] + "/" + uri.replace("/", "")
    );
  } else if (hasHTTPProtocol(uri)) {
    // url to another page, http or https
    // other protocols are outside this scope
  } else {
    // other url types or relative url
    return uri;
  }
}
