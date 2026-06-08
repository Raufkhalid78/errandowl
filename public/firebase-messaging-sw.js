console.log('[firebase-messaging-sw.js] SW Started');

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
console.log('[firebase-messaging-sw.js] Scripts imported successfully');

try {

  // Initialize the Firebase app in the service worker by passing the generated config
  const firebaseConfig = {
    apiKey: "AIzaSyAMw6C4KAJmWK0DTcepYH6gOOqgFS-YG8U",
    authDomain: "errandowl-178.firebaseapp.com",
    projectId: "errandowl-178",
    storageBucket: "errandowl-178.firebasestorage.app",
    messagingSenderId: "694782630826",
    appId: "1:694782630826:web:27f2a92ba556661c9ea9d3",
    measurementId: "G-MK6BE458QR"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  console.log('[firebase-messaging-sw.js] Firebase initialized');

  // Retrieve firebase messaging
  const messaging = firebase.messaging();
  console.log('[firebase-messaging-sw.js] Messaging initialized');

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification?.title || 'ErrandOwl Notification';
    const notificationOptions = {
      body: payload.notification?.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.error('[firebase-messaging-sw.js] Error during initialization:', e);
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/dashboard/notifications';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
