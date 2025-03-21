export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function scheduleNotification(unhabit: { name: string; notificationTime: string }) {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    return;
  }
  

  const registration = await navigator.serviceWorker.ready;

  // Parse the notification time
  const [hours, minutes] = unhabit.notificationTime.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  // If the time has passed today, schedule for tomorrow
  if (scheduledTime < now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  try {
    await registration.showNotification('Unhabits Reminder', {
      body: `Time to check in: ${unhabit.name}`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      tag: `unhabit-${unhabit.name}`,
      timestamp: scheduledTime.getTime(),
      showTrigger: new TimestampTrigger(scheduledTime.getTime())
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

export async function cancelNotification(unhabitName: string) {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const notifications = await registration.getNotifications({
    tag: `unhabit-${unhabitName}`
  });

  notifications.forEach(notification => notification.close());
}