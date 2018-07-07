if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
  .then((reg) => {
    console.log('ServiceWorker Registration successful! Scope is ' + reg.scope);
  }).catch((e) => {
    console.log('ServiceWorker Registration failed with ' + e);
  });
}
