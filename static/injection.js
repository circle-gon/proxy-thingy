const SERVICE_WORKER_SUPPORT = "serviceWorker" in navigator;

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
    .register("/sw.js?proxyresource")
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

window.addEventListener("load", () => {
  // add eruda da be do be
  addEruda();

  if (SERVICE_WORKER_SUPPORT) addSW();
});
