const CACHE_NAME = "redstar-travel-v2";
const CORE_ASSETS = [
    "/",
    "/index.html",
    "/about.html",
    "/services.html",
    "/contact.html",
    "/results.html",
    "/hotel-results.html",
    "/flights.html",
    "/hotels.html",
    "/privacy.html",
    "/terms.html",
    "/css/app.css",
    "/js/main.js",
    "/js/results.js",
    "/js/hotel-results.js",
    "/manifest.webmanifest",
    "/assets/images/logo.svg",
    "/assets/images/favicon.ico"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(event.request.url);
    const isHtmlRequest =
        event.request.mode === "navigate" ||
        requestUrl.pathname === "/" ||
        requestUrl.pathname.endsWith(".html");

    if (isHtmlRequest) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    return response;
                })
                .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/index.html")))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                return cached;
            }

            return fetch(event.request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type !== "basic") {
                        return response;
                    }

                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    return response;
                })
                .catch(() => caches.match("/index.html"));
        })
    );
});
