if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(r => {
      console.log('Service worker registered with scope: ', r.scope);
      //alert("Success! service worker loaded")
    }, err => {
      alert("Failed to register service worker. Reason: " + err.toString())
      console.log('Service worker registration failed: ', err);
    });
  });
} else {
  alert("Your browser does not support ServiceWorker. You should probably update your browser, it's pretty old anyway...")
}