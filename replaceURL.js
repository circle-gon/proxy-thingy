import { isValidURL, proxyURL, slice, hasProtocol } from "./shared/utils.js";

const origin = process.env.PROJECT_DOMAIN + ".glitch.me"

function addProtocol(url, httpsOrNot) {
  // either add the correct protocol
  // or delete the wrong one and add the correct one
  return `http${httpsOrNot ? "s" : ""}://`
    + url.replace(`http${httpsOrNot ? "" : "s"}://`, "");
}

function ignoreURL(url) {
  return false;
}

export function getCorrectURL(uri, useHttps) {
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
