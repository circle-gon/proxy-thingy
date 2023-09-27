import { proxyWithRelativeURL, isValidURL } from "./utils.js?proxyresource";

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

function setURL(element, name) {
  const value = element.getAttribute(name);
  if (
    // nodeName === tagName
    WATCH_ATTRIBUTES[element.nodeName.toLowerCase()] === name &&
    value !== null &&
    isValidURL(value)
  ) {
    const newURL = proxyWithRelativeURL(value, location);
    // don't cause an infinite loop
    if (newURL !== value) {
      element.setAttribute(name, newURL);
    }
  }
}

function bulkSet(element) {
  const attrToModify = WATCH_ATTRIBUTES[element.nodeName.toLowerCase()]
  if (attrToModify) {
    setURL(element, attrToModify)
  }
  
  console.log(element)
  for (const childElement of element.children) {
    bulkSet(childElement)
  }
}

function observeHTML() {
  bulkSet(document.documentElement)
  
  const o = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      switch (mutation.type) {
        case "attributes":
          setURL(mutation.target, mutation.attributeName)
          break;
        case "childList":
          for (const element of mutation.addedNodes) {
            bulkSet(element)
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
  //observeHTML();
  bulkSet(document.documentElement)
});
