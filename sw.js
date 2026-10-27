const CACHE_NAME = 'trig-game-v3';

// 當 Service Worker 安裝時，快取基本頁面與 CDN
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('正在快取離線資源...');
      return cache.addAll([
        './',
        './index.html',
        'https://cdn.tailwindcss.com',
        'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
      ]);
    })
  );
  self.skipWaiting();
});

// 啟動時清除舊的快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('清除舊快取:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截請求：優先從快取讀取，若無則從網路抓取並自動備份
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // 如果抓取成功，可以選擇性動態快取新資源
        return networkResponse;
      }).catch(() => {
        // 如果斷網且找不到快取，針對頁面請求直接回傳 index.html 確保能開啓
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
