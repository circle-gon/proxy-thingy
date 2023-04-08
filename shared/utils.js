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
  return url.slice(1).split("/");
}

// forcing origin as an option is better because http/https differences
// also less bad code/duplication

// url should start with http vs https based on current page
export function proxyURL(url, currentURL) {
  const originGo = new URL(url).origin;
  const c = new URL(currentURL);
  return (
    c.protocol +
    "//" +
    c.origin +
    "/" +
    encodeURIComponent(originGo) +
    // prefer this over url.pathname as it always
    // starts with /, even if you don't specify it
    url.replace(originGo, "")
  );
}
