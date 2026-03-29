// Browser push notifications (client-side only)
// Used to alert Christina when new enrollment inquiries or tour requests arrive.

export function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve(false);
  }
  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }
  if (Notification.permission === 'denied') {
    return Promise.resolve(false);
  }
  return Notification.requestPermission().then((p) => p === 'granted');
}

export function showNotification(title: string, body: string, url?: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const n = new Notification(title, {
    body,
    icon: '/og-image.png',
    badge: '/og-image.png',
  });

  if (url) {
    n.onclick = () => {
      window.open(url, '_blank');
      n.close();
    };
  }
}
