import { proxyURL, getFirst, isValidURL } from "./utils.js?proxyresource";

// Firefox does not support it
const NAVIGATION_SUPPORT = "navigation" in window;
const WATCH_ATTRIBUTES = {
  a: "href",
  iframe: "src",
  object: "data",
  link: "href",
  script: "src",
};
const currentBase = getFirst(location.pathname);

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
    const r = await navigator.serviceWorker.register(
      "/sshsteres.js?proxyresource",
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

function setURL(element, name) {
  const value = element.getAttribute(name);
  if (
    WATCH_ATTRIBUTES[element] === name &&
    value !== null &&
    isValidURL(value)
  ) {
    const newURL = proxyURL(value, currentBase);
    // don't cause an infinite loop
    if (newURL !== value) {
      element.setAttribute(name, newURL);
    }
  }
}

function bulkSet(node) {
  const attrToModify = WATCH_ATTRIBUTES[node.nodeName]
  if (attrToModify) {
    setURL(element, attrToModify)
  }
  
  for (const node of )
}

function observeHTML() {
  const o = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      switch (mutation.type) {
        case "attributes":
          setURL(mutation.target, mutation.attributeName)
          break;
        case "childList":
          for (const node of mutation.addedNodes) {
            
          }
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
