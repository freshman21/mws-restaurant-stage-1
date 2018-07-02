if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
  .then((reg) => {
    console.log('ServiceWorker Registration successful! Scope is ' + reg.scope);
  }).catch((error) => {
    console.log('ServiceWorker Registration failed with ' + error);
  });
}
