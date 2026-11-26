self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'Lunarn', body: 'Новое сообщение', tag: 'lunarn-push', chatId: '' };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = Object.assign(data, parsed);
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Если приложение открыто и активно на экране — пуш не показываем
      const isInApp = list.some((c) => c.visibilityState === 'visible' || c.focused);
      if (isInApp) return;

      return self.registration.showNotification(data.title, {
        body: data.body,
        icon: './icon.svg',
        badge: './icon.svg',
        tag: data.tag || 'lunarn-push',
        renotify: true,
        vibrate: [180, 80, 180],
        data: { chatId: data.chatId || '' }
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
