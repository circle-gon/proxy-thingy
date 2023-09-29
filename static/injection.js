import {
  getFirst,
  proxyAbsoluteURL,
  isValidURL,
  MESSAGE_TYPES as M,
} from "./utils.js?proxyresource";

// Firefox does not support it
const NAVIGATION_SUPPORT = "navigation" in window;
const WATCH_ATTRIBUTES = mergeAttrs(
  // ID, ...elements
  ["href", "base", "a", "area", "link"],
  ["action", "form"],
  ["cite", "blockquote", "del", "ins", "q"],
  ["data", "object"],
  ["formaction", "button", "input"],
  [
    "src",
    "audio",
    "embed",
    "iframe",
    "img",
    "input",
    "script",
    "source",
    "track",
    "video",
  ],
  ["poster", "video"],
  ["ping", "a", "area"]
);
const BULK_ATTRIBUTES = ["ping", "itemtype"];
const GLOBAL_ATTRIBUTES = ["itemid", "itemtype"];
const WHITESPACE_SPLITTER = /\s/g;

const watchAttrs = [...new Set(Object.values(WATCH_ATTRIBUTES))];

function mergeAttrs(...attrs) {
  const obj = {};
  for (const attrArr of attrs) {
    const id = attrArr[0];
    for (const elems of attrArr.slice(1)) {
      obj[elems] = [...(obj[elems] ?? []), id];
    }
  }
  return obj;
}

function addEruda() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/eruda";
  script.onerror = function (e) {
    alert("Failed.");
  };
  script.onload = function () {
    window.eruda.init();
  };
  document.body.appendChild(script);
}

async function addSW() {
  try {
    const r = await navigator.serviceWorker.register(
      "/sh.js?proxyresource",
      {
        type: "module",
      }
    );
    console.log("Service worker registered with scope: ", r.scope);

    if (r.installing) {
      console.log("Service worker installing");
    } else if (r.waiting) {
      console.log("Service worker installed");
    } else if (r.active) {
      console.log("Service worker active");
    }
  } catch (e) {
    console.error(e);
    alert("Failed to register service worker. Reason: " + e.toString());
  }
}

function utilMessage(func) {
  return function (e) {
    if (location.origin !== e.origin) {
      console.log("Recieved message from a different origin: " + e.origin);
    } else {
      func(e.data);
    }
  };
}

window.thingies = [];

async function swListen() {
  navigator.serviceWorker.startMessages();
  navigator.serviceWorker.addEventListener(
    "message",
    utilMessage((data) => {
      thingies.push(data);
    })
  );
  navigator.service
  const registration = (await navigator.serviceWorker.ready).active;
  registration.postMessage({
    type: M.FETCH,
    data: "foobar",
  });
}

function addPageLeave() {
  window.addEventListener("pagehide", (e) => {});
}

function proxyWithRelativeURL(originalURL) {
  // this feels so weird but it works!
  const realURL = new URL(originalURL, location.href).href;
  return proxyAbsoluteURL(realURL, getFirst(location.pathname));
}

function getAttrsForElement(element) {
  if (!(element instanceof Element)) return [];
  const base = WATCH_ATTRIBUTES[element.nodeName.toLowerCase()] ?? [];
  return [...GLOBAL_ATTRIBUTES, ...base];
}

function setURL(element, name) {
  const value = element.getAttribute(name);
  if (value === null || value === "") return;

  // TODO: preserve original format
  const isBulk = BULK_ATTRIBUTES.includes(name);
  const urls = isBulk ? value.split(WHITESPACE_SPLITTER) : [value.trim()];

  const newURL = urls.map((url) => proxyWithRelativeURL(url)).join(" ");
  // don't cause an infinite loop
  if (newURL !== value) {
    element.setAttribute(name, newURL);
  }
}

function setURLs(element) {
  for (const name of getAttrsForElement(element)) setURL(element, name);
}

function bulkSet(element) {
  setURLs(element);

  for (const childElement of element.children ?? []) {
    bulkSet(childElement);
  }
}

window.bs = bulkSet;

function observeHTML() {
  bulkSet(document.documentElement);

  const o = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      switch (mutation.type) {
        case "attributes":
          const target = mutation.target;
          const attrName = mutation.attributeName;
          if (getAttrsForElement(target).includes(attrName))
            setURL(target, attrName);
          break;
        case "childList":
          for (const element of mutation.addedNodes) bulkSet(element);
          break;
        default:
          throw new TypeError("What? Got " + mutation.type + " instead.");
      }
    }
  });

  o.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: watchAttrs,
  });
}

function init() {
  addEruda();
  Promise.all([addSW(), swListen()]).catch(console.error);
  if (NAVIGATION_SUPPORT) addPageLeave();
  observeHTML();
}

init()
