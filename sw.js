// sw.js
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  // You can add assets to cache here if needed.
});

self.addEventListener('activate', event => {
  console.log('Service worker activating...');
});

// Optionally, add fetch event handler to serve cached resources, etc.
self.addEventListener('fetch', event => {
  // This basic example just fetches normally.
  event.respondWith(fetch(event.request));
});
