// TODO: make this server client angostic

const ORIGIN_URL = "https://adaptive-tricolor-whip.glitch.me";
export const BASE_URL = ORIGIN_URL + "/";

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
  return BASE_URL + encodeURIComponent(urlify.origin) + urlify.pathname + urlify.search;
}

export function proxyAbsoluteURL(originalURL, currentBase = undefined) {
  const url = new URL(originalURL);
  if (url.origin === ORIGIN_URL) {
    const basePath = getFirst(url.pathname);
    if (isValidURL(basePath)) return originalURL;

    if (currentBase) {
      return BASE_URL + encodeURIComponent(currentBase) + url.pathname + url.search;
    } else {
      throw new TypeError(
        "Absolute url was given, but there is no currentBase"
      );
    }
  } else {
    return proxyOutboundURL(originalURL);
  }
}

export function utilListen(func, source) {
  return e => {
    if (location.origin !== e.origin || e.source !== source) {
      console.log("Invalid response");
    } else {
      func(e.data);
    }
  };
}

// an enum of sorts

export const MESSAGE_TYPES = Object.freeze({
  // a fetch request has been made
  // SW -> Client
  FETCH: 0,
  // cookies have been requested/sent
  // SW -> Client & Client -> SW
  // SW requests cookies from the Client and the Client sends them to the SW
  COOKIES: 1
})