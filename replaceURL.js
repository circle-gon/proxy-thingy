import { isValidURL, proxyURL, slice, hasProtocol } from "./shared/utils.js";

function addProtocol(url, httpsOrNot) {
  // add http(s):// and replace http(s):// with actual one
  return `http${httpsOrNot ? "s" : ""}://`
    + url.replace(`http${httpsOrNot ? "" : "s"}://`, "");
}

function ignoreURL(url) {
  return false;
}

export function getCorrectURL(uri, origin, pathname, useHttps) {
  if (ignoreURL(uri)) {
    // blacklisted urls
    return uri;
  } else if (uri.startsWith("//")) {
    // url to another page, starting with // 
    // (technically a relative one but :shrug:)
  } else if (uri.startsWith("/")) {
    // url to root
    return (
      origin + slice(pathname)[0] + "/" + uri.replace("/", "")
    );
  } else if (hasProtocol(uri)) {
    // url to another page
  } else {
    // other url types or relative url
    return uri;
  }
  console.warn("Oops, this url (" + uri + ") wasn't handled properly.")
  return uri
}
