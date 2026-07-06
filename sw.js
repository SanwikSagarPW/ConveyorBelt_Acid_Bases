const CACHE_NAME = 'conveyor-acid-bases-v2';
const BUILD_FILES = [
  'Build/GameBuild.loader.js',
  'Build/GameBuild.framework.js',
  'Build/GameBuild.data.gz',
  'Build/GameBuild.wasm.gz',
];

self.addEventListener('install', (event) => { self.skipWaiting(); });

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isBuildFile = BUILD_FILES.some((f) => url.pathname.endsWith(f.replace('Build', 'Build')));
  if (isBuildFile) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
  }
});
