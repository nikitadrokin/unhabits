import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { requestNotificationPermission, scheduleNotification, cancelNotification } from '../lib/notifications';

interface NotificationToggleProps {
  unhabit: {
    id: string;
    name: string;
    notificationEnabled: boolean;
    notificationTime?: string;
  };
  onToggle: (enabled: boolean, time?: string) => void;
}

export function NotificationToggle({ unhabit, onToggle }: NotificationToggleProps) {
  const handleToggle = async () => {
    if (!unhabit.notificationEnabled) {
      const permission = await requestNotificationPermission();
      if (!permission) {
        alert('Please enable notifications in your browser settings to receive reminders.');
        return;
      }
    }

    if (unhabit.notificationEnabled && unhabit.notificationTime) {
      await cancelNotification(unhabit.name);
    } else if (!unhabit.notificationEnabled && !unhabit.notificationTime) {
      // Default to 9 AM if no time is set
      const defaultTime = '09:00';
      await scheduleNotification({ ...unhabit, notificationTime: defaultTime });
      onToggle(true, defaultTime);
      return;
    }

    onToggle(!unhabit.notificationEnabled, unhabit.notificationTime);
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (unhabit.notificationEnabled) {
      await cancelNotification(unhabit.name);
      await scheduleNotification({ ...unhabit, notificationTime: newTime });
    }
    onToggle(unhabit.notificationEnabled, newTime);
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleToggle}
        className={`p-2 rounded-full ${
          unhabit.notificationEnabled
            ? 'bg-indigo-100 text-indigo-600'
            : 'bg-gray-100 text-gray-400'
        }`}
        title={unhabit.notificationEnabled ? 'Disable notifications' : 'Enable notifications'}
      >
        {unhabit.notificationEnabled ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5" />
        )}
      </button>
      {unhabit.notificationEnabled && (
        <input
          type="time"
          value={unhabit.notificationTime || '09:00'}
          onChange={handleTimeChange}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      )}
    </div>
  );
}