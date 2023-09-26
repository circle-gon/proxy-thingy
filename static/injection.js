import {proxyURL, isValidURL, getFirst} from "./utils.js?proxyresource"

const SERVICE_WORKER_SUPPORT = "serviceWorker" in navigator;
const NAVIGATION_SUPPORT  = "navigation" in window;

if (window.location.href.startsWith("http://")) {
  alert("Page connected to in http, reloading in https...");
  window.location.href = window.location.href.replace("http://", "https://");
}
if (!SERVICE_WORKER_SUPPORT)
  alert("Your browser does not support ServiceWorker, update your browser!");

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

function addSW() {
  navigator.serviceWorker
    .register("/sshs.js?proxyresource")
    .then((r) => {
      console.log("Service worker registered with scope: ", r.scope);

      if (r.installing) {
        console.log("Service worker installing");
      } else if (r.waiting) {
        console.log("Service worker installed");
      } else if (r.active) {
        console.log("Service worker active");
      }
      //alert("Success! service worker loaded")
    })
    .catch((err) => {
      alert("Failed to register service worker. Reason: " + err.toString());
    });
  /*navigator.serviceWorker.ready.then(() => {
    //alert("Success! it has loaded")
  });*/
}

const DOMAIN = window.location.host

function replaceURL(originalURL, currentBase) {
  const url = new URL(originalURL);
  //const params = new URLSearchParams(url.search);

  // this is a proxyresource, which should not be altered
  //if (params.has("proxyresource")) return originalURL;
  if (url.hostname === DOMAIN) {
    const basePath = getFirst(url.pathname);
    if (isValidURL(basePath)) return originalURL;
    return "https://" + DOMAIN + "/" + encodeURIComponent(currentBase) + url.pathname;
  } else {
    //return originalURL
    return proxyURL(originalURL, DOMAIN);
  }
}

function addPageLeave() {
  navigation.addEventListener("navigate", e => {
    localStorage.setItem("location", window.location.href)
    window.location.href = "https://google.com/"
  })
}

window.addEventListener("load", () => {
  // add eruda da be do be
  addEruda();

  if (SERVICE_WORKER_SUPPORT) addSW();
  if (NAVIGATION_SUPPORT) addPageLeave()
});
