// TODO: make this server client angostic

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

export function proxyURL(url, host) {
  const originGo = new URL(url).origin;
  // use https because service workers require it & best practice
  return (
    "https://" +
    host +
    "/" +
    encodeURIComponent(originGo) +
    // prefer this over url.pathname as it always
    // starts with /, even if you don't specify it
    url.replace(originGo, "")
  );
}
