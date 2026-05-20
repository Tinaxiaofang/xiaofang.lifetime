self.addEventListener('install', e => {

  e.waitUntil(

    caches.open('xiaofang-cache').then(cache => {

      return cache.addAll([
        './',
        './index.html',
        './style.css'
      ]);

    })

  );

});
