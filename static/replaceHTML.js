import { isValidURL, proxyURL, slice, hasProtocol } from "./utils.js";

const origin = document.location.origin + "/";

function addProtocol(url) {
  if (!url.startsWith("http://") || !url.startsWith("https://"))
    return "https://" + url;
  return url;
}

function getCorrectURI(uri) {
  if (uri.startsWith("//")) {
    const fix = uri.replace("//", "")
    // url to another page
    if (fix.startsWith(origin)) return uri
    return proxyURL(addProtocol(fix));
  } else if (uri.startsWith("/")) {
    // url to root
    return (
      origin + slice(document.location.pathname)[0] + "/" + uri.replace("/", "")
    );
  } else if (hasProtocol(uri)) {
    // url to another page
    return proxyURL(uri);
  } else {
    // other url types or relative url
    return uri;
  }
}

function fixURL(node, name) {
  const href = node.getAttribute(name);
  if (href !== null) {
    alert(href)
    alert(getCorrectURI(href))
    node.setAttribute(name, getCorrectURI(href));
  }
}

function fixURLForNode(node) {
  switch (node.tagName.toLowerCase()) {
    case "link":
    case "a":
      fixURL(node, "href");
      break;
    case "script":
      fixURL(node, "src");
      break;
  }
}

function fixURLNodes(node) {
  fixURLForNode(node);
  for (const child of node.children) {
    fixURLNodes(child);
  }
}

function onChange(record) {
  for (const mutation of record) {
    switch (mutation.type) {
      case "childList":
        for (const addedNode of mutation.addedNodes) {
          fixURLNodes(addedNode);
        }
        break;
      case "attributes":
        fixURLForNode(mutation.target)
    }
  }
}

const observer = new MutationObserver(onChange);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["src", "href"],
});

fixURLNodes(document.documentElement)