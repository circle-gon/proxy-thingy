import { isValidURL, proxyURL, slice, hasProtocol } from "./shared/utils.js";

function addProtocol(url) {
  if (!url.startsWith("https://"))
    return "https://" + url.replace("http://", "");
  return url;
}

function ignoreURL(url) {
  return false;
}

export function getCorrectURL(uri, origin, pathname) {
  if (ignoreURL(uri)) {
    return uri;
  } else if (uri.startsWith("//")) {
    const fix = addProtocol(uri.replace("//", ""));
    // url to another page

    // this url is to this page, not another page
    if (fix.startsWith(origin)) return uri;

    return proxyURL(addProtocol(fix));
  } else if (uri.startsWith("/")) {
    // url to root
    return (
      origin + slice(pathname)[0] + "/" + uri.replace("/", "")
    );
  } else if (hasProtocol(uri)) {
    // url to another page

    // this url is to this page
    if (uri.startsWith(origin)) return uri;
    return proxyURL(uri);
  } else {
    // other url types or relative url
    return uri;
  }
}
