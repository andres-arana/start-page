// Stale-while-revalidate for the page shell: always answer from cache (no network on the
// new-tab path), and refresh the cache in the background so the next open sees updates.
// Bump VERSION only if the caching strategy itself changes; content updates arrive via revalidation.
var VERSION = 'shell-v1';
var SHELL = ['./', 'index.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('shell-') === 0 && k !== VERSION;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  e.respondWith(
    caches.open(VERSION).then(function (cache) {
      // ignoreSearch: tolerate ?foo on the URL; './' and 'index.html' are the same document.
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        // cache: 'no-cache' forces revalidation past GitHub's max-age=600 so updates show up on the next open.
        var update = fetch(req, { cache: 'no-cache' }).then(function (res) {
          if (res.ok) cache.put(req, res.clone());
          return res;
        });
        if (hit) { e.waitUntil(update.catch(function () {})); return hit; }
        return update;
      });
    })
  );
});
