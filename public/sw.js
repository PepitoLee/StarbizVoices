const CACHE_NAME = 'audioapp-v3';
const STATIC_ASSETS = [
  '/',
  '/home',
  '/search',
  '/library',
  '/profile',
  '/offline',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests except for audio files
  if (url.origin !== self.location.origin) {
    // Handle audio files from Supabase storage
    if (request.url.includes('supabase') && request.url.includes('audio')) {
      event.respondWith(handleAudioRequest(request));
      return;
    }
    return;
  }

  // Handle API requests - network only
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip auth callback routes - CRITICAL for OAuth flow
  if (url.pathname.startsWith('/callback')) {
    return;
  }

  // Skip admin routes - admin has its own auth handling
  if (url.pathname.startsWith('/admin')) {
    return;
  }

  // Handle page navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests - stale while revalidate
  event.respondWith(handleAssetRequest(request));
});

// Handle navigation requests - network first with offline fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    // Solo cachear si la respuesta es exitosa
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline page if available
    const offlinePage = await caches.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }
    // Return a basic offline response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/html',
      }),
    });
  }
}

// Handle asset requests - stale while revalidate
async function handleAssetRequest(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || fetchPromise;
}

// Handle audio requests - cache audio files
async function handleAudioRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME + '-audio');
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Audio not available offline', { status: 503 });
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    const { url } = event.data;
    cacheAudioFile(url);
  }

  if (event.data && event.data.type === 'REMOVE_CACHED_AUDIO') {
    const { url } = event.data;
    removeCachedAudio(url);
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache an audio file for offline playback
async function cacheAudioFile(url) {
  const cache = await caches.open(CACHE_NAME + '-audio');
  try {
    const response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response);
      // Notify clients
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'AUDIO_CACHED',
          url,
          success: true,
        });
      });
    }
  } catch (error) {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'AUDIO_CACHED',
        url,
        success: false,
        error: error.message,
      });
    });
  }
}

// Remove cached audio file
async function removeCachedAudio(url) {
  const cache = await caches.open(CACHE_NAME + '-audio');
  await cache.delete(url);
}
