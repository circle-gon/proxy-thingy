import {
  getFirst,
  proxyAbsoluteURL,
  isValidURL,
  MESSAGE_TYPES as M,
  utilListen,
} from "/utils.js?proxyresource";
import { mountConfig } from "/proxy-config/index.js?proxyresource";

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
const STORAGE_OVERWRITE = ["getItem", "setItem", "removeItem", "key", "clear"];

const proxyBase = getFirst(location.pathname);

const watchAttrs = [...new Set(Object.values(WATCH_ATTRIBUTES))];
let activeSW;

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

// Eruda

function addEruda() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/eruda";
  script.addEventListener("error", () => {
    alert("Failed.");
  });
  script.addEventListener("load", () => {
    window.eruda.init();
  });
  document.body.appendChild(script);
}

// SW code

async function addSW() {
  try {
    const r = await navigator.serviceWorker.register("/sh.js?proxyresource", {
      type: "module",
      updateViaCache: "none",
    });
    console.log("Service worker registered with scope: ", r.scope);

    if (r.installing) {
      console.log("Service worker installing");
    } else if (r.waiting) {
      console.log("Service worker installed");
    } else if (r.active) {
      console.log("Service worker active");
    }
    r.addEventListener("updatefound", () => {
      console.log("New service worker being installed...");
    });
  } catch (e) {
    console.error(e);
    alert("Failed to register service worker. Reason: " + e.toString());
  }
}

const thingies = [];
window.thingies = thingies;

async function acquireSW() {
  activeSW = (await navigator.serviceWorker.ready).active;
}

function swListen() {
  navigator.serviceWorker.startMessages();
  navigator.serviceWorker.addEventListener(
    "message",
    utilListen((data) => {
      switch (data.type) {
        case M.FETCH:
          thingies.push(data.data);
          break;
        default:
          throw new TypeError("What did you send? (" + data.type + ")");
      }
    })
  );
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    alert("New service worker acquired!");
    acquireSW();
  });
}

async function swInit() {
  swListen();
  const results = await Promise.allSettled([acquireSW(), addSW()]);
  for (const result of results) {
    if (result.status === "rejected") {
      alert("Failed: " + result.reason.toString());
      console.error(result.reason);
    }
  }
}

// pageLeave code

function addPageLeave() {
  window.addEventListener("pagehide", (e) => {});
}

// MutationObserver code starts now

function proxyWithRelativeURL(originalURL) {
  // this feels so weird but it works!
  const realURL = new URL(originalURL, location.href).href;
  return proxyAbsoluteURL(realURL, proxyBase);
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

// end MutationObserver code

function overwriteStorage() {
  // store based on website
  // URL -> { keys: values }
  const original = Object.fromEntries(
    STORAGE_OVERWRITE.map((i) => [i, Storage.prototype[i]])
  );
  window.original = original;

  function easyGet(context) {
    return JSON.parse(original.getItem.call(context, proxyBase)) ?? {};
  }
  function sanityCheck(type) {
    return (argsPassed, name, ...args) => {
      if (argsPassed < args.length)
        throw new TypeError(
          `Failed to execute '${name}' on 'Storage': ${args.length} argument${
            args.length > 1 ? "s" : ""
          } required, but only ${argsPassed} present.`
        );
      for (const arg of args) {
        if (typeof arg === "symbol")
          throw new TypeError("Cannot convert a Symbol value into a " + type);
      }
    };
  }

  const stringCheck = sanityCheck("string");
  const numberCheck = sanityCheck("number");

  const base = {
    __proto__: Storage,
    getItem(name) {
      const data = easyGet(this);
      stringCheck(arguments.length, "getItem", name);
      return data[name] ?? null;
    },
    setItem(name, value) {
      const data = easyGet(this);
      stringCheck(arguments.length, "setItem", name, value);
      //console.log(data, name, value)
      data[name] = String(value);
      original.setItem.call(this, proxyBase, JSON.stringify(data));
      //console.log(original.getItem.call(this, proxyBase))
    },
    removeItem(name) {
      const data = easyGet(this);
      stringCheck(arguments.length, "removeItem", name);
      delete data[name];
      if (Object.keys(data).length > 0)
        original.setItem.call(this, proxyBase, JSON.stringify(data));
      else this.clear();
    },
    key(n) {
      const key = easyGet(this);
      numberCheck(arguments.length, "key", n);
      return Object.keys(key)[n] ?? null;
    },
    clear() {
      original.removeItem.call(this, proxyBase);
    },
    get length() {
      return Object.keys(easyGet(this)).length;
    }
  };
  
  const FakeStorage = new Proxy(base, {
    get(target, prop, reciever) {
      const hasIt = Reflect.has(target, prop)
      if (hasIt) return Reflect.get(target, prop, reciever)
      return base.getItem(prop)
    },
    set(target, prop, value, reciever) {
      const hasIt = Reflect.has(target, prop)
      if (hasIt) return Reflect.set(target, prop, value, reciever)
      base.setItem(prop)
      return true
    }
  })
  
  Object.defineProperty(FakeStorage, "name", {
    value: "Storage",
    configurable: true
  })
  
  Object.setPrototypeOf(localStorage, FakeStorage)
  window.Storage = base
}

function init() {
  addEruda();
  swInit();
  overwriteStorage();
  if (NAVIGATION_SUPPORT) addPageLeave();
  observeHTML();
}

function initOnLoad() {
  mountConfig();
}

init();
window.addEventListener("load", initOnLoad);
