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

export function slice(url) {
  return url.slice(1).split("/");
}

export function proxyURL(url, origin) {
  const uri = new URL(url);
  return (
    origin +
    "/" +
    encodeURIComponent(uri.origin) +
    url.replace(uri.origin, "")
  );
}
