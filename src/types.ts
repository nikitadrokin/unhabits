export interface Unhabit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  createdAt: string;
  archived: boolean;
  notificationTime?: string;
  notificationEnabled: boolean;
}

export interface UnhabitLog {
  id: string;
  unhabitId: string;
  date: string;
  count: number;
  notes?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  time?: string;
}