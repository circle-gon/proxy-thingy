// TODO: make this server client angostic

const BASE_URL = "https://adaptive-tricolor-whip.glitch.me/"

export function hasHTTPProtocol(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function isValidURL(test) {
  let url;
  try {
    url = new URL(test);
  } catch (e) {
    return false;
  }
  return hasHTTPProtocol(test);
}
export function slice(url) {
  // strip leading slash
  return url.slice(1).split("/");
}

export function getFirst(url) {
  return decodeURIComponent(slice(url)[0]);
}

function proxyOutboundURL(url) {
  const originGo = new URL(url).origin;
  // use https because service workers require it & best practice
  return (
    BASE_URL +
    encodeURIComponent(originGo) +
    // nodejs does not support url.pathname AAAAAAAAAAAAAAA
    url.replace(originGo, "")
  );
}

function replaceURL(originalURL, currentBase) {
  const url = new URL(originalURL);
  //const params = new URLSearchParams(url.search);

  // this is a proxyresource, which should not be altered
  //if (params.has("proxyresource")) return originalURL;
  if (url.origin === BASE_URL) {
    const basePath = getFirst(url.pathname);
    if (isValidURL(basePath)) return originalURL;
    return (
      "https://" + DOMAIN + "/" + encodeURIComponent(currentBase) + url.pathname
    );
  } else {
    //return originalURL
    return proxyOutboundURL(originalURL)
  }
}

export {
  proxyOutboundURL as proxyURL
}