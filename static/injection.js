if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?proxyresource').then(r => {
      console.log('Service worker registered with scope: ', r.scope);
      //alert("Success! service worker loaded")
    }).catch(err => {
      alert("Failed to register service worker. Reloading page... Reason: " + err.toString())
      window.location.reload();
    });
    navigator.serviceWorker.ready.then(() => {
      //alert("Success! it has loaded")
    })
  });
} else {
  if (window.location.href.startsWith("http://")) {
    alert("Page connected to in http, reloading in https...")
    window.location.href = window.location.href.replace("http://", "https://")
  }
  alert("Your browser does not support ServiceWorker, update your browser!")
}