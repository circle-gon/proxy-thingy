// TODO: make this server client angostic

const BASE_URL = "https://adaptive-tricolor-whip.glitch.me"

function hasHTTPProtocol(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function isValidURL(test) {
  try {
    new URL(test);
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
  const urlify = new URL(url);
  return (
    BASE_URL +
    encodeURIComponent(urlify.origin) +
    urlify.pathname
  );
}

export function proxyURL(originalURL, currentBase = undefined) {
  const url = new URL(originalURL);
  if (url.origin === BASE_URL) {
    const basePath = getFirst(url.pathname);
    if (isValidURL(basePath)) return originalURL;
    
    if (currentBase) {
    return (
      BASE_URL + encodeURIComponent(currentBase) + url.pathname
    );
    } else {
      throw new TypeError("Absolute url was given, but there is no currentBase")
    }
  } else {
    return proxyOutboundURL(originalURL)
  }
}