var CACHE_NAME = 'pt-center-v1';
var ASSETS = [
  '/auswanderung/',
  '/auswanderung/index.html',
  '/auswanderung/style.css',
  '/auswanderung/app.js',
  '/auswanderung/data.js',
  '/auswanderung/db.js',
  '/auswanderung/lib/dates.js',
  '/auswanderung/lib/schengen.js',
  '/auswanderung/lib/countries-db.js',
  '/auswanderung/lib/autocomplete.js',
  '/auswanderung/views/dashboard.js',
  '/auswanderung/views/stays.js',
  '/auswanderung/views/countries.js',
  '/auswanderung/views/timeline.js',
  '/auswanderung/views/documents.js',
  '/auswanderung/views/finances.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    return cache.addAll(ASSETS);
  }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Network-first for Supabase API calls
  if (e.request.url.includes('supabase.co')) {
    e.respondWith(fetch(e.request).catch(function() {
      return new Response('{}', { headers: { 'Content-Type': 'application/json' }});
    }));
  } else {
    // Cache-first for static assets
    e.respondWith(caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    }));
  }
});
