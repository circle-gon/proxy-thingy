export function isValidURL(test) {
  let url;
  try {
    url = new URL(test);
  } catch (e) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function slice(url) {
  return url.slice(1).split("/");
}

export function 