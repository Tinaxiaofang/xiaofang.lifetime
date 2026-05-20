/* =========================
   小方树洞 离线缓存系统
========================= */

const CACHE_NAME =
"xiaofang-cache-v1";

const urlsToCache = [

  "./",

  "./index.html",

  "./style.css",

  "./app.js",

  "./firebase.js",

  "./manifest.json"

];

/* 安装缓存 */

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches.open(CACHE_NAME)

      .then((cache) => {

        return cache.addAll(
          urlsToCache
        );

      })

    );

  }
);

/* 读取缓存 */

self.addEventListener(
  "fetch",
  (event) => {

    event.respondWith(

      caches.match(
        event.request
      )

      .then((response) => {

        return response || fetch(
          event.request
        );

      })

    );

  }
);
