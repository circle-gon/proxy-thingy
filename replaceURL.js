import { isValidURL, proxyURL, slice, hasProtocol } from "./shared/utils.js";

const origin = process.env.PROJECT_DOMAIN + ".glitch.me"



function ignoreURL(url) {
  return false;
}

export function getCorrectURL(uri, pathname, useHttps) {
  const urlified = new URL(uri)
  if (ignoreURL(uri)) {
    // blacklisted urls
    return uri;
  } else if (uri.startsWith("//")) {
    // url to another page, starting with // 
    // (technically a relative one but :shrug:)
  } else if (uri.startsWith("/")) {
    // url to root
    return (
      origin + slice(urlified.pathname)[0] + "/" + uri.replace("/", "")
    );
  } else if (hasProtocol(uri)) {
    // url to another page
  } else {
    // other url types or relative url
    return uri;
  }
}
