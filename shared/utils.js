// TODO: make this server client angostic 

export function hasProtocol(url) {
  return url.startsWith("http://") || url.startsWith("https://")
}

export function isValidURL(test) {
  let url;
  try {
    url = new URL(test);
  } catch (e) {
    return false;
  }
  return hasProtocol(test)
}

export function addProtocol(url, httpsOrNot) {
  // either add the correct protocol
  // or delete the wrong one and add the correct one
  return `http${httpsOrNot ? "s" : ""}://`
    + url.replace(/http(s)?:\/\//, "");
}

export function slice(url) {
  return url.slice(1).split("/");
}

// forcing origin as an option is better because http/https differences
// also less bad code/duplication
export function proxyURL(url, origin) {
  const uri = new URL(url);
  return addProtocol(
    origin +
    "/" +
    encodeURIComponent(uri.origin) +
    // prefer this over url.pathname as it always
    // starts with /, even if you don't specify it
    url.replace(uri.origin, "")
  );
}