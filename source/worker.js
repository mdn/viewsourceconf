(function() {
    'use strict';

    // Update 'version' if you need to refresh the cache
    var staticCacheName = 'static';
    var version = '{{ version_date }}';

    // Store core files in a cache (including a page to display when offline)
    function updateStaticCache() {
        return caches.open(version + staticCacheName)
            .then(function (cache) {
                return cache.addAll([
                    '/{{ fingerprint['js/main.js'] }}',
                    '/{{ fingerprint['stylesheets/style.css'] }}',
                    '/offline/',
                    '/berlin-2016/schedule/',
                    '/berlin-2016/code-of-conduct/',
                    '/berlin-2016/'
                ]);
            }).catch(function() {
                // problem with loading something, now what?
            });
    }

    self.addEventListener('install', function (event) {
        event.waitUntil(updateStaticCache());
    });

    self.addEventListener('activate', function (event) {
        event.waitUntil(
            caches.keys()
                .then(function (keys) {
                    // Remove caches whose name is no longer valid
                    return Promise.all(keys
                        .filter(function (key) {
                          return key.indexOf(version) !== 0;
                        })
                        .map(function (key) {
                          return caches.delete(key);
                        })
                    );
                })
        );
    });

    self.addEventListener('fetch', function (event) {
        var request = event.request;
        // Always fetch non-GET requests from the network
        if (request.method !== 'GET') {
            event.respondWith(
                fetch(request)
                    .catch(function () {
                        return caches.match('/offline/');
                    })
            );
            return;
        }

        // For HTML requests, try the network first, fall back to the cache, finally the offline page
        if (request.headers.get('Accept').indexOf('text/html') !== -1) {
            // Fix for Chrome bug: https://code.google.com/p/chromium/issues/detail?id=573937
            if (request.mode != 'navigate') {
                request = new Request(request.url, {
                    method: 'GET',
                    headers: request.headers,
                    mode: request.mode,
                    credentials: request.credentials,
                    redirect: request.redirect
                });
            }
            // redirect requests for homepage to /berlin-2016/
            if(request.url == '/') {
                return Response.redirect('/berlin-2016/', '307');
            }
            event.respondWith(
                fetch(request)
                    .then(function (response) {
                        // Stash a copy of this page in the cache
                        var copy = response.clone();
                        caches.open(version + staticCacheName)
                            .then(function (cache) {
                                cache.put(request, copy);
                            });
                        return response;
                    })
                    .catch(function () {
                        return caches.match(request)
                            .then(function (response) {
                                return response || caches.match('/offline/');
                            });
                    })
            );
            return;
        }

        // For non-HTML requests, look in the cache first, fall back to the network
        event.respondWith(
            caches.match(request)
                .then(function (response) {
                    return response || fetch(request)
                        .catch(function () {
                            var requestURL = request.url;
                            if(requestURL.indexOf('/speakers/') !== -1) {
                                // If the request is for a speaker photo return offline headshot
                                return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><style>.st0{fill:#B93C5A;} .st1{fill:#FFFFFF;}</style><path class="st0" d="M0 0h400v400H0z" id="background"/><g id="person"><path id="head" class="st1" d="M200 242.8c-56.6 0-102.5-45.9-102.5-102.5S143.4 37.9 200 37.9s102.5 45.9 102.5 102.5S256.6 242.8 200 242.8zm0-194.7c-50.8 0-92.2 41.4-92.2 92.2s41.4 92.2 92.2 92.2 92.2-41.4 92.2-92.2-41.4-92.2-92.2-92.2z"/><path id="body" class="st1" d="M17.6 391.4c1.6 2.5 4.9 2.9 7 1.6L200 277.8l175.4 114.8c2.5 1.6 5.7.8 7-1.6 1.6-2.5.8-5.7-1.6-7L202.9 267.6c-1.6-1.2-4.1-1.2-5.7 0l-178 116.8c-1.6.8-2.5 2.5-2.5 4.1.1 1.2.5 2 .9 2.9z"/></g></svg>', { headers: { 'Content-Type': 'image/svg+xml' }});
                            } else if(requestURL.indexOf('_hero_') !== -1) {
                                // If the request is for hero image, we want the request to fail
                                // do nothing
                            }
                             else if (request.headers.get('Accept').indexOf('image') !== -1) {
                                // If the request is for an image, show an offline placeholder
                                return new Response('<svg width="400" height="300" role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', { headers: { 'Content-Type': 'image/svg+xml' }});
                            }
                        });
                })
        );
    });

})();
