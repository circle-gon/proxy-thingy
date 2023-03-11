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

export function proxyURL(url) {
  const uri = new URL(url);
  return (
    document.location.origin +
    "/" +
    encodeURIComponent(uri.origin) +
    url.replace(uri.origin, "")
  );
}
