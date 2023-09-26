import { proxyURL, isValidURL, getFirst } from "./utils.js?proxyresource";

// Firefox does not support it
const NAVIGATION_SUPPORT = "navigation" in window;
const WATCH_ATTRIBUTES = {
  a: "href",
  iframe: "src",
  object: "data",
  link: "href",
  script: "src",
};

function addEruda() {
  const script = document.createElement("script");
  script.src = "//cdn.jsdelivr.net/npm/eruda";
  script.onerror = function (e) {
    alert("Failed.");
  };
  script.onload = function () {
    eruda.init();
  };
  document.body.appendChild(script);
}

async function addSW() {
  try {
    const r = navigator.serviceWorker.register("/sshs.js?proxyresource");
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

const DOMAIN = window.location.host;

function replaceURL(originalURL, currentBase) {
  const url = new URL(originalURL);
  //const params = new URLSearchParams(url.search);

  // this is a proxyresource, which should not be altered
  //if (params.has("proxyresource")) return originalURL;
  if (url.hostname === DOMAIN) {
    const basePath = getFirst(url.pathname);
    if (isValidURL(basePath)) return originalURL;
    return (
      "https://" + DOMAIN + "/" + encodeURIComponent(currentBase) + url.pathname
    );
  } else {
    //return originalURL
    return proxyURL(originalURL, DOMAIN);
  }
}

function addPageLeave() {
  window.addEventListener("pagehide", (e) => {
    localStorage.setItem("location", window.location.href);
    setTimeout(() => {
      localStorage.setItem("foobar", window.location.href);
    }, 1000);
  });
}

function rewriteStuff(element) {
  // TODO: implement
}

function observeHTML() {
  const o = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      switch (mutation.type) {
        case "attributes":
          const element = mutation.target;
          const name = mutation.attributeName;
          if (WATCH_ATTRIBUTES[element] === name) {
          }
          break;
        case "childList":
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
    attributeFilter: Object.values(WATCH_ATTRIBUTES),
  });
}

window.addEventListener("load", () => {
  // add eruda da be do be
  addEruda();
  addSW();
  if (NAVIGATION_SUPPORT) addPageLeave();
  observeHTML();
});
