let scheduledTimer = null;
let timerData = null;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SCHEDULE_TIMER') {
    if (scheduledTimer) clearTimeout(scheduledTimer);
    timerData = { endTime: data.endTime, mode: data.mode };
    const delay = Math.max(0, data.endTime - Date.now());
    scheduledTimer = setTimeout(() => {
      const isWork = timerData?.mode === 'work';
      self.registration.showNotification('Nuviora — Timer Done!', {
        body: isWork
          ? 'Great focus session! Time to take a well-earned break.'
          : 'Break is over. Ready for the next focus session?',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'pomodoro-timer',
        requireInteraction: false,
        actions: [
          { action: 'open', title: 'Open App' },
        ],
      });
      scheduledTimer = null;
      timerData = null;
    }, delay);
  }

  if (data.type === 'CANCEL_TIMER') {
    if (scheduledTimer) {
      clearTimeout(scheduledTimer);
      scheduledTimer = null;
    }
    timerData = null;
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
